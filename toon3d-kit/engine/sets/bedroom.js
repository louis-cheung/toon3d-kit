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
      x.fillStyle = '#ffe9a8'; x.beginPath(); x.arc(cx, cy, 4, 0, 7); x.fill();
      x.fillStyle = 'rgba(255,255,255,.22)'; x.beginPath(); x.arc(cx + 30, cy + 30, 3, 0, 7); x.fill(); } }
  x.fillStyle = c; x.fillRect(0, h * .72, w, h * .28); x.fillStyle = 'rgba(0,0,0,.18)'; for (let i = 0; i < 8; i++) x.fillRect(i * 64, h * .74, 5, h * .26);
  x.fillStyle = 'rgba(255,255,255,.2)'; x.fillRect(0, h * .715, w, 10);
}, { key: 'bwall' + a + b + c + motif, repeat: [3, 1] });
/** Floorboards with staggered joints. */
const boardTex = (C, seam) => ctex(512, 512, (x, w) => {
  const r = rng(7);
  for (let i = 0; i < 8; i++) { x.fillStyle = C[i % C.length]; x.fillRect(i * 64, 0, 64, w); x.fillStyle = seam; x.fillRect(i * 64, 0, 5, w); for (let k = 0; k < 2; k++) x.fillRect(i * 64, Math.floor(r() * w), 64, 5);
    x.fillStyle = 'rgba(255,255,255,.07)'; x.fillRect(i * 64 + 22, 0, 3, w); x.fillStyle = 'rgba(0,0,0,.1)'; x.beginPath(); x.ellipse(i * 64 + 40, r() * w, 6, 14, 0, 0, 7); x.fill(); }
}, { key: 'bfloor' + C.join() + seam, repeat: [3, 3] });
const rugTex = () => ctex(512, 512, (x, w) => {
  x.fillStyle = '#c7362c'; x.fillRect(0, 0, w, w); x.strokeStyle = '#f1e2c4'; x.lineWidth = 16; x.strokeRect(34, 34, w - 68, w - 68); x.strokeStyle = '#2f4fb0'; x.lineWidth = 12; x.strokeRect(70, 70, w - 140, w - 140);
  x.fillStyle = '#f1e2c4'; for (let i = 0; i < 4; i++) for (let j = 0; j < 4; j++) { x.save(); x.translate(128 + i * 85, 128 + j * 85); x.rotate(Math.PI / 4); x.fillRect(-17, -17, 34, 34); x.restore(); }
  x.fillStyle = '#2f4fb0'; for (let i = 0; i < 4; i++) for (let j = 0; j < 4; j++) { x.beginPath(); x.arc(128 + i * 85, 128 + j * 85, 8, 0, 7); x.fill(); }
}, { key: 'brug' });
const roundRugTex = () => ctex(512, 512, (x, w) => {
  const c = w / 2; [['#f6b6c8', 250], ['#fff1dc', 205], ['#ef7a9a', 190], ['#fff1dc', 120], ['#7fd0d8', 100], ['#fff1dc', 40]].forEach(([col, r]) => { x.fillStyle = col; x.beginPath(); x.arc(c, c, r, 0, 7); x.fill(); });
  x.fillStyle = '#fff1dc'; for (let i = 0; i < 24; i++) { const a = i / 24 * Math.PI * 2; x.beginPath(); x.arc(c + Math.cos(a) * 155, c + Math.sin(a) * 155, 9, 0, 7); x.fill(); }
  x.strokeStyle = 'rgba(160,60,100,.35)'; x.lineWidth = 3; for (let i = 0; i < 90; i++) { const a = i / 90 * Math.PI * 2; x.beginPath(); x.moveTo(c + Math.cos(a) * 214, c + Math.sin(a) * 214); x.lineTo(c + Math.cos(a) * 248, c + Math.sin(a) * 248); x.stroke(); }
}, { key: 'broundrug' });
const duvetTex = (a, b, c) => ctex(256, 256, (x, w) => { x.fillStyle = a; x.fillRect(0, 0, w, w); x.fillStyle = b; for (let i = 0; i < 4; i++) { x.fillRect(0, i * 64 + 10, w, 16); x.fillRect(i * 64 + 10, 0, 16, w); }
  x.fillStyle = c; for (let i = 0; i < 4; i++) { x.fillRect(0, i * 64 + 44, w, 4); x.fillRect(i * 64 + 44, 0, 4, w); } }, { key: 'bduv' + a + b + c, repeat: [2, 2] });
/** Patchwork quilt: squares of pink, teal, yellow and cream with stitched seams and little motifs. */
const quiltTex = () => ctex(512, 512, (x, w) => {
