import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { domainsApi, settingsApi } from '../services/api';
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
  Key,
  Eye,
  EyeOff,
  Shield,
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

  // Resend API Key state
  const [resendApiKey, setResendApiKey] = useState('');
  const [resendKeyStatus, setResendKeyStatus] = useState(null);
  const [isLoadingResendKey, setIsLoadingResendKey] = useState(false);
  const [isSavingResendKey, setIsSavingResendKey] = useState(false);
  const [showApiKey, setShowApiKey] = useState(false);
  const [resendDomains, setResendDomains] = useState([]);

  useEffect(() => {
    if (user?.id) {
      loadDomains();
      loadResendKeyStatus();
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

  const loadResendKeyStatus = async () => {
    setIsLoadingResendKey(true);
    try {
      const result = await settingsApi.getResendStatus(user.id);
      if (result.success) {
        setResendKeyStatus(result);
        // If user has a verified key, load their domains
        if (result.hasApiKey && result.verified) {
          loadResendDomains();
        }
      }
    } catch (err) {
      console.error('Failed to load Resend key status:', err);
    } finally {
      setIsLoadingResendKey(false);
    }
  };

  const loadResendDomains = async () => {
    try {
      const result = await settingsApi.getResendDomains(user.id);
      if (result.success) {
        setResendDomains(result.domains || []);
      }
    } catch (err) {
      console.error('Failed to load Resend domains:', err);
    }
  };

  const handleSaveResendKey = async (e) => {
    e.preventDefault();
    if (!resendApiKey.trim()) return;

    setIsSavingResendKey(true);
    setError('');
    setSuccess('');

    try {
      const result = await settingsApi.saveResendApiKey(user.id, resendApiKey.trim());
      if (result.success) {
        setSuccess(result.message || 'Resend API key saved successfully!');
        setResendApiKey('');
        await loadResendKeyStatus();
      } else {
        setError(result.error || 'Failed to save API key');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSavingResendKey(false);
    }
  };

  const handleVerifyResendKey = async () => {
    setIsSavingResendKey(true);
    setError('');
    setSuccess('');

    try {
      const result = await settingsApi.verifyResendApiKey(user.id);
      if (result.success) {
        setSuccess(result.message || 'API key verified!');
        setResendDomains(result.domains || []);
        await loadResendKeyStatus();
      } else {
        setError(result.error || 'Failed to verify API key');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSavingResendKey(false);
    }
  };

  const handleDeleteResendKey = async () => {
    if (!confirm('Are you sure you want to remove your Resend API key? You will need to use the platform domains instead.')) {
      return;
    }

    setError('');
    setSuccess('');

    try {
      const result = await settingsApi.deleteResendApiKey(user.id);
      if (result.success) {
        setSuccess('Resend API key removed.');
        setResendKeyStatus(null);
        setResendDomains([]);
      } else {
        setError(result.error || 'Failed to remove API key');
      }
    } catch (err) {
      setError(err.message);
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
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight bg-gradient-to-r from-foreground to-muted-foreground bg-clip-text text-transparent">
          Settings
        </h1>
        <p className="text-sm sm:text-base text-muted-foreground">
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

      {/* Resend API Key Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Key className="h-5 w-5 text-primary" />
            Resend API Key
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Connect your own Resend account to send cold emails from your verified domains
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Current Status */}
          {isLoadingResendKey ? (
            <LoadingState message="Loading API key status..." />
          ) : resendKeyStatus?.hasApiKey ? (
            <div className="space-y-4">
              {/* API Key Status Card */}
              <div className={cn(
                "border rounded-lg p-4",
                resendKeyStatus.verified
                  ? "border-green-200 bg-green-50/50 dark:border-green-900/50 dark:bg-green-950/20"
                  : "border-amber-200 bg-amber-50/50 dark:border-amber-900/50 dark:bg-amber-950/20"
              )}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      "p-2 rounded-lg",
                      resendKeyStatus.verified ? "bg-green-100 dark:bg-green-900/50" : "bg-amber-100 dark:bg-amber-900/50"
                    )}>
                      <Shield className={cn(
                        "h-5 w-5",
                        resendKeyStatus.verified ? "text-green-600" : "text-amber-600"
                      )} />
                    </div>
                    <div>
                      <h3 className="font-medium">API Key Connected</h3>
                      <p className="text-sm text-muted-foreground font-mono">
                        {resendKeyStatus.maskedKey}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {resendKeyStatus.verified ? (
                      <Badge variant="success" className="gap-1">
                        <CheckCircle className="h-3 w-3" />
                        Verified
                      </Badge>
                    ) : (
                      <Badge variant="warning" className="gap-1">
                        <AlertTriangle className="h-3 w-3" />
                        Not Verified
                      </Badge>
                    )}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleVerifyResendKey}
                      disabled={isSavingResendKey}
                    >
                      {isSavingResendKey ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <RefreshCw className="h-4 w-4" />
                      )}
                      Verify
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleDeleteResendKey}
                      className="text-destructive hover:text-destructive hover:bg-destructive/10"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {/* Show verified domains from user's Resend account */}
                {resendKeyStatus.verified && resendDomains.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-green-200 dark:border-green-800">
                    <p className="text-sm font-medium mb-2">Your Verified Domains:</p>
                    <div className="flex flex-wrap gap-2">
                      {resendDomains
                        .filter(d => d.status === 'verified')
                        .map(domain => (
                          <Badge key={domain.id} variant="secondary" className="gap-1">
                            <CheckCircle className="h-3 w-3 text-green-600" />
                            {domain.name}
                          </Badge>
                        ))}
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">
                      You can send cold emails from any address on these domains
                    </p>
                  </div>
                )}
              </div>

              {/* Option to update key */}
              <div className="text-sm text-muted-foreground">
                <p>Want to use a different API key? Enter it below to replace the current one.</p>
              </div>
            </div>
          ) : (
            <div className="p-4 bg-muted/50 rounded-lg">
              <div className="flex items-start gap-3">
                <Key className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div className="text-sm">
                  <p className="font-medium">No API key configured</p>
                  <p className="text-muted-foreground mt-1">
                    Add your Resend API key to send cold emails from domains verified in your own Resend account.
                    This allows you to use your existing domain setup without re-verifying here.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Add/Update API Key Form */}
          <form onSubmit={handleSaveResendKey} className="space-y-3">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="flex-1 relative">
                <Input
                  type={showApiKey ? 'text' : 'password'}
                  value={resendApiKey}
                  onChange={(e) => setResendApiKey(e.target.value)}
                  placeholder="re_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                  disabled={isSavingResendKey}
                  className="pr-10 font-mono"
                />
                <button
                  type="button"
                  onClick={() => setShowApiKey(!showApiKey)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showApiKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              <Button type="submit" disabled={isSavingResendKey || !resendApiKey.trim()} className="w-full sm:w-auto">
                {isSavingResendKey ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Key className="h-4 w-4" />
                    {resendKeyStatus?.hasApiKey ? 'Update Key' : 'Save Key'}
                  </>
                )}
              </Button>
            </div>
          </form>

          {/* Help text */}
          <div className="text-sm text-muted-foreground bg-muted/50 p-4 rounded-lg">
            <p className="font-medium mb-2">How to get your Resend API key:</p>
            <ol className="list-decimal list-inside space-y-1">
              <li>Go to <a href="https://resend.com/api-keys" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">resend.com/api-keys</a></li>
              <li>Click "Create API Key"</li>
              <li>Give it a name (e.g., "ValidateCall") and copy the key</li>
              <li>Paste it above and click Save</li>
            </ol>
            <p className="mt-3 text-xs">
              Your API key is stored securely and only used to send emails on your behalf.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Email Domains Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5 text-primary" />
            Email Domains
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            {resendKeyStatus?.hasApiKey && resendKeyStatus?.verified
              ? 'Your domains are managed in your Resend account. You can still add domains here if needed.'
              : 'Verify your domain to send cold emails from your own email address'}
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Add Domain Form */}
          <form onSubmit={handleAddDomain} className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1">
              <Input
                value={newDomain}
                onChange={(e) => setNewDomain(e.target.value)}
                placeholder="Enter your domain (e.g., yourcompany.com)"
                disabled={isAdding}
              />
            </div>
            <Button type="submit" disabled={isAdding || !newDomain.trim()} className="w-full sm:w-auto">
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
