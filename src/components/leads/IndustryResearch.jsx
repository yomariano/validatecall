import { useState } from 'react';
import { researchApi } from '@/services/api';
import { Button } from '@/components/ui/button';

export default function IndustryResearch({ keyword, location, startingUrls = [] }) {
    const [result, setResult] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    async function research() {
        setLoading(true);
        setError('');
        setResult(null);
        try {
            const data = await researchApi.industry(keyword, location, startingUrls);
            setResult({ ...data, keyword, location });
        } catch (err) { setError(err.message); }
        finally { setLoading(false); }
    }
    return <div className="space-y-3 border-t border-border pt-4">
        <div className="flex flex-wrap items-center gap-3">
            <Button variant="outline" disabled={loading || !keyword.trim() || !location.trim()} onClick={research}>
                {loading ? 'Researching industry…' : 'Research this industry'}
            </Button>
            <p className="text-sm text-muted-foreground">Explore industry trends and challenges with linked sources.</p>
        </div>
        {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
        {result && <div className="space-y-3" aria-live="polite">
            <h3 className="font-semibold">{result.keyword} · {result.location}</h3>
            {!result.findings.length && <p>No supported findings were returned. Try a more specific industry or location.</p>}
            {result.findings.map((finding, index) => <div key={index} className="rounded-lg border border-border bg-white p-3">
                <p className="text-sm">{finding.text}</p>
                <div className="mt-2 flex flex-wrap gap-3">
                    {finding.sourceUrls.map(url => <a key={url} className="text-xs text-primary underline" href={url} target="_blank" rel="noopener noreferrer">
                        {new URL(url).hostname}
                    </a>)}
                </div>
            </div>)}
            {result.warnings?.length > 0 && <p className="text-xs text-muted-foreground">Some websites could not be read. Findings cover only the accessible sources.</p>}
            <p className="text-xs text-muted-foreground">AI summary of visited web pages. Review the linked sources before relying on a finding.</p>
        </div>}
    </div>;
}
