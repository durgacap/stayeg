import { db } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const pg = await db.pG.findUnique({
      where: { id },
      include: {
        owner: {
          select: { id: true, name: true, phone: true, avatar: true, email: true },
        },
        rooms: {
          include: {
            beds: {
              orderBy: { bedNumber: 'asc' },
            },
          },
          orderBy: [{ floor: 'asc' }, { roomCode: 'asc' }],
        },
      },
    });

    if (!pg) {
      return NextResponse.json({ error: 'PG not found' }, { status: 404 });
    }

    const formatted = {
      ...pg,
      images: pg.images ? pg.images.split(',').filter(Boolean) : [],
      amenities: pg.amenities ? pg.amenities.split(',').filter(Boolean) : [],
      rooms: pg.rooms?.map((room) => ({
        ...room,
        beds: room.beds?.map((bed) => ({
          ...bed,
          price: bed.price ?? pg.price,
        })),
      })),
    };

    return NextResponse.json(formatted);
  } catch (error) {
    console.error('Error fetching PG:', error);
    return NextResponse.json({ error: 'Failed to fetch PG' }, { status: 500 });
  }
}
