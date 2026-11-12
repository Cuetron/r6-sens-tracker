// Player photos shown on /player/[id].
//
// The easy way: save cut-out photos into a folder, named after the player
// (Gunnar.png) or their id from the page URL (113.png), then run
//
//   node scripts/import-player-photos.mjs ~/Downloads/m80
//
// That trims and resizes each photo into public/players/ and fills in the list
// below. To add one by hand instead, put a transparent PNG or WebP in
// public/players/ and add a line: the key is the player's id from the page URL
// (r6sens.com/player/113 -> 113).
//
// Players without an entry get the no-photo layout.

const PLAYER_PHOTOS: Record<number, string> = {
  // 113: "gunnar.png",
};

/** The photo for a player, or null when there is none. */
export function playerPhoto(id: number): string | null {
  const file = PLAYER_PHOTOS[id];
  return file ? `/players/${file}` : null;
}
