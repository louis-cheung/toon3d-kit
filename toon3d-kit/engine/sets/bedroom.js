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
  } else {
    x.fillStyle = '#2a4fa8'; x.beginPath(); x.moveTo(0, 700); for (let i = 0; i <= 8; i++) x.lineTo(i * 130, 640 + (i % 2) * 70); x.lineTo(w, h); x.lineTo(0, h); x.fill();
    for (let i = 0; i < 7; i++) { x.fillStyle = r() < .6 ? '#ffd27a' : '#bfe6ff'; x.fillRect(60 + i * 140, 760 + (i % 2) * 40, 34, 40); }
    x.fillStyle = '#1e3a8a'; x.fillRect(820, 520, 30, 500); for (const [a, b, c] of [[835, 470, 120], [760, 540, 90], [910, 540, 90], [835, 380, 80]]) { x.beginPath(); x.arc(a, b, c, 0, 7); x.fill(); }
  }
}, { key: 'bview' + kind });
function posterTex(kind) {
  return ctex(256, 352, (x, w, h) => {
    x.lineWidth = 8; x.strokeStyle = '#241726';
    if (kind === 'mountain') { x.fillStyle = '#f2b279'; x.fillRect(0, 0, w, h); x.fillStyle = '#ffe9b0'; x.beginPath(); x.arc(180, 96, 38, 0, 7); x.fill(); x.stroke();
      x.fillStyle = '#5b6fc4'; x.beginPath(); x.moveTo(-10, 290); x.lineTo(96, 110); x.lineTo(170, 230); x.lineTo(214, 170); x.lineTo(270, 290); x.fill(); x.stroke();
      x.fillStyle = '#ffffff'; x.beginPath(); x.moveTo(96, 110); x.lineTo(66, 162); x.lineTo(92, 150); x.lineTo(112, 170); x.lineTo(128, 162); x.fill(); x.stroke(); x.fillStyle = '#3f7a45'; x.fillRect(0, 284, w, 70); }
    if (kind === 'band') { x.fillStyle = '#2d2a5c'; x.fillRect(0, 0, w, h); x.fillStyle = '#f5c84a'; x.beginPath(); x.moveTo(128, 0); x.lineTo(20, 260); x.lineTo(236, 260); x.fill();
      for (const [cx, col] of [[70, '#e2553b'], [128, '#f3f3f6'], [186, '#7fe3ff']]) { x.fillStyle = col; x.beginPath(); x.arc(cx, 150, 26, 0, 7); x.fill(); x.stroke(); x.beginPath(); x.moveTo(cx, 176); x.lineTo(cx, 236); x.moveTo(cx - 24, 200); x.lineTo(cx + 24, 196); x.moveTo(cx, 236); x.lineTo(cx - 16, 270); x.moveTo(cx, 236); x.lineTo(cx + 16, 270); x.stroke(); }
      x.fillStyle = '#f3f3f6'; x.font = `900 46px ${F}`; x.textAlign = 'center'; x.fillText('THE NAPS', w / 2, 326); }
    if (kind === 'ball') { x.fillStyle = '#3f8f8a'; x.fillRect(0, 0, w, h); x.fillStyle = '#ef8a3c'; x.beginPath(); x.arc(128, 150, 86, 0, 7); x.fill(); x.stroke();
      x.beginPath(); x.moveTo(42, 150); x.lineTo(214, 150); x.moveTo(128, 64); x.lineTo(128, 236); x.stroke(); x.beginPath(); x.arc(40, 150, 70, -.9, .9); x.stroke(); x.beginPath(); x.arc(216, 150, 70, Math.PI - .9, Math.PI + .9); x.stroke();
      x.fillStyle = '#f1e7cf'; x.font = `900 50px ${F}`; x.textAlign = 'center'; x.fillText('HOOPS', w / 2, 318); }
    if (kind === 'sun') { const g = x.createLinearGradient(0, 0, 0, h); g.addColorStop(0, '#ff7a8a'); g.addColorStop(1, '#ffc26a'); x.fillStyle = g; x.fillRect(0, 0, w, h);
      x.fillStyle = '#fff2c4'; x.beginPath(); x.arc(128, 170, 70, Math.PI, 0); x.fill(); x.fillStyle = '#ff7a8a'; for (let i = 0; i < 4; i++) x.fillRect(50, 120 + i * 16, 160, 6);
      x.fillStyle = '#4fbfc4'; x.fillRect(0, 170, w, 90); x.fillStyle = '#fff2c4'; for (let i = 0; i < 5; i++) x.fillRect(40 + i * 12, 190 + i * 14, 176 - i * 24, 5);
      x.fillStyle = '#7a2a5a'; x.font = `900 44px ${F}`; x.textAlign = 'center'; x.fillText('GOOD VIBES', w / 2, 318); }
    if (kind === 'heart') { x.fillStyle = '#ffe4ec'; x.fillRect(0, 0, w, h); x.fillStyle = '#ef4f7a'; x.beginPath(); x.moveTo(128, 250); x.bezierCurveTo(-10, 160, 40, 40, 128, 110); x.bezierCurveTo(216, 40, 266, 160, 128, 250); x.fill(); x.stroke();
      x.fillStyle = '#ffffff'; x.beginPath(); x.ellipse(84, 118, 16, 10, -.6, 0, 7); x.fill(); x.fillStyle = '#7a2a5a'; x.font = `900 46px ${F}`; x.textAlign = 'center'; x.fillText('XOXO', w / 2, 314); }
    if (kind === 'flower') { x.fillStyle = '#4f7ad8'; x.fillRect(0, 0, w, h); for (const [cx, cy, col] of [[80, 110, '#ffd166'], [170, 170, '#f26b8a'], [100, 240, '#fff1dc']]) { x.fillStyle = col; for (let k = 0; k < 6; k++) { const a = k / 6 * Math.PI * 2; x.beginPath(); x.arc(cx + Math.cos(a) * 26, cy + Math.sin(a) * 26, 20, 0, 7); x.fill(); x.stroke(); } x.fillStyle = '#ef8a3c'; x.beginPath(); x.arc(cx, cy, 16, 0, 7); x.fill(); x.stroke(); }
      x.fillStyle = '#fff1dc'; x.font = `900 46px ${F}`; x.textAlign = 'center'; x.fillText('BLOOM', w / 2, 324); }
    x.lineWidth = 12; x.strokeStyle = '#f1e7cf'; x.strokeRect(6, 6, w - 12, h - 12);
  }, { key: 'bposter' + kind });
}
/** Little instant photo: bean faces, a beach, a sunset (stuck on Mia's mirror and her photo string). */
function photoTex(k) {
  return ctex(128, 150, (x, w, h) => {
    x.fillStyle = '#fbf7ee'; x.fillRect(0, 0, w, h);
    const sc = [['#7fd0f0', '#ffd166'], ['#ff9a8a', '#f26b8a'], ['#9fe0a8', '#4fbfc4'], ['#b48ae0', '#ffd166'], ['#ffc26a', '#ef6f5a']][k % 5];
    const g = x.createLinearGradient(0, 10, 0, 118); g.addColorStop(0, sc[0]); g.addColorStop(1, sc[1]); x.fillStyle = g; x.fillRect(10, 10, 108, 108);
    x.strokeStyle = '#241726'; x.lineWidth = 4;
    const faces = k % 3 === 2 ? 1 : 2; for (let i = 0; i < faces; i++) { const cx = faces === 1 ? 64 : 44 + i * 40, cy = 70; x.fillStyle = '#f6f6f8'; x.beginPath(); x.arc(cx, cy, 18, 0, 7); x.fill(); x.stroke();
      x.fillStyle = '#241726'; x.beginPath(); x.arc(cx - 6, cy - 3, 2.5, 0, 7); x.arc(cx + 6, cy - 3, 2.5, 0, 7); x.fill(); x.beginPath(); x.arc(cx, cy + 3, 7, .2, Math.PI - .2); x.stroke();
      x.fillStyle = i ? '#4a2a1a' : '#7a4a2a'; x.beginPath(); x.arc(cx, cy - 8, 18, Math.PI, 0); x.fill(); x.fillStyle = i ? '#e2463b' : '#4fbfc4'; x.fillRect(cx - 14, cy + 18, 28, 30); }
  }, { key: 'bphoto' + k });
}
const poolTex = () => ctex(256, 256, (x, W) => { const r = x.createRadialGradient(W / 2, W / 2, 0, W / 2, W / 2, W / 2); r.addColorStop(0, 'rgba(255,190,110,.85)'); r.addColorStop(.4, 'rgba(255,160,80,.35)'); r.addColorStop(1, 'rgba(255,150,70,0)'); x.fillStyle = r; x.fillRect(0, 0, W, W); }, { key: 'bpool' });
/** Four soft window panes of moonlight, laid on the floor or bed. */
const moonPatchTex = () => ctex(256, 256, (x, W) => { x.filter = 'blur(6px)'; x.fillStyle = 'rgba(200,215,255,.9)'; for (const [a, b] of [[24, 24], [134, 24], [24, 134], [134, 134]]) x.fillRect(a, b, 98, 98); }, { key: 'bmoonpatch' });
const mirrorTex = () => ctex(256, 384, (x, w, h) => { const g = x.createLinearGradient(0, 0, w, h); g.addColorStop(0, '#cfeaff'); g.addColorStop(.5, '#9cc8f2'); g.addColorStop(1, '#7aa6e0'); x.fillStyle = g; x.fillRect(0, 0, w, h);
  x.fillStyle = 'rgba(255,255,255,.55)'; x.beginPath(); x.moveTo(40, 0); x.lineTo(100, 0); x.lineTo(10, 140); x.lineTo(-50, 140); x.fill(); x.beginPath(); x.moveTo(140, 0); x.lineTo(160, 0); x.lineTo(60, 160); x.lineTo(40, 160); x.fill(); }, { key: 'bmirror' });

