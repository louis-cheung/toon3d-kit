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
    put(g, G.box(.06, .34, W * .9), chrome, { x: .6, y: .9, rz: -.55 }); put(g, G.box(.04, .3, W * .86), glow(0xbfe6ff, { transparent: true, opacity: .35 }), { x: .62, y: .9, rz: -.55, noInk: true });
    // wheels with rims
    for (const [a, b] of [[-1.35, -1], [1.3, -1], [-1.35, 1], [1.3, 1]]) { put(g, G.cyl(.34, .34, .26, 24), toon(0x1c1820), { x: a, y: .34, z: b * (W / 2 - .05), rx: Math.PI / 2 });
      put(g, G.cyl(.2, .2, .27, 16), chrome, { x: a, y: .34, z: b * (W / 2 - .05), rx: Math.PI / 2, noInk: true }); }
    // lights, grille, plate, tailpipes
    for (const s of [-1, 1]) { put(g, G.sph(.12, 16, 10), glow(lights ? 0xfff6d0 : 0xf4f0e0), { x: L / 2 - .08, y: .58, z: s * .62, s: [.5, .8, 1.4], noInk: true }); tails.push(put(g, G.box(.04, .1, .32), glow(0xff4a4a), { x: -L / 2 + .01, y: .6, z: s * .6, noInk: true })); }
    put(g, G.box(.03, .14, .7), dark, { x: L / 2 + .005, y: .44, noInk: true });
    const plateM = put(g, G.plane(.52, .14), glow(0xffffff, { map: ctex(256, 70, (x, w, h) => { x.fillStyle = '#f6f2ea'; x.fillRect(0, 0, w, h); x.strokeStyle = INKC; x.lineWidth = 6; x.strokeRect(3, 3, w - 6, h - 6); x.fillStyle = '#1f3c88'; x.font = 'bold 50px Helvetica'; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText(plate, w / 2, h / 2 + 2); }, { key: 'plate' + plate }) }), { x: -L / 2 - .01, y: .42, ry: -Math.PI / 2, noInk: true });
    for (const s of [-1, 1]) pipes.push(put(g, G.cyl(.045, .045, .2, 12), chrome, { x: -L / 2 - .02, y: .3, z: s * .35, rz: Math.PI / 2 }));
    if (dent) {   // crumpled rear: the corner pushed in, a cracked light, a crease
      put(g, G.rbox(.3, .42, W * .7, .05), toon(0xb02622), { x: -L / 2 + .12, y: .48, z: .2, ry: .25, rz: .12 });
      put(g, G.box(.02, .3, .02), dark, { x: -L / 2 + .02, y: .55, z: .55, rz: .6, noInk: true });
    }
    if (puff) {   // stall smoke: grey puffs swelling up from the bonnet
      const pm = new THREE.MeshBasicMaterial({ color: 0x8a8794, transparent: true, depthWrite: false, toneMapped: false }), P = [];
      for (let i = 0; i < 6; i++) { const m = put(g, G.sph(.18, 14, 10), pm.clone(), { x: 1.3 + (i % 3 - 1) * .2, y: .9, z: (i % 2 ? .2 : -.2), noInk: true, shadow: false }); P.push(m); }
      g.userData.update = (sec) => { const k = c01((sec - puff[0]) / Math.max(.01, puff[1] - puff[0])); P.forEach((m, i) => { const kk = c01(k * 1.4 - i * .08); m.visible = kk > 0; m.scale.setScalar(.4 + kk * 2.2); m.position.y = .9 + kk * (.6 + i * .12); m.material.opacity = .85 * (1 - kk * .6); }); };
      ups.push(g.userData.update);
    }
    if (withDoor) {   // a real door on one side: hinge at its front edge (x .65); when it goes, a dark doorway and a torn hinge stay
      const sd = doorSide, zs = sd * (W / 2 + .005), hole = group(g);
      put(hole, G.plane(1.5, .46), glow(0xffffff, { map: ctex(300, 92, (x, w, h) => { x.fillStyle = '#3a2440'; x.fillRect(0, 0, w, h); x.fillStyle = '#d9c3a0'; x.beginPath(); x.roundRect(w * .3, h * .1, w * .34, h * .6, 10); x.fill();
        x.fillStyle = '#2a1830'; x.fillRect(0, h * .78, w, h * .22); x.strokeStyle = '#241726'; x.lineWidth = 6; x.strokeRect(3, 3, w - 6, h - 6); }, { key: 'cardoorhole' }) }), { x: -.1, y: .5, z: zs, ry: sd > 0 ? 0 : Math.PI, noInk: true });
      tornHinge(hole, .64, zs, sd);
      const pivot = group(g, { x: .65, y: .48, z: sd * (W / 2 - .02) }); pivot.scale.z = sd; pivot.add(carDoor(color, 0));   // mirrored on the -z side so the outside face points out
      const sparks = [], sparkM = new THREE.MeshBasicMaterial({ color: 0xffd36a, toneMapped: false, transparent: true });
      for (let i = 0; i < 9; i++) { const m = put(g, G.box(.12, .018, .018), sparkM, { x: .7, y: .5, z: sd * (W / 2 + .05), noInk: true, shadow: false }); m.visible = false; sparks.push([m, hash3(i, 2, 3), hash3(i, 5, 1)]); }
      const set = (sec) => {
        const k = doorGone ? 2 : doorOff ? (sec - doorOff[0]) / Math.max(.01, doorOff[1] - doorOff[0]) : -1;
        hole.visible = k >= .3; pivot.visible = k < (fly ? 1 : .3);
        if (k < .3) { const a = k < 0 ? 0 : sm(k / .3); pivot.position.set(.65, .48, sd * (W / 2 - .02)); pivot.rotation.set(Math.sin(sec * 50) * .03 * a, sd * .75 * a, 0); }
        else if (k < 1) { const u = (k - .3) / .7; pivot.position.set(.65 + 9 * u * u + 1.2 * u, .48 + 1.4 * u - 1.6 * u * u, sd * (W / 2 + .3 + 2.2 * u)); pivot.rotation.set(5 * u, sd * (.75 + 3 * u), 2.5 * u); }
        for (const [m, a, b] of sparks) { const u = (k - .22 - a * .1) / .3; m.visible = u > 0 && u < 1; if (!m.visible) continue;
          m.position.set(.7 + (a - .3) * 1.4 * u, .5 + (b - .2) * u - 1.2 * u * u, sd * (W / 2 + .05 + 1.1 * u * b)); m.rotation.set(0, a * 6, b * 3); sparkM.opacity = 1 - u * .5; }
      };
      set(0); ups.push(set);
    }
    if (hazards) {   // orange corner lights blinking at about 2.5 Hz, like an alarm
      const hm = glow(0xff9a2a), lamps = [];
      for (const [x, z] of [[L / 2 - .1, .82], [L / 2 - .1, -.82], [-L / 2 + .05, .82], [-L / 2 + .05, -.82]]) lamps.push(put(g, G.sph(.07, 12, 8), hm, { x, y: .62, z, s: [1, .7, .7], noInk: true }));
      const h0 = typeof hazards === 'number' ? hazards : -1; ups.push((sec) => { const on = sec >= h0 && Math.floor((sec - h0) * 5) % 2 === 0; hm.color.setHex(on ? 0xffb43a : 0x6a3a1a); });
    }
    // ---- v3 crash options (2026-11-13). None of this is built unless asked for, so the old car is unchanged. ----
    const dmgOn = rearDamage > 0 || !!rearDamageAt, dmgMax = rearDamage > 0 ? Math.min(1, rearDamage) : 1, CR = .45;   // CR: metres the rear is pushed in at full damage
    const dmgAt = (sec) => (!dmgOn ? 0 : rearDamageAt ? dmgMax * sm((sec - rearDamageAt[0]) / Math.max(.01, rearDamageAt[1] - rearDamageAt[0])) : dmgMax);
    if (dmgOn) {   // folded metal at the new rear face, creases down both flanks, the boot lid sprung up, a smashed tail light
      const crush = toon(0x9a1c1a), folds = group(g), creases = group(g);
      for (let i = 0; i < 4; i++) put(folds, G.box(.045, .36 - i * .035, W * (.9 - i * .05)), crush, { x: -.02 - i * .055, y: .47 + (i % 2) * .03, rz: (i % 2 ? -.62 : .62), ry: (i - 1.5) * .07 });   // an accordion: thin plates zigzagging
      for (const s of [-1, 1]) for (let i = 0; i < 3; i++) put(creases, G.box(.32, .022, .02), dark, { x: -.25 - i * .22, y: .42 + i * .07, z: s * (W / 2 + .012), rz: (i % 2 ? .5 : -.45), noInk: true });
      for (const [x, ry] of [[-.32, .25], [-.6, -.2]]) put(creases, G.box(.025, .02, W * .85), dark, { x, y: .86, ry, noInk: true });   // buckles across the boot lid
      const shards = []; for (let i = 0; i < 4; i++) shards.push(put(g, G.cone(.03, .07, 3), glow(0xff7a6a), { x: -L / 2 + .05, y: .45 + i * .05, z: .62 + (i - 1.5) * .07, rz: Math.PI / 2 + (i - 1.5) * .5, noInk: true }));
      const setDmg = (k) => {
        bodyM.scale.x = (L - CR * k) / L; bodyM.position.x = CR * k / 2;
        deckM.position.set(-1.5 + CR * k * .9, .72 + .05 * k, 0); deckM.rotation.z = .05 - .24 * k;
        folds.visible = creases.visible = k > .02; folds.position.x = -L / 2 + CR * k; folds.scale.set(1, .4 + .6 * k, 1);
        creases.position.x = -L / 2 + 1.0 + CR * k * .5; creases.scale.set(k, 1, 1);
        tails.forEach((m, i) => { m.position.x = -L / 2 + .01 + CR * k; m.material.color.setHex(k > .35 && i === 1 ? 0x4a1620 : 0xff4a4a); m.rotation.z = i === 1 ? .6 * k : 0; });
        shards.forEach((m) => { m.visible = k > .35; m.position.x = -L / 2 + .03 + CR * k; });
        plateM.position.x = -L / 2 - .01 + CR * k; plateM.position.y = .42 - .04 * k; plateM.rotation.z = .32 * k;
        pipes.forEach((m, i) => { m.position.x = -L / 2 - .02 + CR * k; m.rotation.set(0, (i ? .5 : -.3) * k, Math.PI / 2 - .25 * k); });
      };
      setDmg(dmgAt(0)); ups.push((sec) => setDmg(dmgAt(sec)));
    }
    if (dmgOn || bumperDrop != null) {   // the rear bumper bar: pivots on its driver-side end (-z)
      const bp = group(g), bar = group(bp); bar.position.z = .86;
      put(bar, G.rbox(.16, .13, 1.72, .05), body, {}); put(bar, G.box(.02, .04, 1.62), dark, { x: -.08, noInk: true }); put(bar, G.box(.04, .03, 1.5), chrome, { y: .07, noInk: true });
      const uAt = (sec) => (Array.isArray(bumperDrop) ? c01((sec - bumperDrop[0]) / Math.max(.01, bumperDrop[1] - bumperDrop[0])) : bumperDrop ?? .14 * dmgAt(sec));
      const setBump = (u, k) => {
        const x0 = -L / 2 - .05 + CR * k, a = sm(u / .5), b = c01((u - .5) / .5);
        // phase 1 (u 0..0.5): the +z end lets go, drops to the road and swings out behind the car, with a dying wobble
        let rx = .13 * a + .05 * Math.sin(u * 44) * a * (1 - a) * 2, ry = -.5 * a, y = .22, x = x0, rz = .3 * a, z = -.86;
        if (b > 0) {   // phase 2 (u 0.5..1): the other end lets go, the bar falls flat onto the road, bounces once and settles a little further back
          const fall = c01(b / .55), bounce = b > .55 ? Math.sin(c01((b - .55) / .3) * Math.PI) * .045 : 0;
          y = .22 - .155 * fall * fall + bounce; rx = .13 * (1 - fall); rz = .3 + .25 * fall; x = x0 - .28 * sm(b); ry = -.5 - .15 * sm(b); z = -.86 + .1 * sm(b);
        }
        bp.position.set(x, y, z); bp.rotation.set(rx, ry, rz);
      };
      setBump(uAt(0), dmgAt(0)); ups.push((sec) => setBump(uAt(sec), dmgAt(sec)));
    }
    if (airbags) {   // driver's from the wheel hub, passenger's from the dash, both blowing back toward the seats (-x)
      const pop = Array.isArray(airbags) ? airbags : null;
      for (const [x, y, z, r] of [[.33, .98, -.33, .26], [.5, .84, .33, .27]]) ups.push(airbagParts(g, r, { x, y, z, ry: -Math.PI / 2 }, pop, 1, null));
    }
    if (ups.length) { g.userData.update = (sec) => ups.forEach((f) => f(sec)); g.userData.update(0); }
    return g;
  },
});

