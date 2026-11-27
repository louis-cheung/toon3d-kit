// Rich System props (Ep 1, 2026-11-12): the red convertible, the city bus (outside), the farebox, a traffic light,
// the car showroom, a cane, and the SYSTEM panel (blue glass HUD with a gold reward row, refs 08 and 09).
// Everything that changes over a shot is a pure function of time: update(sec), so frames render in any order.
import { THREE, toon, glow, G, put, group, ctex, rng } from '../core.js';
import { register, find } from '../registry.js';
const g0 = () => new THREE.Group();
const c01 = (t) => Math.max(0, Math.min(1, t));
const sm = (t) => { const k = c01(t); return k * k * (3 - 2 * k); };
const INKC = '#241726';
/** The entry of a [{at, ...}] timeline that applies at sec (later entries win), merged over base. */
const stateAt = (base, steps, sec) => { let st = { ...base }; for (const e of (steps || []).slice().sort((a, b) => a.at - b.at)) if (sec >= e.at) st = { ...st, ...e }; return st; };
/** A canvas texture redrawn only when key(sec) changes. */
function liveTex(w, h, draw, key) {
  const cv = document.createElement('canvas'); cv.width = w; cv.height = h; const x = cv.getContext('2d');
  const t = new THREE.CanvasTexture(cv); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8; let last = null;
  const update = (sec) => { const k = key(sec); if (k === last) return; last = k; x.setTransform(1, 0, 0, 1, 0, 0); x.clearRect(0, 0, w, h); x.lineCap = x.lineJoin = 'round'; draw(x, w, h, sec); t.needsUpdate = true; };
  update(0); return { tex: t, update };
}


// ---------- the red car's door (v2, 2026-11-12): one builder for the door on the car, the torn-off door prop and the door on the bus ----------
// The door is a group whose origin is the hinge (its front edge, +x end); the panel runs back along -x for 1.5 m, outside face +z.
// crumple 0..1 dents it: vertices pushed in by a fixed noise, the back corner folded, so it reads as a wreck at any size.
function hash3(x, y, z) { const v = Math.sin(x * 127.1 + y * 311.7 + z * 74.7) * 43758.5453; return v - Math.floor(v); }
function carDoor(color = 0xd8322e, crumple = 0) {
  const d = g0(), body = toon(color), dark = toon(0x2a2430), chrome = toon(0xd9dce6), L = 1.5;
  const geo = new THREE.BoxGeometry(L, .5, .07, 14, 6, 1); geo.translate(-L / 2, 0, 0);
  if (crumple > 0) { const p = geo.attributes.position;
    for (let i = 0; i < p.count; i++) { const x = p.getX(i), y = p.getY(i), z = p.getZ(i), u = -x / L;
      const n = hash3(Math.round(x * 9), Math.round(y * 12), 0) - .5;
      p.setZ(i, z - crumple * (.07 * n + .16 * Math.sin(u * Math.PI) * (.6 + .4 * Math.cos(y * 9)) + .2 * Math.max(0, u - .7) ** 1.2));
      p.setY(i, y * (1 - crumple * .1 * Math.sin(u * Math.PI)) - crumple * .12 * Math.max(0, u - .6) * (y + .25)); }
    geo.computeVertexNormals(); }
  put(d, geo, body, { y: 0 });
  put(d, G.rbox(1.6, .14, .14, .06), body, { x: -L / 2 - .05, y: .27 - crumple * .03, rz: crumple * .06 });   // the top rail
  put(d, G.box(.16, .035, .03), chrome, { x: -L + .32, y: .12, z: .05, noInk: true }); put(d, G.box(.12, .02, .01), dark, { x: -L + .32, y: .12, z: .066, noInk: true });   // handle
  put(d, G.box(.03, .5, .006), dark, { x: -.02, z: .037, noInk: true });   // seam at the hinge end
  const mir = group(d, { x: -.12, y: .36, z: .07 }); put(mir, G.cyl(.015, .015, .1, 8), dark, { y: -.03, z: .04, rx: 1.2 }); put(mir, G.rbox(.16, .1, .06, .02), body, { y: .02, z: .1 });
  put(mir, G.plane(.12, .07), glow(0xbfe0ff), { y: .02, z: .07, ry: Math.PI, noInk: true });
  return d;
}
/** Torn hinge: jagged grey metal shards and a dangling cable, for the front edge of a ripped-off door (on the car or on the door). */
function tornHinge(parent, x, z, s = 1) {
  const metal = toon(0xb8bcc8), dark = toon(0x3a3440);
  for (const [y, len, a] of [[.18, .14, .5], [.02, .11, -.3], [-.14, .16, .2]]) { put(parent, G.cone(.035, len, 4), metal, { x: x - .02, y, z: z + s * .03, rz: Math.PI / 2 + a, ry: s * .3 }); put(parent, G.box(.06, .05, .03), dark, { x: x + .01, y, z }); }
