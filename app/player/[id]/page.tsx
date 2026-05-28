import { createClient } from '@supabase/supabase-js';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import BackButton from '@/app/components/BackButton';
import NavBar from '@/app/components/NavBar';
import type { Metadata } from 'next';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

// This Next.js function runs BEFORE the page loads to generate the Discord/Google tags
export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  const { id } = await params;

  // Quickly ask Supabase for just the player's name and team
  const { data: player } = await supabase
    .from('Players')
    .select('name, team')
    .eq('id', id)
    .single();

  // If the player isn't found, fallback to default
  if (!player) {
    return { title: 'Player Not Found' };
  }

  // Return the custom Discord card info!
  return {
    title: `${player.name}'s Settings`,
    description: `View ${player.name}'s updated Rainbow Six Siege sensitivity, DPI, aspect ratio, and hardware on the R6 Sens Tracker.`,
    openGraph: {
      title: `${player.name} (${player.team}) | R6 Settings`,
      description: `View ${player.name}'s updated Rainbow Six Siege sensitivity, DPI, aspect ratio, and hardware.`,
    }
  };
}

export default async function PlayerProfile({ params }: { params: { id: string } }) {
  const { id } = await params;

  // Fetch the single player matching the ID
  const { data: player, error } = await supabase
    .from('Players')
    .select('*')
    .eq('id', id)
    .single();

  if (error || !player) {
    notFound();
  }

  // --- TIMESTAMP FORMATTING ---
  const dateToFormat = player.updated_at || player.created_at;
  const formattedDate = dateToFormat 
    ? new Date(dateToFormat).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
    : "Date Unknown";

  return (
    <div className="min-h-screen bg-[#09090b] text-white font-sans selection:bg-[#5ce1e6] selection:text-black pb-32">
      
      <NavBar />

      <main className="max-w-5xl mx-auto px-12">
        
        {/* --- BACK SHORTCUT --- */}
        <div className="mb-8">
          <BackButton />
        </div>

        {/* --- HEADER SECTION --- */}
        <div className="mb-4">
          <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tighter mb-2">
            {player.name}'s Configuration
          </h1>
          <p className="text-[#5ce1e6] text-lg font-bold uppercase tracking-widest">
            Full Settings
          </p>
        </div>

        {/* --- FULL CONFIGURATION TABLE --- */}
        <div>
          <div className="w-full h-[2px] bg-[#5ce1e6] mb-8 shadow-[0_0_10px_rgba(92,225,230,0.5)]"></div>

          <div className="flex flex-col">
            
            {/* Row 1: Sensitivity */}
            <div className="flex justify-between items-center bg-[#18181b] px-8 py-4 border-b border-gray-800">
              <span className="text-[#5ce1e6] text-base font-semibold tracking-wider uppercase">Sensitivity</span>
              <span className="text-lg tracking-wide">{player.Sensitivity}, {player.Sensitivity}</span>
            </div>

            {/* Row 2: ADS 1x */}
            <div className="flex justify-between items-center bg-[#09090b] px-8 py-4 border-b border-gray-800">
              <span className="text-[#5ce1e6] text-base font-semibold tracking-wider uppercase">ADS 1X</span>
              <span className="text-lg tracking-wide">{player["ADS (1x)"] || "N/A"}</span>
            </div>

            {/* Row 3: ADS 2.5x */}
            <div className="flex justify-between items-center bg-[#18181b] px-8 py-4 border-b border-gray-800">
              <span className="text-[#5ce1e6] text-base font-semibold tracking-wider uppercase">ADS 2.5X</span>
              <span className="text-lg tracking-wide">{player["ADS (2.5)"] || "N/A"}</span>
            </div>

            {/* Row 4: DPI */}
            <div className="flex justify-between items-center bg-[#09090b] px-8 py-4 border-b border-gray-800">
              <span className="text-[#5ce1e6] text-base font-semibold tracking-wider uppercase">DPI</span>
              <span className="text-lg tracking-wide">{player.DPI}</span>
            </div>

            {/* Row 5: Mouse Multiplier */}
            <div className="flex justify-between items-center bg-[#18181b] px-8 py-4 border-b border-gray-800">
              <span className="text-[#5ce1e6] text-base font-semibold tracking-wider uppercase">Mouse Multiplier</span>
              <span className="text-lg tracking-wide">{player["Mouse Multiplier"]}</span>
            </div>

            {/* Row 6: Aspect Ratio */}
            <div className="flex justify-between items-center bg-[#09090b] px-8 py-4 border-b border-gray-800">
              <span className="text-[#5ce1e6] text-base font-semibold tracking-wider uppercase">Aspect Ratio</span>
              <span className="text-lg tracking-wide">{player["Aspect Ratio"]}</span>
            </div>

            {/* Row 7: FOV */}
            <div className="flex justify-between items-center bg-[#18181b] px-8 py-4 border-b border-gray-800">
              <span className="text-[#5ce1e6] text-base font-semibold tracking-wider uppercase">FOV</span>
              <span className="text-lg tracking-wide">{player.FOV}</span>
            </div>

            {/* Row 8: Monitor */}
            <div className="flex justify-between items-center bg-[#09090b] px-8 py-4 border-b border-gray-800">
              <span className="text-[#5ce1e6] text-base font-semibold tracking-wider uppercase">Monitor</span>
              <span className="text-lg tracking-wide text-right">{player.monitor || player.Monitor || "N/A"}</span>
            </div>

            {/* Row 9: Mouse & Mousepad */}
            <div className="flex justify-between items-center bg-[#18181b] px-8 py-4 border-b border-gray-800">
              <span className="text-[#5ce1e6] text-base font-semibold tracking-wider uppercase">Mouse & Pad</span>
              <span className="text-lg tracking-wide text-right">
                {player.mouse || player.Mouse || "N/A"} 
                <span className="text-gray-600 text-sm mx-2">|</span> 
                {player.mousepad || player.Mousepad || "N/A"}
              </span>
            </div>

            {/* Row 10: Keyboard & Switches */}
            <div className="flex justify-between items-center bg-[#09090b] px-8 py-4 border-b border-gray-800">
              <span className="text-[#5ce1e6] text-base font-semibold tracking-wider uppercase">Keyboard & Switches</span>
              <span className="text-lg tracking-wide text-right">
                {player.keyboard || player.Keyboard || "N/A"} 
                <span className="text-gray-600 text-sm mx-2">|</span> 
                {player.switches || player.Switches || "N/A"}
              </span>
            </div>

            {/* Row 11: Audio (Headset & In-Ears) */}
            <div className="flex justify-between items-center bg-[#18181b] px-8 py-4 border-b border-gray-800">
              <span className="text-[#5ce1e6] text-base font-semibold tracking-wider uppercase">Audio (Headset / In-Ears)</span>
              <span className="text-lg tracking-wide text-right">
                {player.headset || player.Headset || "N/A"} 
                <span className="text-gray-600 text-sm mx-2">|</span> 
                {player.inears || player.InEars || player.Inears || "N/A"}
              </span>
            </div>
            
          </div>
        </div>

        {/* --- LAST UPDATED TIMESTAMP --- */}
        <div className="mt-4 flex justify-end">
          <p className="text-gray-500 text-xs font-mono tracking-widest uppercase flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-[#5ce1e6] shadow-[0_0_8px_rgba(92,225,230,0.8)] animate-pulse"></span>
            Last Updated: {formattedDate}
          </p>
        </div>

      </main>
    </div>
  );
}