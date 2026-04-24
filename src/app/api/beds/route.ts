import { db } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/api-auth';

// POST /api/beds
// Create a new bed under a room
export async function POST(request: NextRequest) {
  try {
    // Auth guard
    const authError = requireAuth(request);
    if (authError) return authError;

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
    const room = await db.room.findUnique({
      where: { id: roomId },
      select: { id: true },
    });

    if (!room) {
      return NextResponse.json(
        { error: 'Room not found' },
        { status: 404 }
      );
    }

    // Check for duplicate bed number in the same room
    const existingBed = await db.bed.findFirst({
      where: { roomId, bedNumber },
    });

    if (existingBed) {
      return NextResponse.json(
        { error: `Bed #${bedNumber} already exists in this room` },
        { status: 409 }
      );
    }

    const bed = await db.bed.create({
      data: {
        roomId,
        bedNumber,
        price: price ?? null,
        status: status ?? 'AVAILABLE',
      },
      include: {
        room: {
          include: {
            pg: {
              select: { id: true, name: true },
            },
          },
        },
      },
    });

    return NextResponse.json(bed, { status: 201 });
  } catch (error) {
    console.error('Error creating bed:', error);
    return NextResponse.json(
      { error: 'Failed to create bed' },
      { status: 500 }
    );
  }
}

// PUT /api/beds
// Update a bed's status (and optionally price)
export async function PUT(request: NextRequest) {
  try {
    // Auth guard
    const authError = requireAuth(request);
    if (authError) return authError;

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

    // Fetch current bed with tenant info
    const currentBed = await db.bed.findUnique({
      where: { id },
      include: {
        tenants: {
          where: { status: 'ACTIVE' },
        },
        room: {
          include: {
            pg: {
              select: { id: true, name: true },
            },
          },
        },
      },
    });

    if (!currentBed) {
      return NextResponse.json(
        { error: 'Bed not found' },
        { status: 404 }
      );
    }

    // Guard: cannot set a bed to AVAILABLE if it has active tenants
    if (status === 'AVAILABLE' && currentBed.status === 'OCCUPIED') {
      if (currentBed.tenants.length > 0) {
        return NextResponse.json(
          {
            error:
              'Cannot mark bed as AVAILABLE. There are active tenants assigned to this bed. Please remove or deactivate all tenant assignments first.',
          },
          { status: 409 }
        );
      }

      // No active tenants — clear any inactive/evicted tenant bed assignments
      await db.tenant.updateMany({
        where: { bedId: id, status: { in: ['INACTIVE', 'EVICTED'] } },
        data: { bedId: null },
      });
    }

    // Build update payload
    const updateData: { status: string; price?: number | null } = {
      status,
    };
    if (price !== undefined) {
      updateData.price = price;
    }

    const updatedBed = await db.bed.update({
      where: { id },
      data: updateData,
      include: {
        room: {
          include: {
            pg: {
              select: { id: true, name: true },
            },
          },
        },
        tenants: {
          where: { status: 'ACTIVE' },
          select: { id: true, name: true, status: true },
        },
      },
    });

    return NextResponse.json(updatedBed);
  } catch (error) {
    console.error('Error updating bed:', error);
    return NextResponse.json(
      { error: 'Failed to update bed' },
      { status: 500 }
    );
  }
}
