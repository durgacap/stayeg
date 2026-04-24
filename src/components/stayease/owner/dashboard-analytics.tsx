'use client';

import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import {
  Building2, BedDouble, Users, IndianRupee, AlertTriangle,
  Activity, CalendarDays, CreditCard, MessageSquare, TrendingUp,
  Plus, QrCode, HelpCircle, ChevronRight, Phone, Clock,
} from 'lucide-react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useAppStore } from '@/store/use-app-store';
import { BADGE, TEXT_COLOR, CARD_BG } from '@/lib/constants';

export default function OwnerDashboard() {
  const { setCurrentView, currentUser } = useAppStore();
  const [showBenefits, setShowBenefits] = useState(false);

  const { data: ownerUser } = useQuery({
    queryKey: ['owner-user'],
    queryFn: async () => {
      const res = await fetch('/api/auth?role=OWNER');
      if (!res.ok) throw new Error('Failed to fetch owner');
      const users = await res.json();
      return (Array.isArray(users) ? users : users.users)?.[0] || null;
    },
  });

  const ownerId = ownerUser?.id;

  const { data: analytics, isLoading, isError, refetch } = useQuery({
    queryKey: ['owner-analytics', ownerId],
    queryFn: async () => {
      const res = await fetch(`/api/analytics?ownerId=${ownerId}`);
      if (!res.ok) throw new Error('Failed to fetch analytics');
      return res.json();
    },
    enabled: !!ownerId,
    refetchInterval: 30000,
  });

  const { data: ownerPGs } = useQuery({
    queryKey: ['owner-pgs', ownerId],
    queryFn: async () => {
      const res = await fetch(`/api/pgs?ownerId=${ownerId}`);
      if (!res.ok) throw new Error('Failed to fetch PGs');
      return res.json();
    },
    enabled: !!ownerId,
  });

  const ownerPgIds = useMemo(() => ownerPGs?.map((p: { id: string }) => p.id) || [], [ownerPGs]);

  const { data: complaints } = useQuery({
    queryKey: ['owner-complaints', ownerPgIds],
    queryFn: async () => {
      if (ownerPgIds.length === 0) return [];
      const results = await Promise.all(
        ownerPgIds.map((id: string) => fetch(`/api/complaints?pgId=${id}`).then(r => r.json()).catch(() => []))
      );
      return results.flat();
    },
    enabled: ownerPgIds.length > 0,
  });

  const openComplaints = complaints?.filter(
    (c: { status: string }) => c.status === 'OPEN' || c.status === 'IN_PROGRESS'
  ).length || 0;

  const statCards = useMemo(() => {
    if (!analytics) return [];
    return [
      {
        title: 'Total Tenants',
        value: analytics.totalTenants || 0,
        icon: Users,
        bgColor: 'bg-brand-teal/10',
        textColor: 'text-brand-teal',
      },
      {
        title: 'Occupied Beds',
        value: analytics.occupiedBeds || 0,
        icon: BedDouble,
        bgColor: CARD_BG.blue,
        textColor: TEXT_COLOR.blue,
      },
      {
        title: 'Vacant Beds',
        value: analytics.vacantBeds || analytics.availableBeds || 0,
        icon: BedDouble,
        bgColor: CARD_BG.green,
        textColor: TEXT_COLOR.green,
      },
      {
        title: 'Monthly Revenue',
        value: `₹${(analytics.monthlyRevenue || 0).toLocaleString('en-IN')}`,
        icon: IndianRupee,
        bgColor: CARD_BG.purple,
        textColor: TEXT_COLOR.purple,
      },
      {
        title: 'Pending Rent',
        value: `₹${(analytics.pendingAmount || 0).toLocaleString('en-IN')}`,
        icon: CalendarDays,
        bgColor: CARD_BG.yellow,
        textColor: TEXT_COLOR.yellow,
      },
      {
        title: 'Overdue',
        value: analytics.overduePayments || 0,
        icon: AlertTriangle,
        bgColor: CARD_BG.red,
        textColor: TEXT_COLOR.red,
      },
    ];
  }, [analytics]);

  const quickActions = [
    { label: 'Add PG', icon: Building2, view: 'OWNER_PGS' as const, color: 'from-brand-deep to-brand-teal' },
    { label: 'Add Tenant', icon: Users, view: 'OWNER_TENANTS' as const, color: 'from-emerald-500 to-green-600' },
    { label: 'Rooms & Beds', icon: BedDouble, view: 'OWNER_ROOMS' as const, color: 'from-blue-500 to-cyan-500' },
    { label: 'Collect Rent', icon: CreditCard, view: 'OWNER_RENT' as const, color: 'from-amber-500 to-orange-500' },
    { label: 'Complaints', icon: MessageSquare, view: 'OWNER_COMPLAINTS' as const, color: 'from-red-500 to-rose-500' },
    { label: 'Vendors', icon: Phone, view: 'OWNER_VENDORS' as const, color: 'from-violet-500 to-purple-500' },
  ];

  const rentDue = analytics?.rentDue || [];
  const recentActivity = analytics?.recentActivity || [];

  // Empty state for new owners
  const hasData = (ownerPGs?.length || 0) > 0;

  if (isLoading) {
    return (
      <div className="p-4 md:p-6 space-y-6 animate-pulse">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="space-y-2"><div className="h-8 w-48 bg-muted rounded" /><div className="h-4 w-72 bg-muted rounded" /></div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => <Card key={i}><CardContent className="p-4"><div className="h-16 bg-muted rounded" /></CardContent></Card>)}
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 space-y-6">
      {/* Error Banner */}
      {isError && (
        <div className="bg-destructive/10 border border-destructive/20 rounded-xl p-4 flex items-center gap-3">
          <AlertTriangle className="size-5 text-destructive shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-destructive">Failed to load dashboard data</p>
            <p className="text-xs text-muted-foreground mt-0.5">Please check your connection and try again.</p>
          </div>
          <Button variant="outline" size="sm" onClick={() => refetch()} className="shrink-0">Retry</Button>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            Welcome back, {currentUser?.name || ownerUser?.name || 'Owner'}!
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-brand-teal border-brand-teal/20 bg-brand-teal/10 px-3 py-1.5">
            <Activity className="size-3.5 mr-1.5" />
            Live
          </Badge>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowBenefits(!showBenefits)}
            className="text-muted-foreground"
          >
            <HelpCircle className="size-4 mr-1.5" />
            Why StayEg?
          </Button>
        </div>
      </div>

      {/* Benefits Section (collapsible) */}
      {showBenefits && (
        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}>
          <Card className="border-brand-teal/20 bg-gradient-to-r from-brand-teal/5 to-brand-sage/5">
            <CardContent className="p-5">
              <h3 className="font-semibold text-foreground mb-3">Why use StayEg for your PG?</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {[
                  { icon: CreditCard, title: 'Track Rent Easily', desc: 'Auto reminders, digital payments' },
                  { icon: Clock, title: 'Save Time', desc: 'Manage everything from phone' },
                  { icon: Users, title: 'Get More Tenants', desc: 'Verified listing, QR onboarding' },
                  { icon: TrendingUp, title: 'All-in-One', desc: 'Beds, rent, complaints, staff' },
                ].map((b) => (
                  <div key={b.title} className="flex items-start gap-2 p-3 bg-background/60 rounded-lg">
                    <b.icon className="size-4 text-brand-teal mt-0.5 shrink-0" />
                    <div>
                      <p className="text-xs font-semibold text-foreground">{b.title}</p>
                      <p className="text-[10px] text-muted-foreground">{b.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Quick Actions */}
      <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
        {quickActions.map((action, index) => (
          <motion.button
            key={action.view}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            onClick={() => setCurrentView(action.view)}
            className="flex flex-col items-center gap-2 p-3 md:p-4 rounded-xl bg-card border border-border hover:shadow-md transition-all active:scale-95"
          >
            <div className={`bg-gradient-to-br ${action.color} p-2.5 rounded-xl`}>
              <action.icon className="size-4 md:size-5 text-white" />
            </div>
            <span className="text-[10px] md:text-xs font-medium text-foreground text-center">{action.label}</span>
          </motion.button>
        ))}
      </div>

      {/* Alert Banners */}
      {(rentDue.length > 0 || openComplaints > 0) && (
        <div className="space-y-3">
          {rentDue.length > 0 && (
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
              <Card
                className="border-amber-200 bg-amber-50 dark:bg-amber-950/20 cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => setCurrentView('OWNER_RENT')}
              >
                <CardContent className="p-4 flex items-center gap-4">
                  <div className="bg-amber-100 dark:bg-amber-900/40 p-2.5 rounded-xl">
                    <CalendarDays className="size-5 text-amber-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-amber-700 dark:text-amber-400">{rentDue.length} Rent Due / Overdue</p>
                    <p className="text-sm text-amber-600/80 dark:text-amber-500 truncate">
                      {rentDue.slice(0, 2).map((r: { tenantName: string; amount: number }) => `${r.tenantName} (₹${r.amount})`).join(', ')}
                      {rentDue.length > 2 && ` +${rentDue.length - 2} more`}
                    </p>
                  </div>
                  <ChevronRight className="size-5 text-amber-400" />
                </CardContent>
              </Card>
            </motion.div>
          )}
          {openComplaints > 0 && (
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }}>
              <Card
                className="border-destructive/20 bg-destructive/5 cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => setCurrentView('OWNER_COMPLAINTS')}
              >
                <CardContent className="p-4 flex items-center gap-4">
                  <div className="bg-destructive/15 p-2.5 rounded-xl">
                    <AlertTriangle className="size-5 text-destructive" />
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-destructive">{openComplaints} Open Complaints</p>
                    <p className="text-sm text-destructive/80">Requires your attention</p>
                  </div>
                  <ChevronRight className="size-5 text-destructive/60" />
                </CardContent>
              </Card>
            </motion.div>
          )}
        </div>
      )}

      {/* Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {statCards.map((stat, index) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
          >
            <Card className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-xs text-muted-foreground font-medium">{stat.title}</p>
                    <p className={`text-xl md:text-2xl font-bold mt-1 ${stat.textColor}`}>{stat.value}</p>
                  </div>
                  <div className={`${stat.bgColor} p-2 rounded-xl`}>
                    <stat.icon className={`size-4 ${stat.textColor}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Rent Due List */}
      {rentDue.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <CalendarDays className="size-4 text-amber-500" />
              Rent Due / Overdue ({rentDue.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {rentDue.map((r: { tenantName: string; phone: string; amount: number; dueDay: number; pgName: string; status: string }, i: number) => {
                const waMsg = encodeURIComponent(
                  `Hi ${r.tenantName}, your rent of ₹${r.amount} for this month is due. Please pay at the earliest. - ${currentUser?.name || 'StayEg Owner'}`
                );
                return (
                  <div key={i} className="flex items-center gap-3 p-2.5 rounded-lg bg-muted/50 hover:bg-muted transition-colors">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">{r.tenantName}</p>
                      <p className="text-xs text-muted-foreground">{r.pgName} • Due day: {r.dueDay}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-foreground">₹{r.amount.toLocaleString('en-IN')}</p>
                      <Badge className={`${r.status === 'OVERDUE' ? BADGE.red : BADGE.yellow} text-[10px] px-1.5 py-0`}>
                        {r.status === 'OVERDUE' ? 'Overdue' : 'Due Today'}
                      </Badge>
                    </div>
                    {r.phone && (
                      <a
                        href={`https://wa.me/${r.phone.replace(/\D/g, '')}?text=${waMsg}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 rounded-lg bg-green-100 text-green-700 hover:bg-green-200 transition-colors"
                        title="Send WhatsApp reminder"
                      >
                        <Phone className="size-3.5" />
                      </a>
                    )}
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recent Activity */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <Activity className="size-4 text-brand-teal" />
            Recent Activity
          </CardTitle>
        </CardHeader>
        <CardContent>
          {recentActivity.length > 0 ? (
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {recentActivity.slice(0, 10).map((item: { action: string; description: string; createdAt: string }, index: number) => (
                <div key={index} className="flex items-start gap-3 p-2.5 rounded-lg hover:bg-muted transition-colors">
                  <div className="mt-0.5 bg-muted p-1.5 rounded-lg">
                    {item.action.includes('TENANT') ? <Users className="size-3.5 text-brand-teal" /> :
                     item.action.includes('PAYMENT') ? <CreditCard className="size-3.5 text-green-600" /> :
                     item.action.includes('BED') ? <BedDouble className="size-3.5 text-blue-600" /> :
                     <Activity className="size-3.5 text-muted-foreground" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-foreground truncate">{item.description || item.action}</p>
                    <p className="text-xs text-muted-foreground">{new Date(item.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="h-24 flex items-center justify-center text-muted-foreground text-sm">
              No activity yet. Start by adding a PG!
            </div>
          )}
        </CardContent>
      </Card>

      {/* Pricing Info */}
      <Card className="border-brand-teal/20 bg-gradient-to-r from-brand-teal/5 to-brand-deep/5">
        <CardContent className="p-5">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-foreground">Your Plan</h3>
                <Badge className="bg-green-100 text-green-700 text-xs">1 Year Free</Badge>
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                Free access until {new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">Upgrade anytime for advanced features</p>
            </div>
            <Button variant="outline" size="sm" className="border-brand-teal/30 text-brand-teal hover:bg-brand-teal/10" disabled>
              Upgrade Plan
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
