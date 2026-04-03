import { db } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const role = searchParams.get('role');
    const pgId = searchParams.get('pgId');

    const where: Record<string, unknown> = {};
    if (role) where.role = role;

    // If pgId provided, get tenants for that PG
    if (pgId) {
      const bookings = await db.booking.findMany({
        where: { pgId, status: { in: ['ACTIVE', 'CONFIRMED'] } },
        include: {
          user: { select: { id: true, name: true, email: true, phone: true, avatar: true, gender: true } },
          bed: { select: { id: true, bedNumber: true, status: true } },
        }
      });
      return NextResponse.json(bookings);
    }

    const users = await db.user.findMany({
      where,
      select: {
        id: true, name: true, email: true, phone: true, role: true,
        avatar: true, gender: true, isVerified: true, createdAt: true,
      },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json(users);
  } catch (error) {
    console.error('GET /api/auth error:', error);
    return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const user = await db.user.create({
      data: {
        name: body.name,
        email: body.email,
        phone: body.phone,
        role: body.role || 'TENANT',
        gender: body.gender,
        isVerified: body.isVerified || false,
      }
    });
    return NextResponse.json(user, { status: 201 });
  } catch (error) {
    console.error('POST /api/auth error:', error);
    return NextResponse.json({ error: 'Failed to create user' }, { status: 500 });
  }
}
