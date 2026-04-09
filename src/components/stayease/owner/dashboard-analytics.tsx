'use client';

import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell,
} from 'recharts';
import {
  Building2, BedDouble, TrendingUp, IndianRupee, AlertTriangle,
  Activity, Users, CalendarDays, CreditCard, MessageSquare,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAppStore } from '@/store/use-app-store';

const COLORS = ['#0D9488', '#F97066', '#D97706'];

const OWNER_ID = 'owner-rajesh';

export default function OwnerDashboard() {
  const { setCurrentView } = useAppStore();
  const { data: ownerUser } = useQuery({
    queryKey: ['owner-user'],
    queryFn: async () => {
      const res = await fetch('/api/auth?role=OWNER');
      const users = await res.json();
      return users[0] || null;
    },
  });

  const ownerId = ownerUser?.id || OWNER_ID;

  const { data: analytics, isLoading } = useQuery({
    queryKey: ['owner-analytics', ownerId],
    queryFn: async () => {
      const res = await fetch(`/api/analytics?ownerId=${ownerId}`);
      if (!res.ok) throw new Error('Failed to fetch analytics');
      return res.json();
    },
    enabled: !!ownerId,
    refetchInterval: 30000,
  });

  const { data: recentBookings } = useQuery({
    queryKey: ['owner-recent-bookings', ownerId],
    queryFn: async () => {
      const pgs = await fetch(`/api/pgs?ownerId=${ownerId}`).then(r => r.json());
      const pgIds = pgs.map((p: { id: string }) => p.id);
      if (pgIds.length === 0) return [];
      const results = await Promise.all(
        pgIds.map((id: string) => fetch(`/api/bookings?pgId=${id}`).then(r => r.json()).catch(() => []))
      );
      return results.flat();
    },
    enabled: !!ownerId,
  });

  const { data: complaints } = useQuery({
    queryKey: ['owner-complaints', ownerId],
    queryFn: async () => {
      const pgs = await fetch(`/api/pgs?ownerId=${ownerId}`).then(r => r.json());
      const pgIds = pgs.map((p: { id: string }) => p.id);
      if (pgIds.length === 0) return [];
      const results = await Promise.all(
        pgIds.map((id: string) => fetch(`/api/complaints?pgId=${id}`).then(r => r.json()))
      );
      return results.flat();
    },
    enabled: !!ownerId,
  });

  const statCards = useMemo(() => {
    if (!analytics) return [];
    return [
      {
        title: 'Total PGs',
        value: analytics.totalPGs,
        icon: Building2,
        color: 'from-brand-deep to-brand-teal',
        bgColor: 'bg-brand-teal/10',
        textColor: 'text-brand-teal',
      },
      {
        title: 'Total Beds',
        value: analytics.totalBeds,
        icon: BedDouble,
        color: 'from-blue-500 to-cyan-500',
        bgColor: 'bg-blue-50',
        textColor: 'text-blue-700',
      },
      {
        title: 'Occupancy Rate',
        value: `${analytics.occupancyRate}%`,
        icon: TrendingUp,
        color: 'from-green-500 to-emerald-500',
        bgColor: 'bg-green-50',
        textColor: 'text-green-700',
      },
      {
        title: 'Monthly Revenue',
        value: `₹${(analytics.monthlyRevenue || 0).toLocaleString('en-IN')}`,
        icon: IndianRupee,
        color: 'from-purple-500 to-violet-500',
        bgColor: 'bg-purple-50',
        textColor: 'text-purple-700',
      },
    ];
  }, [analytics]);

  const genderData = useMemo(() => {
    if (!analytics?.genderDistribution) return [];
    const d = analytics.genderDistribution;
    return [
      { name: 'Male', value: d.male },
      { name: 'Female', value: d.female },
      { name: 'Unisex', value: d.unisex },
    ].filter(item => item.value > 0);
  }, [analytics]);

  const recentActivity = useMemo(() => {
    const items: { type: string; message: string; time: string; icon: React.ReactNode }[] = [];
    if (recentBookings?.length) {
      recentBookings.slice(0, 3).forEach((b: { user?: { name: string }; pg?: { name: string }; createdAt: string }) => {
        items.push({
          type: 'booking',
          message: `${b.user?.name || 'Tenant'} booked at ${b.pg?.name || 'PG'}`,
          time: new Date(b.createdAt).toLocaleDateString('en-IN'),
          icon: <CalendarDays className="size-4 text-blue-500" />,
        });
      });
    }
    if (complaints?.length) {
      complaints.slice(0, 3).forEach((c: { user?: { name: string }; title: string; createdAt: string }) => {
        items.push({
          type: 'complaint',
          message: `${c.user?.name || 'Tenant'}: ${c.title}`,
          time: new Date(c.createdAt).toLocaleDateString('en-IN'),
          icon: <MessageSquare className="size-4 text-red-500" />,
        });
      });
    }
    return items.slice(0, 6);
  }, [recentBookings, complaints]);

  const openComplaints = complaints?.filter(
    (c: { status: string }) => c.status === 'OPEN' || c.status === 'IN_PROGRESS'
  ).length || 0;

  if (isLoading) {
    return (
      <div className="p-4 md:p-6 space-y-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-20 bg-muted rounded" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Owner Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            Welcome back, {ownerUser?.name || 'Owner'}! Here&apos;s your PG overview.
          </p>
        </div>
        <Badge variant="outline" className="self-start text-brand-teal border-brand-teal/20 bg-brand-teal/10 px-3 py-1.5">
          <Activity className="size-3.5 mr-1.5" />
          Live Overview
        </Badge>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {statCards.map((stat, index) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className="hover:shadow-md transition-shadow cursor-pointer">
              <CardContent className="p-4 md:p-5">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground font-medium">{stat.title}</p>
                    <p className={`text-2xl font-bold mt-1 ${stat.textColor}`}>{stat.value}</p>
                  </div>
                  <div className={`${stat.bgColor} p-2.5 rounded-xl`}>
                    <stat.icon className={`size-5 ${stat.textColor}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Open Complaints Banner */}
      {openComplaints > 0 && (
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card
            className="border-red-200 bg-gradient-to-r from-red-50 to-brand-teal/10 cursor-pointer hover:shadow-md transition-shadow"
            onClick={() => setCurrentView('OWNER_COMPLAINTS')}
          >
            <CardContent className="p-4 flex items-center gap-4">
              <div className="bg-red-100 p-3 rounded-xl">
                <AlertTriangle className="size-5 text-red-600" />
              </div>
              <div className="flex-1">
                <p className="font-semibold text-red-800">{openComplaints} Open Complaints</p>
                <p className="text-sm text-red-600">Requires your attention. Click to view details.</p>
              </div>
              <Badge className="bg-red-100 text-red-700 hover:bg-red-200">{openComplaints}</Badge>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Trend */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <IndianRupee className="size-4 text-green-600" />
                Revenue Trend
              </CardTitle>
            </CardHeader>
            <CardContent>
              {analytics?.revenueTrend?.length > 0 ? (
                <div className="h-56">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={analytics.revenueTrend}>
                      <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                      <YAxis tick={{ fontSize: 12 }} tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`} />
                      <Tooltip formatter={(value: number) => [`₹${value.toLocaleString('en-IN')}`, 'Revenue']} />
                      <Bar dataKey="revenue" fill="#0D9488" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="h-56 flex items-center justify-center text-muted-foreground">
                  No revenue data available
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Gender Distribution */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <Users className="size-4 text-purple-600" />
                PG Gender Distribution
              </CardTitle>
            </CardHeader>
            <CardContent>
              {genderData.length > 0 ? (
                <div className="h-56 flex items-center justify-center">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={genderData}
                        cx="50%"
                        cy="50%"
                        innerRadius={50}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                        label={({ name, value }) => `${name}: ${value}`}
                      >
                        {genderData.map((_, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="h-56 flex items-center justify-center text-muted-foreground">
                  No gender data available
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Second Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Quick Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-semibold">Quick Stats</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-blue-50 rounded-xl">
                <div className="flex items-center gap-3">
                  <BedDouble className="size-4 text-blue-600" />
                  <span className="text-sm text-foreground">Available Beds</span>
                </div>
                <span className="font-semibold text-blue-700">{(analytics?.totalBeds ?? 0) - (analytics?.occupiedBeds ?? 0)}</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-green-50 rounded-xl">
                <div className="flex items-center gap-3">
                  <Users className="size-4 text-green-600" />
                  <span className="text-sm text-foreground">Active Tenants</span>
                </div>
                <span className="font-semibold text-green-700">{analytics?.totalTenants || 0}</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-xl">
                <div className="flex items-center gap-3">
                  <CreditCard className="size-4 text-yellow-600" />
                  <span className="text-sm text-foreground">Pending Payments</span>
                </div>
                <span className="font-semibold text-yellow-700">{analytics?.pendingPayments || 0}</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-purple-50 rounded-xl">
                <div className="flex items-center gap-3">
                  <CalendarDays className="size-4 text-purple-600" />
                  <span className="text-sm text-foreground">Active Bookings</span>
                </div>
                <span className="font-semibold text-purple-700">{analytics?.activeBookings || 0}</span>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Recent Activity */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="lg:col-span-2"
        >
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <Activity className="size-4 text-brand-teal" />
                Recent Activity
              </CardTitle>
            </CardHeader>
            <CardContent>
              {recentActivity.length > 0 ? (
                <div className="space-y-3 max-h-64 overflow-y-auto pr-1">
                  {recentActivity.map((item, index) => (
                    <div
                      key={index}
                      className="flex items-start gap-3 p-3 rounded-xl hover:bg-muted transition-colors"
                    >
                      <div className="mt-0.5 bg-muted p-1.5 rounded-lg">
                        {item.icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-foreground truncate">{item.message}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">{item.time}</p>
                      </div>
                      <Badge
                        variant="outline"
                        className={`text-xs shrink-0 ${
                          item.type === 'complaint'
                            ? 'text-red-600 border-red-200'
                            : 'text-blue-600 border-blue-200'
                        }`}
                      >
                        {item.type}
                      </Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="h-32 flex items-center justify-center text-muted-foreground text-sm">
                  No recent activity
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
