// PostgreSQL Service - Proxied through Backend API
// All API keys are now securely stored on the server

import { dataApi, isDatabaseConfigured } from './api.js';

// Re-export the configured check
export { isDatabaseConfigured };

// =============================================
// LEADS
// =============================================

export const saveLeads = async (leads, searchKeyword, searchLocation) => {
  return dataApi.saveLeads(leads, searchKeyword, searchLocation);
};

export const getLeads = async (filters = {}) => {
  return dataApi.getLeads(filters);
};

export const getLeadById = async (id) => {
  return dataApi.getLeadById(id);
};

export const updateLeadStatus = async (id, status) => {
  return dataApi.updateLeadStatus(id, status);
};

export const updateLeadAfterCall = async (id) => {
  return dataApi.updateLeadAfterCall(id);
};

export const getLeadsStats = async () => {
  return dataApi.getLeadsStats();
};

// =============================================
// CAMPAIGNS
// =============================================

export const createCampaign = async (campaign) => {
  return dataApi.createCampaign(campaign);
};

export const getCampaigns = async () => {
  return dataApi.getCampaigns();
};

export const updateCampaignStats = async (campaignId, stats) => {
  return dataApi.updateCampaignStats(campaignId, stats);
};

export const updateCampaign = async (campaignId, updates) => {
  return dataApi.updateCampaign(campaignId, updates);
};

// =============================================
// CALLS
// =============================================

export const saveCall = async (callData) => {
  return dataApi.saveCall(callData);
};

export const getCalls = async (filters = {}) => {
  return dataApi.getCalls(filters);
};

export const updateCall = async (id, updates) => {
  return dataApi.updateCall(id, updates);
};

export const getCallsStats = async () => {
  return dataApi.getCallsStats();
};

// =============================================
// SCRAPE JOBS
// =============================================

export const saveScrapeJob = async (job) => {
  return dataApi.saveScrapeJob(job);
};

export const updateScrapeJob = async (id, updates) => {
  return dataApi.updateScrapeJob(id, updates);
};

export const getScrapeJobs = async (limit = 20) => {
  return dataApi.getScrapeJobs(limit);
};

// =============================================
// DASHBOARD STATS
// =============================================

export const getDashboardStats = async () => {
  return dataApi.getDashboardStats();
};
