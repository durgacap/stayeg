'use client';

import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { pageTransition } from '@/lib/animations';
import {
  Home, Search, BookOpen, CalendarDays, CreditCard, MessageSquare,
  MapPin, User, Menu, Building2, LayoutDashboard, BedDouble,
  Users, Wallet, Wrench, HardHat, AlertTriangle, LogIn, LogOut,
  UsersRound, ChevronRight, IndianRupee, QrCode,
} from 'lucide-react';
// Database setup already completed via Supabase — skipping setup wizard
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { useAppStore } from '@/store/use-app-store';
import HeroSection from '@/components/stayease/tenant/hero';
import PGListing from '@/components/stayease/tenant/pg-listing';
import PGDetail from '@/components/stayease/tenant/pg-detail';
import BookingModal from '@/components/stayease/tenant/booking-modal';
import MyBookings from '@/components/stayease/tenant/my-bookings';
import TenantMyStay from '@/components/stayease/tenant/tenant-my-stay';
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
import QROnboarding from '@/components/stayease/owner/qr-onboarding';
import OwnerContactSupport from '@/components/stayease/owner/contact-support';
import AdminDashboard from '@/components/stayease/admin/admin-dashboard';
import ProfilePage from '@/components/stayease/profile/profile-page';
import TenantProfile from '@/components/stayease/tenant/tenant-profile';
import SiteFooter from '@/components/stayease/site-footer';
import CommunityPage from '@/components/stayease/community/community-page';
import LoginPage from '@/components/stayease/auth/login-page';
import SignupPage from '@/components/stayease/auth/signup-page';
import PricingPage from '@/components/stayease/pricing/pricing-page';
import TermsPage from '@/components/stayease/policy/terms-page';
import PrivacyPage from '@/components/stayease/policy/privacy-page';
import SafeUsePage from '@/components/stayease/policy/safe-use-page';
import AboutPage from '@/components/stayease/policy/about-page';
import HelpPage from '@/components/stayease/policy/help-page';
import OwnerGuide from '@/components/stayease/owner/owner-guide';
import NotificationsPanel from '@/components/stayease/notifications-panel';
import DatabaseSetupV2 from '@/components/stayease/setup/database-setup-v2';
import HowItWorksPage from '@/components/stayease/policy/how-it-works-page';
import ContactPage from '@/components/stayease/policy/contact-page';
import RefundPolicyPage from '@/components/stayease/policy/refund-policy-page';
import TenantOnboarding from '@/components/stayease/guidance/tenant-onboarding';
import TenantAIAssistant from '@/components/stayease/guidance/tenant-ai-assistant';
import OwnerSetupWizard from '@/components/stayease/owner/setup-wizard';
import TenantHome from '@/components/stayease/tenant/tenant-home';
import TenantExplore from '@/components/stayease/tenant/tenant-explore';
import TenantSupport from '@/components/stayease/tenant/tenant-support';

// Navigation items
const PUBLIC_NAV = [
  { view: 'LANDING' as const, label: 'Home', icon: Home },
  { view: 'PG_LISTING' as const, label: 'Explore PGs', icon: Search },
  { view: 'PRICING' as const, label: 'Pricing', icon: IndianRupee },
  { view: 'COMMUNITY' as const, label: 'Community', icon: UsersRound },
];

const TENANT_NAV = [
  { view: 'TENANT_HOME' as const, label: 'Home', icon: Home },
  { view: 'TENANT_EXPLORE' as const, label: 'Explore', icon: Search },
  { view: 'TENANT_MY_STAY' as const, label: 'My Stay', icon: CalendarDays },
  { view: 'TENANT_SUPPORT' as const, label: 'Support', icon: MessageSquare },
  { view: 'TENANT_PROFILE' as const, label: 'Profile', icon: User },
];

const TENANT_MOBILE_NAV = [
  { view: 'TENANT_HOME' as const, label: 'Home', icon: Home },
  { view: 'TENANT_EXPLORE' as const, label: 'Explore', icon: Search },
  { view: 'TENANT_MY_STAY' as const, label: 'My Stay', icon: CalendarDays },
  { view: 'TENANT_SUPPORT' as const, label: 'Support', icon: MessageSquare },
  { view: 'TENANT_PROFILE' as const, label: 'Profile', icon: User },
];

