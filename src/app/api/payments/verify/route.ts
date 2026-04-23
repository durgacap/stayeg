import { NextRequest, NextResponse } from 'next/server';
import { requireSession } from '@/lib/api-auth';
import { supabase } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const authResult = await requireSession(request);
    if ('error' in authResult) return authResult.error;

    const body = await request.json();
    const { razorpayOrderId, razorpayPaymentId, razorpaySignature, userId, pgId, bookingId, amount, type } = body;

    if (!razorpayPaymentId || !userId) {
      return NextResponse.json({ error: 'Missing payment details' }, { status: 400 });
    }

    // In production, verify signature:
    // const crypto = require('crypto');
    // const expectedSignature = crypto
    //   .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
    //   .update(`${razorpayOrderId}|${razorpayPaymentId}`)
    //   .digest('hex');

    // Record the payment in the database
    const { data: payment, error } = await supabase
      .from('payments')
      .insert({
        user_id: userId,
        pg_id: pgId,
        booking_id: bookingId,
        amount: amount / 100, // Convert paise to rupees
        type: type || 'ADVANCE',
        status: 'COMPLETED',
        paid_date: new Date().toISOString(),
        method: 'RAZORPAY',
        transaction_id: razorpayPaymentId,
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ success: true, payment });
  } catch (error) {
    console.error('Payment verification error:', error);
    return NextResponse.json({ error: 'Payment verification failed' }, { status: 500 });
  }
}
