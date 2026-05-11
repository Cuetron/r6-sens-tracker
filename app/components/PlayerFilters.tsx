"use client";

import { useRouter, useSearchParams } from 'next/navigation';

export default function PlayerFilters({ teams }: { teams: string[] }) {
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
    // Increased gap between the two boxes
    <div className="flex items-center gap-6">
      
      {/* 1. Name Search */}
      <div className="relative">
        <input
          type="text"
          placeholder="Search players..."
          defaultValue={searchParams.get('q')?.toString()}
          onChange={(e) => handleFilterChange('q', e.target.value)}
          // Increased padding (px-6 py-4), width (w-72), and text size (text-base)
          className="bg-[#18181b] text-white px-6 py-4 pr-12 border border-gray-700 focus:outline-none focus:border-[#5ce1e6] transition-colors w-72 uppercase text-base tracking-wider placeholder:text-gray-600"
        />
        <span className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500 text-xl">⌕</span>
      </div>

      {/* 2. Team Dropdown */}
      <select
        defaultValue={searchParams.get('team')?.toString() || ""}
        onChange={(e) => handleFilterChange('team', e.target.value)}
        // Increased padding (px-6 py-4), width (w-72), and text size (text-base)
        className="bg-[#18181b] text-white px-6 py-4 border border-gray-700 focus:outline-none focus:border-[#5ce1e6] transition-colors w-72 uppercase text-base tracking-wider cursor-pointer appearance-none"
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