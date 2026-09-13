import { useContext } from 'react';
import { UsageContext } from '../context/UsageContextState';

export function useUsage() {
    const context = useContext(UsageContext);
    if (!context) {
        throw new Error('useUsage must be used within a UsageProvider');
    }
    return context;
}

export default UsageContext;
