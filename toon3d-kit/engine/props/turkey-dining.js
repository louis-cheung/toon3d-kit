// The Turkey (2026-11-19, dining builder): props for 'turkey-dining', Nora's parents' dining room on Thanksgiving night.
// Reference: references/from-louis/sets/thanksgiving-dining-room/ (01 the room, 02 the table dressing, 04 the wide).
//   oven-range      the range with a glass door (opens down), warm orange interior light, a dial, a digital timer that counts down
//   empty-platter   the big oval platter, obviously EMPTY (a smear of juice, a sprig of parsley, a lemon slice)
//   carving-knife   the carving knife (or kind: 'fork' the two-prong carving fork); lying on the table or held (holdR / holdL)
//   side-dish       mash, beans, stuffing, cranberry, corn, sweet-potato, rolls (one prop, kind: ...)
//   patterned-rug   a red Persian-style rug
//   sash-window     a tall white double-hung sash window, night outside (pendant reflections in the glass)
//   dome-pendant    a galvanised metal dome pendant lamp, warm glowing underside, a slow sway
//   kitchen-smoke   soft cartoon smoke puffs drifting out of a doorway (strength over time)
//   taper-candle    a tall white taper in a black iron holder (or pillar: true), flickering flame
//   dried-vase      a brown glass vase of dried autumn flowers
//   ladder-chair    a dark wood ladder-back dining chair (back: 'full' | 'low' | 'none'), seats for cast seat:
//   clock-sign      the big dark clock sign (a clock face over a hand-painted line of text)
//   check-runner    a black and cream buffalo-check table runner
//   woven-placemat  a round woven placemat
// Every animation is a pure function of shot time (userData.update(sec)). Ink, three-tone toon, toonGloss on shiny things.
import { THREE, toon, toonGloss, glow, G, put, group, ctex, rng, hex, lightPool } from '../core.js';
import { register, raw } from '../registry.js';

