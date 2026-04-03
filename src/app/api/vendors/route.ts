import { db } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const type = searchParams.get('type');
    const city = searchParams.get('city');

    const where: Record<string, unknown> = {};
    if (type) where.type = type;
    if (city) where.city = city;

    const vendors = await db.vendor.findMany({ where, orderBy: { rating: 'desc' } });
    return NextResponse.json(vendors);
  } catch (error) {
    console.error('GET /api/vendors error:', error);
    return NextResponse.json({ error: 'Failed to fetch vendors' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    if (!body.name || !body.type || !body.phone) {
      return NextResponse.json({ error: 'name, type, and phone are required' }, { status: 400 });
    }

    const vendor = await db.vendor.create({
      data: {
        name: body.name,
        type: body.type,
        phone: body.phone,
        email: body.email,
        city: body.city || 'Bangalore',
        area: body.area,
      }
    });
    return NextResponse.json(vendor, { status: 201 });
  } catch (error) {
    console.error('POST /api/vendors error:', error);
    return NextResponse.json({ error: 'Failed to create vendor' }, { status: 500 });
  }
}
