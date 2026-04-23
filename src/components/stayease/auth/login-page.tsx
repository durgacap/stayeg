'use client';

import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Building2, Phone, User as UserIcon, Lock, Eye, EyeOff, ArrowRight,
  Shield, ShieldCheck, Users, LogIn, ArrowLeft, Mail, AlertCircle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { InputOTP, InputOTPGroup, InputOTPSlot, InputOTPSeparator } from '@/components/ui/input-otp';
import { useAppStore } from '@/store/use-app-store';
import type { UserRole, User } from '@/lib/types';

const DEMO_USERS: Record<UserRole, User> = {
  TENANT: {
    id: 'demo-tenant-001',
    name: 'Rahul Sharma',
    email: 'rahul.sharma@example.com',
    phone: '+91 98765 43210',
    role: 'TENANT',
    gender: 'MALE',
    isVerified: true,
    avatar: 'https://api.dicebear.com/9.x/avataaars/svg?seed=Rahul',
    city: 'Bangalore',
    age: 24,
    occupation: 'Software Engineer',
    bio: 'Tech enthusiast looking for a cozy PG in Bangalore.',
  },
  OWNER: {
    id: 'demo-owner-001',
    name: 'Rajesh Kumar',
    email: 'rajesh@stayeg.in',
    phone: '+91 98765 43211',
    role: 'OWNER',
    gender: 'MALE',
    isVerified: true,
    avatar: 'https://api.dicebear.com/9.x/avataaars/svg?seed=Rajesh',
    city: 'Bangalore',
    bio: 'PG Owner managing 5 properties across Bangalore.',
  },
  ADMIN: {
    id: 'demo-admin-001',
    name: 'Admin User',
    email: 'admin@stayeg.in',
    phone: '+91 99999 99999',
    role: 'ADMIN',
    gender: 'MALE',
    isVerified: true,
    avatar: 'https://api.dicebear.com/9.x/avataaars/svg?seed=Admin',
    city: 'Bangalore',
  },
  VENDOR: {
    id: 'demo-vendor-001',
    name: 'Suresh Patel',
    email: 'suresh@services.in',
    phone: '+91 98765 43212',
    role: 'VENDOR',
    gender: 'MALE',
    isVerified: true,
    avatar: 'https://api.dicebear.com/9.x/avataaars/svg?seed=Suresh',
    city: 'Bangalore',
    bio: 'Plumber & electrician service provider.',
  },
};

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -10 },
  transition: { duration: 0.3, ease: 'easeOut' as const },
};

