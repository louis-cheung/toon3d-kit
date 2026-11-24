// ACTING (2026-11-16, PLAYBOOK section 12 rule 38). What the episodes were missing, in one place:
//   1. SEATS    every seat prop says where its seat is (userData.seats). A cast entry with seat: {...} sits ON it: body on the
//               cushion, thighs level, knees just past the front edge, shins hanging in front of it (or feet on the floor on a
//               low seat). Sitting down and standing up are animated (feet planted, hips back and down, a forward lean).
//   2. VERBS    shot.acts: two-character contact beats (handOver, snatch, shove, pullArm, hug, slapAway, pour, stormOut) and
//               one-character beats (slamTable, recoil, slump, buryFace, throwHands, leanIn). Contact verbs aim at the other
//               character's REAL hand / shoulder / chest / head every frame, so they keep working when anyone moves.
//   3. INSERTS  insert(target, opts): a camera aimed at a hand, a face or a prop, as a hard cut or a snap push of .3 s or less.
//               Never a slow drift (rule 11).
//   4. CLIPS    clipCheck(S): every limb, body and head checked against set and prop geometry and against the other characters.
//               tools/clipcheck.py runs it over an episode; tools/review.py fails the stills on a hit.
// Everything is opt-in: an episode without seat / acts / aim renders exactly as before.
import { THREE, ease, clamp01 } from './core.js';

const V = (x = 0, y = 0, z = 0) => new THREE.Vector3(x, y, z);
const sm = (x) => { x = clamp01(x); return x * x * (3 - 2 * x); };
const ramp = (k, a, b) => sm((k - a) / Math.max(1e-4, b - a));
const env = (k, a0, a1, r0, r1) => ramp(k, a0, a1) * (r0 == null ? 1 : 1 - ramp(k, r0, r1));
const lerpAng = (a, b, t) => { let d = b - a; while (d > Math.PI) d -= Math.PI * 2; while (d < -Math.PI) d += Math.PI * 2; return a + d * t; };

