import { cache } from 'react';
import { notFound } from 'next/navigation';
import BackButton from '@/app/components/BackButton';
import NavBar from '@/app/components/NavBar';
import { supabaseServer } from '@/lib/supabase-server';
import type { Metadata } from 'next';

// Each player page is built once and then refreshed at most every 5 minutes
// (see lib/supabase-server.ts), instead of running a function on every visit.
export const revalidate = 300;

// Build every current player's page ahead of time. Players added later still work:
// their page is built the first time someone opens it, then cached like the others.
export async function generateStaticParams() {
  const { data } = await supabaseServer.from('Players').select('id');
  return (data ?? []).map((p) => ({ id: String(p.id) }));
}

// One lookup shared by generateMetadata and the page itself (React `cache` makes the
// second call in the same render reuse the first one's result).
const getPlayer = cache(async (id: string) => {
  const { data, error } = await supabaseServer
    .from('Players')
    .select('*')
    .eq('id', id)
    .single();

  // "No such player" / "id isn't a valid number" just mean 404. Any other error is
  // treated as a real failure so a temporary outage isn't cached as a 404 page.
  if (error && error.code !== 'PGRST116' && error.code !== '22P02') {
    throw new Error(`Error fetching player ${id}: ${error.message}`);
  }
  return data;
});

// This Next.js function runs BEFORE the page loads to generate the Discord/Google tags
export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;

  const player = await getPlayer(id);

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

