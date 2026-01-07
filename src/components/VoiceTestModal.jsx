import { useState, useEffect, useRef, useCallback } from 'react';
import Vapi from '@vapi-ai/web';
import {
  Mic,
  MicOff,
  Phone,
  PhoneOff,
  Volume2,
  VolumeX,
  Loader2,
  AlertCircle,
  Bot,
  User,
  X,
  Waves
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { vapiApi } from '@/services/api';

const CALL_STATUS = {
  IDLE: 'idle',
  CONNECTING: 'connecting',
  CONNECTED: 'connected',
  SPEAKING: 'speaking',
  LISTENING: 'listening',
  ENDED: 'ended',
  ERROR: 'error',
};

function VoiceTestModal({ agent, isOpen, onClose }) {
  const [callStatus, setCallStatus] = useState(CALL_STATUS.IDLE);
  const [error, setError] = useState('');
  const [isMuted, setIsMuted] = useState(false);
  const [transcript, setTranscript] = useState([]);
  const [volumeLevel, setVolumeLevel] = useState(0);
  const [publicKey, setPublicKey] = useState(null);
  const [isLoadingKey, setIsLoadingKey] = useState(true);

  const vapiRef = useRef(null);
  const transcriptEndRef = useRef(null);

  // Load public key on mount
  useEffect(() => {
    if (isOpen) {
      loadPublicKey();
    }
  }, [isOpen]);

  // Auto-scroll transcript
  useEffect(() => {
    transcriptEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [transcript]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (vapiRef.current) {
        vapiRef.current.stop();
      }
    };
  }, []);

  const loadPublicKey = async () => {
    setIsLoadingKey(true);
    try {
      const response = await vapiApi.getPublicKey();
      setPublicKey(response.publicKey);
      setError('');
    } catch (err) {
      setError(err.message || 'Failed to load VAPI configuration. Make sure VAPI_PUBLIC_KEY is set in server/.env');
    } finally {
      setIsLoadingKey(false);
    }
  };

  const initializeVapi = useCallback(() => {
    if (!publicKey) return null;

    const vapi = new Vapi(publicKey);

    vapi.on('call-start', () => {
      setCallStatus(CALL_STATUS.CONNECTED);
      setTranscript([]);
    });

    vapi.on('call-end', () => {
      setCallStatus(CALL_STATUS.ENDED);
    });

    vapi.on('speech-start', () => {
      setCallStatus(CALL_STATUS.SPEAKING);
    });

    vapi.on('speech-end', () => {
      setCallStatus(CALL_STATUS.LISTENING);
    });

    vapi.on('volume-level', (level) => {
      setVolumeLevel(level);
    });

    vapi.on('message', (message) => {
      if (message.type === 'transcript') {
        const { role, transcript: text, transcriptType } = message;

        if (transcriptType === 'final' && text) {
          setTranscript(prev => [
            ...prev,
            {
              role: role === 'assistant' ? 'agent' : 'user',
              text,
              timestamp: new Date().toLocaleTimeString(),
            }
          ]);
        }
      }
    });

    vapi.on('error', (error) => {
      console.error('VAPI Error:', error);
      setError(error.message || 'An error occurred during the call');
      setCallStatus(CALL_STATUS.ERROR);
    });

    return vapi;
  }, [publicKey]);

  const startCall = async () => {
    setError('');
    setCallStatus(CALL_STATUS.CONNECTING);

    try {
      const vapi = initializeVapi();
      if (!vapi) {
        throw new Error('Failed to initialize VAPI');
      }

      vapiRef.current = vapi;

      // Start the call with the assistant ID
      await vapi.start(agent.id);
    } catch (err) {
      console.error('Start call error:', err);
      setError(err.message || 'Failed to start call');
      setCallStatus(CALL_STATUS.ERROR);
    }
  };

  const endCall = () => {
    if (vapiRef.current) {
      vapiRef.current.stop();
      vapiRef.current = null;
    }
    setCallStatus(CALL_STATUS.ENDED);
  };

  const toggleMute = () => {
    if (vapiRef.current) {
      const newMuted = !isMuted;
      vapiRef.current.setMuted(newMuted);
      setIsMuted(newMuted);
    }
  };

  const handleClose = () => {
    if (callStatus === CALL_STATUS.CONNECTED ||
        callStatus === CALL_STATUS.SPEAKING ||
        callStatus === CALL_STATUS.LISTENING) {
      endCall();
    }
    setCallStatus(CALL_STATUS.IDLE);
    setTranscript([]);
    setError('');
    onClose();
  };

  const isCallActive = [
    CALL_STATUS.CONNECTING,
    CALL_STATUS.CONNECTED,
    CALL_STATUS.SPEAKING,
    CALL_STATUS.LISTENING
  ].includes(callStatus);

  const getStatusColor = () => {
    switch (callStatus) {
      case CALL_STATUS.CONNECTED:
      case CALL_STATUS.LISTENING:
        return 'bg-success';
      case CALL_STATUS.SPEAKING:
        return 'bg-primary';
      case CALL_STATUS.CONNECTING:
        return 'bg-warning';
      case CALL_STATUS.ERROR:
        return 'bg-destructive';
      default:
        return 'bg-muted-foreground';
    }
  };

  const getStatusText = () => {
    switch (callStatus) {
      case CALL_STATUS.IDLE:
        return 'Ready to test';
      case CALL_STATUS.CONNECTING:
        return 'Connecting...';
      case CALL_STATUS.CONNECTED:
        return 'Connected';
      case CALL_STATUS.SPEAKING:
        return 'Agent speaking';
      case CALL_STATUS.LISTENING:
        return 'Listening...';
      case CALL_STATUS.ENDED:
        return 'Call ended';
      case CALL_STATUS.ERROR:
        return 'Error';
      default:
        return 'Unknown';
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={handleClose}
      />

      {/* Modal */}
      <div className="relative z-10 w-full max-w-2xl mx-4 animate-scale-in">
        <Card className="border-2 border-primary/20 shadow-xl">
          <CardHeader className="border-b border-border">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
                  <Bot className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-lg">Test Voice Agent</CardTitle>
                  <p className="text-sm text-muted-foreground">{agent?.name}</p>
                </div>
              </div>
              <button
                onClick={handleClose}
                className="p-2 rounded-lg hover:bg-secondary transition-colors"
              >
                <X className="h-5 w-5 text-muted-foreground" />
              </button>
            </div>
          </CardHeader>

          <CardContent className="p-6 space-y-6">
            {/* Error Alert */}
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {/* Loading State */}
            {isLoadingKey ? (
              <div className="flex flex-col items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
                <p className="text-muted-foreground">Loading configuration...</p>
              </div>
            ) : !publicKey ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <AlertCircle className="h-12 w-12 text-destructive mb-4" />
                <h3 className="font-semibold mb-2">Configuration Required</h3>
                <p className="text-sm text-muted-foreground max-w-md">
                  Add <code className="bg-muted px-1.5 py-0.5 rounded text-xs">VAPI_PUBLIC_KEY</code> to your
                  server/.env file to enable voice testing. You can find this in your VAPI dashboard.
                </p>
              </div>
            ) : (
              <>
                {/* Call Status */}
                <div className="flex items-center justify-center">
                  <div className="flex flex-col items-center gap-4">
                    {/* Status Indicator */}
                    <div className={cn(
                      "relative flex h-32 w-32 items-center justify-center rounded-full transition-all duration-300",
                      isCallActive ? "bg-primary/10" : "bg-muted"
                    )}>
                      {/* Pulse animation when speaking */}
                      {callStatus === CALL_STATUS.SPEAKING && (
                        <div className="absolute inset-0 rounded-full bg-primary/20 animate-ping" />
                      )}

                      {/* Volume visualization */}
                      {isCallActive && (
                        <div
                          className="absolute inset-2 rounded-full bg-primary/10 transition-transform duration-100"
                          style={{ transform: `scale(${1 + volumeLevel * 0.3})` }}
                        />
                      )}

                      <div className="relative z-10">
                        {callStatus === CALL_STATUS.CONNECTING ? (
                          <Loader2 className="h-12 w-12 animate-spin text-primary" />
                        ) : callStatus === CALL_STATUS.SPEAKING ? (
                          <Waves className="h-12 w-12 text-primary" />
                        ) : isCallActive ? (
                          <Mic className="h-12 w-12 text-primary" />
                        ) : (
                          <Bot className="h-12 w-12 text-muted-foreground" />
                        )}
                      </div>
                    </div>

                    {/* Status Badge */}
                    <div className="flex items-center gap-2">
                      <div className={cn("h-2 w-2 rounded-full", getStatusColor())} />
                      <span className="text-sm font-medium">{getStatusText()}</span>
                    </div>
                  </div>
                </div>

                {/* Transcript */}
                {transcript.length > 0 && (
                  <div className="border border-border rounded-lg overflow-hidden">
                    <div className="bg-muted px-4 py-2 border-b border-border">
                      <span className="text-sm font-medium">Conversation</span>
                    </div>
                    <div className="max-h-48 overflow-y-auto p-4 space-y-3">
                      {transcript.map((entry, index) => (
                        <div
                          key={index}
                          className={cn(
                            "flex gap-3",
                            entry.role === 'user' ? "justify-end" : "justify-start"
                          )}
                        >
                          {entry.role === 'agent' && (
                            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10">
                              <Bot className="h-4 w-4 text-primary" />
                            </div>
                          )}
                          <div className={cn(
                            "max-w-[80%] rounded-lg px-4 py-2",
                            entry.role === 'user'
                              ? "bg-primary text-primary-foreground"
                              : "bg-muted"
                          )}>
                            <p className="text-sm">{entry.text}</p>
                            <span className="text-[10px] opacity-70">{entry.timestamp}</span>
                          </div>
                          {entry.role === 'user' && (
                            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-secondary">
                              <User className="h-4 w-4" />
                            </div>
                          )}
                        </div>
                      ))}
                      <div ref={transcriptEndRef} />
                    </div>
                  </div>
                )}

                {/* Call Controls */}
                <div className="flex items-center justify-center gap-4">
                  {!isCallActive ? (
                    <Button
                      onClick={startCall}
                      variant="gradient"
                      size="lg"
                      className="rounded-full px-8"
                      disabled={callStatus === CALL_STATUS.CONNECTING}
                    >
                      <Phone className="h-5 w-5 mr-2" />
                      Start Test Call
                    </Button>
                  ) : (
                    <>
                      {/* Mute Button */}
                      <Button
                        onClick={toggleMute}
                        variant={isMuted ? "destructive" : "outline"}
                        size="lg"
                        className="rounded-full h-14 w-14"
                      >
                        {isMuted ? (
                          <MicOff className="h-6 w-6" />
                        ) : (
                          <Mic className="h-6 w-6" />
                        )}
                      </Button>

                      {/* End Call Button */}
                      <Button
                        onClick={endCall}
                        variant="destructive"
                        size="lg"
                        className="rounded-full h-14 w-14"
                      >
                        <PhoneOff className="h-6 w-6" />
                      </Button>
                    </>
                  )}
                </div>

                {/* Instructions */}
                {callStatus === CALL_STATUS.IDLE && (
                  <div className="text-center text-sm text-muted-foreground">
                    <p>Click "Start Test Call" to have a real-time conversation with your agent.</p>
                    <p className="mt-1">Make sure your microphone is enabled.</p>
                  </div>
                )}

                {callStatus === CALL_STATUS.ENDED && transcript.length > 0 && (
                  <div className="flex justify-center">
                    <Button
                      onClick={startCall}
                      variant="outline"
                    >
                      <Phone className="h-4 w-4 mr-2" />
                      Start New Test
                    </Button>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default VoiceTestModal;
