// Rich System Ep 2 (2026-11-14): the dealership props (tow truck, sales desk, card terminal).
// Everything that changes over a shot is a pure function of time: update(sec), so frames render in any order.
import { THREE, toon, glow, G, put, group, ctex, rng } from '../core.js';
import { register, find, raw } from '../registry.js';
const g0 = () => new THREE.Group();
const c01 = (t) => Math.max(0, Math.min(1, t));
const sm = (t) => { const k = c01(t); return k * k * (3 - 2 * k); };
const span = (v, sec) => (Array.isArray(v) ? c01((sec - v[0]) / Math.max(.01, v[1] - v[0])) : c01(+v || 0));   // [t0, t1] -> 0..1 over the span, or a held number
const NAVY = '#1c2a6a', GOLD = '#e6b84a', INKC = '#241726';
/** A canvas texture redrawn only when key(sec) changes (same as engine/props/rich.js liveTex). */
function liveTex(w, h, draw, key) {
  const cv = document.createElement('canvas'); cv.width = w; cv.height = h; const x = cv.getContext('2d');
  const t = new THREE.CanvasTexture(cv); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8; let last = null;
  const update = (sec) => { const k = key(sec); if (k === last) return; last = k; x.setTransform(1, 0, 0, 1, 0, 0); x.clearRect(0, 0, w, h); x.lineCap = x.lineJoin = 'round'; draw(x, w, h, sec); t.needsUpdate = true; };
  update(0); return { tex: t, update };
}

// ---------- chairs (used by sales-desk chairs: true) ----------
function officeChair(parent, x, z, ry, seatCol = 0x26337e) {   // swivel chair: five-star base, gas lift, cushion top at y .5, the back on the chair's +x side
  const c = group(parent, { x, z, ry }), dark = toon(0x2e3248), chrome = toon(0xd9dce6), seat = toon(seatCol);
  for (let i = 0; i < 5; i++) { const a = i * Math.PI * 2 / 5 + .3; put(c, G.box(.32, .04, .05), dark, { x: Math.cos(a) * .16, y: .07, z: -Math.sin(a) * .16, ry: a }); put(c, G.sph(.035, 8, 6), dark, { x: Math.cos(a) * .3, y: .035, z: -Math.sin(a) * .3 }); }
  put(c, G.cyl(.03, .03, .32, 10), chrome, { y: .25 }); put(c, G.rbox(.5, .09, .5, .04), seat, { y: .455 });
  put(c, G.box(.05, .34, .06), dark, { x: .25, y: .6 }); put(c, G.rbox(.1, .62, .48, .05), seat, { x: .28, y: .96, rz: -.08 });
  for (const s of [-1, 1]) { put(c, G.box(.04, .2, .04), dark, { x: .05, y: .6, z: s * .25 }); put(c, G.rbox(.3, .05, .07, .02), dark, { x: .02, y: .71, z: s * .25 }); }
  return c;
}
function guestChair(parent, x, z, ry, col = 0xe2463b) {   // modern guest chair on a chrome sled, seat top y .5, the back on the chair's -x side
  const c = group(parent, { x, z, ry }), chrome = toon(0xd9dce6), seat = toon(col);
  for (const s of [-1, 1]) { put(c, G.box(.46, .025, .025), chrome, { y: .015, z: s * .2 }); put(c, G.box(.025, .44, .025), chrome, { x: .2, y: .23, z: s * .2 }); put(c, G.box(.025, .82, .025), chrome, { x: -.22, y: .41, z: s * .2 }); }
  put(c, G.rbox(.46, .08, .46, .04), seat, { y: .46 }); put(c, G.rbox(.07, .42, .46, .04), seat, { x: -.24, y: .74, rz: .1 });
  return c;
}

// ---------- sales desk ----------
function drawLoan(x, w, h, o) {
  x.fillStyle = '#f4f6fb'; x.fillRect(0, 0, w, h);
  x.fillStyle = NAVY; x.fillRect(0, 0, w, 118); x.fillStyle = GOLD; x.fillRect(0, 118, w, 8);
  x.fillStyle = GOLD; x.font = '900 64px Helvetica'; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText('HALE MOTORS ACCOUNTS', w / 2, 62, w - 40);
  x.textAlign = 'left'; x.fillStyle = '#6a7090'; x.font = 'bold 44px Helvetica'; x.fillText('BORROWER', 46, 178);
  x.fillStyle = NAVY; x.font = '900 104px Helvetica'; x.fillText(o.borrower, 46, 258, w - 90);
  x.fillStyle = '#6a7090'; x.font = 'bold 44px Helvetica'; x.fillText('BALANCE', 46, 340);
  x.fillStyle = '#16141c'; x.font = '900 168px Helvetica'; x.fillText(o.balance, 40, 446, w - 70);
