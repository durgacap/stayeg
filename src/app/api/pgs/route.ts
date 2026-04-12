import { supabase } from '@/lib/supabase';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('query') || '';
    const gender = searchParams.get('gender') || '';
    const minPrice = parseFloat(searchParams.get('minPrice') || '0');
    const maxPrice = parseFloat(searchParams.get('maxPrice') || '999999');
    const sortBy = searchParams.get('sortBy') || 'rating';
    const city = searchParams.get('city') || 'Bangalore';
    const amenities = searchParams.get('amenities')?.split(',').filter(Boolean) || [];
    const ownerId = searchParams.get('ownerId') || '';

    let supabaseQuery = supabase
      .from('pgs')
      .select('*, owner:users(id,name,phone,avatar), rooms(*, beds(*))');

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
    if (error) throw error;

    const formatted = (pgs || []).map((pg: any) => ({
      ...pg,
      images: pg.images ? pg.images.split(',').filter(Boolean) : [],
      amenities: pg.amenities ? pg.amenities.split(',').filter(Boolean) : [],
      rooms: pg.rooms?.map((room: any) => ({
        ...room,
        beds: room.beds?.map((bed: any) => ({
          ...bed,
          price: bed.price ?? pg.price,
        })),
      })),
    }));

    return NextResponse.json(formatted);
  } catch (error) {
    console.error('Error fetching PGs:', error);
    return NextResponse.json({ error: 'Failed to fetch PGs' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
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
