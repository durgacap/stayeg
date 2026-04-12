'use client';

import { useState } from 'react';
import {
  ArrowLeft, Shield, Lock, Database, Eye, Cookie,
  UserCheck, Baby, Globe, RefreshCw, ChevronRight, FileText,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAppStore } from '@/store/use-app-store';

const PRIVACY_SECTIONS = [
  {
    number: '1',
    title: 'Information We Collect',
    icon: Database,
    content: `At StayEg, we collect information to provide and improve our services. The types of information we collect include:

Personal Information:
• Name, email address, phone number, and date of birth
• Government-issued ID numbers (Aadhaar, PAN) for KYC verification
• Profile photos, bio, and preferences
• Occupation and employer information (optional)

Property Information (PG Owners):
• Property addresses, photographs, and descriptions
• Room configurations, amenities, and pricing details
• Safety compliance documents and certificates

Usage Information:
• Log data including IP address, browser type, and device information
• Pages visited, features used, and interaction patterns
• Location data (with your consent) for nearby services

Financial Information:
• Payment method details (processed securely by payment partners)
• Transaction history, receipts, and billing information`,
  },
  {
    number: '2',
    title: 'How We Use Your Information',
    icon: Eye,
    content: `We use the information we collect for the following purposes:

Service Delivery:
• Create and manage your account
• Facilitate bookings, payments, and communications
• Verify your identity and KYC documents
• Provide customer support and resolve disputes

Platform Improvement:
• Analyze usage patterns to improve features
• Personalize your experience and recommendations
• Develop new features and services
• Conduct research and analytics (anonymized)

Communication:
• Send booking confirmations, receipts, and notifications
• Deliver important service announcements
• Respond to your inquiries and support requests
• Send promotional communications (with opt-out option)

Safety & Security:
• Detect and prevent fraud and unauthorized activities
• Verify users and properties
• Enforce our Terms of Service
• Comply with legal obligations`,
  },
  {
    number: '3',
    title: 'Data Sharing & Disclosure',
    icon: Globe,
    content: `We do not sell your personal information. We may share your information in the following circumstances:

With Other Users:
• PG owners can see tenant profiles relevant to bookings
• Tenants can see PG details and owner contact information
• Reviews and ratings are visible to all users

With Service Partners:
• Payment processors for transaction handling (Razorpay)
• KYC verification partners for identity verification
• Analytics tools to improve platform performance

Legal Requirements:
• In response to valid legal processes (court orders, subpoenas)
• To comply with applicable laws and regulations
• To protect the rights, safety, and property of StayEg and users
• To report suspected illegal activities

Business Transfers:
• In connection with mergers, acquisitions, or asset sales
• We will notify you of any change in ownership of your data`,
  },
  {
    number: '4',
    title: 'Data Security',
    icon: Lock,
    content: `We implement industry-standard security measures to protect your information:

Technical Safeguards:
• End-to-end encryption for sensitive data transmission
• Secure hash storage for passwords (bcrypt)
• Regular security audits and penetration testing
• Firewall and intrusion detection systems

Operational Safeguards:
• Access controls based on role and need-to-know
• Regular employee security training
• Vendor security assessments and monitoring
• Incident response procedures and breach notification

Data Retention:
• Active account data is retained while your account is active
• Deleted account data is purged within 30 days
• Anonymized analytics data may be retained for research
• Transaction records are retained for 7 years (legal requirement)

While we strive to protect your information, no method of electronic transmission or storage is 100% secure. We encourage you to use strong passwords and notify us of any security concerns.`,
  },
  {
    number: '5',
    title: 'Cookies & Tracking Technologies',
    icon: Cookie,
    content: `StayEg uses cookies and similar technologies to enhance your experience:

Essential Cookies:
• Session management and authentication
• Security features and fraud prevention
• Remembering your preferences

Analytics Cookies:
• Understanding how users interact with the Platform
• Measuring the effectiveness of features
• Google Analytics for aggregated usage data

Marketing Cookies:
• Personalized advertisements (with your consent)
• Social media sharing and tracking
• Partner marketing programs

Managing Cookies:
• You can control cookie settings in your browser
• Disabling essential cookies may affect platform functionality
• You can opt out of analytics cookies through browser settings
• We respect Do Not Track browser signals`,
  },
  {
    number: '6',
    title: 'Your Rights & Choices',
    icon: UserCheck,
    content: `You have the following rights regarding your personal information:

Access & Portability:
• Request a copy of your personal data
• Download your data in a portable format
• Request data correction or updates

Control:
• Update your profile information at any time
• Control email notification preferences
• Opt out of marketing communications
• Delete your account and associated data

Specific Rights Under Indian Data Protection Law (DPDPA):
• Right to know what personal data is collected
• Right to correct inaccurate personal data
• Right to erasure of personal data
• Right to withdraw consent for data processing
• Right to lodge a complaint with the Data Protection Board

To exercise any of these rights, contact us at privacy@stayeg.in. We will respond to your request within 30 days.`,
  },
  {
    number: '7',
    title: "Children's Privacy",
    icon: Baby,
    content: `StayEg is not intended for children under the age of 18. We do not knowingly collect personal information from children.

If we discover that a child under 18 has provided personal information:
• We will take steps to delete such information promptly
• We may terminate the child's account
• We will notify the parent or guardian

Parents or guardians who believe their child has provided personal information to StayEg should contact us at privacy@stayeg.in, and we will take appropriate action.

Educational institutions or organizations that wish to use StayEg for students must ensure proper parental consent mechanisms are in place.`,
  },
  {
    number: '8',
    title: 'Third-Party Services',
    icon: Globe,
    content: `StayEg integrates with third-party services that may have their own privacy policies:

Payment Processing:
• Razorpay — handles all payment transactions securely
• Payment data is processed under PCI DSS compliance

Maps & Location:
• Google Maps — for property location display and navigation
• Location data shared only when you enable location services

Authentication:
• Google/Apple sign-in — for social login features
• Only basic profile information is shared

Analytics:
• Google Analytics — for platform usage analysis
• Data is anonymized and aggregated

Communication:
• WhatsApp Business API — for notifications and updates
• Phone numbers shared in compliance with TRAI regulations

We recommend reviewing the privacy policies of these third-party services. StayEg is not responsible for the privacy practices of external websites or services.`,
  },
  {
    number: '9',
    title: 'Changes to This Policy',
    icon: RefreshCw,
    content: `We may update this Privacy Policy from time to time. Changes will be communicated through:

• Email notification for material changes
• Platform notification banner for at least 15 days
• Updated "Last Updated" date at the top of this page

We encourage you to review this Policy periodically. Your continued use of the Platform after changes are posted constitutes acceptance of the updated Policy.

If you disagree with any changes, you may:
• Contact us to express concerns at privacy@stayeg.in
• Delete your account before changes take effect
• Request data export before closing your account`,
  },
  {
    number: '10',
    title: 'Contact Us',
    icon: Shield,
    content: `For privacy-related questions, concerns, or requests, please contact:

StayEg Data Protection Officer
Email: privacy@stayeg.in
Phone: +91 80-XXXX-XXXX
Address: Bangalore, Karnataka, India

For general support:
Email: support@stayeg.in
Phone: +91 80-XXXX-XXXX
Business Hours: Monday to Saturday, 9:00 AM - 6:00 PM IST

We aim to respond to all privacy-related inquiries within 30 days as required by applicable data protection laws.`,
  },
];

