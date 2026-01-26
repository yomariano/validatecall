import { useState, useEffect } from 'react';
import { sequencesApi } from '../../services/api';
import {
  ArrowLeft,
  BarChart3,
  Mail,
  Eye,
  MousePointerClick,
  Reply,
  AlertTriangle,
  Users,
  CheckCircle,
  XCircle,
  Pause,
  Clock,
  TrendingUp,
  TrendingDown,
  Loader2,
  RefreshCw,
  ChevronDown,
  ChevronRight,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';

function SequenceAnalytics({ sequence, userId, onBack }) {
  const [analytics, setAnalytics] = useState(null);
  const [enrollments, setEnrollments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [enrollmentsPage, setEnrollmentsPage] = useState(1);
  const [totalEnrollments, setTotalEnrollments] = useState(0);
  const [enrollmentFilter, setEnrollmentFilter] = useState('all');
  const [showEnrollments, setShowEnrollments] = useState(false);

  useEffect(() => {
    loadAnalytics();
  }, [sequence?.id]);

  useEffect(() => {
    if (showEnrollments) {
      loadEnrollments();
    }
  }, [showEnrollments, enrollmentsPage, enrollmentFilter]);

  const loadAnalytics = async () => {
    setIsLoading(true);
    try {
      const data = await sequencesApi.getAnalytics(userId, sequence.id);
      setAnalytics(data);
    } catch (err) {
      console.error('Failed to load analytics:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const loadEnrollments = async () => {
    try {
      const filters = { page: enrollmentsPage, limit: 25 };
      if (enrollmentFilter !== 'all') {
        filters.status = enrollmentFilter;
      }
      const data = await sequencesApi.getEnrollments(userId, sequence.id, filters);
      setEnrollments(data.enrollments);
      setTotalEnrollments(data.total);
    } catch (err) {
      console.error('Failed to load enrollments:', err);
    }
  };

  const handleStopEnrollment = async (enrollmentId) => {
    try {
      await sequencesApi.stopEnrollment(userId, sequence.id, enrollmentId, 'Manual stop');
      await loadEnrollments();
      await loadAnalytics();
    } catch (err) {
      console.error('Failed to stop enrollment:', err);
    }
  };

  const handleResumeEnrollment = async (enrollmentId) => {
    try {
      await sequencesApi.resumeEnrollment(userId, sequence.id, enrollmentId);
      await loadEnrollments();
      await loadAnalytics();
    } catch (err) {
      console.error('Failed to resume enrollment:', err);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const stats = analytics?.sequence || {};
  const funnel = analytics?.funnel || [];
  const statusBreakdown = analytics?.statusBreakdown || {};
  const recentEvents = analytics?.recentEvents || [];

  // Calculate rates
  const openRate = stats.total_sent > 0 ? Math.round((stats.total_opens / stats.total_sent) * 100) : 0;
  const clickRate = stats.total_sent > 0 ? Math.round((stats.total_clicks / stats.total_sent) * 100) : 0;
  const replyRate = stats.total_sent > 0 ? Math.round((stats.total_replies / stats.total_sent) * 100) : 0;
  const bounceRate = stats.total_sent > 0 ? Math.round((stats.total_bounces / stats.total_sent) * 100) : 0;

  const getStatusBadge = (status) => {
    const variants = {
      active: { variant: 'success', icon: Clock },
      completed: { variant: 'info', icon: CheckCircle },
      stopped_reply: { variant: 'warning', icon: Reply },
      stopped_click: { variant: 'warning', icon: MousePointerClick },
      stopped_bounce: { variant: 'destructive', icon: AlertTriangle },
      stopped_unsubscribe: { variant: 'destructive', icon: XCircle },
      paused: { variant: 'secondary', icon: Pause },
    };
    const config = variants[status] || { variant: 'secondary', icon: Clock };
    const Icon = config.icon;
    const label = status.replace('stopped_', '').replace('_', ' ');

    return (
      <Badge variant={config.variant} className="gap-1">
        <Icon className="h-3 w-3" />
        {label}
      </Badge>
    );
  };

  const getEventIcon = (eventType) => {
    switch (eventType) {
      case 'open': return <Eye className="h-4 w-4 text-green-500" />;
      case 'click': return <MousePointerClick className="h-4 w-4 text-blue-500" />;
      case 'bounce': return <AlertTriangle className="h-4 w-4 text-red-500" />;
      case 'unsubscribe': return <XCircle className="h-4 w-4 text-red-500" />;
      default: return <Mail className="h-4 w-4 text-muted-foreground" />;
    }
  };

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
            <h1 className="text-2xl font-bold flex items-center gap-3">
              <BarChart3 className="h-6 w-6 text-primary" />
              {stats.name || 'Sequence'} Analytics
            </h1>
            <p className="text-sm text-muted-foreground">
              Performance metrics and engagement tracking
            </p>
          </div>
        </div>
        <Button variant="outline" size="sm" onClick={loadAnalytics} className="gap-2">
          <RefreshCw className="h-4 w-4" />
          Refresh
        </Button>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Users className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.total_enrolled || 0}</p>
                <p className="text-xs text-muted-foreground">Enrolled</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-500/10 rounded-lg">
                <Mail className="h-5 w-5 text-purple-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.total_sent || 0}</p>
                <p className="text-xs text-muted-foreground">Sent</p>
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
                <p className="text-2xl font-bold">{openRate}%</p>
                <p className="text-xs text-muted-foreground">Open Rate</p>
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
                <p className="text-2xl font-bold">{clickRate}%</p>
                <p className="text-xs text-muted-foreground">Click Rate</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-yellow-500/10 rounded-lg">
                <Reply className="h-5 w-5 text-yellow-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.total_replies || 0}</p>
                <p className="text-xs text-muted-foreground">Replies</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-500/10 rounded-lg">
                <AlertTriangle className="h-5 w-5 text-red-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{bounceRate}%</p>
                <p className="text-xs text-muted-foreground">Bounce Rate</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Step Funnel */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            Step Performance Funnel
          </CardTitle>
        </CardHeader>
        <CardContent>
          {funnel.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              No steps data available yet
            </p>
          ) : (
            <div className="space-y-4">
              {funnel.map((step, index) => {
                const maxSent = Math.max(...funnel.map(s => s.sent));
                const barWidth = maxSent > 0 ? (step.sent / maxSent) * 100 : 0;

                return (
                  <div key={index} className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <span className="w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-xs font-bold">
                          {step.stepNumber}
                        </span>
                        <span className="font-medium truncate max-w-[200px]">
                          {step.subject}...
                        </span>
                      </div>
                      <div className="flex items-center gap-4 text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Mail className="h-3 w-3" /> {step.sent}
                        </span>
                        <span className="flex items-center gap-1">
                          <Eye className="h-3 w-3" /> {step.opens} ({step.openRate}%)
                        </span>
                        <span className="flex items-center gap-1">
                          <MousePointerClick className="h-3 w-3" /> {step.clicks} ({step.clickRate}%)
                        </span>
                      </div>
                    </div>
                    <div className="relative h-8 bg-muted rounded-lg overflow-hidden">
                      <div
                        className="absolute inset-y-0 left-0 bg-gradient-to-r from-primary to-primary/70 rounded-lg transition-all"
                        style={{ width: `${barWidth}%` }}
                      />
                      <div className="absolute inset-0 flex items-center px-3">
                        <span className="text-xs font-medium text-primary-foreground">
                          {step.sent} sent
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Status Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Users className="h-5 w-5 text-primary" />
              Enrollment Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {Object.entries(statusBreakdown).map(([status, count]) => (
                <div key={status} className="flex items-center justify-between">
                  {getStatusBadge(status)}
                  <span className="font-bold">{count}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Clock className="h-5 w-5 text-primary" />
              Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            {recentEvents.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                No recent activity
              </p>
            ) : (
              <div className="space-y-3 max-h-[300px] overflow-y-auto">
                {recentEvents.slice(0, 10).map((event) => (
                  <div key={event.id} className="flex items-center gap-3 text-sm">
                    {getEventIcon(event.event_type)}
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">
                        {event.lead?.name || event.lead?.email || 'Unknown'}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {event.event_type} - {new Date(event.event_at).toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Enrollments Table */}
      <Card>
        <CardHeader>
          <Button
            variant="ghost"
            className="w-full justify-between p-0 h-auto"
            onClick={() => setShowEnrollments(!showEnrollments)}
          >
            <CardTitle className="flex items-center gap-2 text-lg">
              <Users className="h-5 w-5 text-primary" />
              Enrolled Leads
              <Badge variant="outline">{totalEnrollments || stats.total_enrolled || 0}</Badge>
            </CardTitle>
            {showEnrollments ? (
              <ChevronDown className="h-5 w-5" />
            ) : (
              <ChevronRight className="h-5 w-5" />
            )}
          </Button>
        </CardHeader>

        {showEnrollments && (
          <CardContent>
            {/* Filters */}
            <div className="flex gap-2 mb-4 flex-wrap">
              {['all', 'active', 'completed', 'stopped_reply', 'paused'].map(status => (
                <Button
                  key={status}
                  variant={enrollmentFilter === status ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => {
                    setEnrollmentFilter(status);
                    setEnrollmentsPage(1);
                  }}
                >
                  {status.replace('_', ' ')}
                </Button>
              ))}
            </div>

            {enrollments.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                No enrollments found
              </p>
            ) : (
              <>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Lead</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Current Step</TableHead>
                      <TableHead>Sent</TableHead>
                      <TableHead>Opens</TableHead>
                      <TableHead>Clicks</TableHead>
                      <TableHead>Next Email</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {enrollments.map((enrollment) => (
                      <TableRow key={enrollment.id}>
                        <TableCell>
                          <div>
                            <p className="font-medium">{enrollment.lead?.name || 'Unknown'}</p>
                            <p className="text-xs text-muted-foreground">{enrollment.lead?.email}</p>
                          </div>
                        </TableCell>
                        <TableCell>{getStatusBadge(enrollment.status)}</TableCell>
                        <TableCell>
                          <Badge variant="outline">
                            Step {enrollment.current_step + 1}
                          </Badge>
                        </TableCell>
                        <TableCell>{enrollment.emails_sent || 0}</TableCell>
                        <TableCell>{enrollment.opens || 0}</TableCell>
                        <TableCell>{enrollment.clicks || 0}</TableCell>
                        <TableCell>
                          {enrollment.next_email_at ? (
                            <span className="text-xs">
                              {new Date(enrollment.next_email_at).toLocaleString()}
                            </span>
                          ) : (
                            '-'
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          {enrollment.status === 'active' && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleStopEnrollment(enrollment.id)}
                              className="h-8 w-8 p-0"
                              title="Stop"
                            >
                              <Pause className="h-4 w-4" />
                            </Button>
                          )}
                          {enrollment.status === 'paused' && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleResumeEnrollment(enrollment.id)}
                              className="h-8 w-8 p-0"
                              title="Resume"
                            >
                              <Clock className="h-4 w-4" />
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>

                {/* Pagination */}
                {totalEnrollments > 25 && (
                  <div className="flex items-center justify-between mt-4">
                    <p className="text-sm text-muted-foreground">
                      Showing {(enrollmentsPage - 1) * 25 + 1} - {Math.min(enrollmentsPage * 25, totalEnrollments)} of {totalEnrollments}
                    </p>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={enrollmentsPage === 1}
                        onClick={() => setEnrollmentsPage(p => p - 1)}
                      >
                        Previous
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={enrollmentsPage * 25 >= totalEnrollments}
                        onClick={() => setEnrollmentsPage(p => p + 1)}
                      >
                        Next
                      </Button>
                    </div>
                  </div>
                )}
              </>
            )}
          </CardContent>
        )}
      </Card>
    </div>
  );
}

export default SequenceAnalytics;
