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
