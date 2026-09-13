import AIGenerator from '@/components/AIGenerator';
import { Phone, Mail, X, PhoneCall, Calendar, Clock, Bot, Volume2, Sparkles, Loader2, MapPinned, MapPin, Globe, ExternalLink, Building2, Tag, Star, MessageSquare, Wand2, RefreshCw, Send, Pencil } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { FormGroup, Input, Select, Label, Textarea } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { emailApi, dataApi } from '@/services/api';

export default function LeadDetailsPanel({ panelType, testCallMode, selectedLead, closePanel, isCalling, isSendingEmail, isSavingEdit, callStatus, testPhoneNumber, setTestPhoneNumber, setIsScheduleMode, isScheduleMode, scheduledDateTime, setScheduledDateTime, selectedAssistantId, setSelectedAssistantId, loadingAssistants, assistants, selectedAssistant, testCallStatus, preTestPhoneNumber, setPreTestPhoneNumber, isTestCalling, handlePreTestCall, editName, setEditName, editPhone, setEditPhone, editEmail, setEditEmail, editCategory, setEditCategory, editCity, setEditCity, editAddress, setEditAddress, editWebsite, setEditWebsite, editStatus, setEditStatus, emailStatus, productIdea, setProductIdea, companyContext, setCompanyContext, setEmailStatus, setIsGeneratingEmail, user, setEmailSubject, setEmailBody, isGeneratingEmail, emailSubject, emailBody, handleInitiateCall, setIsSendingEmail, setSuccess, loadLeads, setIsSavingEdit, setError }) {
  return (<div className="fixed right-0 top-0 h-full w-full sm:w-[420px] z-40 bg-card border-l border-border shadow-2xl animate-slide-in-right overflow-hidden flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-border shrink-0">
              <div>
                <h2 className="text-xl font-semibold">
                  {panelType === 'call' && (testCallMode ? '🧪 Test Call' : `Call ${selectedLead.name}`)}
                  {panelType === 'email' && `Email ${selectedLead.name}`}
                  {panelType === 'edit' && `Edit ${selectedLead.name}`}
                  {panelType === 'location' && `Location: ${selectedLead.name}`}
                </h2>
                {panelType === 'call' && !testCallMode && (
                  <p className="text-sm text-muted-foreground mt-1">
                    <Phone className="h-3 w-3 inline mr-1" />
                    {selectedLead.phone}
                  </p>
                )}
                {panelType === 'email' && selectedLead.email && (
                  <p className="text-sm text-muted-foreground mt-1">
                    <Mail className="h-3 w-3 inline mr-1" />
                    {selectedLead.email}
                  </p>
                )}
                {panelType === 'edit' && selectedLead.category && (
                  <Badge variant="secondary" className="mt-1">{selectedLead.category}</Badge>
                )}
              </div>
              <button
                onClick={closePanel}
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

                  {/* Test Call First Section - only show when NOT in test mode */}
                  {!testCallMode && (
                    <div className="border border-primary/20 bg-primary/5 rounded-lg p-4 space-y-3">
                      <div className="flex items-center gap-2">
                        <PhoneCall className="h-4 w-4 text-primary" />
                        <h3 className="font-medium text-sm">Test Call First (Optional)</h3>
                      </div>

                      {testCallStatus && (
                        <Alert variant={testCallStatus.includes('Error') ? 'destructive' : 'info'}>
                          <AlertDescription className="text-xs">{testCallStatus}</AlertDescription>
                        </Alert>
                      )}

                      <div className="space-y-2">
                        <Label className="text-xs">Test Phone Number</Label>
                        <div className="relative">
                          <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input
                            value={preTestPhoneNumber}
                            onChange={(e) => setPreTestPhoneNumber(e.target.value)}
                            placeholder="+1234567890"
                            className="pl-10 font-mono text-sm"
                            disabled={isTestCalling || isCalling}
                          />
                        </div>
                        <p className="text-xs text-muted-foreground">
                          Make a test call to verify your setup before calling the lead
                        </p>
                      </div>

                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handlePreTestCall}
                        disabled={isTestCalling || isCalling || !preTestPhoneNumber.trim()}
                        className="w-full"
                      >
                        {isTestCalling ? (
                          <>
                            <Loader2 className="h-3 w-3 animate-spin mr-2" />
                            Calling...
                          </>
                        ) : (
                          <>
                            <PhoneCall className="h-3 w-3 mr-2" />
                            Make Test Call
                          </>
                        )}
                      </Button>
                    </div>
                  )}

                  <div className="bg-secondary/50 rounded-lg p-4 text-sm">
                    <p className="font-medium mb-2">The selected AI assistant will:</p>
                    <ul className="space-y-1 text-muted-foreground">
                      <li>• Introduce itself with its configured greeting</li>
                      <li>• Conduct the call based on its training</li>
                      <li>• Ask relevant questions and gather feedback</li>
                      <li>• Keep the conversation professional and concise</li>
                    </ul>
                  </div>
                </>
              )}

              {/* EDIT PANEL */}
              {panelType === 'edit' && (
                <>
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
                          src={`https://www.google.com/maps/embed/v1/place?key=${import.meta.env.VITE_GOOGLE_MAPS_KEY || ''}&q=${selectedLead.latitude},${selectedLead.longitude}&zoom=15`}
                          allowFullScreen
                        />
                      </div>
                    )}
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

                  {!selectedLead.email && (
                    <Alert variant="warning">
                      <AlertDescription>
                        This lead doesn't have an email address. Please add one in the Edit panel first.
                      </AlertDescription>
                    </Alert>
                  )}

                  {/* Lead Info Card */}
                  <div className="bg-gradient-to-br from-blue-50 to-blue-100/50 border border-blue-200/50 rounded-lg p-4 space-y-2">
                    <div className="flex items-center gap-2">
                      <Building2 className="h-5 w-5 text-blue-600" />
                      <h3 className="font-semibold">{selectedLead.name}</h3>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      {selectedLead.category && (
                        <div className="flex items-center gap-1.5 text-muted-foreground">
                          <Tag className="h-3 w-3" />
                          {selectedLead.category}
                        </div>
                      )}
                      {(selectedLead.address || selectedLead.city) && (
                        <div className="flex items-center gap-1.5 text-muted-foreground">
                          <MapPin className="h-3 w-3" />
                          {selectedLead.city || selectedLead.address}
                        </div>
                      )}
                      {selectedLead.rating && (
                        <div className="flex items-center gap-1.5 text-muted-foreground">
                          <Star className="h-3 w-3 text-yellow-500" />
                          {selectedLead.rating} ({selectedLead.review_count || 0} reviews)
                        </div>
                      )}
                      {selectedLead.website && (
                        <div className="flex items-center gap-1.5 text-muted-foreground">
                          <Globe className="h-3 w-3" />
                          <a href={selectedLead.website} target="_blank" rel="noopener noreferrer" className="hover:text-primary truncate">
                            {selectedLead.website.replace(/https?:\/\//, '')}
                          </a>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Product/Context fields */}
                  <FormGroup label="Your Product / Service">
                    <div className="space-y-2">
                      <div className="relative">
                        <MessageSquare className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Textarea
                          value={productIdea}
                          onChange={(e) => setProductIdea(e.target.value)}
                          placeholder="e.g., We're building an AI assistant that helps restaurants manage reservations..."
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
                    <div className="relative">
                      <Building2 className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Textarea
                        value={companyContext}
                        onChange={(e) => setCompanyContext(e.target.value)}
                        placeholder="e.g., We are a startup focused on hospitality tech..."
                        rows={2}
                        className="pl-10"
                      />
                    </div>
                  </FormGroup>

                  {/* Generate Email Button */}
                  <Button
                    variant="outline"
                    onClick={async () => {
                      if (!productIdea.trim()) {
                        setEmailStatus('Error: Please describe your product/service first');
                        return;
                      }
                      setIsGeneratingEmail(true);
                      setEmailStatus('Generating personalized email with AI...');
                      try {
                        const result = await emailApi.generateColdEmail({
                          lead: selectedLead,
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
                    }}
                    disabled={isGeneratingEmail || !productIdea.trim()}
                    className="w-full gap-2 border-primary/20 hover:bg-primary/5 text-primary"
                  >
                    {isGeneratingEmail ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Generating with AI...
                      </>
                    ) : (
                      <>
                        <Wand2 className="h-4 w-4" />
                        Generate Cold Email with AI
                      </>
                    )}
                  </Button>

                  {/* Email Subject */}
                  <FormGroup label="Email Subject">
                    <Input
                      value={emailSubject}
                      onChange={(e) => setEmailSubject(e.target.value)}
                      placeholder="Enter email subject..."
                      disabled={isGeneratingEmail}
                    />
                  </FormGroup>

                  {/* Email Body */}
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

                  {/* Regenerate button if email exists */}
                  {emailBody && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={async () => {
                        setIsGeneratingEmail(true);
                        setEmailStatus('Regenerating email...');
                        try {
                          const result = await emailApi.generateColdEmail({
                            lead: selectedLead,
                            productIdea: productIdea.trim(),
                            companyContext: companyContext.trim() || undefined,
                            senderName: user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Your Name',
                          });
                          if (result.success && result.email) {
                            setEmailSubject(result.email.subject);
                            setEmailBody(result.email.body);
                            setEmailStatus('');
                          }
                        } catch (err) {
                          setEmailStatus(`Error: ${err.message}`);
                        } finally {
                          setIsGeneratingEmail(false);
                        }
                      }}
                      disabled={isGeneratingEmail}
                      className="gap-2 text-muted-foreground hover:text-primary"
                    >
                      <RefreshCw className={cn("h-4 w-4", isGeneratingEmail && "animate-spin")} />
                      Regenerate
                    </Button>
                  )}

                  <div className="bg-secondary/50 rounded-lg p-4 text-sm">
                    <p className="font-medium mb-2">The AI will:</p>
                    <ul className="space-y-1 text-muted-foreground">
                      <li>• Research the lead's business based on available info</li>
                      <li>• Create a personalized opening line</li>
                      <li>• Craft a compelling value proposition</li>
                      <li>• Include a clear call-to-action</li>
                    </ul>
                  </div>
                </>
              )}
            </div>

            {/* Footer */}
            <div className="flex gap-3 p-6 border-t border-border shrink-0">
              <Button
                variant="outline"
                onClick={closePanel}
                disabled={isCalling || isSendingEmail || isSavingEdit}
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
              {panelType === 'email' && (
                <Button
                  variant="gradient"
                  onClick={async () => {
                    if (!selectedLead.email) {
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
                        leadId: selectedLead.id,
                        toEmail: selectedLead.email,
                        toName: selectedLead.name,
                        subject: emailSubject.trim(),
                        body: emailBody.trim(),
                        senderName: user?.user_metadata?.full_name || user?.email?.split('@')[0] || undefined,
                        senderCompany: companyContext.trim() ? companyContext.split('.')[0] : undefined,
                        userId: user?.id,
                      });
                      if (result.success) {
                        setEmailStatus('✅ Email sent successfully!');
                        setSuccess(`Cold email sent to ${selectedLead.email}`);
                        setTimeout(() => {
                          closePanel();
                          loadLeads(); // Reload to update status
                        }, 1500);
                      } else {
                        setEmailStatus(`Error: ${result.error || 'Failed to send email'}`);
                      }
                    } catch (err) {
                      setEmailStatus(`Error: ${err.message}`);
                    } finally {
                      setIsSendingEmail(false);
                    }
                  }}
                  disabled={isSendingEmail || !selectedLead.email || !emailSubject.trim() || !emailBody.trim()}
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
                  onClick={async () => {
                    setIsSavingEdit(true);
                    try {
                      await dataApi.updateLead(selectedLead.id, {
                        name: editName.trim(),
                        phone: editPhone.trim(),
                        email: editEmail.trim() || null,
                        category: editCategory.trim() || null,
                        address: editAddress.trim() || null,
                        website: editWebsite.trim() || null,
                        status: editStatus,
                        city: editCity.trim() || null,
                      });
                      setSuccess(`Lead "${editName}" updated successfully!`);
                      closePanel();
                      loadLeads(); // Reload to show updated data
                    } catch (err) {
                      setError(`Failed to save changes: ${err.message}`);
                    } finally {
                      setIsSavingEdit(false);
                    }
                  }}
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
          </div>);
}
