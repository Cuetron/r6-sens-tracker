import { createClient } from '@supabase/supabase-js';

// Shared Supabase client for SERVER code only. Pages should read players through
// lib/players.ts rather than querying with this client directly.
//
// Next.js caches fetches made during a build, and that cache can be carried over
// into the next build. The header below is different for every build, so each
// deploy is guaranteed to read fresh data from Supabase instead of reusing what an
// earlier build saw. (Supabase ignores the header.)
const BUILD_KEY = `${process.env.VERCEL_DEPLOYMENT_ID ?? 'local'}-${Date.now()}`;

// Do NOT use this client in "use client" components (e.g. ContactWidget): the
// contact form writes to Supabase with its own client.
export const supabaseServer = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  { global: { headers: { 'x-build-key': BUILD_KEY } } }
);
