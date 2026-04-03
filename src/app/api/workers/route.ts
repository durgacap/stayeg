import { db } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const pgId = searchParams.get('pgId');
    const role = searchParams.get('role');

    const where: Record<string, unknown> = {};
    if (pgId) where.pgId = pgId;
    if (role) where.role = role;

    const workers = await db.worker.findMany({ where, orderBy: { role: 'asc' } });
    return NextResponse.json(workers);
  } catch (error) {
    console.error('GET /api/workers error:', error);
    return NextResponse.json({ error: 'Failed to fetch workers' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const worker = await db.worker.create({
      data: {
        name: body.name,
        role: body.role,
        phone: body.phone,
        pgId: body.pgId,
        shift: body.shift,
      }
    });
    return NextResponse.json(worker, { status: 201 });
  } catch (error) {
    console.error('POST /api/workers error:', error);
    return NextResponse.json({ error: 'Failed to create worker' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, ...data } = body;

    if (!id) {
      return NextResponse.json({ error: 'id is required' }, { status: 400 });
    }

    const worker = await db.worker.update({
      where: { id },
      data: {
        ...(data.name !== undefined && { name: data.name }),
        ...(data.role !== undefined && { role: data.role }),
        ...(data.phone !== undefined && { phone: data.phone }),
        ...(data.shift !== undefined && { shift: data.shift }),
        ...(data.status !== undefined && { status: data.status }),
        ...(data.pgId !== undefined && { pgId: data.pgId }),
      }
    });
    return NextResponse.json(worker);
  } catch (error) {
    console.error('PUT /api/workers error:', error);
    return NextResponse.json({ error: 'Failed to update worker' }, { status: 500 });
  }
}