export default function PrivacyPage() {
  const { setCurrentView } = useAppStore();
  const [activeSection, setActiveSection] = useState('1');

  const scrollToSection = (id: string) => {
    setActiveSection(id);
    const el = document.getElementById(`privacy-section-${id}`);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <section className="bg-gradient-to-br from-muted to-background border-b pt-8 pb-6">
        <div className="max-w-6xl mx-auto px-4">
          <button
            onClick={() => setCurrentView('LANDING')}
            className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-brand-teal transition-colors mb-4"
          >
            <ArrowLeft className="size-4" />
            Back to Home
          </button>

          <div className="flex items-center gap-3 mb-2">
            <div className="size-10 rounded-xl bg-blue-100 flex items-center justify-center">
              <Shield className="size-5 text-blue-600" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Privacy Policy</h1>
              <p className="text-sm text-muted-foreground">Your privacy matters to us. Learn how we protect your data.</p>
            </div>
          </div>

          <Badge variant="outline" className="mt-2 text-xs text-muted-foreground">
            Last Updated: January 2025
          </Badge>
        </div>
      </section>

      <div className="max-w-6xl mx-auto px-4 py-8 flex gap-8">
        {/* Table of Contents - Desktop */}
        <aside className="hidden lg:block w-56 shrink-0">
          <div className="sticky top-24">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Contents</p>
            <nav className="space-y-1">
              {PRIVACY_SECTIONS.map((section) => {
                const Icon = section.icon;
                return (
                  <button
                    key={section.number}
                    onClick={() => scrollToSection(section.number)}
                    className={`w-full text-left px-3 py-1.5 rounded-lg text-sm transition-colors flex items-center gap-2 ${
                      activeSection === section.number
                        ? 'bg-brand-teal/10 text-brand-teal font-medium'
                        : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                    }`}
                  >
                    <Icon className="size-3.5 shrink-0" />
                    {section.title}
                  </button>
                );
              })}
            </nav>
          </div>
        </aside>

        {/* Content */}
        <div className="flex-1 min-w-0 space-y-6">
          {PRIVACY_SECTIONS.map((section) => {
            const Icon = section.icon;
            return (
              <Card key={section.number} id={`privacy-section-${section.number}`} className="border-border scroll-mt-24">
                <CardHeader className="pb-2">
                  <div className="flex items-center gap-2">
                    <span className="size-7 rounded-lg bg-brand-teal/15 text-brand-teal text-xs font-bold flex items-center justify-center">
                      {section.number}
                    </span>
                    <Icon className="size-4 text-muted-foreground" />
                    <CardTitle className="text-base">{section.title}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">
                    {section.content}
                  </div>
                </CardContent>
              </Card>
            );
          })}

          {/* Bottom Navigation */}
          <div className="flex items-center justify-between pt-4">
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
              onClick={() => setCurrentView('SAFE_USE')}
              className="text-muted-foreground hover:text-brand-teal"
            >
              Safe Use Guidelines
              <ChevronRight className="size-4 ml-1" />
            </Button>
          </div>
        </div>
      </div>

      <div className="h-16 md:hidden" />
    </div>
  );
}
