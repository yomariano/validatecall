// API Client for Backend Server
// This replaces direct API calls to Supabase and Vapi

import { createClient } from '@supabase/supabase-js';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3002';

// Initialize Supabase client for auth token retrieval
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const supabase = supabaseUrl && supabaseAnonKey
    ? createClient(supabaseUrl, supabaseAnonKey)
    : null;

// Get the current user's auth token
const getAuthToken = async () => {
    if (!supabase) return null;

    // Check if we're on localhost (bypass auth)
    const isLocalhost = window.location.hostname === 'localhost' ||
        window.location.hostname === '127.0.0.1';
    if (isLocalhost) {
        // Return null for localhost - backend should handle mock user
        return null;
    }

    const { data: { session } } = await supabase.auth.getSession();
    return session?.access_token || null;
};

// Helper function for API requests
const apiRequest = async (endpoint, options = {}) => {
    const url = `${API_BASE_URL}${endpoint}`;

    // Get auth token
    const token = await getAuthToken();

    const config = {
        headers: {
            'Content-Type': 'application/json',
            ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
            ...options.headers,
        },
        ...options,
    };

    const response = await fetch(url, config);

    if (!response.ok) {
        const error = await response.json().catch(() => ({ error: 'Request failed' }));
        throw new Error(error.error || error.message || 'Request failed');
    }

    return response.json();
};

// =============================================
// HEALTH CHECK
// =============================================

export const getHealth = () => apiRequest('/health');

// =============================================
// LEAD GENERATION - Claude Sonnet AI
// =============================================

export const leads = {
    getStatus: () => apiRequest('/api/claude/status'),

    scrape: ({ keyword, location, maxResults, userId }) =>
        apiRequest('/api/claude/generate-leads', {
            method: 'POST',
            body: JSON.stringify({ keyword, location, maxResults, userId }),
        }),

    // Generate leads using Claude AI - returns results directly
    scrapeAndWait: async ({ keyword, location, maxResults = 100, userId }, onStatusUpdate) => {
        if (onStatusUpdate) {
            onStatusUpdate({ status: 'RUNNING', message: 'Generating leads with AI...' });
        }

        try {
            // Call Claude to generate leads - returns results directly
            const response = await apiRequest('/api/claude/generate-leads', {
                method: 'POST',
                body: JSON.stringify({ keyword, location, maxResults, userId }),
            });

            if (onStatusUpdate) {
                onStatusUpdate({ status: 'SUCCEEDED', message: `Generated ${response.leads?.length || 0} leads` });
            }

            // Return the leads array directly
            return response.leads || [];
        } catch (error) {
            if (onStatusUpdate) {
                onStatusUpdate({ status: 'FAILED', message: error.message });
            }
            throw error;
        }
    },
};

export const isLeadsConfigured = async () => {
    try {
        const status = await leads.getStatus();
        return status.configured;
    } catch {
        return false;
    }
};

// =============================================
// SUPABASE - Database Operations
// =============================================

