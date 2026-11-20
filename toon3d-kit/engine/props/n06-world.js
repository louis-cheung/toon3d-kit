// N-06 Thought Notifications (2026-11-18, world builder): the date-night food and table props.
//   anniversary-cake   a small round cake for a two-top, "1 YEAR" piped big on its front and top, one lit candle (flickers)
//   restaurant-menu    a menu a seated bean holds open in two hands (or a standing table card): made-up bistro name, dishes
//                      with dot leaders, and the hot line "Inferno Noodles $19" with five chili peppers (drawn in code) that hop
//   inferno-noodles    a bowl of bright red noodles, chili slices and flakes, steam and cartoon heat waves; eaten 0..1
//   breadstick         one breadstick for a hand
//   breadstick-glass   a glass of breadsticks for the table
//   walrus-tusks       two breadsticks worn under the top lip (Mia's walrus)
//   napkin             a cloth napkin lying flat, or draped over a table-phone (a soft lump); coverAt shoves it over the phone
//   bread-basket       a basket of rolls; fork: true sticks a fork in one, stabAt: [t0, t1] plunges it in
//   pasta-plate        Ryan's creamy pasta; eaten 0..1, a fork twirled in it
//   table-candle       a small glass votive for every table (flame flickers)
// Everything animates as a pure function of the shot clock (userData.update(sec)); inside a set, the set's timeHook runs them.
import { THREE, toon, toonGloss, glow, G, put, group, ctex, rng, hex } from '../core.js';
import { register, raw } from '../registry.js';
import { flame } from './dating.js';

