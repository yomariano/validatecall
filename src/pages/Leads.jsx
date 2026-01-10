import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { scrapeAndWait } from '../services/leads';
import { saveLeads, getLeads, getLeadsStats } from '../services/supabase';
import { vapiApi, scheduledApi, claudeApi, supabaseApi } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useUsage } from '../context/UsageContext';
import { useOnboarding } from '../components/OnboardingWizard';
import PaywallModal from '../components/PaywallModal';
import HardPaywall from '../components/HardPaywall';
import { LeadEvents, AgentEvents, ErrorEvents, NavigationEvents } from '@/lib/analytics';
import {
  Search,
  MapPin,
  Users,
  UserPlus,
  UserCheck,
  Star,
  Phone,
  ExternalLink,
  Loader2,
  CheckSquare,
  Square,
  Sparkles,
  Upload,
  FileText,
  Copy,
  Download,
  PhoneCall,
  X,
  MessageSquare,
  Building2,
  Bot,
  ChevronDown,
  Volume2,
  Clock,
  Calendar,
  Pencil,
  Globe,
  Wand2,
  Send,
  Filter,
  Tag,
  MapPinned
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent, StatCard } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input, Select, Label, FormGroup, Textarea } from '@/components/ui/input';
import { EmptyState } from '@/components/ui/loading';
import { cn } from '@/lib/utils';

// Separate component for AI generator to avoid re-rendering parent on every keystroke
function AIGenerator({ type, onGenerate, placeholder }) {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerate = async () => {
    if (!input.trim()) return;

    setIsGenerating(true);
    try {
      const result = await claudeApi.generate(input.trim(), type);
      onGenerate(result.generated);
      setIsOpen(false);
      setInput('');
    } catch (err) {
      console.error('AI generation error:', err);
    } finally {
      setIsGenerating(false);
    }
  };

  if (!isOpen) {
    return (
      <Button
        variant="outline"
        size="sm"
        onClick={() => setIsOpen(true)}
        className="gap-2 text-xs"
      >
        <Wand2 className="h-3 w-3" />
        AI Generate
      </Button>
    );
  }

  return (
    <div className="flex gap-2 p-3 bg-gradient-to-r from-primary/5 to-primary/10 rounded-lg border border-primary/20">
      <Input
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder={placeholder}
        className="flex-1 text-sm"
        onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleGenerate()}
        disabled={isGenerating}
        autoFocus
      />
      <Button
        size="sm"
        variant="gradient"
        onClick={handleGenerate}
        disabled={isGenerating || !input.trim()}
      >
        {isGenerating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
      </Button>
      <Button
        size="sm"
        variant="ghost"
        onClick={() => { setIsOpen(false); setInput(''); }}
        disabled={isGenerating}
      >
        <X className="h-4 w-4" />
      </Button>
    </div>
  );
}

