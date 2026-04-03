import { db } from '@/lib/db';
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

    const where: Record<string, unknown> = {};

    // Owner view: show all their PGs regardless of status
    if (ownerId) {
      where.ownerId = ownerId;
    } else {
      where.status = 'APPROVED';
      where.city = city;
    }

    if (gender && gender !== 'ALL') {
      where.gender = gender;
    }

    if (query) {
      where.OR = [
        { name: { contains: query } },
        { address: { contains: query } },
      ];
    }

    // Only apply city filter if not owner view
    if (!ownerId && city) {
      where.city = city;
    }

    if (minPrice > 0 || maxPrice < 999999) {
      where.price = { gte: minPrice, lte: maxPrice };
    }

    if (amenities.length > 0) {
      where.AND = amenities.map((a) => ({ amenities: { contains: a } }));
    }

    const orderBy: Record<string, string> = {};
    if (sortBy === 'price_asc') orderBy.price = 'asc';
    else if (sortBy === 'price_desc') orderBy.price = 'desc';
    else if (sortBy === 'rating') orderBy.rating = 'desc';
    else if (sortBy === 'newest') orderBy.createdAt = 'desc';

    const pgs = await db.pG.findMany({
      where,
      orderBy,
      include: {
        owner: {
          select: { id: true, name: true, phone: true, avatar: true },
        },
        rooms: {
          include: {
            beds: true,
          },
        },
      },
      take: 50,
    });

    const formatted = pgs.map((pg) => ({
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
    const pg = await db.pG.create({
      data: {
        name, ownerId, description, address,
        city: city || 'Bangalore',
        gender: gender || 'UNISEX',
        price: price || 0,
        securityDeposit: securityDeposit || 0,
        amenities: amenities ? amenities.join(',') : '',
        images: images ? images.join(',') : '',
        status: 'PENDING',
      },
    });
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
    if (data.securityDeposit !== undefined) updateData.securityDeposit = data.securityDeposit;
    if (data.amenities !== undefined) updateData.amenities = Array.isArray(data.amenities) ? data.amenities.join(',') : data.amenities;
    if (data.images !== undefined) updateData.images = Array.isArray(data.images) ? data.images.join(',') : data.images;
    const pg = await db.pG.update({ where: { id }, data: updateData });
    return NextResponse.json(pg);
  } catch (error) {
    console.error('Error updating PG:', error);
    return NextResponse.json({ error: 'Failed to update PG' }, { status: 500 });
  }
}
