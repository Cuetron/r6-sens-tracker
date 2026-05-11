import { createClient } from '@supabase/supabase-js';
import Link from 'next/link';
import PlayerFilters from './components/PlayerFilters';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default async function Home({ 
  searchParams 
}: { 
  searchParams: Promise<{ q?: string; team?: string }> 
}) {
  const params = await searchParams;
  const searchQuery = params.q || '';
  const teamFilter = params.team || '';

  // --- FETCH UNIQUE TEAMS ---
  const { data: teamData } = await supabase.from('Players').select('team');
  const uniqueTeams = Array.from(
    new Set(teamData?.map(p => p.team).filter(Boolean))
  ).sort();

  // --- BUILD THE MAIN QUERY ---
  let query = supabase.from('Players').select('*').order('name', { ascending: true });
  if (searchQuery) query = query.ilike('name', `%${searchQuery}%`);
  if (teamFilter) query = query.eq('team', teamFilter);
  
  const { data: players, error } = await query;
  if (error) console.error("Error fetching players:", error.message);

  return (
    <div className="relative min-h-screen bg-[#09090b] text-white font-sans selection:bg-[#5ce1e6] selection:text-black pb-32">
      
      {/* --- PARALLAX BACKGROUND --- */}
      <div 
        className="fixed inset-0 z-0 bg-[url('https://staticctf.ubisoft.com/J3yJr34U2pZ2Ieem48Dwy9uqj5PNUQTn/29vfowhNB6MLBBkIMyvWmG/a8cc72ded8efe648be8463460571cb90/R6M_Stamp-Banner_960x540-Blog.jpg')] bg-cover bg-center bg-fixed opacity-10 pointer-events-none"
      ></div>

      <div className="relative z-10 flex flex-col">
        
        {/* --- STICKY NAVIGATION BAR --- */}
        <nav className="sticky top-0 z-50 flex items-center justify-between px-12 py-6 bg-[#09090b]/80 backdrop-blur-md border-b border-gray-800">
          <Link href="/" className="flex items-center border-2 border-white px-4 py-2 cursor-pointer">
            <div className="w-4 h-4 bg-white mr-2"></div>
            <span className="font-bold tracking-widest text-lg uppercase">Logo</span>
          </Link>

          <div className="flex space-x-12 uppercase tracking-widest text-sm font-semibold absolute left-1/2 transform -translate-x-1/2">
            <Link href="/" className="hover:text-gray-300 border-b-2 border-white pb-1">Database</Link>
            <Link href="/regions" className="text-gray-300 hover:text-white transition-colors">Regions</Link>
            <Link href="/about" className="text-gray-300 hover:text-white transition-colors">About & Contact</Link>
          </div>
          
          <div className="w-[120px]"></div> 
        </nav>

        {/* --- HERO SECTION --- */}
        {/* CHANGED: min-h-[80vh] is now min-h-[60vh] to reduce the gap */}
        <header className="flex flex-col items-center justify-center min-h-[60vh] px-12 text-center pt-8 pb-12">
          <h1 className="text-[8rem] leading-[0.85] font-black uppercase tracking-tighter mb-8">
            Master<br />
            Your Settings
          </h1>
          <p className="text-2xl text-gray-400 mb-12 font-light tracking-wide max-w-2xl">
            The definitive, centralized hub for Rainbow Six Siege professional configurations.
          </p>
          
          {/* SEARCH BAR WIDGET (Button Removed) */}
          <div className="flex flex-col items-center mt-4">
            <PlayerFilters teams={uniqueTeams} />
          </div>
        </header>

        {/* --- DATABASE SECTION --- */}
        <main id="directory" className="max-w-6xl mx-auto px-12 w-full pt-4">
          <h2 className="text-[4rem] font-black uppercase tracking-tighter mb-4">
            Operator Directory
          </h2>
          <div className="w-full h-[2px] bg-[#5ce1e6] mb-12 shadow-[0_0_10px_rgba(92,225,230,0.5)]"></div>

          <div className="flex flex-col backdrop-blur-sm bg-black/40 p-8 rounded-xl border border-gray-800/50">
            {players?.map((player, index) => (
              <Link 
                href={`/player/${player.id}`}
                key={player.id} 
                className="flex justify-between items-center py-6 border-b border-gray-800 hover:bg-white/5 transition-colors px-4 -mx-4 group"
              >
                <div className="flex items-center gap-12">
                  <span className="text-[#39ff14] font-mono text-lg tracking-widest">
                    [{String(index + 1).padStart(2, '0')}]
                  </span>
                  <span className="text-3xl font-bold underline decoration-2 underline-offset-8 group-hover:text-[#5ce1e6] transition-colors">
                    {player.name}
                  </span>
                </div>
                <span className="text-gray-400 text-xl tracking-wide uppercase">
                  {player.team}
                </span>
              </Link>
            ))}
            
            {(!players || players.length === 0) && (
              <div className="text-gray-500 text-xl py-8 text-center">
                No operators found matching your filters.
              </div>
            )}
          </div>
        </main>

      </div>
    </div>
  );
}