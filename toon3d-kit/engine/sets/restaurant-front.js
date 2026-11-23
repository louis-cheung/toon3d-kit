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
