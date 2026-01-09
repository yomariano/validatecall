/**
 * Umami Analytics Utility
 *
 * Helper functions for tracking events with Umami analytics.
 * Configure via environment variables:
 *   - VITE_UMAMI_SCRIPT_URL: URL to the Umami tracking script
 *   - VITE_UMAMI_WEBSITE_ID: Your Umami website ID
 *
 * @see https://umami.is/docs/track-events
 */

/**
 * Check if Umami is properly configured and loaded
 */
function isUmamiAvailable() {
  return typeof window !== 'undefined' && window.umami && typeof window.umami.track === 'function';
}

/**
 * Track a custom event with Umami
 * @param {string} eventName - The name of the event to track
 * @param {Object} [eventData] - Optional data to send with the event
 */
export function trackEvent(eventName, eventData = {}) {
  if (isUmamiAvailable()) {
    window.umami.track(eventName, eventData);
  }
}

/**
 * Track a page view (usually handled automatically by Umami)
 * @param {string} [url] - Optional custom URL to track
 */
export function trackPageView(url) {
  if (isUmamiAvailable()) {
    if (url) {
      window.umami.track(props => ({ ...props, url }));
    } else {
      window.umami.track();
    }
  }
}

// ============================================================
// Authentication Events
// ============================================================

export const AuthEvents = {
  signupInitiated: () => trackEvent('signup_initiated'),
  googleSigninClicked: () => trackEvent('google_signin_clicked'),
  signinSuccess: (provider = 'google') => trackEvent('signin_success', { provider }),
  signout: () => trackEvent('signout'),
};

// ============================================================
// Lead Management Events
// ============================================================

export const LeadEvents = {
  scrapeStarted: (keyword, location, maxResults) =>
    trackEvent('leads_scrape_started', { keyword, location, maxResults }),

  scrapeCompleted: (leadsFound, duplicatesSkipped, savedCount) =>
    trackEvent('leads_scrape_completed', { leadsFound, duplicatesSkipped, savedCount }),

  fileImported: (fileType, leadsCount) =>
    trackEvent('leads_file_imported', { fileType, leadsCount }),

  pasteImported: (leadsCount) =>
    trackEvent('leads_paste_imported', { leadsCount }),

  classified: (leadsCount) =>
    trackEvent('leads_classified', { leadsCount }),

  selected: (count) =>
    trackEvent('leads_selected', { count }),

  callInitiated: (leadId, callType = 'immediate') =>
    trackEvent('lead_call_initiated', { leadId, callType }),

  testCallInitiated: () =>
    trackEvent('test_call_initiated'),

  importTabChanged: (tabName) =>
    trackEvent('leads_import_tab_changed', { tabName }),

  filterApplied: (filterType, filterValue) =>
    trackEvent('leads_filter_applied', { filterType, filterValue }),

  sampleCsvDownloaded: () =>
    trackEvent('sample_csv_downloaded'),
};

// ============================================================
// Campaign Events
// ============================================================

export const CampaignEvents = {
  created: (leadCount, hasAgent) =>
    trackEvent('campaign_created', { leadCount, hasAgent }),

  started: (leadCount) =>
    trackEvent('campaign_started', { leadCount }),

  batchCallStarted: (totalLeads) =>
    trackEvent('campaign_batch_call_started', { totalLeads }),

  singleCallMade: (status) =>
    trackEvent('campaign_single_call', { status }),

  completed: (successCount, failCount) =>
    trackEvent('campaign_completed', { successCount, failCount }),

  resumed: (campaignId) =>
    trackEvent('campaign_resumed', { campaignId }),

  closed: () =>
    trackEvent('campaign_closed'),

  categoryFilterChanged: (category) =>
    trackEvent('campaign_category_filter', { category }),
};

// ============================================================
// Paywall & Billing Events
// ============================================================

export const PaywallEvents = {
  softPaywallShown: (resourceType, usagePercent) =>
    trackEvent('paywall_soft_shown', { resourceType, usagePercent }),

  hardPaywallShown: (resourceType) =>
    trackEvent('paywall_hard_shown', { resourceType }),

  softPaywallDismissed: (resourceType) =>
    trackEvent('paywall_soft_dismissed', { resourceType }),

  upgradeClicked: (source) =>
    trackEvent('upgrade_clicked', { source }),

  pricingViewed: () =>
    trackEvent('pricing_page_viewed'),

  planSelected: (planId) =>
    trackEvent('plan_selected', { planId }),
};

// ============================================================
// Voice Agent Events
// ============================================================

export const AgentEvents = {
  selected: (agentId, agentName) =>
    trackEvent('agent_selected', { agentId, agentName }),

  customPitchEntered: () =>
    trackEvent('custom_pitch_entered'),

  aiGenerateUsed: (generationType) =>
    trackEvent('ai_generate_used', { generationType }),
};

// ============================================================
// Navigation & Page View Events
// ============================================================

export const NavigationEvents = {
  pageViewed: (pageName) =>
    trackEvent('page_viewed', { pageName }),

  sidebarNavigation: (target) =>
    trackEvent('sidebar_navigation', { target }),

  ctaClicked: (ctaName, location) =>
    trackEvent('cta_clicked', { ctaName, location }),
};

// ============================================================
// Onboarding Events
// ============================================================

export const OnboardingEvents = {
  stepCompleted: (stepNumber, stepName) =>
    trackEvent('onboarding_step_completed', { stepNumber, stepName }),

  wizardDismissed: () =>
    trackEvent('onboarding_wizard_dismissed'),

  wizardCompleted: () =>
    trackEvent('onboarding_wizard_completed'),
};

// ============================================================
// Error Events
// ============================================================

export const ErrorEvents = {
  apiError: (endpoint, errorMessage) =>
    trackEvent('api_error', { endpoint, errorMessage }),

  scrapeError: (errorMessage) =>
    trackEvent('scrape_error', { errorMessage }),

  callError: (errorMessage) =>
    trackEvent('call_error', { errorMessage }),
};

// ============================================================
// React Hook for Page View Tracking
// ============================================================

/**
 * Custom hook to track page views on route changes
 * Usage: Call usePageTracking() in your App component inside the Router
 */
export function usePageTracking() {
  // This will be called from components that have access to useLocation
  // The actual implementation needs to be in a component that's inside the Router
}

/**
 * Track page view with route information
 * Call this from a component that wraps routes or in useEffect with location dependency
 */
export function trackRouteChange(pathname) {
  const pageNames = {
    '/': 'landing',
    '/pricing': 'pricing_public',
    '/dashboard': 'dashboard',
    '/leads': 'leads',
    '/campaigns': 'campaigns',
    '/agents': 'agents',
    '/history': 'history',
    '/billing': 'billing',
    '/settings': 'settings',
  };

  const pageName = pageNames[pathname] || pathname.replace(/\//g, '_').slice(1) || 'unknown';
  NavigationEvents.pageViewed(pageName);
  trackPageView(pathname);
}

export default {
  trackEvent,
  trackPageView,
  trackRouteChange,
  usePageTracking,
  AuthEvents,
  LeadEvents,
  CampaignEvents,
  PaywallEvents,
  AgentEvents,
  NavigationEvents,
  OnboardingEvents,
  ErrorEvents,
};
