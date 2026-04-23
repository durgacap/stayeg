import { supabase, isTableMissing } from '@/lib/supabase';
import { NextRequest, NextResponse } from 'next/server';

const DEMO_ANALYTICS = {
  totalPGs: 5,
  totalRooms: 7,
  totalBeds: 20,
  occupiedBeds: 8,
  availableBeds: 12,
  occupancyRate: 40,
  monthlyRevenue: 285000,
  pendingPayments: 3,
  pendingAmount: 25500,
  totalTenants: 8,
  activeBookings: 8,
  revenueTrend: [
    { month: 'Nov', revenue: 220000 },
    { month: 'Dec', revenue: 245000 },
    { month: 'Jan', revenue: 260000 },
    { month: 'Feb', revenue: 275000 },
    { month: 'Mar', revenue: 280000 },
    { month: 'Apr', revenue: 285000 },
  ],
  genderDistribution: { male: 2, female: 2, unisex: 1 },
  openComplaints: 2,
};

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const ownerId = searchParams.get('ownerId');

    if (!ownerId) {
      return NextResponse.json({ error: 'ownerId is required' }, { status: 400 });
    }

    // Get all PG IDs for this owner
    const { data: pgs, error: pgError } = await supabase
      .from('pgs')
      .select('id')
      .eq('owner_id', ownerId);

    if (pgError) {
      if (isTableMissing(pgError)) return NextResponse.json(DEMO_ANALYTICS);
      throw pgError;
    }
    const pgIds = (pgs || []).map((p: any) => p.id);
    if (pgIds.length === 0) {
      return NextResponse.json({
        totalPGs: 0, totalRooms: 0, totalBeds: 0, occupiedBeds: 0,
        availableBeds: 0, occupancyRate: 0, monthlyRevenue: 0,
        pendingPayments: 0, pendingAmount: 0, totalTenants: 0,
        activeBookings: 0, revenueTrend: [], genderDistribution: { male: 0, female: 0, unisex: 0 },
        openComplaints: 0,
      });
    }

    const totalPGs = pgIds.length;

    // Rooms count
    const { count: totalRooms } = await supabase
      .from('rooms')
      .select('*', { count: 'exact', head: true })
      .in('pg_id', pgIds);

    // Beds count
    const { count: totalBeds } = await supabase
      .from('beds')
      .select('*', { count: 'exact', head: true })
      .in('room_id', (await supabase.from('rooms').select('id').in('pg_id', pgIds)).data?.map((r: any) => r.id) || []);

    // Occupied beds
    const { count: occupiedBeds } = await supabase
      .from('beds')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'OCCUPIED')
      .in('room_id', (await supabase.from('rooms').select('id').in('pg_id', pgIds)).data?.map((r: any) => r.id) || []);

    const totalBedsNum = totalBeds || 0;
    const occupiedBedsNum = occupiedBeds || 0;
    const availableBeds = totalBedsNum - occupiedBedsNum;
    const occupancyRate = totalBedsNum > 0 ? Math.round((occupiedBedsNum / totalBedsNum) * 100) : 0;

    // Payments
    const { data: payments } = await supabase
      .from('payments')
      .select('*')
      .in('pg_id', pgIds);

    const allPayments = payments || [];
    const completedPayments = allPayments.filter((p: any) => p.status === 'COMPLETED');
    const pendingPayments = allPayments.filter((p: any) => p.status === 'PENDING');
    const monthlyRevenue = completedPayments.reduce((sum: number, p: any) => sum + (p.amount || 0), 0);
    const pendingAmount = pendingPayments.reduce((sum: number, p: any) => sum + (p.amount || 0), 0);

    // Active bookings
    const { count: activeBookings } = await supabase
      .from('bookings')
      .select('*', { count: 'exact', head: true })
      .in('pg_id', pgIds)
      .in('status', ['ACTIVE', 'CONFIRMED']);

    // Revenue trend (last 6 months)
    const now = new Date();
    const revenueTrend: { month: string; revenue: number }[] = [];
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    for (let i = 5; i >= 0; i--) {
      const monthStart = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 1);
      const monthPayments = completedPayments.filter((p: any) => {
        if (!p.paid_date) return false;
        const paidDate = new Date(p.paid_date);
        return paidDate >= monthStart && paidDate < monthEnd;
      });
      revenueTrend.push({
        month: monthNames[monthStart.getMonth()],
        revenue: monthPayments.reduce((sum: number, p: any) => sum + (p.amount || 0), 0),
      });
    }

    // Gender distribution
    const { count: malePGs } = await supabase.from('pgs').select('*', { count: 'exact', head: true }).eq('owner_id', ownerId).eq('gender', 'MALE');
    const { count: femalePGs } = await supabase.from('pgs').select('*', { count: 'exact', head: true }).eq('owner_id', ownerId).eq('gender', 'FEMALE');
    const { count: unisexPGs } = await supabase.from('pgs').select('*', { count: 'exact', head: true }).eq('owner_id', ownerId).eq('gender', 'UNISEX');

    // Open complaints
    const { count: openComplaints } = await supabase
      .from('complaints')
      .select('*', { count: 'exact', head: true })
      .in('pg_id', pgIds)
      .in('status', ['OPEN', 'IN_PROGRESS']);

    return NextResponse.json({
      totalPGs,
      totalRooms: totalRooms || 0,
      totalBeds: totalBedsNum,
      occupiedBeds: occupiedBedsNum,
      availableBeds,
      occupancyRate,
      monthlyRevenue,
      pendingPayments: pendingPayments.length,
      pendingAmount,
      totalTenants: occupiedBedsNum,
      activeBookings: activeBookings || 0,
      revenueTrend,
      genderDistribution: { male: malePGs || 0, female: femalePGs || 0, unisex: unisexPGs || 0 },
      openComplaints: openComplaints || 0,
    });
  } catch (error) {
    console.error('GET /api/analytics error:', error);
    return NextResponse.json({ error: 'Failed to fetch analytics' }, { status: 500 });
  }
}
