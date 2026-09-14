import { useState, useEffect, useCallback, useRef } from 'react';
import { createPortal } from 'react-dom';
import { getAllCalls, getCallDetails, formatDuration } from '../services/vapi';
import { History as HistoryIcon, Phone, RefreshCw, Eye, X, Clock, User, Mic, MessageSquare, Bot, Mail, Copy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { LoadingState, EmptyState } from '@/components/ui/loading';
import { cn } from '@/lib/utils';
import { API_BASE_URL } from '../lib/session';

const dateLabel = value => value && Number.isFinite(new Date(value).getTime()) ? new Date(value).toLocaleString() : 'Not available';
const emailAddress = value => typeof value === 'string' && /^[^\s@<>]+@[^\s@<>]+\.[^\s@<>]+$/.test(value) ? value : null;
function normalizeCall(details) {
  let messages = details.messages?.length ? details.messages : details.transcript_json || [];
  if (typeof messages === 'string') { try { messages = JSON.parse(messages); } catch { messages = []; } }
  return {
    ...details,
    phone: details.phone_number || details.customer?.number,
    business: details.business_name || details.customer_name || details.customer?.name || details.lead?.name,
    email: emailAddress(details.business_email || details.lead?.email),
    duration: details.duration_seconds ?? details.duration,
    date: details.created_at || details.createdAt,
    summary: details.summary || details.analysis?.summary,
    recording: details.recording_url || details.recordingUrl,
    messages: Array.isArray(messages) ? messages.filter(m => m && m.role && (m.message || m.text)).map(m => ({ ...m, message: m.message || m.text })) : [],
  };
}
function nextSteps(call) {
  if (call.contact_allowed === false || call.call_outcome === 'do_not_contact') return ['Do not contact this business again.'];
  if (call.action_items?.length) return call.action_items;
  if (call.call_outcome === 'voicemail') return ['Listen to confirm whether a message was recorded.'];
  if (call.call_outcome === 'booking_request') return ['Review the requested time and contact details, then confirm manually.'];
  if (['initiated', 'in-progress'].includes(call.status)) return ['Check the call result before any follow-up.'];
  if (call.status === 'no-answer') return ['Review before deciding whether to follow up.'];
  return ['Review the recording and transcript for the next step.'];
}
const statusBadge = call => <Badge variant={call.contact_allowed === false ? 'destructive' : 'info'}>{call.contact_allowed === false ? 'Do not contact' : call.call_outcome?.replaceAll('_', ' ') || call.status}</Badge>;

export default function History() {
  const [calls, setCalls] = useState([]);
  const [selectedCall, setSelectedCall] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [loadingCallId, setLoadingCallId] = useState(null);
  const [recordingError, setRecordingError] = useState(false);
  const [notice, setNotice] = useState('');
  const closeButton = useRef(null);
  const loadCalls = useCallback(async () => {
    setIsLoading(true); setError('');
    try { setCalls((await getAllCalls(100) || []).map(normalizeCall)); }
    catch (err) { setError(err.message || 'Unable to load calls. Please try again.'); }
    finally { setIsLoading(false); }
  }, []);
  useEffect(() => { loadCalls(); }, [loadCalls]);
  useEffect(() => {
    if (!selectedCall) return;
    const previousFocus = document.activeElement;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    closeButton.current?.focus();
    const onKey = event => {
      if (event.key === 'Escape') setSelectedCall(null);
      if (event.key === 'Tab') {
        const items = [...document.querySelectorAll('[role="dialog"] button, [role="dialog"] a, [role="dialog"] audio')];
        const first = items[0], last = items.at(-1);
        if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus(); }
        else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus(); }
      }
    };
    document.addEventListener('keydown', onKey);
    return () => { document.body.style.overflow = previousOverflow; document.removeEventListener('keydown', onKey); previousFocus?.focus(); };
  }, [selectedCall]);

  const viewCallDetails = async call => {
    setError(''); setLoadingCallId(call.id); setRecordingError(false); setNotice('');
    try { setSelectedCall(normalizeCall({ ...call, ...await getCallDetails(call.id || call.vapi_call_id) })); }
    catch (err) { setError(err.message || 'Unable to load this call. Please try again.'); }
    finally { setLoadingCallId(null); }
  };
  const copyDetails = async call => {
    try {
      await navigator.clipboard.writeText([call.business, call.phone, call.email, dateLabel(call.date), call.summary, ...nextSteps(call)].filter(Boolean).join('\n'));
      setNotice('Call details copied.');
    } catch { setError('Unable to copy. Open the call to select its details.'); }
  };

  return <div className="space-y-6">
    <div><h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Call History</h1><p className="text-muted-foreground mt-1">Listen to calls, review what was said and decide the next step.</p></div>
    <Card>
      <CardHeader className="flex flex-row items-center justify-between gap-4">
        <CardTitle className="flex items-center gap-2"><HistoryIcon className="h-5 w-5 text-primary" />Calls ({calls.length})</CardTitle>
        <Button variant="secondary" size="sm" onClick={loadCalls} disabled={isLoading}><RefreshCw className={cn('h-4 w-4', isLoading && 'animate-spin')} />{isLoading ? 'Loading…' : 'Refresh'}</Button>
      </CardHeader>
      <CardContent>
        {error && <p role="alert" className="mb-4 text-sm text-destructive">{error}</p>}
        {notice && <p role="status" className="mb-4 text-sm text-muted-foreground">{notice}</p>}
        {calls.some(c => c.analytics_unavailable) && <p className="mb-4 text-sm text-muted-foreground">Showing saved call details. New summaries could not be refreshed; try Refresh again.</p>}
        {isLoading ? <LoadingState message="Loading calls…" /> : !calls.length ? <EmptyState icon={Phone} title="No calls found" description="Calls will appear here after you start a campaign." /> :
          <div className="overflow-x-auto"><Table>
            <TableHeader><TableRow><TableHead>Business / Email</TableHead><TableHead>Phone</TableHead><TableHead>Outcome</TableHead><TableHead>Next steps</TableHead><TableHead>Duration / Date</TableHead><TableHead>Actions</TableHead></TableRow></TableHeader>
            <TableBody>{calls.map(call => <TableRow key={call.id}>
              <TableCell className="min-w-[190px]"><p className="font-medium">{call.business || 'Business not recorded'}</p><p className="text-xs text-muted-foreground mt-1 break-all">{call.email || 'Email not recorded'}</p></TableCell>
              <TableCell className="whitespace-nowrap">{call.phone || 'Not recorded'}</TableCell>
              <TableCell>{statusBadge(call)}<p className="text-xs text-muted-foreground mt-1">{call.status}</p></TableCell>
              <TableCell className="min-w-[220px] max-w-sm"><ul className="space-y-1 text-sm">{nextSteps(call).map((step, i) => <li key={i}>{step}</li>)}</ul>{call.action_items?.length > 0 && call.contact_allowed !== false && <p className="text-xs text-muted-foreground mt-1">AI suggested · verify in the transcript</p>}</TableCell>
              <TableCell className="min-w-[145px]"><span className="flex items-center gap-1.5"><Clock className="h-3.5 w-3.5" />{formatDuration(call.duration)}</span><p className="text-xs text-muted-foreground mt-1">{dateLabel(call.date)}</p></TableCell>
              <TableCell><div className="flex items-center gap-1">
                <Button variant="outline" size="sm" onClick={() => viewCallDetails(call)} disabled={loadingCallId !== null}><Eye className="h-4 w-4" />{loadingCallId === call.id ? 'Loading…' : 'View'}</Button>
                <Button variant="ghost" size="sm" aria-label={`Copy details for ${call.business || call.phone}`} title="Copy call details" onClick={() => copyDetails(call)}><Copy className="h-4 w-4" /></Button>
                {call.email && call.contact_allowed !== false && <a className="inline-flex p-2 rounded-md hover:bg-secondary" aria-label={`Draft email to ${call.business || call.email}`} title="Draft email in your email app" href={`mailto:${encodeURIComponent(call.email)}`}><Mail className="h-4 w-4" /></a>}
              </div></TableCell>
            </TableRow>)}</TableBody>
          </Table></div>}
      </CardContent>
    </Card>
    {selectedCall && createPortal(<div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6" onClick={() => setSelectedCall(null)}>
      <div role="dialog" aria-modal="true" aria-labelledby="call-details-title" className="bg-card border border-border rounded-2xl w-full max-w-4xl max-h-[92vh] overflow-hidden shadow-2xl" onClick={e => e.stopPropagation()}>
        <div className="flex items-start justify-between p-5 border-b border-border"><div><h2 id="call-details-title" className="text-xl font-semibold">{selectedCall.business || 'Call Details'}</h2><p className="text-sm text-muted-foreground mt-1">{selectedCall.phone || 'Phone not recorded'}{selectedCall.email ? ` · ${selectedCall.email}` : ''}</p></div><button ref={closeButton} aria-label="Close call details" className="p-2 rounded-full hover:bg-secondary" onClick={() => setSelectedCall(null)}><X className="h-5 w-5" /></button></div>
        <div className="p-5 overflow-y-auto max-h-[calc(92vh-100px)] space-y-5">
          <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm">{statusBadge(selectedCall)}<span>{formatDuration(selectedCall.duration)}</span><span className="text-muted-foreground">{dateLabel(selectedCall.date)}</span></div>
          <section className="rounded-xl border border-border p-4"><h3 className="font-semibold flex items-center gap-2 mb-3"><Mic className="h-4 w-4 text-primary" />Recording</h3>
            {selectedCall.recording && !recordingError ? <audio key={selectedCall.id} aria-label="Call recording" controls preload="metadata" crossOrigin="use-credentials" src={new URL(selectedCall.recording, API_BASE_URL).href} onError={() => setRecordingError(true)} className="w-full" /> : <p className="text-sm text-muted-foreground">{recordingError ? 'The recording could not be loaded. Close this call and refresh to try again.' : 'No recording is available for this call.'}</p>}
          </section>
          <div className="grid md:grid-cols-2 gap-4">
            <section className="rounded-xl border border-border p-4"><h3 className="font-semibold flex items-center gap-2 mb-2"><Bot className="h-4 w-4 text-primary" />AI summary</h3><p className="text-sm leading-relaxed whitespace-pre-wrap">{selectedCall.summary || 'No summary is available for this call yet.'}</p><p className="text-xs text-muted-foreground mt-3">Check the recording and transcript before acting on an AI summary.</p></section>
            <section className="rounded-xl border border-border p-4"><h3 className="font-semibold mb-2">Next steps</h3><ul className="text-sm space-y-2">{nextSteps(selectedCall).map((step, i) => <li key={i}>{step}</li>)}</ul><Button className="mt-3" size="sm" variant="outline" onClick={() => copyDetails(selectedCall)}><Copy className="h-4 w-4" />Copy details</Button>{notice && <p role="status" className="text-xs mt-2">{notice}</p>}</section>
          </div>
          <section className="rounded-xl border border-border p-4"><h3 className="font-semibold flex items-center gap-2 mb-3"><MessageSquare className="h-4 w-4 text-primary" />Transcript</h3>
            {selectedCall.messages.length ? <div className="space-y-3">{selectedCall.messages.map((msg, i) => <div key={i} className={cn('rounded-lg p-3 border-l-2', msg.role === 'assistant' ? 'bg-primary/5 border-primary' : 'bg-muted/50 border-border')}><p className="text-xs font-medium text-muted-foreground flex items-center gap-1.5 mb-1">{msg.role === 'assistant' ? <><Bot className="h-3 w-3" />AI assistant</> : <><User className="h-3 w-3" />Recipient</>}</p><p className="text-sm whitespace-pre-wrap">{msg.message}</p></div>)}</div> : <p className="text-sm text-muted-foreground whitespace-pre-wrap">{selectedCall.transcript || 'No transcript is available for this call.'}</p>}
          </section>
        </div>
      </div>
    </div>, document.body)}
  </div>;
}
