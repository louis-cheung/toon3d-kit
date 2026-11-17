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
      put(L, G.sph(.022, 10, 8), dark, { x: s * .078, z: .165, s: [.6, .45, 1.3], ry: s * .2 });           // small pincer
      for (let k = 0; k < 3; k++) put(L, G.cyl(.006, .006, .07, 6), dark, { x: s * .06, z: .04 - k * .03, y: -.014, rz: s * 1.1, noInk: true }); // legs
      put(L, G.sph(.011, 8, 6), toon(PAL.ink), { x: s * .022, y: .04, z: .108, noInk: true });              // eyes
      put(L, G.cyl(.003, .003, .16, 5), dark, { x: s * .05, y: .04, z: .17, rx: Math.PI / 2 - .35, rz: -s * .35, noInk: true }); // antennae
    }
    if (plate) put(g, G.sph(.036, 12, 8), toon(C.lemon), { x: .12, y: .035, z: -.06, s: [1, .55, .6], ry: .6 });
    return g;
  },
});

register('salad-bowl', { inkWidth: INK_W,
  tags: ['food', 'restaurant', 'dinner', 'cheap', 'healthy'], aliases: ['salad'], desc: 'Small bowl of salad. The cheap order.', opts: { seed: 'leaf layout' },
  build: ({ seed = 2 } = {}) => {
    const g = g0(), r = rng(seed); put(g, G.cyl(.105, .06, .065, 28), toon(PAL.white), { y: .0325 });
    for (let i = 0; i < 9; i++) { const a = i / 9 * Math.PI * 2 + r(), d = .02 + r() * .045; put(g, new THREE.IcosahedronGeometry(.034, 1), toon(i % 3 ? C.lettuce : C.lettuceDark), { x: Math.cos(a) * d, z: Math.sin(a) * d, y: .068 + r() * .014, s: [1.25, .5, 1], ry: a, noInk: true }); }
    for (let i = 0; i < 3; i++) { const a = i * 2.1 + .4; put(g, G.sph(.017, 10, 8), toon(C.tomato), { x: Math.cos(a) * .05, z: Math.sin(a) * .05, y: .084, noInk: true }); }
    return g;
  },
});

register('fries', { inkWidth: INK_W,
  tags: ['food', 'restaurant', 'fast-food', 'snack', 'share'], aliases: ['french-fries', 'chips'], desc: 'Red carton of fries. "For the table."', opts: { n: 'how many fries (12)' },
  build: ({ n = 12, seed = 4 } = {}) => {
    const g = g0(), r = rng(seed); put(g, G.cyl(.062, .042, .1, 4), toon(C.carton), { y: .05, ry: Math.PI / 4, s: [1, 1, .62] });
    for (let i = 0; i < n; i++) put(g, G.box(.013, .1, .013), toon(C.fry), { x: (r() - .5) * .07, z: (r() - .5) * .03, y: .12 + r() * .025, rz: (r() - .5) * .5, rx: (r() - .5) * .3, noInk: true });
    return g;
  },
});

register('loose-fries', { inkWidth: INK_W,
  tags: ['food', 'restaurant', 'fries'], desc: 'Countable fries on a plate or in a hand.',
  opts: { n: 'number of fries', plate: 'false for a handful' },
  build: ({ n = 4, plate = true } = {}) => {
    const g = g0();
    if (plate) g.add(raw('plate', { r: .12 }));
    for (let i = 0; i < n; i++) {
      put(g, G.box(.017, .016, .115), toon(C.fry),
        { x: (i - (n - 1) / 2) * .033, y: plate ? .034 : .005, ry: (i - 1.5) * .1 });
    }
    return g;
  },
});

register('water-glass', { inkWidth: INK_W, tags: ['food', 'drink', 'restaurant', 'cheap', 'tap-water'], aliases: ['glass', 'water'], desc: 'Glass of tap water.', opts: { fill: '0 to 1 (0.7)' },
  build: ({ fill = .7 } = {}) => { const g = g0(); put(g, G.cyl(.036, .03, .12, 20), toon(0xe8f6ff, { transparent: true, opacity: .45 }), { y: .06 });
    put(g, G.cyl(.032, .028, .11 * fill, 20), toon(C.water, { transparent: true, opacity: .8 }), { y: .008 + .055 * fill, noInk: true }); return g; } });

