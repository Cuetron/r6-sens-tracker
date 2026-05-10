import { createClient } from '@supabase/supabase-js';
import Link from 'next/link';
import PlayerFilters from './PlayerFilters'; // Note the new imported name!

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default async function Database({ 
  searchParams 
}: { 
  searchParams: Promise<{ q?: string; team?: string }> 
}) {
  
  const params = await searchParams;
  const searchQuery = params.q || '';
  const teamFilter = params.team || '';

  // --- NEW: Fetch Unique Teams for the Dropdown ---
  // We grab just the 'team' column, then use a JavaScript Set to remove duplicates
  const { data: teamData } = await supabase.from('Players').select('team');
  const uniqueTeams = Array.from(
    new Set(teamData?.map(p => p.team).filter(Boolean))
  ).sort();

  // --- BUILD THE MAIN QUERY ---
  let query = supabase
    .from('Players')
    .select('*')
    .order('name', { ascending: true });

  // Apply Name Filter (ilike = case-insensitive match)
  if (searchQuery) {
    query = query.ilike('name', `%${searchQuery}%`);
  }
  
  // Apply Team Filter (eq = exact match)
  if (teamFilter) {
    query = query.eq('team', teamFilter);
  }

  // Execute the query
  const { data: players, error } = await query;

  if (error) {
    console.error("Error fetching players:", error.message);
  }

  return (
    <div className="min-h-screen bg-[#09090b] text-white font-sans selection:bg-[#5ce1e6] selection:text-black">
      
      {/* --- NAVIGATION BAR --- */}
      <nav className="flex items-center justify-between px-12 py-8 relative z-10 border-b border-gray-900 mb-12">
        <Link href="/" className="flex items-center border-2 border-white px-4 py-2 cursor-pointer">
          <div className="w-4 h-4 bg-white mr-2"></div>
          <span className="font-bold tracking-widest text-lg uppercase">Logo</span>
        </Link>

        {/* Center Links */}
        <div className="flex space-x-12 uppercase tracking-widest text-sm font-semibold absolute left-1/2 transform -translate-x-1/2">
          <Link href="/" className="text-gray-300 hover:text-white transition-colors">Home</Link>
          <Link href="/database" className="hover:text-gray-300 border-b-2 border-white pb-1">Pro Database</Link>
          <Link href="/regions" className="text-gray-300 hover:text-white transition-colors">Regions</Link>
          <Link href="/about" className="text-gray-300 hover:text-white transition-colors">About & Contact</Link>
        </div>
        
        {/* --- FILTERS --- */}
        <div className="flex justify-end relative z-20">
          <PlayerFilters teams={uniqueTeams} />
        </div> 
      </nav>

      {/* --- PLAYER DIRECTORY CONTENT --- */}
      <main className="max-w-6xl mx-auto px-12 pt-12 pb-24">
        
        <h1 className="text-[5rem] font-black uppercase tracking-tighter mb-6">
          Player Directory
        </h1>
        
        <div className="w-full h-[2px] bg-[#5ce1e6] mb-12 shadow-[0_0_10px_rgba(92,225,230,0.5)]"></div>

        <div className="flex flex-col">
          {players?.map((player, index) => (
            <Link 
              href={`/player/${player.id}`}
              key={player.id} 
              className="flex justify-between items-center py-8 border-b border-gray-800 hover:bg-white/5 transition-colors px-4 -mx-4 cursor-pointer group"
            >
              <div className="flex items-center gap-12">
                <span className="text-[#39ff14] font-mono text-lg tracking-widest">
                  [{String(index + 1).padStart(2, '0')}]
                </span>
                <span className="text-3xl font-bold underline decoration-2 underline-offset-8 group-hover:text-[#5ce1e6] transition-colors">
                  {player.name}
                </span>
              </div>
              <span className="text-gray-400 text-xl tracking-wide">
                {player.team}
              </span>
            </Link>
          ))}
          
          {(!players || players.length === 0) && (
            <div className="text-gray-500 text-xl py-8">
              No players found matching your filters.
            </div>
          )}
        </div>

      </main>
    </div>
  );
}