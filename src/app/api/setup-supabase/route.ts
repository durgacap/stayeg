import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

// Use service_role key for admin operations
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const serviceClient = supabaseServiceKey
  ? createClient(supabaseUrl, supabaseServiceKey)
  : null;

const REQUIRED_TABLES = [
  'users',
  'pgs',
  'rooms',
  'beds',
  'bookings',
  'payments',
  'complaints',
  'vendors',
  'workers',
] as const;

type TableName = (typeof REQUIRED_TABLES)[number];

/** Check if a specific table exists and is queryable */
async function checkTable(name: TableName): Promise<{ exists: boolean; count: number }> {
  if (!serviceClient) return { exists: false, count: 0 };
  try {
    const { count, error } = await serviceClient
      .from(name)
      .select('*', { count: 'exact', head: true });

    if (error) {
      // Relation does not exist
      if (error.code === '42P01') return { exists: false, count: 0 };
      return { exists: false, count: 0 };
    }
    return { exists: true, count: count ?? 0 };
  } catch {
    return { exists: false, count: 0 };
  }
}

export async function GET() {
  try {
    // ---- Phase 1: Read the SQL file ----
    const sqlPath = path.join(process.cwd(), 'supabase-schema.sql');
    const sqlContent = fs.existsSync(sqlPath)
      ? fs.readFileSync(sqlPath, 'utf-8')
      : null;

    // ---- Phase 2: Check each table ----
    const results = await Promise.all(
      REQUIRED_TABLES.map(async (name) => {
        const info = await checkTable(name);
        return { name, ...info };
      })
    );

    const existing = results.filter((r) => r.exists);
    const missing = results.filter((r) => !r.exists);
    const allReady = missing.length === 0;

    // ---- Phase 3: Build response ----
    return NextResponse.json({
      status: allReady ? 'ready' : 'needs_setup',
      connected: true,
      totalTables: REQUIRED_TABLES.length,
      existingCount: existing.length,
      missingCount: missing.length,
      existing: existing.map((r) => ({ table: r.name, rows: r.count })),
      missing: missing.map((r) => r.name),
      message: allReady
        ? 'All 9 tables exist and are ready. You can seed data via POST /api/seed-supabase'
        : `${missing.length} table(s) missing. Run the SQL below in Supabase SQL Editor.`,
      setupGuide: allReady
        ? null
        : {
            step1: 'Go to Supabase Dashboard → SQL Editor',
            step2: sqlContent
              ? 'Copy the SQL from supabase-schema.sql (also returned below) and paste it into the editor'
              : 'The SQL file supabase-schema.sql was not found in the project root. Create it or use the SQL returned in the `sql` field.',
            step3: 'Click "Run" to execute the SQL',
            step4: 'After tables are created, seed data by calling POST /api/seed-supabase',
            alternative: {
              title: 'Or use the auto-setup endpoint (requires DB password)',
              description: 'POST /api/setup-db with { dbPassword } in the body and x-admin-secret header',
            },
          },
      sql: sqlContent,
    });
  } catch (error) {
    console.error('Setup check error:', error);
    return NextResponse.json(
      {
        status: 'error',
        connected: false,
        message: 'Failed to check database setup status',
        error: String(error),
      },
      { status: 500 }
    );
  }
}
