import { timingSafeEqual } from 'node:crypto';
import { revalidateTag } from 'next/cache';
import { PLAYERS_TAG } from '@/lib/players';

// On-demand refresh: call this when the Players table changes, and every page
// shows the new data on its next visit. Pages whose content didn't actually change
// regenerate to identical output, so Vercel doesn't charge an ISR write for them.
//
// Setup (Supabase dashboard -> Database -> Webhooks -> Create a new hook):
//   Table:   Players
//   Events:  Insert, Update, Delete
//   Type:    HTTP Request, POST
//   URL:     https://<your-domain>/api/revalidate
//   Header:  x-revalidate-secret: <same value as REVALIDATE_SECRET in Vercel>
//
// Then add REVALIDATE_SECRET to the Vercel project's environment variables.

function secretMatches(given: string | null) {
  const expected = process.env.REVALIDATE_SECRET;
  if (!expected || !given) return false;
  const a = Buffer.from(given);
  const b = Buffer.from(expected);
  return a.length === b.length && timingSafeEqual(a, b);
}

export async function POST(request: Request) {
  if (!secretMatches(request.headers.get('x-revalidate-secret'))) {
    return Response.json({ revalidated: false, message: 'Invalid secret' }, { status: 401 });
  }

  // Expire right away so the next visitor gets fresh data (recommended form for
  // webhooks in Next.js 16). Nothing is rebuilt until a page is actually visited.
  revalidateTag(PLAYERS_TAG, { expire: 0 });

  return Response.json({ revalidated: true });
}
