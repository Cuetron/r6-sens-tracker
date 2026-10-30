"use client";

import { useRef } from 'react';
import Icon from '@/app/components/Icons';
import type { RegionCode } from '@/lib/player-model';

// Controlled filter inputs. The parent (Directory) owns the state and does the
// filtering in the browser, so typing never causes a request to the server.

export type FilterKey = 'q' | 'region' | 'team' | 'dpi' | 'verified';
export type TabCounts = { all: number } & Record<RegionCode, number>;

const TABS: { value: '' | RegionCode; label: string; count: (c: TabCounts) => number }[] = [
  { value: '', label: 'All', count: (c) => c.all },
  { value: 'NA', label: 'NA', count: (c) => c.NA },
  { value: 'EU', label: 'EU', count: (c) => c.EU },
  { value: 'SA', label: 'SA', count: (c) => c.SA },
  { value: 'APAC', label: 'APAC', count: (c) => c.APAC },
];

const controlClass =
  'h-12 w-full border border-line bg-panel text-[14px] text-ink transition-colors duration-[120ms] hover:border-muted focus:border-accent focus:outline-none';

type Props = {
  teams: string[];
  /** What is typed in the search box right now (applied to the list after 150ms). */
  qInput: string;
  region: '' | RegionCode;
  team: string;
  dpi: string;
  verified: boolean;
  counts: TabCounts;
  onChange: (key: FilterKey, value: string) => void;
};

function Select({
  id,
  label,
  value,
  onChange,
  children,
  className = '',
}: {
  id: string;
  label: string;
  value: string;
  onChange: (v: string) => void;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`relative ${className}`}>
      <label htmlFor={id} className="sr-only">
        {label}
      </label>
      <select
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`${controlClass} cursor-pointer appearance-none px-4 pr-10`}
      >
        {children}
      </select>
      <Icon
        name="chevron-down"
        size={16}
        className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-muted"
      />
    </div>
  );
}

function VerifiedCheckbox({
  id,
  checked,
  onChange,
  className = '',
}: {
  id: string;
  checked: boolean;
  onChange: (v: boolean) => void;
  className?: string;
}) {
  return (
    <label
      htmlFor={id}
      className={`flex h-12 cursor-pointer items-center gap-3 border border-line px-4 text-[14px] transition-colors duration-[120ms] hover:border-muted ${className}`}
    >
      <span className="relative inline-flex h-4 w-4 shrink-0">
        <input
          id={id}
          type="checkbox"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          className="peer h-4 w-4 cursor-pointer appearance-none border border-muted bg-transparent checked:border-accent checked:bg-accent"
        />
        <Icon
          name="check"
          size={12}
          strokeWidth={3}
          className="pointer-events-none absolute left-0.5 top-0.5 hidden text-on-accent peer-checked:block"
        />
      </span>
      Sent by the player only
    </label>
  );
}

function TeamDpiFields({
  prefix,
  teams,
  team,
  dpi,
  onChange,
  teamClass,
  dpiClass,
}: Pick<Props, 'teams' | 'team' | 'dpi' | 'onChange'> & {
  prefix: string;
  teamClass?: string;
  dpiClass?: string;
}) {
  return (
    <>
      <Select
        id={`${prefix}-team`}
        label="Team"
        value={team}
        onChange={(v) => onChange('team', v)}
        className={teamClass}
      >
        <option value="">All teams</option>
        {teams.map((t) => (
          <option key={t} value={t}>
            {t}
          </option>
        ))}
      </Select>
      <Select
        id={`${prefix}-dpi`}
        label="DPI"
        value={dpi}
        onChange={(v) => onChange('dpi', v)}
        className={dpiClass}
      >
        <option value="">Any DPI</option>
        <option value="400">400</option>
        <option value="800">800</option>
        <option value="1600">1600</option>
        <option value="other">Other</option>
      </Select>
    </>
  );
}

