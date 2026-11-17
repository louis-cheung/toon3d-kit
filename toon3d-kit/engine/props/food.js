// Food and table props. Everything sits on a table: origin at the bottom, meters, front faces +z.
// Shapes follow the CC0 food packs Louis collected (bread, cheese, turkey leg), rebuilt from our own solids
// so they share the toon shading and outlines of everything else.
import { THREE, toon, G, put, group, PAL, ctex, rng } from '../core.js';
import { register, raw } from '../registry.js';
const g0 = () => new THREE.Group();
const INK_W = .005;   // table-sized things need a thinner outline than furniture (default is .016)
const C = { lobster: 0xe2463b, lobsterDark: 0xb8322a, lettuce: 0x7bbf5a, lettuceDark: 0x5e9c55, tomato: 0xe2463b, fry: 0xf5c84a, carton: 0xd93a34, crust: 0xc8853f, crumb: 0xf1dfb4, cheese: 0xf5c84a, meat: 0xb86a3a, bone: 0xf3f3f6, lemon: 0xf7df5a, water: 0xbfe6ff };

register('plate', { inkWidth: INK_W, tags: ['food', 'table', 'restaurant', 'dinner'], aliases: ['dish'], desc: 'White dinner plate. Other food props sit on it.', opts: { r: 'radius (0.14)', color: '' },
  build: ({ r = .14, color = PAL.white } = {}) => { const g = g0(); put(g, G.cyl(r, r * .72, .016, 32), toon(color), { y: .008 }); put(g, G.cyl(r * .7, r * .7, .004, 32), toon(0xe2e2ea), { y: .017, noInk: true }); return g; } });

register('lobster-plate', { inkWidth: INK_W,
  tags: ['food', 'restaurant', 'dinner', 'expensive', 'seafood', 'fancy'], aliases: ['lobster'], desc: 'Whole red lobster on a plate with lettuce and a lemon wedge. The expensive order.',
  opts: { plate: 'false = lobster only' },
  build: ({ plate = true } = {}) => {
    const g = g0(), red = toon(C.lobster), dark = toon(C.lobsterDark), y0 = plate ? .02 : 0;
    if (plate) { g.add(raw('plate', { r: .19 })); for (let i = 0; i < 5; i++) put(g, G.sph(.05, 10, 8), toon(i % 2 ? C.lettuce : C.lettuceDark), { x: -.09 + i * .045, y: .026, z: -.09 + (i % 2) * .02, s: [1.1, .28, .9], noInk: true }); }
    const L = group(g, { y: y0 + .042 });
    put(L, G.cap(.046, .09, 14), red, { rx: Math.PI / 2, z: .03, s: [1.05, 1, .82] });                      // body
    for (let i = 0; i < 4; i++) put(L, G.sph(.042 - i * .005, 14, 10), i % 2 ? dark : red, { z: -.06 - i * .034, y: -i * .004, s: [1, .72, .7] }); // tail segments
    for (const s of [-1, 0, 1]) put(L, G.sph(.03, 12, 8), red, { x: s * .03, z: -.205, y: -.02, s: [.8, .22, 1.3], ry: s * .5 }); // tail fan
    for (const s of [-1, 1]) {
      put(L, G.cyl(.012, .012, .09, 8), red, { x: s * .07, z: .1, rz: Math.PI / 2, ry: -s * .9 });        // arm
      put(L, G.sph(.04, 14, 10), red, { x: s * .105, z: .15, s: [.7, .5, 1.25], ry: -s * .25 });           // big pincer
