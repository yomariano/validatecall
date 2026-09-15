import { Label, Select } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';

const countries = new Intl.DisplayNames(['en'], { type:'region' });
const countryName = code => code ? countries.of(code) : 'Unknown country';

export default function CallerNumberSelect({ caller, id, disabled = false }) {
    const reason = number => {
        if (number.unavailableReason === 'COUNTRY_MISMATCH') return 'different destination country';
        if (number.unavailableReason === 'DAILY_LIMIT_REACHED') return 'daily limit reached';
        return '';
    };
    return <div className="space-y-2">
        <div className="flex items-center justify-between gap-2">
            <Label htmlFor={id}>From number</Label>
            <Button type="button" size="sm" variant="ghost" aria-label="Refresh available from numbers"
                onClick={caller.refresh} disabled={disabled || caller.loading}>
                <RefreshCw className={caller.loading ? 'h-3.5 w-3.5 animate-spin' : 'h-3.5 w-3.5'} />
                Refresh
            </Button>
        </div>
        <Select id={id} value={caller.selectedId} onChange={event => caller.select(event.target.value)}
            disabled={disabled || caller.loading || !!caller.error || !caller.numbers.length}
            aria-describedby={`${id}-help`}>
            <option value="" disabled>{caller.loading ? 'Loading your numbers…' : 'Choose a from number'}</option>
            {caller.selectedId && !caller.numbers.some(number => number.id === caller.selectedId) && <option value={caller.selectedId} disabled>Selected number is no longer available</option>}
            {caller.numbers.map(number => <option key={number.id} value={number.id} disabled={!number.available}>
                {number.phoneNumber} · {countryName(number.country)}{reason(number) ? ` — ${reason(number)}` : ''}
            </option>)}
        </Select>
        <div id={`${id}-help`} className="text-xs text-muted-foreground" aria-live="polite">
            {caller.error ? <p className="text-destructive">{caller.error} Use Refresh to try again.</p>
                : caller.loading ? <p>Checking which numbers you can use for this call.</p>
                : !caller.numbers.length ? <p>No calling numbers are available to your account. Ask your workspace administrator to assign one.</p>
                : caller.selectedNumber ? <p>Your contact will see {caller.selectedNumber.phoneNumber}. {caller.selectedNumber.remainingToday} calls available today.</p>
                : caller.selectedId ? <p>This from number is no longer available for this call. Choose another number.</p>
                : caller.numbers.every(number => number.unavailableReason === 'DESTINATION_REQUIRED') ? <p>Enter the contact’s international phone number to see matching caller numbers.</p>
                : <p>No number is available for this destination. Use a number in the contact’s country with remaining call capacity.</p>}
            {!caller.loading && !caller.error && !caller.callingEnabled && <p className="mt-2">Calling is currently paused.</p>}
        </div>
    </div>;
}
