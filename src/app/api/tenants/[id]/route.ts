import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// ============================
// Auth helper (Prisma-based)
// ============================

async function getOwnerSession(request: NextRequest) {
  const userEmail = request.headers.get('x-user-email');
  if (!userEmail) {
    return { error: NextResponse.json({ error: 'Authentication required: missing user identity' }, { status: 401 }) };
  }
  const user = await db.user.findUnique({
    where: { email: userEmail },
    select: { id: true, email: true, role: true },
  });
  if (!user) {
    return { error: NextResponse.json({ error: 'Authentication failed: user not found' }, { status: 401 }) };
  }
  if (user.role !== 'OWNER') {
    return { error: NextResponse.json({ error: 'Forbidden: owner access required' }, { status: 403 }) };
  }
  return { user };
}

// ============================
// GET /api/tenants/[id] — fetch single tenant with full details
// ============================

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authResult = await getOwnerSession(request);
    if ('error' in authResult) return authResult.error;

    const { id } = await params;

    const tenant = await db.tenant.findUnique({
      where: { id },
      include: {
        pg: { select: { id: true, name: true, address: true, city: true } },
        room: { select: { id: true, roomCode: true, roomType: true, floor: true, hasAC: true, hasAttachedBath: true } },
        bed: { select: { id: true, bedNumber: true, status: true, price: true } },
        owner: { select: { id: true, name: true, email: true, phone: true } },
        rentRecords: {
          orderBy: { month: 'desc' },
        },
      },
    });

    if (!tenant) {
      return NextResponse.json({ error: 'Tenant not found' }, { status: 404 });
    }

    // Ownership check
    if (tenant.ownerId !== authResult.user.id) {
      return NextResponse.json({ error: 'Forbidden: tenant does not belong to this owner' }, { status: 403 });
    }

    return NextResponse.json(tenant);
  } catch (error) {
    console.error('Error fetching tenant:', error);
    return NextResponse.json({ error: 'Failed to fetch tenant' }, { status: 500 });
  }
}

