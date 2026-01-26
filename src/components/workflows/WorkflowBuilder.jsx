import { useState } from 'react';
import { workflowsApi } from '../../services/api';
import {
  ArrowLeft,
  Plus,
  Trash2,
  Clock,
  Mail,
  Phone,
  MessageSquare,
  Save,
  Play,
  ChevronDown,
  ChevronUp,
  Settings,
  Calendar,
  Loader2,
  Link,
  Zap,
  AlertCircle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input, Label, FormGroup, Select, Textarea } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { cn } from '@/lib/utils';

const DAYS_OF_WEEK = [
  { value: 1, label: 'Mon' },
  { value: 2, label: 'Tue' },
  { value: 3, label: 'Wed' },
  { value: 4, label: 'Thu' },
  { value: 5, label: 'Fri' },
  { value: 6, label: 'Sat' },
  { value: 7, label: 'Sun' },
];

const TIMEZONES = [
  { value: 'UTC', label: 'UTC' },
  { value: 'America/New_York', label: 'Eastern Time (ET)' },
  { value: 'America/Chicago', label: 'Central Time (CT)' },
  { value: 'America/Denver', label: 'Mountain Time (MT)' },
  { value: 'America/Los_Angeles', label: 'Pacific Time (PT)' },
  { value: 'Europe/London', label: 'London (GMT/BST)' },
  { value: 'Europe/Paris', label: 'Central European (CET)' },
  { value: 'Europe/Dublin', label: 'Dublin (IST)' },
  { value: 'Asia/Tokyo', label: 'Tokyo (JST)' },
  { value: 'Australia/Sydney', label: 'Sydney (AEST)' },
];

const STEP_TYPES = [
  { value: 'email', label: 'Email', icon: Mail, color: 'blue' },
  { value: 'call', label: 'AI Voice Call', icon: Phone, color: 'green' },
  { value: 'sms', label: 'SMS', icon: MessageSquare, color: 'purple' },
  { value: 'wait', label: 'Wait', icon: Clock, color: 'yellow' },
];

const STEP_CONDITIONS = [
  { value: 'always', label: 'Always execute' },
  { value: 'no_reply', label: 'Only if no reply' },
  { value: 'no_open', label: 'Only if no email open' },
  { value: 'no_answer', label: 'Only if call not answered' },
];

