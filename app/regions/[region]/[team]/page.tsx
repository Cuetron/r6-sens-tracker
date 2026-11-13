import Link from 'next/link';
import NavBar from '@/app/components/NavBar';
import { getPlayerIndex, inRegion } from '@/lib/players';

// Refreshed when /api/revalidate is called (Players changed), with an hourly
// backstop (see lib/players.ts).
export const revalidate = 3600;

// Build every current region/team roster page ahead of time. New teams still work:
// they're built the first time someone opens them, then cached.
export async function generateStaticParams() {
  const players = await getPlayerIndex();
  const seen = new Set<string>();
  const params: { region: string; team: string }[] = [];
  for (const p of players) {
    if (!p.region || !p.team) continue;
    const region = String(p.region).toUpperCase();
    const key = `${region}|${p.team}`;
    if (seen.has(key)) continue;
    seen.add(key);
    params.push({ region, team: p.team });
  }
  return params;
}

export default async function TeamRoster({ params }: { params: Promise<{ region: string, team: string }> }) {
  const { region, team } = await params;
  
  const decodedRegion = decodeURIComponent(region).toUpperCase();
  const decodedTeam = decodeURIComponent(team);

  // Reuses the shared cached player list (already sorted by name) instead of a
  // separate query per team.
  const players = (await getPlayerIndex()).filter(
    (p) => inRegion(p, decodedRegion) && p.team === decodedTeam
  );

  return (
    <div className="min-h-screen bg-[#09090b] text-white font-sans pb-32">
      <NavBar />

      <main className="max-w-6xl mx-auto px-12">
        
        {/* --- FULL BREADCRUMB NAVIGATION --- */}
        <div className="flex items-center text-sm font-bold uppercase tracking-widest text-gray-500 mb-8 space-x-3">
          <Link href="/regions" className="hover:text-[#5ce1e6] transition-colors">Regions</Link>
          <span>/</span>
          <Link href={`/regions/${decodedRegion}`} className="hover:text-[#5ce1e6] transition-colors">{decodedRegion}</Link>
          <span>/</span>
          <span className="text-white">{decodedTeam}</span>
        </div>
        
        <h1 className="text-[5rem] font-black uppercase tracking-tighter mb-6">{decodedTeam}</h1>
        <div className="w-full h-[2px] bg-[#5ce1e6] mb-12 shadow-[0_0_10px_rgba(92,225,230,0.5)]"></div>

        <div className="flex flex-col">
          {players.map((player, index) => (
            <Link 
              key={player.id}
              href={`/player/${player.id}`}
              prefetch={false}
              className="flex items-center py-8 border-b border-gray-800 hover:bg-white/5 transition-colors px-4 -mx-4 group"
            >
              <span className="text-[#39ff14] font-mono text-lg tracking-widest mr-12">
                [{String(index + 1).padStart(2, '0')}]
              </span>
              <span className="text-3xl font-bold underline decoration-2 underline-offset-8 group-hover:text-[#5ce1e6] transition-colors">
                {player.name}
              </span>
            </Link>
          ))}
          {players.length === 0 && <p className="text-gray-500 text-xl py-8">No active roster data found.</p>}
        </div>
      </main>
    </div>
  );
}