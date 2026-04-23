import { supabase, isTableMissing } from '@/lib/supabase';
import { NextRequest, NextResponse } from 'next/server';
import { requireSession } from '@/lib/api-auth';

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
      if (isTableMissing(error)) return NextResponse.json([]);
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
