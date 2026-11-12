// Imports player photos you have saved into a folder.
//
//   node scripts/import-player-photos.mjs ~/Downloads/m80
//   node scripts/import-player-photos.mjs ~/Downloads/m80 --dry-run
//
// Name each image after the player as it appears on the site (Gunnar.png,
// "SpiriTz.webp") or after their id from the page URL (113.png). PNG, WebP,
// JPG and AVIF all work.
//
// For each image the script:
//   1. finds the player in the Players table (read only, using .env.local),
//   2. checks it has a transparent background (the page design needs a cut-out),
//   3. trims empty edges, resizes it to at most 1200px tall and saves it as
//      public/players/<name>-<id>.webp,
//   4. adds or updates the player's line in lib/player-photos.ts.
//
// A photo with a solid background is skipped. Remove the background first: on a
// Mac, right-click it in Finder and choose Quick Actions > Remove Background.
// Pass --keep-background to import it anyway.
//
// Uses sharp (installed with Next.js) and @supabase/supabase-js.

import { existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import { basename, dirname, extname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { createClient } from "@supabase/supabase-js";
import sharp from "sharp";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const OUT_DIR = join(ROOT, "public", "players");
const MANIFEST = join(ROOT, "lib", "player-photos.ts");
const MAX_HEIGHT = 1200;
const EXTS = new Set([".png", ".webp", ".jpg", ".jpeg", ".avif"]);

const args = process.argv.slice(2);
const dryRun = args.includes("--dry-run");
const keepBackground = args.includes("--keep-background");
const inDir = args.find((a) => !a.startsWith("--"));
if (!inDir) {
  console.error("Usage: node scripts/import-player-photos.mjs <folder> [--dry-run] [--keep-background]");
  process.exit(1);
}
const inPath = resolve(inDir.replace(/^~(?=\/|$)/, process.env.HOME ?? "~"));
if (!existsSync(inPath)) {
  console.error(`Folder not found: ${inPath}`);
  process.exit(1);
}

// --- Supabase (read only) -------------------------------------------------
function loadEnv(file) {
  if (!existsSync(file)) return;
  for (const line of readFileSync(file, "utf8").split(/\r?\n/)) {
    const m = /^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/.exec(line);
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^(['"])(.*)\1$/, "$2");
  }
}
loadEnv(join(ROOT, ".env.local"));
loadEnv(join(ROOT, ".env"));
const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
if (!url || !key) {
  console.error("NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY must be set in .env.local");
  process.exit(1);
}
const { data, error } = await createClient(url, key).from("Players").select("*");
if (error) {
  console.error(`Could not read Players: ${error.message}`);
  process.exit(1);
}
const players = (data ?? []).map((r) => ({
  id: Number(r.id),
  name: String(r.name ?? "").trim(),
  team: String(r.team ?? r.Team ?? "").trim(),
}));

const norm = (s) => s.toLowerCase().normalize("NFKD").replace(/[^a-z0-9]/g, "");
const slug = (s) => norm(s) || "player";

function findPlayer(stem) {
  if (/^\d+$/.test(stem)) {
    const p = players.find((x) => x.id === Number(stem));
    return p ? { player: p } : { problem: `no player with id ${stem}` };
  }
  const matches = players.filter((x) => norm(x.name) === norm(stem));
  if (matches.length === 1) return { player: matches[0] };
  if (matches.length === 0) return { problem: "no player with that name" };
  const list = matches.map((m) => `${m.id} (${m.team || "no team"})`).join(", ");
  return { problem: `several players are called that: ${list}. Rename the file to the id` };
}

// --- Manifest -------------------------------------------------------------
const manifestSrc = readFileSync(MANIFEST, "utf8");
const OPEN = "const PLAYER_PHOTOS: Record<number, string> = {";
const start = manifestSrc.indexOf(OPEN);
const end = manifestSrc.indexOf("};", start);
if (start < 0 || end < 0) {
  console.error("Could not find PLAYER_PHOTOS in lib/player-photos.ts");
  process.exit(1);
}
const entries = new Map();
for (const m of manifestSrc.slice(start + OPEN.length, end).matchAll(/^\s*(\d+):\s*"([^"]+)",(?:\s*\/\/\s*(.*))?$/gm)) {
  entries.set(Number(m[1]), { file: m[2], label: m[3] ?? "" });
}

// --- Import ---------------------------------------------------------------
if (!dryRun) mkdirSync(OUT_DIR, { recursive: true });
const report = { saved: [], skipped: [] };

const files = readdirSync(inPath)
  .filter((f) => EXTS.has(extname(f).toLowerCase()) && !f.startsWith("."))
  .sort();
if (files.length === 0) console.log(`No images found in ${inPath}`);

for (const f of files) {
  const stem = basename(f, extname(f)).trim();
  const { player, problem } = findPlayer(stem);
  if (!player) {
    report.skipped.push(`${f}: ${problem}`);
    continue;
  }
  try {
    const input = sharp(join(inPath, f));
    const meta = await input.metadata();
    const { isOpaque } = await input.stats();
    if (isOpaque && !keepBackground) {
      report.skipped.push(`${f}: has a solid background (remove it first, or pass --keep-background)`);
      continue;
    }
    const outName = `${slug(player.name)}-${player.id}.webp`;
    const label = `${player.name}${player.team ? `, ${player.team}` : ""}`;
    if (!dryRun) {
      const out = await sharp(join(inPath, f))
        .trim({ threshold: 1 })
        .resize({ height: MAX_HEIGHT, withoutEnlargement: true })
        .webp({ quality: 86, alphaQuality: 100 })
        .toFile(join(OUT_DIR, outName));
      report.saved.push(`${f} -> ${label} (id ${player.id}) -> public/players/${outName} (${out.width}x${out.height})`);
    } else {
      report.saved.push(`${f} -> ${label} (id ${player.id}) -> public/players/${outName} (${meta.width}x${meta.height}, dry run)`);
    }
    entries.set(player.id, { file: outName, label });
  } catch (err) {
    report.skipped.push(`${f}: ${err.message ?? err}`);
  }
}

if (!dryRun && report.saved.length) {
  const body = [...entries]
    .sort((a, b) => a[0] - b[0])
    .map(([id, e]) => `  ${id}: "${e.file}",${e.label ? ` // ${e.label}` : ""}`)
    .join("\n");
  writeFileSync(MANIFEST, `${manifestSrc.slice(0, start + OPEN.length)}\n${body}\n${manifestSrc.slice(end)}`);
}

console.log(`\n== Imported ${report.saved.length} ==`);
report.saved.forEach((l) => console.log(`  ${l}`));
if (report.skipped.length) {
  console.log(`\n== Skipped ${report.skipped.length} ==`);
  report.skipped.forEach((l) => console.log(`  ${l}`));
}
if (!dryRun && report.saved.length) console.log("\nUpdated lib/player-photos.ts");
