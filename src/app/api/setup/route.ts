import { supabase } from '@/lib/supabase';
import { NextResponse } from 'next/server';

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

async function checkTableExists(name: TableName): Promise<boolean> {
  try {
    const { error } = await supabase.from(name).select('id').limit(1);
    return !error;
  } catch {
    return false;
  }
}

async function getTableCount(name: TableName): Promise<number> {
  try {
    const { count, error } = await supabase
      .from(name)
      .select('*', { count: 'exact', head: true });
    return error ? 0 : (count ?? 0);
  } catch {
    return 0;
  }
}

export async function GET() {
  try {
    // Check connection first
    const { error: connError } = await supabase.from('users').select('id').limit(1);

    if (connError && connError.code === '42P01') {
      // Relation doesn't exist — tables not created yet
      return NextResponse.json({
        setup: false,
        connected: true,
        tables: [],
        missing: [...REQUIRED_TABLES],
        message: 'Database is connected but tables have not been created yet. Please follow the setup guide below.',
        stats: null,
      });
    }

    if (connError) {
      // Connection issue
      return NextResponse.json({
        setup: false,
        connected: false,
        tables: [],
        missing: [...REQUIRED_TABLES],
        message: `Cannot connect to database: ${connError.message}`,
        stats: null,
        error: connError.message,
      });
    }

    // Check each table individually
    const results = await Promise.all(
      REQUIRED_TABLES.map(async (name) => ({
        name,
        exists: await checkTableExists(name),
        count: await getTableCount(name),
      }))
    );

    const existing = results.filter((r) => r.exists).map((r) => r.name);
    const missing = results.filter((r) => !r.exists).map((r) => r.name);
    const allReady = missing.length === 0;

    const stats: Record<string, number> = {};
    for (const r of results) {
      if (r.exists) stats[r.name] = r.count;
    }

    return NextResponse.json({
      setup: allReady,
      connected: true,
      tables: existing,
      missing,
      tableDetails: results,
      stats: allReady ? stats : null,
      message: allReady
        ? 'Database is fully set up and ready!'
        : `Connected! ${existing.length}/${REQUIRED_TABLES.length} tables found. ${missing.length} table(s) still missing.`,
    });
  } catch (error) {
    console.error('Setup check error:', error);
    return NextResponse.json(
      {
        setup: false,
        connected: false,
        tables: [],
        missing: [...REQUIRED_TABLES],
        message: 'Failed to check database status',
        error: String(error),
        stats: null,
      },
      { status: 500 }
    );
  }
}
