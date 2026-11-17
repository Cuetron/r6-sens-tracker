import { playersHash } from '@/lib/players';

// Called once a day by the Vercel Cron Job in vercel.json. If the Players table has
// changed since the live deploy was built, it triggers a redeploy through a Vercel
// Deploy Hook so the new data goes live. If nothing changed, it does nothing.
//
// Needs two environment variables in Vercel:
//   CRON_SECRET             any long random string (Vercel sends it with cron calls)
//   VERCEL_DEPLOY_HOOK_URL  Settings -> Git -> Deploy Hooks -> create one for `main`
//
// To publish right away instead of waiting for the daily run:
//   curl -H "Authorization: Bearer <CRON_SECRET>" https://<your-domain>/api/rebuild
// Add ?force=1 to redeploy even if the data looks unchanged.
export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret || request.headers.get('authorization') !== `Bearer ${secret}`) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const hook = process.env.VERCEL_DEPLOY_HOOK_URL;
  if (!hook) {
    return Response.json({ error: 'VERCEL_DEPLOY_HOOK_URL is not set' }, { status: 500 });
  }

  const force = new URL(request.url).searchParams.has('force');
  const live = await playersHash();
  const builtRes = await fetch(new URL('/api/data-version', request.url), { cache: 'no-store' });
  const built = builtRes.ok ? (await builtRes.text()).trim() : '';

  if (!force && built === live) {
    return Response.json({ rebuilt: false, reason: 'Players data unchanged' });
  }

  const res = await fetch(hook, { method: 'POST', cache: 'no-store' });
  return Response.json({ rebuilt: res.ok, status: res.status }, { status: res.ok ? 200 : 502 });
}
