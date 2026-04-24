/**
 * JWT token utility for StayEg authentication.
 * Uses jsonwebtoken for signing and verifying tokens.
 *
 * SECURITY NOTE: JWT_SECRET must be set via environment variables.
 * Never hardcode secrets in source code — this is a critical production
 * security requirement. Tokens signed with a leaked secret allow
 * arbitrary impersonation of any user.
 */

import jwt from 'jsonwebtoken';

const _jwtSecret = process.env.JWT_SECRET;
if (!_jwtSecret) {
  throw new Error(
    'JWT_SECRET environment variable is not set. ' +
    'This is required for authentication. Set it in .env.local.'
  );
}
const JWT_SECRET: string = _jwtSecret;

const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

export interface TokenPayload {
  userId: string;
  email: string;
  role: string;
  iat?: number;
  exp?: number;
}

/**
 * Generate a JWT token for a user session.
 */
export function signToken(payload: Omit<TokenPayload, 'iat' | 'exp'>): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN as any });
}

/**
 * Verify a JWT token and return the decoded payload.
 * Returns null if the token is invalid or expired.
 */
export function verifyToken(token: string): TokenPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as TokenPayload;
  } catch {
    return null;
  }
}

/**
 * Extract JWT token from Authorization header.
 * Supports "Bearer <token>" format.
 */
export function extractToken(authHeader: string | null): string | null {
  if (!authHeader) return null;
  if (authHeader.startsWith('Bearer ')) {
    return authHeader.slice(7).trim();
  }
  return authHeader.trim();
}
