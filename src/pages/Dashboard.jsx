import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getDashboardStats, getLeads, getCalls } from '../services/supabase';
import { getAllCalls } from '../services/vapi';
import { getHealth } from '../services/api';
import {
  Users,
  PhoneCall,
  TrendingUp,
  Target,
  Search,
  Zap,
  BarChart3,
  ArrowRight,
  ArrowUpRight,
  Clock,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent, StatCard } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { LoadingState, EmptyState } from '@/components/ui/loading';



function Dashboard() {
  const [stats, setStats] = useState(null);
  const [recentLeads, setRecentLeads] = useState([]);
  const [recentCalls, setRecentCalls] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setIsLoading(true);
    try {
      // Load dashboard data via backend API
      const [dashStats, leads, calls] = await Promise.all([
        getDashboardStats(),
        getLeads({ limit: 5 }),
        getCalls({ limit: 5 }),
      ]);
      setStats(dashStats);
      setRecentLeads(leads);
      setRecentCalls(calls);
    } catch (err) {
      console.error('Error loading dashboard:', err);
      // Try Vapi-only mode as fallback
      try {
        const vapiCalls = await getAllCalls(5);
        setRecentCalls(vapiCalls.map(c => ({
          phone_number: c.customer?.number,
          status: c.status,
          created_at: c.createdAt,
          duration_seconds: c.duration,
        })));
        setStats({
          leads: { total: 0, new: 0, contacted: 0 },
          calls: { total: vapiCalls.length, completed: vapiCalls.filter(c => c.status === 'ended').length },
          campaigns: { total: 0, active: 0 },
        });
      } catch {
        // Both failed, likely backend not running
      }
    } finally {
      setIsLoading(false);
    }
  };

  const [configStatus, setConfigStatus] = useState({ vapi: false, supabase: false, claude: false });
  const [allConfigured, setAllConfigured] = useState(false);

  useEffect(() => {
    const checkServices = async () => {
      try {
        const health = await getHealth();
        setConfigStatus(health.services || { vapi: false, supabase: false, claude: false });
        setAllConfigured(health.services?.vapi && health.services?.supabase && health.services?.claude);
      } catch {
        // Backend not available
      }
    };
    checkServices();
  }, []);

  const getStatusBadge = (status) => {
    const variants = {
      new: 'info',
      contacted: 'warning',
      converted: 'success',
      ended: 'success',
      failed: 'destructive',
    };
    return <Badge variant={variants[status] || 'secondary'}>{status}</Badge>;
  };

  const formatDuration = (seconds) => {
    if (!seconds) return '-';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="space-y-8">
      {/* Page Header - Enterprise Style */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-foreground tracking-tight">
            Dashboard
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Welcome back. Here's your validation activity overview.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button asChild variant="secondary">
            <Link to="/history" className="gap-2">
              <BarChart3 className="h-4 w-4" />
              View Reports
            </Link>
          </Button>
          <Button asChild variant="default">
            <Link to="/campaigns" className="gap-2">
              <Zap className="h-4 w-4" />
              New Campaign
            </Link>
          </Button>
        </div>
      </div>

      {/* Setup Alert */}
      {!allConfigured && (
        <Alert variant="info">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Complete Setup</AlertTitle>
          <AlertDescription>
            <p>Configure the following services in your <code className="rounded bg-muted px-1.5 py-0.5 text-xs font-mono">.env</code> file:</p>
            <div className="mt-3 grid grid-cols-3 gap-4">
              <div className={`flex items-center gap-2 ${configStatus.vapi ? 'text-muted-foreground' : ''}`}>
                {configStatus.vapi ? <CheckCircle2 className="h-4 w-4 text-success" /> : <Clock className="h-4 w-4" />}
                <span className="text-sm">Vapi.ai API</span>
              </div>
              <div className={`flex items-center gap-2 ${configStatus.supabase ? 'text-muted-foreground' : ''}`}>
                {configStatus.supabase ? <CheckCircle2 className="h-4 w-4 text-success" /> : <Clock className="h-4 w-4" />}
                <span className="text-sm">Supabase Database</span>
              </div>
              <div className={`flex items-center gap-2 ${configStatus.claude ? 'text-muted-foreground' : ''}`}>
                {configStatus.claude ? <CheckCircle2 className="h-4 w-4 text-success" /> : <Clock className="h-4 w-4" />}
                <span className="text-sm">Claude AI (Lead Gen)</span>
              </div>
            </div>
          </AlertDescription>
        </Alert>
      )}

      {isLoading ? (
        <LoadingState message="Loading dashboard data..." />
      ) : (
        <>
          {/* Stats Grid - Enterprise Style */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="border-l-4 border-l-primary">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Total Leads</p>
                    <p className="text-3xl font-bold text-foreground mt-1">{stats?.leads?.total || 0}</p>
                  </div>
                  <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Users className="h-6 w-6 text-primary" />
                  </div>
                </div>
                <div className="flex items-center gap-1 mt-4 text-sm text-muted-foreground">
                  <ArrowUpRight className="h-4 w-4 text-success" />
                  <span className="text-success font-medium">+12%</span>
                  <span>from last month</span>
                </div>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-success">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Calls Completed</p>
                    <p className="text-3xl font-bold text-foreground mt-1">{stats?.calls?.completed || 0}</p>
                  </div>
                  <div className="h-12 w-12 rounded-lg bg-success/10 flex items-center justify-center">
                    <PhoneCall className="h-6 w-6 text-success" />
                  </div>
                </div>
                <div className="flex items-center gap-1 mt-4 text-sm text-muted-foreground">
                  <ArrowUpRight className="h-4 w-4 text-success" />
                  <span className="text-success font-medium">+8%</span>
                  <span>completion rate</span>
                </div>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-warning">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">New Leads</p>
                    <p className="text-3xl font-bold text-foreground mt-1">{stats?.leads?.new || 0}</p>
                  </div>
                  <div className="h-12 w-12 rounded-lg bg-warning/10 flex items-center justify-center">
                    <TrendingUp className="h-6 w-6 text-warning" />
                  </div>
                </div>
                <div className="flex items-center gap-1 mt-4 text-sm text-muted-foreground">
                  <span>Pending validation</span>
                </div>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-info">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Active Campaigns</p>
                    <p className="text-3xl font-bold text-foreground mt-1">{stats?.campaigns?.total || 0}</p>
                  </div>
                  <div className="h-12 w-12 rounded-lg bg-info/10 flex items-center justify-center">
                    <Target className="h-6 w-6 text-info" />
                  </div>
                </div>
                <div className="flex items-center gap-1 mt-4 text-sm text-muted-foreground">
                  <span>Running campaigns</span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Content Grid */}
          <div className="grid lg:grid-cols-2 gap-6">
            {/* Recent Leads */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between border-b border-border pb-4">
                <div>
                  <CardTitle className="text-base font-semibold">Recent Leads</CardTitle>
                  <p className="text-sm text-muted-foreground mt-0.5">Latest discovered prospects</p>
                </div>
                <Button variant="ghost" size="sm" asChild>
                  <Link to="/leads" className="gap-1 text-primary">
                    View All <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
              </CardHeader>
              <CardContent className="pt-4">
                {recentLeads.length === 0 ? (
                  <EmptyState
                    icon={Search}
                    title="No leads yet"
                    description="Start by discovering leads for your validation campaigns"
                    action={
                      <Button asChild variant="default">
                        <Link to="/leads">Discover Leads</Link>
                      </Button>
                    }
                  />
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Business</TableHead>
                        <TableHead>Phone</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {recentLeads.map((lead) => (
                        <TableRow key={lead.id}>
                          <TableCell className="font-medium">{lead.name}</TableCell>
                          <TableCell className="text-muted-foreground font-mono text-sm">{lead.phone}</TableCell>
                          <TableCell>{getStatusBadge(lead.status)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>

            {/* Recent Calls */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between border-b border-border pb-4">
                <div>
                  <CardTitle className="text-base font-semibold">Recent Calls</CardTitle>
                  <p className="text-sm text-muted-foreground mt-0.5">Latest validation calls</p>
                </div>
                <Button variant="ghost" size="sm" asChild>
                  <Link to="/history" className="gap-1 text-primary">
                    View All <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
              </CardHeader>
              <CardContent className="pt-4">
                {recentCalls.length === 0 ? (
                  <EmptyState
                    icon={PhoneCall}
                    title="No calls yet"
                    description="Launch a campaign to start AI-powered validation calls"
                    action={
                      <Button asChild variant="default">
                        <Link to="/campaigns">Start Campaign</Link>
                      </Button>
                    }
                  />
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Phone</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Duration</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {recentCalls.map((call, i) => (
                        <TableRow key={call.id || i}>
                          <TableCell className="font-mono text-sm">
                            {call.phone_number || call.customer?.number}
                          </TableCell>
                          <TableCell>{getStatusBadge(call.status)}</TableCell>
                          <TableCell className="text-muted-foreground">
                            {formatDuration(call.duration_seconds)}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions - Enterprise Style */}
          <Card>
            <CardHeader className="border-b border-border pb-4">
              <CardTitle className="text-base font-semibold">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Link
                  to="/leads"
                  className="group flex items-center gap-4 p-4 rounded-lg border border-border hover:border-primary hover:bg-primary/5 transition-all"
                >
                  <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                    <Search className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium text-foreground">Discover Leads</p>
                    <p className="text-sm text-muted-foreground">Find new prospects</p>
                  </div>
                  <ArrowRight className="h-4 w-4 ml-auto text-muted-foreground group-hover:text-primary transition-colors" />
                </Link>

                <Link
                  to="/campaigns"
                  className="group flex items-center gap-4 p-4 rounded-lg border border-border hover:border-success hover:bg-success/5 transition-all"
                >
                  <div className="h-10 w-10 rounded-lg bg-success/10 flex items-center justify-center group-hover:bg-success/20 transition-colors">
                    <PhoneCall className="h-5 w-5 text-success" />
                  </div>
                  <div>
                    <p className="font-medium text-foreground">Start Campaign</p>
                    <p className="text-sm text-muted-foreground">Launch validation calls</p>
                  </div>
                  <ArrowRight className="h-4 w-4 ml-auto text-muted-foreground group-hover:text-success transition-colors" />
                </Link>

                <Link
                  to="/history"
                  className="group flex items-center gap-4 p-4 rounded-lg border border-border hover:border-info hover:bg-info/5 transition-all"
                >
                  <div className="h-10 w-10 rounded-lg bg-info/10 flex items-center justify-center group-hover:bg-info/20 transition-colors">
                    <BarChart3 className="h-5 w-5 text-info" />
                  </div>
                  <div>
                    <p className="font-medium text-foreground">View Analytics</p>
                    <p className="text-sm text-muted-foreground">Review call insights</p>
                  </div>
                  <ArrowRight className="h-4 w-4 ml-auto text-muted-foreground group-hover:text-info transition-colors" />
                </Link>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}

export default Dashboard;
