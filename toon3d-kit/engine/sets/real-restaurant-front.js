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

/** Round 2: the restaurant room behind the shop windows, as seen from the street: oak floor, the kit brick back wall, cream ceiling,
 *  set tables with bistro chairs and a pendant over each, behind every window bay. Built with the restaurant's own props. */
function interior(p) {
  const g = group(p, {}), Z0 = -.26, Z1 = -5, W = 22;
  part(g, G.box(W, .02, Z0 - Z1), 'oak', 0x8a6444, { y: -.01, z: (Z0 + Z1) / 2, grain: 'x', shadow: false }).receiveShadow = true;
  part(g, G.box(W, 3.2, .1), 'brick', 0xffffff, { y: 1.6, z: Z1 - .05 });
  const c = put(g, G.box(W, .1, Z0 - Z1), toon(0xe9e2d4, { emissive: 0x3a2a1a }), { y: 3.05, z: (Z0 + Z1) / 2, noInk: true }); c.receiveShadow = false;
  for (const x of [-W / 2, W / 2]) part(g, G.box(.1, 3.2, Z0 - Z1), 'cream', 0xe6ddcd, { x, y: 1.6, z: (Z0 + Z1) / 2 });
  for (const x of [-8, -4, -2, 2, 4, 8]) {
    const t = raw('real-cafe-table', { ink: false, lamp: true, dishes: x % 4 ? ['pasta', null] : [null, 'salad'] }); t.position.set(x, 0, -1.7); t.scale.setScalar(1.1); g.add(t);
    for (const sx of [-1, 1]) { const ch = raw('real-bistro-chair', { ink: false }); ch.position.set(x + sx * .72, 0, -1.55); ch.rotation.y = sx < 0 ? PI / 2 - .8 : -PI / 2 + .8; ch.scale.setScalar(1.1); g.add(ch); }
    const pd = raw('real-pendant', { ink: false, drop: .85 }); pd.position.set(x, 3.0, -1.7); g.add(pd);
  }
  realInk(g);
  return g;
}