register('car-door', {
  tags: ['vehicle', 'car', 'door', 'wreck', 'crash', 'rich-system'], aliases: ['torn-door'],
  desc: 'Tyler\'s red car door on its own (the one the bus takes off): red panel, top rail, handle, wing mirror, torn hinge shards and a cable at its front end. Origin at the hinge end; the panel runs back along -x 1.5 m, outside face +z. crumpled 0..1 dents and folds it.',
  opts: { color: 'red', crumpled: '0..1 (0)', hinge: 'false = no torn hinge bits' },
  inkWidth: .01,
  build: ({ color = 0xd8322e, crumpled = 0, hinge = true } = {}) => { const g = g0(); g.add(carDoor(color, crumpled)); if (hinge) tornHinge(g, .02, .02, 1); return g; },
});

// ---------- the city bus, outside ----------
function busSideTex(route) {
  return ctex(2048, 512, (x, w, h) => {
    x.fillStyle = '#f2f0ea'; x.fillRect(0, 0, w, h);
    x.fillStyle = '#1f8f86'; x.fillRect(0, h * .78, w, h * .1); x.fillStyle = '#f0b43a'; x.fillRect(0, h * .9, w, h * .04);
    // a side ad: the delivery app Ethan rides for
    x.fillStyle = '#ef7d2a'; x.beginPath(); x.roundRect(w * .52, h * .52, w * .3, h * .22, 18); x.fill(); x.strokeStyle = INKC; x.lineWidth = 8; x.stroke();
    x.fillStyle = '#fff6e8'; x.font = 'bold 74px Helvetica'; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText('EATS  in 20 min', w * .67, h * .63);
    x.fillStyle = '#1f3c88'; x.font = 'bold 60px Helvetica'; x.fillText(route, w * .2, h * .62);
  }, { key: 'busside' + route });
}
register('city-bus', {
  tags: ['vehicle', 'bus', 'transit', 'street', 'city', 'rich-system'], aliases: ['bus'],
  desc: 'Big city bus seen from outside: white and teal, a row of dark windows with passenger heads, a lit destination sign, front doors on the +z side near the front. Front points +x. doors: 0..1 open, or doorsAt: [t0, t1] to open them.',
  opts: { route: 'destination sign ("12 DOWNTOWN")', doors: '0..1', doorsAt: '[t0, t1] doors open over this span', heads: 'true = passenger heads in the windows', hangingDoor: "true = Tyler's red car door snagged on the front bumper, dangling (curb-side front corner)", hangingSide: '1 = +z corner (default) | -1' },
  inkWidth: .014,
  build: ({ route = '12  DOWNTOWN', doors = 0, doorsAt = null, heads = true, hangingDoor = false, hangingSide = 1 } = {}) => {
    const g = g0(), L = 11, W = 2.55, H = 3.05, white = toon(0xf2f0ea), side = toon(0xffffff, { map: busSideTex(route) }), dark = toon(0x262838);
    put(g, G.rbox(L, H - .45, W, .22), white, { y: .45 + (H - .45) / 2 });
    for (const s of [-1, 1]) put(g, G.plane(L - .4, H - .5), side, { y: .45 + (H - .45) / 2 - .05, z: s * (W / 2 + .005), ry: s > 0 ? 0 : Math.PI, noInk: true });
    // windows: a dark glass band each side, framed, with heads
    const glass = glow(0x2c3f6a), frame = toon(0x2a2a36);
    for (const s of [-1, 1]) { put(g, G.box(L - 2.2, 1.0, .03), glass, { x: -.6, y: 2.2, z: s * (W / 2 + .02), noInk: true });
      for (let i = 0; i <= 6; i++) put(g, G.box(.08, 1.04, .05), frame, { x: -.6 - (L - 2.2) / 2 + i * (L - 2.2) / 6, y: 2.2, z: s * (W / 2 + .025), noInk: true });
      if (heads) for (let i = 0; i < 6; i++) if ((i + (s > 0 ? 0 : 1)) % 3 !== 2) { const hx = -.6 - (L - 2.2) / 2 + (i + .5) * (L - 2.2) / 6;
        put(g, G.sph(.17, 14, 10), glow(0x1e2a48), { x: hx, y: 2.2, z: s * (W / 2 - .05), s: [1, 1.15, 1], noInk: true }); put(g, G.box(.5, .25, .1), glow(0x1e2a48), { x: hx, y: 1.85, z: s * (W / 2 - .05), noInk: true }); } }
    // front: big windshield, destination sign, lights
    put(g, G.box(.04, 1.5, W - .3), glow(0x3a5a8a), { x: L / 2 + .14, y: 2.0, noInk: true });   // + .14: the rounded body's bevel stands .13 proud of L / 2
    const sign = ctex(1024, 160, (x, w, h) => { x.fillStyle = '#121018'; x.fillRect(0, 0, w, h); x.fillStyle = '#ffb83a'; x.font = 'bold 110px Courier New, monospace'; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText(route, w / 2, h / 2 + 6); }, { key: 'bussign' + route });
    put(g, G.plane(W - .5, .34), glow(0xffffff, { map: sign }), { x: L / 2 + .16, y: 2.9, ry: Math.PI / 2, noInk: true });
    for (const s of [-1, 1]) put(g, G.sph(.13, 14, 10), glow(0xfff4cc), { x: L / 2 + .15, y: .85, z: s * .95, s: [.4, 1, 1], noInk: true });
    put(g, G.box(.12, .35, W + .05), dark, { x: L / 2 + .1, y: .55 });   // bumper
    put(g, G.box(.12, .35, W + .05), dark, { x: -L / 2 + .02, y: .55 });
    // wheels
    for (const [a, b] of [[-3.4, -1], [3.2, -1], [-3.4, 1], [3.2, 1]]) { put(g, G.cyl(.52, .52, .34, 24), toon(0x1c1820), { x: a, y: .52, z: b * (W / 2 - .12), rx: Math.PI / 2 }); put(g, G.cyl(.26, .26, .35, 16), toon(0xc9ccd6), { x: a, y: .52, z: b * (W / 2 - .12), rx: Math.PI / 2, noInk: true }); }
    // front doors on +z: two glass leaves that slide apart
    const dg = glow(0x456896), leaves = [];
    for (const s of [-1, 1]) { const lf = group(g, { x: L / 2 - 1.05 + s * .32, y: 1.45, z: W / 2 + .03 }); put(lf, G.box(.62, 2.0, .04), frame, { noInk: true }); put(lf, G.box(.5, 1.8, .05), dg, { noInk: true }); leaves.push([lf, s]); }
    const setDoors = (k) => { for (const [lf, s] of leaves) { lf.position.x = L / 2 - 1.05 + s * (.32 + .3 * k); lf.position.z = W / 2 + .03 + .12 * k; } };
    setDoors(doors);
    if (doorsAt) g.userData.update = (sec) => setDoors(sm((sec - doorsAt[0]) / Math.max(.01, doorsAt[1] - doorsAt[0])));
    if (hangingDoor) {   // the car door hooked on the bumper by its hinge end, outside face forward (+x), the far end dragging to the road at the corner
      const hd = group(g, { x: L / 2 + .16, y: .8, z: -hangingSide * .3, ry: Math.PI / 2 }); hd.scale.x = hangingSide;
      const d = carDoor(0xd8322e, .55); d.rotation.z = .5; hd.add(d); tornHinge(hd, .02, .02, 1);
    }
    return g;
  },
});

