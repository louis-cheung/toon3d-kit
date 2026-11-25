// Dinner-party and Thanksgiving props (Red Flag Tea, "$40 ring", 2026-11-14): a glossy place setting, the roast turkey,
// pumpkins, a pie, a leaf garland, a HAPPY THANKSGIVING pennant banner, the kids' table with crayon menus and juice boxes.
// Glossy things (china, glass, cutlery, the turkey's glaze) use toonGloss; cloth and paper stay matte toon.
import { THREE, toon, toonGloss, glow, G, put, group, ctex, rng, hex } from '../core.js';
import { register, raw } from '../registry.js';
const g0 = () => new THREE.Group();
const INK_W = .004;
const china = () => toonGloss(0xfbf8f2, { cut: .94, gloss: .8 }), steel = () => toonGloss(0xc9cfdc, { cut: .9, gloss: 1 });
const glass = () => toonGloss(0xe6f2ff, { transparent: true, opacity: .5, cut: .9, gloss: 1.3, depthWrite: false });

register('place-setting', { inkWidth: INK_W,
  tags: ['dinner', 'restaurant', 'table', 'plate', 'cutlery', 'glass', 'wine', 'glossy', 'thanksgiving', 'red-flag-tea'], aliases: ['table-setting', 'cover'],
  desc: 'One place at a dinner table: a glossy china plate, a folded cloth napkin (matte), fork and knife (glossy steel), a stemmed wine glass with wine and a water tumbler (glossy glass). Origin on the table top at the plate centre; the diner sits on the +z side (turn it with ry to face a seat). The china, steel and glass catch a hard white highlight that slides as the camera moves; the napkin stays matte.',
  opts: { napkin: 'napkin colour (deep red)', wine: 'wine colour, or null for an empty glass', water: 'false = no tumbler', food: "null | 'turkey' (a slice of turkey and greens on the plate)", rim: 'plate rim colour (navy)' },
  build: ({ napkin = 0xa8323a, wine = 0x8a1a3a, water = true, food = null, rim = 0x2b3576 } = {}) => {
    const g = g0(), pm = china();
    put(g, G.cyl(.13, .11, .016, 32), pm, { y: .008 }); put(g, G.torus(.112, .006, 40), toonGloss(rim, { cut: .9 }), { y: .017, rx: Math.PI / 2, noInk: true }); put(g, G.cyl(.085, .085, .004, 28), toonGloss(0xf1ece2, { cut: .95 }), { y: .017, noInk: true });   // a coloured rim so the plate reads on a white cloth
    put(g, G.cyl(.012, .012, .002, 6), glow(0xffffff), { x: -.06, y: .019, z: -.05, s: [3.2, 1, 1], ry: .7, noInk: true, shadow: false });   // painted glint on the china
    put(g, G.box(.1, .02, .14), toon(napkin), { x: -.2, y: .01, z: .01, ry: .1 });                                                         // folded napkin
    put(g, G.box(.016, .006, .17), steel(), { x: -.2, y: .024, z: .02, ry: .08 }); for (const d of [-.006, 0, .006]) put(g, G.box(.003, .005, .035), steel(), { x: -.2 + d, y: .025, z: -.075, noInk: true });   // fork on the napkin
    put(g, G.box(.016, .006, .2), steel(), { x: .17, y: .004, z: .02 });                                                                     // knife
    const wg = group(g, { x: .15, z: -.17 }), gm = glass();                                                                                   // wine glass
    put(wg, G.cyl(.035, .042, .006, 18), gm, { y: .003, noInk: true }); put(wg, G.cyl(.006, .006, .09, 8), gm, { y: .05, noInk: true }); put(wg, G.cyl(.052, .032, .1, 22), gm, { y: .145, noInk: true });
    put(wg, G.torus(.052, .0035, 28), glow(0xf4fbff), { y: .195, rx: Math.PI / 2, noInk: true, shadow: false });   // a bright rim reads as glass (no heavy outline on glass)
    if (wine != null) put(wg, G.cyl(.043, .03, .045, 22), toonGloss(hex(wine), { cut: .9 }), { y: .124, noInk: true });
    put(wg, G.box(.006, .05, .004), glow(0xffffff), { x: -.03, y: .16, z: .045, rz: .12, noInk: true, shadow: false });                     // the glass's white streak
    if (water) { const tg = group(g, { x: .26, z: -.08 }); put(tg, G.cyl(.034, .028, .1, 20), glass(), { y: .05, noInk: true }); put(tg, G.torus(.034, .003, 24), glow(0xf4fbff), { y: .1, rx: Math.PI / 2, noInk: true, shadow: false }); put(tg, G.cyl(.03, .026, .07, 20), toon(0xbfe6fb, { transparent: true, opacity: .55 }), { y: .036, noInk: true });
      put(tg, G.box(.005, .05, .004), glow(0xffffff), { x: -.02, y: .06, z: .032, noInk: true, shadow: false }); }
    if (food === 'turkey') { put(g, G.box(.1, .018, .07), toonGloss(0xd8a36a, { cut: .93, gloss: .5 }), { y: .03, z: .01, ry: .3 }); for (let i = 0; i < 5; i++) put(g, G.sph(.018, 8, 6), toon(0x5e9c55), { x: .04 + (i % 3) * .02, y: .03, z: -.03 + (i >> 1) * .02, noInk: true });
      put(g, G.sph(.03, 10, 8), toon(0xf3ead8), { x: -.045, y: .028, z: -.025, s: [1, .6, 1] }); }
    return g;
  } });

