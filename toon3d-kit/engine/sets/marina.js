// Rich System Ep 3 v2 (2026-11-15): marina-yacht, a white superyacht at a marina at dusk with a party on its aft deck.
// No reference from Louis (PLAYBOOK 12.1): designed from the thought-cloud picture (engine/props/dreams.js, 'yacht') so the real one matches it.
// Layout (1 unit = 1 m). The yacht lies along x, bow toward +x, stern at x -12. Its MAIN DECK is the floor, y 0. The water is at y -2.
//   Aft party deck: x -11.6..-3.2, z -2.7..2.7 (teak, glass rail round the stern and sides, a white U sofa at the stern, a bar against the
//   cabin's aft wall, a DJ table on the port side (-z), an overhang with downlights over the bar end, festoon lights from the radar arch to
//   the stern rail). Cabin x -3.2..8 (glass sliding doors aft, a long tinted window band), upper deck on it at y 2.5 with a rail and the arch.
//   The dock runs along x at z -6.6 (the port side), with lamp posts, bollards and two more yachts moored along it; across the water at -z
//   the marina lights and the city. The sky backdrop glows pink and orange on the horizon, strongest astern (-x), deep navy overhead.
// Animated through the same time hook as the dealership (the player's spinner clock): water shimmer, twinkling lights, a slow bob.
import { THREE, toon, glow, G, put, group, ctex, rng, pointLight } from '../core.js';
import { register, raw } from '../registry.js';

const c01 = (t) => Math.max(0, Math.min(1, t));
const WATER = -2, DECK = 0, STERN = -12, BOW = 13;
/** Same clock as engine/sets/dealer.js (not exported there): the player sets rotation.y = sec * .4 on every userData.spin object. */
function timeHook(root, fn) {
  const clock = new THREE.Object3D(); clock.userData.spin = true; root.add(clock); let last = null;
  clock.rotation._onChange(() => { clock.quaternion.setFromEuler(clock.rotation, false); const sec = clock.rotation.y / .4; if (sec !== last) { last = sec; fn(sec); } });
  fn(0);
}

