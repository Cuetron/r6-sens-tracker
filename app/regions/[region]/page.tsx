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
  'APAC': '/apacLogo.png',
  // You can add your subregion logos here too so they show up on the team pages!
  'CHINA': '/chinaLogo.png',
  'OCE': '/oceLogo.png',
  'ASIA': '/asiaLogo.png',
  'APAC NORTH': '/apacLogo.png'
};

export default async function RegionTeams({ params }: { params: { region: string } }) {
  const { region } = await params;
  const decodedRegion = decodeURIComponent(region).toUpperCase();

  // ====================================================================
  // 1. THE APAC INTERCEPTION (SUB-MENU)
  // ====================================================================
  if (decodedRegion === 'APAC') {
    const subregions = [
      { id: 'CHINA', name: 'China League', logo: '/chinaLogo.png' },
      { id: 'OCE', name: 'Oceania League', logo: '/oceLogo.png' },
      { id: 'ASIA', name: 'Asia League', logo: '/asiaLogo.png' },
      { id: 'APAC NORTH', name: 'APAC North', logo: '/apacLogo.png' }
    ];

    return (
      <div className="min-h-screen bg-[#09090b] text-white font-sans pb-32">
        <NavBar />
        <main className="max-w-6xl mx-auto px-12">
          
          {/* Breadcrumbs */}
          <div className="flex items-center text-sm font-bold uppercase tracking-widest text-gray-500 mb-8 space-x-3">
            <Link href="/regions" className="hover:text-[#5ce1e6] transition-colors">Regions</Link>
            <span>/</span>
            <span className="text-white">APAC</span>
          </div>

          {/* Header */}
          <div className="flex items-center gap-8 mb-6">
            <img 
              src="/apacLogo.png" 
              alt="APAC Logo" 
              className="h-24 w-auto object-contain drop-shadow-[0_0_12px_rgba(92,225,230,0.4)]" 
            />
            <h1 className="text-[5rem] font-black uppercase tracking-tighter leading-none">
              APAC Leagues
            </h1>
          </div>
          <div className="w-full h-[2px] bg-[#5ce1e6] mb-16 shadow-[0_0_10px_rgba(92,225,230,0.5)]"></div>

          {/* Subregion Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {subregions.map((sub) => (
              <Link 
                key={sub.id}
                href={`/regions/${encodeURIComponent(sub.id)}`}
                className="bg-[#18181b] border border-gray-800 p-12 hover:border-[#5ce1e6] transition-all group flex flex-col items-center justify-center text-center cursor-pointer"
              >
                {sub.logo ? (
                  <img 
                    src={sub.logo} 
                    alt={`${sub.name} Logo`} 
                    className="h-28 w-auto mb-6 object-contain group-hover:scale-110 transition-transform duration-300 drop-shadow-[0_0_15px_rgba(92,225,230,0.2)]"
                  />
                ) : (
                  <h2 className="text-5xl font-black text-[#5ce1e6] mb-4 group-hover:scale-110 transition-transform duration-300">
                    {sub.id}
                  </h2>
                )}
                <span className="text-xl tracking-widest uppercase text-gray-400 group-hover:text-white transition-colors">
                  {sub.name}
                </span>
              </Link>
            ))}
          </div>
        </main>
      </div>
    );
  }

  // ====================================================================
  // 2. NORMAL REGION/SUBREGION BEHAVIOR (NA, EU, SA, CHINA, OCE, etc.)
  // ====================================================================
  const { data, error } = await supabase
    .from('Players')
    .select('team')
    .ilike('region', decodedRegion); 

  if (error || !data) notFound();

  const uniqueTeams = Array.from(new Set(data.map(p => p.team).filter(Boolean))).sort();
  const logoUrl = regionLogos[decodedRegion];

  // Helper variable to make breadcrumbs look a little nicer if it's an APAC subregion
  const isApacSubregion = ['CHINA', 'OCE', 'ASIA', 'APAC NORTH'].includes(decodedRegion);

  return (
    <div className="min-h-screen bg-[#09090b] text-white font-sans pb-32">
      <NavBar />

      <main className="max-w-6xl mx-auto px-12">
        
        {/* --- BREADCRUMB NAVIGATION --- */}
        <div className="flex items-center text-sm font-bold uppercase tracking-widest text-gray-500 mb-8 space-x-3">
          <Link href="/regions" className="hover:text-[#5ce1e6] transition-colors">Regions</Link>
          <span>/</span>
          {isApacSubregion && (
            <>
              <Link href="/regions/APAC" className="hover:text-[#5ce1e6] transition-colors">APAC</Link>
              <span>/</span>
            </>
          )}
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