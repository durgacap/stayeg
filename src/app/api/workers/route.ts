import { supabase, isTableMissing } from '@/lib/supabase';
import { NextRequest, NextResponse } from 'next/server';
import { requireSession } from '@/lib/api-auth';

const DEMO_WORKERS = [
  { id: 'demo-worker-1', name: 'Mohan', role: 'SECURITY', phone: '+91 98765 60001', pg_id: 'demo-pg-1', shift: 'NIGHT', status: 'ACTIVE' },
  { id: 'demo-worker-2', name: 'Lakshmi', role: 'COOK', phone: '+91 98765 60002', pg_id: 'demo-pg-1', shift: 'MORNING', status: 'ACTIVE' },
  { id: 'demo-worker-3', name: 'Suresh', role: 'CLEANER', phone: '+91 98765 60003', pg_id: 'demo-pg-2', shift: 'MORNING', status: 'ACTIVE' },
  { id: 'demo-worker-4', name: 'Geeta', role: 'MANAGER', phone: '+91 98765 60004', pg_id: 'demo-pg-3', shift: 'MORNING', status: 'ACTIVE' },
  { id: 'demo-worker-5', name: 'Ravi', role: 'MAINTENANCE', phone: '+91 98765 60005', pg_id: 'demo-pg-4', shift: 'EVENING', status: 'ACTIVE' },
];

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
      if (isTableMissing(error)) {
        let filtered = [...DEMO_WORKERS];
        if (pgId) filtered = filtered.filter((w) => w.pg_id === pgId);
        if (role) filtered = filtered.filter((w) => w.role === role);
        return NextResponse.json(filtered);
      }
      throw error;
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
