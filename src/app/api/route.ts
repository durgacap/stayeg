import { supabase } from '@/lib/supabase';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const { error } = await supabase.from('users').select('id').limit(1);
    if (error) {
      const msg = String(error.message ?? '');
      const isMissing = msg.includes('does not exist') || msg.includes('not find') || msg.includes('PGRST205');
      return NextResponse.json({
        status: 'ok',
        version: '1.2.0',
        database: isMissing ? 'demo_mode' : 'error',
        message: isMissing ? 'Running in demo mode — database tables not yet created' : 'Database connection issue',
      });
    }
    return NextResponse.json({ status: 'ok', version: '1.2.0', database: 'connected' });
  } catch {
    return NextResponse.json({ status: 'ok', version: '1.2.0', database: 'demo_mode' });
  }
}
