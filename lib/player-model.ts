// Pure helpers: the Player type, turning a raw Supabase "Players" row into it,
// and small formatting/grouping functions. No server-only imports in here, so
// client components can use this file too.
//
// The database columns are NOT renamed or changed. This file only reads them
// (tolerating the different spellings the old pages already accepted).

export type RegionCode = 'NA' | 'EU' | 'SA' | 'APAC';
export type Status = 'active' | 'free-agent' | 'retired';

export type Player = {
  id: number;
  name: string;
  /** Team name for active players. null for free agents and retired players. */
  team: string | null;
  status: Status;
  /** Main region. null only when the database value is not one we recognise. */
  region: RegionCode | null;
  /** CHINA, OCE, ASIA or APAC NORTH (these are stored as `region` in the database). */
  subregion: string | null;
  /** The region text exactly as stored, upper-cased. */
  regionRaw: string;
  /** Sensitivity, split into horizontal and vertical (see parseSens). */
  sensH: string | null;
  sensV: string | null;
  ads1x: number | null;
  ads25x: number | null;
  dpi: number | null;
  multiplier: string | null;
  aspectRatio: string | null;
  fov: number | null;
  monitor: string | null;
  mouse: string | null;
  mousepad: string | null;
  keyboard: string | null;
  switches: string | null;
  headset: string | null;
  inEars: string | null;
  /** 'player' only when Source is "Player Direct". Anything else is 'collected'. */
  source: 'player' | 'collected';
  /** ISO timestamp (updated_at, falling back to created_at). */
  updatedAt: string | null;
};

export const MAIN_REGIONS: RegionCode[] = ['NA', 'EU', 'SA', 'APAC'];

export const REGION_NAMES: Record<RegionCode, string> = {
  NA: 'North America',
  EU: 'Europe',
  SA: 'South America',
  APAC: 'Asia-Pacific',
};

export const REGION_BADGES: Record<RegionCode, string> = {
  NA: '/regions/na.png',
  EU: '/regions/eu.png',
  SA: '/regions/sa.png',
  APAC: '/regions/apac.png',
};

// Leagues stored as their own `region` value in the database. They all belong to APAC.
export const SUBREGIONS: Record<string, { name: string; league: string; logo: string }> = {
  CHINA: { name: 'China', league: 'China League', logo: '/chinaLogo.png' },
  OCE: { name: 'Oceania', league: 'Oceania League', logo: '/oceLogo.png' },
  ASIA: { name: 'Asia', league: 'Asia League', logo: '/asiaLogo.png' },
  'APAC NORTH': { name: 'APAC North', league: 'APAC North', logo: '/apacLogo.png' },
};

// ---------------------------------------------------------------------
// Raw row -> Player
// ---------------------------------------------------------------------

type Row = Record<string, unknown>;

function pick(row: Row, keys: string[]): unknown {
  for (const k of keys) {
    const v = row[k];
    if (v === undefined || v === null) continue;
    const s = String(v).trim();
    // The old pages treated the literal text "NULL" as empty too.
    if (s === '' || s.toUpperCase() === 'NULL') continue;
    return v;
  }
  return null;
}

function text(row: Row, keys: string[]): string | null {
  const v = pick(row, keys);
  return v === null ? null : String(v).trim();
}

