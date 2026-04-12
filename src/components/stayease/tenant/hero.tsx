'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import {
  Search, MapPin, Users, Building2, Star, ChevronRight,
  Shield, Banknote, Smartphone, UsersRound, Lock, Headphones,
  ArrowRight, CheckCircle2, Sparkles, Wifi, Snowflake,
  UtensilsCrossed, TrainFront, BedDouble, Quote,
  ChevronLeft,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useAppStore } from '@/store/use-app-store';
import { CITIES } from '@/lib/constants';
import type { PGGender } from '@/lib/types';

// ============================
// Animated Counter
// ============================
function AnimatedCounter({ target, suffix = '' }: { target: string; suffix?: string }) {
  const [display, setDisplay] = useState('0');
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-50px' });

  useEffect(() => {
    if (!isInView) return;
    const numStr = target.replace(/[^0-9]/g, '');
    const numTarget = parseInt(numStr, 10);
    const prefix = target.match(/^[^0-9]*/)?.[0] || '';
    const endSuffix = target.match(/[^0-9]*$/)?.[0] || '';
    let current = 0;
    const increment = Math.ceil(numTarget / 60);
    const timer = setInterval(() => {
      current += increment;
      if (current >= numTarget) {
        current = numTarget;
        clearInterval(timer);
      }
      setDisplay(`${prefix}${current.toLocaleString('en-IN')}${endSuffix}${suffix}`);
    }, 25);
    return () => clearInterval(timer);
  }, [target, suffix, isInView]);

  return <span ref={ref}>{display}</span>;
}