// ---------- farebox ----------
// screen states: idle (TAP CARD), declined (red), paid (FARE / BALANCE), each over a timeline.
function drawFare(x, w, h, st) {
  const bg = st.state === 'declined' ? '#e2463b' : st.state === 'paid' ? '#2f9a5a' : '#173a5a';
  x.fillStyle = bg; x.fillRect(0, 0, w, h); x.strokeStyle = '#0d0b12'; x.lineWidth = 14; x.strokeRect(7, 7, w - 14, h - 14);
  x.fillStyle = '#ffffff'; x.textAlign = 'center'; x.textBaseline = 'middle';
  if (st.state === 'declined') { x.font = '900 96px Helvetica'; x.fillText('DECLINED', w / 2, h * .42); x.font = 'bold 50px Helvetica'; x.fillText('INSUFFICIENT FUNDS', w / 2, h * .72); }
  else if (st.state === 'paid') { x.font = 'bold 62px Helvetica'; x.textAlign = 'left'; x.fillText('FARE', 40, h * .3); x.fillText('BALANCE', 40, h * .7); x.textAlign = 'right'; x.font = '900 78px Helvetica'; x.fillText(st.fare, w - 40, h * .3); x.fillText(st.balance, w - 40, h * .7); }
  else { x.font = '900 84px Helvetica'; x.fillText('TAP CARD', w / 2, h * .42); x.font = 'bold 46px Helvetica'; x.fillText('FARE ' + st.fare, w / 2, h * .72); }
}
register('farebox', {
  tags: ['bus', 'transit', 'pay', 'fare', 'rich-system'], aliases: ['fare-machine'],
  desc: 'Bus farebox on a post: a big readable screen (TAP CARD / DECLINED in red / FARE and BALANCE in green), a card pad and a status light. Screen faces +z, top at y 1.2. screens: [{at, state}] changes it over the shot.',
  opts: { state: "'idle' | 'declined' | 'paid'", fare: "'$2.75'", balance: "'$0.00'", screens: '[{at: sec, state, fare, balance}]' },
  inkWidth: .008,
  build: (o = {}) => {
    const base = { state: 'idle', fare: '$2.75', balance: '$0.00', ...o }, g = g0(), body = toon(0x3a3e4e), steel = toon(0xa8adbb);
    put(g, G.cyl(.06, .08, .8, 16), steel, { y: .4 }); put(g, G.rbox(.42, .5, .34, .05), body, { y: .98 });
    const sc = liveTex(640, 400, (x, w, h, sec) => drawFare(x, w, h, stateAt(base, base.screens, sec)), (sec) => stateAt(base, base.screens, sec).state);
    put(g, G.plane(.34, .21), glow(0xffffff, { map: sc.tex }), { y: 1.08, z: .2, rx: -.15, noInk: true });
    put(g, G.rbox(.22, .13, .06, .02), toon(0x26242e), { y: .82, z: .18 });
    put(g, G.plane(.16, .09), glow(0xffffff, { map: ctex(160, 90, (x, w, h) => { x.fillStyle = '#e8eef6'; x.fillRect(0, 0, w, h); x.strokeStyle = '#3a4a6a'; x.lineWidth = 5; for (const r of [14, 26, 38]) { x.beginPath(); x.arc(w / 2 - 20, h / 2, r, -.8, .8); x.stroke(); } }, { key: 'pad' }) }), { y: .82, z: .212, noInk: true });
    const lamp = put(g, G.sph(.035, 12, 8), glow(0x7a7f8e), { y: 1.27, noInk: true });
    g.userData.update = (sec) => { sc.update(sec); const st = stateAt(base, base.screens, sec).state; lamp.material.color.setHex(st === 'declined' ? (Math.floor(sec * 6) % 2 ? 0xff3a30 : 0x7a1a18) : st === 'paid' ? 0x3cff7a : 0x7a7f8e); };
    g.userData.update(0); return g;
  },
});

