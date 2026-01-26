import { useState, useEffect } from 'react';
import { sequencesApi } from '../../services/api';
import {
  ArrowLeft,
  Plus,
  Trash2,
  Clock,
  Mail,
  Wand2,
  Save,
  Play,
  GripVertical,
  ChevronDown,
  ChevronUp,
  Settings,
  Calendar,
  Globe,
  Loader2,
  Link,
  MousePointer,
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

function SequenceBuilder({ sequence, campaigns, userId, onBack, onSave, onActivate }) {
  const isEditing = !!sequence;

  // Basic info
  const [name, setName] = useState(sequence?.name || '');
  const [campaignId, setCampaignId] = useState(sequence?.campaign_id || '');

  // Send window settings
  const [timezone, setTimezone] = useState(sequence?.timezone || 'UTC');
  const [sendWindowStart, setSendWindowStart] = useState(sequence?.send_window_start || '09:00');
  const [sendWindowEnd, setSendWindowEnd] = useState(sequence?.send_window_end || '17:00');
  const [sendDays, setSendDays] = useState(sequence?.send_days || [1, 2, 3, 4, 5]);

  // Stop conditions
  const [stopOnReply, setStopOnReply] = useState(sequence?.stop_on_reply ?? true);
  const [stopOnClick, setStopOnClick] = useState(sequence?.stop_on_click ?? false);
  const [stopOnBounce, setStopOnBounce] = useState(sequence?.stop_on_bounce ?? true);

  // Steps
  const [steps, setSteps] = useState(
    sequence?.steps?.map(s => ({
      id: s.id,
      delayDays: s.delay_days,
      delayHours: s.delay_hours || 0,
      subject: s.subject_template,
      body: s.body_template,
      ctaText: s.cta_text || '',
      ctaUrl: s.cta_url || '',
      expanded: false,
    })) || [
      {
        id: 'step-1',
        delayDays: 0,
        delayHours: 0,
        subject: '',
        body: '',
        ctaText: '',
        ctaUrl: '',
        expanded: true,
      }
    ]
  );

  // UI state
  const [showSettings, setShowSettings] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');
  const [activeStepIndex, setActiveStepIndex] = useState(0);

  // Add a new step
  const addStep = () => {
    const newStep = {
      id: `step-${Date.now()}`,
      delayDays: 3,
      delayHours: 0,
      subject: '',
      body: '',
      ctaText: '',
      ctaUrl: '',
      expanded: true,
    };

    // Collapse all other steps
    setSteps(prev => [...prev.map(s => ({ ...s, expanded: false })), newStep]);
    setActiveStepIndex(steps.length);
  };

  // Remove a step
  const removeStep = (index) => {
    if (steps.length <= 1) return;
    setSteps(prev => prev.filter((_, i) => i !== index));
    if (activeStepIndex >= index && activeStepIndex > 0) {
      setActiveStepIndex(activeStepIndex - 1);
    }
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
    setActiveStepIndex(index);
  };

  // Toggle day selection
  const toggleDay = (day) => {
    setSendDays(prev =>
      prev.includes(day)
        ? prev.filter(d => d !== day)
        : [...prev, day].sort()
    );
  };

  // Save sequence
  const handleSave = async () => {
    setError('');

    if (!name.trim()) {
      setError('Please enter a sequence name');
      return;
    }

    if (steps.length === 0 || !steps[0].subject || !steps[0].body) {
      setError('Please add at least one step with subject and body');
      return;
    }

    setIsSaving(true);

    try {
      const sequenceData = {
        name,
        campaignId: campaignId || null,
        timezone,
        sendWindowStart,
        sendWindowEnd,
        sendDays,
        stopOnReply,
        stopOnClick,
        stopOnBounce,
        steps: steps.map(s => ({
          delayDays: s.delayDays,
          delayHours: s.delayHours,
          subject: s.subject,
          body: s.body,
          ctaText: s.ctaText || null,
          ctaUrl: s.ctaUrl || null,
        })),
      };

      if (isEditing) {
        await sequencesApi.update(userId, sequence.id, sequenceData);
      } else {
        await sequencesApi.create(userId, sequenceData);
      }

      onSave?.();
    } catch (err) {
      setError(err.message || 'Failed to save sequence');
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
              {isEditing ? 'Edit Sequence' : 'Create Email Sequence'}
            </h1>
            <p className="text-sm text-muted-foreground">
              Build a multi-step email sequence with automated follow-ups
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {isEditing && sequence?.status === 'draft' && (
            <Button
              variant="outline"
              onClick={() => onActivate?.(sequence.id)}
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
            {isEditing ? 'Save Changes' : 'Save Sequence'}
          </Button>
        </div>
      </div>

      {error && (
        <Alert variant="destructive" onClose={() => setError('')}>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Basic Info */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Mail className="h-5 w-5 text-primary" />
            Sequence Details
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormGroup label="Sequence Name" required>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g., Q1 Cold Outreach"
              />
            </FormGroup>

            <FormGroup label="Linked Campaign" hint="Optional - use campaign leads">
              <Select
                value={campaignId}
                onChange={(e) => setCampaignId(e.target.value)}
              >
                <option value="">No campaign (select leads manually)</option>
                {campaigns.map(c => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c.total_leads} leads)
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

                  <FormGroup label="Send Days">
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
                    Automatically stop the sequence for a lead when:
                  </p>

                  <div className="space-y-3">
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={stopOnReply}
                        onChange={(e) => setStopOnReply(e.target.checked)}
                        className="w-4 h-4 rounded border-border"
                      />
                      <span>Lead replies to an email</span>
                      <Badge variant="secondary" className="text-xs">Recommended</Badge>
                    </label>

                    <label className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={stopOnClick}
                        onChange={(e) => setStopOnClick(e.target.checked)}
                        className="w-4 h-4 rounded border-border"
                      />
                      <span>Lead clicks a link</span>
                    </label>

                    <label className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={stopOnBounce}
                        onChange={(e) => setStopOnBounce(e.target.checked)}
                        className="w-4 h-4 rounded border-border"
                      />
                      <span>Email bounces</span>
                      <Badge variant="secondary" className="text-xs">Recommended</Badge>
                    </label>
                  </div>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Steps Timeline */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Calendar className="h-5 w-5 text-primary" />
              Email Steps
              <Badge variant="outline" className="ml-2">
                {steps.length} step{steps.length !== 1 ? 's' : ''} over {totalDays} days
              </Badge>
            </CardTitle>
            <Button variant="outline" size="sm" onClick={addStep} className="gap-2">
              <Plus className="h-4 w-4" />
              Add Step
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {steps.map((step, index) => (
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
                      "w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold",
                      step.expanded ? "bg-primary text-primary-foreground" : "bg-muted"
                    )}>
                      {index + 1}
                    </div>
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      {index === 0 ? (
                        <Badge variant="secondary">Immediately</Badge>
                      ) : (
                        <Badge variant="outline" className="gap-1">
                          <Clock className="h-3 w-3" />
                          {step.delayDays} day{step.delayDays !== 1 ? 's' : ''} later
                        </Badge>
                      )}
                    </div>
                    {step.subject && (
                      <p className="text-sm text-muted-foreground truncate mt-1">
                        {step.subject}
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
                    {/* Delay (not for first step) */}
                    {index > 0 && (
                      <div className="pt-4">
                        <FormGroup label="Send after" hint="Days after previous email">
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
                      </div>
                    )}

                    {/* Subject */}
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

                    {/* Body */}
                    <FormGroup label="Email Body" required>
                      <Textarea
                        value={step.body}
                        onChange={(e) => updateStep(index, { body: e.target.value })}
                        placeholder="Hi {{firstName}},&#10;&#10;{{openingLine}}&#10;&#10;..."
                        rows={8}
                      />
                      <p className="text-xs text-muted-foreground mt-1">
                        AI variables: {'{{openingLine}}'}, {'{{painPoint}}'}, {'{{valueProposition}}'}, {'{{followUpHook}}'}
                      </p>
                    </FormGroup>

                    {/* CTA */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-muted/50 rounded-lg">
                      <FormGroup label="CTA Button Text" hint="Optional">
                        <Input
                          value={step.ctaText}
                          onChange={(e) => updateStep(index, { ctaText: e.target.value })}
                          placeholder="e.g., Schedule a Call"
                        />
                      </FormGroup>
                      <FormGroup label="CTA URL" hint="Optional">
                        <div className="relative">
                          <Link className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input
                            value={step.ctaUrl}
                            onChange={(e) => updateStep(index, { ctaUrl: e.target.value })}
                            placeholder="https://calendly.com/..."
                            className="pl-10"
                          />
                        </div>
                      </FormGroup>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Timeline Preview */}
          {steps.length > 1 && (
            <div className="mt-6 pt-6 border-t">
              <h4 className="text-sm font-medium mb-3">Sequence Timeline</h4>
              <div className="flex items-center gap-2 text-sm text-muted-foreground overflow-x-auto pb-2">
                {steps.map((step, index) => (
                  <div key={step.id} className="flex items-center gap-2 shrink-0">
                    <div className={cn(
                      "px-3 py-1 rounded-full text-xs font-medium",
                      index === 0 ? "bg-primary text-primary-foreground" : "bg-muted"
                    )}>
                      {index === 0 ? 'Day 0' : `Day ${steps.slice(0, index + 1).reduce((sum, s, i) => sum + (i === 0 ? 0 : s.delayDays), 0)}`}
                    </div>
                    {index < steps.length - 1 && (
                      <div className="w-8 h-px bg-border" />
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default SequenceBuilder;
