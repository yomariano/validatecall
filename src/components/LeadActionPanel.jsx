import { useState, useEffect } from 'react';
import { vapiApi, scheduledApi, claudeApi, supabaseApi, emailApi } from '../services/api';
import { useAuth } from '../context/AuthContext';
import {
  Phone,
  X,
  MessageSquare,
  Building2,
  Bot,
  Volume2,
  Clock,
  Calendar,
  Pencil,
  Globe,
  Wand2,
  Send,
  Tag,
  MapPin,
  Star,
  Mail,
  Loader2,
  PhoneCall,
  Sparkles,
  MapPinned,
  RefreshCw
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Input, Select, Label, FormGroup, Textarea } from '@/components/ui/input';
import { cn } from '@/lib/utils';

// AI Generator sub-component
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
      />
      <Button
        size="sm"
        onClick={handleGenerate}
        disabled={isGenerating || !input.trim()}
      >
        {isGenerating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Wand2 className="h-4 w-4" />}
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setIsOpen(false)}
      >
        <X className="h-4 w-4" />
      </Button>
    </div>
  );
}

export default function LeadActionPanel({
  isOpen,
  onClose,
  lead,
  panelType, // 'call', 'email', 'edit'
  onSuccess,
  onLeadUpdated,
  // Campaign-level defaults (optional)
  campaignDefaults = {},
}) {
  const { user } = useAuth();

  // Call state
  const [productIdea, setProductIdea] = useState('');
  const [companyContext, setCompanyContext] = useState('');
  const [isCalling, setIsCalling] = useState(false);
  const [callStatus, setCallStatus] = useState('');
  const [isScheduleMode, setIsScheduleMode] = useState(false);
  const [scheduledDateTime, setScheduledDateTime] = useState('');

  // Assistants state
  const [assistants, setAssistants] = useState([]);
  const [selectedAssistantId, setSelectedAssistantId] = useState('default');
  const [loadingAssistants, setLoadingAssistants] = useState(false);

  // Email state
  const [emailSubject, setEmailSubject] = useState('');
  const [emailBody, setEmailBody] = useState('');
  const [isGeneratingEmail, setIsGeneratingEmail] = useState(false);
  const [isSendingEmail, setIsSendingEmail] = useState(false);
  const [emailStatus, setEmailStatus] = useState('');

  // Edit state
  const [editName, setEditName] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editCategory, setEditCategory] = useState('');
  const [editAddress, setEditAddress] = useState('');
  const [editWebsite, setEditWebsite] = useState('');
  const [editStatus, setEditStatus] = useState('new');
  const [editCity, setEditCity] = useState('');
  const [isSavingEdit, setIsSavingEdit] = useState(false);

  // Load assistants on mount
  useEffect(() => {
    const loadAssistants = async () => {
      setLoadingAssistants(true);
      try {
        const data = await vapiApi.getAssistants();
        setAssistants(data || []);
      } catch (err) {
        console.error('Failed to load assistants:', err);
      } finally {
        setLoadingAssistants(false);
      }
    };
    if (isOpen && panelType === 'call') {
      loadAssistants();
    }
  }, [isOpen, panelType]);

  // Initialize form when lead changes or panel opens
  useEffect(() => {
    if (isOpen && lead) {
      // Reset states
      setCallStatus('');
      setEmailStatus('');
      setIsScheduleMode(false);
      setScheduledDateTime('');

      // Initialize call panel with campaign defaults
      if (panelType === 'call') {
        setProductIdea(campaignDefaults.callPitch || '');
        setCompanyContext(campaignDefaults.companyContext || '');
      }

      // Initialize email panel with campaign defaults
      if (panelType === 'email') {
        setProductIdea(campaignDefaults.companyContext || '');
        setCompanyContext('');

        // Personalize subject and body with lead data
        const personalize = (text) => {
          if (!text) return '';
          return text
            .replace(/\{\{businessName\}\}/g, lead.name || '')
            .replace(/\{\{city\}\}/g, lead.city || '')
            .replace(/\{\{industry\}\}/g, lead.category || '')
            .replace(/\[Business Name\]/g, lead.name || ''); // Legacy support
        };

        setEmailSubject(personalize(campaignDefaults.emailSubject || ''));
        setEmailBody(personalize(campaignDefaults.emailBody || ''));
      }

      // Initialize edit form
      if (panelType === 'edit') {
        setEditName(lead.name || '');
        setEditPhone(lead.phone || '');
        setEditEmail(lead.email || '');
        setEditCategory(lead.category || '');
        setEditAddress(lead.address || '');
        setEditWebsite(lead.website || '');
        setEditStatus(lead.status || 'new');
        setEditCity(lead.city || '');
      }
    }
  }, [isOpen, lead, panelType, campaignDefaults]);

  const selectedAssistant = assistants.find(a => a.id === selectedAssistantId);

  const handleClose = () => {
    if (!isCalling && !isSendingEmail && !isSavingEdit) {
      onClose();
    }
  };

  // Handle call initiation
  const handleInitiateCall = async () => {
    const phoneNumber = lead?.phone;
    if (!phoneNumber) {
      setCallStatus('Error: Phone number is required');
      return;
    }
    if (!productIdea.trim()) {
      setCallStatus('Error: Please enter your product/service description');
      return;
    }
    if (isScheduleMode && !scheduledDateTime) {
      setCallStatus('Error: Please select a date and time');
      return;
    }
    if (isScheduleMode) {
      const scheduledTime = new Date(scheduledDateTime);
      if (scheduledTime <= new Date()) {
        setCallStatus('Error: Scheduled time must be in the future');
        return;
      }
    }

    setIsCalling(true);
    setCallStatus(isScheduleMode ? 'Scheduling call...' : 'Initiating call...');

    try {
      if (isScheduleMode) {
        const schedulePayload = {
          userId: user?.id,
          leadId: lead?.id,
          phoneNumber,
          customerName: lead?.name || 'Prospect',
          scheduledAt: new Date(scheduledDateTime).toISOString(),
          productIdea: productIdea.trim(),
          companyContext: companyContext.trim() || undefined,
          assistantId: selectedAssistantId !== 'default' ? selectedAssistantId : undefined,
        };
        await scheduledApi.scheduleCall(schedulePayload);
        const scheduledTime = new Date(scheduledDateTime).toLocaleString();
        setCallStatus(`✅ Call scheduled for ${scheduledTime}`);
        onSuccess?.(`Call to ${phoneNumber} scheduled for ${scheduledTime}`);
        setTimeout(() => {
          handleClose();
          onLeadUpdated?.();
        }, 2000);
        return;
      }

      // Immediate call
      const callPayload = {
        phoneNumber,
        customerName: lead?.name || 'Prospect',
        productIdea: productIdea.trim(),
        companyContext: companyContext.trim() || undefined,
      };
      if (selectedAssistantId !== 'default' && selectedAssistant) {
        callPayload.assistantId = selectedAssistantId;
      }

      const result = user?.id
        ? await vapiApi.initiateUserCall(user.id, callPayload)
        : await vapiApi.initiateCall(callPayload);

      setCallStatus(`✅ Call initiated! Call ID: ${result.callId || result.id}`);
      onSuccess?.(`Call to ${phoneNumber} initiated successfully!`);
      setTimeout(() => {
        handleClose();
        onLeadUpdated?.();
      }, 2000);
    } catch (err) {
      setCallStatus(`Error: ${err.message}`);
    } finally {
      setIsCalling(false);
    }
  };

  // Handle email generation
  const handleGenerateEmail = async () => {
    if (!productIdea.trim()) {
      setEmailStatus('Error: Please describe your product/service first');
      return;
    }
    setIsGeneratingEmail(true);
    setEmailStatus('Generating personalized email with AI...');
    try {
      const result = await emailApi.generateColdEmail({
        lead,
        productIdea: productIdea.trim(),
        companyContext: companyContext.trim() || undefined,
        senderName: user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Your Name',
      });
      if (result.success && result.email) {
        setEmailSubject(result.email.subject);
        setEmailBody(result.email.body);
        setEmailStatus('');
      } else {
        setEmailStatus('Error: Failed to generate email');
      }
    } catch (err) {
      setEmailStatus(`Error: ${err.message}`);
    } finally {
      setIsGeneratingEmail(false);
    }
  };

  // Handle email sending
  const handleSendEmail = async () => {
    if (!lead.email) {
      setEmailStatus('Error: This lead has no email address');
      return;
    }
    if (!emailSubject.trim() || !emailBody.trim()) {
      setEmailStatus('Error: Please generate or write an email first');
      return;
    }
    setIsSendingEmail(true);
    setEmailStatus('Sending email...');
    try {
      const result = await emailApi.sendColdEmail({
        leadId: lead.id,
        toEmail: lead.email,
        toName: lead.name,
        subject: emailSubject.trim(),
        body: emailBody.trim(),
        senderName: campaignDefaults.senderName || user?.user_metadata?.full_name || user?.email?.split('@')[0] || undefined,
        senderEmail: campaignDefaults.senderEmail || undefined,
        senderCompany: companyContext.trim() ? companyContext.split('.')[0] : undefined,
        userId: user?.id,
      });
      if (result.success) {
        setEmailStatus('✅ Email sent successfully!');
        onSuccess?.(`Cold email sent to ${lead.email}`);
        setTimeout(() => {
          handleClose();
          onLeadUpdated?.();
        }, 1500);
      } else {
        setEmailStatus(`Error: ${result.error || 'Failed to send email'}`);
      }
    } catch (err) {
      setEmailStatus(`Error: ${err.message}`);
    } finally {
      setIsSendingEmail(false);
    }
  };

  // Handle edit save
  const handleSaveEdit = async () => {
    setIsSavingEdit(true);
    try {
      await supabaseApi.updateLead(lead.id, {
        name: editName.trim(),
        phone: editPhone.trim(),
        email: editEmail.trim() || null,
        category: editCategory.trim() || null,
        address: editAddress.trim() || null,
        website: editWebsite.trim() || null,
        status: editStatus,
        city: editCity.trim() || null,
      });
      onSuccess?.(`Lead "${editName}" updated successfully!`);
      handleClose();
      onLeadUpdated?.();
    } catch (err) {
      console.error('Failed to save changes:', err);
    } finally {
      setIsSavingEdit(false);
    }
  };

  if (!isOpen || !lead) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 z-40 animate-fade-in"
        onClick={handleClose}
      />

      {/* Modal */}
      <div className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[calc(100%-2rem)] max-w-3xl max-h-[85vh] z-50 bg-card border border-border rounded-xl shadow-2xl animate-scale-in overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border shrink-0">
        <div>
          <div className="flex items-center gap-3">
            <h2 className="text-xl font-semibold">
              {panelType === 'call' && `Call ${lead.name}`}
              {panelType === 'email' && `Email ${lead.name}`}
              {panelType === 'edit' && `Edit ${lead.name}`}
            </h2>
            {/* Campaign defaults indicator */}
            {panelType === 'call' && campaignDefaults.callPitch && (
              <Badge variant="outline" className="text-xs bg-primary/10 text-primary border-primary/30">
                <Sparkles className="h-3 w-3 mr-1" />
                Using campaign pitch
              </Badge>
            )}
            {panelType === 'email' && campaignDefaults.emailBody && (
              <Badge variant="outline" className="text-xs bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/30">
                <Sparkles className="h-3 w-3 mr-1" />
                Using campaign template
              </Badge>
            )}
          </div>
          {panelType === 'call' && (
            <p className="text-sm text-muted-foreground mt-1">
              <Phone className="h-3 w-3 inline mr-1" />
              {lead.phone}
            </p>
          )}
          {panelType === 'email' && lead.email && (
            <p className="text-sm text-muted-foreground mt-1">
              <Mail className="h-3 w-3 inline mr-1" />
              {lead.email}
            </p>
          )}
          {panelType === 'edit' && lead.category && (
            <Badge variant="secondary" className="mt-1">{lead.category}</Badge>
          )}
        </div>
        <button
          onClick={handleClose}
          className="p-2 hover:bg-secondary rounded-lg transition-colors"
          disabled={isCalling || isSendingEmail || isSavingEdit}
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

            {/* Two column layout */}
            <div className="grid grid-cols-2 gap-4">
              {/* Left column */}
              <div className="space-y-4">
                {/* Call Now vs Schedule Toggle */}
                <div className="flex gap-2 p-1 bg-muted rounded-lg">
                  <button
                    type="button"
                    onClick={() => setIsScheduleMode(false)}
                    className={cn(
                      "flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-all",
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
                      "flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-all",
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
                      <option value="default">Custom (enter details)</option>
                      {loadingAssistants && <option disabled>Loading...</option>}
                      {assistants.map((assistant) => (
                        <option key={assistant.id} value={assistant.id}>
                          {assistant.name}
                        </option>
                      ))}
                    </Select>
                  </div>
                </FormGroup>

                {/* Show assistant details if selected */}
                {selectedAssistantId !== 'default' && selectedAssistant && (
                  <div className="bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20 rounded-lg p-3 space-y-2">
                    <div className="flex items-center gap-2">
                      <Bot className="h-4 w-4 text-primary" />
                      <h3 className="font-semibold text-sm">{selectedAssistant.name}</h3>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="flex items-center gap-1.5 bg-background/50 rounded p-1.5">
                        <Volume2 className="h-3 w-3 text-muted-foreground" />
                        <span className="capitalize">{selectedAssistant.voice?.provider || 'Default'}</span>
                      </div>
                      <div className="flex items-center gap-1.5 bg-background/50 rounded p-1.5">
                        <Sparkles className="h-3 w-3 text-muted-foreground" />
                        <span>{selectedAssistant.model?.model || 'Default'}</span>
                      </div>
                    </div>
                  </div>
                )}

                <div className="bg-secondary/50 rounded-lg p-3 text-xs">
                  <p className="font-medium mb-1.5">The AI will:</p>
                  <ul className="space-y-0.5 text-muted-foreground">
                    <li>• Introduce and explain your product</li>
                    <li>• Ask if they would be interested</li>
                    <li>• Gather feedback on pricing</li>
                    <li>• Keep the call under 2 minutes</li>
                  </ul>
                </div>
              </div>

              {/* Right column */}
              <div className="space-y-4">
                <FormGroup label="Your Product / Service">
                  <div className="relative">
                    <MessageSquare className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Textarea
                      value={productIdea}
                      onChange={(e) => setProductIdea(e.target.value)}
                      placeholder="e.g., We're building an AI assistant that helps real estate agents..."
                      rows={4}
                      className="pl-10"
                    />
                  </div>
                </FormGroup>

                <FormGroup label="Company Context (optional)">
                  <div className="relative">
                    <Building2 className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Textarea
                      value={companyContext}
                      onChange={(e) => setCompanyContext(e.target.value)}
                      placeholder="e.g., ValidateCall is an AI-powered platform..."
                      rows={4}
                      className="pl-10"
                    />
                  </div>
                </FormGroup>

                <AIGenerator
                  type="product"
                  placeholder="Describe your product idea briefly..."
                  onGenerate={setProductIdea}
                />
              </div>
            </div>
          </>
        )}

        {/* EMAIL PANEL */}
        {panelType === 'email' && (
          <>
            {emailStatus && (
              <Alert variant={emailStatus.includes('Error') ? 'destructive' : emailStatus.includes('✅') ? 'success' : 'info'}>
                <AlertDescription>{emailStatus}</AlertDescription>
              </Alert>
            )}

            {!lead.email && (
              <Alert variant="warning">
                <AlertDescription>
                  This lead doesn't have an email address. Please add one in the Edit panel first.
                </AlertDescription>
              </Alert>
            )}

            {/* Two column layout */}
            <div className="grid grid-cols-2 gap-4">
              {/* Left column - Context */}
              <div className="space-y-4">
                {/* Lead Info Card */}
                <div className="bg-gradient-to-br from-blue-50 to-blue-100/50 dark:from-blue-950/20 dark:to-blue-900/10 border border-blue-200/50 dark:border-blue-800/30 rounded-lg p-3 space-y-2">
                  <div className="flex items-center gap-2">
                    <Building2 className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                    <h3 className="font-semibold text-sm">{lead.name}</h3>
                  </div>
                  <div className="grid grid-cols-2 gap-1.5 text-xs">
                    {lead.category && (
                      <div className="flex items-center gap-1 text-muted-foreground">
                        <Tag className="h-3 w-3" />
                        {lead.category}
                      </div>
                    )}
                    {(lead.address || lead.city) && (
                      <div className="flex items-center gap-1 text-muted-foreground">
                        <MapPin className="h-3 w-3" />
                        {lead.city || lead.address}
                      </div>
                    )}
                    {lead.rating && (
                      <div className="flex items-center gap-1 text-muted-foreground">
                        <Star className="h-3 w-3 text-yellow-500" />
                        {lead.rating}
                      </div>
                    )}
                  </div>
                </div>

                <FormGroup label="Your Product / Service">
                  <div className="relative">
                    <MessageSquare className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Textarea
                      value={productIdea}
                      onChange={(e) => setProductIdea(e.target.value)}
                      placeholder="e.g., We're building an AI assistant..."
                      rows={3}
                      className="pl-10"
                    />
                  </div>
                </FormGroup>

                <FormGroup label="Company Context (optional)">
                  <div className="relative">
                    <Building2 className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Textarea
                      value={companyContext}
                      onChange={(e) => setCompanyContext(e.target.value)}
                      placeholder="e.g., We are a startup..."
                      rows={2}
                      className="pl-10"
                    />
                  </div>
                </FormGroup>
              </div>

              {/* Right column - Email content */}
              <div className="space-y-4">
                {/* Generate Email Button */}
                <Button
                  variant="outline"
                  onClick={handleGenerateEmail}
                  disabled={isGeneratingEmail || !productIdea.trim()}
                  className="w-full gap-2 border-primary/20 hover:bg-primary/5 text-primary"
                >
                  {isGeneratingEmail ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Generating...
                    </>
                  ) : emailBody ? (
                    <>
                      <RefreshCw className="h-4 w-4" />
                      Regenerate Email
                    </>
                  ) : (
                    <>
                      <Wand2 className="h-4 w-4" />
                      Generate Email with AI
                    </>
                  )}
                </Button>

                <FormGroup label="Email Subject">
                  <Input
                    value={emailSubject}
                    onChange={(e) => setEmailSubject(e.target.value)}
                    placeholder="Enter email subject..."
                    disabled={isGeneratingEmail}
                  />
                </FormGroup>

                <FormGroup label="Email Body">
                  <Textarea
                    value={emailBody}
                    onChange={(e) => setEmailBody(e.target.value)}
                    placeholder="Enter email body..."
                    rows={8}
                    disabled={isGeneratingEmail}
                    className="font-normal"
                  />
                </FormGroup>
              </div>
            </div>
          </>
        )}

        {/* EDIT PANEL */}
        {panelType === 'edit' && (
          <div className="grid grid-cols-2 gap-4">
            {/* Left column */}
            <div className="space-y-4">
              <FormGroup label="Business Name">
                <Input
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  disabled={isSavingEdit}
                />
              </FormGroup>
              <FormGroup label="Phone">
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    value={editPhone}
                    onChange={(e) => setEditPhone(e.target.value)}
                    className="pl-10"
                    disabled={isSavingEdit}
                  />
                </div>
              </FormGroup>
              <FormGroup label="Email">
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    value={editEmail}
                    onChange={(e) => setEditEmail(e.target.value)}
                    className="pl-10"
                    type="email"
                    placeholder="contact@business.com"
                    disabled={isSavingEdit}
                  />
                </div>
              </FormGroup>
              <FormGroup label="Category">
                <Input
                  value={editCategory}
                  onChange={(e) => setEditCategory(e.target.value)}
                  disabled={isSavingEdit}
                />
              </FormGroup>
            </div>

            {/* Right column */}
            <div className="space-y-4">
              <FormGroup label="City">
                <div className="relative">
                  <MapPinned className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    value={editCity}
                    onChange={(e) => setEditCity(e.target.value)}
                    className="pl-10"
                    placeholder="e.g., Dublin"
                    disabled={isSavingEdit}
                  />
                </div>
              </FormGroup>
              <FormGroup label="Address">
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    value={editAddress}
                    onChange={(e) => setEditAddress(e.target.value)}
                    className="pl-10"
                    disabled={isSavingEdit}
                  />
                </div>
              </FormGroup>
              <FormGroup label="Website">
                <div className="relative">
                  <Globe className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    value={editWebsite}
                    onChange={(e) => setEditWebsite(e.target.value)}
                    className="pl-10"
                    placeholder="https://..."
                    disabled={isSavingEdit}
                  />
                </div>
              </FormGroup>
              <FormGroup label="Status">
                <Select
                  value={editStatus}
                  onChange={(e) => setEditStatus(e.target.value)}
                  disabled={isSavingEdit}
                >
                  <option value="new">New</option>
                  <option value="contacted">Contacted</option>
                  <option value="interested">Interested</option>
                  <option value="rejected">Rejected</option>
                </Select>
              </FormGroup>
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="flex gap-3 p-6 border-t border-border shrink-0">
        <Button
          variant="outline"
          onClick={handleClose}
          disabled={isCalling || isSendingEmail || isSavingEdit}
          className="flex-1"
        >
          Cancel
        </Button>
        {panelType === 'call' && (
          <Button
            variant="gradient"
            onClick={handleInitiateCall}
            disabled={isCalling || !productIdea.trim() || (isScheduleMode && !scheduledDateTime)}
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
        {panelType === 'email' && (
          <Button
            variant="gradient"
            onClick={handleSendEmail}
            disabled={isSendingEmail || !lead.email || !emailSubject.trim() || !emailBody.trim()}
            className="flex-1"
          >
            {isSendingEmail ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Sending...
              </>
            ) : (
              <>
                <Send className="h-4 w-4" />
                Send Email
              </>
            )}
          </Button>
        )}
        {panelType === 'edit' && (
          <Button
            variant="gradient"
            className="flex-1"
            disabled={isSavingEdit || !editName.trim() || !editPhone.trim()}
            onClick={handleSaveEdit}
          >
            {isSavingEdit ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Pencil className="h-4 w-4" />
                Save Changes
              </>
            )}
          </Button>
        )}
      </div>
    </div>
    </>
  );
}
