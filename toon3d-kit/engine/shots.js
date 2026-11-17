// Shot helpers an episode file can import (no three.js, so tools/review.py can load the episode in node). 2026-11-16.
//   import { insert, verb } from '../../engine/shots.js';
// The engine side of each lives in engine/acting.js.

/** A camera on a detail. target: { cast: i | id, part: 'face' | 'head' | 'R' | 'L' | 'hands' | 'chest' | 'feet' } | { prop: i } | { at: [x,y,z] },
 *  plus offset: [x,y,z] (metres, world). opts: dist (m from the target, .55), yaw (rad round the target, 0 = from the character's front /
 *  the prop's +z), pitch (rad, + looks down on it, .18), fov (32), snap (shot second the push lands; omit = a hard-cut insert that holds),
 *  push (seconds the snap push takes, at most .3), from (distance multiplier before the push, 1.7), roll (rad).
 *  Use it as a shot's cam or a cut's cam: cam: insert({ cast: 1, part: 'R' }, { snap: .4 }) */
export function insert(target, o = {}) {
  return { aim: target, dist: o.dist ?? .55, yaw: o.yaw ?? 0, pitch: o.pitch ?? .18, fov: o.fov ?? 32, snap: o.snap ?? null, push: Math.min(.3, o.push ?? .2), from: o.from ?? 1.7, roll: o.roll || 0, drift: o.drift ?? .004 };
}

/** One acting beat for shot.acts (see engine/acting.js VERBS): verb('shove', { by: 1, to: 0, at: .8 }). */
export function verb(name, o = {}) { return { verb: name, by: 0, at: 0, ...o }; }

/** A named camera move from the library (engine/camera.js, names in toon3d-kit/CAMERA.md, RULES K3).
 *  cam('follow-behind', { on: 'ETHAN' }), cam('ots', { with: 'MIA', on: 'MAX' }), cam('drone-drop', { on: 0, at: [0, 1.4] }).
 *  Use it as a shot's cam or a cut's cam. A bare string (cam: 'orbit') works too when the set has no camera of that name. */
export function cam(name, o = {}) { return { lib: name, ...o }; }
