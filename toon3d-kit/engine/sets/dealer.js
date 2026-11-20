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
