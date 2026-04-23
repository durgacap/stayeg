'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Bell,
  CreditCard,
  CheckCircle2,
  MapPin,
  CalendarCheck,
  AlertTriangle,
  UserCheck,
  IndianRupee,
  Wifi,
  type LucideIcon,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from '@/components/ui/popover';
import { useAppStore } from '@/store/use-app-store';

interface Notification {
  id: string;
  icon: LucideIcon;
  iconColor: string;
  title: string;
  description: string;
  time: string;
  read: boolean;
}

const TENANT_NOTIFICATIONS: Notification[] = [
  {
    id: 't1',
    icon: CreditCard,
    iconColor: 'text-amber-500',
    title: 'Rent due in 3 days',
    description: 'Your rent of ₹8,500 is due on July 1st. Pay now to avoid late fees.',
    time: '30m ago',
    read: false,
  },
  {
    id: 't2',
    icon: CheckCircle2,
    iconColor: 'text-emerald-500',
    title: 'Your complaint has been resolved',
    description: 'The WiFi issue you reported on June 25th has been fixed.',
    time: '2h ago',
    read: false,
  },
  {
    id: 't3',
    icon: MapPin,
    iconColor: 'text-brand-teal',
    title: 'New PG listing near you',
    description: 'Sunrise PG in Koramangala has 3 beds available starting ₹6,000/mo.',
    time: '5h ago',
    read: false,
  },
  {
    id: 't4',
    icon: IndianRupee,
    iconColor: 'text-emerald-500',
    title: 'Payment received - ₹8,500',
    description: 'Your rent payment for June 2025 has been processed successfully.',
    time: '1d ago',
    read: true,
  },
];

const OWNER_NOTIFICATIONS: Notification[] = [
  {
    id: 'o1',
    icon: CalendarCheck,
    iconColor: 'text-brand-teal',
    title: 'New booking request from Rahul',
    description: 'Rahul Sharma wants to book a shared room in Green Valley PG.',
    time: '15m ago',
    read: false,
  },
  {
    id: 'o2',
    icon: IndianRupee,
    iconColor: 'text-emerald-500',
    title: 'Rent payment received - ₹9,000',
    description: 'Priya Patel paid rent for Room 204, Sunrise PG for July 2025.',
    time: '1h ago',
    read: false,
  },
  {
    id: 'o3',
    icon: Wifi,
    iconColor: 'text-amber-500',
    title: 'Complaint raised: WiFi not working',
    description: 'Tenant Amit in Room 108 reported internet connectivity issues.',
    time: '3h ago',
    read: false,
  },
  {
    id: 'o4',
    icon: UserCheck,
    iconColor: 'text-brand-teal',
    title: 'New tenant verified',
    description: 'Sneha Gupta has completed KYC verification for Green Valley PG.',
    time: '6h ago',
    read: true,
  },
];

export default function NotificationsPanel() {
  const { currentRole } = useAppStore();
  const [notifications, setNotifications] = useState<Notification[]>(
    currentRole === 'OWNER' ? OWNER_NOTIFICATIONS : TENANT_NOTIFICATIONS
  );
  const [open, setOpen] = useState(false);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const handleMarkAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const handleMarkAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative"
          aria-label={`Notifications${unreadCount > 0 ? `, ${unreadCount} unread` : ''}`}
        >
          <Bell className="size-5 text-muted-foreground" />
          <AnimatePresence>
            {unreadCount > 0 && (
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0 }}
                transition={{ type: 'spring', stiffness: 500, damping: 25 }}
                className="absolute -top-0.5 -right-0.5"
              >
                <Badge className="h-4 min-w-4 px-1 text-[10px] bg-brand-teal border-brand-teal text-white flex items-center justify-center">
                  {unreadCount}
                </Badge>
              </motion.span>
            )}
          </AnimatePresence>
        </Button>
      </PopoverTrigger>
      <PopoverContent
        align="end"
        sideOffset={12}
        className="w-80 sm:w-96 p-0 bg-card border-border rounded-xl shadow-lg overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2">
            <Bell className="size-4 text-brand-teal" />
            <h3 className="text-sm font-semibold text-foreground">Notifications</h3>
            {unreadCount > 0 && (
              <Badge
                variant="secondary"
                className="h-5 min-w-5 px-1.5 text-[10px] bg-brand-teal/10 text-brand-teal border-0"
              >
                {unreadCount} new
              </Badge>
            )}
          </div>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="text-xs text-brand-teal hover:text-brand-teal/80 hover:bg-brand-teal/10 h-7 px-2"
              onClick={handleMarkAllRead}
            >
              Mark all as read
            </Button>
          )}
        </div>

        <Separator />

        {/* Notification list */}
        <ScrollArea className="max-h-80 sm:max-h-96">
          <AnimatePresence initial={false}>
            {notifications.length === 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-col items-center justify-center py-10 px-4"
              >
                <div className="size-10 rounded-full bg-muted flex items-center justify-center mb-3">
                  <Bell className="size-5 text-muted-foreground" />
                </div>
                <p className="text-sm text-muted-foreground">No notifications yet</p>
              </motion.div>
            ) : (
              <div className="divide-y divide-border/50">
                {notifications.map((notification) => {
                  const Icon = notification.icon;
                  return (
                    <motion.button
                      key={notification.id}
                      initial={{ opacity: 0, y: 4 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.2 }}
                      onClick={() => handleMarkAsRead(notification.id)}
                      className={`w-full flex items-start gap-3 px-4 py-3 text-left transition-colors hover:bg-muted cursor-pointer ${
                        !notification.read
                          ? 'border-l-2 border-brand-teal bg-brand-teal/[0.02]'
                          : 'border-l-2 border-transparent'
                      }`}
                    >
                      {/* Icon */}
                      <div
                        className={`mt-0.5 size-8 rounded-lg flex items-center justify-center shrink-0 ${
                          notification.read ? 'bg-muted' : 'bg-brand-teal/10'
                        }`}
                      >
                        <Icon
                          className={`size-4 ${
                            notification.read
                              ? 'text-muted-foreground'
                              : notification.iconColor
                          }`}
                        />
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <p
                            className={`text-sm leading-snug ${
                              notification.read
                                ? 'text-muted-foreground font-normal'
                                : 'text-foreground font-medium'
                            }`}
                          >
                            {notification.title}
                          </p>
                          {!notification.read && (
                            <span className="size-2 rounded-full bg-brand-teal shrink-0 mt-1.5" />
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
                          {notification.description}
                        </p>
                        <p className="text-[11px] text-muted-foreground/70 mt-1">
                          {notification.time}
                        </p>
                      </div>
                    </motion.button>
                  );
                })}
              </div>
            )}
          </AnimatePresence>
        </ScrollArea>

        <Separator />

        {/* Footer */}
        <div className="px-4 py-2.5">
          <Button
            variant="ghost"
            className="w-full text-sm text-brand-teal hover:text-brand-teal/80 hover:bg-brand-teal/10 h-8"
          >
            View all notifications
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
