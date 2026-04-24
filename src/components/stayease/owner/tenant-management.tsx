'use client';

import { useState, useMemo, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, Users, Phone, BedDouble, Plus, Trash2, Edit2, X, Check,
  Loader2, MessageSquare, ChevronDown, ChevronRight, ArrowRightLeft,
  StickyNote, Filter, UserPlus,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { useAppStore } from '@/store/use-app-store';
import { BADGE, TEXT_COLOR } from '@/lib/constants';
import { toast } from 'sonner';

interface TenantRecord {
  id: string;
  ownerId: string;
  pgId: string;
  roomId: string;
  bedId: string;
  name: string;
  phone: string;
  email?: string;
  aadhaar?: string;
  gender?: string;
  rentAmount: number;
  rentDueDay: number;
  status: string;
  notes?: string;
  joinedAt: string;
  createdAt: string;
  pg?: { id: string; name: string };
  room?: { id: string; roomCode: string; roomType: string; floor: number };
  bed?: { id: string; bedNumber: number; status: string };
  rentRecords?: { id: string; month: string; amount: number; status: string; paidDate?: string; method?: string }[];
}

interface PGData { id: string; name: string; rooms?: { id: string; roomCode: string; roomType: string; beds?: { id: string; bedNumber: number; status: string }[] }[] }

export default function TenantManagement() {
  const { showToast, currentUser } = useAppStore();
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterPG, setFilterPG] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedTenant, setSelectedTenant] = useState<TenantRecord | null>(null);
  const [addOpen, setAddOpen] = useState(false);
  const [moveOpen, setMoveOpen] = useState(false);
  const [noteOpen, setNoteOpen] = useState(false);
  const [tenantNote, setTenantNote] = useState('');

  // Add tenant form
  const [form, setForm] = useState({
    name: '', phone: '', email: '', gender: '', aadhaar: '',
    rentAmount: '', rentDueDay: '5', pgId: '', roomId: '', bedId: '', notes: '',
  });

  // Move tenant form
  const [moveTarget, setMoveTarget] = useState({ roomId: '', bedId: '' });

  const { data: ownerUser } = useQuery({
    queryKey: ['owner-user'],
    queryFn: async () => {
      const res = await fetch('/api/auth?role=OWNER');
      if (!res.ok) throw new Error('Failed');
      const users = await res.json();
      return (Array.isArray(users) ? users : users.users)?.[0] || null;
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

  const pgList: PGData[] = pgs || [];

  const { data: tenants, isLoading } = useQuery({
    queryKey: ['owner-tenants', ownerId, filterPG, filterStatus],
    queryFn: async () => {
      const params = new URLSearchParams({ ownerId: ownerId! });
      if (filterPG !== 'all') params.set('pgId', filterPG);
      if (filterStatus !== 'all') params.set('status', filterStatus);
      const res = await fetch(`/api/tenants?${params}`);
      return res.json();
    },
    enabled: !!ownerId,
  });

  const tenantList: TenantRecord[] = tenants || [];

  const filteredTenants = useMemo(() => {
    if (!searchQuery) return tenantList;
    const q = searchQuery.toLowerCase();
    return tenantList.filter((t: TenantRecord) =>
      t.name.toLowerCase().includes(q) ||
      t.phone.includes(q) ||
      (t.email || '').toLowerCase().includes(q)
    );
  }, [tenantList, searchQuery]);

  // Available beds for selected PG/Room
  const selectedPG = pgList.find(p => p.id === form.pgId);
  const roomsInPG = selectedPG?.rooms || [];
  const selectedRoom = roomsInPG.find(r => r.id === form.roomId);
  const bedsInRoom = selectedRoom?.beds?.filter(b => b.status === 'AVAILABLE') || [];

  // Create tenant mutation
  const createMutation = useMutation({
    mutationFn: async (data: typeof form) => {
      const res = await fetch('/api/tenants', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...data,
          ownerId,
          rentAmount: Number(data.rentAmount) || 0,
          rentDueDay: Number(data.rentDueDay) || 5,
        }),
      });
      if (!res.ok) { const err = await res.json(); throw new Error(err.error || 'Failed'); }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['owner-tenants'] });
      queryClient.invalidateQueries({ queryKey: ['owner-analytics'] });
      queryClient.invalidateQueries({ queryKey: ['owner-pgs'] });
      toast.success('Tenant added successfully!');
      setAddOpen(false);
      resetForm();
    },
    onError: (e) => toast.error(e.message),
  });

  // Delete tenant mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/tenants?id=${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to remove tenant');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['owner-tenants'] });
      queryClient.invalidateQueries({ queryKey: ['owner-analytics'] });
      toast.success('Tenant removed successfully');
      setSelectedTenant(null);
    },
    onError: () => toast.error('Failed to remove tenant'),
  });

  // Move tenant mutation
  const moveMutation = useMutation({
    mutationFn: async ({ id, newBedId, newRoomId }: { id: string; newBedId: string; newRoomId: string }) => {
      const res = await fetch('/api/tenants', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, newBedId, newRoomId }),
      });
      if (!res.ok) { const err = await res.json(); throw new Error(err.error || 'Failed to move'); }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['owner-tenants'] });
      queryClient.invalidateQueries({ queryKey: ['owner-analytics'] });
      queryClient.invalidateQueries({ queryKey: ['owner-pgs'] });
      toast.success('Tenant moved successfully!');
      setMoveOpen(false);
      setSelectedTenant(null);
    },
    onError: (e) => toast.error(e.message),
  });

  // Update notes mutation
  const notesMutation = useMutation({
    mutationFn: async ({ id, notes }: { id: string; notes: string }) => {
      const res = await fetch('/api/tenants', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, notes }),
      });
      if (!res.ok) throw new Error('Failed to update notes');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['owner-tenants'] });
      toast.success('Notes saved!');
      setNoteOpen(false);
    },
    onError: () => toast.error('Failed to save notes'),
  });

  const resetForm = () => {
    setForm({ name: '', phone: '', email: '', gender: '', aadhaar: '', rentAmount: '', rentDueDay: '5', pgId: '', roomId: '', bedId: '', notes: '' });
  };

  const openMoveDialog = (tenant: TenantRecord) => {
    setSelectedTenant(tenant);
    setMoveTarget({ roomId: '', bedId: '' });
    setMoveOpen(true);
  };

  const openNoteDialog = (tenant: TenantRecord) => {
    setSelectedTenant(tenant);
    setTenantNote(tenant.notes || '');
    setNoteOpen(true);
  };

  // Available beds for move dialog
  const movePG = pgList.find(p => p.id === selectedTenant?.pgId);
  const moveRooms = movePG?.rooms || [];
  const moveSelectedRoom = moveRooms.find(r => r.id === moveTarget.roomId);
  const moveBeds = moveSelectedRoom?.beds?.filter(b => b.status === 'AVAILABLE' || b.id === selectedTenant?.bedId) || [];

  const getRentStatus = (tenant: TenantRecord) => {
    const currentMonth = new Date().toISOString().slice(0, 7);
    const thisMonthRecord = tenant.rentRecords?.find(r => r.month === currentMonth);
    if (!thisMonthRecord) return 'NO_RECORD';
    return thisMonthRecord.status;
  };

  const statusBadge = (status: string) => {
    switch (status) {
      case 'ACTIVE': return BADGE.green;
      case 'INACTIVE': return BADGE.yellow;
      case 'EVICTED': return BADGE.red;
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const rentStatusBadge = (status: string) => {
    switch (status) {
      case 'PAID': return BADGE.green;
      case 'PENDING': return BADGE.yellow;
      case 'OVERDUE': return BADGE.red;
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="p-4 md:p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Tenant Management</h1>
          <p className="text-muted-foreground mt-1">Add, manage, and communicate with tenants</p>
        </div>
        <Dialog open={addOpen} onOpenChange={(v) => { setAddOpen(v); if (!v) resetForm(); }}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white shadow-md">
              <UserPlus className="size-4 mr-2" /> Add Tenant
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
            <DialogHeader><DialogTitle>Add New Tenant</DialogTitle></DialogHeader>
            <div className="space-y-4 pt-2">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2 col-span-2 sm:col-span-1">
                  <Label>Name *</Label>
                  <Input placeholder="Full name" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} />
                </div>
                <div className="space-y-2 col-span-2 sm:col-span-1">
                  <Label>Phone *</Label>
                  <Input placeholder="+91 98765 43210" value={form.phone} onChange={e => setForm(p => ({ ...p, phone: e.target.value }))} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Email</Label>
                  <Input type="email" placeholder="email@example.com" value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} />
                </div>
                <div className="space-y-2">
                  <Label>Gender</Label>
                  <Select value={form.gender} onValueChange={v => setForm(p => ({ ...p, gender: v }))}>
                    <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="MALE">Male</SelectItem>
                      <SelectItem value="FEMALE">Female</SelectItem>
                      <SelectItem value="OTHER">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Monthly Rent (₹) *</Label>
                  <Input type="number" placeholder="8000" value={form.rentAmount} onChange={e => setForm(p => ({ ...p, rentAmount: e.target.value }))} />
                </div>
                <div className="space-y-2">
                  <Label>Rent Due Day</Label>
                  <Select value={form.rentDueDay} onValueChange={v => setForm(p => ({ ...p, rentDueDay: v }))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {[1,5,10,15,20,25].map(d => <SelectItem key={d} value={String(d)}>{d}th of month</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <Separator />
              <p className="text-sm font-semibold text-foreground">Assign to Bed *</p>
              <div className="space-y-3">
                <div className="space-y-2">
                  <Label>PG</Label>
                  <Select value={form.pgId} onValueChange={v => setForm(p => ({ ...p, pgId: v, roomId: '', bedId: '' }))}>
                    <SelectTrigger><SelectValue placeholder="Select PG" /></SelectTrigger>
                    <SelectContent>
                      {pgList.map((pg) => <SelectItem key={pg.id} value={pg.id}>{pg.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                {form.pgId && (
                  <div className="space-y-2">
                    <Label>Room</Label>
                    <Select value={form.roomId} onValueChange={v => setForm(p => ({ ...p, roomId: v, bedId: '' }))}>
                      <SelectTrigger><SelectValue placeholder="Select Room" /></SelectTrigger>
                      <SelectContent>
                        {roomsInPG.map((room) => <SelectItem key={room.id} value={room.id}>{room.roomCode} - {room.roomType} (F{room.floor})</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                )}
                {form.roomId && (
                  <div className="space-y-2">
                    <Label>Available Bed</Label>
                    {bedsInRoom.length > 0 ? (
                      <Select value={form.bedId} onValueChange={v => setForm(p => ({ ...p, bedId: v }))}>
                        <SelectTrigger><SelectValue placeholder="Select Bed" /></SelectTrigger>
                        <SelectContent>
                          {bedsInRoom.map((bed) => <SelectItem key={bed.id} value={bed.id}>Bed #{bed.bedNumber}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    ) : (
                      <p className="text-sm text-destructive bg-destructive/10 p-3 rounded-lg">No available beds in this room</p>
                    )}
                  </div>
                )}
              </div>
              <Button
                className="w-full bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white"
                onClick={() => createMutation.mutate(form)}
                disabled={createMutation.isPending || !form.name || !form.phone || !form.bedId}
              >
                {createMutation.isPending ? <Loader2 className="size-4 mr-2 animate-spin" /> : <Check className="size-4 mr-2" />}
                Add Tenant
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search & Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input placeholder="Search by name, phone..." className="pl-10" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
        </div>
        <Select value={filterPG} onValueChange={setFilterPG}>
          <SelectTrigger className="w-full sm:w-48"><Filter className="size-4 mr-2 text-muted-foreground" /><SelectValue placeholder="All PGs" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All PGs</SelectItem>
            {pgList.map(pg => <SelectItem key={pg.id} value={pg.id}>{pg.name}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-full sm:w-36"><SelectValue placeholder="All Status" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="ACTIVE">Active</SelectItem>
            <SelectItem value="INACTIVE">Inactive</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Badge */}
      <Badge variant="outline" className="text-brand-teal border-brand-teal/20 bg-brand-teal/10 px-3 py-1.5 w-fit">
        <Users className="size-3.5 mr-1.5" />
        {filteredTenants.length} Tenants
      </Badge>

      {/* Loading */}
      {isLoading ? (
        <div className="space-y-3">{[...Array(5)].map((_, i) => <Card key={i} className="animate-pulse"><CardContent className="p-4"><div className="h-16 bg-muted rounded" /></CardContent></Card>)}</div>
      ) : filteredTenants.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="p-12 text-center">
            <Users className="size-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-muted-foreground">No Tenants Found</h3>
            <p className="text-sm text-muted-foreground mt-1">
              {pgList.length === 0 ? 'Add a PG property first, then add tenants' : 'Click "Add Tenant" to get started'}
            </p>
            <Button className="mt-4 bg-gradient-to-r from-emerald-500 to-green-600 text-white" onClick={() => setAddOpen(true)}>
              <UserPlus className="size-4 mr-2" /> Add Your First Tenant
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {filteredTenants.map((tenant: TenantRecord, index: number) => {
            const rentStatus = getRentStatus(tenant);
            const isSelected = selectedTenant?.id === tenant.id;
            return (
              <motion.div key={tenant.id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: index * 0.03 }}>
                <Card className={`hover:shadow-md transition-all ${isSelected ? 'border-brand-teal/30 bg-brand-teal/5' : ''}`}>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <Avatar className="size-11 shrink-0">
                        <AvatarFallback className="bg-brand-teal/15 text-brand-teal font-semibold text-sm">
                          {tenant.name.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0" onClick={() => setSelectedTenant(isSelected ? null : tenant)}>
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="font-semibold text-foreground">{tenant.name}</h3>
                          <Badge className={statusBadge(tenant.status)}>{tenant.status}</Badge>
                          <Badge className={rentStatusBadge(rentStatus)}>
                            {rentStatus === 'PAID' ? 'Rent Paid' : rentStatus === 'PENDING' ? 'Rent Pending' : rentStatus === 'OVERDUE' ? 'Overdue' : 'No Record'}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-3 mt-1 text-sm text-muted-foreground flex-wrap">
                          <span className="flex items-center gap-1"><Phone className="size-3" />{tenant.phone}</span>
                          {tenant.pg && <span>{tenant.pg.name}</span>}
                          {tenant.room && tenant.bed && (
                            <span className="flex items-center gap-1">
                              <BedDouble className="size-3" />{tenant.room.roomCode} - #{tenant.bed.bedNumber}
                            </span>
                          )}
                          <span>₹{tenant.rentAmount.toLocaleString('en-IN')}/mo</span>
                        </div>
                      </div>
                      {/* Action Buttons */}
                      <div className="flex items-center gap-1.5 shrink-0">
                        {tenant.phone && (
                          <a
                            href={`https://wa.me/${tenant.phone.replace(/\D/g, '')}?text=${encodeURIComponent(`Hi ${tenant.name}, this is regarding your stay at our PG. - ${currentUser?.name || 'StayEg Owner'}`)}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2 rounded-lg bg-green-100 text-green-700 hover:bg-green-200 transition-colors"
                            title="WhatsApp Message"
                          >
                            <MessageSquare className="size-3.5" />
                          </a>
                        )}
                        <button onClick={() => openNoteDialog(tenant)} className="p-2 rounded-lg bg-amber-100 text-amber-700 hover:bg-amber-200 transition-colors" title="Notes">
                          <StickyNote className="size-3.5" />
                        </button>
                        <button onClick={() => openMoveDialog(tenant)} className="p-2 rounded-lg bg-blue-100 text-blue-700 hover:bg-blue-200 transition-colors" title="Move to another bed">
                          <ArrowRightLeft className="size-3.5" />
                        </button>
                        <button onClick={() => { if (confirm(`Remove ${tenant.name}?`)) deleteMutation.mutate(tenant.id); }} className="p-2 rounded-lg bg-red-100 text-red-700 hover:bg-red-200 transition-colors" title="Remove tenant">
                          <Trash2 className="size-3.5" />
                        </button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Tenant Detail Panel */}
      <AnimatePresence>
        {selectedTenant && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }}>
            <Card className="border-brand-teal/20 bg-brand-teal/5">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">Tenant Details</CardTitle>
                  <Button variant="ghost" size="sm" onClick={() => setSelectedTenant(null)}><X className="size-4" /></Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                  <div><span className="text-muted-foreground">Name</span><p className="font-semibold">{selectedTenant.name}</p></div>
                  <div><span className="text-muted-foreground">Phone</span><p className="font-semibold">{selectedTenant.phone}</p></div>
                  <div><span className="text-muted-foreground">Email</span><p className="font-semibold">{selectedTenant.email || 'N/A'}</p></div>
                  <div><span className="text-muted-foreground">PG</span><p className="font-semibold">{selectedTenant.pg?.name || 'N/A'}</p></div>
                  <div><span className="text-muted-foreground">Room / Bed</span><p className="font-semibold">{selectedTenant.room?.roomCode} - #{selectedTenant.bed?.bedNumber}</p></div>
                  <div><span className="text-muted-foreground">Rent</span><p className={`font-semibold ${TEXT_COLOR.green}`}>₹{selectedTenant.rentAmount.toLocaleString('en-IN')}/mo</p></div>
                  <div><span className="text-muted-foreground">Due Day</span><p className="font-semibold">{selectedTenant.rentDueDay}th of month</p></div>
                  <div><span className="text-muted-foreground">Joined</span><p className="font-semibold">{new Date(selectedTenant.joinedAt).toLocaleDateString('en-IN')}</p></div>
                  <div><span className="text-muted-foreground">Notes</span><p className="font-semibold">{selectedTenant.notes || 'None'}</p></div>
                </div>
                {/* Rent History */}
                {selectedTenant.rentRecords && selectedTenant.rentRecords.length > 0 && (
                  <div className="mt-4">
                    <p className="text-sm font-semibold mb-2">Rent History</p>
                    <div className="space-y-1.5">
                      {selectedTenant.rentRecords.map((record) => (
                        <div key={record.id} className="flex items-center justify-between p-2 bg-background/60 rounded-lg text-sm">
                          <span className="text-muted-foreground">{record.month}</span>
                          <span className="font-medium">₹{record.amount.toLocaleString('en-IN')}</span>
                          <Badge className={rentStatusBadge(record.status)}>{record.status}</Badge>
                          {record.paidDate && <span className="text-xs text-muted-foreground">{new Date(record.paidDate).toLocaleDateString('en-IN')}</span>}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Move Tenant Dialog */}
      <Dialog open={moveOpen} onOpenChange={setMoveOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>Move Tenant to Another Bed</DialogTitle></DialogHeader>
          {selectedTenant && (
            <div className="space-y-4 pt-2">
              <p className="text-sm text-muted-foreground">
                Moving <strong>{selectedTenant.name}</strong> from {selectedTenant.room?.roomCode} - #{selectedTenant.bed?.bedNumber}
              </p>
              <div className="space-y-2">
                <Label>Target Room</Label>
                <Select value={moveTarget.roomId} onValueChange={v => setMoveTarget({ roomId: v, bedId: '' })}>
                  <SelectTrigger><SelectValue placeholder="Select Room" /></SelectTrigger>
                  <SelectContent>
                    {moveRooms.map(room => <SelectItem key={room.id} value={room.id}>{room.roomCode} - {room.roomType}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              {moveTarget.roomId && (
                <div className="space-y-2">
                  <Label>Available Bed</Label>
                  {moveBeds.length > 0 ? (
                    <Select value={moveTarget.bedId} onValueChange={v => setMoveTarget(prev => ({ ...prev, bedId: v }))}>
                      <SelectTrigger><SelectValue placeholder="Select Bed" /></SelectTrigger>
                      <SelectContent>
                        {moveBeds.map(bed => (
                          <SelectItem key={bed.id} value={bed.id}>
                            Bed #{bed.bedNumber} {bed.id === selectedTenant.bedId ? '(current)' : ''}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : (
                    <p className="text-sm text-destructive bg-destructive/10 p-3 rounded-lg">No available beds in this room</p>
                  )}
                </div>
              )}
              <Button
                className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                onClick={() => moveMutation.mutate({ id: selectedTenant.id, newBedId: moveTarget.bedId, newRoomId: moveTarget.roomId })}
                disabled={moveMutation.isPending || !moveTarget.bedId || moveTarget.bedId === selectedTenant.bedId}
              >
                {moveMutation.isPending ? <Loader2 className="size-4 mr-2 animate-spin" /> : <ArrowRightLeft className="size-4 mr-2" />}
                Move Tenant
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Notes Dialog */}
      <Dialog open={noteOpen} onOpenChange={setNoteOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>Owner Notes</DialogTitle></DialogHeader>
          {selectedTenant && (
            <div className="space-y-4 pt-2">
              <p className="text-sm text-muted-foreground">Notes for <strong>{selectedTenant.name}</strong></p>
              <Textarea
                placeholder="Add notes about this tenant..."
                rows={5}
                value={tenantNote}
                onChange={e => setTenantNote(e.target.value)}
              />
              <Button
                className="w-full bg-amber-600 hover:bg-amber-700 text-white"
                onClick={() => notesMutation.mutate({ id: selectedTenant.id, notes: tenantNote })}
                disabled={notesMutation.isPending}
              >
                {notesMutation.isPending ? <Loader2 className="size-4 mr-2 animate-spin" /> : <StickyNote className="size-4 mr-2" />}
                Save Notes
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
