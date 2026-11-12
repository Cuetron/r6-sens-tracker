// Team logo lookup. Logos live in /public/teams/<slug>.png.
// Teams without a logo fall back to a square with their initials.

const LOGO_SLUGS: Record<string, string> = {
  chiefs: "chiefs",
  teamsecret: "secret",
  secret: "secret",
  rebelgaming: "rebel",
  rebel: "rebel",
  geekayesports: "geekay",
  geekay: "geekay",
  m80: "m80",
  twistedminds: "twisted",
  twisted: "twisted",
  virtuspro: "vp",
  vp: "vp",
  teamfalcons: "falcons",
  falcons: "falcons",
  g2esports: "g2",
  g2: "g2",
  teamheretics: "heretics",
  heretics: "heretics",
  shifters: "shifters",
  fnatic: "fnatic",

  // NA
  "100thieves": "100t",
  cloud9: "c9",
  darkzero: "dz",
  darkzeroesports: "dz",
  fivefears: "fivefears",
  outlast: "outlast",
  shopifyrebellion: "sr",
  spacestationgaming: "ssg",
  spacestation: "ssg",
  wildcard: "wildcard",
  wildcardgaming: "wildcard",

  // SA
  blackdragons: "blackdragons",
  fazeclan: "faze",
  faze: "faze",
  fluxow7m: "w7m",
  w7m: "w7m",
  furia: "furia",
  furiaesports: "furia",
  intz: "intz",
  los: "los",
  loud: "loud",
  teamliquid: "liquid",
  liquid: "liquid",

  // OCE
  "6targets": "6targets",
  barbieboys: "barbieboys",
  enterpriseesports: "enterprise",
  enterprise: "enterprise",
  rivalesports: "rival",

  // China
  allgamers: "allgamers",
  edwardgaming: "edg",
  edg: "edg",
  onecoin: "onecoin",

  // Asia
  daystar: "daystar",
  sharperesports: "sharper",
  sharper: "sharper",

  // APAC North
  bnkfearx: "fearx",
  fearx: "fearx",
  bemyenemy: "bemyenemy",
  canyoubemyenemy: "bemyenemy",
  kinotrope: "kinotrope",
  kinotropegaming: "kinotrope",
  rrx: "rrx",
};

function key(team: string) {
  return team.toLowerCase().replace(/[^a-z0-9]/g, "");
}

/** Path of the team's logo, or null when we do not have one yet. */
export function teamLogo(team: string | null | undefined): string | null {
  if (!team) return null;
  const slug = LOGO_SLUGS[key(team)];
  return slug ? `/teams/${slug}.png` : null;
}

/** Up to two letters for the fallback square. */
export function teamInitials(team: string | null | undefined): string {
  if (!team) return "?";
  const words = team.replace(/[^A-Za-z0-9 ]/g, "").split(/\s+/).filter(Boolean);
  if (words.length === 0) return "?";
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase();
  return (words[0][0] + words[1][0]).toUpperCase();
}
