// Realistic home props, built in code in the Quaternius Downtown City style (2026-11-23, RULES L2: "realistic and clean",
// "3, full textures"). Real proportions in metres, bevelled edges, handles, legs, piped cushions, and real surface textures
// on our three-tone cel material with the ink outline: the same treatment as the kit through model(..., { look: 'textured' }).
//
// Textures: the kit's own where it has one (concrete worktop, marble floor via the kit's Floor pieces in the set); everything
// else is drawn here with a canvas (oak planks, wood grain, plaster, fabric weave, leather, subway tile, rug, a painting).
// They are greyscale detail maps tinted by the material colour, so one fabric map serves every sofa colour. No downloads,
// no generated images. Each is made once, on first use (nothing runs at import, so other episodes are untouched).
//
// UVs: boxUV() re-projects any geometry's UVs in metres (top faces use x/z, sides x/y or z/y), so a texture keeps its real size
// on any part instead of stretching to the face. Ink: realInk() gives each part an outline sized to the part (thin on a tap,
// full on a cabinet) and then marks it done, so the registry's own ink pass does not double it.
import { THREE, toon, toonGloss, G, put, group, rng, inkAll } from '../core.js';
import { register } from '../registry.js';

const PI = Math.PI;
export const REAL = { ink: .012, inkMin: .0035 };

