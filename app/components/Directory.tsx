"use client";

import { Suspense, useMemo, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import PlayerFilters from './PlayerFilters';

export type DirectoryPlayer = {
  id: number | string;
  name: string;
  team: string | null;
  region: string | null;
};

type FilterKey = 'q' | 'team' | 'region';

// Pure presentation: hero + filters + the player list.
function DirectoryView({
  players,
  q,
  team,
  region,
  onChange,
}: {
  players: DirectoryPlayer[];
  q: string;
  team: string;
  region: string;
  onChange: (key: FilterKey, value: string) => void;
}) {
  // Dropdown options come from ALL players (same as before the filtering moved here)
  const uniqueTeams = useMemo(
    () => Array.from(new Set(players.map((p) => p.team).filter(Boolean) as string[])).sort(),
    [players]
  );
  const uniqueRegions = useMemo(
    () => Array.from(new Set(players.map((p) => p.region).filter(Boolean) as string[])).sort(),
    [players]
  );

  // Same rules the old database query used:
  //  - name: case-insensitive "contains"
  //  - team: exact match
  //  - region: case-insensitive match
  // `players` arrives already sorted by name, and filter() keeps that order.
  const visible = useMemo(() => {
    const needle = q.toLowerCase();
    const regionNeedle = region.toLowerCase();
    return players.filter(
      (p) =>
        (!needle || (p.name ?? '').toLowerCase().includes(needle)) &&
        (!team || p.team === team) &&
        (!regionNeedle || (p.region ?? '').toLowerCase() === regionNeedle)
    );
  }, [players, q, team, region]);

  return (
    <>
      {/* --- HERO SECTION --- */}
      {/* Adjusted padding for mobile (px-6) and desktop (px-12) */}
      <header className="flex flex-col items-center justify-center min-h-[50vh] md:min-h-[60vh] px-6 md:px-12 text-center pt-4 md:pt-8 pb-8 md:pb-12 w-full max-w-full">
        {/* Shrunk text size for mobile (5xl), scales up for desktop (8rem) */}
        <h1 className="text-5xl sm:text-7xl md:text-[8rem] leading-[1] md:leading-[0.85] font-black uppercase tracking-tighter mb-6 md:mb-8">
          Master<br />
          Your Settings
        </h1>
        <p className="text-lg md:text-2xl text-gray-400 mb-8 md:mb-12 font-light tracking-wide max-w-2xl px-4">
          The definitive, centralized hub for Rainbow Six Siege professional configurations.
        </p>

        <div className="flex flex-col items-center mt-2 md:mt-4 w-full">
          <PlayerFilters
            teams={uniqueTeams}
            regions={uniqueRegions}
            q={q}
            team={team}
            region={region}
            onChange={onChange}
          />
        </div>
      </header>

      {/* --- DATABASE SECTION --- */}
      <main id="directory" className="max-w-6xl mx-auto px-6 md:px-12 w-full pt-4">
        <h2 className="text-4xl md:text-[4rem] font-black uppercase tracking-tighter mb-4 text-center md:text-left">
          Operator Directory
        </h2>
        <div className="w-full h-[2px] bg-[#5ce1e6] mb-8 md:mb-12 shadow-[0_0_10px_rgba(92,225,230,0.5)]"></div>

        <div className="flex flex-col backdrop-blur-sm bg-black/40 p-4 md:p-8 rounded-xl border border-gray-800/50">
          {visible.map((player, index) => (
            <Link
              href={`/player/${player.id}`}
              key={player.id}
              // Prefetching is off on purpose: with ~200 links on this page, the default
              // prefetch-on-scroll fired a request for every visible row on every visit.
              prefetch={false}
              // Changed to flex-col on mobile so names and teams stack if needed
              className="flex flex-col sm:flex-row justify-between items-start sm:items-center py-4 md:py-6 border-b border-gray-800 hover:bg-white/5 transition-colors px-2 md:px-4 -mx-2 md:-mx-4 group gap-2 sm:gap-0"
            >
              <div className="flex items-center gap-4 md:gap-12">
                <span className="text-[#39ff14] font-mono text-sm md:text-lg tracking-widest">
                  [{String(index + 1).padStart(2, '0')}]
                </span>
                <span className="text-2xl md:text-3xl font-bold underline decoration-2 underline-offset-8 group-hover:text-[#5ce1e6] transition-colors break-words max-w-[200px] md:max-w-none">
                  {player.name}
                </span>
              </div>

              <span className="text-gray-400 text-sm md:text-xl tracking-wide uppercase sm:text-right">
                <span className="text-gray-600 mr-2 md:mr-4">{player.region}</span>
                {player.team}
              </span>
            </Link>
          ))}

          {visible.length === 0 && (
            <div className="text-gray-500 text-lg md:text-xl py-8 text-center">
              No operators found matching your filters.
            </div>
          )}
        </div>
      </main>
    </>
  );
}

// Reads the starting filters from the URL (so links like /?team=Foo still work),
// then keeps them in local state. Typing filters the list in the browser and
// updates the address bar with history.replaceState, which makes NO server request.
function DirectoryWithUrlFilters({ players }: { players: DirectoryPlayer[] }) {
  const searchParams = useSearchParams();
  const [q, setQ] = useState(() => searchParams.get('q') ?? '');
  const [team, setTeam] = useState(() => searchParams.get('team') ?? '');
  const [region, setRegion] = useState(() => searchParams.get('region') ?? '');

  const handleChange = (key: FilterKey, value: string) => {
    const next = { q, team, region, [key]: value };
    if (key === 'q') setQ(value);
    if (key === 'team') setTeam(value);
    if (key === 'region') setRegion(value);

    const params = new URLSearchParams();
    if (next.q) params.set('q', next.q);
    if (next.team) params.set('team', next.team);
    if (next.region) params.set('region', next.region);
    const qs = params.toString();
    window.history.replaceState(null, '', qs ? `/?${qs}` : '/');
  };

  return (
    <DirectoryView players={players} q={q} team={team} region={region} onChange={handleChange} />
  );
}

export default function Directory({ players }: { players: DirectoryPlayer[] }) {
  return (
    // useSearchParams needs a Suspense boundary so the page can still be built as static HTML.
    // The fallback is the full, unfiltered list, which is what gets served as the static page.
    <Suspense
      fallback={
        <DirectoryView players={players} q="" team="" region="" onChange={() => {}} />
      }
    >
      <DirectoryWithUrlFilters players={players} />
    </Suspense>
  );
}
