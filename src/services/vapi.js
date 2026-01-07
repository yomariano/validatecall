// Vapi Service - Proxied through Backend API
// All API keys are now securely stored on the server

import { vapiApi, isVapiConfigured, formatDuration, formatTranscript } from './api.js';

// Re-export utilities
export { formatDuration, formatTranscript };

// Note: The assistant configuration is now handled on the backend
// This function is kept for reference/documentation purposes
export const createMarketResearchAssistant = (productIdea, companyContext) => ({
  name: "Market Research Agent",
  model: {
    provider: "openai",
    model: "gpt-4o-mini",
    temperature: 0.7,
    messages: [
      {
        role: "system",
        content: `You are a friendly and professional market research agent conducting brief phone surveys. Your goal is to validate a product idea by gathering genuine feedback.

PRODUCT BEING RESEARCHED:
${productIdea}

COMPANY CONTEXT:
${companyContext || 'Independent market research'}

CALL SCRIPT:
1. OPENING (Keep brief - 15 seconds max):
   - Greet warmly: "Hi! This is [Alex] calling on behalf of a quick market research study."
   - Ask: "Do you have 2 minutes for a brief survey? Your feedback would be incredibly valuable."
   - If no: Thank them politely and end call.

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
   - "What would you expect to pay for something like this?"

5. CLOSING (15 seconds):
   - Thank them genuinely
   - Ask if they'd like to be notified when it launches
   - If yes, confirm their contact info

TONE GUIDELINES:
- Be conversational, not salesy
- Listen more than you talk
- Don't push if they're not interested
- Take notes on objections and enthusiasm levels
- Be respectful of their time

NEGOTIATION APPROACH:
- If they show interest but hesitate on price, explore what features matter most
- If they're skeptical, acknowledge concerns and ask what would change their mind
- Never be pushy - genuine feedback is more valuable than forced positivity`
      }
    ]
  },
  voice: {
    provider: "11labs",
    voiceId: "21m00Tcm4TlvDq8ikWAM",
  },
  firstMessage: "Hi there! This is Alex from a quick market research study. Do you have about 2 minutes to share your thoughts on a new product idea? Your feedback would be really helpful!",
  endCallMessage: "Thank you so much for your time today! Your feedback is incredibly valuable. Have a great day!",
});

// Initiate a single call
export const initiateCall = async (apiKey, phoneNumber, assistant) => {
  // Note: apiKey is ignored - it's now stored on the backend
  return vapiApi.initiateCall({
    phoneNumber: phoneNumber.number,
    customerName: phoneNumber.name,
    assistant,
  });
};

// Get call status
export const getCallStatus = async (apiKey, callId) => {
  // Note: apiKey is ignored - it's now stored on the backend
  return vapiApi.getCallStatus(callId);
};

// Batch initiate calls
export const batchInitiateCalls = async (apiKey, phoneNumbers, assistant, delayMs = 2000) => {
  // Note: apiKey is ignored - it's now stored on the backend
  // Extract productIdea and companyContext from assistant if available
  const systemMessage = assistant?.model?.messages?.find(m => m.role === 'system')?.content || '';
  const productIdeaMatch = systemMessage.match(/PRODUCT BEING RESEARCHED:\n(.+?)\n\nCOMPANY/s);
  const companyContextMatch = systemMessage.match(/COMPANY CONTEXT:\n(.+?)\n\nCALL SCRIPT/s);

  return vapiApi.batchInitiateCalls({
    phoneNumbers,
    productIdea: productIdeaMatch?.[1]?.trim(),
    companyContext: companyContextMatch?.[1]?.trim(),
    delayMs,
  });
};

// Parse phone numbers
export const parsePhoneNumbers = (input) => {
  // This can be done client-side for immediate feedback
  const lines = input.split(/[\n,]+/).map(line => line.trim()).filter(Boolean);

  return lines.map(line => {
    const match = line.match(/^(.+?):\s*(.+)$/) || [null, null, line];
    let number = match[2]?.trim().replace(/[^\d+]/g, '') || '';
    if (number && !number.startsWith('+')) {
      number = '+' + number;
    }
    return {
      name: match[1]?.trim() || null,
      number,
    };
  }).filter(p => p.number.length >= 10);
};

// Fetch all calls from Vapi
export const getAllCalls = async (limitOrApiKey = 100, limitArg) => {
  // Handle both old (apiKey, limit) and new (limit) signatures
  const limit = typeof limitOrApiKey === 'number' ? limitOrApiKey : (limitArg || 100);
  return vapiApi.getAllCalls(limit);
};

// Get call details including transcript and recording
export const getCallDetails = async (callIdOrApiKey, callIdArg) => {
  // Handle both old (apiKey, callId) and new (callId) signatures
  const callId = callIdArg || callIdOrApiKey;
  return vapiApi.getCallStatus(callId);
};

// Get all assistants from Vapi with their full configuration
export const getAssistants = async (limit = 100) => {
  return vapiApi.getAssistants(limit);
};

// Get a single assistant by ID with full configuration
export const getAssistant = async (assistantId) => {
  return vapiApi.getAssistant(assistantId);
};

// Check if Vapi is configured (async version)
export const checkVapiConfigured = async () => {
  return isVapiConfigured();
};
