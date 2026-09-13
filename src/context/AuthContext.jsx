import { useState, useEffect } from 'react';
import { apiRequest } from '@/services/api';
import { loadSession, clearSession, API_BASE_URL } from '@/lib/session';
import { AuthEvents } from '@/lib/analytics';
import { AuthContext } from './AuthContextState';

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    useEffect(() => {
        let active = true;
        loadSession().then(session => { if (active) setUser(session.user); })
            .catch(err => { if (active) setError(err.message); })
            .finally(() => { if (active) setLoading(false); });
        return () => { active = false; };
    }, []);
    const signInWithGoogle = async () => {
        AuthEvents.googleSigninClicked();
        setError(null);
        try {
            const { configured } = await apiRequest('/api/auth/config');
            if (!configured) throw new Error('Google sign-in is not configured yet.');
            window.location.assign(`${API_BASE_URL}/api/auth/google`);
        } catch (err) { setError(err.message); }
    };
    const signOut = async () => {
        try {
            await apiRequest('/api/auth/logout', { method: 'POST' });
            clearSession();
            setUser(null);
            AuthEvents.signout();
            return { error: null };
        } catch (err) { setError(err.message); return { error: err.message }; }
    };
    return <AuthContext.Provider value={{ user, loading, error, isAuthenticated: Boolean(user), signInWithGoogle, signOut }}>
        {children}
    </AuthContext.Provider>;
}
