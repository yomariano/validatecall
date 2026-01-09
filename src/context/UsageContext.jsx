import { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from './AuthContext';

const UsageContext = createContext();

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3002';

export function UsageProvider({ children }) {
    const { user, isLocalhost } = useAuth();
    const [usage, setUsage] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Fetch usage data from API
    const fetchUsage = useCallback(async () => {
        if (!user?.id) {
            setUsage(null);
            setLoading(false);
            return;
        }

        // Bypass for localhost development
        if (isLocalhost) {
            setUsage({
                isFreeTier: false,
                subscription: { planId: 'dev', status: 'active' },
                usage: null
            });
            setLoading(false);
            return;
        }

        try {
            const response = await fetch(`${API_BASE}/api/usage/${user.id}`);
            if (!response.ok) {
                throw new Error('Failed to fetch usage');
            }
            const data = await response.json();
            setUsage(data);
            setError(null);
        } catch (err) {
            console.error('Error fetching usage:', err);
            setError(err.message);
            // Default to free tier on error
            setUsage({
                isFreeTier: true,
                subscription: null,
                usage: {
                    leadsUsed: 0,
                    leadsLimit: 10,
                    leadsRemaining: 10,
                    callsUsed: 0,
                    callsLimit: 5,
                    callsRemaining: 5,
                    callSecondsPerCall: 120
                }
            });
        } finally {
            setLoading(false);
        }
    }, [user?.id, isLocalhost]);

    // Fetch on mount and when user changes
    useEffect(() => {
        fetchUsage();
    }, [fetchUsage]);

    // Refresh usage data
    const refreshUsage = useCallback(async () => {
        setLoading(true);
        return await fetchUsage();
    }, [fetchUsage]);

    // Check if user can generate leads
    const canGenerateLeads = useCallback((count = 1) => {
        if (!usage?.isFreeTier) return true;
        if (!usage?.usage) return true;
        return usage.usage.leadsRemaining >= count;
    }, [usage]);

    // Check if user can make a call
    const canMakeCall = useCallback(() => {
        if (!usage?.isFreeTier) return true;
        if (!usage?.usage) return true;
        return usage.usage.callsRemaining > 0;
    }, [usage]);

    // Get usage percentages (for progress bars)
    const usagePercentage = useMemo(() => ({
        leads: usage?.usage
            ? Math.min(100, (usage.usage.leadsUsed / usage.usage.leadsLimit) * 100)
            : 0,
        calls: usage?.usage
            ? Math.min(100, (usage.usage.callsUsed / usage.usage.callsLimit) * 100)
            : 0
    }), [usage]);

    const shouldShowSoftPaywall = useCallback((type) => {
        if (!usage?.isFreeTier) return false;
        if (type === 'leads') return usagePercentage.leads >= 80 && usagePercentage.leads < 100;
        if (type === 'calls') return usagePercentage.calls >= 80 && usagePercentage.calls < 100;
        return false;
    }, [usage?.isFreeTier, usagePercentage]);

    const shouldShowHardPaywall = useCallback((type) => {
        if (!usage?.isFreeTier) return false;
        if (type === 'leads') return usage?.usage?.leadsRemaining === 0;
        if (type === 'calls') return usage?.usage?.callsRemaining === 0;
        if (type === 'any') return usage?.usage?.leadsRemaining === 0 || usage?.usage?.callsRemaining === 0;
        return false;
    }, [usage]);

    const value = {
        // State
        usage,
        loading,
        error,

        // Computed values
        isFreeTier: usage?.isFreeTier ?? false,
        isSubscribed: !usage?.isFreeTier && !!usage?.subscription,
        subscription: usage?.subscription,

        // Usage stats (null if subscribed)
        leadsUsed: usage?.usage?.leadsUsed ?? 0,
        leadsLimit: usage?.usage?.leadsLimit ?? 10,
        leadsRemaining: usage?.usage?.leadsRemaining ?? 10,
        callsUsed: usage?.usage?.callsUsed ?? 0,
        callsLimit: usage?.usage?.callsLimit ?? 5,
        callsRemaining: usage?.usage?.callsRemaining ?? 5,
        callSecondsPerCall: usage?.usage?.callSecondsPerCall ?? 120,

        // Percentages
        usagePercentage,

        // Paywall flags
        shouldShowSoftPaywall,
        shouldShowHardPaywall,

        // Methods
        canGenerateLeads,
        canMakeCall,
        refreshUsage,
    };

    return (
        <UsageContext.Provider value={value}>
            {children}
        </UsageContext.Provider>
    );
}

export function useUsage() {
    const context = useContext(UsageContext);
    if (!context) {
        throw new Error('useUsage must be used within a UsageProvider');
    }
    return context;
}

export default UsageContext;
