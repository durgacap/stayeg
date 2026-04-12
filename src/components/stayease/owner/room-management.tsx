'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus, BedDouble, Snowflake, Bath, ChevronDown, ChevronUp, Loader2, Check,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { useAppStore } from '@/store/use-app-store';
import { BADGE, BADGE_BORDER } from '@/lib/constants';

export default function RoomManagement() {
  const { showToast, selectedPG } = useAppStore();
  const queryClient = useQueryClient();
  const [selectedPgId, setSelectedPgId] = useState(selectedPG?.id || '');
  const [addOpen, setAddOpen] = useState(false);
  const [expandedRoom, setExpandedRoom] = useState<string | null>(null);
  const [roomForm, setRoomForm] = useState({
    roomCode: '', roomType: 'DOUBLE', floor: '1', hasAC: false, hasAttachedBath: false, bedCount: '2',
  });

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
    queryKey: ['owner-pgs-list', ownerId],
    queryFn: async () => {
      const res = await fetch(`/api/pgs?ownerId=${ownerId}`);
      return res.json();
    },
    enabled: !!ownerId,
  });

  const pgList = pgs || [];

  const { data: currentPG, isLoading } = useQuery({
    queryKey: ['owner-pg-detail', selectedPgId],
    queryFn: async () => {
      const res = await fetch(`/api/pgs?ownerId=${ownerId}`);
      const allPGs = await res.json();
      return allPGs.find((p: { id: string }) => p.id === selectedPgId) || null;
    },
    enabled: !!ownerId && !!selectedPgId,
  });

  const rooms = currentPG?.rooms || [];

  const createRoomMutation = useMutation({
    mutationFn: async (data: typeof roomForm) => {
      const createRes = await fetch(`/api/pgs/${selectedPgId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'add_room',
          room: {
            pgId: selectedPgId,
            roomCode: data.roomCode,
            roomType: data.roomType,
            floor: Number(data.floor) || 1,
            hasAC: data.hasAC,
            hasAttachedBath: data.hasAttachedBath,
            bedCount: Number(data.bedCount) || 2,
          },
        }),
      });
      if (!createRes.ok) {
        throw new Error('Room creation requires backend support');
      }
      return createRes.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['owner-pg-detail'] });
      queryClient.invalidateQueries({ queryKey: ['owner-pgs'] });
      showToast('Room added successfully!');
      setAddOpen(false);
      setRoomForm({ roomCode: '', roomType: 'DOUBLE', floor: '1', hasAC: false, hasAttachedBath: false, bedCount: '2' });
    },
    onError: () => {
      showToast('Failed to add room. Backend support needed.');
    },
  });

  const [bedStatuses, setBedStatuses] = useState<Record<string, string>>({});

  const toggleBedStatus = (bedId: string, currentStatus: string) => {
    const statuses = ['AVAILABLE', 'OCCUPIED', 'MAINTENANCE'];
    const nextIndex = (statuses.indexOf(currentStatus) + 1) % statuses.length;
    const nextStatus = statuses[nextIndex];
    setBedStatuses(prev => ({ ...prev, [bedId]: nextStatus }));
    showToast(`Bed ${bedId.slice(-4)} set to ${nextStatus}`);
  };

  const bedStatusColor = (status: string) => {
    switch (status) {
      case 'AVAILABLE': return BADGE_BORDER.green;
      case 'OCCUPIED': return BADGE_BORDER.red;
      case 'MAINTENANCE': return BADGE_BORDER.yellow;
      default: return 'bg-muted text-foreground';
    }
  };

  const bedDotColor = (status: string) => {
    switch (status) {
      case 'AVAILABLE': return 'bg-green-500';
      case 'OCCUPIED': return 'bg-red-500';
      case 'MAINTENANCE': return 'bg-yellow-500';
      default: return 'bg-muted-foreground';
    }
  };

  const getRoomTypeBadge = (type: string) => {
    const colors: Record<string, string> = {
      SINGLE: BADGE.indigo,
      DOUBLE: BADGE.blue,
      TRIPLE: BADGE.cyan,
      DORMITORY: 'bg-muted text-foreground',
    };
    return colors[type] || 'bg-muted text-foreground';
  };

  return (
    <div className="p-4 md:p-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Room & Bed Management</h1>
          <p className="text-muted-foreground mt-1">Manage rooms and bed allocations</p>
        </div>
      </div>

      {/* PG Selector */}
      <div className="flex items-center gap-4">
        <div className="flex-1 max-w-md">
          <Select value={selectedPgId} onValueChange={setSelectedPgId}>
            <SelectTrigger>
              <SelectValue placeholder="Select a PG property..." />
            </SelectTrigger>
            <SelectContent>
              {pgList.map((pg: { id: string; name: string }) => (
                <SelectItem key={pg.id} value={pg.id}>{pg.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <Dialog open={addOpen} onOpenChange={setAddOpen}>
          <DialogTrigger asChild>
            <Button disabled={!selectedPgId} className="bg-gradient-to-r from-brand-deep to-brand-teal hover:from-brand-deep hover:to-brand-teal text-white">
              <Plus className="size-4 mr-2" /> Add Room
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Room</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-2">
              <div className="space-y-2">
                <Label>Room Code *</Label>
                <Input placeholder="e.g., A101" value={roomForm.roomCode} onChange={e => setRoomForm(p => ({ ...p, roomCode: e.target.value }))} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Room Type</Label>
                  <Select value={roomForm.roomType} onValueChange={v => setRoomForm(p => ({ ...p, roomType: v }))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="SINGLE">Single</SelectItem>
                      <SelectItem value="DOUBLE">Double</SelectItem>
                      <SelectItem value="TRIPLE">Triple</SelectItem>
                      <SelectItem value="DORMITORY">Dormitory</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Floor</Label>
                  <Input type="number" min="0" value={roomForm.floor} onChange={e => setRoomForm(p => ({ ...p, floor: e.target.value }))} />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Bed Count</Label>
                <Input type="number" min="1" max="8" value={roomForm.bedCount} onChange={e => setRoomForm(p => ({ ...p, bedCount: e.target.value }))} />
              </div>
              <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                <Label>Air Conditioning</Label>
                <Switch checked={roomForm.hasAC} onCheckedChange={v => setRoomForm(p => ({ ...p, hasAC: v }))} />
              </div>
              <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                <Label>Attached Bathroom</Label>
                <Switch checked={roomForm.hasAttachedBath} onCheckedChange={v => setRoomForm(p => ({ ...p, hasAttachedBath: v }))} />
              </div>
              <Button
                className="w-full bg-gradient-to-r from-brand-deep to-brand-teal hover:from-brand-deep hover:to-brand-teal text-white"
                onClick={() => createRoomMutation.mutate(roomForm)}
                disabled={createRoomMutation.isPending || !roomForm.roomCode}
              >
                {createRoomMutation.isPending ? <Loader2 className="size-4 mr-2 animate-spin" /> : <Check className="size-4 mr-2" />}
                Create Room
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {!selectedPgId ? (
        <Card className="border-dashed">
          <CardContent className="p-12 text-center">
            <BedDouble className="size-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-muted-foreground">Select a PG Property</h3>
            <p className="text-sm text-muted-foreground mt-1">Choose a PG from the dropdown above to manage rooms</p>
          </CardContent>
        </Card>
      ) : isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="animate-pulse"><CardContent className="p-6"><div className="h-32 bg-muted rounded" /></CardContent></Card>
          ))}
        </div>
      ) : rooms.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="p-12 text-center">
            <BedDouble className="size-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-muted-foreground">No Rooms Yet</h3>
            <p className="text-sm text-muted-foreground mt-1">Add your first room to this PG property</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <AnimatePresence>
            {rooms.map((room: { id: string; roomCode: string; roomType: string; floor: number; hasAC: boolean; hasAttachedBath: boolean; beds?: { id: string; bedNumber: number; status: string }[] }, index: number) => {
              const isExpanded = expandedRoom === room.id;
              const beds = room.beds || [];
              const occupied = beds.filter(b => b.status === 'OCCUPIED').length;
              const available = beds.filter(b => b.status === 'AVAILABLE').length;
              const maintenance = beds.filter(b => b.status === 'MAINTENANCE').length;
              return (
                <motion.div
                  key={room.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Card className="hover:shadow-md transition-shadow">
                    <CardContent className="p-4 md:p-5">
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-mono font-bold text-foreground text-lg">{room.roomCode}</span>
                            <Badge className={getRoomTypeBadge(room.roomType)}>{room.roomType}</Badge>
                            <Badge variant="outline">Floor {room.floor}</Badge>
                          </div>
                          <div className="flex items-center gap-3 mt-2">
                            {room.hasAC && (
                              <div className="flex items-center gap-1 text-blue-600 text-sm">
                                <Snowflake className="size-3.5" /> AC
                              </div>
                            )}
                            {room.hasAttachedBath && (
                              <div className="flex items-center gap-1 text-green-600 text-sm">
                                <Bath className="size-3.5" /> Attached Bath
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-bold text-foreground">{beds.length}</div>
                          <div className="text-xs text-muted-foreground">total beds</div>
                        </div>
                      </div>

                      {/* Bed summary */}
                      <div className="flex items-center gap-4 mt-3 text-sm">
                        <span className="flex items-center gap-1">
                          <span className="size-2.5 rounded-full bg-green-500" />
                          {available} Available
                        </span>
                        <span className="flex items-center gap-1">
                          <span className="size-2.5 rounded-full bg-red-500" />
                          {occupied} Occupied
                        </span>
                        {maintenance > 0 && (
                          <span className="flex items-center gap-1">
                            <span className="size-2.5 rounded-full bg-yellow-500" />
                            {maintenance} Maintenance
                          </span>
                        )}
                      </div>

                      <Separator className="my-3" />
                      <button
                        onClick={() => setExpandedRoom(isExpanded ? null : room.id)}
                        className="flex items-center gap-2 text-sm text-muted-foreground hover:text-brand-teal transition-colors w-full text-left"
                      >
                        {isExpanded ? <ChevronUp className="size-4" /> : <ChevronDown className="size-4" />}
                        <span>{isExpanded ? 'Hide' : 'Show'} Bed Details</span>
                      </button>

                      <AnimatePresence>
                        {isExpanded && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            className="overflow-hidden"
                          >
                            <div className="mt-3 grid grid-cols-3 gap-2">
                              {beds.map((bed: { id: string; bedNumber: number; status: string }) => {
                                const effectiveStatus = bedStatuses[bed.id] || bed.status;
                                return (
                                <button
                                  key={bed.id}
                                  onClick={() => toggleBedStatus(bed.id, effectiveStatus)}
                                  className={`p-3 rounded-xl border text-center transition-all hover:scale-105 ${bedStatusColor(effectiveStatus)}`}
                                >
                                  <div className={`size-3 rounded-full ${bedDotColor(effectiveStatus)} mx-auto mb-1.5`} />
                                  <div className="text-xs font-semibold">Bed #{bed.bedNumber}</div>
                                  <div className="text-[10px] mt-0.5 opacity-75">{effectiveStatus}</div>
                                </button>
                                );
                              })}
                            </div>
                            <p className="text-xs text-muted-foreground mt-2 text-center">Click a bed to cycle its status</p>
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
    </div>
  );
}
