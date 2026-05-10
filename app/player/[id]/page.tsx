import { createClient } from '@supabase/supabase-js';
import Link from 'next/link';
import { notFound } from 'next/navigation';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

// In Next.js, this 'params' object automatically grabs the [id] from the URL
export default async function PlayerProfile({ params }: { params: { id: string } }) {
  
  // Await the params to ensure compatibility with Next.js 15+
  const { id } = await params;

  // Fetch the single player matching the ID
  const { data: player, error } = await supabase
    .from('Players')
    .select('*')
    .eq('id', id)
    .single();

  // If someone types a random ID in the URL, show a 404 page
  if (error || !player) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-[#09090b] text-white font-sans selection:bg-[#5ce1e6] selection:text-black pb-32">
      
      {/* --- NAVIGATION BAR --- */}
      <nav className="flex items-center justify-between px-12 py-8 relative z-10 border-b border-gray-900 mb-12">
        <Link href="/" className="flex items-center border-2 border-white px-4 py-2 cursor-pointer">
          <div className="w-4 h-4 bg-white mr-2"></div>
          <span className="font-bold tracking-widest text-lg uppercase">Logo</span>
        </Link>

        {/* Center Links with Regions added and proper absolute centering */}
        <div className="flex space-x-12 uppercase tracking-widest text-sm font-semibold absolute left-1/2 transform -translate-x-1/2">
          <Link href="/" className="text-gray-300 hover:text-white transition-colors">Home</Link>
          <Link href="/database" className="text-gray-300 hover:text-white transition-colors">Pro Database</Link>
          <Link href="/regions" className="text-gray-300 hover:text-white transition-colors">Regions</Link>
          <Link href="/about" className="text-gray-300 hover:text-white transition-colors">About & Contact</Link>
        </div>
        
        <div className="w-[120px]"></div> 
      </nav>

      <main className="max-w-5xl mx-auto px-12">
        
        {/* --- BACK SHORTCUT --- */}
        <div className="mb-8">
          <Link href="/database" className="text-[#5ce1e6] hover:text-white uppercase tracking-widest text-sm font-bold transition-colors">
            ← Back to Pro Database
          </Link>
        </div>

        {/* --- HEADER SECTION --- */}
        <div className="mb-24">
          <h1 className="text-[7rem] leading-[0.85] font-black uppercase tracking-tighter mb-4">
            {player.name}'S<br />
            PLAYER<br />
            CONFIG
          </h1>
          <p className="text-[#5ce1e6] text-xl font-light tracking-wide">
            Rainbow Six Siege pro settings overview
          </p>
        </div>

        {/* --- FULL CONFIGURATION TABLE --- */}
        <div>
          <h2 className="text-6xl font-black uppercase tracking-tighter mb-6">
            Full Configuration
          </h2>
          
          <div className="w-full h-[2px] bg-[#5ce1e6] mb-8 shadow-[0_0_10px_rgba(92,225,230,0.5)]"></div>

          {/* Stats List */}
          <div className="flex flex-col">
            
            {/* Row 1: Darker background */}
            <div className="flex justify-between items-center bg-[#18181b] px-8 py-6 border-b border-gray-800">
              <span className="text-[#5ce1e6] text-lg font-semibold tracking-wider uppercase">Sensitivity</span>
              <span className="text-xl tracking-wide">{player.Sensitivity}, {player.Sensitivity}</span>
            </div>

            {/* Row 2: Lighter background */}
            <div className="flex justify-between items-center bg-[#09090b] px-8 py-6 border-b border-gray-800">
              <span className="text-[#5ce1e6] text-lg font-semibold tracking-wider uppercase">ADS (1X, 2.5X)</span>
              <span className="text-xl tracking-wide">{player["ADS (1x)"]}, {player["ADS (2.5)"]}</span>
            </div>

            {/* Row 3 */}
            <div className="flex justify-between items-center bg-[#18181b] px-8 py-6 border-b border-gray-800">
              <span className="text-[#5ce1e6] text-lg font-semibold tracking-wider uppercase">DPI</span>
              <span className="text-xl tracking-wide">{player.DPI}</span>
            </div>

            {/* Row 4 */}
            <div className="flex justify-between items-center bg-[#09090b] px-8 py-6 border-b border-gray-800">
              <span className="text-[#5ce1e6] text-lg font-semibold tracking-wider uppercase">Mouse Multiplier</span>
              <span className="text-xl tracking-wide">{player["Mouse Multiplier"]}</span>
            </div>

            {/* Row 5 */}
            <div className="flex justify-between items-center bg-[#18181b] px-8 py-6 border-b border-gray-800">
              <span className="text-[#5ce1e6] text-lg font-semibold tracking-wider uppercase">Aspect Ratio & FOV</span>
              <span className="text-xl tracking-wide">{player["Aspect Ratio"]} {player.FOV}</span>
            </div>

          </div>
        </div>

      </main>
    </div>
  );
}