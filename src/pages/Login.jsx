import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Zap } from 'lucide-react';

function Login() {
    const { user, loading, error, isLocalhost, signInWithGoogle } = useAuth();
    const navigate = useNavigate();

    // Redirect to dashboard if already logged in
    useEffect(() => {
        if (user && !loading) {
            navigate('/dashboard', { replace: true });
        }
    }, [user, loading, navigate]);

    const handleGoogleSignIn = async () => {
        await signInWithGoogle();
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background">
                <div className="flex flex-col items-center gap-4">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    <p className="text-muted-foreground">Loading...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-background p-4">
            <div className="w-full max-w-md">
                {/* Logo/Brand */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center h-16 w-16 rounded-2xl bg-gradient-to-br from-primary to-accent mb-4">
                        <Zap className="h-8 w-8 text-white" />
                    </div>
                    <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-foreground to-muted-foreground bg-clip-text text-transparent">
                        ValidateCall
                    </h1>
                    <p className="text-muted-foreground mt-2">
                        AI-Powered Market Research
                    </p>
                </div>

                {/* Localhost Notice */}
                {isLocalhost && (
                    <Alert variant="info" className="mb-6">
                        <AlertDescription>
                            🔓 <strong>Localhost Mode:</strong> Authentication is bypassed for development.
                            Click below to continue.
                        </AlertDescription>
                    </Alert>
                )}

                {/* Login Card */}
                <Card>
                    <CardHeader className="text-center pb-2">
                        <CardTitle className="text-xl">Welcome Back</CardTitle>
                        <p className="text-sm text-muted-foreground">
                            Sign in to access your dashboard
                        </p>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {error && (
                            <Alert variant="destructive">
                                <AlertDescription>{error}</AlertDescription>
                            </Alert>
                        )}

                        <Button
                            variant="default"
                            size="lg"
                            className="w-full gap-3"
                            onClick={handleGoogleSignIn}
                        >
                            <svg className="h-5 w-5" viewBox="0 0 24 24">
                                <path
                                    fill="currentColor"
                                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                                />
                                <path
                                    fill="currentColor"
                                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                                />
                                <path
                                    fill="currentColor"
                                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                                />
                                <path
                                    fill="currentColor"
                                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                                />
                            </svg>
                            {isLocalhost ? 'Continue to Dashboard' : 'Sign in with Google'}
                        </Button>

                        <p className="text-xs text-center text-muted-foreground">
                            By signing in, you agree to our Terms of Service and Privacy Policy.
                        </p>
                    </CardContent>
                </Card>

                {/* Footer */}
                <p className="text-center text-xs text-muted-foreground mt-8">
                    © 2024 ValidateCall. All rights reserved.
                </p>
            </div>
        </div>
    );
}

export default Login;
