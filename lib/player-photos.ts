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
  3: "paluh-3.webp", // Paluh, Fluxo W7m
  4: "cyber-4.webp", // Cyber, Faze Clan
  5: "canadian-5.webp", // Canadian, Shopify Rebellion
  6: "shaiiko-6.webp", // Shaiiko, G2 Esports
  7: "stompn-7.webp", // Stompn, G2 Esports
  8: "doki-8.webp", // Doki, G2 Esports
  9: "benjamaster2k-9.webp", // Benjamaster2k, G2 Esports
  10: "alem40-10.webp", // Alem40, G2 Esports
  11: "likefac-11.webp", // Likefac, Team Falcons
  12: "yuzus-12.webp", // Yuzus, Team Falcons
  13: "solotov-13.webp", // Solotov, Team Falcons
  14: "brid-14.webp", // Brid, Team Falcons
  15: "jume-15.webp", // Jume, Team Falcons
  16: "dan-16.webp", // Dan, Virtus Pro
  17: "nayqo-17.webp", // Nayqo, Virtus Pro
  18: "skyzs-18.webp", // Skyzs, Virtus Pro
  19: "p4sha-19.webp", // P4sha, Virtus Pro
  20: "rorick-20.webp", // Rorick, Virtus Pro
  21: "blaz-21.webp", // Blaz, Twisted Minds
  22: "robby-22.webp", // Robby, Shifters
  23: "freq-23.webp", // Freq, Shifters
  24: "lasmoo-24.webp", // Lasmoo, Team Heretics
  26: "nafe-26.webp", // Nafe, Shifters
  27: "ctzn-27.webp", // Ctzn, Shifters
  28: "noa-28.webp", // Noa, Team Secret
  29: "savage-29.webp", // Savage, M80
  30: "mowwwgli-30.webp", // Mowwwgli, Twisted Minds
  31: "ask-31.webp", // Ask, Geekay Esports
  34: "sarks-34.webp", // Sarks, Geekay Esports
  35: "hungry-35.webp", // Hungry, Team Secret
  36: "aqui-36.webp", // Aqui, Team Heretics
  39: "zaaramy-39.webp", // Zaaramy, Team Heretics
  40: "lollo-40.webp", // Lollo, Team Heretics
  41: "croqson-41.webp", // Croqson, Team Secret
  43: "deapek-43.webp", // Deapek, Fnatic
  44: "deadsht-44.webp", // Deadsht, Shifters
  45: "wizard-45.webp", // Wizard, Fnatic
  46: "elemzje-46.webp", // Elemzje, Rebel Gaming
  52: "p9-52.webp", // P9, Dropped
  53: "jlad-53.webp", // Jlad, Twisted Minds
  54: "hashom-54.webp", // Hashom, Twisted Minds
  55: "tr1ixd-55.webp", // Tr1ixd, Twisted Minds
  56: "handyy-56.webp", // Handyy, Faze Clan
  57: "kds-57.webp", // Kds, Faze Clan
  58: "soulz-58.webp", // Soulz, Faze Clan
  59: "vitaking-59.webp", // Vitaking, Faze Clan
  60: "dodez-60.webp", // Dodez, Los
  61: "dotz-61.webp", // Dotz, Fluxo W7m
  62: "lobin-62.webp", // Lobin, Fluxo W7m
  64: "peres-64.webp", // Peres, Los
  65: "nuxxga-65.webp", // Nuxxga, Los
  66: "daffodil-66.webp", // Daffodil, Los
  67: "dash-67.webp", // Dash, Los
  69: "kheyze-69.webp", // Kheyze, Team Liquid
  70: "jv92-70.webp", // Jv92, Team Liquid
  71: "felipox-71.webp", // Felipox, Team Liquid
  72: "nade-72.webp", // Nade, Team Liquid
  73: "maia-73.webp", // Maia, Team Liquid
  74: "hatez-74.webp", // Hatez, Fluxo W7m
  75: "pino-75.webp", // Pino, Lucky 5
  76: "wizard-76.webp", // Wizard, Lucky 5
  77: "fntzy-77.webp", // Fntzy, Fluxo W7m
  78: "basseto-78.webp", // Basseto, Lucky 5
  79: "dias-79.webp", // Dias, Furia
  80: "herdz-80.webp", // Herdz, Furia
  81: "loira-81.webp", // Loira, Furia
  82: "volpz-82.webp", // Volpz, Furia
  83: "bokzera-83.webp", // Bokzera, Furia
  84: "flastry-84.webp", // Flastry, Loud
  85: "gabu-85.webp", // Gabu, Loud
  86: "live-86.webp", // Live, Loud
  87: "stemp-87.webp", // Stemp, Loud
  88: "resetz-88.webp", // Resetz, Loud
  89: "mr6otlaw-89.webp", // Mr6otlaw, Black Dragons
  90: "swag-90.webp", // Swag, Black Dragons
  92: "r4re-92.webp", // R4re, Black Dragons
  94: "stk-94.webp", // Stk, Intz
  95: "rappz-95.webp", // Rappz, Intz
  96: "legacy-96.webp", // Legacy, Imperium Of Man
  97: "ar7hr-97.webp", // Ar7hr, Intz
  98: "angelzz-98.webp", // Angelzz, Intz
  101: "mitrix-101.webp", // Mitrix, Imperium Of Men
  102: "sexycake-102.webp", // Sexycake, Imperium Of Men
  104: "j9o-104.webp", // J9O, Darkzero
  105: "kyno-105.webp", // Kyno, Darkzero
  106: "nuers-106.webp", // Nuers, Darkzero
  107: "njr-107.webp", // Njr, Darkzero
  108: "fultz-108.webp", // Fultz, Darkzero
  109: "gaveni-109.webp", // Gaveni, M80
  110: "hotandcold-110.webp", // Hotandcold, 100 Thieves
  111: "ashn-111.webp", // Ashn, M80
  112: "dfuzr-112.webp", // Dfuzr, M80
  113: "gunnar-113.webp", // Gunnar, M80
  114: "spiker-114.webp", // Spiker, Wildcard
  115: "kanzen-115.webp", // Kanzen, Wildcard
  116: "bae94-116.webp", // Bae94, Wildcard
  117: "bbysharkk-117.webp", // Bbysharkk, Wildcard
  118: "adrian-118.webp", // Adrian, Wildcard
  119: "surf-119.webp", // Surf, Shopify Rebellion
  120: "rexen-120.webp", // Rexen, Shopify Rebellion
  121: "spoit-121.webp", // Spoit, Shopify Rebellion
  122: "ambi-122.webp", // Ambi, Shopify Rebellion
  123: "rivalgn-123.webp", // Rivalgn, Spacestation Gaming
  124: "dream-124.webp", // Dream, Spacestation Gaming
  125: "gity-125.webp", // Gity, Spacestation Gaming
  126: "aidentax-126.webp", // Aidentax, Spacestation Gaming
  127: "raidbullys-127.webp", // Raidbullys, Spacestation Gaming
  128: "jjblazt-128.webp", // JJblazt, Five Fears
  129: "forrest-129.webp", // Forrest, Five Fears
  130: "snakesaremeta-130.webp", // Snakesaremeta, Five Fears
  131: "fenz-131.webp", // Fenz, Five Fears
  132: "rival-132.webp", // Rival, Five Fears
  134: "panbazou-134.webp", // Panbazou, Cloud 9
  135: "atom-135.webp", // Atom, 100 Thieves
  136: "gmz-136.webp", // Gmz, 100 Thieves
  137: "yoggah-137.webp", // Yoggah, Geekay Esports
  138: "spiritz-138.webp", // Spiritz, 100 Thieves
  139: "packer-139.webp", // Packer, 1 Of 30
  140: "mikew-140.webp", // MikeW, 1 Of 30
  141: "vulspur-141.webp", // Vulspur, 1 Of 30
  142: "beeno-142.webp", // Beeno, 1 Of 30
  149: "sdgundam-149.webp", // sdgundam, One Coin
  150: "gruby-150.webp", // Gruby, Geekay Esports
  152: "flexy-152.webp", // Flexy, Dropped
  153: "lycolis-153.webp", // Lycolis, Sharper Esports
  154: "azuki-154.webp", // AZuKi, Daystar
  155: "brendo-155.webp", // Brendo, Enterprise Esports
  156: "eupor-156.webp", // Eupor, Geekay Esports
  157: "vdrillz-157.webp", // vDrillz, Team Secret
  158: "tuhan-158.webp", // Tuhan, Enterprise Esports
  159: "bapn-159.webp", // Bapn, Edward Gaming
  160: "kyro-160.webp", // Kyro, Enterprise Esports
  161: "relaes-161.webp", // Relaes, Chiefs
  163: "wettables-163.webp", // Wettables, Rival Esports
  165: "erazer-165.webp", // Erazer, Rival Esports
  166: "pluto-166.webp", // Pluto, Man Lfo
  167: "beers-167.webp", // Beers, Man Lfo
  168: "kkin-168.webp", // KKin, Shaiikademy
  169: "rhqnz-169.webp", // Rhqnz, Shaiikademy
  170: "schont-170.webp", // Schont, Shaiikademy
  171: "baele-171.webp", // Baele, Barbie Boys
  172: "kqrma-172.webp", // Kqrma, 6targets
  173: "orion-173.webp", // Orion, 6targets
  174: "syrro-174.webp", // Syrro, Rock Lfo
  175: "jinm-175.webp", // JiNm, Rrx
  178: "woogiman-178.webp", // Woogiman, Bnk Fearx
  179: "sikinngo-179.webp", // SikiNNGO, Be My Enemy
  181: "koromomo-181.webp", // KoroMomo, Be My Enemy
  182: "asvel-182.webp", // Asvel, Be My Enemy
  184: "aokayu-184.webp", // Aokayu, Kinotrope
  185: "mo5quito-185.webp", // Mo5quito, Edward Gaming
  186: "mcie-186.webp", // Mcie, All Gamers
  187: "onjuly-187.webp", // Onjuly, One Coin
  190: "kason-190.webp", // Kason, 100 Thieves
  191: "reif-191.webp", // Reif, Edward Gaming
  192: "guto-192.webp", // Guto, Black Dragons
  193: "romeo-193.webp", // Romeo, Black Dragon
  194: "ewzy-194.webp", // Ewzy, Cloud 9
  195: "eddy-195.webp", // Eddy, Cloud 9
  196: "sm1ss-196.webp", // Sm1ss, Fnatic
  197: "tyrant-197.webp", // Tyrant, Outlast
  199: "carpe-199.webp", // Carpe, Edward Gaming
  200: "peeps-200.webp", // Peeps, Sharper Esports
  202: "centir-202.webp", // Centir, Cloud 9
  203: "jigsaw-203.webp", // Jigsaw, Enterprise Esports
  204: "skeptic-204.webp", // Skeptic, Team Heretics
};

/** The photo for a player, or null when there is none. */
export function playerPhoto(id: number): string | null {
  const file = PLAYER_PHOTOS[id];
  return file ? `/players/${file}` : null;
}
