// Rich System Ep 5 "Mom's Setup" (2026-11-15): two thought-cloud pictures, drawn flat in 2D like dreams.js (egg heads, plum ink, stick limbs).
//   twoyachts  (row 5, "I have two."): two white yachts moored side by side at a marina at sunset, I and II in gold on the hulls, Ethan on the
//              dock between them in sunglasses, pointing at both
//   toast      (row 10, "Best champagne, huh."): Mom and Ethan at her kitchen table under the pendant lamp, clinking two mismatched mugs,
//              the gold ROYAL RESERVE bottle open between them, sparkles; Mom laughing in her reading glasses
// Registered with addCloudPicture (engine/props/cloud.js); thought-cloud { picture: 'twoyachts' | 'toast' }. The drawing helpers are copied from
// dreams.js (not exported there) so this file changes nothing else. Pure functions of t, no real logos.
import { addCloudPicture } from './cloud.js';
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

