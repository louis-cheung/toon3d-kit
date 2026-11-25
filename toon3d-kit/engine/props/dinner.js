// Dinner props: a table that seats six, the studio stage screen (table view, A/B view, bar chart),
// the A/B choice pill, a pay card, and a lettuce leaf. Same toon materials, ink and helpers as the rest of the library.
// Cyan #3fd0ff means option A and yellow #ffd23f means option B. Nothing else in a video uses those two colors.
import { THREE, toon, glow, G, put, group, PAL, ctex, rng, RENDERER, lighting } from '../core.js';
import { register, asset, find } from '../registry.js';
const g0 = () => new THREE.Group();
export const OPT_A = '#3fd0ff', OPT_B = '#ffd23f', INK = '#0f0d17';
const clamp01 = (t) => Math.max(0, Math.min(1, t));

// ---------- dinner table ----------
// Round table, radius 1.1 m, top at y = 0.76. Six stools on a ring of radius 1.38 m, seat top at y = 0.48 (a seated bean fits).
// Seat k sits at angle SEAT_ANGLES[k] measured from +z (toward the camera) toward +x: position (sin a, 0, cos a) * 1.38.
// The ring leaves the front center open, so the camera sees the table and the people on both sides of it.
export const SEAT_ANGLES = [-40, 40, -100, 100, -160, 160].map((d) => d * Math.PI / 180);
export const SEAT_R = 1.38;
register('dinner-table', {
  tags: ['table', 'dinner', 'restaurant', 'furniture', 'cafe', 'seats-six', 'group'], aliases: ['table-six', 'big-table'],
  desc: 'Round dinner table that seats six, with six stools around it. Top at 0.76 m, stool seats at 0.48 m (seated beans fit). Seat angles from +z: -40, 40, -100, 100, -160, 160 degrees on a 1.38 m ring.',
  opts: { r: 'table radius (1.1)', top: 'top color', stools: 'false = table only', cloth: 'true adds a center cloth disc' },
  build: ({ r = 1.1, top = PAL.wood, stools = true, cloth = false } = {}) => {
    const g = g0(), dark = toon(PAL.woodDark);
    put(g, G.cyl(r, r * .97, .06, 48), toon(top), { y: .73 });
    put(g, G.cyl(r * .93, r * .93, .07, 48), dark, { y: .67 });
    put(g, G.cyl(.1, .16, .62, 16), dark, { y: .31 });
    put(g, G.cyl(.5, .56, .05, 32), dark, { y: .025 });
    if (cloth) put(g, G.cyl(r * .62, r * .62, .006, 40), toon(0xf3f3f6), { y: .763, noInk: true });
    if (stools) for (const a of SEAT_ANGLES) {
      const s = group(g, { x: Math.sin(a) * SEAT_R, z: Math.cos(a) * SEAT_R, ry: a + Math.PI });
      put(s, G.cyl(.25, .23, .07, 24), toon(0x7a3f3a), { y: .445 });          // padded seat
      put(s, G.cyl(.255, .255, .02, 24), toon(0x5a2c2c), { y: .41 });
      for (let i = 0; i < 4; i++) { const b = i * Math.PI / 2 + Math.PI / 4; put(s, G.cyl(.022, .026, .4, 8), dark, { x: Math.cos(b) * .17, z: Math.sin(b) * .17, y: .2 }); }
    }
    g.userData.seats = SEAT_ANGLES.map((a) => [Math.sin(a) * SEAT_R, 0, Math.cos(a) * SEAT_R]);
    return g;
  },
});

// ---------- stage screen ----------
const PEOPLE = ['#6a4fc4', '#ef8a3c', '#f08ab0', '#6bbf4a', '#e7e4ee', '#8a2f4a'];   // jade, max, then the four friends
function person(x, cx, cy, s, color, face) {
  x.lineWidth = 7 * s; x.strokeStyle = INK; x.fillStyle = color;
  x.beginPath(); x.ellipse(cx, cy + 46 * s, 34 * s, 46 * s, 0, 0, 7); x.fill(); x.stroke();
  x.fillStyle = '#f6f6f8'; x.beginPath(); x.arc(cx, cy, 30 * s, 0, 7); x.fill(); x.stroke();
  if (face) {
    x.fillStyle = INK; x.beginPath(); x.arc(cx - 10 * s, cy - 3 * s, 3.4 * s, 0, 7); x.arc(cx + 10 * s, cy - 3 * s, 3.4 * s, 0, 7); x.fill();
    x.lineWidth = 3.4 * s; x.beginPath();
    if (face === 'happy') x.arc(cx, cy + 4 * s, 11 * s, .15 * Math.PI, .85 * Math.PI); else { x.moveTo(cx - 8 * s, cy + 13 * s); x.lineTo(cx + 8 * s, cy + 13 * s); }
    x.stroke();
  }
}
function tableScene(x, cx, cy, s, mood) {
  const pos = [[-1, -1], [0, -1.15], [1, -1], [-1.25, .1], [1.25, .1], [0, 1.1]];   // far row, sides, near
  const draw = (list) => list.forEach(([i, p]) => person(x, cx + p[0] * 150 * s, cy + p[1] * 70 * s - 40 * s, s * .95, PEOPLE[i], mood));
  const idx = pos.map((p, i) => [i, p]);
  draw(idx.filter(([, p]) => p[1] < 0));
  x.lineWidth = 8 * s; x.strokeStyle = INK; x.fillStyle = '#b98552'; x.beginPath(); x.ellipse(cx, cy, 150 * s, 62 * s, 0, 0, 7); x.fill(); x.stroke();
  x.fillStyle = '#f3f3f6'; for (const [px, py] of [[-70, -4], [-20, 14], [40, 8], [78, -6], [-8, -18]]) { x.beginPath(); x.ellipse(cx + px * s, cy + py * s, 17 * s, 7 * s, 0, 0, 7); x.fill(); }
  x.fillStyle = '#e2463b'; x.beginPath(); x.ellipse(cx + 40 * s, cy + 8 * s, 8 * s, 3.5 * s, 0, 0, 7); x.fill();
  draw(idx.filter(([, p]) => p[1] >= 0));
}
function tagBubble(x, cx, cy, letter, color) {
  x.fillStyle = color; x.strokeStyle = INK; x.lineWidth = 12; x.beginPath(); x.arc(cx, cy, 78, 0, 7); x.fill(); x.stroke();
  x.fillStyle = INK; x.font = '900 112px Helvetica, Arial'; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText(letter, cx, cy + 6);
}
// A real picture of the restaurant: the same set, table and six people as the dinner shots, rendered once from a fixed camera
// into a 3:2 canvas (draws into a corner of the main canvas, copies it out, restores the viewport).
let roomCanvas = null;
function roomPicture() {
  if (roomCanvas) return roomCanvas;
  const R = RENDERER; if (!R) return null;
  const scene = new THREE.Scene(); lighting(scene, 'restaurant', { shadowSize: 10 });
  const set = asset('restaurant', { rug: false }); scene.add(set.root); (set.lights || []).forEach((f) => f(scene));
  scene.add(asset('long-table', { layout: 'broad', cloth: true }));
  const names = ['bean-jade', 'bean-max', 'bean', 'bean', 'bean', 'bean'];
  BROAD_SEATS.forEach(([x, z, ry], k) => {
