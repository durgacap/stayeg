import { supabase } from '@/lib/supabase';
import { NextRequest, NextResponse } from 'next/server';

const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export async function GET(request: NextRequest) {
  try {
    const ownerId = request.nextUrl.searchParams.get('ownerId');

    if (!ownerId) {
      return NextResponse.json({ error: 'ownerId is required' }, { status: 400 });
    }

    // ----------------------------------------------------------------
    // 1. PGs & Rooms & Beds
    // ----------------------------------------------------------------
    const [pgsRes, roomsRes, bedsRes] = await Promise.all([
      supabase.from('pgs').select('id').eq('owner_id', ownerId),
      supabase.from('rooms').select('id, pg_id').in('pg_id',
        (await supabase.from('pgs').select('id').eq('owner_id', ownerId)).data?.map(p => p.id) || ['__none__']
      ),
      supabase.from('beds').select('id, status, room_id').in('room_id',
        (await supabase.from('rooms').select('id').in('pg_id',
          (await supabase.from('pgs').select('id').eq('owner_id', ownerId)).data?.map(p => p.id) || ['__none__']
        )).data?.map(r => r.id) || ['__none__']
      ),
    ]);

    const totalPGs = pgsRes.data?.length ?? 0;
    const totalRooms = roomsRes.data?.length ?? 0;
    const beds = bedsRes.data ?? [];
    const totalBeds = beds.length;
    const occupiedBeds = beds.filter((b: { status: string }) => b.status === 'OCCUPIED').length;
    const availableBeds = totalBeds - occupiedBeds;
    const occupancyRate = totalBeds > 0 ? Math.round((occupiedBeds / totalBeds) * 100) : 0;

    // ----------------------------------------------------------------
    // 2. Tenants (users with active bookings in this owner's PGs)
    // ----------------------------------------------------------------
    const pgIds = pgsRes.data?.map((p: { id: string }) => p.id) || [];
    let totalTenants = 0;
    let activeTenants = 0;

    if (pgIds.length > 0) {
      const bookingsRes = await supabase
        .from('bookings')
        .select('user_id, status')
        .in('pg_id', pgIds);

      const bookings = bookingsRes.data ?? [];
      const uniqueUserIds = new Set(bookings.map((b: { user_id: string }) => b.user_id));
      totalTenants = uniqueUserIds.size;
      activeTenants = new Set(
        bookings.filter((b: { status: string }) => ['ACTIVE', 'CONFIRMED'].includes(b.status))
          .map((b: { user_id: string }) => b.user_id)
      ).size;
    }

    // ----------------------------------------------------------------
    // 3. Payments — revenue & payment status
    // ----------------------------------------------------------------
    const now = new Date();
    const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

    let monthlyRevenue = 0;
    let pendingPayments = 0;
    let pendingAmount = 0;

    if (pgIds.length > 0) {
      const paymentsRes = await supabase
        .from('payments')
        .select('amount, status, created_at')
        .in('pg_id', pgIds);

      const payments = paymentsRes.data ?? [];

      // Monthly revenue = sum of COMPLETED payments for the current month
      monthlyRevenue = payments
        .filter((p: { status: string; created_at: string }) =>
          p.status === 'COMPLETED' && p.created_at?.startsWith(currentMonth)
        )
        .reduce((sum: number, p: { amount: number }) => sum + (p.amount || 0), 0);

      // Pending payments
      const pendingRecs = payments.filter((p: { status: string }) => p.status === 'PENDING');
      pendingPayments = pendingRecs.length;
      pendingAmount = pendingRecs.reduce((sum: number, p: { amount: number }) => sum + (p.amount || 0), 0);
    }

    // ----------------------------------------------------------------
    // 4. Open complaints
    // ----------------------------------------------------------------
    let openComplaints = 0;
    if (pgIds.length > 0) {
      const complaintsRes = await supabase
        .from('complaints')
        .select('id')
        .in('pg_id', pgIds)
        .in('status', ['OPEN', 'IN_PROGRESS']);
      openComplaints = complaintsRes.data?.length ?? 0;
    }

    // ----------------------------------------------------------------
    // 5. Recent activity (from activity_log table)
    // ----------------------------------------------------------------
    let recentActivity: { action: string; description: string; createdAt: string }[] = [];
    try {
      const logsRes = await supabase
        .from('activity_log')
        .select('action, details, created_at')
        .eq('owner_id', ownerId)
        .order('created_at', { ascending: false })
        .limit(20);

      recentActivity = (logsRes.data ?? []).map((log: { action: string; details: string | null; created_at: string }) => ({
        action: log.action,
        description: log.details ?? '',
        createdAt: log.created_at,
      }));
    } catch {
      // activity_log table may not exist yet — return empty
    }

    // ----------------------------------------------------------------
    // 6. Revenue trend (last 6 months)
    // ----------------------------------------------------------------
    const revenueTrend: { month: string; revenue: number }[] = [];
    if (pgIds.length > 0) {
      const paymentsRes = await supabase
        .from('payments')
        .select('amount, status, created_at')
        .in('pg_id', pgIds)
        .eq('status', 'COMPLETED');

      const completedPayments = paymentsRes.data ?? [];

      for (let i = 5; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const monthKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
        const revenue = completedPayments
          .filter((p: { created_at: string }) => p.created_at?.startsWith(monthKey))
          .reduce((sum: number, p: { amount: number }) => sum + (p.amount || 0), 0);
        revenueTrend.push({
          month: MONTH_NAMES[d.getMonth()],
          revenue,
        });
      }
    }

    // ----------------------------------------------------------------
    // Response
    // ----------------------------------------------------------------
    return NextResponse.json({
      totalPGs,
      totalRooms,
      totalBeds,
      occupiedBeds,
      availableBeds,
      vacantBeds: availableBeds,
      occupancyRate,
      totalTenants,
      activeTenants,
      monthlyRevenue,
      pendingPayments,
      pendingAmount,
      openComplaints,
      recentActivity,
      revenueTrend,
    });
  } catch (error) {
    console.error('GET /api/analytics error:', error);
    return NextResponse.json({ error: 'Failed to fetch analytics' }, { status: 500 });
  }
}
