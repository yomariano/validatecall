import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { createMarketResearchAssistant } from '../services/vapi';
import { vapiApi } from '../services/api';
import { getLeads, createCampaign, getCampaigns, saveCall } from '../services/supabase';
import { useAuth } from '../context/AuthContext';
import { useOnboarding } from '../components/OnboardingWizard';
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
  Building2,
  Calendar,
  AlertTriangle,
  Bot,
  Filter
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input, Textarea, Label, FormGroup, Select } from '@/components/ui/input';
import { EmptyState, LoadingState } from '@/components/ui/loading';
import { cn } from '@/lib/utils';



function Campaigns() {
  const location = useLocation();
  const { user } = useAuth();
  const { completeStep } = useOnboarding();
  const [campaigns, setCampaigns] = useState([]);
  const [leads, setLeads] = useState([]);
  const [selectedLeadIds, setSelectedLeadIds] = useState(location.state?.selectedLeadIds || []);
  const [phoneStats, setPhoneStats] = useState(null);

  // Agents
  const [agents, setAgents] = useState([]);
  const [selectedAgentId, setSelectedAgentId] = useState('');

  // Category filter
  const [categoryFilter, setCategoryFilter] = useState('');

  // Lead table pagination (client-side)
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(50);

  // New campaign form
  const [campaignName, setCampaignName] = useState('');
  const [productIdea, setProductIdea] = useState('');
  const [companyContext, setCompanyContext] = useState('');

  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isCalling, setIsCalling] = useState(false);
  const [callProgress, setCallProgress] = useState({ current: 0, total: 0, results: [] });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Active campaign (saved, ready for calling)
  const [activeCampaign, setActiveCampaign] = useState(null);

  const visibleLeads = categoryFilter ? leads.filter((lead) => lead.category === categoryFilter) : leads;
  const selectableVisibleLeads = visibleLeads.filter((lead) => lead.phone && lead.phone.trim().length > 0);
  const totalPages = Math.max(1, Math.ceil(visibleLeads.length / pageSize));
  const safePage = Math.min(Math.max(1, page), totalPages);
  const pageStartIndex = (safePage - 1) * pageSize;
  const pageEndIndexExclusive = Math.min(pageStartIndex + pageSize, visibleLeads.length);
  const pagedLeads = visibleLeads.slice(pageStartIndex, pageEndIndexExclusive);

  useEffect(() => {
    loadData();
  }, [user]);

  // Reset paging when filter changes
  useEffect(() => {
    setPage(1);
  }, [categoryFilter]);

  // Clamp page when lead count or page size changes
  useEffect(() => {
    if (page !== safePage) setPage(safePage);
  }, [page, safePage]);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [campaignsData, leadsData, agentsData] = await Promise.all([
        getCampaigns(),
        getLeads({}),
        vapiApi.getAssistants().catch(() => []),
      ]);
      setCampaigns(campaignsData);
      setLeads(leadsData);
      setAgents(agentsData || []);

      // Load phone stats for multi-tenant mode
      // Skip on localhost - use mock unlimited stats for development
      const isLocalhost = window.location.hostname === 'localhost' ||
                          window.location.hostname === '127.0.0.1';
      if (user?.id && !isLocalhost) {
        try {
          const stats = await vapiApi.getUserPhoneStats(user.id);
          setPhoneStats(stats);
        } catch {
          // Phone stats not available (single-tenant mode or no subscription)
          setPhoneStats(null);
        }
      } else if (isLocalhost) {
        // Mock stats for localhost development
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

  const selectAllLeads = () => {
    if (selectedLeadIds.length === leads.length) {
      setSelectedLeadIds([]);
    } else {
      setSelectedLeadIds(leads.map(l => l.id));
    }
  };

  // Save campaign without making calls
  const saveCampaign = async () => {
    setError('');
    setSuccess('');

    if (!productIdea) {
      setError('Please enter your product idea');
      return;
    }

    if (selectedLeadIds.length === 0) {
      setError('Please select at least one lead');
      return;
    }

    setIsSaving(true);

    try {
      const campaign = await createCampaign({
        name: campaignName || `Campaign ${new Date().toLocaleDateString()}`,
        productIdea,
        companyContext,
        totalLeads: selectedLeadIds.length,
        leadIds: selectedLeadIds,
        selectedAgentId: selectedAgentId || null,
      });

      // Get the full lead objects for the saved campaign
      const campaignLeads = leads.filter(l => selectedLeadIds.includes(l.id));

      setActiveCampaign({
        ...campaign,
        leads: campaignLeads,
        callResults: [], // Track call results per lead
      });

      setSuccess('Campaign saved! You can now start calling leads.');
      loadData(); // Refresh campaigns list
    } catch (err) {
      setError(err.message || 'Failed to save campaign');
    } finally {
      setIsSaving(false);
    }
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

    setIsCalling(true);
    setCallProgress({ current: 0, total: uncalledLeads.length, results: [] });

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

      setCallProgress(prev => ({ ...prev, results: [...results] }));

      // Delay between calls
      if (i < uncalledLeads.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    }

    const successCount = results.filter(r => r.status === 'initiated').length;
    const failCount = results.filter(r => r.status === 'failed').length;

    setSuccess(`${successCount} calls initiated, ${failCount} failed.`);
    if (successCount > 0) completeStep(2);
    setIsCalling(false);
  };

  // Call a single lead
  const callOneLead = async (lead) => {
    if (!activeCampaign) return;

    // Check if already called
    if (activeCampaign.callResults.find(r => r.leadId === lead.id)) {
      setError('This lead has already been called');
      return;
    }

    setIsCalling(true);
    setCallProgress({ current: 1, total: 1, results: [] });

    const result = await makeCall(lead, activeCampaign);

    setActiveCampaign(prev => ({
      ...prev,
      callResults: [...prev.callResults, result],
    }));

    if (result.status === 'initiated') {
      setSuccess(`Call initiated to ${lead.name}`);
      completeStep(2);
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
            productIdea: campaign.product_idea,
            companyContext: campaign.company_context,
            assistantId: campaign.selected_agent_id || undefined,
          })
        : await vapiApi.initiateCall({
            phoneNumber,
            customerName: lead.name,
            productIdea: campaign.product_idea,
            companyContext: campaign.company_context,
            assistantId: campaign.selected_agent_id || undefined,
          });

      // Save call to database
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

  // Close active campaign and return to form
  const closeCampaign = () => {
    setActiveCampaign(null);
    setCampaignName('');
    setProductIdea('');
    setCompanyContext('');
    setSelectedLeadIds([]);
    setSelectedAgentId('');
    setCallProgress({ current: 0, total: 0, results: [] });
  };

  // Load a saved campaign from Past Campaigns
  const loadCampaign = (campaign) => {
    // Get leads that belong to this campaign
    const campaignLeadIds = campaign.lead_ids || [];
    const campaignLeads = leads.filter(l => campaignLeadIds.includes(l.id));

    setActiveCampaign({
      ...campaign,
      leads: campaignLeads,
      callResults: [], // TODO: Could load existing call results from database
    });

    setSuccess(`Campaign "${campaign.name}" loaded. Ready to start calling.`);
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

  return (
    <div className="space-y-8 animate-slide-up">
      {/* Page Header */}
      <div className="space-y-1">
        <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-foreground to-muted-foreground bg-clip-text text-transparent">
          Campaigns
        </h1>
        <p className="text-muted-foreground">
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

      {/* New Campaign Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Megaphone className="h-5 w-5 text-primary" />
            New Campaign
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            <FormGroup label="Campaign Name (Optional)">
              <div className="relative">
                <FileText className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  value={campaignName}
                  onChange={(e) => setCampaignName(e.target.value)}
                  placeholder="e.g., Restaurant Outreach Q1"
                  disabled={isCalling}
                  className="pl-10"
                />
              </div>
            </FormGroup>
            <FormGroup label="Company Context (Optional)">
              <div className="relative">
                <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  value={companyContext}
                  onChange={(e) => setCompanyContext(e.target.value)}
                  placeholder="e.g., TechStartup Inc"
                  disabled={isCalling}
                  className="pl-10"
                />
              </div>
            </FormGroup>
          </div>

          {/* Voice Agent Selection */}
          <FormGroup label="Voice Agent">
            <div className="relative">
              <Bot className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground z-10" />
              <Select
                value={selectedAgentId}
                onChange={(e) => setSelectedAgentId(e.target.value)}
                disabled={isCalling}
                className="pl-10"
              >
                <option value="">Use default agent (based on product pitch)</option>
                {agents.map((agent) => (
                  <option key={agent.id} value={agent.id}>
                    {agent.name} ({agent.voice?.provider || '11labs'})
                  </option>
                ))}
              </Select>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Select a pre-configured voice agent or use the default which generates from your product pitch.
              {agents.length === 0 && (
                <span className="text-primary ml-1">
                  <a href="/agents" className="underline">Create an agent</a> to customize voice and behavior.
                </span>
              )}
            </p>
          </FormGroup>

          <FormGroup label="Product Idea / Pitch *">
            <Textarea
              value={productIdea}
              onChange={(e) => setProductIdea(e.target.value)}
              placeholder="Describe your product idea in detail. What problem does it solve? Who is it for? This will be used by the AI to pitch during calls."
              rows={4}
              disabled={isCalling}
            />
          </FormGroup>

          {/* Lead Selection */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-medium">
                Select Leads to Call ({selectedLeadIds.length} selected · {visibleLeads.length} shown · {leads.length} total)
              </Label>
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-muted-foreground" />
                <Select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="w-48 h-9 text-sm"
                  disabled={isCalling}
                >
                  <option value="">All Categories ({leads.length})</option>
                  {[...new Set(leads.map(l => l.category).filter(Boolean))].sort().map((category) => (
                    <option key={category} value={category}>
                      {category} ({leads.filter(l => l.category === category).length})
                    </option>
                  ))}
                </Select>
              </div>
            </div>
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>
                Showing{' '}
                <span className="font-medium text-foreground">
                  {visibleLeads.length === 0 ? 0 : pageStartIndex + 1}-{pageEndIndexExclusive}
                </span>{' '}
                of <span className="font-medium text-foreground">{visibleLeads.length}</span> lead{visibleLeads.length === 1 ? '' : 's'} (filtered)
              </span>
              <span>
                Page <span className="font-medium text-foreground">{safePage}</span> /{' '}
                <span className="font-medium text-foreground">{totalPages}</span>
              </span>
            </div>
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
              <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-10">
                        <button
                          onClick={() => {
                            const visibleIds = selectableVisibleLeads.map((lead) => lead.id);
                            const allSelected = visibleIds.length > 0 && visibleIds.every((id) => selectedLeadIds.includes(id));
                            if (allSelected) {
                              setSelectedLeadIds((prev) => prev.filter((id) => !visibleIds.includes(id)));
                            } else {
                              setSelectedLeadIds((prev) => [...new Set([...prev, ...visibleIds])]);
                            }
                          }}
                          disabled={isCalling}
                          className="flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50"
                        >
                          {(() => {
                            const visibleIds = selectableVisibleLeads.map((lead) => lead.id);
                            const allSelected = visibleIds.length > 0 && visibleIds.every((id) => selectedLeadIds.includes(id));
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
                      <TableHead>Category</TableHead>
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
                          <TableCell className="font-medium">{lead.name}</TableCell>
                          <TableCell className={cn("text-muted-foreground", !hasPhone && "text-destructive")}>
                            {hasPhone ? lead.phone : 'No phone'}
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className="text-xs">
                              {lead.category || 'Uncategorized'}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge variant={lead.status === 'new' ? 'info' : lead.status === 'called' ? 'success' : 'secondary'}>
                              {lead.status || 'new'}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
              </Table>
            )}

            {/* Pagination controls */}
            {visibleLeads.length > 0 && (
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

          {/* Call Progress */}
          {isCalling && (
            <Alert variant="info">
              <AlertTitle className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                Calling in progress... {callProgress.current} / {callProgress.total}
              </AlertTitle>
              <AlertDescription>
                <div className="mt-3 max-h-32 overflow-y-auto space-y-2">
                  {callProgress.results.map((result, i) => (
                    <div key={i} className="flex items-center gap-2 text-sm">
                      {result.status === 'initiated' ? (
                        <CheckCircle className="h-4 w-4 text-success" />
                      ) : (
                        <XCircle className="h-4 w-4 text-destructive" />
                      )}
                      <span>{result.name}:</span>
                      {getStatusBadge(result.status)}
                      {result.error && (
                        <span className="text-destructive text-xs">{result.error}</span>
                      )}
                    </div>
                  ))}
                </div>
              </AlertDescription>
            </Alert>
          )}

          {/* Phone Capacity Warning */}
          {phoneStats && selectedLeadIds.length > phoneStats.remainingToday && (
            <Alert variant="warning">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Capacity Warning</AlertTitle>
              <AlertDescription>
                You have {phoneStats.remainingToday} calls remaining today, but selected {selectedLeadIds.length} leads.
                Only {phoneStats.remainingToday} calls will be made.
              </AlertDescription>
            </Alert>
          )}

          {phoneStats && phoneStats.totalNumbers === 0 && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>No Phone Numbers</AlertTitle>
              <AlertDescription>
                You don't have any phone numbers configured. Please subscribe to a plan to get phone numbers.
              </AlertDescription>
            </Alert>
          )}

          {/* Phone Stats Display */}
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
                <Badge variant={phoneStats.remainingToday > 0 ? 'success' : 'destructive'}>
                  {phoneStats.totalNumbers} numbers
                </Badge>
              </div>
            </div>
          )}

          <Button
            variant="gradient"
            size="lg"
            onClick={saveCampaign}
            disabled={isSaving || !productIdea || selectedLeadIds.length === 0}
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

      {/* Active Campaign - Ready to Call */}
      {activeCampaign && (
        <Card className="border-primary/50">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Megaphone className="h-5 w-5 text-primary" />
                {activeCampaign.name}
              </CardTitle>
              <Button variant="ghost" size="sm" onClick={closeCampaign}>
                <XCircle className="h-4 w-4 mr-1" />
                Close
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Campaign Info */}
            <div className="p-3 rounded-lg bg-muted text-sm space-y-2">
              <p><strong>Product/Idea:</strong> {activeCampaign.product_idea}</p>
              {activeCampaign.company_context && (
                <p><strong>Company Context:</strong> {activeCampaign.company_context}</p>
              )}
            </div>

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
              disabled={isCalling || (phoneStats && phoneStats.remainingToday === 0) || activeCampaign.callResults.length === activeCampaign.leads.length}
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
                  Call All ({activeCampaign.leads.length - activeCampaign.callResults.length} remaining)
                </>
              )}
            </Button>

            {/* Leads Table with Call One buttons */}
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {activeCampaign.leads.map((lead) => {
                  const callResult = activeCampaign.callResults.find(r => r.leadId === lead.id);
                  return (
                    <TableRow key={lead.id}>
                      <TableCell className="font-medium">{lead.name}</TableCell>
                      <TableCell>{lead.phone}</TableCell>
                      <TableCell>
                        {lead.category && <Badge variant="secondary">{lead.category}</Badge>}
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
                          <Badge variant="secondary">Pending</Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        {!callResult && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => callOneLead(lead)}
                            disabled={isCalling || (phoneStats && phoneStats.remainingToday === 0)}
                          >
                            <Phone className="h-3 w-3 mr-1" />
                            Call
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Past Campaigns */}
      {campaigns.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-primary" />
              Past Campaigns
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Leads</TableHead>
                  <TableHead>Completed</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {campaigns.map((campaign) => (
                  <TableRow key={campaign.id}>
                    <TableCell className="font-medium">{campaign.name}</TableCell>
                    <TableCell>{getStatusBadge(campaign.status)}</TableCell>
                    <TableCell>{campaign.total_leads}</TableCell>
                    <TableCell>
                      <span className="text-success">{campaign.calls_completed}</span>
                      <span className="text-muted-foreground"> / {campaign.calls_made}</span>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      <span className="flex items-center gap-1.5">
                        <Calendar className="h-4 w-4" />
                        {new Date(campaign.created_at).toLocaleDateString()}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => loadCampaign(campaign)}
                        disabled={activeCampaign?.id === campaign.id}
                      >
                        <Play className="h-3 w-3 mr-1" />
                        {campaign.status === 'draft' ? 'Start' : 'Resume'}
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export default Campaigns;
