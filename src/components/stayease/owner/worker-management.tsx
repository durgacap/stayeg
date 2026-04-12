'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus, User, Phone, Edit2, Loader2, Check, HardHat,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { useAppStore } from '@/store/use-app-store';

const ROLE_COLORS: Record<string, string> = {
  SECURITY: 'bg-red-100 text-red-700',
  CLEANER: 'bg-green-100 text-green-700',
  COOK: 'bg-brand-sage/15 text-brand-sage',
  MANAGER: 'bg-purple-100 text-purple-700',
  MAINTENANCE: 'bg-blue-100 text-blue-700',
};

const SHIFT_COLORS: Record<string, string> = {
  MORNING: 'bg-brand-teal/15 text-brand-teal',
  EVENING: 'bg-indigo-100 text-indigo-700',
  NIGHT: 'bg-gray-800 text-gray-100',
};

export default function WorkerManagement() {
  const { showToast } = useAppStore();
  const queryClient = useQueryClient();
  const [addOpen, setAddOpen] = useState(false);
  const [filterRole, setFilterRole] = useState('all');
  const [form, setForm] = useState({ name: '', role: 'CLEANER', phone: '', pgId: '', shift: 'MORNING' });

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
    queryKey: ['owner-pgs-worker', ownerId],
    queryFn: async () => {
      const res = await fetch(`/api/pgs?ownerId=${ownerId}`);
      return res.json();
    },
    enabled: !!ownerId,
  });

  const { selectedPG } = useAppStore();
  const [selectedPgId, setSelectedPgId] = useState(selectedPG?.id || 'all');

  const { data: workers, isLoading } = useQuery({
    queryKey: ['workers', selectedPgId],
    queryFn: async () => {
      const pgParam = selectedPgId !== 'all' ? `?pgId=${selectedPgId}` : '';
      const res = await fetch(`/api/workers${pgParam}`);
      if (!res.ok) throw new Error('Failed to fetch workers');
      return res.json();
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: typeof form) => {
      const res = await fetch('/api/workers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: data.name,
          role: data.role,
          phone: data.phone,
          pgId: data.pgId || undefined,
          shift: data.shift,
        }),
      });
      if (!res.ok) throw new Error('Failed to create worker');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workers'] });
      showToast('Worker added successfully!');
      setAddOpen(false);
      setForm({ name: '', role: 'CLEANER', phone: '', pgId: '', shift: 'MORNING' });
    },
    onError: () => showToast('Failed to add worker'),
  });

  const filtered = (workers || []).filter((w: { role: string }) => filterRole === 'all' || w.role === filterRole);

  const pgNameMap: Record<string, string> = {};
  (pgs || []).forEach((pg: { id: string; name: string }) => { pgNameMap[pg.id] = pg.name; });

  return (
    <div className="p-4 md:p-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Staff Management</h1>
          <p className="text-muted-foreground mt-1">Manage your PG staff and workers</p>
        </div>
        <Dialog open={addOpen} onOpenChange={setAddOpen}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-to-r from-brand-deep to-brand-teal hover:from-brand-deep hover:to-brand-teal text-white shadow-md">
              <Plus className="size-4 mr-2" /> Add Staff
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Add New Staff Member</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-2">
              <div className="space-y-2">
                <Label>Name *</Label>
                <Input placeholder="Full name" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Role *</Label>
                  <Select value={form.role} onValueChange={v => setForm(p => ({ ...p, role: v }))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {Object.keys(ROLE_COLORS).map(r => (
                        <SelectItem key={r} value={r}>{r.charAt(0) + r.slice(1).toLowerCase()}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Shift</Label>
                  <Select value={form.shift} onValueChange={v => setForm(p => ({ ...p, shift: v }))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="MORNING">Morning</SelectItem>
                      <SelectItem value="EVENING">Evening</SelectItem>
                      <SelectItem value="NIGHT">Night</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Phone *</Label>
                <Input placeholder="+91 98765 43210" value={form.phone} onChange={e => setForm(p => ({ ...p, phone: e.target.value }))} />
              </div>
              <div className="space-y-2">
                <Label>Assign to PG</Label>
                <Select value={form.pgId} onValueChange={v => setForm(p => ({ ...p, pgId: v }))}>
                  <SelectTrigger><SelectValue placeholder="Select PG..." /></SelectTrigger>
                  <SelectContent>
                    {(pgs || []).map((pg: { id: string; name: string }) => (
                      <SelectItem key={pg.id} value={pg.id}>{pg.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Button
                className="w-full bg-gradient-to-r from-brand-deep to-brand-teal hover:from-brand-deep hover:to-brand-teal text-white"
                onClick={() => createMutation.mutate(form)}
                disabled={createMutation.isPending || !form.name || !form.phone}
              >
                {createMutation.isPending ? <Loader2 className="size-4 mr-2 animate-spin" /> : <Check className="size-4 mr-2" />}
                Add Staff Member
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* PG Filter */}
      <div className="flex items-center gap-3">
        <div className="flex-1 max-w-xs">
          <Select value={selectedPgId} onValueChange={setSelectedPgId}>
            <SelectTrigger><SelectValue placeholder="All PGs" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All PGs</SelectItem>
              {(pgs || []).map((pg: { id: string; name: string }) => (
                <SelectItem key={pg.id} value={pg.id}>{pg.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Role Filters */}
      <div className="flex items-center gap-2 flex-wrap">
        {['all', ...Object.keys(ROLE_COLORS)].map(role => (
          <button
            key={role}
            onClick={() => setFilterRole(role)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
              filterRole === role
                ? (role === 'all' ? 'bg-brand-teal/15 text-brand-teal' : ROLE_COLORS[role]) + ' ring-2 ring-offset-1 ring-current'
                : 'bg-muted text-muted-foreground hover:bg-muted'
            }`}
          >
            {role === 'all' ? 'All' : role.charAt(0) + role.slice(1).toLowerCase()}
          </button>
        ))}
      </div>

      {/* Worker Cards */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="animate-pulse"><CardContent className="p-6"><div className="h-24 bg-muted rounded" /></CardContent></Card>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="p-12 text-center">
            <HardHat className="size-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-muted-foreground">No Staff Found</h3>
            <p className="text-sm text-muted-foreground mt-1">Add staff members to manage your PG</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <AnimatePresence>
            {filtered.map((worker: { id: string; name: string; role: string; phone: string; pgId?: string; shift?: string; status: string }, index: number) => (
              <motion.div
                key={worker.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="bg-gradient-to-br from-brand-deep to-brand-teal p-3 rounded-xl">
                        <User className="size-5 text-white" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-foreground">{worker.name}</h3>
                        <div className="flex items-center gap-2 mt-1 flex-wrap">
                          <Badge className={`${ROLE_COLORS[worker.role] || 'bg-muted text-foreground'} text-xs`}>
                            {worker.role}
                          </Badge>
                          {worker.shift && (
                            <Badge className={`${SHIFT_COLORS[worker.shift] || ''} text-xs`}>
                              {worker.shift}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="mt-3 space-y-1">
                      <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                        <Phone className="size-3.5" />
                        <span>{worker.phone}</span>
                      </div>
                      {worker.pgId && (
                        <div className="text-sm text-muted-foreground">
                          Assigned: {pgNameMap[worker.pgId] || worker.pgId}
                        </div>
                      )}
                    </div>

                    <div className="mt-3 flex gap-2">
                      <a
                        href={`tel:${worker.phone}`}
                        className="flex-1 flex items-center justify-center gap-1.5 bg-green-50 text-green-700 hover:bg-green-100 py-2 rounded-lg text-sm font-medium transition-colors"
                      >
                        <Phone className="size-3.5" /> Call
                      </a>
                      <Button variant="outline" size="sm" className="flex-1" onClick={() => showToast('Edit feature coming soon!')}>
                        <Edit2 className="size-3.5 mr-1" /> Edit
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
