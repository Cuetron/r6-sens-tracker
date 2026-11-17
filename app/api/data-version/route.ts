import { playersHash } from '@/lib/players';

// Built once per deploy: a fingerprint of the Players data this deploy was built
// with. Used by app/api/rebuild to tell whether a redeploy is needed.
export const dynamic = 'force-static';

export async function GET() {
  return new Response(await playersHash(), {
    headers: { 'content-type': 'text/plain' },
  });
}
