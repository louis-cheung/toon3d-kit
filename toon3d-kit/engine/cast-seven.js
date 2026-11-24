// Seven Inches (2026-11-23, asset builder): the neighbour, on the flat rig with the anime face (RULES L1), like engine/cast-ghosted.js.
//   bean-neighbour  a middle-aged man in a bathrobe: bald with a shine, grey stubble round the sides, a grey moustache, tired bags, a little
//                   wide (girth 1.22); a plush maroon terry bathrobe with a lighter shawl collar, patch pockets and a belt tied at the waist
//                   with its two ends hanging, a white undershirt in the V, bare shins, brown slippers. The coffee mug is the kitchen-mug prop
//                   on holdR (pose hold_mug), or mug-smash on the table. In the rowboat he sits on its "thwart" seat (poses row_reach / row_pull).
// Poses (every flat bean): hold_mug (the mug up at the chest in the right hand), sit_hold_mug, row_reach / row_pull (seated, both arms out
// on the oar grips; alternate them with poseKeys for the stroke), lounge_mug (reclined on a lounger, the mug on the belly).
import { THREE, put, hex, ctex } from './core.js';
import { register, find } from './registry.js';
import { NORA_LOOKS } from './cast-turkey.js';
import { makeBean, EXPRESSIONS, RICH_FLAT_POSES, addPoses } from './character.js';

const css = (c) => '#' + new THREE.Color(hex(c)).getHexString();
const shade = (c, k) => '#' + new THREE.Color(hex(c)).multiplyScalar(k).getHexString();
const withHeadPt = (root) => { const rig = root.userData.rig; if (rig && rig.head) rig.headPt = { hand: rig.head }; return root; };
const irisOf = (o, iris) => (o.anime === true ? { anime: { iris } } : {});

