// N-06 "Thought Notifications" (2026-11-18): the new cast and the pose book the story needs.
//   bean-chloe      the ex. Sleek black hair pulled into a high ponytail with a gold tie, an emerald wrap dress with a deep V and a gold belt,
//                   big gold hoops, a gold chain, red lips, lashes. Default face smirk; also annoyed, deadpan, flatStare.
//   bean-ryan       Chloe's date. Big and friendly (girth 1.34), messy brown curls, a mustard ribbed quarter-zip sweater (stand-up collar,
//                   silver zip pull, ribbed cuffs and hem), olive chinos, brown shoes. Default face happy; chew / chewLook for full cheeks.
//   bean-couch-guy  the world-build guy at home: slate-blue hoodie (hood down, white strings), grey sweatpants with a drawstring band,
//                   fuzzy brown slippers, a dark bedhead mop, tired eye bags.
// N06_POSES (registered as shared names, so bean-boi and bean-mia get them too): see the table below.
// Every preset is the flat rig with the rich finish, so they sit on any seat prop and do every acting verb (engine/acting.js).
import { THREE, put, group, ctex, hex } from './core.js';
import { register } from './registry.js';
import { makeBean, EXPRESSIONS, RICH_FLAT_POSES, addPoses } from './character.js';

const css = (c) => '#' + new THREE.Color(hex(c)).getHexString();
const shade = (c, k) => '#' + new THREE.Color(hex(c)).multiplyScalar(k).getHexString();
const withHeadPt = (root) => { const rig = root.userData.rig; if (rig && rig.head) rig.headPt = { hand: rig.head }; return root; };

