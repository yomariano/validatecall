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
  Palette,
  Image,
  Building2,
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

  // Email Provider state
  const [activeProvider, setActiveProvider] = useState(null); // 'resend' or 'sendgrid'
  const [emailProviderSettings, setEmailProviderSettings] = useState(null);
  const [isLoadingProviders, setIsLoadingProviders] = useState(false);

  // Resend API Key state
  const [resendApiKey, setResendApiKey] = useState('');
  const [resendKeyStatus, setResendKeyStatus] = useState(null);
  const [isLoadingResendKey, setIsLoadingResendKey] = useState(false);
  const [isSavingResendKey, setIsSavingResendKey] = useState(false);
  const [showResendApiKey, setShowResendApiKey] = useState(false);
  const [resendDomains, setResendDomains] = useState([]);

  // SendGrid API Key state
  const [sendgridApiKey, setSendgridApiKey] = useState('');
  const [sendgridKeyStatus, setSendgridKeyStatus] = useState(null);
  const [isLoadingSendgridKey, setIsLoadingSendgridKey] = useState(false);
  const [isSavingSendgridKey, setIsSavingSendgridKey] = useState(false);
  const [showSendgridApiKey, setShowSendgridApiKey] = useState(false);
  const [sendgridSenders, setSendgridSenders] = useState([]);

  // Brand settings state
  const [brandLogoUrl, setBrandLogoUrl] = useState('');
  const [brandColor, setBrandColor] = useState('#6366f1');
  const [brandName, setBrandName] = useState('');
  const [isLoadingBrand, setIsLoadingBrand] = useState(false);
  const [isSavingBrand, setIsSavingBrand] = useState(false);

  useEffect(() => {
    if (user?.id) {
      loadDomains();
      loadEmailProviderSettings();
      loadBrandSettings();
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

  const loadEmailProviderSettings = async () => {
    setIsLoadingProviders(true);
    try {
      const result = await settingsApi.getEmailProviderSettings(user.id);
      if (result.success) {
        setEmailProviderSettings(result);
        setActiveProvider(result.provider);
        setResendKeyStatus(result.resend);
        setSendgridKeyStatus(result.sendgrid);

        // Load domains/senders for verified providers
        if (result.resend?.hasApiKey && result.resend?.verified) {
          loadResendDomains();
        }
        if (result.sendgrid?.hasApiKey && result.sendgrid?.verified) {
          loadSendgridSenders();
        }
      }
    } catch (err) {
      console.error('Failed to load email provider settings:', err);
    } finally {
      setIsLoadingProviders(false);
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

  const loadSendgridSenders = async () => {
    try {
      const result = await settingsApi.getSendGridSenders(user.id);
      if (result.success) {
        setSendgridSenders(result.senders || []);
      }
    } catch (err) {
      console.error('Failed to load SendGrid senders:', err);
    }
  };

  const loadBrandSettings = async () => {
    setIsLoadingBrand(true);
    try {
      const result = await settingsApi.getBrandSettings(user.id);
      if (result.success) {
        setBrandLogoUrl(result.brandLogoUrl || '');
        setBrandColor(result.brandColor || '#6366f1');
        setBrandName(result.brandName || '');
      }
    } catch (err) {
      console.error('Failed to load brand settings:', err);
    } finally {
      setIsLoadingBrand(false);
    }
  };

  const handleSaveBrandSettings = async (e) => {
    e.preventDefault();
    setIsSavingBrand(true);
    setError('');
    setSuccess('');

    try {
      const result = await settingsApi.saveBrandSettings(user.id, {
        brandLogoUrl: brandLogoUrl.trim() || null,
        brandColor: brandColor || null,
        brandName: brandName.trim() || null,
      });
      if (result.success) {
        setSuccess('Brand settings saved successfully!');
      } else {
        setError(result.error || 'Failed to save brand settings');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSavingBrand(false);
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
        await loadEmailProviderSettings();
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
        await loadEmailProviderSettings();
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
    if (!confirm('Are you sure you want to remove your Resend API key?')) {
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
        await loadEmailProviderSettings();
      } else {
        setError(result.error || 'Failed to remove API key');
      }
    } catch (err) {
      setError(err.message);
    }
  };

  // SendGrid handlers
  const handleSaveSendgridKey = async (e) => {
    e.preventDefault();
    if (!sendgridApiKey.trim()) return;

    setIsSavingSendgridKey(true);
    setError('');
    setSuccess('');

    try {
      const result = await settingsApi.saveSendGridApiKey(user.id, sendgridApiKey.trim());
      if (result.success) {
        setSuccess(result.message || 'SendGrid API key saved successfully!');
        setSendgridApiKey('');
        await loadEmailProviderSettings();
      } else {
        setError(result.error || 'Failed to save API key');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSavingSendgridKey(false);
    }
  };

  const handleVerifySendgridKey = async () => {
    setIsSavingSendgridKey(true);
    setError('');
    setSuccess('');

    try {
      const result = await settingsApi.verifySendGridApiKey(user.id);
      if (result.success) {
        setSuccess(result.message || 'API key verified!');
        setSendgridSenders(result.senders || []);
        await loadEmailProviderSettings();
      } else {
        setError(result.error || 'Failed to verify API key');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSavingSendgridKey(false);
    }
  };

  const handleDeleteSendgridKey = async () => {
    if (!confirm('Are you sure you want to remove your SendGrid API key?')) {
      return;
    }

    setError('');
    setSuccess('');

    try {
      const result = await settingsApi.deleteSendGridApiKey(user.id);
      if (result.success) {
        setSuccess('SendGrid API key removed.');
        setSendgridKeyStatus(null);
        setSendgridSenders([]);
        await loadEmailProviderSettings();
      } else {
        setError(result.error || 'Failed to remove API key');
      }
    } catch (err) {
      setError(err.message);
    }
  };

  const handleSetActiveProvider = async (provider) => {
    try {
      const result = await settingsApi.setEmailProvider(user.id, provider);
      if (result.success) {
        setActiveProvider(provider);
        setSuccess(`Email provider set to ${provider === 'resend' ? 'Resend' : 'SendGrid'}`);
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

      {/* Email Providers Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5 text-primary" />
            Email Provider
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Connect your email provider to send cold emails from your own verified domains/senders
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          {isLoadingProviders ? (
            <LoadingState message="Loading provider settings..." />
          ) : (
            <>
              {/* Provider Tabs */}
              <div className="flex border-b">
                <button
                  onClick={() => setActiveProvider('resend')}
                  className={cn(
                    "px-4 py-2 text-sm font-medium border-b-2 transition-colors",
                    activeProvider === 'resend'
                      ? "border-primary text-primary"
                      : "border-transparent text-muted-foreground hover:text-foreground"
                  )}
                >
                  <div className="flex items-center gap-2">
                    Resend
                    {resendKeyStatus?.hasApiKey && resendKeyStatus?.verified && (
                      <CheckCircle className="h-3 w-3 text-green-600" />
                    )}
                  </div>
                </button>
                <button
                  onClick={() => setActiveProvider('sendgrid')}
                  className={cn(
                    "px-4 py-2 text-sm font-medium border-b-2 transition-colors",
                    activeProvider === 'sendgrid'
                      ? "border-primary text-primary"
                      : "border-transparent text-muted-foreground hover:text-foreground"
                  )}
                >
                  <div className="flex items-center gap-2">
                    SendGrid
                    {sendgridKeyStatus?.hasApiKey && sendgridKeyStatus?.verified && (
                      <CheckCircle className="h-3 w-3 text-green-600" />
                    )}
                  </div>
                </button>
              </div>

              {/* Active Provider Indicator */}
              {(resendKeyStatus?.hasApiKey || sendgridKeyStatus?.hasApiKey) && (
                <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                  <span className="text-sm">Active Provider:</span>
                  <div className="flex items-center gap-2">
                    <Badge variant={emailProviderSettings?.provider ? "default" : "secondary"}>
                      {emailProviderSettings?.provider === 'sendgrid' ? 'SendGrid' :
                       emailProviderSettings?.provider === 'resend' ? 'Resend' : 'None'}
                    </Badge>
                    {resendKeyStatus?.hasApiKey && sendgridKeyStatus?.hasApiKey && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleSetActiveProvider(
                          emailProviderSettings?.provider === 'resend' ? 'sendgrid' : 'resend'
                        )}
                      >
                        Switch to {emailProviderSettings?.provider === 'resend' ? 'SendGrid' : 'Resend'}
                      </Button>
                    )}
                  </div>
                </div>
              )}

              {/* Resend Tab Content */}
              {activeProvider === 'resend' && (
                <div className="space-y-4">
                  {resendKeyStatus?.hasApiKey ? (
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
                            <h3 className="font-medium">Resend Connected</h3>
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
                          <Button variant="outline" size="sm" onClick={handleVerifyResendKey} disabled={isSavingResendKey}>
                            {isSavingResendKey ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
                          </Button>
                          <Button variant="ghost" size="sm" onClick={handleDeleteResendKey} className="text-destructive hover:text-destructive hover:bg-destructive/10">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      {resendKeyStatus.verified && resendDomains.length > 0 && (
                        <div className="mt-4 pt-4 border-t border-green-200 dark:border-green-800">
                          <p className="text-sm font-medium mb-2">Verified Domains:</p>
                          <div className="flex flex-wrap gap-2">
                            {resendDomains.filter(d => d.status === 'verified').map(domain => (
                              <Badge key={domain.id} variant="secondary" className="gap-1">
                                <CheckCircle className="h-3 w-3 text-green-600" />
                                {domain.name}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="p-4 bg-muted/50 rounded-lg">
                      <div className="flex items-start gap-3">
                        <Key className="h-5 w-5 text-muted-foreground mt-0.5" />
                        <div className="text-sm">
                          <p className="font-medium">No Resend API key configured</p>
                          <p className="text-muted-foreground mt-1">
                            Add your Resend API key to send emails from your verified domains.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  <form onSubmit={handleSaveResendKey} className="space-y-3">
                    <div className="flex flex-col sm:flex-row gap-3">
                      <div className="flex-1 relative">
                        <Input
                          type={showResendApiKey ? 'text' : 'password'}
                          value={resendApiKey}
                          onChange={(e) => setResendApiKey(e.target.value)}
                          placeholder="re_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                          disabled={isSavingResendKey}
                          className="pr-10 font-mono"
                        />
                        <button type="button" onClick={() => setShowResendApiKey(!showResendApiKey)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                          {showResendApiKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                      <Button type="submit" disabled={isSavingResendKey || !resendApiKey.trim()}>
                        {isSavingResendKey ? <><Loader2 className="h-4 w-4 animate-spin" /> Saving...</> : <><Key className="h-4 w-4" /> {resendKeyStatus?.hasApiKey ? 'Update' : 'Save'}</>}
                      </Button>
                    </div>
                  </form>

                  <div className="text-sm text-muted-foreground bg-muted/50 p-4 rounded-lg">
                    <p className="font-medium mb-2">Get your Resend API key:</p>
                    <ol className="list-decimal list-inside space-y-1">
                      <li>Go to <a href="https://resend.com/api-keys" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">resend.com/api-keys</a></li>
                      <li>Create a new API key and paste it above</li>
                    </ol>
                  </div>
                </div>
              )}

              {/* SendGrid Tab Content */}
              {activeProvider === 'sendgrid' && (
                <div className="space-y-4">
                  {sendgridKeyStatus?.hasApiKey ? (
                    <div className={cn(
                      "border rounded-lg p-4",
                      sendgridKeyStatus.verified
                        ? "border-green-200 bg-green-50/50 dark:border-green-900/50 dark:bg-green-950/20"
                        : "border-amber-200 bg-amber-50/50 dark:border-amber-900/50 dark:bg-amber-950/20"
                    )}>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className={cn(
                            "p-2 rounded-lg",
                            sendgridKeyStatus.verified ? "bg-green-100 dark:bg-green-900/50" : "bg-amber-100 dark:bg-amber-900/50"
                          )}>
                            <Shield className={cn(
                              "h-5 w-5",
                              sendgridKeyStatus.verified ? "text-green-600" : "text-amber-600"
                            )} />
                          </div>
                          <div>
                            <h3 className="font-medium">SendGrid Connected</h3>
                            <p className="text-sm text-muted-foreground font-mono">
                              {sendgridKeyStatus.maskedKey}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {sendgridKeyStatus.verified ? (
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
                          <Button variant="outline" size="sm" onClick={handleVerifySendgridKey} disabled={isSavingSendgridKey}>
                            {isSavingSendgridKey ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
                          </Button>
                          <Button variant="ghost" size="sm" onClick={handleDeleteSendgridKey} className="text-destructive hover:text-destructive hover:bg-destructive/10">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      {sendgridKeyStatus.verified && sendgridSenders.length > 0 && (
                        <div className="mt-4 pt-4 border-t border-green-200 dark:border-green-800">
                          <p className="text-sm font-medium mb-2">Verified Senders:</p>
                          <div className="flex flex-wrap gap-2">
                            {sendgridSenders.filter(s => s.verified).map(sender => (
                              <Badge key={sender.id} variant="secondary" className="gap-1">
                                <CheckCircle className="h-3 w-3 text-green-600" />
                                {sender.email}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="p-4 bg-muted/50 rounded-lg">
                      <div className="flex items-start gap-3">
                        <Key className="h-5 w-5 text-muted-foreground mt-0.5" />
                        <div className="text-sm">
                          <p className="font-medium">No SendGrid API key configured</p>
                          <p className="text-muted-foreground mt-1">
                            Add your SendGrid API key to send emails from your verified senders.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  <form onSubmit={handleSaveSendgridKey} className="space-y-3">
                    <div className="flex flex-col sm:flex-row gap-3">
                      <div className="flex-1 relative">
                        <Input
                          type={showSendgridApiKey ? 'text' : 'password'}
                          value={sendgridApiKey}
                          onChange={(e) => setSendgridApiKey(e.target.value)}
                          placeholder="SG.xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                          disabled={isSavingSendgridKey}
                          className="pr-10 font-mono"
                        />
                        <button type="button" onClick={() => setShowSendgridApiKey(!showSendgridApiKey)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                          {showSendgridApiKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                      <Button type="submit" disabled={isSavingSendgridKey || !sendgridApiKey.trim()}>
                        {isSavingSendgridKey ? <><Loader2 className="h-4 w-4 animate-spin" /> Saving...</> : <><Key className="h-4 w-4" /> {sendgridKeyStatus?.hasApiKey ? 'Update' : 'Save'}</>}
                      </Button>
                    </div>
                  </form>

                  <div className="text-sm text-muted-foreground bg-muted/50 p-4 rounded-lg">
                    <p className="font-medium mb-2">Get your SendGrid API key:</p>
                    <ol className="list-decimal list-inside space-y-1">
                      <li>Go to <a href="https://app.sendgrid.com/settings/api_keys" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">sendgrid.com/api_keys</a></li>
                      <li>Create an API key with "Mail Send" permissions</li>
                      <li>Also verify a sender at <a href="https://app.sendgrid.com/settings/sender_auth/senders" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Sender Authentication</a></li>
                    </ol>
                  </div>
                </div>
              )}
            </>
          )}
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
            {(resendKeyStatus?.hasApiKey && resendKeyStatus?.verified) || (sendgridKeyStatus?.hasApiKey && sendgridKeyStatus?.verified)
              ? 'Your domains/senders are managed in your email provider account. You can still add domains here if needed.'
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

      {/* Brand Settings Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Palette className="h-5 w-5 text-primary" />
            Email Branding
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Customize your cold email appearance with your logo and brand colors
          </p>
        </CardHeader>
        <CardContent>
          {isLoadingBrand ? (
            <LoadingState message="Loading brand settings..." />
          ) : (
            <form onSubmit={handleSaveBrandSettings} className="space-y-6">
              {/* Brand Name */}
              <FormGroup>
                <label className="text-sm font-medium flex items-center gap-2">
                  <Building2 className="h-4 w-4" />
                  Company/Brand Name
                </label>
                <Input
                  value={brandName}
                  onChange={(e) => setBrandName(e.target.value)}
                  placeholder="Your Company Name"
                  disabled={isSavingBrand}
                />
                <p className="text-xs text-muted-foreground">
                  Displayed in the email header. If empty, we'll use your domain name.
                </p>
              </FormGroup>

              {/* Brand Color */}
              <FormGroup>
                <label className="text-sm font-medium flex items-center gap-2">
                  <Palette className="h-4 w-4" />
                  Brand Color
                </label>
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <input
                      type="color"
                      value={brandColor}
                      onChange={(e) => setBrandColor(e.target.value)}
                      className="w-12 h-10 rounded border border-border cursor-pointer"
                      disabled={isSavingBrand}
                    />
                  </div>
                  <Input
                    value={brandColor}
                    onChange={(e) => setBrandColor(e.target.value)}
                    placeholder="#6366f1"
                    className="font-mono w-32"
                    disabled={isSavingBrand}
                  />
                  <div
                    className="h-10 flex-1 rounded-lg"
                    style={{ background: `linear-gradient(135deg, ${brandColor} 0%, ${brandColor}dd 100%)` }}
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  Used for email header, links, and accents. Pick a color that matches your brand.
                </p>
              </FormGroup>

              {/* Logo URL */}
              <FormGroup>
                <label className="text-sm font-medium flex items-center gap-2">
                  <Image className="h-4 w-4" />
                  Logo URL
                </label>
                <Input
                  value={brandLogoUrl}
                  onChange={(e) => setBrandLogoUrl(e.target.value)}
                  placeholder="https://yoursite.com/logo.png"
                  disabled={isSavingBrand}
                />
                <p className="text-xs text-muted-foreground">
                  Direct link to your logo image. Recommended size: 200x50px, PNG or SVG with transparent background.
                </p>
                {brandLogoUrl && (
                  <div className="mt-3 p-4 bg-muted/50 rounded-lg">
                    <p className="text-xs text-muted-foreground mb-2">Preview:</p>
                    <div
                      className="p-4 rounded-lg text-center"
                      style={{ background: `linear-gradient(135deg, ${brandColor} 0%, ${brandColor}dd 100%)` }}
                    >
                      <img
                        src={brandLogoUrl}
                        alt="Logo preview"
                        className="max-h-12 max-w-[200px] mx-auto"
                        onError={(e) => {
                          e.target.style.display = 'none';
                        }}
                      />
                    </div>
                  </div>
                )}
              </FormGroup>

              {/* Email Preview */}
              <div className="border rounded-lg overflow-hidden">
                <div className="text-xs text-muted-foreground p-2 bg-muted/50 border-b">
                  Email Header Preview
                </div>
                <div
                  className="p-6 text-center"
                  style={{ background: `linear-gradient(135deg, ${brandColor} 0%, ${brandColor}dd 100%)` }}
                >
                  {brandLogoUrl ? (
                    <img
                      src={brandLogoUrl}
                      alt="Logo"
                      className="max-h-12 max-w-[200px] mx-auto mb-2"
                      onError={(e) => {
                        e.target.style.display = 'none';
                      }}
                    />
                  ) : (
                    <h2 className="text-xl font-semibold text-white">
                      {brandName || 'Your Company'}
                    </h2>
                  )}
                  <p className="text-white/80 text-sm">yourdomain.com</p>
                </div>
              </div>

              <Button type="submit" disabled={isSavingBrand} className="w-full sm:w-auto">
                {isSavingBrand ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Check className="h-4 w-4" />
                    Save Brand Settings
                  </>
                )}
              </Button>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default Settings;
