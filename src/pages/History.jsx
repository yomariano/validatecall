import { useState, useEffect } from 'react';
import { getAllCalls, getCallDetails, formatDuration } from '../services/vapi';
import { getCalls } from '../services/supabase';
import {
  History as HistoryIcon,
  Phone,
  RefreshCw,
  Eye,
  X,
  Clock,
  User,
  Mic,
  MessageSquare,
  Bot,
  Play
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select } from '@/components/ui/input';
import { LoadingState, EmptyState } from '@/components/ui/loading';
import { cn } from '@/lib/utils';


function History() {
  const [calls, setCalls] = useState([]);
  const [selectedCall, setSelectedCall] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [source, setSource] = useState('vapi');

  useEffect(() => {
    loadCalls();
  }, [source]);

  const loadCalls = async () => {
    setIsLoading(true);
    try {
      if (source === 'vapi') {
        const data = await getAllCalls(100);
        setCalls(data || []);
      } else if (source === 'supabase') {
        const data = await getCalls({ limit: 100 });
        setCalls(data || []);
      }
    } catch (err) {
      console.error('Error loading calls:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const viewCallDetails = async (callId) => {
    try {
      const details = await getCallDetails(callId);
      setSelectedCall(details);
    } catch (err) {
      console.error('Error loading call details:', err);
    }
  };

  const getStatusBadge = (status) => {
    const variants = {
      ended: 'success',
      'in-progress': 'warning',
      failed: 'destructive',
    };
    return <Badge variant={variants[status] || 'info'}>{status}</Badge>;
  };

  return (
    <div className="space-y-8 animate-slide-up">
      {/* Page Header */}
      <div className="space-y-1">
        <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-foreground to-muted-foreground bg-clip-text text-transparent">
          Call History
        </h1>
        <p className="text-muted-foreground">
          View all past calls and their transcripts
        </p>
      </div>

      {/* Calls Table */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="flex items-center gap-2">
            <HistoryIcon className="h-5 w-5 text-primary" />
            Calls ({calls.length})
          </CardTitle>
          <div className="flex items-center gap-3">
            <Select
              value={source}
              onChange={(e) => setSource(e.target.value)}
              className="w-auto"
            >
              <option value="vapi">From Vapi</option>
              <option value="supabase">From Database</option>
            </Select>
            <Button
              variant="secondary"
              size="sm"
              onClick={loadCalls}
              disabled={isLoading}
            >
              <RefreshCw className={cn("h-4 w-4", isLoading && "animate-spin")} />
              {isLoading ? 'Loading...' : 'Refresh'}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <LoadingState message="Loading calls..." />
          ) : calls.length === 0 ? (
            <EmptyState
              icon={Phone}
              title="No calls found"
              description="Start a campaign to make calls"
            />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Phone</TableHead>
                  <TableHead>Business</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Duration</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {calls.map((call) => (
                  <TableRow key={call.id}>
                    <TableCell className="font-medium">
                      {call.customer?.number || call.phone_number}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {call.customer?.name || call.lead?.name || '-'}
                    </TableCell>
                    <TableCell>{getStatusBadge(call.status)}</TableCell>
                    <TableCell className="text-muted-foreground">
                      <span className="flex items-center gap-1.5">
                        <Clock className="h-4 w-4" />
                        {formatDuration(call.duration || call.duration_seconds)}
                      </span>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {new Date(call.createdAt || call.created_at).toLocaleString()}
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => viewCallDetails(call.id || call.vapi_call_id)}
                      >
                        <Eye className="h-4 w-4" />
                        View
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Call Detail Modal */}
      {selectedCall && (
        <div
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in"
          onClick={() => setSelectedCall(null)}
        >
          <div
            className="bg-card border border-border rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden shadow-2xl animate-scale-in"
            onClick={e => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-muted/30">
              <h2 className="text-xl font-semibold flex items-center gap-2">
                <Phone className="h-5 w-5 text-primary" />
                Call Details
              </h2>
              <button
                onClick={() => setSelectedCall(null)}
                className="rounded-full p-2 hover:bg-secondary transition-colors"
              >
                <X className="h-5 w-5 text-muted-foreground" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-80px)] space-y-6">
              {/* Call Info Grid */}
              <div className="grid grid-cols-2 gap-4">
                <div className="rounded-lg bg-muted/50 p-4">
                  <p className="text-sm text-muted-foreground mb-1">Phone</p>
                  <p className="font-medium">{selectedCall.customer?.number || 'Unknown'}</p>
                </div>
                <div className="rounded-lg bg-muted/50 p-4">
                  <p className="text-sm text-muted-foreground mb-1">Status</p>
                  <div className="mt-0.5">{getStatusBadge(selectedCall.status)}</div>
                </div>
                <div className="rounded-lg bg-muted/50 p-4">
                  <p className="text-sm text-muted-foreground mb-1">Duration</p>
                  <p className="font-medium flex items-center gap-1.5">
                    <Clock className="h-4 w-4" />
                    {formatDuration(selectedCall.duration)}
                  </p>
                </div>
                <div className="rounded-lg bg-muted/50 p-4">
                  <p className="text-sm text-muted-foreground mb-1">Date</p>
                  <p className="font-medium">{new Date(selectedCall.createdAt).toLocaleString()}</p>
                </div>
              </div>

              {/* Recording */}
              {selectedCall.recordingUrl && (
                <div className="rounded-xl border border-border p-4">
                  <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
                    <Mic className="h-4 w-4 text-primary" />
                    Recording
                  </h3>
                  <audio
                    controls
                    src={selectedCall.recordingUrl}
                    className="w-full h-10 rounded-lg"
                  />
                </div>
              )}

              {/* AI Summary */}
              {selectedCall.analysis?.summary && (
                <div className="rounded-xl border border-border p-4">
                  <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
                    <Bot className="h-4 w-4 text-primary" />
                    AI Summary
                  </h3>
                  <p className="text-muted-foreground leading-relaxed">
                    {selectedCall.analysis.summary}
                  </p>
                </div>
              )}

              {/* Transcript */}
              {selectedCall.messages && selectedCall.messages.length > 0 && (
                <div className="rounded-xl border border-border p-4">
                  <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
                    <MessageSquare className="h-4 w-4 text-primary" />
                    Transcript
                  </h3>
                  <div className="space-y-3 max-h-[300px] overflow-y-auto">
                    {selectedCall.messages.filter(m => m.role && m.message).map((msg, i) => (
                      <div
                        key={i}
                        className={cn(
                          'rounded-lg p-3',
                          msg.role === 'assistant'
                            ? 'bg-primary/10 border-l-2 border-primary'
                            : 'bg-success/10 border-l-2 border-success'
                        )}
                      >
                        <p className="text-xs font-medium text-muted-foreground mb-1 flex items-center gap-1.5">
                          {msg.role === 'assistant' ? (
                            <><Bot className="h-3 w-3" /> AI</>
                          ) : (
                            <><User className="h-3 w-3" /> Customer</>
                          )}
                        </p>
                        <p className="text-sm text-foreground">{msg.message}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default History;
