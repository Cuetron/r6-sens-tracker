import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen bg-[#09090b] text-white font-sans selection:bg-[#5ce1e6] selection:text-black">
    
      {/* --- NAVIGATION BAR --- */}
      <nav className="flex items-center justify-between px-12 py-8 relative z-10 mb-12 border-b border-gray-900">
        <Link href="/" className="flex items-center border-2 border-white px-4 py-2 cursor-pointer">
          <div className="w-4 h-4 bg-white mr-2"></div>
          <span className="font-bold tracking-widest text-lg uppercase">Logo</span>
        </Link>

        {/* Center Links */}
        <div className="flex space-x-12 uppercase tracking-widest text-sm font-semibold absolute left-1/2 transform -translate-x-1/2">
          {/* Active page class applied to 'Home' */}
          <Link href="/" className="hover:text-gray-300 border-b-2 border-white pb-1">Home</Link>
          <Link href="/database" className="text-gray-300 hover:text-white transition-colors">Pro Database</Link>
          <Link href="/regions" className="text-gray-300 hover:text-white transition-colors">Regions</Link>
          <Link href="/about" className="text-gray-300 hover:text-white transition-colors">About & Contact</Link>
        </div>
        
        {/* Right side spacer */}
        <div className="w-[120px]"></div> 
      </nav>

      {/* --- HERO SECTION --- */}
      <main className="relative flex items-center px-12 pt-20 pb-32 min-h-[85vh] overflow-hidden">
        
        {/* Left Side Content */}
        <div className="z-10 max-w-4xl">
          <h1 className="text-[7rem] leading-[0.85] font-black uppercase tracking-tighter mb-8">
            Master<br />
            Your<br />
            Settings
          </h1>
          
          <p className="text-2xl text-gray-300 mb-12 font-light tracking-wide">
            The definitive database for pro configurations
          </p>
          
          {/* --- NEW SEARCH FORM & BUTTON ALONG ROW --- */}
          {/* action="/database" tells the form where to send the user when they hit Enter */}
          <form action="/database" className="flex flex-col sm:flex-row gap-4 mt-8">
            
            {/* Search Input Container */}
            <div className="relative w-full sm:w-96">
              <input 
                type="text" 
                name="q" // This magically maps to the ?q= URL parameter on the database page!
                placeholder="SEARCH PLAYER..." 
                className="w-full bg-[#18181b] text-white px-6 py-5 border border-gray-700 focus:outline-none focus:border-[#5ce1e6] transition-colors uppercase tracking-widest text-lg placeholder:text-gray-600"
              />
              <button type="submit" className="absolute right-5 top-1/2 transform -translate-y-1/2 text-2xl text-gray-500 hover:text-[#5ce1e6] transition-colors">
                ⌕
              </button>
            </div>
            
            {/* View All Button */}
            <Link 
              href="/database" 
              className="flex items-center justify-center bg-[#5ce1e6] text-black font-black uppercase tracking-widest text-xl px-10 py-5 hover:bg-white transition-colors duration-300"
            >
              Directory 
            </Link>
            
          </form>
        </div>

        {/* Right Side Image */}
        <div className="absolute right-0 top-0 bottom-0 w-[55%] pointer-events-none">
          {/* Gradient fade from the dark background into the image */}
          <div className="w-full h-full bg-gradient-to-r from-[#09090b] via-transparent to-transparent absolute z-10"></div>
          
          <div className="w-full h-full">
            <img 
              src="https://staticctf.ubisoft.com/J3yJr34U2pZ2Ieem48Dwy9uqj5PNUQTn/29vfowhNB6MLBBkIMyvWmG/a8cc72ded8efe648be8463460571cb90/R6M_Stamp-Banner_960x540-Blog.jpg" 
              alt="R6 Background"
              className="w-full h-full object-cover opacity-70"
            />
          </div>
        </div>

      </main>
    </div>
  );
}