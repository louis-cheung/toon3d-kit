// Rich System Ep 3 ("Every Lie Pays", 2026-11-14): the restaurant from the street at night. Ethan walks out onto the sidewalk; through the
// big front window behind him, Madison is still in the booth with the check.
import { THREE, toon, glow, G, put, group, ctex, rng, pointLight } from '../core.js';
import { register, raw } from '../registry.js';

function brickTex() {
  return ctex(512, 512, (x, W, H) => { x.fillStyle = '#8a3a34'; x.fillRect(0, 0, W, H); const r = rng(9), bh = 32, bw = 96;
    for (let row = 0; row < H / bh; row++) for (let c = -1; c < W / bw + 1; c++) { const off = (row % 2) * bw / 2, shade = .85 + r() * .3;
      x.fillStyle = `rgb(${Math.round(150 * shade)},${Math.round(62 * shade)},${Math.round(54 * shade)})`; x.fillRect(c * bw + off + 3, row * bh + 3, bw - 6, bh - 6); }
    x.fillStyle = 'rgba(60,20,30,.18)'; for (let i = 0; i < 26; i++) x.fillRect(r() * W, r() * H, 70, 20); }, { key: 'frontBrick', repeat: [5, 2.5] });
}
function sidewalkTex() {
  return ctex(512, 512, (x, W) => { x.fillStyle = '#6a6f88'; x.fillRect(0, 0, W, W); x.strokeStyle = '#4a4e66'; x.lineWidth = 6; for (let i = 0; i <= 4; i++) { x.beginPath(); x.moveTo(i * W / 4, 0); x.lineTo(i * W / 4, W); x.stroke(); x.beginPath(); x.moveTo(0, i * W / 4); x.lineTo(W, i * W / 4); x.stroke(); }
    const r = rng(3); x.fillStyle = 'rgba(255,255,255,.06)'; for (let i = 0; i < 40; i++) { x.beginPath(); x.arc(r() * W, r() * W, 2 + r() * 5, 0, 7); x.fill(); } }, { key: 'frontWalk', repeat: [6, 2] });
}
function roadTex() {
  return ctex(512, 256, (x, W, H) => { x.fillStyle = '#2a2c44'; x.fillRect(0, 0, W, H); x.fillStyle = '#f0d060'; for (let i = 0; i < 4; i++) x.fillRect(i * 128 + 20, H / 2 - 6, 70, 12); const r = rng(5); x.fillStyle = 'rgba(255,255,255,.05)'; for (let i = 0; i < 60; i++) x.fillRect(r() * W, r() * H, 3, 3); }, { key: 'frontRoad', repeat: [4, 1] });
}
function wallpaperTex() {
  return ctex(256, 256, (x, w) => { x.fillStyle = '#e9b98a'; x.fillRect(0, 0, w, w); x.fillStyle = '#d99a6a'; for (let i = 0; i < 4; i++) for (let j = 0; j < 4; j++) { x.save(); x.translate(i * 64 + 32 + (j % 2) * 32, j * 64 + 32); x.rotate(Math.PI / 4); x.fillRect(-12, -12, 24, 24); x.restore(); }
    x.fillStyle = '#c7362c'; for (let i = 0; i < 4; i++) for (let j = 0; j < 4; j++) { x.beginPath(); x.arc(i * 64 + 32 + (j % 2) * 32, j * 64 + 32, 4, 0, 7); x.fill(); } }, { key: 'frontPaper', repeat: [6, 2] });
}
function signTex(name) {
  return ctex(1024, 256, (x, w, h) => { x.fillStyle = '#1c1430'; x.fillRect(0, 0, w, h); x.strokeStyle = '#f2c230'; x.lineWidth = 10; x.strokeRect(12, 12, w - 24, h - 24);
    x.font = 'italic 900 150px Georgia, serif'; x.textAlign = 'center'; x.textBaseline = 'middle'; x.shadowColor = '#ff7ab0'; x.shadowBlur = 30; x.fillStyle = '#ffd0e4'; x.fillText(name, w / 2, h / 2 + 8, w - 80); x.shadowBlur = 0; }, { key: 'frontSign' + name });
}
function awningTex() { return ctex(256, 128, (x, w, h) => { for (let i = 0; i < 8; i++) { x.fillStyle = i % 2 ? '#f6ecd8' : '#c7362c'; x.fillRect(i * w / 8, 0, w / 8, h); } }, { key: 'frontAwning' }); }
function streetBackTex() {
  return ctex(1024, 512, (x, w, h) => { const g = x.createLinearGradient(0, 0, 0, h); g.addColorStop(0, '#0f1640'); g.addColorStop(.7, '#2a2a6a'); g.addColorStop(1, '#4a3a7a'); x.fillStyle = g; x.fillRect(0, 0, w, h);
    const r = rng(17); x.fillStyle = '#fff'; for (let i = 0; i < 40; i++) { x.globalAlpha = .3 + r() * .5; x.beginPath(); x.arc(r() * w, r() * h * .35, 1 + r() * 1.5, 0, 7); x.fill(); } x.globalAlpha = 1;
    x.fillStyle = '#f4f0dc'; x.beginPath(); x.arc(w * .82, h * .16, 26, 0, 7); x.fill();   // the moon
    for (let i = 0; i < 9; i++) { const bw = 100 + r() * 70, bh = 180 + r() * 220, bx = i * 118 - 10; x.fillStyle = i % 2 ? '#24204e' : '#2e2a5e'; x.fillRect(bx, h - bh, bw, bh);
      for (let j = 0; j < 22; j++) if (r() < .45) { x.fillStyle = r() < .7 ? '#ffd890' : '#9fd0ff'; x.fillRect(bx + 10 + (j % 4) * 22, h - bh + 14 + Math.floor(j / 4) * 30, 12, 16); } } }, { key: 'frontBack' });
}