export const supabaseApi = {
    getStatus: () => apiRequest('/api/supabase/status'),

    // Leads
    getLeads: (filters = {}) => {
        const params = new URLSearchParams();
        if (filters.status) params.append('status', filters.status);
        if (filters.hasPhone) params.append('hasPhone', 'true');
        if (filters.keyword) params.append('keyword', filters.keyword);
        if (filters.limit) params.append('limit', filters.limit);
        const query = params.toString();
        return apiRequest(`/api/supabase/leads${query ? `?${query}` : ''}`);
    },

    getLeadById: (id) => apiRequest(`/api/supabase/leads/${id}`),

    saveLeads: (leads, searchKeyword, searchLocation) =>
        apiRequest('/api/supabase/leads', {
            method: 'POST',
            body: JSON.stringify({ leads, searchKeyword, searchLocation }),
        }),

    updateLeadStatus: (id, status) =>
        apiRequest(`/api/supabase/leads/${id}/status`, {
            method: 'PATCH',
            body: JSON.stringify({ status }),
        }),

    updateLead: (id, updates) =>
        apiRequest(`/api/supabase/leads/${id}`, {
            method: 'PATCH',
            body: JSON.stringify(updates),
        }),

    updateLeadAfterCall: (id) =>
        apiRequest(`/api/supabase/leads/${id}/after-call`, {
            method: 'PATCH',
        }),

    updateLeadIndustries: (updates) =>
        apiRequest('/api/supabase/leads/industries', {
            method: 'PATCH',
            body: JSON.stringify({ updates }),
        }),

    getLeadsStats: () => apiRequest('/api/supabase/stats/leads'),

    // Campaigns
    getCampaigns: () => apiRequest('/api/supabase/campaigns'),

    createCampaign: (campaign) =>
        apiRequest('/api/supabase/campaigns', {
            method: 'POST',
            body: JSON.stringify(campaign),
        }),

    updateCampaignStats: (id, stats) =>
        apiRequest(`/api/supabase/campaigns/${id}`, {
            method: 'PATCH',
            body: JSON.stringify(stats),
        }),

    updateCampaign: (id, updates) =>
        apiRequest(`/api/supabase/campaigns/${id}`, {
            method: 'PATCH',
            body: JSON.stringify(updates),
        }),

    // Calls
    getCalls: (filters = {}) => {
        const params = new URLSearchParams();
        if (filters.campaignId) params.append('campaignId', filters.campaignId);
        if (filters.limit) params.append('limit', filters.limit);
        const query = params.toString();
        return apiRequest(`/api/supabase/calls${query ? `?${query}` : ''}`);
    },

    saveCall: (callData) =>
        apiRequest('/api/supabase/calls', {
            method: 'POST',
            body: JSON.stringify(callData),
        }),

    updateCall: (id, updates) =>
        apiRequest(`/api/supabase/calls/${id}`, {
            method: 'PATCH',
            body: JSON.stringify(updates),
        }),

    getCallsStats: () => apiRequest('/api/supabase/stats/calls'),

    // Scrape Jobs
    getScrapeJobs: (limit = 20) => apiRequest(`/api/supabase/scrape-jobs?limit=${limit}`),

    saveScrapeJob: (job) =>
        apiRequest('/api/supabase/scrape-jobs', {
            method: 'POST',
            body: JSON.stringify(job),
        }),

    updateScrapeJob: (id, updates) =>
        apiRequest(`/api/supabase/scrape-jobs/${id}`, {
            method: 'PATCH',
            body: JSON.stringify(updates),
        }),

    // Dashboard
    getDashboardStats: () => apiRequest('/api/supabase/dashboard'),
};

export const isSupabaseConfigured = async () => {
    try {
        const status = await supabaseApi.getStatus();
        return status.configured;
    } catch {
        return false;
    }
};

// =============================================
// VAPI - Voice AI Calls
// =============================================

export const vapiApi = {
    getStatus: () => apiRequest('/api/vapi/status'),

    initiateCall: ({ phoneNumber, customerName, productIdea, companyContext, assistant, assistantId }) =>
        apiRequest('/api/vapi/call', {
            method: 'POST',
            body: JSON.stringify({ phoneNumber, customerName, productIdea, companyContext, assistant, assistantId }),
        }),

    batchInitiateCalls: ({ phoneNumbers, productIdea, companyContext, delayMs }) =>
        apiRequest('/api/vapi/calls/batch', {
            method: 'POST',
            body: JSON.stringify({ phoneNumbers, productIdea, companyContext, delayMs }),
        }),

    getCallStatus: (callId) => apiRequest(`/api/vapi/calls/${callId}`),

    getAllCalls: (limit = 100) => apiRequest(`/api/vapi/calls?limit=${limit}`),

    // Get all assistants with their full configuration (voice, provider, etc.)
    getAssistants: (limit = 100) => apiRequest(`/api/vapi/assistants?limit=${limit}`),

    // Get a single assistant by ID
    getAssistant: (assistantId) => apiRequest(`/api/vapi/assistants/${assistantId}`),

    // Create a new assistant
    createAssistant: (config) =>
        apiRequest('/api/vapi/assistants', {
            method: 'POST',
            body: JSON.stringify(config),
        }),

    // Update an assistant
    updateAssistant: (assistantId, updates) =>
        apiRequest(`/api/vapi/assistants/${assistantId}`, {
            method: 'PATCH',
            body: JSON.stringify(updates),
        }),

    // Delete an assistant
    deleteAssistant: (assistantId) =>
        apiRequest(`/api/vapi/assistants/${assistantId}`, {
            method: 'DELETE',
        }),

    // Get available voices
    getVoices: () => apiRequest('/api/vapi/voices'),

    // Get public key for web SDK (real-time voice testing)
    getPublicKey: () => apiRequest('/api/vapi/public-key'),

    parsePhoneNumbers: (input) =>
        apiRequest('/api/vapi/parse-phones', {
            method: 'POST',
            body: JSON.stringify({ input }),
        }),

    // Multi-tenant endpoints (per-user phone numbers)
    getUserPhoneStats: (userId) => apiRequest(`/api/vapi/user/${userId}/phone-stats`),

    getUserPhoneNumbers: (userId) => apiRequest(`/api/vapi/user/${userId}/phone-numbers`),

    initiateUserCall: (userId, { phoneNumber, customerName, productIdea, companyContext, assistant, assistantId }) =>
        apiRequest(`/api/vapi/user/${userId}/call`, {
            method: 'POST',
            body: JSON.stringify({ phoneNumber, customerName, productIdea, companyContext, assistant, assistantId }),
        }),

    batchInitiateUserCalls: (userId, { phoneNumbers, productIdea, companyContext, delayMs }) =>
        apiRequest(`/api/vapi/user/${userId}/calls/batch`, {
            method: 'POST',
            body: JSON.stringify({ phoneNumbers, productIdea, companyContext, delayMs }),
        }),
};

