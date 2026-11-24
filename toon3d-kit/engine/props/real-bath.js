// Realistic bathroom props (2026-11-23) for engine/sets/real-bathroom.js: same helpers, textures and part-sized ink as
// engine/props/real-home.js. Real metres, front toward +z, standing on y 0, centred on x. Accent: sage.
//
// The mirror (mirrorSurface) is a real reflection: before the main frame draws it, the scene is rendered once more from the
// camera mirrored in the glass into a texture (the method of three.js's Reflector, written out here because lib/addons does
// not ship it). It shows the cast as they are in that frame, face, expression and acting included, and works in the headless
// software renderer. It renders only for the main frame (render target null), so other passes reuse that frame's image.
import { THREE, toon, toonGloss, G, put, group, rng } from '../core.js';
import { register } from '../registry.js';
import { part, rb, realInk, shaker, barHandle, REAL, boxUV, GRAD } from './real-home.js';

const PI = Math.PI;
/** The bathroom palette: cream paint, warm white tile, warm grey floor tile, oak, chrome, sage accent. */
export const BATH = { tile: 0xf3e5cc, floor: 0xc8ac8a, grout: .8, sageTile: 0xa7b99f, sage: 0x8a9e86, sageDark: 0x6f8470, white: 0xf6f4ef, oak: 0xc49a6a, oat: 0xd8cdb8 };
const CHROME = () => toonGloss(0xd2d6da, { cut: .9, gloss: 1.1 });
const CERAMIC = () => toonGloss(BATH.white, { cut: .93, gloss: .7 });
const lathe = (pts, n = 28) => new THREE.LatheGeometry(pts.map(([a, b]) => new THREE.Vector2(a, b)), n);

