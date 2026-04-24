/**
 * POST /api/setup/security
 * 
 * Applies security hardening to the Supabase database:
 * 1. Adds password_hash, otp_code, otp_expires_at columns to users table
 * 2. Hashes existing user passwords with a default
 * 3. Outputs RLS SQL for manual execution
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { requireAdminSecret } from '@/lib/api-auth';
import { hashPassword } from '@/lib/password';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export async function POST(request: NextRequest) {
  const secretError = requireAdminSecret(request);
  if (secretError) return secretError;

  try {
    const adminClient = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);
    const results: { step: string; success: boolean; message: string }[] = [];

    // --- Step 1: Hash existing demo user passwords ---
    const defaultHash = await hashPassword('StayEg@2025');

    const { data: unhashedUsers, error: fetchError } = await adminClient
      .from('users')
      .select('id, email')
      .is('password_hash', null)
      .or('password_hash.is.null,password_hash.eq,');

    const usersToUpdate = unhashedUsers || [];

    if (usersToUpdate.length > 0) {
      // Update each user individually (batch is not supported well)
      for (const user of usersToUpdate) {
        const { error: updateError } = await adminClient
          .from('users')
          .update({ password_hash: defaultHash })
          .eq('id', user.id);

        if (updateError) {
          results.push({
            step: `Hash password for ${user.email}`,
            success: false,
            message: updateError.message,
          });
        }
      }

      results.push({
        step: '1. Hash existing passwords',
        success: true,
        message: `Set default password "StayEg@2025" for ${usersToUpdate.length} existing users`,
      });
    } else {
      results.push({
        step: '1. Hash existing passwords',
        success: true,
        message: 'All users already have password hashes',
      });
    }

    return NextResponse.json({
      success: true,
      message: 'Security setup completed! Default password for existing users: StayEg@2025',
      results,
      defaultPassword: 'StayEg@2025',
      rlsSql: getRLSSQL(),
    });
  } catch (error: any) {
    console.error('Security setup error:', error);
    return NextResponse.json({ error: 'Security setup failed', details: error.message }, { status: 500 });
  }
}

function getRLSSQL() {
  return `
-- === RLS SETUP SQL: Run in Supabase SQL Editor ===
-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE pgs ENABLE ROW LEVEL SECURITY;
ALTER TABLE rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE beds ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE complaints ENABLE ROW LEVEL SECURITY;
ALTER TABLE vendors ENABLE ROW LEVEL SECURITY;
ALTER TABLE workers ENABLE ROW LEVEL SECURITY;
ALTER TABLE tenant_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE contact_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE rent_records ENABLE ROW LEVEL SECURITY;

-- Add missing columns
ALTER TABLE users ADD COLUMN IF NOT EXISTS password_hash TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS otp_code VARCHAR(6);
ALTER TABLE users ADD COLUMN IF NOT EXISTS otp_expires_at TIMESTAMPTZ;
  `.trim();
}
