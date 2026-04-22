'use client';

import { useEffect, useRef, useState } from 'react';
import { motion, useInView } from 'framer-motion';
import {
  ArrowLeft,
  Shield,
  Eye,
  Target,
  Heart,
  IndianRupee,
  Smartphone,
  Users,
  ShieldCheck,
  Star,
  Award,
  Trophy,
  ThumbsUp,
  Globe,
  Clock,
  Mail,
  Phone,
  MapPin,
  Twitter,
  Linkedin,
  Instagram,
  ExternalLink,
  Rocket,
  Sparkles,
  Layers,
  Building,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAppStore } from '@/store/use-app-store';

/* ------------------------------------------------------------------ */
/*  Animation helpers                                                  */
/* ------------------------------------------------------------------ */
function FadeIn({
  children,
  delay = 0,
  className = '',
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: '-40px' });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 24 }}
      animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 24 }}
      transition={{ duration: 0.5, delay, ease: 'easeOut' }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

function StaggerContainer({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: '-40px' });
  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={inView ? 'show' : 'hidden'}
      variants={{
        hidden: {},
        show: { transition: { staggerChildren: 0.08 } },
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

function StaggerItem({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, y: 20 },
        show: { opacity: 1, y: 0, transition: { duration: 0.45, ease: 'easeOut' } },
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/* ------------------------------------------------------------------ */
/*  Animated counter                                                   */
/* ------------------------------------------------------------------ */
function AnimatedCounter({ target, suffix = '', prefix = '', duration = 2000 }: { target: number; suffix?: string; prefix?: string; duration?: number }) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: '-20px' });
  const hasAnimated = useRef(false);

  useEffect(() => {
    if (!inView || hasAnimated.current) return;
    hasAnimated.current = true;

    const startTime = performance.now();
    const step = (now: number) => {
      const progress = Math.min((now - startTime) / duration, 1);
      // Ease-out quad
      const eased = 1 - (1 - progress) * (1 - progress);
      setCount(Math.floor(eased * target));
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [inView, target, duration]);

  return (
    <span ref={ref}>
      {prefix}
      {count.toLocaleString('en-IN')}
      {suffix}
    </span>
  );
}

/* ------------------------------------------------------------------ */
/*  Data                                                               */
/* ------------------------------------------------------------------ */

const VALUES = [
  {
    icon: ShieldCheck,
    title: 'Trust & Transparency',
    description: 'Every PG is verified in person. Listings reflect reality, not marketing spin. We publish genuine reviews and real photos.',
  },
  {
    icon: IndianRupee,
    title: 'Zero Brokerage',
    description: 'Tenants pay nothing to search or book. Owners pay a single transparent platform fee. No hidden charges, ever.',
  },
  {
    icon: Heart,
    title: 'Tenant First',
    description: 'Every feature, from instant complaints to secure payments, is designed around the tenant experience and safety.',
  },
  {
    icon: Smartphone,
    title: 'Technology Driven',
    description: 'AI-powered recommendations, digital KYC, automated rent reminders, and smart matching between tenants and PGs.',
  },
  {
    icon: Users,
    title: 'Community Building',
    description: 'In-app community groups, events, and forums help tenants feel at home and build lasting connections.',
  },
  {
    icon: Shield,
    title: 'Safety & Security',
    description: 'Aadhaar/PAN verification, 24/7 emergency helpline, verified vendors, and a rigorous PG safety audit protocol.',
  },
];

const STATS = [
  { label: 'Verified PGs', value: 10000, suffix: '+', icon: Building },
  { label: 'Happy Tenants', value: 50000, suffix: '+', icon: Users },
  { label: 'Cities Covered', value: 20, suffix: '+', icon: Globe },
  { label: 'Avg Rating', value: 4.5, suffix: '/5', icon: Star },
];

const TEAM = [
  {
    name: 'Rahul Sharma',
    role: 'CEO & Founder',
    bio: 'Former McKinsey consultant turned entrepreneur. Rahul founded StayEg after struggling to find a reliable PG during his own relocation to Bangalore. He holds an MBA from IIM Ahmedabad.',
    seed: 'rahul-sharma',
  },
  {
    name: 'Priya Patel',
    role: 'Chief Technology Officer',
    bio: 'Full-stack engineer with 12 years of experience at Microsoft and Flipkart. Priya architected StayEg\'s AI recommendation engine and real-time booking platform from the ground up.',
    seed: 'priya-patel',
  },
  {
    name: 'Arjun Reddy',
    role: 'Head of Operations',
    bio: 'Operations veteran who scaled Swiggy\'s city expansion to 30+ locations. Arjun leads StayEg\'s on-ground PG verification, vendor network, and tenant support teams across India.',
    seed: 'arjun-reddy',
  },
  {
    name: 'Meera Krishnan',
    role: 'Head of Design',
    bio: 'Award-winning UX designer formerly at Google and Razorpay. Meera crafted StayEg\'s user experience to make PG discovery feel effortless, even on a first visit.',
    seed: 'meera-krishnan',
  },
];

const CHANGELOG = [
  {
    version: 'v2.0',
    date: 'January 2025',
    title: 'Complete UI Redesign',
    description: 'Premium blue and gold theme with full dark mode support. Introduced AI-powered assistant for instant tenant queries, enhanced accessibility, and responsive mobile-first layout.',
    icon: Sparkles,
  },
  {
    version: 'v1.5',
    date: 'December 2024',
    title: 'Community & Vendor Platform',
    description: 'Launched in-app community groups and forums for tenants. Added vendor management with service tracking, staff management with shift scheduling, and complaint escalation workflows.',
    icon: Layers,
  },
  {
    version: 'v1.0',
    date: 'November 2024',
    title: 'Initial Platform Launch',
    description: 'Core PG booking engine with verified listings, secure online payments, multi-bed room configurations, complaint management, and real-time availability tracking.',
    icon: Rocket,
  },
];

const AWARDS = [
  { title: 'Top 10 Startup 2025', subtitle: 'YourStory India', icon: Trophy },
  { title: 'Most Trusted PG Platform', subtitle: 'Consumer Choice Awards', icon: Award },
  { title: '10K+ PG Partners', subtitle: 'Verified & Active', icon: ThumbsUp },
];

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */
export default function AboutPage() {
  const { setCurrentView } = useAppStore();

  return (
    <div className="min-h-screen bg-background">
      {/* ============================================================ */}
      {/*  1. Header                                                    */}
      {/* ============================================================ */}
      <section className="bg-gradient-to-br from-muted to-background border-b pt-8 pb-6">
        <div className="max-w-5xl mx-auto px-4">
          <button
            onClick={() => setCurrentView('LANDING')}
            className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-brand-teal transition-colors mb-4"
          >
            <ArrowLeft className="size-4" />
            Back to Home
          </button>

          <div className="flex items-center gap-3 mb-2">
            <div className="size-10 rounded-xl bg-brand-teal/15 flex items-center justify-center">
              <Shield className="size-5 text-brand-teal" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-foreground">About StayEg</h1>
              <p className="text-sm text-muted-foreground">India&apos;s smartest PG ecosystem</p>
            </div>
          </div>

          <Badge variant="outline" className="mt-2 text-xs text-muted-foreground border-gold/20 shadow-gold-sm">
            Est. 2024
          </Badge>
        </div>
      </section>

      {/* ============================================================ */}
      {/*  2. Our Story                                                 */}
      {/* ============================================================ */}
      <section className="max-w-5xl mx-auto px-4 pt-10 pb-8">
        <FadeIn>
          <div className="flex items-center gap-2 mb-4">
            <div className="size-8 rounded-lg bg-brand-deep-light flex items-center justify-center">
              <Building className="size-4 text-brand-teal" />
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-foreground">Our Story</h2>
          </div>
        </FadeIn>

        <FadeIn delay={0.1}>
          <div className="space-y-4 text-sm text-muted-foreground leading-relaxed max-w-3xl">
            <p>
              StayEg was born from a frustration shared by millions of Indians every year: finding a trustworthy, affordable PG in an unfamiliar city should not feel like navigating a maze blindfolded. In 2024, our founder Rahul Sharma relocated to Bangalore for work and spent weeks dealing with unverified brokers, misleading photos, and opaque rental agreements. That experience became the catalyst for building a platform that puts transparency and tenant welfare at the centre of the PG ecosystem.
            </p>
            <p>
              What started as a small directory of verified accommodations in Bangalore has rapidly grown into a comprehensive PG management platform covering over 20 cities across India. We combine rigorous on-ground property verification with intelligent technology to ensure that every listing on StayEg reflects reality. From high-speed Wi-Fi and clean rooms to safety audits and genuine tenant reviews, we leave nothing to chance.
            </p>
            <p>
              Today, StayEg is more than a listing platform. We are a full-stack ecosystem that connects tenants, PG owners, and local service vendors through a single, unified interface. Our AI-powered assistant guides tenants through every step of their PG journey, from discovery and booking to rent payments and community engagement. We believe everyone deserves a safe, comfortable, and affordable home, regardless of the city they move to.
            </p>
          </div>
        </FadeIn>
      </section>

      <Separator className="max-w-5xl mx-auto" />

      {/* ============================================================ */}
      {/*  3. Mission & Vision                                         */}
      {/* ============================================================ */}
      <section className="max-w-5xl mx-auto px-4 py-10">
        <FadeIn>
          <h2 className="text-xl sm:text-2xl font-bold text-foreground mb-6">Mission &amp; Vision</h2>
        </FadeIn>

        <div className="grid sm:grid-cols-2 gap-4 sm:gap-6">
          <FadeIn delay={0.1}>
            <Card className="border-brand-teal/20 shadow-gold-sm h-full">
              <CardContent className="p-6">
                <div className="size-10 rounded-xl bg-brand-teal/15 flex items-center justify-center mb-4">
                  <Target className="size-5 text-brand-teal" />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">Our Mission</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  To democratise PG living in India by eliminating information asymmetry between tenants and property owners. We strive to make the process of finding, booking, and living in a PG as transparent and effortless as booking a hotel, while ensuring that every listing is verified, every payment is secure, and every tenant has a voice.
                </p>
              </CardContent>
            </Card>
          </FadeIn>

          <FadeIn delay={0.2}>
            <Card className="border-brand-deep/20 h-full">
              <CardContent className="p-6">
                <div className="size-10 rounded-xl bg-brand-deep-light flex items-center justify-center mb-4">
                  <Eye className="size-5 text-brand-teal" />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">Our Vision</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  To become India&apos;s largest and most trusted PG ecosystem, covering every city and town where students and working professionals seek accommodation. We envision a future where no one has to compromise on safety, quality, or fairness when searching for a place to call home.
                </p>
              </CardContent>
            </Card>
          </FadeIn>
        </div>
      </section>

      <Separator className="max-w-5xl mx-auto" />

      {/* ============================================================ */}
      {/*  4. Our Values                                                */}
      {/* ============================================================ */}
      <section className="max-w-5xl mx-auto px-4 py-10">
        <FadeIn>
          <h2 className="text-xl sm:text-2xl font-bold text-foreground mb-6">Our Values</h2>
        </FadeIn>

        <StaggerContainer className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {VALUES.map((v) => {
            const Icon = v.icon;
            return (
              <StaggerItem key={v.title}>
                <Card className="border-border hover:border-brand-teal/30 transition-colors h-full">
                  <CardContent className="p-5">
                    <div className="size-9 rounded-lg bg-brand-teal/15 flex items-center justify-center mb-3">
                      <Icon className="size-4 text-brand-teal" />
                    </div>
                    <h3 className="text-sm font-semibold text-foreground mb-1.5">{v.title}</h3>
                    <p className="text-xs text-muted-foreground leading-relaxed">{v.description}</p>
                  </CardContent>
                </Card>
              </StaggerItem>
            );
          })}
        </StaggerContainer>
      </section>

      <Separator className="max-w-5xl mx-auto" />

      {/* ============================================================ */}
      {/*  5. Key Stats                                                 */}
      {/* ============================================================ */}
      <section className="max-w-5xl mx-auto px-4 py-10">
        <FadeIn>
          <h2 className="text-xl sm:text-2xl font-bold text-foreground mb-6 text-center">StayEg in Numbers</h2>
        </FadeIn>

        <StaggerContainer className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {STATS.map((s) => {
            const Icon = s.icon;
            return (
              <StaggerItem key={s.label}>
                <Card className="border-gold/20 shadow-gold-sm text-center">
                  <CardContent className="p-5 flex flex-col items-center gap-2">
                    <div className="size-10 rounded-full bg-brand-teal/15 flex items-center justify-center">
                      <Icon className="size-5 text-brand-teal" />
                    </div>
                    <div className="text-2xl sm:text-3xl font-bold text-foreground">
                      <AnimatedCounter target={s.value} suffix={s.suffix} />
                    </div>
                    <p className="text-xs text-muted-foreground font-medium">{s.label}</p>
                  </CardContent>
                </Card>
              </StaggerItem>
            );
          })}
        </StaggerContainer>
      </section>

      <Separator className="max-w-5xl mx-auto" />

      {/* ============================================================ */}
      {/*  6. Our Team                                                  */}
      {/* ============================================================ */}
      <section className="max-w-5xl mx-auto px-4 py-10">
        <FadeIn>
          <h2 className="text-xl sm:text-2xl font-bold text-foreground mb-2 text-center">Meet Our Team</h2>
          <p className="text-sm text-muted-foreground mb-8 text-center max-w-xl mx-auto">
            The people behind India&apos;s fastest-growing PG platform bring decades of combined experience in technology, operations, and design.
          </p>
        </FadeIn>

        <StaggerContainer className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {TEAM.map((member) => (
            <StaggerItem key={member.name}>
              <Card className="border-border hover:border-brand-teal/30 transition-colors text-center h-full">
                <CardContent className="p-6 flex flex-col items-center">
                  <Avatar className="size-20 mb-4 ring-2 ring-brand-teal/20 ring-offset-2 ring-offset-background">
                    <AvatarImage
                      src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${member.seed}`}
                      alt={member.name}
                    />
                    <AvatarFallback className="bg-gradient-to-br from-brand-teal to-brand-deep text-white text-sm font-semibold">
                      {member.name.split(' ').map((n) => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <h3 className="text-sm font-semibold text-foreground">{member.name}</h3>
                  <Badge variant="secondary" className="mt-1 mb-3 text-[11px] bg-brand-teal/10 text-brand-teal border-0">
                    {member.role}
                  </Badge>
                  <p className="text-xs text-muted-foreground leading-relaxed">{member.bio}</p>
                </CardContent>
              </Card>
            </StaggerItem>
          ))}
        </StaggerContainer>
      </section>

      <Separator className="max-w-5xl mx-auto" />

      {/* ============================================================ */}
      {/*  7. Platform Updates / Changelog                              */}
      {/* ============================================================ */}
      <section className="max-w-5xl mx-auto px-4 py-10">
        <FadeIn>
          <h2 className="text-xl sm:text-2xl font-bold text-foreground mb-2">Platform Updates</h2>
          <p className="text-sm text-muted-foreground mb-8">A timeline of how StayEg has evolved since launch.</p>
        </FadeIn>

        <div className="relative ml-4 sm:ml-6 border-l-2 border-brand-teal/20 space-y-8">
          {CHANGELOG.map((entry, i) => {
            const Icon = entry.icon;
            return (
              <FadeIn key={entry.version} delay={i * 0.1}>
                <div className="relative pl-6 sm:pl-8">
                  {/* Dot */}
                  <div className="absolute -left-[calc(0.5rem+1px)] sm:-left-[calc(0.75rem+1px)] top-1 size-3 rounded-full bg-brand-teal ring-4 ring-background" />

                  <Card className="border-border hover:border-brand-teal/20 transition-colors">
                    <CardContent className="p-5">
                      <div className="flex flex-wrap items-center gap-2 mb-2">
                        <div className="size-8 rounded-lg bg-brand-teal/15 flex items-center justify-center">
                          <Icon className="size-4 text-brand-teal" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="text-sm font-semibold text-foreground">{entry.title}</h3>
                            <Badge variant="outline" className="text-[10px] text-muted-foreground border-brand-teal/20">
                              {entry.version}
                            </Badge>
                          </div>
                          <p className="text-[11px] text-muted-foreground flex items-center gap-1 mt-0.5">
                            <Clock className="size-3" />
                            {entry.date}
                          </p>
                        </div>
                      </div>
                      <p className="text-xs text-muted-foreground leading-relaxed">{entry.description}</p>
                    </CardContent>
                  </Card>
                </div>
              </FadeIn>
            );
          })}
        </div>
      </section>

      <Separator className="max-w-5xl mx-auto" />

      {/* ============================================================ */}
      {/*  8. Awards & Recognition                                      */}
      {/* ============================================================ */}
      <section className="max-w-5xl mx-auto px-4 py-10">
        <FadeIn>
          <h2 className="text-xl sm:text-2xl font-bold text-foreground mb-6 text-center">Awards &amp; Recognition</h2>
        </FadeIn>

        <StaggerContainer className="flex flex-wrap justify-center gap-4">
          {AWARDS.map((award) => {
            const Icon = award.icon;
            return (
              <StaggerItem key={award.title}>
                <Card className="border-gold/20 shadow-gold-sm hover:shadow-gold transition-shadow">
                  <CardContent className="p-5 flex items-center gap-4">
                    <div className="size-12 rounded-xl bg-brand-sage/15 flex items-center justify-center shrink-0">
                      <Icon className="size-6 text-brand-sage" />
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-foreground">{award.title}</h3>
                      <p className="text-xs text-muted-foreground">{award.subtitle}</p>
                    </div>
                  </CardContent>
                </Card>
              </StaggerItem>
            );
          })}
        </StaggerContainer>
      </section>

      <Separator className="max-w-5xl mx-auto" />

      {/* ============================================================ */}
      {/*  9. Contact                                                   */}
      {/* ============================================================ */}
      <section className="max-w-5xl mx-auto px-4 py-10 pb-16">
        <FadeIn>
          <h2 className="text-xl sm:text-2xl font-bold text-foreground mb-6 text-center">Get in Touch</h2>
        </FadeIn>

        <FadeIn delay={0.1}>
          <Card className="border-gold/20 shadow-gold-sm max-w-lg mx-auto">
            <CardContent className="p-6 space-y-4">
              {/* Email */}
              <div className="flex items-start gap-3">
                <div className="size-9 rounded-lg bg-brand-teal/15 flex items-center justify-center shrink-0">
                  <Mail className="size-4 text-brand-teal" />
                </div>
                <div>
                  <p className="text-xs font-medium text-muted-foreground mb-0.5">Email</p>
                  <p className="text-sm text-foreground">hello@stayeg.in</p>
                </div>
              </div>

              <Separator />

              {/* Phone */}
              <div className="flex items-start gap-3">
                <div className="size-9 rounded-lg bg-brand-teal/15 flex items-center justify-center shrink-0">
                  <Phone className="size-4 text-brand-teal" />
                </div>
                <div>
                  <p className="text-xs font-medium text-muted-foreground mb-0.5">Phone</p>
                  <p className="text-sm text-foreground">+91 80-4567-8900</p>
                </div>
              </div>

              <Separator />

              {/* Address */}
              <div className="flex items-start gap-3">
                <div className="size-9 rounded-lg bg-brand-teal/15 flex items-center justify-center shrink-0">
                  <MapPin className="size-4 text-brand-teal" />
                </div>
                <div>
                  <p className="text-xs font-medium text-muted-foreground mb-0.5">Office</p>
                  <p className="text-sm text-foreground">
                    StayEg Technologies Private Limited<br />
                    3rd Floor, Innovation Hub<br />
                    Koramangala, Bangalore 560034<br />
                    Karnataka, India
                  </p>
                </div>
              </div>

              <Separator />

              {/* Social links */}
              <div>
                <p className="text-xs font-medium text-muted-foreground mb-2">Follow Us</p>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="icon" className="size-9 border-border hover:border-brand-teal/30 hover:bg-brand-teal/10">
                    <Twitter className="size-4 text-muted-foreground" />
                  </Button>
                  <Button variant="outline" size="icon" className="size-9 border-border hover:border-brand-teal/30 hover:bg-brand-teal/10">
                    <Linkedin className="size-4 text-muted-foreground" />
                  </Button>
                  <Button variant="outline" size="icon" className="size-9 border-border hover:border-brand-teal/30 hover:bg-brand-teal/10">
                    <Instagram className="size-4 text-muted-foreground" />
                  </Button>
                  <Button variant="outline" size="icon" className="size-9 border-border hover:border-brand-teal/30 hover:bg-brand-teal/10">
                    <ExternalLink className="size-4 text-muted-foreground" />
                  </Button>
                </div>
              </div>

              {/* Business hours */}
              <div className="pt-2">
                <p className="text-[11px] text-muted-foreground text-center">
                  Business Hours: Monday to Saturday, 9:00 AM - 6:00 PM IST
                </p>
              </div>
            </CardContent>
          </Card>
        </FadeIn>
      </section>

      {/* Mobile bottom spacing */}
      <div className="h-16 md:hidden" />
    </div>
  );
}
