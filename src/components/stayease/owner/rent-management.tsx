'use client';

import { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import {
  IndianRupee, Check, Loader2, Filter, CalendarDays, CreditCard,
  Banknote, Wallet, Download, Phone, AlertTriangle, RefreshCw,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useAppStore } from '@/store/use-app-store';
import { authFetch } from '@/lib/api-client';
import { STATUSES, BADGE, TEXT_COLOR } from '@/lib/constants';
import { toast } from 'sonner';

export default function RentManagement() {
  const { showToast, currentUser } = useAppStore();
  const queryClient = useQueryClient();
  const [filterPG, setFilterPG] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterMonth, setFilterMonth] = useState(new Date().toISOString().slice(0, 7));
  const [payDialogOpen, setPayDialogOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<{ id: string; amount: number; month: string; tenantName: string; tenantPhone?: string; method: string } | null>(null);
  const [receiptOpen, setReceiptOpen] = useState(false);
  const [receiptData, setReceiptData] = useState<{ tenantName: string; month: string; amount: number; paidDate: string; method: string; pgName: string } | null>(null);

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

  const { data: tenants } = useQuery({
    queryKey: ['owner-tenants-rent', ownerId],
    queryFn: async () => {
      const res = await fetch(`/api/tenants?ownerId=${ownerId}`);
      return res.json();
    },
    enabled: !!ownerId,
  });

  const { data: rentRecords, isLoading } = useQuery({
    queryKey: ['owner-rent-records', ownerId, filterMonth],
    queryFn: async () => {
      const params = new URLSearchParams({ ownerId: ownerId!, month: filterMonth });
      const res = await fetch(`/api/rent-records?${params}`);
      return res.json();
    },
    enabled: !!ownerId,
  });

  const records = rentRecords || [];

  const markPaidMutation = useMutation({
    mutationFn: async ({ id, method, notes }: { id: string; method: string; notes?: string }) => {
      const res = await fetch('/api/rent-records', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status: 'PAID', method, notes }),
      });
      if (!res.ok) throw new Error('Failed to update');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['owner-rent-records'] });
      queryClient.invalidateQueries({ queryKey: ['owner-analytics'] });
      toast.success('Payment marked as paid!');
      setPayDialogOpen(false);
      setSelectedRecord(null);
    },
    onError: () => toast.error('Failed to update payment'),
  });

  const filteredRecords = useMemo(() => {
    let result = records;
    if (filterPG !== 'all') {
      result = result.filter((r: { tenant?: { pgId: string } }) => r.tenant?.pgId === filterPG);
    }
    if (filterStatus !== 'all') {
      result = result.filter((r: { status: string }) => r.status === filterStatus);
    }
    return result;
  }, [records, filterPG, filterStatus]);

  const completedRecords = records.filter((r: { status: string }) => r.status === 'PAID');
  const pendingRecords = records.filter((r: { status: string }) => r.status === 'PENDING');
  const overdueRecords = records.filter((r: { status: string }) => r.status === 'OVERDUE');
  const totalCollected = completedRecords.reduce((s: number, r: { amount: number }) => s + (r.amount || 0), 0);
  const totalPending = pendingRecords.reduce((s: number, r: { amount: number }) => s + (r.amount || 0), 0);
  const totalOverdue = overdueRecords.reduce((s: number, r: { amount: number }) => s + (r.amount || 0), 0);

  const pgNameMap: Record<string, string> = {};
  (tenants || []).forEach((t: { pgId: string; pg?: { name: string } }) => {
    if (t.pg?.name) pgNameMap[t.pgId] = t.pg.name;
  });

  const statusColor = (status: string) => {
    switch (status) {
      case 'PAID': return BADGE.green;
      case 'PENDING': return BADGE.yellow;
      case 'OVERDUE': return BADGE.red;
      case 'PARTIAL': return BADGE.blue;
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  // Export CSV
  const exportCSV = () => {
    const headers = ['Tenant', 'PG', 'Room', 'Month', 'Amount', 'Status', 'Paid Date', 'Method'];
    const rows = filteredRecords.map((r: { tenant?: { name: string; pg?: { name: string }; room?: { roomCode: string } }; month: string; amount: number; status: string; paidDate?: string; method?: string }) => [
      r.tenant?.name || '', r.tenant?.pg?.name || '', r.tenant?.room?.roomCode || '',
      r.month, r.amount, r.status, r.paidDate ? new Date(r.paidDate).toLocaleDateString('en-IN') : '', r.method || ''
    ]);
    const csv = [headers, ...rows].map(r => r.map(c => `"${c}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `rent-records-${filterMonth}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('CSV exported!');
  };

  // Send WhatsApp rent reminder
  const sendWhatsAppReminder = (tenantName: string, phone: string, amount: number) => {
    const msg = encodeURIComponent(
      `Hi ${tenantName}, your rent of ₹${amount.toLocaleString('en-IN')} for this month is due. Please pay at the earliest. Thank you! - ${currentUser?.name || 'StayEg PG Owner'}`
    );
    window.open(`https://wa.me/${phone.replace(/\D/g, '')}?text=${msg}`, '_blank');
  };

  const handleMarkPaid = (record: { id: string; amount: number; month: string; tenant?: { name: string; phone?: string }; method: string }) => {
    setSelectedRecord({
      id: record.id,
      amount: record.amount,
      month: record.month,
      tenantName: record.tenant?.name || 'Tenant',
      tenantPhone: record.tenant?.phone,
      method: record.method || 'CASH',
    });
    setPayDialogOpen(true);
  };

  const handleViewReceipt = (record: { tenant?: { name: string; pg?: { name: string } }; month: string; amount: number; paidDate?: string; method?: string }) => {
    setReceiptData({
      tenantName: record.tenant?.name || 'Tenant',
      month: record.month,
      amount: record.amount,
      paidDate: record.paidDate ? new Date(record.paidDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' }) : new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' }),
      method: record.method || 'Cash',
      pgName: record.tenant?.pg?.name || 'PG',
    });
    setReceiptOpen(true);
  };

  const monthLabel = new Date(filterMonth + '-01').toLocaleDateString('en-IN', { month: 'long', year: 'numeric' });

  return (
    <div className="p-4 md:p-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Rent Management</h1>
          <p className="text-muted-foreground mt-1">Track and collect rent payments</p>
        </div>
        <Button variant="outline" onClick={exportCSV} disabled={filteredRecords.length === 0}>
          <Download className="size-4 mr-2" /> Export CSV
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Collected', amount: totalCollected, icon: IndianRupee, bg: BADGE.green, text: TEXT_COLOR.green },
          { label: 'Pending', amount: totalPending, icon: CalendarDays, bg: BADGE.yellow, text: TEXT_COLOR.yellow },
          { label: 'Overdue', amount: totalOverdue, icon: AlertTriangle, bg: BADGE.red, text: TEXT_COLOR.red },
          { label: 'Pending Count', amount: pendingRecords.length + overdueRecords.length, icon: CreditCard, bg: 'bg-purple-100', text: TEXT_COLOR.purple },
        ].map((card, i) => (
          <motion.div key={card.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
            <Card><CardContent className="p-4"><div className="flex items-center gap-3"><div className={`${card.bg} p-2.5 rounded-xl`}><card.icon className="size-5" /></div><div><p className="text-xs text-muted-foreground">{card.label}</p><p className={`text-lg font-bold ${card.text}`}>₹{typeof card.amount === 'number' ? card.amount.toLocaleString('en-IN') : card.amount}</p></div></div></CardContent></Card>
          </motion.div>
        ))}
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
            <Filter className="size-4 text-muted-foreground mt-2 sm:mt-0" />
            <Input type="month" value={filterMonth} onChange={e => setFilterMonth(e.target.value)} className="w-full sm:w-44" />
            <Select value={filterPG} onValueChange={setFilterPG}>
              <SelectTrigger className="w-full sm:w-48"><SelectValue placeholder="All PGs" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All PGs</SelectItem>
                {Object.entries(pgNameMap).map(([id, name]) => <SelectItem key={id} value={id}>{name}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-full sm:w-40"><SelectValue placeholder="All Status" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="PAID">Paid</SelectItem>
                <SelectItem value="PENDING">Pending</SelectItem>
                <SelectItem value="OVERDUE">Overdue</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Records */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">
            Rent Records for {monthLabel} ({filteredRecords.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">{[...Array(5)].map((_, i) => <div key={i} className="h-12 bg-muted rounded animate-pulse" />)}</div>
          ) : filteredRecords.length === 0 ? (
            <div className="py-12 text-center text-muted-foreground">
              <CreditCard className="size-10 mx-auto mb-2 opacity-50" />
              <p>No rent records for {monthLabel}</p>
              <p className="text-xs mt-1">Records are auto-created when tenants are added</p>
            </div>
          ) : (
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {filteredRecords.map((r: { id: string; tenant?: { name: string; phone?: string; pg?: { name: string }; room?: { roomCode: string }; bed?: { bedNumber: number } }; month: string; amount: number; status: string; paidDate?: string; method?: string }, idx: number) => (
                <div key={r.id} className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted transition-colors">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-medium text-foreground truncate">{r.tenant?.name || 'Unknown'}</span>
                      <Badge className={statusColor(r.status)}>{r.status}</Badge>
                    </div>
                    <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                      <span>{r.tenant?.pg?.name}</span>
                      <span>{r.tenant?.room?.roomCode} - #{r.tenant?.bed?.bedNumber}</span>
                      <span>{r.method || '-'}</span>
                      {r.paidDate && <span>{new Date(r.paidDate).toLocaleDateString('en-IN')}</span>}
                    </div>
                  </div>
                  <span className="font-semibold text-sm">₹{r.amount.toLocaleString('en-IN')}</span>
                  <div className="flex items-center gap-1 shrink-0">
                    {r.status !== 'PAID' && r.tenant?.phone && (
                      <button
                        onClick={() => sendWhatsAppReminder(r.tenant?.name || '', r.tenant.phone, r.amount)}
                        className="p-1.5 rounded-lg bg-green-100 text-green-700 hover:bg-green-200 transition-colors"
                        title="WhatsApp Reminder"
                      >
                        <Phone className="size-3" />
                      </button>
                    )}
                    {r.status !== 'PAID' && (
                      <Button size="sm" className="bg-green-600 hover:bg-green-700 text-white text-xs h-7 px-2" onClick={() => handleMarkPaid(r)}>
                        <Check className="size-3 mr-1" /> Pay
                      </Button>
                    )}
                    {r.status === 'PAID' && (
                      <Button size="sm" variant="outline" className="text-xs h-7 px-2" onClick={() => handleViewReceipt(r)}>
                        <Download className="size-3 mr-1" /> Receipt
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Pay Dialog */}
      <Dialog open={payDialogOpen} onOpenChange={setPayDialogOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader><DialogTitle>Collect Payment</DialogTitle></DialogHeader>
          {selectedRecord && (
            <div className="space-y-4 pt-2">
              <div className="bg-muted rounded-xl p-4 text-center">
                <p className="text-sm text-muted-foreground">{selectedRecord.tenantName} • {selectedRecord.month}</p>
                <p className={`text-3xl font-bold ${TEXT_COLOR.green} mt-1`}>₹{selectedRecord.amount.toLocaleString('en-IN')}</p>
              </div>
              <div className="space-y-2">
                <Label>Payment Method</Label>
                <Select value={selectedRecord.method} onValueChange={(v) => setSelectedRecord({ ...selectedRecord, method: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="CASH">Cash</SelectItem>
                    <SelectItem value="UPI">UPI</SelectItem>
                    <SelectItem value="CARD">Card</SelectItem>
                    <SelectItem value="NET_BANKING">Net Banking</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex gap-2">
                {selectedRecord.tenantPhone && (
                  <Button variant="outline" className="flex-1 border-green-300 text-green-700 hover:bg-green-50" onClick={() => {
                    sendWhatsAppReminder(selectedRecord.tenantName, selectedRecord.tenantPhone!, selectedRecord.amount);
                  }}>
                    <Phone className="size-4 mr-2" /> WhatsApp
                  </Button>
                )}
              </div>
              <Button className="w-full bg-green-600 hover:bg-green-700 text-white" onClick={() => markPaidMutation.mutate({ id: selectedRecord.id, method: selectedRecord.method })} disabled={markPaidMutation.isPending}>
                {markPaidMutation.isPending ? <Loader2 className="size-4 mr-2 animate-spin" /> : <Check className="size-4 mr-2" />}Confirm Payment
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Receipt Dialog */}
      <Dialog open={receiptOpen} onOpenChange={setReceiptOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader><DialogTitle>Payment Receipt</DialogTitle></DialogHeader>
          {receiptData && (
            <div className="border-2 border-dashed border-border rounded-xl p-5 space-y-3">
              <div className="text-center">
                <p className="font-bold text-lg">StayEg PG</p>
                <p className="text-xs text-muted-foreground">Payment Receipt</p>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between"><span className="text-muted-foreground">Tenant</span><span className="font-medium">{receiptData.tenantName}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">PG</span><span className="font-medium">{receiptData.pgName}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Month</span><span className="font-medium">{receiptData.month}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Date</span><span className="font-medium">{receiptData.paidDate}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Method</span><span className="font-medium">{receiptData.method}</span></div>
              </div>
              <div className="border-t pt-3 text-center">
                <p className="text-xs text-muted-foreground">Amount Paid</p>
                <p className="text-2xl font-bold text-green-700">₹{receiptData.amount.toLocaleString('en-IN')}</p>
              </div>
              <div className="text-center text-xs text-muted-foreground pt-2 border-t">
                <p>Generated by StayEg PG Management</p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