// ---------- traffic light ----------
register('traffic-light', {
  tags: ['street', 'city', 'road', 'signal', 'rich-system'], aliases: ['stoplight', 'signal'],
  desc: 'Traffic light on a pole with an arm: red, amber and green lamps. Faces +z. state, or screens: [{at, state}] to switch (red to green).',
  opts: { state: "'red' | 'amber' | 'green'", screens: '[{at, state}]', arm: 'arm length (1.6)' },
  build: (o = {}) => {
    const base = { state: 'red', ...o }, g = g0(), k = toon(0x2e3040), arm = o.arm ?? 1.6;
    put(g, G.cyl(.07, .09, 4.2, 12), k, { y: 2.1 }); put(g, G.box(arm, .1, .1), k, { x: arm / 2, y: 4.1 });
    const box = group(g, { x: arm - .1, y: 3.55 }); put(box, G.rbox(.36, 1.0, .3, .06), toon(0xe0b42a));
    const L = {}; [['red', .3, 0xff3a30], ['amber', 0, 0xffb42a], ['green', -.3, 0x3cff7a]].forEach(([n, y, c]) => { L[n] = [put(box, G.cyl(.12, .12, .04, 18), glow(0x3a3440), { y, z: .16, rx: Math.PI / 2, noInk: true }), c]; put(box, G.box(.3, .04, .14), k, { y: y + .13, z: .2, noInk: true }); });
    g.userData.update = (sec) => { const st = stateAt(base, base.screens, sec).state; for (const n in L) L[n][0].material.color.setHex(n === st ? L[n][1] : 0x3a3440); };
    g.userData.update(0); return g;
  },
});