// =============================================
// STRIPE - Payments & Subscriptions
// =============================================

export const stripeApi = {
    getStatus: () => apiRequest('/api/stripe/status'),

    getPlans: () => apiRequest('/api/stripe/plans'),

    getSubscription: (userId) => apiRequest(`/api/stripe/subscription/${userId}`),

    getPaymentLink: (planId, userId) => apiRequest(`/api/stripe/payment-link/${planId}/${userId}`),

    // Create Stripe Customer Portal session for managing subscription
    createPortalSession: (returnUrl) =>
        apiRequest('/api/billing/portal', {
            method: 'POST',
            body: JSON.stringify({ returnUrl }),
        }),

    // Manual provisioning (admin only)
    provisionPhones: (userId, planId, countryCode = 'IE') =>
        apiRequest(`/api/stripe/provision/${userId}`, {
            method: 'POST',
            body: JSON.stringify({ planId, countryCode }),
        }),
};

// =============================================
// SCHEDULED CALLS - Call Scheduling
// =============================================

export const scheduledApi = {
    // Schedule a single call
    scheduleCall: ({ userId, leadId, phoneNumber, customerName, scheduledAt, productIdea, companyContext, assistantId, maxRetries }) =>
        apiRequest('/api/scheduled/calls', {
            method: 'POST',
            body: JSON.stringify({
                userId,
                leadId,
                phoneNumber,
                customerName,
                scheduledAt,
                productIdea,
                companyContext,
                assistantId,
                maxRetries,
            }),
        }),

    // Get scheduled calls for a user
    getScheduledCalls: (userId, filters = {}) => {
        const params = new URLSearchParams({ userId });
        if (filters.status) params.append('status', filters.status);
        if (filters.limit) params.append('limit', filters.limit);
        return apiRequest(`/api/scheduled/calls?${params}`);
    },

    // Get a specific scheduled call
    getScheduledCall: (id) => apiRequest(`/api/scheduled/calls/${id}`),

    // Update/reschedule a call
    updateScheduledCall: (id, updates) =>
        apiRequest(`/api/scheduled/calls/${id}`, {
            method: 'PATCH',
            body: JSON.stringify(updates),
        }),

    // Cancel a scheduled call
    cancelScheduledCall: (id) =>
        apiRequest(`/api/scheduled/calls/${id}`, {
            method: 'DELETE',
        }),

    // Get scheduling stats
    getStats: (userId) => apiRequest(`/api/scheduled/stats?userId=${userId}`),

    // Bulk schedule calls
    bulkScheduleCalls: ({ userId, campaignId, calls, scheduledAt, productIdea, companyContext, assistantId, maxRetries, delayBetweenCallsMs }) =>
        apiRequest('/api/scheduled/calls/bulk', {
            method: 'POST',
            body: JSON.stringify({
                userId,
                campaignId,
                calls,
                scheduledAt,
                productIdea,
                companyContext,
                assistantId,
                maxRetries,
                delayBetweenCallsMs,
            }),
        }),
};

