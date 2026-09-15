import { useEffect, useState } from 'react';
import { vapiApi } from '@/services/api';

export function useCallerNumbers(enabled, phoneNumber, contactKey) {
    const [version, setVersion] = useState(0);
    const [state, setState] = useState(null);
    const destination = (phoneNumber || '').trim();
    const key = `${contactKey}:${destination}`;

    useEffect(() => {
        if (!enabled) return;
        let cancelled = false;
        const timer = setTimeout(async () => {
            try {
                const data = await vapiApi.getCallerNumbers(destination);
                if (!cancelled) setState(previous => ({ key, version, data,
                    selectedId:previous?.key === key && previous.selectedId
                        ? previous.selectedId : data.recommendedNumberId || '' }));
            } catch (error) {
                if (!cancelled) setState(previous => ({ key, version, error:error.message,
                    selectedId:previous?.key === key ? previous.selectedId : '' }));
            }
        }, 200);
        return () => { cancelled = true; clearTimeout(timer); };
    }, [enabled, destination, key, version]);

    const current = enabled && state?.key === key && state?.version === version ? state : null;
    const selectedNumber = current?.data?.numbers.find(number => number.available && number.id === current.selectedId);
    return {
        numbers:current?.data?.numbers || [],
        selectedId:current?.selectedId || '',
        selectedNumber,
        loading:enabled && !current,
        error:current?.error || '',
        callingEnabled:!!current?.data?.callingEnabled,
        schedulingEnabled:!!current?.data?.schedulingEnabled,
        canCall:!!selectedNumber && !!current?.data?.callingEnabled,
        select:numberId => setState(previous => previous?.key === key ? { ...previous, selectedId:numberId } : previous),
        refresh:() => setVersion(previous => previous + 1),
    };
}
