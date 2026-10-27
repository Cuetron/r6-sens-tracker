import NavBar from '@/app/components/NavBar';
import ContactWidget from './components/ContactWidget';
import Directory from './components/Directory';
import { supabaseServer } from '@/lib/supabase-server';

// Rebuild this page at most every 5 minutes (see lib/supabase-server.ts).
// The page no longer reads `searchParams`, so it can be served as static HTML
// instead of running a function on every visit. Filtering happens in the browser.
export const revalidate = 300;

export default async function Home() {
  // One query for everything the page needs (previously two queries per visit).
  const { data, error } = await supabaseServer
    .from('Players')
    .select('id, name, team, region')
    .order('name', { ascending: true });

  // Throwing (instead of rendering an empty list) means a temporary Supabase error
  // can't get saved as the page for the next 5 minutes; the last good version stays up.
  if (error) throw new Error(`Error fetching players: ${error.message}`);

  return (
    <div className="relative min-h-screen bg-[#09090b] text-white font-sans selection:bg-[#5ce1e6] selection:text-black pb-32 overflow-x-hidden">

      {/* --- PARALLAX BACKGROUND --- */}
      <div className="fixed inset-0 z-0 bg-[url('https://staticctf.ubisoft.com/J3yJr34U2pZ2Ieem48Dwy9uqj5PNUQTn/29vfowhNB6MLBBkIMyvWmG/a8cc72ded8efe648be8463460571cb90/R6M_Stamp-Banner_960x540-Blog.jpg')] bg-cover bg-center bg-fixed opacity-10 pointer-events-none"></div>

      <div className="relative z-10 flex flex-col">

        <NavBar />

        {/* Hero, filters and the player list (filters run in the browser) */}
        <Directory players={data ?? []} />

        <ContactWidget />
      </div>
    </div>
  );
}
