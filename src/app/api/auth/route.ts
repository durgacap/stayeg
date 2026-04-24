import { supabase } from '@/lib/supabase';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const role = searchParams.get('role');
    const pgId = searchParams.get('pgId');
    const email = searchParams.get('email');
    const phone = searchParams.get('phone');

    // Login lookup: fetch user by email or phone
    if (email || phone) {
      let query = supabase
        .from('users')
        .select('id,name,email,phone,role,avatar,gender,is_verified,is_approved,city,occupation,bio,created_at');

      if (email) query = query.eq('email', email);
      if (phone) query = query.eq('phone', phone);

      const { data: users, error } = await query.limit(1);

      if (error) {
        console.error('GET /api/auth lookup error:', error.message);
        return NextResponse.json({ error: 'Failed to look up user' }, { status: 500 });
      }

      if (!users || users.length === 0) {
        return NextResponse.json({ users: [] });
      }

      return NextResponse.json({ users });
    }

    // If pgId provided, get tenants for that PG
    if (pgId) {
      const { data: bookings, error } = await supabase
        .from('bookings')
        .select('*, user:users(id,name,email,phone,avatar,gender), bed:beds(id,bed_number,status)')
        .in('status', ['ACTIVE', 'CONFIRMED'])
        .eq('pg_id', pgId);

      if (error) {
        console.error('GET /api/auth tenants error:', error.message);
        return NextResponse.json({ error: 'Failed to fetch PG tenants' }, { status: 500 });
      }

      return NextResponse.json({ data: bookings || [] });
    }

    // List all users (admin view)
    let query = supabase
      .from('users')
      .select('id,name,email,phone,role,avatar,gender,is_verified,created_at')
      .order('created_at', { ascending: false });

    if (role) query = query.eq('role', role);

    const { data: users, error } = await query;
    if (error) {
      console.error('GET /api/auth list error:', error.message);
      return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 });
    }

    return NextResponse.json({ users: users || [] });
  } catch (error) {
    console.error('GET /api/auth error:', error);
    return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, phone, role, gender, bio, city, occupation } = body;

    // Validate required fields
    if (!name || !email) {
      return NextResponse.json(
        { error: 'Name and email are required' },
        { status: 400 }
      );
    }

    // Check for duplicate email
    const { data: existingUser, error: checkError } = await supabase
      .from('users')
      .select('id')
      .eq('email', email)
      .limit(1);

    if (checkError) {
      console.error('POST /api/auth duplicate check error:', checkError.message);
      return NextResponse.json({ error: 'Failed to create user' }, { status: 500 });
    }

    if (existingUser && existingUser.length > 0) {
      return NextResponse.json(
        { error: 'An account with this email already exists' },
        { status: 409 }
      );
    }

    // Check for duplicate phone
    if (phone) {
      const { data: existingPhone } = await supabase
        .from('users')
        .select('id')
        .eq('phone', phone)
        .limit(1);

      if (existingPhone && existingPhone.length > 0) {
        return NextResponse.json(
          { error: 'An account with this phone number already exists' },
          { status: 409 }
        );
      }
    }

    // Create user — OWNER role requires admin approval
    const isApproved = (role || 'TENANT') === 'OWNER' ? false : true;
    const { data: user, error } = await supabase
      .from('users')
      .insert({
        name,
        email,
        phone: phone || null,
        role: role || 'TENANT',
        gender: gender || null,
        is_verified: isApproved,
        is_approved: isApproved,
        bio: bio || null,
        city: city || null,
        occupation: occupation || null,
      })
      .select()
      .single();

    if (error) {
      console.error('POST /api/auth insert error:', error.message);
      return NextResponse.json({ error: 'Failed to create user' }, { status: 500 });
    }

    return NextResponse.json({ user }, { status: 201 });
  } catch (error) {
    console.error('POST /api/auth error:', error);
    return NextResponse.json({ error: 'Failed to create user' }, { status: 500 });
  }
}
