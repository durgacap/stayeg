'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import {
  AlertTriangle, ChevronDown, ChevronUp, Check, Loader2, MessageSquare,
  Filter, Clock, ArrowRight,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import { useAppStore } from '@/store/use-app-store';
import { authFetch } from '@/lib/api-client';
import { STATUSES, BADGE, BADGE_BORDER, CARD_BG, TEXT_COLOR } from '@/lib/constants';

const PRIORITY_CONFIG: Record<string, { color: string; bg: string; icon: string }> = {
  URGENT: { color: TEXT_COLOR.red, bg: BADGE.red, icon: '🔴' },
  HIGH: { color: 'text-brand-teal', bg: 'bg-brand-teal/15', icon: '🟠' },
  MEDIUM: { color: TEXT_COLOR.yellow, bg: BADGE.yellow, icon: '🟡' },
  LOW: { color: TEXT_COLOR.green, bg: BADGE.green, icon: '🟢' },
};

const CATEGORIES = ['MAINTENANCE', 'CLEANLINESS', 'NOISE', 'SAFETY', 'GENERAL'];

export default function ComplaintManagement() {
  const { showToast } = useAppStore();
  const queryClient = useQueryClient();
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterPriority, setFilterPriority] = useState('all');
  const [resolveDialog, setResolveDialog] = useState(false);
  const [selectedComplaint, setSelectedComplaint] = useState<{ id: string } | null>(null);
  const [resolution, setResolution] = useState('');
  const [newStatus, setNewStatus] = useState('IN_PROGRESS');

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

  const { data: pgs } = useQuery({
    queryKey: ['owner-pgs-complaints', ownerId],
    queryFn: async () => {
      const res = await fetch(`/api/pgs?ownerId=${ownerId}`);
      return res.json();
    },
    enabled: !!ownerId,
  });

  const pgIds = (pgs || []).map((p: { id: string }) => p.id);

  const { data: complaints, isLoading } = useQuery({
    queryKey: ['owner-complaints-list', pgIds.join(',')],
    queryFn: async () => {
      if (pgIds.length === 0) return [];
      const results = await Promise.all(
        pgIds.map((id: string) => fetch(`/api/complaints?pgId=${id}`).then(r => r.json()))
      );
      return results.flat();
    },
    enabled: pgIds.length > 0,
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, status, resolution: res }: { id: string; status: string; resolution?: string }) => {
      const body: Record<string, string> = { id, status };
      if (res) body.resolution = res;
      const resp = await authFetch('/api/complaints', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      if (!resp.ok) throw new Error('Failed to update complaint');
      return resp.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['owner-complaints-list'] });
      showToast('Complaint updated!');
      setResolveDialog(false);
      setResolution('');
    },
    onError: () => showToast('Failed to update complaint'),
  });

  const handleUpdate = (complaint: { id: string }, status: string) => {
    if (status === 'RESOLVED' || status === 'CLOSED') {
      setSelectedComplaint(complaint);
      setNewStatus(status);
      setResolveDialog(true);
    } else {
      updateMutation.mutate({ id: complaint.id, status });
    }
  };

  const filtered = (complaints || []).filter((c: { status: string; priority: string }) => {
    if (filterStatus !== 'all' && c.status !== filterStatus) return false;
    if (filterPriority !== 'all' && c.priority !== filterPriority) return false;
    return true;
  });

  const openCount = (complaints || []).filter((c: { status: string }) => c.status === 'OPEN').length;
  const inProgressCount = (complaints || []).filter((c: { status: string }) => c.status === 'IN_PROGRESS').length;

  const pgNameMap: Record<string, string> = {};
  (pgs || []).forEach((pg: { id: string; name: string }) => { pgNameMap[pg.id] = pg.name; });

  const statusColor = (status: string) => STATUSES.COMPLAINT[status as keyof typeof STATUSES.COMPLAINT]?.color || 'bg-muted text-foreground';
  const priorityConfig = (priority: string) => PRIORITY_CONFIG[priority] || PRIORITY_CONFIG.MEDIUM;

  const statusFlow = (currentStatus: string): string[] => {
    switch (currentStatus) {
      case 'OPEN': return ['IN_PROGRESS', 'RESOLVED', 'CLOSED'];
      case 'IN_PROGRESS': return ['RESOLVED', 'CLOSED', 'OPEN'];
      case 'RESOLVED': return ['CLOSED'];
      default: return [];
    }
  };

  return (
    <div className="p-4 md:p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Complaint Management</h1>
        <p className="text-muted-foreground mt-1">Handle tenant complaints and issues</p>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-foreground">{(complaints || []).length}</p>
            <p className="text-sm text-muted-foreground">Total</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-red-600">{openCount}</p>
            <p className="text-sm text-muted-foreground">Open</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-yellow-600">{inProgressCount}</p>
            <p className="text-sm text-muted-foreground">In Progress</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-green-600">
              {(complaints || []).filter((c: { status: string }) => c.status === 'RESOLVED' || c.status === 'CLOSED').length}
            </p>
            <p className="text-sm text-muted-foreground">Resolved</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex items-center gap-2 flex-wrap">
          <Filter className="size-4 text-muted-foreground" />
          <span className="text-sm text-muted-foreground">Status:</span>
          {['all', 'OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'].map(s => (
            <button
              key={s}
              onClick={() => setFilterStatus(s)}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
                filterStatus === s ? 'bg-brand-teal/15 text-brand-teal ring-1 ring-brand-teal/30' : 'bg-muted text-muted-foreground hover:bg-muted'
              }`}
            >
              {s === 'all' ? 'All' : STATUSES.COMPLAINT[s as keyof typeof STATUSES.COMPLAINT]?.label || s}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Priority:</span>
          {['all', 'URGENT', 'HIGH', 'MEDIUM', 'LOW'].map(p => (
            <button
              key={p}
              onClick={() => setFilterPriority(p)}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
                filterPriority === p ? 'bg-brand-teal/15 text-brand-teal ring-1 ring-brand-teal/30' : 'bg-muted text-muted-foreground hover:bg-muted'
              }`}
            >
              {p === 'all' ? 'All' : p.charAt(0) + p.slice(1).toLowerCase()}
            </button>
          ))}
        </div>
      </div>

      {/* Complaint List */}
      {isLoading ? (
        <div className="space-y-3">{[...Array(5)].map((_, i) => <Card key={i} className="animate-pulse"><CardContent className="p-6"><div className="h-16 bg-muted rounded" /></CardContent></Card>)}</div>
      ) : filtered.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="p-12 text-center">
            <MessageSquare className="size-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-muted-foreground">No Complaints</h3>
            <p className="text-sm text-muted-foreground mt-1">All clear! No complaints to handle.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          <AnimatePresence>
            {filtered.map((c: { id: string; title: string; description?: string; category: string; priority: string; status: string; user?: { name: string; avatar?: string }; pgId: string; createdAt: string; resolution?: string }, index: number) => {
              const isExpanded = expandedId === c.id;
              const pConfig = priorityConfig(c.priority);
              const nextActions = statusFlow(c.status);
              return (
                <motion.div
                  key={c.id}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Card className={`hover:shadow-md transition-all ${c.priority === 'URGENT' ? 'border-red-200' : ''}`}>
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <div className="text-lg mt-0.5">{pConfig.icon}</div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="font-semibold text-foreground truncate">{c.title}</h3>
                            <Badge className={statusColor(c.status)}>{STATUSES.COMPLAINT[c.status as keyof typeof STATUSES.COMPLAINT]?.label || c.status}</Badge>
                            <Badge className={`${pConfig.bg} ${pConfig.color} text-xs`}>{c.priority}</Badge>
                            <Badge variant="outline" className="text-xs">{c.category}</Badge>
                          </div>
                          <div className="flex items-center gap-3 mt-1.5 text-sm text-muted-foreground">
                            <span>{c.user?.name || 'Tenant'}</span>
                            <span>•</span>
                            <span>{pgNameMap[c.pgId] || 'PG'}</span>
                            <span>•</span>
                            <span className="flex items-center gap-1"><Clock className="size-3" />{new Date(c.createdAt).toLocaleDateString('en-IN')}</span>
                          </div>
                        </div>
                        <button onClick={() => setExpandedId(isExpanded ? null : c.id)} className="text-muted-foreground hover:text-foreground">
                          {isExpanded ? <ChevronUp className="size-5" /> : <ChevronDown className="size-5" />}
                        </button>
                      </div>

                      <AnimatePresence>
                        {isExpanded && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            className="overflow-hidden"
                          >
                            <Separator className="my-3" />
                            {c.description && (
                              <p className="text-sm text-muted-foreground mb-3">{c.description}</p>
                            )}
                            {c.resolution && (
                              <div className={`${CARD_BG.green} border border-green-200 rounded-lg p-3 mb-3`}>
                                <p className={`text-sm font-medium ${TEXT_COLOR.green}`}>Resolution:</p>
                                <p className={`text-sm ${TEXT_COLOR.green} mt-1`}>{c.resolution}</p>
                              </div>
                            )}
                            {nextActions.length > 0 && (
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="text-sm text-muted-foreground">Update to:</span>
                                {nextActions.map(status => (
                                  <Button
                                    key={status}
                                    size="sm"
                                    variant="outline"
                                    className="text-xs h-7"
                                    onClick={() => handleUpdate(c, status)}
                                  >
                                    <ArrowRight className="size-3 mr-1" />
                                    {STATUSES.COMPLAINT[status as keyof typeof STATUSES.COMPLAINT]?.label || status}
                                  </Button>
                                ))}
                              </div>
                            )}
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

      {/* Resolve Dialog */}
      <Dialog open={resolveDialog} onOpenChange={setResolveDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Resolve Complaint</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <div className="space-y-2">
              <Label>Status</Label>
              <Select value={newStatus} onValueChange={setNewStatus}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="RESOLVED">Resolved</SelectItem>
                  <SelectItem value="CLOSED">Closed</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Resolution Note *</Label>
              <Textarea
                placeholder="Describe how the issue was resolved..."
                value={resolution}
                onChange={e => setResolution(e.target.value)}
                rows={4}
              />
            </div>
            <Button
              className="w-full bg-green-600 hover:bg-green-700 text-white"
              onClick={() => {
                if (selectedComplaint && resolution) {
                  updateMutation.mutate({ id: selectedComplaint.id, status: newStatus, resolution });
                }
              }}
              disabled={updateMutation.isPending || !resolution}
            >
              {updateMutation.isPending ? <Loader2 className="size-4 mr-2 animate-spin" /> : <Check className="size-4 mr-2" />}
              Submit Resolution
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
