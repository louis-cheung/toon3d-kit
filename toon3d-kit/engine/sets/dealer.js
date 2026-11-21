// Rich System Ep 2 (2026-11-14): the car dealership (showroom, salesman desks, service desk, service bay with a lift, the lot outside).
import { THREE, toon, glow, G, put, group, ctex, rng, tileTex, pointLight } from '../core.js';
import { register, raw } from '../registry.js';

// Layout (1 unit = 1 m, floor y 0). Showroom x -7..7, z -5..5, ceiling 4.5. Glass front at z +5 faces the lot (+z).
// Doors centred at x -3.5 (opening x -4.5..-2.5). Turntable at x -2.5, z .5. Desks on the right (x 4.2). Service desk at the back
// left (x -3.5, z -4.2). Wide opening in the back wall (x 1..6.5) into the service bay (z -5..-11) with the lift at x 3.8, z -8.2.
// The lot outside runs z 5..21, the street at z 24, shops across it.
const CH = 4.5, XW = 7, ZF = 5, ZB = -5, BAY = -11.2;
const c01 = (t) => Math.max(0, Math.min(1, t));
const sm = (t) => { const k = c01(t); return k * k * (3 - 2 * k); };
const GOLD = '#e6b84a', TEAL = '#0f5560', NAVY = '#1c2a6a', RED = '#e2463b';

/** Set pieces get no update(sec) from the player, but the player sets rotation.y = sec * .4 on every userData.spin object before each
 *  render. This clock hears that assignment (the Euler change callback) and runs fn(sec) right then, so the set's moving parts are
 *  posed before the frame is drawn, in any frame order (rich.js reads the clock in onBeforeRender, which lags one render behind). */
function timeHook(root, fn) {
  const clock = new THREE.Object3D(); clock.userData.spin = true; root.add(clock); let last = null;
  clock.rotation._onChange(() => { clock.quaternion.setFromEuler(clock.rotation, false); const sec = clock.rotation.y / .4; if (sec !== last) { last = sec; fn(sec); } });
  fn(0);
}
// A row of shop fronts and towers along x, facing +z (copied from rich.js cityRow, which is not exported).
function cityRow(g, z, ry, seed, names, skip = []) {
  const row = group(g, { z, ry }), r = rng(seed), cols = ['#7a6ab8', '#d08a6a', '#4f8fb0', '#c9a24a', '#8a5a9a', '#5aa08a', '#c86a7a'];
  for (let i = 0; i < 9; i++) { const x = -26 + i * 6.5; if (skip.includes(i)) continue;
    const b = raw('building', { w: 6, h: 8 + r() * 10, d: 4, base: cols[(i + seed) % cols.length], seed: seed * 10 + i, lit: .15 }); b.position.set(x, 0, -2.2); row.add(b);
    if (i % 2 === 0) { const s = raw('storefront', { name: names[(i / 2) % names.length] }); s.position.set(x, 0, .1); row.add(s); } }
  return row;
}

