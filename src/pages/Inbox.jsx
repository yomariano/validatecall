import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { emailApi } from '@/services/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Mail,
    MailOpen,
    Reply,
    Loader2,
    AlertCircle,
    User,
    Calendar,
    ArrowLeft,
    Send,
    Paperclip,
    RefreshCw
} from 'lucide-react';
import { cn } from '@/lib/utils';

function Inbox() {
    const { user } = useAuth();
    const [responses, setResponses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedEmail, setSelectedEmail] = useState(null);
    const [filter, setFilter] = useState('all');
    const [replyMode, setReplyMode] = useState(false);
    const [replyContent, setReplyContent] = useState('');
    const [sending, setSending] = useState(false);

    useEffect(() => {
        loadResponses();
    }, [filter]);

    const loadResponses = async () => {
        try {
            setLoading(true);
            setError(null);
            const data = await emailApi.getResponses(filter);
            setResponses(data.responses || []);
        } catch (err) {
            console.error('Failed to load email responses:', err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleSelectEmail = async (email) => {
        setSelectedEmail(email);
        setReplyMode(false);
        setReplyContent('');

        // Mark as read if unread
        if (email.status === 'unread') {
            try {
                await emailApi.markAsRead(email.id);
                setResponses(prev =>
                    prev.map(e => e.id === email.id ? { ...e, status: 'read' } : e)
                );
            } catch (err) {
                console.error('Failed to mark as read:', err);
            }
        }
    };

    const handleSendReply = async () => {
        if (!replyContent.trim() || !selectedEmail) return;

        try {
            setSending(true);
            await emailApi.replyToEmail({
                responseId: selectedEmail.id,
                subject: `Re: ${selectedEmail.subject}`,
                body: replyContent,
                senderName: user?.user_metadata?.full_name || 'Support',
                senderEmail: null, // Will use default or user's verified domain
            });

            // Update local state
            setResponses(prev =>
                prev.map(e => e.id === selectedEmail.id ? { ...e, status: 'replied' } : e)
            );
            setSelectedEmail(prev => ({ ...prev, status: 'replied' }));
            setReplyMode(false);
            setReplyContent('');
        } catch (err) {
            console.error('Failed to send reply:', err);
            alert('Failed to send reply: ' + err.message);
        } finally {
            setSending(false);
        }
    };

    const formatDate = (dateStr) => {
        const date = new Date(dateStr);
        const now = new Date();
        const diff = now - date;
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));

        if (days === 0) {
            return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        } else if (days === 1) {
            return 'Yesterday';
        } else if (days < 7) {
            return date.toLocaleDateString([], { weekday: 'short' });
        } else {
            return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
        }
    };

    const getStatusBadge = (status) => {
        switch (status) {
            case 'unread':
                return <Badge variant="default" className="bg-blue-500">New</Badge>;
            case 'read':
                return <Badge variant="secondary">Read</Badge>;
            case 'replied':
                return <Badge variant="success">Replied</Badge>;
            default:
                return null;
        }
    };

    const unreadCount = responses.filter(r => r.status === 'unread').length;

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-bold text-foreground flex items-center gap-3">
                        <Mail className="h-7 w-7 sm:h-8 sm:w-8 text-primary" />
                        Email Inbox
                        {unreadCount > 0 && (
                            <Badge variant="default" className="ml-2">{unreadCount} new</Badge>
                        )}
                    </h1>
                    <p className="text-muted-foreground mt-1">
                        View and reply to email responses from your leads
                    </p>
                </div>
                <Button onClick={loadResponses} variant="outline" size="sm">
                    <RefreshCw className={cn("h-4 w-4 mr-2", loading && "animate-spin")} />
                    Refresh
                </Button>
            </div>

            {/* Filter Tabs */}
            <div className="flex gap-2 overflow-x-auto pb-2">
                {[
                    { value: 'all', label: 'All' },
                    { value: 'unread', label: 'Unread' },
                    { value: 'read', label: 'Read' },
                    { value: 'replied', label: 'Replied' },
                ].map(tab => (
                    <Button
                        key={tab.value}
                        variant={filter === tab.value ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setFilter(tab.value)}
                        className="shrink-0"
                    >
                        {tab.label}
                    </Button>
                ))}
            </div>

            {/* Main Content */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Email List */}
                <Card className="lg:col-span-1 overflow-hidden">
                    <CardHeader className="py-3 px-4 border-b">
                        <CardTitle className="text-sm font-medium">
                            Messages ({responses.length})
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-0 max-h-[600px] overflow-y-auto">
                        {loading ? (
                            <div className="flex items-center justify-center py-12">
                                <Loader2 className="h-6 w-6 animate-spin text-primary" />
                            </div>
                        ) : error ? (
                            <div className="flex flex-col items-center justify-center py-12 text-destructive">
                                <AlertCircle className="h-8 w-8 mb-2" />
                                <p className="text-sm">{error}</p>
                            </div>
                        ) : responses.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                                <Mail className="h-12 w-12 mb-3 opacity-50" />
                                <p className="text-sm font-medium">No emails yet</p>
                                <p className="text-xs mt-1">Responses to your cold emails will appear here</p>
                            </div>
                        ) : (
                            <div className="divide-y divide-border">
                                {responses.map(email => (
                                    <button
                                        key={email.id}
                                        onClick={() => handleSelectEmail(email)}
                                        className={cn(
                                            "w-full text-left p-4 hover:bg-secondary/50 transition-colors",
                                            selectedEmail?.id === email.id && "bg-secondary",
                                            email.status === 'unread' && "bg-primary/5"
                                        )}
                                    >
                                        <div className="flex items-start gap-3">
                                            <div className={cn(
                                                "h-8 w-8 rounded-full flex items-center justify-center shrink-0",
                                                email.status === 'unread' ? "bg-primary/10" : "bg-secondary"
                                            )}>
                                                {email.status === 'unread' ? (
                                                    <Mail className="h-4 w-4 text-primary" />
                                                ) : (
                                                    <MailOpen className="h-4 w-4 text-muted-foreground" />
                                                )}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center justify-between gap-2">
                                                    <span className={cn(
                                                        "text-sm truncate",
                                                        email.status === 'unread' ? "font-semibold text-foreground" : "text-foreground"
                                                    )}>
                                                        {email.from_name || email.from_email}
                                                    </span>
                                                    <span className="text-xs text-muted-foreground shrink-0">
                                                        {formatDate(email.received_at)}
                                                    </span>
                                                </div>
                                                <p className={cn(
                                                    "text-xs truncate mt-0.5",
                                                    email.status === 'unread' ? "font-medium text-foreground" : "text-muted-foreground"
                                                )}>
                                                    {email.subject || '(No subject)'}
                                                </p>
                                                <p className="text-xs text-muted-foreground truncate mt-1">
                                                    {email.body_text?.substring(0, 60) || '...'}
                                                </p>
                                                <div className="mt-2">
                                                    {getStatusBadge(email.status)}
                                                </div>
                                            </div>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Email Detail / Reply */}
                <Card className="lg:col-span-2">
                    {selectedEmail ? (
                        <>
                            <CardHeader className="border-b">
                                <div className="flex items-start justify-between gap-4">
                                    <div className="min-w-0">
                                        <div className="flex items-center gap-2 mb-2">
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="lg:hidden -ml-2"
                                                onClick={() => setSelectedEmail(null)}
                                            >
                                                <ArrowLeft className="h-4 w-4" />
                                            </Button>
                                            {getStatusBadge(selectedEmail.status)}
                                        </div>
                                        <CardTitle className="text-lg">
                                            {selectedEmail.subject || '(No subject)'}
                                        </CardTitle>
                                        <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                                            <div className="flex items-center gap-1">
                                                <User className="h-4 w-4" />
                                                <span>{selectedEmail.from_name || selectedEmail.from_email}</span>
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <Calendar className="h-4 w-4" />
                                                <span>{new Date(selectedEmail.received_at).toLocaleString()}</span>
                                            </div>
                                        </div>
                                        {selectedEmail.lead && (
                                            <div className="mt-2">
                                                <Badge variant="outline">
                                                    Lead: {selectedEmail.lead.name}
                                                </Badge>
                                            </div>
                                        )}
                                    </div>
                                    {!replyMode && selectedEmail.status !== 'replied' && (
                                        <Button onClick={() => setReplyMode(true)}>
                                            <Reply className="h-4 w-4 mr-2" />
                                            Reply
                                        </Button>
                                    )}
                                </div>
                            </CardHeader>
                            <CardContent className="p-6">
                                {/* Email Body */}
                                <div className="prose prose-sm dark:prose-invert max-w-none">
                                    {selectedEmail.body_html ? (
                                        <div dangerouslySetInnerHTML={{ __html: selectedEmail.body_html }} />
                                    ) : (
                                        <pre className="whitespace-pre-wrap font-sans text-sm">
                                            {selectedEmail.body_text || 'No content'}
                                        </pre>
                                    )}
                                </div>

                                {/* Attachments */}
                                {selectedEmail.attachments?.length > 0 && (
                                    <div className="mt-6 pt-4 border-t">
                                        <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
                                            <Paperclip className="h-4 w-4" />
                                            Attachments ({selectedEmail.attachments.length})
                                        </h4>
                                        <div className="flex flex-wrap gap-2">
                                            {selectedEmail.attachments.map((att, idx) => (
                                                <Badge key={idx} variant="outline" className="py-1.5">
                                                    {att.filename || `Attachment ${idx + 1}`}
                                                </Badge>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Reply Form */}
                                {replyMode && (
                                    <div className="mt-6 pt-4 border-t">
                                        <h4 className="text-sm font-medium mb-3">Reply</h4>
                                        <textarea
                                            value={replyContent}
                                            onChange={(e) => setReplyContent(e.target.value)}
                                            placeholder="Type your reply..."
                                            className="w-full h-40 p-3 rounded-lg border border-border bg-background text-foreground resize-none focus:outline-none focus:ring-2 focus:ring-primary"
                                        />
                                        <div className="flex justify-end gap-2 mt-3">
                                            <Button
                                                variant="outline"
                                                onClick={() => {
                                                    setReplyMode(false);
                                                    setReplyContent('');
                                                }}
                                                disabled={sending}
                                            >
                                                Cancel
                                            </Button>
                                            <Button
                                                onClick={handleSendReply}
                                                disabled={!replyContent.trim() || sending}
                                            >
                                                {sending ? (
                                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                                ) : (
                                                    <Send className="h-4 w-4 mr-2" />
                                                )}
                                                Send Reply
                                            </Button>
                                        </div>
                                    </div>
                                )}
                            </CardContent>
                        </>
                    ) : (
                        <CardContent className="flex flex-col items-center justify-center py-24 text-muted-foreground">
                            <Mail className="h-16 w-16 mb-4 opacity-30" />
                            <p className="text-lg font-medium">Select an email</p>
                            <p className="text-sm mt-1">Choose an email from the list to view its contents</p>
                        </CardContent>
                    )}
                </Card>
            </div>
        </div>
    );
}

export default Inbox;