// ---------- car showroom ----------
register('car-showroom', {
  tags: ['building', 'cars', 'dealership', 'rich', 'street', 'rich-system'], aliases: ['dealership', 'showroom'],
  desc: 'Glass car showroom front: tall glass wall, a bright white floor, the same red convertible on a turntable in the window, spot lights, a sign on top. Front faces +z, 9 m wide.',
  opts: { sign: "sign text ('PRESTIGE MOTORS')", carColor: 'colour of the car in the window', price: "price card on a stand beside the car ('$148,000'); off by default", priceAt: '[x, z] of the price stand ([2.3, -1.0])', decal: 'true = the name in gold letters on the glass, low enough to read from a bus window' },
  inkWidth: .014,
  build: ({ sign = 'PRESTIGE  MOTORS', carColor = 0xd8322e, price = null, priceAt = [2.3, -1.0], decal = false } = {}) => {
    const g = g0(), W = 9, H = 4.6, D = 5, frame = toon(0x2a2c38);
    put(g, G.box(W, .1, D), toon(0xf4f2ee), { y: .05, z: -D / 2 }); put(g, G.box(W, H, .2), toon(0xd8dae4), { y: H / 2, z: -D });
    for (const s of [-1, 1]) put(g, G.box(.3, H, D), toon(0xd8dae4), { x: s * (W / 2), y: H / 2, z: -D / 2 });
    put(g, G.box(W + .4, .5, D + .2), toon(0x22242e), { y: H + .2, z: -D / 2 });
    put(g, G.plane(W - .6, .9), glow(0xffffff, { map: ctex(1600, 160, (x, w, h) => { x.fillStyle = '#16141c'; x.fillRect(0, 0, w, h); x.fillStyle = '#e6c25a'; x.font = 'bold 120px Georgia, serif'; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText(sign, w / 2, h / 2 + 6); }, { key: 'showsign' + sign }) }), { y: H + .2, z: .02, noInk: true });
    put(g, G.box(W, H, .04), glow(0xcfe8ff, { transparent: true, opacity: .16, depthWrite: false }), { y: H / 2, z: 0, noInk: true });
    for (let i = 0; i <= 4; i++) put(g, G.box(.08, H, .1), frame, { x: -W / 2 + i * W / 4, y: H / 2, noInk: true });
    put(g, G.cyl(1.9, 1.9, .12, 40), toon(0xeceaf2), { y: .16, z: -2.4 });
    const car = find('sports-car').build({ color: carColor }); car.position.set(0, .22, -2.4); car.rotation.y = .5; car.traverse((m) => { if (m.isMesh && !m.userData.isInk) m.userData.noInk = false; }); g.add(car);
    for (const x of [-2.6, 0, 2.6]) put(g, G.cone(.25, .35, 16), glow(0xfff6dc), { x, y: H - .3, z: -1.4, noInk: true });
    if (decal) put(g, G.plane(2.5, .42), glow(0xffffff, { transparent: true, map: ctex(1400, 200, (x, w, h) => { x.clearRect(0, 0, w, h); x.fillStyle = 'rgba(22,20,28,.72)'; x.fillRect(0, 0, w, h); x.fillStyle = '#e6c25a'; x.font = 'bold 130px Georgia, serif'; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText(sign, w / 2, h / 2 + 6, w - 60); }, { key: 'showdecal' + sign }) }), { y: 2.45, z: .04, noInk: true });
    if (price) {   // a price card on a chrome stand, angled to the street, beside the car
      const st = group(g, { x: priceAt[0], z: priceAt[1], ry: -.25 * Math.sign(priceAt[0] || 1) }), chrome = toon(0xd9dce6);
      put(st, G.cyl(.25, .3, .05, 24), chrome, { y: .17 }); put(st, G.cyl(.025, .025, 1.0, 10), chrome, { y: .65 });
      put(st, G.box(1.0, .66, .04), toon(0x16141c), { y: 1.38 });
      put(st, G.plane(.94, .6), glow(0xffffff, { map: ctex(940, 600, (x, w, h) => { x.fillStyle = '#fbf6ea'; x.fillRect(0, 0, w, h); x.strokeStyle = '#e6c25a'; x.lineWidth = 18; x.strokeRect(14, 14, w - 28, h - 28);
        x.fillStyle = '#2b2230'; x.textAlign = 'center'; x.textBaseline = 'middle'; x.font = 'bold 70px Helvetica'; x.fillText('SPECIAL', w / 2, 130); x.fillStyle = '#d5322c'; x.font = '900 200px Helvetica'; x.fillText(price, w / 2, 340, w - 70); x.fillStyle = '#2b2230'; x.font = 'bold 54px Helvetica'; x.fillText('DRIVE TODAY', w / 2, 500); }, { key: 'price' + price }) }), { y: 1.38, z: .022, noInk: true });
    }
    return g;
  },
});

