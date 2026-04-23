import { supabase } from '@/lib/supabase';
import { NextRequest, NextResponse } from 'next/server';

/** Check if Supabase error indicates a missing table (demo mode) */
function isTableMissing(msg: string): boolean {
  return msg.includes('does not exist') || msg.includes('not find') || msg.includes('PGRST205') || msg.includes('relation');
}

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
        .select('id,name,email,phone,role,avatar,gender,is_verified,city,occupation,bio,created_at');

      if (email) query = query.eq('email', email);
      if (phone) query = query.eq('phone', phone);

      const { data: users, error } = await query.limit(1);

      if (error) {
        // Table not found → return demo mode indicator
        const msg = String(error.message ?? '');
        if (isTableMissing(msg)) {
          return NextResponse.json({ demo: true, users: [] });
        }
        throw error;
      }

      return NextResponse.json({ demo: false, users: users || [] });
    }

    // If pgId provided, get tenants for that PG
    if (pgId) {
      const { data: bookings, error } = await supabase
        .from('bookings')
        .select('*, user:users(id,name,email,phone,avatar,gender), bed:beds(id,bed_number,status)')
        .in('status', ['ACTIVE', 'CONFIRMED'])
        .eq('pg_id', pgId);

      if (error) {
        const msg = String(error.message ?? '');
        if (isTableMissing(msg)) {
          return NextResponse.json({ demo: true, data: [] });
        }
        throw error;
      }
      return NextResponse.json({ demo: false, data: bookings || [] });
    }

    // List all users (admin view)
    let query = supabase
      .from('users')
      .select('id,name,email,phone,role,avatar,gender,is_verified,created_at')
      .order('created_at', { ascending: false });

    if (role) query = query.eq('role', role);

    const { data: users, error } = await query;
    if (error) {
      const msg = String(error.message ?? '');
      if (isTableMissing(msg)) {
        return NextResponse.json({ demo: true, users: [] });
      }
      throw error;
    }

    return NextResponse.json({ demo: false, users: users || [] });
  } catch (error) {
    console.error('GET /api/auth error:', error);
    return NextResponse.json({ error: 'Failed to fetch users', demo: true }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, phone, role, gender, password, bio, city, occupation, avatarUrl } = body;

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
      const msg = String(checkError.message ?? '');
      if (isTableMissing(msg)) {
        // Table not found → demo mode
        return NextResponse.json({
          demo: true,
          user: {
            id: `user-${Date.now()}`,
            name,
            email,
            phone: phone || '',
            role: role || 'TENANT',
            gender: gender || '',
            is_verified: false,
            created_at: new Date().toISOString(),
          },
        }, { status: 201 });
      }
      throw checkError;
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

    // Create user
    const { data: user, error } = await supabase
      .from('users')
      .insert({
        name,
        email,
        phone: phone || '',
        role: role || 'TENANT',
        gender: gender || null,
        is_verified: false,
        bio: bio || null,
        city: city || null,
        occupation: occupation || null,
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ demo: false, user }, { status: 201 });
  } catch (error) {
    console.error('POST /api/auth error:', error);
    return NextResponse.json({ error: 'Failed to create user', demo: true }, { status: 500 });
  }
}
