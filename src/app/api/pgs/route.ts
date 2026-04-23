import { supabase } from '@/lib/supabase';
import { NextRequest, NextResponse } from 'next/server';
import type { PG } from '@/lib/types';
import { requireSession } from '@/lib/api-auth';

// Demo PGs data returned when database is not available
const DEMO_PGS: PG[] = [
  {
    id: 'demo-pg-1',
    name: 'CozyStay PG',
    ownerId: 'demo-owner-001',
    description: 'A modern PG with all amenities in the heart of Koramangala. Walking distance to IT parks and restaurants.',
    address: '42, 4th Cross, Koramangala 4th Block, Bangalore - 560034',
    city: 'Bangalore',
    lat: 12.9352,
    lng: 77.6245,
    gender: 'UNISEX',
    price: 8500,
    securityDeposit: 17000,
    amenities: 'wifi,ac,food,laundry,parking,gym,cctv,power_backup',
    images: 'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=600&h=400&fit=crop,https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=600&h=400&fit=crop',
    rating: 4.5,
    totalReviews: 128,
    status: 'APPROVED',
    isVerified: true,
    rooms: [
      { id: 'demo-room-1', pgId: 'demo-pg-1', roomCode: 'A101', roomType: 'DOUBLE', floor: 1, hasAC: true, hasAttachedBath: true, beds: [
        { id: 'demo-bed-1', roomId: 'demo-room-1', bedNumber: 1, status: 'AVAILABLE', price: 8500 },
        { id: 'demo-bed-2', roomId: 'demo-room-1', bedNumber: 2, status: 'OCCUPIED', price: 8500 },
      ]},
      { id: 'demo-room-2', pgId: 'demo-pg-1', roomCode: 'A102', roomType: 'TRIPLE', floor: 1, hasAC: false, hasAttachedBath: true, beds: [
        { id: 'demo-bed-3', roomId: 'demo-room-2', bedNumber: 1, status: 'OCCUPIED', price: 6500 },
        { id: 'demo-bed-4', roomId: 'demo-room-2', bedNumber: 2, status: 'AVAILABLE', price: 6500 },
        { id: 'demo-bed-5', roomId: 'demo-room-2', bedNumber: 3, status: 'AVAILABLE', price: 6500 },
      ]},
    ],
  },
  {
    id: 'demo-pg-2',
    name: 'Green Valley PG',
    ownerId: 'demo-owner-001',
    description: 'Peaceful PG surrounded by greenery. Perfect for students and working professionals. Home-cooked meals included.',
    address: '15, HSR Layout Sector 2, Bangalore - 560102',
    city: 'Bangalore',
    lat: 12.9116,
    lng: 77.6389,
    gender: 'MALE',
    price: 7000,
    securityDeposit: 14000,
    amenities: 'wifi,food,laundry,cctv,power_backup,water_heater,study_table,wardrobe',
    images: 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=600&h=400&fit=crop,https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=600&h=400&fit=crop',
    rating: 4.2,
    totalReviews: 85,
    status: 'APPROVED',
    isVerified: true,
    rooms: [
      { id: 'demo-room-3', pgId: 'demo-pg-2', roomCode: 'B201', roomType: 'DORMITORY', floor: 2, hasAC: false, hasAttachedBath: false, beds: [
        { id: 'demo-bed-6', roomId: 'demo-room-3', bedNumber: 1, status: 'OCCUPIED', price: 7000 },
        { id: 'demo-bed-7', roomId: 'demo-room-3', bedNumber: 2, status: 'OCCUPIED', price: 7000 },
        { id: 'demo-bed-8', roomId: 'demo-room-3', bedNumber: 3, status: 'AVAILABLE', price: 7000 },
        { id: 'demo-bed-9', roomId: 'demo-room-3', bedNumber: 4, status: 'AVAILABLE', price: 7000 },
      ]},
    ],
  },
  {
    id: 'demo-pg-3',
    name: 'Sunrise Ladies PG',
    ownerId: 'demo-owner-001',
    description: 'Safe and secure PG exclusively for women. High security with CCTV and female warden. Near Metro station.',
    address: '78, Indiranagar 2nd Stage, Bangalore - 560038',
    city: 'Bangalore',
    lat: 12.9784,
    lng: 77.6408,
    gender: 'FEMALE',
    price: 9000,
    securityDeposit: 18000,
    amenities: 'wifi,ac,food,laundry,cctv,power_backup,water_heater,housekeeping,tv',
    images: 'https://images.unsplash.com/photo-1578683010236-d716f9a3f461?w=600&h=400&fit=crop,https://images.unsplash.com/photo-1554995207-c18c203602cb?w=600&h=400&fit=crop',
    rating: 4.7,
    totalReviews: 204,
    status: 'APPROVED',
    isVerified: true,
    rooms: [
      { id: 'demo-room-4', pgId: 'demo-pg-3', roomCode: 'C101', roomType: 'SINGLE', floor: 1, hasAC: true, hasAttachedBath: true, beds: [
        { id: 'demo-bed-10', roomId: 'demo-room-4', bedNumber: 1, status: 'AVAILABLE', price: 9000 },
      ]},
      { id: 'demo-room-5', pgId: 'demo-pg-3', roomCode: 'C102', roomType: 'DOUBLE', floor: 1, hasAC: true, hasAttachedBath: true, beds: [
        { id: 'demo-bed-11', roomId: 'demo-room-5', bedNumber: 1, status: 'OCCUPIED', price: 9000 },
        { id: 'demo-bed-12', roomId: 'demo-room-5', bedNumber: 2, status: 'AVAILABLE', price: 9000 },
      ]},
    ],
  },
  {
    id: 'demo-pg-4',
    name: 'Urban Nest PG',
    ownerId: 'demo-owner-001',
    description: 'Premium co-living space with modern interiors. Community events, gym, and recreation area included.',
    address: '23, Whitefield Main Road, Bangalore - 560066',
    city: 'Bangalore',
    lat: 12.9698,
    lng: 77.7500,
    gender: 'UNISEX',
    price: 12000,
    securityDeposit: 24000,
    amenities: 'wifi,ac,food,laundry,parking,gym,cctv,power_backup,common_room,tv,refrigerator',
    images: 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=600&h=400&fit=crop,https://images.unsplash.com/photo-1560185127-6ed189bf02f4?w=600&h=400&fit=crop',
    rating: 4.8,
    totalReviews: 312,
    status: 'APPROVED',
    isVerified: true,
    rooms: [
      { id: 'demo-room-6', pgId: 'demo-pg-4', roomCode: 'D301', roomType: 'SINGLE', floor: 3, hasAC: true, hasAttachedBath: true, beds: [
        { id: 'demo-bed-13', roomId: 'demo-room-6', bedNumber: 1, status: 'OCCUPIED', price: 12000 },
      ]},
      { id: 'demo-room-7', pgId: 'demo-pg-4', roomCode: 'D302', roomType: 'DOUBLE', floor: 3, hasAC: true, hasAttachedBath: true, beds: [
        { id: 'demo-bed-14', roomId: 'demo-room-7', bedNumber: 1, status: 'AVAILABLE', price: 12000 },
        { id: 'demo-bed-15', roomId: 'demo-room-7', bedNumber: 2, status: 'AVAILABLE', price: 12000 },
      ]},
    ],
  },
  {
    id: 'demo-pg-5',
    name: 'Budget Inn PG',
    ownerId: 'demo-owner-001',
    description: 'Affordable PG with clean rooms and basic amenities. Great for students on a budget. Near bus stop.',
    address: '56, Marathahalli, Bangalore - 560037',
    city: 'Bangalore',
    lat: 12.9591,
    lng: 77.6974,
    gender: 'MALE',
    price: 5500,
    securityDeposit: 11000,
    amenities: 'wifi,food,laundry,cctv,power_backup,study_table',
    images: 'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=600&h=400&fit=crop,https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=600&h=400&fit=crop',
    rating: 3.9,
    totalReviews: 67,
    status: 'APPROVED',
    isVerified: false,
    rooms: [
      { id: 'demo-room-8', pgId: 'demo-pg-5', roomCode: 'E101', roomType: 'DORMITORY', floor: 1, hasAC: false, hasAttachedBath: false, beds: [
        { id: 'demo-bed-16', roomId: 'demo-room-8', bedNumber: 1, status: 'OCCUPIED', price: 5500 },
        { id: 'demo-bed-17', roomId: 'demo-room-8', bedNumber: 2, status: 'OCCUPIED', price: 5500 },
        { id: 'demo-bed-18', roomId: 'demo-room-8', bedNumber: 3, status: 'AVAILABLE', price: 5500 },
        { id: 'demo-bed-19', roomId: 'demo-room-8', bedNumber: 4, status: 'OCCUPIED', price: 5500 },
        { id: 'demo-bed-20', roomId: 'demo-room-8', bedNumber: 5, status: 'AVAILABLE', price: 5500 },
      ]},
    ],
  },
];

