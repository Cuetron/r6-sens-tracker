import Link from 'next/link';
import NavBar from '@/app/components/NavBar';

export default function AboutContact() {
  return (
    <div className="min-h-screen bg-[#09090b] text-white font-sans selection:bg-[#5ce1e6] selection:text-black pb-32">
      
      <NavBar />

      <main className="max-w-6xl mx-auto px-12">
        
        {/* Header */}
        <h1 className="text-[5rem] font-black uppercase tracking-tighter mb-6 leading-none">
          Intel &<br/>Comms
        </h1>
        
        {/* Cyan Separator Line */}
        <div className="w-full h-[2px] bg-[#5ce1e6] mb-16 shadow-[0_0_10px_rgba(92,225,230,0.5)]"></div>

        {/* --- 2-COLUMN GRID SECTION --- */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-20">
          
          {/* LEFT SIDE: About Information */}
          <div>
            <h2 className="text-3xl font-bold uppercase tracking-widest mb-6">About the Tracker</h2>
            <div className="text-gray-400 space-y-6 text-lg tracking-wide font-light">
              <p>
                The R6 Sensitivity Tracker was built to be the definitive, centralized hub for Rainbow Six Siege professional configurations. 
              </p>
              <p>
                As the meta evolves, so do the settings. Tracking DPI, multipliers, and aspect ratios across hundreds of pros and streamers is tedious. This database eliminates the guesswork, providing real-time, accurate configurations directly from the competitive scene.
              </p>
            </div>

            <div className="mt-12">
              <h3 className="text-[#5ce1e6] text-xl font-bold uppercase tracking-widest mb-4">Direct Lines</h3>
              <ul className="space-y-4 text-gray-300 tracking-wider">
                <li className="flex flex-col md:flex-row md:items-center gap-4 md:gap-6">
                  <span className="font-bold text-white">TWITTER/X:</span> 
                  <div className="flex flex-wrap gap-6 font-mono text-sm">
                    <a href="https://twitter.com/benett_plesha" target="_blank" rel="noopener noreferrer" className="hover:text-[#5ce1e6] transition-colors">
                      @Benett
                    </a>
                    <a href="https://twitter.com/itsQuetron" target="_blank" rel="noopener noreferrer" className="hover:text-[#5ce1e6] transition-colors">
                      @itsQuetron
                    </a>
                    <a href="https://twitter.com/Eaglemees" target="_blank" rel="noopener noreferrer" className="hover:text-[#5ce1e6] transition-colors">
                      @Eaglemees
                    </a>
                  </div>
                </li>
              </ul>
            </div>
          </div>

          {/* RIGHT SIDE: Fair Use, Copyright & Data Policy */}
          <div>
            <h2 className="text-3xl font-bold uppercase tracking-widest mb-6">Legal & Fair Use</h2>
            <div className="bg-[#18181b] p-8 border border-gray-800 text-gray-400 space-y-6 text-base tracking-wide font-light">
              
              {/* Copyright Info */}
              <p>
                This database utilizes team logos, league branding, and related esports imagery under the doctrine of Fair Use. 
              </p>
              <p>
                All images are used strictly for informational, educational, and identification purposes within the Rainbow Six Siege esports ecosystem. These images are web-resolution copies that do not impede the original copyright holders' ability to use or profit from their intellectual property. No free alternative exists that would serve the same documentary purpose.
              </p>
              <p>
                All copyrights and trademarks belong to their respective owners, including <span className="text-white font-medium">Ubisoft</span>, tournament organizers, and individual esports organizations. 
              </p>

              {/* NEW SECTION: Data Usage & Non-Profit Status */}
              <div className="border-t border-gray-800 pt-6 mt-6">
                <h3 className="text-white text-lg font-bold uppercase tracking-widest mb-3">Non-Profit & Data Usage</h3>
                <p>
                  The R6 Sensitivity Tracker is a strictly non-profit initiative built by the community, for the community, with no intention of monetization. However, the unauthorized scraping, mass-copying, or redistribution of our curated settings data to populate other websites, trackers, or commercial services is strictly prohibited.
                </p>
              </div>

              {/* Credits */}
              <p className="text-sm border-t border-gray-800 pt-6 mt-6">
                Much of our foundational organizational data and base imagery is sourced with appreciation from the contributors at <a href="https://liquipedia.net/rainbowsix/" target="_blank" rel="noopener noreferrer" className="text-[#5ce1e6] hover:underline font-bold">Liquipedia</a>.
              </p>
            </div>
          </div>
        </div>
        {/* --- END 2-COLUMN GRID SECTION --- */}

        {/* --- SPECIAL THANKS SECTION (FULL WIDTH) --- */}
        <div className="mt-32 border-t border-gray-800 pt-16 text-center">
          <h2 className="text-2xl font-black uppercase tracking-widest text-white mb-8">
            Special Thanks
          </h2>
          
          <p className="text-gray-500 mb-8 text-sm uppercase tracking-widest">
            To those who helped make this database
          </p>

          <div className="flex justify-center text-[#5ce1e6] font-mono text-2xl tracking-widest font-bold">
            <span className="cursor-default shadow-[0_0_15px_rgba(92,225,230,0.3)] px-6 py-3 rounded-lg border border-[#5ce1e6]/30 bg-[#5ce1e6]/5">
              The R6 Community
            </span>
          </div>
        </div>

      </main>
    </div>
  );
}