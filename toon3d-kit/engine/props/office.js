// Office and interior props. Units: meters, origin at floor center of the object, front faces +z.
import { THREE, toon, glow, G, put, group, PAL, screenTex, textTex, ctex, rng } from '../core.js';
import { register, find } from '../registry.js';
import { paintDiamondAd } from './extras.js';   // poster style 'ad' (2026-11-14)

const g0 = () => new THREE.Group();

register('desk', {
  tags: ['office', 'furniture', 'table'], aliases: ['table', 'office-desk'], desc: 'Office desk, wood top, dark legs.',
  opts: { w: 'width (1.8)', d: 'depth (0.85)', color: 'top color' },
  build: ({ w = 1.8, d = .85, color = PAL.wood } = {}) => {
    const g = g0(); put(g, G.rbox(w, .08, d, .02), toon(color), { y: .76 }); put(g, G.box(w - .06, .04, d - .06), toon(PAL.woodDark), { y: .7 });
    for (const [a, b] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) put(g, G.box(.06, .7, .06), toon(PAL.black), { x: a * (w / 2 - .08), y: .35, z: b * (d / 2 - .08) });
    return g;
  },
});

