// Sourced business research using the backend's DeepInfra browser workflow.
// All API keys are securely stored on the server

import { leads, isLeadsConfigured } from './api.js';

// Check whether the server has the research model configured.
export { isLeadsConfigured };

// Legacy method name retained for existing callers.
export const scrapeGoogleMaps = async ({ keyword, location, maxResults = 10, userId, startingUrls = [] }) => {
  return leads.scrape({ keyword, location, maxResults, userId, startingUrls });
};

// Browse sources and return only contacts supported by retrieved pages.
export const scrapeAndWait = async ({ keyword, location, maxResults = 10, userId, startingUrls = [] }, onStatusUpdate) => {
  return leads.scrapeAndWait({ keyword, location, maxResults, userId, startingUrls }, onStatusUpdate);
};