export const isVapiConfigured = async () => {
    try {
        const status = await vapiApi.getStatus();
        return status.configured;
    } catch {
        return false;
    }
};

// =============================================
// CLAUDE - AI Text Generation
// =============================================

export const claudeApi = {
    getStatus: () => apiRequest('/api/claude/status'),

    // Generate improved text for product pitch or company context
    generate: (input, type = 'product') =>
        apiRequest('/api/claude/generate', {
            method: 'POST',
            body: JSON.stringify({ input, type }),
        }),

    // Classify leads by industry using AI
    classifyIndustry: (leads) =>
        apiRequest('/api/claude/classify-industry', {
            method: 'POST',
            body: JSON.stringify({ leads }),
        }),

    // Generate leads using Claude AI
    generateLeads: ({ keyword, location, maxResults = 100, userId }) =>
        apiRequest('/api/claude/generate-leads', {
            method: 'POST',
            body: JSON.stringify({ keyword, location, maxResults, userId }),
        }),
};

export const isClaudeConfigured = async () => {
    try {
        const status = await claudeApi.getStatus();
        return status.configured;
    } catch {
        return false;
    }
};

// =============================================
// EMAIL - Cold Email Generation & Sending
// =============================================

export const emailApi = {
    // Get email service status
    getStatus: () => apiRequest('/api/email/status'),

    // Generate AI-powered cold email for a lead
    generateColdEmail: ({ lead, productIdea, companyContext, senderName }) =>
        apiRequest('/api/email/generate-cold-email', {
            method: 'POST',
            body: JSON.stringify({ lead, productIdea, companyContext, senderName }),
        }),

    // Send cold email to a lead
    sendColdEmail: ({ leadId, toEmail, toName, subject, body, senderName, senderEmail, senderCompany, userId }) =>
        apiRequest('/api/email/send-cold-email', {
            method: 'POST',
            body: JSON.stringify({ leadId, toEmail, toName, subject, body, senderName, senderEmail, senderCompany, userId }),
        }),

    // Track user events for marketing automation
    trackEvent: ({ userId, eventType, eventData, pageUrl }) =>
        apiRequest('/api/email/track-event', {
            method: 'POST',
            body: JSON.stringify({ userId, eventType, eventData, pageUrl }),
        }).catch(() => {}), // Silent fail - non-critical

    // =============================================
    // EMAIL RESPONSES - Inbound Email Handling
    // =============================================

    // Get all email responses (inbox)
    getResponses: (status = 'all') =>
        apiRequest(`/api/email/responses?status=${status}`),

    // Get unread email count
    getUnreadCount: () =>
        apiRequest('/api/email/responses/unread-count'),

    // Get email thread for a specific lead
    getThread: (leadId) =>
        apiRequest(`/api/email/thread/${leadId}`),

    // Mark an email response as read
    markAsRead: (responseId) =>
        apiRequest(`/api/email/responses/${responseId}/read`, {
            method: 'PATCH',
        }),

    // Reply to an email response
    replyToEmail: ({ responseId, subject, body, senderName, senderEmail, senderCompany }) =>
        apiRequest(`/api/email/responses/${responseId}/reply`, {
            method: 'POST',
            body: JSON.stringify({ subject, body, senderName, senderEmail, senderCompany }),
        }),
};

// =============================================
// DOMAINS - Custom Email Domain Management
// =============================================

export const domainsApi = {
    // Get domain service status
    getStatus: () => apiRequest('/api/domains/status'),

    // List all domains for a user
    list: (userId) => apiRequest(`/api/domains?userId=${userId}`),

    // Get only verified domains (for sender dropdown)
    getVerified: (userId) => apiRequest(`/api/domains/verified?userId=${userId}`),

    // Get a specific domain by ID
    get: (userId, domainId) => apiRequest(`/api/domains/${domainId}?userId=${userId}`),

    // Create a new domain for verification
    create: (userId, domain) =>
        apiRequest('/api/domains', {
            method: 'POST',
            body: JSON.stringify({ userId, domain }),
        }),

    // Trigger verification check for a domain
    verify: (userId, domainId) =>
        apiRequest(`/api/domains/${domainId}/verify`, {
            method: 'POST',
            body: JSON.stringify({ userId }),
        }),

    // Delete a domain
    delete: (userId, domainId) =>
        apiRequest(`/api/domains/${domainId}?userId=${userId}`, {
            method: 'DELETE',
        }),
};

