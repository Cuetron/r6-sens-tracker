import Image from "next/image";
import Link from "next/link";
import Icon from "@/app/components/Icons";
import { teamInitials, teamLogo } from "@/lib/teams";

/** "Sent by the player": the only place neon green is used. */
export function SentMark({
  iconOnly = false,
  className = "",
}: {
  iconOnly?: boolean;
  className?: string;
}) {
  if (iconOnly) {
    return (
      <span
        role="img"
        aria-label="Sent by the player"
        title="Sent by the player"
        className={`inline-flex text-signal ${className}`}
      >
        <Icon name="badge-check" size={16} />
      </span>
    );
  }
  return (
    <span
      className={`inline-flex items-center gap-1.5 text-[13px] font-medium text-signal ${className}`}
    >
      <Icon name="badge-check" size={16} />
      Sent by the player
    </span>
  );
}

export type RegionColor = "NA" | "EU" | "SA" | "APAC";

const REGION_BAR: Record<RegionColor, string> = {
  NA: "bg-na",
  EU: "bg-eu",
  SA: "bg-sa",
  APAC: "bg-apac",
};

/** 4px coloured bar before the region code. */
export function RegionMark({
  region,
  label,
  className = "",
}: {
  region: RegionColor | null;
  label: string;
  className?: string;
}) {
  return (
    <span className={`inline-flex items-center gap-2 text-[13px] font-semibold ${className}`}>
      <span
        aria-hidden="true"
        className={`h-3.5 w-1 ${region ? REGION_BAR[region] : "bg-line"}`}
      />
      {label}
    </span>
  );
}

/**
 * Square team logo. A team without a logo shows its region badge inside a 1px
 * outlined square (so it never reads as the team's own logo), or its initials
 * when there is no badge either.
 */
export function TeamLogo({
  team,
  kind = "team",
  size = 56,
  priority = false,
  badge = null,
}: {
  team: string | null;
  /** 'team' = a real team, 'free-agent' and 'retired' use an icon. */
  kind?: "team" | "free-agent" | "retired";
  size?: number;
  priority?: boolean;
  /** Region or league badge to show when the team has no logo. */
  badge?: string | null;
}) {
  const src = kind === "team" ? teamLogo(team) : null;
  if (src) {
    return (
      <Image
        src={src}
        alt=""
        width={size}
        height={size}
        priority={priority}
        sizes={`${size}px`}
        style={{ width: size, height: size }}
        className="shrink-0 object-contain"
      />
    );
  }
  return (
    <span
      aria-hidden="true"
      style={{ width: size, height: size }}
      className="inline-flex shrink-0 items-center justify-center border border-line text-muted"
    >
      {kind === "free-agent" ? (
        <Icon name="user" size={Math.round(size * 0.4)} />
      ) : kind === "retired" ? (
        <Icon name="flag" size={Math.round(size * 0.4)} />
      ) : badge ? (
        <Image
          src={badge}
          alt=""
          width={Math.round(size * 0.6)}
          height={Math.round(size * 0.6)}
          priority={priority}
          sizes={`${Math.round(size * 0.6)}px`}
          style={{ width: Math.round(size * 0.6), height: Math.round(size * 0.6) }}
          className="object-contain"
        />
      ) : (
        <span className="num" style={{ fontSize: size * 0.34 }}>
          {teamInitials(team)}
        </span>
      )}
    </span>
  );
}

export function Breadcrumb({
  items,
}: {
  items: { label: string; href?: string }[];
}) {
  return (
    <nav aria-label="Breadcrumb" className="text-sm text-muted">
      <ol className="flex flex-wrap items-center gap-x-2 gap-y-1">
        {items.map((item, i) => {
          const last = i === items.length - 1;
          return (
            <li key={`${item.label}-${i}`} className="flex items-center gap-2">
              {item.href && !last ? (
                <Link
                  href={item.href}
                  className="transition-colors duration-[120ms] hover:text-ink"
                >
                  {item.label}
                </Link>
              ) : (
                <span aria-current={last ? "page" : undefined} className={last ? "text-ink" : ""}>
                  {item.label}
                </span>
              )}
              {!last && (
                <span aria-hidden="true" className="text-line">
                  /
                </span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

/** A short dash for a missing number. */
export function Dash({ label = "Not on file" }: { label?: string }) {
  return <span className="dash" role="img" aria-label={label} />;
}

/** Text value that falls back to "Not shared yet" in muted. */
export function GearValue({ value }: { value: string | null }) {
  return value ? <>{value}</> : <span className="text-muted">Not shared yet</span>;
}
