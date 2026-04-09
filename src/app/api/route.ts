import { supabase } from '@/lib/supabase';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Check Supabase connectivity
    const { error } = await supabase.from('users').select('id').limit(1);
    if (error) {
      return NextResponse.json({ message: 'Hello, world!', supabase: 'disconnected', error: error.message });
    }
    return NextResponse.json({ message: 'Hello, world!', supabase: 'connected' });
  } catch {
    return NextResponse.json({ message: 'Hello, world!', supabase: 'error' });
  }
}
