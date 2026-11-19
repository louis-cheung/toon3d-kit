// bean-boi (2026-11-16): the Boi Studios lead, the face of the channel and the "you" of PLAYBOOK 12 rule 33 (WISHLIST item 0).
// Refs: ../references/from-louis/cast/lead-leather-jacket-* (refs only, never on screen). A black leather biker jacket (a nod to
// Jensen Huang): wide notched lapels with silver snaps, an off-centre silver zip, two slanted zip pockets, shoulder and back panel
// seams, hard white gloss streaks (rule 23), a waistband with a buckle, zipped cuffs. A white crew tee under it, dark jeans with
// rolled cuffs, white sneakers. Flat white bean head (section 4), dark hair swept back, calm and unbothered by default.
// shades: true puts sunglasses on (for flex beats; off by default). Built on the flat rig, so he sits on any seat prop and does
// every acting verb (engine/acting.js).
import { THREE, put, group, ctex, hex } from './core.js';
import { register } from './registry.js';
import { makeBean, EXPRESSIONS, RICH_FLAT_POSES, flatMat, inkPart } from './character.js';

const css = (c) => '#' + new THREE.Color(hex(c)).getHexString();
const shade = (c, k) => '#' + new THREE.Color(hex(c)).multiplyScalar(k).getHexString();
const FACES = { shock: EXPRESSIONS.jolt, angry: EXPRESSIONS.fuming,
  unbothered: { eyes: 'lid', brows: [-.04, .08], mouth: 'smirk', browY: [6, -2] },      // his default "I'm fine": lids half down, the tiniest smirk
  cracking: { eyes: 'stare', brows: [.3, .18], mouth: 'grinWavy', extra: ['sweat'], browY: [-20, -12] },   // the calm cracking
};

