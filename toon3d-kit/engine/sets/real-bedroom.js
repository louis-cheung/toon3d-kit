// real-bedroom (2026-11-23): the bedroom of the real-living flat. Same walls (round-4 cream), oak floor, window, door, scale, sun and
// textures as engine/sets/real-living.js, so the two rooms read as one apartment; its own accent is deep teal (the living room's is orange).
//
// Planned around the sun first (RULES L15): the one sun is the living room's (low, from the front left). It comes in through a wide
// casement in the left wall and lands across the desk corner, the floor, the left half of the bed and the back wall; walls, ceiling
// and an unseen fourth wall block it everywhere else, and the room around sits in the same soft fill.
//
// Needs its models before the first frame, in the episode:  import { preloadRealBedroom } from '../../engine/sets/real-bedroom.js';  await preloadRealBedroom();
//
// Layout (x right, z toward the camera, y up; floor 0, ceiling 3.5; furniture x1.1, tall things x1.25 as in the living room):
//   back wall z -2.5: the desk and its chair in the left corner, nightstand, the bed (headboard to the wall) under a seascape, nightstand,
//                     the chest of drawers with a round mirror in the right corner.
//   left wall x -3.5: the window (z -.85 .. 1.95), a snake plant in the front corner.
//   right wall x 3.5: the kit door (back half), the wardrobe (front half), a laundry basket beside it.
import { THREE, toon, G, put, group } from '../core.js';
import { register, raw } from '../registry.js';
import { preloadRealLiving, kit, seg, creamMat, wall, skirting, cove, windowUnit, outside, WALL, TRIM, ROOM, SCALE } from './real-living.js';
import { part, rmat, boxUV, realInk } from '../props/real-home.js';
import { BED } from '../props/real-bedroom.js';