register('restaurant-front', {
  kind: 'set', tags: ['restaurant', 'street', 'night', 'exterior', 'sidewalk', 'date', 'rich-system'], aliases: ['restaurant-exterior', 'date-night-street'],
  desc: 'The date restaurant from the street at night. Brick facade along x at z 0 (x -8..8, 5 m tall) with a big front window (x -2.4..2.4, y .75..2.9, glass you can see through) under a striped red awning, a glowing pink script sign (name), a glass door at x 3.7 with warm light, sconces, planters and a menu easel. Inside (z 0..-3.2): warm wallpaper, string lights, pendant lamps, art: put booth-table at spots.booth (it reads through the window). Outside (+z): a tiled sidewalk to z 3.4, a curb, the road to z 11 (yellow dashes), a parked car, a street lamp at x -2.6 (head over the sidewalk at z 2.3) with a light cone, a fire hydrant, and a night street of lit buildings with a moon across the road. Wide enough for 16:9.',
  opts: { name: "the sign ('Bella Luna')", car: 'false = no parked car' },
  build: ({ name = 'Bella Luna', car = true } = {}) => {
    const g = new THREE.Group(), brick = toon(0xffffff, { map: brickTex() }), trim = toon(0x2a1a22), cream = toon(0xf3e6d4);
    // facade with the window and door openings (built from boxes round them)
    const Z = 0, T = .3;
    put(g, G.box(5.6, 5, T), brick, { x: -5.2, y: 2.5, z: Z }); put(g, G.box(.7, 5, T), brick, { x: 2.75, y: 2.5, z: Z });
    put(g, G.box(3.7, 5, T), brick, { x: 6.15, y: 2.5, z: Z });
    put(g, G.box(4.8, .75, T), brick, { y: .375, z: Z }); put(g, G.box(4.8, 2.1, T), brick, { y: 3.95, z: Z });
    put(g, G.box(1.2, 2.5, T), brick, { x: 3.7, y: 3.75, z: Z });
    put(g, G.box(16, .3, .5), trim, { y: 5.05, z: Z + .05 });   // cornice
    // window frame and mullions
    for (const [w, h, x, y] of [[5.0, .14, 0, 2.92], [5.0, .18, 0, .72], [.14, 2.3, -2.42, 1.82], [.14, 2.3, 2.42, 1.82], [.08, 2.15, -.8, 1.82], [.08, 2.15, .8, 1.82]]) put(g, G.box(w, h, .2), trim, { x, y, z: Z + .06 });
    put(g, G.plane(4.8, 2.15), new THREE.MeshBasicMaterial({ color: 0xbfd8ff, transparent: true, opacity: .1, depthWrite: false }), { y: 1.82, z: Z + .02, noInk: true, shadow: false });
    for (let i = 0; i < 3; i++) put(g, G.plane(.18, 2.0), new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: .1, depthWrite: false }), { x: -1.8 + i * 1.6, y: 1.9, z: Z + .03, rz: -.5, noInk: true, shadow: false });   // glass streaks
    // gold lettering on the glass
    const lt = ctex(512, 96, (x, w, h) => { x.fillStyle = '#f2c230'; x.font = 'bold 54px Georgia, serif'; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText('wine  ·  dinner  ·  late', w / 2, h / 2); }, { key: 'frontGlassText' });
    put(g, G.plane(1.8, .34), new THREE.MeshBasicMaterial({ map: lt, transparent: true, toneMapped: false }), { x: -1.6, y: 1.0, z: Z + .04, noInk: true, shadow: false });
    // the door: frame, glass with warm light, a brass handle, OPEN sign
    put(g, G.box(1.2, .12, .2), trim, { x: 3.7, y: 2.5, z: Z + .06 }); for (const x of [3.12, 4.28]) put(g, G.box(.1, 2.5, .2), trim, { x, y: 1.25, z: Z + .06 });
    put(g, G.plane(1.0, 2.35), glow(0xffcf8a), { x: 3.7, y: 1.2, z: Z - .05, noInk: true, shadow: false }); put(g, G.cyl(.02, .02, .5, 8), toon(0xd9a441), { x: 3.4, y: 1.2, z: Z + .12 });
    const open = ctex(256, 128, (x, w, h) => { x.fillStyle = '#1c1430'; x.fillRect(0, 0, w, h); x.font = '900 70px Helvetica, Arial'; x.textAlign = 'center'; x.textBaseline = 'middle'; x.shadowColor = '#ff3a5a'; x.shadowBlur = 20; x.fillStyle = '#ff7a8a'; x.fillText('OPEN', w / 2, h / 2 + 4); }, { key: 'frontOpen' });
    put(g, G.plane(.5, .25), glow(0xffffff, { map: open }), { x: 3.7, y: 1.9, z: Z + .02, noInk: true, shadow: false });
    // awning over the window: a slanted striped sheet with a scalloped edge
    const aw = group(g, { y: 3.25, z: Z + .15 }); put(aw, G.box(5.4, .05, 1.1), toon(0xffffff, { map: awningTex() }), { z: .5, rx: .42 });
    for (let i = 0; i < 12; i++) put(aw, G.sph(.23, 14, 8), toon(i % 2 ? 0xf6ecd8 : 0xc7362c), { x: -2.48 + i * .45, y: -.24, z: 1.0, s: [1, .55, .3] });
    // the sign
    put(g, G.box(4.0, 1.0, .16), trim, { y: 4.35, z: Z + .1 }); put(g, G.plane(3.9, .95), glow(0xffffff, { map: signTex(name) }), { y: 4.35, z: Z + .19, noInk: true, shadow: false });
    // sconces, planters with small trees, a menu easel
    for (const x of [2.85, 4.55]) { put(g, G.cyl(.09, .12, .28, 14), toon(0x2a1a22), { x, y: 2.3, z: Z + .25 }); put(g, G.sph(.08, 12, 8), glow(0xfff0c0), { x, y: 2.2, z: Z + .28, noInk: true }); }
    for (const x of [-3.0, 2.75, 5.0]) { put(g, G.box(.6, .55, .6), toon(0x3a4a8a), { x, y: .275, z: Z + .55 }); const p = raw('plant', { size: .9, seed: Math.round(x * 3) }); p.position.set(x, .55, Z + .55); g.add(p); }
    const easel = group(g, { x: 1.9, z: 1.0, ry: -.3 }); put(easel, G.box(.7, .95, .05), toon(0x1c1a24), { y: 1.0, rx: -.12 }); for (const s of [-1, 1]) put(easel, G.cyl(.02, .02, 1.4, 6), toon(0x5a3424), { x: s * .3, y: .65, rx: -.12 });
    const menu = ctex(256, 352, (x, w, h) => { x.fillStyle = '#1c1a24'; x.fillRect(0, 0, w, h); x.fillStyle = '#f6f0e0'; x.font = '900 40px Helvetica, Arial'; x.textAlign = 'center'; x.fillText('TONIGHT', w / 2, 60); x.font = 'bold 26px Helvetica, Arial';
      ['lobster  $190', 'steak  $95', 'wine  $$$', 'love  free'].forEach((l, i) => x.fillText(l, w / 2, 130 + i * 52)); x.fillStyle = '#ff7a8a'; x.beginPath(); x.arc(w / 2, 330, 10, 0, 7); x.fill(); }, { key: 'frontMenu' });
    put(easel, G.plane(.62, .86), glow(0xffffff, { map: menu }), { y: 1.0, z: .03, rx: -.12, noInk: true, shadow: false });
    // inside, seen through the glass
    put(g, G.plane(16, 4), toon(0xffffff, { map: ctex(256, 256, (x, w) => { x.fillStyle = '#6a3a2a'; x.fillRect(0, 0, w, w); x.strokeStyle = '#4a2418'; x.lineWidth = 6; for (let i = 0; i < 8; i++) { x.beginPath(); x.moveTo(0, i * 32); x.lineTo(w, i * 32); x.stroke(); } }, { key: 'frontInFloor', repeat: [8, 2] }) }), { rx: -Math.PI / 2, y: .01, z: -2, noInk: true, shadow: false });
    put(g, G.box(16, 5, .2), toon(0xffffff, { map: wallpaperTex() }), { y: 2.5, z: -3.3 }); put(g, G.box(16, 1.0, .1), toon(0x2e4d3f), { y: .5, z: -3.18 });
    for (const x of [-7.8, 7.8]) put(g, G.box(.2, 5, 3.4), toon(0xe9b98a), { x, y: 2.5, z: -1.6 });
    put(g, G.box(16, .2, 3.4), toon(0x3a2218), { y: 4.6, z: -1.6 });   // ceiling
    for (let i = 0; i < 22; i++) { const t = i / 21, x = -4.5 + t * 9, y = 3.1 - Math.abs(Math.sin(t * Math.PI * 3)) * .25; put(g, G.sph(.05, 8, 6), glow(0xfff0d8), { x, y, z: -3.15, noInk: true, shadow: false }); }
    [[-3.2, 2.2, 3], [3.4, 2.1, 7]].forEach(([x, y, sd]) => { put(g, G.box(.9, 1.1, .06), toon(0x3a2218), { x, y, z: -3.16 }); put(g, G.plane(.76, .96), glow(0xffffff, { map: ctex(128, 160, (c, w, h) => { const P = ['#e86a6a', '#7ed3a0', '#b79cf0', '#f0a07c'], r = rng(sd); c.fillStyle = '#f4eadf'; c.fillRect(0, 0, w, h); for (let i = 0; i < 5; i++) { c.fillStyle = P[i % 4]; c.beginPath(); c.arc(20 + r() * 90, 20 + r() * 120, 14 + r() * 26, 0, 7); c.fill(); } }, { key: 'frontArt' + sd }) }), { x, y, z: -3.12, noInk: true, shadow: false }); });
    for (const x of [-1.2, 1.2]) { const L = raw('pendant-lamp', { drop: 1.1, color: 0xd9603a }); L.position.set(x, 4.5, -1.2); g.add(L); }
    // other diners at the back, a cafe table each side of the booth
    for (const x of [-4.6, 5.2]) g.add(raw('cafe-table', { at: [x, 0, -2.2] }));
    // outside: sidewalk, curb, road, the far side
    put(g, G.plane(40, 3.4), toon(0xffffff, { map: sidewalkTex() }), { rx: -Math.PI / 2, y: .001, z: 1.7, noInk: true, shadow: false }).receiveShadow = true;
    put(g, G.box(40, .16, .25), toon(0x9a9cb4), { y: .02, z: 3.48 });
    put(g, G.plane(40, 8), toon(0xffffff, { map: roadTex() }), { rx: -Math.PI / 2, y: -.05, z: 7.5, noInk: true, shadow: false });
    put(g, G.plane(40, 4), toon(0xffffff, { map: sidewalkTex() }), { rx: -Math.PI / 2, y: .001, z: 13.5, noInk: true, shadow: false });
    put(g, G.plane(60, 22), new THREE.MeshBasicMaterial({ map: streetBackTex(), toneMapped: false }), { y: 9, z: 18, ry: Math.PI, noInk: true, shadow: false });   // faces -z, toward the restaurant (shots looking out)
    // behind the camera when looking at the restaurant: nothing needed; a backdrop above the roofline, seen in low shots
    put(g, G.plane(60, 14), new THREE.MeshBasicMaterial({ map: streetBackTex(), toneMapped: false }), { y: 12, z: -4, noInk: true, shadow: false });
    const lamp = raw('street-lamp', { h: 3.8 }); lamp.position.set(-2.6, 0, 3.0); lamp.rotation.y = Math.PI / 2; g.add(lamp);   // its head reaches over the sidewalk toward the facade
    const cone = raw('spotlight-cone', { h: 3.6, r: 1.25, color: 0xffe2a0 }); cone.position.set(-2.6, 3.62, 2.3); g.add(cone);
    const hyd = group(g, { x: 4.6, z: 3.0 }); put(hyd, G.cyl(.13, .15, .55, 14), toon(0xd8342a), { y: .28 }); put(hyd, G.sph(.13, 12, 8), toon(0xd8342a), { y: .56 }); put(hyd, G.cyl(.05, .05, .32, 8), toon(0xd8342a), { y: .38, rz: Math.PI / 2 });
    if (car) { const c = raw('car', { color: 0x3a7be0 }); c.position.set(5.6, 0, 4.6); c.scale.setScalar(1.25); g.add(c); }
    const lights = [(s) => pointLight(s, 0, 3.4, -1.6, 0xffc890, 9, 7), (s) => pointLight(s, -2.6, 3.3, 2.3, 0xffe2a0, 8, 7), (s) => pointLight(s, 3.7, 2.2, .8, 0xffcf8a, 4, 4)];
    return { root: g, light: 'night', shadowSize: 14, lights,
      cameras: { main: { pos: [0, 1.7, 8.5], look: [0, 1.5, 0], fov: 46 }, sidewalk: { pos: [-.6, 1.55, 5.6], look: [-.3, 1.45, 0], fov: 44 } },
      spots: { booth: [0, 0, -1.2], walk: [-1.0, 0, 1.6], door: [3.7, 0, .4], lamp: [-2.6, 0, 2.4] },
      keys: { default: { kind: 'spot', at: [-2.6, 3.6, 2.3], target: [-2.4, 0, 1.8] } } };
  },
});
