import { useState, useEffect } from 'react';
import { workflowsApi, vapiApi } from '../services/api';
import { getCampaigns } from '../services/supabase';
import { useAuth } from '../context/AuthContext';
import WorkflowBuilder from '../components/workflows/WorkflowBuilder';
import WorkflowAnalytics from '../components/workflows/WorkflowAnalytics';
import {
  Workflow,
  Plus,
  Play,
  Pause,
  BarChart3,
  Loader2,
  Mail,
  Phone,
  Clock,
  Users,
  MousePointerClick,
  Eye,
  Trash2,
  Settings,
  RefreshCw,
  Zap,
  ArrowRight,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { EmptyState, LoadingState } from '@/components/ui/loading';
import { cn } from '@/lib/utils';

function Workflows() {
  const { user } = useAuth();

  // State
  const [workflows, setWorkflows] = useState([]);
  const [campaigns, setCampaigns] = useState([]);
  const [assistants, setAssistants] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // View state
  const [activeTab, setActiveTab] = useState('list');
  const [selectedWorkflow, setSelectedWorkflow] = useState(null);
  const [isActionLoading, setIsActionLoading] = useState(false);

  useEffect(() => {
    if (user?.id) {
      loadData();
    }
  }, [user?.id]);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [workflowsRes, campaignsData, assistantsRes] = await Promise.all([
        workflowsApi.list(user.id),
        getCampaigns(),
        vapiApi.getAssistants().catch(() => ({ assistants: [] })),
      ]);
      setWorkflows(workflowsRes.workflows || []);
      setCampaigns(campaignsData || []);
      setAssistants(assistantsRes.assistants || assistantsRes || []);
    } catch (err) {
      setError(err.message || 'Failed to load workflows');
    } finally {
      setIsLoading(false);
    }
  };

  const handleActivate = async (workflowId) => {
    setIsActionLoading(true);
    setError('');
    try {
      const result = await workflowsApi.activate(user.id, workflowId);
      setSuccess(`Workflow activated! Enrolled ${result.enrolled} leads.`);
      await loadData();
    } catch (err) {
      setError(err.message || 'Failed to activate workflow');
    } finally {
      setIsActionLoading(false);
    }
  };

  const handlePause = async (workflowId) => {
    setIsActionLoading(true);
    try {
      await workflowsApi.pause(user.id, workflowId);
      setSuccess('Workflow paused');
      await loadData();
    } catch (err) {
      setError(err.message);
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleResume = async (workflowId) => {
    setIsActionLoading(true);
    try {
      await workflowsApi.resume(user.id, workflowId);
      setSuccess('Workflow resumed');
      await loadData();
    } catch (err) {
      setError(err.message);
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleDelete = async (workflowId) => {
    if (!confirm('Delete this workflow?')) return;
    setIsActionLoading(true);
    try {
      await workflowsApi.delete(user.id, workflowId);
      setSuccess('Workflow deleted');
      await loadData();
    } catch (err) {
      setError(err.message);
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleWorkflowCreated = async () => {
    setSuccess('Workflow created!');
    setActiveTab('list');
    await loadData();
  };

  const handleWorkflowUpdated = async () => {
    setSuccess('Workflow updated!');
    await loadData();
  };

  const viewWorkflowDetails = async (workflow) => {
    try {
      const details = await workflowsApi.get(user.id, workflow.id);
      setSelectedWorkflow(details.workflow);
      setActiveTab('detail');
    } catch (err) {
      setError(err.message);
    }
  };

  const viewWorkflowAnalytics = async (workflow) => {
    try {
      const analytics = await workflowsApi.getAnalytics(user.id, workflow.id);
      setSelectedWorkflow({ ...workflow, analytics });
      setActiveTab('analytics');
    } catch (err) {
      setError(err.message);
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

  const getStepTypeIcon = (type) => {
    switch (type) {
      case 'email': return <Mail className="h-4 w-4 text-blue-500" />;
      case 'call': return <Phone className="h-4 w-4 text-green-500" />;
      case 'wait': return <Clock className="h-4 w-4 text-yellow-500" />;
      default: return <Zap className="h-4 w-4 text-purple-500" />;
    }
  };

  // Stats
  const stats = {
    total: workflows.length,
    active: workflows.filter(w => w.status === 'active').length,
    totalEnrolled: workflows.reduce((sum, w) => sum + (w.total_enrolled || 0), 0),
    totalEmails: workflows.reduce((sum, w) => sum + (w.total_emails_sent || 0), 0),
    totalCalls: workflows.reduce((sum, w) => sum + (w.total_calls_made || 0), 0),
  };

  if (isLoading) {
    return <LoadingState message="Loading workflows..." />;
  }

  // Create/Edit view
  if (activeTab === 'create' || (activeTab === 'detail' && selectedWorkflow)) {
    return (
      <div className="space-y-8 animate-slide-up">
        <WorkflowBuilder
          workflow={activeTab === 'detail' ? selectedWorkflow : null}
          campaigns={campaigns}
          assistants={assistants}
          userId={user?.id}
          onBack={() => {
            setActiveTab('list');
            setSelectedWorkflow(null);
          }}
          onSave={activeTab === 'detail' ? handleWorkflowUpdated : handleWorkflowCreated}
          onActivate={handleActivate}
        />
      </div>
    );
  }

  // Analytics view
  if (activeTab === 'analytics' && selectedWorkflow) {
    return (
      <div className="space-y-8 animate-slide-up">
        <WorkflowAnalytics
          workflow={selectedWorkflow}
          userId={user?.id}
          onBack={() => {
            setActiveTab('list');
            setSelectedWorkflow(null);
          }}
        />
      </div>
    );
  }

  // List view
  return (
    <div className="space-y-8 animate-slide-up">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight bg-gradient-to-r from-foreground to-muted-foreground bg-clip-text text-transparent">
            Outreach Workflows
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground">
            Multi-channel automation: Email sequences + AI voice calls
          </p>
        </div>
        <Button onClick={() => setActiveTab('create')} className="gap-2">
          <Plus className="h-4 w-4" />
          New Workflow
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

      {/* Feature Highlight */}
      <Card className="bg-gradient-to-r from-primary/5 to-primary/10 border-primary/20">
        <CardContent className="py-6">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-blue-500/20 rounded-lg">
                <Mail className="h-5 w-5 text-blue-500" />
              </div>
              <span className="font-medium">Email</span>
            </div>
            <ArrowRight className="h-4 w-4 text-muted-foreground" />
            <div className="flex items-center gap-2">
              <div className="p-2 bg-blue-500/20 rounded-lg">
                <Mail className="h-5 w-5 text-blue-500" />
              </div>
              <span className="font-medium">Follow-up</span>
            </div>
            <ArrowRight className="h-4 w-4 text-muted-foreground" />
            <div className="flex items-center gap-2">
              <div className="p-2 bg-green-500/20 rounded-lg">
                <Phone className="h-5 w-5 text-green-500" />
              </div>
              <span className="font-medium">AI Call</span>
            </div>
            <ArrowRight className="h-4 w-4 text-muted-foreground" />
            <div className="flex items-center gap-2">
              <div className="p-2 bg-blue-500/20 rounded-lg">
                <Mail className="h-5 w-5 text-blue-500" />
              </div>
              <span className="font-medium">Final Email</span>
            </div>
          </div>
          <p className="text-sm text-muted-foreground mt-3">
            Combine cold emails with AI voice follow-ups for maximum engagement
          </p>
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Workflow className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.total}</p>
                <p className="text-xs text-muted-foreground">Workflows</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-500/10 rounded-lg">
                <Users className="h-5 w-5 text-green-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.totalEnrolled}</p>
                <p className="text-xs text-muted-foreground">Enrolled</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-500/10 rounded-lg">
                <Mail className="h-5 w-5 text-blue-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.totalEmails}</p>
                <p className="text-xs text-muted-foreground">Emails Sent</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-500/10 rounded-lg">
                <Phone className="h-5 w-5 text-purple-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.totalCalls}</p>
                <p className="text-xs text-muted-foreground">Calls Made</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-yellow-500/10 rounded-lg">
                <Zap className="h-5 w-5 text-yellow-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.active}</p>
                <p className="text-xs text-muted-foreground">Active</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Workflows Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Workflow className="h-5 w-5 text-primary" />
              Your Workflows
            </CardTitle>
            <Button variant="ghost" size="sm" onClick={loadData} disabled={isLoading}>
              <RefreshCw className={cn("h-4 w-4", isLoading && "animate-spin")} />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {workflows.length === 0 ? (
            <EmptyState
              icon={Workflow}
              title="No workflows yet"
              description="Create your first multi-channel workflow to combine emails and AI calls"
              action={
                <Button onClick={() => setActiveTab('create')} className="gap-2">
                  <Plus className="h-4 w-4" />
                  Create Workflow
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
                  <TableHead>Emails</TableHead>
                  <TableHead>Calls</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {workflows.map((workflow) => (
                  <TableRow key={workflow.id} className="cursor-pointer hover:bg-muted/50">
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-medium">{workflow.name}</span>
                        {workflow.campaign && (
                          <span className="text-xs text-muted-foreground">
                            {workflow.campaign.name}
                          </span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>{getStatusBadge(workflow.status)}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        {/* Show step type icons */}
                        {workflow.steps?.slice(0, 4).map((step, i) => (
                          <span key={i} title={step.step_type}>
                            {getStepTypeIcon(step.step_type)}
                          </span>
                        ))}
                        {(workflow.steps?.length || 0) > 4 && (
                          <Badge variant="outline" className="text-xs">
                            +{workflow.steps.length - 4}
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>{workflow.total_enrolled || 0}</TableCell>
                    <TableCell>
                      <span className="flex items-center gap-1">
                        <Mail className="h-3 w-3 text-muted-foreground" />
                        {workflow.total_emails_sent || 0}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className="flex items-center gap-1">
                        <Phone className="h-3 w-3 text-muted-foreground" />
                        {workflow.total_calls_made || 0}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        {workflow.status === 'draft' && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleActivate(workflow.id);
                            }}
                            disabled={isActionLoading}
                            className="h-8 w-8 p-0 text-green-500"
                            title="Activate"
                          >
                            <Play className="h-4 w-4" />
                          </Button>
                        )}
                        {workflow.status === 'active' && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              handlePause(workflow.id);
                            }}
                            disabled={isActionLoading}
                            className="h-8 w-8 p-0 text-yellow-500"
                            title="Pause"
                          >
                            <Pause className="h-4 w-4" />
                          </Button>
                        )}
                        {workflow.status === 'paused' && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleResume(workflow.id);
                            }}
                            disabled={isActionLoading}
                            className="h-8 w-8 p-0 text-green-500"
                            title="Resume"
                          >
                            <Play className="h-4 w-4" />
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            viewWorkflowAnalytics(workflow);
                          }}
                          className="h-8 w-8 p-0 text-primary"
                          title="Analytics"
                        >
                          <BarChart3 className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            viewWorkflowDetails(workflow);
                          }}
                          className="h-8 w-8 p-0"
                          title="Edit"
                        >
                          <Settings className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(workflow.id);
                          }}
                          disabled={isActionLoading}
                          className="h-8 w-8 p-0 text-destructive"
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

export default Workflows;