// ---------- textures ----------
function floorTex() {   // glossy white tiles, warm grey grout, a navy and gold diamond inlay at every other corner, a soft sheen
  return ctex(512, 512, (x, w) => {
    x.fillStyle = '#f6f4ef'; x.fillRect(0, 0, w, w); const s = w / 2;
    for (let i = 0; i < 2; i++) for (let j = 0; j < 2; j++) { const g = x.createLinearGradient(i * s, j * s, i * s + s, j * s + s); g.addColorStop(0, 'rgba(255,255,255,.9)'); g.addColorStop(.45, 'rgba(232,236,246,.0)'); g.addColorStop(1, 'rgba(214,220,236,.55)'); x.fillStyle = g; x.fillRect(i * s, j * s, s, s); }
    x.strokeStyle = '#cfc6b8'; x.lineWidth = 5; for (let i = 0; i <= 2; i++) { x.beginPath(); x.moveTo(i * s, 0); x.lineTo(i * s, w); x.stroke(); x.beginPath(); x.moveTo(0, i * s); x.lineTo(w, i * s); x.stroke(); }
    const dia = (cx, cy, r, c) => { x.fillStyle = c; x.beginPath(); x.moveTo(cx, cy - r); x.lineTo(cx + r, cy); x.lineTo(cx, cy + r); x.lineTo(cx - r, cy); x.closePath(); x.fill(); };
    for (const [cx, cy] of [[0, 0], [w, 0], [0, w], [w, w], [s, s]]) { dia(cx, cy, 42, '#1c2a6a'); dia(cx, cy, 26, GOLD); dia(cx, cy, 10, '#1c2a6a'); }
    x.fillStyle = 'rgba(255,255,255,.7)'; x.fillRect(30, 40, 120, 8); x.fillRect(s + 30, s + 40, 120, 8);
  }, { repeat: [7, 5], key: 'dealer-floor' });
}
function tealWallTex() {   // deep teal panels with thin gold reveals
  return ctex(512, 512, (x, w, h) => { x.fillStyle = TEAL; x.fillRect(0, 0, w, h);
    for (let i = 0; i < 4; i++) { x.fillStyle = i % 2 ? '#115b67' : '#0e515c'; x.fillRect(i * w / 4 + 6, 0, w / 4 - 12, h); x.fillStyle = '#c9a24a'; x.fillRect(i * w / 4 - 3, 0, 6, h); } }, { key: 'dealer-teal', repeat: [3, 1] });
}
function woodTex() {   // warm vertical wood slats
  return ctex(256, 256, (x, w, h) => { const r = rng(5); for (let i = 0; i < 8; i++) { x.fillStyle = ['#b98552', '#c99360', '#a87444', '#bf8a56'][i % 4]; x.fillRect(i * 32, 0, 32, h);
    x.fillStyle = 'rgba(80,40,20,.35)'; x.fillRect(i * 32, 0, 4, h); x.fillStyle = 'rgba(255,230,190,.18)'; for (let k = 0; k < 3; k++) x.fillRect(i * 32 + 8 + r() * 16, r() * h, 3, 40 + r() * 60); } }, { key: 'dealer-wood', repeat: [6, 1] });
}
function ceilTex() {   // white coffered ceiling, a warm downlight in every coffer
  return ctex(256, 256, (x, w) => { x.fillStyle = '#f4f1ea'; x.fillRect(0, 0, w, w); x.fillStyle = '#e4dccb'; x.fillRect(14, 14, w - 28, w - 28); x.fillStyle = '#efe9dc'; x.fillRect(28, 28, w - 56, w - 56);
    x.fillStyle = '#c9a24a'; x.beginPath(); x.arc(w / 2, w / 2, 30, 0, 7); x.fill(); x.fillStyle = '#fff6d8'; x.beginPath(); x.arc(w / 2, w / 2, 22, 0, 7); x.fill(); }, { repeat: [7, 5], key: 'dealer-ceil' });
}
function textCard(w, h, draw, key) { return ctex(w, h, draw, { key }); }
function bannerTex(top, big, bot, bg, fg, key) {   // a vertical hanging promo banner
  return textCard(320, 640, (x, w, h) => { x.fillStyle = bg; x.fillRect(0, 0, w, h); x.strokeStyle = fg; x.lineWidth = 12; x.strokeRect(16, 16, w - 32, h - 32);
    x.fillStyle = fg; x.textAlign = 'center'; x.textBaseline = 'middle';
    if (top) { x.font = '900 64px Helvetica'; x.fillText(top, w / 2, 120, w - 50); }
    x.font = '900 150px Helvetica'; const lines = big.split('\n'); lines.forEach((l, i) => x.fillText(l, w / 2, h / 2 + (i - (lines.length - 1) / 2) * 150 + 10, w - 40));
    if (bot) { x.font = '900 60px Helvetica'; x.fillText(bot, w / 2, h - 110, w - 50); }
    for (let i = 0; i < 7; i++) { x.fillStyle = fg; x.beginPath(); x.moveTo(i * w / 6, h); x.lineTo(i * w / 6 + w / 12, h - 26); x.lineTo(i * w / 6 + w / 6, h); x.fill(); } }, key);
}
function posterTex(title, sub, sky, carCol, key) {   // a framed car poster: sunset road and a big side-on car
  return textCard(600, 420, (x, w, h) => {
    const g = x.createLinearGradient(0, 0, 0, h); sky.forEach((c, i) => g.addColorStop(i / (sky.length - 1), c)); x.fillStyle = g; x.fillRect(0, 0, w, h);
    x.fillStyle = 'rgba(255,240,200,.85)'; x.beginPath(); x.arc(w * .75, h * .42, 60, 0, 7); x.fill();
    x.fillStyle = '#3a3050'; x.fillRect(0, h * .72, w, h * .28); x.fillStyle = '#f6e6b0'; for (let i = 0; i < 6; i++) x.fillRect(20 + i * 110, h * .84, 60, 8);
    x.fillStyle = carCol; x.beginPath(); x.roundRect(w * .14, h * .55, w * .72, h * .16, 30); x.fill(); x.beginPath(); x.roundRect(w * .3, h * .45, w * .34, h * .14, 34); x.fill();
    x.fillStyle = '#bfe6ff'; x.beginPath(); x.roundRect(w * .34, h * .48, w * .26, h * .08, 14); x.fill();
    x.strokeStyle = '#241726'; x.lineWidth = 7; x.beginPath(); x.roundRect(w * .14, h * .55, w * .72, h * .16, 30); x.stroke();
    for (const cx of [w * .27, w * .73]) { x.fillStyle = '#241726'; x.beginPath(); x.arc(cx, h * .72, 34, 0, 7); x.fill(); x.fillStyle = '#d9dce6'; x.beginPath(); x.arc(cx, h * .72, 16, 0, 7); x.fill(); }
    x.fillStyle = '#ffffff'; x.strokeStyle = '#241726'; x.lineWidth = 10; x.textAlign = 'center'; x.font = '900 70px Helvetica'; x.strokeText(title, w / 2, 80, w - 40); x.fillText(title, w / 2, 80, w - 40);
    x.font = '900 40px Helvetica'; x.fillStyle = GOLD; x.lineWidth = 7; x.strokeText(sub, w / 2, 135, w - 40); x.fillText(sub, w / 2, 135, w - 40);
  }, key);
}
function priceCard(price) {   // the same card as car-showroom's price stand
  return ctex(940, 600, (x, w, h) => { x.fillStyle = '#fbf6ea'; x.fillRect(0, 0, w, h); x.strokeStyle = '#e6c25a'; x.lineWidth = 18; x.strokeRect(14, 14, w - 28, h - 28);
    x.fillStyle = '#2b2230'; x.textAlign = 'center'; x.textBaseline = 'middle'; x.font = 'bold 70px Helvetica'; x.fillText('SPECIAL', w / 2, 130); x.fillStyle = '#d5322c'; x.font = '900 200px Helvetica'; x.fillText(price, w / 2, 340, w - 70); x.fillStyle = '#2b2230'; x.font = 'bold 54px Helvetica'; x.fillText('DRIVE TODAY', w / 2, 500); }, { key: 'price' + price });
}
const signTex = (text, bg, fg, font, w = 1024, h = 256, key) => textCard(w, h, (x) => { if (bg) { x.fillStyle = bg; x.fillRect(0, 0, w, h); } else x.clearRect(0, 0, w, h); x.fillStyle = fg; x.font = font; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText(text, w / 2, h / 2 + 6, w - 40); }, key || 'dsign' + text + bg + fg + w);

