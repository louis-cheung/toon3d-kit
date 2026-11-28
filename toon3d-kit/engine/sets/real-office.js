// real-office (2026-11-23): an open-plan office floor in a Downtown kit building, daytime, in the style of real-living,
// real-bedroom and real-restaurant (cream walls, kit street outside, same scale, sun, cel material and ink). Accent: navy.
//
// Planned around the sun first (RULES L15): the flat's low sun from the front left comes through a row of tall windows in the
// left wall. A desk top within about 4.7 m of that wall and a seated head within about 3.6 m get real sun (trace: the line from
// the point toward the sun must leave through a window below its head, 3.2 m). So the work pod the cast use, the boss's desk and
// the glass meeting room all stand along the windows; a window in the unseen camera-side wall adds a patch on the right-hand
// front (whiteboard, coat hooks). The kitchenette, printer and lift on the right sit in the fill under the ceiling panels.
//
// Layout (x right, z toward the camera; floor 0, ceiling 3.5; furniture x1.1, tall things x1.25):
//   left wall x -5: four tall windows. Along it: the glass meeting room (back, z -4 .. -1.6), the work pod (desk0, desk1 side by side
//   facing the room, desk2 facing desk0), the boss's desk (front, z 2.75; the boss on the window side).
//   right of the middle: a second pod (x 1.3 .. 2.85) for extras, in the fill.
//   back wall z -4: the lift (x .8), a wall clock, the kitchenette run (coffee machine, sink) with the water cooler.
//   right wall x 5: the printer, two filing cabinets, the whiteboard, coat hooks.
import { THREE, toon, G, put, group } from '../core.js';
import { register, raw } from '../registry.js';
import { preloadRealLiving, kit, seg, creamMat, wall, skirting, cove, outside, WALL, TRIM, ROOM, SCALE } from './real-living.js';
import { part, rb, boxUV, realInk, kitchenRun } from '../props/real-home.js';
import { OFC } from '../props/real-office.js';

const PI = Math.PI, A = SCALE.arch, F = SCALE.furn, { CH, WT } = ROOM;
const BZ = -4, LX = -5, RX = 5, FZ = 4;
const WINS = [[-3.8, -2.05], [-1.75, 0], [.3, 2.05], [2.35, 3.8]], WY0 = .5, WY1 = 3.2;   // left-wall windows (z ranges), sill, head
const FWIN = { x0: 0, x1: 3, y0: 1.0, y1: 3.3 };                                           // the unseen camera-side window (lights the right front)
const LIFT = { x: .8, w: 1.5, h: 2.5 };
const OPEN = .6;   // seated office workers turn this far toward the room (+z), so the flat cast read three-quarter
export const preloadRealOffice = preloadRealLiving;
const ALU = () => toon(0x2a2a2e);

/** A tall office window in the left wall: aluminium frame, two mullions, a transom, a sill. Local: faces +z. */
function officeWindow(p, o) {
  const g = group(p, o), w = o.w, h = WY1 - WY0, cy = (WY0 + WY1) / 2, z = -.05, a = ALU();
  wall(g, .01, h, WT, [-w / 2 - .005, cy, -WT / 2]); wall(g, .01, h, WT, [w / 2 + .005, cy, -WT / 2]); wall(g, w, .01, WT, [0, WY1 + .005, -WT / 2]); wall(g, w, .01, WT, [0, WY0 - .005, -WT / 2]);
  for (const [ww, hh, x, y] of [[w, .06, 0, WY1 - .03], [w, .06, 0, WY0 + .03], [.06, h, -w / 2 + .03, cy], [.06, h, w / 2 - .03, cy]]) put(g, rb(ww, hh, .06, .004), a, { x, y, z });
  for (let i = 1; i < 3; i++) put(g, rb(.04, h, .05, .003), a, { x: -w / 2 + w * i / 3, y: cy, z, noInk: true });
  put(g, rb(w, .04, .05, .003), a, { y: WY0 + h * .8, z, noInk: true });
  part(g, rb(w + .1, .03, .22, .005), 'paint', TRIM, { y: WY0 - .015, z: .07 });
  return g;
}