/** Check if error indicates a missing table */
function isTableNotFoundError(error: unknown): boolean {
  if (!error || typeof error !== 'object') return false;
  const msg = String((error as { message?: string }).message ?? '');
  return msg.includes('does not exist') || msg.includes('not found') || msg.includes('not find') || msg.includes('relation') || msg.includes('PGRST205');
}

/** Apply client-side filters to demo PGs */
function filterDemoPGs(demos: PG[], params: URLSearchParams): PG[] {
  let result = [...demos];
  const gender = params.get('gender') || '';
  const query = params.get('query') || '';
  const minPrice = parseFloat(params.get('minPrice') || '0');
  const maxPrice = parseFloat(params.get('maxPrice') || '999999');
  const sortBy = params.get('sortBy') || 'rating';
  const city = params.get('city') || '';
  const amenities = params.get('amenities')?.split(',').filter(Boolean) || [];
  const ownerId = params.get('ownerId') || '';

  if (ownerId) {
    result = result.filter((pg) => pg.ownerId === ownerId);
  } else {
    if (city) result = result.filter((pg) => pg.city === city);
    result = result.filter((pg) => pg.status === 'APPROVED');
  }

  if (gender && gender !== 'ALL') result = result.filter((pg) => pg.gender === gender);
  if (query) {
    const q = query.toLowerCase();
    result = result.filter((pg) => pg.name.toLowerCase().includes(q) || pg.address.toLowerCase().includes(q));
  }
  if (minPrice > 0) result = result.filter((pg) => pg.price >= minPrice);
  if (maxPrice < 999999) result = result.filter((pg) => pg.price <= maxPrice);
  if (amenities.length > 0) {
    result = result.filter((pg) => {
      const pgAmenities = pg.amenities.toLowerCase();
      return amenities.every((a) => pgAmenities.includes(a.toLowerCase()));
    });
  }

  // Sorting
  if (sortBy === 'price_asc') result.sort((a, b) => a.price - b.price);
  else if (sortBy === 'price_desc') result.sort((a, b) => b.price - a.price);
  else if (sortBy === 'rating') result.sort((a, b) => b.rating - a.rating);
  else if (sortBy === 'newest') result.sort((a, b) => (b.createdAt ?? '').localeCompare(a.createdAt ?? ''));

  return result;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    let supabaseQuery = supabase
      .from('pgs')
      .select('*, owner:users(id,name,phone,avatar), rooms(*, beds(*))');

    const ownerId = searchParams.get('ownerId') || '';
    const gender = searchParams.get('gender') || '';
    const query = searchParams.get('query') || '';
    const minPrice = parseFloat(searchParams.get('minPrice') || '0');
    const maxPrice = parseFloat(searchParams.get('maxPrice') || '999999');
    const sortBy = searchParams.get('sortBy') || 'rating';
    const city = searchParams.get('city') || 'Bangalore';
    const amenities = searchParams.get('amenities')?.split(',').filter(Boolean) || [];

    // Owner view: show all their PGs regardless of status
    if (ownerId) {
      supabaseQuery = supabaseQuery.eq('owner_id', ownerId);
    } else {
      supabaseQuery = supabaseQuery.eq('status', 'APPROVED').eq('city', city);
    }

    if (gender && gender !== 'ALL') {
      supabaseQuery = supabaseQuery.eq('gender', gender);
    }

    if (query) {
      const sanitizedQuery = query.replace(/[%_\\]/g, '\\$&');
      supabaseQuery = supabaseQuery.or(`name.ilike.%${sanitizedQuery}%,address.ilike.%${sanitizedQuery}%`);
    }

    if (minPrice > 0) {
      supabaseQuery = supabaseQuery.gte('price', minPrice);
    }
    if (maxPrice < 999999) {
      supabaseQuery = supabaseQuery.lte('price', maxPrice);
    }

    // Amenities filter: chain .like for each amenity
    for (const a of amenities) {
      supabaseQuery = supabaseQuery.like('amenities', `%${a}%`);
    }

    // Sorting
    if (sortBy === 'price_asc') supabaseQuery = supabaseQuery.order('price', { ascending: true });
    else if (sortBy === 'price_desc') supabaseQuery = supabaseQuery.order('price', { ascending: false });
    else if (sortBy === 'rating') supabaseQuery = supabaseQuery.order('rating', { ascending: false });
    else if (sortBy === 'newest') supabaseQuery = supabaseQuery.order('created_at', { ascending: false });

    supabaseQuery = supabaseQuery.limit(50);

    const { data: pgs, error } = await supabaseQuery;
    if (error) {
      if (isTableNotFoundError(error)) {
        // Database table missing → return demo data
        const filtered = filterDemoPGs(DEMO_PGS, searchParams);
        return NextResponse.json(filtered, {
          headers: { 'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300', 'X-Demo-Mode': 'true' },
        });
      }
      throw error;
    }

    const formatted = (pgs || []).map((pg: Record<string, unknown>) => ({
      ...pg,
      images: typeof pg.images === 'string' ? pg.images.split(',').filter(Boolean) : [],
      amenities: typeof pg.amenities === 'string' ? pg.amenities.split(',').filter(Boolean) : [],
      rooms: Array.isArray(pg.rooms) ? (pg.rooms as Record<string, unknown>[]).map((room) => ({
        ...room,
        beds: Array.isArray(room.beds) ? (room.beds as Record<string, unknown>[]).map((bed) => ({
          ...bed,
          price: bed.price ?? (pg as Record<string, unknown>).price,
        })) : [],
      })) : [],
    }));

    return NextResponse.json(formatted, {
      headers: { 'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300' },
    });
  } catch (error) {
    console.error('Error fetching PGs:', error);
    // If it's a table-not-found error, return demo data
    if (isTableNotFoundError(error)) {
      const { searchParams } = new URL(request.url);
      const filtered = filterDemoPGs(DEMO_PGS, searchParams);
      return NextResponse.json(filtered, {
        headers: { 'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300', 'X-Demo-Mode': 'true' },
      });
    }
    return NextResponse.json({ error: 'Failed to fetch PGs' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    // Auth guard: verify user session before creating PG
    const authResult = await requireSession(request);
    if ('error' in authResult) return authResult.error;

    const body = await request.json();
    const { name, ownerId, description, address, city, gender, price, securityDeposit, amenities, images } = body;
    if (!name || !ownerId || !address) {
      return NextResponse.json({ error: 'name, ownerId, and address are required' }, { status: 400 });
    }
    const { data: pg, error } = await supabase
      .from('pgs')
      .insert({
        name,
        owner_id: ownerId,
        description,
        address,
        city: city || 'Bangalore',
        gender: gender || 'UNISEX',
        price: price || 0,
        security_deposit: securityDeposit || 0,
        amenities: amenities ? amenities.join(',') : '',
        images: images ? images.join(',') : '',
        status: 'PENDING',
      })
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json(pg, { status: 201 });
  } catch (error) {
    console.error('Error creating PG:', error);
    return NextResponse.json({ error: 'Failed to create PG' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    // Auth guard: verify user session before updating PG
    const authResult = await requireSession(request);
    if ('error' in authResult) return authResult.error;

    const body = await request.json();
    const { id, ...data } = body;
    if (!id) {
      return NextResponse.json({ error: 'id is required' }, { status: 400 });
    }
    const updateData: Record<string, unknown> = {};
    if (data.name !== undefined) updateData.name = data.name;
    if (data.description !== undefined) updateData.description = data.description;
    if (data.address !== undefined) updateData.address = data.address;
    if (data.city !== undefined) updateData.city = data.city;
    if (data.gender !== undefined) updateData.gender = data.gender;
    if (data.price !== undefined) updateData.price = data.price;
    if (data.securityDeposit !== undefined) updateData.security_deposit = data.securityDeposit;
    if (data.amenities !== undefined) updateData.amenities = Array.isArray(data.amenities) ? data.amenities.join(',') : data.amenities;
    if (data.images !== undefined) updateData.images = Array.isArray(data.images) ? data.images.join(',') : data.images;
    if (data.status !== undefined) updateData.status = data.status;
    if (data.isVerified !== undefined) updateData.is_verified = data.isVerified;

    const { data: pg, error } = await supabase
      .from('pgs')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json(pg);
  } catch (error) {
    console.error('Error updating PG:', error);
    return NextResponse.json({ error: 'Failed to update PG' }, { status: 500 });
  }
}
