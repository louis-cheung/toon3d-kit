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
