// The backyard wedding (Red Flag Tea: "He Spent $40 On Her Engagement Ring", script v2, 2026-11-15).
// 3D props: folding-chair (holdable), folding-table, sheet-cake (+ its fork mountain), fork-pile, wedding-arch, string-lights,
// yard-tree, wood-fence, wedding-dress (the old dress the mom holds up and twirls), bouquet.
// 2D: the travel-app booking screen for phone-chat (screen: 'booking', dispatched by home.js like dating.js / story.js) and the big push
// notification overlay the player draws for shot.notify (drawNotify). Everything that moves is a pure function of the shot clock.
// Look: cel toon on everything, toonGloss on the shiny bits (resin chairs, the cake's piping, plastic forks), ink outlines,
// warm practical glow (string lights) marked practical so mood dimming leaves it alone.
import { THREE, toon, toonGloss, glow, G, put, group, ctex, rng, hex, timeHook, inkAll } from '../core.js';
import { register, raw } from '../registry.js';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';

const g0 = () => new THREE.Group();
const c01 = (t) => Math.max(0, Math.min(1, t));
const sstep = (t) => { t = c01(t); return t * t * (3 - 2 * t); };
const easeOut = (t) => 1 - Math.pow(1 - c01(t), 3);
const easeBack = (t) => { t = c01(t); const c = 1.70158; return 1 + (c + 1) * Math.pow(t - 1, 3) + c * Math.pow(t - 1, 2); };
const css = (c) => '#' + new THREE.Color(hex(c)).getHexString();
const shadeC = (c, k) => '#' + new THREE.Color(hex(c)).multiplyScalar(k).getHexString();
/** k for a "0..1 or [t0, t1]" option at time sec */
const span = (v, sec, dur = .5) => (Array.isArray(v) ? sstep((sec - v[0]) / Math.max(.001, v[1] - v[0])) : typeof v === 'number' ? v : v ? 1 : 0);

