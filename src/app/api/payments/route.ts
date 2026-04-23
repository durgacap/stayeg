import { supabase, isTableMissing } from '@/lib/supabase';
import { NextRequest, NextResponse } from 'next/server';
import { requireSession } from '@/lib/api-auth';

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
      if (isTableMissing(error)) return NextResponse.json([]);
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
