import { cache } from 'react';
import { supabaseServer } from './supabase-server';
import { normalizePlayer, type Player } from '@/lib/player-model';

// All player data the pages read goes through these helpers.
//
// The site is FULLY STATIC: every page is built once, during the deploy, and
// never regenerated afterwards. That means zero ISR writes from visitors or bots.
// To publish new Supabase data, trigger a redeploy: the daily cron in vercel.json
// calls app/api/rebuild, which redeploys only when the Players table changed.
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

// The whole table as Player objects (see lib/player-model.ts). This is what the
// redesigned pages use; they filter in code. React `cache` shares one result
// between generateMetadata and the page in the same render.
export const getPlayers = cache(async (): Promise<Player[]> => {
  const rows = await getAllPlayers();
  return rows.map((row) => normalizePlayer(row as Record<string, unknown>));
});

// Just id, name, team and region (kept from main for any code that still uses it).
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
