// Practical-light kit as props (2026-11-14). The builders live in engine/core.js (lightBeam, dustMotes, lightPool) so sets and
// mood keys use the same code; these wrappers let an episode drop a beam, dust or a pool anywhere. All default off: nothing
// changes in a shot that does not place one. Pure functions of the shot clock (they animate themselves, see core.js timeHook).
import { THREE, lightBeam, dustMotes, lightPool, timeHook } from '../core.js';
import { register } from '../registry.js';

register('light-beam', {
  kind: 'fx', tags: ['light', 'beam', 'volumetric', 'god-ray', 'lamp', 'window', 'streetlight', 'practical', 'dust', 'rich-look'], aliases: ['volumetric-beam', 'lamp-beam', 'window-shaft'],
  desc: 'A visible light beam (the Rick\'s Clips look): a soft cone from a lamp, window or streetlight that fades at its rim and toward the floor, faint moving rays, and dust motes floating in it. The prop origin is the lamp; give `to` relative to it (or a direction and len). shape "shaft" makes a square window shaft. Additive and unlit, so it never darkens anything; mood dimming leaves it alone.',
  opts: { to: '[x, y, z] where the beam lands, relative to the prop ([0, -2.6, 0])', len: 'length m (else |to|)', r0: 'radius at the lamp (.12)', r1: 'radius where it lands (.9)', color: 'warm 0xffd9a0 / cool 0xa8c4ff', strength: 'brightness (.32)', soft: 'rim softness (1.4)', shape: "'cone' | 'shaft'", aspect: 'shaft: width/depth ratio', streaks: 'ray streaks 0..1 (.35)', dust: 'dust motes in it (40; 0 = none)', dustSize: 'mote size m (.014)', glow: 'true adds a light-pool where it lands' },
  build: (o = {}) => {
    const g = new THREE.Group(), to = o.to || [0, -2.6, 0];
    g.add(lightBeam({ ...o, from: [0, 0, 0], to, dust: o.dust ?? 40 }));
    if (o.glow) g.add(lightPool({ at: [to[0], to[1] + .004, to[2]], r: (o.r1 ?? .9) * 1.1, color: o.color, ...(typeof o.glow === 'object' ? o.glow : {}) }));
    return g;
  },
});

register('dust-motes', {
  kind: 'fx', tags: ['dust', 'particles', 'air', 'light', 'practical', 'rich-look'], aliases: ['dust', 'floating-dust'],
  desc: 'Dust motes hanging in the air of a box (w x h x d metres, origin at the bottom centre): small soft warm dots that drift, sink, rise and twinkle. Brightest where a light hits them, so put them in a lamp or window beam. Use light-beam for dust inside a cone.',
  opts: { box: '[w, h, d] ([1.6, 2, 1.6])', n: 'count (60)', color: '0xffe6b8', size: 'mote size m (.014)', seed: '' },
  build: (o = {}) => { const g = new THREE.Group(), d = dustMotes({ box: o.box || [1.6, 2, 1.6], n: o.n ?? 60, color: o.color, size: o.size, seed: o.seed }); g.add(d); timeHook(g, (s) => d.userData.update(s)); return g; },
});

register('light-pool', {
  kind: 'fx', tags: ['light', 'pool', 'glow', 'lamp', 'practical', 'rich-look'], aliases: ['pool-of-light', 'table-glow'],
  desc: 'A soft pool of light lying on a surface (a table top, the floor, a wall with rx 0): an additive radial glow, so it reads as lamp light landing, not paint. Put it a few mm above the surface under a lamp or a beam. Warm under pendants, cool under a window.',
  opts: { r: 'radius m (.9)', color: '0xffc98a', strength: '(.55)', sx: 'x stretch (1)', sz: 'depth stretch (1)', rx: 'tilt (flat -PI/2; 0 = on a wall facing +z)', hard: '0..1 firmer edge (0)' },
  build: (o = {}) => { const g = new THREE.Group(); g.add(lightPool({ ...o, at: [0, 0, 0] })); return g; },
});
