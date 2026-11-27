// Rich System props (Ep 1, 2026-11-12): the red convertible, the city bus (outside), the farebox, a traffic light,
// the car showroom, a cane, and the SYSTEM panel (blue glass HUD with a gold reward row, refs 08 and 09).
// Everything that changes over a shot is a pure function of time: update(sec), so frames render in any order.
import { THREE, toon, glow, G, put, group, ctex, rng } from '../core.js';
import { register, find } from '../registry.js';
const g0 = () => new THREE.Group();
const c01 = (t) => Math.max(0, Math.min(1, t));
const sm = (t) => { const k = c01(t); return k * k * (3 - 2 * k); };
const INKC = '#241726';
/** The entry of a [{at, ...}] timeline that applies at sec (later entries win), merged over base. */
const stateAt = (base, steps, sec) => { let st = { ...base }; for (const e of (steps || []).slice().sort((a, b) => a.at - b.at)) if (sec >= e.at) st = { ...st, ...e }; return st; };
/** A canvas texture redrawn only when key(sec) changes. */
function liveTex(w, h, draw, key) {
  const cv = document.createElement('canvas'); cv.width = w; cv.height = h; const x = cv.getContext('2d');
  const t = new THREE.CanvasTexture(cv); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8; let last = null;
  const update = (sec) => { const k = key(sec); if (k === last) return; last = k; x.setTransform(1, 0, 0, 1, 0, 0); x.clearRect(0, 0, w, h); x.lineCap = x.lineJoin = 'round'; draw(x, w, h, sec); t.needsUpdate = true; };
  update(0); return { tex: t, update };
}


// ---------- the red car's door (v2, 2026-11-12): one builder for the door on the car, the torn-off door prop and the door on the bus ----------
// The door is a group whose origin is the hinge (its front edge, +x end); the panel runs back along -x for 1.5 m, outside face +z.
// crumple 0..1 dents it: vertices pushed in by a fixed noise, the back corner folded, so it reads as a wreck at any size.
function hash3(x, y, z) { const v = Math.sin(x * 127.1 + y * 311.7 + z * 74.7) * 43758.5453; return v - Math.floor(v); }
function carDoor(color = 0xd8322e, crumple = 0) {
  const d = g0(), body = toon(color), dark = toon(0x2a2430), chrome = toon(0xd9dce6), L = 1.5;
  const geo = new THREE.BoxGeometry(L, .5, .07, 14, 6, 1); geo.translate(-L / 2, 0, 0);
  if (crumple > 0) { const p = geo.attributes.position;
    for (let i = 0; i < p.count; i++) { const x = p.getX(i), y = p.getY(i), z = p.getZ(i), u = -x / L;
      const n = hash3(Math.round(x * 9), Math.round(y * 12), 0) - .5;
      p.setZ(i, z - crumple * (.07 * n + .16 * Math.sin(u * Math.PI) * (.6 + .4 * Math.cos(y * 9)) + .2 * Math.max(0, u - .7) ** 1.2));
      p.setY(i, y * (1 - crumple * .1 * Math.sin(u * Math.PI)) - crumple * .12 * Math.max(0, u - .6) * (y + .25)); }
    geo.computeVertexNormals(); }
  put(d, geo, body, { y: 0 });
  put(d, G.rbox(1.6, .14, .14, .06), body, { x: -L / 2 - .05, y: .27 - crumple * .03, rz: crumple * .06 });   // the top rail
  put(d, G.box(.16, .035, .03), chrome, { x: -L + .32, y: .12, z: .05, noInk: true }); put(d, G.box(.12, .02, .01), dark, { x: -L + .32, y: .12, z: .066, noInk: true });   // handle
  put(d, G.box(.03, .5, .006), dark, { x: -.02, z: .037, noInk: true });   // seam at the hinge end
  const mir = group(d, { x: -.12, y: .36, z: .07 }); put(mir, G.cyl(.015, .015, .1, 8), dark, { y: -.03, z: .04, rx: 1.2 }); put(mir, G.rbox(.16, .1, .06, .02), body, { y: .02, z: .1 });
  put(mir, G.plane(.12, .07), glow(0xbfe0ff), { y: .02, z: .07, ry: Math.PI, noInk: true });
  return d;
}
/** Torn hinge: jagged grey metal shards and a dangling cable, for the front edge of a ripped-off door (on the car or on the door). */
function tornHinge(parent, x, z, s = 1) {
  const metal = toon(0xb8bcc8), dark = toon(0x3a3440);
  for (const [y, len, a] of [[.18, .14, .5], [.02, .11, -.3], [-.14, .16, .2]]) { put(parent, G.cone(.035, len, 4), metal, { x: x - .02, y, z: z + s * .03, rz: Math.PI / 2 + a, ry: s * .3 }); put(parent, G.box(.06, .05, .03), dark, { x: x + .01, y, z }); }
  const c = new THREE.CatmullRomCurve3([[0, .05, 0], [-.04, -.08, s * .05], [.02, -.2, s * .09]].map((v) => new THREE.Vector3(x + v[0], v[1], z + v[2])));
  put(parent, new THREE.TubeGeometry(c, 12, .01, 6), toon(0x2a6ad8));
}

