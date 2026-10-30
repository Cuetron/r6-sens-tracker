import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import CountUp from '@/app/components/CountUp';
import Icon from '@/app/components/Icons';
import PlayerActions from '@/app/components/PlayerActions';
import { Breadcrumb, Dash, GearValue, SentMark, TeamLogo } from '@/app/components/ui';
import { getPlayers } from '@/lib/players';
import {
  REGION_NAMES,
  SUBREGIONS,
  copySettingsText,
  longDate,
  regionLabel,
  regionSegment,
  sensLabel,
  teamHref,
  teamLabel,
  type Player,
} from '@/lib/player-model';

// Each player page is built once and then refreshed at most every 5 minutes
// (see lib/supabase-server.ts), instead of running a function on every visit.
export const revalidate = 300;

// Build every current player's page ahead of time. Players added later still work:
// their page is built the first time someone opens it, then cached like the others.
export async function generateStaticParams() {
  try {
    const players = await getPlayers();
    return players.map((p) => ({ id: String(p.id) }));
  } catch {
    // If the database can't be reached while building, pages are built on first visit instead.
    return [];
  }
}

// One lookup shared by generateMetadata and the page itself (the player list is
// read once per render through React `cache` in lib/players.ts).
async function findPlayer(id: string) {
  const players = await getPlayers();
  const player = players.find((p) => String(p.id) === id) ?? null;
  return { players, player };
}

// Runs BEFORE the page loads to generate the Discord/Google tags
export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const { player } = await findPlayer(id);

  // If the player isn't found, fallback to default
  if (!player) {
    return { title: 'Player Not Found' };
  }

  const description = `${player.name}'s Rainbow Six Siege settings: ${
    sensLabel(player) ? `sens ${sensLabel(player)}, ` : ''
  }${player.dpi !== null ? `${player.dpi} DPI, ` : ''}${
    player.fov !== null ? `${player.fov} FOV, ` : ''
  }and gear on R6Sens.`;

  return {
    title: `${player.name} settings: sens, DPI and gear`,
    description,
    openGraph: {
      title: `${player.name}${player.team ? ` (${player.team})` : ''} | R6Sens`,
      description,
    },
  };
}

// ---------------------------------------------------------------------
// Pieces
// ---------------------------------------------------------------------

// Big values shrink on narrow screens so long values such as "12 / 12" never overflow.
const VALUE_BASE =
  'num block text-[56px] md:text-[clamp(48px,7.2vw,104px)] desk:text-[104px]';
const VALUE_LONG =
  'num block text-[40px] md:text-[clamp(34px,5.2vw,76px)] desk:text-[104px]';

function Cell({
  label,
  value,
  caption,
  phoneOrder,
}: {
  label: string;
  value: string | null;
  caption?: string;
  /** Phone shows the sheet 2 by 4 in a different order than desktop. */
  phoneOrder: string;
}) {
  return (
    <div className={`${phoneOrder} flex min-h-[170px] flex-col justify-between bg-ground p-5 md:order-none md:min-h-[186px] md:p-6`}>
      <p className="text-[13px] text-muted md:text-[14px]">{label}</p>
      <div className="mt-6">
        {value === null ? (
          <>
            <span className="dash" style={{ width: 48, height: 6 }} role="img" aria-label="Not shared yet" />
            <p className="mt-3 text-[12px] text-muted md:text-[13px]">not shared yet</p>
          </>
        ) : (
          <>
            <CountUp text={value} className={value.length > 5 ? VALUE_LONG : VALUE_BASE} />
            {caption && <p className="mt-2 text-[12px] text-muted md:text-[13px]">{caption}</p>}
          </>
        )}
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string | number | null }) {
  return (
    <div>
      <p className="text-[12px] text-muted">{label}</p>
      <p className="num mt-1 text-[26px] md:text-[28px]">{value ?? <Dash />}</p>
    </div>
  );
}

function CompactRow({ p, showAds }: { p: Player; showAds: boolean }) {
  return (
    <li>
      <Link
        href={`/player/${p.id}`}
        prefetch={false}
        className="flex items-center justify-between gap-4 bg-panel px-5 py-4 transition-colors duration-[120ms] hover:bg-line"
      >
        <div className="min-w-0">
          <p className="display truncate text-[28px] leading-none">{p.name}</p>
          <p className="mt-1 truncate text-[12px] text-muted">{teamLabel(p)}</p>
        </div>
        <div className="flex shrink-0 items-center gap-6 md:gap-8">
          <Stat label="DPI" value={p.dpi} />
          <Stat label="Sens" value={sensLabel(p)} />
          {showAds && (
            <div className="hidden md:block">
              <Stat label="ADS 1x" value={p.ads1x} />
            </div>
          )}
          <Icon name="chevron-right" size={18} className="text-muted" />
        </div>
      </Link>
    </li>
  );
}