// ---------------- pieces (all take m = 1 or -1 so Mia's room is Leo's mirrored, text never mirrored) ----------------
const poster = (g, kind, x, y, z, rz = 0, ry = 0, s = 1) => { const p = group(g, { x, y, z, rz, ry }); put(p, G.box(.5 * s, .69 * s, .025), toon(0x2a2233)); put(p, G.plane(.46 * s, .65 * s), toon(0xffffff, { map: posterTex(kind) }), { z: .014, noInk: true });
  for (const sx of [-1, 1]) put(p, G.sph(.013 * s + .004, 8, 6), toon(0xe2463b), { x: sx * (.2 * s), y: .3 * s, z: .03, noInk: true }); return p; };
/** Bed, origin at the middle of the headboard on the floor, running toward +z (length L). */
function bed(P) {
  const b = new THREE.Group(), wood = toon(P.wood), woodD = toon(P.woodD), L = 2.28;
  put(b, G.box(1.56, .28, L), wood, { y: .2, z: L / 2 }); put(b, G.rbox(1.5, .16, L - .06, .06), toon(0xdfe2f2), { y: .36, z: L / 2 });
  put(b, G.rbox(1.62, 1.28, .09, .05), woodD, { y: .64 }); for (let i = 0; i < 5; i++) put(b, G.box(.2, .7, .03), wood, { x: -.56 + i * .28, y: .86, z: .055 });
  for (const [px, pr] of [[-.38, .12], [.38, -.1]]) put(b, G.rbox(.62, .2, .4, .09), toon(P.pillow), { x: px, y: .58, z: .32, rx: -.5, ry: pr });
  const dm = toon(0xffffff, { map: P.duvet });
  put(b, G.box(1.58, .1, 1.45), dm, { y: .44, z: L - .75, rz: .012 }); put(b, G.box(.05, .34, 1.45), dm, { x: -.79, y: .3, z: L - .75 }); put(b, G.box(.05, .34, 1.45), dm, { x: .79, y: .3, z: L - .75 });
  for (const [lx, lz, ls] of [[-.5, 1.88, 1], [.52, 1.58, 1.2], [.1, 2.03, .8], [-.45, 1.13, .9]]) put(b, G.sph(.2, 16, 10), dm, { x: lx, y: .46, z: lz, s: [1.5 * ls, .3, 1.1 * ls] });
  put(b, G.box(1.58, .07, .3), toon(P.sheet), { y: .47, z: .78, rx: .06 });   // folded-back sheet edge
  put(b, G.rbox(1.62, .52, .08, .04), woodD, { y: .52, z: L }); for (let i = 0; i < 5; i++) put(b, G.box(.2, .3, .03), wood, { x: -.56 + i * .28, y: .55, z: L + .05 });
  for (const s of [-1, 1]) { put(b, G.cyl(.055, .06, 1.02, 14), woodD, { x: s * .8, y: .51, z: L }); put(b, G.sph(.085, 16, 12), wood, { x: s * .8, y: 1.08, z: L }); }
  b.userData.L = L; return b;
}
/** Window in a wall, frame + view + curtains on a rod. Window spans x x0..x1, y y0..y1 in the wall plane at z (room side +z). */
function windowUnit(g, P, x0, x1, y0, y1, z) {
  const fm = toon(P.frame), cx = (x0 + x1) / 2, cy = (y0 + y1) / 2;
  put(g, G.box(x1 - x0 + .2, .09, .38), fm, { x: cx, y: y0 - .03, z: z + .03 }); put(g, G.box(x1 - x0 + .12, .08, .3), fm, { x: cx, y: y1 + .02, z: z - .1 });
  for (const x of [x0, cx, x1]) put(g, G.box(.07, y1 - y0, .3), fm, { x, y: cy, z: z - .12 }); put(g, G.box(x1 - x0, .06, .28), fm, { x: cx, y: cy + .1, z: z - .12 });
  put(g, G.plane(3.0, 3.0), glow(0xffffff, { map: viewTex(P.view) }), { x: cx, y: cy + .3, z: z - 1.1, noInk: true, shadow: false });
  put(g, G.cyl(.02, .02, x1 - x0 + .7, 8), toon(0x2a2233), { x: cx, y: y1 + .2, z: z + .12, rz: Math.PI / 2 });
  for (const s of [-1, 1]) put(g, G.sph(.04, 10, 8), toon(PAL.gold), { x: cx + s * (x1 - x0 + .7) / 2, y: y1 + .2, z: z + .12 });
  for (const [ex, dir] of [[x0 - .12, -1], [x1 + .12, 1]]) for (let i = 0; i < 3; i++) put(g, G.cyl(.065, .08, 1.75, 10), toon(i % 2 ? P.curtain[0] : P.curtain[1]), { x: ex + dir * i * .07 - dir * .07, y: y1 + .2 - .875, z: z + .12 + (i % 2) * .03, shadow: false });
  for (const ex of [x0 - .12, x1 + .12]) put(g, G.torus(.1, .022, 12), toon(PAL.gold), { x: ex, y: y0 + .1, z: z + .2 });   // tie-backs
  // the moonlight itself is a real shadowed patch (sun through the hole); this cool sheen on the sill sells it
  put(g, G.plane(x1 - x0, .3), additive(moonPatchTex(), .35, 0xbfd0ff), { x: cx, y: y0 + .025, z: z + .16, rx: -Math.PI / 2, noInk: true, shadow: false });
}
function stringLights(g, from, to, sag, n, colors, z, halo = true) {
  let prev = null; const hm = additive(poolTex(), .16);
  for (let i = 0; i < n; i++) { const t = i / (n - 1), x = from[0] + (to[0] - from[0]) * t, y = from[1] + (to[1] - from[1]) * t - Math.sin(t * Math.PI) * sag + (i % 2) * .015;
    put(g, G.sph(.036, 12, 8), glow(colors[i % colors.length]), { x, y, z, noInk: true, shadow: false });
    if (halo && i % 2 === 0) put(g, G.plane(.38, .38), hm, { x, y, z: z - .03, noInk: true, shadow: false });
    if (prev) rod(g, [prev[0], prev[1] + .03, z], [x, y + .03, z], .006, toon(0x12163c), { noInk: true, shadow: false }); prev = [x, y]; }
}
function nightstand(g, P, x, z, lampOn) {
  const nt = group(g, { x, z }), wood = toon(P.wood), woodD = toon(P.woodD);
  put(nt, G.rbox(.5, .56, .44, .03), wood, { y: .28 }); put(nt, G.box(.4, .17, .02), woodD, { y: .4, z: .225 }); put(nt, G.box(.4, .17, .02), woodD, { y: .18, z: .225 });
  for (const y of [.4, .18]) put(nt, G.sph(.025, 10, 8), toon(PAL.gold), { y, z: .245 });
  put(nt, G.cyl(.075, .09, .04, 16), toon(0x2a2233), { x: -.1 * P.m, y: .58, z: -.05 }); put(nt, G.cyl(.016, .016, .3, 8), toon(0x2a2233), { x: -.1 * P.m, y: .74, z: -.05 });
  put(nt, G.cyl(.1, .17, .22, 20), lampOn ? glow(P.shade) : toon(0xb89a6a), { x: -.1 * P.m, y: .98, z: -.05 });
  if (lampOn) put(nt, G.plane(1.0, 1.0), additive(poolTex(), .45), { x: -.02 * P.m, y: .565, z: 0, rx: -Math.PI / 2, noInk: true, shadow: false });
  return nt;
}
/** Shell: floor, ceiling, four walls with a window hole in the back wall, trim. Returns the window rectangle. */
function shell(g, P, W, H, ZB, ZF, win) {
  const fl = put(g, G.plane(W, ZF - ZB), toon(0xffffff, { map: boardTex(P.boards, P.seam) }), { rx: -Math.PI / 2, z: (ZB + ZF) / 2, noInk: true, shadow: false }); fl.receiveShadow = true;
  put(g, G.box(W, .1, ZF - ZB), toon(P.ceiling), { y: H + .05, z: (ZB + ZF) / 2, shadow: false });
