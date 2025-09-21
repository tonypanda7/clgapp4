import { createClient, type SupabaseClient } from '@supabase/supabase-js';

let cached: SupabaseClient | null = null;

export function getSupabase(): SupabaseClient | null {
  if (cached) return cached;
  const w: any = typeof window !== 'undefined' ? window : {};
  const FALLBACK_URL = 'https://gynuutntffaymcxgnqrc.supabase.co';
  const FALLBACK_ANON = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd5bnV1dG50ZmZheW1jeGducXJjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc4MzUyMjMsImV4cCI6MjA3MzQxMTIyM30.BFIcNQ_DrMhPDQubw2ZssjzNH2b1hD9cUuIMJl-ldW0';

  const url = (import.meta as any)?.env?.VITE_SUPABASE_URL || w.ENV?.VITE_SUPABASE_URL || w.ENV?.SUPABASE_URL || FALLBACK_URL;
  const anon = (import.meta as any)?.env?.VITE_SUPABASE_ANON_KEY || w.ENV?.VITE_SUPABASE_ANON_KEY || w.ENV?.SUPABASE_ANON_KEY || FALLBACK_ANON;

  cached = createClient(url, anon);
  return cached;
}
