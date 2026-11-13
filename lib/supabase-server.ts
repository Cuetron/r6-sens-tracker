import { createClient } from '@supabase/supabase-js';

// Shared Supabase client for SERVER code only.
//
// Do NOT query with this client directly from a page. Use the cached helpers in
// lib/players.ts instead. Here's why:
//
// A plain `fetch` cache stores the whole HTTP response, headers included, and
// Supabase sends new `date` / `cf-ray` / request-id headers on every response.
// So each time a cached entry refreshed, Vercel saw "new content" and charged
// an ISR write, even if no player data had changed. The helpers in lib/players.ts
// cache only the query *result* (plain JSON), so a refresh with unchanged data
// produces identical output and Vercel does not charge an ISR write for it.
//
// Do NOT use this client in "use client" components (e.g. ContactWidget): the
// contact form writes to Supabase and must never be cached.
export const supabaseServer = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);
