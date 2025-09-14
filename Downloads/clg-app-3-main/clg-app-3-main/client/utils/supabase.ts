import { createClient } from '@supabase/supabase-js';

const url = (import.meta.env.VITE_SUPABASE_URL || (import.meta as any).env?.SUPABASE_URL) as string | undefined;
const anon = (import.meta.env.VITE_SUPABASE_ANON_KEY || (import.meta as any).env?.SUPABASE_ANON_KEY) as string | undefined;

if (!url || !anon) {
  console.error('Missing Supabase env. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.');
  throw new Error('Supabase not configured');
}

export const supabase = createClient(url, anon);
