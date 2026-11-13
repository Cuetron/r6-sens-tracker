import { unstable_cache } from 'next/cache';
import { supabaseServer } from './supabase-server';

// All player data the pages read goes through these helpers.
//
// How this keeps ISR writes down:
//  1. Only the query result (plain JSON) is cached, not the raw HTTP response.
//     Unchanged data -> identical cached output -> Vercel charges no ISR write.
//  2. The home page, region pages, team pages and generateStaticParams all share
//     ONE cached query (getPlayerIndex) instead of one cache entry per page.
//  3. Everything is tagged PLAYERS_TAG, so app/api/revalidate can refresh the
//     site the moment Players changes. That means the timer below is only a
//     backstop and can stay long.
//
// If you change REVALIDATE_SECONDS, also change the `export const revalidate = ...`
// line in each page (Next.js needs those to be plain numbers in the page file).
export const PLAYERS_TAG = 'players';
export const REVALIDATE_SECONDS = 3600;

export type PlayerIndexRow = {
  id: number;
  name: string;
  team: string | null;
  region: string | null;
};

// id, name, team, region for every player, sorted by name (id breaks ties so the
// order, and so the cached output, stays the same between refreshes).
//
// Errors are thrown, not returned: a thrown error is never cached, so a temporary
// Supabase outage can't get saved as an empty list or a 404 page.
export const getPlayerIndex = unstable_cache(
  async (): Promise<PlayerIndexRow[]> => {
    const { data, error } = await supabaseServer
      .from('Players')
      .select('id, name, team, region')
      .order('name', { ascending: true })
      .order('id', { ascending: true });

    if (error) throw new Error(`Error fetching players: ${error.message}`);
    return (data ?? []) as PlayerIndexRow[];
  },
  ['player-index'],
  { tags: [PLAYERS_TAG], revalidate: REVALIDATE_SECONDS }
);

// Full row for one player, or null if there is no such player.
export const getPlayerById = unstable_cache(
  async (id: string) => {
    // Player ids are numbers. Anything else is a 404 without asking Supabase.
    if (!/^\d+$/.test(id)) return null;

    const { data, error } = await supabaseServer
      .from('Players')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error) throw new Error(`Error fetching player ${id}: ${error.message}`);
    return data;
  },
  ['player-by-id'],
  { tags: [PLAYERS_TAG], revalidate: REVALIDATE_SECONDS }
);

// Same matching the old `.ilike('region', ...)` query did: case-insensitive equality.
export function inRegion(player: PlayerIndexRow, region: string) {
  return (player.region ?? '').toUpperCase() === region.toUpperCase();
}
