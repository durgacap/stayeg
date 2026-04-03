'use client';

import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import {
  Search, Users, Mail, Phone, MapPin, BedDouble, CalendarDays, CreditCard, Filter,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import type { PG, Booking } from '@/lib/types';

export default function TenantManagement() {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterPG, setFilterPG] = useState('all');
  const [selectedTenant, setSelectedTenant] = useState<Booking | null>(null);

  const { data: ownerUser } = useQuery({
    queryKey: ['owner-user'],
    queryFn: async () => {
      const res = await fetch('/api/auth?role=OWNER');
      const users = await res.json();
      return users[0] || null;
    },
  });
  const ownerId = ownerUser?.id;

  const { data: pgs } = useQuery({
    queryKey: ['owner-pgs-tenants', ownerId],
    queryFn: async () => {
      const res = await fetch(`/api/pgs?ownerId=${ownerId}`);
      return res.json();
    },
    enabled: !!ownerId,
  });

  const pgList: PG[] = pgs || [];

  const { data: allBookings, isLoading } = useQuery({
    queryKey: ['owner-all-bookings', ownerId, pgList.map(p => p.id).join(',')],
    queryFn: async () => {
      if (pgList.length === 0) return [];
      const results = await Promise.all(
        pgList.map((pg: PG) => fetch(`/api/bookings?pgId=${pg.id}`).then(r => r.json()).catch(() => []))
      );
      return results.flat();
    },
    enabled: !!ownerId && pgList.length > 0,
  });

  const bookings: Booking[] = allBookings || [];

  const filteredBookings = useMemo(() => {
    let result = bookings.filter((b: Booking) =>
      b.status === 'ACTIVE' || b.status === 'CONFIRMED'
    );
    if (filterPG !== 'all') {
      result = result.filter((b: Booking) => b.pgId === filterPG);
    }
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter((b: Booking) =>
        (b.user?.name?.toLowerCase() ?? '').includes(q) ||
        (b.user?.email?.toLowerCase() ?? '').includes(q) ||
        (b.pg?.name?.toLowerCase() ?? '').includes(q)
      );
    }
    return result;
  }, [bookings, filterPG, searchQuery]);

  const getPGName = (pgId: string) => pgList.find(p => p.id === pgId)?.name || 'Unknown PG';

  return (
    <div className="p-4 md:p-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Tenant Management</h1>
          <p className="text-muted-foreground mt-1">View and manage all your tenants</p>
        </div>
        <Badge variant="outline" className="text-brand-teal border-brand-teal/20 bg-brand-teal/10 px-3 py-1.5">
          <Users className="size-3.5 mr-1.5" />
          {filteredBookings.length} Active Tenants
        </Badge>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input
            placeholder="Search tenants by name, email..."
            className="pl-10"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
          />
        </div>
        <Select value={filterPG} onValueChange={setFilterPG}>
          <SelectTrigger className="w-full sm:w-48">
            <Filter className="size-4 mr-2 text-muted-foreground" />
            <SelectValue placeholder="Filter by PG" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All PGs</SelectItem>
            {pgList.map((pg: PG) => (
              <SelectItem key={pg.id} value={pg.id}>{pg.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <Card key={i} className="animate-pulse"><CardContent className="p-4"><div className="h-16 bg-muted rounded" /></CardContent></Card>
          ))}
        </div>
      ) : filteredBookings.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="p-12 text-center">
            <Users className="size-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-muted-foreground">No Tenants Found</h3>
            <p className="text-sm text-muted-foreground mt-1">
              {searchQuery || filterPG !== 'all' ? 'Try adjusting your filters' : 'No active tenants yet'}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {filteredBookings.map((booking: Booking, index: number) => (
            <motion.div
              key={booking.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.03 }}
            >
              <Card
                className="hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => setSelectedTenant(selectedTenant?.id === booking.id ? null : booking)}
              >
                <CardContent className="p-4">
                  <div className="flex items-center gap-4">
                    <Avatar className="size-12 shrink-0">
                      <AvatarImage src={booking.user?.avatar} alt={booking.user?.name} />
                      <AvatarFallback className="bg-brand-teal/15 text-brand-teal font-semibold">
                        {booking.user?.name?.charAt(0) || 'T'}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-semibold text-foreground">{booking.user?.name || 'Unknown'}</h3>
                        <Badge className="bg-green-100 text-green-700">{booking.status}</Badge>
                      </div>
                      <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground flex-wrap">
                        {booking.user?.email && (
                          <span className="flex items-center gap-1"><Mail className="size-3" />{booking.user.email}</span>
                        )}
                        {booking.user?.phone && (
                          <span className="flex items-center gap-1"><Phone className="size-3" />{booking.user.phone}</span>
                        )}
                      </div>
                      <div className="flex items-center gap-4 mt-1.5 text-sm flex-wrap">
                        <span className="text-muted-foreground flex items-center gap-1">
                          <MapPin className="size-3 text-brand-teal" />
                          {getPGName(booking.pgId)}
                        </span>
                        {booking.bed?.room && (
                          <span className="text-muted-foreground flex items-center gap-1">
                            <BedDouble className="size-3" />
                            {booking.bed.room.roomCode} - Bed #{booking.bed.bedNumber}
                          </span>
                        )}
                        <span className="text-muted-foreground flex items-center gap-1">
                          <CalendarDays className="size-3" />
                          {new Date(booking.checkInDate).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })}
                        </span>
                        <span className="text-muted-foreground flex items-center gap-1">
                          <CreditCard className="size-3" />
                          ₹{booking.advancePaid?.toLocaleString('en-IN')} advance
                        </span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}

      {/* Tenant Detail Panel */}
      {selectedTenant && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card className="border-brand-teal/20 bg-brand-teal/5">
            <CardHeader>
              <CardTitle className="text-base">Tenant Details</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Name</span>
                  <p className="font-semibold text-foreground">{selectedTenant.user?.name}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Email</span>
                  <p className="font-semibold text-foreground">{selectedTenant.user?.email}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Phone</span>
                  <p className="font-semibold text-foreground">{selectedTenant.user?.phone || 'N/A'}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">PG</span>
                  <p className="font-semibold text-foreground">{getPGName(selectedTenant.pgId)}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Room / Bed</span>
                  <p className="font-semibold text-foreground">
                    {selectedTenant.bed?.room?.roomCode || 'N/A'} - Bed #{selectedTenant.bed?.bedNumber || 'N/A'}
                  </p>
                </div>
                <div>
                  <span className="text-muted-foreground">Check-in Date</span>
                  <p className="font-semibold text-foreground">
                    {new Date(selectedTenant.checkInDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
                  </p>
                </div>
                <div>
                  <span className="text-muted-foreground">Booking Status</span>
                  <Badge className="bg-green-100 text-green-700 mt-0.5">{selectedTenant.status}</Badge>
                </div>
                <div>
                  <span className="text-muted-foreground">Advance Paid</span>
                  <p className="font-semibold text-green-700">₹{selectedTenant.advancePaid?.toLocaleString('en-IN')}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </div>
  );
}
