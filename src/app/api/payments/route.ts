import { db } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const pgId = searchParams.get('pgId');
    const status = searchParams.get('status');

    const where: Record<string, unknown> = {};
    if (userId) where.userId = userId;
    if (pgId) where.pgId = pgId;
    if (status) where.status = status;

    const payments = await db.payment.findMany({
      where,
      include: {
        pg: {
          select: { id: true, name: true },
        },
        user: {
          select: { id: true, name: true, email: true, phone: true, avatar: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(payments);
  } catch (error) {
    console.error('Error fetching payments:', error);
    return NextResponse.json({ error: 'Failed to fetch payments' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, pgId, bookingId, amount, type, method } = body;

    if (!userId || !pgId || !amount) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const payment = await db.payment.create({
      data: {
        userId,
        pgId,
        bookingId,
        amount,
        type: type || 'RENT',
        method: method || 'UPI',
        status: 'COMPLETED',
        paidDate: new Date(),
      },
    });

    return NextResponse.json(payment, { status: 201 });
  } catch (error) {
    console.error('Error creating payment:', error);
    return NextResponse.json({ error: 'Failed to create payment' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, status, paidDate, method } = body;
    if (!id) {
      return NextResponse.json({ error: 'id is required' }, { status: 400 });
    }
    const updateData: Record<string, unknown> = {};
    if (status) updateData.status = status;
    if (paidDate) updateData.paidDate = new Date(paidDate);
    if (method) updateData.method = method;
    if (status === 'COMPLETED' && !paidDate) updateData.paidDate = new Date();
    const payment = await db.payment.update({ where: { id }, data: updateData });
    return NextResponse.json(payment);
  } catch (error) {
    console.error('Error updating payment:', error);
    return NextResponse.json({ error: 'Failed to update payment' }, { status: 500 });
  }
}
