import { createClient } from '@supabase/supabase-js';

// Shared Supabase client for SERVER components only (pages that read Players).
//
// Every request this client makes is stored in Next.js's Data Cache and reused
// for 300 seconds (5 minutes). After that, the next visitor triggers a fresh
// fetch in the background, so edits you make in Supabase show up within ~5 minutes.
//
// To change how stale data may get, change the number below AND the
// `export const revalidate = ...` line at the top of each page that reads data
// (Next.js needs those page values to be plain numbers, so they can't import this one).
//
// Do NOT use this client in "use client" components (e.g. ContactWidget): the
// contact form writes to Supabase and must never be cached.
const REVALIDATE_SECONDS = 300;

export const supabaseServer = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  {
    global: {
      fetch: (input, init) =>
        fetch(input, {
          ...init,
          next: { revalidate: REVALIDATE_SECONDS },
        } as RequestInit),
    },
  }
);
