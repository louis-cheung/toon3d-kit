// N-06 Thought Notifications (2026-11-18, world builder): the date-night food and table props.
//   anniversary-cake   a small round cake for a two-top, "1 YEAR" piped big on its front and top, one lit candle (flickers)
//   restaurant-menu    a menu a seated bean holds open in two hands (or a standing table card): made-up bistro name, dishes
//                      with dot leaders, and the hot line "Inferno Noodles $19" with five chili peppers (drawn in code) that hop
//   inferno-noodles    a bowl of bright red noodles, chili slices and flakes, steam and cartoon heat waves; eaten 0..1
//   breadstick         one breadstick for a hand
//   breadstick-glass   a glass of breadsticks for the table
//   walrus-tusks       two breadsticks worn under the top lip (Mia's walrus)
//   napkin             a cloth napkin lying flat, or draped over a table-phone (a soft lump); coverAt shoves it over the phone
//   bread-basket       a basket of rolls; fork: true sticks a fork in one, stabAt: [t0, t1] plunges it in
//   pasta-plate        Ryan's creamy pasta; eaten 0..1, a fork twirled in it
//   table-candle       a small glass votive for every table (flame flickers)
// Everything animates as a pure function of the shot clock (userData.update(sec)); inside a set, the set's timeHook runs them.
import { THREE, toon, toonGloss, glow, G, put, group, ctex, rng, hex } from '../core.js';
import { register, raw } from '../registry.js';
import { flame } from './dating.js';

const g0 = () => new THREE.Group();
const c01 = (t) => Math.max(0, Math.min(1, t));
const sstep = (t) => { t = c01(t); return t * t * (3 - 2 * t); };
const span = (sec, ab) => (ab ? sstep((sec - ab[0]) / Math.max(.01, ab[1] - ab[0])) : 0);
const china = () => toonGloss(0xfbf8f2, { cut: .94, gloss: .8 }), steel = () => toonGloss(0xc9cfdc, { cut: .9, gloss: 1 });
const glassM = () => toonGloss(0xe6f2ff, { transparent: true, opacity: .45, cut: .9, gloss: 1.3, depthWrite: false });
const FONT = (px, w = 900) => `${w} ${px}px Helvetica, Arial`;
const SERIF = (px, w = 700) => `${w} ${px}px Georgia, 'Times New Roman', serif`;
const tmat = (tex, o = {}) => new THREE.MeshBasicMaterial({ map: tex, transparent: true, toneMapped: false, ...o });
function animList(g) { const L = []; g.traverse((o) => { if (o !== g && o.userData.update) L.push(o.userData.update); }); return L; }

// ---------- piped writing ("1 YEAR"): a dark rim, the icing, a white highlight ----------
function piped(x, text, cx, cy, px, col = '#e2466e', rim = '#9a1f45') {
  x.save(); x.font = FONT(px); x.textAlign = 'center'; x.textBaseline = 'middle'; x.lineJoin = 'round';
  x.lineWidth = px * .2; x.strokeStyle = rim; x.strokeText(text, cx, cy + px * .03);
  x.lineWidth = px * .1; x.strokeStyle = col; x.strokeText(text, cx, cy); x.fillStyle = col; x.fillText(text, cx, cy);
  x.globalAlpha = .55; x.fillStyle = '#ffd6e2'; x.fillText(text, cx - px * .03, cy - px * .05); x.globalAlpha = 1; x.fillStyle = col; x.fillText(text, cx + px * .015, cy + px * .02);
  x.restore();
}

