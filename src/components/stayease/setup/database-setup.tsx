'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Database, CheckCircle2, AlertTriangle, Copy, Check, ExternalLink,
  RefreshCw, Shield, Server, Zap, ChevronDown, ChevronUp,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

interface SetupStatus {
  status: 'setup_required' | 'ready' | 'error';
  message: string;
  sql?: string;
  tablesFound?: boolean;
  stats?: {
    users: number;
    pgs: number;
    beds: number;
  };
  error?: string;
}

export default function DatabaseSetup({ onReady }: { onReady: () => void }) {
  const [setupStatus, setSetupStatus] = useState<SetupStatus | null>(null);
  const [checking, setChecking] = useState(true);
  const [copied, setCopied] = useState(false);
  const [showSql, setShowSql] = useState(false);
  const [checkingAfterSetup, setCheckingAfterSetup] = useState(false);
  const sqlRef = useRef<HTMLPreElement>(null);
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';

  const checkDatabase = async () => {
    try {
      setChecking(true);
      const res = await fetch('/api/setup');
      const data: SetupStatus = await res.json();
      setSetupStatus(data);
      
      if (data.status === 'ready') {
        onReady();
      }
    } catch (err) {
      setSetupStatus({
        status: 'error',
        message: 'Failed to connect to database',
        error: String(err),
      });
    } finally {
      setChecking(false);
    }
  };

  useEffect(() => {
    checkDatabase();
  }, []);

  const handleCopySQL = async () => {
    if (!setupStatus?.sql) return;
    try {
      await navigator.clipboard.writeText(setupStatus.sql);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
      const textarea = document.createElement('textarea');
      textarea.value = setupStatus.sql;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleOpenSupabase = () => {
    window.open(`${supabaseUrl}/project/sbwmecxkbfijanwwuvvt/sql/new`, '_blank');
  };

  const handleCheckAgain = async () => {
    setCheckingAfterSetup(true);
    await checkDatabase();
    setCheckingAfterSetup(false);
  };

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
              className="absolute inset-0 rounded-full border-4 border-brand-teal/20 border-t-brand-teal"
            />
            <Database className="absolute inset-0 m-auto w-7 h-7 text-brand-teal" />
          </div>
          <div>
            <p className="text-lg font-semibold text-foreground">Connecting to Supabase...</p>
            <p className="text-sm text-muted-foreground mt-1">Checking database setup</p>
          </div>
        </motion.div>
      </div>
    );
  }

  // Database is ready
  if (setupStatus?.status === 'ready') {
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
            className="mx-auto w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center"
          >
            <CheckCircle2 className="w-8 h-8 text-green-600 dark:text-green-400" />
          </motion.div>
          <div>
            <p className="text-xl font-bold text-foreground">Database Connected!</p>
            <p className="text-sm text-muted-foreground mt-1">
              Your Supabase backend is ready
            </p>
          </div>
          {setupStatus.stats && (
            <div className="flex gap-4 justify-center mt-4">
              {[
                { label: 'Users', value: setupStatus.stats.users, color: 'text-brand-teal' },
                { label: 'PGs', value: setupStatus.stats.pgs, color: 'text-brand-deep' },
                { label: 'Beds', value: setupStatus.stats.beds, color: 'text-brand-sage' },
              ].map((stat) => (
                <div key={stat.label} className="bg-muted rounded-lg px-4 py-2">
                  <div className={`text-2xl font-bold ${stat.color}`}>{stat.value}</div>
                  <div className="text-xs text-muted-foreground">{stat.label}</div>
                </div>
              ))}
            </div>
          )}
        </motion.div>
      </div>
    );
  }

  // Error state
  if (setupStatus?.status === 'error') {
    return (
      <div className="min-h-[60vh] flex items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-md w-full text-center space-y-4"
        >
          <div className="mx-auto w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center">
            <AlertTriangle className="w-8 h-8 text-red-600 dark:text-red-400" />
          </div>
          <div>
            <p className="text-xl font-bold text-foreground">Connection Error</p>
            <p className="text-sm text-muted-foreground mt-1">{setupStatus.message}</p>
          </div>
          <Button onClick={checkDatabase} variant="outline">
            <RefreshCw className="w-4 h-4 mr-2" />
            Try Again
          </Button>
        </motion.div>
      </div>
    );
  }

  // Setup required
  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-2xl w-full space-y-6"
      >
        {/* Header */}
        <div className="text-center space-y-3">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 200 }}
            className="mx-auto w-16 h-16 bg-gradient-to-br from-brand-deep to-brand-teal rounded-2xl flex items-center justify-center shadow-lg"
          >
            <Database className="w-8 h-8 text-white" />
          </motion.div>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-foreground">
              Database Setup Required
            </h1>
            <p className="text-muted-foreground mt-2 max-w-lg mx-auto">
              Your Supabase project is connected, but the database tables need to be created.
              Follow the steps below to set up your StayeG backend.
            </p>
          </div>
        </div>

        {/* Status Banner */}
        <Card className="border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-900/20">
          <CardContent className="flex items-center gap-3 p-4">
            <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0" />
            <p className="text-sm text-amber-800 dark:text-amber-200">
              <strong>Setup needed:</strong> 9 database tables with relations, indexes, RLS policies, and sample data.
            </p>
          </CardContent>
        </Card>

        {/* Steps */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
            <Zap className="w-5 h-5 text-brand-teal" />
            Quick Setup (2 minutes)
          </h2>

          <div className="space-y-3">
            {/* Step 1 */}
            <Card className="overflow-hidden">
              <CardHeader className="pb-3">
                <div className="flex items-start gap-3">
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-brand-teal/10 text-brand-teal font-bold text-sm shrink-0">
                    1
                  </div>
                  <div className="flex-1">
                    <CardTitle className="text-base">Copy the SQL Setup Script</CardTitle>
                    <CardDescription className="mt-1">
                      Click the button below to copy the complete database setup SQL to your clipboard.
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-0 pb-3">
                <div className="flex items-center gap-3">
                  <Button
                    onClick={handleCopySQL}
                    className="bg-gradient-to-r from-brand-deep to-brand-teal hover:from-brand-deep/90 hover:to-brand-teal/90 text-white"
                  >
                    {copied ? (
                      <>
                        <Check className="w-4 h-4 mr-2" />
                        Copied!
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4 mr-2" />
                        Copy SQL Setup Script
                      </>
                    )}
                  </Button>
                  <Badge variant="outline" className="text-xs">
                    ~200 lines
                  </Badge>
                </div>

                {/* Collapsible SQL Preview */}
                <div className="mt-3">
                  <button
                    onClick={() => setShowSql(!showSql)}
                    className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showSql ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    {showSql ? 'Hide' : 'Preview'} SQL script
                  </button>
                  <AnimatePresence>
                    {showSql && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden"
                      >
                        <pre
                          ref={sqlRef}
                          className="mt-2 p-3 bg-muted rounded-lg text-xs text-foreground overflow-auto max-h-64 leading-relaxed font-mono"
                        >
                          {setupStatus?.sql || '-- Loading SQL...'}
                        </pre>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </CardContent>
            </Card>

            {/* Step 2 */}
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-start gap-3">
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-brand-teal/10 text-brand-teal font-bold text-sm shrink-0">
                    2
                  </div>
                  <div className="flex-1">
                    <CardTitle className="text-base">Open Supabase SQL Editor</CardTitle>
                    <CardDescription className="mt-1">
                      Go to your Supabase Dashboard and open the SQL Editor.
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-0 pb-3">
                <Button
                  variant="outline"
                  onClick={handleOpenSupabase}
                  className="border-brand-teal/30 text-brand-teal hover:bg-brand-teal/10"
                >
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Open Supabase SQL Editor
                </Button>
              </CardContent>
            </Card>

            {/* Step 3 */}
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-start gap-3">
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-brand-teal/10 text-brand-teal font-bold text-sm shrink-0">
                    3
                  </div>
                  <div className="flex-1">
                    <CardTitle className="text-base">Paste & Run</CardTitle>
                    <CardDescription className="mt-1">
                      Paste the SQL script into the SQL Editor and click <strong>"Run"</strong>. This will create all tables and seed sample data.
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
            </Card>

            {/* Step 4 */}
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-start gap-3">
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-brand-teal/10 text-brand-teal font-bold text-sm shrink-0">
                    4
                  </div>
                  <div className="flex-1">
                    <CardTitle className="text-base">Verify Setup</CardTitle>
                    <CardDescription className="mt-1">
                      Come back here and click the button below to verify everything is working.
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-0 pb-3">
                <Button
                  onClick={handleCheckAgain}
                  disabled={checkingAfterSetup}
                  variant="outline"
                  className="border-brand-teal/30 text-brand-teal hover:bg-brand-teal/10"
                >
                  {checkingAfterSetup ? (
                    <>
                      <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                      Checking...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4 mr-2" />
                      Verify Database Setup
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>

        <Separator />

        {/* What gets created */}
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
            <Server className="w-4 h-4 text-brand-teal" />
            What gets created:
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {[
              { name: 'Users', icon: '👥', count: '10 records' },
              { name: 'PGs', icon: '🏠', count: '8 records' },
              { name: 'Rooms', icon: '🚪', count: '26 records' },
              { name: 'Beds', icon: '🛏️', count: '67 records' },
              { name: 'Bookings', icon: '📋', count: '6 records' },
              { name: 'Payments', icon: '💰', count: '29 records' },
              { name: 'Complaints', icon: '🐛', count: '6 records' },
              { name: 'Vendors', icon: '🔧', count: '8 records' },
              { name: 'Workers', icon: '👷', count: '8 records' },
            ].map((item) => (
              <div
                key={item.name}
                className="bg-muted rounded-lg p-3 text-center"
              >
                <span className="text-xl">{item.icon}</span>
                <div className="text-sm font-medium text-foreground mt-1">{item.name}</div>
                <div className="text-xs text-muted-foreground">{item.count}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Security note */}
        <div className="flex items-start gap-3 p-4 bg-muted rounded-lg">
          <Shield className="w-5 h-5 text-brand-teal shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-foreground">Security Note</p>
            <p className="text-xs text-muted-foreground mt-1">
              Row Level Security (RLS) is enabled on all tables with appropriate policies.
              Your data is protected even with the public API key.
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
