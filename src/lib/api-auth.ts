import { NextRequest, NextResponse } from 'next/server';

// Get role from Authorization header or query param
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

// Require specific role(s)
export function requireRole(request: NextRequest, allowedRoles: string[]): NextResponse | null {
  const role = getCallerRole(request);
  if (!role || !allowedRoles.includes(role)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }
  return null;
}
