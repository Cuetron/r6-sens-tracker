import { createClient } from '@supabase/supabase-js';
import Link from 'next/link';
import { notFound } from 'next/navigation';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default async function TeamRoster({ params }: { params: { region: string, team: string } }) {
  const { region, team } = await params;
  
  const decodedRegion = decodeURIComponent(region).toUpperCase();
  const decodedTeam = decodeURIComponent(team);

  const { data: players, error } = await supabase
    .from('Players')
    .select('id, name')
    .ilike('region', decodedRegion)
    .eq('team', decodedTeam)
    .order('name');

  if (error || !players) notFound();

  return (
    <div className="min-h-screen bg-[#09090b] text-white font-sans pb-32">
      <nav className="flex items-center justify-between px-12 py-8 relative z-10 mb-12 border-b border-gray-900">
        <Link href="/" className="flex items-center border-2 border-white px-4 py-2"><div className="w-4 h-4 bg-white mr-2"></div><span className="font-bold tracking-widest text-lg uppercase">Logo</span></Link>
        <div className="flex space-x-12 uppercase tracking-widest text-sm font-semibold absolute left-1/2 transform -translate-x-1/2">
          <Link href="/" className="text-gray-300 hover:text-white">Database</Link>
          <Link href="/regions" className="border-b-2 border-white pb-1">Regions</Link>
          <Link href="/about" className="text-gray-300 hover:text-white">About & Contact</Link>
        </div>
      </nav>

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