import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET /api/tenants?ownerId=...&pgId=...&roomId=...&status=...&search=...
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const ownerId = searchParams.get('ownerId');
    const pgId = searchParams.get('pgId');
    const roomId = searchParams.get('roomId');
    const status = searchParams.get('status');
    const search = searchParams.get('search');

    if (!ownerId) {
      return NextResponse.json({ error: 'ownerId is required' }, { status: 400 });
    }

    const where: Record<string, unknown> = { ownerId };
    if (pgId) where.pgId = pgId;
    if (roomId) where.roomId = roomId;
    if (status) where.status = status;
    if (search) {
      where.OR = [
        { name: { contains: search } },
        { phone: { contains: search } },
        { email: { contains: search } },
      ];
    }

    const tenants = await db.tenant.findMany({
      where,
      include: {
        pg: { select: { id: true, name: true } },
        room: { select: { id: true, roomCode: true, roomType: true, floor: true } },
        bed: { select: { id: true, bedNumber: true, status: true } },
        rentRecords: {
          orderBy: { createdAt: 'desc' },
          take: 6,
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(tenants);
  } catch (error) {
    console.error('GET /api/tenants error:', error);
    return NextResponse.json({ error: 'Failed to fetch tenants' }, { status: 500 });
  }
}

// POST /api/tenants — Create tenant
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { ownerId, pgId, roomId, bedId, name, phone, email, aadhaar, gender, rentAmount, rentDueDay, notes } = body;

    if (!ownerId || !pgId || !roomId || !bedId || !name || !phone) {
      return NextResponse.json({ error: 'ownerId, pgId, roomId, bedId, name, phone are required' }, { status: 400 });
    }

    // Check bed exists and is available
    const bed = await db.bed.findUnique({ where: { id: bedId }, include: { room: { include: { pg: true } } } });
    if (!bed) {
      return NextResponse.json({ error: 'Bed not found' }, { status: 404 });
    }
    if (bed.status === 'OCCUPIED') {
      return NextResponse.json({ error: 'Bed is already occupied' }, { status: 400 });
    }
    if (bed.room.pgId !== pgId) {
      return NextResponse.json({ error: 'Bed does not belong to this PG' }, { status: 400 });
    }

    const currentMonth = new Date().toISOString().slice(0, 7); // "2025-06"

    const tenant = await db.tenant.create({
      data: {
        ownerId, pgId, roomId, bedId, name, phone,
        email: email || null,
        aadhaar: aadhaar || null,
        gender: gender || null,
        rentAmount: rentAmount || 0,
        rentDueDay: rentDueDay || 5,
        notes: notes || null,
        rentRecords: {
          create: {
            month: currentMonth,
            amount: rentAmount || 0,
            status: 'PENDING',
          },
        },
      },
      include: {
        pg: { select: { id: true, name: true } },
        room: { select: { id: true, roomCode: true, roomType: true, floor: true } },
        bed: { select: { id: true, bedNumber: true, status: true } },
        rentRecords: true,
      },
    });

    // Mark bed as occupied
    await db.bed.update({
      where: { id: bedId },
      data: { status: 'OCCUPIED' },
    });

    // Log activity
    try {
      await db.activityLog.create({
        data: {
          ownerId,
          action: 'TENANT_ADDED',
          description: `Added tenant "${name}" to ${bed.room.roomCode} - Bed #${bed.bedNumber}`,
          metadata: JSON.stringify({ tenantId: tenant.id, pgId, bedId }),
        },
      });
    } catch { /* ignore log failures */ }

    return NextResponse.json(tenant, { status: 201 });
  } catch (error) {
    console.error('POST /api/tenants error:', error);
    return NextResponse.json({ error: 'Failed to create tenant' }, { status: 500 });
  }
}

