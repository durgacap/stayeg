import { db } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';

const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export async function GET(request: NextRequest) {
  try {
    const ownerId = request.nextUrl.searchParams.get('ownerId');

    if (!ownerId) {
      return NextResponse.json({ error: 'ownerId is required' }, { status: 400 });
    }

    // ----------------------------------------------------------------
    // 1. PGs & Rooms
    // ----------------------------------------------------------------
    const [totalPGs, rooms, beds] = await Promise.all([
      db.pG.count({ where: { ownerId } }),
      db.room.findMany({
        where: { pg: { ownerId } },
        select: { id: true },
      }),
      db.bed.findMany({
        where: { room: { pg: { ownerId } } },
        select: { id: true, status: true },
      }),
    ]);

    const totalRooms = rooms.length;
    const roomIds = rooms.map((r) => r.id);
    const totalBeds = beds.length;
    const occupiedBeds = beds.filter((b) => b.status === 'OCCUPIED').length;
    const availableBeds = totalBeds - occupiedBeds;
    const occupancyRate = totalBeds > 0 ? Math.round((occupiedBeds / totalBeds) * 100) : 0;

    // ----------------------------------------------------------------
    // 2. Tenants
    // ----------------------------------------------------------------
    const [totalTenants, activeTenants] = await Promise.all([
      db.tenant.count({ where: { ownerId } }),
      db.tenant.count({ where: { ownerId, status: 'ACTIVE' } }),
    ]);

    // ----------------------------------------------------------------
    // 3. Rent records – revenue & payment status
    // ----------------------------------------------------------------
    const now = new Date();
    const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

    const rentRecords = await db.rentRecord.findMany({
      where: { tenant: { ownerId } },
      include: { tenant: { select: { id: true } } },
    });

    // Monthly revenue = sum of PAID records for the current month
    const monthlyRevenue = rentRecords
      .filter((r) => r.month === currentMonth && r.status === 'PAID')
      .reduce((sum, r) => sum + r.amount, 0);

    // Pending payments (status = PENDING, regardless of month)
    const pendingRecords = rentRecords.filter((r) => r.status === 'PENDING');
    const pendingPayments = pendingRecords.length;
    const pendingAmount = pendingRecords.reduce((sum, r) => sum + r.amount, 0);

    // Overdue payments (status = OVERDUE)
    const overdueRecords = rentRecords.filter((r) => r.status === 'OVERDUE');
    const overduePayments = overdueRecords.length;
    const overdueAmount = overdueRecords.reduce((sum, r) => sum + r.amount, 0);

    // ----------------------------------------------------------------
    // 4. Open complaints
    // ----------------------------------------------------------------
    const openComplaints = await db.complaint.count({
      where: {
        pg: { ownerId },
        status: { in: ['OPEN', 'IN_PROGRESS'] },
      },
    });

    // ----------------------------------------------------------------
    // 5. Recent activity (last 20)
    // ----------------------------------------------------------------
    const recentLogs = await db.activityLog.findMany({
      where: { ownerId },
      orderBy: { createdAt: 'desc' },
      take: 20,
      select: {
        action: true,
        description: true,
        createdAt: true,
      },
    });

    const recentActivity = recentLogs.map((log) => ({
      action: log.action,
      description: log.description ?? '',
      createdAt: log.createdAt.toISOString(),
    }));

    // ----------------------------------------------------------------
    // 6. Rent due today or overdue
    // ----------------------------------------------------------------
    const today = now.getDate();

    // Tenants whose rentDueDay is today or has passed, and they don't have a PAID
    // record for the current month.
    const activeTenantList = await db.tenant.findMany({
      where: { ownerId, status: 'ACTIVE' },
      select: {
        id: true,
        name: true,
        phone: true,
        rentAmount: true,
        rentDueDay: true,
        pg: { select: { name: true } },
        rentRecords: {
          where: { month: currentMonth },
          select: { status: true },
        },
      },
    });

    const rentDue = activeTenantList
      .filter((t) => {
        // Only include if rent due day is today or earlier (not yet paid)
        const hasPaid = t.rentRecords.some((r) => r.status === 'PAID');
        if (hasPaid) return false;
        return t.rentDueDay <= today;
      })
      .map((t) => {
        const currentRecord = t.rentRecords.find((r) => r.status === 'PENDING' || r.status === 'OVERDUE');
        return {
          tenantName: t.name,
          phone: t.phone,
          amount: t.rentAmount,
          dueDay: t.rentDueDay,
          pgName: t.pg.name,
          status: currentRecord?.status ?? 'PENDING',
        };
      });

    // ----------------------------------------------------------------
    // 7. Revenue trend (last 6 months from PAID records)
    // ----------------------------------------------------------------
    const revenueTrend: { month: string; revenue: number }[] = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      const revenue = rentRecords
        .filter((r) => r.month === monthKey && r.status === 'PAID')
        .reduce((sum, r) => sum + r.amount, 0);
      revenueTrend.push({
        month: MONTH_NAMES[d.getMonth()],
        revenue,
      });
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
      overduePayments,
      overdueAmount,
      openComplaints,
      recentActivity,
      rentDue,
      revenueTrend,
    });
  } catch (error) {
    console.error('GET /api/analytics error:', error);
    return NextResponse.json({ error: 'Failed to fetch analytics' }, { status: 500 });
  }
}
