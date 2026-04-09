'use client';

import { useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  Home, Search, BookOpen, CalendarDays, CreditCard, MessageSquare,
  MapPin, User, Menu, Bell, Building2, LayoutDashboard, BedDouble,
  Users, Wallet, Wrench, HardHat, Shield, AlertTriangle, LogIn, LogOut,
  UsersRound, ChevronRight, IndianRupee,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { useAppStore } from '@/store/use-app-store';
import { ThemeToggle } from '@/components/layout/theme-toggle';
import HeroSection from '@/components/stayease/tenant/hero';
import PGListing from '@/components/stayease/tenant/pg-listing';
import PGDetail from '@/components/stayease/tenant/pg-detail';
import BookingModal from '@/components/stayease/tenant/booking-modal';
import MyBookings from '@/components/stayease/tenant/my-bookings';
import PaymentSection from '@/components/stayease/tenant/payment-section';
import ComplaintSection from '@/components/stayease/tenant/complaint-section';
import NearbyServices from '@/components/stayease/tenant/nearby-services';
import OwnerDashboard from '@/components/stayease/owner/dashboard-analytics';
import PGManagement from '@/components/stayease/owner/pg-management';
import RoomManagement from '@/components/stayease/owner/room-management';
import TenantManagement from '@/components/stayease/owner/tenant-management';
import RentManagement from '@/components/stayease/owner/rent-management';
import VendorManagement from '@/components/stayease/owner/vendor-management';
import WorkerManagement from '@/components/stayease/owner/worker-management';
import ComplaintManagement from '@/components/stayease/owner/complaint-management';
import AIAssistant from '@/components/stayease/owner/ai-assistant';
import AdminDashboard from '@/components/stayease/admin/admin-dashboard';
import ProfilePage from '@/components/stayease/profile/profile-page';
import SiteFooter from '@/components/stayease/site-footer';
import CommunityPage from '@/components/stayease/community/community-page';
import LoginPage from '@/components/stayease/auth/login-page';
import SignupPage from '@/components/stayease/auth/signup-page';
import PricingPage from '@/components/stayease/pricing/pricing-page';
import TermsPage from '@/components/stayease/policy/terms-page';
import PrivacyPage from '@/components/stayease/policy/privacy-page';
import SafeUsePage from '@/components/stayease/policy/safe-use-page';

// Navigation items
const PUBLIC_NAV = [
  { view: 'LANDING' as const, label: 'Home', icon: Home },
  { view: 'PG_LISTING' as const, label: 'Explore PGs', icon: Search },
  { view: 'PRICING' as const, label: 'Pricing', icon: IndianRupee },
  { view: 'COMMUNITY' as const, label: 'Community', icon: UsersRound },
];

const TENANT_NAV = [
  { view: 'LANDING' as const, label: 'Home', icon: Home },
  { view: 'PG_LISTING' as const, label: 'Explore PGs', icon: Search },
  { view: 'COMMUNITY' as const, label: 'Community', icon: UsersRound },
  { view: 'MY_BOOKINGS' as const, label: 'My Bookings', icon: CalendarDays },
  { view: 'PAYMENTS' as const, label: 'Payments', icon: CreditCard },
  { view: 'COMPLAINTS' as const, label: 'Complaints', icon: MessageSquare },
  { view: 'NEARBY' as const, label: 'Nearby', icon: MapPin },
];

const TENANT_MOBILE_NAV = [
  { view: 'LANDING' as const, label: 'Home', icon: Home },
  { view: 'PG_LISTING' as const, label: 'Explore', icon: Search },
  { view: 'COMMUNITY' as const, label: 'Community', icon: UsersRound },
  { view: 'MY_BOOKINGS' as const, label: 'Bookings', icon: BookOpen },
  { view: 'NEARBY' as const, label: 'Nearby', icon: MapPin },
];

const OWNER_NAV = [
  { view: 'OWNER_DASHBOARD' as const, label: 'Dashboard', icon: LayoutDashboard },
  { view: 'OWNER_PGS' as const, label: 'My PGs', icon: Building2 },
  { view: 'OWNER_ROOMS' as const, label: 'Rooms', icon: BedDouble },
  { view: 'OWNER_TENANTS' as const, label: 'Tenants', icon: Users },
  { view: 'OWNER_RENT' as const, label: 'Rent', icon: Wallet },
  { view: 'OWNER_VENDORS' as const, label: 'Vendors', icon: Wrench },
  { view: 'OWNER_WORKERS' as const, label: 'Staff', icon: HardHat },
  { view: 'OWNER_COMPLAINTS' as const, label: 'Complaints', icon: AlertTriangle },
];

const OWNER_MOBILE_NAV = [
  { view: 'OWNER_DASHBOARD' as const, label: 'Dashboard', icon: LayoutDashboard },
  { view: 'OWNER_PGS' as const, label: 'PGs', icon: Building2 },
  { view: 'OWNER_RENT' as const, label: 'Rent', icon: Wallet },
  { view: 'OWNER_COMPLAINTS' as const, label: 'Alerts', icon: AlertTriangle },
];

const HIDE_HEADER_VIEWS = ['LOGIN', 'SIGNUP'] as const;
const HIDE_MOBILE_NAV_VIEWS = ['LOGIN', 'SIGNUP', 'PRICING', 'TERMS', 'PRIVACY', 'SAFE_USE', 'PROFILE'] as const;

function MobileNav({ items }: { items: typeof TENANT_MOBILE_NAV }) {
  const { currentView, setCurrentView } = useAppStore();
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-background/95 backdrop-blur-md border-t border-border md:hidden">
      <div className="flex items-center justify-around py-2 pb-[max(0.5rem,env(safe-area-inset-bottom))]">
        {items.map((item) => {
          const isActive = currentView === item.view;
          return (
            <button
              key={item.view}
              onClick={() => setCurrentView(item.view)}
              className={`flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl transition-colors ${
                isActive ? 'text-brand-teal' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <item.icon className="size-5" />
              <span className="text-[10px] font-medium">{item.label}</span>
              {isActive && (
                <motion.div layoutId="mobileNav" className="w-5 h-0.5 bg-brand-teal rounded-full" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
}

function TopHeader() {
  const { currentView, setCurrentView, currentUser, isMobileMenuOpen, setMobileMenuOpen, currentRole, isLoggedIn, logout } = useAppStore();

  // Pick nav items based on auth state and role
  const navItems = !isLoggedIn
    ? PUBLIC_NAV
    : currentRole === 'OWNER'
      ? OWNER_NAV
      : TENANT_NAV;

  const isLanding = currentView === 'LANDING' && currentRole === 'TENANT';
  const hideHeader = (HIDE_HEADER_VIEWS as readonly string[]).includes(currentView);

  if (hideHeader) return null;

  return (
    <header
      className={`sticky top-0 z-40 transition-all duration-300 pt-safe ${
        isLanding
          ? 'bg-background/80 backdrop-blur-lg border-b border-border'
          : 'bg-background/95 backdrop-blur-md border-b border-border'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 pt-[env(safe-area-inset-top)] py-2 pb-3 flex items-center justify-between">
        {/* Logo */}
        <button
          onClick={() => setCurrentView('LANDING')}
          className="flex items-center gap-2 group"
        >
          <div className="size-8 bg-gradient-to-br from-brand-deep to-brand-teal rounded-lg flex items-center justify-center shadow-sm group-hover:shadow-md transition-shadow">
            <Building2 className="size-4 text-white" />
          </div>
          <span className="font-bold text-lg text-foreground hidden sm:block">
            Stay<span className="text-brand-teal">eG</span>
          </span>
        </button>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-1">
          {navItems.map((item) => {
            const isActive = currentView === item.view;
            return (
              <button
                key={item.view}
                onClick={() => setCurrentView(item.view)}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-brand-teal/10 text-brand-teal'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                }`}
              >
                <item.icon className="size-4" />
                {item.label}
              </button>
            );
          })}
        </nav>

        {/* Right side */}
        <div className="flex items-center gap-1">
          {/* Theme Toggle */}
          <ThemeToggle />

          {isLoggedIn ? (
            <>
              {/* Logged-in: notifications, profile, logout */}
              <Button variant="ghost" size="icon" className="relative hidden sm:flex">
                <Bell className="size-5 text-muted-foreground" />
                <span className="absolute top-1.5 right-1.5 size-2 bg-brand-teal rounded-full" />
              </Button>
              <button onClick={() => setCurrentView('PROFILE')}>
                <Avatar className="size-8 cursor-pointer">
                  <AvatarImage src={currentUser?.avatar} alt={currentUser?.name} />
                  <AvatarFallback className="bg-brand-teal/10 text-brand-teal text-xs font-semibold">
                    {currentUser?.name?.charAt(0).toUpperCase() || 'U'}
                  </AvatarFallback>
                </Avatar>
              </button>
              <Button variant="ghost" size="icon" className="hidden sm:flex" onClick={logout}>
                <LogOut className="size-4 text-muted-foreground" />
              </Button>
            </>
          ) : (
            <>
              {/* Guest: Login + Signup */}
              <Button
                variant="ghost"
                onClick={() => setCurrentView('LOGIN')}
                className="text-foreground hover:text-brand-teal hidden sm:flex"
              >
                <LogIn className="size-4 mr-1.5" />
                Login
              </Button>
              <Button
                onClick={() => setCurrentView('SIGNUP')}
                className="bg-gradient-to-r from-brand-deep to-brand-teal hover:from-brand-deep/90 hover:to-brand-teal/90 text-white shadow-sm"
              >
                Sign Up
                <ChevronRight className="size-3.5 ml-1" />
              </Button>
            </>
          )}

          {/* Mobile menu */}
          <Sheet open={isMobileMenuOpen} onOpenChange={setMobileMenuOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden">
                <Menu className="size-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-72">
              <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
              <div className="mt-6 space-y-2">
                {isLoggedIn ? (
                  <>
                    <div className="flex items-center gap-3 mb-6 px-2">
                      <Avatar className="size-10">
                        <AvatarFallback className="bg-brand-teal/10 text-brand-teal font-semibold">
                          {currentUser?.name?.charAt(0).toUpperCase() || 'U'}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-sm truncate text-foreground">{currentUser?.name || 'Guest'}</div>
                        <div className="text-xs text-muted-foreground truncate">{currentUser?.email || ''}</div>
                      </div>
                    </div>
                    <button
                      onClick={() => { setCurrentView('PROFILE'); setMobileMenuOpen(false); }}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                        currentView === 'PROFILE' ? 'bg-brand-teal/10 text-brand-teal' : 'text-muted-foreground hover:bg-muted'
                      }`}
                    >
                      <User className="size-5" />
                      My Profile
                    </button>
                    <Separator className="my-2" />
                  </>
                ) : (
                  <div className="mb-4 space-y-2">
                    <Button
                      onClick={() => { setCurrentView('LOGIN'); setMobileMenuOpen(false); }}
                      className="w-full bg-gradient-to-r from-brand-deep to-brand-teal hover:from-brand-deep/90 hover:to-brand-teal/90 text-white"
                    >
                      <LogIn className="size-4 mr-2" />
                      Login / Sign Up
                    </Button>
                    <Separator className="my-2" />
                  </div>
                )}
                {navItems.map((item) => (
                  <button
                    key={item.view}
                    onClick={() => { setCurrentView(item.view); setMobileMenuOpen(false); }}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                      currentView === item.view ? 'bg-brand-teal/10 text-brand-teal' : 'text-muted-foreground hover:bg-muted'
                    }`}
                  >
                    <item.icon className="size-5" />
                    {item.label}
                  </button>
                ))}
                {isLoggedIn && (
                  <>
                    <Separator className="my-2" />
                    <button
                      onClick={() => { logout(); setMobileMenuOpen(false); }}
                      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-destructive hover:bg-destructive/10 transition-colors"
                    >
                      <LogOut className="size-5" />
                      Logout
                    </button>
                  </>
                )}
                <Separator className="my-2" />
                <div className="px-3 space-y-1">
                  <button onClick={() => { setCurrentView('TERMS'); setMobileMenuOpen(false); }} className="block text-xs text-muted-foreground hover:text-foreground">Terms of Service</button>
                  <button onClick={() => { setCurrentView('PRIVACY'); setMobileMenuOpen(false); }} className="block text-xs text-muted-foreground hover:text-foreground">Privacy Policy</button>
                  <button onClick={() => { setCurrentView('SAFE_USE'); setMobileMenuOpen(false); }} className="block text-xs text-muted-foreground hover:text-foreground">Safe Use Guidelines</button>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}

function MainContent() {
  const { currentView, currentRole } = useAppStore();
  const bookingModalOpen = currentView === 'BOOKING';

  const renderView = () => {
    // Auth views
    if (currentView === 'LOGIN') return <LoginPage />;
    if (currentView === 'SIGNUP') return <SignupPage />;

    // Policy & pricing views (accessible to all)
    if (currentView === 'PRICING') return <PricingPage />;
    if (currentView === 'TERMS') return <TermsPage />;
    if (currentView === 'PRIVACY') return <PrivacyPage />;
    if (currentView === 'SAFE_USE') return <SafeUsePage />;

    // Owner views
    if (currentRole === 'OWNER') {
      switch (currentView) {
        case 'OWNER_DASHBOARD': return <OwnerDashboard />;
        case 'OWNER_PGS': return <PGManagement />;
        case 'OWNER_ROOMS': return <RoomManagement />;
        case 'OWNER_TENANTS': return <TenantManagement />;
        case 'OWNER_RENT': return <RentManagement />;
        case 'OWNER_VENDORS': return <VendorManagement />;
        case 'OWNER_WORKERS': return <WorkerManagement />;
        case 'OWNER_COMPLAINTS': return <ComplaintManagement />;
        default: return <OwnerDashboard />;
      }
    }

    // Admin views
    if (currentRole === 'ADMIN') {
      return <AdminDashboard />;
    }

    // Tenant views
    switch (currentView) {
      case 'LANDING': return <HeroSection />;
      case 'PG_LISTING': return <PGListing />;
      case 'PG_DETAIL': return <PGDetail />;
      case 'MY_BOOKINGS': return <MyBookings />;
      case 'PAYMENTS': return <PaymentSection />;
      case 'COMPLAINTS': return <ComplaintSection />;
      case 'NEARBY': return <NearbyServices />;
      case 'COMMUNITY': return <CommunityPage />;
      case 'PROFILE': return <ProfilePage />;
      case 'BOOKING': return <div />;
      default: return <HeroSection />;
    }
  };

  return (
    <>
      <AnimatePresence mode="wait">
        <motion.div
          key={currentView + currentRole}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.2 }}
        >
          {renderView()}
        </motion.div>
      </AnimatePresence>
      <BookingModal
        open={bookingModalOpen}
        onOpenChange={() => { useAppStore.getState().setCurrentView('PG_DETAIL'); }}
      />
      {currentRole === 'OWNER' && <AIAssistant />}
    </>
  );
}

export default function StayeGApp() {
  const { currentView, currentRole, isLoggedIn } = useAppStore();

  const mobileNav = currentRole === 'OWNER' ? OWNER_MOBILE_NAV : TENANT_MOBILE_NAV;
  const hideMobileNav = (HIDE_MOBILE_NAV_VIEWS as readonly string[]).includes(currentView);
  const FOOTER_VIEWS = ['LANDING', 'PG_LISTING', 'PRICING', 'COMMUNITY', 'TERMS', 'PRIVACY', 'SAFE_USE'] as const;
  const showFooter = (FOOTER_VIEWS as readonly string[]).includes(currentView);

  return (
    <div className="min-h-screen flex flex-col bg-background pb-safe">
      <TopHeader />
      <main className="flex-1 pb-20 md:pb-0">
        <MainContent />
      </main>
      {showFooter && <SiteFooter />}
      {!hideMobileNav && <MobileNav items={mobileNav} />}
    </div>
  );
}
