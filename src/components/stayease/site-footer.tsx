'use client';

import { Building2, MapPin, Phone, Mail, Heart, Instagram, Twitter, Facebook, Linkedin } from 'lucide-react';
import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import { Separator } from '@/components/ui/separator';
import { useAppStore } from '@/store/use-app-store';
import { slideUp, hoverScale, tapScale } from '@/lib/animations';

const footerSections = [
  {
    title: 'For Tenants',
    links: [
      { label: 'Find PGs', view: 'PG_LISTING' as const },
      { label: 'Explore Cities', view: 'LANDING' as const },
      { label: 'Community', view: 'COMMUNITY' as const },
      { label: 'Pricing', view: 'PRICING' as const },
    ],
  },
  {
    title: 'For PG Owners',
    links: [
      { label: 'List Your PG', view: 'PRICING' as const },
      { label: 'Pricing Plans', view: 'PRICING' as const },
      { label: 'Owner Dashboard', view: 'OWNER_DASHBOARD' as const },
      { label: 'Free 1 Year Offer', view: 'PRICING' as const },
    ],
  },
  {
    title: 'For Vendors',
    links: [
      { label: 'Register as Vendor', view: 'SIGNUP' as const },
      { label: 'List Services', view: 'SIGNUP' as const },
      { label: 'Get Verified', view: 'SIGNUP' as const },
    ],
  },
  {
    title: 'Legal',
    links: [
      { label: 'Terms of Service', view: 'TERMS' as const },
      { label: 'Privacy Policy', view: 'PRIVACY' as const },
      { label: 'Safe Use Guidelines', view: 'SAFE_USE' as const },
    ],
  },
];

export default function SiteFooter() {
  const { setCurrentView } = useAppStore();
  const footerRef = useRef<HTMLElement>(null);
  const isInView = useInView(footerRef, { once: true, margin: '-80px' });

  const handleLinkClick = (view: string) => {
    setCurrentView(view as any);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <motion.footer
      ref={footerRef}
      initial="hidden"
      animate={isInView ? 'visible' : 'hidden'}
      variants={slideUp}
      className="bg-gradient-to-b from-[#1E293B] to-[#0F172A] text-gray-400 mt-auto pb-safe relative overflow-hidden"
    >
      {/* Static gradient accent line at top */}
      <div
        className="absolute top-0 left-0 right-0 h-[2px]"
        style={{
          background:
            'linear-gradient(90deg, transparent, var(--brand-teal), var(--brand-deep), var(--brand-teal), transparent)',
        }}
      />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-14 relative z-10">
        {/* Top Section */}
        <div className="grid grid-cols-2 md:grid-cols-6 gap-8">
          {/* Brand */}
          <div className="col-span-2">
            <div className="flex items-center gap-2.5 mb-4">
              <div className="size-9 bg-gradient-to-br from-brand-deep to-brand-teal rounded-xl flex items-center justify-center">
                <Building2 className="size-5 text-white" />
              </div>
              <span className="text-xl font-bold text-white">
                Stay<span className="text-brand-teal">Eg</span>
              </span>
            </div>
            <p className="text-sm text-gray-500 leading-relaxed mb-4 max-w-xs">
              India&apos;s smartest PG ecosystem platform. Find verified PGs, manage properties from your phone, join communities, and never feel alone in a new city.
            </p>
            <p className="text-xs text-brand-teal font-semibold mb-6">
              100% Free for Tenants &bull; First 1000 PG Owners Get 1 Year Free!
            </p>
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <Phone className="size-4 text-brand-deep" />
                <span>+91 1800-123-STAY (Toll Free)</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <Mail className="size-4 text-brand-deep" />
                <span>hello@stayeg.in</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <MapPin className="size-4 text-brand-deep" />
                <span>Bangalore, India</span>
              </div>
            </div>
          </div>

          {/* Link Columns */}
          {footerSections.map((section) => (
            <div key={section.title}>
              <h3 className="text-sm font-semibold text-white mb-4">{section.title}</h3>
              <ul className="space-y-2.5">
                {section.links.map((link) => (
                  <li key={link.label}>
                    <button
                      onClick={() => handleLinkClick(link.view)}
                      className="text-sm text-gray-500 hover:text-brand-teal transition-colors"
                    >
                      {link.label}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <Separator className="my-8 bg-white/10" />

        {/* Bottom Section */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-gray-600 flex items-center gap-1">
            &copy; {new Date().getFullYear()} StayEg. Made with
            <Heart className="size-3.5 text-red-500 fill-red-500" />
            in India
          </p>
          <div className="flex items-center gap-3">
            {[Instagram, Twitter, Facebook, Linkedin].map((Icon, i) => (
              <motion.button
                key={i}
                whileHover={hoverScale}
                whileTap={tapScale}
                className="size-9 rounded-lg bg-white/10 hover:bg-brand-teal flex items-center justify-center transition-colors group"
              >
                <Icon className="size-4 text-gray-500 group-hover:text-white transition-colors" />
              </motion.button>
            ))}
          </div>
        </div>
      </div>
    </motion.footer>
  );
}
