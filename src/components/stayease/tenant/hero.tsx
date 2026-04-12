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
    if (!numStr || isNaN(numTarget)) return;
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
      initial={{ opacity: 0, y: 30 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
      transition={{ duration: 0.5, delay, ease: 'easeOut' }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// ============================
// Section Heading
// ============================
function SectionHeading({ badge, title, highlight, description }: {
  badge?: string;
  title: string;
  highlight?: string;
  description?: string;
}) {
  return (
    <FadeInSection className="text-center max-w-2xl mx-auto mb-10 md:mb-14">
      {badge && (
        <Badge className="mb-3 px-3 py-1 text-xs font-medium bg-primary/10 text-primary border-primary/20">
          {badge}
        </Badge>
      )}
      <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground mb-3">
        {title}{' '}
        {highlight && (
          <span className="text-primary">{highlight}</span>
        )}
      </h2>
      {description && (
        <p className="text-muted-foreground text-sm sm:text-base max-w-xl mx-auto">{description}</p>
      )}
    </FadeInSection>
  );
}

// ============================
// Hero Section
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
      {/* 1. HERO — Clean white */}
      {/* ===================== */}
      <section className="relative bg-background pt-8 pb-12 md:pt-14 md:pb-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="flex justify-center mb-5"
          >
            <span className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-primary/10 text-primary rounded-full text-xs font-semibold">
              <span className="size-1.5 rounded-full bg-primary" />
              India&apos;s Most Trusted PG Platform
            </span>
          </motion.div>

          {/* Heading */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.05 }}
            className="text-center max-w-3xl mx-auto mb-8"
          >
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-foreground mb-4 leading-snug">
              Find Your Perfect{' '}
              <span className="text-primary">PG Home</span>
            </h1>
            <p className="text-sm sm:text-base text-muted-foreground max-w-xl mx-auto leading-relaxed">
              Verified, affordable PGs across India. Book instantly with zero brokerage.
            </p>
          </motion.div>

          {/* Search Bar */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="max-w-2xl mx-auto mb-5"
          >
            <div className="bg-card rounded-xl border border-border shadow-sm p-1.5">
              <div className="flex flex-col sm:flex-row gap-1.5">
                {/* City */}
                <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-muted/60 min-w-0 sm:min-w-[140px]">
                  <MapPin className="size-4 text-primary shrink-0" />
                  <Select value={localCity} onValueChange={setLocalCity}>
                    <SelectTrigger className="border-0 bg-transparent shadow-none p-0 h-auto focus:ring-0 w-full text-sm">
                      <SelectValue placeholder="City" />
                    </SelectTrigger>
                    <SelectContent>
                      {CITIES.map((city) => (
                        <SelectItem key={city} value={city}>{city}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Search */}
                <div className="flex-1 flex items-center gap-2 px-3 py-2">
                  <Search className="size-4 text-muted-foreground shrink-0" />
                  <Input
                    placeholder="Search by area, PG name..."
                    value={localQuery}
                    onChange={(e) => setLocalQuery(e.target.value)}
                    onKeyDown={handleKeyDown}
                    className="border-0 shadow-none focus-visible:ring-0 p-0 h-auto text-sm"
                  />
                </div>

                {/* Gender */}
                <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-muted/60 min-w-0 sm:min-w-[120px]">
                  <Users className="size-4 text-muted-foreground shrink-0" />
                  <Select value={localGender} onValueChange={setLocalGender}>
                    <SelectTrigger className="border-0 bg-transparent shadow-none p-0 h-auto focus:ring-0 w-full text-sm">
                      <SelectValue placeholder="Gender" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ALL">All</SelectItem>
                      <SelectItem value="MALE">Male</SelectItem>
                      <SelectItem value="FEMALE">Female</SelectItem>
                      <SelectItem value="UNISEX">Unisex</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Button */}
                <Button
                  onClick={handleSearch}
                  className="bg-primary hover:bg-primary/90 text-white rounded-lg px-6 h-10 text-sm font-medium"
                >
                  <Search className="size-4 sm:mr-1.5" />
                  <span className="hidden sm:inline">Search</span>
                </Button>
              </div>
            </div>

            {/* Quick tags */}
            <div className="flex flex-wrap justify-center gap-1.5 mt-3">
              {[
                { label: 'WiFi', icon: Wifi },
                { label: 'AC', icon: Snowflake },
                { label: 'Meals', icon: UtensilsCrossed },
                { label: 'Near Metro', icon: TrainFront },
                { label: 'Single', icon: BedDouble },
              ].map((tag) => (
                <button
                  key={tag.label}
                  onClick={() => { setLocalQuery(tag.label); handleSearch(); }}
                  className="inline-flex items-center gap-1 px-2.5 py-1 text-xs text-muted-foreground bg-muted/50 rounded-full hover:bg-primary/10 hover:text-primary transition-colors cursor-pointer"
                >
                  <tag.icon className="size-3" />
                  {tag.label}
                </button>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Divider */}
      <div className="h-px bg-border" />

      {/* ===================== */}
      {/* 2. HOW IT WORKS       */}
      {/* ===================== */}
      <section className="py-12 md:py-16 bg-background">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <SectionHeading
            badge="Simple & Quick"
            title="How StayEg"
            highlight="Works"
            description="Find and book your perfect PG in 3 simple steps."
          />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 max-w-4xl mx-auto">
            {[
              { step: '01', icon: Search, title: 'Search & Discover', desc: 'Browse verified PGs by city, area, amenities, and budget.' },
              { step: '02', icon: CheckCircle2, title: 'Book Instantly', desc: 'Book your room with zero brokerage and instant confirmation.' },
              { step: '03', icon: Building2, title: 'Move In', desc: 'Complete KYC, pay securely, and move in stress-free.' },
            ].map((item, idx) => (
              <FadeInSection key={item.step} delay={idx * 0.1}>
                <Card className="border border-border shadow-sm hover:shadow-md transition-shadow group bg-card">
                  <CardContent className="p-5 md:p-6">
                    <div className="size-11 rounded-xl bg-primary flex items-center justify-center mb-4">
                      <item.icon className="size-5 text-white" />
                    </div>
                    <div className="text-xs font-bold text-muted-foreground/50 mb-1">STEP {item.step}</div>
                    <h3 className="text-base font-bold text-foreground mb-1.5">{item.title}</h3>
                    <p className="text-muted-foreground text-sm leading-relaxed">{item.desc}</p>
                  </CardContent>
                </Card>
              </FadeInSection>
            ))}
          </div>
        </div>
      </section>

      {/* ===================== */}
      {/* 3. WHY CHOOSE STAYEG  */}
      {/* ===================== */}
      <section className="py-12 md:py-16 bg-muted/40">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <SectionHeading
            badge="Why StayEg"
            title="The StayEg"
            highlight="Advantage"
            description="Everything you need for a perfect PG living experience."
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { icon: Shield, title: 'Verified Properties', desc: 'Every PG is personally verified. Photos, amenities, and prices are 100% accurate.', color: 'bg-emerald-50 text-emerald-600' },
              { icon: Banknote, title: 'Zero Brokerage', desc: 'No middlemen, no hidden charges. Find and book directly.', color: 'bg-primary/10 text-primary' },
              { icon: Smartphone, title: 'Smart Management', desc: 'PG Owners: Manage rent, staff, complaints, and analytics from your phone.', color: 'bg-blue-50 text-blue-600' },
              { icon: UsersRound, title: 'Community', desc: 'Join local communities, find roommates, attend events.', color: 'bg-violet-50 text-violet-600' },
              { icon: Lock, title: 'Secure Payments', desc: 'All payments encrypted. Track every transaction.', color: 'bg-amber-50 text-amber-600' },
              { icon: Headphones, title: '24/7 Support', desc: 'Our team is available round the clock via chat, call, or email.', color: 'bg-rose-50 text-rose-600' },
            ].map((item, idx) => (
              <FadeInSection key={item.title} delay={idx * 0.05}>
                <Card className="border border-border shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all bg-card">
                  <CardContent className="p-5">
                    <div className={`size-10 rounded-lg ${item.color} flex items-center justify-center mb-3`}>
                      <item.icon className="size-5" />
                    </div>
                    <h3 className="text-sm font-bold text-foreground mb-1">{item.title}</h3>
                    <p className="text-muted-foreground text-xs leading-relaxed">{item.desc}</p>
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
      <section className="py-12 md:py-16 bg-background">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <FadeInSection>
            <div className="rounded-2xl bg-foreground p-8 md:p-12">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
                <div>
                  <Badge className="mb-4 bg-primary/20 text-primary border-primary/30">
                    <Sparkles className="size-3" />
                    For PG Owners
                  </Badge>
                  <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3 leading-snug">
                    The Future of PG Management is{' '}
                    <span className="text-primary">Here</span>
                  </h2>
                  <p className="text-gray-400 mb-6 text-sm">
                    Transform how you run your PG business with our all-in-one digital platform.
                  </p>

                  <ul className="space-y-3 mb-8">
                    {[
                      'Manage everything from your phone',
                      'Automatic rent collection & reminders',
                      'Staff attendance & task management',
                      'Real-time analytics & occupancy tracking',
                    ].map((item) => (
                      <li key={item} className="flex items-center gap-2.5">
                        <CheckCircle2 className="size-4 text-primary shrink-0" />
                        <span className="text-gray-300 text-sm">{item}</span>
                      </li>
                    ))}
                  </ul>

                  <div className="inline-flex items-center gap-2 bg-white/10 border border-white/15 rounded-lg px-3 py-1.5 mb-5">
                    <Sparkles className="size-4 text-amber-400" />
                    <span className="text-white text-xs font-semibold">First 1000 Owners Get 1 Year FREE!</span>
                  </div>

                  <Button
                    onClick={() => setCurrentView('PRICING')}
                    className="bg-primary hover:bg-primary/90 text-white rounded-lg px-6 h-10 text-sm font-medium"
                  >
                    Start Free Trial
                    <ArrowRight className="size-4 ml-1.5" />
                  </Button>
                </div>

                {/* Feature cards */}
                <div className="hidden lg:grid grid-cols-2 gap-3">
                  {[
                    { icon: Smartphone, label: 'Mobile First', value: 'Manage on the go' },
                    { icon: Banknote, label: 'Rent Tracking', value: 'Auto collection' },
                    { icon: Users, label: 'Staff Management', value: 'Attendance & tasks' },
                    { icon: Star, label: 'Analytics', value: 'Real-time insights' },
                  ].map((item) => (
                    <div key={item.label} className="bg-white/5 border border-white/10 rounded-xl p-4">
                      <item.icon className="size-6 text-primary mb-2" />
                      <h4 className="text-white font-semibold text-sm mb-0.5">{item.label}</h4>
                      <p className="text-gray-400 text-xs">{item.value}</p>
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
      <section className="py-12 md:py-16 bg-muted/40">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <FadeInSection>
            <div className="rounded-2xl overflow-hidden border border-border bg-card shadow-sm">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-0">
                <div className="bg-primary p-8 md:p-10 flex flex-col justify-center min-h-[240px]">
                  <Badge className="mb-4 bg-white/20 text-white border-white/30 self-start">
                    For Service Providers
                  </Badge>
                  <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2 leading-snug">
                    Grow Your Service Business
                  </h2>
                  <p className="text-white/80 text-sm">
                    Join India&apos;s largest PG service network.
                  </p>
                </div>

                <div className="p-8 md:p-10">
                  <ul className="space-y-4 mb-6">
                    {[
                      { icon: UsersRound, title: 'Verified Leads', desc: 'Genuine service requests from verified PG owners.' },
                      { icon: Building2, title: 'Manage Bookings', desc: 'Track bookings, set availability, manage schedule.' },
                      { icon: Star, title: 'Build Reputation', desc: 'Earn ratings & reviews. Higher ratings = more business.' },
                    ].map((item) => (
                      <li key={item.title} className="flex items-start gap-3">
                        <div className="size-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                          <item.icon className="size-4 text-primary" />
                        </div>
                        <div>
                          <h4 className="font-semibold text-foreground text-sm mb-0.5">{item.title}</h4>
                          <p className="text-muted-foreground text-xs">{item.desc}</p>
                        </div>
                      </li>
                    ))}
                  </ul>

                  <Button
                    onClick={() => setCurrentView('SIGNUP')}
                    variant="outline"
                    className="border-primary/30 text-primary hover:bg-primary/5 rounded-lg px-5 h-9 text-sm"
                  >
                    Register as Vendor
                    <ArrowRight className="size-3.5 ml-1.5" />
                  </Button>
                </div>
              </div>
            </div>
          </FadeInSection>
        </div>
      </section>

      {/* ===================== */}
      {/* 6. STATS              */}
      {/* ===================== */}
      <section className="py-12 md:py-14 bg-background">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <FadeInSection>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-5">
              {[
                { icon: Building2, value: '10,000+', label: 'Verified PGs', color: 'bg-primary/10 text-primary' },
                { icon: Users, value: '50,000+', label: 'Happy Tenants', color: 'bg-emerald-50 text-emerald-600' },
                { icon: MapPin, value: '20+', label: 'Cities', color: 'bg-blue-50 text-blue-600' },
                { icon: Star, value: '4.5+', label: 'Avg Rating', color: 'bg-amber-50 text-amber-600' },
              ].map((stat, index) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 15 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.3, delay: index * 0.08 }}
                  className="bg-muted/50 rounded-xl p-4 md:p-5 text-center border border-border"
                >
                  <div className={`size-10 rounded-xl ${stat.color} flex items-center justify-center mx-auto mb-2`}>
                    <stat.icon className="size-5" />
                  </div>
                  <div className="text-xl sm:text-2xl font-bold text-foreground mb-0.5">
                    <AnimatedCounter target={stat.value} />
                  </div>
                  <div className="text-xs text-muted-foreground">{stat.label}</div>
                </motion.div>
              ))}
            </div>
          </FadeInSection>
        </div>
      </section>

      {/* ===================== */}
      {/* 7. TRUST BADGES       */}
      {/* ===================== */}
      <section className="py-8 bg-muted/40 border-y border-border">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <FadeInSection>
            <div className="flex flex-wrap justify-center gap-6 md:gap-12">
              {[
                { icon: Shield, label: 'Verified Properties', desc: 'Personally inspected', color: 'bg-emerald-50 text-emerald-600' },
                { icon: Banknote, label: 'Zero Brokerage', desc: 'No hidden charges', color: 'bg-primary/10 text-primary' },
                { icon: Lock, label: 'Secure Payments', desc: '256-bit encrypted', color: 'bg-blue-50 text-blue-600' },
              ].map((item) => (
                <div key={item.label} className="flex items-center gap-2.5">
                  <div className={`size-10 rounded-lg ${item.color} flex items-center justify-center`}>
                    <item.icon className="size-5" />
                  </div>
                  <div>
                    <div className="font-semibold text-foreground text-xs">{item.label}</div>
                    <div className="text-[11px] text-muted-foreground">{item.desc}</div>
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
      <section className="py-12 md:py-16 bg-background">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <SectionHeading
            badge="Testimonials"
            title="What Our Users"
            highlight="Say"
            description="Real stories from real people who found their perfect PG home."
          />

          <FadeInSection>
            <div className="relative">
              <div className="hidden md:grid md:grid-cols-3 gap-4">
                {testimonials.map((t, idx) => (
                  <TestimonialCard key={idx} testimonial={t} />
                ))}
              </div>

              <div className="md:hidden">
                <div className="overflow-hidden">
                  <motion.div
                    className="flex"
                    animate={{ x: `-${testimonialIdx * 100}%` }}
                    transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                  >
                    {testimonials.map((t, idx) => (
                      <div key={idx} className="w-full shrink-0 px-1">
                        <TestimonialCard testimonial={t} />
                      </div>
                    ))}
                  </motion.div>
                </div>

                <div className="flex items-center justify-center gap-3 mt-4">
                  <button onClick={() => setTestimonialIdx((prev) => Math.max(0, prev - 1))} disabled={testimonialIdx === 0}
                    className="size-8 rounded-full bg-muted text-muted-foreground flex items-center justify-center disabled:opacity-30 hover:bg-primary/10 hover:text-primary transition-colors">
                    <ChevronLeft className="size-4" />
                  </button>
                  <div className="flex gap-1.5">
                    {testimonials.map((_, idx) => (
                      <button key={idx} onClick={() => setTestimonialIdx(idx)}
                        className={`h-1.5 rounded-full transition-all ${idx === testimonialIdx ? 'w-6 bg-primary' : 'w-1.5 bg-border'}`} />
                    ))}
                  </div>
                  <button onClick={() => setTestimonialIdx((prev) => Math.min(testimonials.length - 1, prev + 1))} disabled={testimonialIdx === testimonials.length - 1}
                    className="size-8 rounded-full bg-muted text-muted-foreground flex items-center justify-center disabled:opacity-30 hover:bg-primary/10 hover:text-primary transition-colors">
                    <ChevronRight className="size-4" />
                  </button>
                </div>
              </div>
            </div>
          </FadeInSection>
        </div>
      </section>

      {/* ===================== */}
      {/* 9. CTA               */}
      {/* ===================== */}
      <section className="py-12 md:py-16 bg-primary">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 text-center">
          <FadeInSection>
            <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3">
              Ready to Find Your PG Home?
            </h2>
            <p className="text-white/80 text-sm mb-6 max-w-lg mx-auto">
              Join 50,000+ tenants who found their perfect accommodation. Free, fast, and reliable.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-4">
              <Button onClick={() => setCurrentView('PG_LISTING')}
                className="bg-white text-primary hover:bg-muted rounded-lg px-6 h-10 text-sm font-semibold">
                <Search className="size-4 mr-1.5" />
                Find PG Now
              </Button>
              <Button onClick={() => setCurrentView('PRICING')}
                variant="outline"
                className="border-2 border-white/40 text-white hover:bg-white/10 rounded-lg px-6 h-10 text-sm font-semibold bg-transparent">
                <Building2 className="size-4 mr-1.5" />
                List Your PG
              </Button>
            </div>

            <div className="inline-flex items-center gap-1.5 text-white/90 text-xs">
              <CheckCircle2 className="size-3.5" />
              100% Free for Tenants
            </div>
          </FadeInSection>
        </div>
      </section>

      {/* ===================== */}
      {/* 10. CITIES            */}
      {/* ===================== */}
      <section className="py-12 md:py-16 bg-muted/40">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <SectionHeading
            badge="Our Presence"
            title="Cities We're"
            highlight="In"
            description="Click on your city to find PGs near you."
          />

          <FadeInSection>
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2.5 max-w-3xl mx-auto">
              {CITIES.map((city, idx) => (
                <motion.button
                  key={city}
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.2, delay: idx * 0.03 }}
                  whileHover={{ y: -1 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleCityClick(city)}
                  className="group bg-card rounded-xl border border-border p-3 text-center hover:border-primary/30 hover:shadow-sm transition-all cursor-pointer"
                >
                  <MapPin className="size-4 text-primary mx-auto mb-1.5" />
                  <div className="font-medium text-foreground text-xs">{city}</div>
                </motion.button>
              ))}
            </div>
          </FadeInSection>
        </div>
      </section>
    </div>
  );
}

// ============================
// Testimonials
// ============================
const testimonials = [
  { name: 'Priya Sharma', role: 'Software Engineer, Bangalore', avatar: 'https://api.dicebear.com/9.x/avataaars/svg?seed=Priya', quote: 'StayEg made my move to Bangalore so easy! Found a verified PG near my office in just 2 days.', rating: 5 },
  { name: 'Arjun Patel', role: 'MBA Student, Delhi', avatar: 'https://api.dicebear.com/9.x/avataaars/svg?seed=Arjun', quote: 'Zero brokerage was a game-changer. The PG I found is clean, affordable, and near my college.', rating: 5 },
  { name: 'Meera Krishnan', role: 'Content Writer, Pune', avatar: 'https://api.dicebear.com/9.x/avataaars/svg?seed=Meera', quote: 'The community connected me with so many people. Now I have friends and a lovely PG home!', rating: 4 },
];

function TestimonialCard({ testimonial: { name, role, avatar, quote, rating } }: {
  testimonial: typeof testimonials[0];
}) {
  return (
    <Card className="border border-border shadow-sm bg-card">
      <CardContent className="p-5">
        <div className="flex gap-0.5 mb-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <Star key={i} className={`size-3.5 ${i < rating ? 'text-amber-400 fill-amber-400' : 'text-gray-200'}`} />
          ))}
        </div>
        <p className="text-muted-foreground text-sm leading-relaxed mb-4">&ldquo;{quote}&rdquo;</p>
        <div className="flex items-center gap-2.5 pt-3 border-t border-border">
          <img src={avatar} alt={name} className="size-8 rounded-full bg-muted" />
          <div>
            <div className="font-semibold text-foreground text-xs">{name}</div>
            <div className="text-muted-foreground text-[11px]">{role}</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
