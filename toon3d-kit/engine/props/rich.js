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


