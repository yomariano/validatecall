import { createContext, useContext, useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';

const AuthContext = createContext();

// Check if we're in localhost/development mode
const IS_LOCALHOST = window.location.hostname === 'localhost' ||
    window.location.hostname === '127.0.0.1';

// Initialize Supabase client
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const supabase = supabaseUrl && supabaseAnonKey
    ? createClient(supabaseUrl, supabaseAnonKey)
    : null;

// Mock user for localhost development
const MOCK_USER = {
    id: '00000000-0000-0000-0000-000000000000',
    email: 'dev@localhost.com',
    user_metadata: {
        full_name: 'Developer',
        avatar_url: null,
    },
};

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        // If localhost, bypass authentication
        if (IS_LOCALHOST) {
            console.log('🔓 Localhost detected - bypassing authentication');
            setUser(MOCK_USER);
            setLoading(false);
            return;
        }

        // Otherwise, check Supabase session
        if (!supabase) {
            console.warn('Supabase not configured');
            setLoading(false);
            return;
        }

        // Get initial session
        supabase.auth.getSession().then(({ data: { session } }) => {
            setUser(session?.user ?? null);
            setLoading(false);
        });

        // Listen for auth changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
            (_event, session) => {
                setUser(session?.user ?? null);
                setLoading(false);
            }
        );

        return () => subscription.unsubscribe();
    }, []);

    const signInWithGoogle = async () => {
        if (IS_LOCALHOST) {
            // In localhost, just set the mock user
            setUser(MOCK_USER);
            return { user: MOCK_USER, error: null };
        }

        if (!supabase) {
            setError('Authentication not configured');
            return { user: null, error: 'Supabase not configured' };
        }

        try {
            const { data, error } = await supabase.auth.signInWithOAuth({
                provider: 'google',
                options: {
                    redirectTo: `${window.location.origin}/`,
                    queryParams: {
                        access_type: 'offline',
                        prompt: 'consent',
                    },
                },
            });

            if (error) throw error;
            return { data, error: null };
        } catch (err) {
            setError(err.message);
            return { user: null, error: err.message };
        }
    };

    const signOut = async () => {
        if (IS_LOCALHOST) {
            // In localhost, just clear the mock user then set it back
            // (simulating still having access after logout for dev convenience)
            setUser(null);
            setTimeout(() => setUser(MOCK_USER), 100);
            return { error: null };
        }

        if (!supabase) {
            return { error: 'Supabase not configured' };
        }

        try {
            const { error } = await supabase.auth.signOut();
            if (error) throw error;
            setUser(null);
            return { error: null };
        } catch (err) {
            setError(err.message);
            return { error: err.message };
        }
    };

    const value = {
        user,
        loading,
        error,
        isAuthenticated: !!user,
        isLocalhost: IS_LOCALHOST,
        signInWithGoogle,
        signOut,
        supabase,
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}

export default AuthContext;