// PUT /api/tenants — Update tenant
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, name, phone, email, aadhaar, gender, rentAmount, rentDueDay, notes, status, newBedId, newRoomId } = body;

    if (!id) {
      return NextResponse.json({ error: 'Tenant id is required' }, { status: 400 });
    }

    const existing = await db.tenant.findUnique({ where: { id }, include: { bed: true } });
    if (!existing) {
      return NextResponse.json({ error: 'Tenant not found' }, { status: 404 });
    }

    // Handle bed/room move
    if (newBedId && newBedId !== existing.bedId) {
      const newBed = await db.bed.findUnique({
        where: { id: newBedId },
        include: { room: true },
      });
      if (!newBed) {
        return NextResponse.json({ error: 'New bed not found' }, { status: 404 });
      }
      if (newBed.status === 'OCCUPIED') {
        return NextResponse.json({ error: 'Target bed is already occupied' }, { status: 400 });
      }

      const targetRoomId = newRoomId || newBed.roomId;

      // Free old bed
      await db.bed.update({ where: { id: existing.bedId }, data: { status: 'AVAILABLE' } });
      // Occupy new bed
      await db.bed.update({ where: { id: newBedId }, data: { status: 'OCCUPIED' } });

      const updateData: Record<string, unknown> = {
        bedId: newBedId,
        roomId: targetRoomId,
        pgId: newBed.room.pgId,
        name, phone, email, aadhaar, gender, rentAmount, rentDueDay, notes, status,
      };

      const updated = await db.tenant.update({
        where: { id },
        data: updateData,
        include: {
          pg: { select: { id: true, name: true } },
          room: { select: { id: true, roomCode: true, roomType: true, floor: true } },
          bed: { select: { id: true, bedNumber: true, status: true } },
          rentRecords: { orderBy: { createdAt: 'desc' }, take: 6 },
        },
      });

      try {
        await db.activityLog.create({
          data: {
            ownerId: existing.ownerId,
            action: 'TENANT_MOVED',
            description: `Moved "${name || existing.name}" to ${newBed.room.roomCode} - Bed #${newBed.bedNumber}`,
            metadata: JSON.stringify({ tenantId: id, oldBedId: existing.bedId, newBedId }),
          },
        });
      } catch { /* ignore */ }

      return NextResponse.json(updated);
    }

    // Handle status change (evict/inactivate)
    if (status === 'EVICTED' || status === 'INACTIVE') {
      await db.bed.update({ where: { id: existing.bedId }, data: { status: 'AVAILABLE' } });
    }

    const updated = await db.tenant.update({
      where: { id },
      data: {
        name: name ?? existing.name,
        phone: phone ?? existing.phone,
        email: email !== undefined ? (email || null) : existing.email,
        aadhaar: aadhaar !== undefined ? (aadhaar || null) : existing.aadhaar,
        gender: gender !== undefined ? (gender || null) : existing.gender,
        rentAmount: rentAmount !== undefined ? rentAmount : existing.rentAmount,
        rentDueDay: rentDueDay !== undefined ? rentDueDay : existing.rentDueDay,
        notes: notes !== undefined ? (notes || null) : existing.notes,
        status: status ?? existing.status,
      },
      include: {
        pg: { select: { id: true, name: true } },
        room: { select: { id: true, roomCode: true, roomType: true, floor: true } },
        bed: { select: { id: true, bedNumber: true, status: true } },
        rentRecords: { orderBy: { createdAt: 'desc' }, take: 6 },
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error('PUT /api/tenants error:', error);
    return NextResponse.json({ error: 'Failed to update tenant' }, { status: 500 });
  }
}

// DELETE /api/tenants — Remove tenant
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) {
      return NextResponse.json({ error: 'Tenant id is required' }, { status: 400 });
    }

    const tenant = await db.tenant.findUnique({ where: { id } });
    if (!tenant) {
      return NextResponse.json({ error: 'Tenant not found' }, { status: 404 });
    }

    // Free the bed
    await db.bed.update({ where: { id: tenant.bedId }, data: { status: 'AVAILABLE' } });

    // Delete tenant (cascades to rent records)
    await db.tenant.delete({ where: { id } });

    try {
      await db.activityLog.create({
        data: {
          ownerId: tenant.ownerId,
          action: 'TENANT_REMOVED',
          description: `Removed tenant "${tenant.name}"`,
          metadata: JSON.stringify({ tenantId: id, bedId: tenant.bedId }),
        },
      });
    } catch { /* ignore */ }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('DELETE /api/tenants error:', error);
    return NextResponse.json({ error: 'Failed to delete tenant' }, { status: 500 });
  }
}
