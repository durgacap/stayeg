import { NextRequest, NextResponse } from 'next/server';
import { requireSession } from '@/lib/api-auth';
import { supabase, isTableMissing } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const authResult = await requireSession(request);
    if ('error' in authResult) return authResult.error;

    const body = await request.json();
    const { amount, pgId, bedId, bookingId, userId, type } = body;

    if (!amount || !userId) {
      return NextResponse.json({ error: 'Amount and userId are required' }, { status: 400 });
    }

    // Razorpay order creation
    // In production, you'd call Razorpay API here:
    // const order = await fetch('https://api.razorpay.com/v1/orders', {
    //   method: 'POST',
    //   headers: {
    //     'Content-Type': 'application/json',
    //     'Authorization': `Basic ${Buffer.from(`${process.env.RAZORPAY_KEY_ID}:${process.env.RAZORPAY_KEY_SECRET}`).toString('base64')}`,
    //   },
    //   body: JSON.stringify({
    //     amount: amount * 100, // Razorpay expects paise
    //     currency: 'INR',
    //     receipt: `rcpt_${Date.now()}`,
    //   }),
    // });

    // For now, create a simulated order
    const orderId = `order_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;

    return NextResponse.json({
      orderId,
      amount: amount * 100, // in paise
      currency: 'INR',
      key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || 'rzp_test_1234567890',
      name: 'StayEg',
      description: type === 'RENT' ? 'Monthly Rent Payment' : type === 'ADVANCE' ? 'Booking Advance' : type === 'SECURITY_DEPOSIT' ? 'Security Deposit' : 'Payment',
      prefill: {
        name: body.userName || '',
        email: body.userEmail || '',
        contact: body.userPhone || '',
      },
      theme: {
        color: '#1D4ED8',
      },
    });
  } catch (error) {
    console.error('Razorpay order error:', error);
    return NextResponse.json({ error: 'Failed to create payment order' }, { status: 500 });
  }
}
