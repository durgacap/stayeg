import { supabase } from '@/lib/supabase';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const type = searchParams.get('type');
    const city = searchParams.get('city');

    let query = supabase
      .from('vendors')
      .select('*')
      .order('rating', { ascending: false });

    if (type) query = query.eq('type', type);
    if (city) query = query.eq('city', city);

    const { data: vendors, error } = await query;
    if (error) throw error;

    return NextResponse.json(vendors || []);
  } catch (error) {
    console.error('GET /api/vendors error:', error);
    return NextResponse.json({ error: 'Failed to fetch vendors' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    if (!body.name || !body.type || !body.phone) {
      return NextResponse.json({ error: 'name, type, and phone are required' }, { status: 400 });
    }

    const { data: vendor, error } = await supabase
      .from('vendors')
      .insert({
        name: body.name,
        type: body.type,
        phone: body.phone,
        email: body.email,
        city: body.city || 'Bangalore',
        area: body.area,
      })
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json(vendor, { status: 201 });
  } catch (error) {
    console.error('POST /api/vendors error:', error);
    return NextResponse.json({ error: 'Failed to create vendor' }, { status: 500 });
  }
}
