import { db } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const ownerId = searchParams.get('ownerId');

    if (!ownerId) {
      return NextResponse.json({ error: 'ownerId is required' }, { status: 400 });
    }

    const pgs = await db.pG.findMany({ where: { ownerId }, select: { id: true } });
    const pgIds = pgs.map(p => p.id);

    const totalPGs = pgs.length;
    const totalRooms = await db.room.count({ where: { pgId: { in: pgIds } } });
    const totalBeds = await db.bed.count({ where: { room: { pgId: { in: pgIds } } } });
    const occupiedBeds = await db.bed.count({ where: { room: { pgId: { in: pgIds } }, status: 'OCCUPIED' } });
    const availableBeds = totalBeds - occupiedBeds;
    const occupancyRate = totalBeds > 0 ? Math.round((occupiedBeds / totalBeds) * 100) : 0;

    // Payments
    const payments = await db.payment.findMany({
      where: { pgId: { in: pgIds } }
    });
    const completedPayments = payments.filter(p => p.status === 'COMPLETED');
    const pendingPayments = payments.filter(p => p.status === 'PENDING');
    const monthlyRevenue = completedPayments.reduce((sum, p) => sum + p.amount, 0);
    const pendingAmount = pendingPayments.reduce((sum, p) => sum + p.amount, 0);

    // Bookings
    const totalTenants = occupiedBeds;
    const activeBookings = await db.booking.count({ where: { pgId: { in: pgIds }, status: { in: ['ACTIVE', 'CONFIRMED'] } } });

    // Revenue trend (last 6 months)
    const now = new Date();
    const revenueTrend: { month: string; revenue: number }[] = [];
    for (let i = 5; i >= 0; i--) {
      const monthStart = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 1);
      const monthPayments = completedPayments.filter(p => {
        if (!p.paidDate) return false;
        const paidDate = new Date(p.paidDate);
        return paidDate >= monthStart && paidDate < monthEnd;
      });
      const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      revenueTrend.push({
        month: monthNames[monthStart.getMonth()],
        revenue: monthPayments.reduce((sum, p) => sum + p.amount, 0),
      });
    }

    // Gender distribution
    const malePGs = await db.pG.count({ where: { ownerId, gender: 'MALE' } });
    const femalePGs = await db.pG.count({ where: { ownerId, gender: 'FEMALE' } });
    const unisexPGs = await db.pG.count({ where: { ownerId, gender: 'UNISEX' } });

    // Complaints summary
    const openComplaints = await db.complaint.count({ 
      where: { pgId: { in: pgIds }, status: { in: ['OPEN', 'IN_PROGRESS'] } }
    });

    return NextResponse.json({
      totalPGs,
      totalRooms,
      totalBeds,
      occupiedBeds,
      availableBeds,
      occupancyRate,
      monthlyRevenue,
      pendingPayments: pendingPayments.length,
      pendingAmount,
      totalTenants,
      activeBookings,
      revenueTrend,
      genderDistribution: { male: malePGs, female: femalePGs, unisex: unisexPGs },
      openComplaints,
    });
  } catch (error) {
    console.error('GET /api/analytics error:', error);
    return NextResponse.json({ error: 'Failed to fetch analytics' }, { status: 500 });
  }
}
