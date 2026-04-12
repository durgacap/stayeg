'use client';

import {
  ArrowLeft, Shield, AlertTriangle, CheckCircle2, Users, Building2,
  Wrench, Phone, Flag, Heart, Eye, Lock, CreditCard, MessageSquare,
  ChefHat, FireExtinguisher, Siren, ChevronRight, FileText, ShieldCheck,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { useAppStore } from '@/store/use-app-store';

const TENANT_TIPS = [
  {
    icon: Eye,
    title: 'Verify the Property',
    description: 'Always visit the PG in person before making any payment. Check that the property matches the listing photos and descriptions on StayEg.',
    level: 'critical' as const,
  },
  {
    icon: Users,
    title: 'Meet the Owner / Manager',
    description: 'Have a face-to-face meeting with the PG owner or manager. Verify their identity and discuss all terms and conditions before agreeing.',
    level: 'critical' as const,
  },
  {
    icon: CheckCircle2,
    title: 'Check Amenities Thoroughly',
    description: 'Test WiFi speed, check water pressure, inspect the bed, AC, and common areas. Make sure everything listed in the amenities is functional.',
    level: 'high' as const,
  },
  {
    icon: CreditCard,
    title: 'Payment Safety',
    description: 'Always make payments through StayEg\'s secure payment system. Never transfer money directly to personal bank accounts or UPI IDs before verifying.',
    level: 'critical' as const,
  },
  {
    icon: Lock,
    title: 'Read the Agreement',
    description: 'Review the rental agreement carefully before signing. Understand the notice period, house rules, and refund policies for security deposits.',
    level: 'high' as const,
  },
  {
    icon: MessageSquare,
    title: 'Keep Communication on Platform',
    description: 'Keep all conversations and agreements within StayEg for record. This helps in case of any disputes or issues that need resolution.',
    level: 'medium' as const,
  },
];

const OWNER_TIPS = [
  {
    icon: ShieldCheck,
    title: 'Tenant Verification (KYC)',
    description: 'Always verify tenant identity using Aadhaar/PAN through StayEg\'s KYC system. Collect emergency contact information and keep records.',
    level: 'critical' as const,
  },
  {
    icon: CreditCard,
    title: 'Fair & Transparent Pricing',
    description: 'Display accurate and transparent pricing. Include all charges (rent, maintenance, meals, etc.) upfront. Hidden charges lead to complaints.',
    level: 'high' as const,
  },
  {
    icon: FireExtinguisher,
    title: 'Safety Standards Compliance',
    description: 'Ensure fire extinguishers, smoke detectors, CCTV cameras, and emergency exits are in place. Conduct regular safety drills for staff and tenants.',
    level: 'critical' as const,
  },
  {
    icon: ChefHat,
    title: 'Hygiene & Cleanliness',
    description: 'Maintain high standards of cleanliness in rooms, common areas, bathrooms, and kitchen. Regular pest control and housekeeping schedules are essential.',
    level: 'high' as const,
  },
  {
    icon: Phone,
    title: 'Emergency Contacts',
    description: 'Display emergency contact numbers (police, fire, hospital, local authority) in common areas. Maintain a list of all tenants\' emergency contacts.',
    level: 'high' as const,
  },
  {
    icon: Users,
    title: 'Respect Tenant Privacy',
    description: 'Give proper notice before entering occupied rooms. Respect tenants\' personal space and belongings. Maintain clear boundaries.',
    level: 'medium' as const,
  },
];

const VENDOR_TIPS = [
  {
    icon: ShieldCheck,
    title: 'Identity Verification',
    description: 'Complete your vendor verification on StayEg. Upload valid ID proof, certifications, and work samples to build trust with PG owners.',
    level: 'critical' as const,
  },
  {
    icon: CreditCard,
    title: 'Fair & Competitive Pricing',
    description: 'Provide transparent quotes before starting work. No hidden charges or surprise additions. Build long-term relationships through honest pricing.',
    level: 'high' as const,
  },
  {
    icon: CheckCircle2,
    title: 'Quality Work Guarantee',
    description: 'Stand behind your work quality. Offer warranties for repairs and installations. Address any follow-up issues promptly and professionally.',
    level: 'high' as const,
  },
  {
    icon: Phone,
    title: 'Professional Communication',
    description: 'Respond to service requests promptly. Keep PG owners updated on work progress. Confirm appointments before arriving at the property.',
    level: 'medium' as const,
  },
];

const GENERAL_TIPS = [
  {
    icon: Flag,
    title: 'Report Suspicious Activity',
    description: 'If you encounter fraudulent listings, fake profiles, or suspicious behavior, report it immediately through StayEg\'s reporting system or contact support.',
    level: 'critical' as const,
  },
  {
    icon: Shield,
    title: 'Never Share OTPs or Passwords',
    description: 'StayEg will never ask for your OTP, password, or sensitive financial information. Do not share these with anyone claiming to be from StayEg.',
    level: 'critical' as const,
  },
  {
    icon: Heart,
    title: 'Be Respectful',
    description: 'Treat all community members with respect and courtesy. Discrimination based on gender, religion, caste, or region will not be tolerated.',
    level: 'medium' as const,
  },
];

const EMERGENCY_CONTACTS = [
  { name: 'Police', number: '100', icon: Siren, color: 'text-red-600 bg-red-50' },
  { name: 'Fire Emergency', number: '101', icon: FireExtinguisher, color: 'text-orange-600 bg-orange-50' },
  { name: 'Ambulance', number: '108', icon: Heart, color: 'text-pink-600 bg-pink-50' },
  { name: 'Women Helpline', number: '1091', icon: Phone, color: 'text-purple-600 bg-purple-50' },
  { name: 'StayEg Support', number: '+91 80-XXXX-XXXX', icon: MessageSquare, color: 'text-brand-teal bg-brand-teal/10' },
];

const levelConfig = {
  critical: { bg: 'bg-red-50 border-red-200', badge: 'bg-red-500 text-white', label: 'Critical' },
  high: { bg: 'bg-amber-50 border-amber-200', badge: 'bg-amber-500 text-white', label: 'Important' },
  medium: { bg: 'bg-blue-50 border-blue-200', badge: 'bg-blue-500 text-white', label: 'Recommended' },
};

function TipCard({ tip }: { tip: typeof TENANT_TIPS[0] }) {
  const Icon = tip.icon;
  const config = levelConfig[tip.level];

  return (
    <div className={`rounded-xl border p-4 ${config.bg} transition-all hover:shadow-sm`}>
      <div className="flex items-start gap-3">
        <div className={`size-9 rounded-lg flex items-center justify-center shrink-0 ${
          tip.level === 'critical' ? 'bg-red-100' : tip.level === 'high' ? 'bg-amber-100' : 'bg-blue-100'
        }`}>
          <Icon className={`size-4.5 ${
            tip.level === 'critical' ? 'text-red-600' : tip.level === 'high' ? 'text-amber-600' : 'text-blue-600'
          }`} />
        </div>
        <div className="space-y-1 flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h4 className="font-semibold text-sm text-foreground">{tip.title}</h4>
            <Badge className={`${config.badge} text-[10px] px-1.5 py-0 border-0`}>{config.label}</Badge>
          </div>
          <p className="text-sm text-muted-foreground leading-relaxed">{tip.description}</p>
        </div>
      </div>
    </div>
  );
}

export default function SafeUsePage() {
  const { setCurrentView } = useAppStore();

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
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
            <div className="size-10 rounded-xl bg-green-100 flex items-center justify-center">
              <Shield className="size-5 text-green-600" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Safe Use Guidelines</h1>
              <p className="text-sm text-muted-foreground">Stay safe on StayEg — tips and best practices for everyone</p>
            </div>
          </div>
        </div>
      </section>

      <div className="max-w-5xl mx-auto px-4 py-8 space-y-10">
        {/* Emergency Banner */}
        <Alert className="border-red-200 bg-red-50">
          <Siren className="size-4 text-red-600" />
          <AlertTitle className="text-red-800 font-semibold">Emergency Contacts</AlertTitle>
          <AlertDescription>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 mt-3">
              {EMERGENCY_CONTACTS.map((contact) => {
                const Icon = contact.icon;
                return (
                  <div key={contact.name} className={`rounded-lg p-3 text-center ${contact.color}`}>
                    <Icon className="size-5 mx-auto mb-1.5" />
                    <p className="font-bold text-sm">{contact.number}</p>
                    <p className="text-xs opacity-80">{contact.name}</p>
                  </div>
                );
              })}
            </div>
          </AlertDescription>
        </Alert>

        {/* For Tenants */}
        <section>
          <div className="flex items-center gap-2 mb-4">
            <div className="size-8 rounded-lg bg-blue-100 flex items-center justify-center">
              <Users className="size-4 text-blue-600" />
            </div>
            <h2 className="text-xl font-bold text-foreground">For Tenants</h2>
            <Badge className="bg-blue-100 text-blue-700 border-0 text-xs ml-1">Finding & Staying Safe</Badge>
          </div>
          <p className="text-sm text-muted-foreground mb-4">
            Follow these guidelines to ensure a safe and smooth PG experience.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {TENANT_TIPS.map((tip) => (
              <TipCard key={tip.title} tip={tip} />
            ))}
          </div>
        </section>

        <Separator />

        {/* For PG Owners */}
        <section>
          <div className="flex items-center gap-2 mb-4">
            <div className="size-8 rounded-lg bg-brand-teal/15 flex items-center justify-center">
              <Building2 className="size-4 text-brand-teal" />
            </div>
            <h2 className="text-xl font-bold text-foreground">For PG Owners</h2>
            <Badge className="bg-brand-teal/15 text-brand-teal border-0 text-xs ml-1">Running a Safe PG</Badge>
          </div>
          <p className="text-sm text-muted-foreground mb-4">
            As a PG owner, tenant safety and satisfaction is your responsibility. Follow these best practices.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {OWNER_TIPS.map((tip) => (
              <TipCard key={tip.title} tip={tip} />
            ))}
          </div>
        </section>

        <Separator />

        {/* For Vendors */}
        <section>
          <div className="flex items-center gap-2 mb-4">
            <div className="size-8 rounded-lg bg-brand-sage/15 flex items-center justify-center">
              <Wrench className="size-4 text-brand-sage" />
            </div>
            <h2 className="text-xl font-bold text-foreground">For Vendors</h2>
            <Badge className="bg-brand-sage/15 text-brand-sage border-0 text-xs ml-1">Professional Service</Badge>
          </div>
          <p className="text-sm text-muted-foreground mb-4">
            Build trust and grow your business by following these guidelines.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {VENDOR_TIPS.map((tip) => (
              <TipCard key={tip.title} tip={tip} />
            ))}
          </div>
        </section>

        <Separator />

        {/* General Safety */}
        <section>
          <div className="flex items-center gap-2 mb-4">
            <div className="size-8 rounded-lg bg-green-100 flex items-center justify-center">
              <Shield className="size-4 text-green-600" />
            </div>
            <h2 className="text-xl font-bold text-foreground">General Safety</h2>
            <Badge className="bg-green-100 text-green-700 border-0 text-xs ml-1">Everyone</Badge>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {GENERAL_TIPS.map((tip) => (
              <TipCard key={tip.title} tip={tip} />
            ))}
          </div>
        </section>

        {/* Report Section */}
        <Card className="border-brand-teal/20 bg-gradient-to-br from-brand-teal/10 to-background overflow-hidden">
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <div className="size-12 rounded-xl bg-brand-teal/15 flex items-center justify-center shrink-0">
                <Flag className="size-6 text-brand-teal" />
              </div>
              <div className="space-y-2">
                <h3 className="text-lg font-bold text-foreground">See Something Suspicious?</h3>
                <p className="text-sm text-muted-foreground">
                  Report any safety concerns, fraudulent activity, or policy violations to StayEg immediately.
                  All reports are treated confidentially and investigated promptly.
                </p>
                <div className="flex flex-col sm:flex-row gap-2 pt-2">
                  <Button
                    className="bg-gradient-to-r from-brand-deep to-brand-teal hover:from-brand-deep/90 hover:to-brand-teal/90 text-white text-sm"
                    onClick={() => {
                      const { showToast } = useAppStore.getState();
                      showToast('Report submitted! We will investigate promptly.');
                    }}
                  >
                    <Flag className="size-4 mr-2" />
                    Report an Issue
                  </Button>
                  <Button variant="outline" className="text-sm">
                    <MessageSquare className="size-4 mr-2" />
                    Contact Support
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Bottom Navigation */}
        <div className="flex items-center justify-between pt-2">
          <Button
            variant="ghost"
            onClick={() => setCurrentView('TERMS')}
            className="text-muted-foreground hover:text-brand-teal"
          >
            <FileText className="size-4 mr-2" />
            Terms of Service
            <ChevronRight className="size-4 ml-1" />
          </Button>
          <Button
            variant="ghost"
            onClick={() => setCurrentView('PRIVACY')}
            className="text-muted-foreground hover:text-brand-teal"
          >
            Privacy Policy
            <ChevronRight className="size-4 ml-1" />
          </Button>
        </div>
      </div>

      <div className="h-16 md:hidden" />
    </div>
  );
}
