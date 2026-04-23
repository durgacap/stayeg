import { supabase, isTableMissing } from '@/lib/supabase';
import { NextRequest, NextResponse } from 'next/server';
import { requireSession } from '@/lib/api-auth';

const DEMO_BOOKINGS = [
  { id: 'demo-booking-1', user_id: 'demo-tenant-001', pg_id: 'demo-pg-1', bed_id: 'demo-bed-2', check_in_date: '2025-01-15', advance_paid: 8500, status: 'ACTIVE', created_at: '2025-01-15T10:00:00Z', user: { id: 'demo-tenant-001', name: 'Rahul Sharma', email: 'rahul.sharma@example.com', phone: '+91 98765 43210', avatar: 'https://api.dicebear.com/9.x/avataaars/svg?seed=Rahul' }, pg: { id: 'demo-pg-1', name: 'CozyStay PG', address: '42, 4th Cross, Koramangala', city: 'Bangalore', images: 'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=600&h=400&fit=crop' }, bed: { id: 'demo-bed-2', bed_number: 2, status: 'OCCUPIED', room: { room_code: 'A101', room_type: 'DOUBLE', floor: 1 } } },
  { id: 'demo-booking-2', user_id: 'demo-tenant-002', pg_id: 'demo-pg-3', bed_id: 'demo-bed-11', check_in_date: '2025-02-01', advance_paid: 9000, status: 'ACTIVE', created_at: '2025-02-01T10:00:00Z', user: { id: 'demo-tenant-002', name: 'Priya M.', email: 'priya.m@example.com', phone: '+91 98765 43213', avatar: 'https://api.dicebear.com/9.x/avataaars/svg?seed=Priya' }, pg: { id: 'demo-pg-3', name: 'Sunrise Ladies PG', address: '78, Indiranagar 2nd Stage', city: 'Bangalore', images: 'https://images.unsplash.com/photo-1578683010236-d716f9a3f461?w=600&h=400&fit=crop' }, bed: { id: 'demo-bed-11', bed_number: 1, status: 'OCCUPIED', room: { room_code: 'C102', room_type: 'DOUBLE', floor: 1 } } },
  { id: 'demo-booking-3', user_id: 'demo-tenant-003', pg_id: 'demo-pg-2', bed_id: 'demo-bed-6', check_in_date: '2024-12-01', advance_paid: 7000, status: 'ACTIVE', created_at: '2024-12-01T10:00:00Z', user: { id: 'demo-tenant-003', name: 'Arjun K.', email: 'arjun.k@example.com', phone: '+91 98765 43214', avatar: 'https://api.dicebear.com/9.x/avataaars/svg?seed=Arjun' }, pg: { id: 'demo-pg-2', name: 'Green Valley PG', address: '15, HSR Layout Sector 2', city: 'Bangalore', images: 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=600&h=400&fit=crop' }, bed: { id: 'demo-bed-6', bed_number: 1, status: 'OCCUPIED', room: { room_code: 'B201', room_type: 'DORMITORY', floor: 2 } } },
];

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const pgId = searchParams.get('pgId');

    if (!userId && !pgId) {
      return NextResponse.json({ error: 'userId or pgId is required' }, { status: 400 });
    }

    let query = supabase
      .from('bookings')
      .select('*, pg:pgs(id,name,address,city,images), bed:beds(*, room:rooms(room_code,room_type,floor)), user:users(id,name,email,phone,avatar), payments:payments(*)')
      .order('created_at', { ascending: false });

    if (userId) query = query.eq('user_id', userId);
    if (pgId) query = query.eq('pg_id', pgId);

    const { data: bookings, error } = await query;
    if (error) {
      if (isTableMissing(error)) {
        let filtered = [...DEMO_BOOKINGS];
        if (userId) filtered = filtered.filter((b) => b.user_id === userId);
        if (pgId) filtered = filtered.filter((b) => b.pg_id === pgId);
        const formatted = filtered.map((b) => ({
          ...b,
          pg: b.pg
            ? {
                ...b.pg,
                images: b.pg.images ? b.pg.images.split(',').filter(Boolean) : [],
              }
            : undefined,
        }));
        return NextResponse.json(formatted);
      }
      throw error;
    }

    const formatted = (bookings || []).map((b: any) => ({
      ...b,
      pg: b.pg
        ? {
            ...b.pg,
            images: b.pg.images ? b.pg.images.split(',').filter(Boolean) : [],
          }
        : undefined,
    }));

    return NextResponse.json(formatted);
  } catch (error) {
    console.error('Error fetching bookings:', error);
    return NextResponse.json({ error: 'Failed to fetch bookings' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    // Auth guard: verify user session before creating booking
    const authResult = await requireSession(request);
    if ('error' in authResult) return authResult.error;

    const body = await request.json();
    const { userId, pgId, bedId, checkInDate, advancePaid } = body;

    if (!userId || !pgId || !bedId || !checkInDate) {
      return NextResponse.json(
        { error: 'userId, pgId, bedId, and checkInDate are required' },
        { status: 400 }
      );
    }

    // Create booking first
    const { data: booking, error: bookingError } = await supabase
      .from('bookings')
      .insert({
        user_id: userId,
        pg_id: pgId,
        bed_id: bedId,
        check_in_date: new Date(checkInDate).toISOString(),
        advance_paid: advancePaid || 0,
      })
      .select('*, pg:pgs(name), bed:beds(*)')
      .single();

    if (bookingError) throw bookingError;

    // Then update bed status
    await supabase.from('beds').update({ status: 'OCCUPIED' }).eq('id', bedId);

    return NextResponse.json(booking, { status: 201 });
  } catch (error) {
    console.error('Error creating booking:', error);
    return NextResponse.json({ error: 'Failed to create booking' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    // Auth guard: verify user session before updating booking
    const authResult = await requireSession(request);
    if ('error' in authResult) return authResult.error;

    const body = await request.json();
    const { bookingId, status } = body;

    if (!bookingId || !status) {
      return NextResponse.json({ error: 'bookingId and status required' }, { status: 400 });
    }

    // Fetch booking first to get bedId
    const { data: existingBooking, error: fetchError } = await supabase
      .from('bookings')
      .select('bed_id')
      .eq('id', bookingId)
      .single();

    if (fetchError) throw fetchError;

    const { data: booking, error } = await supabase
      .from('bookings')
      .update({ status })
      .eq('id', bookingId)
      .select()
      .single();

    if (error) throw error;

    if (status === 'CANCELLED' && existingBooking?.bed_id) {
      await supabase.from('beds').update({ status: 'AVAILABLE' }).eq('id', existingBooking.bed_id);
    }

    return NextResponse.json(booking);
  } catch (error) {
    console.error('Error updating booking:', error);
    return NextResponse.json({ error: 'Failed to update booking' }, { status: 500 });
  }
}
