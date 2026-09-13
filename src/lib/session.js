export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3002';
let csrfToken = null;
let pending = null;
export async function loadSession() {
    if (!pending) pending = fetch(`${API_BASE_URL}/api/auth/session`, { credentials: 'include', cache: 'no-store' })
        .then(async response => {
            if (!response.ok) throw new Error('Sign-in is temporarily unavailable');
            const session = await response.json();
            csrfToken = session.csrfToken;
            return session;
        }).finally(() => { pending = null; });
    return pending;
}
export async function getRequestToken() {
    if (!csrfToken) await loadSession();
    return csrfToken;
}
export function clearSession() { csrfToken = null; }
