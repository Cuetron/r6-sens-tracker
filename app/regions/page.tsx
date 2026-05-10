import Link from 'next/link';

export default function RegionsDirectory() {
  // We define the regions and their full names here
  const regions = [
    { id: 'NA', name: 'North America' },
    { id: 'EU', name: 'Europe' },
    { id: 'SA', name: 'South America' },
    { id: 'APAC', name: 'Asia-Pacific' }
  ];

  return (
    <div className="min-h-screen bg-[#09090b] text-white font-sans selection:bg-[#5ce1e6] selection:text-black pb-32">
      
      {/* --- NAVIGATION BAR --- */}
      <nav className="flex items-center justify-between px-12 py-8 relative z-10 mb-12">
        <Link href="/" className="flex items-center border-2 border-white px-4 py-2 cursor-pointer">
          <div className="w-4 h-4 bg-white mr-2"></div>
          <span className="font-bold tracking-widest text-lg uppercase">Logo</span>
        </Link>

        <div className="flex space-x-12 uppercase tracking-widest text-sm font-semibold absolute left-1/2 transform -translate-x-1/2">
          <Link href="/" className="text-gray-300 hover:text-white transition-colors">Home</Link>
          <Link href="/database" className="text-gray-300 hover:text-white transition-colors">Pro Database</Link>
          <Link href="/regions" className="hover:text-gray-300 border-b-2 border-white pb-1">Regions</Link>
          <Link href="/about" className="text-gray-300 hover:text-white transition-colors">About & Contact</Link>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto px-12">
        <h1 className="text-[5rem] font-black uppercase tracking-tighter mb-6 leading-none">
          Global<br/>Regions
        </h1>
        <div className="w-full h-[2px] bg-[#5ce1e6] mb-16 shadow-[0_0_10px_rgba(92,225,230,0.5)]"></div>

        {/* Region Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {regions.map((region) => (
            <Link 
              key={region.id}
              href={`/regions/${region.id}`}
              className="bg-[#18181b] border border-gray-800 p-12 hover:border-[#5ce1e6] transition-all group flex flex-col items-center justify-center text-center cursor-pointer"
            >
              <h2 className="text-7xl font-black text-[#5ce1e6] mb-4 group-hover:scale-110 transition-transform duration-300">
                {region.id}
              </h2>
              <span className="text-xl tracking-widest uppercase text-gray-400 group-hover:text-white transition-colors">
                {region.name}
              </span>
            </Link>
          ))}
        </div>
      </main>
    </div>
  );
}