import { useState, useEffect } from 'react';
import { workflowsApi } from '../../services/api';
import {
  ArrowLeft,
  Mail,
  Phone,
  Clock,
  Users,
  Eye,
  MousePointerClick,
  MessageSquare,
  CheckCircle,
  XCircle,
  Loader2,
  TrendingUp,
  BarChart3,
  RefreshCw,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { cn } from '@/lib/utils';

function WorkflowAnalytics({ workflow, userId, onBack }) {
  const [analytics, setAnalytics] = useState(workflow?.analytics || null);
  const [isLoading, setIsLoading] = useState(!workflow?.analytics);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!workflow?.analytics) {
      loadAnalytics();
    }
  }, [workflow?.id]);

  const loadAnalytics = async () => {
    setIsLoading(true);
    try {
      const result = await workflowsApi.getAnalytics(userId, workflow.id);
      setAnalytics(result.analytics);
    } catch (err) {
      setError(err.message || 'Failed to load analytics');
    } finally {
      setIsLoading(false);
    }
  };

  const getStepTypeIcon = (type) => {
    switch (type) {
      case 'email': return <Mail className="h-4 w-4 text-blue-500" />;
      case 'call': return <Phone className="h-4 w-4 text-green-500" />;
      case 'sms': return <MessageSquare className="h-4 w-4 text-purple-500" />;
      case 'wait': return <Clock className="h-4 w-4 text-yellow-500" />;
      default: return <BarChart3 className="h-4 w-4" />;
    }
  };

  const calculateRate = (numerator, denominator) => {
    if (!denominator || denominator === 0) return '0%';
    return `${((numerator / denominator) * 100).toFixed(1)}%`;
  };

  // Overall stats
  const stats = analytics || {
    totalEnrolled: workflow.total_enrolled || 0,
    totalEmails: workflow.total_emails_sent || 0,
    totalCalls: workflow.total_calls_made || 0,
    totalOpens: workflow.total_opens || 0,
    totalClicks: workflow.total_clicks || 0,
    totalReplies: workflow.total_replies || 0,
    totalCallsAnswered: workflow.total_calls_answered || 0,
    enrollmentsByStatus: {},
    stepPerformance: [],
  };

  const openRate = calculateRate(stats.totalOpens, stats.totalEmails);
  const clickRate = calculateRate(stats.totalClicks, stats.totalEmails);
  const replyRate = calculateRate(stats.totalReplies, stats.totalEmails);
  const callAnswerRate = calculateRate(stats.totalCallsAnswered, stats.totalCalls);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={onBack} className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
          <div>
            <h1 className="text-2xl font-bold">{workflow.name}</h1>
            <p className="text-sm text-muted-foreground">
              Workflow Analytics & Performance
            </p>
          </div>
        </div>
        <Button variant="outline" onClick={loadAnalytics} disabled={isLoading} className="gap-2">
          <RefreshCw className={cn("h-4 w-4", isLoading && "animate-spin")} />
          Refresh
        </Button>
      </div>

      {error && (
        <Alert variant="destructive" onClose={() => setError('')}>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Users className="h-5 w-5 text-primary" />
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
              <div className="p-2 bg-green-500/10 rounded-lg">
                <Phone className="h-5 w-5 text-green-500" />
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
              <div className="p-2 bg-purple-500/10 rounded-lg">
                <TrendingUp className="h-5 w-5 text-purple-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.totalReplies + stats.totalCallsAnswered}</p>
                <p className="text-xs text-muted-foreground">Responses</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Engagement Rates */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <BarChart3 className="h-5 w-5 text-primary" />
            Engagement Rates
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Eye className="h-4 w-4 text-blue-500" />
                <span className="text-sm font-medium">Open Rate</span>
              </div>
              <p className="text-3xl font-bold">{openRate}</p>
              <p className="text-xs text-muted-foreground">
                {stats.totalOpens} opens / {stats.totalEmails} sent
              </p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <MousePointerClick className="h-4 w-4 text-purple-500" />
                <span className="text-sm font-medium">Click Rate</span>
              </div>
              <p className="text-3xl font-bold">{clickRate}</p>
              <p className="text-xs text-muted-foreground">
                {stats.totalClicks} clicks / {stats.totalEmails} sent
              </p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <MessageSquare className="h-4 w-4 text-green-500" />
                <span className="text-sm font-medium">Reply Rate</span>
              </div>
              <p className="text-3xl font-bold">{replyRate}</p>
              <p className="text-xs text-muted-foreground">
                {stats.totalReplies} replies / {stats.totalEmails} sent
              </p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-green-500" />
                <span className="text-sm font-medium">Call Answer Rate</span>
              </div>
              <p className="text-3xl font-bold">{callAnswerRate}</p>
              <p className="text-xs text-muted-foreground">
                {stats.totalCallsAnswered} answered / {stats.totalCalls} calls
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Enrollment Status Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Users className="h-5 w-5 text-primary" />
            Enrollment Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {[
              { status: 'active', label: 'Active', color: 'bg-blue-500', icon: Clock },
              { status: 'completed', label: 'Completed', color: 'bg-green-500', icon: CheckCircle },
              { status: 'stopped_reply', label: 'Replied', color: 'bg-purple-500', icon: MessageSquare },
              { status: 'stopped_call', label: 'Call Answered', color: 'bg-emerald-500', icon: Phone },
              { status: 'paused', label: 'Paused', color: 'bg-yellow-500', icon: XCircle },
            ].map(item => {
              const count = stats.enrollmentsByStatus?.[item.status] || 0;
              const Icon = item.icon;
              return (
                <div key={item.status} className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                  <div className={cn("w-3 h-3 rounded-full", item.color)} />
                  <div className="flex-1">
                    <p className="text-lg font-bold">{count}</p>
                    <p className="text-xs text-muted-foreground">{item.label}</p>
                  </div>
                  <Icon className="h-4 w-4 text-muted-foreground" />
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Step-by-Step Performance */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <TrendingUp className="h-5 w-5 text-primary" />
            Step Performance
          </CardTitle>
        </CardHeader>
        <CardContent>
          {workflow.steps?.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Step</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Sent/Made</TableHead>
                  <TableHead>Opens</TableHead>
                  <TableHead>Clicks</TableHead>
                  <TableHead>Replies</TableHead>
                  <TableHead>Answered</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {workflow.steps.map((step, index) => {
                  const stepStats = stats.stepPerformance?.find(s => s.stepNumber === step.step_number) || {};
                  return (
                    <TableRow key={step.id || index}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-muted flex items-center justify-center text-xs font-bold">
                            {index + 1}
                          </div>
                          <span className="text-sm">
                            {index === 0 ? 'Day 0' : `+${step.delay_days}d`}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {getStepTypeIcon(step.step_type)}
                          <span className="capitalize">{step.step_type}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        {step.step_type === 'email' ? (stepStats.emailsSent || step.emails_sent || 0) :
                         step.step_type === 'call' ? (stepStats.callsMade || step.calls_made || 0) : '-'}
                      </TableCell>
                      <TableCell>
                        {step.step_type === 'email' ? (stepStats.opens || step.opens || 0) : '-'}
                      </TableCell>
                      <TableCell>
                        {step.step_type === 'email' ? (stepStats.clicks || step.clicks || 0) : '-'}
                      </TableCell>
                      <TableCell>
                        {step.step_type === 'email' ? (stepStats.replies || step.replies || 0) : '-'}
                      </TableCell>
                      <TableCell>
                        {step.step_type === 'call' ? (stepStats.answered || step.calls_answered || 0) : '-'}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          ) : (
            <p className="text-sm text-muted-foreground text-center py-8">
              No steps configured for this workflow
            </p>
          )}
        </CardContent>
      </Card>

      {/* Funnel Visualization */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <TrendingUp className="h-5 w-5 text-primary" />
            Workflow Funnel
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {workflow.steps?.map((step, index) => {
              const stepStats = stats.stepPerformance?.find(s => s.stepNumber === step.step_number) || {};
              const sent = step.step_type === 'email' ? (stepStats.emailsSent || step.emails_sent || 0) :
                          step.step_type === 'call' ? (stepStats.callsMade || step.calls_made || 0) : 0;
              const maxSent = Math.max(...(workflow.steps.map(s =>
                s.step_type === 'email' ? (s.emails_sent || 0) : (s.calls_made || 0)
              )), 1);
              const width = (sent / maxSent) * 100;

              return (
                <div key={step.id || index} className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      {getStepTypeIcon(step.step_type)}
                      <span>Step {index + 1}: {step.step_type}</span>
                    </div>
                    <span className="font-medium">{sent}</span>
                  </div>
                  <div className="h-8 bg-muted rounded-full overflow-hidden">
                    <div
                      className={cn(
                        "h-full rounded-full transition-all duration-500",
                        step.step_type === 'email' ? 'bg-blue-500' :
                        step.step_type === 'call' ? 'bg-green-500' :
                        step.step_type === 'sms' ? 'bg-purple-500' : 'bg-yellow-500'
                      )}
                      style={{ width: `${Math.max(width, 2)}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default WorkflowAnalytics;