// ---------- the red convertible ----------
register('sports-car', {
  tags: ['vehicle', 'car', 'rich', 'street', 'convertible', 'rich-system'], aliases: ['convertible', 'red-car'],
  desc: 'Low two-seat convertible (Tyler\'s red car). Front points +x, driver on the -z side. Seat cushion top at y .73 (car space), driver seat at x -.25, z -.33, passenger at x -.25, z +.33; a seated bean of height h sits there with its root at y .73 - .3 h, ry +PI/2 in car space (facing the bonnet). dent: crumpled rear bumper. puff: [t0, t1] stall smoke from the bonnet. doorOff: [t0, t1] one door bends open, rips off and flies forward (+x), leaving a dark doorway with a torn hinge. v3 crash options: rearDamage / rearDamageAt crumple the rear (the bus rolled into it), airbags pop from the wheel and the dash, bumperDrop lets the rear bumper hang from one end and then fall off.',
  opts: { color: 'body colour (red)', dent: 'true = crumpled rear', plate: 'plate text', puff: '[t0, t1] grey stall smoke', lights: 'true = headlights on', doorOff: '[t0, t1] the door rips off over this span (null = normal car)', doorSide: '-1 = driver / street side (-z, the side a bus passing on the left hits; default) | 1 = curb side (+z)', doorGone: 'true = already doorless (the after shot)', fly: 'false = the torn door vanishes at the tear instead of flying (pair with a city-bus hangingDoor appearing at that moment)', hazards: 'true, or a start sec: orange corner lights blink (an alarm going off)',
    rearDamage: '0..1 (0): the rear crumpled by a hit from behind: body shortened, boot lid sprung up, folded metal, a smashed tail light, the plate knocked crooked (0 = the old undamaged car)', rearDamageAt: '[t0, t1]: the crumple happens over this span (0 to rearDamage, or to 1 if rearDamage is 0); before t0 the car is whole',
    airbags: 'true = both airbags out | [t0, t1] they pop out of the wheel and the dash over this span (overshoot, then a slow jiggle)', bumperDrop: "0..1, or [t0, t1] to animate 0 -> 1: the rear bumper bar. 0 attached, .5 one end has let go and it hangs with that end on the road, 1 it has fallen off and lies on the road behind the car. Setting it (or rearDamage) adds the bumper bar, so pass bumperDrop: 0 on the car's earlier shots too" },
  inkWidth: .012,
  build: ({ color = 0xd8322e, dent = false, plate = 'TYLR 1', puff = null, lights = false, doorOff = null, doorSide = -1, doorGone = false, hazards = false, fly = true, rearDamage = 0, rearDamageAt = null, airbags = null, bumperDrop = null } = {}) => {
    const g = g0(), ups = [], withDoor = doorOff || doorGone, body = toon(color), dark = toon(0x2a2430), chrome = toon(0xd9dce6), seat = toon(0xd9c3a0), L = 4.2, W = 1.8;
    const tails = [], pipes = [];
    // lower body: a long rounded wedge, bonnet lower at the front
    const bodyM = put(g, G.rbox(L, .5, W, .2), body, { y: .48 });
    put(g, G.rbox(1.5, .22, W * .96, .1), body, { x: 1.25, y: .7, rz: -.08 });   // bonnet
    const deckM = put(g, G.rbox(1.1, .22, W * .96, .1), body, { x: -1.5, y: .72, rz: .05 });   // rear deck
    for (const s of [-1, 1]) if (!(withDoor && s === doorSide)) put(g, G.rbox(1.6, .2, .16, .07), body, { x: -.1, y: .72, z: s * (W / 2 - .06) });   // door tops (the opening side gets a real door below)
    // cockpit: dark tub, two seats, steering wheel
    put(g, G.box(1.5, .1, W - .3), dark, { x: -.1, y: .62, noInk: true });
    for (const s of [-1, 1]) { put(g, G.rbox(.45, .14, .5, .06), seat, { x: -.25, y: .66, z: s * .33 }); put(g, G.rbox(.13, .4, .48, .06), seat, { x: -.5, y: .86, z: s * .33, rz: .2 }); }
    put(g, G.torus(.15, .025, 20), dark, { x: .35, y: .98, z: -.33, ry: Math.PI / 2, rx: .5 }); put(g, G.cyl(.02, .02, .3, 8), dark, { x: .45, y: .88, z: -.33, rz: .9 });
    // windshield frame + glass
