// Downloads missing team logos from Liquipedia into public/teams/<slug>.png.
//
//   node scripts/fetch-team-logos.mjs              fetch every logo that is not on disk yet
//   node scripts/fetch-team-logos.mjs --force      refetch all of them
//   node scripts/fetch-team-logos.mjs --only=loud,furia
//
// Logos are made to match the ones already in public/teams: the icon version,
// the dark-mode variant when Liquipedia has one (the site is dark), transparent
// background, trimmed to the artwork and at most 1000px on the long side.
//
// Liquipedia's API terms ask for a descriptive User-Agent and at most one
// request every 2 seconds, so a full run takes a couple of minutes.
// Set LP_CONTACT to an email or URL to include it in the User-Agent.
//
// Uses sharp, which is already installed as part of Next.js.

import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const OUT_DIR = join(ROOT, "public", "teams");
const API = "https://liquipedia.net/rainbowsix/api.php";
const UA = `R6Sens team logo fetcher (https://www.r6sens.com${
  process.env.LP_CONTACT ? `; ${process.env.LP_CONTACT}` : ""
})`;
const MAX_SIDE = 1000;

// slug = file name in public/teams, titles = likely Liquipedia page titles.
// file = force a specific Liquipedia file when the automatic pick is wrong.
const TEAMS = [
  // NA
  { slug: "100t", name: "100 Thieves", titles: ["100 Thieves"] },
  { slug: "c9", name: "Cloud9", titles: ["Cloud9"] },
  { slug: "dz", name: "DarkZero", titles: ["DarkZero Esports", "DarkZero"] },
  { slug: "fivefears", name: "Five Fears", titles: ["Five Fears"] },
  { slug: "outlast", name: "Outlast", titles: ["Outlast"] },
  { slug: "sr", name: "Shopify Rebellion", titles: ["Shopify Rebellion"] },
  { slug: "ssg", name: "Spacestation Gaming", titles: ["Spacestation Gaming", "Spacestation"] },
  { slug: "wildcard", name: "Wildcard", titles: ["Wildcard Gaming", "Wildcard"] },
  { slug: "1of30", name: "1 of 30", titles: ["1 of 30", "1of30", "One of Thirty"] },
  // SA
  { slug: "blackdragons", name: "Black Dragons", titles: ["Black Dragons", "Black Dragons e-Sports"] },
  { slug: "faze", name: "FaZe Clan", titles: ["FaZe Clan"] },
  { slug: "w7m", name: "FLUXO W7M", titles: ["FLUXO W7M", "Fluxo W7M", "W7M Esports", "W7M"] },
  { slug: "furia", name: "FURIA", titles: ["FURIA Esports", "FURIA"] },
  { slug: "imperium", name: "Imperium of Man", titles: ["Imperium of Man", "Imperium of Men"] },
  { slug: "intz", name: "INTZ", titles: ["INTZ", "INTZ e-Sports"] },
  { slug: "los", name: "LOS", titles: ["LOS", "Los Grandes"] },
  { slug: "loud", name: "LOUD", titles: ["LOUD"] },
  { slug: "lucky5", name: "Lucky 5", titles: ["Lucky 5", "Lucky5"] },
  { slug: "liquid", name: "Team Liquid", titles: ["Team Liquid"] },
  // OCE
  { slug: "6targets", name: "6Targets", titles: ["6Targets", "6 Targets"] },
  { slug: "barbieboys", name: "Barbie Boys", titles: ["Barbie Boys"] },
  { slug: "enterprise", name: "Enterprise Esports", titles: ["Enterprise Esports", "ENTERPRISE Esports"] },
  { slug: "rival", name: "Rival Esports", titles: ["Rival Esports", "Rival"] },
  { slug: "shaiikademy", name: "Shaiikademy", titles: ["Shaiikademy"] },
  // China
  { slug: "allgamers", name: "All Gamers", titles: ["All Gamers"] },
  { slug: "edg", name: "EDward Gaming", titles: ["EDward Gaming", "Edward Gaming"] },
  { slug: "onecoin", name: "One Coin", titles: ["One Coin"] },
  // Asia
  { slug: "daystar", name: "Daystar", titles: ["Daystar"] },
  { slug: "sharper", name: "Sharper Esports", titles: ["Sharper Esports", "Sharper"] },
  // APAC North
  { slug: "fearx", name: "BNK FearX", titles: ["BNK FearX", "FearX"] },
  { slug: "bemyenemy", name: "Be My Enemy", titles: ["Can You Be My Enemy", "Be My Enemy"] },
  { slug: "kinotrope", name: "KINOTROPE", titles: ["KINOTROPE gaming", "KINOTROPE"] },
  { slug: "rrx", name: "RRX", titles: ["RRX"] },
];

