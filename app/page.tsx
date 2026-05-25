import { createClient } from '@supabase/supabase-js';
import Link from 'next/link';
import PlayerFilters from './components/PlayerFilters';
import NavBar from '@/app/components/NavBar';
import ContactWidget from './components/ContactWidget';

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
  const regionFilter = params.region || ''; 

  const { data: filterData } = await supabase.from('Players').select('team, region');
  const uniqueTeams = Array.from(new Set(filterData?.map(p => p.team).filter(Boolean))).sort();
  const uniqueRegions = Array.from(new Set(filterData?.map(p => p.region).filter(Boolean))).sort();

  let query = supabase.from('Players').select('*').order('name', { ascending: true });
  
  if (searchQuery) query = query.ilike('name', `%${searchQuery}%`);
  if (teamFilter) query = query.eq('team', teamFilter);
  if (regionFilter) query = query.ilike('region', regionFilter); 
  
  const { data: players, error } = await query;
  if (error) console.error("Error fetching players:", error.message);

  return (
    <div className="relative min-h-screen bg-[#09090b] text-white font-sans selection:bg-[#5ce1e6] selection:text-black pb-32 overflow-x-hidden">
      
      {/* --- PARALLAX BACKGROUND --- */}
      <div className="fixed inset-0 z-0 bg-[url('https://staticctf.ubisoft.com/J3yJr34U2pZ2Ieem48Dwy9uqj5PNUQTn/29vfowhNB6MLBBkIMyvWmG/a8cc72ded8efe648be8463460571cb90/R6M_Stamp-Banner_960x540-Blog.jpg')] bg-cover bg-center bg-fixed opacity-10 pointer-events-none"></div>

      <div className="relative z-10 flex flex-col">
        
        <NavBar />

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
            <PlayerFilters teams={uniqueTeams} regions={uniqueRegions} />
          </div>
        </header>

        {/* --- DATABASE SECTION --- */}
        <main id="directory" className="max-w-6xl mx-auto px-6 md:px-12 w-full pt-4">
          <h2 className="text-4xl md:text-[4rem] font-black uppercase tracking-tighter mb-4 text-center md:text-left">
            Operator Directory
          </h2>
          <div className="w-full h-[2px] bg-[#5ce1e6] mb-8 md:mb-12 shadow-[0_0_10px_rgba(92,225,230,0.5)]"></div>

          <div className="flex flex-col backdrop-blur-sm bg-black/40 p-4 md:p-8 rounded-xl border border-gray-800/50">
            {players?.map((player, index) => (
              <Link 
                href={`/player/${player.id}`}
                key={player.id} 
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
            
            {(!players || players.length === 0) && (
              <div className="text-gray-500 text-lg md:text-xl py-8 text-center">
                No operators found matching your filters.
              </div>
            )}
          </div>
        </main>
        
        <ContactWidget />
      </div>
    </div>
  );
}