function WorkflowBuilder({ workflow, campaigns, assistants, userId, onBack, onSave, onActivate }) {
  const isEditing = !!workflow;

  // Basic info
  const [name, setName] = useState(workflow?.name || '');
  const [campaignId, setCampaignId] = useState(workflow?.campaign_id || '');
  const [assistantId, setAssistantId] = useState(workflow?.vapi_assistant_id || '');

  // Send window settings
  const [timezone, setTimezone] = useState(workflow?.timezone || 'UTC');
  const [sendWindowStart, setSendWindowStart] = useState(workflow?.send_window_start || '09:00');
  const [sendWindowEnd, setSendWindowEnd] = useState(workflow?.send_window_end || '17:00');
  const [sendDays, setSendDays] = useState(workflow?.send_days || [1, 2, 3, 4, 5]);

  // Stop conditions
  const [stopOnReply, setStopOnReply] = useState(workflow?.stop_on_reply ?? true);
  const [stopOnClick, setStopOnClick] = useState(workflow?.stop_on_click ?? false);
  const [stopOnCallAnswered, setStopOnCallAnswered] = useState(workflow?.stop_on_call_answered ?? true);
  const [stopOnBounce, setStopOnBounce] = useState(workflow?.stop_on_bounce ?? true);

  // Steps
  const [steps, setSteps] = useState(
    workflow?.steps?.map(s => ({
      id: s.id,
      stepType: s.step_type,
      delayDays: s.delay_days,
      delayHours: s.delay_hours || 0,
      condition: s.condition || 'always',
      // Email fields
      subject: s.email_subject || '',
      body: s.email_body || '',
      ctaText: s.cta_text || '',
      ctaUrl: s.cta_url || '',
      // Call fields
      callScript: s.call_script || '',
      maxDuration: s.max_duration_seconds || 120,
      // SMS fields
      smsMessage: s.sms_message || '',
      expanded: false,
    })) || [
      {
        id: 'step-1',
        stepType: 'email',
        delayDays: 0,
        delayHours: 0,
        condition: 'always',
        subject: '',
        body: '',
        ctaText: '',
        ctaUrl: '',
        callScript: '',
        maxDuration: 120,
        smsMessage: '',
        expanded: true,
      }
    ]
  );

  // UI state
  const [showSettings, setShowSettings] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');

  // Add a new step
  const addStep = (stepType = 'email') => {
    const newStep = {
      id: `step-${Date.now()}`,
      stepType,
      delayDays: stepType === 'wait' ? 1 : 3,
      delayHours: 0,
      condition: stepType === 'call' ? 'no_reply' : 'always',
      subject: '',
      body: '',
      ctaText: '',
      ctaUrl: '',
      callScript: '',
      maxDuration: 120,
      smsMessage: '',
      expanded: true,
    };

    setSteps(prev => [...prev.map(s => ({ ...s, expanded: false })), newStep]);
  };

  // Remove a step
  const removeStep = (index) => {
    if (steps.length <= 1) return;
    setSteps(prev => prev.filter((_, i) => i !== index));
  };

  // Update a step
  const updateStep = (index, updates) => {
    setSteps(prev => prev.map((step, i) =>
      i === index ? { ...step, ...updates } : step
    ));
  };

  // Toggle step expansion
  const toggleStep = (index) => {
    setSteps(prev => prev.map((step, i) => ({
      ...step,
      expanded: i === index ? !step.expanded : false,
    })));
  };

  // Toggle day selection
  const toggleDay = (day) => {
    setSendDays(prev =>
      prev.includes(day)
        ? prev.filter(d => d !== day)
        : [...prev, day].sort()
    );
  };

  // Get step type config
  const getStepTypeConfig = (stepType) => {
    return STEP_TYPES.find(t => t.value === stepType) || STEP_TYPES[0];
  };

  // Check if call steps exist but no assistant selected
  const hasCallSteps = steps.some(s => s.stepType === 'call');
  const needsAssistant = hasCallSteps && !assistantId;

  // Save workflow
  const handleSave = async () => {
    setError('');

    if (!name.trim()) {
      setError('Please enter a workflow name');
      return;
    }

    if (!campaignId) {
      setError('Please select a campaign');
      return;
    }

    if (needsAssistant) {
      setError('Please select a voice assistant for AI calls');
      return;
    }

    const firstStep = steps[0];
    if (firstStep.stepType === 'email' && (!firstStep.subject || !firstStep.body)) {
      setError('First email step requires subject and body');
      return;
    }

    setIsSaving(true);

    try {
      const workflowData = {
        name,
        campaignId,
        vapiAssistantId: assistantId || null,
        timezone,
        sendWindowStart,
        sendWindowEnd,
        sendDays,
        stopOnReply,
        stopOnClick,
        stopOnCallAnswered,
        stopOnBounce,
        steps: steps.map((s, index) => ({
          stepNumber: index + 1,
          stepType: s.stepType,
          delayDays: s.delayDays,
          delayHours: s.delayHours,
          condition: s.condition,
          emailSubject: s.subject || null,
          emailBody: s.body || null,
          ctaText: s.ctaText || null,
          ctaUrl: s.ctaUrl || null,
          callScript: s.callScript || null,
          maxDurationSeconds: s.maxDuration || 120,
          smsMessage: s.smsMessage || null,
        })),
      };

      if (isEditing) {
        await workflowsApi.update(userId, workflow.id, workflowData);
      } else {
        await workflowsApi.create(userId, workflowData);
      }

      onSave?.();
    } catch (err) {
      setError(err.message || 'Failed to save workflow');
    } finally {
      setIsSaving(false);
    }
  };

  // Calculate total duration
  const totalDays = steps.reduce((sum, s, i) => sum + (i === 0 ? 0 : s.delayDays), 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={onBack} className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
          <div>
            <h1 className="text-2xl font-bold">
              {isEditing ? 'Edit Workflow' : 'Create Outreach Workflow'}
            </h1>
            <p className="text-sm text-muted-foreground">
              Multi-channel automation: emails + AI voice calls
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {isEditing && workflow?.status === 'draft' && (
            <Button
              variant="outline"
              onClick={() => onActivate?.(workflow.id)}
              className="gap-2"
            >
              <Play className="h-4 w-4" />
              Activate
            </Button>
          )}
          <Button onClick={handleSave} disabled={isSaving} className="gap-2">
            {isSaving ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            {isEditing ? 'Save Changes' : 'Save Workflow'}
          </Button>
        </div>
      </div>

      {error && (
        <Alert variant="destructive" onClose={() => setError('')}>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {needsAssistant && (
        <Alert variant="warning">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            This workflow includes AI voice calls. Please select a voice assistant.
          </AlertDescription>
        </Alert>
      )}

      {/* Basic Info */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Zap className="h-5 w-5 text-primary" />
            Workflow Details
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <FormGroup label="Workflow Name" required>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g., Cold Outreach + Voice Follow-up"
              />
            </FormGroup>

            <FormGroup label="Campaign" required hint="Select leads source">
              <Select
                value={campaignId}
                onChange={(e) => setCampaignId(e.target.value)}
              >
                <option value="">Select a campaign</option>
                {campaigns.map(c => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c.total_leads} leads)
                  </option>
                ))}
              </Select>
            </FormGroup>

            <FormGroup label="Voice Assistant" hint={hasCallSteps ? 'Required for AI calls' : 'Optional'}>
              <Select
                value={assistantId}
                onChange={(e) => setAssistantId(e.target.value)}
              >
                <option value="">No voice calls</option>
                {assistants.map(a => (
                  <option key={a.id} value={a.id}>
                    {a.name}
                  </option>
                ))}
              </Select>
            </FormGroup>
          </div>

          {/* Send Window Settings Toggle */}
          <div className="pt-4 border-t">
            <Button
              variant="ghost"
              onClick={() => setShowSettings(!showSettings)}
              className="w-full justify-between h-auto py-3"
            >
              <span className="flex items-center gap-2">
                <Settings className="h-4 w-4" />
                Send Window & Stop Conditions
              </span>
              {showSettings ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
            </Button>

            {showSettings && (
              <div className="mt-4 space-y-6 p-4 bg-muted/50 rounded-lg">
                {/* Send Window */}
                <div className="space-y-4">
                  <h4 className="font-medium flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    Send Window
                  </h4>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <FormGroup label="Timezone">
                      <Select
                        value={timezone}
                        onChange={(e) => setTimezone(e.target.value)}
                      >
                        {TIMEZONES.map(tz => (
                          <option key={tz.value} value={tz.value}>{tz.label}</option>
                        ))}
                      </Select>
                    </FormGroup>

                    <FormGroup label="Start Time">
                      <Input
                        type="time"
                        value={sendWindowStart}
                        onChange={(e) => setSendWindowStart(e.target.value)}
                      />
                    </FormGroup>

                    <FormGroup label="End Time">
                      <Input
                        type="time"
                        value={sendWindowEnd}
                        onChange={(e) => setSendWindowEnd(e.target.value)}
                      />
                    </FormGroup>
                  </div>

                  <FormGroup label="Active Days">
                    <div className="flex gap-2 flex-wrap">
                      {DAYS_OF_WEEK.map(day => (
                        <Button
                          key={day.value}
                          variant={sendDays.includes(day.value) ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => toggleDay(day.value)}
                          className="w-12"
                        >
                          {day.label}
                        </Button>
                      ))}
                    </div>
                  </FormGroup>
                </div>

                {/* Stop Conditions */}
                <div className="space-y-4 pt-4 border-t">
                  <h4 className="font-medium">Stop Conditions</h4>
                  <p className="text-sm text-muted-foreground">
                    Automatically stop the workflow for a lead when:
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <label className="flex items-center gap-3 cursor-pointer p-3 rounded-lg bg-muted/50">
                      <input
                        type="checkbox"
                        checked={stopOnReply}
                        onChange={(e) => setStopOnReply(e.target.checked)}
                        className="w-4 h-4 rounded border-border"
                      />
                      <Mail className="h-4 w-4 text-blue-500" />
                      <span>Lead replies to email</span>
                    </label>

                    <label className="flex items-center gap-3 cursor-pointer p-3 rounded-lg bg-muted/50">
                      <input
                        type="checkbox"
                        checked={stopOnClick}
                        onChange={(e) => setStopOnClick(e.target.checked)}
                        className="w-4 h-4 rounded border-border"
                      />
                      <Link className="h-4 w-4 text-purple-500" />
                      <span>Lead clicks a link</span>
                    </label>

                    <label className="flex items-center gap-3 cursor-pointer p-3 rounded-lg bg-muted/50">
                      <input
                        type="checkbox"
                        checked={stopOnCallAnswered}
                        onChange={(e) => setStopOnCallAnswered(e.target.checked)}
                        className="w-4 h-4 rounded border-border"
                      />
                      <Phone className="h-4 w-4 text-green-500" />
                      <span>Lead answers AI call</span>
                    </label>

                    <label className="flex items-center gap-3 cursor-pointer p-3 rounded-lg bg-muted/50">
                      <input
                        type="checkbox"
                        checked={stopOnBounce}
                        onChange={(e) => setStopOnBounce(e.target.checked)}
                        className="w-4 h-4 rounded border-border"
                      />
                      <AlertCircle className="h-4 w-4 text-red-500" />
                      <span>Email bounces</span>
                    </label>
                  </div>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Workflow Steps */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Calendar className="h-5 w-5 text-primary" />
              Workflow Steps
              <Badge variant="outline" className="ml-2">
                {steps.length} step{steps.length !== 1 ? 's' : ''} over {totalDays} days
              </Badge>
            </CardTitle>
            <div className="flex items-center gap-2">
              {STEP_TYPES.map(type => (
                <Button
                  key={type.value}
                  variant="outline"
                  size="sm"
                  onClick={() => addStep(type.value)}
                  className="gap-1"
                  title={`Add ${type.label} step`}
                >
                  <type.icon className={cn("h-4 w-4", {
                    'text-blue-500': type.color === 'blue',
                    'text-green-500': type.color === 'green',
                    'text-purple-500': type.color === 'purple',
                    'text-yellow-500': type.color === 'yellow',
                  })} />
                  <span className="hidden sm:inline">{type.label}</span>
                </Button>
              ))}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {steps.map((step, index) => {
              const typeConfig = getStepTypeConfig(step.stepType);
              const TypeIcon = typeConfig.icon;

              return (
                <div
                  key={step.id}
                  className={cn(
                    "border rounded-lg transition-all",
                    step.expanded ? "border-primary/50 bg-primary/5" : "border-border"
                  )}
                >
                  {/* Step Header */}
                  <div
                    className="flex items-center gap-4 p-4 cursor-pointer"
                    onClick={() => toggleStep(index)}
                  >
                    <div className="flex items-center gap-2 shrink-0">
                      <div className={cn(
                        "w-8 h-8 rounded-full flex items-center justify-center",
                        step.expanded ? "bg-primary text-primary-foreground" : "bg-muted"
                      )}>
                        <TypeIcon className="h-4 w-4" />
                      </div>
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <Badge variant="secondary" className={cn({
                          'bg-blue-500/10 text-blue-500': typeConfig.color === 'blue',
                          'bg-green-500/10 text-green-500': typeConfig.color === 'green',
                          'bg-purple-500/10 text-purple-500': typeConfig.color === 'purple',
                          'bg-yellow-500/10 text-yellow-500': typeConfig.color === 'yellow',
                        })}>
                          {typeConfig.label}
                        </Badge>
                        {index === 0 ? (
                          <Badge variant="outline">Day 0</Badge>
                        ) : (
                          <Badge variant="outline" className="gap-1">
                            <Clock className="h-3 w-3" />
                            +{step.delayDays} day{step.delayDays !== 1 ? 's' : ''}
                          </Badge>
                        )}
                        {step.condition !== 'always' && (
                          <Badge variant="outline" className="gap-1 bg-yellow-500/10 text-yellow-600">
                            {STEP_CONDITIONS.find(c => c.value === step.condition)?.label}
                          </Badge>
                        )}
                      </div>
                      {step.stepType === 'email' && step.subject && (
                        <p className="text-sm text-muted-foreground truncate mt-1">
                          {step.subject}
                        </p>
                      )}
                      {step.stepType === 'call' && (
                        <p className="text-sm text-muted-foreground truncate mt-1">
                          AI Voice Call (max {step.maxDuration}s)
                        </p>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      {steps.length > 1 && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            removeStep(index);
                          }}
                          className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                      {step.expanded ? (
                        <ChevronUp className="h-4 w-4 text-muted-foreground" />
                      ) : (
                        <ChevronDown className="h-4 w-4 text-muted-foreground" />
                      )}
                    </div>
                  </div>

                  {/* Step Content */}
                  {step.expanded && (
                    <div className="px-4 pb-4 space-y-4 border-t">
                      {/* Common: Delay and Condition (not for first step) */}
                      {index > 0 && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
                          <FormGroup label="Delay" hint="Days after previous step">
                            <div className="flex items-center gap-2">
                              <Input
                                type="number"
                                min="1"
                                max="30"
                                value={step.delayDays}
                                onChange={(e) => updateStep(index, { delayDays: parseInt(e.target.value) || 1 })}
                                className="w-20"
                              />
                              <span className="text-sm text-muted-foreground">days</span>
                            </div>
                          </FormGroup>

                          <FormGroup label="Condition" hint="When to execute this step">
                            <Select
                              value={step.condition}
                              onChange={(e) => updateStep(index, { condition: e.target.value })}
                            >
                              {STEP_CONDITIONS.map(c => (
                                <option key={c.value} value={c.value}>{c.label}</option>
                              ))}
                            </Select>
                          </FormGroup>
                        </div>
                      )}

                      {/* Step Type Selector */}
                      <FormGroup label="Step Type">
                        <div className="flex gap-2">
                          {STEP_TYPES.map(type => (
                            <Button
                              key={type.value}
                              variant={step.stepType === type.value ? 'default' : 'outline'}
                              size="sm"
                              onClick={() => updateStep(index, { stepType: type.value })}
                              className="gap-2"
                            >
                              <type.icon className="h-4 w-4" />
                              {type.label}
                            </Button>
                          ))}
                        </div>
                      </FormGroup>

                      {/* Email Fields */}
                      {step.stepType === 'email' && (
                        <div className="space-y-4">
                          <FormGroup label="Subject Line" required>
                            <Input
                              value={step.subject}
                              onChange={(e) => updateStep(index, { subject: e.target.value })}
                              placeholder={index === 0 ? "Quick question about {{businessName}}" : "Re: Quick question about {{businessName}}"}
                            />
                            <p className="text-xs text-muted-foreground mt-1">
                              Variables: {'{{businessName}}'}, {'{{firstName}}'}, {'{{city}}'}, {'{{industry}}'}
                            </p>
                          </FormGroup>

                          <FormGroup label="Email Body" required>
                            <Textarea
                              value={step.body}
                              onChange={(e) => updateStep(index, { body: e.target.value })}
                              placeholder="Hi {{firstName}},&#10;&#10;{{openingLine}}&#10;&#10;..."
                              rows={6}
                            />
                            <p className="text-xs text-muted-foreground mt-1">
                              AI variables: {'{{openingLine}}'}, {'{{painPoint}}'}, {'{{valueProposition}}'}, {'{{followUpHook}}'}
                            </p>
                          </FormGroup>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-muted/50 rounded-lg">
                            <FormGroup label="CTA Button Text" hint="Optional">
                              <Input
                                value={step.ctaText}
                                onChange={(e) => updateStep(index, { ctaText: e.target.value })}
                                placeholder="e.g., Schedule a Call"
                              />
                            </FormGroup>
                            <FormGroup label="CTA URL" hint="Optional">
                              <Input
                                value={step.ctaUrl}
                                onChange={(e) => updateStep(index, { ctaUrl: e.target.value })}
                                placeholder="https://calendly.com/..."
                              />
                            </FormGroup>
                          </div>
                        </div>
                      )}

                      {/* Call Fields */}
                      {step.stepType === 'call' && (
                        <div className="space-y-4">
                          <Alert>
                            <Phone className="h-4 w-4" />
                            <AlertDescription>
                              AI voice calls use your selected assistant ({assistants.find(a => a.id === assistantId)?.name || 'None selected'}).
                              The assistant will be provided with lead context.
                            </AlertDescription>
                          </Alert>

                          <FormGroup label="Call Script (Optional)" hint="Additional context for the AI">
                            <Textarea
                              value={step.callScript}
                              onChange={(e) => updateStep(index, { callScript: e.target.value })}
                              placeholder="Focus on discussing the follow-up from our previous email about..."
                              rows={4}
                            />
                          </FormGroup>

                          <FormGroup label="Max Call Duration">
                            <div className="flex items-center gap-2">
                              <Input
                                type="number"
                                min="30"
                                max="600"
                                value={step.maxDuration}
                                onChange={(e) => updateStep(index, { maxDuration: parseInt(e.target.value) || 120 })}
                                className="w-24"
                              />
                              <span className="text-sm text-muted-foreground">seconds</span>
                            </div>
                          </FormGroup>
                        </div>
                      )}

                      {/* SMS Fields */}
                      {step.stepType === 'sms' && (
                        <div className="space-y-4">
                          <FormGroup label="SMS Message" required>
                            <Textarea
                              value={step.smsMessage}
                              onChange={(e) => updateStep(index, { smsMessage: e.target.value })}
                              placeholder="Hi {{firstName}}, just following up on my email..."
                              rows={3}
                              maxLength={160}
                            />
                            <p className="text-xs text-muted-foreground mt-1">
                              {step.smsMessage.length}/160 characters
                            </p>
                          </FormGroup>
                        </div>
                      )}

                      {/* Wait Fields */}
                      {step.stepType === 'wait' && (
                        <div className="p-4 bg-muted/50 rounded-lg">
                          <p className="text-sm text-muted-foreground">
                            This step simply waits before proceeding to the next action.
                            Configure the delay above.
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Timeline Preview */}
          {steps.length > 1 && (
            <div className="mt-6 pt-6 border-t">
              <h4 className="text-sm font-medium mb-3">Workflow Timeline</h4>
              <div className="flex items-center gap-2 text-sm text-muted-foreground overflow-x-auto pb-2">
                {steps.map((step, index) => {
                  const typeConfig = getStepTypeConfig(step.stepType);
                  const TypeIcon = typeConfig.icon;
                  const dayNumber = steps.slice(0, index + 1).reduce((sum, s, i) => sum + (i === 0 ? 0 : s.delayDays), 0);

                  return (
                    <div key={step.id} className="flex items-center gap-2 shrink-0">
                      <div className={cn(
                        "px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1",
                        {
                          'bg-blue-500/20 text-blue-600': typeConfig.color === 'blue',
                          'bg-green-500/20 text-green-600': typeConfig.color === 'green',
                          'bg-purple-500/20 text-purple-600': typeConfig.color === 'purple',
                          'bg-yellow-500/20 text-yellow-600': typeConfig.color === 'yellow',
                        }
                      )}>
                        <TypeIcon className="h-3 w-3" />
                        Day {dayNumber}
                      </div>
                      {index < steps.length - 1 && (
                        <div className="w-8 h-px bg-border" />
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default WorkflowBuilder;
