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

