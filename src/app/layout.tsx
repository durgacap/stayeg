import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { ThemeProvider } from "@/components/layout/theme-provider";
import { Providers } from "@/components/layout/providers";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#2563EB" },
    { media: "(prefers-color-scheme: dark)", color: "#020617" },
  ],
};

export const metadata: Metadata = {
  title: "StayEg — India's #1 Smart PG Platform | Find Verified PGs, Pay Zero Brokerage",
  description:
    "StayEg is India's most trusted paying guest (PG) platform. Browse 10,000+ verified PGs across 20+ cities. Book instantly with zero brokerage, manage rent digitally, join local communities, and experience hassle-free PG living. Trusted by 50,000+ tenants across Bangalore, Delhi, Mumbai, Pune, Hyderabad & more.",
  keywords: [
    "PG near me", "paying guest accommodation", "PG in Bangalore", "PG in Delhi", "PG in Mumbai",
    "PG in Pune", "PG in Hyderabad", "PG in Chennai", "boys PG", "girls PG", "unisex PG",
    "PG booking online", "PG without brokerage", "PG management software", "PG owner app",
    "paying guest India", "student accommodation", "shared rooms India", "hostel alternative",
    "PG rent", "monthly PG", "PG with food", "AC PG", "PG near metro", "PG near IT park",
    "co-living India", "room on rent", "StayEg", "best PG platform India",
  ],
  openGraph: {
    title: "StayEg — India's Smartest PG Ecosystem",
    description: "Find your perfect PG home in minutes. 10,000+ verified properties, zero brokerage, instant booking across 20+ Indian cities.",
    siteName: "StayEg",
    type: "website",
    locale: "en_IN",
  },
  twitter: {
    card: "summary_large_image",
    title: "StayEg — India's Smart PG Platform",
    description: "Verified PGs, zero brokerage, instant booking. Find your perfect PG home today!",
  },
  icons: {
    icon: "https://z-cdn.chatglm.cn/z-ai/static/logo.svg",
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "StayEg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem disableTransitionOnChange>
          <Providers>
            {children}
            <Toaster />
          </Providers>
        </ThemeProvider>
      </body>
    </html>
  );
}
