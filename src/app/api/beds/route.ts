import { supabase } from '@/lib/supabase';
import { NextRequest, NextResponse } from 'next/server';
import { requireSession } from '@/lib/api-auth';

// POST /api/beds — Create a new bed under a room
export async function POST(request: NextRequest) {
  try {
    const authResult = await requireSession(request);
    if ('error' in authResult) return authResult.error;

    const body = await request.json();
    const { roomId, bedNumber, price, status } = body;

    if (!roomId || bedNumber === undefined || bedNumber === null) {
      return NextResponse.json(
        { error: 'roomId and bedNumber are required' },
        { status: 400 }
      );
    }

    if (bedNumber < 1) {
      return NextResponse.json(
        { error: 'bedNumber must be a positive integer' },
        { status: 400 }
      );
    }

    // Verify the room exists
    const { data: room, error: roomError } = await supabase
      .from('rooms')
      .select('id')
      .eq('id', roomId)
      .single();

    if (roomError || !room) {
      return NextResponse.json(
        { error: 'Room not found' },
        { status: 404 }
      );
    }

    // Check for duplicate bed number in the same room
    const { data: existingBed } = await supabase
      .from('beds')
      .select('id')
      .eq('room_id', roomId)
      .eq('bed_number', bedNumber)
      .maybeSingle();

    if (existingBed) {
      return NextResponse.json(
        { error: `Bed #${bedNumber} already exists in this room` },
        { status: 409 }
      );
    }

    const { data: bed, error } = await supabase
      .from('beds')
      .insert({
        room_id: roomId,
        bed_number: bedNumber,
        price: price ?? null,
        status: status ?? 'AVAILABLE',
      })
      .select('*, room:rooms(id, room_code, pg:pgs(id, name))')
      .single();

    if (error) throw error;

    return NextResponse.json(bed, { status: 201 });
  } catch (error) {
    console.error('Error creating bed:', error);
    return NextResponse.json(
      { error: 'Failed to create bed' },
      { status: 500 }
    );
  }
}

// PUT /api/beds — Update a bed's status (and optionally price)
export async function PUT(request: NextRequest) {
  try {
    const authResult = await requireSession(request);
    if ('error' in authResult) return authResult.error;

    const body = await request.json();
    const { id, status, price } = body;

    if (!id || !status) {
      return NextResponse.json(
        { error: 'id and status are required' },
        { status: 400 }
      );
    }

    const validStatuses = ['AVAILABLE', 'OCCUPIED', 'MAINTENANCE'];
    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        { error: `Invalid status. Must be one of: ${validStatuses.join(', ')}` },
        { status: 400 }
      );
    }

    // Fetch current bed
    const { data: currentBed, error: fetchError } = await supabase
      .from('beds')
      .select('id, status')
      .eq('id', id)
      .single();

    if (fetchError || !currentBed) {
      return NextResponse.json(
        { error: 'Bed not found' },
        { status: 404 }
      );
    }

    const updateData: Record<string, unknown> = { status };
    if (price !== undefined) updateData.price = price;

    const { data: bed, error } = await supabase
      .from('beds')
      .update(updateData)
      .eq('id', id)
      .select('*, room:rooms(id, room_code, pg:pgs(id, name))')
      .single();

    if (error) throw error;

    return NextResponse.json(bed);
  } catch (error) {
    console.error('Error updating bed:', error);
    return NextResponse.json(
      { error: 'Failed to update bed' },
      { status: 500 }
    );
  }
}
