import { supabase } from '@/lib/supabase';
import { NextRequest, NextResponse } from 'next/server';
import { requireSession } from '@/lib/api-auth';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const pgId = searchParams.get('pgId');
    const role = searchParams.get('role');

    let query = supabase
      .from('workers')
      .select('*')
      .order('role', { ascending: true });

    if (pgId) query = query.eq('pg_id', pgId);
    if (role) query = query.eq('role', role);

    const { data: workers, error } = await query;
    if (error) {
      console.error('GET /api/workers error:', error.message);
      return NextResponse.json({ error: 'Failed to fetch workers' }, { status: 500 });
    }

    return NextResponse.json(workers || []);
  } catch (error) {
    console.error('GET /api/workers error:', error);
    return NextResponse.json({ error: 'Failed to fetch workers' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    // Auth guard: verify user session before creating worker
    const authResult = await requireSession(request);
    if ('error' in authResult) return authResult.error;

    const body = await request.json();
    const { data: worker, error } = await supabase
      .from('workers')
      .insert({
        name: body.name,
        role: body.role,
        phone: body.phone,
        pg_id: body.pgId,
        shift: body.shift,
      })
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json(worker, { status: 201 });
  } catch (error) {
    console.error('POST /api/workers error:', error);
    return NextResponse.json({ error: 'Failed to create worker' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    // Auth guard: verify user session before updating worker
    const authResult = await requireSession(request);
    if ('error' in authResult) return authResult.error;

    const body = await request.json();
    const { id, ...data } = body;

    if (!id) {
      return NextResponse.json({ error: 'id is required' }, { status: 400 });
    }

    const updateData: Record<string, unknown> = {};
    if (data.name !== undefined) updateData.name = data.name;
    if (data.role !== undefined) updateData.role = data.role;
    if (data.phone !== undefined) updateData.phone = data.phone;
    if (data.shift !== undefined) updateData.shift = data.shift;
    if (data.status !== undefined) updateData.status = data.status;
    if (data.pgId !== undefined) updateData.pg_id = data.pgId;

    const { data: worker, error } = await supabase
      .from('workers')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json(worker);
  } catch (error) {
    console.error('PUT /api/workers error:', error);
    return NextResponse.json({ error: 'Failed to update worker' }, { status: 500 });
  }
}
