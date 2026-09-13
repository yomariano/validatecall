import { Button } from '@/components/ui/button';
import { ArrowLeft, Settings, ChevronUp, ChevronDown, Check, Building2, Mail, Bot, Volume2, Plus, Phone, Loader2, Wand2, Send, MousePointer, Link, Save, Megaphone, Play, MapPin, Star, CheckCircle, XCircle, Pencil } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { FormGroup, Textarea, Input, Select } from '@/components/ui/input';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';

export default function CampaignDetails({ setViewingCampaign, setActiveCampaign, setSelectedAgentId, setCampaignCompanyContext, setCampaignCallPitch, setCampaignEmailSubject, setCampaignEmailBody, setCampaignSenderEmail, setCampaignSenderName, setCampaignCtaText, setCampaignCtaUrl, setActiveTab, setCampaignSettingsOpen, campaignSettingsOpen, campaignCallPitch, campaignEmailBody, campaignCompanyContext, campaignSenderName, verifiedDomains, campaignSenderEmail, selectedAgentId, setIsTestModalOpen, voiceAgents, handleGenerateCampaignPitch, isGeneratingPitch, handleGenerateCampaignEmail, isGeneratingEmail, campaignEmailSubject, handleSendTestEmail, isSendingTestEmail, campaignCtaText, campaignCtaUrl, saveCampaignTemplates, isSavingTemplates, viewingCampaign, getStatusBadge, campaignLeads, activeCampaign, isCalling, callProgress, phoneStats, callAllLeads, callResults, startCampaign, openPanel }) {
  return (<div className="space-y-6">
        {/* Back button */}
        <Button
          variant="ghost"
          onClick={() => {
            setViewingCampaign(null);
            setActiveCampaign(null);
            setSelectedAgentId('');
            setCampaignCompanyContext('');
            setCampaignCallPitch('');
            setCampaignEmailSubject('');
            setCampaignEmailBody('');
            setCampaignSenderEmail('');
            setCampaignSenderName('');
            setCampaignCtaText('');
            setCampaignCtaUrl('');
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

              {/* Voice Agent Selection */}
              <div className="p-4 border border-primary/30 rounded-lg bg-gradient-to-br from-primary/5 to-transparent">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-medium flex items-center gap-2">
                    <Bot className="h-4 w-4 text-primary" />
                    Voice Agent for Calls
                  </h3>
                  {selectedAgentId && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setIsTestModalOpen(true)}
                      className="gap-2"
                    >
                      <Volume2 className="h-3 w-3" />
                      Test Agent
                    </Button>
                  )}
                </div>

                {voiceAgents.length > 0 ? (
                  <div className="space-y-3">
                    <Select
                      value={selectedAgentId}
                      onChange={(e) => setSelectedAgentId(e.target.value)}
                      className="w-full"
                    >
                      <option value="">Select a voice agent...</option>
                      {voiceAgents.map((agent) => (
                        <option key={agent.id} value={agent.id}>
                          {agent.name || 'Unnamed Agent'}
                        </option>
                      ))}
                    </Select>

                    {selectedAgentId && (
                      <div className="p-3 bg-muted/50 rounded-md text-sm">
                        {(() => {
                          const agent = voiceAgents.find(a => a.id === selectedAgentId);
                          if (!agent) return null;
                          return (
                            <div className="space-y-2">
                              <div className="flex items-center gap-2">
                                <Badge variant="outline" className="text-xs">
                                  {agent.voice?.provider || 'Unknown'} voice
                                </Badge>
                                <Badge variant="secondary" className="text-xs">
                                  {agent.model?.model || 'gpt-4o-mini'}
                                </Badge>
                              </div>
                              {agent.firstMessage && (
                                <p className="text-xs text-muted-foreground line-clamp-2">
                                  <span className="font-medium">First message:</span> {agent.firstMessage}
                                </p>
                              )}
                            </div>
                          );
                        })()}
                      </div>
                    )}

                    <p className="text-xs text-muted-foreground">
                      The selected agent will be used for all calls in this campaign. The agent's pitch and rules will override the manual pitch below.
                    </p>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-3 py-4 text-center">
                    <Bot className="h-8 w-8 text-muted-foreground/50" />
                    <p className="text-sm text-muted-foreground">No voice agents created yet</p>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => window.location.href = '/agents'}
                    >
                      <Plus className="h-3 w-3 mr-1" />
                      Create Voice Agent
                    </Button>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Call Pitch Section */}
                <div className="space-y-4 p-4 border border-border rounded-lg bg-card">
                  <div className="flex items-center justify-between">
                    <h3 className="font-medium flex items-center gap-2">
                      <Phone className="h-4 w-4 text-primary" />
                      Manual Call Pitch
                      {selectedAgentId && (
                        <Badge variant="secondary" className="text-xs ml-1">Optional</Badge>
                      )}
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
                    placeholder={selectedAgentId ? "Agent's built-in pitch will be used. Add extra context here if needed..." : "AI-generated pitch will appear here, or write your own..."}
                    rows={5}
                    className="text-sm"
                  />
                  {selectedAgentId ? (
                    <p className="text-xs text-muted-foreground">
                      The selected voice agent has its own pitch configured. This field can be used to add extra context if needed.
                    </p>
                  ) : campaignCallPitch ? (
                    <p className="text-xs text-muted-foreground">
                      This pitch will be used as the default for all call actions in this campaign.
                    </p>
                  ) : null}
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
                  <div className="space-y-2">
                    <p className="text-xs text-muted-foreground">
                      <span className="font-medium">Dynamic variables:</span>{' '}
                      <code className="bg-muted px-1 rounded">{'{{businessName}}'}</code>{' '}
                      <code className="bg-muted px-1 rounded">{'{{city}}'}</code>{' '}
                      <code className="bg-muted px-1 rounded">{'{{industry}}'}</code>
                    </p>
                    {campaignEmailBody && (
                      <p className="text-xs text-muted-foreground">
                        This template will be personalized for each lead when sending.
                      </p>
                    )}
                    {/* Test Email Button */}
                    {campaignEmailBody && campaignEmailSubject && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleSendTestEmail}
                        disabled={isSendingTestEmail || !campaignSenderEmail}
                        className="gap-2 mt-2"
                      >
                        {isSendingTestEmail ? (
                          <>
                            <Loader2 className="h-3 w-3 animate-spin" />
                            Sending...
                          </>
                        ) : (
                          <>
                            <Send className="h-3 w-3" />
                            Send Test Email to Me
                          </>
                        )}
                      </Button>
                    )}
                  </div>
                </div>
              </div>

              {/* CTA Button */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <MousePointer className="h-4 w-4 text-primary" />
                  <span className="text-sm font-medium">Call-to-Action Button (Optional)</span>
                </div>
                <p className="text-xs text-muted-foreground">
                  Add a button to your emails that links to your website, booking page, or any URL
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-muted-foreground mb-1 block">Button Text</label>
                    <Input
                      value={campaignCtaText}
                      onChange={(e) => setCampaignCtaText(e.target.value)}
                      placeholder="e.g., Visit Our Website"
                      className="text-sm"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground mb-1 block">Button URL</label>
                    <div className="relative">
                      <Link className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        value={campaignCtaUrl}
                        onChange={(e) => setCampaignCtaUrl(e.target.value)}
                        placeholder="https://yoursite.com"
                        className="pl-10 text-sm"
                      />
                    </div>
                  </div>
                </div>
                {campaignCtaText && campaignCtaUrl && (
                  <div className="p-3 bg-muted/50 rounded-lg text-center">
                    <span className="inline-block bg-primary text-primary-foreground font-medium text-sm py-2 px-5 rounded-md">
                      {campaignCtaText}
                    </span>
                  </div>
                )}
              </div>

              {/* Save Campaign Button */}
              <div className="flex items-center justify-between pt-4 border-t border-border">
                <p className="text-sm text-muted-foreground">
                  <span className="font-medium">Tip:</span> Save your templates to use them every time you open this campaign.
                </p>
                <Button
                  onClick={saveCampaignTemplates}
                  disabled={isSavingTemplates}
                  className="gap-2"
                >
                  {isSavingTemplates ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4" />
                      Save Campaign
                    </>
                  )}
                </Button>
              </div>
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
      </div>);
}
