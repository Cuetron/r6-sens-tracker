import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import Icon from '@/app/components/Icons';
import { Breadcrumb, TeamLogo } from '@/app/components/ui';
import { getPlayers } from '@/lib/players';
import {
  REGION_BADGES,
  REGION_NAMES,
  SUBREGIONS,
  groupTeams,
  playersForRegion,
  type Player,
  type RegionCode,
} from '@/lib/player-model';

// Refresh at most every 5 minutes instead of running a function on every visit
// (see lib/supabase-server.ts).
export const revalidate = 300;

// Build the known region pages ahead of time. The page itself upper-cases the region
// from the URL, so we do the same here. Anything else is still built on first visit.
export async function generateStaticParams() {
  const known = ['NA', 'EU', 'SA', 'APAC', 'CHINA', 'OCE', 'ASIA', 'APAC NORTH'];
  let fromDb: string[] = [];
  try {
    fromDb = (await getPlayers()).map((p) => p.regionRaw).filter(Boolean);
  } catch {
    // If the database can't be reached while building, the known regions still get built.
  }
  return Array.from(new Set([...known, ...fromDb])).map((region) => ({ region }));
}

// What a region page is called and which badge it shows.
function describe(code: string, kind: 'region' | 'subregion' | 'other') {
  if (kind === 'region') {
    return { name: REGION_NAMES[code as RegionCode], badge: REGION_BADGES[code as RegionCode] };
  }
  if (kind === 'subregion') {
    return { name: SUBREGIONS[code].name, badge: SUBREGIONS[code].logo };
  }
  return { name: code, badge: null };
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ region: string }>;
}): Promise<Metadata> {
  const { region } = await params;
  const { code, kind } = playersForRegion([], region);
  const { name } = describe(code, kind);
  return {
    title: `${name} teams and player settings`,
    description: `Rainbow Six Siege pro settings for ${name}: every team with its roster, sensitivity, DPI and gear.`,
  };
}

const ROW_GRID =
  'group grid grid-cols-[56px_minmax(0,1fr)_auto] items-center gap-x-4 gap-y-1 py-5 transition-colors duration-[120ms] hover:bg-panel md:grid-cols-[56px_minmax(0,1.1fr)_minmax(0,1.5fr)_48px_32px] md:gap-x-6 md:px-2 md:py-4 desk:grid-cols-[56px_minmax(0,1.1fr)_minmax(0,1.5fr)_64px_32px]';

function RosterRow({
  href,
  logo,
  title,
  players,
  muted = false,
}: {
  href: string;
  logo: React.ReactNode;
  title: string;
  players: Player[];
  muted?: boolean;
}) {
  // Phone: logo, name and count on one line, the roster underneath.
  // Tablet and desktop: logo | name | roster | count | arrow, all on one row.
  return (
    <li className="border-b border-line">
      <Link href={href} prefetch={false} className={ROW_GRID}>
        <span className="md:col-start-1 md:row-start-1">{logo}</span>
        <p
          className={`display text-[32px] md:col-start-2 md:row-start-1 md:text-[44px] desk:text-[52px] ${
            muted ? 'text-muted' : ''
          }`}
        >
          {title}
        </p>
        <p className="num text-right text-[22px] text-muted md:col-start-4 md:row-start-1 md:text-[20px]">
          {players.length}
        </p>
        <p className="col-span-3 text-[14px] leading-normal text-muted md:col-span-1 md:col-start-3 md:row-start-1 md:text-[15px]">
          {players.map((p) => p.name).join(' \u00b7 ')}
        </p>
        <Icon
          name="arrow-right"
          size={22}
          className="hidden transition-transform duration-[120ms] group-hover:translate-x-1 md:col-start-5 md:row-start-1 md:block"
        />
      </Link>
    </li>
  );
}

