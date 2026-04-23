'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus, Edit2, Building2, MapPin, Star, BedDouble, Users, ChevronDown, ChevronUp, X, Check, Loader2,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';
import { useAppStore } from '@/store/use-app-store';
import { authFetch } from '@/lib/api-client';
import { AMENITIES_LIST, STATUSES, BADGE } from '@/lib/constants';
import type { PG } from '@/lib/types';

export default function PGManagement() {
  const { showToast, setSelectedPG } = useAppStore();
  const queryClient = useQueryClient();
  const [addOpen, setAddOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [expandedPG, setExpandedPG] = useState<string | null>(null);
  const [editPG, setEditPG] = useState<PG | null>(null);
  const [form, setForm] = useState({
    name: '', address: '', city: 'Bangalore', gender: 'UNISEX' as string,
    price: '', securityDeposit: '', description: '', amenities: [] as string[], images: '',
  });

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

  const { data: pgs, isLoading } = useQuery({
    queryKey: ['owner-pgs', ownerId],
    queryFn: async () => {
      const res = await fetch(`/api/pgs?ownerId=${ownerId}`);
      if (!res.ok) throw new Error('Failed to fetch PGs');
      return res.json();
    },
    enabled: !!ownerId,
  });

  const createMutation = useMutation({
    mutationFn: async (data: typeof form) => {
      const res = await authFetch('/api/pgs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...data,
          ownerId,
          price: Number(data.price) || 0,
          securityDeposit: Number(data.securityDeposit) || 0,
        }),
      });
      if (!res.ok) throw new Error('Failed to create PG');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['owner-pgs'] });
      queryClient.invalidateQueries({ queryKey: ['owner-analytics'] });
      showToast('PG created successfully!');
      setAddOpen(false);
      setForm({ name: '', address: '', city: 'Bangalore', gender: 'UNISEX', price: '', securityDeposit: '', description: '', amenities: [], images: '' });
    },
    onError: () => showToast('Failed to create PG'),
  });

  const updateMutation = useMutation({
    mutationFn: async (data: typeof form & { id: string }) => {
      const res = await authFetch('/api/pgs', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: data.id,
          name: data.name,
          address: data.address,
          city: data.city,
          gender: data.gender,
          price: Number(data.price) || 0,
          securityDeposit: Number(data.securityDeposit) || 0,
          description: data.description,
          amenities: data.amenities,
        }),
      });
      if (!res.ok) throw new Error('Failed to update PG');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['owner-pgs'] });
      showToast('PG updated successfully!');
      setEditOpen(false);
      setEditPG(null);
    },
    onError: () => showToast('Failed to update PG'),
  });

  const toggleAmenity = (amenityId: string) => {
    setForm(prev => {
      const raw = prev.amenities as unknown;
      const list = Array.isArray(raw) ? raw : 
        typeof raw === 'string' ? (raw as string).split(',').filter(Boolean) : [];
      return {
        ...prev,
        amenities: list.includes(amenityId)
          ? list.filter(a => a !== amenityId)
          : [...list, amenityId],
      };
    });
  };

  const openEdit = (pg: PG) => {
    setEditPG(pg);
    setForm({
      name: pg.name,
      address: pg.address,
      city: pg.city,
      gender: pg.gender,
      price: String(pg.price),
      securityDeposit: String(pg.securityDeposit),
      description: pg.description || '',
      amenities: typeof pg.amenities === 'string' ? pg.amenities.split(',').filter(Boolean) : pg.amenities || [],
      images: typeof pg.images === 'string' ? pg.images : String((pg.images || [])).split(',').join(','),
    });
    setEditOpen(true);
  };

  const handleEditSave = () => {
    if (!editPG) return;
    updateMutation.mutate({ ...form, id: editPG.id });
  };

  const genderBadgeColor = (g: string) => {
    switch (g) {
      case 'MALE': return BADGE.blue;
      case 'FEMALE': return BADGE.pink;
      default: return BADGE.purple;
    }
  };

  const getOccupancy = (pg: PG) => {
    const rooms = pg.rooms || [];
    const totalBeds = rooms.reduce((sum, r) => sum + (r.beds?.length || 0), 0);
    const occupied = rooms.reduce(
      (sum, r) => sum + (r.beds?.filter((b: { status: string }) => b.status === 'OCCUPIED').length || 0), 0
    );
    return { total: totalBeds, occupied, rate: totalBeds > 0 ? Math.round((occupied / totalBeds) * 100) : 0 };
  };

  return (
    <div className="p-4 md:p-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">My PG Properties</h1>
          <p className="text-muted-foreground mt-1">Manage your PG accommodations</p>
        </div>
        <Dialog open={addOpen} onOpenChange={setAddOpen}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-to-r from-brand-deep to-brand-teal hover:from-brand-deep hover:to-brand-teal text-white shadow-md">
              <Plus className="size-4 mr-2" /> Add New PG
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Add New PG Property</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-2">
              <div className="space-y-2">
                <Label>PG Name *</Label>
                <Input placeholder="e.g., Sunrise PG - Koramangala" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} />
              </div>
              <div className="space-y-2">
                <Label>Address *</Label>
                <Textarea placeholder="Full address" value={form.address} onChange={e => setForm(p => ({ ...p, address: e.target.value }))} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>City</Label>
                  <Input placeholder="Bangalore" value={form.city} onChange={e => setForm(p => ({ ...p, city: e.target.value }))} />
                </div>
                <div className="space-y-2">
                  <Label>Gender Type</Label>
                  <Select value={form.gender} onValueChange={v => setForm(p => ({ ...p, gender: v }))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="MALE">Boys</SelectItem>
                      <SelectItem value="FEMALE">Girls</SelectItem>
                      <SelectItem value="UNISEX">Unisex</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Monthly Rent (₹) *</Label>
                  <Input type="number" placeholder="12000" value={form.price} onChange={e => setForm(p => ({ ...p, price: e.target.value }))} />
                </div>
                <div className="space-y-2">
                  <Label>Security Deposit (₹)</Label>
                  <Input type="number" placeholder="24000" value={form.securityDeposit} onChange={e => setForm(p => ({ ...p, securityDeposit: e.target.value }))} />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea placeholder="Describe your PG..." rows={3} value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} />
              </div>
              <div className="space-y-2">
                <Label>Images (comma-separated URLs)</Label>
                <Input placeholder="https://..." value={form.images} onChange={e => setForm(p => ({ ...p, images: e.target.value }))} />
              </div>
              <div className="space-y-2">
                <Label>Amenities</Label>
                <div className="grid grid-cols-3 gap-2">
                  {AMENITIES_LIST.map(amenity => (
                    <label key={amenity.id} className="flex items-center gap-2 text-sm cursor-pointer p-1.5 rounded-lg hover:bg-muted">
                      <Checkbox
                        checked={(() => {
                          const raw = form.amenities as unknown;
                          const list = Array.isArray(raw) ? raw :
                            typeof raw === 'string' ? (raw as string).split(',').filter(Boolean) : [];
                          return list.includes(amenity.id);
                        })()}
                        onCheckedChange={() => toggleAmenity(amenity.id)}
                      />
                      <span className="text-foreground">{amenity.label}</span>
                    </label>
                  ))}
                </div>
              </div>
              <Button
                className="w-full bg-gradient-to-r from-brand-deep to-brand-teal hover:from-brand-deep hover:to-brand-teal text-white"
                onClick={() => createMutation.mutate(form)}
                disabled={createMutation.isPending || !form.name || !form.address}
              >
                {createMutation.isPending ? <Loader2 className="size-4 mr-2 animate-spin" /> : <Check className="size-4 mr-2" />}
                Create PG Property
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="animate-pulse"><CardContent className="p-6"><div className="h-40 bg-muted rounded" /></CardContent></Card>
          ))}
        </div>
      ) : pgs?.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="p-12 text-center">
            <Building2 className="size-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-muted-foreground">No PG Properties Yet</h3>
            <p className="text-sm text-muted-foreground mt-1">Add your first PG property to get started</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <AnimatePresence>
            {pgs?.map((pg: PG, index: number) => {
              const occupancy = getOccupancy(pg);
              const isExpanded = expandedPG === pg.id;
              return (
                <motion.div
                  key={pg.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Card className="hover:shadow-md transition-all duration-200 overflow-hidden">
                    <CardContent className="p-4 md:p-5">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="font-semibold text-foreground truncate">{pg.name}</h3>
                            <Badge className={genderBadgeColor(pg.gender)}>
                              {pg.gender === 'MALE' ? 'Boys' : pg.gender === 'FEMALE' ? 'Girls' : 'Unisex'}
                            </Badge>
                            <Badge className={STATUSES.PG[pg.status as keyof typeof STATUSES.PG]?.color}>
                              {STATUSES.PG[pg.status as keyof typeof STATUSES.PG]?.label || pg.status}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-1.5 mt-2 text-sm text-muted-foreground">
                            <MapPin className="size-3.5" />
                            <span className="truncate">{pg.address}</span>
                          </div>
                          <div className="flex items-center gap-4 mt-3">
                            <div className="flex items-center gap-1">
                              <Star className="size-3.5 fill-brand-sage text-brand-sage" />
                              <span className="text-sm font-medium text-foreground">{pg.rating}</span>
                              <span className="text-xs text-muted-foreground">({pg.totalReviews})</span>
                            </div>
                            <div className="text-sm font-semibold text-brand-teal">₹{pg.price.toLocaleString('en-IN')}/mo</div>
                          </div>
                          <div className="flex items-center gap-4 mt-3 text-sm">
                            <span className="text-muted-foreground"><BedDouble className="size-3.5 inline mr-1" />{occupancy.total} beds</span>
                            <span className="text-brand-lime font-medium">{occupancy.rate}% occupied</span>
                          </div>
                          {/* Occupancy bar */}
                          <div className="mt-2 h-1.5 bg-muted rounded-full overflow-hidden">
                            <div
                              className="h-full bg-gradient-to-r from-brand-deep to-brand-teal rounded-full transition-all duration-500"
                              style={{ width: `${occupancy.rate}%` }}
                            />
                          </div>
                        </div>
                        <div className="flex flex-col gap-2">
                          <Button
                            variant="outline"
                            size="icon"
                            className="size-8"
                            onClick={() => openEdit(pg)}
                          >
                            <Edit2 className="size-3.5" />
                          </Button>
                          <Button
                            variant="outline"
                            size="icon"
                            className="size-8"
                            onClick={() => {
                              setSelectedPG(pg);
                              useAppStore.getState().setCurrentView('OWNER_ROOMS');
                            }}
                          >
                            <BedDouble className="size-3.5" />
                          </Button>
                        </div>
                      </div>

                      {/* Expand rooms summary */}
                      <Separator className="my-3" />
                      <button
                        onClick={() => setExpandedPG(isExpanded ? null : pg.id)}
                        className="flex items-center gap-2 text-sm text-muted-foreground hover:text-brand-teal transition-colors w-full text-left"
                      >
                        {isExpanded ? <ChevronUp className="size-4" /> : <ChevronDown className="size-4" />}
                        <span>{isExpanded ? 'Hide' : 'Show'} Rooms Summary</span>
                        <span className="text-xs text-muted-foreground ml-auto">{pg.rooms?.length || 0} rooms</span>
                      </button>

                      <AnimatePresence>
                        {isExpanded && pg.rooms && pg.rooms.length > 0 && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            className="overflow-hidden"
                          >
                            <div className="mt-3 space-y-2">
                              {pg.rooms.map((room: { id: string; roomCode: string; roomType: string; floor: number; hasAC: boolean; hasAttachedBath: boolean; beds?: { status: string }[] }) => {
                                const totalBeds = room.beds?.length || 0;
                                const occupiedBeds = room.beds?.filter(b => b.status === 'OCCUPIED').length || 0;
                                return (
                                  <div key={room.id} className="flex items-center justify-between p-2.5 bg-muted rounded-lg text-sm">
                                    <div className="flex items-center gap-2">
                                      <Badge variant="outline" className="font-mono text-xs">{room.roomCode}</Badge>
                                      <span className="text-muted-foreground">{room.roomType}</span>
                                      <span className="text-muted-foreground">F{room.floor}</span>
                                      {room.hasAC && <span className="text-brand-teal text-xs">AC</span>}
                                      {room.hasAttachedBath && <span className="text-brand-lime text-xs">Bath</span>}
                                    </div>
                                    <div className="flex items-center gap-1">
                                      <span className="text-muted-foreground">{occupiedBeds}/{totalBeds}</span>
                                      <BedDouble className="size-3 text-muted-foreground" />
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}

      {/* Edit Dialog */}
      <Dialog open={editOpen} onOpenChange={(v) => { if (!v) setEditPG(null); setEditOpen(v); }}>
        <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit PG Property</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <div className="space-y-2">
              <Label>PG Name *</Label>
              <Input value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} />
            </div>
            <div className="space-y-2">
              <Label>Address *</Label>
              <Textarea value={form.address} onChange={e => setForm(p => ({ ...p, address: e.target.value }))} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>City</Label>
                <Input value={form.city} onChange={e => setForm(p => ({ ...p, city: e.target.value }))} />
              </div>
              <div className="space-y-2">
                <Label>Gender Type</Label>
                <Select value={form.gender} onValueChange={v => setForm(p => ({ ...p, gender: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="MALE">Boys</SelectItem>
                    <SelectItem value="FEMALE">Girls</SelectItem>
                    <SelectItem value="UNISEX">Unisex</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Monthly Rent (₹)</Label>
                <Input type="number" value={form.price} onChange={e => setForm(p => ({ ...p, price: e.target.value }))} />
              </div>
              <div className="space-y-2">
                <Label>Security Deposit (₹)</Label>
                <Input type="number" value={form.securityDeposit} onChange={e => setForm(p => ({ ...p, securityDeposit: e.target.value }))} />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea rows={3} value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} />
            </div>
            <div className="space-y-2">
              <Label>Amenities</Label>
              <div className="grid grid-cols-3 gap-2">
                {AMENITIES_LIST.map(amenity => (
                  <label key={amenity.id} className="flex items-center gap-2 text-sm cursor-pointer p-1.5 rounded-lg hover:bg-muted">
                    <Checkbox checked={(() => {
                      const raw = form.amenities as unknown;
                      const list = Array.isArray(raw) ? raw :
                        typeof raw === 'string' ? (raw as string).split(',').filter(Boolean) : [];
                      return list.includes(amenity.id);
                    })()} onCheckedChange={() => toggleAmenity(amenity.id)} />
                    <span className="text-foreground">{amenity.label}</span>
                  </label>
                ))}
              </div>
            </div>
            <Button
              className="w-full bg-gradient-to-r from-brand-deep to-brand-teal hover:from-brand-deep hover:to-brand-teal text-white"
              onClick={handleEditSave}
              disabled={updateMutation.isPending || !form.name || !form.address}
            >
              {updateMutation.isPending ? <Loader2 className="size-4 mr-2 animate-spin" /> : <Check className="size-4 mr-2" />}
              Save Changes
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
