import { createClient } from '@supabase/supabase-js';

// Server-only. Never import this from a 'use client' file — the service
// role key must not reach the browser bundle.
export function getSupabase() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  return createClient(url, key, { auth: { persistSession: false } });
}
