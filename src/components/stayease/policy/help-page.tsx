'use client';

import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import {
  ArrowLeft,
  HelpCircle,
  Search,
  MessageSquare,
  AlertTriangle,
  BookOpen,
  UserPlus,
  Users,
  Building2,
  Wrench,
  ShieldCheck,
  CreditCard,
  FileText,
  Lock,
  ChevronRight,
  Mail,
  Phone,
  Headphones,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from '@/components/ui/accordion';
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

function StaggerContainer({
  children,
  className = '',
}: {
  children: React.ReactNode;
  className?: string;
}) {
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

function StaggerItem({
  children,
  className = '',
}: {
  children: React.ReactNode;
  className?: string;
}) {
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
/*  Data                                                               */
/* ------------------------------------------------------------------ */

const QUICK_ACTIONS = [
  {
    icon: Search,
    title: 'Browse PGs',
    description: 'Explore verified PG listings across 20+ cities in India.',
    action: 'PG_LISTING' as const,
    color: 'bg-brand-teal/15 text-brand-teal',
    hoverBorder: 'hover:border-brand-teal/30',
  },
  {
    icon: MessageSquare,
    title: 'Contact Support',
    description: 'Get in touch with our team for assistance.',
    action: 'SUPPORT_TOAST' as const,
    color: 'bg-brand-deep-light text-brand-deep',
    hoverBorder: 'hover:border-brand-deep/30',
  },
  {
    icon: AlertTriangle,
    title: 'Report an Issue',
    description: 'Flag safety concerns, fraudulent activity, or bugs.',
    action: 'SAFE_USE' as const,
    color: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300',
    hoverBorder: 'hover:border-red-200',
  },
  {
    icon: BookOpen,
    title: 'Read Guidelines',
    description: 'Learn about safety tips and platform best practices.',
    action: 'SAFE_USE' as const,
    color: 'bg-brand-sage/15 text-brand-sage',
    hoverBorder: 'hover:border-brand-sage/30',
  },
];

const GETTING_STARTED_STEPS = [
  {
    step: 1,
    icon: UserPlus,
    title: 'Create Your Account',
    description:
      'Sign up with your email or phone number and complete a quick profile setup. Choose your role as Tenant, PG Owner, or Vendor so the platform can tailor the experience to your needs. Login securely with OTP or password anytime.',
    color: 'bg-brand-teal/15 text-brand-teal',
    accent: 'text-brand-teal',
  },
  {
    step: 2,
    icon: Users,
    title: 'For Tenants',
    description:
      'Search for PGs by city, locality, gender preference, budget, and amenities. View detailed listings with real photos, verified reviews, and transparent pricing. Select a bed, book instantly, and pay securely through the platform. Track bookings and raise complaints if needed.',
    color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
    accent: 'text-blue-600 dark:text-blue-400',
  },
  {
    step: 3,
    icon: Building2,
    title: 'For PG Owners',
    description:
      'List your PG property with room configurations, bed types, amenities, and pricing. Add rooms and beds, manage tenant check-ins, track rent collection with automated reminders, and monitor occupancy analytics. Register vendors and staff to streamline operations.',
    color: 'bg-brand-sage/15 text-brand-sage',
    accent: 'text-brand-sage',
  },
  {
    step: 4,
    icon: Wrench,
    title: 'For Vendors',
    description:
      'Register as a service provider (plumber, electrician, cleaner, or more) to get leads from PG owners in your area. List your services, set availability, receive job requests, and build a reputation through reviews and ratings.',
    color: 'bg-brand-deep-light text-brand-deep',
    accent: 'text-brand-deep',
  },
];

const TENANT_FAQ = [
  {
    question: 'How do I find a PG on StayEg?',
    answer:
      'Use the search bar on the homepage or navigate to the PG Listing page. Filter results by city, locality, gender preference (Male, Female, Unisex), price range, amenities, and rating. Click on any PG card to view full details including photos, room configurations, verified reviews, and pricing.',
  },
  {
    question: 'How do I book a room?',
    answer:
      'Once you find a suitable PG, click "Book Now" on the detail page. Select a bed from the available options, upload a profile photo, fill in your personal details, and proceed to payment. You can apply a coupon code for discounts. After successful payment, your booking is confirmed and visible in "My Bookings."',
  },
  {
    question: 'What payment methods are accepted?',
    answer:
      'StayEg supports multiple payment methods including UPI (Google Pay, PhonePe, Paytm), credit/debit cards, net banking, and wallets. All transactions are processed through secure, PCI-DSS compliant payment gateways. You can save payment methods for faster future payments.',
  },
  {
    question: 'How do I file a complaint?',
    answer:
      'Go to the "My Bookings" section and select the relevant booking. Click on "Raise Complaint" and describe the issue. You can set the priority level (Low, Medium, High, Critical). The PG owner will be notified and can respond with updates. Track the resolution progress in real time.',
  },
  {
    question: 'How does KYC verification work?',
    answer:
      'Navigate to your Profile page and click "Start KYC Verification." You will need to upload your Aadhaar card and PAN card images. The system extracts details automatically and matches them against your profile information. Verification typically completes within 24 hours. KYC is required for booking and payment features.',
  },
  {
    question: 'Can I cancel my booking?',
    answer:
      'Yes, you can cancel a booking from "My Bookings" by selecting the booking and clicking the cancel option. Cancellation policies vary by PG and are mentioned on the listing page. Generally, cancellations made 48 hours before check-in receive a full refund minus processing fees. The security deposit refund timeline depends on the PG owner\'s policy.',
  },
];

const OWNER_FAQ = [
  {
    question: 'How do I list my PG?',
    answer:
      'Go to "My PGs" from the owner dashboard and click "Add New PG." Fill in property details including name, address, gender type, description, amenities, and rules. Add high-quality photos and set room configurations with bed types and pricing. Your listing will go live after a quick review.',
  },
  {
    question: 'How does rent management work?',
    answer:
      'The rent management dashboard shows all tenants and their payment status. You can set monthly rent amounts, track overdue payments, send automated reminders, and record payments received both online and offline. The system maintains a complete payment history for each tenant with downloadable receipts.',
  },
  {
    question: 'How do I manage staff?',
    answer:
      'Navigate to "Staff Management" in your owner dashboard. Add staff members (cooks, cleaners, security guards, etc.) with their name, role, phone number, and assigned shift (Morning, Evening, Night). Track attendance, update staff details, and manage schedules from a single interface.',
  },
  {
    question: 'How do vendor services work?',
    answer:
      'In "Vendor Management," you can browse registered service providers by type (plumber, electrician, carpenter, etc.) and area. View vendor profiles, ratings, and reviews. Connect with vendors directly for maintenance and repair needs. Vendors can be assigned to specific PGs for recurring services.',
  },
  {
    question: 'How do I track analytics?',
    answer:
      'The analytics dashboard provides real-time insights including total occupancy rate, revenue trends, booking trends, complaint statistics, and tenant feedback. Visual charts help you understand performance patterns and make data-driven decisions about pricing, marketing, and operations.',
  },
  {
    question: 'What pricing plans are available?',
    answer:
      'StayEg offers three subscription plans for PG owners: a 1-year plan, a 2-year plan, and a 3-year plan. Longer plans offer better value per year. All plans include unlimited listings, tenant management, rent tracking, and vendor access. Check the Pricing page for detailed plan comparison and current offers.',
  },
];

const PAYMENT_FAQ = [
  {
    question: 'Is my payment secure?',
    answer:
      'Absolutely. All payments on StayEg are processed through PCI-DSS Level 1 compliant payment gateways. We use industry-standard 256-bit SSL encryption to protect your financial data. StayEg never stores your full card details. Every transaction is logged and auditable from your payment history.',
  },
  {
    question: 'How do coupons work?',
    answer:
      'Coupons can be applied during the booking payment step. Enter a coupon code in the "Apply Coupon" field to see the discount. Coupons may offer flat discounts or percentage-based savings. Check the "Coupon Wallet" in the payment section to view available and saved coupons. Some coupons have minimum booking amount requirements.',
  },
  {
    question: 'What is the security deposit?',
    answer:
      'The security deposit is a refundable amount collected at the time of booking, separate from the monthly rent. It serves as a safety net for PG owners against damages or unpaid dues. The exact deposit amount varies by PG and is displayed on the listing page. Refunds are processed when you vacate, subject to a room condition inspection.',
  },
  {
    question: 'How do I get a refund?',
    answer:
      'Refund requests can be initiated from "My Bookings" for eligible cancellations. Online payments are refunded to the original payment method within 5-7 business days. Refund policies depend on the cancellation timing and the PG owner\'s terms. For disputes, contact StayEg support with your booking ID for assistance.',
  },
];

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */
export default function HelpPage() {
  const { setCurrentView, showToast } = useAppStore();

  function handleAction(action: string) {
    if (action === 'SUPPORT_TOAST') {
      showToast('Support feature coming soon!');
      return;
    }
    setCurrentView(action as 'PG_LISTING' | 'SAFE_USE' | 'LANDING');
  }

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
              <HelpCircle className="size-5 text-brand-teal" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Help &amp; Support</h1>
              <p className="text-sm text-muted-foreground">Find answers and learn how to use StayEg</p>
            </div>
          </div>
        </div>
      </section>

      <div className="max-w-5xl mx-auto px-4 py-8 space-y-10">

        {/* ============================================================ */}
        {/*  2. Quick Actions                                            */}
        {/* ============================================================ */}
        <FadeIn>
          <section>
            <h2 className="text-lg font-semibold text-foreground mb-4">Quick Actions</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
              {QUICK_ACTIONS.map((item) => {
                const Icon = item.icon;
                return (
                  <Card
                    key={item.title}
                    className={`border-border ${item.hoverBorder} transition-colors cursor-pointer group`}
                    onClick={() => handleAction(item.action)}
                  >
                    <CardContent className="p-4 flex flex-col items-center text-center gap-3">
                      <div className={`size-10 rounded-xl ${item.color} flex items-center justify-center transition-transform group-hover:scale-105`}>
                        <Icon className="size-5" />
                      </div>
                      <div>
                        <h3 className="text-sm font-semibold text-foreground">{item.title}</h3>
                        <p className="text-xs text-muted-foreground mt-1 leading-relaxed hidden sm:block">
                          {item.description}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </section>
        </FadeIn>

        <Separator />

        {/* ============================================================ */}
        {/*  3. Getting Started Guide                                    */}
        {/* ============================================================ */}
        <section>
          <FadeIn>
            <div className="flex items-center gap-2 mb-2">
              <div className="size-8 rounded-lg bg-brand-deep-light flex items-center justify-center">
                <BookOpen className="size-4 text-brand-teal" />
              </div>
              <h2 className="text-lg sm:text-xl font-bold text-foreground">Getting Started Guide</h2>
            </div>
            <p className="text-sm text-muted-foreground mb-6">
              Follow these steps to get the most out of StayEg.
            </p>
          </FadeIn>

          <div className="space-y-4">
            {GETTING_STARTED_STEPS.map((step, i) => {
              const Icon = step.icon;
              return (
                <FadeIn key={step.step} delay={i * 0.1}>
                  <Card className="border-border hover:border-brand-teal/20 transition-colors">
                    <CardContent className="p-5 sm:p-6">
                      <div className="flex items-start gap-4">
                        <div className="shrink-0">
                          <div className={`size-11 rounded-xl ${step.color} flex items-center justify-center`}>
                            <Icon className="size-5" />
                          </div>
                          <div className={`text-center mt-1.5 text-xs font-bold ${step.accent}`}>
                            Step {step.step}
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="text-base font-semibold text-foreground mb-1.5">{step.title}</h3>
                          <p className="text-sm text-muted-foreground leading-relaxed">{step.description}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </FadeIn>
              );
            })}
          </div>
        </section>

        <Separator />

        {/* ============================================================ */}
        {/*  4. Tenant FAQ                                               */}
        {/* ============================================================ */}
        <section>
          <FadeIn>
            <div className="flex items-center gap-2 mb-2">
              <div className="size-8 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                <Users className="size-4 text-blue-700 dark:text-blue-300" />
              </div>
              <h2 className="text-lg sm:text-xl font-bold text-foreground">Tenant FAQ</h2>
              <Badge className="bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 border-0 text-xs ml-1">
                {TENANT_FAQ.length} questions
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              Common questions from tenants about finding, booking, and living in PGs.
            </p>
          </FadeIn>

          <FadeIn delay={0.1}>
            <Card className="border-border">
              <CardContent className="p-0">
                <Accordion type="single" collapsible className="w-full">
                  {TENANT_FAQ.map((item, i) => (
                    <AccordionItem key={i} value={`tenant-${i}`} className="px-5 sm:px-6">
                      <AccordionTrigger className="text-sm font-medium text-foreground hover:text-brand-teal transition-colors">
                        {item.question}
                      </AccordionTrigger>
                      <AccordionContent className="text-sm text-muted-foreground leading-relaxed">
                        {item.answer}
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </CardContent>
            </Card>
          </FadeIn>
        </section>

        <Separator />

        {/* ============================================================ */}
        {/*  5. Owner FAQ                                                */}
        {/* ============================================================ */}
        <section>
          <FadeIn>
            <div className="flex items-center gap-2 mb-2">
              <div className="size-8 rounded-lg bg-brand-teal/15 flex items-center justify-center">
                <Building2 className="size-4 text-brand-teal" />
              </div>
              <h2 className="text-lg sm:text-xl font-bold text-foreground">PG Owner FAQ</h2>
              <Badge className="bg-brand-teal/15 text-brand-teal border-0 text-xs ml-1">
                {OWNER_FAQ.length} questions
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              Everything PG owners need to know about listing, managing, and growing their business.
            </p>
          </FadeIn>

          <FadeIn delay={0.1}>
            <Card className="border-border">
              <CardContent className="p-0">
                <Accordion type="single" collapsible className="w-full">
                  {OWNER_FAQ.map((item, i) => (
                    <AccordionItem key={i} value={`owner-${i}`} className="px-5 sm:px-6">
                      <AccordionTrigger className="text-sm font-medium text-foreground hover:text-brand-teal transition-colors">
                        {item.question}
                      </AccordionTrigger>
                      <AccordionContent className="text-sm text-muted-foreground leading-relaxed">
                        {item.answer}
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </CardContent>
            </Card>
          </FadeIn>
        </section>

        <Separator />

        {/* ============================================================ */}
        {/*  6. Payment & Billing FAQ                                    */}
        {/* ============================================================ */}
        <section>
          <FadeIn>
            <div className="flex items-center gap-2 mb-2">
              <div className="size-8 rounded-lg bg-brand-sage/15 flex items-center justify-center">
                <CreditCard className="size-4 text-brand-sage" />
              </div>
              <h2 className="text-lg sm:text-xl font-bold text-foreground">Payment &amp; Billing FAQ</h2>
              <Badge className="bg-brand-sage/15 text-brand-sage border-0 text-xs ml-1">
                {PAYMENT_FAQ.length} questions
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              Answers about security, refunds, coupons, and deposits.
            </p>
          </FadeIn>

          <FadeIn delay={0.1}>
            <Card className="border-border">
              <CardContent className="p-0">
                <Accordion type="single" collapsible className="w-full">
                  {PAYMENT_FAQ.map((item, i) => (
                    <AccordionItem key={i} value={`payment-${i}`} className="px-5 sm:px-6">
                      <AccordionTrigger className="text-sm font-medium text-foreground hover:text-brand-teal transition-colors">
                        {item.question}
                      </AccordionTrigger>
                      <AccordionContent className="text-sm text-muted-foreground leading-relaxed">
                        {item.answer}
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </CardContent>
            </Card>
          </FadeIn>
        </section>

        <Separator />

        {/* ============================================================ */}
        {/*  7. Still Need Help?                                         */}
        {/* ============================================================ */}
        <FadeIn>
          <Card className="border-brand-teal/20 bg-gradient-to-br from-brand-teal/10 via-brand-sage/5 to-background overflow-hidden">
            <CardContent className="p-6 sm:p-8">
              <div className="flex flex-col sm:flex-row items-start gap-5">
                <div className="size-14 rounded-2xl bg-brand-teal/15 flex items-center justify-center shrink-0">
                  <Headphones className="size-7 text-brand-teal" />
                </div>
                <div className="flex-1 space-y-4">
                  <div>
                    <h3 className="text-lg sm:text-xl font-bold text-foreground mb-1">Still Need Help?</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      Our support team is available Monday to Saturday, 9:00 AM to 6:00 PM IST.
                      Reach out through any of the channels below and we will get back to you promptly.
                    </p>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-3">
                    <div className="flex items-center gap-3 rounded-lg border border-border bg-card p-3">
                      <div className="size-9 rounded-lg bg-brand-teal/15 flex items-center justify-center shrink-0">
                        <Mail className="size-4 text-brand-teal" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-medium text-muted-foreground">Email</p>
                        <p className="text-sm text-foreground truncate">support@stayeg.in</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 rounded-lg border border-border bg-card p-3">
                      <div className="size-9 rounded-lg bg-brand-teal/15 flex items-center justify-center shrink-0">
                        <Phone className="size-4 text-brand-teal" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-medium text-muted-foreground">Phone</p>
                        <p className="text-sm text-foreground">+91 80-4567-8900</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-2 pt-1">
                    <Button
                      className="bg-gradient-to-r from-brand-deep to-brand-teal hover:from-brand-deep/90 hover:to-brand-teal/90 text-white text-sm"
                      onClick={() => showToast('Support feature coming soon!')}
                    >
                      <Headphones className="size-4 mr-2" />
                      Contact Us
                    </Button>
                    <Button
                      variant="outline"
                      className="text-sm"
                      onClick={() => setCurrentView('SAFE_USE')}
                    >
                      <FileText className="size-4 mr-2" />
                      Read Safety Guidelines
                      <ChevronRight className="size-4 ml-1" />
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </FadeIn>

        {/* Bottom Navigation */}
        <div className="flex items-center justify-between pt-2">
          <Button
            variant="ghost"
            onClick={() => setCurrentView('SAFE_USE')}
            className="text-muted-foreground hover:text-brand-teal text-sm"
          >
            <ShieldCheck className="size-4 mr-2" />
            Safe Use Guidelines
            <ChevronRight className="size-4 ml-1" />
          </Button>
          <Button
            variant="ghost"
            onClick={() => setCurrentView('ABOUT')}
            className="text-muted-foreground hover:text-brand-teal text-sm"
          >
            About StayEg
            <ChevronRight className="size-4 ml-1" />
          </Button>
        </div>
      </div>

      {/* Mobile bottom spacing */}
      <div className="h-16 md:hidden" />
    </div>
  );
}
