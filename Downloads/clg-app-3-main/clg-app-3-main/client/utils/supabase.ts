import { createClient, type SupabaseClient } from '@supabase/supabase-js';

let cached: SupabaseClient | null = null;

export function getSupabase(): SupabaseClient | null {
  if (cached) return cached;
  const w: any = typeof window !== 'undefined' ? window : {};
  const url = (import.meta as any)?.env?.VITE_SUPABASE_URL || w.ENV?.VITE_SUPABASE_URL || w.ENV?.SUPABASE_URL;
  const anon = (import.meta as any)?.env?.VITE_SUPABASE_ANON_KEY || w.ENV?.VITE_SUPABASE_ANON_KEY || w.ENV?.SUPABASE_ANON_KEY;
  if (!url || !anon) {
    console.warn('Supabase not configured (missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY). Uploads disabled.');
    return null;
  }
  cached = createClient(url, anon);
  return cached;
}
