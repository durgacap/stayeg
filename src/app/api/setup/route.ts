import { supabase } from '@/lib/supabase';
import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET() {
  try {
    // Check if tables exist by trying to query users table
    const { error } = await supabase.from('users').select('id').limit(1);

    if (error) {
      // Tables don't exist yet - read the SQL file
      const sqlPath = path.join(process.cwd(), 'supabase/migrations/001_create_all_tables.sql');
      const sqlContent = fs.readFileSync(sqlPath, 'utf-8');

      return NextResponse.json({
        status: 'setup_required',
        message: 'Database tables not found. Please run the SQL setup.',
        sql: sqlContent,
        tablesFound: false,
      });
    }

    // Check if data exists
    const { count: userCount } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true });

    const { count: pgCount } = await supabase
      .from('pgs')
      .select('*', { count: 'exact', head: true });

    const { count: bedCount } = await supabase
      .from('beds')
      .select('*', { count: 'exact', head: true });

    return NextResponse.json({
      status: 'ready',
      message: 'Database is set up and ready!',
      tablesFound: true,
      stats: {
        users: userCount || 0,
        pgs: pgCount || 0,
        beds: bedCount || 0,
      },
    });
  } catch (error) {
    console.error('Setup check error:', error);
    return NextResponse.json({
      status: 'error',
      message: 'Failed to check database status',
      error: String(error),
    }, { status: 500 });
  }
}