export default async function PlayerProfile({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  // Fetch the single player matching the ID (same lookup generateMetadata used)
  const player = await getPlayer(id);

  if (!player) {
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

  // --- SOURCE FORMATTING ---
  // Reads the "Source" column (Socials/Twitch, Player Direct, Team Member, Other/Unknown)
  // If it's empty or the literal text "NULL", fall back to "Unknown"
  const sourceRaw = player.Source ?? player.source;
  const sourceTrimmed = sourceRaw ? String(sourceRaw).trim() : "";
  const sourceLabel =
    sourceTrimmed && sourceTrimmed.toUpperCase() !== "NULL"
      ? sourceTrimmed
      : "Unknown";

  // --- SENSITIVITY PARSER ---
  // Converts your database decimal workaround (e.g. 6.7) into explicit H and V values
  const sensRaw = String(player.Sensitivity || "0");
  let horizSens = sensRaw;
  let vertSens = sensRaw;

  if (sensRaw.includes('.')) {
    const parts = sensRaw.split('.');
    horizSens = parts[0];
    vertSens = parts[1];
  }

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

            {/* Row 1: Sensitivity (Updated with explicit H and V tags) */}
            <div className="flex justify-between items-center bg-[#18181b] px-8 py-3 border-b border-gray-800">
              <span className="text-[#5ce1e6] text-base font-semibold tracking-wider uppercase">Sensitivity</span>
              <span className="text-lg tracking-wide flex items-center justify-end">
                <span className="text-gray-500 text-sm font-bold mr-2">H:</span> {horizSens}
                <span className="text-[#5ce1e6] font-black mx-3">|</span>
                <span className="text-gray-500 text-sm font-bold mr-2">V:</span> {vertSens}
              </span>
            </div>

            {/* Row 2: ADS 1x */}
            <div className="flex justify-between items-center bg-[#09090b] px-8 py-3 border-b border-gray-800">
              <span className="text-[#5ce1e6] text-base font-semibold tracking-wider uppercase">ADS 1X</span>
              <span className="text-lg tracking-wide">{player["ADS (1x)"] || "N/A"}</span>
            </div>

            {/* Row 3: ADS 2.5x */}
            <div className="flex justify-between items-center bg-[#18181b] px-8 py-3 border-b border-gray-800">
              <span className="text-[#5ce1e6] text-base font-semibold tracking-wider uppercase">ADS 2.5X</span>
              <span className="text-lg tracking-wide">{player["ADS (2.5)"] || "N/A"}</span>
            </div>

            {/* Row 4: DPI & Mouse Multiplier (COMBINED) */}
            <div className="flex justify-between items-center bg-[#09090b] px-8 py-3 border-b border-gray-800">
              <span className="text-[#5ce1e6] text-base font-semibold tracking-wider uppercase">DPI & Multiplier</span>
              <span className="text-lg tracking-wide text-right flex items-center justify-end">
                {player.DPI}
                <span className="text-[#5ce1e6] font-black mx-3">|</span>
                {player["Mouse Multiplier"]}
              </span>
            </div>

            {/* Row 5: Aspect Ratio & FOV (COMBINED) */}
            <div className="flex justify-between items-center bg-[#18181b] px-8 py-3 border-b border-gray-800">
              <span className="text-[#5ce1e6] text-base font-semibold tracking-wider uppercase">Aspect Ratio & FOV</span>
              <span className="text-lg tracking-wide text-right flex items-center justify-end">
                {player["Aspect Ratio"]}
                <span className="text-[#5ce1e6] font-black mx-3">|</span>
                {player.FOV}
              </span>
            </div>

            {/* Row 6: Monitor */}
            <div className="flex justify-between items-center bg-[#09090b] px-8 py-3 border-b border-gray-800">
              <span className="text-[#5ce1e6] text-base font-semibold tracking-wider uppercase">Monitor</span>
              <span className="text-lg tracking-wide text-right">{player.monitor || player.Monitor || "N/A"}</span>
            </div>

            {/* Row 7: Mouse & Mousepad */}
            <div className="flex justify-between items-center bg-[#18181b] px-8 py-3 border-b border-gray-800">
              <span className="text-[#5ce1e6] text-base font-semibold tracking-wider uppercase">Mouse & Pad</span>
              <span className="text-lg tracking-wide text-right flex items-center justify-end">
                {player.mouse || player.Mouse || "N/A"}
                <span className="text-[#5ce1e6] font-black mx-3">|</span>
                {player.mousepad || player.Mousepad || "N/A"}
              </span>
            </div>

            {/* Row 8: Keyboard & Switches */}
            <div className="flex justify-between items-center bg-[#09090b] px-8 py-3 border-b border-gray-800">
              <span className="text-[#5ce1e6] text-base font-semibold tracking-wider uppercase">Keyboard & Switches</span>
              <span className="text-lg tracking-wide text-right flex items-center justify-end">
                {player.keyboard || player.Keyboard || "N/A"}
                <span className="text-[#5ce1e6] font-black mx-3">|</span>
                {player.switches || player.Switches || "N/A"}
              </span>
            </div>

            {/* Row 9: Audio (Headset & In-Ears) */}
            <div className="flex justify-between items-center bg-[#18181b] px-8 py-3 border-b border-gray-800">
              <span className="text-[#5ce1e6] text-base font-semibold tracking-wider uppercase">Audio (Headset / In-Ears)</span>
              <span className="text-lg tracking-wide text-right flex items-center justify-end">
                {player.headset || player.Headset || "N/A"}
                <span className="text-[#5ce1e6] font-black mx-3">|</span>
                {player.inears || player.InEars || player.Inears || "N/A"}
              </span>
            </div>

          </div>
        </div>

        {/* --- SOURCE + LAST UPDATED TIMESTAMP --- */}
        <div className="mt-4 flex justify-end items-center flex-wrap gap-x-4 gap-y-2">
          <p className="text-gray-500 text-xs font-mono tracking-widest uppercase">
            Source: <span className="text-[#5ce1e6] font-bold">{sourceLabel}</span>
          </p>
          <span className="text-gray-700 text-xs">|</span>
          <p className="text-gray-500 text-xs font-mono tracking-widest uppercase flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-[#5ce1e6] shadow-[0_0_8px_rgba(92,225,230,0.8)] animate-pulse"></span>
            Last Updated: {formattedDate}
          </p>
        </div>

      </main>
    </div>
  );
}