import { NextRequest, NextResponse } from 'next/server';
import type { UserRole, User } from '@/lib/types';
import { supabase, isTableMissing } from '@/lib/supabase';

// ============================
// Session helpers (client-side localStorage)
// ============================

const STORAGE_KEY = 'stayeg-auth-storage';

interface PersistedAuth {
  state?: {
    isLoggedIn?: boolean;
    currentUser?: User | null;
    currentRole?: UserRole;
    isGuest?: boolean;
  };
}

/** Get the current session from localStorage (client-side only) */
export function getSession(): { user: User | null; role: UserRole | null; isLoggedIn: boolean } {
  if (typeof window === 'undefined') {
    return { user: null, role: null, isLoggedIn: false };
  }
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { user: null, role: null, isLoggedIn: false };
    const parsed: PersistedAuth = JSON.parse(raw);
    const s = parsed.state;
    return {
      user: s?.currentUser ?? null,
      role: s?.currentRole ?? null,
      isLoggedIn: s?.isLoggedIn ?? false,
    };
  } catch {
    return { user: null, role: null, isLoggedIn: false };
  }
}

// ============================
// API route auth middleware
// ============================

/** Get role from Authorization header or query param */
export function getCallerRole(request: NextRequest): string | null {
  const authHeader = request.headers.get('authorization');
  if (authHeader?.startsWith('Bearer ')) {
    try {
      const payload = JSON.parse(atob(authHeader.split('.')[1]));
      return payload.role || null;
    } catch { return null; }
  }
  const role = request.nextUrl.searchParams.get('role');
  return role || null;
}

/** Require authentication — returns 403 if no role found */
export function requireAuth(request: NextRequest): NextResponse | null {
  const role = getCallerRole(request);
  if (!role) {
    return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
  }
  return null;
}

/** Require specific role(s) — returns 403 if role doesn't match */
export function requireRole(request: NextRequest, allowedRoles: string[]): NextResponse | null {
  const role = getCallerRole(request);
  if (!role) {
    return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
  }
  if (!allowedRoles.includes(role)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }
  return null;
}

// ============================
// Admin secret validation
// ============================

/** Validate admin secret from x-admin-secret header */
export function requireAdminSecret(request: NextRequest): NextResponse | null {
  const ADMIN_SECRET = process.env.ADMIN_SECRET || 'stayeg-v1.2-secure-2025';
  const providedSecret = request.headers.get('x-admin-secret');
  if (!providedSecret || providedSecret !== ADMIN_SECRET) {
    return NextResponse.json(
      { error: 'Forbidden: Invalid or missing admin secret' },
      { status: 401 }
    );
  }
  return null;
}

// ============================
// Session-based auth (x-user-email + DB verification)
// ============================

/** Verify user session by checking x-user-email header against the database.
 *  Returns the error response if auth fails, or null if auth succeeds.
 *  The authenticated user object is optionally returned via the user reference. */
export async function requireSession(
  request: NextRequest
): Promise<{ error: NextResponse } | { user: Record<string, unknown> }> {
  const userEmail = request.headers.get('x-user-email');

  if (!userEmail) {
    return {
      error: NextResponse.json(
        { error: 'Authentication required: missing user identity' },
        { status: 401 }
      ),
    };
  }

  // Verify user exists in the database
  const { data: user, error } = await supabase
    .from('users')
    .select('id, email, role, is_verified')
    .eq('email', userEmail)
    .limit(1)
    .single();

  if (error || !user) {
    // If Supabase tables don't exist (demo mode), create a demo user
    if (error && isTableMissing(error)) {
      return {
        user: {
          id: `demo-${Date.now()}`,
          email: userEmail,
          role: 'TENANT',
          is_verified: false,
        },
      };
    }

    return {
      error: NextResponse.json(
        { error: 'Authentication failed: user not found' },
        { status: 401 }
      ),
    };
  }

  return { user };
}
