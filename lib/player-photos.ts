// Player photos shown on /player/[id].
//
// How to add one:
// 1. Use a cut-out photo with a transparent background (PNG or WebP), cropped
//    to the player from roughly the waist up. Portrait works best, about 4:5,
//    at least 800px tall. On a Mac, right-click the image in Finder and choose
//    Quick Actions > Remove Background.
// 2. Save it as public/players/<file>, e.g. public/players/gunnar.png.
// 3. Add a line below: the key is the player's id from the page URL
//    (r6sens.com/player/113 -> 113).
//
// Only use photos you have the right to publish, such as ones the player or
// team sent you. Players without an entry get the no-photo layout.

const PLAYER_PHOTOS: Record<number, string> = {
  // 113: "gunnar.png",
};

/** The photo for a player, or null when there is none. */
export function playerPhoto(id: number): string | null {
  const file = PLAYER_PHOTOS[id];
  return file ? `/players/${file}` : null;
}
