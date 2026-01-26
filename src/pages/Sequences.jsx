import { useState, useEffect } from 'react';
import { sequencesApi, emailTrackingApi } from '../services/api';
import { getCampaigns } from '../services/supabase';
import { useAuth } from '../context/AuthContext';
import SequenceBuilder from '../components/sequences/SequenceBuilder';
import SequenceAnalytics from '../components/sequences/SequenceAnalytics';
import {
  Mail,
  Plus,
  Play,
  Pause,
  BarChart3,
  Loader2,
  Clock,
  Users,
  MousePointerClick,
  Eye,
  Reply,
  AlertTriangle,
  Trash2,
  Settings,
  ChevronRight,
  CheckCircle,
  XCircle,
  RefreshCw,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { EmptyState, LoadingState } from '@/components/ui/loading';
import { cn } from '@/lib/utils';

function Sequences() {
  const { user } = useAuth();

  // State
  const [sequences, setSequences] = useState([]);
  const [campaigns, setCampaigns] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // View state
  const [activeTab, setActiveTab] = useState('list'); // list, create, detail, analytics
  const [selectedSequence, setSelectedSequence] = useState(null);
  const [isActionLoading, setIsActionLoading] = useState(false);

  // Load data
  useEffect(() => {
    if (user?.id) {
      loadData();
    }
  }, [user?.id]);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [sequencesRes, campaignsData] = await Promise.all([
        sequencesApi.list(user.id),
        getCampaigns(),
      ]);
      setSequences(sequencesRes.sequences || []);
      setCampaigns(campaignsData || []);
    } catch (err) {
      setError(err.message || 'Failed to load sequences');
    } finally {
      setIsLoading(false);
    }
  };

  // Actions
  const handleActivate = async (sequenceId) => {
    setIsActionLoading(true);
    setError('');
    try {
      const result = await sequencesApi.activate(user.id, sequenceId);
      setSuccess(`Sequence activated! Enrolled ${result.enrolled} leads.`);
      await loadData();
    } catch (err) {
      setError(err.message || 'Failed to activate sequence');
    } finally {
      setIsActionLoading(false);
    }
  };

  const handlePause = async (sequenceId) => {
    setIsActionLoading(true);
    setError('');
    try {
      await sequencesApi.pause(user.id, sequenceId);
      setSuccess('Sequence paused');
      await loadData();
    } catch (err) {
      setError(err.message || 'Failed to pause sequence');
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleResume = async (sequenceId) => {
    setIsActionLoading(true);
    setError('');
    try {
      await sequencesApi.resume(user.id, sequenceId);
      setSuccess('Sequence resumed');
      await loadData();
    } catch (err) {
      setError(err.message || 'Failed to resume sequence');
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleDelete = async (sequenceId) => {
    if (!confirm('Are you sure you want to delete this sequence?')) return;

    setIsActionLoading(true);
    setError('');
    try {
      await sequencesApi.delete(user.id, sequenceId);
      setSuccess('Sequence deleted');
      await loadData();
    } catch (err) {
      setError(err.message || 'Failed to delete sequence');
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleSequenceCreated = async () => {
    setSuccess('Sequence created successfully!');
    setActiveTab('list');
    await loadData();
  };

  const handleSequenceUpdated = async () => {
    setSuccess('Sequence updated successfully!');
    await loadData();
  };

  const viewSequenceDetails = async (sequence) => {
    try {
      const details = await sequencesApi.get(user.id, sequence.id);
      setSelectedSequence(details.sequence);
      setActiveTab('detail');
    } catch (err) {
      setError(err.message || 'Failed to load sequence details');
    }
  };

  const viewSequenceAnalytics = async (sequence) => {
    try {
      const analytics = await sequencesApi.getAnalytics(user.id, sequence.id);
      setSelectedSequence({ ...sequence, analytics });
      setActiveTab('analytics');
    } catch (err) {
      setError(err.message || 'Failed to load sequence analytics');
    }
  };

  const getStatusBadge = (status) => {
    const variants = {
      draft: 'secondary',
      active: 'success',
      paused: 'warning',
      completed: 'info',
    };
    return <Badge variant={variants[status] || 'secondary'}>{status}</Badge>;
  };

  // Stats calculation
  const stats = {
    total: sequences.length,
    active: sequences.filter(s => s.status === 'active').length,
    totalEnrolled: sequences.reduce((sum, s) => sum + (s.total_enrolled || 0), 0),
    totalSent: sequences.reduce((sum, s) => sum + (s.total_sent || 0), 0),
    totalOpens: sequences.reduce((sum, s) => sum + (s.total_opens || 0), 0),
    totalClicks: sequences.reduce((sum, s) => sum + (s.total_clicks || 0), 0),
  };

  if (isLoading) {
    return <LoadingState message="Loading sequences..." />;
  }

  // Render create/edit view
  if (activeTab === 'create' || (activeTab === 'detail' && selectedSequence)) {
    return (
      <div className="space-y-8 animate-slide-up">
        <SequenceBuilder
          sequence={activeTab === 'detail' ? selectedSequence : null}
          campaigns={campaigns}
          userId={user?.id}
          onBack={() => {
            setActiveTab('list');
            setSelectedSequence(null);
          }}
          onSave={activeTab === 'detail' ? handleSequenceUpdated : handleSequenceCreated}
          onActivate={handleActivate}
        />
      </div>
    );
  }

  // Render analytics view
  if (activeTab === 'analytics' && selectedSequence) {
    return (
      <div className="space-y-8 animate-slide-up">
        <SequenceAnalytics
          sequence={selectedSequence}
          userId={user?.id}
          onBack={() => {
            setActiveTab('list');
            setSelectedSequence(null);
          }}
        />
      </div>
    );
  }

  // Render list view
  return (
    <div className="space-y-8 animate-slide-up">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight bg-gradient-to-r from-foreground to-muted-foreground bg-clip-text text-transparent">
            Email Sequences
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground">
            Automate multi-step cold email campaigns with AI personalization
          </p>
        </div>
        <Button onClick={() => setActiveTab('create')} className="gap-2">
          <Plus className="h-4 w-4" />
          New Sequence
        </Button>
      </div>

      {/* Alerts */}
      {error && (
        <Alert variant="destructive" onClose={() => setError('')}>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      {success && (
        <Alert variant="success" onClose={() => setSuccess('')}>
          <AlertDescription>{success}</AlertDescription>
        </Alert>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Mail className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.totalSent}</p>
                <p className="text-xs text-muted-foreground">Emails Sent</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-500/10 rounded-lg">
                <Eye className="h-5 w-5 text-green-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.totalOpens}</p>
                <p className="text-xs text-muted-foreground">Opens</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-500/10 rounded-lg">
                <MousePointerClick className="h-5 w-5 text-blue-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.totalClicks}</p>
                <p className="text-xs text-muted-foreground">Clicks</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-500/10 rounded-lg">
                <Users className="h-5 w-5 text-purple-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.totalEnrolled}</p>
                <p className="text-xs text-muted-foreground">Leads Enrolled</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Sequences Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5 text-primary" />
              Your Sequences
            </CardTitle>
            <Button variant="ghost" size="sm" onClick={loadData} disabled={isLoading}>
              <RefreshCw className={cn("h-4 w-4", isLoading && "animate-spin")} />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {sequences.length === 0 ? (
            <EmptyState
              icon={Mail}
              title="No sequences yet"
              description="Create your first email sequence to start automating cold outreach"
              action={
                <Button onClick={() => setActiveTab('create')} className="gap-2">
                  <Plus className="h-4 w-4" />
                  Create Sequence
                </Button>
              }
              className="py-12"
            />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Steps</TableHead>
                  <TableHead>Enrolled</TableHead>
                  <TableHead>Sent</TableHead>
                  <TableHead>Opens</TableHead>
                  <TableHead>Clicks</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sequences.map((sequence) => (
                  <TableRow key={sequence.id} className="cursor-pointer hover:bg-muted/50">
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-medium">{sequence.name}</span>
                        {sequence.campaign && (
                          <span className="text-xs text-muted-foreground">
                            Campaign: {sequence.campaign.name}
                          </span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>{getStatusBadge(sequence.status)}</TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {sequence.steps?.length || 0} steps
                      </Badge>
                    </TableCell>
                    <TableCell>{sequence.total_enrolled || 0}</TableCell>
                    <TableCell>{sequence.total_sent || 0}</TableCell>
                    <TableCell>
                      <span className="flex items-center gap-1">
                        <Eye className="h-3 w-3 text-muted-foreground" />
                        {sequence.total_opens || 0}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className="flex items-center gap-1">
                        <MousePointerClick className="h-3 w-3 text-muted-foreground" />
                        {sequence.total_clicks || 0}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        {/* Status-based action */}
                        {sequence.status === 'draft' && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleActivate(sequence.id);
                            }}
                            disabled={isActionLoading}
                            className="h-8 w-8 p-0 text-green-500 hover:text-green-600 hover:bg-green-50"
                            title="Activate"
                          >
                            <Play className="h-4 w-4" />
                          </Button>
                        )}
                        {sequence.status === 'active' && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              handlePause(sequence.id);
                            }}
                            disabled={isActionLoading}
                            className="h-8 w-8 p-0 text-yellow-500 hover:text-yellow-600 hover:bg-yellow-50"
                            title="Pause"
                          >
                            <Pause className="h-4 w-4" />
                          </Button>
                        )}
                        {sequence.status === 'paused' && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleResume(sequence.id);
                            }}
                            disabled={isActionLoading}
                            className="h-8 w-8 p-0 text-green-500 hover:text-green-600 hover:bg-green-50"
                            title="Resume"
                          >
                            <Play className="h-4 w-4" />
                          </Button>
                        )}

                        {/* Analytics */}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            viewSequenceAnalytics(sequence);
                          }}
                          className="h-8 w-8 p-0 text-primary hover:text-primary hover:bg-primary/10"
                          title="View Analytics"
                        >
                          <BarChart3 className="h-4 w-4" />
                        </Button>

                        {/* Edit */}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            viewSequenceDetails(sequence);
                          }}
                          className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground"
                          title="Edit"
                        >
                          <Settings className="h-4 w-4" />
                        </Button>

                        {/* Delete */}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(sequence.id);
                          }}
                          disabled={isActionLoading}
                          className="h-8 w-8 p-0 text-destructive hover:text-destructive hover:bg-destructive/10"
                          title="Delete"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default Sequences;
