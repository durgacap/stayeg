# Task 6 - Help & Support Page

## Agent: full-stack-developer

## Work Log

- Read `/home/z/my-project/worklog.md` for full project context (6 prior task entries covering brand theme migration, component builds, bug fixes)
- Read existing policy pages (`safe-use-page.tsx`, `about-page.tsx`) for design patterns and conventions
- Read `useAppStore` for available actions (`setCurrentView`, `showToast`, `goBack`)
- Verified `HELP` AppView exists in `types.ts` union type
- Read `accordion.tsx` UI component for export signature confirmation
- Confirmed shadcn/ui components available: Card, Badge, Button, Separator, Accordion

### File Created

**`/home/z/my-project/src/components/stayease/policy/help-page.tsx`** (~430 lines)

### Architecture

- `'use client'` directive for client-side interactivity
- framer-motion animations: `FadeIn`, `StaggerContainer`, `StaggerItem` (same patterns as about-page.tsx)
- All 7 required sections implemented:
  1. **Header** - Back button (ArrowLeft), HelpCircle icon in brand-teal badge, title + subtitle
  2. **Quick Actions** - 2x2 / 4-col grid: Browse PGs (PG_LISTING), Contact Support (toast), Report an Issue (SAFE_USE), Read Guidelines (SAFE_USE)
  3. **Getting Started Guide** - 4 step cards with icons (UserPlus, Users, Building2, Wrench), descriptions, step numbers
  4. **Tenant FAQ** - Accordion with 6 questions (finding PGs, booking, payments, complaints, KYC, cancellations)
  5. **Owner FAQ** - Accordion with 6 questions (listing, rent, staff, vendors, analytics, pricing)
  6. **Payment & Billing FAQ** - Accordion with 4 questions (security, coupons, deposits, refunds)
  7. **Still Need Help?** - CTA card with email (support@stayeg.in), phone (+91 80-4567-8900), Contact Us button (toast), Read Safety Guidelines link

### Design System Compliance

- Colors: `brand-teal`, `brand-deep`, `brand-sage`, `brand-deep-light` CSS variable tokens
- Semantic tokens: `text-foreground`, `text-muted-foreground`, `bg-background`, `bg-card`, `border-border`, `bg-muted`
- Dark mode: all colors use dark: variants or CSS variables; dark-aware badge classes used
- No indigo/purple (except preserved semantic blue for tenant section)
- No emojis
- Mobile-first responsive: grid cols-2 sm:cols-4, flex-col sm:flex-row, hidden sm:block for descriptions
- Semantic icons from lucide-react only

### Verification

- Lint: 0 new errors (only pre-existing watcher.js and pg-listing.tsx warnings)
- Dev server compiles successfully with no issues

## Stage Summary

- 1 file created: `src/components/stayease/policy/help-page.tsx`
- 0 files modified
- 7 sections with 16 FAQ items across 3 accordion groups
- 4 quick action cards with working navigation
- Full dark mode support via CSS variable tokens
- framer-motion scroll-triggered animations
- Exported as `export default function HelpPage()`
