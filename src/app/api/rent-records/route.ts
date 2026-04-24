import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET /api/rent-records?tenantId=...&pgId=...&ownerId=...&month=...&status=...
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const tenantId = searchParams.get('tenantId');
    const pgId = searchParams.get('pgId');
    const ownerId = searchParams.get('ownerId');
    const month = searchParams.get('month');
    const status = searchParams.get('status');

    if (!tenantId && !pgId && !ownerId) {
      return NextResponse.json({ error: 'tenantId, pgId, or ownerId required' }, { status: 400 });
    }

    const where: Record<string, unknown> = {};
    if (tenantId) where.tenantId = tenantId;
    if (month) where.month = month;
    if (status) where.status = status;

    if (pgId || ownerId) {
      where.tenant = {};
      if (pgId) (where.tenant as Record<string, unknown>).pgId = pgId;
      if (ownerId) (where.tenant as Record<string, unknown>).ownerId = ownerId;
    }

    const records = await db.rentRecord.findMany({
      where,
      include: {
        tenant: {
          select: { id: true, name: true, phone: true, pg: { select: { name: true } }, room: { select: { roomCode: true } }, bed: { select: { bedNumber: true } } },
        },
      },
      orderBy: [{ month: 'desc' }, { createdAt: 'desc' }],
    });

    return NextResponse.json(records);
  } catch (error) {
    console.error('GET /api/rent-records error:', error);
    return NextResponse.json({ error: 'Failed to fetch rent records' }, { status: 500 });
  }
}

// POST /api/rent-records — Create rent record
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { tenantId, month, amount, status, method, notes } = body;

    if (!tenantId || !month || !amount) {
      return NextResponse.json({ error: 'tenantId, month, amount required' }, { status: 400 });
    }

    // Check for existing record
    const existing = await db.rentRecord.findFirst({ where: { tenantId, month } });
    if (existing) {
      return NextResponse.json({ error: 'Rent record already exists for this month' }, { status: 409 });
    }

    const tenant = await db.tenant.findUnique({ where: { id: tenantId } });
    if (!tenant) {
      return NextResponse.json({ error: 'Tenant not found' }, { status: 404 });
    }

    const record = await db.rentRecord.create({
      data: {
        tenantId,
        month,
        amount,
        status: status || 'PENDING',
        method: method || null,
        notes: notes || null,
        paidDate: status === 'PAID' ? new Date() : null,
      },
      include: {
        tenant: { select: { id: true, name: true } },
      },
    });

    if (status === 'PAID') {
      try {
        await db.activityLog.create({
          data: {
            ownerId: tenant.ownerId,
            action: 'PAYMENT_COLLECTED',
            description: `Collected ₹${amount} rent from "${tenant.name}" for ${month}`,
            metadata: JSON.stringify({ tenantId, month, amount, method }),
          },
        });
      } catch { /* ignore */ }
    }

    return NextResponse.json(record, { status: 201 });
  } catch (error) {
    console.error('POST /api/rent-records error:', error);
    return NextResponse.json({ error: 'Failed to create rent record' }, { status: 500 });
  }
}

// PUT /api/rent-records — Update rent record (mark as paid)
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, status, method, notes } = body;

    if (!id) {
      return NextResponse.json({ error: 'Record id required' }, { status: 400 });
    }

    const existing = await db.rentRecord.findUnique({ where: { id }, include: { tenant: true } });
    if (!existing) {
      return NextResponse.json({ error: 'Rent record not found' }, { status: 404 });
    }

    const updated = await db.rentRecord.update({
      where: { id },
      data: {
        ...(status ? { status } : {}),
        ...(method ? { method } : {}),
        ...(notes !== undefined ? { notes: notes || null } : {}),
        ...(status === 'PAID' ? { paidDate: new Date() } : {}),
      },
      include: {
        tenant: { select: { id: true, name: true, ownerId: true } },
      },
    });

    if (status === 'PAID' && existing.status !== 'PAID') {
      try {
        await db.activityLog.create({
          data: {
            ownerId: existing.tenant.ownerId,
            action: 'PAYMENT_COLLECTED',
            description: `Collected ₹${existing.amount} rent from "${existing.tenant.name}" for ${existing.month}`,
            metadata: JSON.stringify({ recordId: id, month: existing.month, amount: existing.amount, method }),
          },
        });
      } catch { /* ignore */ }
    }

    return NextResponse.json(updated);
  } catch (error) {
    console.error('PUT /api/rent-records error:', error);
    return NextResponse.json({ error: 'Failed to update rent record' }, { status: 500 });
  }
}
