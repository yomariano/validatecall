import LeadImportForm from '@/components/leads/LeadImportForm';
import LeadResultsTable from '@/components/leads/LeadResultsTable';
import LeadDetailsPanel from '@/components/leads/LeadDetailsPanel';
import { useState, useEffect, useRef, useMemo } from "react";
import { useNavigate } from 'react-router-dom';
import { scrapeAndWait } from '../services/leads';
import { saveLeads, getLeads, getLeadsStats } from '../services/database';
import { vapiApi, scheduledApi, claudeApi, dataApi } from '../services/api';
import { useAuth } from '@/hooks/useAuth';
import { useUsage } from '@/hooks/useUsage';
import { useOnboarding } from '@/hooks/useOnboarding';
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
  MapPinned,
  Mail,
  RefreshCw
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
  const [websiteInput, setWebsiteInput] = useState('');
  const startingUrls = websiteInput.split(/[\s,]+/).filter(Boolean);
  const [maxResults, setMaxResults] = useState(10);
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
  const [preTestPhoneNumber, setPreTestPhoneNumber] = useState('');
  const [isTestCalling, setIsTestCalling] = useState(false);
  const [testCallStatus, setTestCallStatus] = useState('');

  // Classification state
  const [isClassifying, setIsClassifying] = useState(false);
  const [classifyProgress, setClassifyProgress] = useState('');

  // Scheduling state
  const [isScheduleMode, setIsScheduleMode] = useState(false);
  const [scheduledDateTime, setScheduledDateTime] = useState('');

  // Email state
  const [emailSubject, setEmailSubject] = useState('');
  const [emailBody, setEmailBody] = useState('');
  const [isGeneratingEmail, setIsGeneratingEmail] = useState(false);
  const [isSendingEmail, setIsSendingEmail] = useState(false);
  const [emailStatus, setEmailStatus] = useState('');

  // Edit panel state
  const [editName, setEditName] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editCategory, setEditCategory] = useState('');
  const [editAddress, setEditAddress] = useState('');
  const [editWebsite, setEditWebsite] = useState('');
  const [editStatus, setEditStatus] = useState('new');
  const [editCity, setEditCity] = useState('');
  const [isSavingEdit, setIsSavingEdit] = useState(false);

  // Column search filters
  const [searchName, setSearchName] = useState('');
  const [searchPhone, setSearchPhone] = useState('');
  const [searchEmail, setSearchEmail] = useState('');
  const [searchCity, setSearchCity] = useState('');
  const [searchIndustry, setSearchIndustry] = useState('');
  const [searchRatingMin, setSearchRatingMin] = useState('');
  const [searchStatus, setSearchStatus] = useState('');

  // Debounce ref to prevent rapid double-clicks on search
  const scrapeInProgressRef = useRef(false);


  // Load all leads once, then filter client-side
  useEffect(() => {
    loadLeads();
  }, []);

  // Apply filters using useMemo (more efficient than useEffect + setState)
  const filteredLeads = useMemo(() => {
    let filtered = allLeads;

    // Status filter (header tabs)
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

    // Location filter (dropdown)
    if (locationFilter !== 'all') {
      filtered = filtered.filter(l =>
        l.search_location === locationFilter || l.city === locationFilter
      );
    }

    // Column-specific search filters
    if (searchName.trim()) {
      const term = searchName.toLowerCase().trim();
      filtered = filtered.filter(l =>
        l.name?.toLowerCase().includes(term) ||
        l.address?.toLowerCase().includes(term)
      );
    }

    if (searchPhone.trim()) {
      const term = searchPhone.trim().replace(/[^0-9+]/g, '');
      filtered = filtered.filter(l =>
        l.phone?.replace(/[^0-9+]/g, '').includes(term)
      );
    }

    if (searchEmail.trim()) {
      const term = searchEmail.toLowerCase().trim();
      filtered = filtered.filter(l =>
        l.email?.toLowerCase().includes(term)
      );
    }

    if (searchCity.trim()) {
      const term = searchCity.toLowerCase().trim();
      filtered = filtered.filter(l =>
        l.city?.toLowerCase().includes(term) ||
        l.search_location?.toLowerCase().includes(term)
      );
    }

    if (searchIndustry.trim()) {
      const term = searchIndustry.toLowerCase().trim();
      filtered = filtered.filter(l =>
        l.category?.toLowerCase().includes(term)
      );
    }

    if (searchRatingMin.trim()) {
      const minRating = parseFloat(searchRatingMin);
      if (!isNaN(minRating)) {
        filtered = filtered.filter(l =>
          l.rating && l.rating >= minRating
        );
      }
    }

    if (searchStatus.trim()) {
      const term = searchStatus.toLowerCase().trim();
      filtered = filtered.filter(l =>
        l.status?.toLowerCase().includes(term)
      );
    }

    return filtered;
  }, [allLeads, filter, categoryFilter, locationFilter, searchName, searchPhone, searchEmail, searchCity, searchIndustry, searchRatingMin, searchStatus]);

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
      console.log('[Leads] Loading leads from database...');
      const [leadsData, statsData] = await Promise.all([
        getLeads({}), // Load all leads, filter client-side
        getLeadsStats(),
      ]);

      console.log('[Leads] Loaded leads:', leadsData?.length, 'leads');
      console.log('[Leads] First lead sample:', leadsData?.[0]);
      setAllLeads(leadsData || []);
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
          await dataApi.updateLeadIndustries(classifications);
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
    setScrapeStatus('Searching business sources...');

    // Track scrape started
    LeadEvents.scrapeStarted(keyword, location, maxResults);

    try {
      const results = await scrapeAndWait(
        { keyword, location, maxResults, userId: user?.id, startingUrls },
        (status) => setScrapeStatus(status.message)
      );

      setScrapeStatus(`Found ${results.length} businesses with sourced contact details`);
      console.log('[Leads] Generated leads:', results);

      try {
        console.log('[Leads] Saving leads to database...');
        const { saved, duplicates } = await saveLeads(results, keyword, location);
        console.log('[Leads] Save result:', { saved, duplicates });
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
      } catch (saveErr) {
        console.error('Save leads error:', saveErr);
        setSuccess('');
        setError(saveErr.message || 'Could not save your leads. Please try again.');
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
    } catch  {
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
      } catch (saveErr) {
        setSuccess('');
        setError(saveErr.message || 'Could not save your contacts. Please try the import again.');
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
      } catch (saveErr) {
        setSuccess('');
        setError(saveErr.message || 'Could not save your contacts. Your pasted data is still available to retry.');
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
    setPreTestPhoneNumber('');
    setTestCallStatus('');
    setIsScheduleMode(false);
    setScheduledDateTime('');
    setSelectedLead(lead || (type === 'test-call' ? { name: 'Test Call', phone: '' } : null));
    setCallStatus('');
    // Reset email state when opening panel
    setEmailSubject('');
    setEmailBody('');
    setEmailStatus('');
    setIsGeneratingEmail(false);
    setIsSendingEmail(false);
    // Initialize edit form state when opening edit panel
    if (type === 'edit' && lead) {
      setEditName(lead.name || '');
      setEditPhone(lead.phone || '');
      setEditEmail(lead.email || '');
      setEditCategory(lead.category || '');
      setEditAddress(lead.address || '');
      setEditWebsite(lead.website || '');
      setEditStatus(lead.status || 'new');
      setEditCity(lead.city || '');
    }
    setPanelType(type === 'test-call' ? 'call' : type);
    setPanelOpen(true);
  };

  // Close side panel
  const closePanel = () => {
    if (!isCalling && !isSendingEmail && !isSavingEdit) {
      setPanelOpen(false);
      setPanelType(null);
      setSelectedLead(null);
    }
  };

  // Legacy function aliases for compatibility

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
          assistantId: selectedAssistantId !== 'default' ? selectedAssistantId : undefined,
        };

        await scheduledApi.scheduleCall(schedulePayload);

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
      };

      // If using a pre-configured assistant, pass its ID
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

  // Handle pre-test call before making the actual call
  const handlePreTestCall = async () => {
    const phoneNumber = preTestPhoneNumber.trim();

    // Validate phone number
    if (!phoneNumber) {
      setTestCallStatus('Error: Please enter a phone number');
      return;
    }

    setIsTestCalling(true);
    setTestCallStatus('Initiating test call...');

    LeadEvents.testCallInitiated();

    try {
      const callPayload = {
        phoneNumber,
        customerName: 'Test Call',
      };

      // Use assistant if selected
      if (selectedAssistantId !== 'default') {
        callPayload.assistantId = selectedAssistantId;
      }

      const result = user?.id
        ? await vapiApi.initiateUserCall(user.id, callPayload)
        : await vapiApi.initiateCall(callPayload);

      setTestCallStatus(`✅ Test call initiated! Call ID: ${result.callId || result.id}`);

      // Clear test phone number after successful call
      setTimeout(() => {
        setPreTestPhoneNumber('');
        setTestCallStatus('');
      }, 3000);
    } catch (err) {
      setTestCallStatus(`Error: ${err.message}`);
      ErrorEvents.callError(err.message);
    } finally {
      setIsTestCalling(false);
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
      "relative min-h-screen -mt-8 pt-8 px-2 sm:px-4 overflow-hidden transition-all duration-300 ease-out",
      panelOpen ? "lg:mr-[420px]" : "mr-0"
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
            <h1 className="text-2xl sm:text-4xl font-black tracking-tight bg-linear-to-br from-foreground to-foreground/60 bg-clip-text text-transparent">
              Find Leads
            </h1>
            <p className="text-muted-foreground font-medium">
              Research business sources or import your own contacts for outreach
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
        <LeadImportForm {...{ setImportTab, importTab, keyword, setKeyword, isScraping, location, setLocation, websiteInput, setWebsiteInput, startingUrls, maxResults, setMaxResults, handleScrape, scrapeStatus, fileInputRef, handleFileUpload, downloadSampleCSV, pasteData, setPasteData, handlePasteImport, isImporting }} />

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-8">
          {[
            { icon: Users, value: stats.total, label: "Total Prospecting", variant: "default", color: "text-primary", bg: "bg-primary/5" },
            { icon: UserPlus, value: stats.new, label: "New Leads", variant: "success", color: "text-success", bg: "bg-success/5" },
            { icon: Phone, value: stats.contacted, label: "Total Calls", variant: "warning", color: "text-warning", bg: "bg-warning/5" },
            { icon: UserCheck, value: stats.interested, label: "Interested", variant: "info", color: "text-info", bg: "bg-info/5" }
          ].map((stat, i) => (
            <Card key={i} className="group relative overflow-hidden border-white/20 bg-white/40 backdrop-blur-md hover:-translate-y-1 transition-all duration-300">
              <div className={cn("absolute top-0 right-0 w-24 h-24 -mr-8 -mt-8 rounded-full blur-3xl opacity-20", stat.bg)} />
              <CardContent className="pt-4 sm:pt-6 text-center">
                <div className={cn("mx-auto mb-2 sm:mb-4 w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110 group-hover:rotate-3", stat.bg, stat.color)}>
                  <stat.icon className="h-5 w-5 sm:h-6 sm:w-6" />
                </div>
                <div className="space-y-0.5 sm:space-y-1">
                  <p className="text-xl sm:text-3xl font-black tracking-tighter">{stat.value}</p>
                  <p className="text-[8px] sm:text-[10px] font-bold uppercase tracking-widest text-muted-foreground">{stat.label}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Leads Table */}
        <LeadResultsTable {...{ leads, setFilter, filter, categoryFilter, setCategoryFilter, categories, handleClassifyAll, isClassifying, allLeads, classifyProgress, locationFilter, searchName, searchPhone, searchEmail, searchCity, searchIndustry, searchRatingMin, searchStatus, setLocationFilter, setSearchName, setSearchPhone, setSearchEmail, setSearchCity, setSearchIndustry, setSearchRatingMin, setSearchStatus, selectedLeads, startCampaignWithSelected, toggleSelectAll, toggleSelectLead, getStatusBadge, openPanel }} />

        {/* Side Panel Overlay (mobile) */}
        {panelOpen && (
          <div
            className="fixed inset-0 z-30 bg-black/50 lg:hidden"
            onClick={closePanel}
          />
        )}
        {/* Side Panel */}
        {panelOpen && selectedLead && (
          <LeadDetailsPanel {...{ panelType, testCallMode, selectedLead, closePanel, isCalling, isSendingEmail, isSavingEdit, callStatus, testPhoneNumber, setTestPhoneNumber, setIsScheduleMode, isScheduleMode, scheduledDateTime, setScheduledDateTime, selectedAssistantId, setSelectedAssistantId, loadingAssistants, assistants, selectedAssistant, testCallStatus, preTestPhoneNumber, setPreTestPhoneNumber, isTestCalling, handlePreTestCall, editName, setEditName, editPhone, setEditPhone, editEmail, setEditEmail, editCategory, setEditCategory, editCity, setEditCity, editAddress, setEditAddress, editWebsite, setEditWebsite, editStatus, setEditStatus, emailStatus, productIdea, setProductIdea, companyContext, setCompanyContext, setEmailStatus, setIsGeneratingEmail, user, setEmailSubject, setEmailBody, isGeneratingEmail, emailSubject, emailBody, handleInitiateCall, setIsSendingEmail, setSuccess, loadLeads, setIsSavingEdit, setError }} />
        )}
      </div>
    </div>
    </>
  );
}

export default Leads;