const OWNER_NAV = [
  { view: 'OWNER_DASHBOARD' as const, label: 'Dashboard', icon: LayoutDashboard },
  { view: 'OWNER_PGS' as const, label: 'My PGs', icon: Building2 },
  { view: 'OWNER_TENANTS' as const, label: 'Tenants', icon: Users },
  { view: 'OWNER_RENT' as const, label: 'Rent', icon: Wallet },
  { view: 'OWNER_ROOMS' as const, label: 'Rooms', icon: BedDouble },
  { view: 'OWNER_COMPLAINTS' as const, label: 'Complaints', icon: AlertTriangle },
  { view: 'OWNER_QR' as const, label: 'QR Code', icon: QrCode },
  { view: 'OWNER_VENDORS' as const, label: 'Vendors', icon: Wrench },
  { view: 'OWNER_WORKERS' as const, label: 'Staff', icon: HardHat },
  { view: 'OWNER_SUPPORT' as const, label: 'Support', icon: MessageSquare },
];

const OWNER_MOBILE_NAV = [
  { view: 'OWNER_DASHBOARD' as const, label: 'Dashboard', icon: LayoutDashboard },
  { view: 'OWNER_PGS' as const, label: 'PGs', icon: Building2 },
  { view: 'OWNER_RENT' as const, label: 'Rent', icon: Wallet },
  { view: 'OWNER_COMPLAINTS' as const, label: 'Alerts', icon: AlertTriangle },
];

const HIDE_HEADER_VIEWS = ['LOGIN', 'SIGNUP'] as const;
const HIDE_MOBILE_NAV_VIEWS = ['LOGIN', 'SIGNUP', 'PRICING', 'TERMS', 'PRIVACY', 'SAFE_USE', 'ABOUT', 'HELP', 'PROFILE', 'DATABASE_SETUP_V2', 'HOW_IT_WORKS', 'CONTACT', 'REFUND_POLICY', 'TENANT_PROFILE', 'PG_DETAIL', 'BOOKING'] as const;

