/**
 * Authenticated API client for the StayEg frontend.
 *
 * Reads the current user's email from the Zustand persisted store
 * (localStorage) and automatically attaches it as the `x-user-email`
 * header so the backend `requireSession()` guard can verify it.
 *
 * Usage — drop-in replacement for fetch:
 *   import { authFetch } from '@/lib/api-client';
 *   const res = await authFetch('/api/bookings', { method: 'POST', body: … });
 */

const STORAGE_KEY = 'stayeg-auth-storage';

function getUserEmail(): string | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    const email = parsed?.state?.currentUser?.email;
    return typeof email === 'string' && email ? email : null;
  } catch {
    return null;
  }
}

/**
 * Wrapper around `fetch` that injects the `x-user-email` header
 * for session-based authentication on the backend.
 */
export async function authFetch(
  input: RequestInfo | URL,
  init?: RequestInit,
): Promise<Response> {
  const headers = new Headers(init?.headers);

  // Inject the user email header if we have one
  const email = getUserEmail();
  if (email && !headers.has('x-user-email')) {
    headers.set('x-user-email', email);
  }

  return fetch(input, { ...init, headers });
}
