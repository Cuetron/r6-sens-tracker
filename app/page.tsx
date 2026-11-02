import Image from 'next/image';
import Link from 'next/link';
import Directory, { type DirectoryPlayer } from './components/Directory';
import Icon from '@/app/components/Icons';
import { SentMark } from '@/app/components/ui';
import { getPlayers } from '@/lib/players';
import { MAIN_REGIONS, REGION_BADGES, REGION_NAMES, relativeDay } from '@/lib/player-model';

// Rebuild this page at most every 5 minutes (see lib/supabase-server.ts).
// The page does not read `searchParams`, so it is served as static HTML
// instead of running a function on every visit. Filtering happens in the browser.
export const revalidate = 300;

export default async function Home() {
  // One query for everything the page needs. A Supabase error throws (see lib/players.ts),
  // so a temporary outage can't get saved as the page for the next 5 minutes.
  const players = await getPlayers();

  // Only the fields the table needs go to the browser.
  const directory: DirectoryPlayer[] = players.map((p) => ({
    id: p.id,
    name: p.name,
    team: p.team,
    status: p.status,
    region: p.region,
    subregion: p.subregion,
    regionRaw: p.regionRaw,
    dpi: p.dpi,
    sensH: p.sensH,
    sensV: p.sensV,
    ads1x: p.ads1x,
    ads25x: p.ads25x,
    fov: p.fov,
    aspectRatio: p.aspectRatio,
    mouse: p.mouse,
    updatedAt: p.updatedAt,
    source: p.source,
  }));

  // Hero facts come from the data, never hard-coded.
  const regionCount = new Set(players.map((p) => p.region).filter(Boolean)).size;
  const lastUpdate = players.reduce<string | null>(
    (latest, p) => (p.updatedAt && (!latest || p.updatedAt > latest) ? p.updatedAt : latest),
    null
  );
  const lastUpdateText = relativeDay(lastUpdate);

  const regionCards = MAIN_REGIONS.map((code) => ({
    code,
    name: REGION_NAMES[code],
    badge: REGION_BADGES[code],
    count: players.filter((p) => p.region === code).length,
  }));

  return (
    <main id="main">
      {/* --- HERO --- */}
      <header className="page pt-12 md:pt-20 desk:pt-28">
        <div className="desk:grid desk:grid-cols-[1fr_380px] desk:items-end desk:gap-12">
          <h1 className="display text-[60px] md:text-[104px] desk:text-[136px]">
            Pro settings,
            <br />
            <span className="text-accent">
              Sent by <span className="hidden md:inline">the </span>pros.
            </span>
          </h1>

          <div className="mt-6 desk:mt-0 desk:pb-3">
            <p className="max-w-[420px] text-base leading-normal text-muted md:text-lg md:leading-[1.5]">
              Sensitivity, DPI, FOV and gear for every Rainbow Six Siege pro. Most entries come
              straight from the player.
            </p>
            <dl className="mt-6 flex gap-8 md:mt-8">
              <div className="flex flex-col">
                <dd className="num order-first text-[36px] md:text-[40px]">{players.length}</dd>
                <dt className="mt-1 text-[12px] text-muted md:text-[13px]">players</dt>
              </div>
              <div className="flex flex-col">
                <dd className="num order-first text-[36px] md:text-[40px]">{regionCount}</dd>
                <dt className="mt-1 text-[12px] text-muted md:text-[13px]">regions</dt>
              </div>
              {lastUpdateText && (
                <div className="flex flex-col">
                  <dd className="num order-first text-[36px] uppercase md:text-[40px]">{lastUpdateText}</dd>
                  <dt className="mt-1 text-[12px] text-muted md:text-[13px]">last update</dt>
                </div>
              )}
            </dl>
          </div>
        </div>
      </header>

      {/* --- TABS, FILTERS, TABLE --- */}
      <Directory players={directory} />

      {/* --- BROWSE BY REGION --- */}
      <section aria-labelledby="browse-heading" className="page mt-24 md:mt-32">
        <div className="flex items-end justify-between gap-6">
          <h2 id="browse-heading" className="display text-[40px] md:text-[56px]">
            Browse by region
          </h2>
          <p className="hidden pb-1 text-[14px] text-muted md:block">Then by team, then by player.</p>
        </div>

        <ul className="mt-8 grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-3">
          {regionCards.map((r) => (
            <li key={r.code}>
              <Link
                href={`/regions/${r.code}`}
                className="group flex h-full min-h-[180px] flex-col justify-between bg-panel p-5 transition-colors duration-[120ms] hover:bg-line md:min-h-[220px] md:p-6"
              >
                <Image
                  src={r.badge}
                  alt=""
                  width={36}
                  height={36}
                  style={{ width: 36, height: 36 }}
                  className="object-contain"
                />
                <div>
                  <p className="display text-[56px] leading-none md:text-[72px]">{r.code}</p>
                  <div className="mt-3 flex items-end justify-between gap-2">
                    <div>
                      <p className="text-[14px] font-medium">{r.name}</p>
                      <p className="text-[12px] text-muted">{r.count} players</p>
                    </div>
                    <Icon
                      name="arrow-right"
                      className="hidden shrink-0 text-ink transition-transform duration-[120ms] group-hover:translate-x-0.5 md:block"
                    />
                  </div>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      {/* --- FOR PROS --- */}
      <section aria-labelledby="pros-heading" className="page mt-24 md:mt-32">
        <div className="flex flex-col gap-8 border border-accent p-6 md:flex-row md:items-center md:justify-between md:gap-12 md:p-16">
          <div className="max-w-[560px]">
            <SentMark />
            <h2 id="pros-heading" className="display mt-5 text-[40px] md:text-[56px]">
              Play pro? Send us your settings.
            </h2>
            <p className="mt-5 text-base leading-normal text-muted">
              <span className="hidden md:inline">
                Send a DM on X with your sens, DPI and gear. We add it and mark your entry as sent
                by you, so players know the numbers are real.
              </span>
              <span className="md:hidden">
                DM us on X with your sens, DPI and gear. Your entry gets the green mark, so players
                know the numbers are real.
              </span>
            </p>
          </div>
          <div className="flex flex-col items-stretch md:items-center md:text-center">
            <a
              href="https://twitter.com/Eaglemees"
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-primary"
            >
              DM @Eaglemees on X
              <Icon name="arrow-up-right" />
            </a>
            <p className="mt-3 hidden text-[13px] text-muted md:block">or any of the four editors</p>
          </div>
        </div>
      </section>
    </main>
  );
}
