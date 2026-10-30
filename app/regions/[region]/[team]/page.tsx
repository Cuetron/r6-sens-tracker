import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { Breadcrumb, TeamLogo } from '@/app/components/ui';
import TeamCompare from '@/app/components/TeamCompare';
import { getPlayers } from '@/lib/players';
import {
  REGION_NAMES,
  SUBREGIONS,
  capitalize,
  groupSlug,
  numberWord,
  playersForRegion,
  regionSegment,
  type Player,
} from '@/lib/player-model';

// Refresh at most every 5 minutes instead of running a function on every visit
// (see lib/supabase-server.ts).
export const revalidate = 300;

const FULL_ROSTER = 5;

// Build every current region/team roster page ahead of time. New teams still work:
// they're built the first time someone opens them, then cached.
export async function generateStaticParams() {
  let players: Player[] = [];
  try {
    players = await getPlayers();
  } catch {
    // If the database can't be reached while building, pages are built on first visit instead.
    return [];
  }
  const seen = new Set<string>();
  const params: { region: string; team: string }[] = [];
  const add = (region: string, team: string) => {
    const key = `${region}|${team}`;
    if (seen.has(key)) return;
    seen.add(key);
    params.push({ region, team });
  };
  for (const p of players) {
    const segment = regionSegment(p);
    if (p.team) {
      add(segment, p.team);
      if (p.region) add(p.region, p.team); // the APAC page also lists its league teams
    } else if (p.status !== 'active') {
      add(segment, p.status);
      if (p.region) add(p.region, p.status);
    }
  }
  return params;
}

// Finds the roster for /regions/<region>/<team>. "free-agent" and "retired" are
// the two groups behind the "Without a team" rows on the region page.
async function loadRoster(regionParam: string, teamParam: string) {
  const all = await getPlayers();
  const { code, kind, players: inRegion } = playersForRegion(all, regionParam);
  const decodedTeam = decodeURIComponent(teamParam);
  const group = groupSlug(decodedTeam);

  const roster = (
    group
      ? inRegion.filter((p) => p.status === group)
      : inRegion.filter((p) => p.team === decodedTeam)
  ).sort((a, b) => a.name.localeCompare(b.name));

  const title = group ? (group === 'retired' ? 'Retired' : 'Free agent') : decodedTeam;
  return { code, kind, group, roster, title };
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ region: string; team: string }>;
}): Promise<Metadata> {
  const { region, team } = await params;
  const { title } = await loadRoster(region, team);
  return {
    title: `${title} player settings: sens, DPI and gear`,
    description: `Every ${title} player's Rainbow Six Siege sensitivity, DPI, FOV and mouse, side by side.`,
  };
}

function leadText(roster: Player[], group: 'free-agent' | 'retired' | null, slotsWanted: number) {
  const n = roster.length;
  const sent = roster.filter((p) => p.source === 'player').length;

  let line: string;
  if (group) {
    line = 'Players without a team, line by line.';
  } else if (n >= slotsWanted) {
    line = n === slotsWanted ? 'The full five-stack, line by line.' : 'The full roster, line by line.';
  } else {
    line = `${capitalize(numberWord(n))} of five players on file. Empty slots stay in place until someone sends the missing settings.`;
  }

  if (sent > 0) {
    if (n >= slotsWanted || group) {
      line +=
        sent === n
          ? ' All of them sent their settings to us directly.'
          : ` ${capitalize(numberWord(sent))} of them sent their settings to us directly.`;
    } else {
      line += ` ${capitalize(numberWord(sent))} sent theirs directly.`;
    }
  }
  return line;
}

export default async function TeamRoster({
  params,
}: {
  params: Promise<{ region: string; team: string }>;
}) {
  const { region, team } = await params;
  const { code, kind, group, roster, title } = await loadRoster(region, team);

  // A team (or group) with nobody in this region does not exist.
  if (roster.length === 0) notFound();

  // Always five columns for a real team; extra players add extra columns.
  const slotCount = group ? roster.length : Math.max(FULL_ROSTER, roster.length);
  const slots: (Player | null)[] = Array.from({ length: slotCount }, (_, i) => roster[i] ?? null);

  const regionName =
    kind === 'region'
      ? REGION_NAMES[code as keyof typeof REGION_NAMES]
      : kind === 'subregion'
        ? SUBREGIONS[code].name
        : code;
  const crumbs = [
    { label: 'Regions', href: '/regions' },
    ...(kind === 'subregion' ? [{ label: 'Asia-Pacific', href: '/regions/APAC' }] : []),
    { label: regionName, href: `/regions/${encodeURIComponent(code)}` },
    { label: title },
  ];

  // The name is as big as the page allows (168px) and shrinks for long names.
  const nameStyle: React.CSSProperties = {
    fontSize: `min(var(--name-max), calc(var(--avail) / ${(Math.max(title.length, 1) * 0.5).toFixed(2)}))`,
  };

  return (
    <main id="main">
      <div className="page pt-6 md:pt-8">
        <Breadcrumb items={crumbs} />
      </div>

      {/* --- HEADER --- */}
      <header className="page mt-8 md:mt-12">
        <div className="flex flex-wrap items-end justify-between gap-x-10 gap-y-6">
          <div className="flex min-w-0 flex-col gap-4 md:flex-row md:items-center md:gap-8">
            <div className="shrink-0 md:hidden">
              <TeamLogo team={group ? null : title} kind={group ?? 'team'} size={72} priority />
            </div>
            <div className="hidden shrink-0 md:block">
              <TeamLogo team={group ? null : title} kind={group ?? 'team'} size={150} priority />
            </div>
            <h1
              className="display min-w-0 [--avail:calc(100vw_-_40px)] [--name-max:60px] md:[--avail:calc(min(100vw_-_64px,1344px)_-_190px)] md:[--name-max:168px]"
              style={nameStyle}
            >
              {title}
            </h1>
          </div>
          <p className="max-w-[320px] pb-2 text-base leading-normal text-muted md:text-lg md:leading-[1.5]">
            {leadText(roster, group, FULL_ROSTER)}
          </p>
        </div>
      </header>

      {/* --- COMPARE TABLE --- */}
      <section aria-label={`${title} roster compared`} className="page mt-12 md:mt-16">
        <TeamCompare slots={slots} />
      </section>
    </main>
  );
}
