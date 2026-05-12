import { createClient } from '@supabase/supabase-js';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import NavBar from '@/app/components/NavBar';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// Dictionary to map the URL region to the correct logo file
const regionLogos: Record<string, string> = {
  'NA': '/naLogo.png',
  'EU': '/euLogo.png',
  'SA': '/saLogo.png',
  'APAC' : '/apacLogo.png'
};

export default async function RegionTeams({ params }: { params: { region: string } }) {
  const { region } = await params;
  const decodedRegion = decodeURIComponent(region).toUpperCase();

  const { data, error } = await supabase
    .from('Players')
    .select('team')
    .ilike('region', decodedRegion); 

  if (error || !data) notFound();

  const uniqueTeams = Array.from(new Set(data.map(p => p.team).filter(Boolean))).sort();
  
  // Grab the logo if it exists in our dictionary
  const logoUrl = regionLogos[decodedRegion];

  return (
    <div className="min-h-screen bg-[#09090b] text-white font-sans pb-32">
      <NavBar />

      <main className="max-w-6xl mx-auto px-12">
        
        {/* --- BREADCRUMB NAVIGATION --- */}
        <div className="flex items-center text-sm font-bold uppercase tracking-widest text-gray-500 mb-8 space-x-3">
          <Link href="/regions" className="hover:text-[#5ce1e6] transition-colors">Regions</Link>
          <span>/</span>
          <span className="text-white">{decodedRegion}</span>
        </div>

        {/* --- HEADER WITH OPTIONAL LOGO --- */}
        <div className="flex items-center gap-8 mb-6">
          {logoUrl && (
            <img 
              src={logoUrl} 
              alt={`${decodedRegion} Logo`} 
              className="h-24 w-auto object-contain drop-shadow-[0_0_12px_rgba(92,225,230,0.4)]" 
            />
          )}
          <h1 className="text-[5rem] font-black uppercase tracking-tighter leading-none">
            {decodedRegion} Teams
          </h1>
        </div>

        <div className="w-full h-[2px] bg-[#5ce1e6] mb-12 shadow-[0_0_10px_rgba(92,225,230,0.5)]"></div>

        <div className="flex flex-col">
          {uniqueTeams.map((team, index) => (
            <Link 
              key={team}
              href={`/regions/${decodedRegion}/${encodeURIComponent(team)}`}
              className="flex items-center py-8 border-b border-gray-800 hover:bg-white/5 transition-colors px-4 -mx-4 group"
            >
              <span className="text-[#39ff14] font-mono text-lg tracking-widest mr-12">
                [{String(index + 1).padStart(2, '0')}]
              </span>
              <span className="text-4xl font-bold tracking-tight group-hover:text-[#5ce1e6] transition-colors">
                {team}
              </span>
            </Link>
          ))}
          {uniqueTeams.length === 0 && <p className="text-gray-500 text-xl py-8">No teams found in this region yet.</p>}
        </div>
      </main>
    </div>
  );
}