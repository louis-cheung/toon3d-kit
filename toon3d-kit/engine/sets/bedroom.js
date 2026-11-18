// Bedrooms for the Be Honest series: Leo's room, Mia's room (built from the same parts, mirrored and recoloured),
// and both at once as a dollhouse cut in half. Built to the reference look: a pattern or detail on every surface,
// foreground pieces to shoot past, a cold room against one warm practical, the phone as the brightest light,
// and no dead-black corners (every dark area is deep blue or plum with something in it).
import { THREE, toon, glow, G, put, group, PAL, ctex, rng, pointLight } from '../core.js';
import { register, raw } from '../registry.js';

const F = 'Helvetica, Arial, sans-serif';
const up = new THREE.Vector3(0, 1, 0);
/** A thin rod from a to b (wires, strings, rails). */
function rod(parent, a, b, r, mat, o = {}) {
  const A = new THREE.Vector3(...a), B = new THREE.Vector3(...b), d = B.clone().sub(A);
  const m = put(parent, G.cyl(r, r, d.length(), 6), mat, o); m.position.copy(A).add(B).multiplyScalar(.5); m.quaternion.setFromUnitVectors(up, d.normalize()); return m;
}
const additive = (map, opacity = 1, color = 0xffffff) => new THREE.MeshBasicMaterial({ map, color, transparent: true, opacity, depthWrite: false, blending: THREE.AdditiveBlending, toneMapped: false });

// ---------------- textures ----------------
/** Wallpaper over a darker wainscot with a rail. motif: stripe (Leo) | floral (Mia). */
const wallTex = (a, b, c, motif = 'stripe') => ctex(512, 512, (x, w, h) => {
  x.fillStyle = a; x.fillRect(0, 0, w, h);
  if (motif === 'stripe') { x.fillStyle = b; for (let i = 0; i < 16; i++) x.fillRect(i * 32 + 10, 0, 6, h);
    x.fillStyle = 'rgba(190,205,255,.16)'; for (let i = 0; i < 8; i++) for (let j = 0; j < 6; j++) { const cx = i * 64 + 26, cy = j * 64 + (i % 2 ? 32 : 0) + 20; x.beginPath(); x.moveTo(cx, cy - 7); x.lineTo(cx + 5, cy); x.lineTo(cx, cy + 7); x.lineTo(cx - 5, cy); x.fill(); } }
  else { const r = rng(11);
    for (let i = 0; i < 8; i++) for (let j = 0; j < 6; j++) { const cx = i * 64 + (j % 2 ? 32 : 0) + 8, cy = j * 62 + 24;
      x.fillStyle = b; for (let k = 0; k < 5; k++) { const an = k / 5 * Math.PI * 2 + r() * .2; x.beginPath(); x.arc(cx + Math.cos(an) * 8, cy + Math.sin(an) * 8, 6, 0, 7); x.fill(); }
