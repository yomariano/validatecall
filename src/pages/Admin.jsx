import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { adminApi } from '@/services/api';
import { Shield, Mail, Zap, BarChart3, Users, Send, Trash2, Power, PowerOff } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export default function Admin() {
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState('campaigns');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Data
    const [segments, setSegments] = useState([]);
    const [campaigns, setCampaigns] = useState([]);
    const [triggers, setTriggers] = useState([]);
    const [analytics, setAnalytics] = useState(null);

    // Campaign form
    const [showCampaignForm, setShowCampaignForm] = useState(false);
    const [campaignForm, setCampaignForm] = useState({
        name: '',
        subject: '',
        bodyHtml: '',
        segment: 'all',
    });
    const [sending, setSending] = useState(false);

    useEffect(() => {
        loadData();
    }, [user?.id]);

    const loadData = async () => {
        if (!user?.id) return;

        try {
            setLoading(true);
            setError(null);

            const [segmentsRes, campaignsRes, triggersRes, analyticsRes] = await Promise.all([
                adminApi.getSegments(user.id).catch(() => ({ segments: [] })),
                adminApi.getCampaigns(user.id).catch(() => ({ campaigns: [] })),
                adminApi.getTriggers(user.id).catch(() => ({ triggers: [] })),
                adminApi.getAnalytics(user.id).catch(() => null),
            ]);

            setSegments(segmentsRes.segments || []);
            setCampaigns(campaignsRes.campaigns || []);
            setTriggers(triggersRes.triggers || []);
            setAnalytics(analyticsRes);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateCampaign = async (e) => {
        e.preventDefault();
        if (!campaignForm.name || !campaignForm.subject || !campaignForm.bodyHtml) return;

        try {
            setSending(true);
            await adminApi.createCampaign(user.id, campaignForm);
            setCampaignForm({ name: '', subject: '', bodyHtml: '', segment: 'all' });
            setShowCampaignForm(false);
            loadData();
        } catch (err) {
            setError(err.message);
        } finally {
            setSending(false);
        }
    };

    const handleSendCampaign = async (campaignId) => {
        if (!confirm('Send this campaign now?')) return;

        try {
            setSending(true);
            const result = await adminApi.sendCampaign(user.id, campaignId);
            alert(`Sending to ${result.totalRecipients} users`);
            loadData();
        } catch (err) {
            setError(err.message);
        } finally {
            setSending(false);
        }
    };

    const handleToggleTrigger = async (triggerId, currentActive) => {
        try {
            await adminApi.updateTrigger(user.id, triggerId, { isActive: !currentActive });
            loadData();
        } catch (err) {
            setError(err.message);
        }
    };

    const handleDeleteCampaign = async (campaignId) => {
        if (!confirm('Delete this campaign?')) return;

        try {
            await adminApi.deleteCampaign(user.id, campaignId);
            loadData();
        } catch (err) {
            setError(err.message);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-6">
                <Card className="border-destructive/50 bg-destructive/5">
                    <CardContent className="pt-6">
                        <p className="text-destructive font-medium">{error}</p>
                        <p className="text-sm text-muted-foreground mt-2">You may not have admin access.</p>
                    </CardContent>
                </Card>
            </div>
        );
    }

    const tabs = [
        { id: 'campaigns', label: 'Campaigns', icon: Mail },
        { id: 'triggers', label: 'Triggers', icon: Zap },
        { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    ];

    return (
        <div className="space-y-6 animate-slide-up">
            {/* Header */}
            <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                    <Shield className="h-5 w-5 text-primary" />
                </div>
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Admin Dashboard</h1>
                    <p className="text-muted-foreground">Manage marketing campaigns and automated emails</p>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-1 p-1 bg-muted/50 rounded-lg w-fit">
                {tabs.map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${
                            activeTab === tab.id
                                ? 'bg-background text-foreground shadow-sm'
                                : 'text-muted-foreground hover:text-foreground'
                        }`}
                    >
                        <tab.icon className="h-4 w-4" />
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Campaigns Tab */}
            {activeTab === 'campaigns' && (
                <div className="space-y-6">
                    {/* Segments Overview */}
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
                        {segments.map((seg) => (
                            <Card key={seg.id} className="bg-card">
                                <CardContent className="p-4">
                                    <p className="text-xs text-muted-foreground">{seg.name}</p>
                                    <p className="text-2xl font-bold">{seg.count}</p>
                                </CardContent>
                            </Card>
                        ))}
                    </div>

                    {/* Create Campaign */}
                    <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                            <Mail className="h-5 w-5 text-muted-foreground" />
                            <h2 className="text-lg font-semibold">Campaigns</h2>
                        </div>
                        <Button
                            onClick={() => setShowCampaignForm(!showCampaignForm)}
                            variant={showCampaignForm ? "outline" : "default"}
                        >
                            {showCampaignForm ? 'Cancel' : 'New Campaign'}
                        </Button>
                    </div>

                    {/* Campaign Form */}
                    {showCampaignForm && (
                        <Card>
                            <CardContent className="pt-6">
                                <form onSubmit={handleCreateCampaign} className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium mb-1.5">
                                            Campaign Name
                                        </label>
                                        <input
                                            type="text"
                                            value={campaignForm.name}
                                            onChange={(e) => setCampaignForm({ ...campaignForm, name: e.target.value })}
                                            className="w-full px-3 py-2 rounded-md border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                                            placeholder="e.g., January Promo"
                                            required
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium mb-1.5">
                                            Target Segment
                                        </label>
                                        <select
                                            value={campaignForm.segment}
                                            onChange={(e) => setCampaignForm({ ...campaignForm, segment: e.target.value })}
                                            className="w-full px-3 py-2 rounded-md border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                                        >
                                            {segments.map((seg) => (
                                                <option key={seg.id} value={seg.id}>
                                                    {seg.name} ({seg.count} users)
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium mb-1.5">
                                            Subject Line
                                        </label>
                                        <input
                                            type="text"
                                            value={campaignForm.subject}
                                            onChange={(e) => setCampaignForm({ ...campaignForm, subject: e.target.value })}
                                            className="w-full px-3 py-2 rounded-md border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                                            placeholder="e.g., Special offer inside..."
                                            required
                                        />
                                        <p className="text-xs text-muted-foreground mt-1">Use {'{{firstName}}'} for personalization</p>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium mb-1.5">
                                            Email Body (HTML)
                                        </label>
                                        <textarea
                                            value={campaignForm.bodyHtml}
                                            onChange={(e) => setCampaignForm({ ...campaignForm, bodyHtml: e.target.value })}
                                            className="w-full px-3 py-2 rounded-md border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary h-40 font-mono text-sm"
                                            placeholder="<p>Hi {{firstName}},</p><p>Your email content here...</p>"
                                            required
                                        />
                                        <p className="text-xs text-muted-foreground mt-1">
                                            Variables: {'{{firstName}}'}, {'{{email}}'}, {'{{planName}}'}, {'{{upgradeUrl}}'}
                                        </p>
                                    </div>

                                    <Button type="submit" disabled={sending}>
                                        {sending ? 'Creating...' : 'Create Campaign'}
                                    </Button>
                                </form>
                            </CardContent>
                        </Card>
                    )}

                    {/* Campaigns List */}
                    <div className="space-y-3">
                        {campaigns.length === 0 ? (
                            <Card>
                                <CardContent className="py-12 text-center">
                                    <Mail className="h-12 w-12 text-muted-foreground/30 mx-auto mb-3" />
                                    <p className="text-muted-foreground">No campaigns yet</p>
                                    <p className="text-sm text-muted-foreground/70">Create your first campaign to start reaching users</p>
                                </CardContent>
                            </Card>
                        ) : (
                            campaigns.map((campaign) => (
                                <Card key={campaign.id}>
                                    <CardContent className="p-4">
                                        <div className="flex items-center justify-between gap-4">
                                            <div className="min-w-0 flex-1">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <h3 className="font-medium truncate">{campaign.name}</h3>
                                                    <Badge variant={campaign.status === 'sent' ? 'success' : campaign.status === 'draft' ? 'secondary' : 'default'}>
                                                        {campaign.status}
                                                    </Badge>
                                                </div>
                                                <p className="text-sm text-muted-foreground truncate">
                                                    {campaign.subject}
                                                </p>
                                                <p className="text-xs text-muted-foreground mt-1">
                                                    Segment: {campaign.segment}
                                                    {campaign.sent_count > 0 && ` • Sent: ${campaign.sent_count}`}
                                                </p>
                                            </div>
                                            <div className="flex gap-2 flex-shrink-0">
                                                {campaign.status === 'draft' && (
                                                    <Button
                                                        size="sm"
                                                        onClick={() => handleSendCampaign(campaign.id)}
                                                        disabled={sending}
                                                    >
                                                        <Send className="h-4 w-4 mr-1" />
                                                        Send
                                                    </Button>
                                                )}
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    onClick={() => handleDeleteCampaign(campaign.id)}
                                                    className="text-destructive hover:text-destructive hover:bg-destructive/10"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))
                        )}
                    </div>
                </div>
            )}

            {/* Triggers Tab */}
            {activeTab === 'triggers' && (
                <div className="space-y-6">
                    <div>
                        <div className="flex items-center gap-2 mb-2">
                            <Zap className="h-5 w-5 text-muted-foreground" />
                            <h2 className="text-lg font-semibold">Automated Triggers</h2>
                        </div>
                        <p className="text-sm text-muted-foreground">
                            Enable triggers to automatically send emails based on user behavior
                        </p>
                    </div>

                    <div className="space-y-3">
                        {triggers.map((trigger) => (
                            <Card key={trigger.id} className={trigger.is_active ? 'border-primary/30 bg-primary/5' : ''}>
                                <CardContent className="p-4">
                                    <div className="flex items-center justify-between gap-4">
                                        <div className="min-w-0 flex-1">
                                            <div className="flex items-center gap-2 mb-1">
                                                <h3 className="font-medium">{trigger.name}</h3>
                                                <Badge variant={trigger.is_active ? 'success' : 'secondary'}>
                                                    {trigger.is_active ? 'Active' : 'Inactive'}
                                                </Badge>
                                                {trigger.discount_code && (
                                                    <Badge variant="outline" className="text-xs">
                                                        {trigger.discount_percent}% off
                                                    </Badge>
                                                )}
                                            </div>
                                            <p className="text-sm text-muted-foreground">
                                                {trigger.description || trigger.trigger_type}
                                            </p>
                                            <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                                                <span className="truncate max-w-[300px]">Subject: {trigger.subject}</span>
                                                {trigger.times_triggered > 0 && (
                                                    <span>• Triggered {trigger.times_triggered}x</span>
                                                )}
                                            </div>
                                        </div>
                                        <Button
                                            size="sm"
                                            variant={trigger.is_active ? "outline" : "default"}
                                            onClick={() => handleToggleTrigger(trigger.id, trigger.is_active)}
                                        >
                                            {trigger.is_active ? (
                                                <>
                                                    <PowerOff className="h-4 w-4 mr-1" />
                                                    Disable
                                                </>
                                            ) : (
                                                <>
                                                    <Power className="h-4 w-4 mr-1" />
                                                    Enable
                                                </>
                                            )}
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>
            )}

            {/* Analytics Tab */}
            {activeTab === 'analytics' && (
                <div className="space-y-6">
                    <div className="flex items-center gap-2">
                        <BarChart3 className="h-5 w-5 text-muted-foreground" />
                        <h2 className="text-lg font-semibold">Email Analytics</h2>
                    </div>

                    {/* Stats Cards */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <Card>
                            <CardContent className="p-4">
                                <p className="text-sm text-muted-foreground">Draft Campaigns</p>
                                <p className="text-3xl font-bold">{analytics?.campaigns?.draft || 0}</p>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardContent className="p-4">
                                <p className="text-sm text-muted-foreground">Sent Campaigns</p>
                                <p className="text-3xl font-bold">{analytics?.campaigns?.sent || 0}</p>
                            </CardContent>
                        </Card>
                        <Card className="bg-primary/5 border-primary/20">
                            <CardContent className="p-4">
                                <p className="text-sm text-muted-foreground">Total Emails Sent</p>
                                <p className="text-3xl font-bold text-primary">{analytics?.campaigns?.totalSent || 0}</p>
                            </CardContent>
                        </Card>
                        <Card className={analytics?.campaigns?.totalFailed > 0 ? 'bg-destructive/5 border-destructive/20' : ''}>
                            <CardContent className="p-4">
                                <p className="text-sm text-muted-foreground">Failed</p>
                                <p className={`text-3xl font-bold ${analytics?.campaigns?.totalFailed > 0 ? 'text-destructive' : ''}`}>
                                    {analytics?.campaigns?.totalFailed || 0}
                                </p>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Trigger Stats */}
                    {analytics && Object.keys(analytics.triggers || {}).length > 0 && (
                        <div>
                            <h3 className="text-md font-medium mb-3">Trigger Performance</h3>
                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                                {Object.entries(analytics.triggers).map(([type, stats]) => (
                                    <Card key={type}>
                                        <CardContent className="p-3">
                                            <p className="text-xs text-muted-foreground truncate">{type}</p>
                                            <div className="flex items-baseline gap-2">
                                                <p className="text-lg font-bold">{stats.sent}</p>
                                                <span className="text-xs text-muted-foreground">sent</span>
                                                {stats.failed > 0 && (
                                                    <span className="text-xs text-destructive">({stats.failed} failed)</span>
                                                )}
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Recent Sends */}
                    {analytics?.recentSends?.length > 0 && (
                        <div>
                            <h3 className="text-md font-medium mb-3">Recent Sends</h3>
                            <Card>
                                <div className="overflow-x-auto">
                                    <table className="w-full text-sm">
                                        <thead>
                                            <tr className="border-b">
                                                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Type</th>
                                                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Recipient</th>
                                                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Status</th>
                                                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Time</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {analytics.recentSends.map((send, i) => (
                                                <tr key={i} className="border-b last:border-0">
                                                    <td className="px-4 py-3 font-medium">{send.email_type}</td>
                                                    <td className="px-4 py-3 text-muted-foreground">{send.recipient}</td>
                                                    <td className="px-4 py-3">
                                                        <Badge variant={send.status === 'sent' ? 'success' : 'destructive'}>
                                                            {send.status}
                                                        </Badge>
                                                    </td>
                                                    <td className="px-4 py-3 text-muted-foreground">
                                                        {new Date(send.created_at).toLocaleString()}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </Card>
                        </div>
                    )}

                    {/* Empty state */}
                    {(!analytics || (!analytics.recentSends?.length && !Object.keys(analytics.triggers || {}).length)) && (
                        <Card>
                            <CardContent className="py-12 text-center">
                                <BarChart3 className="h-12 w-12 text-muted-foreground/30 mx-auto mb-3" />
                                <p className="text-muted-foreground">No analytics data yet</p>
                                <p className="text-sm text-muted-foreground/70">Send campaigns or enable triggers to see analytics</p>
                            </CardContent>
                        </Card>
                    )}
                </div>
            )}
        </div>
    );
}
