/**
 * API route auth middleware — StayEg v2 (JWT-based + role enforcement).
 * 
 * Supports TWO auth modes for backward compatibility:
 * 1. JWT Bearer token (preferred) — Authorization: Bearer <token>
 * 2. Legacy email header — x-user-email (for gradual migration)
 */

import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { verifyToken, extractToken, type TokenPayload } from '@/lib/jwt';

// ============================
// Types
// ============================

export interface AuthenticatedUser {
  id: string;
  email: string;
  role: string;
  is_verified?: boolean;
  is_approved?: boolean;
  name?: string;
}

export type AuthResult =
  | { error: NextResponse }
  | { user: AuthenticatedUser };

// ============================
// Legacy helpers (kept for backward compat)
// ============================

/** Get role from Authorization header or query param (legacy) */
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
// JWT-based auth (v2 — primary)
// ============================

/**
 * Authenticate a request using JWT Bearer token (preferred)
 * Falls back to x-user-email header for backward compatibility.
 * 
 * Returns the authenticated user or an error response.
 */
export async function requireSession(
  request: NextRequest
): Promise<AuthResult> {
  // --- Try JWT Bearer token first ---
  const authHeader = request.headers.get('authorization');
  const token = extractToken(authHeader);

  if (token) {
    const payload: TokenPayload | null = verifyToken(token);
    if (payload) {
      // Fetch latest user data from DB to get is_approved, is_verified etc.
      const { data: user, error } = await supabase
        .from('users')
        .select('id, email, role, is_verified, is_approved, name')
        .eq('id', payload.userId)
        .limit(1)
        .single();

      if (!error && user) {
        return {
          user: {
            id: user.id,
            email: user.email,
            role: user.role,
            is_verified: user.is_verified,
            is_approved: user.is_approved,
            name: user.name,
          },
        };
      }
    }
    // Token invalid or user not found → fall through to legacy check
  }

  // --- Legacy fallback: x-user-email header ---
  const userEmail = request.headers.get('x-user-email');

  if (userEmail) {
    const { data: user, error } = await supabase
      .from('users')
      .select('id, email, role, is_verified, is_approved, name')
      .eq('email', userEmail)
      .limit(1)
      .single();

    if (!error && user) {
      return {
        user: {
          id: user.id,
          email: user.email,
          role: user.role,
          is_verified: user.is_verified,
          is_approved: user.is_approved,
          name: user.name,
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

  return {
    error: NextResponse.json(
      { error: 'Authentication required: missing token or user identity' },
      { status: 401 }
    ),
  };
}

/**
 * Authenticate + enforce role check.
 * Returns error if user doesn't have one of the allowed roles.
 */
export async function requireSessionWithRole(
  request: NextRequest,
  allowedRoles: string[]
): Promise<AuthResult> {
  const result = await requireSession(request);

  if ('error' in result) return result;

  if (!allowedRoles.includes(result.user.role)) {
    return {
      error: NextResponse.json(
        { error: `Forbidden: requires ${allowedRoles.join(' or ')} role` },
        { status: 403 }
      ),
    };
  }

  return result;
}

/**
 * Authenticate + ensure user owns the requested resource.
 * Checks that the authenticated user's ID matches the provided ownerId.
 */
export async function requireResourceOwner(
  request: NextRequest,
  ownerId: string
): Promise<AuthResult> {
  const result = await requireSession(request);

  if ('error' in result) return result;

  // Admin can access any resource
  if (result.user.role === 'ADMIN') return result;

  if (result.user.id !== ownerId) {
    return {
      error: NextResponse.json(
        { error: 'Forbidden: you do not own this resource' },
        { status: 403 }
      ),
    };
  }

  return result;
}
