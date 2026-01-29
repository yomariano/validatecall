import { useState, useEffect } from 'react';
import { vapiApi, claudeApi } from '../services/api';
import {
  Bot,
  Plus,
  Pencil,
  Trash2,
  Volume2,
  MessageSquare,
  Settings2,
  Loader2,
  Play,
  Save,
  X,
  ChevronDown,
  Mic,
  Brain,
  Sparkles,
  Copy,
  Check,
  Phone,
  Wand2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Input, Textarea, Select, Label, FormGroup } from '@/components/ui/input';
import { EmptyState, LoadingState } from '@/components/ui/loading';
import { cn } from '@/lib/utils';
import VoiceTestModal from '@/components/VoiceTestModal';

// Voice provider options
const VOICE_PROVIDERS = [
  { id: '11labs', name: 'ElevenLabs', description: 'High-quality, natural voices' },
  { id: 'openai', name: 'OpenAI', description: 'Fast, reliable TTS' },
  { id: 'deepgram', name: 'Deepgram', description: 'Low-latency voices' },
];

// Language options for ElevenLabs (ISO 639-1 codes only - no regional variants)
const LANGUAGE_OPTIONS = [
  { id: 'en', name: 'English', description: 'Default' },
  { id: 'es', name: 'Spanish', description: 'Español (works for all Spanish variants including Argentinian)' },
  { id: 'pt', name: 'Portuguese', description: 'Português' },
  { id: 'fr', name: 'French', description: 'Français' },
  { id: 'de', name: 'German', description: 'Deutsch' },
  { id: 'it', name: 'Italian', description: 'Italiano' },
  { id: 'pl', name: 'Polish', description: 'Polski' },
  { id: 'hi', name: 'Hindi', description: 'हिन्दी' },
  { id: 'ar', name: 'Arabic', description: 'العربية' },
  { id: 'zh', name: 'Chinese', description: '中文' },
  { id: 'ja', name: 'Japanese', description: '日本語' },
  { id: 'ko', name: 'Korean', description: '한국어' },
  { id: 'nl', name: 'Dutch', description: 'Nederlands' },
  { id: 'ru', name: 'Russian', description: 'Русский' },
  { id: 'tr', name: 'Turkish', description: 'Türkçe' },
  { id: 'sv', name: 'Swedish', description: 'Svenska' },
];

// ElevenLabs TTS Model options - CRITICAL for non-English voices
const ELEVENLABS_MODEL_OPTIONS = [
  { id: 'eleven_multilingual_v2', name: 'Multilingual v2', description: 'Best for non-English - native pronunciation' },
  { id: 'eleven_turbo_v2_5', name: 'Turbo v2.5', description: 'Fast, good quality' },
  { id: 'eleven_flash_v2_5', name: 'Flash v2.5', description: 'Fastest, lower latency' },
  { id: 'eleven_turbo_v2', name: 'Turbo v2', description: 'Legacy turbo' },
  { id: 'eleven_monolingual_v1', name: 'Monolingual v1', description: 'English only' },
];

// Model options
const MODEL_OPTIONS = [
  { id: 'gpt-4o-mini', name: 'GPT-4o Mini', provider: 'openai', description: 'Fast & cost-effective' },
  { id: 'gpt-4o', name: 'GPT-4o', provider: 'openai', description: 'Most capable' },
  { id: 'gpt-4-turbo', name: 'GPT-4 Turbo', provider: 'openai', description: 'Balanced performance' },
  { id: 'gpt-3.5-turbo', name: 'GPT-3.5 Turbo', provider: 'openai', description: 'Fastest & cheapest' },
];

// Default system prompt template
const DEFAULT_SYSTEM_PROMPT = `You are a friendly and professional market research agent conducting brief phone surveys. Your goal is to validate a product idea by gathering genuine feedback.

## CRITICAL: IVR/AUTOMATED SYSTEM HANDLING
If you hear an automated phone system (IVR) with options like "Press 1 for..." or "If you are an existing customer, press 1":
1. STAY COMPLETELY SILENT - do not speak at all
2. LISTEN to ALL the options until they finish
3. Use the DTMF tool to press the appropriate key (usually 2 for "new inquiries" or "other" or 0 for "operator")
4. If options repeat, press the key for reaching a human/receptionist
5. ONLY start your greeting when a REAL HUMAN answers
6. Signs of a human: they say "Hello?", ask "How can I help?", or respond naturally

If you reach voicemail or answering machine: say "I'll try again later, thank you" and end the call.

## CALL SCRIPT (Only use with REAL HUMANS):
1. OPENING (Keep brief - 15 seconds max):
   - Greet warmly and introduce yourself
   - Ask if they have 2 minutes for a brief survey
   - If no: Thank them politely and end call

2. QUALIFICATION (30 seconds):
   - Ask if they or their business might benefit from a solution in this space
   - Listen actively for pain points

3. PRODUCT PITCH (45 seconds):
   - Present the product idea simply and clearly
   - Ask: "Does this sound like something that would be useful to you?"

4. GATHER FEEDBACK (60 seconds):
   - "On a scale of 1-10, how interested would you be?"
   - "What would make this a must-have for you?"
   - "What's your biggest hesitation?"

5. CLOSING (15 seconds):
   - Thank them genuinely
   - Ask if they'd like to be notified when it launches

TONE GUIDELINES:
- Be conversational, not salesy
- Listen more than you talk
- Don't push if they're not interested
- Be respectful of their time`;