register('receipt', { inkWidth: INK_W,
  tags: ['money', 'restaurant', 'bill', 'check', 'paper'], aliases: ['bill', 'check'], desc: 'Restaurant bill: a paper slip with item lines and a total. Lies flat; rotate it up for a close-up.',
  opts: { total: "text on the total line ('$330')", lines: 'number of item lines (6)' },
  build: ({ total = '$330', lines = 6 } = {}) => {
    const g = g0(), w = .11, d = .2;
    const tex = ctex(256, 464, (x) => { x.fillStyle = '#fbf9f2'; x.fillRect(0, 0, 256, 464); x.fillStyle = '#2b2230'; x.font = 'bold 30px Helvetica'; x.textAlign = 'center'; x.fillText('THE CHECK', 128, 48);
      x.fillStyle = '#9a96a6'; for (let i = 0; i < lines; i++) { x.fillRect(28, 84 + i * 40, 120, 12); x.fillRect(186, 84 + i * 40, 42, 12); }
      x.fillStyle = '#2b2230'; x.fillRect(28, 330, 200, 5); x.font = 'bold 30px Helvetica'; x.textAlign = 'left'; x.fillText('TOTAL', 28, 372); x.textAlign = 'center'; x.fillStyle = '#e2463b'; x.font = 'bold 84px Helvetica'; x.fillText(total, 128, 442); }, { key: 'receipt2:' + total + lines });
    put(g, G.box(w + .024, .006, d + .024), toon(0x3a2438), { y: .003 });   // dark check holder under the slip, so it reads on a white tablecloth
    put(g, G.box(w, .004, d), toon(0xfbf9f2), { y: .008 });
    put(g, G.plane(w * .98, d * .98), new THREE.MeshBasicMaterial({ map: tex, toneMapped: false }), { y: .0105, rx: -Math.PI / 2, noInk: true, shadow: false });
    return g;
  },
});

register('bread-loaf', { inkWidth: INK_W, tags: ['food', 'restaurant', 'bakery', 'share'], aliases: ['bread'], desc: 'Split-top bread loaf.', opts: {},
  build: () => { const g = g0(); put(g, G.cap(.06, .13, 14), toon(C.crust), { y: .055, rz: Math.PI / 2, s: [.9, 1, 1] });
    for (let i = -1; i <= 1; i++) put(g, G.box(.012, .012, .09), toon(C.crumb), { x: i * .05, y: .108, ry: .5, noInk: true }); return g; } });

register('cheese-wedge', { inkWidth: INK_W, tags: ['food', 'restaurant', 'share'], aliases: ['cheese'], desc: 'Wedge of yellow cheese with holes.', opts: {},
  build: () => { const g = g0(); put(g, new THREE.CylinderGeometry(.11, .11, .06, 3, 1, false, 0, Math.PI * 2), toon(C.cheese), { y: .03, s: [1, 1, .55] });
    for (const [x, z] of [[.02, .035], [-.03, .028], [.0, .03]]) put(g, G.cyl(.011, .011, .004, 10), toon(0xd9a62e), { x, y: .045 - Math.abs(x) * .4, z: z + .003, rx: Math.PI / 2, noInk: true }); return g; } });

register('turkey-leg', { inkWidth: INK_W, tags: ['food', 'restaurant', 'meat', 'share', 'expensive'], aliases: ['drumstick', 'chicken-leg'], desc: 'Big roasted leg on the bone.', opts: {},
  build: () => { const g = g0(), L = group(g, { y: .06, rz: .25 }); put(L, G.sph(.065, 16, 12), toon(C.meat), { s: [1.25, .9, .9] });
    put(L, G.cyl(.014, .018, .11, 10), toon(C.bone), { x: .12, rz: Math.PI / 2 }); for (const s of [-1, 1]) put(L, G.sph(.02, 10, 8), toon(C.bone), { x: .178, z: s * .014 }); return g; } });
