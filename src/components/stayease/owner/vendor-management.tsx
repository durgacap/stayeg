'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus, Phone, Star, Wrench, Search, Filter, Loader2, Check, User,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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

const VENDOR_TYPES = [
  { value: 'PLUMBER', label: 'Plumber', color: 'bg-blue-100 text-blue-700' },
  { value: 'ELECTRICIAN', label: 'Electrician', color: 'bg-yellow-100 text-yellow-700' },
  { value: 'CLEANER', label: 'Cleaner', color: 'bg-green-100 text-green-700' },
  { value: 'PAINTER', label: 'Painter', color: 'bg-purple-100 text-purple-700' },
  { value: 'CARPENTER', label: 'Carpenter', color: 'bg-brand-sage/15 text-brand-sage' },
  { value: 'WIFI', label: 'WiFi Service', color: 'bg-cyan-100 text-cyan-700' },
  { value: 'GENERAL', label: 'General', color: 'bg-muted text-foreground' },
];

export default function VendorManagement() {
  const { showToast } = useAppStore();
  const queryClient = useQueryClient();
  const [addOpen, setAddOpen] = useState(false);
  const [filterType, setFilterType] = useState('all');
  const [form, setForm] = useState({ name: '', type: 'PLUMBER', phone: '', email: '', area: '' });

  const { data: ownerUser } = useQuery({
    queryKey: ['owner-user'],
    queryFn: async () => {
      const res = await fetch('/api/auth?role=OWNER');
      const users = await res.json();
      return users[0] || null;
    },
  });
  const ownerCity = ownerUser?.city;

  const { data: vendors, isLoading } = useQuery({
    queryKey: ['vendors'],
    queryFn: async () => {
      const cityParam = ownerCity ? `?city=${encodeURIComponent(ownerCity)}` : '';
      const res = await fetch(`/api/vendors${cityParam}`);
      if (!res.ok) throw new Error('Failed to fetch vendors');
      return res.json();
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: typeof form) => {
      const res = await fetch('/api/vendors', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error('Failed to create vendor');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vendors'] });
      showToast('Vendor added successfully!');
      setAddOpen(false);
      setForm({ name: '', type: 'PLUMBER', phone: '', email: '', area: '' });
    },
    onError: () => showToast('Failed to add vendor'),
  });

  const filtered = (vendors || []).filter((v: { type: string }) => filterType === 'all' || v.type === filterType);
  const getTypeInfo = (type: string) => VENDOR_TYPES.find(t => t.value === type) || VENDOR_TYPES[6];

  return (
    <div className="p-4 md:p-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Vendor Directory</h1>
          <p className="text-muted-foreground mt-1">Manage service providers and vendors</p>
        </div>
        <Dialog open={addOpen} onOpenChange={setAddOpen}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-to-r from-brand-deep to-brand-teal hover:from-brand-deep hover:to-brand-teal text-white shadow-md">
              <Plus className="size-4 mr-2" /> Add Vendor
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Add New Vendor</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-2">
              <div className="space-y-2">
                <Label>Vendor Name *</Label>
                <Input placeholder="e.g., QuickFix Plumbing" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} />
              </div>
              <div className="space-y-2">
                <Label>Service Type *</Label>
                <Select value={form.type} onValueChange={v => setForm(p => ({ ...p, type: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {VENDOR_TYPES.map(t => (
                      <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Phone *</Label>
                <Input placeholder="+91 98765 43210" value={form.phone} onChange={e => setForm(p => ({ ...p, phone: e.target.value }))} />
              </div>
              <div className="space-y-2">
                <Label>Email</Label>
                <Input type="email" placeholder="vendor@email.com" value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} />
              </div>
              <div className="space-y-2">
                <Label>Area</Label>
                <Input placeholder="e.g., Koramangala" value={form.area} onChange={e => setForm(p => ({ ...p, area: e.target.value }))} />
              </div>
              <Button
                className="w-full bg-gradient-to-r from-brand-deep to-brand-teal hover:from-brand-deep hover:to-brand-teal text-white"
                onClick={() => createMutation.mutate(form)}
                disabled={createMutation.isPending || !form.name || !form.phone}
              >
                {createMutation.isPending ? <Loader2 className="size-4 mr-2 animate-spin" /> : <Check className="size-4 mr-2" />}
                Add Vendor
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filter */}
      <div className="flex items-center gap-3 flex-wrap">
        <Filter className="size-4 text-muted-foreground" />
        {VENDOR_TYPES.map(t => (
          <button
            key={t.value}
            onClick={() => setFilterType(filterType === t.value ? 'all' : t.value)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
              filterType === t.value ? t.color + ' ring-2 ring-offset-1 ring-current' : 'bg-muted text-muted-foreground hover:bg-muted'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Vendor Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="animate-pulse"><CardContent className="p-6"><div className="h-28 bg-muted rounded" /></CardContent></Card>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="p-12 text-center">
            <Wrench className="size-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-muted-foreground">No Vendors Found</h3>
            <p className="text-sm text-muted-foreground mt-1">Add vendors to your directory</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <AnimatePresence>
            {filtered.map((vendor: { id: string; name: string; type: string; phone: string; email?: string; area?: string; rating: number; status: string }, index: number) => {
              const typeInfo = getTypeInfo(vendor.type);
              return (
                <motion.div
                  key={vendor.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Card className="hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <div className="bg-brand-teal/15 p-2.5 rounded-xl">
                            <Wrench className="size-5 text-brand-teal" />
                          </div>
                          <div>
                            <h3 className="font-semibold text-foreground">{vendor.name}</h3>
                            <Badge className={`${typeInfo.color} text-xs mt-1`}>{typeInfo.label}</Badge>
                          </div>
                        </div>
                        <div className="flex items-center gap-1 bg-brand-sage/10 px-2 py-1 rounded-lg">
                          <Star className="size-3.5 fill-brand-sage text-brand-sage" />
                          <span className="text-sm font-medium text-brand-sage">{vendor.rating?.toFixed(1) || '4.0'}</span>
                        </div>
                      </div>

                      <div className="mt-3 space-y-1.5">
                        {vendor.area && (
                          <div className="text-sm text-muted-foreground">{vendor.area}, Bangalore</div>
                        )}
                        <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                          <Phone className="size-3.5" />
                          <span>{vendor.phone}</span>
                        </div>
                        {vendor.email && (
                          <div className="text-sm text-muted-foreground truncate">{vendor.email}</div>
                        )}
                      </div>

                      <div className="mt-4 flex gap-2">
                        <a
                          href={`tel:${vendor.phone}`}
                          className="flex-1 flex items-center justify-center gap-1.5 bg-green-50 text-green-700 hover:bg-green-100 py-2 rounded-lg text-sm font-medium transition-colors"
                        >
                          <Phone className="size-3.5" /> Call
                        </a>
                        <Button variant="outline" size="sm" className="flex-1" onClick={() => showToast('Assignment feature coming soon!')}>
                          <User className="size-3.5 mr-1" /> Assign
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
