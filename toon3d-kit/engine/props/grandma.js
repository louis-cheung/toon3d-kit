// Rich System Ep 6 "Grandma's House" (2026-11-15): the props of the Thanksgiving auction.
//   wall-clock    round kitchen wall clock with big numerals; hands sweep between keyframed times, wobbles like a bell when it rings
//   yard-sign     a realty-style FOR SALE sign on a white post (or leaning on a chair indoors); a red NOT sticker slaps on
//   porch-swing   a slatted wooden porch swing on chains with cushions, a slow sway
//   plate-stack   a stack of dirty plates; tower: true = a comic tower to the ceiling that wobbles
//   gravy-boat, dish-soap ("SUDS"), dish-rack (plates, a mug; the SYSTEM sits on its top rail), house-keys (a house fob), soap-suds (fx)
//   dining-chair  a wooden spindle-back dining chair with a seat cushion (head: true = the carver armchair)
//   bike          thought-cloud picture: little Ethan wobbling down the driveway on a small bike, Grandma running behind holding the seat
// Glossy things (china, glass, steel, the soap bottle, lacquer) use toonGloss; cloth, paper and wood stay matte toon. Everything that can
// move does (rule 11). No real logos or brands.
import { THREE, toon, toonGloss, glow, G, put, group, ctex, rng, hex } from '../core.js';
import { register, raw } from '../registry.js';
import { addCloudPicture } from './cloud.js';

const PI = Math.PI, g0 = () => new THREE.Group(), c01 = (t) => Math.max(0, Math.min(1, t));
const back = (t) => { const c = 1.70158; return 1 + (c + 1) * Math.pow(t - 1, 3) + c * Math.pow(t - 1, 2); };
const china = () => toonGloss(0xfbf8f2, { cut: .94, gloss: .8 }), steel = () => toonGloss(0xc9cfdc, { cut: .9, gloss: 1 });
const INKC = '#241726';
// Hide with scale, not .visible: inside a set these updaters run from a time hook during the render, after three.js has already
// listed what is visible, so a .visible change would land one frame late. A scale change is read at draw time.
const seen = (o, on, s = 1) => { if (on) o.scale.setScalar(s); else o.scale.setScalar(1e-4); };

