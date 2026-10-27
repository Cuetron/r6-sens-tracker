"use client";

// Controlled filter inputs. The parent (Directory) owns the state and does the
// filtering in the browser, so typing never causes a request to the server.
export default function PlayerFilters({
  teams,
  regions,
  q,
  team,
  region,
  onChange,
}: {
  teams: string[];
  regions: string[];
  q: string;
  team: string;
  region: string;
  onChange: (key: 'q' | 'team' | 'region', value: string) => void;
}) {
  return (
    // Changed flex-direction for mobile stacking, horizontal for desktop
    <div className="flex flex-col md:flex-row items-center justify-center gap-4 w-full px-4 md:px-0">

      {/* 1. Name Search */}
      <div className="relative w-full md:w-auto">
        <input
          type="text"
          placeholder="Search players..."
          value={q}
          onChange={(e) => onChange('q', e.target.value)}
          // w-full on mobile, w-64 on desktop
          className="bg-[#18181b] text-white px-6 py-4 pr-12 border border-gray-700 focus:outline-none focus:border-[#5ce1e6] transition-colors w-full md:w-64 uppercase text-base tracking-wider placeholder:text-gray-600"
        />
        <span className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500 text-xl">⌕</span>
      </div>

      {/* 2. Region Dropdown */}
      <select
        value={region}
        onChange={(e) => onChange('region', e.target.value)}
        className="bg-[#18181b] text-white px-6 py-4 border border-gray-700 focus:outline-none focus:border-[#5ce1e6] transition-colors w-full md:w-64 uppercase text-base tracking-wider cursor-pointer appearance-none"
      >
        <option value="">All Regions</option>
        {regions.map((r) => (
          <option key={r} value={r}>{r}</option>
        ))}
      </select>

      {/* 3. Team Dropdown */}
      <select
        value={team}
        onChange={(e) => onChange('team', e.target.value)}
        className="bg-[#18181b] text-white px-6 py-4 border border-gray-700 focus:outline-none focus:border-[#5ce1e6] transition-colors w-full md:w-64 uppercase text-base tracking-wider cursor-pointer appearance-none"
      >
        <option value="">All Teams</option>
        {teams.map((t) => (
          <option key={t} value={t}>{t}</option>
        ))}
      </select>

    </div>
  );
}