export default async function RegionTeams({ params }: { params: Promise<{ region: string }> }) {
  const { region } = await params;
  const all = await getPlayers();
  const { code, kind, players } = playersForRegion(all, region);

  // A made-up region with nobody in it is a 404. Known regions with no players still render.
  if (kind === 'other' && players.length === 0) notFound();

  const { name, badge } = describe(code, kind);
  const teams = groupTeams(players);
  const freeAgents = players.filter((p) => p.status === 'free-agent');
  const retired = players.filter((p) => p.status === 'retired');

  const crumbs =
    kind === 'subregion'
      ? [
          { label: 'Regions', href: '/regions' },
          { label: 'Asia-Pacific', href: '/regions/APAC' },
          { label: name },
        ]
      : [{ label: 'Regions', href: '/regions' }, { label: name }];

  // The name is as big as the page allows (240px) and shrinks for long names.
  const nameStyle: React.CSSProperties = {
    fontSize: `min(var(--name-max), calc(var(--avail) / ${(Math.max(name.length, 1) * 0.5).toFixed(2)}))`,
  };

  return (
    <main id="main">
      <div className="page pt-6 md:pt-8">
        <Breadcrumb items={crumbs} />
      </div>

      {/* --- HEADER --- */}
      <header className="page mt-8 md:mt-12">
        <div className="flex flex-wrap items-end justify-between gap-x-8 gap-y-6">
          <div className="flex min-w-0 flex-col gap-4 md:flex-row md:items-center md:gap-8">
            {badge && (
              <Image
                src={badge}
                alt=""
                width={150}
                height={150}
                priority
                style={{ width: 'auto', height: 'auto', maxHeight: 150, maxWidth: 150 }}
                className="h-[88px] w-auto object-contain md:h-[150px]"
              />
            )}
            <h1
              className="display min-w-0 [--avail:calc(100vw_-_40px)] [--name-max:120px] md:[--avail:calc(min(100vw_-_64px,1344px)_-_460px)] md:[--name-max:240px]"
              style={nameStyle}
            >
              {name}
            </h1>
          </div>
          <dl className="flex gap-8 pb-2">
            <div className="flex flex-col">
              <dd className="num order-first text-[36px] md:text-[44px]">{players.length}</dd>
              <dt className="mt-1 text-[13px] text-muted">players</dt>
            </div>
            <div className="flex flex-col">
              <dd className="num order-first text-[36px] md:text-[44px]">{teams.length}</dd>
              <dt className="mt-1 text-[13px] text-muted">teams</dt>
            </div>
          </dl>
        </div>
      </header>

      {/* APAC is made of leagues: keep the way into each one. */}
      {code === 'APAC' && (
        <nav aria-label="APAC leagues" className="page mt-8 flex flex-wrap items-center gap-3">
          <span className="text-[14px] text-muted">Leagues</span>
          {Object.entries(SUBREGIONS).map(([key, sub]) => (
            <Link
              key={key}
              href={`/regions/${encodeURIComponent(key)}`}
              className="btn btn-secondary h-10 px-4 text-[14px]"
            >
              {sub.league}
            </Link>
          ))}
        </nav>
      )}

      {/* --- TEAMS --- */}
      <section aria-label="Teams" className="page mt-10 md:mt-14">
        {teams.length === 0 ? (
          <p className="border-t border-line py-10 text-[18px] text-muted">
            No teams found in this region yet.
          </p>
        ) : (
          <>
            <div
              aria-hidden="true"
              className="hidden border-b border-line pb-3 text-[13px] text-muted md:grid md:grid-cols-[56px_minmax(0,1.1fr)_minmax(0,1.5fr)_48px_32px] md:gap-x-6 md:px-2 desk:grid-cols-[56px_minmax(0,1.1fr)_minmax(0,1.5fr)_64px_32px]"
            >
              <span className="col-span-2">Team</span>
              <span>Roster</span>
              <span className="text-right">Players</span>
            </div>
            <ul>
              {teams.map((t) => (
                <RosterRow
                  key={t.team}
                  href={`/regions/${encodeURIComponent(code)}/${encodeURIComponent(t.team)}`}
                  logo={<TeamLogo team={t.team} />}
                  title={t.team}
                  players={t.players}
                />
              ))}
            </ul>
          </>
        )}
      </section>

      {/* --- WITHOUT A TEAM: exactly two groups, Free agent and Retired --- */}
      {(freeAgents.length > 0 || retired.length > 0) && (
        <section aria-labelledby="noteam-heading" className="page mt-16 md:mt-24">
          <h2 id="noteam-heading" className="display text-[32px] text-muted md:text-[40px]">
            Without a team
          </h2>
          <ul className="mt-6 border-t border-line">
            {freeAgents.length > 0 && (
              <RosterRow
                href={`/regions/${encodeURIComponent(code)}/free-agent`}
                logo={<TeamLogo team={null} kind="free-agent" />}
                title="Free agent"
                players={freeAgents}
                muted
              />
            )}
            {retired.length > 0 && (
              <RosterRow
                href={`/regions/${encodeURIComponent(code)}/retired`}
                logo={<TeamLogo team={null} kind="retired" />}
                title="Retired"
                players={retired}
                muted
              />
            )}
          </ul>
        </section>
      )}
    </main>
  );
}