export default function LoginPage() {
  const { login, setCurrentView, showToast } = useAppStore();

  const [selectedRole, setSelectedRole] = useState<UserRole>('TENANT');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [showOTP, setShowOTP] = useState(false);
  const [otp, setOtp] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loginMethod, setLoginMethod] = useState<'phone' | 'password'>('phone');
  const [isSubmitting, setIsSubmitting] = useState(false);

  /** Try to fetch user from the real API, fall back to demo on failure */
  const tryRealLogin = useCallback(async (identifier: string, field: 'email' | 'phone'): Promise<User | null> => {
    try {
      const res = await fetch(`/api/auth?${field}=${encodeURIComponent(identifier)}`);
      const data = await res.json();

      if (data.demo === true || !data.users || data.users.length === 0) {
        return null; // No DB or user not found → fall back to demo
      }

      const raw = data.users[0];
      const user: User = {
        id: raw.id,
        name: raw.name,
        email: raw.email,
        phone: raw.phone,
        role: raw.role,
        gender: raw.gender,
        isVerified: raw.is_verified ?? false,
        avatar: raw.avatar,
        city: raw.city,
        occupation: raw.occupation,
        bio: raw.bio,
        createdAt: raw.created_at,
      };
      return user;
    } catch {
      return null;
    }
  }, []);

  const handleSendOTP = async () => {
    if (phone.length < 10) {
      showToast('Please enter a valid phone number');
      return;
    }
    setShowOTP(true);
    showToast('OTP sent to ' + phone);
  };

  const handleVerifyOTP = async () => {
    if (otp.length !== 6) {
      showToast('Please enter the 6-digit OTP');
      return;
    }
    setIsSubmitting(true);

    // Try real auth first
    const realUser = await tryRealLogin(phone, 'phone');

    if (realUser) {
      login(realUser);
      showToast('Welcome back, ' + realUser.name + '!');
    } else {
      // Fall back to demo mode
      const user = DEMO_USERS[selectedRole];
      login(user);
      showToast('Welcome, ' + user.name + '! (Demo Mode)');
    }

    setIsSubmitting(false);
  };

  const handlePasswordLogin = async () => {
    if (!email && !password) {
      showToast('Please enter your email and password');
      return;
    }
    if (email && !email.includes('@')) {
      showToast('Please enter a valid email address');
      return;
    }
    if (!password) {
      showToast('Please enter your password');
      return;
    }

    setIsSubmitting(true);

    // Try real auth first (lookup by email)
    if (email) {
      const realUser = await tryRealLogin(email, 'email');

      if (realUser) {
        login(realUser);
        showToast('Welcome back, ' + realUser.name + '!');
        setIsSubmitting(false);
        return;
      }
      // Email not found in DB → fall through to demo mode
    }

    // Fall back to demo mode
    await new Promise((r) => setTimeout(r, 400));
    const user = DEMO_USERS[selectedRole];
    login(user);
    showToast('Demo mode — no database connected');
    setIsSubmitting(false);
  };

  const handleDemoLogin = (role: UserRole) => {
    setIsSubmitting(true);
    setTimeout(() => {
      const user = DEMO_USERS[role];
      login(user);
      showToast('Welcome, ' + user.name + '! (Demo Mode)');
      setIsSubmitting(false);
    }, 600);
  };

  const handleGuestContinue = () => {
    useAppStore.getState().setCurrentView('LANDING');
    showToast('Browsing as guest. Sign in later to book!');
  };

  const handleForgotPassword = () => {
    showToast('Coming soon in v2.0');
  };

  const handleSocialLogin = (provider: string) => {
    showToast(provider + ' login coming soon!');
  };

  return (
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center px-4 py-8 bg-gradient-to-br from-brand-deep/5 via-brand-teal/8 to-background">
      <motion.div
        className="w-full max-w-md"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
      >
        {/* Branding */}
        <motion.div
          className="text-center mb-6"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <div className="inline-flex items-center justify-center size-14 bg-gradient-to-br from-brand-deep to-brand-teal rounded-2xl shadow-lg shadow-brand-teal/20 mb-3">
            <Building2 className="size-7 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-foreground">
            Welcome to <span className="text-brand-teal">StayEg</span>
          </h1>
          <p className="text-muted-foreground text-sm mt-1">Your trusted PG finding companion</p>
        </motion.div>

        {/* Main Card */}
        <Card className="shadow-xl shadow-brand-teal/10 border border-border bg-card">
          <CardContent className="p-6">
            <AnimatePresence mode="wait">
              {!showOTP ? (
                <motion.div key="login-form" {...fadeInUp}>
                  {/* Role Selection Tabs */}
                  <Tabs value={selectedRole} onValueChange={(v) => setSelectedRole(v as UserRole)} className="mb-6">
                    <TabsList className="w-full grid grid-cols-3 bg-brand-teal/10 p-1 h-auto">
                      {([
                        { value: 'TENANT', label: 'Tenant', icon: UserIcon },
                        { value: 'OWNER', label: 'PG Owner', icon: Building2 },
                        { value: 'VENDOR', label: 'Vendor', icon: Shield },
                      ] as const).map((tab) => (
                        <TabsTrigger
                          key={tab.value}
                          value={tab.value}
                          className="flex items-center justify-center gap-1.5 py-2 text-xs font-medium rounded-lg data-[state=active]:bg-card data-[state=active]:text-brand-teal data-[state=active]:shadow-sm transition-all"
                        >
                          <tab.icon className="size-3.5" />
                          {tab.label}
                        </TabsTrigger>
                      ))}
                    </TabsList>
                  </Tabs>

                  {/* Login Method Toggle */}
                  <div className="flex bg-muted rounded-lg p-0.5 mb-5">
                    <button
                      onClick={() => setLoginMethod('phone')}
                      className={`flex-1 py-2 rounded-md text-xs font-medium transition-all ${
                        loginMethod === 'phone'
                          ? 'bg-card text-brand-teal shadow-sm'
                          : 'text-muted-foreground hover:text-foreground'
                      }`}
                    >
                      <Phone className="size-3.5 inline mr-1" />
                      Phone OTP
                    </button>
                    <button
                      onClick={() => setLoginMethod('password')}
                      className={`flex-1 py-2 rounded-md text-xs font-medium transition-all ${
                        loginMethod === 'password'
                          ? 'bg-card text-brand-teal shadow-sm'
                          : 'text-muted-foreground hover:text-foreground'
                      }`}
                    >
                      <Lock className="size-3.5 inline mr-1" />
                      Password
                    </button>
                  </div>

                  <AnimatePresence mode="wait">
                    {loginMethod === 'phone' ? (
                      <motion.div key="phone-login" {...fadeInUp}>
                        <div className="space-y-2 mb-4">
                          <Label htmlFor="phone" className="text-sm font-medium text-foreground">
                            Phone Number
                          </Label>
                          <div className="relative">
                            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                            <Input
                              id="phone"
                              type="tel"
                              placeholder="+91 98765 43210"
                              value={phone}
                              onChange={(e) => setPhone(e.target.value)}
                              className="pl-10 h-11 border-border focus:border-brand-teal focus:ring-brand-teal/20"
                            />
                          </div>
                          <p className="text-[11px] text-muted-foreground">
                            We&apos;ll send you a verification code via SMS
                          </p>
                        </div>

                        <Button
                          onClick={handleSendOTP}
                          className="w-full h-11 bg-gradient-to-r from-brand-deep to-brand-teal hover:from-brand-deep/90 hover:to-brand-teal/90 text-white font-semibold rounded-xl shadow-lg shadow-brand-teal/20 transition-all"
                        >
                          Send OTP
                          <ArrowRight className="size-4 ml-2" />
                        </Button>
                      </motion.div>
                    ) : (
                      <motion.div key="password-login" {...fadeInUp}>
                        <div className="space-y-2 mb-4">
                          <Label htmlFor="email" className="text-sm font-medium text-foreground">
                            Email
                          </Label>
                          <div className="relative">
                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                            <Input
                              id="email"
                              type="email"
                              placeholder="you@example.com"
                              value={email}
                              onChange={(e) => setEmail(e.target.value)}
                              className="pl-10 h-11 border-border focus:border-brand-teal focus:ring-brand-teal/20"
                            />
                          </div>
                        </div>

                        <div className="space-y-2 mb-3">
                          <div className="flex items-center justify-between">
                            <Label htmlFor="password" className="text-sm font-medium text-foreground">
                              Password
                            </Label>
                            <button
                              onClick={handleForgotPassword}
                              className="text-xs text-brand-teal hover:text-foreground font-medium transition-colors"
                            >
                              Forgot Password?
                            </button>
                          </div>
                          <div className="relative">
                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                            <Input
                              id="password"
                              type={showPassword ? 'text' : 'password'}
                              placeholder="Enter your password"
                              value={password}
                              onChange={(e) => setPassword(e.target.value)}
                              onKeyDown={(e) => e.key === 'Enter' && handlePasswordLogin()}
                              className="pl-10 pr-10 h-11 border-border focus:border-brand-teal focus:ring-brand-teal/20"
                            />
                            <button
                              type="button"
                              onClick={() => setShowPassword(!showPassword)}
                              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                            >
                              {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                            </button>
                          </div>
                        </div>

                        <Button
                          onClick={handlePasswordLogin}
                          disabled={isSubmitting}
                          className="w-full h-11 bg-gradient-to-r from-brand-deep to-brand-teal hover:from-brand-deep/90 hover:to-brand-teal/90 text-white font-semibold rounded-xl shadow-lg shadow-brand-teal/20 transition-all"
                        >
                          {isSubmitting ? (
                            <motion.div
                              animate={{ rotate: 360 }}
                              transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
                              className="size-5 border-2 border-white/30 border-t-white rounded-full"
                            />
                          ) : (
                            <>
                              <LogIn className="size-4 mr-2" />
                              Sign In
                            </>
                          )}
                        </Button>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Divider */}
                  <div className="flex items-center gap-3 my-5">
                    <Separator className="flex-1" />
                    <span className="text-xs text-muted-foreground font-medium">or continue with</span>
                    <Separator className="flex-1" />
                  </div>

                  {/* Social Login */}
                  <div className="grid grid-cols-2 gap-3 mb-5">
                    <div className="flex flex-col items-center gap-1">
                      <button
                        onClick={() => handleSocialLogin('Google')}
                        className="flex items-center justify-center gap-2 h-10 rounded-xl border border-dashed border-border hover:bg-muted transition-colors text-sm font-medium text-muted-foreground w-full"
                      >
                        <svg className="size-4" viewBox="0 0 24 24">
                          <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" />
                          <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                          <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                          <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                        </svg>
                        Google
                      </button>
                      <span className="text-[10px] text-muted-foreground">(Coming Soon)</span>
                    </div>
                    <div className="flex flex-col items-center gap-1">
                      <button
                        onClick={() => handleSocialLogin('Facebook')}
                        className="flex items-center justify-center gap-2 h-10 rounded-xl border border-dashed border-border hover:bg-muted transition-colors text-sm font-medium text-muted-foreground w-full"
                      >
                        <svg className="size-4" fill="#1877F2" viewBox="0 0 24 24">
                          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                        </svg>
                        Facebook
                      </button>
                      <span className="text-[10px] text-muted-foreground">(Coming Soon)</span>
                    </div>
                  </div>

                  {/* Continue as Guest */}
                  <Button
                    variant="outline"
                    onClick={handleGuestContinue}
                    className="w-full h-11 border-border text-muted-foreground hover:bg-muted hover:text-foreground rounded-xl font-medium"
                  >
                    <Users className="size-4 mr-2" />
                    Continue as Guest
                  </Button>

                  {/* Sign Up Link */}
                  <p className="text-center text-sm text-muted-foreground mt-5">
                    Don&apos;t have an account?{' '}
                    <button
                      onClick={() => setCurrentView('SIGNUP')}
                      className="text-brand-teal hover:text-foreground font-semibold"
                    >
                      Sign Up
                    </button>
                  </p>
                </motion.div>
              ) : (
                <motion.div key="otp-form" {...fadeInUp}>
                  {/* Back button */}
                  <button
                    onClick={() => { setShowOTP(false); setOtp(''); }}
                    className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-4 font-medium"
                  >
                    <ArrowLeft className="size-4" />
                    Back
                  </button>

                  <div className="text-center mb-6">
                    <div className="inline-flex items-center justify-center size-16 bg-brand-teal/15 rounded-2xl mb-3">
                      <Phone className="size-7 text-brand-teal" />
                    </div>
                    <h2 className="text-lg font-bold text-foreground">Verify OTP</h2>
                    <p className="text-sm text-muted-foreground mt-1">
                      We sent a 6-digit code to{' '}
                      <span className="font-semibold text-foreground">{phone}</span>
                    </p>
                  </div>

                  <div className="flex justify-center mb-6">
                    <InputOTP
                      maxLength={6}
                      value={otp}
                      onChange={setOtp}
                      className="gap-2"
                    >
                      <InputOTPGroup>
                        <InputOTPSlot index={0} className="h-12 w-12 text-lg rounded-xl border-border focus:border-brand-teal focus:ring-brand-teal/20" />
                        <InputOTPSlot index={1} className="h-12 w-12 text-lg rounded-xl border-border focus:border-brand-teal focus:ring-brand-teal/20" />
                        <InputOTPSlot index={2} className="h-12 w-12 text-lg rounded-xl border-border focus:border-brand-teal focus:ring-brand-teal/20" />
                      </InputOTPGroup>
                      <InputOTPSeparator className="text-muted-foreground" />
                      <InputOTPGroup>
                        <InputOTPSlot index={3} className="h-12 w-12 text-lg rounded-xl border-border focus:border-brand-teal focus:ring-brand-teal/20" />
                        <InputOTPSlot index={4} className="h-12 w-12 text-lg rounded-xl border-border focus:border-brand-teal focus:ring-brand-teal/20" />
                        <InputOTPSlot index={5} className="h-12 w-12 text-lg rounded-xl border-border focus:border-brand-teal focus:ring-brand-teal/20" />
                      </InputOTPGroup>
                    </InputOTP>
                  </div>

                  <p className="text-center text-xs text-muted-foreground mb-5">
                    Didn&apos;t receive code?{' '}
                    <button
                      className="text-brand-teal font-semibold hover:text-foreground"
                      onClick={() => showToast('OTP resent successfully!')}
                    >
                      Resend OTP
                    </button>
                  </p>

                  <Button
                    onClick={handleVerifyOTP}
                    disabled={isSubmitting}
                    className="w-full h-11 bg-gradient-to-r from-brand-deep to-brand-teal hover:from-brand-deep/90 hover:to-brand-teal/90 text-white font-semibold rounded-xl shadow-lg shadow-brand-teal/20 transition-all"
                  >
                    {isSubmitting ? (
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
                        className="size-5 border-2 border-white/30 border-t-white rounded-full"
                      />
                    ) : (
                      <>
                        Verify & Continue
                        <ArrowRight className="size-4 ml-2" />
                      </>
                    )}
                  </Button>

                  <div className="flex items-center gap-2 mt-4 px-2">
                    <AlertCircle className="size-3.5 text-muted-foreground shrink-0" />
                    <p className="text-[11px] text-muted-foreground">
                      Enter any 6 digits to proceed in demo mode
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </CardContent>
        </Card>

        {/* Footer */}
        <p className="text-center text-xs text-muted-foreground mt-6">
          By continuing, you agree to our{' '}
          <button onClick={() => setCurrentView('TERMS')} className="text-brand-teal hover:underline">
            Terms of Service
          </button>{' '}
          &{' '}
          <button onClick={() => setCurrentView('PRIVACY')} className="text-brand-teal hover:underline">
            Privacy Policy
          </button>
        </p>
      </motion.div>
    </div>
  );
}
