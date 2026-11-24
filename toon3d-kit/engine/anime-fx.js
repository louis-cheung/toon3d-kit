// Anime reaction effects (2026-11-21 trial, not registered in the library yet; RULES "Open questions").
// Flat manga backdrops and bubbles, drawn in code, that go behind or beside a character for a reaction beat.
// Louis: "it's only their expression, it's also like effects" (refs: references/from-louis/faces/).
//   animeBackdrop(kind, { w, h, round })  kind: lightning | speedlines | gloomAura | sparkles | flowers | flames | rain
//     A plane (w x h metres) facing +z. round: true cuts it to a spiky burst (for a wide shot, behind one head).
//   animeBubble(text, { size })  a spiky white shout bubble ("!!!", "?!", "...") facing +z.
//   animeCrown(kind, { w })  'flames': the head on fire (Louis's Anger ref). A w x 2w plane whose flame base sits .24 of its height below
//     the centre: put it just behind the head with the centre about at the top of the head, and the flames rise out of it.
// Staging (Louis, 2026-11-22): a backdrop is a short close-up reaction cut; the backdrop fills the screen behind one character.
import { THREE, ctex } from './core.js';

const INK = '#241726';
const rnd = (seed) => () => ((seed = (seed * 16807) % 2147483647) / 2147483647);

function burstPath(x, cx, cy, r, n, depth, R) {
  x.beginPath();
  for (let i = 0; i <= n * 2; i++) { const a = i / (n * 2) * Math.PI * 2, rr = r * (i % 2 ? 1 - depth * (.6 + R() * .4) : 1); x.lineTo(cx + Math.cos(a) * rr, cy + Math.sin(a) * rr); }
  x.closePath();
}

