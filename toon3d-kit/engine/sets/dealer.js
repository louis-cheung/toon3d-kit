// Rich System Ep 2 (2026-11-14): the car dealership (showroom, salesman desks, service desk, service bay with a lift, the lot outside).
import { THREE, toon, glow, G, put, group, ctex, rng, tileTex, pointLight } from '../core.js';
import { register, raw } from '../registry.js';

// Layout (1 unit = 1 m, floor y 0). Showroom x -7..7, z -5..5, ceiling 4.5. Glass front at z +5 faces the lot (+z).
// Doors centred at x -3.5 (opening x -4.5..-2.5). Turntable at x -2.5, z .5. Desks on the right (x 4.2). Service desk at the back
// left (x -3.5, z -4.2). Wide opening in the back wall (x 1..6.5) into the service bay (z -5..-11) with the lift at x 3.8, z -8.2.
// The lot outside runs z 5..21, the street at z 24, shops across it.
const CH = 4.5, XW = 7, ZF = 5, ZB = -5, BAY = -11.2;
const c01 = (t) => Math.max(0, Math.min(1, t));
const sm = (t) => { const k = c01(t); return k * k * (3 - 2 * k); };
const GOLD = '#e6b84a', TEAL = '#0f5560', NAVY = '#1c2a6a', RED = '#e2463b';

/** Set pieces get no update(sec) from the player, but the player sets rotation.y = sec * .4 on every userData.spin object before each
 *  render. This clock hears that assignment (the Euler change callback) and runs fn(sec) right then, so the set's moving parts are
 *  posed before the frame is drawn, in any frame order (rich.js reads the clock in onBeforeRender, which lags one render behind). */
function timeHook(root, fn) {
  const clock = new THREE.Object3D(); clock.userData.spin = true; root.add(clock); let last = null;
  clock.rotation._onChange(() => { clock.quaternion.setFromEuler(clock.rotation, false); const sec = clock.rotation.y / .4; if (sec !== last) { last = sec; fn(sec); } });
  fn(0);
}
// A row of shop fronts and towers along x, facing +z (copied from rich.js cityRow, which is not exported).
function cityRow(g, z, ry, seed, names, skip = []) {
  const row = group(g, { z, ry }), r = rng(seed), cols = ['#7a6ab8', '#d08a6a', '#4f8fb0', '#c9a24a', '#8a5a9a', '#5aa08a', '#c86a7a'];
  for (let i = 0; i < 9; i++) { const x = -26 + i * 6.5; if (skip.includes(i)) continue;
