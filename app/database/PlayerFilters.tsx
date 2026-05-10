"use client";

import { useRouter, useSearchParams } from 'next/navigation';

export default function PlayerFilters({ teams }: { teams: string[] }) {
  const router = useRouter();
  const searchParams = useSearchParams();

  // A reusable function to update any filter in the URL
  const handleFilterChange = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams);
    
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    
    // Update the URL without reloading the page
    router.replace(`/database?${params.toString()}`);
  };

  return (
    <div className="flex items-center gap-4">
      
      {/* 1. Name Search */}
      <div className="relative">
        <input
          type="text"
          placeholder="Search players..."
          defaultValue={searchParams.get('q')?.toString()}
          onChange={(e) => handleFilterChange('q', e.target.value)}
          className="bg-[#18181b] text-white px-4 py-2 pr-10 border border-gray-700 focus:outline-none focus:border-[#5ce1e6] transition-colors w-48 uppercase text-sm tracking-wider placeholder:text-gray-600"
        />
        <span className="absolute right-3 top-2 text-gray-500">⌕</span>
      </div>

      {/* 2. Team Dropdown */}
      <select
        defaultValue={searchParams.get('team')?.toString() || ""}
        onChange={(e) => handleFilterChange('team', e.target.value)}
        className="bg-[#18181b] text-white px-4 py-2 border border-gray-700 focus:outline-none focus:border-[#5ce1e6] transition-colors w-48 uppercase text-sm tracking-wider cursor-pointer"
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