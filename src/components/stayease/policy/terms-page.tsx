'use client';

import { useState } from 'react';
import {
  ArrowLeft, FileText, Shield, Scale, ChevronRight,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useAppStore } from '@/store/use-app-store';

const TERMS_SECTIONS = [
  {
    number: '1',
    title: 'Acceptance of Terms',
    content: `By accessing or using StayEg ("the Platform"), you acknowledge that you have read, understood, and agree to be bound by these Terms of Service ("Terms"). If you do not agree to these Terms, you may not use the Platform.

StayEg reserves the right to modify these Terms at any time. Continued use of the Platform after modifications constitutes acceptance of the updated Terms. We will notify users of significant changes via email or platform notifications.

These Terms apply to all users including tenants, PG owners, vendors, and visitors of the platform.`,
  },
  {
    number: '2',
    title: 'User Accounts',
    content: `To use certain features of StayEg, you must create an account. You agree to:

• Provide accurate, current, and complete information during registration
• Maintain the security of your account credentials
• Accept responsibility for all activities under your account
• Notify us immediately of any unauthorized access or security breach
• Keep your contact information up to date

You must be at least 18 years old to create an account. Users under 18 may use the Platform only with parental or guardian consent and supervision.

StayEg reserves the right to suspend or terminate accounts that violate these Terms or engage in fraudulent activities.`,
  },
  {
    number: '3',
    title: 'PG Listings',
    content: `PG owners are responsible for ensuring that all information provided in their property listings is accurate and up to date, including:

• Property descriptions, amenities, and photographs
• Pricing, availability, and room configurations
• Safety features and compliance with local regulations
• Rules regarding gender, lifestyle, and house policies

StayEg does not guarantee the accuracy of listings and acts as an intermediary platform. We conduct basic verification but do not physically inspect properties unless explicitly stated.

Misleading or fraudulent listings will result in immediate removal and potential account termination.`,
  },
  {
    number: '4',
    title: 'Bookings',
    content: `All bookings made through StayEg are subject to availability and confirmation by the PG owner. The booking process involves:

• Submission of a booking request by the tenant
• Confirmation or rejection by the PG owner within 24 hours
• Payment of advance amount upon confirmation
• Generation of a digital booking confirmation

StayEg facilitates the booking process but is not a party to the landlord-tenant relationship. Disputes regarding bookings should first be addressed between the parties, with StayEg providing mediation support if needed.

Cancellation of confirmed bookings is subject to the cancellation policy outlined in Section 8.`,
  },
  {
    number: '5',
    title: 'Payments',
    content: `StayEg facilitates payments between tenants and PG owners through secure payment gateways. Payment terms include:

• All transactions are processed in Indian Rupees (INR)
• StayEg charges a platform fee as specified during checkout
• Rent payments are released to PG owners within 2-3 business days
• Security deposits are held in escrow until checkout
• Payment receipts are generated for all transactions

Users agree not to circumvent the payment system or make direct payments outside the Platform for booked stays. Such actions may result in loss of platform protections and account suspension.`,
  },
  {
    number: '6',
    title: 'Refund Policy',
    content: `StayEg is committed to fair and transparent refund processes:

• Booking advance refunds: Full refund if cancelled within 24 hours of booking, 75% refund if cancelled 7+ days before check-in, no refund within 7 days of check-in
• Security deposit refunds: Processed within 7 business days of checkout, subject to deductions for damages or outstanding dues
• Subscription refunds: Available within 15 days of purchase with the money-back guarantee
• Processing time: Refunds take 5-10 business days to reflect in the original payment method

Refund requests can be submitted through the Platform or by contacting customer support.`,
  },
  {
    number: '7',
    title: 'Cancellation Policy',
    content: `For Tenants:
• Free cancellation within 24 hours of booking confirmation
• 75% refund if cancelled 7+ days before check-in date
• 50% refund if cancelled 3-7 days before check-in date
• No refund for cancellations within 3 days of check-in
• No-shows are charged the full advance amount

For PG Owners:
• Must honor confirmed bookings unless valid reason is provided
• Cancellation by owner after confirmation results in compensation to the tenant
• Repeated cancellations may result in listing removal and account penalties`,
  },
  {
    number: '8',
    title: 'Intellectual Property',
    content: `All content on StayEg, including but not limited to logos, text, graphics, images, code, and software, is the property of StayEg or its licensors and is protected by intellectual property laws.

Users retain ownership of content they upload (listings, reviews, photos). By uploading content, users grant StayEg a non-exclusive, royalty-free, worldwide license to use, display, and distribute that content on the Platform.

Users may not:
• Copy, modify, or distribute any part of the Platform without permission
• Use StayEg's trademarks, logos, or branding without written consent
• Scrape, crawl, or extract data from the Platform through automated means`,
  },
  {
    number: '9',
    title: 'Limitation of Liability',
    content: `StayEg acts as an intermediary platform and does not guarantee the quality, safety, or legality of any PG listing, vendor service, or user interaction.

To the maximum extent permitted by law:
• StayEg shall not be liable for any direct, indirect, incidental, or consequential damages arising from use of the Platform
• StayEg is not responsible for disputes between users (tenants, owners, vendors)
• StayEg does not guarantee the accuracy of information provided by users
• Total liability shall not exceed the fees paid by the user in the preceding 12 months

Users are encouraged to verify all information independently before making decisions.`,
  },
  {
    number: '10',
    title: 'Dispute Resolution',
    content: `In case of any dispute arising from these Terms or use of the Platform:

1. Good Faith Resolution: Users should first attempt to resolve disputes directly with the other party
2. Platform Mediation: StayEg offers mediation support for unresolved disputes
3. Arbitration: If mediation fails, disputes shall be referred to binding arbitration in Bangalore, India
4. Governing Law: These Terms are governed by the laws of India
5. Jurisdiction: Courts in Bangalore, India shall have exclusive jurisdiction

The arbitration process shall be conducted in English, and each party shall bear their own costs unless the arbitrator determines otherwise.`,
  },
  {
    number: '11',
    title: 'Modifications',
    content: `StayEg reserves the right to modify these Terms at any time. Material changes will be communicated to users via:
• Email notification to registered addresses
• Platform notification banner
• In-app messaging

Users will be given at least 15 days' notice before material changes take effect. Continued use of the Platform after changes are effective constitutes acceptance of the modified Terms.

Users who do not agree with modifications may terminate their account before the changes take effect by contacting customer support.`,
  },
  {
    number: '12',
    title: 'Contact Information',
    content: `For any questions, concerns, or notices regarding these Terms of Service, please contact us:

StayEg Technologies Private Limited
Email: legal@stayeg.in
Phone: +91 80-XXXX-XXXX
Address: Bangalore, Karnataka, India

Business Hours: Monday to Saturday, 9:00 AM - 6:00 PM IST
Response Time: We aim to respond to all inquiries within 48 hours.`,
  },
];

