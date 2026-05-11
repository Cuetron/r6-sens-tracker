"use client";

import { useRouter, useSearchParams } from 'next/navigation';

export default function PlayerFilters({ 
  teams, 
  regions 
}: { 
  teams: string[], 
  regions: string[] 
}) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleFilterChange = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams);
    
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    
    router.replace(`/?${params.toString()}`, { scroll: false });
  };

  return (
    // Changed to flex-wrap so it drops to a new line on smaller screens like phones
    <div className="flex flex-wrap items-center justify-center gap-4">
      
      {/* 1. Name Search */}
      <div className="relative">
        <input
          type="text"
          placeholder="Search players..."
          defaultValue={searchParams.get('q')?.toString()}
          onChange={(e) => handleFilterChange('q', e.target.value)}
          className="bg-[#18181b] text-white px-6 py-4 pr-12 border border-gray-700 focus:outline-none focus:border-[#5ce1e6] transition-colors w-64 uppercase text-base tracking-wider placeholder:text-gray-600"
        />
        <span className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500 text-xl">⌕</span>
      </div>

      {/* 2. Region Dropdown (NEW) */}
      <select
        defaultValue={searchParams.get('region')?.toString() || ""}
        onChange={(e) => handleFilterChange('region', e.target.value)}
        className="bg-[#18181b] text-white px-6 py-4 border border-gray-700 focus:outline-none focus:border-[#5ce1e6] transition-colors w-64 uppercase text-base tracking-wider cursor-pointer appearance-none"
      >
        <option value="">All Regions</option>
        {regions.map((region) => (
          <option key={region} value={region}>
            {region}
          </option>
        ))}
      </select>

      {/* 3. Team Dropdown */}
      <select
        defaultValue={searchParams.get('team')?.toString() || ""}
        onChange={(e) => handleFilterChange('team', e.target.value)}
        className="bg-[#18181b] text-white px-6 py-4 border border-gray-700 focus:outline-none focus:border-[#5ce1e6] transition-colors w-64 uppercase text-base tracking-wider cursor-pointer appearance-none"
      >
        <option value="">All Teams</option>
        {teams.map((team) => (
          <option key={team} value={team}>
            {team}
          </option>
        ))}
      </select>

    </div>
  );
}