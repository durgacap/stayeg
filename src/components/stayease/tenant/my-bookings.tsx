'use client';

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';
import {
  CalendarDays,
  BedDouble,
  MapPin,
  IndianRupee,
  XCircle,
  CreditCard,
  ChevronRight,
  Calendar,
  Building2,
  Clock,
  Eye,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAppStore } from '@/store/use-app-store';
import { STATUSES } from '@/lib/constants';
import type { Booking, BookingStatus } from '@/lib/types';

const TAB_CONFIG = [
  { value: 'active', label: 'Active', statuses: ['PENDING', 'CONFIRMED', 'ACTIVE'] as BookingStatus[] },
  { value: 'past', label: 'Past', statuses: ['COMPLETED', 'CANCELLED'] as BookingStatus[] },
];

export default function MyBookings() {
  const { currentUser, setCurrentView, setSelectedPG } = useAppStore();
  const queryClient = useQueryClient();
  const [cancellingId, setCancellingId] = useState<string | null>(null);

  const { data: bookings = [], isLoading } = useQuery<Booking[]>({
    queryKey: ['bookings', currentUser?.id],
    queryFn: async () => {
      if (!currentUser?.id) return [];
      const res = await fetch(`/api/bookings?userId=${currentUser.id}`);
      if (!res.ok) throw new Error('Failed to fetch bookings');
      return res.json();
    },
    enabled: !!currentUser?.id,
  });

  const groupedBookings = useMemo(() => {
    const groups: Record<string, Booking[]> = { active: [], past: [] };
    bookings.forEach((b) => {
      if (TAB_CONFIG[0].statuses.includes(b.status)) {
        groups.active.push(b);
      } else {
        groups.past.push(b);
      }
    });
    return groups;
  }, [bookings]);

  const handleCancelBooking = async (bookingId: string) => {
    setCancellingId(bookingId);
    try {
      const res = await fetch('/api/bookings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: bookingId, status: 'CANCELLED' }),
      });
      if (res.ok) {
        queryClient.invalidateQueries({ queryKey: ['bookings'] });
      }
    } catch {
      // silently fail
    } finally {
      setCancellingId(null);
    }
  };

  const handleViewPG = (booking: Booking) => {
    if (booking.pg) {
      setSelectedPG(booking.pg);
      setCurrentView('PG_DETAIL');
    }
  };

  const renderBookingCard = (booking: Booking, index: number) => {
    const statusConfig = STATUSES.BOOKING[booking.status];
    const roomInfo = booking.bed?.room;

    return (
      <motion.div
        key={booking.id}
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -15 }}
        transition={{ duration: 0.3, delay: index * 0.05 }}
      >
        <Card className="border-0 shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-4 sm:p-5">
            <div className="flex flex-col sm:flex-row sm:items-start gap-4">
              {/* PG Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <h3 className="font-semibold text-foreground text-base truncate">
                    {booking.pg?.name || 'PG'}
                  </h3>
                  <Badge className={`shrink-0 ${statusConfig?.color || ''}`}>
                    {statusConfig?.label || booking.status}
                  </Badge>
                </div>

                {booking.pg?.address && (
                  <div className="flex items-center gap-1.5 text-sm text-muted-foreground mb-3">
                    <MapPin className="size-3.5 shrink-0" />
                    <span className="truncate">{booking.pg.address}, {booking.pg.city}</span>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="flex items-center gap-2">
                    <BedDouble className="size-4 text-muted-foreground" />
                    <div>
                      <div className="text-xs text-muted-foreground">Room / Bed</div>
                      <div className="text-sm font-medium">
                        {roomInfo?.roomCode || 'N/A'} - Bed {booking.bed?.bedNumber || 'N/A'}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <CalendarDays className="size-4 text-muted-foreground" />
                    <div>
                      <div className="text-xs text-muted-foreground">Check-in</div>
                      <div className="text-sm font-medium">
                        {booking.checkInDate
                          ? format(new Date(booking.checkInDate), 'dd MMM yyyy')
                          : 'N/A'}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <IndianRupee className="size-4 text-muted-foreground" />
                    <div>
                      <div className="text-xs text-muted-foreground">Advance Paid</div>
                      <div className="text-sm font-semibold">
                        ₹{Math.round(booking.advancePaid).toLocaleString('en-IN')}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex sm:flex-col gap-2 sm:items-end shrink-0">
                {booking.pg && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleViewPG(booking)}
                    className="gap-1.5 text-xs"
                  >
                    <Eye className="size-3.5" />
                    View PG
                  </Button>
                )}
                {['PENDING', 'CONFIRMED'].includes(booking.status) && (
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleCancelBooking(booking.id)}
                    disabled={cancellingId === booking.id}
                    className="gap-1.5 text-xs"
                  >
                    {cancellingId === booking.id ? (
                      <div className="size-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <XCircle className="size-3.5" />
                    )}
                    Cancel
                  </Button>
                )}
                {booking.status === 'ACTIVE' && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentView('PAYMENTS')}
                    className="gap-1.5 text-xs border-brand-teal/20 text-brand-teal hover:bg-brand-teal/10"
                  >
                    <CreditCard className="size-3.5" />
                    Pay Rent
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    );
  };

  const renderEmptyState = (type: 'active' | 'past') => (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="text-center py-16"
    >
      <div className="size-20 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
        {type === 'active' ? (
          <Calendar className="size-10 text-muted-foreground" />
        ) : (
          <Clock className="size-10 text-muted-foreground" />
        )}
      </div>
      <h3 className="text-lg font-semibold text-foreground mb-2">
        {type === 'active' ? 'No active bookings' : 'No past bookings'}
      </h3>
      <p className="text-muted-foreground mb-4">
        {type === 'active'
          ? 'You haven\'t made any bookings yet. Find your perfect PG today!'
          : 'Your completed and cancelled bookings will appear here.'}
      </p>
      {type === 'active' && (
        <Button
          onClick={() => setCurrentView('PG_LISTING')}
          className="bg-brand-teal/100 hover:bg-brand-deep text-white"
        >
          Browse PGs
          <ChevronRight className="size-4" />
        </Button>
      )}
    </motion.div>
  );

  return (
    <div className="min-h-screen bg-muted/50">
      {/* Header */}
      <div className="bg-background border-b">
        <div className="max-w-5xl mx-auto px-4 py-6">
          <div className="flex items-center gap-3 mb-1">
            <div className="size-10 bg-brand-teal/15 rounded-xl flex items-center justify-center">
              <CalendarDays className="size-5 text-brand-teal" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">My Bookings</h1>
              <p className="text-sm text-muted-foreground">Manage your PG bookings and reservations</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-6">
        {/* Quick Stats */}
        {!isLoading && bookings.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
            {[
              { label: 'Total', count: bookings.length, icon: Building2, color: 'bg-brand-teal/10 text-brand-teal' },
              { label: 'Active', count: groupedBookings.active.length, icon: Calendar, color: 'bg-green-50 text-green-600' },
              { label: 'Completed', count: bookings.filter((b) => b.status === 'COMPLETED').length, icon: Clock, color: 'bg-muted text-muted-foreground' },
              { label: 'Cancelled', count: bookings.filter((b) => b.status === 'CANCELLED').length, icon: XCircle, color: 'bg-red-50 text-red-600' },
            ].map((stat) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-card rounded-xl p-4 border shadow-sm"
              >
                <div className={`size-8 rounded-lg flex items-center justify-center mb-2 ${stat.color}`}>
                  <stat.icon className="size-4" />
                </div>
                <div className="text-2xl font-bold text-foreground">{stat.count}</div>
                <div className="text-xs text-muted-foreground">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        )}

        {/* Tabs */}
        <Tabs defaultValue="active" className="w-full">
          <TabsList className="bg-card border shadow-sm rounded-lg">
            <TabsTrigger value="active" className="rounded-md">
              Active ({groupedBookings.active.length})
            </TabsTrigger>
            <TabsTrigger value="past" className="rounded-md">
              Past ({groupedBookings.past.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="active" className="mt-4">
            {isLoading ? (
              <div className="space-y-4">
                {Array.from({ length: 3 }).map((_, i) => (
                  <Skeleton key={i} className="h-40 w-full rounded-xl" />
                ))}
              </div>
            ) : (
              <AnimatePresence mode="wait">
                {groupedBookings.active.length > 0 ? (
                  <div className="space-y-4">
                    {groupedBookings.active.map((booking, i) => renderBookingCard(booking, i))}
                  </div>
                ) : (
                  renderEmptyState('active')
                )}
              </AnimatePresence>
            )}
          </TabsContent>

          <TabsContent value="past" className="mt-4">
            {isLoading ? (
              <div className="space-y-4">
                {Array.from({ length: 2 }).map((_, i) => (
                  <Skeleton key={i} className="h-40 w-full rounded-xl" />
                ))}
              </div>
            ) : (
              <AnimatePresence mode="wait">
                {groupedBookings.past.length > 0 ? (
                  <div className="space-y-4">
                    {groupedBookings.past.map((booking, i) => renderBookingCard(booking, i))}
                  </div>
                ) : (
                  renderEmptyState('past')
                )}
              </AnimatePresence>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
