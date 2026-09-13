// Adapted from the AssistantFleet browser audio client.
// Bridges browser mic <-> our /test/:id WebSocket, PCM16 24kHz both ways.
// A short playback cushion absorbs normal WebSocket jitter. Keep the opening
// greeting half-duplex: browser AEC is best-effort and leaked speaker audio can
// otherwise become a fabricated first caller turn. Later turns remain
// full-duplex so callers can still barge in.
const TEST_PLAYBACK_BUFFER_SECONDS = 0.15;
const TEST_MIC_RELEASE_DELAY_MS = 200;
const TEST_MIC_BUFFER_SIZE = 4096;
const TEST_GREETING_START_TIMEOUT_MS = 8000;
const TEST_AUDIO_RESUME_TIMEOUT_MS = 2000;

export class TestRunner {
  constructor(websocketUrl, { onStatus, onTranscript, onEnded }) {
    this.websocketUrl = websocketUrl;
    this.onStatus = onStatus; this.onTranscript = onTranscript; this.onEnded = onEnded;
    this.ws = null; this.ctx = null; this.stream = null; this.proc = null; this.src = null;
    this.targetRate = 24000;
    this.playTime = 0;
    this.playbackSources = new Set();
    this.playbackActive = false;
    this.playbackEndTimer = null;
    this.assistantResponseActive = false;
    this.playbackRanges = new Map();
    this.endAfterPlayback = false;
    // Infinity means microphone frames stay local. Greeting sessions keep it
    // there until the complete opening playback and echo tail have drained;
    // sessions without a greeting move it to "now" on the ready frame.
    this.micEnableAt = Infinity;
    this.waitingForGreetingPlayback = false;
    this.greetingPlaybackActive = false;
    this.greetingStartTimer = null;
  }
  async start() {
    try {
      // Both calls must happen before the first await so they retain the Start
      // button's user activation. Creating AudioContext after the microphone
      // permission prompt can leave it suspended, making an automatic greeting
      // look healthy in the transcript while playing no sound.
      this.ctx = new (window.AudioContext || window.webkitAudioContext)();
      // Fire this while the click activation is unquestionably live. Some
      // engines leave a blocked resume promise pending rather than rejecting,
      // so do not await this first attempt indefinitely.
      if (this.ctx.state !== 'running') this.ctx.resume().catch(() => {});
      const streamReady = navigator.mediaDevices.getUserMedia({
        audio: { channelCount: 1, echoCancellation: true, noiseSuppression: true, autoGainControl: true },
      });
      // Await the microphone first so cleanup owns the track even if resume()
      // rejects while the permission prompt is still open.
      this.stream = await streamReady;
      // Some browsers do not finish unlocking Web Audio until the microphone
      // permission prompt has resolved. Retry once after permission, then give
      // the tester a useful error instead of leaving a silently suspended UI.
      if (this.ctx.state !== 'running') {
        let resumeTimer = null;
        try {
          await Promise.race([
            this.ctx.resume().catch(() => {}),
            new Promise((resolve) => {
              resumeTimer = setTimeout(resolve, TEST_AUDIO_RESUME_TIMEOUT_MS);
            }),
          ]);
        } finally {
          if (resumeTimer !== null) clearTimeout(resumeTimer);
        }
      }
      if (this.ctx.state !== 'running') {
        throw new Error('Browser blocked audio playback. Click Start again to enable sound.');
      }
    } catch (error) {
      this.cleanupCapture();
      throw error;
    }
    try {
      this.ws = new WebSocket(this.websocketUrl);
      this.ws.binaryType = 'arraybuffer';
      this.ws.onopen = () => this.onStatus('Live — speak into your mic', 'live');
      this.ws.onclose = () => { this.cleanupCapture(); this.onStatus('Disconnected'); };
      this.ws.onerror = () => this.onStatus('Connection error', 'err');
      this.ws.onmessage = (ev) => this.handleMessage(ev.data);

      this.src = this.ctx.createMediaStreamSource(this.stream);
      this.proc = this.ctx.createScriptProcessor(TEST_MIC_BUFFER_SIZE, 1, 1);
      this.src.connect(this.proc); this.proc.connect(this.ctx.destination);
      this.proc.onaudioprocess = (e) => {
        if (this.ws?.readyState !== 1 || !this.canSendMic()) return;
        const ch = e.inputBuffer.getChannelData(0);
        const pcm16 = floatToPcm16At24k(ch, this.ctx.sampleRate);
        this.ws.send(JSON.stringify({ event: 'audio', payload: bytesToBase64(pcm16) }));
      };
      this.playTime = this.ctx.currentTime + TEST_PLAYBACK_BUFFER_SECONDS;
    } catch (error) {
      try { this.ws?.close(); } catch { /* Best-effort audio cleanup. */ }
      this.cleanupCapture();
      throw error;
    }
  }
  handleMessage(raw) {
    let m; try { m = JSON.parse(raw); } catch { return; }
    if (m.event === 'ready') {
      this.clearGreetingStartTimer();
      this.waitingForGreetingPlayback = m.has_greeting === true;
      this.greetingPlaybackActive = false;
      this.micEnableAt = this.waitingForGreetingPlayback ? Infinity : this.ctx.currentTime;
      if (this.waitingForGreetingPlayback) {
        this.greetingStartTimer = setTimeout(() => {
          this.greetingStartTimer = null;
          if (this.waitingForGreetingPlayback) {
            this.enableMicNow();
            this.onStatus('Greeting audio timed out — microphone is live', 'err');
          }
        }, TEST_GREETING_START_TIMEOUT_MS);
      }
    }
    else if (m.event === 'audio' && m.payload) this.schedulePlayback(m.payload, m.item_id, m.content_index);
    else if (m.event === 'clear') {
      this.endAfterPlayback = false;
      // A clear received before a first greeting frame means there is no
      // scheduled opening left to wait for.
      if (this.waitingForGreetingPlayback || this.greetingPlaybackActive) this.enableMicNow();
      const truncations = [...this.playbackRanges.values()]
        .filter((range) => range.endAt > this.ctx.currentTime)
        .map((range) => ({
          ...range,
          audioEndMs: Math.max(0, Math.round(
            (Math.min(this.ctx.currentTime, range.endAt) - range.startAt) * 1000,
          )),
        }));
      this.flushPlayback();
      if (this.ws?.readyState === 1) {
        for (const truncation of truncations) {
          this.ws.send(JSON.stringify({
            event: 'truncate',
            item_id: truncation.itemId,
            content_index: truncation.contentIndex,
            audio_end_ms: truncation.audioEndMs,
          }));
        }
      }
    }
    else if (m.event === 'error') {
      // Silence is the default failure mode of every pipeline leg, so say which
      // one broke rather than letting the tester guess.
      // Do not leave the microphone permanently gated if the greeting provider
      // failed before it could produce a first frame.
      if (this.waitingForGreetingPlayback) this.enableMicNow();
      this.onStatus(`${m.leg.toUpperCase()} error (${m.provider}): ${m.message}`, 'err');
      this.onTranscript('system', `${m.leg} failed via ${m.provider}: ${m.message}`);
    }
    else if (m.event === 'assistant-response-start') this.assistantResponseActive = true;
    else if (m.event === 'assistant-response-end') {
      this.assistantResponseActive = false;
      // Realtime can complete an errored/cancelled greeting without audio.
      // Once audio starts, browser playback owns release instead; server-side
      // generation commonly completes seconds before the sound is heard.
      if (this.waitingForGreetingPlayback) this.enableMicNow();
    }
    else if (m.event === 'transcript') this.onTranscript(m.role, m.text);
    else if (m.event === 'tool-call' && m.name === 'end_call') {
      this.endAfterPlayback = true;
      if (!this.playbackActive) this.requestStop();
    }
    else if (m.event === 'ended') {
      this.cleanupCapture();
      this.onEnded(m.cost || 0, m.duration_seconds || 0);
    }
  }
  schedulePlayback(b64, itemId, contentIndex = 0) {
    const buf = base64ToBytes(b64);
    const samples = new Int16Array(buf.buffer, buf.byteOffset, buf.byteLength / 2);
    const ab = this.ctx.createBuffer(1, samples.length, this.targetRate);
    const ch = ab.getChannelData(0);
    for (let i = 0; i < samples.length; i++) ch[i] = samples[i] / 32768;
    const src = this.ctx.createBufferSource();
    src.buffer = ab; src.connect(this.ctx.destination);
    if (this.playbackEndTimer !== null) {
      clearTimeout(this.playbackEndTimer);
      this.playbackEndTimer = null;
    }
    const startingPlayback = !this.playbackActive;
    this.playbackActive = true;
    const bufferLead = startingPlayback ? TEST_PLAYBACK_BUFFER_SECONDS : 0;
    const t = Math.max(this.ctx.currentTime + bufferLead, this.playTime);
    if (this.waitingForGreetingPlayback) {
      // The server can synthesize the whole greeting long before the browser
      // finishes playing it. Keep the mic local through actual playback, not
      // merely through the first scheduled audio block.
      this.greetingPlaybackActive = true;
      this.waitingForGreetingPlayback = false;
      this.clearGreetingStartTimer();
    }
    const itemKey = this.playbackKey(itemId, contentIndex);
    if (itemKey) {
      const existingRange = this.playbackRanges.get(itemKey);
      this.playbackRanges.set(itemKey, {
        itemId,
        contentIndex: Number.isInteger(contentIndex) ? contentIndex : 0,
        startAt: existingRange ? Math.min(existingRange.startAt, t) : t,
        endAt: Math.max(existingRange?.endAt || t, t + ab.duration),
      });
    }
    this.playbackSources.add(src);
    src.onended = () => {
      this.playbackSources.delete(src);
      if (this.playbackSources.size !== 0) return;
      this.playTime = this.ctx.currentTime;
      this.playbackEndTimer = setTimeout(() => {
        this.playbackEndTimer = null;
        if (this.playbackSources.size === 0) {
          this.playbackActive = false;
          this.playbackRanges.clear();
          this.playTime = this.ctx.currentTime + TEST_PLAYBACK_BUFFER_SECONDS;
          if (this.greetingPlaybackActive) this.enableMicNow();
          if (this.endAfterPlayback) this.requestStop();
        }
      }, TEST_MIC_RELEASE_DELAY_MS);
    };
    src.start(t); this.playTime = t + ab.duration;
  }
  flushPlayback() {
    if (this.playbackEndTimer !== null) {
      clearTimeout(this.playbackEndTimer);
      this.playbackEndTimer = null;
    }
    for (const source of this.playbackSources) {
      source.onended = null;
      try { source.stop(); } catch { /* Best-effort audio cleanup. */ }
    }
    this.playbackSources.clear();
    this.playbackActive = false;
    this.playbackRanges.clear();
    this.playTime = this.ctx ? this.ctx.currentTime + TEST_PLAYBACK_BUFFER_SECONDS : 0;
  }
  playbackKey(itemId, contentIndex = 0) {
    return itemId ? `${itemId}:${Number.isInteger(contentIndex) ? contentIndex : 0}` : null;
  }
  canSendMic() {
    return this.ctx?.state === 'running' && this.ctx.currentTime >= this.micEnableAt;
  }
  enableMicNow() {
    if (this.ctx) this.micEnableAt = this.ctx.currentTime;
    this.waitingForGreetingPlayback = false;
    this.greetingPlaybackActive = false;
    this.clearGreetingStartTimer();
  }
  clearGreetingStartTimer() {
    if (this.greetingStartTimer === null) return;
    clearTimeout(this.greetingStartTimer);
    this.greetingStartTimer = null;
  }
  requestStop() {
    this.endAfterPlayback = false;
    try { this.ws?.readyState === 1 && this.ws.send(JSON.stringify({ event: 'stop' })); } catch { /* Best-effort audio cleanup. */ }
  }
  stop() {
    this.flushPlayback();
    try { this.ws?.readyState === 1 && this.ws.send(JSON.stringify({ event: 'stop' })); } catch { /* Best-effort audio cleanup. */ }
    try { this.ws?.close(); } catch { /* Best-effort audio cleanup. */ }
    this.cleanupCapture();
    this.onStatus('Stopped');
  }
  cleanupCapture() {
    this.clearGreetingStartTimer();
    this.flushPlayback();
    if (this.proc) this.proc.onaudioprocess = null;
    try { this.proc?.disconnect(); this.src?.disconnect(); } catch { /* Best-effort audio cleanup. */ }
    try { this.stream?.getTracks().forEach((t) => t.stop()); } catch { /* Best-effort audio cleanup. */ }
    try { this.ctx?.state !== 'closed' && this.ctx?.close(); } catch { /* Best-effort audio cleanup. */ }
    this.proc = null; this.src = null; this.stream = null;
    this.ctx = null;
  }
}

function floatToPcm16At24k(float32, sourceRate) {
  // Linear resample to 24000 Hz, then convert Float32 [-1,1] -> Int16.
  const ratio = sourceRate / 24000;
  const outLen = Math.floor(float32.length / ratio);
  const out = new Int16Array(outLen);
  for (let i = 0; i < outLen; i++) {
    const idx = i * ratio;
    const lo = Math.floor(idx), hi = Math.min(float32.length - 1, lo + 1);
    const frac = idx - lo;
    const s = float32[lo] * (1 - frac) + float32[hi] * frac;
    const v = Math.max(-1, Math.min(1, s));
    out[i] = v < 0 ? v * 0x8000 : v * 0x7FFF;
  }
  return new Uint8Array(out.buffer);
}
function bytesToBase64(bytes) {
  let s = ''; for (let i = 0; i < bytes.length; i++) s += String.fromCharCode(bytes[i]);
  return btoa(s);
}
function base64ToBytes(b64) {
  const s = atob(b64); const out = new Uint8Array(s.length);
  for (let i = 0; i < s.length; i++) out[i] = s.charCodeAt(i);
  return out;
}

