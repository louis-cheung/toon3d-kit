// Red Flag Tea FL-03 "When he has a girl best friend vs when she has a guy best friend" (2026-11-15). New props only:
//   suspect-board: Mia's full detective board about Jessica over one lunch text (cork, red string, pinned photos, a printed profile,
//                  sticky notes), free-standing on an easel or flat on a wall. Items pop in and the string draws on, both animatable.
//   house-key:     a brass house key on a ring with a pink heart keychain, sized for the flat cast's ball hand (attach to 'holdR' / 'holdL').
// Nothing here changes an older asset. All on-screen text is our own (no logos, no brand UI, no em dashes).
import { THREE, toon, toonGloss, glow, G, put, group, ctex, inkAll } from '../core.js';
import { register } from '../registry.js';

const INK = '#1d1324', PLUM = 0x241726;
const c01 = (t) => Math.max(0, Math.min(1, t));
const back = (t) => { const c = 1.70158, u = c01(t) - 1; return 1 + (c + 1) * u * u * u + c * u * u; };
const MARKER = '"Marker Felt", "Comic Sans MS", "Arial Black", Helvetica';
const PRINT = 'Helvetica, Arial';
function rr(x, X, Y, w, h, r) { x.beginPath(); x.roundRect(X, Y, w, h, r); }
/** a value that is either a number (static) or a [t0, t1] span (0 -> 1 over the span) */
const span = (v, sec) => (Array.isArray(v) ? c01((sec - v[0]) / Math.max(.01, v[1] - v[0])) : c01(v ?? 1));
/** write `text` centred at (cx, cy), shrinking the font so it fits maxW */
function fit(x, text, cx, cy, maxW, px, font = MARKER, weight = '900') {
  x.font = `${weight} ${px}px ${font}`; const w = x.measureText(text).width; if (w > maxW) { px = Math.floor(px * maxW / w); x.font = `${weight} ${px}px ${font}`; }
  x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText(text, cx, cy); return px;
}
function star4(x, cx, cy, r, col = '#ffffff') { x.save(); x.fillStyle = col; x.beginPath(); for (let i = 0; i < 8; i++) { const a = i * Math.PI / 4 - Math.PI / 2, q = i % 2 ? r * .28 : r; x.lineTo(cx + Math.cos(a) * q, cy + Math.sin(a) * q); } x.closePath(); x.fill(); x.lineWidth = r * .14; x.strokeStyle = INK; x.stroke(); x.restore(); }

