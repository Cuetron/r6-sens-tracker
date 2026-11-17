import { supabaseServer } from './supabase-server';

// All player data the pages read goes through these helpers.
//
// The site is now FULLY STATIC: every page is built once, during the deploy,
// and never regenerated afterwards. That means zero ISR writes from visitors or
// bots. To publish new Supabase data, trigger a redeploy. The
// .github/workflows/rebuild-site.yml workflow does this on a schedule and has a
// "Run workflow" button for publishing right away.
//
// One Supabase query (getAllPlayers) feeds every page. Next.js reuses its result
// across the pages built in the same deploy, so a build makes only a few requests.

export type PlayerIndexRow = {
  id: number;
  name: string;
  team: string | null;
  region: string | null;
};

// Every column for every player, sorted by name (id breaks ties).
// Errors are thrown so a Supabase outage fails the build loudly; the previous
// deployment then stays live instead of a site with an empty player list going out.
export async function getAllPlayers() {
  const { data, error } = await supabaseServer
    .from('Players')
    .select('*')
    .order('name', { ascending: true })
    .order('id', { ascending: true });

  if (error) throw new Error(`Error fetching players: ${error.message}`);
  return data ?? [];
}

// Just what the home page, region and team pages need (keeps the home page small).
export async function getPlayerIndex(): Promise<PlayerIndexRow[]> {
  const players = await getAllPlayers();
  return players.map((p) => ({ id: p.id, name: p.name, team: p.team, region: p.region }));
}

// Full row for one player, or null if there is no such player.
export async function getPlayerById(id: string) {
  const players = await getAllPlayers();
  return players.find((p) => String(p.id) === id) ?? null;
}

// Same matching the old `.ilike('region', ...)` query did: case-insensitive equality.
export function inRegion(player: PlayerIndexRow, region: string) {
  return (player.region ?? '').toUpperCase() === region.toUpperCase();
}

// Fingerprint of the whole Players table. app/api/data-version stores the value a
// deploy was built with, and app/api/rebuild compares it with the live value so it
// only triggers a redeploy when the data actually changed.
export async function playersHash() {
  const { createHash } = await import('node:crypto');
  return createHash('sha256').update(JSON.stringify(await getAllPlayers())).digest('hex');
}
