import { cn } from '@/lib/utils';

/**
 * Usage meter component showing progress towards limit
 * Changes color: green (<80%) -> yellow (80-99%) -> red (100%)
 */
function UsageMeter({
    used,
    limit,
    label,
    showText = true,
    size = 'default', // 'small', 'default', 'large'
    className
}) {
    const percentage = Math.min(100, (used / limit) * 100);
    const remaining = Math.max(0, limit - used);

    // Determine color based on percentage
    const getColor = () => {
        if (percentage >= 100) return 'bg-red-500';
        if (percentage >= 80) return 'bg-yellow-500';
        return 'bg-primary';
    };

    const getTextColor = () => {
        if (percentage >= 100) return 'text-red-500';
        if (percentage >= 80) return 'text-yellow-500';
        return 'text-primary';
    };

    const heights = {
        small: 'h-1',
        default: 'h-2',
        large: 'h-3'
    };

    return (
        <div className={cn('space-y-1', className)}>
            {showText && (
                <div className="flex justify-between items-center text-xs">
                    <span className="text-muted-foreground">{label}</span>
                    <span className={cn('font-medium', getTextColor())}>
                        {remaining}/{limit}
                    </span>
                </div>
            )}
            <div className={cn('w-full bg-secondary rounded-full overflow-hidden', heights[size])}>
                <div
                    className={cn('h-full rounded-full transition-all duration-300', getColor())}
                    style={{ width: `${percentage}%` }}
                />
            </div>
        </div>
    );
}

/**
 * Compact usage display for sidebar
 */
export function UsageDisplay({ leadsUsed, leadsLimit, callsUsed, callsLimit }) {
    return (
        <div className="space-y-3 p-3 bg-secondary/50 rounded-lg border border-border">
            <div className="flex items-center gap-2">
                <div className="flex h-5 w-5 items-center justify-center rounded bg-primary/10">
                    <span className="text-[10px] font-bold text-primary">F</span>
                </div>
                <span className="text-xs font-medium text-muted-foreground">Free Plan</span>
            </div>
            <UsageMeter
                used={leadsUsed}
                limit={leadsLimit}
                label="Leads"
                size="small"
            />
            <UsageMeter
                used={callsUsed}
                limit={callsLimit}
                label="Calls"
                size="small"
            />
        </div>
    );
}

export default UsageMeter;
