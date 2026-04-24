import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// ============================
// API route auth middleware
// ============================

/** Get role from Authorization header or query param (legacy, kept for backwards compat) */
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

/** Require authentication — returns 401 if no role found (legacy header-based) */
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
 *  Returns the error response if auth fails, or the authenticated user object if auth succeeds. */
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
    return {
      error: NextResponse.json(
        { error: 'Authentication failed: user not found' },
        { status: 401 }
      ),
    };
  }

  return { user };
}
