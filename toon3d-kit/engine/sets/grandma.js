// Rich System Ep 6 "Grandma's House" (2026-11-15): three sets.
//   grandma-house   Thanksgiving evening inside Grandma's house: ONE connected floor plan (dining room, kitchen, TV room)
//   condo-site      Dale's half-built condo tower at night (2 to 3 s cutaway): crane, floodlights, puddles that reflect, a fence banner
//   grandma-porch   the front porch at night, the last shot: porch swing, warm lamp, leaves, the lit kitchen window, the yard sign
//
// grandma-house layout (metres; y up; the "front" cameras look toward -z):
//   DINING ROOM x -4.6..3.6, z -2.6..3.4, ceiling 2.75. A long glossy table (4.7 x 1.15, top .786) along x at z 0, reflecting the chandelier
//     and candles. Ray's head armchair at x -2.95 (facing +x); Grandma's chair beside it on the back side (x -1.85, z -.95); four more back
//     seats and five front seats. Back wall (z -2.6): the archway to the TV room (x -2.5..-.9), the big wall clock (x .35, y 1.95), the photo
//     wall, a buffet. Left wall (x -4.6): the night window with rose curtains, the china cabinet. Front wall (z 3.4): a second night window,
//     a floor lamp, a sideboard. Right wall (x 3.6): the KITCHEN DOORWAY at z 0 (1.0 wide), straight down the table from Ray's chair.
//   KITCHEN x 3.6..8.4: the sink under a night window on the back wall (x 6.0), dish rack, dirty dishes and pots, the stove on the right
//     wall with steam, the fridge (kid drawings, magnets) on the front wall, a little breakfast table, a pendant over the sink, checker floor.
//   TV ROOM x -4.6..1.6, z -7.2..-2.6 behind the archway: football on the TV, a sofa, two kids running laps (kids: false = none).
import { THREE, toon, toonGloss, glow, G, put, group, ctex, rng, hex, pointLight, lightPool, lightBeam, dustMotes, timeHook } from '../core.js';
import { register, raw } from '../registry.js';

const PI = Math.PI;