function Leads() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const {
    isFreeTier,
    leadsUsed,
    leadsLimit,
    callsUsed,
    callsLimit,
    canGenerateLeads,
    shouldShowSoftPaywall,
    shouldShowHardPaywall,
    refreshUsage
  } = useUsage();
  const { completeStep } = useOnboarding();
  const fileInputRef = useRef(null);

  // Paywall state
  const [showPaywallModal, setShowPaywallModal] = useState(false);

  // Scraping state
  const [keyword, setKeyword] = useState('');
  const [location, setLocation] = useState('');
  const [maxResults, setMaxResults] = useState(50);
  const [isScraping, setIsScraping] = useState(false);
  const [scrapeStatus, setScrapeStatus] = useState('');

  // Import state
  const [importTab, setImportTab] = useState('scrape'); // 'scrape', 'file', 'paste'
  const [pasteData, setPasteData] = useState('');
  const [isImporting, setIsImporting] = useState(false);

  // Leads state
  const [allLeads, setAllLeads] = useState([]); // Unfiltered leads for extracting categories/locations
  const [stats, setStats] = useState({ total: 0, new: 0, contacted: 0, interested: 0 });
  const [selectedLeads, setSelectedLeads] = useState([]);
  const [filter, setFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [locationFilter, setLocationFilter] = useState('all');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Derived: unique categories and locations from leads (memoized for performance)
  const categories = useMemo(() =>
    [...new Set(allLeads.map(l => l.category).filter(Boolean))].sort(),
    [allLeads]
  );
  const locations = useMemo(() =>
    [...new Set(allLeads.map(l => l.search_location || l.city).filter(Boolean))].sort(),
    [allLeads]
  );

  // Side panel state
  const [panelOpen, setPanelOpen] = useState(false);
  const [panelType, setPanelType] = useState(null); // 'call', 'edit', 'location'
  const [selectedLead, setSelectedLead] = useState(null);
  const [productIdea, setProductIdea] = useState('');
  const [companyContext, setCompanyContext] = useState('');
  const [isCalling, setIsCalling] = useState(false);
  const [callStatus, setCallStatus] = useState('');

  // Vapi assistants state
  const [assistants, setAssistants] = useState([]);
  const [selectedAssistantId, setSelectedAssistantId] = useState('default');
  const [loadingAssistants, setLoadingAssistants] = useState(false);

  // Test call state
  const [testCallMode, setTestCallMode] = useState(false);
  const [testPhoneNumber, setTestPhoneNumber] = useState('');

  // Classification state
  const [isClassifying, setIsClassifying] = useState(false);
  const [classifyProgress, setClassifyProgress] = useState('');

  // Scheduling state
  const [isScheduleMode, setIsScheduleMode] = useState(false);
  const [scheduledDateTime, setScheduledDateTime] = useState('');

  // Debounce ref to prevent rapid double-clicks on search
  const scrapeInProgressRef = useRef(false);


  // Load all leads once, then filter client-side
  useEffect(() => {
    loadLeads();
  }, []);

  // Apply filters using useMemo (more efficient than useEffect + setState)
  const filteredLeads = useMemo(() => {
    let filtered = allLeads;

    // Status filter
    if (filter !== 'all') {
      filtered = filtered.filter(l => l.status === filter);
    }

    // Category filter - case-insensitive substring matching
    if (categoryFilter !== 'all') {
      const filterLower = categoryFilter.toLowerCase();
      filtered = filtered.filter(l =>
        l.category?.toLowerCase().includes(filterLower) ||
        filterLower.includes(l.category?.toLowerCase() || '')
      );
    }

    // Location filter
    if (locationFilter !== 'all') {
      filtered = filtered.filter(l =>
        l.search_location === locationFilter || l.city === locationFilter
      );
    }

    return filtered;
  }, [allLeads, filter, categoryFilter, locationFilter]);

  // Use filteredLeads instead of leads state
  const leads = filteredLeads;


  // Load Vapi assistants on mount
  useEffect(() => {
    const loadAssistants = async () => {
      setLoadingAssistants(true);
      try {
        const data = await vapiApi.getAssistants();
        setAssistants(data || []);
      } catch (err) {
        console.error('Error loading assistants:', err);
      } finally {
        setLoadingAssistants(false);
      }
    };
    loadAssistants();
  }, []);

  const loadLeads = async () => {
    try {
      const [leadsData, statsData] = await Promise.all([
        getLeads({}), // Load all leads, filter client-side
        getLeadsStats(),
      ]);

      setAllLeads(leadsData);
      setStats(statsData);
    } catch (err) {
      console.error('Error loading leads:', err);
    }
  };

  // Helper function to classify leads by industry using AI
  const classifyLeadsIndustry = async (leadsToClassify, onProgress) => {
    if (!leadsToClassify || leadsToClassify.length === 0) return;

    const BATCH_SIZE = 50;
    let totalClassified = 0;

    try {
      for (let i = 0; i < leadsToClassify.length; i += BATCH_SIZE) {
        const batch = leadsToClassify.slice(i, i + BATCH_SIZE);
        if (onProgress) {
          onProgress(`Classifying industries... (${i + 1}-${Math.min(i + BATCH_SIZE, leadsToClassify.length)} of ${leadsToClassify.length})`);
        }

        const { classifications } = await claudeApi.classifyIndustry(batch);
        if (classifications?.length > 0) {
          await supabaseApi.updateLeadIndustries(classifications);
          totalClassified += classifications.length;
        }
      }
      console.log(`Classified ${totalClassified} leads into industries`);

      // Track classification completion
      if (totalClassified > 0) {
        LeadEvents.classified(totalClassified);
      }
    } catch (err) {
      console.error('Industry classification error:', err);
      // Don't throw - classification is optional
    }
  };

  // Classify all existing leads with AI
  const handleClassifyAll = async () => {
    if (allLeads.length === 0) {
      setError('No leads to classify');
      return;
    }

    setIsClassifying(true);
    setClassifyProgress('Starting classification...');
    setError('');

    try {
      await classifyLeadsIndustry(allLeads, setClassifyProgress);
      setSuccess(`Classified ${allLeads.length} leads into standardized industries`);
      loadLeads(); // Reload to show updated categories
    } catch (err) {
      setError(`Classification failed: ${err.message}`);
    } finally {
      setIsClassifying(false);
      setClassifyProgress('');
    }
  };

  const handleScrape = async () => {
    // Prevent rapid double-clicks (race condition protection)
    if (scrapeInProgressRef.current || isScraping) {
      console.log('[Leads] Scrape already in progress, ignoring duplicate request');
      return;
    }

    if (!keyword || !location) {
      setError('Please enter both keyword and location');
      return;
    }

    // Check free tier limits (frontend check - backend has atomic protection)
    if (isFreeTier) {
      if (!canGenerateLeads(maxResults)) {
        if (shouldShowHardPaywall('leads')) {
          // Hard paywall will be shown by the component
          return;
        }
        setError(`Free tier limit: You can only generate ${leadsLimit - leadsUsed} more leads. Upgrade to continue.`);
        setShowPaywallModal(true);
        return;
      }

      // Show soft paywall warning at 80% usage
      if (shouldShowSoftPaywall('leads')) {
        setShowPaywallModal(true);
      }
    }

    // Set debounce flag immediately
    scrapeInProgressRef.current = true;

    setError('');
    setSuccess('');
    setIsScraping(true);
    setScrapeStatus('Starting scrape...');

    // Track scrape started
    LeadEvents.scrapeStarted(keyword, location, maxResults);

    try {
      const results = await scrapeAndWait(
        { keyword, location, maxResults, userId: user?.id },
        (status) => setScrapeStatus(status.message)
      );

      setScrapeStatus(`Found ${results.length} businesses with phone numbers`);

      try {
        const { saved, duplicates } = await saveLeads(results, keyword, location);
        setSuccess(`Saved ${saved} new leads (${duplicates} duplicates skipped)`);

        // Track scrape completed
        LeadEvents.scrapeCompleted(results.length, duplicates, saved);

        if (saved > 0) {
          completeStep(1); // Mark "Find Leads" step as complete
          refreshUsage(); // Update usage stats
        }

        // Classify industries using AI
        if (saved > 0) {
          setScrapeStatus('Classifying industries with AI...');
          // Reload leads to get the ones we just saved (with IDs)
          const freshLeads = await getLeads({});
          // Get leads that match the current search (recently added)
          const leadsToClassify = freshLeads
            .filter(l => l.search_keyword === keyword && l.search_location === location)
            .slice(0, saved);

          await classifyLeadsIndustry(leadsToClassify, setScrapeStatus);
        }

        loadLeads();
      } catch {
        // Database not available, show results in UI
        setAllLeads(results.map((r, i) => ({ ...r, id: i, status: 'new' })));
        setSuccess(`Found ${results.length} leads.`);
        LeadEvents.scrapeCompleted(results.length, 0, results.length);
        completeStep(1); // Mark step complete even without DB
      }
    } catch (err) {
      setError(err.message);
      ErrorEvents.scrapeError(err.message);
    } finally {
      setIsScraping(false);
      setScrapeStatus('');
      // Reset debounce flag
      scrapeInProgressRef.current = false;
    }
  };

  // Parse CSV data
  const parseCSV = (csvText) => {
    const lines = csvText.trim().split('\n');
    if (lines.length < 2) return [];

    const headers = lines[0].split(',').map(h => h.trim().toLowerCase().replace(/['"]/g, ''));
    const leads = [];

    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',').map(v => v.trim().replace(/['"]/g, ''));
      if (values.length < 2) continue;

      const lead = {};
      headers.forEach((header, index) => {
        lead[header] = values[index] || '';
      });

      // Map common column names to our format
      leads.push({
        name: lead.name || lead.business || lead.company || lead.business_name || '',
        phone: lead.phone || lead.phone_number || lead.telephone || lead.mobile || '',
        email: lead.email || lead.email_address || '',
        address: lead.address || lead.location || lead.street || '',
        city: lead.city || lead.town || '',
        website: lead.website || lead.url || lead.web || '',
        category: lead.category || lead.type || lead.industry || '',
        rating: parseFloat(lead.rating) || null,
        reviewCount: parseInt(lead.reviews || lead.review_count) || null,
      });
    }

    return leads.filter(l => l.name && l.phone);
  };

  // Parse JSON data
  const parseJSON = (jsonText) => {
    try {
      const data = JSON.parse(jsonText);
      const items = Array.isArray(data) ? data : [data];

      return items.map(item => ({
        name: item.name || item.business || item.company || item.title || '',
        phone: item.phone || item.phone_number || item.phoneNumber || item.telephone || '',
        email: item.email || '',
        address: item.address || item.street || item.location || '',
        city: item.city || '',
        website: item.website || '',
        category: item.category || item.type || item.categoryName || '',
        rating: parseFloat(item.rating || item.totalScore) || null,
        reviewCount: parseInt(item.reviewCount || item.reviews || item.reviewsCount) || null,
        placeId: item.placeId || item.place_id || null,
        googleMapsUrl: item.googleMapsUrl || item.google_maps_url || item.url || null,
      })).filter(l => l.name && l.phone);
    } catch (e) {
      throw new Error('Invalid JSON format');
    }
  };

  // Handle file upload
  const handleFileUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setError('');
    setSuccess('');
    setIsImporting(true);

    const fileType = file.name.endsWith('.json') ? 'json' : 'csv';

    try {
      const text = await file.text();
      let parsedLeads = [];

      if (file.name.endsWith('.json')) {
        parsedLeads = parseJSON(text);
      } else if (file.name.endsWith('.csv')) {
        parsedLeads = parseCSV(text);
      } else {
        // Try JSON first, then CSV
        try {
          parsedLeads = parseJSON(text);
        } catch {
          parsedLeads = parseCSV(text);
        }
      }

      if (parsedLeads.length === 0) {
        throw new Error('No valid leads found in file. Make sure your file has "name" and "phone" columns.');
      }

      try {
        const { saved, duplicates } = await saveLeads(parsedLeads, 'import', 'file');
        setSuccess(`Imported ${saved} new leads (${duplicates} duplicates skipped)`);

        // Track file import
        LeadEvents.fileImported(fileType, saved);

        if (saved > 0) {
          completeStep(1);
          // Classify industries for imported leads
          const freshLeads = await getLeads({});
          const leadsToClassify = freshLeads
            .filter(l => l.search_keyword === 'import' && l.search_location === 'file')
            .slice(0, saved);
          await classifyLeadsIndustry(leadsToClassify);
        }
        loadLeads();
      } catch {
        setAllLeads(parsedLeads.map((r, i) => ({ ...r, id: i, status: 'new' })));
        setSuccess(`Imported ${parsedLeads.length} leads.`);
        LeadEvents.fileImported(fileType, parsedLeads.length);
        completeStep(1);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setIsImporting(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  // Handle paste import
  const handlePasteImport = async () => {
    if (!pasteData.trim()) {
      setError('Please paste some data first');
      return;
    }

    setError('');
    setSuccess('');
    setIsImporting(true);

    try {
      let parsedLeads = [];
      const trimmed = pasteData.trim();

      // Detect format
      if (trimmed.startsWith('[') || trimmed.startsWith('{')) {
        parsedLeads = parseJSON(trimmed);
      } else {
        parsedLeads = parseCSV(trimmed);
      }

      if (parsedLeads.length === 0) {
        throw new Error('No valid leads found. Make sure your data has "name" and "phone" fields.');
      }

      try {
        const { saved, duplicates } = await saveLeads(parsedLeads, 'import', 'paste');
        setSuccess(`Imported ${saved} new leads (${duplicates} duplicates skipped)`);

        // Track paste import
        LeadEvents.pasteImported(saved);

        if (saved > 0) {
          completeStep(1);
          // Classify industries for imported leads
          const freshLeads = await getLeads({});
          const leadsToClassify = freshLeads
            .filter(l => l.search_keyword === 'import' && l.search_location === 'paste')
            .slice(0, saved);
          await classifyLeadsIndustry(leadsToClassify);
        }
        loadLeads();
        setPasteData('');
      } catch {
        setAllLeads(parsedLeads.map((r, i) => ({ ...r, id: i, status: 'new' })));
        setSuccess(`Imported ${parsedLeads.length} leads.`);
        LeadEvents.pasteImported(parsedLeads.length);
        completeStep(1);
        setPasteData('');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setIsImporting(false);
    }
  };

  // Download sample CSV
  const downloadSampleCSV = () => {
    LeadEvents.sampleCsvDownloaded();

    const csv = `name,phone,email,address,city,category
"Joe's Pizza","+1-555-0123","joe@pizza.com","123 Main St","New York","Restaurant"
"Best Plumbing","+1-555-0456","info@bestplumbing.com","456 Oak Ave","Los Angeles","Plumber"
"Super Dentist","+1-555-0789","contact@superdentist.com","789 Pine Rd","Chicago","Dentist"`;

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'sample_leads.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  const toggleSelectLead = (leadId) => {
    setSelectedLeads(prev =>
      prev.includes(leadId)
        ? prev.filter(id => id !== leadId)
        : [...prev, leadId]
    );
  };

  const toggleSelectAll = () => {
    if (selectedLeads.length === leads.length) {
      setSelectedLeads([]);
    } else {
      setSelectedLeads(leads.map(l => l.id));
    }
  };

  const startCampaignWithSelected = () => {
    if (selectedLeads.length === 0) {
      setError('Please select at least one lead');
      return;
    }
    navigate('/campaigns', { state: { selectedLeadIds: selectedLeads } });
  };

  // Open side panel for different actions
  const openPanel = (type, lead = null) => {
    setTestCallMode(type === 'test-call');
    setTestPhoneNumber('');
    setIsScheduleMode(false);
    setScheduledDateTime('');
    setSelectedLead(lead || (type === 'test-call' ? { name: 'Test Call', phone: '' } : null));
    setCallStatus('');
    setPanelType(type === 'test-call' ? 'call' : type);
    setPanelOpen(true);
  };

  // Close side panel
  const closePanel = () => {
    if (!isCalling) {
      setPanelOpen(false);
      setPanelType(null);
      setSelectedLead(null);
    }
  };

  // Legacy function aliases for compatibility
  const openCallModal = (lead) => openPanel('call', lead);
  const openTestCallModal = () => openPanel('test-call');

  // Get selected assistant details
  const selectedAssistant = assistants.find(a => a.id === selectedAssistantId);

  // Initiate Vapi call (immediate or scheduled)
  const handleInitiateCall = async () => {
    // Get the phone number - either from test input or lead
    const phoneNumber = testCallMode ? testPhoneNumber.trim() : selectedLead?.phone;

    // Validate phone number
    if (!phoneNumber) {
      setCallStatus('Error: Phone number is required');
      return;
    }

    // Always require product idea
    if (!productIdea.trim()) {
      setCallStatus('Error: Please enter your product/service description');
      return;
    }

    // Validate scheduled time if in schedule mode
    if (isScheduleMode) {
      if (!scheduledDateTime) {
        setCallStatus('Error: Please select a date and time');
        return;
      }
      const scheduledTime = new Date(scheduledDateTime);
      if (scheduledTime <= new Date()) {
        setCallStatus('Error: Scheduled time must be in the future');
        return;
      }
    }

    setIsCalling(true);
    setCallStatus(isScheduleMode ? 'Scheduling call...' : 'Initiating call...');

    // Track call initiation
    if (testCallMode) {
      LeadEvents.testCallInitiated();
    } else {
      LeadEvents.callInitiated(selectedLead?.id, isScheduleMode ? 'scheduled' : 'immediate');
    }

    try {
      // Handle scheduled call
      if (isScheduleMode) {
        const schedulePayload = {
          userId: user?.id,
          leadId: testCallMode ? null : selectedLead?.id,
          phoneNumber,
          customerName: testCallMode ? 'Test Call' : (selectedLead?.name || 'Prospect'),
          scheduledAt: new Date(scheduledDateTime).toISOString(),
          productIdea: productIdea.trim(),
          companyContext: companyContext.trim() || undefined,
          assistantId: selectedAssistantId !== 'default' ? selectedAssistantId : undefined,
        };

        const result = await scheduledApi.scheduleCall(schedulePayload);

        const scheduledTime = new Date(scheduledDateTime).toLocaleString();
        setCallStatus(`✅ Call scheduled for ${scheduledTime}`);
        setSuccess(`Call to ${phoneNumber} scheduled for ${scheduledTime}`);

        // Close panel after short delay
        setTimeout(() => {
          closePanel();
          setTestCallMode(false);
          setTestPhoneNumber('');
          setIsScheduleMode(false);
          setScheduledDateTime('');
        }, 2000);

        return;
      }

      // Handle immediate call
      const callPayload = {
        phoneNumber,
        customerName: testCallMode ? 'Test Call' : (selectedLead?.name || 'Prospect'),
        productIdea: productIdea.trim(),
        companyContext: companyContext.trim() || undefined,
      };

      // If using a pre-configured assistant, pass its ID
      // The backend will use assistantOverrides to apply custom pitch
      if (selectedAssistantId !== 'default' && selectedAssistant) {
        callPayload.assistantId = selectedAssistantId;
      }

      // Use multi-tenant endpoint if user is logged in, otherwise fall back to single-tenant
      const result = user?.id
        ? await vapiApi.initiateUserCall(user.id, callPayload)
        : await vapiApi.initiateCall(callPayload);

      setCallStatus(`✅ Call initiated! Call ID: ${result.callId || result.id}`);
      setSuccess(`Call to ${phoneNumber} initiated successfully!`);

      // Close panel after short delay
      setTimeout(() => {
        closePanel();
        setTestCallMode(false);
        setTestPhoneNumber('');
        if (!testCallMode) {
          loadLeads(); // Reload to update status
        }
      }, 2000);
    } catch (err) {
      setCallStatus(`Error: ${err.message}`);
      ErrorEvents.callError(err.message);
    } finally {
      setIsCalling(false);
    }
  };

  const getStatusBadge = (status) => {
    const variants = {
      new: 'info',
      contacted: 'warning',
      interested: 'success',
      rejected: 'destructive',
    };
    return <Badge variant={variants[status] || 'secondary'}>{status}</Badge>;
  };

  // Show hard paywall if user has exhausted free tier leads
  if (isFreeTier && shouldShowHardPaywall('leads')) {
    return (
      <HardPaywall
        type="leads"
        leadsUsed={leadsUsed}
        leadsLimit={leadsLimit}
        callsUsed={callsUsed}
        callsLimit={callsLimit}
      />
    );
  }

  return (
    <>
      {/* Soft Paywall Modal */}
      <PaywallModal
        isOpen={showPaywallModal}
        onClose={() => setShowPaywallModal(false)}
        type="leads"
        used={leadsUsed}
        limit={leadsLimit}
        remaining={leadsLimit - leadsUsed}
      />

    <div className={cn(
      "relative min-h-screen -mt-8 pt-8 px-4 overflow-hidden transition-all duration-300 ease-out",
      panelOpen ? "mr-[420px]" : "mr-0"
    )}>
      {/* Background Decorations */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full opacity-[0.02]"
          style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, var(--color-foreground) 1px, transparent 0)', backgroundSize: '32px 32px' }} />
        <div className="absolute top-[20%] right-[-5%] w-[30%] h-[30%] rounded-full bg-primary/5 blur-[100px]" />
        <div className="absolute bottom-[20%] left-[-5%] w-[30%] h-[30%] rounded-full bg-primary/5 blur-[100px]" />
      </div>

      <div className="relative z-10 space-y-8 pb-12">
        {/* Page Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 animate-fade-in">
          <div className="space-y-1">
            <div className="flex items-center gap-2 mb-1">
              <Badge variant="outline" className="px-2 py-0.5 border-primary/20 bg-primary/5 text-primary text-[10px] font-bold uppercase tracking-wider rounded-full">
                Lead Management
              </Badge>
            </div>
            <h1 className="text-4xl font-black tracking-tight bg-linear-to-br from-foreground to-foreground/60 bg-clip-text text-transparent">
              Find Leads
            </h1>
            <p className="text-muted-foreground font-medium">
              Scrape Google Maps or import your own leads to fuel your outreach
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              onClick={openTestCallModal}
              className="gap-2 border-primary/20 hover:bg-primary/5 text-primary rounded-xl"
            >
              <PhoneCall className="h-4 w-4" />
              Test Call
            </Button>
          </div>
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

        {/* Import Methods */}
        <Card className="border-white/20 bg-white/40 backdrop-blur-xl shadow-2xl animate-scale-in">
          <CardHeader className="pb-4 border-b border-border/10">
            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar scroll-smooth">
              {[
                { id: 'scrape', label: 'Scrape Google Maps', icon: Search },
                { id: 'file', label: 'Upload File', icon: Upload },
                { id: 'paste', label: 'Copy & Paste', icon: Copy }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setImportTab(tab.id)}
                  className={cn(
                    "flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold text-sm transition-all duration-300 relative shrink-0",
                    importTab === tab.id
                      ? "bg-primary text-white shadow-lg shadow-primary/20 scale-105"
                      : "text-muted-foreground hover:bg-primary/5 hover:text-primary"
                  )}
                >
                  <tab.icon className="h-4 w-4" />
                  {tab.label}
                </button>
              ))}
            </div>
          </CardHeader>
          <CardContent className="space-y-6 pt-6">
            {/* Scrape Tab */}
            {importTab === 'scrape' && (
              <>
                <div className="grid md:grid-cols-2 gap-8">
                  <FormGroup label="Business Type / Keyword" className="space-y-2">
                    <div className="relative group">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none group-focus-within:text-primary transition-colors">
                        <Sparkles className="h-4 w-4 text-muted-foreground" />
                      </div>
                      <Input
                        value={keyword}
                        onChange={(e) => setKeyword(e.target.value)}
                        placeholder="e.g., restaurants, dentists, plumbers"
                        disabled={isScraping}
                        className="pl-10 h-12 bg-white/50 border-white/20 hover:border-primary/30 focus:border-primary transition-all rounded-xl"
                      />
                    </div>
                  </FormGroup>
                  <FormGroup label="Location" className="space-y-2">
                    <div className="relative group">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none group-focus-within:text-primary transition-colors">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                      </div>
                      <Input
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                        placeholder="e.g., Dublin, Ireland"
                        disabled={isScraping}
                        className="pl-10 h-12 bg-white/50 border-white/20 hover:border-primary/30 focus:border-primary transition-all rounded-xl"
                      />
                    </div>
                  </FormGroup>
                </div>
                <div className="grid md:grid-cols-2 gap-8 pt-4">
                  <FormGroup label="Max Results" className="space-y-2">
                    <div className="relative">
                      <Users className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Select
                        value={maxResults}
                        onChange={(e) => setMaxResults(Number(e.target.value))}
                        disabled={isScraping}
                        className="pl-10 h-12 bg-white/50 border-white/20 rounded-xl"
                      >
                        <option value={10}>10 businesses</option>
                        <option value={20}>20 businesses</option>
                        <option value={50}>50 businesses</option>
                        <option value={100}>100 businesses</option>
                        <option value={200}>200 businesses</option>
                        <option value={500}>500 businesses</option>
                      </Select>
                    </div>
                  </FormGroup>
                  <div className="flex items-end pt-2 md:pt-0">
                    <Button
                      variant="gradient"
                      size="lg"
                      onClick={handleScrape}
                      disabled={isScraping || !keyword || !location}
                      className="w-full h-12 rounded-xl font-bold shadow-lg shadow-primary/20"
                    >
                      {isScraping ? (
                        <div className="flex items-center gap-2">
                          <Loader2 className="h-5 w-5 animate-spin" />
                          <span className="animate-pulse">{scrapeStatus}</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <Bot className="h-5 w-5" />
                          <span>Start Automated Search</span>
                        </div>
                      )}
                    </Button>
                  </div>
                </div>
                <div className="flex items-center gap-2 pt-2">
                  <div className="h-1 w-1 rounded-full bg-primary" />
                  <p className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground opacity-70">
                    Powered by Claude Sonnet AI Lead Generation
                  </p>
                </div>
              </>
            )}

            {/* File Upload Tab */}
            {importTab === 'file' && (
              <div className="space-y-6">
                <div className="border-2 border-dashed border-border rounded-xl p-8 text-center hover:border-primary/50 transition-colors">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".csv,.json"
                    onChange={handleFileUpload}
                    className="hidden"
                    id="file-upload"
                  />
                  <label htmlFor="file-upload" className="cursor-pointer space-y-4 block">
                    <div className="mx-auto w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                      <Upload className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium">Click to upload CSV or JSON file</p>
                      <p className="text-sm text-muted-foreground mt-1">
                        Or drag and drop your file here
                      </p>
                    </div>
                  </label>
                </div>

                <div className="flex items-center justify-between p-4 bg-secondary/50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <FileText className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="font-medium text-sm">Need a template?</p>
                      <p className="text-xs text-muted-foreground">
                        Download our sample CSV format
                      </p>
                    </div>
                  </div>
                  <Button variant="outline" size="sm" onClick={downloadSampleCSV}>
                    <Download className="h-4 w-4" />
                    Download Sample
                  </Button>
                </div>

                <div className="text-sm text-muted-foreground space-y-1">
                  <p className="font-medium">Required columns:</p>
                  <p><code className="bg-secondary px-1.5 py-0.5 rounded">name</code> and <code className="bg-secondary px-1.5 py-0.5 rounded">phone</code></p>
                  <p className="mt-2">Optional: email, address, city, website, category, rating</p>
                </div>
              </div>
            )}

            {/* Paste Tab */}
            {importTab === 'paste' && (
              <div className="space-y-4">
                <FormGroup label="Paste your data (CSV or JSON format)">
                  <Textarea
                    value={pasteData}
                    onChange={(e) => setPasteData(e.target.value)}
                    placeholder={`CSV format:
name,phone,email,address
"Joe's Pizza","+1-555-0123","joe@pizza.com","123 Main St"

OR JSON format:
[
  {"name": "Joe's Pizza", "phone": "+1-555-0123", "email": "joe@pizza.com"}
]`}
                    rows={10}
                    className="font-mono text-sm"
                  />
                </FormGroup>
                <div className="flex gap-3">
                  <Button
                    variant="gradient"
                    onClick={handlePasteImport}
                    disabled={isImporting || !pasteData.trim()}
                  >
                    {isImporting ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Importing...
                      </>
                    ) : (
                      <>
                        <Upload className="h-4 w-4" />
                        Import Leads
                      </>
                    )}
                  </Button>
                  <Button variant="outline" onClick={() => setPasteData('')}>
                    Clear
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
          {[
            { icon: Users, value: stats.total, label: "Total Prospecting", variant: "default", color: "text-primary", bg: "bg-primary/5" },
            { icon: UserPlus, value: stats.new, label: "New Leads", variant: "success", color: "text-success", bg: "bg-success/5" },
            { icon: Phone, value: stats.contacted, label: "Total Calls", variant: "warning", color: "text-warning", bg: "bg-warning/5" },
            { icon: UserCheck, value: stats.interested, label: "Interested", variant: "info", color: "text-info", bg: "bg-info/5" }
          ].map((stat, i) => (
            <Card key={i} className="group relative overflow-hidden border-white/20 bg-white/40 backdrop-blur-md hover:-translate-y-1 transition-all duration-300">
              <div className={cn("absolute top-0 right-0 w-24 h-24 -mr-8 -mt-8 rounded-full blur-3xl opacity-20", stat.bg)} />
              <CardContent className="pt-6 text-center">
                <div className={cn("mx-auto mb-4 w-12 h-12 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110 group-hover:rotate-3", stat.bg, stat.color)}>
                  <stat.icon className="h-6 w-6" />
                </div>
                <div className="space-y-1">
                  <p className="text-3xl font-black tracking-tighter">{stat.value}</p>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">{stat.label}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Leads Table */}
        <Card className="border-white/20 bg-white/20 backdrop-blur-md shadow-xl overflow-hidden">
          <CardHeader className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 px-6 bg-white/10 border-b border-border/10">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                <FileText className="h-4 w-4 text-primary" />
              </div>
              <CardTitle className="text-xl font-bold">Leads <span className="text-primary/50 text-sm font-black ml-1">({leads.length})</span></CardTitle>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-2 p-1 bg-white/20 rounded-xl border border-white/20">
                {[
                  { id: 'all', label: 'All Status' },
                  { id: 'new', label: 'New' },
                  { id: 'contacted', label: 'Contacted' },
                  { id: 'interested', label: 'Interested' }
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setFilter(tab.id)}
                    className={cn(
                      "px-3 py-1.5 rounded-lg text-xs font-bold transition-all",
                      filter === tab.id
                        ? "bg-white shadow-sm text-primary"
                        : "text-muted-foreground hover:bg-white/10"
                    )}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-2">
                <div className="relative">
                  <Tag className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Select
                    value={categoryFilter}
                    onChange={(e) => setCategoryFilter(e.target.value)}
                    className="pl-9 h-10 w-44 text-xs bg-white/20 border-white/20 rounded-xl"
                  >
                    <option value="all">Industries</option>
                    {categories.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </Select>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleClassifyAll}
                  disabled={isClassifying || allLeads.length === 0}
                  className="h-10 gap-2 text-xs border-primary/20 hover:bg-primary/5 text-primary rounded-xl"
                  title="Re-classify all leads into standardized industries using AI"
                >
                  {isClassifying ? (
                    <>
                      <Loader2 className="h-3 w-3 animate-spin" />
                      {classifyProgress || 'Classifying...'}
                    </>
                  ) : (
                    <>
                      <Wand2 className="h-3 w-3" />
                      Classify All
                    </>
                  )}
                </Button>
              </div>

              {(filter !== 'all' || categoryFilter !== 'all' || locationFilter !== 'all') && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => { setFilter('all'); setCategoryFilter('all'); setLocationFilter('all'); }}
                  className="text-[10px] font-black uppercase tracking-widest text-muted-foreground hover:text-primary transition-colors"
                >
                  <X className="h-3 w-3 mr-1" />
                  Reset
                </Button>
              )}

              {selectedLeads.length > 0 && (
                <Button
                  variant="gradient"
                  size="sm"
                  onClick={startCampaignWithSelected}
                  className="h-10 px-6 rounded-xl font-bold shadow-lg shadow-primary/15 animate-in slide-in-from-right-4"
                >
                  <Phone className="h-4 w-4 mr-2" />
                  Call {selectedLeads.length} Selected
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {leads.length === 0 ? (
              <div className="p-8">
                <EmptyState
                  title="No leads yet"
                  description="Scrape Google Maps or import a file to get started"
                  icon={Users}
                />
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader className="bg-muted/30">
                    <TableRow className="border-border/50 hover:bg-transparent">
                      <TableHead className="w-14 text-center">
                        <button
                          onClick={toggleSelectAll}
                          className="w-6 h-6 rounded-md border-2 border-primary/20 flex items-center justify-center transition-all hover:bg-primary/5 active:scale-90"
                        >
                          {selectedLeads.length === leads.length ? (
                            <div className="w-3 h-3 bg-primary rounded-[2px]" />
                          ) : selectedLeads.length > 0 ? (
                            <div className="w-3 h-[2px] bg-primary/50 rounded-full" />
                          ) : null}
                        </button>
                      </TableHead>
                      <TableHead className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Business Details</TableHead>
                      <TableHead className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Contact</TableHead>
                      <TableHead className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Industry</TableHead>
                      <TableHead className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Rating</TableHead>
                      <TableHead className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Status</TableHead>
                      <TableHead className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground text-right pr-6">Management</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {leads.map((lead, index) => (
                      <TableRow key={`${lead.id}-${index}`} className={cn(
                        selectedLeads.includes(lead.id) && "bg-primary/5"
                      )}>
                        <TableCell>
                          <button onClick={() => toggleSelectLead(lead.id)} className="p-1">
                            {selectedLeads.includes(lead.id) ? (
                              <CheckSquare className="h-5 w-5 text-primary" />
                            ) : (
                              <Square className="h-5 w-5" />
                            )}
                          </button>
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium">{lead.name}</p>
                            {lead.address && (
                              <p className="text-xs text-muted-foreground truncate max-w-[200px]">
                                {lead.address}
                              </p>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <a
                            href={`tel:${lead.phone}`}
                            className="text-primary hover:underline flex items-center gap-1"
                          >
                            <Phone className="h-3 w-3" />
                            {lead.phone}
                          </a>
                        </TableCell>
                        <TableCell>
                          {lead.category && (
                            <Badge variant="secondary">{lead.category}</Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          {lead.rating && (
                            <div className="flex items-center gap-1">
                              <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                              <span>{lead.rating}</span>
                              {lead.review_count && (
                                <span className="text-xs text-muted-foreground">
                                  ({lead.review_count})
                                </span>
                              )}
                            </div>
                          )}
                        </TableCell>
                        <TableCell>{getStatusBadge(lead.status)}</TableCell>
                        <TableCell className="text-right pr-6">
                          <div className="flex items-center justify-end gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => openPanel('call', lead)}
                              className="h-8 w-8 p-0 text-primary hover:text-primary hover:bg-primary/10 rounded-lg transition-transform hover:scale-110"
                              title="Call lead"
                            >
                              <PhoneCall className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => openPanel('edit', lead)}
                              className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground hover:bg-secondary rounded-lg transition-transform hover:scale-110"
                              title="Edit lead"
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            {(lead.google_maps_url || lead.latitude) && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => openPanel('location', lead)}
                                className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground hover:bg-secondary rounded-lg transition-transform hover:scale-110"
                                title="View location"
                              >
                                <MapPin className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Side Panel */}
        {panelOpen && selectedLead && (
          <div className="fixed right-0 top-0 h-full w-[420px] z-40 bg-card border-l border-border shadow-2xl animate-slide-in-right overflow-hidden flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-border shrink-0">
              <div>
                <h2 className="text-xl font-semibold">
                  {panelType === 'call' && (testCallMode ? '🧪 Test Call' : `Call ${selectedLead.name}`)}
                  {panelType === 'edit' && `Edit ${selectedLead.name}`}
                  {panelType === 'location' && `Location: ${selectedLead.name}`}
                </h2>
                {panelType === 'call' && !testCallMode && (
                  <p className="text-sm text-muted-foreground mt-1">
                    <Phone className="h-3 w-3 inline mr-1" />
                    {selectedLead.phone}
                  </p>
                )}
                {panelType === 'edit' && selectedLead.category && (
                  <Badge variant="secondary" className="mt-1">{selectedLead.category}</Badge>
                )}
              </div>
              <button
                onClick={closePanel}
                className="p-2 hover:bg-secondary rounded-lg transition-colors"
                disabled={isCalling}
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {/* CALL PANEL */}
              {panelType === 'call' && (
                <>
                  {callStatus && (
                    <Alert variant={callStatus.includes('Error') ? 'destructive' : 'info'}>
                      <AlertDescription>{callStatus}</AlertDescription>
                    </Alert>
                  )}

                  {/* Phone Number Input - only for test mode */}
                  {testCallMode && (
                    <FormGroup label="Phone Number">
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          value={testPhoneNumber}
                          onChange={(e) => setTestPhoneNumber(e.target.value)}
                          placeholder="+1234567890"
                          className="pl-10 font-mono"
                          disabled={isCalling}
                        />
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        Enter phone number with country code (e.g., +353 for Ireland, +1 for USA)
                      </p>
                    </FormGroup>
                  )}

                  {/* Call Now vs Schedule Toggle */}
                  <div className="flex gap-2 p-1 bg-muted rounded-lg">
                    <button
                      type="button"
                      onClick={() => setIsScheduleMode(false)}
                      className={cn(
                        "flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all",
                        !isScheduleMode
                          ? "bg-background shadow-sm text-foreground"
                          : "text-muted-foreground hover:text-foreground"
                      )}
                      disabled={isCalling}
                    >
                      <PhoneCall className="h-4 w-4" />
                      Call Now
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsScheduleMode(true)}
                      className={cn(
                        "flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all",
                        isScheduleMode
                          ? "bg-background shadow-sm text-foreground"
                          : "text-muted-foreground hover:text-foreground"
                      )}
                      disabled={isCalling}
                    >
                      <Calendar className="h-4 w-4" />
                      Schedule
                    </button>
                  </div>

                  {/* Schedule Date/Time Picker */}
                  {isScheduleMode && (
                    <FormGroup label="Schedule Date & Time">
                      <div className="relative">
                        <Clock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          type="datetime-local"
                          value={scheduledDateTime}
                          onChange={(e) => setScheduledDateTime(e.target.value)}
                          min={new Date().toISOString().slice(0, 16)}
                          className="pl-10"
                          disabled={isCalling}
                        />
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        The call will be automatically made at this time. If it fails, it will retry up to 3 times.
                      </p>
                    </FormGroup>
                  )}

                  {/* Assistant Selector */}
                  <FormGroup label="AI Assistant">
                    <div className="relative">
                      <Bot className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Select
                        value={selectedAssistantId}
                        onChange={(e) => setSelectedAssistantId(e.target.value)}
                        className="pl-10"
                        disabled={loadingAssistants}
                      >
                        <option value="default">📝 Custom (enter product details below)</option>
                        {loadingAssistants && (
                          <option disabled>Loading assistants...</option>
                        )}
                        {assistants.map((assistant) => (
                          <option key={assistant.id} value={assistant.id}>
                            🤖 {assistant.name}
                          </option>
                        ))}
                      </Select>
                    </div>
                  </FormGroup>

                  {/* Show assistant details if a pre-configured one is selected */}
                  {selectedAssistantId !== 'default' && selectedAssistant && (
                    <div className="bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20 rounded-lg p-4 space-y-3">
                      <div className="flex items-center gap-2">
                        <Bot className="h-5 w-5 text-primary" />
                        <h3 className="font-semibold">{selectedAssistant.name}</h3>
                      </div>
                      <div className="grid grid-cols-2 gap-3 text-sm">
                        <div className="flex items-center gap-2 bg-background/50 rounded-lg p-2">
                          <Volume2 className="h-4 w-4 text-muted-foreground" />
                          <div>
                            <p className="text-xs text-muted-foreground">Voice</p>
                            <p className="font-medium capitalize">
                              {selectedAssistant.voice?.provider || 'Default'}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 bg-background/50 rounded-lg p-2">
                          <Sparkles className="h-4 w-4 text-muted-foreground" />
                          <div>
                            <p className="text-xs text-muted-foreground">Model</p>
                            <p className="font-medium">
                              {selectedAssistant.model?.model || 'Default'}
                            </p>
                          </div>
                        </div>
                      </div>
                      {selectedAssistant.firstMessage && (
                        <div className="text-sm">
                          <p className="text-xs text-muted-foreground mb-1">First Message</p>
                          <p className="text-muted-foreground italic">
                            "{selectedAssistant.firstMessage.slice(0, 80)}..."
                          </p>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Product/Context fields */}
                  <FormGroup label="Your Product / Service">
                    <div className="space-y-2">
                      <div className="relative">
                        <MessageSquare className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Textarea
                          value={productIdea}
                          onChange={(e) => setProductIdea(e.target.value)}
                          placeholder="e.g., We're building an AI assistant that helps real estate agents..."
                          rows={3}
                          className="pl-10"
                        />
                      </div>
                      <AIGenerator
                        type="product"
                        placeholder="Describe your product in simple words..."
                        onGenerate={setProductIdea}
                      />
                    </div>
                  </FormGroup>

                  <FormGroup label="Company Context (optional)">
                    <div className="space-y-2">
                      <div className="relative">
                        <Building2 className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Textarea
                          value={companyContext}
                          onChange={(e) => setCompanyContext(e.target.value)}
                          placeholder="e.g., ValidateCall is an AI-powered market research platform..."
                          rows={3}
                          className="pl-10"
                        />
                      </div>
                      <AIGenerator
                        type="context"
                        placeholder="Describe your company in simple words..."
                        onGenerate={setCompanyContext}
                      />
                    </div>
                  </FormGroup>

                  <div className="bg-secondary/50 rounded-lg p-4 text-sm">
                    <p className="font-medium mb-2">The AI will:</p>
                    <ul className="space-y-1 text-muted-foreground">
                      <li>• Introduce itself and explain your product/service</li>
                      <li>• Ask if they would be interested</li>
                      <li>• Gather feedback on pricing and features</li>
                      <li>• Keep the call under 2 minutes</li>
                    </ul>
                  </div>
                </>
              )}

              {/* EDIT PANEL */}
              {panelType === 'edit' && (
                <>
                  <FormGroup label="Business Name">
                    <Input defaultValue={selectedLead.name} />
                  </FormGroup>
                  <FormGroup label="Phone">
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input defaultValue={selectedLead.phone} className="pl-10" />
                    </div>
                  </FormGroup>
                  <FormGroup label="Category">
                    <Input defaultValue={selectedLead.category || ''} />
                  </FormGroup>
                  <FormGroup label="Address">
                    <div className="relative">
                      <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input defaultValue={selectedLead.address || ''} className="pl-10" />
                    </div>
                  </FormGroup>
                  <FormGroup label="Website">
                    <div className="relative">
                      <Globe className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input defaultValue={selectedLead.website || ''} className="pl-10" />
                    </div>
                  </FormGroup>
                  <FormGroup label="Status">
                    <Select defaultValue={selectedLead.status || 'new'}>
                      <option value="new">New</option>
                      <option value="contacted">Contacted</option>
                      <option value="interested">Interested</option>
                      <option value="rejected">Rejected</option>
                    </Select>
                  </FormGroup>
                </>
              )}

              {/* LOCATION PANEL */}
              {panelType === 'location' && (
                <>
                  <div className="space-y-4">
                    <div className="bg-secondary/50 rounded-lg p-4">
                      <h3 className="font-medium mb-2 flex items-center gap-2">
                        <MapPin className="h-4 w-4" />
                        Address
                      </h3>
                      <p className="text-muted-foreground">
                        {selectedLead.address || 'No address available'}
                      </p>
                      {selectedLead.city && (
                        <p className="text-muted-foreground">{selectedLead.city}</p>
                      )}
                    </div>

                    {selectedLead.google_maps_url && (
                      <a
                        href={selectedLead.google_maps_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 text-primary hover:underline"
                      >
                        <ExternalLink className="h-4 w-4" />
                        Open in Google Maps
                      </a>
                    )}

                    {selectedLead.latitude && selectedLead.longitude && (
                      <div className="bg-secondary/50 rounded-lg p-4">
                        <h3 className="font-medium mb-2">Coordinates</h3>
                        <p className="text-sm text-muted-foreground font-mono">
                          {selectedLead.latitude}, {selectedLead.longitude}
                        </p>
                      </div>
                    )}

                    {/* Embedded Map */}
                    {selectedLead.latitude && selectedLead.longitude && (
                      <div className="rounded-lg overflow-hidden border border-border">
                        <iframe
                          title="Location Map"
                          width="100%"
                          height="250"
                          frameBorder="0"
                          style={{ border: 0 }}
                          src={`https://www.google.com/maps/embed/v1/place?key=AIzaSyBFw0Qbyq9zTFTd-tUY6dZWTgaQzuU17R8&q=${selectedLead.latitude},${selectedLead.longitude}&zoom=15`}
                          allowFullScreen
                        />
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>

            {/* Footer */}
            <div className="flex gap-3 p-6 border-t border-border shrink-0">
              <Button
                variant="outline"
                onClick={closePanel}
                disabled={isCalling}
                className="flex-1"
              >
                {panelType === 'location' ? 'Close' : 'Cancel'}
              </Button>
              {panelType === 'call' && (
                <Button
                  variant="gradient"
                  onClick={handleInitiateCall}
                  disabled={
                    isCalling ||
                    (testCallMode && !testPhoneNumber.trim()) ||
                    !productIdea.trim() ||
                    (isScheduleMode && !scheduledDateTime)
                  }
                  className="flex-1"
                >
                  {isCalling ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      {isScheduleMode ? 'Scheduling...' : 'Calling...'}
                    </>
                  ) : isScheduleMode ? (
                    <>
                      <Calendar className="h-4 w-4" />
                      Schedule Call
                    </>
                  ) : (
                    <>
                      <PhoneCall className="h-4 w-4" />
                      Start Call
                    </>
                  )}
                </Button>
              )}
              {panelType === 'edit' && (
                <Button variant="gradient" className="flex-1">
                  <Pencil className="h-4 w-4" />
                  Save Changes
                </Button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
    </>
  );
}

export default Leads;