// =============================================
// USER SETTINGS - Email Provider API Key Management
// =============================================

export const settingsApi = {
    // Get complete email provider settings (Resend + SendGrid)
    getEmailProviderSettings: (userId) => apiRequest(`/api/settings/email-provider?userId=${userId}`),

    // Set preferred email provider
    setEmailProvider: (userId, provider) =>
        apiRequest('/api/settings/email-provider', {
            method: 'POST',
            body: JSON.stringify({ userId, provider }),
        }),

    // --- Resend ---

    // Get user's Resend API key status (masked)
    getResendStatus: (userId) => apiRequest(`/api/settings/resend?userId=${userId}`),

    // Save user's Resend API key
    saveResendApiKey: (userId, apiKey) =>
        apiRequest('/api/settings/resend', {
            method: 'POST',
            body: JSON.stringify({ userId, apiKey }),
        }),

    // Delete user's Resend API key
    deleteResendApiKey: (userId) =>
        apiRequest(`/api/settings/resend?userId=${userId}`, {
            method: 'DELETE',
        }),

    // Verify user's Resend API key works
    verifyResendApiKey: (userId) =>
        apiRequest('/api/settings/resend/verify', {
            method: 'POST',
            body: JSON.stringify({ userId }),
        }),

    // Get user's verified domains from their Resend account
    getResendDomains: (userId) => apiRequest(`/api/settings/resend/domains?userId=${userId}`),

    // --- SendGrid ---

    // Get user's SendGrid API key status (masked)
    getSendGridStatus: (userId) => apiRequest(`/api/settings/sendgrid?userId=${userId}`),

    // Save user's SendGrid API key
    saveSendGridApiKey: (userId, apiKey) =>
        apiRequest('/api/settings/sendgrid', {
            method: 'POST',
            body: JSON.stringify({ userId, apiKey }),
        }),

    // Delete user's SendGrid API key
    deleteSendGridApiKey: (userId) =>
        apiRequest(`/api/settings/sendgrid?userId=${userId}`, {
            method: 'DELETE',
        }),

    // Verify user's SendGrid API key works
    verifySendGridApiKey: (userId) =>
        apiRequest('/api/settings/sendgrid/verify', {
            method: 'POST',
            body: JSON.stringify({ userId }),
        }),

    // Get user's verified senders from their SendGrid account
    getSendGridSenders: (userId) => apiRequest(`/api/settings/sendgrid/senders?userId=${userId}`),

    // --- Brand Settings ---

    // Get user's brand settings (logo, color, company name)
    getBrandSettings: (userId) => apiRequest(`/api/settings/brand?userId=${userId}`),

    // Save user's brand settings
    saveBrandSettings: (userId, { brandLogoUrl, brandColor, brandName, brandCtaText, brandCtaUrl }) =>
        apiRequest('/api/settings/brand', {
            method: 'POST',
            body: JSON.stringify({ userId, brandLogoUrl, brandColor, brandName, brandCtaText, brandCtaUrl }),
        }),

    // Upload brand logo
    uploadBrandLogo: async (userId, file) => {
        const formData = new FormData();
        formData.append('userId', userId);
        formData.append('logo', file);

        const response = await fetch(`${API_BASE_URL}/api/settings/brand/logo`, {
            method: 'POST',
            body: formData,
            credentials: 'include',
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Failed to upload logo');
        }

        return response.json();
    },

    // Delete brand logo
    deleteBrandLogo: (userId) =>
        apiRequest(`/api/settings/brand/logo?userId=${userId}`, {
            method: 'DELETE',
        }),
};

// Format duration from seconds (utility function kept client-side)
export const formatDuration = (seconds) => {
    if (!seconds) return '-';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
};

// Format transcript messages into readable text (utility function kept client-side)
export const formatTranscript = (messages) => {
    if (!messages || !Array.isArray(messages)) return '';

    return messages
        .filter(m => m.role && m.message)
        .map(m => `${m.role === 'assistant' ? 'AI' : 'Customer'}: ${m.message}`)
        .join('\n\n');
};

// =============================================
// USAGE - Free Tier Tracking
// =============================================

export const usageApi = {
    // Get user's usage stats
    getUsage: (userId) => apiRequest(`/api/usage/${userId}`),

    // Check if user can generate leads
    canGenerateLeads: (userId, count = 1) =>
        apiRequest(`/api/usage/${userId}/can-generate-leads?count=${count}`),

    // Check if user can make a call
    canMakeCall: (userId) => apiRequest(`/api/usage/${userId}/can-make-call`),

    // Increment leads used (called after successful generation)
    incrementLeads: (userId, count = 1) =>
        apiRequest(`/api/usage/${userId}/increment-leads`, {
            method: 'POST',
            body: JSON.stringify({ count }),
        }),

    // Increment calls used (called after successful call)
    incrementCalls: (userId) =>
        apiRequest(`/api/usage/${userId}/increment-calls`, {
            method: 'POST',
        }),
};

// =============================================
// ADMIN - Marketing Campaigns (Admin Only)
// =============================================

export const adminApi = {
    // User segments
    getSegments: (adminUserId) =>
        apiRequest(`/api/admin/users/segments?adminUserId=${adminUserId}`),

    getUsers: (adminUserId, segment = 'all', limit = 100) =>
        apiRequest(`/api/admin/users?adminUserId=${adminUserId}&segment=${segment}&limit=${limit}`),

    // Campaigns
    getCampaigns: (adminUserId, status) => {
        const params = new URLSearchParams({ adminUserId });
        if (status) params.append('status', status);
        return apiRequest(`/api/admin/campaigns?${params}`);
    },

    createCampaign: (adminUserId, campaign) =>
        apiRequest('/api/admin/campaigns', {
            method: 'POST',
            body: JSON.stringify({ adminUserId, ...campaign }),
        }),

    updateCampaign: (adminUserId, id, updates) =>
        apiRequest(`/api/admin/campaigns/${id}`, {
            method: 'PATCH',
            body: JSON.stringify({ adminUserId, ...updates }),
        }),

    sendCampaign: (adminUserId, id) =>
        apiRequest(`/api/admin/campaigns/${id}/send`, {
            method: 'POST',
            body: JSON.stringify({ adminUserId }),
        }),

    deleteCampaign: (adminUserId, id) =>
        apiRequest(`/api/admin/campaigns/${id}?adminUserId=${adminUserId}`, {
            method: 'DELETE',
        }),

    // Templates
    getTemplates: (adminUserId) =>
        apiRequest(`/api/admin/templates?adminUserId=${adminUserId}`),

    createTemplate: (adminUserId, template) =>
        apiRequest('/api/admin/templates', {
            method: 'POST',
            body: JSON.stringify({ adminUserId, ...template }),
        }),

    // Triggers
    getTriggers: (adminUserId) =>
        apiRequest(`/api/admin/triggers?adminUserId=${adminUserId}`),

    updateTrigger: (adminUserId, id, updates) =>
        apiRequest(`/api/admin/triggers/${id}`, {
            method: 'PATCH',
            body: JSON.stringify({ adminUserId, ...updates }),
        }),

    createTrigger: (adminUserId, trigger) =>
        apiRequest('/api/admin/triggers', {
            method: 'POST',
            body: JSON.stringify({ adminUserId, ...trigger }),
        }),

    // Analytics
    getAnalytics: (adminUserId) =>
        apiRequest(`/api/admin/analytics?adminUserId=${adminUserId}`),
};

// Export default API object
export default {
    getHealth,
    leads,
    supabaseApi,
    vapiApi,
    stripeApi,
    scheduledApi,
    claudeApi,
    usageApi,
    emailApi,
    domainsApi,
    settingsApi,
    adminApi,
    isLeadsConfigured,
    isSupabaseConfigured,
    isVapiConfigured,
    isClaudeConfigured,
    formatDuration,
    formatTranscript,
};