register('cane', { tags: ['old', 'walking', 'prop', 'rich-system'], aliases: ['walking-stick'], desc: 'Wooden walking cane with a curved handle, 0.9 m. Stands on y 0.', opts: {},
  build: () => { const g = g0(), m = toon(0x6a4630); put(g, G.cyl(.012, .014, .82, 10), m, { y: .41 }); put(g, G.torus(.05, .013, 14, Math.PI), m, { x: .05, y: .82 }); return g; } });

register('tip-sign', { tags: ['bus', 'sign', 'handwritten', 'rich-system'], desc: 'Handwritten cardboard sign taped up by the driver: "TIPS? @bigmike_drives" (no app logos). Faces +z, 0.36 x 0.26 m.',
  opts: { text: 'two lines, \\n separated' },
  build: ({ text = 'TIPS?\n@bigmike_drives' } = {}) => { const g = g0();
    const t = ctex(720, 520, (x, w, h) => { x.fillStyle = '#d9b98a'; x.fillRect(0, 0, w, h); x.fillStyle = '#c9a676'; for (let i = 0; i < 9; i++) x.fillRect(0, i * 60 + 10, w, 4);
      x.fillStyle = 'rgba(240,240,220,.75)'; x.fillRect(w * .4, -10, 140, 60); x.fillStyle = '#1c1830'; x.textAlign = 'center'; x.textBaseline = 'middle';
      const L = text.split('\n'); x.font = 'bold 150px "Marker Felt", "Chalkboard SE", "Comic Sans MS", sans-serif'; x.fillText(L[0], w / 2, h * .34);
      x.font = 'bold 70px "Marker Felt", "Chalkboard SE", "Comic Sans MS", sans-serif'; x.fillText(L[1] || '', w / 2, h * .74, w - 40); }, { key: 'tip' + text });
    put(g, G.box(.36, .26, .006), toon(0xffffff, { map: t }), { rz: .04 }); return g; } });