const args = process.argv.slice(2);
const force = args.includes("--force");
const onlyArg = args.find((a) => a.startsWith("--only="));
const only = onlyArg ? new Set(onlyArg.slice(7).split(",")) : null;

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
let lastCall = 0;

async function api(params) {
  const wait = lastCall + 2100 - Date.now();
  if (wait > 0) await sleep(wait);
  lastCall = Date.now();
  const url = `${API}?${new URLSearchParams({ format: "json", formatversion: "2", ...params })}`;
  const res = await fetch(url, { headers: { "User-Agent": UA, "Accept-Encoding": "gzip" } });
  if (!res.ok) throw new Error(`Liquipedia API ${res.status} for ${params.titles ?? params.srsearch}`);
  return res.json();
}

const norm = (s) => s.toLowerCase().replace(/\.[a-z]+$/, "").replace(/[^a-z0-9]/g, "");

function isTeamPage(page) {
  return !page.missing && (page.categories ?? []).some((c) => /Teams$/i.test(c.title));
}

// Pick the team's own logo out of every file used on its page.
function pickLogo(page, team) {
  const names = [team.name, page.title, ...team.titles].map(norm);
  const scored = [];
  for (const { title } of page.images ?? []) {
    const file = title.replace(/^File:/, "");
    const mode = /(darkmode|allmode|lightmode)\.(png|svg)$/i.exec(file);
    if (!mode) continue;
    const base = norm(file.replace(/[ _](\d{4}[ _])?(darkmode|allmode|lightmode)\.(png|svg)$/i, ""));
    if (!names.some((n) => base === n || base.startsWith(n) || n.startsWith(base))) continue;
    const year = Number(/(\d{4})[ _](?:darkmode|allmode|lightmode)/i.exec(file)?.[1] ?? 0);
    const modeScore = { darkmode: 3, allmode: 2, lightmode: 1 }[mode[1].toLowerCase()];
    scored.push({ file, score: year * 10 + modeScore });
  }
  scored.sort((a, b) => b.score - a.score);
  return scored[0]?.file ?? null;
}

async function findPage(team) {
  const query = (titles) =>
    api({
      action: "query",
      titles: titles.join("|"),
      redirects: "1",
      prop: "categories|images",
      cllimit: "max",
      imlimit: "max",
    }).then((d) => d.query?.pages ?? []);

  let pages = (await query(team.titles)).filter(isTeamPage);
  if (pages.length === 0) {
    const s = await api({ action: "query", list: "search", srsearch: team.name, srnamespace: "0", srlimit: "5" });
    const hits = (s.query?.search ?? []).map((h) => h.title);
    if (hits.length) pages = (await query(hits)).filter(isTeamPage);
  }
  for (const page of pages) {
    const file = team.file ?? pickLogo(page, team);
    if (file) return { page: page.title, file };
  }
  return { page: pages[0]?.title ?? null, file: null };
}

async function fileUrl(file) {
  const d = await api({ action: "query", titles: `File:${file}`, prop: "imageinfo", iiprop: "url|mime" });
  return d.query?.pages?.[0]?.imageinfo?.[0]?.url ?? null;
}

