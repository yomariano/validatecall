// Lead Generation Service - Uses Claude Sonnet via Backend API
// All API keys are securely stored on the server

import { leads, isLeadsConfigured } from './api.js';

// Re-export the configured check (checks if Claude API is configured)
export { isLeadsConfigured };

// Generate leads using Claude AI
export const scrapeGoogleMaps = async ({ keyword, location, maxResults = 100 }) => {
  return leads.scrape({ keyword, location, maxResults });
};

// Generate leads with Claude AI and return results directly
export const scrapeAndWait = async ({ keyword, location, maxResults = 100 }, onStatusUpdate) => {
  return leads.scrapeAndWait({ keyword, location, maxResults }, onStatusUpdate);
};
