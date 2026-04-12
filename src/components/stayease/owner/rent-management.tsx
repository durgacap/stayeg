'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import {
  IndianRupee, Check, Loader2, Filter, CalendarDays, CreditCard, Banknote, Wallet,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useAppStore } from '@/store/use-app-store';
import { STATUSES, BADGE, TEXT_COLOR } from '@/lib/constants';

export default function RentManagement() {
  const { showToast } = useAppStore();
  const queryClient = useQueryClient();
  const [filterPG, setFilterPG] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [payDialogOpen, setPayDialogOpen] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<{ id: string; amount: number; method: string } | null>(null);

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
    queryKey: ['owner-pgs-rent', ownerId],
    queryFn: async () => {
      const res = await fetch(`/api/pgs?ownerId=${ownerId}`);
      return res.json();
    },
    enabled: !!ownerId,
  });

  const pgIds = (pgs || []).map((p: { id: string }) => p.id);

  const { data: payments, isLoading } = useQuery({
    queryKey: ['owner-payments', pgIds.join(',')],
    queryFn: async () => {
      if (pgIds.length === 0) return [];
      const results = await Promise.all(
        pgIds.map((id: string) => fetch(`/api/payments?pgId=${id}`).then(r => r.json()))
      );
      return results.flat();
    },
    enabled: pgIds.length > 0,
  });

  const markPaidMutation = useMutation({
    mutationFn: async ({ id, method }: { id: string; method: string }) => {
      const res = await fetch('/api/payments', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status: 'COMPLETED', paidDate: new Date().toISOString(), method }),
      });
      if (!res.ok) throw new Error('Failed to update payment');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['owner-payments'] });
      queryClient.invalidateQueries({ queryKey: ['owner-analytics'] });
      showToast('Payment marked as paid!');
      setPayDialogOpen(false);
      setSelectedPayment(null);
    },
    onError: () => showToast('Failed to update payment'),
  });

  const filteredPayments = (payments || []).filter((p: { pgId: string; status: string }) => {
    if (filterPG !== 'all' && p.pgId !== filterPG) return false;
    if (filterStatus !== 'all' && p.status !== filterStatus) return false;
    return true;
  });

  const completedPayments = (payments || []).filter((p: { status: string }) => p.status === 'COMPLETED');
  const pendingPayments = (payments || []).filter((p: { status: string }) => p.status === 'PENDING');
  const totalCollected = completedPayments.reduce((s: number, p: { amount: number }) => s + (p.amount || 0), 0);
  const totalPending = pendingPayments.reduce((s: number, p: { amount: number }) => s + (p.amount || 0), 0);

  const pgNameMap: Record<string, string> = {};
  (pgs || []).forEach((pg: { id: string; name: string }) => { pgNameMap[pg.id] = pg.name; });

  const handleMarkPaid = (payment: { id: string; amount: number; method: string }) => {
    setSelectedPayment(payment);
    setPayDialogOpen(true);
  };

  const statusColor = (status: string) => STATUSES.PAYMENT[status as keyof typeof STATUSES.PAYMENT]?.color || 'bg-muted text-foreground';

  const methodIcon = (method?: string) => {
    switch (method) {
      case 'UPI': return <Wallet className="size-3.5" />;
      case 'CARD':
      case 'CREDIT_CARD':
      case 'DEBIT_CARD': return <CreditCard className="size-3.5" />;
      case 'NET_BANKING': return <Banknote className="size-3.5" />;
      case 'WALLET': return <Wallet className="size-3.5" />;
      default: return <IndianRupee className="size-3.5" />;
    }
  };

  return (
    <div className="p-4 md:p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Rent Management</h1>
        <p className="text-muted-foreground mt-1">Track and manage rent payments</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className={`${BADGE.green} p-2.5 rounded-xl`}><IndianRupee className="size-5" /></div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Collected</p>
                  <p className={`text-xl font-bold ${TEXT_COLOR.green}`}>₹{totalCollected.toLocaleString('en-IN')}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className={`${BADGE.yellow} p-2.5 rounded-xl`}><CalendarDays className="size-5" /></div>
                <div>
                  <p className="text-sm text-muted-foreground">Pending Amount</p>
                  <p className={`text-xl font-bold ${TEXT_COLOR.yellow}`}>₹{totalPending.toLocaleString('en-IN')}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className={`${BADGE.red} p-2.5 rounded-xl`}><CreditCard className="size-5" /></div>
                <div>
                  <p className="text-sm text-muted-foreground">Pending Payments</p>
                  <p className={`text-xl font-bold ${TEXT_COLOR.red}`}>{pendingPayments.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
            <Filter className="size-4 text-muted-foreground mt-2 sm:mt-0" />
            <div className="flex flex-col sm:flex-row gap-3 flex-1 w-full sm:w-auto">
              <Select value={filterPG} onValueChange={setFilterPG}>
                <SelectTrigger className="w-full sm:w-48"><SelectValue placeholder="All PGs" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All PGs</SelectItem>
                  {(pgs || []).map((pg: { id: string; name: string }) => (
                    <SelectItem key={pg.id} value={pg.id}>{pg.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-full sm:w-40"><SelectValue placeholder="All Status" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="COMPLETED">Paid</SelectItem>
                  <SelectItem value="PENDING">Pending</SelectItem>
                  <SelectItem value="FAILED">Failed</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Payments Table */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Payment Records ({filteredPayments.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">{[...Array(5)].map((_, i) => <div key={i} className="h-12 bg-muted rounded animate-pulse" />)}</div>
          ) : filteredPayments.length === 0 ? (
            <div className="py-12 text-center text-muted-foreground">
              <CreditCard className="size-10 mx-auto mb-2 opacity-50" />
              <p>No payment records found</p>
            </div>
          ) : (
            <div className="overflow-x-auto max-h-96 overflow-y-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Tenant</TableHead>
                    <TableHead>PG</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Due Date</TableHead>
                    <TableHead>Method</TableHead>
                    <TableHead className="text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredPayments.map((p: { id: string; user?: { name: string }; pg?: { name: string }; amount: number; type: string; status: string; dueDate?: string; paidDate?: string; method?: string }, idx: number) => (
                    <TableRow key={p.id} className="hover:bg-muted">
                      <TableCell className="font-medium text-sm">{p.user?.name || 'Unknown'}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">{p.pg?.name || 'PG'}</TableCell>
                      <TableCell className="font-semibold">₹{(p.amount || 0).toLocaleString('en-IN')}</TableCell>
                      <TableCell><Badge variant="outline" className="text-xs">{p.type}</Badge></TableCell>
                      <TableCell><Badge className={`${statusColor(p.status)} text-xs`}>{STATUSES.PAYMENT[p.status as keyof typeof STATUSES.PAYMENT]?.label || p.status}</Badge></TableCell>
                      <TableCell className="text-sm text-muted-foreground">{p.dueDate ? new Date(p.dueDate).toLocaleDateString('en-IN') : '-'}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                          {p.method ? (methodIcon(p.method)) : null}
                          {p.method || '-'}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        {p.status === 'PENDING' && (
                          <Button size="sm" className="bg-green-600 hover:bg-green-700 text-white text-xs h-7" onClick={() => handleMarkPaid({ id: p.id, amount: p.amount, method: 'CASH' })}>
                            <Check className="size-3 mr-1" /> Mark Paid
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Pay Dialog */}
      <Dialog open={payDialogOpen} onOpenChange={setPayDialogOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Mark Payment as Paid</DialogTitle>
          </DialogHeader>
          {selectedPayment && (
            <div className="space-y-4 pt-2">
              <div className="bg-muted rounded-xl p-4 text-center">
                <p className="text-sm text-muted-foreground">Amount</p>
                <p className={`text-3xl font-bold ${TEXT_COLOR.green}`}>₹{selectedPayment.amount.toLocaleString('en-IN')}</p>
              </div>
              <div className="space-y-2">
                <Label>Payment Method</Label>
                <Select value={selectedPayment.method} onValueChange={(v) => setSelectedPayment({ ...selectedPayment, method: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="UPI">UPI</SelectItem>
                    <SelectItem value="CARD">Card</SelectItem>
                    <SelectItem value="NET_BANKING">Net Banking</SelectItem>
                    <SelectItem value="WALLET">Wallet</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button
                className="w-full bg-green-600 hover:bg-green-700 text-white"
                onClick={() => markPaidMutation.mutate({ id: selectedPayment.id, method: selectedPayment.method })}
                disabled={markPaidMutation.isPending}
              >
                {markPaidMutation.isPending ? <Loader2 className="size-4 mr-2 animate-spin" /> : <Check className="size-4 mr-2" />}
                Confirm Payment
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
