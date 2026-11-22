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

register('monitor', {
  tags: ['office', 'tech', 'screen'], aliases: ['screen', 'display'], desc: 'Desktop monitor on a stand. Screen content preset.',
  opts: { screen: 'code|dashboard|chart|chat|logo:TEXT', seed: 'content variation', w: 'width (0.95)' },
  build: ({ screen = 'code', seed = 1, w = .95 } = {}) => {
    const g = g0(), h = w * .6; put(g, G.box(.32, .02, .2), toon(PAL.black), { y: .01 }); put(g, G.box(.06, .3, .05), toon(PAL.black), { y: .16, z: -.04 });
    const f = put(g, G.rbox(w, h, .05, .015), toon(PAL.black), { y: .3 + h / 2, z: -.02 });
    put(f, G.plane(w - .07, h - .07), glow(0xffffff, { map: screenTex(screen, seed) }), { z: .032, noInk: true }); return g;
  },
});

register('computer', {
  tags: ['office', 'tech', 'workstation'], aliases: ['pc', 'workstation'], desc: 'Monitor + keyboard + mouse (sits on a desk top, y=0 is desk surface).',
  opts: { screen: 'see monitor', seed: '' },
  build: (o = {}) => {
    const g = g0(); const m = buildOf('monitor', o); m.position.z = -.15; g.add(m);
    put(g, G.rbox(.5, .03, .16, .01), toon(0x33354a), { y: .015, z: .18 }); put(g, G.rbox(.07, .03, .1, .015), toon(0x33354a), { x: .36, y: .015, z: .18 }); return g;
  },
});

register('laptop', {
  tags: ['office', 'tech'], desc: 'Open laptop.', opts: { screen: 'code|dashboard|chart|chat' },
  build: ({ screen = 'dashboard', seed = 2 } = {}) => {
    const g = g0(); put(g, G.rbox(.42, .02, .3, .008), toon(0xb8bcc8), { y: .01 }); put(g, G.box(.36, .005, .16), toon(0x55586a), { y: .022, z: .03 });
    const lid = group(g, { y: .02, z: -.15, rx: -.25 }); put(lid, G.rbox(.42, .28, .015, .008), toon(0xb8bcc8), { y: .14 });
    put(lid, G.plane(.38, .24), glow(0xffffff, { map: screenTex(screen, seed) }), { y: .14, z: .009, noInk: true }); return g;
  },
});

register('office-chair', {
  tags: ['office', 'furniture', 'chair'], aliases: ['chair'], desc: 'Swivel office chair. Seat "seat" (cast seat: { prop }).', opts: { color: 'seat color' },
  build: ({ color = 0x2b2e44 } = {}) => {
    const g = g0(), m = toon(color), k = toon(PAL.black);
    for (let i = 0; i < 5; i++) { const a = i / 5 * Math.PI * 2; put(g, G.box(.32, .03, .05), k, { x: Math.cos(a) * .16, y: .06, z: Math.sin(a) * .16, ry: -a }); put(g, G.sph(.035, 10, 8), k, { x: Math.cos(a) * .3, y: .035, z: Math.sin(a) * .3 }); }
    put(g, G.cyl(.03, .03, .38, 10), k, { y: .25 }); put(g, G.rbox(.5, .08, .48, .03), m, { y: .47 }); put(g, G.rbox(.48, .55, .07, .04), m, { y: .8, z: -.22, rx: -.1 });
    g.userData.seats = { seat: { at: [0, .52, .24], depth: .42, backH: .56, width: .5 } }; return g;
  },
});

register('mug', { tags: ['office', 'kitchen', 'small'], aliases: ['coffee', 'cup'], desc: 'Coffee mug.', opts: { color: '' },
  build: ({ color = PAL.offwhite } = {}) => { const g = g0(); put(g, G.cyl(.05, .045, .11, 18), toon(color), { y: .055 }); put(g, G.torus(.032, .013, 12), toon(color), { x: .055, y: .06, ry: Math.PI / 2 }); put(g, G.cyl(.044, .044, .005, 18), toon(0x4a2a18), { y: .1 }); return g; } });

