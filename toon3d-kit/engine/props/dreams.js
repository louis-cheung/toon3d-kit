// Rich System Ep 3 v2 (2026-11-15): what the lies buy, drawn flat in 2D (the same look as the cast: egg heads, plum ink, stick limbs).
//   car    (thought-cloud picture, 800 x 520): Ethan in a red convertible, top down, sunglasses, hair blowing, bills flying out behind
//   yacht  (thought-cloud picture, 800 x 520): a white yacht at sunset, a party on the top deck, Ethan in the middle in sunglasses,
//          good-looking people dancing round him, string lights and confetti
//   paintYachtStory (story photo 'ethan-yacht', 600 x 1080): his selfie on the yacht deck at sunset, the party behind him
// Pure canvas painters, functions of t (seconds since the picture appeared), so frames render in any order. No real logos anywhere.
import { THREE, toon, glow, G, put } from '../core.js';
import { register } from '../registry.js';
const INK = '#241726', SKIN = '#fbfbfd';
const ETHAN = { hair: 'shag', hairColor: '#5a3c28', body: '#7b808c', hood: '#ef7d2a', strings: '#f6f2e8' };
function prng(seed) { let s = seed % 2147483647 || 1; return () => (s = (s * 16807) % 2147483647) / 2147483647; }
function inked(x, fill, lw = 6) { if (fill) { x.fillStyle = fill; x.fill(); } if (lw) { x.lineWidth = lw; x.strokeStyle = INK; x.stroke(); } }
function ell(x, cx, cy, rx, ry, fill, lw = 6, rot = 0) { x.beginPath(); x.ellipse(cx, cy, Math.max(.1, rx), Math.max(.1, ry), rot, 0, Math.PI * 2); inked(x, fill, lw); }
function poly(x, pts, fill, lw = 6) { x.beginPath(); pts.forEach(([a, b], i) => (i ? x.lineTo(a, b) : x.moveTo(a, b))); x.closePath(); inked(x, fill, lw); }
function rr(x, X, Y, w, h, r, fill, lw = 6) { x.beginPath(); x.roundRect(X, Y, w, h, r); inked(x, fill, lw); }
function limb(x, pts, w, col = INK) { x.lineCap = x.lineJoin = 'round'; x.beginPath(); pts.forEach(([a, b], i) => (i ? x.lineTo(a, b) : x.moveTo(a, b))); x.lineWidth = w; x.strokeStyle = col; x.stroke(); }
function grad(x, y0, y1, stops) { const g = x.createLinearGradient(0, y0, 0, y1); stops.forEach((c, i) => g.addColorStop(i / (stops.length - 1), c)); return g; }
function star4(x, cx, cy, s, col = '#ffffff') { x.fillStyle = col; x.beginPath(); x.moveTo(cx, cy - s); x.lineTo(cx + s * .28, cy - s * .28); x.lineTo(cx + s, cy); x.lineTo(cx + s * .28, cy + s * .28); x.lineTo(cx, cy + s); x.lineTo(cx - s * .28, cy + s * .28); x.lineTo(cx - s, cy); x.lineTo(cx - s * .28, cy - s * .28); x.closePath(); x.fill(); }

