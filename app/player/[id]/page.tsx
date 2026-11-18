import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import CountUp from '@/app/components/CountUp';
import Icon from '@/app/components/Icons';
import PlayerActions from '@/app/components/PlayerActions';
import { Breadcrumb, Dash, GearValue, SentMark, TeamLogo } from '@/app/components/ui';
import { playerPhoto } from '@/lib/player-photos';
import { getPlayers } from '@/lib/players';
import { teamLogo } from '@/lib/teams';
import {
  REGION_NAMES,
  SUBREGIONS,
  copySettingsText,
  longDate,
  regionLabel,
  regionBadge,
  regionSegment,
  sensLabel,
  teamHref,
  teamLabel,
  type Player,
} from '@/lib/player-model';

// Fully static: built once per deploy, never regenerated, so visitors cause no
// ISR writes. New data goes live on the next rebuild (see lib/players.ts).
export const revalidate = false;

// Only paths built during the deploy exist. Anything else (bots guessing ids,
// lowercase or misspelled URLs) gets a plain 404 instead of a new cached page.
export const dynamicParams = false;

// Build every current player's page during the deploy. Players added later get a
// page on the next rebuild. A Supabase error fails the build (see lib/players.ts).
export async function generateStaticParams() {
  const players = await getPlayers();
  return players.map((p) => ({ id: String(p.id) }));
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
// Values are as big as the design allows (56px phone, up to 104px desktop) and
// shrink to fit their box on one line, so a long value like 0.00223 or 77 / 77
// never overflows or wraps. 0.62em is a safe average width per character in
// Barlow Condensed; cqw is 1% of the box's own width (the box is a container).
const VALUE_MAX = '[--v-max:56px] md:[--v-max:clamp(48px,7.2vw,104px)] desk:[--v-max:104px]';
function valueSize(value: string): React.CSSProperties {
  const perChar = 100 / (Math.max(value.length, 1) * 0.62);
  return { fontSize: `min(var(--v-max), ${perChar.toFixed(2)}cqw)` };
}

function Cell({
  label,
  value,
  caption,
  wide = false,
}: {
  label: string;
  value: string | null;
  caption?: string;
  /** Takes two columns (used for sensitivity, the headline value). */
  wide?: boolean;
}) {
  return (
    <div
      className={`flex min-h-[170px] min-w-0 flex-col justify-between bg-ground p-5 md:min-h-[186px] md:p-6 ${
        wide ? 'col-span-2' : ''
      }`}
    >
      <p className="text-[13px] text-muted md:text-[14px]">{label}</p>
      <div className={`@container mt-6 ${VALUE_MAX}`}>
        {value === null ? (
          <>
            <span className="dash" style={{ width: 48, height: 6 }} role="img" aria-label="Not shared yet" />
            <p className="mt-3 text-[12px] text-muted md:text-[13px]">not shared yet</p>
          </>
        ) : (
          <>
            <div style={valueSize(value)}>
              <CountUp text={value} className="num block whitespace-nowrap" />
            </div>
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

  // Right side of the hero: the player's photo, or else a faint team logo.
  // Free agents and retired players without a photo keep the full-width name.
  const photo = playerPhoto(player.id);
  const logo = player.status === 'active' ? teamLogo(player.team) : null;
  const art: { kind: 'photo' | 'logo'; src: string } | null = photo
    ? { kind: 'photo', src: photo }
    : logo
      ? { kind: 'logo', src: logo }
      : null;

  // Name size: as big as the page allows (240px desktop, 168px phone), shrinking for long names.
  // Next to the photo or logo (tablet and up) the name gets 60% of the width.
  const nameChars = Math.max(player.name.length, 1);
  const nameStyle: React.CSSProperties = {
    fontSize: `min(var(--name-max), calc(var(--avail) / ${(nameChars * 0.5).toFixed(2)}))`,
  };
  const availClass = art
    ? '[--avail:min(100vw_-_40px,1344px)] md:[--avail:calc((100vw_-_64px)_*_0.6)] desk:[--avail:calc(min(100vw_-_96px,1344px)_*_0.6)]'
    : '[--avail:min(100vw_-_40px,1344px)]';

  const gear: [string, string | null][] = [
    ['Mouse', player.mouse],
    ['Mousepad', player.mousepad],
    ['Keyboard', player.keyboard],
    ['Switches', player.switches],
    ['Headset', player.headset],
    ['In-ears', player.inEars],
    ['Monitor', player.monitor],
  ];

  return (
    <main id="main" className="pb-4">
      {/* --- BREADCRUMB + ACTIONS --- */}
      <div className="page flex flex-col gap-5 pt-6 md:flex-row md:items-center md:justify-between md:pt-8">
        <Breadcrumb items={crumbs} />
        <PlayerActions name={player.name} copyText={copySettingsText(player)} />
      </div>

      {/* --- HERO --- */}
      <header className="page relative mt-6 md:mt-10">
        {/* Phone: the photo sits above the name and fades into it. */}
        {photo && (
          <div className="fade-bottom relative -mb-10 ml-auto h-[300px] w-[78%] max-w-[340px] md:hidden">
            <Image src={photo} alt="" fill priority sizes="340px" className="object-contain object-bottom" />
          </div>
        )}

        {/* Tablet and desktop: photo (or faint team logo) on the right, across from the
            name, running past the header and fading out above the settings grid. */}
        {art && (
          <div
            aria-hidden="true"
            className={`pointer-events-none absolute right-5 top-0 -bottom-[112px] hidden w-[38%] md:right-8 desk:right-12 ${
              art.kind === 'photo'
                ? 'fade-bottom md:block'
                : 'items-center justify-center p-10 md:flex desk:p-14'
            }`}
          >
            {art.kind === 'photo' ? (
              <Image
                src={art.src}
                alt=""
                fill
                priority
                sizes="(min-width: 1200px) 520px, 38vw"
                className="object-contain object-bottom"
              />
            ) : (
              <div className="relative h-full max-h-[300px] w-full">
                <Image
                  src={art.src}
                  alt=""
                  fill
                  sizes="(min-width: 1200px) 420px, 30vw"
                  className="object-contain opacity-[0.07] grayscale"
                />
              </div>
            )}
          </div>
        )}

        <div className={`relative flex flex-wrap items-end gap-x-10 gap-y-5 ${art ? 'md:max-w-[60%]' : ''}`}>
          <h1
            className={`display [--name-max:168px] md:[--name-max:240px] ${availClass}`}
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
                badge={regionBadge(player)}
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
      <section aria-labelledby="ingame-heading" className="page relative mt-12 md:mt-16">
        <div className="flex items-end justify-between gap-6">
          <h2 id="ingame-heading" className="display text-[40px] md:text-[56px]">
            In game
          </h2>
          <p className="hidden pb-1 text-[14px] text-muted md:block">
            Copy settings puts these values on your clipboard in this order.
          </p>
        </div>

        {/* Same order as Copy settings. Sensitivity spans two columns, so tablet and
            desktop show 4 by 2 and phone shows sensitivity on top, then 2 by 3. */}
        <div className="mt-6 grid grid-cols-2 gap-px border border-line bg-line md:grid-cols-4">
          <Cell label="Sensitivity" value={sens} caption="horizontal / vertical" wide />
          <Cell label="ADS 1x" value={player.ads1x !== null ? String(player.ads1x) : null} />
          <Cell label="ADS 2.5x" value={player.ads25x !== null ? String(player.ads25x) : null} />
          <Cell label="DPI" value={player.dpi !== null ? String(player.dpi) : null} />
          <Cell
            label="Multiplier"
            value={player.multiplier}
            caption={player.multiplier === '0.02' ? 'default' : undefined}
          />
          <Cell label="Field of view" value={player.fov !== null ? String(player.fov) : null} />
          <Cell label="Aspect ratio" value={player.aspectRatio} />
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
