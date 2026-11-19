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
  const C = ['#f26b8a', '#4fbfc4', '#ffd166', '#fff1dc', '#ef8a5c', '#b48ae0'], r = rng(23), s = w / 4;
  for (let i = 0; i < 4; i++) for (let j = 0; j < 4; j++) { const col = C[(i * 3 + j * 2) % C.length]; x.fillStyle = col; x.fillRect(i * s, j * s, s, s);
    const k = (i + j * 4) % 3, cx = i * s + s / 2, cy = j * s + s / 2; x.fillStyle = 'rgba(255,255,255,.55)';
    if (k === 0) for (let a = 0; a < 3; a++) for (let b = 0; b < 3; b++) { x.beginPath(); x.arc(i * s + 22 + a * 42, j * s + 22 + b * 42, 7, 0, 7); x.fill(); }
    if (k === 1) { x.beginPath(); x.moveTo(cx, cy + 26); x.bezierCurveTo(cx - 44, cy - 6, cx - 22, cy - 40, cx, cy - 14); x.bezierCurveTo(cx + 22, cy - 40, cx + 44, cy - 6, cx, cy + 26); x.fill(); }
    if (k === 2) { x.fillStyle = 'rgba(0,0,0,.12)'; for (let a = 0; a < 4; a++) x.fillRect(i * s, j * s + a * 32 + 8, s, 12); }
    x.setLineDash([10, 8]); x.strokeStyle = 'rgba(255,255,255,.8)'; x.lineWidth = 4; x.strokeRect(i * s + 8, j * s + 8, s - 16, s - 16); x.setLineDash([]); r(); }
}, { key: 'bquilt', repeat: [1.5, 1.5] });
/** What a window looks at. city: moon with a halo, stars, lit buildings across the street (Leo). blue: cool blue night, crescent, rooftops and a tree (Mia). */
const viewTex = (kind) => ctex(1024, 1024, (x, w, h) => {
  const r = rng(kind === 'city' ? 4 : 9), g = x.createLinearGradient(0, 0, 0, h);
  if (kind === 'city') { g.addColorStop(0, '#1a2a8a'); g.addColorStop(.6, '#3a4fc0'); g.addColorStop(1, '#8a6fd0'); } else { g.addColorStop(0, '#1c3a9a'); g.addColorStop(.55, '#3f7ad8'); g.addColorStop(1, '#8fc6f0'); }
  x.fillStyle = g; x.fillRect(0, 0, w, h);
  x.fillStyle = '#f2f4ff'; for (let i = 0; i < 90; i++) { const s = r() < .15 ? 3.2 : 1.8; x.beginPath(); x.arc(r() * w, r() * h * .6, s, 0, 7); x.fill(); }
  const mx = kind === 'city' ? 640 : 360, my = 230, mr = 92;
  const mg = x.createRadialGradient(mx, my, mr * .6, mx, my, mr * 3.2); mg.addColorStop(0, 'rgba(235,240,255,.6)'); mg.addColorStop(1, 'rgba(235,240,255,0)'); x.fillStyle = mg; x.fillRect(0, 0, w, h * .8);
  x.fillStyle = '#fff7da'; x.beginPath(); x.arc(mx, my, mr, 0, 7); x.fill();
  if (kind === 'city') { x.fillStyle = '#e8dcae'; for (const [a, b, c] of [[-26, -22, 20], [30, 28, 14], [6, 38, 9], [-34, 30, 7]]) { x.beginPath(); x.arc(mx + a, my + b, c, 0, 7); x.fill(); } }
  else { x.fillStyle = g; x.beginPath(); x.arc(mx + 40, my - 24, mr * .92, 0, 7); x.fill(); }   // crescent
  if (kind === 'city') {
    const B = [[0, 520, 230, '#22287a'], [200, 600, 200, '#2a3392'], [380, 470, 210, '#1f2672'], [560, 640, 190, '#2d3796'], [720, 540, 304, '#232a80']];
    for (const [bx, by, bw, col] of B) { x.fillStyle = col; x.fillRect(bx, by, bw, h - by); x.fillStyle = '#3a46b0'; x.fillRect(bx, by, bw, 12);
      for (let j = 0; j < 9; j++) for (let i = 0; i < Math.floor(bw / 52); i++) { const lit = r() < .5; x.fillStyle = lit ? (r() < .65 ? '#ffd27a' : r() < .5 ? '#9fe0ff' : '#ff9a7a') : '#1a2066'; x.fillRect(bx + 16 + i * 52, by + 40 + j * 54, 28, 34); } }
    x.fillStyle = '#1a1f66'; x.fillRect(420, 380, 12, 90); x.fillRect(395, 440, 60, 10); x.fillStyle = '#ff5a6a'; x.beginPath(); x.arc(426, 376, 8, 0, 7); x.fill();   // antenna with a red light
    x.fillStyle = '#1a1f66'; x.fillRect(790, 470, 70, 70); x.fillRect(800, 540, 8, 30); x.fillRect(842, 540, 8, 30); x.beginPath(); x.moveTo(782, 470); x.lineTo(825, 440); x.lineTo(868, 470); x.fill();   // water tower
