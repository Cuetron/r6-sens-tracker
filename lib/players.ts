import { cache } from 'react';
import { supabaseServer } from '@/lib/supabase-server';
import { normalizePlayer, type Player } from '@/lib/player-model';

// One read of the whole Players table, shared by every page and metadata
// function in the same render (React `cache`) and stored in Next's Data Cache
// for 5 minutes by the client in lib/supabase-server.ts.
//
// Same rule as before: a Supabase error THROWS, so a temporary outage can never
// be saved as the page for the next 5 minutes (the last good version stays up).
export const getPlayers = cache(async (): Promise<Player[]> => {
  const { data, error } = await supabaseServer
    .from('Players')
    .select('*')
    .order('name', { ascending: true });

  if (error) throw new Error(`Error fetching players: ${error.message}`);

  return (data ?? []).map((row) => normalizePlayer(row as Record<string, unknown>));
});
