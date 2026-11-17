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