export default function TermsPage() {
  const { setCurrentView } = useAppStore();
  const [activeSection, setActiveSection] = useState('1');

  const scrollToSection = (id: string) => {
    setActiveSection(id);
    const el = document.getElementById(`section-${id}`);
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
            <div className="size-10 rounded-xl bg-brand-teal/15 flex items-center justify-center">
              <FileText className="size-5 text-brand-teal" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Terms of Service</h1>
              <p className="text-sm text-muted-foreground">Please read these terms carefully before using StayEg</p>
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
              {TERMS_SECTIONS.map((section) => (
                <button
                  key={section.number}
                  onClick={() => scrollToSection(section.number)}
                  className={`w-full text-left px-3 py-1.5 rounded-lg text-sm transition-colors ${
                    activeSection === section.number
                      ? 'bg-brand-teal/10 text-brand-teal font-medium'
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                  }`}
                >
                  <span className="text-xs text-muted-foreground mr-1.5">{section.number}.</span>
                  {section.title}
                </button>
              ))}
            </nav>
          </div>
        </aside>

        {/* Content */}
        <div className="flex-1 min-w-0 space-y-6">
          {TERMS_SECTIONS.map((section) => (
            <Card key={section.number} id={`section-${section.number}`} className="border-border scroll-mt-24">
              <CardHeader className="pb-2">
                <div className="flex items-center gap-2">
                  <span className="size-7 rounded-lg bg-brand-teal/15 text-brand-teal text-xs font-bold flex items-center justify-center">
                    {section.number}
                  </span>
                  <CardTitle className="text-base">{section.title}</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">
                  {section.content}
                </div>
              </CardContent>
            </Card>
          ))}

          {/* Bottom Navigation */}
          <div className="flex items-center justify-between pt-4">
            <Button
              variant="ghost"
              onClick={() => setCurrentView('PRIVACY')}
              className="text-muted-foreground hover:text-brand-teal"
            >
              <Shield className="size-4 mr-2" />
              Privacy Policy
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
