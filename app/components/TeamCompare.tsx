import Link from 'next/link';
import ContactButton from '@/app/components/ContactButton';
import Icon from '@/app/components/Icons';
import { Dash, GearValue, SentMark } from '@/app/components/ui';
import { sensLabel, shortDate, type Player } from '@/lib/player-model';

// The team compare table. A label column plus one column per player.
// `slots` is always at least five long for a real team: missing players are
// empty slots ("Not on file") so every team page lines up the same way.

type Slot = Player | null;

const LABEL_COL = 160;
const PLAYER_COL = 236;

const NUMBER_ROWS: { label: string; value: (p: Player) => string | number | null }[] = [
  { label: 'DPI', value: (p) => p.dpi },
  { label: 'Sensitivity', value: (p) => sensLabel(p) },
  { label: 'ADS 1x', value: (p) => p.ads1x },
  { label: 'ADS 2.5x', value: (p) => p.ads25x },
  { label: 'Field of view', value: (p) => p.fov },
  { label: 'Aspect ratio', value: (p) => p.aspectRatio },
];

function PlayerHeader({ p, n }: { p: Player; n: number }) {
  return (
    <>
      <p className="text-[13px] text-muted">Player {n}</p>
      <p
        title={p.name}
        className="display mt-1 max-w-[220px] truncate pt-1 text-[32px] leading-[1.05]"
      >
        {p.name}
      </p>
      <div className="mt-1">
        {p.source === 'player' ? (
          <SentMark />
        ) : (
          <p className="text-[13px] text-muted">
            {shortDate(p.updatedAt) ? `Updated ${shortDate(p.updatedAt)}` : <Dash />}
          </p>
        )}
      </div>
    </>
  );
}

function EmptyHeader({ n }: { n: number }) {
  return (
    <>
      <p className="text-[13px] text-muted">Player {n}</p>
      <p aria-hidden="true" className="display mt-1 pt-1 text-[32px] leading-[1.05] text-line">
        Not on file
      </p>
      <span className="sr-only">Player {n} is not on file</span>
      <ContactButton
        requestType="new"
        className="mt-1 text-[13px] text-accent transition-colors duration-[120ms] hover:underline"
      >
        Know their settings? Send them.
      </ContactButton>
    </>
  );
}

export default function TeamCompare({ slots }: { slots: Slot[] }) {
  const missing = slots.filter((s) => s === null).length;

  return (
    <>
      {/* Tablet and desktop: one table. More than five players scroll sideways
          with the label column staying put. */}
      <div className="hidden overflow-x-auto md:block">
        <table
          className="w-full border-collapse text-left"
          style={{ minWidth: LABEL_COL + slots.length * PLAYER_COL }}
        >
          <thead>
            <tr className="border-b border-line align-top">
              <th
                scope="col"
                className="sticky left-0 z-10 bg-ground pb-5"
                style={{ width: LABEL_COL, minWidth: LABEL_COL }}
              >
                <span className="sr-only">Setting</span>
              </th>
              {slots.map((p, i) => (
                <th key={p ? p.id : `empty-${i}`} scope="col" className="pb-5 pr-4 font-normal">
                  {p ? <PlayerHeader p={p} n={i + 1} /> : <EmptyHeader n={i + 1} />}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {NUMBER_ROWS.map((row) => (
              <tr key={row.label} className="border-b border-line">
                <th
                  scope="row"
                  className="sticky left-0 z-10 bg-ground py-5 pr-4 text-[14px] font-normal text-muted"
                >
                  {row.label}
                </th>
                {slots.map((p, i) => {
                  const v = p ? row.value(p) : null;
                  return (
                    <td key={p ? p.id : `empty-${i}`} className="num py-5 pr-4 text-[52px]">
                      {v === null ? <Dash /> : v}
                    </td>
                  );
                })}
              </tr>
            ))}
            <tr className="border-b border-line">
              <th
                scope="row"
                className="sticky left-0 z-10 bg-ground py-6 pr-4 align-top text-[14px] font-normal text-muted"
              >
                Mouse
              </th>
              {slots.map((p, i) => (
                <td key={p ? p.id : `empty-${i}`} className="py-6 pr-4 align-top text-[16px] leading-snug">
                  {p ? <GearValue value={p.mouse} /> : <Dash />}
                </td>
              ))}
            </tr>
            <tr>
              <th scope="row" className="sticky left-0 z-10 bg-ground py-7 pr-4">
                <span className="sr-only">Actions</span>
              </th>
              {slots.map((p, i) => (
                <td key={p ? p.id : `empty-${i}`} className="py-7 pr-4">
                  {p ? (
                    <Link
                      href={`/player/${p.id}`}
                      prefetch={false}
                      aria-label={`Full sheet for ${p.name}`}
                      className="btn btn-secondary"
                    >
                      Full sheet
                      <Icon name="arrow-right" />
                    </Link>
                  ) : (
                    <ContactButton requestType="new" className="btn btn-secondary">
                      Send settings
                      <Icon name="arrow-up-right" />
                    </ContactButton>
                  )}
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>

      {/* Phone: one card per player. Empty slots become a single compact row. */}
      <div className="flex flex-col gap-4 md:hidden">
        {slots.map((p, i) =>
          p ? (
            <article key={p.id} aria-label={p.name} className="border border-line">
              <div className="border-b border-line p-4">
                <PlayerHeader p={p} n={i + 1} />
              </div>
              <dl className="px-4">
                {NUMBER_ROWS.map((row) => {
                  const v = row.value(p);
                  return (
                    <div
                      key={row.label}
                      className="flex items-center justify-between border-b border-line py-3"
                    >
                      <dt className="text-[13px] text-muted">{row.label}</dt>
                      <dd className="num text-[26px]">{v === null ? <Dash /> : v}</dd>
                    </div>
                  );
                })}
                <div className="flex items-start justify-between gap-4 py-3">
                  <dt className="text-[13px] text-muted">Mouse</dt>
                  <dd className="text-right text-[15px]">
                    <GearValue value={p.mouse} />
                  </dd>
                </div>
              </dl>
              <div className="px-4 pb-4">
                <Link
                  href={`/player/${p.id}`}
                  prefetch={false}
                  aria-label={`Full sheet for ${p.name}`}
                  className="btn btn-secondary w-full"
                >
                  Full sheet
                  <Icon name="arrow-right" />
                </Link>
              </div>
            </article>
          ) : null
        )}

        {missing > 0 && (
          <div className="flex items-center justify-between gap-4 border border-line p-4">
            <p className="text-[15px] text-muted">
              {missing} {missing === 1 ? 'player' : 'players'} not on file yet
            </p>
            <ContactButton requestType="new" className="btn btn-secondary shrink-0">
              Send settings
              <Icon name="arrow-up-right" />
            </ContactButton>
          </div>
        )}
      </div>
    </>
  );
}
