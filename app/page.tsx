import { createClient } from '@supabase/supabase-js';
import Link from 'next/link';
import PlayerFilters from './components/PlayerFilters';
import NavBar from '@/app/components/NavBar';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default async function Home({ 
  searchParams 
}: { 
  searchParams: Promise<{ q?: string; team?: string; region?: string }> 
}) {
  const params = await searchParams;
  const searchQuery = params.q || '';
  const teamFilter = params.team || '';
  const regionFilter = params.region || ''; // --- ADDED REGION FILTER PARAMETER

  // --- FETCH UNIQUE TEAMS & REGIONS ---
  // We grab both columns at once to make the page load faster
  const { data: filterData } = await supabase.from('Players').select('team, region');
  
  const uniqueTeams = Array.from(
    new Set(filterData?.map(p => p.team).filter(Boolean))
  ).sort();
  
  const uniqueRegions = Array.from(
    new Set(filterData?.map(p => p.region).filter(Boolean))
  ).sort();

  // --- BUILD THE MAIN QUERY ---
  let query = supabase.from('Players').select('*').order('name', { ascending: true });
  
  if (searchQuery) query = query.ilike('name', `%${searchQuery}%`);
  if (teamFilter) query = query.eq('team', teamFilter);
  // We use ilike for regions to prevent case-sensitive crashes (e.g., 'NA' vs 'na')
  if (regionFilter) query = query.ilike('region', regionFilter); 
  
  const { data: players, error } = await query;
  if (error) console.error("Error fetching players:", error.message);

  return (
    <div className="relative min-h-screen bg-[#09090b] text-white font-sans selection:bg-[#5ce1e6] selection:text-black pb-32">
      
      {/* --- PARALLAX BACKGROUND --- */}
      <div 
        className="fixed inset-0 z-0 bg-[url('https://staticctf.ubisoft.com/J3yJr34U2pZ2Ieem48Dwy9uqj5PNUQTn/29vfowhNB6MLBBkIMyvWmG/a8cc72ded8efe648be8463460571cb90/R6M_Stamp-Banner_960x540-Blog.jpg')] bg-cover bg-center bg-fixed opacity-10 pointer-events-none"
      ></div>

      <div className="relative z-10 flex flex-col">
        
        <NavBar />

        {/* --- HERO SECTION --- */}
        <header className="flex flex-col items-center justify-center min-h-[60vh] px-12 text-center pt-8 pb-12">
          <h1 className="text-[8rem] leading-[0.85] font-black uppercase tracking-tighter mb-8">
            Master<br />
            Your Settings
          </h1>
          <p className="text-2xl text-gray-400 mb-12 font-light tracking-wide max-w-2xl">
            The definitive, centralized hub for Rainbow Six Siege professional configurations.
          </p>
          
          {/* SEARCH BAR WIDGET */}
          <div className="flex flex-col items-center mt-4">
            {/* We now pass BOTH teams and regions into the component */}
            <PlayerFilters teams={uniqueTeams} regions={uniqueRegions} />
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
                
                {/* Updated this span to show both REGION and TEAM next to each other */}
                <span className="text-gray-400 text-xl tracking-wide uppercase text-right">
                  <span className="text-gray-600 mr-4">{player.region}</span> 
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