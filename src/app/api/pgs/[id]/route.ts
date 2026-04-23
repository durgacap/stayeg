import { supabase, isTableMissing } from '@/lib/supabase';
import { NextRequest, NextResponse } from 'next/server';

const DEMO_PG = {
  id: 'demo-pg-1',
  name: 'StayEg Demo PG',
  description: 'A comfortable PG accommodation with modern amenities in the heart of the city.',
  address: '123 Demo Street, Koramangala',
  city: 'Bangalore',
  gender: 'UNISEX',
  price: 8000,
  images: [],
  amenities: ['WiFi', 'AC', 'Meals', 'Laundry', 'Parking', 'CCTV'],
  owner: {
    id: 'demo-owner',
    name: 'Demo Owner',
    phone: '+919876543210',
    avatar: null,
    email: 'owner@stayeg.com',
  },
  rooms: [
    {
      id: 'demo-room-1',
      pg_id: 'demo-pg-1',
      room_code: '101',
      room_type: 'DOUBLE',
      floor: 1,
      beds: [
        { id: 'demo-bed-1', room_id: 'demo-room-1', bed_number: 1, status: 'OCCUPIED', price: 8000 },
        { id: 'demo-bed-2', room_id: 'demo-room-1', bed_number: 2, status: 'AVAILABLE', price: 8000 },
      ],
    },
    {
      id: 'demo-room-2',
      pg_id: 'demo-pg-1',
      room_code: '102',
      room_type: 'TRIPLE',
      floor: 1,
      beds: [
        { id: 'demo-bed-3', room_id: 'demo-room-2', bed_number: 1, status: 'AVAILABLE', price: 7000 },
        { id: 'demo-bed-4', room_id: 'demo-room-2', bed_number: 2, status: 'AVAILABLE', price: 7000 },
        { id: 'demo-bed-5', room_id: 'demo-room-2', bed_number: 3, status: 'OCCUPIED', price: 7000 },
      ],
    },
  ],
};

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const { data: pg, error } = await supabase
      .from('pgs')
      .select('*, owner:users(id,name,phone,avatar,email), rooms(*, beds(*))')
      .eq('id', id)
      .single();

    if (error) {
      if (isTableMissing(error)) return NextResponse.json(DEMO_PG);
      return NextResponse.json({ error: 'PG not found' }, { status: 404 });
    }

    if (!pg) {
      return NextResponse.json({ error: 'PG not found' }, { status: 404 });
    }

    // Sort rooms by floor then room_code, and beds by bed_number
    const sortedRooms = (pg.rooms || [])
      .sort((a: any, b: any) => {
        if (a.floor !== b.floor) return a.floor - b.floor;
        return (a.room_code || '').localeCompare(b.room_code || '');
      })
      .map((room: any) => ({
        ...room,
        beds: (room.beds || []).sort((a: any, b: any) => a.bed_number - b.bed_number),
      }));

    const formatted = {
      ...pg,
      images: pg.images ? pg.images.split(',').filter(Boolean) : [],
      amenities: pg.amenities ? pg.amenities.split(',').filter(Boolean) : [],
      rooms: sortedRooms.map((room: any) => ({
        ...room,
        beds: room.beds.map((bed: any) => ({
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
