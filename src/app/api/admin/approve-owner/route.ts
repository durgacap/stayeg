import { supabase } from '@/lib/supabase';
import { NextRequest, NextResponse } from 'next/server';

const ADMIN_SECRET = process.env.ADMIN_SECRET || 'stayeg-v1.2-secure-2025';

// GET - List pending owner signups (role='OWNER' AND is_approved=false)
export async function GET(request: NextRequest) {
  try {
    // Verify admin secret
    const adminSecret = request.headers.get('x-admin-secret');
    if (adminSecret !== ADMIN_SECRET) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { data, error } = await supabase
      .from('users')
      .select('id,name,email,phone,role,gender,is_verified,is_approved,city,occupation,bio,created_at')
      .eq('role', 'OWNER')
      .order('created_at', { ascending: false });

    if (error) {
      // Table missing - return empty
      return NextResponse.json({ demo: true, pending: [], approved: [] });
    }

    const pending = (data || []).filter(u => !u.is_approved);
    const approved = (data || []).filter(u => u.is_approved);

    return NextResponse.json({ demo: false, pending, approved });
  } catch (error) {
    return NextResponse.json({ demo: true, pending: [], approved: [] });
  }
}

// PUT - Approve or reject an owner signup
export async function PUT(request: NextRequest) {
  try {
    const adminSecret = request.headers.get('x-admin-secret');
    if (adminSecret !== ADMIN_SECRET) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { userId, action, reason } = await request.json();

    if (!userId || !['approve', 'reject'].includes(action)) {
      return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
    }

    const updateData: Record<string, unknown> = {
      is_approved: action === 'approve',
      is_verified: action === 'approve',
      updated_at: new Date().toISOString(),
    };

    if (action === 'reject' && reason) {
      updateData.rejection_reason = reason;
    }

    const { data, error } = await supabase
      .from('users')
      .update(updateData)
      .eq('id', userId)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, user: data });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update' }, { status: 500 });
  }
}
