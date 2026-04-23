import { supabase, isTableMissing } from '@/lib/supabase';
import { NextRequest, NextResponse } from 'next/server';
import { requireSession } from '@/lib/api-auth';

const DEMO_PAYMENTS = [
  { id: 'demo-pay-1', user_id: 'demo-tenant-001', pg_id: 'demo-pg-1', booking_id: 'demo-booking-1', amount: 8500, type: 'RENT', status: 'COMPLETED', method: 'UPI', paid_date: '2025-06-01T10:00:00Z', created_at: '2025-06-01T10:00:00Z', user: { id: 'demo-tenant-001', name: 'Rahul Sharma', email: 'rahul.sharma@example.com' }, pg: { id: 'demo-pg-1', name: 'CozyStay PG' } },
  { id: 'demo-pay-2', user_id: 'demo-tenant-001', pg_id: 'demo-pg-1', booking_id: 'demo-booking-1', amount: 8500, type: 'RENT', status: 'COMPLETED', method: 'UPI', paid_date: '2025-05-01T10:00:00Z', created_at: '2025-05-01T10:00:00Z', user: { id: 'demo-tenant-001', name: 'Rahul Sharma', email: 'rahul.sharma@example.com' }, pg: { id: 'demo-pg-1', name: 'CozyStay PG' } },
  { id: 'demo-pay-3', user_id: 'demo-tenant-002', pg_id: 'demo-pg-3', booking_id: 'demo-booking-2', amount: 9000, type: 'RENT', status: 'COMPLETED', method: 'CREDIT_CARD', paid_date: '2025-06-01T10:00:00Z', created_at: '2025-06-01T10:00:00Z', user: { id: 'demo-tenant-002', name: 'Priya M.', email: 'priya.m@example.com' }, pg: { id: 'demo-pg-3', name: 'Sunrise Ladies PG' } },
  { id: 'demo-pay-4', user_id: 'demo-tenant-002', pg_id: 'demo-pg-3', booking_id: 'demo-booking-2', amount: 9000, type: 'RENT', status: 'PENDING', due_date: '2025-07-01T10:00:00Z', created_at: '2025-06-15T10:00:00Z', user: { id: 'demo-tenant-002', name: 'Priya M.', email: 'priya.m@example.com' }, pg: { id: 'demo-pg-3', name: 'Sunrise Ladies PG' } },
  { id: 'demo-pay-5', user_id: 'demo-tenant-003', pg_id: 'demo-pg-2', booking_id: 'demo-booking-3', amount: 7000, type: 'RENT', status: 'COMPLETED', method: 'NET_BANKING', paid_date: '2025-06-01T10:00:00Z', created_at: '2025-06-01T10:00:00Z', user: { id: 'demo-tenant-003', name: 'Arjun K.', email: 'arjun.k@example.com' }, pg: { id: 'demo-pg-2', name: 'Green Valley PG' } },
  { id: 'demo-pay-6', user_id: 'demo-tenant-001', pg_id: 'demo-pg-1', booking_id: 'demo-booking-1', amount: 8500, type: 'RENT', status: 'PENDING', due_date: '2025-07-01T10:00:00Z', created_at: '2025-06-20T10:00:00Z', user: { id: 'demo-tenant-001', name: 'Rahul Sharma', email: 'rahul.sharma@example.com' }, pg: { id: 'demo-pg-1', name: 'CozyStay PG' } },
];

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const pgId = searchParams.get('pgId');
    const status = searchParams.get('status');

    let query = supabase
      .from('payments')
      .select('*, pg:pgs(id,name), user:users(id,name,email,phone,avatar)')
      .order('created_at', { ascending: false });

    if (userId) query = query.eq('user_id', userId);
    if (pgId) query = query.eq('pg_id', pgId);
    if (status) query = query.eq('status', status);

    const { data: payments, error } = await query;
    if (error) {
      if (isTableMissing(error)) {
        let filtered = [...DEMO_PAYMENTS];
        if (userId) filtered = filtered.filter((p) => p.user_id === userId);
        if (pgId) filtered = filtered.filter((p) => p.pg_id === pgId);
        if (status) filtered = filtered.filter((p) => p.status === status);
        return NextResponse.json(filtered);
      }
      throw error;
    }

    return NextResponse.json(payments || []);
  } catch (error) {
    console.error('Error fetching payments:', error);
    return NextResponse.json({ error: 'Failed to fetch payments' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    // Auth guard: verify user session before creating payment
    const authResult = await requireSession(request);
    if ('error' in authResult) return authResult.error;

    const body = await request.json();
    const { userId, pgId, bookingId, amount, type, method } = body;

    if (!userId || !pgId || !amount) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const { data: payment, error } = await supabase
      .from('payments')
      .insert({
        user_id: userId,
        pg_id: pgId,
        booking_id: bookingId,
        amount,
        type: type || 'RENT',
        method: method || 'UPI',
        status: 'COMPLETED',
        paid_date: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json(payment, { status: 201 });
  } catch (error) {
    console.error('Error creating payment:', error);
    return NextResponse.json({ error: 'Failed to create payment' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    // Auth guard: verify user session before updating payment
    const authResult = await requireSession(request);
    if ('error' in authResult) return authResult.error;

    const body = await request.json();
    const { id, status, paidDate, method } = body;
    if (!id) {
      return NextResponse.json({ error: 'id is required' }, { status: 400 });
    }
    const updateData: Record<string, unknown> = {};
    if (status) updateData.status = status;
    if (paidDate) updateData.paid_date = new Date(paidDate).toISOString();
    if (method) updateData.method = method;
    if (status === 'COMPLETED' && !paidDate) updateData.paid_date = new Date().toISOString();

    const { data: payment, error } = await supabase
      .from('payments')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json(payment);
  } catch (error) {
    console.error('Error updating payment:', error);
    return NextResponse.json({ error: 'Failed to update payment' }, { status: 500 });
  }
}