// ============================
// Scroll Animation Wrapper
// ============================
function FadeInSection({ children, className, delay = 0 }: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-80px' });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 40 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 }}
      transition={{ duration: 0.6, delay, ease: 'easeOut' }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// ============================
// Section Heading Component
// ============================
function SectionHeading({ badge, title, highlight, description }: {
  badge?: string;
  title: string;
  highlight?: string;
  description?: string;
}) {
  return (
    <FadeInSection className="text-center max-w-3xl mx-auto mb-12 md:mb-16">
      {badge && (
        <Badge variant="secondary" className="mb-4 px-4 py-1.5 text-sm font-medium bg-brand-teal/15 text-brand-teal border-brand-teal/25">
          {badge}
        </Badge>
      )}
      <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-foreground mb-4">
        {title}{' '}
        {highlight && (
          <span className="bg-gradient-to-r from-brand-deep via-brand-teal to-brand-sage bg-clip-text text-transparent">
            {highlight}
          </span>
        )}
      </h2>
      {description && (
        <p className="text-muted-foreground text-lg max-w-2xl mx-auto">{description}</p>
      )}
    </FadeInSection>
  );
}

// ============================
// Main Hero Section Component
// ============================
export default function HeroSection() {
  const { searchFilters, setSearchFilters, setCurrentView } = useAppStore();
  const [localCity, setLocalCity] = useState(searchFilters.city || 'Bangalore');
  const [localGender, setLocalGender] = useState<string>(searchFilters.gender || 'ALL');
  const [localQuery, setLocalQuery] = useState(searchFilters.query || '');
  const [testimonialIdx, setTestimonialIdx] = useState(0);

  const handleSearch = () => {
    setSearchFilters({
      city: localCity,
      gender: localGender as PGGender | 'ALL',
      query: localQuery,
    });
    setCurrentView('PG_LISTING');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSearch();
  };

  const handleCityClick = (city: string) => {
    setSearchFilters(prev => ({ ...prev, city }));
    setLocalCity(city);
    handleSearch();
  };

  return (
    <div className="relative">
      {/* ===================== */}
      {/* 1. HERO SECTION       */}
      {/* ===================== */}
      <section className="relative overflow-hidden bg-gradient-to-br from-brand-deep via-brand-teal to-brand-sage">
        {/* Background image with overlay */}
        <div className="absolute inset-0">
          <div
            className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-20 mix-blend-overlay"
            style={{ backgroundImage: "url('/hero-bg.png')" }}
          />
          <div className="absolute inset-0 bg-gradient-to-b from-brand-deep/80 via-brand-teal/60 to-brand-deep/90" />
        </div>

        {/* Subtle grid pattern overlay */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute inset-0 opacity-[0.04]" style={{
            backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)',
            backgroundSize: '40px 40px'
          }} />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-20 md:pt-20 md:pb-32">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="flex justify-center mb-6"
          >
            <span className="inline-flex items-center gap-2 px-4 py-1.5 bg-white/20 backdrop-blur-sm text-white rounded-full text-sm font-medium border border-white/30">
              <span className="relative flex h-2 w-2">
                <span className="relative inline-flex rounded-full h-2 w-2 bg-white" />
              </span>
              India&apos;s Most Trusted PG Platform
            </span>
          </motion.div>

          {/* Main Heading */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-center max-w-4xl mx-auto"
          >
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight text-white mb-6 leading-tight">
              Find Your Perfect{' '}
              <span className="text-brand-lime font-extrabold">
                PG Home
              </span>
            </h1>
            <p className="text-lg sm:text-xl text-gray-300 max-w-2xl mx-auto mb-10 leading-relaxed">
              Discover verified, affordable paying guest accommodations across India.
              Book your ideal room with zero brokerage &amp; instant confirmation.
            </p>
          </motion.div>

          {/* Search Bar */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="max-w-3xl mx-auto mb-6"
          >
            <div className="bg-white rounded-2xl shadow-2xl shadow-brand-deep/30 p-2">
              <div className="flex flex-col sm:flex-row gap-2">
                {/* City Selector */}
                <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-brand-teal-light min-w-0 sm:min-w-[160px]">
                  <MapPin className="size-5 text-brand-teal shrink-0" />
                  <Select value={localCity} onValueChange={setLocalCity}>
                    <SelectTrigger className="border-0 bg-transparent shadow-none p-0 h-auto focus:ring-0 w-full">
                      <SelectValue placeholder="City" />
                    </SelectTrigger>
                    <SelectContent>
                      {CITIES.map((city) => (
                        <SelectItem key={city} value={city}>
                          {city}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Search Input */}
                <div className="flex-1 flex items-center gap-2 px-3 py-2.5">
                  <Search className="size-5 text-muted-foreground shrink-0" />
                  <Input
                    placeholder="Search by area, PG name..."
                    value={localQuery}
                    onChange={(e) => setLocalQuery(e.target.value)}
                    onKeyDown={handleKeyDown}
                    className="border-0 shadow-none focus-visible:ring-0 p-0 h-auto text-base"
                  />
                </div>

                {/* Gender Filter */}
                <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-muted min-w-0 sm:min-w-[140px]">
                  <Users className="size-5 text-muted-foreground shrink-0" />
                  <Select value={localGender} onValueChange={setLocalGender}>
                    <SelectTrigger className="border-0 bg-transparent shadow-none p-0 h-auto focus:ring-0 w-full">
                      <SelectValue placeholder="Gender" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ALL">All Genders</SelectItem>
                      <SelectItem value="MALE">Male</SelectItem>
                      <SelectItem value="FEMALE">Female</SelectItem>
                      <SelectItem value="UNISEX">Unisex</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Search Button */}
                <Button
                  onClick={handleSearch}
                  size="lg"
                  className="bg-gradient-to-r from-brand-deep to-brand-teal hover:from-brand-deep/90 hover:to-brand-teal/90 text-white rounded-xl px-8 h-12 shadow-lg shadow-brand-teal/30 transition-all hover:shadow-xl hover:scale-[1.02]"
                >
                  <Search className="size-4 sm:mr-2" />
                  <span className="hidden sm:inline">Search</span>
                </Button>
              </div>
            </div>

            {/* Quick filter tags */}
            <div className="flex flex-wrap justify-center gap-2 mt-4">
              {[
                { label: 'WiFi', icon: Wifi },
                { label: 'AC Rooms', icon: Snowflake },
                { label: 'Meals Included', icon: UtensilsCrossed },
                { label: 'Near Metro', icon: TrainFront },
                { label: 'Single Occupancy', icon: BedDouble },
              ].map((tag) => (
                <button
                  key={tag.label}
                  onClick={() => {
                    setLocalQuery(tag.label);
                    handleSearch();
                  }}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm text-white/90 bg-white/15 backdrop-blur-sm rounded-full border border-white/20 hover:bg-white/25 hover:border-white/40 transition-all cursor-pointer"
                >
                  <tag.icon className="size-3.5" />
                  {tag.label}
                </button>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Bottom wave separator */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 60" fill="none" className="w-full h-auto block">
            <path d="M0,60 L0,20 Q360,60 720,20 Q1080,-20 1440,20 L1440,60 Z" fill="var(--background)" />
          </svg>
        </div>
      </section>

      {/* ===================== */}
      {/* 2. HOW IT WORKS       */}
      {/* ===================== */}
      <section className="py-16 md:py-24 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeading
            badge="Simple & Quick"
            title="How StayEg"
            highlight="Works"
            description="Find and book your perfect PG in just 3 simple steps. No hassle, no broker fees."
          />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 max-w-5xl mx-auto">
            {[
              {
                step: '01',
                icon: Search,
                title: 'Search & Discover',
                desc: 'Browse thousands of verified PGs by city, area, amenities, and budget. Filter by gender, room type, and more.',
                color: 'from-brand-deep to-brand-teal',
                bgColor: 'bg-brand-teal-light',
                iconColor: 'text-brand-teal',
              },
              {
                step: '02',
                icon: CheckCircle2,
                title: 'Book & Verify',
                desc: 'Book your preferred room instantly. Our team verifies every property and owner for your safety.',
                color: 'from-brand-teal to-brand-sage',
                bgColor: 'bg-brand-teal/15',
                iconColor: 'text-brand-sage',
              },
              {
                step: '03',
                icon: Building2,
                title: 'Move In',
                desc: 'Complete your KYC, pay securely online, and move in stress-free. Welcome to your new home!',
                color: 'from-brand-teal to-brand-sage',
                bgColor: 'bg-brand-teal-light',
                iconColor: 'text-brand-teal',
              },
            ].map((item, idx) => (
              <FadeInSection key={item.step} delay={idx * 0.15}>
                <Card className={`relative overflow-hidden border-0 shadow-lg hover:shadow-xl transition-shadow group ${item.bgColor}`}>
                  {/* Step number */}
                  <div className="absolute top-4 right-4 text-6xl font-black text-foreground/5 group-hover:text-foreground/10 transition-colors select-none">
                    {item.step}
                  </div>
                  <CardContent className="p-6 md:p-8 relative">
                    <div className={`size-14 rounded-2xl bg-gradient-to-br ${item.color} flex items-center justify-center mb-5 shadow-lg`}>
                      <item.icon className="size-7 text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-foreground mb-2">{item.title}</h3>
                    <p className="text-muted-foreground text-sm leading-relaxed">{item.desc}</p>
                  </CardContent>
                </Card>
              </FadeInSection>
            ))}
          </div>

          {/* Connector lines on desktop */}
          <div className="hidden md:flex items-center justify-center max-w-4xl mx-auto -mt-[calc(50%+2rem)] mb-8 pointer-events-none">
            <div className="flex-1 border-t-2 border-dashed border-brand-teal/30 mx-8" />
          </div>
        </div>
      </section>

      {/* ===================== */}
      {/* 3. WHY CHOOSE STAYEG  */}
      {/* ===================== */}
      <section className="py-16 md:py-24 bg-gradient-to-b from-background to-brand-teal-light">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeading
            badge="Why StayEg"
            title="The StayEg"
            highlight="Advantage"
            description="Everything you need for a perfect PG living experience, all in one platform."
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                icon: Shield,
                title: 'Verified Properties',
                desc: 'Every PG is personally verified by our team. Photos, amenities, and prices are 100% accurate.',
                color: 'bg-green-100 text-green-600',
              },
              {
                icon: Banknote,
                title: 'Zero Brokerage',
                desc: 'No middlemen, no hidden charges. Find and book directly — save thousands on brokerage fees.',
                color: 'bg-brand-teal/15 text-brand-teal',
              },
              {
                icon: Smartphone,
                title: 'Smart PG Management',
                desc: 'For PG Owners: Manage everything from your phone — rent, staff, complaints, analytics & more.',
                color: 'bg-blue-100 text-blue-600',
              },
              {
                icon: UsersRound,
                title: 'Community & Friends',
                desc: 'Fight loneliness! Join local communities, find roommates, attend events, and make friends.',
                color: 'bg-purple-100 text-purple-600',
              },
              {
                icon: Lock,
                title: 'Secure Payments',
                desc: 'All payments are encrypted and secured. Track every transaction with detailed receipts.',
                color: 'bg-brand-sage/15 text-brand-sage',
              },
              {
                icon: Headphones,
                title: '24/7 Support',
                desc: 'Got an issue? Our support team is available round the clock via chat, call, or email.',
                color: 'bg-rose-100 text-rose-600',
              },
            ].map((item, idx) => (
              <FadeInSection key={item.title} delay={idx * 0.1}>
                <Card className="border-0 shadow-md hover:shadow-lg hover:-translate-y-1 transition-all duration-300 bg-card">
                  <CardContent className="p-6">
                    <div className={`size-12 rounded-xl ${item.color} flex items-center justify-center mb-4`}>
                      <item.icon className="size-6" />
                    </div>
                    <h3 className="text-lg font-bold text-foreground mb-2">{item.title}</h3>
                    <p className="text-muted-foreground text-sm leading-relaxed">{item.desc}</p>
                  </CardContent>
                </Card>
              </FadeInSection>
            ))}
          </div>
        </div>
      </section>

      {/* ===================== */}
      {/* 4. FOR PG OWNERS      */}
      {/* ===================== */}
      <section className="py-16 md:py-24 bg-background overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeInSection>
            <div className="relative rounded-3xl bg-gradient-to-br from-brand-deep via-[#2E1065] to-brand-deep overflow-hidden p-8 md:p-12 lg:p-16">
              {/* Subtle pattern */}
              <div className="absolute inset-0 opacity-[0.03]" style={{
                backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)',
                backgroundSize: '30px 30px'
              }} />

              <div className="relative grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center">
                {/* Left - Content */}
                <div>
                  <Badge className="mb-4 bg-brand-teal/20 text-brand-teal border-brand-teal/30">
                    <Sparkles className="size-3.5" />
                    For PG Owners
                  </Badge>
                  <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-4 leading-tight">
                    The Future of PG Management is{' '}
                    <span className="bg-gradient-to-r from-brand-teal to-brand-sage bg-clip-text text-transparent">
                      Here
                    </span>
                  </h2>
                  <p className="text-gray-400 mb-8 text-lg">
                    Transform how you run your PG business with our all-in-one digital platform.
                  </p>

                  <ul className="space-y-4 mb-8">
                    {[
                      'Manage everything from your mobile phone',
                      'Automatic rent collection & reminders',
                      'Staff attendance & task management',
                      'Real-time analytics & occupancy tracking',
                    ].map((item) => (
                      <li key={item} className="flex items-start gap-3">
                        <div className="size-6 rounded-full bg-green-500/20 flex items-center justify-center mt-0.5 shrink-0">
                          <CheckCircle2 className="size-4 text-green-400" />
                        </div>
                        <span className="text-gray-300">{item}</span>
                      </li>
                    ))}
                  </ul>

                  {/* Free trial banner */}
                  <div className="inline-flex items-center gap-2 bg-gradient-to-r from-brand-teal/20 to-brand-sage/20 border border-brand-teal/30 rounded-xl px-4 py-2 mb-6">
                    <Sparkles className="size-5 text-brand-sage" />
                    <span className="text-white font-semibold">First 1000 Owners Get 1 Year FREE!</span>
                  </div>

                  <div>
                    <Button
                      onClick={() => setCurrentView('PRICING')}
                      size="lg"
                      className="bg-gradient-to-r from-brand-deep to-brand-teal hover:from-brand-deep/90 hover:to-brand-teal/90 text-white rounded-xl px-8 shadow-lg shadow-brand-teal/30 transition-all hover:shadow-xl hover:scale-[1.02]"
                    >
                      Start Free Trial
                      <ArrowRight className="size-4 ml-2" />
                    </Button>
                  </div>
                </div>

                {/* Right - Feature cards */}
                <div className="hidden lg:grid grid-cols-2 gap-4">
                  {[
                    { icon: Smartphone, label: 'Mobile First', value: 'Manage on the go' },
                    { icon: Banknote, label: 'Rent Tracking', value: 'Auto collection' },
                    { icon: Users, label: 'Staff Management', value: 'Attendance & tasks' },
                    { icon: Star, label: 'Analytics', value: 'Real-time insights' },
                  ].map((item) => (
                    <div
                      key={item.label}
                      className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-5 hover:bg-white/10 transition-colors"
                    >
                      <item.icon className="size-8 text-brand-teal mb-3" />
                      <h4 className="text-white font-semibold mb-1">{item.label}</h4>
                      <p className="text-gray-400 text-sm">{item.value}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </FadeInSection>
        </div>
      </section>

      {/* ===================== */}
      {/* 5. FOR VENDORS        */}
      {/* ===================== */}
      <section className="py-16 md:py-24 bg-gradient-to-b from-brand-teal-light to-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeInSection>
            <div className="relative rounded-3xl overflow-hidden border border-brand-teal/20 bg-card shadow-xl">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-0">
                {/* Left - Visual */}
                <div className="relative bg-gradient-to-br from-brand-deep to-brand-teal p-8 md:p-12 flex flex-col justify-center min-h-[300px]">
                  <div className="absolute inset-0 opacity-10" style={{
                    backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)',
                    backgroundSize: '30px 30px'
                  }} />
                  <div className="relative">
                    <Badge className="mb-6 bg-white/20 text-white border-white/30">
                      For Service Providers
                    </Badge>
                    <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4 leading-tight">
                      Grow Your Service Business
                    </h2>
                    <p className="text-gray-300 text-lg">
                      Join India&apos;s largest PG service network and get connected with thousands of PG owners.
                    </p>
                  </div>
                </div>

                {/* Right - Content */}
                <div className="p-8 md:p-12">
                  <ul className="space-y-5 mb-8">
                    {[
                      { icon: UsersRound, title: 'Get Verified Leads', desc: 'Receive genuine service requests from verified PG owners in your area.' },
                      { icon: Building2, title: 'Manage Bookings', desc: 'Track all your bookings, set availability, and manage your schedule easily.' },
                      { icon: Star, title: 'Build Reputation', desc: 'Earn ratings & reviews from PG owners. Higher ratings = more business.' },
                    ].map((item) => (
                      <li key={item.title} className="flex items-start gap-4">
                        <div className="size-10 rounded-xl bg-brand-teal/15 flex items-center justify-center shrink-0">
                          <item.icon className="size-5 text-brand-teal" />
                        </div>
                        <div>
                          <h4 className="font-semibold text-foreground mb-0.5">{item.title}</h4>
                          <p className="text-muted-foreground text-sm">{item.desc}</p>
                        </div>
                      </li>
                    ))}
                  </ul>

                  <Button
                    onClick={() => setCurrentView('SIGNUP')}
                    size="lg"
                    variant="outline"
                    className="border-brand-teal/25 text-brand-teal hover:bg-brand-teal-light rounded-xl px-8 transition-all hover:scale-[1.02]"
                  >
                    Register as Vendor
                    <ArrowRight className="size-4 ml-2" />
                  </Button>
                </div>
              </div>
            </div>
          </FadeInSection>
        </div>
      </section>

      {/* ===================== */}
      {/* 6. STATS SECTION      */}
      {/* ===================== */}
      <section className="py-16 md:py-20 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeInSection>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
              {[
                { icon: Building2, value: '10,000+', label: 'Verified PGs', color: 'bg-brand-teal-light text-brand-teal' },
                { icon: Users, value: '50,000+', label: 'Happy Tenants', color: 'bg-green-50 text-green-600' },
                { icon: MapPin, value: '20+', label: 'Cities Across India', color: 'bg-blue-50 text-blue-600' },
                { icon: Star, value: '4.5+', label: 'Average Rating', color: 'bg-brand-sage/15 text-brand-sage' },
              ].map((stat, index) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                  className="bg-muted rounded-2xl p-6 text-center border border-border hover:shadow-md transition-shadow"
                >
                  <div className={`size-14 rounded-2xl ${stat.color} flex items-center justify-center mx-auto mb-3`}>
                    <stat.icon className="size-7" />
                  </div>
                  <div className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground mb-1">
                    <AnimatedCounter target={stat.value} />
                  </div>
                  <div className="text-sm text-muted-foreground">{stat.label}</div>
                </motion.div>
              ))}
            </div>
          </FadeInSection>
        </div>
      </section>

      {/* ===================== */}
      {/* 7. TRUST BADGES       */}
      {/* ===================== */}
      <section className="py-12 bg-gradient-to-r from-brand-teal-light via-brand-teal/10 to-brand-teal-light border-y border-brand-teal/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeInSection>
            <div className="flex flex-wrap justify-center gap-8 md:gap-16">
              {[
                { icon: Shield, label: 'Verified Properties', desc: 'Every PG is personally inspected', color: 'bg-green-100 text-green-600' },
                { icon: Banknote, label: 'Zero Brokerage', desc: 'No hidden charges, ever', color: 'bg-brand-teal/15 text-brand-teal' },
                { icon: Lock, label: 'Secure Payments', desc: '256-bit encrypted transactions', color: 'bg-blue-100 text-blue-600' },
              ].map((item) => (
                <div key={item.label} className="flex items-center gap-3">
                  <div className={`size-12 rounded-xl ${item.color} flex items-center justify-center`}>
                    <item.icon className="size-6" />
                  </div>
                  <div>
                    <div className="font-semibold text-foreground text-sm">{item.label}</div>
                    <div className="text-xs text-muted-foreground">{item.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </FadeInSection>
        </div>
      </section>

      {/* ===================== */}
      {/* 8. TESTIMONIALS       */}
      {/* ===================== */}
      <section className="py-16 md:py-24 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeading
            badge="Testimonials"
            title="What Our Users"
            highlight="Say"
            description="Real stories from real people who found their perfect PG home with StayEg."
          />

          <FadeInSection>
            <div className="relative">
              {/* Desktop: 3 cards */}
              <div className="hidden md:grid md:grid-cols-3 gap-6">
                {testimonials.map((t, idx) => (
                  <TestimonialCard key={idx} testimonial={t} />
                ))}
              </div>

              {/* Mobile: Carousel */}
              <div className="md:hidden">
                <div className="overflow-hidden">
                  <motion.div
                    className="flex"
                    animate={{ x: `-${testimonialIdx * 100}%` }}
                    transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                  >
                    {testimonials.map((t, idx) => (
                      <div key={idx} className="w-full shrink-0 px-2">
                        <TestimonialCard testimonial={t} />
                      </div>
                    ))}
                  </motion.div>
                </div>

                {/* Carousel Controls */}
                <div className="flex items-center justify-center gap-4 mt-6">
                  <button
                    onClick={() => setTestimonialIdx((prev) => Math.max(0, prev - 1))}
                    disabled={testimonialIdx === 0}
                    className="size-10 rounded-full bg-brand-teal/15 text-brand-teal flex items-center justify-center disabled:opacity-30 hover:bg-brand-teal/20 transition-colors"
                  >
                    <ChevronLeft className="size-5" />
                  </button>

                  <div className="flex gap-2">
                    {testimonials.map((_, idx) => (
                      <button
                        key={idx}
                        onClick={() => setTestimonialIdx(idx)}
                        className={`h-2 rounded-full transition-all duration-300 ${
                          idx === testimonialIdx ? 'w-8 bg-brand-teal' : 'w-2 bg-brand-teal/20'
                        }`}
                      />
                    ))}
                  </div>

                  <button
                    onClick={() => setTestimonialIdx((prev) => Math.min(testimonials.length - 1, prev + 1))}
                    disabled={testimonialIdx === testimonials.length - 1}
                    className="size-10 rounded-full bg-brand-teal/15 text-brand-teal flex items-center justify-center disabled:opacity-30 hover:bg-brand-teal/20 transition-colors"
                  >
                    <ChevronRight className="size-5" />
                  </button>
                </div>
              </div>
            </div>
          </FadeInSection>
        </div>
      </section>

      {/* ===================== */}
      {/* 9. CTA SECTION        */}
      {/* ===================== */}
      <section className="py-16 md:py-24 bg-gradient-to-br from-brand-deep via-brand-teal to-brand-sage relative overflow-hidden">
        {/* Subtle pattern overlay */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute inset-0 opacity-[0.04]" style={{
            backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)',
            backgroundSize: '40px 40px'
          }} />
        </div>

        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <FadeInSection>
            <Badge className="mb-6 bg-white/20 text-white border-white/30">
              Get Started Today
            </Badge>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-4">
              Ready to Find Your PG Home?
            </h2>
            <p className="text-gray-300 text-lg mb-8 max-w-2xl mx-auto">
              Join 50,000+ tenants who found their perfect accommodation. It&apos;s free, fast, and reliable.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-6">
              <Button
                onClick={() => setCurrentView('PG_LISTING')}
                size="lg"
                className="bg-card text-foreground hover:bg-brand-teal-light rounded-xl px-8 shadow-lg transition-all hover:shadow-xl hover:scale-[1.02] font-semibold text-base"
              >
                <Search className="size-5 mr-2" />
                Find PG Now
              </Button>
              <Button
                onClick={() => setCurrentView('PRICING')}
                size="lg"
                variant="outline"
                className="border-2 border-white/40 text-white hover:bg-white/10 rounded-xl px-8 transition-all hover:scale-[1.02] font-semibold text-base bg-transparent"
              >
                <Building2 className="size-5 mr-2" />
                List Your PG
              </Button>
            </div>

            <div className="inline-flex items-center gap-2 bg-white/15 backdrop-blur-sm rounded-full px-5 py-2 border border-white/20">
              <CheckCircle2 className="size-4 text-green-300" />
              <span className="text-white text-sm font-medium">100% Free for Tenants</span>
            </div>
          </FadeInSection>
        </div>
      </section>

      {/* ===================== */}
      {/* 10. CITIES WE'RE IN   */}
      {/* ===================== */}
      <section className="py-16 md:py-24 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeading
            badge="Our Presence"
            title="Cities We're"
            highlight="In"
            description="StayEg is available across India's top cities. Click on your city to find PGs near you."
          />

          <FadeInSection>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4 max-w-4xl mx-auto">
              {CITIES.map((city, idx) => (
                <motion.button
                  key={city}
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.3, delay: idx * 0.05 }}
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleCityClick(city)}
                  className="group relative bg-card rounded-2xl border border-border p-5 text-center shadow-sm hover:shadow-md hover:border-brand-teal/30 transition-all cursor-pointer overflow-hidden"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-brand-deep to-brand-teal opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <div className="relative">
                    <div className="size-10 rounded-xl bg-brand-teal/15 group-hover:bg-white/20 flex items-center justify-center mx-auto mb-3 transition-colors">
                      <MapPin className="size-5 text-brand-teal group-hover:text-white transition-colors" />
                    </div>
                    <div className="font-semibold text-foreground group-hover:text-white text-sm transition-colors">
                      {city}
                    </div>
                    <div className="text-xs text-muted-foreground group-hover:text-gray-300 mt-0.5 transition-colors">
                      Explore PGs
                    </div>
                  </div>
                </motion.button>
              ))}
            </div>
          </FadeInSection>
        </div>
      </section>

      {/* Bottom gradient fade into footer */}
      <div className="h-px bg-gradient-to-r from-transparent via-brand-teal/25 to-transparent" />
    </div>
  );
}

// ============================
// Testimonial Card
// ============================
const testimonials = [
  {
    name: 'Priya Sharma',
    role: 'Software Engineer, Bangalore',
    avatar: 'https://api.dicebear.com/9.x/avataaars/svg?seed=Priya',
    quote: 'StayEg made my move to Bangalore so easy! Found a verified PG near my office in just 2 days. The community feature helped me find amazing roommates.',
    rating: 5,
  },
  {
    name: 'Arjun Patel',
    role: 'MBA Student, Delhi',
    avatar: 'https://api.dicebear.com/9.x/avataaars/svg?seed=Arjun',
    quote: 'Zero brokerage was a game-changer for me. As a student, every rupee counts. The PG I found through StayEg is clean, affordable, and near my college.',
    rating: 5,
  },
  {
    name: 'Meera Krishnan',
    role: 'Content Writer, Pune',
    avatar: 'https://api.dicebear.com/9.x/avataaars/svg?seed=Meera',
    quote: 'I was nervous about moving to a new city alone. But the StayEg community connected me with so many people. Now I have friends and a lovely PG home!',
    rating: 4,
  },
];

function TestimonialCard({ testimonial: { name, role, avatar, quote, rating } }: {
  testimonial: typeof testimonials[0];
}) {
  return (
    <Card className="border border-border shadow-md hover:shadow-lg transition-shadow bg-card">
      <CardContent className="p-6">
        {/* Stars - brand-sage for ratings */}
        <div className="flex gap-0.5 mb-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <Star
              key={i}
              className={`size-4 ${i < rating ? 'text-brand-sage fill-brand-sage' : 'text-gray-200'}`}
            />
          ))}
        </div>

        {/* Quote */}
        <div className="relative mb-6">
          <Quote className="size-8 text-brand-teal/20 absolute -top-1 -left-1" />
          <p className="text-muted-foreground text-sm leading-relaxed pl-6">&ldquo;{quote}&rdquo;</p>
        </div>

        {/* Author */}
        <div className="flex items-center gap-3 pt-4 border-t border-border">
          <div className="size-10 rounded-full bg-gradient-to-br from-brand-teal to-brand-sage flex items-center justify-center overflow-hidden">
            <img src={avatar} alt={name} className="size-full" />
          </div>
          <div>
            <div className="font-semibold text-foreground text-sm">{name}</div>
            <div className="text-xs text-muted-foreground">{role}</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
