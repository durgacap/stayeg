import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY');
}

/** Check if a Supabase error indicates a missing table (demo mode) */
export function isTableMissing(error: unknown): boolean {
  if (!error || typeof error !== 'object') return false;
  const msg = String((error as any).message ?? '');
  return msg.includes('does not exist') || msg.includes('not find') || msg.includes('PGRST205') || msg.includes('relation');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
  },
  db: {
    schema: 'public',
  },
});

export default supabase;
