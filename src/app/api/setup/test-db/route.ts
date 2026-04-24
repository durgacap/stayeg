/**
 * GET /api/setup/test-db
 * Tests database connectivity with detailed error messages.
 */

import { NextRequest, NextResponse } from 'next/server';
import { requireAdminSecret } from '@/lib/api-auth';

export async function GET(request: NextRequest) {
  const secretError = requireAdminSecret(request);
  if (secretError) return secretError;

  const SUPABASE_DB_PASSWORD = 'BizMeals@1998';
  const PROJECT_REF = 'rgkbkdxfekslaygvjngm';

  const attempts = [
    {
      name: 'Direct (IPv4, port 5432)',
      url: `postgresql://postgres:${encodeURIComponent(SUPABASE_DB_PASSWORD)}@db.${PROJECT_REF}.supabase.co:5432/postgres`,
    },
    {
      name: 'Pooler ap-south-1 (port 6543)',
      url: `postgresql://postgres.${PROJECT_REF}:${encodeURIComponent(SUPABASE_DB_PASSWORD)}@aws-0-ap-south-1.pooler.supabase.com:6543/postgres`,
    },
    {
      name: 'Pooler us-east-1 (port 6543)',
      url: `postgresql://postgres.${PROJECT_REF}:${encodeURIComponent(SUPABASE_DB_PASSWORD)}@aws-0-us-east-1.pooler.supabase.com:6543/postgres`,
    },
    {
      name: 'Pooler us-west-1 (port 6543)',
      url: `postgresql://postgres.${PROJECT_REF}:${encodeURIComponent(SUPABASE_DB_PASSWORD)}@aws-0-us-west-1.pooler.supabase.com:6543/postgres`,
    },
    {
      name: 'Pooler eu-west-1 (port 6543)',
      url: `postgresql://postgres.${PROJECT_REF}:${encodeURIComponent(SUPABASE_DB_PASSWORD)}@aws-0-eu-west-1.pooler.supabase.com:6543/postgres`,
    },
    {
      name: 'Pooler ap-southeast-1 (port 6543)',
      url: `postgresql://postgres.${PROJECT_REF}:${encodeURIComponent(SUPABASE_DB_PASSWORD)}@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres`,
    },
    {
      name: 'Pooler us-east-2 (port 6543)',
      url: `postgresql://postgres.${PROJECT_REF}:${encodeURIComponent(SUPABASE_DB_PASSWORD)}@aws-0-us-east-2.pooler.supabase.com:6543/postgres`,
    },
    {
      name: 'Pooler sa-east-1 (port 6543)',
      url: `postgresql://postgres.${PROJECT_REF}:${encodeURIComponent(SUPABASE_DB_PASSWORD)}@aws-0-sa-east-1.pooler.supabase.com:6543/postgres`,
    },
  ];

  const pg = await import('pg');
  const { Client } = pg;
  const results: { name: string; url: string; error: string; success: boolean }[] = [];

  for (const attempt of attempts) {
    try {
      const opts: any = {
        connectionString: attempt.url,
        ssl: { rejectUnauthorized: false },
        statement_timeout: 5000,
        connectionTimeoutMillis: 8000,
      };
      
      const client = new Client(opts);
      await client.connect();
      const r = await client.query('SELECT version() as v, current_database() as db');
      await client.end();
      results.push({ name: attempt.name, url: attempt.url.replace(/BizMeals[^@:@]+/, '***'), error: '', success: true });
      return NextResponse.json({ 
        success: true, 
        message: `Connected via: ${attempt.name}`,
        dbVersion: r.rows[0].v,
        database: r.rows[0].db,
        results 
      });
    } catch (e: any) {
      results.push({ 
        name: attempt.name, 
        url: attempt.url.replace(/BizMeals[^@:@]+/, '***'), 
        error: e.message?.substring(0, 120) || String(e), 
        success: false 
      });
    }
  }

  return NextResponse.json({
    success: false,
    message: 'All connection methods failed',
    results,
  }, { status: 500 });
}
