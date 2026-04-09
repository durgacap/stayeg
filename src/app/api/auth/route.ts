import { supabase } from '@/lib/supabase';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const role = searchParams.get('role');
    const pgId = searchParams.get('pgId');

    // If pgId provided, get tenants for that PG
    if (pgId) {
      const { data: bookings, error } = await supabase
        .from('bookings')
        .select('*, user:users(id,name,email,phone,avatar,gender), bed:beds(id,bed_number,status)')
        .in('status', ['ACTIVE', 'CONFIRMED'])
        .eq('pg_id', pgId);

      if (error) throw error;
      return NextResponse.json(bookings || []);
    }

    let query = supabase
      .from('users')
      .select('id,name,email,phone,role,avatar,gender,is_verified,created_at')
      .order('created_at', { ascending: false });

    if (role) query = query.eq('role', role);

    const { data: users, error } = await query;
    if (error) throw error;

    return NextResponse.json(users || []);
  } catch (error) {
    console.error('GET /api/auth error:', error);
    return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { data: user, error } = await supabase
      .from('users')
      .insert({
        name: body.name,
        email: body.email,
        phone: body.phone,
        role: body.role || 'TENANT',
        gender: body.gender,
        is_verified: body.isVerified || false,
      })
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json(user, { status: 201 });
  } catch (error) {
    console.error('POST /api/auth error:', error);
    return NextResponse.json({ error: 'Failed to create user' }, { status: 500 });
  }
}
