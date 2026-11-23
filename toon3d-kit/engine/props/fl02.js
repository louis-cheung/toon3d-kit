// Red Flag Tea fast lane FL-02 "Texting first in 2026 be like" (2026-11-15). New file, nothing here changes an older asset.
//   fl02-phone  a phone-chat phone (its chat / lock screens, drafts, messages, seen line all work as before) held from its bottom edge
//               (grip + sway, like phone-pay), with an overlay screen on top for the screens phone-chat lacks: 'notif' (a lock screen with one
//               huge "X followed you back" card), 'story' (our own generic story UI, no real app: progress bars, avatar ring, handle, a photo drawn
//               in code: 'beach' Mia and a new guy at the beach, 'chatshot' a screenshot of his "who's that?" text), and a white screenshot flash.
//   fl02-badge  a camera-facing 2D card for the wide shots: 'story' (a ring avatar with a little picture, "NEW STORY"), 'eye' ("SEEN"),
//               'empty' (a chat bubble with "0 messages").
//   fl02-duvet  Leo's orange duvet as a loose sheet he can pull over his face.
// Everything is a pure function of the shot clock (update(sec)), so frames render in any order.
import { THREE, toon, glow, G, put, group } from '../core.js';
import { register, raw } from '../registry.js';

const INK = '#1d1324', PLUM = 0x241726, F = 'Helvetica, Arial';
const c01 = (t) => Math.max(0, Math.min(1, t));
const back = (t) => { const c = 1.70158, u = c01(t) - 1; return 1 + (c + 1) * u * u * u + c * u * u; };
const out3 = (t) => 1 - Math.pow(1 - c01(t), 3);
function rr(x, X, Y, w, h, r) { x.beginPath(); x.roundRect(X, Y, w, h, r); }
function inked(x, fill, lw = 6) { if (fill) { x.fillStyle = fill; x.fill(); } if (lw) { x.lineWidth = lw; x.strokeStyle = INK; x.stroke(); } }
function ell(x, cx, cy, rx, ry, fill, lw = 6, rot = 0) { x.beginPath(); x.ellipse(cx, cy, Math.max(.1, rx), Math.max(.1, ry), rot, 0, Math.PI * 2); inked(x, fill, lw); }