// ---------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------
export default async function PlayerProfile({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { players, player } = await findPlayer(id);

  if (!player) {
    notFound();
  }

  const isPlayerSource = player.source === 'player';
  const regionName = player.subregion
    ? SUBREGIONS[player.subregion].name
    : player.region
      ? REGION_NAMES[player.region]
      : player.regionRaw;
  const updated = longDate(player.updatedAt);

  // Teammates and similar setups
  const teammates = player.team
    ? players.filter((p) => p.id !== player.id && p.status === 'active' && p.team === player.team)
    : [];
  const teammateIds = new Set(teammates.map((p) => p.id));
  const myH = player.sensH !== null ? parseFloat(player.sensH) : NaN;
  const similar =
    player.dpi !== null && Number.isFinite(myH)
      ? players
          .filter((p) => {
            if (p.id === player.id || teammateIds.has(p.id)) return false;
            if (p.dpi !== player.dpi || p.sensH === null) return false;
            const h = parseFloat(p.sensH);
            return Number.isFinite(h) && Math.abs(h - myH) <= 1;
          })
          .sort((a, b) => (b.updatedAt ?? '').localeCompare(a.updatedAt ?? ''))
          .slice(0, 3)
      : [];

  const sens = sensLabel(player);
  const teamUrl = teamHref(player);
  const group = player.status === 'retired' ? 'retired' : 'free-agent';
  const crumbs = [
    { label: 'Database', href: '/' },
    { label: regionLabel(player), href: `/regions/${encodeURIComponent(regionSegment(player))}` },
    player.team
      ? { label: player.team, href: teamUrl ?? undefined }
      : {
          label: teamLabel(player),
          href: `/regions/${encodeURIComponent(regionSegment(player))}/${group}`,
        },
    { label: player.name },
  ];

  // Name size: as big as the page allows (240px desktop, 168px phone), shrinking for long names.
  const nameChars = Math.max(player.name.length, 1);
  const nameStyle: React.CSSProperties = {
    fontSize: `min(var(--name-max), calc(min(100vw - 40px, 1344px) / ${(nameChars * 0.5).toFixed(2)}))`,
  };

  const gear: [string, string | null][] = [
    ['Mouse', player.mouse],
    ['Mousepad', player.mousepad],
    ['Keyboard', player.keyboard],
    ['Switches', player.switches],
    ['Headset', player.headset],
    ['In-ears', player.inEars],
  ];

  return (
    <main id="main" className="pb-4">
      {/* --- BREADCRUMB + ACTIONS --- */}
      <div className="page flex flex-col gap-5 pt-6 md:flex-row md:items-center md:justify-between md:pt-8">
        <Breadcrumb items={crumbs} />
        <PlayerActions name={player.name} copyText={copySettingsText(player)} />
      </div>

      {/* --- HERO --- */}
      <header className="page mt-6 md:mt-10">
        <div className="flex flex-wrap items-end gap-x-10 gap-y-5">
          <h1
            className="display [--name-max:168px] md:[--name-max:240px]"
            style={nameStyle}
          >
            {player.name}
          </h1>
          <div className="pb-3 md:pb-6">
            <div className="flex items-center gap-3">
              <TeamLogo
                team={player.team}
                kind={player.team ? 'team' : group}
                size={32}
                priority
              />
              <p className="text-[18px] font-semibold md:text-[22px]">
                {teamUrl ? (
                  <Link href={teamUrl} className="transition-colors duration-[120ms] hover:text-accent">
                    {player.team}
                  </Link>
                ) : (
                  teamLabel(player)
                )}{' '}
                <span className="font-normal text-muted">{regionName}</span>
              </p>
            </div>
            <div className="mt-3 flex flex-wrap items-center gap-x-6 gap-y-2">
              {isPlayerSource && <SentMark />}
              {updated && <p className="text-[13px] text-muted md:text-[14px]">Updated {updated}</p>}
            </div>
          </div>
        </div>
      </header>

      {/* --- IN GAME --- */}
      <section aria-labelledby="ingame-heading" className="page mt-12 md:mt-16">
        <div className="flex items-end justify-between gap-6">
          <h2 id="ingame-heading" className="display text-[40px] md:text-[56px]">
            In game
          </h2>
          <p className="hidden pb-1 text-[14px] text-muted md:block">
            Copy settings puts these values on your clipboard in this order.
          </p>
        </div>

        {/* 4 by 2 on tablet and desktop, 2 by 4 on phone */}
        <div className="mt-6 grid grid-cols-2 gap-px border border-line bg-line md:grid-cols-4">
          <Cell label="Sensitivity" value={sens} caption="horizontal / vertical" phoneOrder="order-1" />
          <Cell label="ADS 1x" value={player.ads1x !== null ? String(player.ads1x) : null} phoneOrder="order-3" />
          <Cell label="ADS 2.5x" value={player.ads25x !== null ? String(player.ads25x) : null} phoneOrder="order-4" />
          <Cell
            label="Multiplier"
            value={player.multiplier}
            caption={player.multiplier === '0.02' ? 'default' : undefined}
            phoneOrder="order-7"
          />
          <Cell label="DPI" value={player.dpi !== null ? String(player.dpi) : null} phoneOrder="order-2" />
          <Cell label="Field of view" value={player.fov !== null ? String(player.fov) : null} phoneOrder="order-5" />
          <Cell label="Aspect ratio" value={player.aspectRatio} phoneOrder="order-6" />

          {/* Monitor is free text (e.g. "BenQ XL2566K+"), so it is set smaller than the numbers. */}
          <div className="order-8 flex min-h-[170px] flex-col justify-between bg-ground p-5 md:order-none md:min-h-[186px] md:p-6">
            <p className="text-[13px] text-muted md:text-[14px]">Monitor</p>
            <div className="mt-6">
              {player.monitor ? (
                <p className="num text-[28px] md:text-[36px]">{player.monitor}</p>
              ) : (
                <>
                  <span className="dash" style={{ width: 48, height: 6 }} role="img" aria-label="Not shared yet" />
                  <p className="mt-3 text-[12px] text-muted md:text-[13px]">not shared yet</p>
                </>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* --- GEAR --- */}
      <section aria-labelledby="gear-heading" className="page mt-20 md:mt-28">
        <div className="md:grid md:grid-cols-[minmax(0,1fr)_minmax(0,1.7fr)] md:gap-12">
          <div>
            <h2 id="gear-heading" className="display text-[40px] md:text-[56px]">
              Gear
            </h2>
            <p className="mt-3 text-[14px] text-muted md:text-[15px]">
              What {player.name} plays on,{' '}
              {isPlayerSource ? 'straight from the player.' : 'collected from public sources.'}
            </p>
          </div>
          <dl className="mt-6 md:mt-0">
            {gear.map(([label, value], i) => (
              <div
                key={label}
                className={`flex flex-col gap-1 border-t border-line py-4 md:flex-row md:items-center md:justify-between md:py-[18px] ${
                  i === gear.length - 1 ? 'border-b' : ''
                }`}
              >
                <dt className="text-[13px] text-muted md:text-[15px]">{label}</dt>
                <dd className="text-[17px] font-medium md:text-right md:text-[20px]">
                  <GearValue value={value} />
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* --- ALSO ON <TEAM> and SIMILAR SETUPS --- */}
      {(teammates.length > 0 || similar.length > 0) && (
        <div className="page mt-20 grid gap-12 md:mt-28 md:grid-cols-2 md:gap-8">
          {teammates.length > 0 && (
            <section aria-labelledby="teammates-heading">
              <h2 id="teammates-heading" className="display text-[32px] md:text-[40px]">
                Also on {player.team}
              </h2>
              <ul className="mt-5 flex flex-col gap-3">
                {teammates.map((p) => (
                  <CompactRow key={p.id} p={p} showAds />
                ))}
              </ul>
            </section>
          )}
          {similar.length > 0 && (
            <section aria-labelledby="similar-heading">
              <h2 id="similar-heading" className="display text-[32px] md:text-[40px]">
                Similar setups
              </h2>
              <ul className="mt-5 flex flex-col gap-3">
                {similar.map((p) => (
                  <CompactRow key={p.id} p={p} showAds />
                ))}
              </ul>
            </section>
          )}
        </div>
      )}
    </main>
  );
}
