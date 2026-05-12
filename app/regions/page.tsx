import Link from 'next/link';
import NavBar from '@/app/components/NavBar';

export default function RegionsDirectory() {
  // Added the logo file paths here. APAC is set to null so it falls back to text.
  const regions = [
    { id: 'NA', name: 'North America', logo: '/naLogo.png' },
    { id: 'EU', name: 'Europe', logo: '/euLogo.png' },
    { id: 'SA', name: 'South America', logo: '/saLogo.png' },
    { id: 'APAC', name: 'Asia-Pacific', logo: '/apacLogo.png' } 
  ];

  return (
    <div className="min-h-screen bg-[#09090b] text-white font-sans selection:bg-[#5ce1e6] selection:text-black pb-32">
      <NavBar />

      <main className="max-w-6xl mx-auto px-12">
        <h1 className="text-[5rem] font-black uppercase tracking-tighter mb-6 leading-none">Global<br/>Regions</h1>
        <div className="w-full h-[2px] bg-[#5ce1e6] mb-16 shadow-[0_0_10px_rgba(92,225,230,0.5)]"></div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {regions.map((region) => (
            <Link 
              key={region.id}
              href={`/regions/${region.id}`}
              className="bg-[#18181b] border border-gray-800 p-12 hover:border-[#5ce1e6] transition-all group flex flex-col items-center justify-center text-center cursor-pointer"
            >
              {/* Conditional Rendering: Show Logo if it exists, otherwise show the text ID */}
              {region.logo ? (
                <img 
                  src={region.logo} 
                  alt={`${region.id} League Logo`} 
                  className="h-28 w-auto mb-6 object-contain group-hover:scale-110 transition-transform duration-300 drop-shadow-[0_0_15px_rgba(92,225,230,0.2)]"
                />
              ) : (
                <h2 className="text-7xl font-black text-[#5ce1e6] mb-4 group-hover:scale-110 transition-transform duration-300">
                  {region.id}
                </h2>
              )}
              
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