// ---------- small furniture (internal) ----------
function plant(parent, x, z, h = 1.4, seed = 1) {
  const p = group(parent, { x, z }), r = rng(seed); put(p, G.cyl(.26, .2, .5, 18), toon(0xf4f1ea), { y: .25 }); put(p, G.cyl(.27, .27, .05, 18), toon(0xc9a24a), { y: .48, noInk: true });
  put(p, G.cyl(.03, .03, h * .5, 6), toon(0x6a4630), { y: .5 + h * .25 });
  const leaf = toon(0x3f9a55), leaf2 = toon(0x5bb865);
  for (let i = 0; i < 7; i++) { const a = i * 2.4 + r(), y = .7 + (i / 7) * h * .75; put(p, G.sph(.18, 10, 8), i % 2 ? leaf : leaf2, { x: Math.cos(a) * .2, y, z: Math.sin(a) * .2, s: [1.4, .5, .8], ry: -a, rz: .5 }); }
  return p;
}
function pendant(parent, x, z, len = 1.1, col = 0x1c2a6a) {   // a hanging spot lamp: cord, a navy and gold cone, a glowing lens
  const p = group(parent, { x, y: CH, z }); put(p, G.cyl(.012, .012, len, 6), toon(0x2a2c38), { y: -len / 2, noInk: true });
  put(p, G.cone(.24, .34, 20), toon(col), { y: -len - .1, rx: Math.PI }); put(p, G.torus(.22, .025, 20), toon(0xe6c25a), { y: -len - .27, rx: Math.PI / 2, noInk: true });
  put(p, G.cyl(.2, .2, .02, 20), glow(0xfff4d6), { y: -len - .27, noInk: true }); return p;
}
function banner(parent, x, z, tex, ry = 0, w = 1.0, h = 2.0) {   // a hanging promo banner on a gold rod, printed on both sides
  const b = group(parent, { x, y: CH - .35, z, ry }); put(b, G.cyl(.025, .025, w + .2, 8), toon(0xe6c25a), { rz: Math.PI / 2 });
  for (const s of [-1, 1]) put(b, G.cyl(.006, .006, .35, 4), toon(0x2a2c38), { x: s * w * .4, y: .17, noInk: true });
  put(b, G.box(w, h, .02), toon(0xffffff), { y: -h / 2 - .02, noInk: true });
  for (const s of [1, -1]) put(b, G.plane(w, h), glow(0xffffff, { map: tex }), { y: -h / 2 - .02, z: s * .012, ry: s > 0 ? 0 : Math.PI, noInk: true });
  return b;
}
function frame(parent, o, tex, w = 1.5, h = 1.05) {   // a framed poster on a wall (faces +z of its group)
  const f = group(parent, o); put(f, G.box(w + .12, h + .12, .05), toon(0xe6c25a)); put(f, G.plane(w, h), glow(0xffffff, { map: tex }), { z: .03, noInk: true }); return f;
}
function priceStand(parent, x, z, ry, price) {
  const st = group(parent, { x, z, ry }), chrome = toon(0xd9dce6);
  put(st, G.cyl(.25, .3, .05, 24), chrome, { y: .025 }); put(st, G.cyl(.025, .025, 1.0, 10), chrome, { y: .5 });
  put(st, G.box(1.0, .66, .04), toon(0x16141c), { y: 1.23 }); put(st, G.plane(.94, .6), glow(0xffffff, { map: priceCard(price) }), { y: 1.23, z: .022, noInk: true });
  return st;
}
function coffeeStation(parent, x, z) {   // on the counter top (y 1.05): machine, cup stacks, a FREE COFFEE sign
  const c = group(parent, { x, y: 1.05, z });
  const m = group(c, { x: .15, z: -.12 }); put(m, G.rbox(.42, .55, .36, .05), toon(0xc8323a), { y: .28 }); put(m, G.box(.3, .08, .2), toon(0x2a2c38), { y: .06, z: .1 });
  put(m, G.plane(.24, .12), glow(0xffffff, { map: signTex('BREW', '#16141c', '#7fe3ff', '900 150px Helvetica', 512, 256) }), { y: .42, z: .185, noInk: true });
  put(m, G.cyl(.05, .04, .1, 14), toon(0xf4f1ea), { y: .15, z: .12 }); put(m, G.cyl(.02, .02, .06, 8), toon(0x2a2c38), { y: .28, z: .14 });
  for (let i = 0; i < 3; i++) for (let k = 0; k < 6; k++) put(c, G.cyl(.045, .035, .09, 12), toon(i === 1 ? 0xe6c25a : 0xf8f6f0), { x: -.18 + i * .0, y: .05 + k * .035, z: .1 - i * .12, noInk: k > 0 });
  put(c, G.cyl(.035, .035, .1, 10), toon(0xe6c25a), { x: -.32, y: .05, z: -.1 });   // a sugar jar
  const sg = group(c, { x: -.05, y: .3, z: .2, rx: -.12 }); put(sg, G.box(.62, .34, .03), toon(0x16141c), {}); put(sg, G.plane(.58, .3), glow(0xffffff, { map: textCard(600, 300, (x, w, h) => { x.fillStyle = '#fbf6ea'; x.fillRect(0, 0, w, h); x.fillStyle = '#c8323a'; x.font = '900 120px Helvetica'; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText('FREE', w / 2, 95); x.fillStyle = '#16141c'; x.font = '900 96px Helvetica'; x.fillText('COFFEE', w / 2, 210); x.strokeStyle = '#e6b84a'; x.lineWidth = 12; x.strokeRect(8, 8, w - 16, h - 16); }, 'freecoffee') }), { z: .017, noInk: true });
  put(sg, G.cyl(.012, .012, .3, 6), toon(0x2a2c38), { y: -.3, noInk: true });
  return c;
}
function keyRack(parent, x, y, z) {   // a board of hooks with coloured key tags, on the back wall
  const k = group(parent, { x, y, z }); put(k, G.box(1.0, .6, .04), toon(0xb98552)); const cols = [0xe2463b, 0xe6c25a, 0x3c7be0, 0x3fae6a, 0xf08a3a];
  for (let i = 0; i < 5; i++) for (let j = 0; j < 2; j++) { const kx = -.38 + i * .19, ky = .14 - j * .3; put(k, G.cyl(.008, .008, .05, 6), toon(0xd9dce6), { x: kx, y: ky, z: .04, rx: Math.PI / 2, noInk: true }); if ((i + j) % 3 !== 2) put(k, G.box(.05, .08, .01), toon(cols[(i + j * 2) % 5]), { x: kx, y: ky - .07, z: .05, noInk: true }); }
  return k;
}
function bell(parent, x, y, z) { const b = group(parent, { x, y, z }); put(b, G.cyl(.06, .07, .02, 16), toon(0x2a2c38), { y: .01 }); put(b, new THREE.SphereGeometry(.055, 16, 10, 0, Math.PI * 2, 0, Math.PI / 2), toon(0xe6c25a), { y: .02 }); put(b, G.sph(.012, 8, 6), toon(0xe6c25a), { y: .085, noInk: true }); return b; }
function toolChest(parent, x, z, ry = 0, col = 0xd8322e) {
  const t = group(parent, { x, z, ry }); put(t, G.rbox(1.1, 1.0, .5, .04), toon(col), { y: .55 }); for (let i = 0; i < 5; i++) put(t, G.box(.95, .03, .02), toon(0xd9dce6), { y: .25 + i * .16, z: .26, noInk: true });
  put(t, G.rbox(1.1, .4, .5, .04), toon(col), { y: 1.28 }); put(t, G.box(.6, .03, .02), toon(0xd9dce6), { y: 1.28, z: .26, noInk: true });
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) put(t, G.cyl(.05, .05, .04, 10), toon(0x2a2c38), { x: sx * .45, y: .05, z: sz * .18, rx: Math.PI / 2 });
  return t;
}
function tyreStack(parent, x, z, n = 4) { const t = group(parent, { x, z }); for (let i = 0; i < n; i++) { put(t, G.torus(.3, .13, 18), toon(0x2a2836), { y: .13 + i * .26, rx: Math.PI / 2, rz: i * .4 }); put(t, G.cyl(.18, .18, .2, 14), toon(0x9aa0b0), { y: .13 + i * .26, noInk: true }); } return t; }
function hoseReel(parent, x, y, z) { const h = group(parent, { x, y, z }); put(h, G.cyl(.3, .3, .1, 20), toon(0x2a2c38), { rx: Math.PI / 2 }); for (let i = 0; i < 3; i++) put(h, G.torus(.2 + i * .045, .025, 18), toon(0xf0b43a), { z: .06 }); return h; }
function pennants(parent, a, b, sag, n, seed) {   // a string of triangle flags from a to b with a sag; returns the flags (for the flutter)
  const r = rng(seed), cols = [0xe2463b, 0xf5c84a, 0x3c7be0, 0x3fbf6a, 0xffffff, 0xf08a3a], flags = [];
  const pt = (t) => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t - sag * 4 * t * (1 - t), a[2] + (b[2] - a[2]) * t];
  const curve = new THREE.CatmullRomCurve3(Array.from({ length: 9 }, (_, i) => new THREE.Vector3(...pt(i / 8))));
  put(parent, new THREE.TubeGeometry(curve, 24, .012, 4), toon(0x2a2c38), { noInk: true, shadow: false });
  const tri = new THREE.Shape(); tri.moveTo(-.16, 0); tri.lineTo(.16, 0); tri.lineTo(0, -.38); tri.closePath(); const tg = new THREE.ShapeGeometry(tri);
  const dir = Math.atan2(b[2] - a[2], b[0] - a[0]);
  for (let i = 1; i < n; i++) { const p = pt(i / n), f = group(parent, { x: p[0], y: p[1], z: p[2], ry: -dir });
    put(f, tg, new THREE.MeshToonMaterial({ color: cols[(i + seed) % cols.length], side: THREE.DoubleSide }), { noInk: true, shadow: false }); flags.push([f, r() * 6]); }
  return flags;
}
function balloons(parent, x, y, z, seed = 1) {   // a bunch of balloons on strings; returns its group (bobbed by the time hook)
  const b = group(parent, { x, y, z }), r = rng(seed), cols = [0xe2463b, 0xf5c84a, 0x3c7be0, 0xffffff, 0xe2463b];
  for (let i = 0; i < 5; i++) { const a = i * 1.26 + r(), bx = Math.cos(a) * .32, bz = Math.sin(a) * .32, by = 1.4 + r() * .5;
    put(b, G.sph(.26, 18, 14), toon(cols[i]), { x: bx, y: by, z: bz, s: [1, 1.18, 1] }); put(b, G.cone(.04, .07, 8), toon(cols[i]), { x: bx, y: by - .32, z: bz, rx: Math.PI, noInk: true });
    const c = new THREE.LineCurve3(new THREE.Vector3(0, 0, 0), new THREE.Vector3(bx, by - .35, bz)); put(b, new THREE.TubeGeometry(c, 1, .006, 3), toon(0xf4f1ea), { noInk: true, shadow: false }); }
  return b;
}
function tubeMan(parent, x, z) {   // the inflatable dancing tube man: a stack of segments that wave with time, two flailing arms, a drawn face
  const t = group(parent, { x, z }); put(t, G.cyl(.55, .65, .5, 18), toon(0x2a2c38), { y: .25 }); put(t, G.cyl(.4, .4, .06, 18), toon(0xe6c25a), { y: .51, noInk: true });
  const segs = [], cols = [0xe2463b, 0xf5c84a]; let parentSeg = group(t, { y: .5 });
  for (let i = 0; i < 6; i++) { const s = group(parentSeg, { y: i ? .62 : 0 }); put(s, G.cyl(.3, .32, .66, 16), toon(cols[i % 2]), { y: .33 }); segs.push(s); parentSeg = s; }
  const head = group(parentSeg, { y: .66 }); put(head, G.sph(.36, 18, 14), toon(0xe2463b), { y: .25, s: [1, 1.15, 1] });
  put(head, G.plane(.5, .34), glow(0xffffff, { transparent: true, map: textCard(256, 180, (x, w, h) => { x.clearRect(0, 0, w, h); x.fillStyle = '#fff'; for (const ex of [70, 186]) { x.beginPath(); x.arc(ex, 60, 30, 0, 7); x.fill(); } x.fillStyle = '#16141c'; for (const ex of [76, 180]) { x.beginPath(); x.arc(ex, 64, 14, 0, 7); x.fill(); }
    x.fillStyle = '#16141c'; x.beginPath(); x.ellipse(w / 2, 135, 52, 34, 0, 0, Math.PI); x.fill(); x.fillStyle = '#ff8fa8'; x.beginPath(); x.ellipse(w / 2, 150, 26, 14, 0, 0, Math.PI); x.fill(); }, 'tubeface') }), { y: .26, z: .37, noInk: true });
  put(head, G.cone(.16, .4, 10), toon(0xf5c84a), { y: .68, rz: .4 });
  const arms = []; for (const s of [-1, 1]) { const a = group(segs[3], { x: s * .3, y: .4 }); put(a, G.cyl(.12, .1, 1.3, 12), toon(0xf5c84a), { x: s * .62, rz: s * Math.PI / 2 }); arms.push([a, s]); }
  return { t, segs, head, arms };
}

