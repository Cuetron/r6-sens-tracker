import Link from 'next/link';

export default function AboutContact() {
  return (
    <div className="min-h-screen bg-[#09090b] text-white font-sans selection:bg-[#5ce1e6] selection:text-black pb-32">
      
      {/* --- NAVIGATION BAR --- */}
      <nav className="flex items-center justify-between px-12 py-8 relative z-10 mb-12 border-b border-gray-900">
        <Link href="/" className="flex items-center border-2 border-white px-4 py-2 cursor-pointer">
          <div className="w-4 h-4 bg-white mr-2"></div>
          <span className="font-bold tracking-widest text-lg uppercase">Logo</span>
        </Link>

        {/* Center Links */}
        <div className="flex space-x-12 uppercase tracking-widest text-sm font-semibold absolute left-1/2 transform -translate-x-1/2">
          <Link href="/" className="text-gray-300 hover:text-white transition-colors">Home</Link>
          <Link href="/database" className="text-gray-300 hover:text-white transition-colors">Pro Database</Link>
          <Link href="/regions" className="text-gray-300 hover:text-white transition-colors">Regions</Link>
          {/* FIXED: Added the active white underline to the About link */}
          <Link href="/about" className="hover:text-gray-300 border-b-2 border-white pb-1">About & Contact</Link>
        </div>
        
        {/* Right side spacer */}
        <div className="w-[120px]"></div> 
      </nav>

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
                <li><span className="font-bold text-white mr-2">DISCORD:</span> @yourhandle</li>
                <li><span className="font-bold text-white mr-2">TWITTER/X:</span> @yourhandle</li>
                <li><span className="font-bold text-white mr-2">EMAIL:</span> contact@r6sens.com</li>
              </ul>
            </div>
          </div>

          {/* RIGHT SIDE: Contact Form */}
          <div className="bg-[#18181b] p-10 border border-gray-800">
            <h2 className="text-2xl font-bold uppercase tracking-widest mb-8">Send a Message</h2>
            
            <form className="flex flex-col gap-6">
              <div className="flex flex-col gap-2">
                <label htmlFor="name" className="text-xs uppercase tracking-widest text-gray-500 font-bold">Operator Name</label>
                <input 
                  type="text" 
                  id="name"
                  className="bg-[#09090b] text-white px-4 py-3 border border-gray-700 focus:outline-none focus:border-[#5ce1e6] transition-colors uppercase text-sm tracking-wider"
                  placeholder="ENTER NAME"
                />
              </div>

              <div className="flex flex-col gap-2">
                <label htmlFor="email" className="text-xs uppercase tracking-widest text-gray-500 font-bold">Transmission Link (Email)</label>
                <input 
                  type="email" 
                  id="email"
                  className="bg-[#09090b] text-white px-4 py-3 border border-gray-700 focus:outline-none focus:border-[#5ce1e6] transition-colors uppercase text-sm tracking-wider"
                  placeholder="ENTER EMAIL"
                />
              </div>

              <div className="flex flex-col gap-2">
                <label htmlFor="message" className="text-xs uppercase tracking-widest text-gray-500 font-bold">Intel (Message)</label>
                <textarea 
                  id="message"
                  rows={5}
                  className="bg-[#09090b] text-white px-4 py-3 border border-gray-700 focus:outline-none focus:border-[#5ce1e6] transition-colors text-sm tracking-wider resize-none"
                  placeholder="What updates or corrections do you have?"
                ></textarea>
              </div>

              <button 
                type="button" 
                className="mt-4 bg-[#5ce1e6] text-black font-black uppercase tracking-widest text-xl px-8 py-4 hover:bg-white transition-colors duration-300"
              >
                Transmit
              </button>
            </form>
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

          <div className="flex flex-wrap justify-center gap-x-12 gap-y-6 text-gray-300 font-mono text-lg tracking-widest">
            <span className="hover:text-[#5ce1e6] transition-colors cursor-default">@Quetron</span>
            <span className="hover:text-[#5ce1e6] transition-colors cursor-default">@Eaglemas</span>
            <span className="hover:text-[#5ce1e6] transition-colors cursor-default">The R6 Community</span>
          </div>
        </div>

      </main>
    </div>
  );
}