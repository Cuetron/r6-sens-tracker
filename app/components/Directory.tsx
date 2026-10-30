"use client";

import { Suspense, useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import Icon from '@/app/components/Icons';
import PlayerFilters, { type FilterKey, type TabCounts } from '@/app/components/PlayerFilters';
import { RegionMark, SentMark, Dash } from '@/app/components/ui';
import {
  MAIN_REGIONS,
  SUBREGIONS,
  dpiBucket,
  regionLabel,
  sensLabel,
  shortDate,
  teamLabel,
  type Player,
  type RegionCode,
} from '@/lib/player-model';

// Only the fields the table needs are sent to the browser.
export type DirectoryPlayer = Pick<
  Player,
  | 'id'
  | 'name'
  | 'team'
  | 'status'
  | 'region'
  | 'subregion'
  | 'regionRaw'
  | 'dpi'
  | 'sensH'
  | 'sensV'
  | 'ads1x'
  | 'ads25x'
  | 'fov'
  | 'aspectRatio'
  | 'mouse'
  | 'updatedAt'
  | 'source'
>;

type SortKey = 'name' | 'region' | 'dpi' | 'sens' | 'ads1x' | 'ads25x' | 'fov' | 'ratio' | 'mouse' | 'updated';
type Dir = 'asc' | 'desc';

type Filters = {
  q: string;
  region: '' | RegionCode;
  team: string;
  dpi: string;
  verified: boolean;
  sort: SortKey;
  dir: Dir;
};

const DEFAULT_FILTERS: Filters = {
  q: '',
  region: '',
  team: '',
  dpi: '',
  verified: false,
  sort: 'updated',
  dir: 'desc',
};

const FIRST_PAGE = 12; // rows in the first page (and in the server-rendered HTML)
const PHONE_FIRST_PAGE = 6; // cards shown on a phone before "Show more"
const PAGE_STEP = 50;

const SORT_KEYS: SortKey[] = ['name', 'region', 'dpi', 'sens', 'ads1x', 'ads25x', 'fov', 'ratio', 'mouse', 'updated'];

// ---------------------------------------------------------------------
// URL <-> filters. A filtered view can be shared as a link.
// Old links such as /?team=Foo&region=EU keep working.
// ---------------------------------------------------------------------
function parseRegion(raw: string | null): '' | RegionCode {
  const up = (raw ?? '').trim().toUpperCase();
  if ((MAIN_REGIONS as string[]).includes(up)) return up as RegionCode;
  if (SUBREGIONS[up]) return 'APAC';
  return '';
}

function filtersFromParams(params: URLSearchParams): Filters {
  const rawSort = params.get('sort') ?? '';
  const sort: SortKey | null = (SORT_KEYS as string[]).includes(rawSort) ? (rawSort as SortKey) : null;
  const rawDpi = params.get('dpi') ?? '';
  return {
    q: params.get('q') ?? '',
    region: parseRegion(params.get('region')),
    team: params.get('team') ?? '',
    dpi: ['400', '800', '1600', 'other'].includes(rawDpi) ? rawDpi : '',
    verified: params.get('verified') === '1',
    sort: sort ?? DEFAULT_FILTERS.sort,
    dir: sort ? (params.get('dir') === 'asc' ? 'asc' : 'desc') : DEFAULT_FILTERS.dir,
  };
}

function urlFor(f: Filters): string {
  const params = new URLSearchParams();
  if (f.q) params.set('q', f.q);
  if (f.region) params.set('region', f.region);
  if (f.team) params.set('team', f.team);
  if (f.dpi) params.set('dpi', f.dpi);
  if (f.verified) params.set('verified', '1');
  if (f.sort !== DEFAULT_FILTERS.sort || f.dir !== DEFAULT_FILTERS.dir) {
    params.set('sort', f.sort);
    params.set('dir', f.dir);
  }
  const qs = params.toString();
  return qs ? `/?${qs}` : '/';
}

// ---------------------------------------------------------------------
// Filtering and sorting
// ---------------------------------------------------------------------
function ratioValue(r: string | null): number | null {
  if (!r) return null;
  const [w, h] = r.split(':').map(Number);
  return w && h ? w / h : null;
}

function sortValue(p: DirectoryPlayer, key: SortKey): string | number | null {
  switch (key) {
    case 'name':
      return p.name.toLowerCase();
    case 'region':
      return regionLabel(p);
    case 'dpi':
      return p.dpi;
    case 'sens': {
      const n = p.sensH === null ? NaN : parseFloat(p.sensH);
      return Number.isFinite(n) ? n : null;
    }
    case 'ads1x':
      return p.ads1x;
    case 'ads25x':
      return p.ads25x;
    case 'fov':
      return p.fov;
    case 'ratio':
      return ratioValue(p.aspectRatio);
    case 'mouse':
      return p.mouse ? p.mouse.toLowerCase() : null;
    case 'updated':
      return p.updatedAt ? Date.parse(p.updatedAt) : null;
  }
}

function applyFilters(players: DirectoryPlayer[], f: Filters): DirectoryPlayer[] {
  const needle = f.q.trim().toLowerCase();
  const list = players.filter((p) => {
    if (f.region && p.region !== f.region) return false;
    if (f.team && p.team !== f.team) return false;
    if (f.dpi && dpiBucket(p.dpi) !== f.dpi) return false;
    if (f.verified && p.source !== 'player') return false;
    if (needle) {
      const hay = `${p.name} ${p.team ?? ''} ${p.mouse ?? ''}`.toLowerCase();
      if (!hay.includes(needle)) return false;
    }
    return true;
  });

  const sign = f.dir === 'asc' ? 1 : -1;
  return list.sort((a, b) => {
    const av = sortValue(a, f.sort);
    const bv = sortValue(b, f.sort);
    // Missing values always go last, whichever way we sort.
    if (av === null && bv === null) return a.name.localeCompare(b.name);
    if (av === null) return 1;
    if (bv === null) return -1;
    const cmp =
      typeof av === 'number' && typeof bv === 'number'
        ? av - bv
        : String(av).localeCompare(String(bv));
    return cmp !== 0 ? cmp * sign : a.name.localeCompare(b.name);
  });
}

// ---------------------------------------------------------------------
// Presentation
// ---------------------------------------------------------------------
type Column = {
  key: SortKey;
  label: string;
  /** Extra classes (used to hide columns on tablet). */
  className?: string;
};

const COLUMNS: Column[] = [
  { key: 'name', label: 'Player' },
  { key: 'region', label: 'Region' },
  { key: 'dpi', label: 'DPI' },
  { key: 'sens', label: 'Sens H / V' },
  { key: 'ads1x', label: 'ADS 1x' },
  { key: 'ads25x', label: 'ADS 2.5x' },
  { key: 'fov', label: 'FOV' },
  { key: 'ratio', label: 'Ratio', className: 'hidden desk:table-cell' },
  { key: 'mouse', label: 'Mouse', className: 'hidden desk:table-cell' },
  { key: 'updated', label: 'Updated' },
];

function Num({ value }: { value: number | string | null }) {
  return value === null || value === '' ? <Dash label="Not on file" /> : <>{value}</>;
}

function DirectoryView({
  players,
  filters,
  qInput,
  limit,
  animate,
  onChange,
  onSort,
  onMore,
  onClear,
}: {
  players: DirectoryPlayer[];
  filters: Filters;
  qInput: string;
  limit: number;
  animate: boolean;
  onChange: (key: FilterKey, value: string) => void;
  onSort: (key: SortKey) => void;
  onMore: () => void;
  onClear: () => void;
}) {
  // Dropdown options and tab counts come from ALL players.
  const teams = useMemo(
    () =>
      Array.from(new Set(players.map((p) => p.team).filter(Boolean) as string[])).sort((a, b) =>
        a.localeCompare(b)
      ),
    [players]
  );
  const counts = useMemo<TabCounts>(() => {
    const c: TabCounts = { all: players.length, NA: 0, EU: 0, SA: 0, APAC: 0 };
    for (const p of players) if (p.region) c[p.region] += 1;
    return c;
  }, [players]);

  const visible = useMemo(() => applyFilters(players, filters), [players, filters]);
  const shown = visible.slice(0, limit);
  const total = visible.length;
  const hasMore = shown.length < total;
  const phoneCollapsed = limit === FIRST_PAGE;
  const phoneShown = phoneCollapsed ? Math.min(PHONE_FIRST_PAGE, total) : shown.length;

  const hasFilters = !!(filters.q || filters.region || filters.team || filters.dpi || filters.verified);

  // Rows fade in when the filters change (not on first load).
  const rowClass = animate ? 'row-in' : '';
  const rowStyle = (i: number) => ({ ['--i' as string]: Math.min(i, 12) }) as React.CSSProperties;

  return (
    <section aria-labelledby="database-heading" className="page mt-16 md:mt-20">
      <h2 id="database-heading" className="sr-only">
        Player database
      </h2>

      <PlayerFilters
        teams={teams}
        qInput={qInput}
        region={filters.region}
        team={filters.team}
        dpi={filters.dpi}
        verified={filters.verified}
        counts={counts}
        onChange={onChange}
      />

      {total === 0 ? (
        <div className="mt-10 border border-line px-6 py-16 text-center">
          <p className="display text-[40px]">No players match these filters</p>
          <button type="button" className="btn btn-secondary mt-6" onClick={onClear}>
            Clear filters
          </button>
        </div>
      ) : (
        <>
          {/* Desktop and tablet: a real table */}
          <div className="mt-8 hidden md:block">
            <table className="w-full table-fixed border-collapse text-left">
              <thead>
                <tr>
                  {COLUMNS.map((col) => {
                    const active = filters.sort === col.key;
                    return (
                      <th
                        key={col.key}
                        scope="col"
                        aria-sort={active ? (filters.dir === 'asc' ? 'ascending' : 'descending') : 'none'}
                        className={`px-2 pb-3 text-[13px] font-normal first:pl-4 ${
                          col.key === 'name' ? 'w-[22%]' : ''
                        } ${col.className ?? ''}`}
                      >
                        <button
                          type="button"
                          onClick={() => onSort(col.key)}
                          className={`inline-flex items-center gap-1 transition-colors duration-[120ms] hover:text-ink ${
                            active ? 'font-semibold text-ink' : 'text-muted'
                          }`}
                        >
                          {col.label}
                          {active && (
                            <Icon
                              name="arrow-down"
                              size={13}
                              className={filters.dir === 'asc' ? 'rotate-180' : ''}
                            />
                          )}
                        </button>
                      </th>
                    );
                  })}
                  <th scope="col" className="w-10 pb-3">
                    <span className="sr-only">Open player</span>
                  </th>
                </tr>
              </thead>
              <tbody key={animate ? JSON.stringify(filters) : 'static'}>
                {shown.map((p, i) => (
                  <tr
                    key={p.id}
                    style={rowStyle(i)}
                    className={`${rowClass} relative h-[76px] transition-colors duration-[120ms] odd:bg-panel hover:bg-line focus-within:outline focus-within:outline-2 focus-within:-outline-offset-2 focus-within:outline-accent`}
                  >
                    <td className="px-2 pl-4">
                      <div className="flex items-center gap-2">
                        <Link
                          href={`/player/${p.id}`}
                          // Prefetching is off on purpose: with ~200 links on this page, the default
                          // prefetch-on-scroll fired a request for every visible row on every visit.
                          prefetch={false}
                          className="display truncate text-[30px] leading-none after:absolute after:inset-0 after:content-[''] focus-visible:outline-none"
                        >
                          {p.name}
                        </Link>
                        {p.source === 'player' && <SentMark iconOnly />}
                      </div>
                      <div className="mt-1 truncate text-[13px] text-muted">{teamLabel(p)}</div>
                    </td>
                    <td className="px-2">
                      <RegionMark region={p.region} label={regionLabel(p)} />
                    </td>
                    <td className="num px-2 text-[28px]">
                      <Num value={p.dpi} />
                    </td>
                    <td className="num px-2 text-[28px]">
                      <Num value={sensLabel(p)} />
                    </td>
                    <td className="num px-2 text-[28px]">
                      <Num value={p.ads1x} />
                    </td>
                    <td className="num px-2 text-[28px]">
                      <Num value={p.ads25x} />
                    </td>
                    <td className="num px-2 text-[28px]">
                      <Num value={p.fov} />
                    </td>
                    <td className="num hidden px-2 text-[28px] desk:table-cell">
                      <Num value={p.aspectRatio} />
                    </td>
                    <td className="hidden truncate px-2 text-[13px] desk:table-cell">
                      {p.mouse ?? <span className="text-muted">Not shared yet</span>}
                    </td>
                    <td className="px-2 text-[13px] text-muted">
                      {shortDate(p.updatedAt) ?? <Dash label="Not on file" />}
                    </td>
                    <td className="pr-3 text-muted">
                      <Icon name="chevron-right" size={18} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Phone: a list of cards */}
          <ul className="mt-6 md:hidden" key={animate ? JSON.stringify(filters) : 'static'}>
            {shown.map((p, i) => (
              <li
                key={p.id}
                style={rowStyle(i)}
                className={`${rowClass} relative odd:bg-panel ${
                  phoneCollapsed && i >= PHONE_FIRST_PAGE ? 'hidden' : ''
                }`}
              >
                <Link
                  href={`/player/${p.id}`}
                  prefetch={false}
                  className="block px-4 py-4 after:absolute after:inset-0 after:content-['']"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="display text-[30px] leading-none">{p.name}</span>
                      {p.source === 'player' && <SentMark iconOnly />}
                    </div>
                    <Icon name="chevron-right" size={18} className="text-muted" />
                  </div>
                  <div className="mt-2 flex items-center gap-2 text-[13px] text-muted">
                    <RegionMark region={p.region} label={regionLabel(p)} className="text-muted" />
                    <span aria-hidden="true">&middot;</span>
                    <span className="truncate">{teamLabel(p)}</span>
                  </div>
                  <dl className="mt-4 grid grid-cols-4 gap-2">
                    {[
                      ['DPI', p.dpi],
                      ['Sens', sensLabel(p)],
                      ['ADS 1x', p.ads1x],
                      ['FOV', p.fov],
                    ].map(([label, value]) => (
                      <div key={label as string}>
                        <dt className="text-[12px] text-muted">{label}</dt>
                        <dd className="num mt-1 text-[26px]">
                          <Num value={value as number | string | null} />
                        </dd>
                      </div>
                    ))}
                  </dl>
                </Link>
              </li>
            ))}
          </ul>

          <div className="mt-6 flex items-center justify-between gap-4 md:mt-8">
            <p role="status" className="text-[14px] text-muted">
              <span className="hidden md:inline">
                Showing {shown.length} of {total} players
              </span>
              <span className="md:hidden">
                {phoneShown} of {total}
              </span>
            </p>
            {(hasMore || (phoneCollapsed && total > PHONE_FIRST_PAGE)) && (
              <button type="button" className="btn btn-secondary" onClick={onMore}>
                <span className="hidden md:inline">Show {PAGE_STEP} more</span>
                <span className="md:hidden">Show more</span>
                <Icon name="chevron-down" />
              </button>
            )}
          </div>
        </>
      )}
    </section>
  );
}

// ---------------------------------------------------------------------
// State: starts from the URL, then lives in the browser. Typing filters the
// list locally and updates the address bar with history.replaceState, which
// makes NO server request.
// ---------------------------------------------------------------------
function DirectoryWithUrlFilters({ players }: { players: DirectoryPlayer[] }) {
  const searchParams = useSearchParams();
  const [filters, setFilters] = useState<Filters>(() => filtersFromParams(searchParams));
  const [qInput, setQInput] = useState(filters.q);
  const [initialKey] = useState(() => JSON.stringify(filters));
  const filtersKey = JSON.stringify(filters);

  // "Show 50 more" is remembered together with the filters it was pressed for,
  // so changing a filter starts again from the first page.
  const [more, setMore] = useState({ key: filtersKey, n: FIRST_PAGE });
  const limit = more.key === filtersKey ? more.n : FIRST_PAGE;

  // Search is debounced by 150ms.
  useEffect(() => {
    const t = setTimeout(() => {
      setFilters((f) => (f.q === qInput ? f : { ...f, q: qInput }));
    }, 150);
    return () => clearTimeout(t);
  }, [qInput]);

  // Keep the address bar in step with the filters (shareable links).
  const firstRun = useRef(true);
  useEffect(() => {
    if (firstRun.current) {
      firstRun.current = false;
      return;
    }
    window.history.replaceState(null, '', urlFor(filters));
  }, [filters]);

  // "/" focuses the search field; so does /?focus=search (phone search icon).
  useEffect(() => {
    const input = () => document.getElementById('player-search') as HTMLInputElement | null;
    if (searchParams.get('focus') === 'search') input()?.focus();

    const onKey = (e: KeyboardEvent) => {
      if (e.key !== '/' || e.metaKey || e.ctrlKey || e.altKey) return;
      const el = e.target as HTMLElement | null;
      if (el && (el.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(el.tagName))) return;
      e.preventDefault();
      input()?.focus();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [searchParams]);

  const onChange = (key: FilterKey, value: string) => {
    if (key === 'q') {
      setQInput(value);
    } else if (key === 'verified') {
      setFilters((f) => ({ ...f, verified: value === '1' }));
    } else if (key === 'region') {
      setFilters((f) => ({ ...f, region: parseRegion(value) }));
    } else {
      setFilters((f) => ({ ...f, [key]: value }));
    }
  };

  const onSort = (key: SortKey) => {
    setFilters((f) =>
      f.sort === key
        ? { ...f, dir: f.dir === 'asc' ? 'desc' : 'asc' }
        : { ...f, sort: key, dir: key === 'updated' ? 'desc' : 'asc' }
    );
  };

  const onClear = () => {
    setQInput('');
    setFilters((f) => ({ ...DEFAULT_FILTERS, sort: f.sort, dir: f.dir }));
  };

  return (
    <DirectoryView
      players={players}
      filters={filters}
      qInput={qInput}
      limit={limit}
      animate={filtersKey !== initialKey}
      onChange={onChange}
      onSort={onSort}
      onMore={() => setMore({ key: filtersKey, n: limit + PAGE_STEP })}
      onClear={onClear}
    />
  );
}

export default function Directory({ players }: { players: DirectoryPlayer[] }) {
  return (
    // useSearchParams needs a Suspense boundary so the page can still be built as static HTML.
    // The fallback is the first page of the default view, which is what gets served as HTML.
    <Suspense
      fallback={
        <DirectoryView
          players={players}
          filters={DEFAULT_FILTERS}
          qInput=""
          limit={FIRST_PAGE}
          animate={false}
          onChange={() => {}}
          onSort={() => {}}
          onMore={() => {}}
          onClear={() => {}}
        />
      }
    >
      <DirectoryWithUrlFilters players={players} />
    </Suspense>
  );
}
