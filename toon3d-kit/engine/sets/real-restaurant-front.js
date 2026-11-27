// real-restaurant-front (2026-11-23): EXT. RESTAURANT - NIGHT, the street in front of real-restaurant. A Downtown kit building
// front (shop windows glowing warm from the restaurant inside, the glass entrance door, brick upper floors with a few lit windows),
// the kit sidewalk and road, bollards, and two street lamps. For walk-outs and doorstep scenes.
//
// Light (RULES L15 at night, every light a real source): the street lamp at the curb is the key, a shadow-casting spot from its
// lantern, so the cast's shadows fall on the pavement and the facade; the shop windows spill warm light onto the sidewalk (spots
// from inside the glass, with a soft pool); the fill is a low deep blue and the moon faint.
//
// Layout: the facade runs along x at z 0 facing +z; sidewalk z 0..3 (top at y 0), road 3..9, far sidewalk 9..12. The entrance is
// at x 0; shop windows either side; the key lamp at x 2.2 by the curb, a second lamp at x -6.
import { THREE, toon, G, put, group, lightPool } from '../core.js';
import { register, raw } from '../registry.js';
import { kit, SCALE } from './real-living.js';
import { preloadRealRestaurant, NIGHT_LIGHT } from './real-restaurant.js';
import { realInk, part } from '../props/real-home.js';

const PI = Math.PI;
const GLASS = 0x0a0b0c, INTERIOR = 0x0b0c0d;   // marker colours: the kit's glass and fake-interior materials, swapped below
const FRONT = { '-10': 'Brick_BottomTrim', '-8': 'Trim_FirstFloor_Window_001', '-6': 'Brick_BottomTrim', '-4': 'Trim_FirstFloor_Window_001', '-2': 'Trim_FirstFloor_Window_001',
  0: 'DoorFrame_Trim', 2: 'Trim_FirstFloor_Window_001', 4: 'Trim_FirstFloor_Window_001', 6: 'Brick_BottomTrim', 8: 'Trim_FirstFloor_Window_001', 10: 'Brick_BottomTrim' };
const LAMPS = [[-1.4, 2.55], [6.5, 2.55]];