export default function PlayerFilters({
  teams,
  qInput,
  region,
  team,
  dpi,
  verified,
  counts,
  onChange,
}: Props) {
  const sheetRef = useRef<HTMLDialogElement>(null);
  const activeSheetFilters = (team ? 1 : 0) + (dpi ? 1 : 0) + (verified ? 1 : 0);

  const search = (
    <div className="relative min-w-0 flex-1">
      <label htmlFor="player-search" className="sr-only">
        Search a player, team or mouse
      </label>
      <Icon
        name="search"
        size={18}
        className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-muted"
      />
      <input
        id="player-search"
        type="text"
        autoComplete="off"
        value={qInput}
        onChange={(e) => onChange('q', e.target.value)}
        placeholder="Search a player, team or mouse"
        className={`${controlClass} pl-11 pr-4 placeholder:text-muted`}
      />
    </div>
  );

  return (
    <div>
      {/* Region tabs */}
      <div
        role="group"
        aria-label="Region"
        className="-mx-5 flex overflow-x-auto border-b border-line px-5 md:mx-0 md:px-0"
      >
        {TABS.map((tab) => {
          const active = region === tab.value;
          return (
            <button
              key={tab.label}
              type="button"
              aria-pressed={active}
              onClick={() => onChange('region', tab.value)}
              className={`-mb-px flex shrink-0 items-baseline gap-2 border-b-2 px-4 py-3 text-[15px] transition-colors duration-[120ms] first:pl-0 md:px-5 md:first:pl-0 ${
                active
                  ? 'border-accent font-semibold text-ink'
                  : 'border-transparent text-muted hover:text-ink'
              }`}
            >
              {tab.label}
              <span className="text-[13px] font-normal text-muted">{tab.count(counts)}</span>
            </button>
          );
        })}
      </div>

      {/* One row. Desktop and tablet: search, team, DPI and the checkbox.
          Phone: search plus a filter button that opens a bottom sheet. */}
      <div className="mt-5 flex items-center gap-3 md:mt-6">
        {search}
        <div className="hidden shrink-0 items-center gap-3 md:flex">
          <TeamDpiFields
            prefix="desk"
            teams={teams}
            team={team}
            dpi={dpi}
            onChange={onChange}
            teamClass="w-[200px]"
            dpiClass="w-[150px]"
          />
          <VerifiedCheckbox
            id="desk-verified"
            checked={verified}
            onChange={(v) => onChange('verified', v ? '1' : '')}
            className="shrink-0"
          />
        </div>
        <button
          type="button"
          aria-label={
            activeSheetFilters ? `Filters, ${activeSheetFilters} active` : 'Filters'
          }
          aria-haspopup="dialog"
          onClick={() => sheetRef.current?.showModal()}
          className="relative flex h-12 w-12 shrink-0 items-center justify-center border border-line bg-panel md:hidden"
        >
          <Icon name="sliders-horizontal" size={20} />
          {activeSheetFilters > 0 && (
            <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center bg-accent px-1 text-[11px] font-semibold text-on-accent">
              {activeSheetFilters}
            </span>
          )}
        </button>
      </div>

      <dialog
        ref={sheetRef}
        aria-label="Filters"
        onClick={(e) => {
          if (e.target === sheetRef.current) sheetRef.current?.close();
        }}
        className="m-0 mt-auto hidden max-h-[85vh] w-full max-w-none overflow-y-auto border-t border-line bg-ground p-0 open:block md:hidden"
      >
        <div className="flex items-center justify-between border-b border-line px-5 py-3">
          <h2 className="display text-[32px]">Filters</h2>
          <button
            type="button"
            aria-label="Close filters"
            onClick={() => sheetRef.current?.close()}
            className="-mr-2 flex h-11 w-11 items-center justify-center"
          >
            <Icon name="x" size={22} />
          </button>
        </div>
        <div className="flex flex-col gap-3 px-5 py-5">
          <TeamDpiFields
            prefix="sheet"
            teams={teams}
            team={team}
            dpi={dpi}
            onChange={onChange}
          />
          <VerifiedCheckbox
            id="sheet-verified"
            checked={verified}
            onChange={(v) => onChange('verified', v ? '1' : '')}
          />
          <button
            type="button"
            className="btn btn-primary mt-3 w-full"
            onClick={() => sheetRef.current?.close()}
          >
            Show results
          </button>
        </div>
      </dialog>
    </div>
  );
}
