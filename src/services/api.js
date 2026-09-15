// API Client for Backend Server
// This replaces direct API calls to PostgreSQL and Vapi

import { getRequestToken, API_BASE_URL } from '../lib/session.js';


// Helper function for API requests
export const apiRequest = async (endpoint, options = {}) => {
    const url = `${API_BASE_URL}${endpoint}`;

    // Get auth token
    const token = ['GET','HEAD'].includes(options.method || 'GET') ? null : await getRequestToken();

    const config = {
        ...options,
        credentials: 'include',
        headers: {
            'Content-Type': 'application/json',
            ...(token ? { 'X-CSRF-Token': token } : {}),
            ...options.headers,
        },
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
// LEAD RESEARCH - Direct website browsing + DeepInfra
// =============================================

export const leads = {
    getStatus: () => apiRequest('/api/research/status'),

    scrape: ({ keyword, location, maxResults, userId, startingUrls = [] }) =>
        apiRequest('/api/research/leads', {
            method: 'POST',
            body: JSON.stringify({ keyword, location, maxResults, userId, startingUrls }),
        }),

    // Find leads using cited search evidence
    scrapeAndWait: async ({ keyword, location, maxResults = 10, userId, startingUrls = [] }, onStatusUpdate) => {
        if (onStatusUpdate) {
            onStatusUpdate({ status: 'RUNNING', message: 'Browsing business websites and contact pages…' });
        }

        try {
            // Retrieve grounded contacts from the research API
            const response = await apiRequest('/api/research/leads', {
                method: 'POST',
                body: JSON.stringify({ keyword, location, maxResults, userId, startingUrls }),
            });

            if (onStatusUpdate) {
                onStatusUpdate({ status: 'SUCCEEDED', message: `Found ${response.leads?.length || 0} sourced leads` });
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
// POSTGRESQL - Database Operations
// =============================================

export const dataApi = {
    getStatus: () => apiRequest('/api/data/status'),

    // Leads
    getLeads: (filters = {}) => {
        const params = new URLSearchParams();
        if (filters.status) params.append('status', filters.status);
        if (filters.hasPhone) params.append('hasPhone', 'true');
        if (filters.keyword) params.append('keyword', filters.keyword);
        if (filters.limit) params.append('limit', filters.limit);
        const query = params.toString();
        return apiRequest(`/api/data/leads${query ? `?${query}` : ''}`);
    },

    getLeadById: (id) => apiRequest(`/api/data/leads/${id}`),

    saveLeads: (leads, searchKeyword, searchLocation) =>
        apiRequest('/api/data/leads', {
            method: 'POST',
            body: JSON.stringify({ leads, searchKeyword, searchLocation }),
        }),

    updateLeadStatus: (id, status) =>
        apiRequest(`/api/data/leads/${id}/status`, {
            method: 'PATCH',
            body: JSON.stringify({ status }),
        }),

    updateLead: (id, updates) =>
        apiRequest(`/api/data/leads/${id}`, {
            method: 'PATCH',
            body: JSON.stringify(updates),
        }),

    updateLeadAfterCall: (id) =>
        apiRequest(`/api/data/leads/${id}/after-call`, {
            method: 'PATCH',
        }),

    updateLeadIndustries: (updates) =>
        apiRequest('/api/data/leads/industries', {
            method: 'PATCH',
            body: JSON.stringify({ updates }),
        }),

    getLeadsStats: () => apiRequest('/api/data/stats/leads'),

    // Campaigns
    getCampaigns: () => apiRequest('/api/data/campaigns'),

    createCampaign: (campaign) =>
        apiRequest('/api/data/campaigns', {
            method: 'POST',
            body: JSON.stringify(campaign),
        }),

    updateCampaignStats: (id, stats) =>
        apiRequest(`/api/data/campaigns/${id}`, {
            method: 'PATCH',
            body: JSON.stringify(stats),
        }),

    updateCampaign: (id, updates) =>
        apiRequest(`/api/data/campaigns/${id}`, {
            method: 'PATCH',
            body: JSON.stringify(updates),
        }),

    // Calls
    getCalls: (filters = {}) => {
        const params = new URLSearchParams();
        if (filters.campaignId) params.append('campaignId', filters.campaignId);
        if (filters.limit) params.append('limit', filters.limit);
        const query = params.toString();
        return apiRequest(`/api/data/calls${query ? `?${query}` : ''}`);
    },

    saveCall: (callData) =>
        apiRequest('/api/data/calls', {
            method: 'POST',
            body: JSON.stringify(callData),
        }),

    updateCall: (id, updates) =>
        apiRequest(`/api/data/calls/${id}`, {
            method: 'PATCH',
            body: JSON.stringify(updates),
        }),

    getCallsStats: () => apiRequest('/api/data/stats/calls'),

    // Scrape Jobs
    getScrapeJobs: (limit = 20) => apiRequest(`/api/data/scrape-jobs?limit=${limit}`),

    saveScrapeJob: (job) =>
        apiRequest('/api/data/scrape-jobs', {
            method: 'POST',
            body: JSON.stringify(job),
        }),

    updateScrapeJob: (id, updates) =>
        apiRequest(`/api/data/scrape-jobs/${id}`, {
            method: 'PATCH',
            body: JSON.stringify(updates),
        }),

    // Dashboard
    getDashboardStats: () => apiRequest('/api/data/dashboard'),
};

export const isDatabaseConfigured = async () => {
    try {
        const status = await dataApi.getStatus();
        return status.configured;
    } catch {
        return false;
    }
};

// =============================================
// VAPI - Voice AI Calls
// =============================================

export const vapiApi = {
    getCallerNumbers: (phoneNumber = '') => apiRequest(`/api/telephony/caller-numbers?${new URLSearchParams({ phoneNumber })}`),
    phoneReadiness: (phoneNumbers) => apiRequest('/api/telephony/readiness', { method: 'POST', body: JSON.stringify({ phoneNumbers }) }),
    getStatus: () => apiRequest('/api/voice/status'),

    initiateCall: ({ phoneNumber, customerName, productIdea, companyContext, assistant, assistantId, fromNumberId }) =>
        apiRequest('/api/voice/call', {
            method: 'POST',
            body: JSON.stringify({ phoneNumber, customerName, productIdea, companyContext, assistant, assistantId, fromNumberId }),
        }),

    batchInitiateCalls: ({ phoneNumbers, productIdea, companyContext, delayMs }) =>
        apiRequest('/api/voice/calls/batch', {
            method: 'POST',
            body: JSON.stringify({ phoneNumbers, productIdea, companyContext, delayMs }),
        }),

    getCallStatus: (callId) => apiRequest(`/api/voice/calls/${encodeURIComponent(callId)}`),

    getAllCalls: (limit = 100) => apiRequest(`/api/voice/calls?limit=${limit}`),

    // Get all assistants with their full configuration (voice, provider, etc.)
    getAssistants: (limit = 100) => apiRequest(`/api/voice/assistants?limit=${limit}`),

    // Get a single assistant by ID
    getAssistant: (assistantId) => apiRequest(`/api/voice/assistants/${assistantId}`),

    // Create a new assistant
    createAssistant: (config) =>
        apiRequest('/api/voice/assistants', {
            method: 'POST',
            body: JSON.stringify(config),
        }),

    // Update an assistant
    updateAssistant: (assistantId, updates) =>
        apiRequest(`/api/voice/assistants/${assistantId}`, {
            method: 'PATCH',
            body: JSON.stringify(updates),
        }),

    // Delete an assistant
    deleteAssistant: (assistantId) =>
        apiRequest(`/api/voice/assistants/${assistantId}`, {
            method: 'DELETE',
        }),

    // Get available voices
    getVoices: () => apiRequest('/api/voice/voices'),

    // Get public key for web SDK (real-time voice testing)
    getTestToken: (id) => apiRequest(`/api/voice/assistants/${id}/test-token`, {method:'POST', body:'{}'}),

    parsePhoneNumbers: (input) =>
        apiRequest('/api/voice/parse-phones', {
            method: 'POST',
            body: JSON.stringify({ input }),
        }),

    // Multi-tenant endpoints (per-user phone numbers)
    getUserPhoneStats: (userId) => apiRequest(`/api/voice/user/${userId}/phone-stats`),

    getUserPhoneNumbers: (userId) => apiRequest(`/api/voice/user/${userId}/phone-numbers`),

    initiateUserCall: (userId, { phoneNumber, customerName, productIdea, companyContext, assistant, assistantId, fromNumberId }) =>
        apiRequest(`/api/voice/user/${userId}/call`, {
            method: 'POST',
            body: JSON.stringify({ phoneNumber, customerName, productIdea, companyContext, assistant, assistantId, fromNumberId }),
        }),

    batchInitiateUserCalls: (userId, { phoneNumbers, productIdea, companyContext, delayMs }) =>
        apiRequest(`/api/voice/user/${userId}/calls/batch`, {
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
    scheduleCall: ({ userId, leadId, phoneNumber, customerName, scheduledAt, productIdea, companyContext, assistantId, fromNumberId, maxRetries }) =>
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
                fromNumberId,
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
    getStatus: () => apiRequest('/api/research/status'),

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
    generateLeads: ({ keyword, location, maxResults = 10, userId }) =>
        apiRequest('/api/research/leads', {
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
    sendColdEmail: ({ leadId, toEmail, toName, subject, body, senderName, senderEmail, senderCompany, userId, ctaText, ctaUrl }) =>
        apiRequest('/api/email/send-cold-email', {
            method: 'POST',
            body: JSON.stringify({ leadId, toEmail, toName, subject, body, senderName, senderEmail, senderCompany, userId, ctaText, ctaUrl }),
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
    getResponses: (userId, status = 'all') =>
        apiRequest(`/api/email/responses?status=${status}`, {
            headers: { 'x-user-id': userId },
        }),

    // Get unread email count
    getUnreadCount: (userId) =>
        apiRequest('/api/email/responses/unread-count', {
            headers: { 'x-user-id': userId },
        }),

    // Get email thread for a specific lead
    getThread: (userId, leadId) =>
        apiRequest(`/api/email/thread/${leadId}`, {
            headers: { 'x-user-id': userId },
        }),

    // Mark an email response as read
    markAsRead: (userId, responseId) =>
        apiRequest(`/api/email/responses/${responseId}/read`, {
            method: 'PATCH',
            headers: { 'x-user-id': userId },
        }),

    // Reply to an email response
    replyToEmail: (userId, { responseId, subject, body, senderName, senderEmail, senderCompany }) =>
        apiRequest(`/api/email/responses/${responseId}/reply`, {
            method: 'POST',
            credentials: 'include',
            headers: { 'x-user-id': userId },
            body: JSON.stringify({ subject, body, senderName, senderEmail, senderCompany }),
        }),
};

// =============================================
// SEQUENCES - Multi-step Email Sequences
// =============================================

export const sequencesApi = {
    // List all sequences
    list: (userId) =>
        apiRequest('/api/sequences', {
            headers: { 'x-user-id': userId }
        }),

    // Create a new sequence
    create: (userId, sequence) =>
        apiRequest('/api/sequences', {
            method: 'POST',
            credentials: 'include',
            headers: { 'x-user-id': userId },
            body: JSON.stringify(sequence),
        }),

    // Get sequence details
    get: (userId, sequenceId) =>
        apiRequest(`/api/sequences/${sequenceId}`, {
            headers: { 'x-user-id': userId }
        }),

    // Update sequence
    update: (userId, sequenceId, updates) =>
        apiRequest(`/api/sequences/${sequenceId}`, {
            method: 'PATCH',
            headers: { 'x-user-id': userId },
            body: JSON.stringify(updates),
        }),

    // Delete sequence
    delete: (userId, sequenceId) =>
        apiRequest(`/api/sequences/${sequenceId}`, {
            method: 'DELETE',
            headers: { 'x-user-id': userId }
        }),

    // Activate sequence and enroll leads
    activate: (userId, sequenceId, leadIds = []) =>
        apiRequest(`/api/sequences/${sequenceId}/activate`, {
            method: 'POST',
            credentials: 'include',
            headers: { 'x-user-id': userId },
            body: JSON.stringify({ leadIds }),
        }),

    // Pause sequence
    pause: (userId, sequenceId) =>
        apiRequest(`/api/sequences/${sequenceId}/pause`, {
            method: 'POST',
            credentials: 'include',
            headers: { 'x-user-id': userId }
        }),

    // Resume sequence
    resume: (userId, sequenceId) =>
        apiRequest(`/api/sequences/${sequenceId}/resume`, {
            method: 'POST',
            credentials: 'include',
            headers: { 'x-user-id': userId }
        }),

    // Get sequence analytics
    getAnalytics: (userId, sequenceId) =>
        apiRequest(`/api/sequences/${sequenceId}/analytics`, {
            headers: { 'x-user-id': userId }
        }),

    // Get enrollments
    getEnrollments: (userId, sequenceId, { status, page, limit } = {}) => {
        const params = new URLSearchParams();
        if (status) params.append('status', status);
        if (page) params.append('page', page);
        if (limit) params.append('limit', limit);
        const query = params.toString();
        return apiRequest(`/api/sequences/${sequenceId}/enrollments${query ? `?${query}` : ''}`, {
            headers: { 'x-user-id': userId }
        });
    },

    // Stop an enrollment
    stopEnrollment: (userId, sequenceId, enrollmentId, reason) =>
        apiRequest(`/api/sequences/${sequenceId}/enrollments/${enrollmentId}/stop`, {
            method: 'POST',
            credentials: 'include',
            headers: { 'x-user-id': userId },
            body: JSON.stringify({ reason }),
        }),

    // Resume an enrollment
    resumeEnrollment: (userId, sequenceId, enrollmentId) =>
        apiRequest(`/api/sequences/${sequenceId}/enrollments/${enrollmentId}/resume`, {
            method: 'POST',
            credentials: 'include',
            headers: { 'x-user-id': userId }
        }),
};

// =============================================
// WORKFLOWS - Multi-channel Outreach (Email + Calls)
// =============================================

export const workflowsApi = {
    // List all workflows
    list: (userId) =>
        apiRequest('/api/workflows', {
            headers: { 'x-user-id': userId }
        }),

    // Create a new workflow
    create: (userId, workflow) =>
        apiRequest('/api/workflows', {
            method: 'POST',
            credentials: 'include',
            headers: { 'x-user-id': userId },
            body: JSON.stringify(workflow),
        }),

    // Get workflow details
    get: (userId, workflowId) =>
        apiRequest(`/api/workflows/${workflowId}`, {
            headers: { 'x-user-id': userId }
        }),

    // Update workflow
    update: (userId, workflowId, updates) =>
        apiRequest(`/api/workflows/${workflowId}`, {
            method: 'PATCH',
            headers: { 'x-user-id': userId },
            body: JSON.stringify(updates),
        }),

    // Delete workflow
    delete: (userId, workflowId) =>
        apiRequest(`/api/workflows/${workflowId}`, {
            method: 'DELETE',
            headers: { 'x-user-id': userId }
        }),

    // Activate workflow and enroll leads
    activate: (userId, workflowId, leadIds = []) =>
        apiRequest(`/api/workflows/${workflowId}/activate`, {
            method: 'POST',
            credentials: 'include',
            headers: { 'x-user-id': userId },
            body: JSON.stringify({ leadIds }),
        }),

    // Pause workflow
    pause: (userId, workflowId) =>
        apiRequest(`/api/workflows/${workflowId}/pause`, {
            method: 'POST',
            credentials: 'include',
            headers: { 'x-user-id': userId }
        }),

    // Resume workflow
    resume: (userId, workflowId) =>
        apiRequest(`/api/workflows/${workflowId}/resume`, {
            method: 'POST',
            credentials: 'include',
            headers: { 'x-user-id': userId }
        }),

    // Get workflow analytics
    getAnalytics: (userId, workflowId) =>
        apiRequest(`/api/workflows/${workflowId}/analytics`, {
            headers: { 'x-user-id': userId }
        }),

    // Get enrollments
    getEnrollments: (userId, workflowId, { status, page, limit } = {}) => {
        const params = new URLSearchParams();
        if (status) params.append('status', status);
        if (page) params.append('page', page);
        if (limit) params.append('limit', limit);
        const query = params.toString();
        return apiRequest(`/api/workflows/${workflowId}/enrollments${query ? `?${query}` : ''}`, {
            headers: { 'x-user-id': userId }
        });
    },
};

// =============================================
// EMAIL TRACKING - Analytics & Events
// =============================================

export const emailTrackingApi = {
    // Get overall email analytics
    getAnalytics: (userId, { startDate, endDate } = {}) => {
        const params = new URLSearchParams();
        if (startDate) params.append('startDate', startDate);
        if (endDate) params.append('endDate', endDate);
        const query = params.toString();
        return apiRequest(`/api/email-tracking/analytics${query ? `?${query}` : ''}`, {
            headers: { 'x-user-id': userId }
        });
    },

    // Get time-series data for charts
    getTimeseries: (userId, { startDate, endDate, interval } = {}) => {
        const params = new URLSearchParams();
        if (startDate) params.append('startDate', startDate);
        if (endDate) params.append('endDate', endDate);
        if (interval) params.append('interval', interval);
        const query = params.toString();
        return apiRequest(`/api/email-tracking/analytics/timeseries${query ? `?${query}` : ''}`, {
            headers: { 'x-user-id': userId }
        });
    },

    // Get recent tracking events
    getRecentEvents: (userId, { limit, eventType } = {}) => {
        const params = new URLSearchParams();
        if (limit) params.append('limit', limit);
        if (eventType) params.append('eventType', eventType);
        const query = params.toString();
        return apiRequest(`/api/email-tracking/recent${query ? `?${query}` : ''}`, {
            headers: { 'x-user-id': userId }
        });
    },
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
            headers: { 'X-CSRF-Token': await getRequestToken() },
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
    dataApi,
    vapiApi,
    stripeApi,
    scheduledApi,
    claudeApi,
    usageApi,
    emailApi,
    domainsApi,
    settingsApi,
    adminApi,
    sequencesApi,
    emailTrackingApi,
    workflowsApi,
    isLeadsConfigured,
    isDatabaseConfigured,
    isVapiConfigured,
    isClaudeConfigured,
    formatDuration,
    formatTranscript,
};

export const researchApi = {
    industry: (keyword, location, startingUrls = []) => apiRequest('/api/research/industry', {
        method: 'POST', body: JSON.stringify({ keyword, location, startingUrls }),
    }),
};
