import { useState, useEffect, useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import { vapiApi, claudeApi, emailApi, domainsApi } from '../services/api';
import { getLeads, createCampaign, getCampaigns, saveCall } from '../services/supabase';
import { useAuth } from '../context/AuthContext';
import { useUsage } from '../context/UsageContext';
import { useOnboarding } from '../components/OnboardingWizard';
import PaywallModal from '../components/PaywallModal';
import HardPaywall from '../components/HardPaywall';
import LeadActionPanel from '../components/LeadActionPanel';
import { CampaignEvents } from '@/lib/analytics';
import {
  Megaphone,
  Phone,
  Users,
  Loader2,
  CheckSquare,
  Square,
  Clock,
  CheckCircle,
  XCircle,
  Play,
  FileText,
  Calendar,
  AlertTriangle,
  Filter,
  Search,
  MapPin,
  Mail,
  Globe,
  Star,
  ArrowLeft,
  Plus,
  Pencil,
  MoreHorizontal,
  Settings,
  Wand2,
  MessageSquare,
  Building2,
  ChevronDown,
  ChevronUp,
  Check
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input, Label, FormGroup, Select, Textarea } from '@/components/ui/input';
import { EmptyState, LoadingState } from '@/components/ui/loading';
import { cn } from '@/lib/utils';

function Campaigns() {
  const location = useLocation();
  const { user } = useAuth();
  const { completeStep } = useOnboarding();
  const {
    isFreeTier,
    callsUsed,
    callsLimit,
    leadsUsed,
    leadsLimit,
    canMakeCall,
    shouldShowSoftPaywall,
    shouldShowHardPaywall,
    refreshUsage
  } = useUsage();

  // Main state
  const [campaigns, setCampaigns] = useState([]);
  const [leads, setLeads] = useState([]);
  const [selectedLeadIds, setSelectedLeadIds] = useState(location.state?.selectedLeadIds || []);
  const [phoneStats, setPhoneStats] = useState(null);

  // View state: 'new' | 'active' | 'detail'
  const [activeTab, setActiveTab] = useState('new');
  const [viewingCampaign, setViewingCampaign] = useState(null);

  // Paywall state
  const [showPaywallModal, setShowPaywallModal] = useState(false);

  // Lead action panel state
  const [panelOpen, setPanelOpen] = useState(false);
  const [panelType, setPanelType] = useState(null); // 'call', 'email', 'edit'
  const [panelLead, setPanelLead] = useState(null);

  // Campaign-level settings state
  const [campaignSettingsOpen, setCampaignSettingsOpen] = useState(true);
  const [campaignCallPitch, setCampaignCallPitch] = useState('');
  const [campaignCompanyContext, setCampaignCompanyContext] = useState('');
  const [campaignEmailSubject, setCampaignEmailSubject] = useState('');
  const [campaignEmailBody, setCampaignEmailBody] = useState('');
  const [campaignSenderEmail, setCampaignSenderEmail] = useState('');
  const [campaignSenderName, setCampaignSenderName] = useState('');
  const [isGeneratingPitch, setIsGeneratingPitch] = useState(false);
  const [isGeneratingEmail, setIsGeneratingEmail] = useState(false);

  // Verified domains for email sender
  const [verifiedDomains, setVerifiedDomains] = useState([]);

  // Filters for lead selection
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [locationFilter, setLocationFilter] = useState('');
  const [searchName, setSearchName] = useState('');
  const [searchPhone, setSearchPhone] = useState('');
  const [searchCity, setSearchCity] = useState('');
  const [searchIndustry, setSearchIndustry] = useState('');

  // Lead table pagination (client-side)
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(50);

  // New campaign form - only name now
  const [campaignName, setCampaignName] = useState('');

  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isCalling, setIsCalling] = useState(false);
  const [callProgress, setCallProgress] = useState({ current: 0, total: 0, results: [] });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Active campaign for calling
  const [activeCampaign, setActiveCampaign] = useState(null);

  // Extract unique categories and locations from leads
  const categories = useMemo(() => {
    return [...new Set(leads.map(l => l.category).filter(Boolean))].sort();
  }, [leads]);

  const locations = useMemo(() => {
    return [...new Set(leads.map(l => l.city).filter(Boolean))].sort();
  }, [leads]);

  // Filter leads based on all criteria
  const filteredLeads = useMemo(() => {
    return leads.filter(lead => {
      // Status filter
      if (statusFilter !== 'all' && lead.status !== statusFilter) return false;

      // Category filter
      if (categoryFilter && lead.category !== categoryFilter) return false;

      // Location filter
      if (locationFilter && lead.city !== locationFilter) return false;

      // Search filters
      if (searchName && !lead.name?.toLowerCase().includes(searchName.toLowerCase())) return false;
      if (searchPhone && !lead.phone?.includes(searchPhone)) return false;
      if (searchCity && !lead.city?.toLowerCase().includes(searchCity.toLowerCase())) return false;
      if (searchIndustry && !lead.category?.toLowerCase().includes(searchIndustry.toLowerCase())) return false;

      return true;
    });
  }, [leads, statusFilter, categoryFilter, locationFilter, searchName, searchPhone, searchCity, searchIndustry]);

  const selectableLeads = filteredLeads.filter(lead => lead.phone && lead.phone.trim().length > 0);
  const totalPages = Math.max(1, Math.ceil(filteredLeads.length / pageSize));
  const safePage = Math.min(Math.max(1, page), totalPages);
  const pageStartIndex = (safePage - 1) * pageSize;
  const pageEndIndexExclusive = Math.min(pageStartIndex + pageSize, filteredLeads.length);
  const pagedLeads = filteredLeads.slice(pageStartIndex, pageEndIndexExclusive);

  // Stats for status tabs
  const stats = useMemo(() => ({
    total: leads.length,
    new: leads.filter(l => l.status === 'new' || !l.status).length,
    contacted: leads.filter(l => l.status === 'contacted').length,
    interested: leads.filter(l => l.status === 'interested').length,
  }), [leads]);

  useEffect(() => {
    loadData();
  }, [user]);

  // Reset paging when filters change
  useEffect(() => {
    setPage(1);
  }, [categoryFilter, locationFilter, statusFilter, searchName, searchPhone, searchCity, searchIndustry]);

  // Clamp page when lead count or page size changes
  useEffect(() => {
    if (page !== safePage) setPage(safePage);
  }, [page, safePage]);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [campaignsData, leadsData] = await Promise.all([
        getCampaigns(),
        getLeads({}),
      ]);
      setCampaigns(campaignsData);
      setLeads(leadsData);

      // Load verified domains for email sender
      if (user?.id) {
        try {
          const domainsResult = await domainsApi.getVerified(user.id);
          if (domainsResult.success) {
            setVerifiedDomains(domainsResult.domains);
          }
        } catch {
          // Silently fail - domains are optional
        }
      }

      // Load phone stats for multi-tenant mode
      const isLocalhost = window.location.hostname === 'localhost' ||
                          window.location.hostname === '127.0.0.1';
      if (user?.id && !isLocalhost) {
        try {
          const stats = await vapiApi.getUserPhoneStats(user.id);
          setPhoneStats(stats);
        } catch {
          setPhoneStats(null);
        }
      } else if (isLocalhost) {
        setPhoneStats({
          totalNumbers: 1,
          totalDailyCapacity: 999,
          remainingToday: 999,
          usedToday: 0
        });
      }

      if (location.state?.selectedLeadIds) {
        setSelectedLeadIds(location.state.selectedLeadIds);
      }
    } catch (err) {
      console.error('Error loading data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleSelectLead = (leadId) => {
    setSelectedLeadIds(prev =>
      prev.includes(leadId)
        ? prev.filter(id => id !== leadId)
        : [...prev, leadId]
    );
  };

  const selectAllVisible = () => {
    const visibleIds = selectableLeads.filter(l => pagedLeads.some(p => p.id === l.id)).map(l => l.id);
    const allSelected = visibleIds.length > 0 && visibleIds.every(id => selectedLeadIds.includes(id));
    if (allSelected) {
      setSelectedLeadIds(prev => prev.filter(id => !visibleIds.includes(id)));
    } else {
      setSelectedLeadIds(prev => [...new Set([...prev, ...visibleIds])]);
    }
  };

  const clearFilters = () => {
    setStatusFilter('all');
    setCategoryFilter('');
    setLocationFilter('');
    setSearchName('');
    setSearchPhone('');
    setSearchCity('');
    setSearchIndustry('');
  };

  // Save campaign
  const saveCampaign = async () => {
    setError('');
    setSuccess('');

    if (selectedLeadIds.length === 0) {
      setError('Please select at least one lead');
      return;
    }

    setIsSaving(true);

    try {
      const campaign = await createCampaign({
        name: campaignName || `Campaign ${new Date().toLocaleDateString()}`,
        productIdea: '', // No longer required
        companyContext: '',
        totalLeads: selectedLeadIds.length,
        leadIds: selectedLeadIds,
        selectedAgentId: null,
      });

      CampaignEvents.created(selectedLeadIds.length, false);
      setSuccess('Campaign saved successfully!');

      // Reset form
      setCampaignName('');
      setSelectedLeadIds([]);
      clearFilters();

      // Refresh and switch to active campaigns
      await loadData();
      setActiveTab('active');
    } catch (err) {
      setError(err.message || 'Failed to save campaign');
    } finally {
      setIsSaving(false);
    }
  };

  // View campaign details
  const viewCampaignDetails = (campaign) => {
    const campaignLeadIds = campaign.lead_ids || [];
    const campaignLeads = leads.filter(l => campaignLeadIds.includes(l.id));

    setViewingCampaign({
      ...campaign,
      leads: campaignLeads,
      callResults: [],
    });
    setActiveTab('detail');
  };

  // Start calling a campaign
  const startCampaign = (campaign) => {
    const campaignLeadIds = campaign.lead_ids || [];
    const campaignLeads = leads.filter(l => campaignLeadIds.includes(l.id));

    CampaignEvents.resumed(campaign.id);

    setActiveCampaign({
      ...campaign,
      leads: campaignLeads,
      callResults: [],
    });
    setViewingCampaign({
      ...campaign,
      leads: campaignLeads,
      callResults: [],
    });
    setActiveTab('detail');
  };

  // Call all leads in the active campaign
  const callAllLeads = async () => {
    if (!activeCampaign) return;

    const uncalledLeads = activeCampaign.leads.filter(
      lead => !activeCampaign.callResults.find(r => r.leadId === lead.id)
    );

    if (uncalledLeads.length === 0) {
      setError('All leads have already been called');
      return;
    }

    if (isFreeTier) {
      if (!canMakeCall()) {
        if (shouldShowHardPaywall('calls')) {
          return;
        }
        setError(`Free tier limit reached: You've used all ${callsLimit} calls.`);
        setShowPaywallModal(true);
        return;
      }
      if (shouldShowSoftPaywall('calls')) {
        setShowPaywallModal(true);
      }
    }

    setIsCalling(true);
    setCallProgress({ current: 0, total: uncalledLeads.length, results: [] });
    CampaignEvents.batchCallStarted(uncalledLeads.length);

    const results = [...activeCampaign.callResults];

    for (let i = 0; i < uncalledLeads.length; i++) {
      const lead = uncalledLeads[i];
      setCallProgress(prev => ({ ...prev, current: i + 1 }));

      const result = await makeCall(lead, activeCampaign);
      results.push(result);

      setActiveCampaign(prev => ({
        ...prev,
        callResults: [...results],
      }));

      setViewingCampaign(prev => prev ? ({
        ...prev,
        callResults: [...results],
      }) : null);

      setCallProgress(prev => ({ ...prev, results: [...results] }));

      if (i < uncalledLeads.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    }

    const successCount = results.filter(r => r.status === 'initiated').length;
    const failCount = results.filter(r => r.status === 'failed').length;

    CampaignEvents.completed(successCount, failCount);
    setSuccess(`${successCount} calls initiated, ${failCount} failed.`);
    if (successCount > 0) {
      completeStep(2);
      if (isFreeTier) {
        await refreshUsage();
      }
    }
    setIsCalling(false);
  };

  // Call a single lead
  const callOneLead = async (lead) => {
    if (!activeCampaign) return;

    if (activeCampaign.callResults.find(r => r.leadId === lead.id)) {
      setError('This lead has already been called');
      return;
    }

    if (isFreeTier) {
      if (!canMakeCall()) {
        if (shouldShowHardPaywall('calls')) {
          return;
        }
        setError(`Free tier limit reached: You've used all ${callsLimit} calls.`);
        setShowPaywallModal(true);
        return;
      }
      if (shouldShowSoftPaywall('calls')) {
        setShowPaywallModal(true);
      }
    }

    setIsCalling(true);
    setCallProgress({ current: 1, total: 1, results: [] });

    const result = await makeCall(lead, activeCampaign);
    CampaignEvents.singleCallMade(result.status);

    const newResults = [...activeCampaign.callResults, result];

    setActiveCampaign(prev => ({
      ...prev,
      callResults: newResults,
    }));

    setViewingCampaign(prev => prev ? ({
      ...prev,
      callResults: newResults,
    }) : null);

    if (result.status === 'initiated') {
      setSuccess(`Call initiated to ${lead.name}`);
      completeStep(2);
      if (isFreeTier) {
        await refreshUsage();
      }
    } else {
      setError(`Call failed: ${result.error}`);
    }

    setIsCalling(false);
  };

  // Helper function to make a single call
  const makeCall = async (lead, campaign) => {
    try {
      const phoneNumber = lead.phone.startsWith('+') ? lead.phone : `+${lead.phone}`;

      const callData = user?.id
        ? await vapiApi.initiateUserCall(user.id, {
            phoneNumber,
            customerName: lead.name,
            productIdea: campaign.product_idea || '',
            companyContext: campaign.company_context || '',
            assistantId: campaign.selected_agent_id || undefined,
          })
        : await vapiApi.initiateCall({
            phoneNumber,
            customerName: lead.name,
            productIdea: campaign.product_idea || '',
            companyContext: campaign.company_context || '',
            assistantId: campaign.selected_agent_id || undefined,
          });

      try {
        await saveCall({
          leadId: lead.id,
          campaignId: campaign.id,
          vapiCallId: callData.id,
          phoneNumber,
          customerName: lead.name,
          status: 'initiated',
        });
      } catch {
        // Database save failed, but call was initiated
      }

      return {
        leadId: lead.id,
        name: lead.name,
        phone: lead.phone,
        status: 'initiated',
        callId: callData.id,
      };
    } catch (err) {
      return {
        leadId: lead.id,
        name: lead.name,
        phone: lead.phone,
        status: 'failed',
        error: err.message,
      };
    }
  };

  const getStatusBadge = (status) => {
    const variants = {
      completed: 'success',
      running: 'warning',
      draft: 'secondary',
      initiated: 'success',
      failed: 'destructive',
    };
    return <Badge variant={variants[status] || 'info'}>{status}</Badge>;
  };

  // Open lead action panel
  const openPanel = (type, lead) => {
    setPanelType(type);
    setPanelLead(lead);
    setPanelOpen(true);
  };

  const closePanel = () => {
    setPanelOpen(false);
    setPanelType(null);
    setPanelLead(null);
  };

  // Generate campaign-level call pitch with AI
  const handleGenerateCampaignPitch = async () => {
    if (!campaignCompanyContext.trim()) {
      setError('Please describe your product/service first');
      return;
    }
    setIsGeneratingPitch(true);
    try {
      const result = await claudeApi.generate(campaignCompanyContext.trim(), 'product');
      setCampaignCallPitch(result.generated);
      setSuccess('Call pitch generated successfully!');
    } catch (err) {
      setError(`Failed to generate pitch: ${err.message}`);
    } finally {
      setIsGeneratingPitch(false);
    }
  };

  // Generate campaign-level email template with AI
  const handleGenerateCampaignEmail = async () => {
    if (!campaignCompanyContext.trim()) {
      setError('Please describe your product/service first');
      return;
    }
    setIsGeneratingEmail(true);
    try {
      // Use a generic lead placeholder for template generation
      const result = await emailApi.generateColdEmail({
        lead: {
          name: '[Business Name]',
          category: viewingCampaign?.leads?.[0]?.category || 'business',
          city: viewingCampaign?.leads?.[0]?.city || '',
        },
        productIdea: campaignCompanyContext.trim(),
        companyContext: campaignCallPitch.trim() || undefined,
        senderName: user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Your Name',
      });
      if (result.success && result.email) {
        setCampaignEmailSubject(result.email.subject);
        setCampaignEmailBody(result.email.body);
        setSuccess('Email template generated successfully!');
      } else {
        setError('Failed to generate email template');
      }
    } catch (err) {
      setError(`Failed to generate email: ${err.message}`);
    } finally {
      setIsGeneratingEmail(false);
    }
  };

  // Show hard paywall if free tier call limit exhausted
  if (isFreeTier && shouldShowHardPaywall('calls')) {
    return (
      <HardPaywall
        type="calls"
        leadsUsed={leadsUsed}
        leadsLimit={leadsLimit}
        callsUsed={callsUsed}
        callsLimit={callsLimit}
      />
    );
  }

  // Render campaign detail view
  const renderCampaignDetail = () => {
    if (!viewingCampaign) return null;

    const campaignLeads = viewingCampaign.leads || [];
    const callResults = viewingCampaign.callResults || [];

    return (
      <div className="space-y-6">
        {/* Back button */}
        <Button
          variant="ghost"
          onClick={() => {
            setViewingCampaign(null);
            setActiveCampaign(null);
            setActiveTab('active');
          }}
          className="mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Campaigns
        </Button>

        {/* Campaign Settings Section */}
        <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
          <CardHeader
            className="cursor-pointer"
            onClick={() => setCampaignSettingsOpen(!campaignSettingsOpen)}
          >
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Settings className="h-5 w-5 text-primary" />
                Campaign Templates
                <Badge variant="secondary" className="ml-2 text-xs">
                  Apply to all leads
                </Badge>
              </CardTitle>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                {campaignSettingsOpen ? (
                  <ChevronUp className="h-4 w-4" />
                ) : (
                  <ChevronDown className="h-4 w-4" />
                )}
              </Button>
            </div>
            {!campaignSettingsOpen && (campaignCallPitch || campaignEmailBody) && (
              <div className="flex gap-2 mt-2">
                {campaignCallPitch && (
                  <Badge variant="outline" className="text-xs gap-1">
                    <Check className="h-3 w-3 text-green-500" />
                    Call Pitch Set
                  </Badge>
                )}
                {campaignEmailBody && (
                  <Badge variant="outline" className="text-xs gap-1">
                    <Check className="h-3 w-3 text-green-500" />
                    Email Template Set
                  </Badge>
                )}
              </div>
            )}
          </CardHeader>

          {campaignSettingsOpen && (
            <CardContent className="space-y-6">
              {/* Product/Service Description */}
              <FormGroup label="Your Product / Service (used for all leads)">
                <div className="relative">
                  <Building2 className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Textarea
                    value={campaignCompanyContext}
                    onChange={(e) => setCampaignCompanyContext(e.target.value)}
                    placeholder="e.g., We're building an AI assistant that helps dentists automate appointment scheduling and patient follow-ups..."
                    rows={3}
                    className="pl-10"
                  />
                </div>
              </FormGroup>

              {/* Email Sender Settings */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 border border-blue-200/50 dark:border-blue-800/30 rounded-lg bg-blue-50/50 dark:bg-blue-950/20">
                <FormGroup label="Sender Name" hint="Name shown to recipients">
                  <Input
                    value={campaignSenderName}
                    onChange={(e) => setCampaignSenderName(e.target.value)}
                    placeholder="e.g., John from ABC Company"
                  />
                </FormGroup>
                <FormGroup label="Sender Email" hint={verifiedDomains.length > 0 ? "Select from verified domains" : "Verify a domain in Settings"}>
                  {verifiedDomains.length > 0 ? (
                    <div className="flex gap-2">
                      <Input
                        value={campaignSenderEmail.split('@')[0] || ''}
                        onChange={(e) => {
                          const username = e.target.value.replace(/[^a-zA-Z0-9._-]/g, '');
                          const domain = campaignSenderEmail.split('@')[1] || verifiedDomains[0]?.domainName || '';
                          setCampaignSenderEmail(username ? `${username}@${domain}` : '');
                        }}
                        placeholder="hello"
                        className="flex-1"
                      />
                      <div className="flex items-center text-muted-foreground">@</div>
                      <Select
                        value={campaignSenderEmail.split('@')[1] || verifiedDomains[0]?.domainName || ''}
                        onChange={(e) => {
                          const username = campaignSenderEmail.split('@')[0] || 'hello';
                          setCampaignSenderEmail(`${username}@${e.target.value}`);
                        }}
                        className="w-48"
                      >
                        {verifiedDomains.map((d) => (
                          <option key={d.id} value={d.domainName}>{d.domainName}</option>
                        ))}
                      </Select>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <div className="relative flex-1">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          value={campaignSenderEmail}
                          onChange={(e) => setCampaignSenderEmail(e.target.value)}
                          placeholder="Verify a domain first"
                          disabled
                          className="pl-10"
                        />
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => window.location.href = '/settings'}
                        className="shrink-0"
                      >
                        <Settings className="h-4 w-4 mr-1" />
                        Add Domain
                      </Button>
                    </div>
                  )}
                </FormGroup>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Call Pitch Section */}
                <div className="space-y-4 p-4 border border-border rounded-lg bg-card">
                  <div className="flex items-center justify-between">
                    <h3 className="font-medium flex items-center gap-2">
                      <Phone className="h-4 w-4 text-primary" />
                      Call Pitch Template
                    </h3>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleGenerateCampaignPitch}
                      disabled={isGeneratingPitch || !campaignCompanyContext.trim()}
                      className="gap-2"
                    >
                      {isGeneratingPitch ? (
                        <>
                          <Loader2 className="h-3 w-3 animate-spin" />
                          Generating...
                        </>
                      ) : (
                        <>
                          <Wand2 className="h-3 w-3" />
                          Generate Pitch
                        </>
                      )}
                    </Button>
                  </div>
                  <Textarea
                    value={campaignCallPitch}
                    onChange={(e) => setCampaignCallPitch(e.target.value)}
                    placeholder="AI-generated pitch will appear here, or write your own..."
                    rows={5}
                    className="text-sm"
                  />
                  {campaignCallPitch && (
                    <p className="text-xs text-muted-foreground">
                      This pitch will be used as the default for all call actions in this campaign.
                    </p>
                  )}
                </div>

                {/* Email Template Section */}
                <div className="space-y-4 p-4 border border-border rounded-lg bg-card">
                  <div className="flex items-center justify-between">
                    <h3 className="font-medium flex items-center gap-2">
                      <Mail className="h-4 w-4 text-blue-500" />
                      Email Template
                    </h3>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleGenerateCampaignEmail}
                      disabled={isGeneratingEmail || !campaignCompanyContext.trim()}
                      className="gap-2"
                    >
                      {isGeneratingEmail ? (
                        <>
                          <Loader2 className="h-3 w-3 animate-spin" />
                          Generating...
                        </>
                      ) : (
                        <>
                          <Wand2 className="h-3 w-3" />
                          Generate Email
                        </>
                      )}
                    </Button>
                  </div>
                  <Input
                    value={campaignEmailSubject}
                    onChange={(e) => setCampaignEmailSubject(e.target.value)}
                    placeholder="Email subject..."
                    className="text-sm"
                  />
                  <Textarea
                    value={campaignEmailBody}
                    onChange={(e) => setCampaignEmailBody(e.target.value)}
                    placeholder="AI-generated email template will appear here, or write your own..."
                    rows={5}
                    className="text-sm"
                  />
                  {campaignEmailBody && (
                    <p className="text-xs text-muted-foreground">
                      This email will be used as the default for all email actions in this campaign.
                    </p>
                  )}
                </div>
              </div>

              <p className="text-sm text-muted-foreground bg-muted/50 p-3 rounded-lg">
                <span className="font-medium">Tip:</span> Generate templates here to apply them to all leads. You can still customize the pitch or email for individual leads when you click on them.
              </p>
            </CardContent>
          )}
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Megaphone className="h-5 w-5 text-primary" />
                {viewingCampaign.name}
              </CardTitle>
              <div className="flex items-center gap-2">
                {getStatusBadge(viewingCampaign.status)}
                <Badge variant="outline">{campaignLeads.length} leads</Badge>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Call Controls */}
            {activeCampaign && activeCampaign.id === viewingCampaign.id && (
              <>
                {/* Call Progress */}
                {isCalling && callProgress.total > 0 && (
                  <div className="p-3 rounded-lg bg-primary/10 text-sm">
                    <div className="flex items-center justify-between mb-2">
                      <span>Calling progress:</span>
                      <span className="font-medium">{callProgress.current} / {callProgress.total}</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div
                        className="bg-primary h-2 rounded-full transition-all"
                        style={{ width: `${(callProgress.current / callProgress.total) * 100}%` }}
                      />
                    </div>
                  </div>
                )}

                {/* Phone Stats */}
                {phoneStats && phoneStats.totalNumbers > 0 && (
                  <div className="flex items-center justify-between p-3 rounded-lg bg-muted text-sm">
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <span>Daily Capacity:</span>
                    </div>
                    <div className="flex items-center gap-4">
                      <span>
                        <strong>{phoneStats.remainingToday}</strong> / {phoneStats.totalDailyCapacity} calls remaining
                      </span>
                    </div>
                  </div>
                )}

                {/* Call All Button */}
                <Button
                  variant="gradient"
                  size="lg"
                  onClick={callAllLeads}
                  disabled={isCalling || (phoneStats && phoneStats.remainingToday === 0) || callResults.length === campaignLeads.length}
                  className="w-full"
                >
                  {isCalling ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Calling...
                    </>
                  ) : (
                    <>
                      <Play className="h-4 w-4" />
                      Call All ({campaignLeads.length - callResults.length} remaining)
                    </>
                  )}
                </Button>
              </>
            )}

            {/* Start Calling Button (if not active) */}
            {(!activeCampaign || activeCampaign.id !== viewingCampaign.id) && (
              <Button
                variant="gradient"
                size="lg"
                onClick={() => startCampaign(viewingCampaign)}
                className="w-full"
              >
                <Play className="h-4 w-4" />
                Start Calling Campaign
              </Button>
            )}

            {/* Leads Table - Same format as Leads page */}
            <div className="rounded-md border overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[200px]">Business Details</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>City</TableHead>
                    <TableHead>Industry</TableHead>
                    <TableHead>Rating</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {campaignLeads.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="h-24 text-center">
                        No leads in this campaign
                      </TableCell>
                    </TableRow>
                  ) : (
                    campaignLeads.map((lead) => {
                      const callResult = callResults.find(r => r.leadId === lead.id);
                      return (
                        <TableRow key={lead.id}>
                          <TableCell>
                            <div className="flex flex-col">
                              <span className="font-medium">{lead.name}</span>
                              {lead.address && (
                                <span className="text-xs text-muted-foreground truncate max-w-[200px]">
                                  {lead.address}
                                </span>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            {lead.phone ? (
                              <a href={`tel:${lead.phone}`} className="flex items-center gap-1 text-primary hover:underline">
                                <Phone className="h-3 w-3" />
                                {lead.phone}
                              </a>
                            ) : (
                              <span className="text-muted-foreground">—</span>
                            )}
                          </TableCell>
                          <TableCell>
                            {lead.email ? (
                              <a href={`mailto:${lead.email}`} className="flex items-center gap-1 text-primary hover:underline">
                                <Mail className="h-3 w-3" />
                                <span className="truncate max-w-[150px]">{lead.email}</span>
                              </a>
                            ) : (
                              <span className="text-muted-foreground">—</span>
                            )}
                          </TableCell>
                          <TableCell>
                            {lead.city ? (
                              <span className="flex items-center gap-1">
                                <MapPin className="h-3 w-3 text-muted-foreground" />
                                {lead.city}
                              </span>
                            ) : (
                              <span className="text-muted-foreground">—</span>
                            )}
                          </TableCell>
                          <TableCell>
                            {lead.category ? (
                              <Badge variant="outline">{lead.category}</Badge>
                            ) : (
                              <span className="text-muted-foreground">—</span>
                            )}
                          </TableCell>
                          <TableCell>
                            {lead.rating ? (
                              <span className="flex items-center gap-1">
                                <Star className="h-3 w-3 text-yellow-500 fill-yellow-500" />
                                {lead.rating}
                                {lead.review_count && (
                                  <span className="text-muted-foreground text-xs">({lead.review_count})</span>
                                )}
                              </span>
                            ) : (
                              <span className="text-muted-foreground">—</span>
                            )}
                          </TableCell>
                          <TableCell>
                            {callResult ? (
                              callResult.status === 'initiated' ? (
                                <Badge variant="success">
                                  <CheckCircle className="h-3 w-3 mr-1" />
                                  Called
                                </Badge>
                              ) : (
                                <Badge variant="destructive">
                                  <XCircle className="h-3 w-3 mr-1" />
                                  Failed
                                </Badge>
                              )
                            ) : (
                              <Badge variant={lead.status === 'new' ? 'info' : lead.status === 'interested' ? 'success' : 'secondary'}>
                                {lead.status || 'new'}
                              </Badge>
                            )}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-1">
                              {/* Call Button */}
                              {lead.phone && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => openPanel('call', lead)}
                                  title="Call"
                                  className="h-8 w-8 p-0 text-primary hover:text-primary hover:bg-primary/10"
                                >
                                  <Phone className="h-4 w-4" />
                                </Button>
                              )}
                              {/* Email Button */}
                              {lead.email && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => openPanel('email', lead)}
                                  title="Send Email"
                                  className="h-8 w-8 p-0 text-blue-500 hover:text-blue-600 hover:bg-blue-50"
                                >
                                  <Mail className="h-4 w-4" />
                                </Button>
                              )}
                              {/* Edit Button */}
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => openPanel('edit', lead)}
                                title="Edit Lead"
                                className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground hover:bg-secondary"
                              >
                                <Pencil className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };

  return (
    <>
      {/* Soft Paywall Modal */}
      <PaywallModal
        isOpen={showPaywallModal}
        onClose={() => setShowPaywallModal(false)}
        type="calls"
        used={callsUsed}
        limit={callsLimit}
        remaining={callsLimit - callsUsed}
      />

      <div className="space-y-8 animate-slide-up">
        {/* Page Header */}
        <div className="space-y-1">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight bg-gradient-to-r from-foreground to-muted-foreground bg-clip-text text-transparent">
            Campaigns
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground">
            Create and manage your calling campaigns
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

        {/* Campaign Detail View */}
        {activeTab === 'detail' && renderCampaignDetail()}

        {/* Tabs and Content */}
        {activeTab !== 'detail' && (
          <>
            {/* Tab Navigation */}
            <div className="flex border-b border-border">
              <button
                onClick={() => setActiveTab('new')}
                className={cn(
                  "px-4 py-2 text-sm font-medium border-b-2 transition-colors",
                  activeTab === 'new'
                    ? "border-primary text-primary"
                    : "border-transparent text-muted-foreground hover:text-foreground"
                )}
              >
                <Plus className="h-4 w-4 inline mr-2" />
                New Campaign
              </button>
              <button
                onClick={() => setActiveTab('active')}
                className={cn(
                  "px-4 py-2 text-sm font-medium border-b-2 transition-colors",
                  activeTab === 'active'
                    ? "border-primary text-primary"
                    : "border-transparent text-muted-foreground hover:text-foreground"
                )}
              >
                <Megaphone className="h-4 w-4 inline mr-2" />
                Active Campaigns ({campaigns.length})
              </button>
            </div>

            {/* New Campaign Tab */}
            {activeTab === 'new' && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Megaphone className="h-5 w-5 text-primary" />
                    Create New Campaign
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Campaign Name - Only input */}
                  <FormGroup label="Campaign Name">
                    <div className="relative">
                      <FileText className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        value={campaignName}
                        onChange={(e) => setCampaignName(e.target.value)}
                        placeholder="e.g., Dentist Outreach Q1"
                        disabled={isCalling}
                        className="pl-10"
                      />
                    </div>
                  </FormGroup>

                  {/* Lead Selection with Filters */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <Label className="text-sm font-medium">
                        Select Leads ({selectedLeadIds.length} selected)
                      </Label>
                      <Button variant="ghost" size="sm" onClick={clearFilters}>
                        Clear Filters
                      </Button>
                    </div>

                    {/* Status Filter Tabs */}
                    <div className="flex gap-2 flex-wrap overflow-x-auto pb-2 -mx-1 px-1">
                      {[
                        { key: 'all', label: 'All', count: stats.total },
                        { key: 'new', label: 'New', count: stats.new },
                        { key: 'contacted', label: 'Contacted', count: stats.contacted },
                        { key: 'interested', label: 'Interested', count: stats.interested },
                      ].map(({ key, label, count }) => (
                        <Button
                          key={key}
                          variant={statusFilter === key ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => setStatusFilter(key)}
                          className="shrink-0 text-xs sm:text-sm"
                        >
                          {label} ({count})
                        </Button>
                      ))}
                    </div>

                    {/* Dropdown Filters */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="flex items-center gap-2">
                        <Filter className="h-4 w-4 text-muted-foreground shrink-0" />
                        <Select
                          value={categoryFilter}
                          onChange={(e) => setCategoryFilter(e.target.value)}
                          className="w-full h-9 text-sm"
                        >
                          <option value="">All Industries ({leads.length})</option>
                          {categories.map((category) => (
                            <option key={category} value={category}>
                              {category} ({leads.filter(l => l.category === category).length})
                            </option>
                          ))}
                        </Select>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-muted-foreground shrink-0" />
                        <Select
                          value={locationFilter}
                          onChange={(e) => setLocationFilter(e.target.value)}
                          className="w-full h-9 text-sm"
                        >
                          <option value="">All Locations</option>
                          {locations.map((loc) => (
                            <option key={loc} value={loc}>
                              {loc} ({leads.filter(l => l.city === loc).length})
                            </option>
                          ))}
                        </Select>
                      </div>
                    </div>

                    {/* Search Filters */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          value={searchName}
                          onChange={(e) => setSearchName(e.target.value)}
                          placeholder="Search name..."
                          className="pl-9 h-9 text-sm"
                        />
                      </div>
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          value={searchPhone}
                          onChange={(e) => setSearchPhone(e.target.value)}
                          placeholder="Search phone..."
                          className="pl-9 h-9 text-sm"
                        />
                      </div>
                      <div className="relative">
                        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          value={searchCity}
                          onChange={(e) => setSearchCity(e.target.value)}
                          placeholder="Search city..."
                          className="pl-9 h-9 text-sm"
                        />
                      </div>
                      <div className="relative">
                        <Filter className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          value={searchIndustry}
                          onChange={(e) => setSearchIndustry(e.target.value)}
                          placeholder="Search industry..."
                          className="pl-9 h-9 text-sm"
                        />
                      </div>
                    </div>

                    {/* Results info */}
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>
                        Showing{' '}
                        <span className="font-medium text-foreground">
                          {filteredLeads.length === 0 ? 0 : pageStartIndex + 1}-{pageEndIndexExclusive}
                        </span>{' '}
                        of <span className="font-medium text-foreground">{filteredLeads.length}</span> filtered leads
                      </span>
                      <span>
                        Page <span className="font-medium text-foreground">{safePage}</span> / {totalPages}
                      </span>
                    </div>

                    {/* Leads Table */}
                    {leads.length === 0 ? (
                      <div className="rounded-lg border border-border">
                        <EmptyState
                          icon={Users}
                          title="No leads available"
                          description="Go to Find Leads to scrape some!"
                          className="py-8"
                        />
                      </div>
                    ) : (
                      <div className="rounded-md border">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead className="w-10">
                                <button
                                  onClick={selectAllVisible}
                                  disabled={isCalling}
                                  className="flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50"
                                >
                                  {(() => {
                                    const visibleIds = selectableLeads.filter(l => pagedLeads.some(p => p.id === l.id)).map(l => l.id);
                                    const allSelected = visibleIds.length > 0 && visibleIds.every(id => selectedLeadIds.includes(id));
                                    return allSelected ? (
                                      <CheckSquare className="h-5 w-5 text-primary" />
                                    ) : (
                                      <Square className="h-5 w-5" />
                                    );
                                  })()}
                                </button>
                              </TableHead>
                              <TableHead>Business</TableHead>
                              <TableHead>Phone</TableHead>
                              <TableHead>City</TableHead>
                              <TableHead>Industry</TableHead>
                              <TableHead>Rating</TableHead>
                              <TableHead>Status</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {pagedLeads.map((lead) => {
                              const hasPhone = lead.phone && lead.phone.trim().length > 0;
                              return (
                                <TableRow
                                  key={lead.id}
                                  className={cn(
                                    selectedLeadIds.includes(lead.id) && 'bg-primary/5',
                                    !hasPhone && 'opacity-50'
                                  )}
                                >
                                  <TableCell>
                                    <button
                                      onClick={() => hasPhone && toggleSelectLead(lead.id)}
                                      disabled={isCalling || !hasPhone}
                                      className="flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                      title={!hasPhone ? 'No phone number' : undefined}
                                    >
                                      {selectedLeadIds.includes(lead.id) ? (
                                        <CheckSquare className="h-5 w-5 text-primary" />
                                      ) : (
                                        <Square className="h-5 w-5" />
                                      )}
                                    </button>
                                  </TableCell>
                                  <TableCell>
                                    <div className="flex flex-col">
                                      <span className="font-medium">{lead.name}</span>
                                      {lead.address && (
                                        <span className="text-xs text-muted-foreground truncate max-w-[200px]">
                                          {lead.address}
                                        </span>
                                      )}
                                    </div>
                                  </TableCell>
                                  <TableCell className={cn(!hasPhone && "text-destructive")}>
                                    {hasPhone ? lead.phone : 'No phone'}
                                  </TableCell>
                                  <TableCell>
                                    {lead.city || <span className="text-muted-foreground">—</span>}
                                  </TableCell>
                                  <TableCell>
                                    {lead.category ? (
                                      <Badge variant="outline" className="text-xs">
                                        {lead.category}
                                      </Badge>
                                    ) : (
                                      <span className="text-muted-foreground">—</span>
                                    )}
                                  </TableCell>
                                  <TableCell>
                                    {lead.rating ? (
                                      <span className="flex items-center gap-1">
                                        <Star className="h-3 w-3 text-yellow-500 fill-yellow-500" />
                                        {lead.rating}
                                      </span>
                                    ) : (
                                      <span className="text-muted-foreground">—</span>
                                    )}
                                  </TableCell>
                                  <TableCell>
                                    <Badge variant={lead.status === 'new' ? 'info' : lead.status === 'interested' ? 'success' : 'secondary'}>
                                      {lead.status || 'new'}
                                    </Badge>
                                  </TableCell>
                                </TableRow>
                              );
                            })}
                          </TableBody>
                        </Table>
                      </div>
                    )}

                    {/* Pagination controls */}
                    {filteredLeads.length > 0 && (
                      <div className="flex flex-col gap-2 pt-2 md:flex-row md:items-center md:justify-between">
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <span>Rows per page</span>
                          <Select
                            value={String(pageSize)}
                            onChange={(e) => setPageSize(Number(e.target.value))}
                            className="h-8 w-24 text-xs"
                            disabled={isCalling}
                          >
                            {[10, 25, 50, 100].map((size) => (
                              <option key={size} value={String(size)}>
                                {size}
                              </option>
                            ))}
                          </Select>
                        </div>

                        <div className="flex items-center justify-between gap-2 md:justify-end">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setPage((p) => Math.max(1, p - 1))}
                            disabled={isCalling || safePage <= 1}
                          >
                            Prev
                          </Button>
                          <div className="text-xs text-muted-foreground">
                            Page <span className="font-medium text-foreground">{safePage}</span> of{' '}
                            <span className="font-medium text-foreground">{totalPages}</span>
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                            disabled={isCalling || safePage >= totalPages}
                          >
                            Next
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Save Campaign Button */}
                  <Button
                    variant="gradient"
                    size="lg"
                    onClick={saveCampaign}
                    disabled={isSaving || selectedLeadIds.length === 0}
                    className="w-full"
                  >
                    {isSaving ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <FileText className="h-4 w-4" />
                        Save Campaign ({selectedLeadIds.length} leads)
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* Active Campaigns Tab */}
            {activeTab === 'active' && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="h-5 w-5 text-primary" />
                    Active Campaigns
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {campaigns.length === 0 ? (
                    <EmptyState
                      icon={Megaphone}
                      title="No campaigns yet"
                      description="Create your first campaign to get started"
                      className="py-8"
                    />
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Name</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Leads</TableHead>
                          <TableHead>Calls Made</TableHead>
                          <TableHead>Created</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {campaigns.map((campaign) => (
                          <TableRow key={campaign.id} className="cursor-pointer hover:bg-muted/50">
                            <TableCell className="font-medium">{campaign.name}</TableCell>
                            <TableCell>{getStatusBadge(campaign.status)}</TableCell>
                            <TableCell>
                              <Badge variant="outline">{campaign.total_leads} leads</Badge>
                            </TableCell>
                            <TableCell>
                              <span className="text-success">{campaign.calls_completed || 0}</span>
                              <span className="text-muted-foreground"> / {campaign.calls_made || 0}</span>
                            </TableCell>
                            <TableCell className="text-muted-foreground">
                              <span className="flex items-center gap-1.5">
                                <Calendar className="h-4 w-4" />
                                {new Date(campaign.created_at).toLocaleDateString()}
                              </span>
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex items-center justify-end gap-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => viewCampaignDetails(campaign)}
                                >
                                  View
                                </Button>
                                <Button
                                  variant="default"
                                  size="sm"
                                  onClick={() => startCampaign(campaign)}
                                >
                                  <Play className="h-3 w-3 mr-1" />
                                  {campaign.status === 'draft' ? 'Start' : 'Resume'}
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
            )}
          </>
        )}
      </div>

      {/* Lead Action Panel */}
      <LeadActionPanel
        isOpen={panelOpen}
        onClose={closePanel}
        lead={panelLead}
        panelType={panelType}
        onSuccess={(message) => setSuccess(message)}
        onLeadUpdated={loadData}
        campaignDefaults={{
          callPitch: campaignCallPitch,
          companyContext: campaignCompanyContext,
          emailSubject: campaignEmailSubject,
          emailBody: campaignEmailBody,
          senderEmail: campaignSenderEmail,
          senderName: campaignSenderName,
        }}
      />
    </>
  );
}

export default Campaigns;
