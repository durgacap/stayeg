import { supabase, isTableMissing } from '@/lib/supabase';
import { NextRequest, NextResponse } from 'next/server';
import { requireSession } from '@/lib/api-auth';

const DEMO_VENDORS = [
  { id: 'demo-vendor-1', name: 'Ramesh Plumbing', type: 'PLUMBER', phone: '+91 98765 11111', email: 'ramesh@plumb.in', city: 'Bangalore', area: 'Koramangala', rating: 4.5, status: 'ACTIVE', description: 'Expert plumber with 10 years experience', experience: 10, price_range: '₹200-₹500' },
  { id: 'demo-vendor-2', name: 'Quick Electric', type: 'ELECTRICIAN', phone: '+91 98765 22222', email: 'quick@electric.in', city: 'Bangalore', area: 'HSR Layout', rating: 4.2, status: 'ACTIVE', description: 'Electrical repair and installation', experience: 8, price_range: '₹300-₹800' },
  { id: 'demo-vendor-3', name: 'Sparkle Clean', type: 'CLEANER', phone: '+91 98765 33333', city: 'Bangalore', area: 'Indiranagar', rating: 4.7, status: 'ACTIVE', description: 'Deep cleaning services for PGs', experience: 5, price_range: '₹150-₹400' },
  { id: 'demo-vendor-4', name: 'NetConnect WiFi', type: 'WIFI', phone: '+91 98765 44444', email: 'support@netconnect.in', city: 'Bangalore', area: 'Whitefield', rating: 4.0, status: 'ACTIVE', description: 'High-speed WiFi installation and maintenance', experience: 7, price_range: '₹500-₹1500' },
  { id: 'demo-vendor-5', name: 'Fresh Paint Co', type: 'PAINTER', phone: '+91 98765 55555', city: 'Bangalore', area: 'Marathahalli', rating: 4.3, status: 'ACTIVE', description: 'Interior and exterior painting', experience: 12, price_range: '₹200-₹600' },
];

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
    if (error) {
      if (isTableMissing(error)) {
        let filtered = [...DEMO_VENDORS];
        if (type) filtered = filtered.filter((v) => v.type === type);
        if (city) filtered = filtered.filter((v) => v.city === city);
        return NextResponse.json(filtered);
      }
      throw error;
    }

    return NextResponse.json(vendors || []);
  } catch (error) {
    console.error('GET /api/vendors error:', error);
    return NextResponse.json({ error: 'Failed to fetch vendors' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    // Auth guard: verify user session before creating vendor
    const authResult = await requireSession(request);
    if ('error' in authResult) return authResult.error;

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
