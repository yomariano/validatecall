import { useState, useEffect } from 'react';
import { getHealth } from '../services/api';
import { vapiApi } from '../services/api';
import {
  Settings2,
  CheckCircle2,
  XCircle,
  Zap,
  Database,
  MapPinned,
  ExternalLink,
  Loader2,
  Server
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent, StatCard } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { cn } from '@/lib/utils';

function Settings() {
  const [testResult, setTestResult] = useState(null);
  const [isTesting, setIsTesting] = useState(false);
  const [configStatus, setConfigStatus] = useState({
    backend: { configured: false, status: 'Checking...' },
    vapi: { configured: false, status: 'Checking...' },
    supabase: { configured: false, status: 'Checking...' },
    apify: { configured: false, status: 'Checking...' },
  });

  useEffect(() => {
    checkServices();
  }, []);

  const checkServices = async () => {
    try {
      const health = await getHealth();
      setConfigStatus({
        backend: { configured: true, status: 'Connected' },
        vapi: {
          configured: health.services?.vapi || false,
          status: health.services?.vapi ? 'Configured' : 'Not configured',
        },
        supabase: {
          configured: health.services?.supabase || false,
          status: health.services?.supabase ? 'Connected' : 'Not configured',
        },
        apify: {
          configured: health.services?.apify || false,
          status: health.services?.apify ? 'Configured' : 'Not configured',
        },
      });
    } catch {
      setConfigStatus({
        backend: { configured: false, status: 'Not running' },
        vapi: { configured: false, status: 'Backend required' },
        supabase: { configured: false, status: 'Backend required' },
        apify: { configured: false, status: 'Backend required' },
      });
    }
  };

  const testVapiConnection = async () => {
    setIsTesting(true);
    setTestResult(null);

    try {
      const calls = await vapiApi.getAllCalls(1);
      setTestResult({ success: true, message: 'Vapi connection successful!' });
    } catch (err) {
      setTestResult({ success: false, message: err.message });
    } finally {
      setIsTesting(false);
    }
  };

  const StatusIcon = ({ configured }) => configured
    ? <CheckCircle2 className="h-6 w-6 text-success" />
    : <XCircle className="h-6 w-6 text-destructive" />;

  return (
    <div className="space-y-8 animate-slide-up">
      {/* Page Header */}
      <div className="space-y-1">
        <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-foreground to-muted-foreground bg-clip-text text-transparent">
          Settings
        </h1>
        <p className="text-muted-foreground">
          Configure your API connections
        </p>
      </div>

      {/* Configuration Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings2 className="h-5 w-5 text-primary" />
            Configuration Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-4 gap-6">
            {/* Backend Server */}
            <div className={cn(
              "relative group rounded-xl border-2 p-6 transition-all duration-300",
              configStatus.backend.configured
                ? "border-success/30 hover:border-success/60 hover:shadow-glow-success"
                : "border-destructive/30 hover:border-destructive/50"
            )}>
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl" />
              <div className="relative flex flex-col items-center text-center">
                <div className={cn(
                  "mb-4 flex h-14 w-14 items-center justify-center rounded-full",
                  configStatus.backend.configured ? "bg-success/10" : "bg-destructive/10"
                )}>
                  <Server className={cn(
                    "h-7 w-7",
                    configStatus.backend.configured ? "text-success" : "text-destructive"
                  )} />
                </div>
                <h3 className="text-lg font-semibold mb-1">API Server</h3>
                <p className="text-sm text-muted-foreground mb-3">Backend</p>
                <StatusIcon configured={configStatus.backend.configured} />
              </div>
            </div>

            {/* Vapi */}
            <div className={cn(
              "relative group rounded-xl border-2 p-6 transition-all duration-300",
              configStatus.vapi.configured
                ? "border-success/30 hover:border-success/60 hover:shadow-glow-success"
                : "border-destructive/30 hover:border-destructive/50"
            )}>
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl" />
              <div className="relative flex flex-col items-center text-center">
                <div className={cn(
                  "mb-4 flex h-14 w-14 items-center justify-center rounded-full",
                  configStatus.vapi.configured ? "bg-success/10" : "bg-destructive/10"
                )}>
                  <Zap className={cn(
                    "h-7 w-7",
                    configStatus.vapi.configured ? "text-success" : "text-destructive"
                  )} />
                </div>
                <h3 className="text-lg font-semibold mb-1">Vapi.ai</h3>
                <p className="text-sm text-muted-foreground mb-3">AI Phone Calls</p>
                <StatusIcon configured={configStatus.vapi.configured} />
              </div>
            </div>

            {/* Supabase */}
            <div className={cn(
              "relative group rounded-xl border-2 p-6 transition-all duration-300",
              configStatus.supabase.configured
                ? "border-success/30 hover:border-success/60 hover:shadow-glow-success"
                : "border-destructive/30 hover:border-destructive/50"
            )}>
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl" />
              <div className="relative flex flex-col items-center text-center">
                <div className={cn(
                  "mb-4 flex h-14 w-14 items-center justify-center rounded-full",
                  configStatus.supabase.configured ? "bg-success/10" : "bg-destructive/10"
                )}>
                  <Database className={cn(
                    "h-7 w-7",
                    configStatus.supabase.configured ? "text-success" : "text-destructive"
                  )} />
                </div>
                <h3 className="text-lg font-semibold mb-1">Supabase</h3>
                <p className="text-sm text-muted-foreground mb-3">Database</p>
                <StatusIcon configured={configStatus.supabase.configured} />
              </div>
            </div>

            {/* Apify */}
            <div className={cn(
              "relative group rounded-xl border-2 p-6 transition-all duration-300",
              configStatus.apify.configured
                ? "border-success/30 hover:border-success/60 hover:shadow-glow-success"
                : "border-destructive/30 hover:border-destructive/50"
            )}>
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl" />
              <div className="relative flex flex-col items-center text-center">
                <div className={cn(
                  "mb-4 flex h-14 w-14 items-center justify-center rounded-full",
                  configStatus.apify.configured ? "bg-success/10" : "bg-destructive/10"
                )}>
                  <MapPinned className={cn(
                    "h-7 w-7",
                    configStatus.apify.configured ? "text-success" : "text-destructive"
                  )} />
                </div>
                <h3 className="text-lg font-semibold mb-1">Apify</h3>
                <p className="text-sm text-muted-foreground mb-3">Google Maps Scraping</p>
                <StatusIcon configured={configStatus.apify.configured} />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Environment Variables */}
      <Card>
        <CardHeader>
          <CardTitle>Server Environment Variables</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Add these to your <code className="rounded bg-muted px-1.5 py-0.5 text-xs font-mono">server/.env</code> file:
          </p>

          <div className="rounded-lg bg-[#0a0a0c] border border-border p-6 font-mono text-sm overflow-x-auto">
            {/* Server */}
            <div className="mb-4">
              <div className="text-muted-foreground"># Server Configuration</div>
              <div className="mt-1">
                <span className="text-[#c084fc]">PORT</span>=
                <span className="text-success">3001</span>
              </div>
            </div>

            {/* Supabase */}
            <div className="mb-4">
              <div className="text-muted-foreground"># Supabase - Database</div>
              <div className="mt-1">
                <span className="text-[#c084fc]">SUPABASE_URL</span>=
                <span className={configStatus.supabase.configured ? 'text-success' : 'text-destructive'}>
                  {configStatus.supabase.configured ? '••••••••' : 'your_supabase_url'}
                </span>
              </div>
              <div>
                <span className="text-[#c084fc]">SUPABASE_ANON_KEY</span>=
                <span className={configStatus.supabase.configured ? 'text-success' : 'text-destructive'}>
                  {configStatus.supabase.configured ? '••••••••' : 'your_anon_key'}
                </span>
              </div>
            </div>

            {/* Apify */}
            <div className="mb-4">
              <div className="text-muted-foreground"># Apify - Google Maps Scraping</div>
              <div className="mt-1">
                <span className="text-[#c084fc]">APIFY_TOKEN</span>=
                <span className={configStatus.apify.configured ? 'text-success' : 'text-destructive'}>
                  {configStatus.apify.configured ? '••••••••' : 'your_apify_token'}
                </span>
              </div>
            </div>

            {/* Vapi */}
            <div>
              <div className="text-muted-foreground"># Vapi.ai - AI Phone Calls</div>
              <div className="mt-1">
                <span className="text-[#c084fc]">VAPI_API_KEY</span>=
                <span className={configStatus.vapi.configured ? 'text-success' : 'text-destructive'}>
                  {configStatus.vapi.configured ? '••••••••' : 'your_api_key'}
                </span>
              </div>
              <div>
                <span className="text-[#c084fc]">VAPI_PHONE_NUMBER_ID</span>=
                <span className={configStatus.vapi.configured ? 'text-success' : 'text-destructive'}>
                  {configStatus.vapi.configured ? '••••••••' : 'your_phone_id'}
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Test Connection */}
      <Card>
        <CardHeader>
          <CardTitle>Test Connections</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-4 items-center">
            <Button
              variant="default"
              onClick={testVapiConnection}
              disabled={!configStatus.vapi.configured || isTesting}
            >
              {isTesting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Testing...
                </>
              ) : (
                <>
                  <Zap className="h-4 w-4" />
                  Test Vapi Connection
                </>
              )}
            </Button>

            <Button
              variant="secondary"
              onClick={checkServices}
            >
              <Server className="h-4 w-4" />
              Refresh Status
            </Button>

            {testResult && (
              <Alert variant={testResult.success ? 'success' : 'destructive'} className="flex-1">
                <AlertDescription>{testResult.message}</AlertDescription>
              </Alert>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Setup Instructions */}
      <Card>
        <CardHeader>
          <CardTitle>Setup Instructions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Backend Server */}
          <div>
            <h3 className="text-lg font-semibold flex items-center gap-2 mb-3">
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">0</span>
              Start Backend Server
              <span className="text-xs font-normal text-muted-foreground">(Required)</span>
            </h3>
            <ol className="list-decimal ml-10 space-y-1.5 text-sm text-muted-foreground">
              <li>Navigate to <code className="rounded bg-muted px-1.5 py-0.5 text-xs font-mono">server/</code> directory</li>
              <li>Run <code className="rounded bg-muted px-1.5 py-0.5 text-xs font-mono">npm install</code></li>
              <li>Copy <code className="rounded bg-muted px-1.5 py-0.5 text-xs font-mono">.env.example</code> to <code className="rounded bg-muted px-1.5 py-0.5 text-xs font-mono">.env</code> and fill in values</li>
              <li>Run <code className="rounded bg-muted px-1.5 py-0.5 text-xs font-mono">npm run dev</code></li>
            </ol>
          </div>

          {/* Vapi */}
          <div>
            <h3 className="text-lg font-semibold flex items-center gap-2 mb-3">
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">1</span>
              Vapi.ai
              <span className="text-xs font-normal text-muted-foreground">(Required for calls)</span>
            </h3>
            <ol className="list-decimal ml-10 space-y-1.5 text-sm text-muted-foreground">
              <li>Sign up at <a href="https://vapi.ai" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline inline-flex items-center gap-1">vapi.ai <ExternalLink className="h-3 w-3" /></a></li>
              <li>Get your API key from Dashboard → API Keys</li>
              <li>Create or import a phone number</li>
              <li>Copy the Phone Number ID</li>
            </ol>
          </div>

          {/* Supabase */}
          <div>
            <h3 className="text-lg font-semibold flex items-center gap-2 mb-3">
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">2</span>
              Supabase
              <span className="text-xs font-normal text-muted-foreground">(Required for data storage)</span>
            </h3>
            <ol className="list-decimal ml-10 space-y-1.5 text-sm text-muted-foreground">
              <li>Sign up at <a href="https://supabase.com" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline inline-flex items-center gap-1">supabase.com <ExternalLink className="h-3 w-3" /></a></li>
              <li>Create a new project</li>
              <li>Go to Settings → API to get URL and anon key</li>
              <li>Run the SQL from <code className="rounded bg-muted px-1.5 py-0.5 text-xs font-mono">supabase/schema.sql</code> in SQL Editor</li>
            </ol>
          </div>

          {/* Apify */}
          <div>
            <h3 className="text-lg font-semibold flex items-center gap-2 mb-3">
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">3</span>
              Apify
              <span className="text-xs font-normal text-muted-foreground">(Required for scraping)</span>
            </h3>
            <ol className="list-decimal ml-10 space-y-1.5 text-sm text-muted-foreground">
              <li>Sign up at <a href="https://apify.com" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline inline-flex items-center gap-1">apify.com <ExternalLink className="h-3 w-3" /></a></li>
              <li>Get your API token from Settings → Integrations</li>
              <li>You get $5 free credit monthly</li>
            </ol>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default Settings;