// ---------- the SYSTEM panel ----------
// A floating blue glass HUD (refs 08, 09): cut corners, cyan edge glow, "SYSTEM" and "V1.0" in the corners, a big title,
// then rows. A reward row is gold and can fill; a task row can carry a countdown; a load row is a progress bar.
// open: [t0, t1] unfolds it from a bright line; flicker: [t0, t1] a ghost flash (the flash-forward); out: sec it blinks out.
function panelShape(x, X, Y, w, h, c) { x.beginPath(); x.moveTo(X + c, Y); x.lineTo(X + w - c, Y); x.lineTo(X + w, Y + c); x.lineTo(X + w, Y + h - c); x.lineTo(X + w - c, Y + h); x.lineTo(X + c, Y + h); x.lineTo(X, Y + h - c); x.lineTo(X, Y + c); x.closePath(); }
function drawPanel(x, W, H, o, sec) {
  const cy = '#7fe8ff', gold = '#ffd36a';
  panelShape(x, 20, 20, W - 40, H - 40, 46); const bg = x.createLinearGradient(0, 0, 0, H); bg.addColorStop(0, 'rgba(18,40,92,.88)'); bg.addColorStop(1, 'rgba(10,22,58,.9)'); x.fillStyle = bg; x.fill();
  x.save(); panelShape(x, 20, 20, W - 40, H - 40, 46); x.clip(); x.strokeStyle = 'rgba(127,232,255,.08)'; x.lineWidth = 2; for (let i = 0; i < W; i += 36) { x.beginPath(); x.moveTo(i, 0); x.lineTo(i, H); x.stroke(); } for (let j = 0; j < H; j += 36) { x.beginPath(); x.moveTo(0, j); x.lineTo(W, j); x.stroke(); }
  const sweep = ((sec * .5) % 1.6) - .3; const sg = x.createLinearGradient(W * sweep - 200, 0, W * sweep + 200, H * .3); sg.addColorStop(0, 'rgba(255,255,255,0)'); sg.addColorStop(.5, 'rgba(200,240,255,.12)'); sg.addColorStop(1, 'rgba(255,255,255,0)'); x.fillStyle = sg; x.fillRect(0, 0, W, H); x.restore();
  x.shadowColor = cy; x.shadowBlur = 26; x.strokeStyle = cy; x.lineWidth = 9; panelShape(x, 20, 20, W - 40, H - 40, 46); x.stroke(); x.shadowBlur = 0;
  x.lineWidth = 3; x.strokeStyle = 'rgba(127,232,255,.6)'; panelShape(x, 40, 40, W - 80, H - 80, 36); x.stroke();
  x.fillStyle = cy; x.font = 'bold 34px Helvetica'; x.textBaseline = 'middle'; x.textAlign = 'left'; x.fillText('SYSTEM', 80, 84); x.fillRect(80, 106, 160, 3); x.textAlign = 'right'; x.fillText('V1.0', W - 80, 84);
  let y = 120;
  if (o.kicker) { x.textAlign = 'center'; x.fillStyle = '#bfefff'; x.font = 'bold 52px Helvetica'; x.fillText(o.kicker, W / 2, y + 40); y += 80; }
  if (o.title) { const lines = String(o.title).split('\n'); x.textAlign = 'center'; x.shadowColor = cy; x.shadowBlur = 30; x.fillStyle = '#f4fcff'; const tp = o.titleSize || 112, lh = o.titleSize ? tp * 1.05 : 118; x.font = `900 ${tp}px Helvetica`;   // titleSize (Ep 3, default 112): title px on the 1024-wide panel
    lines.forEach((l, i) => x.fillText(l, W / 2, y + 70 * tp / 112 + i * lh, W - 160)); x.shadowBlur = 0; y += 40 + lines.length * lh;
    x.strokeStyle = cy; x.lineWidth = 4; x.beginPath(); x.moveTo(W * .2, y); x.lineTo(W * .45, y); x.moveTo(W * .55, y); x.lineTo(W * .8, y); x.stroke();
    x.fillStyle = cy; x.beginPath(); x.moveTo(W / 2, y - 16); x.lineTo(W / 2 + 18, y); x.lineTo(W / 2, y + 16); x.lineTo(W / 2 - 18, y); x.closePath(); x.fill(); y += 40; }
  for (const r of o.rows || []) {
    const isGold = r.kind === 'reward', col = isGold ? gold : cy, rh = r.kind === 'load' ? 150 : 210, X = 80, w = W - 160;
    x.fillStyle = isGold ? 'rgba(90,64,10,.55)' : 'rgba(20,60,120,.6)'; panelShape(x, X, y, w, rh, 26); x.fill();
    if (isGold && r.fill) { const k = sm((sec - r.fill[0]) / Math.max(.01, r.fill[1] - r.fill[0])); x.save(); panelShape(x, X, y, w, rh, 26); x.clip(); const fg = x.createLinearGradient(X, 0, X + w, 0); fg.addColorStop(0, 'rgba(255,200,80,.55)'); fg.addColorStop(1, 'rgba(255,230,140,.35)'); x.fillStyle = fg; x.fillRect(X, y, w * k, rh); x.restore(); }
    x.shadowColor = col; x.shadowBlur = 18; x.strokeStyle = col; x.lineWidth = 6; panelShape(x, X, y, w, rh, 26); x.stroke(); x.shadowBlur = 0;
    // icon: a gift for rewards, a clipboard for tasks
    const ix = X + 90, iy = y + rh / 2; x.strokeStyle = col; x.fillStyle = col; x.lineWidth = 7;
    if (isGold) { x.fillRect(ix - 42, iy - 14, 84, 52); x.fillRect(ix - 50, iy - 34, 100, 22); x.fillStyle = 'rgba(90,64,10,1)'; x.fillRect(ix - 6, iy - 34, 12, 72); x.beginPath(); x.ellipse(ix - 18, iy - 44, 18, 10, -.4, 0, 7); x.ellipse(ix + 18, iy - 44, 18, 10, .4, 0, 7); x.stroke(); }
    else if (r.kind === 'task') { x.beginPath(); x.roundRect(ix - 38, iy - 50, 76, 100, 10); x.stroke(); x.fillRect(ix - 18, iy - 60, 36, 18); for (let k = 0; k < 3; k++) { x.beginPath(); x.moveTo(ix - 24, iy - 16 + k * 26); x.lineTo(ix - 16, iy - 8 + k * 26); x.lineTo(ix - 4, iy - 24 + k * 26); x.stroke(); x.fillRect(ix + 4, iy - 18 + k * 26, 22, 6); } }
    if (r.kind === 'load') { const k = r.loadAt ? c01((sec - r.loadAt[0]) / Math.max(.01, r.loadAt[1] - r.loadAt[0])) : .6; x.fillStyle = '#bfefff'; x.font = 'bold 50px Helvetica'; x.textAlign = 'left'; x.fillText(r.label || 'LOADING', X + 40, y + 50);
      x.strokeStyle = cy; x.lineWidth = 4; x.strokeRect(X + 40, y + 88, w - 80, 34); x.fillStyle = cy; x.fillRect(X + 46, y + 94, (w - 92) * k, 22); }
    else { x.textAlign = 'left'; x.fillStyle = col; x.font = 'bold 48px Helvetica'; x.fillText(r.label || '', X + 170, y + 62); x.fillStyle = isGold ? '#ffe9a8' : '#f4fcff'; x.font = `900 ${r.size || 70}px Helvetica`; x.fillText(r.text || '', X + 170, y + 140, w - 200);
      if (r.countdown != null) { const s = Math.max(0, Math.ceil(r.countdown - Math.max(0, sec - (r.countAt || 0)))); const t = `${String(Math.floor(s / 3600)).padStart(2, '0')}:${String(Math.floor(s / 60) % 60).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;
        x.textAlign = 'right'; x.fillStyle = '#ff8a7a'; x.font = '900 58px Courier New, monospace'; x.fillText(t, X + w - 34, y + 62); } }
    y += rh + 30;
