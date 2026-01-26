import { useState, useEffect } from 'react';
import { emailTrackingApi, sequencesApi } from '../services/api';
import { useAuth } from '../context/AuthContext';
import {
  BarChart3,
  Mail,
  Eye,
  MousePointerClick,
  Reply,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  Calendar,
  RefreshCw,
  Loader2,
  Clock,
  Users,
  XCircle,
  ArrowUp,
  ArrowDown,
  Minus,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Select } from '@/components/ui/input';
import { LoadingState } from '@/components/ui/loading';
import { cn } from '@/lib/utils';

function EmailAnalytics() {
  const { user } = useAuth();

  // State
  const [analytics, setAnalytics] = useState(null);
  const [timeseries, setTimeseries] = useState([]);
  const [sequences, setSequences] = useState([]);
  const [recentEvents, setRecentEvents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  // Date range
  const [dateRange, setDateRange] = useState('30'); // days

  useEffect(() => {
    if (user?.id) {
      loadData();
    }
  }, [user?.id, dateRange]);

  const loadData = async () => {
    setIsLoading(true);
    setError('');

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(dateRange));

    try {
      const [analyticsRes, timeseriesRes, sequencesRes, eventsRes] = await Promise.all([
        emailTrackingApi.getAnalytics(user.id, { startDate: startDate.toISOString() }),
        emailTrackingApi.getTimeseries(user.id, { startDate: startDate.toISOString() }),
        sequencesApi.list(user.id),
        emailTrackingApi.getRecentEvents(user.id, { limit: 20 }),
      ]);

      setAnalytics(analyticsRes.analytics);
      setTimeseries(timeseriesRes.timeseries || []);
      setSequences(sequencesRes.sequences || []);
      setRecentEvents(eventsRes.events || []);
    } catch (err) {
      setError(err.message || 'Failed to load analytics');
    } finally {
      setIsLoading(false);
    }
  };

  const getEventIcon = (eventType) => {
    switch (eventType) {
      case 'open': return <Eye className="h-4 w-4 text-green-500" />;
      case 'click': return <MousePointerClick className="h-4 w-4 text-blue-500" />;
      case 'bounce': return <AlertTriangle className="h-4 w-4 text-red-500" />;
      case 'unsubscribe': return <XCircle className="h-4 w-4 text-red-500" />;
      case 'delivered': return <Mail className="h-4 w-4 text-green-500" />;
      default: return <Mail className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getTrendIcon = (value, threshold = 0) => {
    if (value > threshold) return <ArrowUp className="h-4 w-4 text-green-500" />;
    if (value < threshold) return <ArrowDown className="h-4 w-4 text-red-500" />;
    return <Minus className="h-4 w-4 text-muted-foreground" />;
  };

  // Calculate max for bar chart
  const maxDailyValue = Math.max(...timeseries.map(d => d.sent), 1);

  if (isLoading) {
    return <LoadingState message="Loading email analytics..." />;
  }

  return (
    <div className="space-y-8 animate-slide-up">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight bg-gradient-to-r from-foreground to-muted-foreground bg-clip-text text-transparent">
            Email Analytics
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground">
            Track email performance across all your sequences
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="w-36"
          >
            <option value="7">Last 7 days</option>
            <option value="14">Last 14 days</option>
            <option value="30">Last 30 days</option>
            <option value="60">Last 60 days</option>
            <option value="90">Last 90 days</option>
          </Select>
          <Button variant="outline" size="sm" onClick={loadData} disabled={isLoading}>
            <RefreshCw className={cn("h-4 w-4", isLoading && "animate-spin")} />
          </Button>
        </div>
      </div>

      {error && (
        <Alert variant="destructive" onClose={() => setError('')}>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Overview Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Mail className="h-5 w-5 text-primary" />
              </div>
              {getTrendIcon(analytics?.total_sent, 0)}
            </div>
            <div className="mt-4">
              <p className="text-3xl font-bold">{analytics?.total_sent || 0}</p>
              <p className="text-xs text-muted-foreground mt-1">Total Sent</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="p-2 bg-green-500/10 rounded-lg">
                <Eye className="h-5 w-5 text-green-500" />
              </div>
              <Badge variant={analytics?.open_rate >= 25 ? 'success' : analytics?.open_rate >= 15 ? 'warning' : 'destructive'}>
                {analytics?.open_rate || 0}%
              </Badge>
            </div>
            <div className="mt-4">
              <p className="text-3xl font-bold">{analytics?.unique_opens || 0}</p>
              <p className="text-xs text-muted-foreground mt-1">Unique Opens</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="p-2 bg-blue-500/10 rounded-lg">
                <MousePointerClick className="h-5 w-5 text-blue-500" />
              </div>
              <Badge variant={analytics?.click_rate >= 5 ? 'success' : analytics?.click_rate >= 2 ? 'warning' : 'secondary'}>
                {analytics?.click_rate || 0}%
              </Badge>
            </div>
            <div className="mt-4">
              <p className="text-3xl font-bold">{analytics?.unique_clicks || 0}</p>
              <p className="text-xs text-muted-foreground mt-1">Unique Clicks</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="p-2 bg-purple-500/10 rounded-lg">
                <TrendingUp className="h-5 w-5 text-purple-500" />
              </div>
            </div>
            <div className="mt-4">
              <p className="text-3xl font-bold">{analytics?.total_delivered || 0}</p>
              <p className="text-xs text-muted-foreground mt-1">Delivered</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="p-2 bg-red-500/10 rounded-lg">
                <AlertTriangle className="h-5 w-5 text-red-500" />
              </div>
              <Badge variant={analytics?.bounce_rate <= 2 ? 'success' : analytics?.bounce_rate <= 5 ? 'warning' : 'destructive'}>
                {analytics?.bounce_rate || 0}%
              </Badge>
            </div>
            <div className="mt-4">
              <p className="text-3xl font-bold">{analytics?.total_bounces || 0}</p>
              <p className="text-xs text-muted-foreground mt-1">Bounced</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="p-2 bg-yellow-500/10 rounded-lg">
                <XCircle className="h-5 w-5 text-yellow-500" />
              </div>
            </div>
            <div className="mt-4">
              <p className="text-3xl font-bold">{analytics?.total_unsubscribes || 0}</p>
              <p className="text-xs text-muted-foreground mt-1">Unsubscribes</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Time Series Chart */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-primary" />
              Email Activity Over Time
            </CardTitle>
          </CardHeader>
          <CardContent>
            {timeseries.length === 0 ? (
              <p className="text-center text-muted-foreground py-12">
                No data available for this period
              </p>
            ) : (
              <div className="space-y-4">
                {/* Legend */}
                <div className="flex items-center gap-6 text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-primary" />
                    <span>Sent</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-green-500" />
                    <span>Opens</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-blue-500" />
                    <span>Clicks</span>
                  </div>
                </div>

                {/* Simple Bar Chart */}
                <div className="h-64 flex items-end gap-1 px-4">
                  {timeseries.map((day, index) => (
                    <div
                      key={day.date}
                      className="flex-1 flex flex-col items-center gap-1 group"
                    >
                      {/* Tooltip */}
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity bg-popover text-popover-foreground p-2 rounded shadow-lg text-xs absolute -translate-y-full mb-2 whitespace-nowrap z-10">
                        <p className="font-medium">{day.date}</p>
                        <p>Sent: {day.sent}</p>
                        <p>Opens: {day.opens}</p>
                        <p>Clicks: {day.clicks}</p>
                      </div>

                      {/* Bar */}
                      <div className="w-full flex gap-px justify-center" style={{ height: '200px' }}>
                        <div
                          className="w-2 bg-primary rounded-t transition-all group-hover:bg-primary/80"
                          style={{
                            height: `${(day.sent / maxDailyValue) * 100}%`,
                            minHeight: day.sent > 0 ? '4px' : '0',
                          }}
                        />
                        <div
                          className="w-2 bg-green-500 rounded-t transition-all group-hover:bg-green-400"
                          style={{
                            height: `${(day.opens / maxDailyValue) * 100}%`,
                            minHeight: day.opens > 0 ? '4px' : '0',
                          }}
                        />
                        <div
                          className="w-2 bg-blue-500 rounded-t transition-all group-hover:bg-blue-400"
                          style={{
                            height: `${(day.clicks / maxDailyValue) * 100}%`,
                            minHeight: day.clicks > 0 ? '4px' : '0',
                          }}
                        />
                      </div>

                      {/* Date Label */}
                      {(index === 0 || index === timeseries.length - 1 || index % Math.ceil(timeseries.length / 7) === 0) && (
                        <span className="text-xs text-muted-foreground mt-2">
                          {new Date(day.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Sequences & Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sequences Performance */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5 text-primary" />
              Sequences Performance
            </CardTitle>
          </CardHeader>
          <CardContent>
            {sequences.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                No sequences yet
              </p>
            ) : (
              <div className="space-y-4">
                {sequences.slice(0, 5).map((seq) => {
                  const openRate = seq.total_sent > 0
                    ? Math.round((seq.total_opens / seq.total_sent) * 100)
                    : 0;
                  const clickRate = seq.total_sent > 0
                    ? Math.round((seq.total_clicks / seq.total_sent) * 100)
                    : 0;

                  return (
                    <div key={seq.id} className="p-4 bg-muted/50 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <p className="font-medium truncate">{seq.name}</p>
                        <Badge variant={seq.status === 'active' ? 'success' : 'secondary'}>
                          {seq.status}
                        </Badge>
                      </div>
                      <div className="grid grid-cols-4 gap-2 text-sm">
                        <div>
                          <p className="text-muted-foreground">Sent</p>
                          <p className="font-bold">{seq.total_sent || 0}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Open %</p>
                          <p className="font-bold">{openRate}%</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Click %</p>
                          <p className="font-bold">{clickRate}%</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Replies</p>
                          <p className="font-bold">{seq.total_replies || 0}</p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
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
              <div className="space-y-3 max-h-[400px] overflow-y-auto">
                {recentEvents.map((event) => (
                  <div
                    key={event.id}
                    className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg"
                  >
                    {getEventIcon(event.event_type)}
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">
                        {event.lead?.name || event.lead?.email || 'Unknown'}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {event.event_type.charAt(0).toUpperCase() + event.event_type.slice(1)}
                        {event.url && (
                          <span className="ml-1 truncate">
                            - {new URL(event.url).hostname}
                          </span>
                        )}
                      </p>
                    </div>
                    <span className="text-xs text-muted-foreground shrink-0">
                      {new Date(event.event_at).toLocaleTimeString(undefined, {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Industry Benchmarks */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-primary" />
            How You Compare
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center p-4">
              <p className="text-sm text-muted-foreground mb-2">Your Open Rate</p>
              <p className="text-4xl font-bold mb-1">{analytics?.open_rate || 0}%</p>
              <p className="text-xs text-muted-foreground">
                Industry avg: <span className="font-medium">21%</span>
              </p>
              <div className="mt-3">
                {(analytics?.open_rate || 0) >= 21 ? (
                  <Badge variant="success" className="gap-1">
                    <TrendingUp className="h-3 w-3" />
                    Above average
                  </Badge>
                ) : (
                  <Badge variant="warning" className="gap-1">
                    <TrendingDown className="h-3 w-3" />
                    Below average
                  </Badge>
                )}
              </div>
            </div>

            <div className="text-center p-4">
              <p className="text-sm text-muted-foreground mb-2">Your Click Rate</p>
              <p className="text-4xl font-bold mb-1">{analytics?.click_rate || 0}%</p>
              <p className="text-xs text-muted-foreground">
                Industry avg: <span className="font-medium">2.5%</span>
              </p>
              <div className="mt-3">
                {(analytics?.click_rate || 0) >= 2.5 ? (
                  <Badge variant="success" className="gap-1">
                    <TrendingUp className="h-3 w-3" />
                    Above average
                  </Badge>
                ) : (
                  <Badge variant="warning" className="gap-1">
                    <TrendingDown className="h-3 w-3" />
                    Below average
                  </Badge>
                )}
              </div>
            </div>

            <div className="text-center p-4">
              <p className="text-sm text-muted-foreground mb-2">Your Bounce Rate</p>
              <p className="text-4xl font-bold mb-1">{analytics?.bounce_rate || 0}%</p>
              <p className="text-xs text-muted-foreground">
                Industry avg: <span className="font-medium">2%</span>
              </p>
              <div className="mt-3">
                {(analytics?.bounce_rate || 0) <= 2 ? (
                  <Badge variant="success" className="gap-1">
                    <TrendingUp className="h-3 w-3" />
                    Healthy
                  </Badge>
                ) : (
                  <Badge variant="destructive" className="gap-1">
                    <TrendingDown className="h-3 w-3" />
                    Needs attention
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default EmailAnalytics;
