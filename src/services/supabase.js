// Supabase Service - Proxied through Backend API
// All API keys are now securely stored on the server

import { supabaseApi, isSupabaseConfigured } from './api.js';

// Re-export the configured check
export { isSupabaseConfigured };

// Legacy: Keep supabase export for any direct usage (will be null)
export const supabase = null;

// =============================================
// LEADS
// =============================================

export const saveLeads = async (leads, searchKeyword, searchLocation) => {
  return supabaseApi.saveLeads(leads, searchKeyword, searchLocation);
};

export const getLeads = async (filters = {}) => {
  return supabaseApi.getLeads(filters);
};

export const getLeadById = async (id) => {
  return supabaseApi.getLeadById(id);
};

export const updateLeadStatus = async (id, status) => {
  return supabaseApi.updateLeadStatus(id, status);
};

export const updateLeadAfterCall = async (id) => {
  return supabaseApi.updateLeadAfterCall(id);
};

export const getLeadsStats = async () => {
  return supabaseApi.getLeadsStats();
};

// =============================================
// CAMPAIGNS
// =============================================

export const createCampaign = async (campaign) => {
  return supabaseApi.createCampaign(campaign);
};

export const getCampaigns = async () => {
  return supabaseApi.getCampaigns();
};

export const updateCampaignStats = async (campaignId, stats) => {
  return supabaseApi.updateCampaignStats(campaignId, stats);
};

export const updateCampaign = async (campaignId, updates) => {
  return supabaseApi.updateCampaign(campaignId, updates);
};

// =============================================
// CALLS
// =============================================

export const saveCall = async (callData) => {
  return supabaseApi.saveCall(callData);
};

export const getCalls = async (filters = {}) => {
  return supabaseApi.getCalls(filters);
};

export const updateCall = async (id, updates) => {
  return supabaseApi.updateCall(id, updates);
};

export const getCallsStats = async () => {
  return supabaseApi.getCallsStats();
};

// =============================================
// SCRAPE JOBS
// =============================================

export const saveScrapeJob = async (job) => {
  return supabaseApi.saveScrapeJob(job);
};

export const updateScrapeJob = async (id, updates) => {
  return supabaseApi.updateScrapeJob(id, updates);
};

export const getScrapeJobs = async (limit = 20) => {
  return supabaseApi.getScrapeJobs(limit);
};

// =============================================
// DASHBOARD STATS
// =============================================

export const getDashboardStats = async () => {
  return supabaseApi.getDashboardStats();
};