register('roast-turkey', { inkWidth: .006,
  tags: ['food', 'thanksgiving', 'turkey', 'feast', 'holiday', 'dinner', 'glossy', 'red-flag-tea'], aliases: ['turkey', 'thanksgiving-turkey'],
  desc: 'The whole roast turkey on a big oval platter with greens, little roast potatoes and lemon slices: glossy golden-brown glaze with a hard highlight, two drumsticks with white paper frills. About 0.6 m long. Origin on the table under the platter centre. steam: true adds two soft rising wisps.',
  opts: { steam: 'true = soft steam wisps (animated)', size: 'scale (1)' },
  build: ({ steam = true, size = 1 } = {}) => {
    const g = g0(), s = group(g, { s: size }), glaze = toonGloss(0x9a4a1e, { cut: .965, gloss: .8 }), glazeL = toonGloss(0xc0702e, { cut: .965, gloss: .6 });
    put(s, G.cyl(.32, .3, .02, 40), china(), { y: .01, s: [1.2, 1, .82] }); put(s, G.cyl(.27, .27, .004, 40), toonGloss(0xe8dfcf, { cut: .95 }), { y: .022, s: [1.2, 1, .82], noInk: true });
    for (let i = 0; i < 12; i++) { const a = i / 12 * Math.PI * 2; put(s, G.sph(.04, 8, 6), toon(i % 3 ? 0x5e9c55 : 0x7bbf5a), { x: Math.cos(a) * .3, y: .03, z: Math.sin(a) * .21, s: [1.2, .5, 1], noInk: true }); }
    for (let i = 0; i < 7; i++) { const a = i / 7 * Math.PI * 2 + .3; put(s, G.sph(.032, 10, 8), toonGloss(0xd9a050, { cut: .92 }), { x: Math.cos(a) * .25, y: .045, z: Math.sin(a) * .17 }); }
    put(s, G.sph(.17, 24, 18), glaze, { y: .14, s: [1.25, .8, 1] });                                   // the body
    put(s, G.sph(.1, 18, 12), glazeL, { y: .2, z: .02, s: [1.3, .55, 1.1], noInk: true });              // lighter breast
    for (const sx of [-1, 1]) { const leg = group(s, { x: sx * .14, y: .12, z: .1, ry: sx * .4 });
      put(leg, G.sph(.075, 16, 12), glaze, { s: [.9, .85, 1.35] }); put(leg, G.cyl(.016, .02, .08, 8), toon(0xf3ead8), { z: .12, rx: Math.PI / 2 });
      put(leg, G.cyl(.03, .02, .04, 10), toon(0xffffff), { z: .17, rx: Math.PI / 2 }); }                 // paper frill
    for (const sx of [-1, 1]) put(s, G.sph(.06, 12, 8), glaze, { x: sx * .2, y: .14, z: -.06, s: [.7, .9, 1.3] });   // wings
    put(s, G.box(.12, .012, .006), glow(0xfff4dc), { x: -.08, y: .25, z: .08, rz: .3, noInk: true, shadow: false });   // glaze streak
    if (steam) { const wisps = []; const t = ctex(64, 256, (x, W, H) => { const gr = x.createLinearGradient(0, H, 0, 0); gr.addColorStop(0, 'rgba(255,255,255,.0)'); gr.addColorStop(.3, 'rgba(255,255,255,.55)'); gr.addColorStop(1, 'rgba(255,255,255,0)'); x.strokeStyle = gr; x.lineWidth = 16; x.lineCap = 'round'; x.beginPath(); x.moveTo(W / 2, H - 10); x.bezierCurveTo(W, H * .7, 0, H * .4, W / 2, 10); x.stroke(); }, { key: 'turkey-steam' });
      for (const dx of [-.06, .07]) { const m = new THREE.Sprite(new THREE.SpriteMaterial({ map: t, transparent: true, depthWrite: false, opacity: .6, toneMapped: false })); m.position.set(dx, .45, 0); m.scale.set(.12, .4, 1); s.add(m); wisps.push(m); }
      g.userData.update = (sec) => wisps.forEach((m, i) => { const k = ((sec * .35 + i * .5) % 1); m.position.y = .4 + k * .18; m.material.opacity = .55 * Math.sin(k * Math.PI); m.material.rotation = Math.sin(sec * 1.2 + i) * .15; }); g.userData.update(0); }
    return g;
  } });

