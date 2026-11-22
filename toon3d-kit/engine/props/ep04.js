// Rich System Ep 4 "Spend It All" (2026-11-15). New file: nothing else in the engine changes.
//   gold-watch     a chunky gold watch on a little velvet display pillow (the store), and the same watch alone (pillow: false)
//   fireworks      animated fireworks: rockets climb from a launch point, burst into coloured stars with trails, crackle and fall
//   shop-shutter   a roll-down metal shop shutter that slams down at a given second (with a bounce and a CLOSED tag)
//   phone-app      a hand-held phone with this episode's screens: story (Tyler's date-night story), bank ($14.20), order (the EATS
//                  app, cup noodles $3.49, ORDER pressed), driver (her last order: tip $0.00), tip (TIP $400,000, CONFIRM pressed),
//                  tipin (TIP: $400,000.00 received). screens: [{at, ...}] switches mid-shot, thumb: {at: [t0, t1], to} presses a button.
//   cup-noodle     an instant noodle cup (lid peeled back, noodles, steam optional); egg (a whole egg, or cracked: two half shells + yolk)
//   serving-tray   a round silver waiter's tray with two covered plates and a glass (rides holdR)
//   lot-line       the painted edge of the dealership lot: a thick yellow line with LOT stencils and a little EXIT sign
//   kitchen-nook   a cramped kitchen run: counter with a sink and a hob, upper cabinets, a fridge with magnets, a kettle, a microwave
//   thought-cloud pictures (addCloudPicture): 'watches' (Ethan dripping in gold watches, sneaker boxes to the ceiling),
//                  'carcash' (a red sports car rolling off a lot, money blowing out of the exhaust), 'skyboom' (the night sky exploding)
import { THREE, toon, toonGloss, glow, G, put, group, ctex, rng, hex } from '../core.js';
import { register } from '../registry.js';
import { addCloudPicture } from './cloud.js';

const INK = '#241726';
const c01 = (t) => Math.max(0, Math.min(1, t));
const out3 = (t) => 1 - Math.pow(1 - c01(t), 3);
const back = (t) => { const c = 1.70158, u = c01(t); return 1 + (c + 1) * Math.pow(u - 1, 3) + c * Math.pow(u - 1, 2); };
const g0 = () => new THREE.Group();

