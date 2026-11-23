// Rich System Ep 3 ("Every Lie Pays", 2026-11-14): the restaurant from the street at night. Ethan walks out onto the sidewalk; through the
// big front window behind him, Madison is still in the booth with the check.
import { THREE, toon, glow, G, put, group, ctex, rng, pointLight } from '../core.js';
import { register, raw } from '../registry.js';

function brickTex() {
  return ctex(512, 512, (x, W, H) => { x.fillStyle = '#8a3a34'; x.fillRect(0, 0, W, H); const r = rng(9), bh = 32, bw = 96;
    for (let row = 0; row < H / bh; row++) for (let c = -1; c < W / bw + 1; c++) { const off = (row % 2) * bw / 2, shade = .85 + r() * .3;
      x.fillStyle = `rgb(${Math.round(150 * shade)},${Math.round(62 * shade)},${Math.round(54 * shade)})`; x.fillRect(c * bw + off + 3, row * bh + 3, bw - 6, bh - 6); }
    x.fillStyle = 'rgba(60,20,30,.18)'; for (let i = 0; i < 26; i++) x.fillRect(r() * W, r() * H, 70, 20); }, { key: 'frontBrick', repeat: [5, 2.5] });
}
function sidewalkTex() {
  return ctex(512, 512, (x, W) => { x.fillStyle = '#6a6f88'; x.fillRect(0, 0, W, W); x.strokeStyle = '#4a4e66'; x.lineWidth = 6; for (let i = 0; i <= 4; i++) { x.beginPath(); x.moveTo(i * W / 4, 0); x.lineTo(i * W / 4, W); x.stroke(); x.beginPath(); x.moveTo(0, i * W / 4); x.lineTo(W, i * W / 4); x.stroke(); }
    const r = rng(3); x.fillStyle = 'rgba(255,255,255,.06)'; for (let i = 0; i < 40; i++) { x.beginPath(); x.arc(r() * W, r() * W, 2 + r() * 5, 0, 7); x.fill(); } }, { key: 'frontWalk', repeat: [6, 2] });
}
function roadTex() {
  return ctex(512, 256, (x, W, H) => { x.fillStyle = '#2a2c44'; x.fillRect(0, 0, W, H); x.fillStyle = '#f0d060'; for (let i = 0; i < 4; i++) x.fillRect(i * 128 + 20, H / 2 - 6, 70, 12); const r = rng(5); x.fillStyle = 'rgba(255,255,255,.05)'; for (let i = 0; i < 60; i++) x.fillRect(r() * W, r() * H, 3, 3); }, { key: 'frontRoad', repeat: [4, 1] });
}
function wallpaperTex() {
  return ctex(256, 256, (x, w) => { x.fillStyle = '#e9b98a'; x.fillRect(0, 0, w, w); x.fillStyle = '#d99a6a'; for (let i = 0; i < 4; i++) for (let j = 0; j < 4; j++) { x.save(); x.translate(i * 64 + 32 + (j % 2) * 32, j * 64 + 32); x.rotate(Math.PI / 4); x.fillRect(-12, -12, 24, 24); x.restore(); }
    x.fillStyle = '#c7362c'; for (let i = 0; i < 4; i++) for (let j = 0; j < 4; j++) { x.beginPath(); x.arc(i * 64 + 32 + (j % 2) * 32, j * 64 + 32, 4, 0, 7); x.fill(); } }, { key: 'frontPaper', repeat: [6, 2] });
}
function signTex(name) {
  return ctex(1024, 256, (x, w, h) => { x.fillStyle = '#1c1430'; x.fillRect(0, 0, w, h); x.strokeStyle = '#f2c230'; x.lineWidth = 10; x.strokeRect(12, 12, w - 24, h - 24);
    x.font = 'italic 900 150px Georgia, serif'; x.textAlign = 'center'; x.textBaseline = 'middle'; x.shadowColor = '#ff7ab0'; x.shadowBlur = 30; x.fillStyle = '#ffd0e4'; x.fillText(name, w / 2, h / 2 + 8, w - 80); x.shadowBlur = 0; }, { key: 'frontSign' + name });
}
function awningTex() { return ctex(256, 128, (x, w, h) => { for (let i = 0; i < 8; i++) { x.fillStyle = i % 2 ? '#f6ecd8' : '#c7362c'; x.fillRect(i * w / 8, 0, w / 8, h); } }, { key: 'frontAwning' }); }
function streetBackTex() {
  return ctex(1024, 512, (x, w, h) => { const g = x.createLinearGradient(0, 0, 0, h); g.addColorStop(0, '#0f1640'); g.addColorStop(.7, '#2a2a6a'); g.addColorStop(1, '#4a3a7a'); x.fillStyle = g; x.fillRect(0, 0, w, h);
    const r = rng(17); x.fillStyle = '#fff'; for (let i = 0; i < 40; i++) { x.globalAlpha = .3 + r() * .5; x.beginPath(); x.arc(r() * w, r() * h * .35, 1 + r() * 1.5, 0, 7); x.fill(); } x.globalAlpha = 1;
    x.fillStyle = '#f4f0dc'; x.beginPath(); x.arc(w * .82, h * .16, 26, 0, 7); x.fill();   // the moon
    for (let i = 0; i < 9; i++) { const bw = 100 + r() * 70, bh = 180 + r() * 220, bx = i * 118 - 10; x.fillStyle = i % 2 ? '#24204e' : '#2e2a5e'; x.fillRect(bx, h - bh, bw, bh);
      for (let j = 0; j < 22; j++) if (r() < .45) { x.fillStyle = r() < .7 ? '#ffd890' : '#9fd0ff'; x.fillRect(bx + 10 + (j % 4) * 22, h - bh + 14 + Math.floor(j / 4) * 30, 12, 16); } } }, { key: 'frontBack' });
}

