import Image from 'next/image';
import Link from 'next/link';
import type { Metadata } from 'next';
import Icon from '@/app/components/Icons';
import { getPlayers } from '@/lib/players';
import { MAIN_REGIONS, REGION_BADGES, REGION_NAMES, groupTeams } from '@/lib/player-model';

// Refresh at most every 5 minutes (see lib/supabase-server.ts).
export const revalidate = 300;

export const metadata: Metadata = {
  title: 'Regions: pro Siege settings by scene',
  description:
    'Browse Rainbow Six Siege pro settings by region: North America, Europe, South America and Asia-Pacific. Every team page lines up its roster side by side.',
};

export default async function RegionsDirectory() {
  const players = await getPlayers();

  const regions = MAIN_REGIONS.map((code) => {
    const inRegion = players.filter((p) => p.region === code);
    return {
      code,
      name: REGION_NAMES[code],
      badge: REGION_BADGES[code],
      count: inRegion.length,
      // The five teams with the most players on file
      topTeams: groupTeams(inRegion)
        .slice(0, 5)
        .map((t) => t.team),
    };
  });

  return (
    <main id="main">
      <header className="page pt-12 md:pt-20 desk:pt-28">
        <div className="desk:grid desk:grid-cols-[1fr_380px] desk:items-end desk:gap-12">
          <h1 className="display text-[60px] md:text-[104px] desk:text-[136px]">Four scenes.</h1>
          <p className="mt-6 max-w-[420px] text-base leading-normal text-muted md:text-lg md:leading-[1.5] desk:mt-0 desk:pb-3">
            Pick a region to see its teams. Every team page lines up its roster side by side.
          </p>
        </div>
      </header>

      <section aria-label="Regions" className="page mt-12 md:mt-16">
        <ul className="border-t border-line">
          {regions.map((r) => (
            <li key={r.code} className="border-b border-line">
              <Link
                href={`/regions/${r.code}`}
                className="group grid grid-cols-[56px_1fr_auto] items-center gap-x-4 gap-y-3 py-6 transition-colors duration-[120ms] hover:bg-panel md:grid-cols-[88px_minmax(0,0.8fr)_minmax(0,1.3fr)_auto_32px] md:gap-x-8 md:px-2 md:py-8 desk:grid-cols-[120px_380px_minmax(0,1fr)_120px_32px]"
              >
                <Image
                  src={r.badge}
                  alt=""
                  width={120}
                  height={120}
                  style={{ width: '100%', height: 'auto', maxHeight: 120 }}
                  className="object-contain"
                />
                <p className="display text-[64px] md:text-[104px] desk:text-[168px]">{r.code}</p>

                <div className="order-4 col-span-3 md:order-none md:col-span-1">
                  <p className="text-[20px] font-semibold md:text-[24px]">{r.name}</p>
                  {r.topTeams.length > 0 && (
                    <p className="mt-1 text-[15px] leading-normal text-muted md:text-base">
                      {r.topTeams.join(', ')}
                    </p>
                  )}
                </div>

                <div className="order-3 text-right md:order-none">
                  <p className="num text-[40px] md:text-[56px]">{r.count}</p>
                  <p className="text-[13px] text-muted md:text-[14px]">players</p>
                </div>

                <Icon
                  name="arrow-right"
                  size={24}
                  className="hidden transition-transform duration-[120ms] group-hover:translate-x-1 md:block"
                />
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}