async function save(url, slug) {
  const wait = lastCall + 1000 - Date.now();
  if (wait > 0) await sleep(wait);
  lastCall = Date.now();
  const res = await fetch(url, { headers: { "User-Agent": UA } });
  if (!res.ok) throw new Error(`download ${res.status}`);
  const input = Buffer.from(await res.arrayBuffer());
  const img = sharp(input, { density: 600 }).ensureAlpha();
  const meta = await sharp(input).metadata();
  const out = await img
    .trim({ threshold: 1 })
    .resize({ width: MAX_SIDE, height: MAX_SIDE, fit: "inside", withoutEnlargement: true })
    .png({ compressionLevel: 9 })
    .toBuffer({ resolveWithObject: true });
  writeFileSync(join(OUT_DIR, `${slug}.png`), out.data);
  return { w: out.info.width, h: out.info.height, alpha: meta.hasAlpha || meta.format === "svg" };
}

mkdirSync(OUT_DIR, { recursive: true });
const report = [];

for (const team of TEAMS) {
  if (only && !only.has(team.slug)) continue;
  const target = join(OUT_DIR, `${team.slug}.png`);
  if (!force && existsSync(target)) {
    report.push({ ...team, status: "kept", note: "already on disk" });
    continue;
  }
  try {
    const { page, file } = await findPage(team);
    if (!file) {
      report.push({ ...team, status: "missing", page, note: page ? "team page has no logo file" : "no Liquipedia team page" });
      continue;
    }
    const url = await fileUrl(file);
    if (!url) {
      report.push({ ...team, status: "missing", page, note: `no URL for ${file}` });
      continue;
    }
    const { w, h, alpha } = await save(url, team.slug);
    report.push({
      ...team,
      status: "saved",
      page,
      file,
      note: `${w}x${h}${alpha ? "" : ", has a solid background, check it"}`,
    });
  } catch (err) {
    report.push({ ...team, status: "error", note: String(err.message ?? err) });
  }
  const last = report[report.length - 1];
  console.log(`${last.status.padEnd(7)} ${team.slug.padEnd(13)} ${last.file ?? last.note}`);
}

// Logos mapped in lib/teams.ts that are still not on disk would show a broken image.
const teamsTs = readFileSync(join(ROOT, "lib", "teams.ts"), "utf8");
const mapped = new Set([...teamsTs.matchAll(/:\s*"([a-z0-9]+)",/g)].map((m) => m[1]));
const unmapped = [...mapped].filter((s) => !existsSync(join(OUT_DIR, `${s}.png`)));

// A contact sheet on the site's background colour, to eyeball the results.
const sheet = join(tmpdir(), "r6sens-team-logos.html");
writeFileSync(
  sheet,
  `<!doctype html><meta charset="utf-8"><title>Team logos</title>
<style>body{background:#0a0c10;color:#ddd;font:14px system-ui;margin:24px}
div{display:grid;grid-template-columns:repeat(auto-fill,180px);gap:16px}
figure{margin:0;border:1px solid #2a2f38;padding:12px;text-align:center}
img{width:96px;height:96px;object-fit:contain}figcaption{margin-top:8px}</style>
<div>${report
    .map(
      (r) => `<figure>${
        r.status === "saved" || r.status === "kept"
          ? `<img src="file://${join(OUT_DIR, `${r.slug}.png`)}">`
          : `<p style="height:96px">no logo</p>`
      }<figcaption>${r.name}<br><small>${r.page ?? ""}</small></figcaption></figure>`
    )
    .join("")}</div>`
);

console.log("\n== Summary ==");
for (const r of report.filter((r) => r.status === "saved")) {
  console.log(`saved   ${r.slug.padEnd(13)} ${r.page} -> ${r.file} (${r.note})`);
}
for (const r of report.filter((r) => r.status !== "saved" && r.status !== "kept")) {
  console.log(`${r.status.padEnd(7)} ${r.slug.padEnd(13)} ${r.name}: ${r.note}`);
}
if (unmapped.length) {
  console.log(`\nMapped in lib/teams.ts but no file yet: ${unmapped.join(", ")}`);
}
console.log(`\nContact sheet: ${sheet}`);