const DEFAULT_FIRST_MESSAGE = "Hi there! This is Alex from a quick market research study. Do you have about 2 minutes to share your thoughts on a new product idea? Your feedback would be really helpful!";

function Agents() {
  const [agents, setAgents] = useState([]);
  const [voices, setVoices] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Editor state
  const [editingAgent, setEditingAgent] = useState(null);
  const [isCreating, setIsCreating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Test modal state
  const [testingAgent, setTestingAgent] = useState(null);

  // AI generation state
  const [aiGenerating, setAiGenerating] = useState({
    firstMessage: false,
    systemPrompt: false,
    endCallMessage: false
  });
  const [aiInput, setAiInput] = useState({
    firstMessage: '',
    systemPrompt: '',
    endCallMessage: ''
  });

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    voiceProvider: '11labs',
    voiceId: '21m00Tcm4TlvDq8ikWAM',
    customVoiceId: '', // For custom ElevenLabs voice IDs
    language: 'en', // Language code for ElevenLabs
    elevenLabsModel: 'eleven_multilingual_v2', // CRITICAL: Use multilingual for non-English
    model: 'gpt-4o-mini',
    temperature: 0.7,
    systemPrompt: DEFAULT_SYSTEM_PROMPT,
    firstMessage: DEFAULT_FIRST_MESSAGE,
    endCallMessage: 'Thank you so much for your time today! Your feedback is incredibly valuable. Have a great day!',
    // Voice naturalness settings (ElevenLabs)
    stability: 0.36,          // Lower = more expressive/natural (0.3-0.5 recommended)
    similarityBoost: 0.75,    // Voice clarity
    style: 0.38,              // Expressiveness (ElevenLabs v2 voices)
    speed: 0.9,               // Speech speed (0.9 preserves natural accent rhythm)
    useSpeakerBoost: true,    // Enhance voice clarity
    // Call settings
    silenceTimeoutSeconds: 30,
    maxDurationSeconds: 600,
    firstMessageMode: 'assistant-waits-for-user', // Wait for user to answer before speaking
    // Voicemail & IVR detection
    voicemailDetectionEnabled: true,
    enableDtmf: true, // Allow sending key presses for IVR navigation
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [agentsData, voicesData] = await Promise.all([
        vapiApi.getAssistants(),
        vapiApi.getVoices(),
      ]);
      setAgents(agentsData || []);
      setVoices(voicesData || {});
    } catch (err) {
      console.error('Error loading agents:', err);
      setError('Failed to load agents');
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      voiceProvider: '11labs',
      voiceId: '21m00Tcm4TlvDq8ikWAM',
      customVoiceId: '',
      language: 'en',
      elevenLabsModel: 'eleven_multilingual_v2',
      model: 'gpt-4o-mini',
      temperature: 0.7,
      systemPrompt: DEFAULT_SYSTEM_PROMPT,
      firstMessage: DEFAULT_FIRST_MESSAGE,
      endCallMessage: 'Thank you so much for your time today! Your feedback is incredibly valuable. Have a great day!',
      stability: 0.36,
      similarityBoost: 0.75,
      style: 0.38,
      speed: 0.9,
      useSpeakerBoost: true,
      silenceTimeoutSeconds: 30,
      maxDurationSeconds: 600,
      firstMessageMode: 'assistant-waits-for-user',
      voicemailDetectionEnabled: true,
      enableDtmf: true,
    });
  };

  const handleCreate = () => {
    resetForm();
    setEditingAgent(null);
    setIsCreating(true);
    // Scroll to top to show the editor
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // AI generation handler for agent text fields
  const handleAiGenerate = async (field, type) => {
    const input = aiInput[field];
    if (!input.trim()) {
      setError('Please describe what you want to generate');
      return;
    }

    setAiGenerating(prev => ({ ...prev, [field]: true }));
    setError('');

    try {
      // Determine language context from formData
      const langName = LANGUAGE_OPTIONS.find(l => l.id === formData.language)?.name || 'English';
      const isNonEnglish = formData.language !== 'en';

      // Build custom prompt based on field type
      let customPrompt = '';
      if (field === 'firstMessage') {
        customPrompt = `You are helping create a greeting message for an AI voice agent that makes market research calls.
${isNonEnglish ? `IMPORTANT: Generate the text in ${langName}. The voice agent speaks ${langName}.` : ''}

Based on this description: "${input.trim()}"

Generate a natural, friendly opening message that:
- Introduces the caller briefly
- Asks if they have 2 minutes for a quick survey
- Sounds conversational, not robotic
- Is 2-3 sentences max
${isNonEnglish ? `- Must be written entirely in ${langName}` : ''}

Generate only the greeting text, nothing else:`;
      } else if (field === 'systemPrompt') {
        customPrompt = `You are helping create system instructions for an AI voice agent conducting market research calls.
${isNonEnglish ? `IMPORTANT: The agent will speak in ${langName}. Include instructions for ${langName}-speaking scenarios.` : ''}

Based on this description: "${input.trim()}"

Generate professional agent instructions that include:
1. OPENING phase (15 seconds) - greeting and permission to continue
2. QUALIFICATION phase (30 seconds) - understand their relevance
3. PRODUCT PITCH phase (45 seconds) - present the idea clearly
4. FEEDBACK GATHERING phase (60 seconds) - get ratings and opinions
5. CLOSING phase (15 seconds) - thank them

Include tone guidelines: conversational, respectful, not pushy.
${isNonEnglish ? `Note: Agent will communicate in ${langName}` : ''}

Generate only the system prompt, nothing else:`;
      } else if (field === 'endCallMessage') {
        customPrompt = `You are helping create an end-call message for an AI voice agent.
${isNonEnglish ? `IMPORTANT: Generate the text in ${langName}.` : ''}

Based on this description: "${input.trim()}"

Generate a brief, warm closing message that:
- Thanks them for their time
- Mentions their feedback is valuable
- Ends on a positive note
- Is 1-2 sentences max
${isNonEnglish ? `- Must be written entirely in ${langName}` : ''}

Generate only the closing text, nothing else:`;
      }

      const result = await claudeApi.generate(customPrompt, 'agent');
      const generated = typeof result.generated === 'string' ? result.generated.trim() : result.generated;

      // Update the form field with generated content
      setFormData(prev => ({ ...prev, [field]: generated }));
      setAiInput(prev => ({ ...prev, [field]: '' }));
      setSuccess(`${field === 'firstMessage' ? 'First message' : field === 'systemPrompt' ? 'System prompt' : 'End call message'} generated!`);
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.message || 'Failed to generate text');
    } finally {
      setAiGenerating(prev => ({ ...prev, [field]: false }));
    }
  };

  const handleEdit = (agent) => {
    const provider = agent.voice?.provider || '11labs';
    const providerVoices = voices[provider] || [];
    const existingVoiceId = agent.voice?.voiceId || '21m00Tcm4TlvDq8ikWAM';
    // Check if this voice ID is in our known list (excluding 'custom')
    const isKnownVoice = providerVoices.some(v => v.id === existingVoiceId && v.id !== 'custom');

    console.log('📝 Loading agent for edit:', {
      existingVoiceId,
      isKnownVoice,
      providerVoicesCount: providerVoices.length,
      willSetCustom: !isKnownVoice,
      voiceSettings: {
        stability: agent.voice?.stability,
        similarityBoost: agent.voice?.similarityBoost,
        style: agent.voice?.style,
        speed: agent.voice?.speed,
        model: agent.voice?.model
      }
    });

    setFormData({
      name: agent.name || '',
      voiceProvider: provider,
      voiceId: isKnownVoice ? existingVoiceId : 'custom',
      customVoiceId: isKnownVoice ? '' : existingVoiceId,
      language: agent.voice?.language || 'en',
      elevenLabsModel: agent.voice?.model || 'eleven_multilingual_v2',
      model: agent.model?.model || 'gpt-4o-mini',
      temperature: agent.model?.temperature || 0.7,
      systemPrompt: agent.model?.messages?.[0]?.content || DEFAULT_SYSTEM_PROMPT,
      firstMessage: agent.firstMessage || DEFAULT_FIRST_MESSAGE,
      endCallMessage: agent.endCallMessage || '',
      // Voice naturalness settings
      stability: agent.voice?.stability ?? 0.36,
      similarityBoost: agent.voice?.similarityBoost ?? 0.75,
      style: agent.voice?.style ?? 0.38,
      speed: agent.voice?.speed ?? 0.9,
      useSpeakerBoost: agent.voice?.useSpeakerBoost ?? true,
      // Call settings
      silenceTimeoutSeconds: agent.silenceTimeoutSeconds ?? 30,
      maxDurationSeconds: agent.maxDurationSeconds ?? 600,
      firstMessageMode: agent.firstMessageMode || 'assistant-waits-for-user',
      voicemailDetectionEnabled: agent.voicemailDetection !== 'off',
      enableDtmf: agent.tools?.some(t => t.type === 'dtmf') ?? true,
    });
    setEditingAgent(agent);
    setIsCreating(true);
    // Scroll to top to show the editor
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCancel = () => {
    setIsCreating(false);
    setEditingAgent(null);
    resetForm();
  };

  const handleSave = async () => {
    setError('');
    setSuccess('');

    if (!formData.name.trim()) {
      setError('Please enter an agent name');
      return;
    }

    // Validate custom voice ID if selected
    if (formData.voiceId === 'custom' && !formData.customVoiceId.trim()) {
      setError('Please enter a custom voice ID');
      return;
    }

    setIsSaving(true);

    try {
      // Build voice config with naturalness settings
      // Use customVoiceId when 'custom' is selected
      const actualVoiceId = formData.voiceId === 'custom'
        ? formData.customVoiceId.trim()
        : formData.voiceId;

      console.log('💾 Saving agent with voice:', {
        selected: formData.voiceId,
        customVoiceId: formData.customVoiceId,
        actualVoiceId: actualVoiceId
      });

      const voiceConfig = {
        provider: formData.voiceProvider,
        voiceId: actualVoiceId,
      };

      // Add ElevenLabs-specific settings for natural voice
      if (formData.voiceProvider === '11labs') {
        voiceConfig.stability = parseFloat(formData.stability);
        voiceConfig.similarityBoost = parseFloat(formData.similarityBoost);
        voiceConfig.style = parseFloat(formData.style);
        voiceConfig.speed = parseFloat(formData.speed); // Important for accent rhythm
        voiceConfig.useSpeakerBoost = formData.useSpeakerBoost;
        // CRITICAL: Set model for native non-English pronunciation
        voiceConfig.model = formData.elevenLabsModel;
        // Set language for proper pronunciation
        if (formData.language && formData.language !== 'en') {
          voiceConfig.language = formData.language;
        }
      }

      console.log('🎤 Full voice config being sent to Vapi:', voiceConfig);

      // Build tools array for IVR navigation
      const tools = [];
      if (formData.enableDtmf) {
        tools.push({ type: 'dtmf' }); // Allow sending key presses for IVR navigation
      }

      const assistantConfig = {
        name: formData.name,
        model: {
          provider: 'openai',
          model: formData.model,
          temperature: parseFloat(formData.temperature),
          messages: [
            {
              role: 'system',
              content: formData.systemPrompt,
            },
          ],
        },
        // DTMF tool must be at root level for Vapi
        ...(tools.length > 0 && { tools }),
        voice: voiceConfig,
        // Configure transcriber for the correct language (speech-to-text)
        transcriber: {
          provider: 'deepgram',
          model: 'nova-2',
          // Use 'multi' for auto-detection or specific language code
          language: formData.language === 'en' ? 'en' : formData.language,
        },
        firstMessage: formData.firstMessage,
        firstMessageMode: formData.firstMessageMode, // Wait for user to answer before speaking
        endCallMessage: formData.endCallMessage,
        silenceTimeoutSeconds: parseInt(formData.silenceTimeoutSeconds),
        maxDurationSeconds: parseInt(formData.maxDurationSeconds),
        // Voicemail detection - only include if enabled
        ...(formData.voicemailDetectionEnabled && {
          voicemailDetection: {
            provider: 'twilio',
          }
        }),
      };

      if (editingAgent) {
        await vapiApi.updateAssistant(editingAgent.id, assistantConfig);
        setSuccess('Agent updated successfully');
      } else {
        await vapiApi.createAssistant(assistantConfig);
        setSuccess('Agent created successfully');
      }

      setIsCreating(false);
      setEditingAgent(null);
      resetForm();
      loadData();
    } catch (err) {
      setError(err.message || 'Failed to save agent');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (agent) => {
    if (!confirm(`Are you sure you want to delete "${agent.name}"?`)) {
      return;
    }

    try {
      await vapiApi.deleteAssistant(agent.id);
      setSuccess('Agent deleted successfully');
      loadData();
    } catch (err) {
      setError(err.message || 'Failed to delete agent');
    }
  };

  const handleCopyId = (id) => {
    navigator.clipboard.writeText(id);
    setSuccess('Agent ID copied to clipboard');
  };

  const getVoiceName = (provider, voiceId) => {
    const providerVoices = voices[provider] || [];
    const voice = providerVoices.find(v => v.id === voiceId);
    return voice?.name || voiceId;
  };

  const currentProviderVoices = voices[formData.voiceProvider] || [];

  if (isLoading) {
    return <LoadingState message="Loading agents..." />;
  }

  return (
    <div className="space-y-8 animate-slide-up">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight bg-gradient-to-r from-foreground to-muted-foreground bg-clip-text text-transparent">
            Voice Agents
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground">
            Configure AI voice agents for your calling campaigns
          </p>
        </div>
        {!isCreating && (
          <Button onClick={handleCreate} variant="gradient" className="w-full sm:w-auto">
            <Plus className="h-4 w-4 mr-2" />
            Create Agent
          </Button>
        )}
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

      {/* Agent Editor */}
      {isCreating && (
        <Card className="border-primary/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bot className="h-5 w-5 text-primary" />
              {editingAgent ? 'Edit Agent' : 'Create New Agent'}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Basic Info */}
            <div className="grid md:grid-cols-2 gap-6">
              <FormGroup label="Agent Name *">
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., Market Research Agent"
                />
              </FormGroup>

              <FormGroup label="AI Model">
                <Select
                  value={formData.model}
                  onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                >
                  {MODEL_OPTIONS.map((model) => (
                    <option key={model.id} value={model.id}>
                      {model.name} - {model.description}
                    </option>
                  ))}
                </Select>
              </FormGroup>
            </div>

            {/* Voice Settings */}
            <div className="p-4 rounded-lg bg-muted/50 border border-border space-y-4">
              <div className="flex items-center gap-2 text-sm font-medium">
                <Volume2 className="h-4 w-4 text-primary" />
                Voice Settings
              </div>

              <div className="grid md:grid-cols-3 gap-4">
                <FormGroup label="Voice Provider">
                  <Select
                    value={formData.voiceProvider}
                    onChange={(e) => {
                      const provider = e.target.value;
                      const firstVoice = voices[provider]?.[0]?.id || '';
                      setFormData({
                        ...formData,
                        voiceProvider: provider,
                        voiceId: firstVoice,
                      });
                    }}
                  >
                    {VOICE_PROVIDERS.map((provider) => (
                      <option key={provider.id} value={provider.id}>
                        {provider.name}
                      </option>
                    ))}
                  </Select>
                </FormGroup>

                <FormGroup label="Voice">
                  <Select
                    value={formData.voiceId}
                    onChange={(e) => setFormData({ ...formData, voiceId: e.target.value })}
                  >
                    {currentProviderVoices.map((voice) => (
                      <option key={voice.id} value={voice.id}>
                        {voice.name} ({voice.gender}) - {voice.description}
                      </option>
                    ))}
                  </Select>
                </FormGroup>

                {/* Custom Voice ID input - shown when 'custom' is selected */}
                {formData.voiceId === 'custom' && (
                  <FormGroup label="Custom Voice ID">
                    <Input
                      type="text"
                      placeholder="e.g., 21m00Tcm4TlvDq8ikWAM"
                      value={formData.customVoiceId}
                      onChange={(e) => setFormData({ ...formData, customVoiceId: e.target.value })}
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Get this from ElevenLabs: Voice Library → click voice → Copy Voice ID
                    </p>
                  </FormGroup>
                )}

                {/* Language selector - CRITICAL for non-English voices to sound native */}
                {formData.voiceProvider === '11labs' && (
                  <FormGroup label="Voice Language">
                    <Select
                      value={formData.language}
                      onChange={(e) => setFormData({ ...formData, language: e.target.value })}
                    >
                      {LANGUAGE_OPTIONS.map((lang) => (
                        <option key={lang.id} value={lang.id}>
                          {lang.name} - {lang.description}
                        </option>
                      ))}
                    </Select>
                    <p className="text-xs text-muted-foreground mt-1">
                      Select the language for native pronunciation
                    </p>
                  </FormGroup>
                )}

                {/* ElevenLabs TTS Model selector - CRITICAL for non-English */}
                {formData.voiceProvider === '11labs' && (
                  <FormGroup label="TTS Model">
                    <Select
                      value={formData.elevenLabsModel}
                      onChange={(e) => setFormData({ ...formData, elevenLabsModel: e.target.value })}
                    >
                      {ELEVENLABS_MODEL_OPTIONS.map((model) => (
                        <option key={model.id} value={model.id}>
                          {model.name} - {model.description}
                        </option>
                      ))}
                    </Select>
                    <p className="text-xs text-muted-foreground mt-1">
                      Use &quot;Multilingual v2&quot; for native non-English speech
                    </p>
                  </FormGroup>
                )}

                <FormGroup label="AI Temperature">
                  <div className="flex items-center gap-3">
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.1"
                      value={formData.temperature}
                      onChange={(e) => setFormData({ ...formData, temperature: parseFloat(e.target.value) })}
                      className="flex-1"
                    />
                    <span className="text-sm font-mono w-8">{formData.temperature}</span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Lower = focused, Higher = creative
                  </p>
                </FormGroup>
              </div>

              {/* ElevenLabs Voice Naturalness - Only show for 11labs */}
              {formData.voiceProvider === '11labs' && (
                <div className="pt-4 border-t border-border/50">
                  <p className="text-xs text-muted-foreground mb-3">Voice Naturalness (ElevenLabs)</p>
                  <div className="grid md:grid-cols-4 gap-4">
                    <FormGroup label="Stability">
                      <div className="flex items-center gap-3">
                        <input
                          type="range"
                          min="0"
                          max="1"
                          step="0.05"
                          value={formData.stability}
                          onChange={(e) => setFormData({ ...formData, stability: parseFloat(e.target.value) })}
                          className="flex-1"
                        />
                        <span className="text-sm font-mono w-10">{formData.stability}</span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        Lower = more expressive & natural
                      </p>
                    </FormGroup>

                    <FormGroup label="Clarity">
                      <div className="flex items-center gap-3">
                        <input
                          type="range"
                          min="0"
                          max="1"
                          step="0.05"
                          value={formData.similarityBoost}
                          onChange={(e) => setFormData({ ...formData, similarityBoost: parseFloat(e.target.value) })}
                          className="flex-1"
                        />
                        <span className="text-sm font-mono w-10">{formData.similarityBoost}</span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        Higher = clearer voice
                      </p>
                    </FormGroup>

                    <FormGroup label="Style/Expression">
                      <div className="flex items-center gap-3">
                        <input
                          type="range"
                          min="0"
                          max="1"
                          step="0.05"
                          value={formData.style}
                          onChange={(e) => setFormData({ ...formData, style: parseFloat(e.target.value) })}
                          className="flex-1"
                        />
                        <span className="text-sm font-mono w-10">{formData.style}</span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        Higher = more expressive
                      </p>
                    </FormGroup>

                    <FormGroup label="Speed">
                      <div className="flex items-center gap-3">
                        <input
                          type="range"
                          min="0.5"
                          max="1.5"
                          step="0.05"
                          value={formData.speed}
                          onChange={(e) => setFormData({ ...formData, speed: parseFloat(e.target.value) })}
                          className="flex-1"
                        />
                        <span className="text-sm font-mono w-10">{formData.speed}</span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        0.9 = natural accent rhythm
                      </p>
                    </FormGroup>
                  </div>
                </div>
              )}
            </div>

            {/* Call Settings */}
            <div className="p-4 rounded-lg bg-muted/50 border border-border space-y-4">
              <div className="flex items-center gap-2 text-sm font-medium">
                <MessageSquare className="h-4 w-4 text-primary" />
                Call Settings
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <FormGroup label="Silence Timeout (seconds)">
                  <div className="flex items-center gap-3">
                    <input
                      type="range"
                      min="10"
                      max="60"
                      step="5"
                      value={formData.silenceTimeoutSeconds}
                      onChange={(e) => setFormData({ ...formData, silenceTimeoutSeconds: parseInt(e.target.value) })}
                      className="flex-1"
                    />
                    <span className="text-sm font-mono w-10">{formData.silenceTimeoutSeconds}s</span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    How long to wait on silence before ending
                  </p>
                </FormGroup>

                <FormGroup label="Max Call Duration (seconds)">
                  <div className="flex items-center gap-3">
                    <input
                      type="range"
                      min="60"
                      max="1800"
                      step="60"
                      value={formData.maxDurationSeconds}
                      onChange={(e) => setFormData({ ...formData, maxDurationSeconds: parseInt(e.target.value) })}
                      className="flex-1"
                    />
                    <span className="text-sm font-mono w-12">{Math.floor(formData.maxDurationSeconds / 60)}m</span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Maximum call length
                  </p>
                </FormGroup>
              </div>

              {/* First Message Mode */}
              <div className="pt-4 border-t border-border/50">
                <FormGroup label="When to Start Speaking">
                  <Select
                    value={formData.firstMessageMode}
                    onChange={(e) => setFormData({ ...formData, firstMessageMode: e.target.value })}
                  >
                    <option value="assistant-waits-for-user">Wait for user to say hello first (Recommended)</option>
                    <option value="assistant-speaks-first">Speak immediately when call connects</option>
                  </Select>
                  <p className="text-xs text-muted-foreground mt-1">
                    &quot;Wait for user&quot; prevents talking before they answer
                  </p>
                </FormGroup>

                {/* Voicemail & IVR Detection */}
                <div className="grid md:grid-cols-2 gap-4 mt-4">
                  <FormGroup label="Voicemail Detection">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.voicemailDetectionEnabled}
                        onChange={(e) => setFormData({ ...formData, voicemailDetectionEnabled: e.target.checked })}
                        className="rounded border-border"
                      />
                      <span className="text-sm">Detect answering machines & voicemail</span>
                    </label>
                    <p className="text-xs text-muted-foreground mt-1">
                      Hangs up or leaves message when voicemail detected
                    </p>
                  </FormGroup>

                  <FormGroup label="IVR Navigation (DTMF)">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.enableDtmf}
                        onChange={(e) => setFormData({ ...formData, enableDtmf: e.target.checked })}
                        className="rounded border-border"
                      />
                      <span className="text-sm">Enable key press navigation</span>
                    </label>
                    <p className="text-xs text-muted-foreground mt-1">
                      Handles &quot;Press 1 for...&quot; automated menus
                    </p>
                  </FormGroup>
                </div>
              </div>
            </div>

            {/* Messages */}
            <div className="space-y-4">
              <FormGroup label="First Message (Greeting)">
                {/* AI Generator for First Message */}
                <div className="flex gap-2 mb-2">
                  <Input
                    type="text"
                    placeholder="Describe your greeting (e.g., 'friendly intro for real estate survey')"
                    value={aiInput.firstMessage}
                    onChange={(e) => setAiInput(prev => ({ ...prev, firstMessage: e.target.value }))}
                    className="flex-1 text-sm"
                    onKeyDown={(e) => e.key === 'Enter' && handleAiGenerate('firstMessage')}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => handleAiGenerate('firstMessage')}
                    disabled={aiGenerating.firstMessage || !aiInput.firstMessage.trim()}
                    className="gap-1.5 shrink-0"
                  >
                    {aiGenerating.firstMessage ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Wand2 className="h-4 w-4" />
                    )}
                    Generate
                  </Button>
                </div>
                <Textarea
                  value={formData.firstMessage}
                  onChange={(e) => setFormData({ ...formData, firstMessage: e.target.value })}
                  placeholder="What the agent says when the call connects..."
                  rows={2}
                />
              </FormGroup>

              <FormGroup label="System Prompt (Agent Instructions)">
                {/* AI Generator for System Prompt */}
                <div className="flex gap-2 mb-2">
                  <Input
                    type="text"
                    placeholder="Describe your agent (e.g., 'survey about restaurant delivery app')"
                    value={aiInput.systemPrompt}
                    onChange={(e) => setAiInput(prev => ({ ...prev, systemPrompt: e.target.value }))}
                    className="flex-1 text-sm"
                    onKeyDown={(e) => e.key === 'Enter' && handleAiGenerate('systemPrompt')}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => handleAiGenerate('systemPrompt')}
                    disabled={aiGenerating.systemPrompt || !aiInput.systemPrompt.trim()}
                    className="gap-1.5 shrink-0"
                  >
                    {aiGenerating.systemPrompt ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Wand2 className="h-4 w-4" />
                    )}
                    Generate
                  </Button>
                </div>
                <Textarea
                  value={formData.systemPrompt}
                  onChange={(e) => setFormData({ ...formData, systemPrompt: e.target.value })}
                  placeholder="Instructions for how the agent should behave..."
                  rows={12}
                  className="font-mono text-sm"
                />
              </FormGroup>

              <FormGroup label="End Call Message">
                {/* AI Generator for End Call Message */}
                <div className="flex gap-2 mb-2">
                  <Input
                    type="text"
                    placeholder="Describe your closing (e.g., 'warm goodbye with follow-up mention')"
                    value={aiInput.endCallMessage}
                    onChange={(e) => setAiInput(prev => ({ ...prev, endCallMessage: e.target.value }))}
                    className="flex-1 text-sm"
                    onKeyDown={(e) => e.key === 'Enter' && handleAiGenerate('endCallMessage')}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => handleAiGenerate('endCallMessage')}
                    disabled={aiGenerating.endCallMessage || !aiInput.endCallMessage.trim()}
                    className="gap-1.5 shrink-0"
                  >
                    {aiGenerating.endCallMessage ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Wand2 className="h-4 w-4" />
                    )}
                    Generate
                  </Button>
                </div>
                <Textarea
                  value={formData.endCallMessage}
                  onChange={(e) => setFormData({ ...formData, endCallMessage: e.target.value })}
                  placeholder="What the agent says before ending the call..."
                  rows={2}
                />
              </FormGroup>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-border">
              <Button variant="outline" onClick={handleCancel} disabled={isSaving}>
                Cancel
              </Button>
              <Button onClick={handleSave} disabled={isSaving}>
                {isSaving ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    {editingAgent ? 'Update Agent' : 'Create Agent'}
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      )
      }

      {/* Agents List */}
      {
        agents.length === 0 && !isCreating ? (
          <EmptyState
            icon={Bot}
            title="No agents yet"
            description="Create your first voice agent to start making AI-powered calls"
            action={
              <Button onClick={handleCreate}>
                <Plus className="h-4 w-4 mr-2" />
                Create Agent
              </Button>
            }
          />
        ) : (
          <div className="grid gap-4">
            {agents.map((agent) => (
              <Card key={agent.id} className="hover:border-primary/30 transition-colors overflow-hidden">
                <CardContent className="p-4 sm:p-6">
                  <div className="flex flex-col sm:flex-row sm:items-start gap-4">
                    {/* Agent Info */}
                    <div className="flex items-start gap-3 sm:gap-4 flex-1 min-w-0">
                      <div className="flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-xl bg-primary/10 shrink-0">
                        <Bot className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
                      </div>
                      <div className="space-y-1 min-w-0 flex-1">
                        <h3 className="font-semibold text-base sm:text-lg truncate">{agent.name}</h3>
                        <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-xs sm:text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Volume2 className="h-3 w-3 sm:h-3.5 sm:w-3.5 shrink-0" />
                            <span className="truncate max-w-[100px] sm:max-w-none">{getVoiceName(agent.voice?.provider, agent.voice?.voiceId)}</span>
                          </span>
                          <span className="flex items-center gap-1">
                            <Brain className="h-3 w-3 sm:h-3.5 sm:w-3.5 shrink-0" />
                            {agent.model?.model || 'gpt-4o-mini'}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 mt-2">
                          <Badge variant="secondary" className="text-[10px] sm:text-xs">
                            {agent.voice?.provider || '11labs'}
                          </Badge>
                          <button
                            onClick={() => handleCopyId(agent.id)}
                            className="flex items-center gap-1 text-[10px] sm:text-xs text-muted-foreground hover:text-foreground transition-colors"
                          >
                            <Copy className="h-3 w-3" />
                            Copy ID
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center gap-2 shrink-0">
                      <Button
                        variant="default"
                        size="sm"
                        onClick={() => setTestingAgent(agent)}
                        className="gap-1.5 flex-1 sm:flex-none"
                      >
                        <Phone className="h-4 w-4" />
                        Test
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(agent)}
                        className="shrink-0"
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(agent)}
                        className="text-destructive hover:text-destructive shrink-0"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  {/* First Message Preview */}
                  {agent.firstMessage && (
                    <div className="mt-4 p-3 rounded-lg bg-muted/50 border border-border">
                      <p className="text-xs text-muted-foreground mb-1">First Message:</p>
                      <p className="text-sm italic line-clamp-2">"{agent.firstMessage}"</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )
      }

      {/* Help Card */}
      <Card className="bg-muted/30">
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <Sparkles className="h-5 w-5 text-primary" />
            </div>
            <div className="space-y-2">
              <h3 className="font-semibold">Tips for Great Voice Agents</h3>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Keep the first message short and friendly - under 15 seconds</li>
                <li>• Use clear, conversational language in the system prompt</li>
                <li>• Include specific instructions for handling objections</li>
                <li>• Test different voices to find one that matches your brand</li>
                <li>• Lower temperature (0.3-0.5) for consistent responses, higher (0.7-0.9) for more natural conversation</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Voice Test Modal */}
      <VoiceTestModal
        agent={testingAgent}
        isOpen={!!testingAgent}
        onClose={() => setTestingAgent(null)}
      />
    </div >
  );
}

export default Agents;
