import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const ADMIN_SECRET = process.env.ADMIN_SECRET || 'stayeg-v1.2-secure-2025';
const PROJECT_REF = 'rgkbkdxfekslaygvjngm';

const REQUIRED_TABLES = [
  'users', 'pgs', 'rooms', 'beds', 'bookings',
  'payments', 'complaints', 'vendors', 'workers',
] as const;

/** Check if a table exists and get count via regular GET (not HEAD) */
async function checkTable(name: string): Promise<{ exists: boolean; count: number }> {
  try {
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);
    // NOTE: Must use regular select, NOT head:true — the Supabase JS client
    // does not surface PGRST205 errors on HEAD requests (returns 204 with null error).
    const { data, error } = await supabase.from(name).select('id').limit(1);
    if (error) return { exists: false, count: 0 };
    // Get accurate count
    const { count } = await supabase.from(name).select('*', { count: 'exact', head: true });
    return { exists: true, count: count ?? 0 };
  } catch {
    return { exists: false, count: 0 };
  }
}

/** Try to create tables via direct pg connection */
async function createTablesViaPg(dbPassword: string): Promise<{ success: boolean; error?: string; tables?: string[] }> {
  const pw = encodeURIComponent(dbPassword);
  const connectionStrings = [
    `postgresql://postgres.${PROJECT_REF}:${pw}@aws-0-ap-south-1.pooler.supabase.com:6543/postgres`,
    `postgresql://postgres.${PROJECT_REF}:${pw}@aws-0-ap-south-1.pooler.supabase.com:5432/postgres`,
    `postgresql://postgres:${pw}@db.${PROJECT_REF}.supabase.co:5432/postgres`,
  ];

    const pg = (await import('pg')).default;
  let lastError = '';

  for (const connStr of connectionStrings) {
    const pool = new pg.Pool({
      connectionString: connStr,
      ssl: { rejectUnauthorized: false },
      connectionTimeoutMillis: 15000,
      max: 1,
    });

    try {
      const client = await pool.connect();
      await client.query('SELECT 1');

      // Read the SQL file
      const sqlPath = path.join(process.cwd(), 'supabase-schema.sql');
      const sql = fs.readFileSync(sqlPath, 'utf-8');

      await client.query(sql);

      // Get created tables
      const { rows } = await client.query(
        `SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' AND table_type = 'BASE TABLE' ORDER BY table_name`
      );

      await client.release();
      await pool.end();

      return {
        success: true,
        tables: rows.map((t: { table_name: string }) => t.table_name),
      };
    } catch (err) {
      lastError = err instanceof Error ? err.message : String(err);
      await pool.end().catch(() => {});
    }
  }

  return { success: false, error: lastError };
}

/** GET: Check database status and return SQL if needed */
export async function GET() {
  try {
    const results = await Promise.all(
      REQUIRED_TABLES.map(async (name) => {
        const info = await checkTable(name);
        return { name, ...info };
      })
    );

    const existing = results.filter((r) => r.exists);
    const missing = results.filter((r) => !r.exists);
    const allReady = missing.length === 0;

    const sqlPath = path.join(process.cwd(), 'supabase-schema.sql');
    const sqlContent = fs.existsSync(sqlPath) ? fs.readFileSync(sqlPath, 'utf-8') : null;

    return NextResponse.json({
      status: allReady ? 'ready' : 'needs_setup',
      connected: true,
      tables: {
        existing: existing.map((r) => ({ table: r.name, rows: r.count })),
        missing: missing.map((r) => r.name),
      },
      counts: Object.fromEntries(results.map((r) => [r.name, r.count])),
      details: results,
      totalExisting: existing.length,
      totalMissing: missing.length,
      sql: sqlContent,
      guide: allReady ? null : {
        step1: 'Option A: Provide your DB password to POST /api/init-db',
        step2: 'Option B: Copy the SQL from the "sql" field and run it in Supabase Dashboard → SQL Editor',
        step3: 'After tables exist, seed data via POST /api/seed-supabase with x-admin-secret header',
        dashboardUrl: `https://supabase.com/dashboard/project/${PROJECT_REF}/sql`,
        passwordLocation: 'Supabase Dashboard → Settings → Database → Database password',
      },
    });
  } catch (error) {
    return NextResponse.json(
      { status: 'error', message: 'Failed to check database', error: String(error) },
      { status: 500 }
    );
  }
}

/** POST: Create tables (requires dbPassword) or get SQL */
export async function POST(request: NextRequest) {
  try {
    const adminSecret = request.headers.get('x-admin-secret');
    if (adminSecret !== ADMIN_SECRET) {
      return NextResponse.json({ error: 'Forbidden: Invalid or missing admin secret' }, { status: 403 });
    }

    const body = await request.json().catch(() => ({}));
    const { dbPassword } = body;

    if (!dbPassword || typeof dbPassword !== 'string') {
      const sqlPath = path.join(process.cwd(), 'supabase-schema.sql');
      const sqlContent = fs.existsSync(sqlPath) ? fs.readFileSync(sqlPath, 'utf-8') : null;

      return NextResponse.json({
        success: false,
        code: 'NO_PASSWORD',
        message: 'Database password is required to create tables automatically.',
        instructions: {
          howToGetPassword: 'Go to Supabase Dashboard → Settings → Database → Database password',
          dashboardUrl: `https://supabase.com/dashboard/project/${PROJECT_REF}/settings/database`,
          alternative: 'Or run the SQL manually in Supabase Dashboard → SQL Editor',
          sqlEditorUrl: `https://supabase.com/dashboard/project/${PROJECT_REF}/sql`,
        },
        usage: 'POST /api/init-db with { "dbPassword": "your-password" } and x-admin-secret header',
        sql: sqlContent,
      });
    }

    // Try to create tables via direct PostgreSQL connection
    const result = await createTablesViaPg(dbPassword);

    if (result.success) {
      // Reload schema cache for PostgREST
      try {
        const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);
        await supabase.from('users').select('id', { count: 'exact', head: true });
      } catch {
        // Ignore - schema cache might take a moment
      }

      return NextResponse.json({
        success: true,
        message: 'All tables created successfully!',
        tables: result.tables,
        tableCount: result.tables?.length ?? 0,
        nextStep: 'Seed data by calling POST /api/seed-supabase with x-admin-secret header',
      });
    }

    return NextResponse.json(
      {
        success: false,
        code: 'CONNECTION_FAILED',
        message: 'Could not connect to database with provided password.',
        error: result.error,
        hint: 'Make sure you are using the database password (not the API keys). Find it at: Supabase Dashboard → Settings → Database',
        sqlEditorAlternative: `https://supabase.com/dashboard/project/${PROJECT_REF}/sql`,
      },
      { status: 500 }
    );
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Setup failed', details: String(error) },
      { status: 500 }
    );
  }
}