register('pumpkin', { inkWidth: INK_W,
  tags: ['thanksgiving', 'autumn', 'fall', 'harvest', 'decor', 'pumpkin', 'gourd'], aliases: ['gourd', 'squash'],
  desc: 'A ribbed pumpkin with a curly stem and one leaf (or a pale gourd). Origin at the bottom.', opts: { size: 'diameter m (.22)', color: "orange (default), 'white', 'green' or a colour" },
  build: ({ size = .22, color = 0xef8a2c } = {}) => {
    const c = color === 'white' ? 0xf1e6d2 : color === 'green' ? 0x7a9a4a : hex(color), g = g0(), r = size / 2, m = toon(c), md = toon(new THREE.Color(c).multiplyScalar(.82).getHex());
    for (let i = 0; i < 8; i++) { const a = i / 8 * Math.PI * 2; put(g, G.sph(r * .55, 14, 10), i % 2 ? m : md, { x: Math.cos(a) * r * .45, y: r * .75, z: Math.sin(a) * r * .45, s: [1, 1.15, 1] }); }
    put(g, G.cyl(r * .1, r * .14, r * .45, 8), toon(0x5a4a2a), { y: r * 1.55, rz: .25 }); put(g, G.sph(r * .2, 8, 6), toon(0x5e9c55), { x: r * .25, y: r * 1.45, s: [1.4, .3, 1] });
    return g;
  } });

register('harvest-pie', { inkWidth: INK_W, tags: ['food', 'thanksgiving', 'pie', 'dessert', 'autumn'], aliases: ['pumpkin-pie', 'pie'],
  desc: 'A pumpkin pie in a crimped crust with a dollop of cream and one slice missing. Origin at the bottom.', opts: {},
  build: () => { const g = g0(); put(g, new THREE.CylinderGeometry(.14, .12, .04, 32, 1, false, 0, Math.PI * 1.7), toon(0xd9a35a), { y: .02 }); put(g, new THREE.CylinderGeometry(.125, .125, .042, 32, 1, false, 0, Math.PI * 1.7), toonGloss(0xd8762a, { cut: .93 }), { y: .022, noInk: true });
    for (let i = 0; i < 18; i++) { const a = i / 18 * Math.PI * 1.7; put(g, G.sph(.018, 6, 5), toon(0xe7b46a), { x: Math.sin(a) * .135, y: .042, z: Math.cos(a) * .135, noInk: true }); }
    put(g, G.sph(.03, 10, 8), toon(0xfff8ec), { y: .05, s: [1, .6, 1] }); return g; } });

