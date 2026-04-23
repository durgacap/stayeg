import { supabase } from '@/lib/supabase';
import { NextRequest, NextResponse } from 'next/server';

/** Check if Supabase error indicates a missing table (demo mode) */
function isTableMissing(msg: string): boolean {
  return msg.includes('does not exist') || msg.includes('not find') || msg.includes('PGRST205') || msg.includes('relation');
}

/** Demo users returned when Supabase tables don't exist */
const DEMO_USERS = [
  {
    id: 'demo-owner-001',
    name: 'Rajesh Kumar',
    email: 'rajesh@stayeg.in',
    phone: '+91 98765 43210',
    role: 'OWNER',
    avatar: null,
    gender: 'male',
    is_verified: true,
    city: 'Bengaluru',
    occupation: 'Property Manager',
    bio: 'Experienced PG owner managing premium accommodations in Bengaluru.',
    created_at: '2024-01-15T10:30:00.000Z',
  },
  {
    id: 'demo-tenant-001',
    name: 'Rahul Sharma',
    email: 'rahul.sharma@example.com',
    phone: '+91 87654 32109',
    role: 'TENANT',
    avatar: null,
    gender: 'male',
    is_verified: true,
    city: 'Bengaluru',
    occupation: 'Software Engineer',
    bio: 'IT professional looking for comfortable PG accommodation.',
    created_at: '2024-03-10T08:00:00.000Z',
  },
  {
    id: 'demo-tenant-002',
    name: 'Priya M.',
    email: 'priya.m@example.com',
    phone: '+91 76543 21098',
    role: 'TENANT',
    avatar: null,
    gender: 'female',
    is_verified: true,
    city: 'Bengaluru',
    occupation: 'Data Analyst',
    bio: 'Working professional preferring a clean and safe PG environment.',
    created_at: '2024-04-05T09:15:00.000Z',
  },
  {
    id: 'demo-tenant-003',
    name: 'Arjun K.',
    email: 'arjun.k@example.com',
    phone: '+91 65432 10987',
    role: 'TENANT',
    avatar: null,
    gender: 'male',
    is_verified: true,
    city: 'Bengaluru',
    occupation: 'MBA Student',
    bio: 'Student looking for affordable and well-located PG accommodation.',
    created_at: '2024-05-20T14:45:00.000Z',
  },
  {
    id: 'demo-admin-001',
    name: 'Admin User',
    email: 'admin@stayeg.in',
    phone: '+91 99999 00000',
    role: 'ADMIN',
    avatar: null,
    gender: 'male',
    is_verified: true,
    city: 'Bengaluru',
    occupation: 'Platform Administrator',
    bio: 'StayEg platform administrator managing operations.',
    created_at: '2024-01-01T00:00:00.000Z',
  },
  {
    id: 'demo-vendor-001',
    name: 'Suresh Patel',
    email: 'suresh@services.in',
    phone: '+91 54321 09876',
    role: 'VENDOR',
    avatar: null,
    gender: 'male',
    is_verified: true,
    city: 'Bengaluru',
    occupation: 'Home Services Provider',
    bio: 'Vendor providing cleaning and maintenance services for PGs.',
    created_at: '2024-02-28T11:00:00.000Z',
  },
];

/** Demo bookings returned when Supabase tables don't exist */
const DEMO_BOOKINGS = [
  {
    id: 'demo-booking-001',
    user_id: 'demo-tenant-001',
    pg_id: 'demo-pg-001',
    bed_id: 'demo-bed-001',
    status: 'ACTIVE',
    check_in: '2024-06-01',
    rent_amount: 12000,
    created_at: '2024-05-28T10:00:00.000Z',
    user: {
      id: 'demo-tenant-001',
      name: 'Rahul Sharma',
      email: 'rahul.sharma@example.com',
      phone: '+91 87654 32109',
      avatar: null,
      gender: 'male',
    },
    bed: {
      id: 'demo-bed-001',
      bed_number: 'B-101',
      status: 'OCCUPIED',
    },
  },
  {
    id: 'demo-booking-002',
    user_id: 'demo-tenant-002',
    pg_id: 'demo-pg-001',
    bed_id: 'demo-bed-002',
    status: 'ACTIVE',
    check_in: '2024-07-15',
    rent_amount: 10000,
    created_at: '2024-07-10T09:00:00.000Z',
    user: {
      id: 'demo-tenant-002',
      name: 'Priya M.',
      email: 'priya.m@example.com',
      phone: '+91 76543 21098',
      avatar: null,
      gender: 'female',
    },
    bed: {
      id: 'demo-bed-002',
      bed_number: 'B-205',
      status: 'OCCUPIED',
    },
  },
  {
    id: 'demo-booking-003',
    user_id: 'demo-tenant-003',
    pg_id: 'demo-pg-001',
    bed_id: 'demo-bed-003',
    status: 'CONFIRMED',
    check_in: '2024-08-01',
    rent_amount: 9000,
    created_at: '2024-07-25T15:30:00.000Z',
    user: {
      id: 'demo-tenant-003',
      name: 'Arjun K.',
      email: 'arjun.k@example.com',
      phone: '+91 65432 10987',
      avatar: null,
      gender: 'male',
    },
    bed: {
      id: 'demo-bed-003',
      bed_number: 'B-302',
      status: 'OCCUPIED',
    },
  },
];

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
        // Table not found → return demo users matching the lookup
        const msg = String(error.message ?? '');
        if (isTableMissing(msg)) {
          const matched = DEMO_USERS.filter((u) => {
            if (email && u.email === email) return true;
            if (phone && u.phone === phone) return true;
            return false;
          });
          return NextResponse.json({ demo: true, users: matched });
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
          const filtered = pgId
            ? DEMO_BOOKINGS.filter((b) => b.pg_id === pgId)
            : DEMO_BOOKINGS;
          return NextResponse.json({ demo: true, data: filtered });
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
        const filtered = role
          ? DEMO_USERS.filter((u) => u.role === role)
          : DEMO_USERS;
        return NextResponse.json({ demo: true, users: filtered });
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