function MobileNav({ items }: { items: typeof TENANT_MOBILE_NAV | typeof OWNER_MOBILE_NAV }) {
  const { currentView, setCurrentView } = useAppStore();
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-background border-t border-gold/20 shadow-gold-sm md:hidden">
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
      : currentRole === 'ADMIN'
        ? [] // admin uses its own nav
        : TENANT_NAV;

  const hideHeader = (HIDE_HEADER_VIEWS as readonly string[]).includes(currentView);

  if (hideHeader) return null;

  return (
    <header
      className="sticky top-0 z-40 transition-all duration-300 bg-background border-b border-gold/20"
    >
      <div className="max-w-7xl mx-auto px-4 pt-[max(0.75rem,env(safe-area-inset-top))] pb-2.5 flex items-center justify-between">
        {/* Logo */}
        <button
          onClick={() => setCurrentView('LANDING')}
          className="flex items-center gap-2 group"
        >
          <div className="size-8 bg-gradient-to-br from-brand-deep to-brand-teal rounded-lg flex items-center justify-center shadow-sm group-hover:shadow-md transition-shadow">
            <Building2 className="size-4 text-white" />
          </div>
          <span className="font-bold text-lg text-foreground hidden sm:block">
            Stay<span className="text-brand-teal">Eg</span>
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
          {isLoggedIn ? (
            <>
              {/* Logged-in: notifications, profile, logout */}
              <div className="hidden sm:flex">
                <NotificationsPanel />
              </div>
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
                  <button onClick={() => { setCurrentView('ABOUT'); setMobileMenuOpen(false); }} className="block text-xs text-muted-foreground hover:text-foreground">About StayEg</button>
                  <button onClick={() => { setCurrentView('HOW_IT_WORKS'); setMobileMenuOpen(false); }} className="block text-xs text-muted-foreground hover:text-foreground">How It Works</button>
                  <button onClick={() => { setCurrentView('CONTACT'); setMobileMenuOpen(false); }} className="block text-xs text-muted-foreground hover:text-foreground">Contact Us</button>
                  <button onClick={() => { setCurrentView('HELP'); setMobileMenuOpen(false); }} className="block text-xs text-muted-foreground hover:text-foreground">Help & Support</button>
                  <button onClick={() => { setCurrentView('TERMS'); setMobileMenuOpen(false); }} className="block text-xs text-muted-foreground hover:text-foreground">Terms of Service</button>
                  <button onClick={() => { setCurrentView('PRIVACY'); setMobileMenuOpen(false); }} className="block text-xs text-muted-foreground hover:text-foreground">Privacy Policy</button>
                  <button onClick={() => { setCurrentView('SAFE_USE'); setMobileMenuOpen(false); }} className="block text-xs text-muted-foreground hover:text-foreground">Safe Use Guidelines</button>
                  <button onClick={() => { setCurrentView('REFUND_POLICY'); setMobileMenuOpen(false); }} className="block text-xs text-muted-foreground hover:text-foreground">Refund Policy</button>
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
  const { currentView, currentRole, setCurrentView, isLoggedIn } = useAppStore();
  const bookingModalOpen = currentView === 'BOOKING';

  const renderView = () => {
    // Auth views
    if (currentView === 'LOGIN') return <LoginPage />;
    if (currentView === 'SIGNUP') return <SignupPage />;

    // Setup view
    if (currentView === 'DATABASE_SETUP_V2') return <DatabaseSetupV2 />;

    // Tenant new views (mobile-first)
    if (currentRole === 'TENANT' || currentRole === 'VENDOR') {
      switch (currentView) {
        case 'TENANT_HOME': return <TenantHome />;
        case 'TENANT_EXPLORE': return <TenantExplore />;
        case 'TENANT_MY_STAY': return <TenantMyStay />;
        case 'TENANT_SUPPORT': return <TenantSupport />;
        case 'TENANT_PROFILE': return <TenantProfile />;
        case 'PG_DETAIL': return <PGDetail />;
        case 'BOOKING': return null;
        case 'COMMUNITY': return <CommunityPage />;
      }
    }

    // Policy & pricing views (accessible to all)
    if (currentView === 'PRICING') return <PricingPage />;
    if (currentView === 'TERMS') return <TermsPage />;
    if (currentView === 'PRIVACY') return <PrivacyPage />;
    if (currentView === 'SAFE_USE') return <SafeUsePage />;
    if (currentView === 'ABOUT') return <AboutPage />;
    if (currentView === 'HELP') return <HelpPage />;
    if (currentView === 'HOW_IT_WORKS') return <HowItWorksPage />;
    if (currentView === 'CONTACT') return <ContactPage />;
    if (currentView === 'REFUND_POLICY') return <RefundPolicyPage />;

    // Route protection: redirect unauthenticated users from protected views
    const PROTECTED_VIEWS = new Set(['BOOKING', 'MY_BOOKINGS', 'PAYMENTS', 'COMPLAINTS', 'NEARBY', 'PROFILE', 'OWNER_DASHBOARD', 'OWNER_PGS', 'OWNER_ROOMS', 'OWNER_TENANTS', 'OWNER_RENT', 'OWNER_VENDORS', 'OWNER_WORKERS', 'OWNER_COMPLAINTS', 'OWNER_QR', 'OWNER_SUPPORT', 'ADMIN_DASHBOARD', 'ADMIN_VERIFICATION', 'ADMIN_USERS', 'TENANT_HOME', 'TENANT_EXPLORE', 'TENANT_MY_STAY', 'TENANT_SUPPORT', 'TENANT_PROFILE', 'MY_STAY']);

    if (!isLoggedIn && PROTECTED_VIEWS.has(currentView)) {
      return (
        <div className="min-h-[60vh] flex flex-col items-center justify-center px-4 text-center">
          <div className="size-16 rounded-full bg-brand-teal/10 flex items-center justify-center mb-4">
            <LogIn className="size-8 text-brand-teal" />
          </div>
          <h2 className="text-xl font-bold text-foreground mb-2">Login Required</h2>
          <p className="text-sm text-muted-foreground max-w-md mb-6">
            Please sign in to access this feature.
          </p>
          <div className="flex gap-3">
            <Button variant="outline" onClick={() => setCurrentView('LANDING')}>
              Back to Home
            </Button>
            <Button onClick={() => setCurrentView('LOGIN')} className="bg-gradient-to-r from-brand-deep to-brand-teal hover:from-brand-deep/90 hover:to-brand-teal/90 text-white">
              Sign In
            </Button>
          </div>
        </div>
      );
    }

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
        case 'OWNER_QR': return <QROnboarding />;
        case 'OWNER_SUPPORT': return <OwnerContactSupport />;
        default: return <OwnerDashboard />;
      }
    }

    // Admin views
    if (currentRole === 'ADMIN') {
      switch (currentView) {
        case 'ADMIN_DASHBOARD':
        case 'ADMIN_VERIFICATION':
        case 'ADMIN_USERS':
          return <AdminDashboard />;
        default: return <AdminDashboard />;
      }
    }

    // Vendor views
    if (currentRole === 'VENDOR') {
      return (
        <div className="min-h-[60vh] flex flex-col items-center justify-center px-4 text-center">
          <div className="size-16 rounded-full bg-brand-sage/15 flex items-center justify-center mb-4">
            <Wrench className="size-8 text-brand-sage" />
          </div>
          <h2 className="text-xl font-bold text-foreground mb-2">Vendor Portal Coming Soon</h2>
          <p className="text-sm text-muted-foreground max-w-md mb-6">
            The vendor dashboard is under construction. You&apos;ll be able to manage services, track earnings, and connect with PG owners soon.
          </p>
          <button
            onClick={() => setCurrentView('LANDING')}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-brand-deep to-brand-teal text-white text-sm font-medium hover:opacity-90 transition-opacity"
          >
            Back to Home
          </button>
        </div>
      );
    }

    // Tenant views
    switch (currentView) {
      case 'LANDING': return <HeroSection />;
      case 'PG_LISTING': return <PGListing />;
      case 'PG_DETAIL': return <PGDetail />;
      case 'MY_STAY': return <TenantMyStay />;
      case 'MY_BOOKINGS': return <MyBookings />;
      case 'PAYMENTS': return <PaymentSection />;
      case 'COMPLAINTS': return <ComplaintSection />;
      case 'NEARBY': return <NearbyServices />;
      case 'COMMUNITY': return <CommunityPage />;
      case 'PROFILE': return currentRole === 'TENANT' ? <TenantProfile /> : <ProfilePage />;
      case 'BOOKING': return null;
      default: return <HeroSection />;
    }
  };

  return (
    <>
      <AnimatePresence mode="wait">
        <motion.div
          key={currentView + currentRole}
          variants={pageTransition}
          initial="initial"
          animate="animate"
          exit="exit"
        >
          {renderView()}
        </motion.div>
      </AnimatePresence>
      <BookingModal
        open={bookingModalOpen}
        onOpenChange={() => { useAppStore.getState().setCurrentView('PG_DETAIL'); }}
      />
      {currentRole === 'OWNER' && <AIAssistant />}
      {currentRole === 'TENANT' && <TenantAIAssistant />}
    </>
  );
}

export default function StayeGApp() {
  const { currentView, currentRole, isLoggedIn } = useAppStore();
  const [showOwnerGuide, setShowOwnerGuide] = useState(false);
  const [showSetupWizard, setShowSetupWizard] = useState(false);

  // Show owner guide when owner first reaches dashboard
  useEffect(() => {
    if (isLoggedIn && currentRole === 'OWNER' && currentView === 'OWNER_DASHBOARD') {
      const hasSeenGuide = localStorage.getItem('stayeg_owner_guide_seen');
      if (!hasSeenGuide) {
        localStorage.setItem('stayeg_owner_guide_seen', '1');
        // Use setTimeout to avoid setting state during render
        const timer = setTimeout(() => setShowOwnerGuide(true), 100);
        return () => clearTimeout(timer);
      }
    }
  }, [isLoggedIn, currentRole, currentView]);

  const handleGuideClose = () => setShowOwnerGuide(false);
  const handleSetupWizardClose = () => setShowSetupWizard(false);

  // Show setup wizard for new owners with no PGs
  useEffect(() => {
    if (isLoggedIn && currentRole === 'OWNER' && currentView === 'OWNER_DASHBOARD') {
      const hasSeenWizard = localStorage.getItem('stayeg_owner_setup_done');
      if (!hasSeenWizard) {
        const timer = setTimeout(() => setShowSetupWizard(true), 500);
        return () => clearTimeout(timer);
      }
    }
  }, [isLoggedIn, currentRole, currentView]);

  const mobileNav = !isLoggedIn
    ? [] // No mobile nav for guests
    : currentRole === 'OWNER'
      ? OWNER_MOBILE_NAV
      : TENANT_MOBILE_NAV;
  const hideMobileNav = (HIDE_MOBILE_NAV_VIEWS as readonly string[]).includes(currentView);
  const FOOTER_VIEWS = ['LANDING', 'PG_LISTING', 'PRICING', 'COMMUNITY', 'TERMS', 'PRIVACY', 'SAFE_USE', 'ABOUT', 'HELP', 'HOW_IT_WORKS', 'CONTACT', 'REFUND_POLICY'] as const;
  const showFooter = (FOOTER_VIEWS as readonly string[]).includes(currentView);

  return (
    <div className="min-h-screen flex flex-col bg-background pb-safe">
      <TopHeader />
      <main className="flex-1 pb-20 md:pb-0">
        <MainContent />
      </main>
      {showFooter && <SiteFooter />}
      {isLoggedIn && !hideMobileNav && <MobileNav items={mobileNav} />}
      <OwnerGuide open={showOwnerGuide} onClose={handleGuideClose} />
      <TenantOnboarding />
      <OwnerSetupWizard open={showSetupWizard} onClose={handleSetupWizardClose} />
    </div>
  );
}