register('restaurant-front', {
  kind: 'set', tags: ['restaurant', 'street', 'night', 'exterior', 'sidewalk', 'date', 'rich-system'], aliases: ['restaurant-exterior', 'date-night-street'],
  desc: 'The date restaurant from the street at night. Brick facade along x at z 0 (x -8..8, 5 m tall) with a big front window (x -2.4..2.4, y .75..2.9, glass you can see through) under a striped red awning, a glowing pink script sign (name), a glass door at x 3.7 with warm light, sconces, planters and a menu easel. Inside (z 0..-3.2): warm wallpaper, string lights, pendant lamps, art: put booth-table at spots.booth (it reads through the window). Outside (+z): a tiled sidewalk to z 3.4, a curb, the road to z 11 (yellow dashes), a parked car, a street lamp at x -2.6 (head over the sidewalk at z 2.3) with a light cone, a fire hydrant, and a night street of lit buildings with a moon across the road. Wide enough for 16:9.',
  opts: { name: "the sign ('Bella Luna')", car: 'false = no parked car' },
  build: ({ name = 'Bella Luna', car = true } = {}) => {
    const g = new THREE.Group(), brick = toon(0xffffff, { map: brickTex() }), trim = toon(0x2a1a22), cream = toon(0xf3e6d4);
    // facade with the window and door openings (built from boxes round them)
    const Z = 0, T = .3;
    put(g, G.box(5.6, 5, T), brick, { x: -5.2, y: 2.5, z: Z }); put(g, G.box(.7, 5, T), brick, { x: 2.75, y: 2.5, z: Z });
    put(g, G.box(3.7, 5, T), brick, { x: 6.15, y: 2.5, z: Z });
    put(g, G.box(4.8, .75, T), brick, { y: .375, z: Z }); put(g, G.box(4.8, 2.1, T), brick, { y: 3.95, z: Z });
    put(g, G.box(1.2, 2.5, T), brick, { x: 3.7, y: 3.75, z: Z });
    put(g, G.box(16, .3, .5), trim, { y: 5.05, z: Z + .05 });   // cornice
    // window frame and mullions
    for (const [w, h, x, y] of [[5.0, .14, 0, 2.92], [5.0, .18, 0, .72], [.14, 2.3, -2.42, 1.82], [.14, 2.3, 2.42, 1.82], [.08, 2.15, -.8, 1.82], [.08, 2.15, .8, 1.82]]) put(g, G.box(w, h, .2), trim, { x, y, z: Z + .06 });
