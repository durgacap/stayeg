import { supabase, isTableMissing } from '@/lib/supabase';
import { NextRequest, NextResponse } from 'next/server';
import { requireSession } from '@/lib/api-auth';

const DEMO_COMPLAINTS = [
  { id: 'demo-complaint-1', user_id: 'demo-tenant-001', pg_id: 'demo-pg-1', title: 'WiFi not working in Room A101', description: 'WiFi has been down since yesterday. Need it for work.', category: 'MAINTENANCE', priority: 'HIGH', status: 'OPEN', created_at: '2025-06-01T08:00:00Z', user: { id: 'demo-tenant-001', name: 'Rahul Sharma', email: 'rahul.sharma@example.com', phone: '+91 98765 43210', avatar: 'https://api.dicebear.com/9.x/avataaars/svg?seed=Rahul' }, pg: { id: 'demo-pg-1', name: 'CozyStay PG' } },
  { id: 'demo-complaint-2', user_id: 'demo-tenant-002', pg_id: 'demo-pg-3', title: 'Hot water not available', description: 'Geyser is not working in 1st floor bathroom.', category: 'MAINTENANCE', priority: 'MEDIUM', status: 'IN_PROGRESS', created_at: '2025-05-28T10:00:00Z', user: { id: 'demo-tenant-002', name: 'Priya M.', email: 'priya.m@example.com', phone: '+91 98765 43213', avatar: 'https://api.dicebear.com/9.x/avataaars/svg?seed=Priya' }, pg: { id: 'demo-pg-3', name: 'Sunrise Ladies PG' } },
  { id: 'demo-complaint-3', user_id: 'demo-tenant-003', pg_id: 'demo-pg-2', title: 'Common area cleaning needed', description: 'The common room on 2nd floor needs deep cleaning.', category: 'CLEANLINESS', priority: 'LOW', status: 'RESOLVED', created_at: '2025-05-20T14:00:00Z', resolution: 'Cleaning scheduled and completed.', user: { id: 'demo-tenant-003', name: 'Arjun K.', email: 'arjun.k@example.com', phone: '+91 98765 43214', avatar: 'https://api.dicebear.com/9.x/avataaars/svg?seed=Arjun' }, pg: { id: 'demo-pg-2', name: 'Green Valley PG' } },
  { id: 'demo-complaint-4', user_id: 'demo-tenant-001', pg_id: 'demo-pg-1', title: 'Noisy neighbors late at night', description: 'Room A102 plays loud music after 11 PM regularly.', category: 'NOISE', priority: 'MEDIUM', status: 'CLOSED', created_at: '2025-05-15T22:00:00Z', resolution: 'Warning issued to the tenant.', user: { id: 'demo-tenant-001', name: 'Rahul Sharma' }, pg: { id: 'demo-pg-1', name: 'CozyStay PG' } },
];

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const pgId = searchParams.get('pgId');
    const status = searchParams.get('status');

    let query = supabase
      .from('complaints')
      .select('*, pg:pgs(id,name), user:users(id,name,email,phone,avatar)')
      .order('created_at', { ascending: false });

    if (userId) query = query.eq('user_id', userId);
    if (pgId) query = query.eq('pg_id', pgId);
    if (status) query = query.eq('status', status);

    const { data: complaints, error } = await query;
    if (error) {
      if (isTableMissing(error)) {
        let filtered = [...DEMO_COMPLAINTS];
        if (userId) filtered = filtered.filter((c) => c.user_id === userId);
        if (pgId) filtered = filtered.filter((c) => c.pg_id === pgId);
        if (status) filtered = filtered.filter((c) => c.status === status);
        return NextResponse.json(filtered);
      }
      throw error;
    }

    return NextResponse.json(complaints || []);
  } catch (error) {
    console.error('Error fetching complaints:', error);
    return NextResponse.json({ error: 'Failed to fetch complaints' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    // Auth guard: verify user session before creating complaint
    const authResult = await requireSession(request);
    if ('error' in authResult) return authResult.error;

    const body = await request.json();
    const { userId, pgId, title, description, category, priority } = body;

    if (!userId || !pgId || !title) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const { data: complaint, error } = await supabase
      .from('complaints')
      .insert({
        user_id: userId,
        pg_id: pgId,
        title,
        description,
        category: category || 'GENERAL',
        priority: priority || 'MEDIUM',
      })
      .select('*, pg:pgs(name)')
      .single();

    if (error) throw error;
    return NextResponse.json(complaint, { status: 201 });
  } catch (error) {
    console.error('Error creating complaint:', error);
    return NextResponse.json({ error: 'Failed to create complaint' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    // Auth guard: verify user session before updating complaint
    const authResult = await requireSession(request);
    if ('error' in authResult) return authResult.error;

    const body = await request.json();
    const { id, status, assignedTo, resolution } = body;
    if (!id) {
      return NextResponse.json({ error: 'id is required' }, { status: 400 });
    }
    const updateData: Record<string, unknown> = {};
    if (status) updateData.status = status;
    if (assignedTo !== undefined) updateData.assigned_to = assignedTo;
    if (resolution !== undefined) updateData.resolution = resolution;

    const { data: complaint, error } = await supabase
      .from('complaints')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json(complaint);
  } catch (error) {
    console.error('Error updating complaint:', error);
    return NextResponse.json({ error: 'Failed to update complaint' }, { status: 500 });
  }
}