function num(row: Row, keys: string[]): number | null {
  const v = pick(row, keys);
  if (v === null) return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

/**
 * Same rule the old player page used: the database stores sensitivity as one
 * decimal, e.g. 6.7 means horizontal 6 and vertical 7. No decimal point means
 * both are the same value.
 */
export function parseSens(raw: unknown): { h: string | null; v: string | null } {
  if (raw === null || raw === undefined || String(raw).trim() === '') {
    return { h: null, v: null };
  }
  const s = String(raw);
  if (s.includes('.')) {
    const [h, v] = s.split('.');
    return { h: h || null, v: v || null };
  }
  return { h: s, v: s };
}

function normalizeRegion(
  rawRegion: string | null,
  rawSub: string | null
): { region: RegionCode | null; subregion: string | null; regionRaw: string } {
  const up = (rawRegion ?? '').trim().toUpperCase();
  const sub = (rawSub ?? '').trim().toUpperCase();
  if ((MAIN_REGIONS as string[]).includes(up)) {
    return { region: up as RegionCode, subregion: sub && SUBREGIONS[sub] ? sub : null, regionRaw: up };
  }
  if (SUBREGIONS[up]) {
    return { region: 'APAC', subregion: up, regionRaw: up };
  }
  return { region: null, subregion: null, regionRaw: up };
}

function classify(
  teamRaw: string | null,
  statusRaw: string | null
): { status: Status; team: string | null } {
  const looksRetired = (s: string) => /retired/i.test(s);
  const looksFree = (s: string) =>
    /^(free[\s-]?agents?|dropped|unsigned|none|n\/a|no team|-)$/i.test(s.trim()) ||
    /free[\s-]?agent|dropped/i.test(s);

  // A status column wins if the table has one.
  if (statusRaw) {
    if (looksRetired(statusRaw)) return { status: 'retired', team: null };
    if (looksFree(statusRaw)) return { status: 'free-agent', team: null };
  }
  // Otherwise the team text itself can be "Free Agent", "Retired" or "Dropped".
  if (teamRaw) {
    if (looksRetired(teamRaw)) return { status: 'retired', team: null };
    if (looksFree(teamRaw)) return { status: 'free-agent', team: null };
    return { status: 'active', team: teamRaw };
  }
  // No team and no marker: treat as a free agent.
  return { status: 'free-agent', team: null };
}

// Postgres-style timestamps ("2026-06-04 18:25:28.848398+00") become valid ISO.
function toIso(value: unknown): string | null {
  if (value === null || value === undefined) return null;
  let s = String(value).trim();
  if (!s) return null;
  s = s.replace(' ', 'T').replace(/([+-]\d{2})$/, '$1:00');
  const d = new Date(s);
  return Number.isNaN(d.getTime()) ? null : d.toISOString();
}

export function normalizePlayer(row: Row): Player {
  const sens = parseSens(pick(row, ['Sensitivity', 'sensitivity']));
  const { region, subregion, regionRaw } = normalizeRegion(
    text(row, ['region', 'Region']),
    text(row, ['subregion', 'Subregion'])
  );
  const { status, team } = classify(
    text(row, ['team', 'Team']),
    text(row, ['status', 'Status'])
  );
  const sourceText = (text(row, ['Source', 'source']) ?? '').toLowerCase();

  return {
    id: Number(row.id),
    name: String(row.name ?? '').trim(),
    team,
    status,
    region,
    subregion,
    regionRaw,
    sensH: sens.h,
    sensV: sens.v,
    ads1x: num(row, ['ADS (1x)', 'ADS1x', 'ads_1x']),
    ads25x: num(row, ['ADS (2.5)', 'ADS (2.5x)', 'ADS2.5x', 'ads_25x']),
    dpi: num(row, ['DPI', 'dpi']),
    multiplier: text(row, ['Mouse Multiplier', 'multiplier']),
    aspectRatio: text(row, ['Aspect Ratio', 'aspect_ratio']),
    fov: num(row, ['FOV', 'fov']),
    monitor: text(row, ['monitor', 'Monitor']),
    mouse: text(row, ['mouse', 'Mouse']),
    mousepad: text(row, ['mousepad', 'Mousepad']),
    keyboard: text(row, ['keyboard', 'Keyboard']),
    switches: text(row, ['switches', 'Switches']),
    headset: text(row, ['headset', 'Headset']),
    inEars: text(row, ['inears', 'InEars', 'Inears']),
    source: sourceText === 'player direct' ? 'player' : 'collected',
    updatedAt: toIso(pick(row, ['updated_at', 'created_at'])),
  };
}

// ---------------------------------------------------------------------
// Display helpers
// ---------------------------------------------------------------------

/** "5 / 5", or null when the sensitivity is missing. */
export function sensLabel(p: Pick<Player, 'sensH' | 'sensV'>): string | null {
  return p.sensH !== null && p.sensV !== null ? `${p.sensH} / ${p.sensV}` : null;
}

/** What to show in a region column: OCE for an Oceania player, EU for a European one. */
export function regionLabel(p: Pick<Player, 'region' | 'subregion' | 'regionRaw'>): string {
  return p.subregion ?? p.region ?? p.regionRaw;
}

/** URL segment for the player's region page (the league if there is one). */
export function regionSegment(p: Pick<Player, 'region' | 'subregion' | 'regionRaw'>): string {
  return p.subregion ?? p.region ?? p.regionRaw;
}

export function teamHref(p: Pick<Player, 'region' | 'subregion' | 'regionRaw' | 'team'>): string | null {
  if (!p.team) return null;
  return `/regions/${encodeURIComponent(regionSegment(p))}/${encodeURIComponent(p.team)}`;
}

/** "Chiefs", or "Free agent" / "Retired" for players without a team. */
export function teamLabel(p: Pick<Player, 'team' | 'status'>): string {
  if (p.team) return p.team;
  return p.status === 'retired' ? 'Retired' : 'Free agent';
}

export function dpiBucket(dpi: number | null): '400' | '800' | '1600' | 'other' | null {
  if (dpi === null) return null;
  if (dpi === 400 || dpi === 800 || dpi === 1600) return String(dpi) as '400' | '800' | '1600';
  return 'other';
}

const SHORT = new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', timeZone: 'UTC' });
const LONG = new Intl.DateTimeFormat('en-US', {
  month: 'long',
  day: 'numeric',
  year: 'numeric',
  timeZone: 'UTC',
});

export function shortDate(iso: string | null): string | null {
  return iso ? SHORT.format(new Date(iso)) : null;
}

export function longDate(iso: string | null): string | null {
  return iso ? LONG.format(new Date(iso)) : null;
}

/** "Today", "Yesterday", or a short date like "Oct 16". */
export function relativeDay(iso: string | null, now: Date = new Date()): string | null {
  if (!iso) return null;
  const day = (d: Date) => Math.floor(d.getTime() / 86_400_000);
  const diff = day(now) - day(new Date(iso));
  if (diff <= 0) return 'Today';
  if (diff === 1) return 'Yesterday';
  return shortDate(iso);
}

const WORDS = ['none', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine'];
export function numberWord(n: number): string {
  return n >= 0 && n < WORDS.length ? WORDS[n] : String(n);
}
export function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

/** The text "Copy settings" puts on the clipboard. Missing values are left out. */
export function copySettingsText(p: Player): string {
  const parts: string[] = [p.name];
  if (p.sensH !== null && p.sensV !== null) parts.push(`Sens ${p.sensH}/${p.sensV}`);
  if (p.ads1x !== null) parts.push(`ADS 1x ${p.ads1x}`);
  if (p.ads25x !== null) parts.push(`ADS 2.5x ${p.ads25x}`);
  if (p.dpi !== null) parts.push(`DPI ${p.dpi}`);
  if (p.multiplier) parts.push(`Multiplier ${p.multiplier}`);
  if (p.fov !== null) parts.push(`FOV ${p.fov}`);
  if (p.aspectRatio) parts.push(p.aspectRatio);
  return parts.join(' · ');
}

// ---------------------------------------------------------------------
// Grouping (region and team pages)
// ---------------------------------------------------------------------

export type TeamGroup = { team: string; players: Player[] };

/** Active players grouped by team: most players first, then name. */
export function groupTeams(players: Player[]): TeamGroup[] {
  const map = new Map<string, Player[]>();
  for (const p of players) {
    if (p.status !== 'active' || !p.team) continue;
    const list = map.get(p.team);
    if (list) list.push(p);
    else map.set(p.team, [p]);
  }
  return Array.from(map, ([team, list]) => ({
    team,
    players: [...list].sort((a, b) => a.name.localeCompare(b.name)),
  })).sort((a, b) => b.players.length - a.players.length || a.team.localeCompare(b.team));
}

export type RegionKind = 'region' | 'subregion' | 'other';

/** Players for a /regions/<param> URL segment. */
export function playersForRegion(
  players: Player[],
  param: string
): { code: string; kind: RegionKind; players: Player[] } {
  const code = decodeURIComponent(param).toUpperCase();
  if ((MAIN_REGIONS as string[]).includes(code)) {
    return { code, kind: 'region', players: players.filter((p) => p.region === code) };
  }
  if (SUBREGIONS[code]) {
    return { code, kind: 'subregion', players: players.filter((p) => p.subregion === code) };
  }
  return { code, kind: 'other', players: players.filter((p) => p.regionRaw === code) };
}

/** The pseudo-teams used by the "Without a team" rows. */
export function groupSlug(team: string): 'free-agent' | 'retired' | null {
  const k = team.toLowerCase().replace(/[^a-z]/g, '');
  if (k === 'retired') return 'retired';
  if (k === 'freeagent' || k === 'freeagents' || k === 'dropped') return 'free-agent';
  return null;
}
