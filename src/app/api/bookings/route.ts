import { db } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const pgId = searchParams.get('pgId');

    const where: Record<string, unknown> = {};
    if (userId) where.userId = userId;
    if (pgId) where.pgId = pgId;

    if (!userId && !pgId) {
      return NextResponse.json({ error: 'userId or pgId is required' }, { status: 400 });
    }

    const bookings = await db.booking.findMany({
      where,
      include: {
        pg: {
          select: { id: true, name: true, address: true, city: true, images: true },
        },
        bed: {
          include: {
            room: {
              select: { roomCode: true, roomType: true, floor: true },
            },
          },
        },
        user: {
          select: { id: true, name: true, email: true, phone: true, avatar: true },
        },
        payments: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    const formatted = bookings.map((b) => ({
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
    const body = await request.json();
    const { userId, pgId, bedId, checkInDate, advancePaid } = body;

    if (!userId || !pgId || !bedId || !checkInDate) {
      return NextResponse.json(
        { error: 'userId, pgId, bedId, and checkInDate are required' },
        { status: 400 }
      );
    }

    const booking = await db.$transaction(async (tx) => {
      const b = await tx.booking.create({
        data: {
          userId,
          pgId,
          bedId,
          checkInDate: new Date(checkInDate),
          advancePaid: advancePaid || 0,
        },
        include: {
          pg: { select: { name: true } },
          bed: true,
        },
      });

      await tx.bed.update({
        where: { id: bedId },
        data: { status: 'OCCUPIED' },
      });

      return b;
    });

    return NextResponse.json(booking, { status: 201 });
  } catch (error) {
    console.error('Error creating booking:', error);
    return NextResponse.json({ error: 'Failed to create booking' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { bookingId, status } = body;

    if (!bookingId || !status) {
      return NextResponse.json({ error: 'bookingId and status required' }, { status: 400 });
    }

    const booking = await db.booking.update({
      where: { id: bookingId },
      data: { status },
    });

    if (status === 'CANCELLED') {
      await db.bed.update({
        where: { id: booking.bedId },
        data: { status: 'AVAILABLE' },
      });
    }

    return NextResponse.json(booking);
  } catch (error) {
    console.error('Error updating booking:', error);
    return NextResponse.json({ error: 'Failed to update booking' }, { status: 500 });
  }
}