register('car-dealership', {
  kind: 'set', tags: ['dealership', 'cars', 'showroom', 'interior', 'day', 'rich-system'], aliases: ['dealership-interior', 'hale-motors'],
  desc: 'HALE MOTORS, a bright sunny car dealership. Showroom x -7..7, z -5..5, floor y 0, ceiling 4.5: white diamond-tile floor, a deep teal feature wall with gold HALE MOTORS letters on the back wall, wood-slat right wall, pendant spot lamps and a lit cove, hanging banners (0% APR, SALE, DRIVE TODAY), framed car posters, plants. The front wall at z 5 is floor-to-ceiling glass facing +z onto the lot, with glass double doors centred at x -3.5 (opening x -4.5..-2.5, PUSH and hours decals; they swing inward). A turntable (radius 2.2, top y .18, lit gold rim) at x -2.5, z .5 slowly spins a blue sports-car, a $148,000 price stand beside it. Salesman desks on the right: the hero desk at x 4.2, z 1.4 and a second at x 4.2, z -1.8 (sales-desk props with chairs: salesman on the +x side facing -x, guest on -x). Service desk at the back left (counter x -5.4..-1.6, z -4.2, customers stand on its +z side) with a SERVICE sign, a FREE COFFEE station on its right end, a bell and a key rack. A wide opening in the back wall (x 1..6.5) shows the service bay (z -5..-11, concrete, tool chests, tyres, hose reels, yellow safety stripes) with an empty two-post lift at x 3.8, z -8.2. Outside: a sunny lot with stall lines, two rows of parked cars, light poles, pennant bunting, a tall HALE MOTORS pylon, balloons, a dancing tube man, trees, a street at z 24 with shops and a skyline. The open lane in front of the doors runs along x at z 10.5 (spot lot = Tyler\'s car for the tow, the tow truck leaves along +x through lotExit). A seated bean of height h in the hero salesman chair (cushion top y .5): spot deskChair [4.98, .242, 1.4] is for h .86, in general y = .5 - .3 h (Brad, .88: .236), with ry -PI/2 (deskChairRy). A standing customer at deskGuest faces the salesman with ry PI/2. Cameras: main, door, doorIn, desk, deskRev, monitor (side view, the hero monitor big and readable), service, lift, glass, lot, turntable. Extra spots: serviceDesk (staff behind the service counter, ry 0), back / back2 (behind the desks), desk2, center. Tyler\'s car on the lift: sports-car at spot liftCar with ry PI/2 (nose toward -z, its crumpled rear toward the showroom); liftCar.y follows liftY. Mood keys: default, desk, service, lift, lot (gentle, day-lit).',
  opts: { doorOpen: '[t0, t1]: both glass doors swing inward over that span (seconds into the shot), or a number 0..1 held (0 = shut, default)', turntableCar: 'colour of the car on the turntable (electric blue 0x1f6fff); false = empty platform',
    heroDesk: 'false = no hero desk and no chairs at x 4.2, z 1.4 (the episode places its own sales-desk, e.g. with chairs: true and a timed flag)', liftY: 'height of the lift pads (1.6); the liftCar spot follows it', spin: 'turntable speed in rad per second (.22)',
    heroScreen: "the hero desk's monitor: 'cars' (default) | 'loan' | 'off'", heroName: "the hero desk nameplate ('BRAD')", tubeMan: 'false = no dancing tube man on the lot' },
  build: ({ doorOpen = 0, turntableCar = 0x1f6fff, heroDesk = true, liftY = 1.6, spin = .22, heroScreen = 'cars', heroName = 'BRAD', tubeMan: withTube = true } = {}) => {
    const g = new THREE.Group(), shell = toon(0xf2efe8), mull = toon(0x1e2440), gold = toon(0xe6c25a), white = toon(0xf8f6f0);
    const anim = [];   // functions of sec, run by the time hook
    // ---- ground: the lot asphalt everywhere, the showroom floor on top
    put(g, G.plane(260, 260), toon(0x4a4d5e), { rx: -Math.PI / 2, y: -.01, z: 20, noInk: true, shadow: false }).receiveShadow = true;
    put(g, G.box(XW * 2, .06, ZF - ZB), toon(0xffffff, { map: floorTex() }), { y: -.03 + .0, noInk: true, shadow: false }).receiveShadow = true;
    // ---- building shell (walls cast no shadow, so the sun through the glass and over the roof lights the room)
    const wallBox = (w, h, d, o) => put(g, G.box(w, h, d), shell, { ...o, shadow: false });
    wallBox(.2, CH, ZF - ZB, { x: -XW - .1, y: CH / 2 }); wallBox(.2, CH, ZF - ZB, { x: XW + .1, y: CH / 2 });
    wallBox(1 + XW, CH, .2, { x: (-XW + 1) / 2, y: CH / 2, z: ZB - .1 }); wallBox(.5, CH, .2, { x: 6.75, y: CH / 2, z: ZB - .1 }); wallBox(5.5, CH - 3.3, .2, { x: 3.75, y: 3.3 + (CH - 3.3) / 2, z: ZB - .1 });
    put(g, G.box(XW * 2 + .4, .25, ZF - ZB + .4), shell, { y: CH + .12, shadow: false, noInk: true });   // roof slab
    for (const [x, z] of [[-4, -2], [-1.2, -2.6], [3.5, 0]]) { put(g, G.rbox(1.6, .8, 1.2, .06), toon(0xc9ccd6), { x, y: CH + .65, z }); put(g, G.cyl(.4, .4, .06, 16), toon(0x8d93a6), { x, y: CH + 1.07, z, noInk: true }); }
    for (const [x, z, w, d] of [[0, ZB - .1, XW * 2 + .4, .2], [-XW - .1, 0, .2, ZF - ZB + .2], [XW + .1, 0, .2, ZF - ZB + .2]]) put(g, G.box(w, .4, d), toon(0x1c2a6a), { x, y: CH + .45, z, shadow: false });
    put(g, G.plane(XW * 2, ZF - ZB), toon(0xffffff, { map: ceilTex() }), { y: CH - .01, rx: Math.PI / 2, noInk: true, shadow: false });   // ceiling: coffers with downlights
    // lit cove: a dropped soffit round the room with a warm glowing strip under its lip
    for (const [x, z, w, d] of [[0, ZF - .45, XW * 2, .9], [-XW + .45, 0, .9, ZF - ZB], [XW - .45, 0, .9, ZF - ZB]]) { put(g, G.box(w, .35, d), white, { x, y: CH - .18, z, shadow: false, noInk: true }); }
    for (const [x, z, w, d] of [[0, ZF - .92, XW * 2 - 1.8, .06], [-XW + .92, 0, .06, ZF - ZB - 1.8], [XW - .92, 0, .06, ZF - ZB - 1.8]]) put(g, G.box(w, .08, d), glow(0xffe4a8), { x, y: CH - .32, z, noInk: true, shadow: false });
    // ---- the front: glass wall with dark mullions, a navy fascia with the gold name, the double doors at x -3.5
    const glassM = glow(0xcfeaff, { transparent: true, opacity: .14, depthWrite: false });
    for (const [x0, x1] of [[-XW, -4.5], [-2.5, XW]]) put(g, G.box(x1 - x0, CH, .03), glassM, { x: (x0 + x1) / 2, y: CH / 2, z: ZF, noInk: true, shadow: false });
    put(g, G.box(2, CH - 2.45, .03), glassM, { x: -3.5, y: 2.45 + (CH - 2.45) / 2, z: ZF, noInk: true, shadow: false });   // transom over the doors
    for (const x of [-7, -5.6, -4.55, -2.45, -1.0, .6, 2.2, 3.8, 5.4, 7]) put(g, G.box(.12, CH, .14), mull, { x, y: CH / 2, z: ZF });
    for (const y of [.06, 2.45, CH - .06]) { put(g, G.box(2.5, .1, .14), mull, { x: -5.75, y, z: ZF }); put(g, G.box(9.5, .1, .14), mull, { x: 2.25, y, z: ZF }); }
    put(g, G.box(2.1, .12, .14), mull, { x: -3.5, y: 2.45, z: ZF });
    put(g, G.box(XW * 2 + .4, 1.2, .3), toon(0x1c2a6a), { y: CH + .55, z: ZF + .12, shadow: false });   // fascia (front .07 proud of the roof slab)
    put(g, G.plane(7.6, 1.0), glow(0xffffff, { transparent: true, map: signTex('HALE MOTORS', null, GOLD, '900 190px Georgia, serif', 1600, 220, 'hale-fascia') }), { y: CH + .55, z: ZF + .28, noInk: true });
    for (const x of [-6.2, 6.2]) put(g, G.sph(.18, 14, 10), glow(0xffd36a), { x, y: CH + .55, z: ZF + .29, noInk: true });
    // gold door-frame accent: a strip above the doors outside
    put(g, G.box(2.3, .1, .06), gold, { x: -3.5, y: 2.56, z: ZF + .09 });
    const doors = [];
    for (const s of [-1, 1]) {   // s -1: left leaf hinged at x -4.5; s 1: right leaf hinged at x -2.5. Each leaf 1 m wide, 2.4 high.
      const hinge = group(g, { x: -3.5 + s * 1.0, z: ZF }), leaf = group(hinge, { x: -s * .5 });
      for (const x of [-.46, .46]) put(leaf, G.box(.08, 2.38, .06), mull, { x, y: 1.2 }); put(leaf, G.box(1.0, .1, .06), mull, { y: 2.35 }); put(leaf, G.box(1.0, .2, .06), mull, { y: .1 }); put(leaf, G.box(.84, 2.1, .02), glow(0xd8f0ff, { transparent: true, opacity: .2, depthWrite: false }), { y: 1.25, noInk: true });
      put(leaf, G.cyl(.022, .022, .9, 8), toon(0xd9dce6), { x: -s * .38, y: 1.15, z: .09 }); for (const y of [.75, 1.55]) put(leaf, G.box(.03, .03, .08), toon(0xd9dce6), { x: -s * .38, y, z: .05, noInk: true });   // pull bar on the outside
      put(leaf, G.cyl(.022, .022, .9, 8), toon(0xd9dce6), { x: -s * .38, y: 1.15, z: -.09 });
      put(leaf, G.plane(.6, .22), glow(0xffffff, { transparent: true, map: signTex('PUSH', null, '#ffffff', '900 170px Helvetica', 512, 200, 'push') }), { y: 1.48, z: .036, x: s * .02, noInk: true });
      if (s < 0) put(leaf, G.plane(.62, .5), glow(0xffffff, { transparent: true, map: textCard(512, 400, (x, w, h) => { x.clearRect(0, 0, w, h); x.fillStyle = 'rgba(255,255,255,.95)'; x.textAlign = 'center'; x.font = '900 86px Helvetica'; x.fillText('OPEN', w / 2, 90); x.font = 'bold 54px Helvetica'; x.fillText('MON TO SAT', w / 2, 190); x.fillText('9AM TO 8PM', w / 2, 270); x.fillStyle = GOLD; x.fillRect(80, 320, w - 160, 10); }, 'hours') }), { y: .82, z: .036, noInk: true });
      else put(leaf, G.plane(.5, .5), glow(0xffffff, { transparent: true, map: textCard(400, 400, (x, w, h) => { x.clearRect(0, 0, w, h); x.fillStyle = GOLD; x.font = '900 220px Georgia, serif'; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText('H', w / 2, h / 2 + 10); x.strokeStyle = GOLD; x.lineWidth = 14; x.beginPath(); x.arc(w / 2, h / 2, 170, 0, 7); x.stroke(); }, 'hmono') }), { y: .82, z: .036, noInk: true });
      doors.push([hinge, s]);
    }
    const doorK = (sec) => Array.isArray(doorOpen) ? sm((sec - doorOpen[0]) / Math.max(.01, doorOpen[1] - doorOpen[0])) : c01(+doorOpen || 0);
    anim.push((sec) => { const k = doorK(sec), over = Array.isArray(doorOpen) && sec > doorOpen[1] ? .04 * Math.sin((sec - doorOpen[1]) * 14) * Math.exp(-(sec - doorOpen[1]) * 4) : 0;
      for (const [h, s] of doors) h.rotation.y = -s * (1.45 * k + over); });   // inward (toward -z)
    for (const x of [-5.15, -1.85]) { const pl = group(g, { x, y: .14, z: ZF + .65 }); put(pl, G.rbox(.7, .55, .7, .06), toon(0x1c2a6a), { y: .27 }); put(pl, G.box(.72, .06, .72), gold, { y: .5, noInk: true });
      for (let i = 0; i < 5; i++) { const a = i * 1.26; put(pl, G.sph(.22, 10, 8), toon(i % 2 ? 0x3f9a55 : 0x5bb865), { x: Math.cos(a) * .16, y: .75 + (i % 2) * .15, z: Math.sin(a) * .16, s: [1, 1.3, 1] }); } }
    // welcome mat inside the doors
    put(g, G.box(2.2, .02, 1.2), toon(0xffffff, { map: textCard(512, 280, (x, w, h) => { x.fillStyle = '#1c2a6a'; x.fillRect(0, 0, w, h); x.strokeStyle = GOLD; x.lineWidth = 12; x.strokeRect(16, 16, w - 32, h - 32); x.fillStyle = GOLD; x.font = '900 80px Georgia, serif'; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText('WELCOME', w / 2, h / 2 + 4); }, 'dmat') }), { x: -3.5, y: .01, z: 4.0, noInk: true });
    // ---- interior walls: teal feature wall at the back (left of the opening), wood slats on the right wall, teal on the left wall
    put(g, G.plane(1 + XW, CH), toon(0xffffff, { map: tealWallTex() }), { x: (-XW + 1) / 2, y: CH / 2, z: ZB + .005, noInk: true, shadow: false });
    const wt = woodTex(); put(g, G.plane(ZF - ZB, CH), toon(0xffffff, { map: wt }), { x: XW - .005, y: CH / 2, ry: -Math.PI / 2, noInk: true, shadow: false });
    const tl = tealWallTex().clone(); tl.needsUpdate = true; tl.repeat.set(3, 1); put(g, G.plane(ZF - ZB, CH), toon(0xffffff, { map: tl }), { x: -XW + .005, y: CH / 2, ry: Math.PI / 2, noInk: true, shadow: false });
    for (const [x, ry, len] of [[-XW + .02, Math.PI / 2, ZF - ZB], [XW - .02, -Math.PI / 2, ZF - ZB]]) put(g, G.box(len, .14, .04), toon(0xf8f6f0), { x, y: .07, ry, noInk: true });   // skirting
    put(g, G.box(8, .14, .04), toon(0xf8f6f0), { x: -3, y: .07, z: ZB + .02, noInk: true });
    // the big gold name on the feature wall, over the service desk
    put(g, G.plane(6.6, .9), glow(0xffffff, { transparent: true, map: signTex('HALE MOTORS', null, GOLD, '900 180px Georgia, serif', 1600, 220, 'hale-wall') }), { x: -3.0, y: 3.62, z: ZB + .02, noInk: true });
    put(g, G.box(6.4, .04, .04), gold, { x: -3.0, y: 3.1, z: ZB + .03, noInk: true });
    put(g, G.box(5.5, .7, .08), toon(0xc8232a), { x: 3.75, y: 3.85, z: ZB + .06 });
    put(g, G.plane(5.3, .6), glow(0xffffff, { map: signTex('SERVICE CENTER', '#c8232a', '#ffffff', '900 150px Helvetica', 1600, 180, 'svc-center') }), { x: 3.75, y: 3.85, z: ZB + .105, noInk: true });
    for (const x of [1.0, 6.5]) put(g, G.box(.14, 3.3, .3), toon(0x1c2a6a), { x, y: 1.65, z: ZB - .05 });   // the opening's navy jambs
    // posters on the side walls
    frame(g, { x: -XW + .04, y: 2.1, z: -1.0, ry: Math.PI / 2 }, posterTex('THE ALL NEW GT', 'ZERO DOWN', ['#ff8a5a', '#ffcf7a', '#ffe9b0'], '#1f6fff', 'post1'), 1.7, 1.2);
    frame(g, { x: -XW + .04, y: 2.1, z: 2.6, ry: Math.PI / 2 }, posterTex('TRADE IN TODAY', 'WE BUY ANY CAR', ['#5ea8ef', '#a8d6ff', '#e8f5ff'], '#e2463b', 'post2'), 1.7, 1.2);
    frame(g, { x: XW - .04, y: 2.35, z: 3.4, ry: -Math.PI / 2 }, posterTex('SUMMER DEALS', '0% FOR 60 MONTHS', ['#7a4ab8', '#e06a9a', '#ffc08a'], '#f5c84a', 'post3'), 1.6, 1.12);
    frame(g, { x: XW - .04, y: 2.35, z: -3.4, ry: -Math.PI / 2 }, posterTex('EMPLOYEE OF THE MONTH', 'BRAD', ['#2f8f86', '#7fd0b0', '#e6f6e0'], '#16141c', 'post4'), 1.3, .9);
    // hanging promo banners and pendant lamps
    banner(g, -.2, 2.6, bannerTex('ONLY', '0%\nAPR', 'FINANCING', '#e2463b', '#ffffff', 'b-apr'), .25);
    banner(g, 1.9, -.4, bannerTex('BIG', 'SALE', 'THIS WEEK', '#f5c84a', '#c8232a', 'b-sale'), .25);
    banner(g, -5.4, -1.6, bannerTex('', 'DRIVE\nTODAY', 'HALE MOTORS', '#1c2a6a', '#e6b84a', 'b-drive'), .7);
    banner(g, 5.3, 3.6, bannerTex('ONLY', '0%\nAPR', 'FINANCING', '#e2463b', '#ffffff', 'b-apr'), -.4, .8, 1.6);
    for (const [x, z, len] of [[-3.6, 1.5, 1.2], [-1.4, -.4, 1.2], [-3.2, -.9, 1.4], [4.2, 1.4, 1.5], [4.2, -1.8, 1.5], [-3.5, -3.9, 1.3], [-1.6, 2.6, 1.0], [1.4, 1.0, 1.1]]) pendant(g, x, z, len);
    // plants in the corners and by the doors
    plant(g, -6.4, 4.3, 1.5, 3); plant(g, .1, 4.4, 1.2, 5); plant(g, 6.4, 4.3, 1.5, 7); plant(g, 6.4, -4.4, 1.3, 9); plant(g, -.4, -4.4, 1.3, 11);
    // ---- turntable with the hero car, the price stand
    const TT = group(g, { x: -2.5, z: .5 });
    put(TT, G.cyl(2.2, 2.25, .16, 64), toon(0x1c2a6a), { y: .08 });
    put(TT, G.torus(2.22, .035, 64), glow(0xffd36a), { y: .12, rx: Math.PI / 2, noInk: true, shadow: false });
    const plat = group(TT, { y: .16 });
    put(plat, new THREE.CircleGeometry(2.05, 64), toon(0xffffff, { map: textCard(512, 512, (x, w) => { x.fillStyle = '#f2f0f6'; x.fillRect(0, 0, w, w); for (let i = 8; i > 0; i--) { x.fillStyle = i % 2 ? '#e8e4ee' : '#f6f4fa'; x.beginPath(); x.arc(w / 2, w / 2, i * 30, 0, 7); x.fill(); }
      x.strokeStyle = GOLD; x.lineWidth = 6; for (let i = 0; i < 12; i++) { const a = i * Math.PI / 6; x.beginPath(); x.moveTo(w / 2 + Math.cos(a) * 200, w / 2 + Math.sin(a) * 200); x.lineTo(w / 2 + Math.cos(a) * 250, w / 2 + Math.sin(a) * 250); x.stroke(); } }, 'ttop') }), { y: .005, rx: -Math.PI / 2, noInk: true, shadow: false }).receiveShadow = true;
    const sparks = [];
    if (turntableCar !== false) { const car = raw('sports-car', { color: turntableCar, plate: 'HALE 1' }); car.position.y = .005; plat.add(car);
      const stripe = toon(0xf8f6f0); for (const z of [-.16, .16]) { put(car, G.box(1.5, .015, .14), stripe, { x: 1.25, y: .815, z, rz: -.08, noInk: true }); put(car, G.box(1.1, .015, .14), stripe, { x: -1.5, y: .835, z, rz: .05, noInk: true }); }
      
      const star = new THREE.Shape(); for (let i = 0; i < 8; i++) { const r = i % 2 ? .05 : .2, a = i * Math.PI / 4; i ? star.lineTo(Math.cos(a) * r, Math.sin(a) * r) : star.moveTo(r, 0); }
      const sg = new THREE.ShapeGeometry(star), sgm = glow(0xffffff, { side: THREE.DoubleSide });
      for (const [x, y, z, ph] of [[1.6, .95, .5, 0], [-.9, 1.0, -.7, 1.7], [.4, 1.25, 0, 3.1], [-1.9, .75, .7, 4.4]]) { const st = group(car, { x, y, z }); for (const ry of [0, Math.PI / 2]) put(st, sg, sgm, { ry, noInk: true, shadow: false }); sparks.push([st, ph]); } }
    anim.push((sec) => { plat.rotation.y = .6 + sec * spin; for (const [st, ph] of sparks) { const k = Math.max(0, Math.sin(sec * 3.2 + ph)); st.scale.setScalar(.05 + k * k); st.rotation.y = sec * 1.5 + ph; } });
    priceStand(g, -.15, 2.0, -.55, '$148,000');
    // stanchions: gold posts with a red rope in front of the turntable
    for (const [x, z] of [[-4.9, 3.1], [-3.4, 3.4], [-1.6, 3.3], [-.1, 2.9]]) { put(g, G.cyl(.18, .2, .04, 16), gold, { x, y: .02, z }); put(g, G.cyl(.03, .03, .9, 10), gold, { x, y: .47, z }); put(g, G.sph(.06, 10, 8), gold, { x, y: .95, z }); }
    for (const [a, b] of [[[-4.9, 3.1], [-3.4, 3.4]], [[-1.6, 3.3], [-.1, 2.9]]]) { const c = new THREE.CatmullRomCurve3([new THREE.Vector3(a[0], .88, a[1]), new THREE.Vector3((a[0] + b[0]) / 2, .62, (a[1] + b[1]) / 2), new THREE.Vector3(b[0], .88, b[1])]); put(g, new THREE.TubeGeometry(c, 12, .03, 6), toon(0xc8232a)); }
    // ---- salesman desks on the right (salesman on +x facing -x)
    if (heroDesk) { const d = raw('sales-desk', { name: heroName, screen: heroScreen, chairs: true }); d.position.set(4.2, 0, 1.4); g.add(d); }
    { const d = raw('sales-desk', { name: 'KAREN', screen: 'cars', chairs: true, seed: 2 }); d.position.set(4.2, 0, -1.8); g.add(d); }
    // a low rug under the desk area
    put(g, G.box(3.2, .015, 6.4), toon(0xffffff, { map: textCard(256, 512, (x, w, h) => { x.fillStyle = '#26337e'; x.fillRect(0, 0, w, h); x.strokeStyle = GOLD; x.lineWidth = 8; x.strokeRect(12, 12, w - 24, h - 24); x.strokeStyle = 'rgba(230,184,74,.5)'; x.lineWidth = 4; for (let i = 0; i < 6; i++) { x.beginPath(); x.moveTo(30, 60 + i * 80); x.lineTo(w - 30, 100 + i * 80); x.stroke(); } }, 'drug') }), { x: 4.5, y: .008, z: -.2, noInk: true });
    // a water cooler between the desks and a brochure rack on the wall
    { const w = group(g, { x: 6.55, z: -.3 }); put(w, G.rbox(.4, 1.0, .4, .05), white, { y: .5 }); put(w, G.cyl(.16, .16, .4, 16), glow(0x9fd8ff, { transparent: true, opacity: .8 }), { y: 1.2, noInk: true }); put(w, G.box(.06, .06, .04), toon(0x3c7be0), { y: .8, x: -.21, noInk: true }); }
    { const br = group(g, { x: XW - .06, y: 1.3, z: .65, ry: -Math.PI / 2 }); put(br, G.box(.9, .7, .1), toon(0xd9dce6)); const cols = ['#e2463b', '#1f6fff', '#f5c84a', '#2f8f86', '#7a4ab8', '#f08a3a'];
      for (let i = 0; i < 6; i++) put(br, G.box(.24, .3, .02), toon(new THREE.Color(cols[i]).getHex()), { x: -.29 + (i % 3) * .29, y: i < 3 ? .16 : -.18, z: .07, rx: -.15 }); }
    // ---- service desk at the back left
    const SV = group(g, { x: -3.5, z: -4.2 });
    put(SV, G.rbox(3.8, 1.0, .7, .05), white, { y: .5 }); put(SV, G.box(3.82, .08, .76), toon(0xb98552), { y: 1.03 });
    put(SV, G.box(3.6, .18, .02), toon(0x0f5560), { y: .55, z: .36, noInk: true }); put(SV, G.box(3.6, .05, .02), gold, { y: .7, z: .36, noInk: true });
