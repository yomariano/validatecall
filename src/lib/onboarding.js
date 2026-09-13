import { Search, Phone } from 'lucide-react';
export const ONBOARDING_KEY = 'validatecall_onboarding_completed';
export const ONBOARDING_STEP_KEY = 'validatecall_onboarding_step';

export const steps = [
  {
    id: 1,
    title: 'Find Leads',
    description: 'Import your existing business contacts or search the web for contacts with source evidence.',
    icon: Search,
    action: 'Find Leads',
    path: '/leads',
    tip: 'Try searching for "restaurants in Dublin" or "plumbers in Cork"',
  },
  {
    id: 2,
    title: 'Campaigns',
    description: 'Create targeted calling campaigns for different industries. Select leads and let our voice AI pitch your product and gather feedback.',
    icon: Phone,
    action: 'Create Campaign',
    path: '/campaigns',
    tip: 'Create separate campaigns for different industries for better targeting',
  },
];

