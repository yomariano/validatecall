import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { domainsApi } from '../services/api';
import {
  Settings as SettingsIcon,
  Globe,
  Plus,
  Trash2,
  RefreshCw,
  CheckCircle,
  Clock,
  XCircle,
  Copy,
  Check,
  AlertTriangle,
  Mail,
  Loader2,
  ExternalLink,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Input, FormGroup } from '@/components/ui/input';
import { EmptyState, LoadingState } from '@/components/ui/loading';
import { cn } from '@/lib/utils';

function Settings() {
  const { user } = useAuth();

  // Domain state
  const [domains, setDomains] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Add domain form
  const [newDomain, setNewDomain] = useState('');
  const [isAdding, setIsAdding] = useState(false);

  // Verification state
  const [verifyingId, setVerifyingId] = useState(null);

  // Expanded domain for DNS records
  const [expandedDomainId, setExpandedDomainId] = useState(null);

  // Copy state
  const [copiedField, setCopiedField] = useState(null);

  useEffect(() => {
    if (user?.id) {
      loadDomains();
    }
  }, [user?.id]);

  const loadDomains = async () => {
    setIsLoading(true);
    try {
      const result = await domainsApi.list(user.id);
      if (result.success) {
        setDomains(result.domains);
      } else {
        setError(result.error || 'Failed to load domains');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddDomain = async (e) => {
    e.preventDefault();
    if (!newDomain.trim()) return;

    setIsAdding(true);
    setError('');
    setSuccess('');

    try {
      const result = await domainsApi.create(user.id, newDomain.trim());
      if (result.success) {
        setSuccess(`Domain "${result.domain.domainName}" added! Add the DNS records below to verify.`);
        setNewDomain('');
        setExpandedDomainId(result.domain.id);
        await loadDomains();
      } else {
        setError(result.error || 'Failed to add domain');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setIsAdding(false);
    }
  };

  const handleVerifyDomain = async (domainId) => {
    setVerifyingId(domainId);
    setError('');
    setSuccess('');

    try {
      const result = await domainsApi.verify(user.id, domainId);
      if (result.success) {
        if (result.domain.status === 'verified') {
          setSuccess(`Domain "${result.domain.domainName}" is now verified! You can use it to send emails.`);
        } else {
          setError(`Domain not yet verified. Please make sure all DNS records are added correctly.`);
        }
        await loadDomains();
      } else {
        setError(result.error || 'Failed to verify domain');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setVerifyingId(null);
    }
  };

  const handleDeleteDomain = async (domainId, domainName) => {
    if (!confirm(`Are you sure you want to delete "${domainName}"? This cannot be undone.`)) {
      return;
    }

    setError('');
    setSuccess('');

    try {
      const result = await domainsApi.delete(user.id, domainId);
      if (result.success) {
        setSuccess(`Domain "${domainName}" deleted.`);
        await loadDomains();
      } else {
        setError(result.error || 'Failed to delete domain');
      }
    } catch (err) {
      setError(err.message);
    }
  };

  const copyToClipboard = async (text, fieldId) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(fieldId);
      setTimeout(() => setCopiedField(null), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'verified':
        return (
          <Badge variant="success" className="gap-1">
            <CheckCircle className="h-3 w-3" />
            Verified
          </Badge>
        );
      case 'pending':
        return (
          <Badge variant="warning" className="gap-1">
            <Clock className="h-3 w-3" />
            Pending
          </Badge>
        );
      case 'failed':
        return (
          <Badge variant="destructive" className="gap-1">
            <XCircle className="h-3 w-3" />
            Failed
          </Badge>
        );
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const renderDNSRecord = (record, index, domainId) => {
    const fieldId = `${domainId}-${index}`;
    const isCopied = copiedField === fieldId;

    return (
      <div
        key={index}
        className="p-3 border border-border rounded-md bg-secondary/30"
      >
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="font-mono">
              {record.type || record.record_type || 'TXT'}
            </Badge>
            {record.status === 'verified' ? (
              <CheckCircle className="h-4 w-4 text-green-600" />
            ) : (
              <Clock className="h-4 w-4 text-muted-foreground" />
            )}
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => copyToClipboard(record.value || record.data, fieldId)}
          >
            {isCopied ? (
              <>
                <Check className="h-4 w-4 text-green-600" />
                <span className="ml-1">Copied!</span>
              </>
            ) : (
              <>
                <Copy className="h-4 w-4" />
                <span className="ml-1">Copy</span>
              </>
            )}
          </Button>
        </div>
        <div className="space-y-1 text-sm">
          <div className="flex">
            <span className="w-16 text-muted-foreground shrink-0">Name:</span>
            <code className="font-mono text-foreground break-all">{record.name || record.host || '@'}</code>
          </div>
          <div className="flex">
            <span className="w-16 text-muted-foreground shrink-0">Value:</span>
            <code className="font-mono text-foreground break-all">{record.value || record.data}</code>
          </div>
          {record.priority && (
            <div className="flex">
              <span className="w-16 text-muted-foreground shrink-0">Priority:</span>
              <code className="font-mono text-foreground">{record.priority}</code>
            </div>
          )}
        </div>
      </div>
    );
  };

  const dnsNoticeVariants = [
    {
      key: 'clean-blue',
      label: 'Clean Notice',
      className:
        'mb-4 rounded-xl border border-blue-200/70 bg-blue-50/50 p-4 dark:border-blue-800/60 dark:bg-blue-950/20',
    },
    {
      key: 'neutral-paper',
      label: 'Neutral Paper',
      className: 'mb-4 rounded-xl border border-border bg-card/70 p-4 shadow-sm',
    },
    {
      key: 'subtle-stripe',
      label: 'Subtle Stripe',
      className:
        'mb-4 rounded-xl border border-slate-200 bg-white/70 p-4 shadow-sm dark:border-slate-800 dark:bg-slate-950/30 border-l-4 border-l-slate-300 dark:border-l-slate-600',
    },
    {
      key: 'glass-light',
      label: 'Glass Light',
      className:
        'mb-4 rounded-xl border border-white/30 bg-white/40 p-4 backdrop-blur-md shadow-sm dark:border-white/10 dark:bg-white/5',
    },
    {
      key: 'warm-neutral',
      label: 'Warm Neutral',
      className:
        'mb-4 rounded-xl border border-amber-200/60 bg-amber-50/40 p-4 dark:border-amber-800/50 dark:bg-amber-950/10',
    },
  ];
  const showAllDnsNoticeVariants = false;

  return (
    <div className="space-y-8 animate-slide-up">
      {/* Page Header */}
      <div className="space-y-1">
        <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-foreground to-muted-foreground bg-clip-text text-transparent">
          Settings
        </h1>
        <p className="text-muted-foreground">
          Manage your account settings and integrations
        </p>
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

      {/* Email Domains Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5 text-primary" />
            Email Domains
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Verify your domain to send cold emails from your own email address
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Add Domain Form */}
          <form onSubmit={handleAddDomain} className="flex gap-3">
            <div className="flex-1">
              <Input
                value={newDomain}
                onChange={(e) => setNewDomain(e.target.value)}
                placeholder="Enter your domain (e.g., yourcompany.com)"
                disabled={isAdding}
              />
            </div>
            <Button type="submit" disabled={isAdding || !newDomain.trim()}>
              {isAdding ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Adding...
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4" />
                  Add Domain
                </>
              )}
            </Button>
          </form>

          {/* Domains List */}
          {isLoading ? (
            <LoadingState message="Loading domains..." />
          ) : domains.length === 0 ? (
            <EmptyState
              icon={Globe}
              title="No domains added"
              description="Add your first domain to start sending emails from your own address"
              className="py-8"
            />
          ) : (
            <div className="space-y-4">
              {domains.map((domain) => (
                <div
                  key={domain.id}
                  className={cn(
                    "border rounded-lg transition-all",
                    domain.status === 'verified'
                      ? "border-green-200 bg-green-50/50 dark:border-green-900/50 dark:bg-green-950/20"
                      : "border-border"
                  )}
                >
                  {/* Domain Header */}
                  <div className="p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-primary/10">
                        <Mail className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-medium">{domain.domainName}</h3>
                        <p className="text-xs text-muted-foreground">
                          Added {new Date(domain.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {getStatusBadge(domain.status)}

                      {domain.status !== 'verified' && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleVerifyDomain(domain.id)}
                          disabled={verifyingId === domain.id}
                        >
                          {verifyingId === domain.id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <RefreshCw className="h-4 w-4" />
                          )}
                          Check
                        </Button>
                      )}

                      {domain.status !== 'verified' && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() =>
                            setExpandedDomainId(
                              expandedDomainId === domain.id ? null : domain.id
                            )
                          }
                        >
                          {expandedDomainId === domain.id ? (
                            <ChevronUp className="h-4 w-4" />
                          ) : (
                            <ChevronDown className="h-4 w-4" />
                          )}
                        </Button>
                      )}

                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteDomain(domain.id, domain.domainName)}
                        className="text-destructive hover:text-destructive hover:bg-destructive/10"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  {/* DNS Records (Expanded) */}
                  {expandedDomainId === domain.id && domain.dnsRecords && domain.dnsRecords.length > 0 && (
                    <div className="px-4 pb-4 space-y-4">
                      <div className="border-t pt-4">
                        {(showAllDnsNoticeVariants ? dnsNoticeVariants : [dnsNoticeVariants[0]]).map(
                          (variant) => (
                            <div key={variant.key} className={variant.className}>
                              <div className="flex items-start gap-3">
                                <div className="mt-0.5 rounded-full bg-muted p-2 text-foreground">
                                  <AlertTriangle className="h-5 w-5" />
                                </div>
                                <div className="text-sm">
                                  <div className="flex items-center gap-2">
                                    <p className="text-base font-semibold text-foreground">
                                      Add these DNS records to your domain
                                    </p>
                                    {showAllDnsNoticeVariants && (
                                      <Badge variant="outline" className="text-[10px]">
                                        {variant.label}
                                      </Badge>
                                    )}
                                  </div>
                                  <p className="text-muted-foreground mt-1">
                                    Add the records at your registrar, then wait for DNS to propagate before checking
                                    verification.
                                  </p>
                                  <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                                    <span className="rounded-full border border-border bg-background/70 px-2 py-1">
                                      GoDaddy
                                    </span>
                                    <span className="rounded-full border border-border bg-background/70 px-2 py-1">
                                      Cloudflare
                                    </span>
                                    <span className="rounded-full border border-border bg-background/70 px-2 py-1">
                                      Namecheap
                                    </span>
                                    <span className="inline-flex items-center gap-1 rounded-full border border-border bg-background/70 px-2 py-1">
                                      <Clock className="h-3 w-3" />
                                      Up to 24h
                                    </span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          )
                        )}

                        <div className="grid gap-3">
                          {domain.dnsRecords.map((record, index) =>
                            renderDNSRecord(record, index, domain.id)
                          )}
                        </div>

                        <div className="mt-4 flex items-center justify-between text-sm">
                          <a
                            href="https://resend.com/docs/dashboard/domains/introduction"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-primary hover:underline flex items-center gap-1"
                          >
                            <ExternalLink className="h-3 w-3" />
                            Learn more about domain verification
                          </a>
                          <Button
                            variant="default"
                            size="sm"
                            onClick={() => handleVerifyDomain(domain.id)}
                            disabled={verifyingId === domain.id}
                          >
                            {verifyingId === domain.id ? (
                              <>
                                <Loader2 className="h-4 w-4 animate-spin" />
                                Checking...
                              </>
                            ) : (
                              <>
                                <RefreshCw className="h-4 w-4" />
                                Check Verification
                              </>
                            )}
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Verified domain info */}
                  {domain.status === 'verified' && (
                    <div className="px-4 pb-4">
                      <div className="p-3 bg-green-100 dark:bg-green-950/50 rounded-lg text-sm text-green-800 dark:text-green-300">
                        <CheckCircle className="h-4 w-4 inline mr-2" />
                        You can now send emails from any address @{domain.domainName}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Help text */}
          <div className="text-sm text-muted-foreground bg-muted/50 p-4 rounded-lg">
            <p className="font-medium mb-2">How domain verification works:</p>
            <ol className="list-decimal list-inside space-y-1">
              <li>Add your domain above</li>
              <li>Copy the DNS records and add them to your domain registrar</li>
              <li>Wait for DNS propagation (usually 5-30 minutes, up to 24 hours)</li>
              <li>Click "Check" to verify - once verified, you can send from any @yourdomain.com address</li>
            </ol>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default Settings;
