# AI Voice Agents - API Integration Documentation

This document explains how ValidateCall uses API endpoints to generate AI content for voice agents that conduct automated market research calls.

## Overview

ValidateCall integrates three main AI systems:
1. **Claude API** - For generating and improving text content (product pitches, company context, agent prompts)
2. **Vapi API** - For voice agent orchestration, calls, and assistant management
3. **OpenAI/ElevenLabs** - For the actual voice synthesis and conversation AI (via Vapi)

## Architecture

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│   Frontend      │────▶│   Backend       │────▶│   External APIs │
│   (React)       │     │   (Express)     │     │                 │
└─────────────────┘     └─────────────────┘     └─────────────────┘
                              │                        │
                              ├── /api/claude/*       ├── Claude API
                              ├── /api/vapi/*         ├── Vapi API
                              └── /api/supabase/*     └── Supabase
```

## Claude API Integration

### Purpose
Claude AI is used to enhance and generate content that the voice agents use during calls. This includes:
- Improving product pitch descriptions
- Generating professional company context
- Creating full voice agent system prompts
- Classifying business leads by industry

### Endpoints

#### 1. Generate Text Content
**`POST /api/claude/generate`**

Generates improved text content using Claude AI.

**Request Body:**
```json
{
  "input": "sell ai voice agent to coffee shops",
  "type": "product" | "context" | "agent"
}
```

**Types:**
- `product` - Generates a conversational product/service pitch (2-4 sentences)
- `context` - Generates professional company context (2-3 sentences)
- `agent` - Passes through a complete prompt for agent creation

**Response:**
```json
{
  "generated": "Our AI-powered voice assistant helps coffee shops...",
  "original": "sell ai voice agent to coffee shops"
}
```

**Backend Implementation (`server/routes/claude.js`):**
```javascript
router.post('/generate', async (req, res) => {
    const { input, type } = req.body;

    let systemPrompt = '';

    if (type === 'product') {
        systemPrompt = `You are helping create a compelling product/service pitch
        for an AI voice agent that will call potential customers for market research...

        User's description: "${input.trim()}"

        Generate only the improved pitch text, nothing else:`;
    }

    const result = await promptClaude(systemPrompt, 'haiku');
    res.json({ generated: result.trim(), original: input });
});
```

#### 2. Classify Lead Industries
**`POST /api/claude/classify-industry`**

Uses AI to classify business leads into high-level industry categories.

**Request Body:**
```json
{
  "leads": [
    { "id": "uuid", "name": "Joe's Coffee Shop", "category": "Cafe" },
    { "id": "uuid", "name": "Smith & Associates Law", "address": "123 Main St" }
  ]
}
```

**Response:**
```json
{
  "classifications": [
    { "id": "uuid", "industry": "Restaurant" },
    { "id": "uuid", "industry": "Legal" }
  ]
}
```

**Supported Industries:**
- Real Estate, Restaurant, Dental, Legal, Automotive
- Healthcare, Retail, Construction, Beauty & Spa, Fitness
- Education, Technology, Finance, Hospitality
- Professional Services, Home Services, Manufacturing
- Transportation, Entertainment, Non-Profit, Other

#### 3. Check Configuration Status
**`GET /api/claude/status`**

Returns whether Claude API is configured.

```json
{
  "configured": true
}
```

### Frontend Usage

```javascript
import { claudeApi } from '../services/api';

// Generate improved product pitch
const result = await claudeApi.generate(
  "sell ai receptionist to dentists",
  "product"
);
console.log(result.generated);

// Classify leads by industry
const classifications = await claudeApi.classifyIndustry(leads);
```

---

## Vapi Voice Agent Integration

### Purpose
Vapi provides the voice AI infrastructure for making automated phone calls. It handles:
- Voice synthesis (ElevenLabs, OpenAI, Deepgram)
- Conversation AI (GPT-4o-mini)
- Call orchestration and management
- Phone number routing

### Creating Voice Agents

#### 1. Dynamic Agent (Per-Call)
When starting a campaign, a market research assistant is dynamically created:

**`POST /api/vapi/call`**

```json
{
  "phoneNumber": "+1234567890",
  "customerName": "John's Coffee",
  "productIdea": "AI voice assistant for coffee shops...",
  "companyContext": "TechStartup Inc is a leading AI company..."
}
```

The backend creates a complete assistant configuration:

```javascript
const createMarketResearchAssistant = (productIdea, companyContext) => ({
    name: "Market Research Agent",
    model: {
        provider: "openai",
        model: "gpt-4o-mini",
        temperature: 0.7,
        messages: [{
            role: "system",
            content: `You are a friendly market research agent...

            PRODUCT BEING RESEARCHED:
            ${productIdea}

            COMPANY CONTEXT:
            ${companyContext || 'Independent market research'}

            CALL SCRIPT:
            1. OPENING: Greet warmly, ask for 2 minutes...
            2. QUALIFICATION: Ask about pain points...
            3. PRODUCT PITCH: Present the idea...
            4. GATHER FEEDBACK: Get 1-10 rating...
            5. CLOSING: Thank them...`
        }]
    },
    voice: {
        provider: "11labs",
        voiceId: "21m00Tcm4TlvDq8ikWAM"  // Rachel voice
    },
    firstMessage: "Hi there! I'm calling on behalf of a quick market research study...",
    endCallMessage: "Thank you so much for your time today!"
});
```

#### 2. Pre-configured Assistant (Reusable)
Create persistent assistants via the Voice Agents page:

**`POST /api/vapi/assistants`**

```json
{
  "name": "Coffee Shop Researcher",
  "model": {
    "provider": "openai",
    "model": "gpt-4o-mini",
    "messages": [{ "role": "system", "content": "..." }]
  },
  "voice": {
    "provider": "11labs",
    "voiceId": "pFZP5JQG7iQjIQuC4Bku"
  },
  "firstMessage": "Hello! This is Sarah from TechStartup..."
}
```

#### 3. Using Pre-configured Assistant with Overrides
When using a saved assistant but wanting to customize the pitch:

**`POST /api/vapi/call`**

```json
{
  "phoneNumber": "+1234567890",
  "assistantId": "existing-assistant-uuid",
  "productIdea": "Custom pitch for this specific campaign..."
}
```

The backend applies overrides while keeping the assistant's voice:

```javascript
if (assistantId && productIdea) {
    callPayload.assistantId = assistantId;
    callPayload.assistantOverrides = {
        model: {
            provider: researchAssistant.model.provider,
            model: researchAssistant.model.model,
            messages: researchAssistant.model.messages  // Custom messages
        },
        firstMessage: researchAssistant.firstMessage
    };
}
```

### Voice Providers

Available voice providers and their voices:

**ElevenLabs (11labs):**
- 50+ voices including Rachel, Bella, Brian, Charlotte
- High-quality, natural-sounding voices
- Custom voice ID support

**OpenAI:**
- 6 voices: Alloy, Echo, Fable, Onyx, Nova, Shimmer
- Fast and reliable

**Deepgram:**
- 12 voices including Asteria, Luna, Orion
- Good for specific accents

### Phone Number Rotation

The system supports multi-tenant phone number rotation to avoid rate limits:

```javascript
class PhoneNumberRotator {
    constructor() {
        this.maxCallsPerDay = 50;  // Per number
        this.phoneNumbers = ['phone-id-1', 'phone-id-2'];
    }

    getNextPhoneNumber() {
        // Round-robin with daily limit checking
        for (let i = 0; i < this.phoneNumbers.length; i++) {
            const phoneId = this.phoneNumbers[this.currentIndex];
            if (this.isNumberAvailable(phoneId)) {
                return phoneId;
            }
        }
        return null;  // All exhausted
    }
}
```

---

## Complete Flow Example

### Creating a Campaign with AI-Enhanced Content

1. **User enters raw product idea:**
   ```
   "AI phone system for restaurants"
   ```

2. **Frontend calls Claude to enhance:**
   ```javascript
   const enhanced = await claudeApi.generate(input, 'product');
   // Returns: "Introducing an intelligent phone system designed
   // specifically for restaurants. Our AI handles reservations,
   // answers common questions, and never puts customers on hold..."
   ```

3. **User selects leads and starts campaign:**
   ```javascript
   const result = await vapiApi.initiateCall({
       phoneNumber: lead.phone,
       customerName: lead.name,
       productIdea: enhanced.generated,
       companyContext: companyContext,
       assistantId: selectedAgent?.id  // Optional
   });
   ```

4. **Backend creates call with Vapi:**
   - Gets next available phone number from rotation
   - Creates/uses assistant configuration
   - Initiates call via Vapi API
   - Returns call ID for tracking

5. **Vapi handles the call:**
   - GPT-4o-mini processes conversation
   - ElevenLabs synthesizes voice
   - Conversation follows the system prompt script
   - Call recording and transcript saved

---

## Environment Variables

```env
# Claude API (for content generation)
CLAUDE_API_URL=http://your-claude-proxy.com
CLAUDE_API_KEY=your-api-key

# Vapi (for voice calls)
VAPI_API_KEY=your-vapi-key
VAPI_PUBLIC_KEY=your-public-key
VAPI_PHONE_NUMBER_IDS=phone-id-1,phone-id-2
VAPI_MAX_CALLS_PER_NUMBER_PER_DAY=50
```

---

## Error Handling

### Claude API Errors
- 60-second timeout for generation requests
- Falls back to original text if generation fails
- Returns detailed error messages for debugging

### Vapi Call Errors
- Rate limiting handled via phone rotation
- Daily limits enforced per phone number
- Graceful degradation when capacity exhausted

```javascript
if (!phoneNumberId) {
    return res.status(429).json({
        error: 'All phone numbers have reached their daily limit',
        remainingCapacity: 0,
        suggestion: 'Add more phone numbers or wait until tomorrow'
    });
}
```

---

## Best Practices

1. **Product Pitches:**
   - Keep descriptions clear and conversational
   - Use Claude's `product` type for enhancement
   - Test with voice preview before campaigns

2. **Voice Selection:**
   - Match voice gender/accent to target audience
   - ElevenLabs voices sound most natural
   - Test different voices for engagement

3. **Campaign Sizing:**
   - Monitor phone number capacity
   - Use delays between calls (2+ seconds)
   - Schedule large campaigns across multiple days

4. **Lead Classification:**
   - Batch leads for efficiency (AI processes multiple at once)
   - Use consistent industry categories
   - Filter campaigns by industry for better targeting