const LEAF_C = ['#e2632a', '#c8402a', '#f0a63a', '#9a3a2a', '#e8c04a'];
function leafTex(c) { return ctex(64, 64, (x, W) => { x.fillStyle = c; x.strokeStyle = '#3a1a10'; x.lineWidth = 3; x.beginPath(); const pts = [[32, 4], [40, 18], [56, 14], [50, 30], [60, 40], [42, 42], [36, 60], [32, 50], [28, 60], [22, 42], [4, 40], [14, 30], [8, 14], [24, 18]]; pts.forEach(([a, b], i) => (i ? x.lineTo(a, b) : x.moveTo(a, b))); x.closePath(); x.fill(); x.stroke(); x.beginPath(); x.moveTo(32, 58); x.lineTo(32, 14); x.stroke(); }, { key: 'leaf' + c }); }
register('leaf-garland', { kind: 'fx', tags: ['thanksgiving', 'autumn', 'fall', 'harvest', 'decor', 'garland', 'leaves'], aliases: ['autumn-garland', 'fall-leaves'],
  desc: 'A sagging garland of flat autumn leaves (orange, red, gold) on a twine, w metres wide, hung on a wall facing +z. With scatter: true it is instead a loose scatter of leaves lying flat (a table runner of leaves, w x d).',
  opts: { w: 'width (3)', sag: 'droop m (.35)', n: 'leaves (34)', scatter: 'true = loose leaves lying flat over w x d', d: 'scatter depth (.5)', seed: '' },
  build: ({ w = 3, sag = .35, n = 34, scatter = false, d = .5, seed = 4 } = {}) => {
    const g = g0(), r = rng(seed);
    if (!scatter) { const pts = []; for (let i = 0; i <= 20; i++) { const t = i / 20; pts.push(new THREE.Vector3((t - .5) * w, -Math.sin(t * Math.PI) * sag, 0)); } put(g, new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 40, .006, 5), toon(0x8a6a3a), { noInk: true }); }
    for (let i = 0; i < n; i++) { const t = (i + .5) / n, m = new THREE.MeshBasicMaterial({ map: leafTex(LEAF_C[i % LEAF_C.length]), transparent: true, alphaTest: .5, side: THREE.DoubleSide, toneMapped: false }), s = .09 + r() * .05;
      if (scatter) put(g, G.plane(s, s), m, { x: (r() - .5) * w, y: .004 + i * .0004, z: (r() - .5) * d, rx: -Math.PI / 2, rz: r() * 6, noInk: true, shadow: false });
      else put(g, G.plane(s * 1.3, s * 1.3), m, { x: (t - .5) * w, y: -Math.sin(t * Math.PI) * sag - .04, z: .01, rz: (r() - .5) * 1.4 + Math.PI, noInk: true, shadow: false }); }
    return g;
  } });

register('pennant-banner', { kind: 'fx', tags: ['thanksgiving', 'party', 'banner', 'bunting', 'decor', 'sign', 'text'], aliases: ['bunting', 'letter-banner'],
  desc: 'A string of triangle pennants with one big letter each (default HAPPY THANKSGIVING), sagging across w metres on a wall facing +z. Colours cycle through autumn tones, or pass colors. Spaces leave a gap. Flat paper, readable at phone size on a wide shot.',
  opts: { text: "'HAPPY THANKSGIVING'", w: 'width (5)', sag: '(.3)', colors: "['#e2632a', '#c8402a', '#f0a63a', '#7a5a2a']", size: 'pennant height (.32)' },
  build: ({ text = 'HAPPY THANKSGIVING', w = 5, sag = .3, colors = ['#e2632a', '#c8402a', '#f0a63a', '#7a5a2a'], size = .32 } = {}) => {
    const g = g0(), ch = [...text], n = ch.length, pts = [];
    for (let i = 0; i <= 24; i++) { const t = i / 24; pts.push(new THREE.Vector3((t - .5) * w, -Math.sin(t * Math.PI) * sag, 0)); }
    put(g, new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 48, .006, 5), toon(0xf3ead2), { noInk: true });
    ch.forEach((c, i) => { if (c === ' ') return; const t = (i + .5) / n, col = colors[i % colors.length];
      const tex = ctex(128, 160, (x, W, H) => { x.fillStyle = col; x.strokeStyle = '#2a1620'; x.lineWidth = 7; x.beginPath(); x.moveTo(6, 6); x.lineTo(W - 6, 6); x.lineTo(W / 2, H - 6); x.closePath(); x.fill(); x.stroke();
        x.fillStyle = '#fff8ec'; x.font = '900 78px Helvetica, Arial'; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText(c, W / 2, 56); }, { key: 'pennant' + c + col });
      put(g, G.plane(size * .8, size), new THREE.MeshBasicMaterial({ map: tex, transparent: true, alphaTest: .4, side: THREE.DoubleSide, toneMapped: false }), { x: (t - .5) * w, y: -Math.sin(t * Math.PI) * sag - size / 2, z: .01, rz: (t - .5) * -.25, noInk: true, shadow: false }); });
