// Rich System Ep 5 "Mom's Setup" (2026-11-15): the restaurant as a hall to walk through (rows 11-12: he walks to the bar,
// then back across the room beside the gold champagne cart while every diner turns).
// Built ON the existing 'restaurant' set (its builder is called with the same setOpts, practical light on by default), never forked.
// What it adds, all inside the same 16 x 15 m room:
//   - a long bar along the right wall (counter front at x 6.3, from z -4.4 to 2.6), joining the old back-right counter in an L:
//     a glossy dark wood front with a brass foot rail, a marble top at y 1.1, five stools, a lit back bar of bottles on glowing shelves
//     against the right wall, three globe pendants with pools on the bar top, a rack of glasses, a card-terminal spot at the near end.
//   - a polished floor: a real planar mirror over the wood (engine/props/ep05.js planarReflector), so the gold cart, the lamps,
//     the diners and the walker reflect.
//   - two more diner tables flanking the walk lane, so the walk passes people.
// The hero booth stays where Ep 3 put it: booth-table at the origin (his bench -x, hers +x). The walk lane runs from the booth's
// open side to the bar's near end. Coordinates in the desc and in set.points.
import { THREE, toon, toonGloss, glow, G, put, group, ctex, rng, pointLight, lightPool, timeHook } from '../core.js';
import { register, raw, find } from '../registry.js';
import { planarReflector } from '../props/ep05.js';

const BAR = { x: 6.3, z0: -4.4, z1: 2.6, top: 1.1, d: .62 };   // counter front face at x 6.3; the counter runs to x 6.92; the bartender stands at x 7.15
const backBarTex = () => ctex(512, 256, (x, w, h) => { const g = x.createLinearGradient(0, 0, 0, h); g.addColorStop(0, '#2a1a3a'); g.addColorStop(1, '#4a2a4a'); x.fillStyle = g; x.fillRect(0, 0, w, h);
  x.strokeStyle = 'rgba(230,194,90,.35)'; x.lineWidth = 3; for (let i = 0; i < 9; i++) { x.beginPath(); x.moveTo(i * 64, 0); x.lineTo(i * 64, h); x.stroke(); } }, { key: 'rhBack', repeat: [4, 1] });
const frontTex = () => ctex(512, 256, (x, w, h) => { x.fillStyle = '#3a1f2a'; x.fillRect(0, 0, w, h); for (let i = 0; i < 8; i++) { const gx = i * 64; const gr = x.createLinearGradient(gx, 0, gx + 64, 0); gr.addColorStop(0, 'rgba(0,0,0,.25)'); gr.addColorStop(.4, 'rgba(255,220,200,.10)'); gr.addColorStop(1, 'rgba(0,0,0,.25)'); x.fillStyle = gr; x.fillRect(gx + 4, 20, 56, h - 40); }
  x.fillStyle = '#d9a441'; x.fillRect(0, 10, w, 6); x.fillRect(0, h - 16, w, 6); }, { key: 'rhFront', repeat: [6, 1] });
const marbleTex = () => ctex(512, 128, (x, w, h) => { x.fillStyle = '#efe8e0'; x.fillRect(0, 0, w, h); const r = rng(6); x.strokeStyle = 'rgba(120,110,140,.35)'; x.lineWidth = 2; for (let i = 0; i < 10; i++) { x.beginPath(); let px = r() * w, py = 0; x.moveTo(px, py); for (let k = 0; k < 6; k++) { px += (r() - .5) * 90; py += h / 6; x.lineTo(px, py); } x.stroke(); } }, { key: 'rhMarble', repeat: [5, 1] });