// ============================
// PUT /api/tenants/[id] — update a single tenant
// ============================

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authResult = await getOwnerSession(request);
    if ('error' in authResult) return authResult.error;

    const { id } = await params;
    const body = await request.json();
    const {
      pgId, roomId, bedId, name, phone, email, aadhaar,
      gender, rentAmount, rentDueDay, status, notes,
    } = body;

    // Fetch existing tenant and verify ownership
    const existing = await db.tenant.findUnique({
      where: { id },
      select: { id: true, ownerId: true, bedId: true, roomId: true, pgId: true, status: true },
    });
    if (!existing) {
      return NextResponse.json({ error: 'Tenant not found' }, { status: 404 });
    }
    if (existing.ownerId !== authResult.user.id) {
      return NextResponse.json({ error: 'Forbidden: tenant does not belong to this owner' }, { status: 403 });
    }

    // Build update data
    const updateData: Record<string, unknown> = {};
    if (name !== undefined) updateData.name = name;
    if (phone !== undefined) updateData.phone = phone;
    if (email !== undefined) updateData.email = email || null;
    if (aadhaar !== undefined) updateData.aadhaar = aadhaar || null;
    if (gender !== undefined) updateData.gender = gender || null;
    if (rentAmount !== undefined) updateData.rentAmount = rentAmount;
    if (rentDueDay !== undefined) {
      if (rentDueDay < 1 || rentDueDay > 28) {
        return NextResponse.json({ error: 'rentDueDay must be between 1 and 28' }, { status: 400 });
      }
      updateData.rentDueDay = rentDueDay;
    }
    if (status !== undefined) updateData.status = status;
    if (notes !== undefined) updateData.notes = notes || null;

    // Handle bed/room/pg move
    let newBedId = existing.bedId;
    let newRoomId = existing.roomId;
    let newPgId = existing.pgId;

    if (bedId && bedId !== existing.bedId) {
      const targetRoomId = roomId || existing.roomId;
      const targetPgId = pgId || existing.pgId;

      // Verify room belongs to PG
      const room = await db.room.findUnique({
        where: { id: targetRoomId },
        select: { id: true, pgId: true },
      });
      if (!room || room.pgId !== targetPgId) {
        return NextResponse.json({ error: 'Room not found or does not belong to the PG' }, { status: 400 });
      }

      // Verify bed belongs to room and is available
      const bed = await db.bed.findUnique({
        where: { id: bedId },
        select: { id: true, roomId: true, status: true },
      });
      if (!bed || bed.roomId !== targetRoomId) {
        return NextResponse.json({ error: 'Bed not found or does not belong to the room' }, { status: 400 });
      }
      if (bed.status !== 'AVAILABLE') {
        return NextResponse.json(
          { error: `Target bed is not available (current status: ${bed.status})` },
          { status: 409 }
        );
      }

      newBedId = bedId;
      newRoomId = targetRoomId;
      newPgId = targetPgId;
      updateData.bedId = newBedId;
      updateData.roomId = newRoomId;
      updateData.pgId = newPgId;
    }

    // Perform update in transaction (handle bed status changes)
    const updatedTenant = await db.$transaction(async (tx) => {
      // If bed changed, release old bed and occupy new one
      if (newBedId !== existing.bedId) {
        await tx.bed.update({
          where: { id: existing.bedId },
          data: { status: 'AVAILABLE' },
        });
        await tx.bed.update({
          where: { id: newBedId },
          data: { status: 'OCCUPIED' },
        });
      }

      // If tenant is being evicted/inactivated (and wasn't already), free up the bed
      if ((status === 'INACTIVE' || status === 'EVICTED') && existing.status === 'ACTIVE') {
        await tx.bed.update({
          where: { id: existing.bedId },
          data: { status: 'AVAILABLE' },
        });
      }

      // If tenant is being re-activated, occupy the bed again
      if (status === 'ACTIVE' && (existing.status === 'INACTIVE' || existing.status === 'EVICTED')) {
        await tx.bed.update({
          where: { id: existing.bedId },
          data: { status: 'OCCUPIED' },
        });
      }

      return tx.tenant.update({
        where: { id },
        data: updateData,
        include: {
          pg: { select: { id: true, name: true, address: true } },
          room: { select: { id: true, roomCode: true, roomType: true, floor: true } },
          bed: { select: { id: true, bedNumber: true, status: true } },
          rentRecords: {
            select: { id: true, month: true, amount: true, status: true, paidDate: true },
            orderBy: { month: 'desc' },
            take: 3,
          },
        },
      });
    });

    return NextResponse.json(updatedTenant);
  } catch (error) {
    console.error('Error updating tenant:', error);
    return NextResponse.json({ error: 'Failed to update tenant' }, { status: 500 });
  }
}

// ============================
// DELETE /api/tenants/[id] — delete a single tenant
// ============================

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authResult = await getOwnerSession(request);
    if ('error' in authResult) return authResult.error;

    const { id } = await params;

    // Fetch tenant and verify ownership
    const existing = await db.tenant.findUnique({
      where: { id },
      select: { id: true, ownerId: true, bedId: true, name: true, status: true },
    });
    if (!existing) {
      return NextResponse.json({ error: 'Tenant not found' }, { status: 404 });
    }
    if (existing.ownerId !== authResult.user.id) {
      return NextResponse.json({ error: 'Forbidden: tenant does not belong to this owner' }, { status: 403 });
    }

    // Delete tenant and free bed in transaction
    await db.$transaction(async (tx) => {
      // Only free bed if tenant was active
      if (existing.status === 'ACTIVE') {
        await tx.bed.update({
          where: { id: existing.bedId },
          data: { status: 'AVAILABLE' },
        });
      }

      // Delete the tenant (rent records are cascade-deleted via schema)
      await tx.tenant.delete({
        where: { id },
      });
    });

    return NextResponse.json({ success: true, message: `Tenant "${existing.name}" has been removed` });
  } catch (error) {
    console.error('Error deleting tenant:', error);
    return NextResponse.json({ error: 'Failed to delete tenant' }, { status: 500 });
  }
}
