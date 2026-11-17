import NavBar from '@/app/components/NavBar';
import ContactWidget from './components/ContactWidget';
import Directory from './components/Directory';
import { getPlayerIndex } from '@/lib/players';

// Fully static: built once per deploy, never regenerated, so visitors cause no
// ISR writes. New data goes live on the next rebuild (see lib/players.ts).
export const revalidate = false;
// Filtering happens in the browser.

export default async function Home() {
  // Shared cached query (see lib/players.ts). It throws on a Supabase error, so a
  // temporary outage can't get saved as an empty page; the last good version stays up.
  const players = await getPlayerIndex();

  return (
    <div className="relative min-h-screen bg-[#09090b] text-white font-sans selection:bg-[#5ce1e6] selection:text-black pb-32 overflow-x-hidden">

      {/* --- PARALLAX BACKGROUND --- */}
      <div className="fixed inset-0 z-0 bg-[url('https://staticctf.ubisoft.com/J3yJr34U2pZ2Ieem48Dwy9uqj5PNUQTn/29vfowhNB6MLBBkIMyvWmG/a8cc72ded8efe648be8463460571cb90/R6M_Stamp-Banner_960x540-Blog.jpg')] bg-cover bg-center bg-fixed opacity-10 pointer-events-none"></div>

      <div className="relative z-10 flex flex-col">

        <NavBar />

        {/* Hero, filters and the player list (filters run in the browser) */}
        <Directory players={players} />

        <ContactWidget />
      </div>
    </div>
  );
}
