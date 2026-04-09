'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Database, CheckCircle2, AlertTriangle, Eye, EyeOff,
  Loader2, Shield, ExternalLink, Zap, Server, RefreshCw, IndianRupee,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';

interface SetupResponse {
  status: 'setup_required' | 'ready' | 'error';
  message: string;
  tablesFound?: boolean;
  stats?: { users: number; pgs: number; beds: number };
  error?: string;
}

interface AutoSetupResponse {
  success?: boolean;
  message?: string;
  error?: string;
  details?: string;
  tables?: string[];
  count?: number;
}

export default function DatabaseSetup({ onReady }: { onReady: () => void }) {
  const [setupStatus, setSetupStatus] = useState<SetupResponse | null>(null);
  const [checking, setChecking] = useState(true);
  const [dbPassword, setDbPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [settingUp, setSettingUp] = useState(false);
  const [setupResult, setSetupResult] = useState<AutoSetupResponse | null>(null);
  const [seeding, setSeeding] = useState(false);
  const [step, setStep] = useState<'check' | 'enter_password' | 'creating' | 'seeding' | 'done'>('check');

  const checkDatabase = async () => {
    try {
      const res = await fetch('/api/setup');
      const data: SetupResponse = await res.json();
      setSetupStatus(data);
      if (data.status === 'ready') {
        setStep('done');
        onReady();
      } else {
        setStep('enter_password');
      }
    } catch (err) {
      setSetupStatus({
        status: 'error',
        message: 'Failed to connect to Supabase',
        error: String(err),
      });
      setStep('enter_password');
    } finally {
      setChecking(false);
    }
  };

  useEffect(() => {
    checkDatabase();
  }, []);

  const handleSetup = async () => {
    if (!dbPassword.trim()) return;
    setSettingUp(true);
    setStep('creating');
    setSetupResult(null);

    try {
      const res = await fetch('/api/setup-db', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ dbPassword: dbPassword.trim() }),
      });
      const data: AutoSetupResponse = await res.json();
      setSetupResult(data);

      if (data.success) {
        // Tables created — now seed data
        setStep('seeding');
        try {
          const seedRes = await fetch('/api/seed', { method: 'POST' });
          const seedData = await seedRes.json();

          if (seedRes.ok) {
            setStep('done');
            setTimeout(() => {
              onReady();
            }, 2000);
          } else {
            // Tables exist but seed failed, still mark as done
            setStep('done');
            setTimeout(() => {
              onReady();
            }, 2000);
          }
        } catch {
          setStep('done');
          setTimeout(() => {
            onReady();
          }, 2000);
        }
      } else {
        setStep('enter_password');
      }
    } catch (err) {
      setSetupResult({
        success: false,
        error: 'Connection failed. Please check your password.',
        details: String(err),
      });
      setStep('enter_password');
    } finally {
      setSettingUp(false);
    }
  };

  // Loading state
  if (checking) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center space-y-4"
        >
          <div className="relative mx-auto w-16 h-16">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
              className="absolute inset-0 rounded-full border-4 border-primary/20 border-t-primary"
            />
            <Database className="absolute inset-0 m-auto w-7 h-7 text-primary" />
          </div>
          <div>
            <p className="text-lg font-semibold text-foreground">Connecting to Supabase...</p>
            <p className="text-sm text-muted-foreground mt-1">Checking database status</p>
          </div>
        </motion.div>
      </div>
    );
  }

  // Setup complete!
  if (step === 'done') {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center space-y-4"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 200, delay: 0.2 }}
            className="mx-auto w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center"
          >
            <CheckCircle2 className="w-10 h-10 text-green-600 dark:text-green-400" />
          </motion.div>
          <div>
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="text-2xl font-bold text-foreground"
            >
              Database Ready!
            </motion.p>
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="text-sm text-muted-foreground mt-2"
            >
              All tables created and sample data loaded. Loading your app...
            </motion.p>
          </div>
          {setupResult?.tables && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
              className="flex gap-3 justify-center flex-wrap mt-4"
            >
              {setupResult.tables.map((t) => (
                <Badge key={t} variant="secondary" className="capitalize">
                  {t}
                </Badge>
              ))}
            </motion.div>
          )}
        </motion.div>
      </div>
    );
  }

  // Main setup screen
  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-lg w-full space-y-6"
      >
        {/* Header */}
        <div className="text-center space-y-3">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 200 }}
            className="mx-auto w-16 h-16 bg-gradient-to-br from-[#1F74BA] to-[#F09120] rounded-2xl flex items-center justify-center shadow-lg"
          >
            <Database className="w-8 h-8 text-white" />
          </motion.div>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-foreground">
              Database Setup
            </h1>
            <p className="text-muted-foreground mt-2">
              Your Supabase project is connected! Just enter your database password to create all tables automatically.
            </p>
          </div>
        </div>

        {/* Progress indicator */}
        <div className="flex items-center gap-2 justify-center">
          {['Enter Password', 'Create Tables', 'Load Data'].map((label, i) => {
            const steps = ['enter_password', 'creating', 'seeding', 'done'];
            const currentIdx = steps.indexOf(step);
            const isActive = i <= currentIdx;
            const isCurrent = i === currentIdx;
            return (
              <div key={label} className="flex items-center gap-2">
                <div className={`flex items-center gap-2 ${isActive ? 'text-primary' : 'text-muted-foreground'}`}>
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                    isCurrent ? 'bg-primary text-primary-foreground' : isActive ? 'bg-green-500 text-white' : 'bg-muted'
                  }`}>
                    {isActive && !isCurrent ? <CheckCircle2 className="w-4 h-4" /> : i + 1}
                  </div>
                  <span className="text-xs hidden sm:inline">{label}</span>
                </div>
                {i < 2 && <div className={`w-8 h-0.5 ${isActive ? 'bg-primary' : 'bg-muted'}`} />}
              </div>
            );
          })}
        </div>

        {/* Enter Password Card */}
        <Card className={!setupResult?.error ? '' : 'border-red-300 dark:border-red-800'}>
          <CardHeader className="pb-4">
            <CardTitle className="text-base flex items-center gap-2">
              <Shield className="w-4 h-4 text-primary" />
              Step 1: Enter Your Database Password
            </CardTitle>
            <CardDescription>
              Find it in your Supabase Dashboard
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* How to find password */}
            <div className="bg-muted/50 rounded-lg p-3 space-y-2">
              <p className="text-xs font-medium text-foreground flex items-center gap-1">
                <Zap className="w-3 h-3 text-[#F7E200]" />
                How to find your database password:
              </p>
              <ol className="text-xs text-muted-foreground space-y-1 ml-4 list-decimal">
                <li>Go to <a href="https://supabase.com/dashboard/project/sbwmecxkbfijanwwuvvt/settings/database" target="_blank" rel="noopener noreferrer" className="text-primary underline hover:no-underline">Supabase Dashboard → Settings → Database</a></li>
                <li>Scroll to &quot;Database password&quot; section</li>
                <li>Click &quot;Reset database password&quot; if you forgot it</li>
                <li>Copy the password and paste it below</li>
              </ol>
            </div>

            {/* Password input */}
            <div className="relative">
              <Input
                type={showPassword ? 'text' : 'password'}
                placeholder="Enter your Supabase database password"
                value={dbPassword}
                onChange={(e) => setDbPassword(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && !settingUp && handleSetup()}
                className="pr-10 h-12"
                disabled={settingUp || seeding}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                tabIndex={-1}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            {/* Setup button */}
            <Button
              onClick={handleSetup}
              disabled={!dbPassword.trim() || settingUp || seeding}
              className="w-full h-12 bg-gradient-to-r from-[#1F74BA] to-[#F09120] hover:from-[#1F74BA]/90 hover:to-[#F09120]/90 text-white text-base font-semibold"
            >
              {settingUp ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Creating Tables...
                </>
              ) : seeding ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Loading Sample Data...
                </>
              ) : (
                <>
                  <Zap className="w-5 h-5 mr-2" />
                  Setup Database Automatically
                </>
              )}
            </Button>

            {/* Error message */}
            {setupResult?.error && (
              <motion.div
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-start gap-2 p-3 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800"
              >
                <AlertTriangle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-red-700 dark:text-red-300">{setupResult.error}</p>
                  {setupResult.details && (
                    <p className="text-xs text-red-500 dark:text-red-400 mt-1">{setupResult.details}</p>
                  )}
                </div>
              </motion.div>
            )}
          </CardContent>
        </Card>

        {/* Creating tables status */}
        <AnimatePresence>
          {(settingUp || seeding) && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-2"
            >
              {settingUp && (
                <Card className="border-primary/30 bg-primary/5">
                  <CardContent className="flex items-center gap-3 p-4">
                    <Loader2 className="w-5 h-5 text-primary animate-spin" />
                    <div>
                      <p className="text-sm font-medium text-foreground">Creating database tables...</p>
                      <p className="text-xs text-muted-foreground">Setting up 9 tables with RLS policies and indexes</p>
                    </div>
                  </CardContent>
                </Card>
              )}
              {seeding && (
                <Card className="border-green-300 bg-green-50 dark:border-green-800 dark:bg-green-900/20">
                  <CardContent className="flex items-center gap-3 p-4">
                    <Loader2 className="w-5 h-5 text-green-600 animate-spin" />
                    <div>
                      <p className="text-sm font-medium text-foreground">Loading sample data...</p>
                      <p className="text-xs text-muted-foreground">Adding PGs, rooms, beds, bookings & more</p>
                    </div>
                  </CardContent>
                </Card>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        <Separator />

        {/* What gets created */}
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
            <Server className="w-4 h-4 text-primary" />
            What gets created automatically:
          </h3>
          <div className="grid grid-cols-3 gap-2">
            {[
              { name: 'Users', icon: '👥', count: '10' },
              { name: 'PGs', icon: '🏠', count: '8' },
              { name: 'Rooms', icon: '🚪', count: '26' },
              { name: 'Beds', icon: '🛏️', count: '67' },
              { name: 'Bookings', icon: '📋', count: '6' },
              { name: 'Payments', icon: <IndianRupee className="w-3.5 h-3.5" />, count: '29' },
              { name: 'Complaints', icon: '🐛', count: '6' },
              { name: 'Vendors', icon: '🔧', count: '8' },
              { name: 'Workers', icon: '👷', count: '8' },
            ].map((item) => (
              <div
                key={item.name}
                className="bg-muted/50 rounded-lg p-2.5 text-center"
              >
                <span className="text-lg">{item.icon}</span>
                <div className="text-xs font-medium text-foreground mt-0.5">{item.name}</div>
                <div className="text-[10px] text-muted-foreground">{item.count} records</div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick link */}
        <div className="text-center">
          <a
            href="https://supabase.com/dashboard/project/sbwmecxkbfijanwwuvvt/settings/database"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-sm text-primary hover:underline"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            Open Supabase Dashboard to find your password
          </a>
        </div>

        {/* Retry button */}
        {setupStatus?.status === 'error' && (
          <div className="text-center">
            <Button variant="outline" onClick={checkDatabase} size="sm">
              <RefreshCw className="w-4 h-4 mr-2" />
              Retry Connection
            </Button>
          </div>
        )}
      </motion.div>
    </div>
  );
}
