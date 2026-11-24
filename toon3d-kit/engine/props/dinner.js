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
