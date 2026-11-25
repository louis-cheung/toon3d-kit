// Dinner props: a table that seats six, the studio stage screen (table view, A/B view, bar chart),
// the A/B choice pill, a pay card, and a lettuce leaf. Same toon materials, ink and helpers as the rest of the library.
// Cyan #3fd0ff means option A and yellow #ffd23f means option B. Nothing else in a video uses those two colors.
import { THREE, toon, glow, G, put, group, PAL, ctex, rng, RENDERER, lighting } from '../core.js';
import { register, asset, find } from '../registry.js';
const g0 = () => new THREE.Group();
export const OPT_A = '#3fd0ff', OPT_B = '#ffd23f', INK = '#0f0d17';
const clamp01 = (t) => Math.max(0, Math.min(1, t));

// ---------- dinner table ----------
// Round table, radius 1.1 m, top at y = 0.76. Six stools on a ring of radius 1.38 m, seat top at y = 0.48 (a seated bean fits).
// Seat k sits at angle SEAT_ANGLES[k] measured from +z (toward the camera) toward +x: position (sin a, 0, cos a) * 1.38.
// The ring leaves the front center open, so the camera sees the table and the people on both sides of it.
export const SEAT_ANGLES = [-40, 40, -100, 100, -160, 160].map((d) => d * Math.PI / 180);
export const SEAT_R = 1.38;
register('dinner-table', {
  tags: ['table', 'dinner', 'restaurant', 'furniture', 'cafe', 'seats-six', 'group'], aliases: ['table-six', 'big-table'],
  desc: 'Round dinner table that seats six, with six stools around it. Top at 0.76 m, stool seats at 0.48 m (seated beans fit). Seat angles from +z: -40, 40, -100, 100, -160, 160 degrees on a 1.38 m ring.',
  opts: { r: 'table radius (1.1)', top: 'top color', stools: 'false = table only', cloth: 'true adds a center cloth disc' },
  build: ({ r = 1.1, top = PAL.wood, stools = true, cloth = false } = {}) => {
    const g = g0(), dark = toon(PAL.woodDark);
    put(g, G.cyl(r, r * .97, .06, 48), toon(top), { y: .73 });
    put(g, G.cyl(r * .93, r * .93, .07, 48), dark, { y: .67 });
    put(g, G.cyl(.1, .16, .62, 16), dark, { y: .31 });
    put(g, G.cyl(.5, .56, .05, 32), dark, { y: .025 });
    if (cloth) put(g, G.cyl(r * .62, r * .62, .006, 40), toon(0xf3f3f6), { y: .763, noInk: true });
    if (stools) for (const a of SEAT_ANGLES) {
      const s = group(g, { x: Math.sin(a) * SEAT_R, z: Math.cos(a) * SEAT_R, ry: a + Math.PI });
      put(s, G.cyl(.25, .23, .07, 24), toon(0x7a3f3a), { y: .445 });          // padded seat
      put(s, G.cyl(.255, .255, .02, 24), toon(0x5a2c2c), { y: .41 });
      for (let i = 0; i < 4; i++) { const b = i * Math.PI / 2 + Math.PI / 4; put(s, G.cyl(.022, .026, .4, 8), dark, { x: Math.cos(b) * .17, z: Math.sin(b) * .17, y: .2 }); }
    }
    g.userData.seats = SEAT_ANGLES.map((a) => [Math.sin(a) * SEAT_R, 0, Math.cos(a) * SEAT_R]);
    return g;
  },
});

// ---------- stage screen ----------
const PEOPLE = ['#6a4fc4', '#ef8a3c', '#f08ab0', '#6bbf4a', '#e7e4ee', '#8a2f4a'];   // jade, max, then the four friends
function person(x, cx, cy, s, color, face) {
  x.lineWidth = 7 * s; x.strokeStyle = INK; x.fillStyle = color;
  x.beginPath(); x.ellipse(cx, cy + 46 * s, 34 * s, 46 * s, 0, 0, 7); x.fill(); x.stroke();
  x.fillStyle = '#f6f6f8'; x.beginPath(); x.arc(cx, cy, 30 * s, 0, 7); x.fill(); x.stroke();
  if (face) {
    x.fillStyle = INK; x.beginPath(); x.arc(cx - 10 * s, cy - 3 * s, 3.4 * s, 0, 7); x.arc(cx + 10 * s, cy - 3 * s, 3.4 * s, 0, 7); x.fill();
    x.lineWidth = 3.4 * s; x.beginPath();
    if (face === 'happy') x.arc(cx, cy + 4 * s, 11 * s, .15 * Math.PI, .85 * Math.PI); else { x.moveTo(cx - 8 * s, cy + 13 * s); x.lineTo(cx + 8 * s, cy + 13 * s); }
    x.stroke();
  }
}
function tableScene(x, cx, cy, s, mood) {
  const pos = [[-1, -1], [0, -1.15], [1, -1], [-1.25, .1], [1.25, .1], [0, 1.1]];   // far row, sides, near
  const draw = (list) => list.forEach(([i, p]) => person(x, cx + p[0] * 150 * s, cy + p[1] * 70 * s - 40 * s, s * .95, PEOPLE[i], mood));
  const idx = pos.map((p, i) => [i, p]);
  draw(idx.filter(([, p]) => p[1] < 0));
  x.lineWidth = 8 * s; x.strokeStyle = INK; x.fillStyle = '#b98552'; x.beginPath(); x.ellipse(cx, cy, 150 * s, 62 * s, 0, 0, 7); x.fill(); x.stroke();
  x.fillStyle = '#f3f3f6'; for (const [px, py] of [[-70, -4], [-20, 14], [40, 8], [78, -6], [-8, -18]]) { x.beginPath(); x.ellipse(cx + px * s, cy + py * s, 17 * s, 7 * s, 0, 0, 7); x.fill(); }
  x.fillStyle = '#e2463b'; x.beginPath(); x.ellipse(cx + 40 * s, cy + 8 * s, 8 * s, 3.5 * s, 0, 0, 7); x.fill();
  draw(idx.filter(([, p]) => p[1] >= 0));
}
function tagBubble(x, cx, cy, letter, color) {
  x.fillStyle = color; x.strokeStyle = INK; x.lineWidth = 12; x.beginPath(); x.arc(cx, cy, 78, 0, 7); x.fill(); x.stroke();
  x.fillStyle = INK; x.font = '900 112px Helvetica, Arial'; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText(letter, cx, cy + 6);
}
// A real picture of the restaurant: the same set, table and six people as the dinner shots, rendered once from a fixed camera
// into a 3:2 canvas (draws into a corner of the main canvas, copies it out, restores the viewport).
let roomCanvas = null;
function roomPicture() {
  if (roomCanvas) return roomCanvas;
  const R = RENDERER; if (!R) return null;
  const scene = new THREE.Scene(); lighting(scene, 'restaurant', { shadowSize: 10 });
  const set = asset('restaurant', { rug: false }); scene.add(set.root); (set.lights || []).forEach((f) => f(scene));
  scene.add(asset('long-table', { layout: 'broad', cloth: true }));
  const names = ['bean-jade', 'bean-max', 'bean', 'bean', 'bean', 'bean'];
  BROAD_SEATS.forEach(([x, z, ry], k) => {
    const o = asset(names[k], { pose: 'sit', expression: k === 0 ? 'deadpan' : k === 1 ? 'happy' : 'neutral', ...(k > 1 ? FRIEND_LOOKS[k - 2] : {}) }); o.position.set(x, 0, z); o.rotation.y = ry; scene.add(o);
  });
  for (const [name, at, sc, o] of [['lobster-plate', [.5, .77, .35], 1.9], ['salad-bowl', [-.5, .77, .35], 2.6], ['fries', [.15, .77, .05], 2.6], ['receipt', [0, .77, -.28], 2.8]]) { const a = asset(name, o || {}); a.position.set(...at); a.scale.setScalar(sc); scene.add(a); }
  const cw = R.domElement.width, ch = R.domElement.height; let rw = Math.min(cw, 1080), rh = Math.round(rw / 1.5); if (rh > ch) { rh = ch; rw = Math.round(ch * 1.5); }
  const cam = new THREE.PerspectiveCamera(30, 1.5, .1, 200); cam.position.set(0, 3.7, 8.6); cam.lookAt(0, .95, -.2);
  R.setScissorTest(true); R.setViewport(0, 0, rw, rh); R.setScissor(0, 0, rw, rh); R.render(scene, cam);
  const c = document.createElement('canvas'); c.width = rw; c.height = rh; c.getContext('2d').drawImage(R.domElement, 0, ch - rh, rw, rh, 0, 0, rw, rh);
  R.setScissorTest(false); R.setViewport(0, 0, cw, ch);
  roomCanvas = c; return c;
}
// The split bedrooms, frozen: Leo cold blue on the left, Mia warm pink on the right, both staring at their phones,
// rendered once from the bedrooms-split set into a 3:2 canvas (same corner-render trick as roomPicture).
let splitCanvas = null;
function splitPicture() {
  if (splitCanvas) return splitCanvas;
  const R = RENDERER; if (!R) return null;
  const scene = new THREE.Scene(), set = asset('bedrooms-split'); lighting(scene, set.light, { shadowSize: 8 }); scene.add(set.root); (set.lights || []).forEach((f) => f(scene));
  const mia = find('bean-mia') ? ['bean-mia', {}] : ['bean', { body: 0xf07a8a, pattern: 'dots', patternColor: 0xffe4ec, limbs: 0x241726, hair: 'long', hairColor: 0x4a2a1a, faceStyle: 'bold', inkWidth: .03, inkColor: 0x241726 }];
  for (const [name, o, at] of [['bean-leo', {}, set.spots.leo], [mia[0], mia[1], set.spots.mia]]) {
    const c = asset(name, { pose: 'sit_phone', expression: 'shock', ...o }); c.position.set(...at); scene.add(c);
    const ph = asset('phone-chat', { owner: name === 'bean-leo' ? 'leo' : 'mia', light: false, halo: false, h: .26 }); ph.rotation.set(-.3, Math.PI, 0); c.userData.rig.R.hand.add(ph);
  }
  const cw = R.domElement.width, ch = R.domElement.height; let rw = Math.min(cw, 1080), rh = Math.round(rw / 1.5); if (rh > ch) { rh = ch; rw = Math.round(ch * 1.5); }
  const cam = new THREE.PerspectiveCamera(30, 1.5, .1, 200); cam.position.set(0, 1.9, 9.6); cam.lookAt(0, 1.45, -1);
  R.setScissorTest(true); R.setViewport(0, 0, rw, rh); R.setScissor(0, 0, rw, rh); R.render(scene, cam);
  const c = document.createElement('canvas'); c.width = rw; c.height = rh; c.getContext('2d').drawImage(R.domElement, 0, ch - rh, rw, rh, 0, 0, rw, rh);
  R.setScissorTest(false); R.setViewport(0, 0, cw, ch);
  splitCanvas = c; return c;
}
function drawScreen(x, W, H, view, k, mood) {
  if (view === 'split') { const sc = splitPicture(); if (sc) { x.drawImage(sc, 0, 0, W, H); tagBubble(x, W * .2, H * .16, 'A', OPT_A); tagBubble(x, W * .8, H * .16, 'B', OPT_B); return; } view = 'ab'; }
  if (view === 'room') { const rc = roomPicture(); if (rc) { x.drawImage(rc, 0, 0, W, H); return; } view = 'table'; }
  if (view === 'table') {
    const g = x.createLinearGradient(0, 0, 0, H); g.addColorStop(0, '#2a3a8a'); g.addColorStop(.55, '#a07ab0'); g.addColorStop(1, '#f0a07c'); x.fillStyle = g; x.fillRect(0, 0, W, H);
    x.fillStyle = '#c9c6d4'; x.fillRect(0, H * .66, W, H * .34);
    tableScene(x, W / 2, H * .68, .8, null);
  } else if (view === 'ab') {
    x.fillStyle = '#1b2160'; x.fillRect(0, 0, W, H);
    x.fillStyle = '#26337e'; x.fillRect(W / 2 - 4, 40, 8, H - 80);
    tableScene(x, W * .25, H * .64, .95, mood ? 'flat' : null); tableScene(x, W * .75, H * .64, .95, mood ? 'happy' : null);
    tagBubble(x, W * .25, H * .17, 'A', OPT_A); tagBubble(x, W * .75, H * .17, 'B', OPT_B);
  } else if (view === 'idle') {
    const g = x.createLinearGradient(0, 0, W, H); g.addColorStop(0, '#2a1a5e'); g.addColorStop(.5, '#4a2a86'); g.addColorStop(1, '#1b1450'); x.fillStyle = g; x.fillRect(0, 0, W, H);
    x.globalAlpha = .10; x.fillStyle = '#ffffff'; for (let i = -2; i < 8; i++) { x.beginPath(); x.moveTo(i * 260, 0); x.lineTo(i * 260 + 120, 0); x.lineTo(i * 260 + 120 + 420, H); x.lineTo(i * 260 + 420, H); x.fill(); } x.globalAlpha = 1;
  } else {
    x.fillStyle = '#1b2160'; x.fillRect(0, 0, W, H);
    const base = H * .76, top = H * .1, scale = (base - top) / 60, bw = W * .25, cxA = W * .3, cxB = W * .7;
    x.strokeStyle = '#3a4590'; x.lineWidth = 3; for (let v = 10; v <= 60; v += 10) { x.beginPath(); x.moveTo(W * .08, base - v * scale); x.lineTo(W * .92, base - v * scale); x.stroke(); }
    x.strokeStyle = '#f3f3f6'; x.lineWidth = 8; x.beginPath(); x.moveTo(W * .08, base); x.lineTo(W * .92, base); x.stroke();
    const hA = 37 * scale * k, hB = 51 * scale * k;
    const bar = (cx, h, color) => { x.fillStyle = color; x.strokeStyle = INK; x.lineWidth = 10; x.beginPath(); x.roundRect(cx - bw / 2, base - h, bw, Math.max(h, 1), [16, 16, 0, 0]); x.fill(); if (h > 6) x.stroke(); };
    bar(cxA, hA, OPT_A); bar(cxB, hB, OPT_B);
    if (k > .85) { x.setLineDash([22, 16]); x.strokeStyle = '#f3f3f6'; x.lineWidth = 6; x.beginPath(); x.moveTo(cxA + bw / 2, base - hA); x.lineTo(cxB + bw / 2 + 30, base - hA); x.stroke(); x.setLineDash([]); }
    const num = (cx, h, v) => { x.font = '900 150px Helvetica, Arial'; x.textAlign = 'center'; x.textBaseline = 'middle'; x.lineJoin = 'round'; x.lineWidth = 22; x.strokeStyle = INK; x.fillStyle = '#ffffff'; x.strokeText(String(Math.round(v * k)), cx, base - h - 82); x.fillText(String(Math.round(v * k)), cx, base - h - 82); };
    num(cxA, hA, 37); num(cxB, hB, 51);
    x.font = '900 84px Helvetica, Arial'; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillStyle = '#ffffff'; x.lineWidth = 14; x.strokeStyle = INK; x.lineJoin = 'round';
    x.strokeText('PAY YOUR OWN', cxA, base + 74); x.fillText('PAY YOUR OWN', cxA, base + 74); x.strokeText('SPLIT IT', cxB, base + 74); x.fillText('SPLIT IT', cxB, base + 74);
    if (k > .9) {
      const p = clamp01((k - .9) / .1), tx = cxB + bw / 2 - 20, ty = base - hB - 60 - 70 * 0; x.save(); x.translate(tx, ty - 120); x.scale(.6 + .4 * p, .6 + .4 * p); x.rotate(.12);
      x.fillStyle = '#e2463b'; x.strokeStyle = INK; x.lineWidth = 10; x.beginPath(); x.roundRect(-150, -62, 300, 124, 40); x.fill(); x.stroke();
      x.fillStyle = '#ffffff'; x.font = '900 100px Helvetica, Arial'; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText('+36%', 0, 6); x.restore();
    }
    x.fillStyle = '#d6d9f2'; x.font = 'bold 62px Helvetica, Arial'; x.textAlign = 'center'; x.fillText('real restaurant study, 2004, per person', W / 2, H * .945);
  }
}
register('stage-screen', {
  tags: ['stage', 'screen', 'studio', 'chart', 'infographic', 'explain', 'dinner'], aliases: ['big-screen', 'stage-display'],
  desc: 'Big stage screen for the studio set, on two legs. view "split": the two bedrooms side by side (Leo cold blue left, Mia warm pink right, both frozen staring at their phones) with an A badge on his side and a B badge on hers. view "room": a real picture of the restaurant with the six people at the long table (rendered from the same set). view "idle": soft purple light sweep, nothing on it (end card behind pills). view "table": far, small dinner table at dusk. "ab": two tables side by side tagged A (cyan) and B (yellow). "chart": two bars, cyan PAY YOUR OWN to 37 and yellow SPLIT IT to 51, a +36% tag on yellow, small caption "real restaurant study, 2004, per person". The bars grow with the shot clock (update(t)).',
  opts: { view: 'table | ab | chart | idle | room | split', w: 'screen width (3.4)', lift: 'height of the screen bottom (1.3)', grow: '[startSec, durSec] for the chart bars (0.4, 1.8)', mood: 'ab view only: true shows plain faces on A and smiling faces on B', bulbs: 'marquee bulbs around the frame (true)' },
  build: ({ view = 'table', w = 3.4, lift = 1.3, grow = [.4, 1.8], mood = false, bulbs = true } = {}) => {
    const g = g0(), h = w * 2 / 3, W = 1536, H = 1024;
    const cv = document.createElement('canvas'); cv.width = W; cv.height = H; const x = cv.getContext('2d'); x.lineCap = x.lineJoin = 'round';
    const tex = new THREE.CanvasTexture(cv); tex.colorSpace = THREE.SRGBColorSpace; tex.anisotropy = 4;
    drawScreen(x, W, H, view, 1, mood); tex.needsUpdate = true;
    put(g, G.rbox(w + .24, h + .24, .14, .07), toon(0x15162b), { y: lift + h / 2 });
    put(g, G.plane(w, h), new THREE.MeshBasicMaterial({ map: tex, toneMapped: false }), { y: lift + h / 2, z: .075, noInk: true, shadow: false });
    for (const s of [-1, 1]) put(g, G.box(.12, lift, .1), toon(0x3a3f66), { x: s * w * .3, y: lift / 2, z: -.02 });
    if (bulbs) { const bm = glow(0xfff4f8), n = Math.round((w + h) * 2 / .22);   // marquee bulbs around the frame
      for (let i = 0; i < n; i++) { const t = i / n * (w + h) * 2, hw = w / 2 + .1, hh = h / 2 + .1; let bx, by;
        if (t < w + .2) { bx = -hw + t; by = hh; } else if (t < w + h + .4) { bx = hw; by = hh - (t - w - .2); } else if (t < 2 * w + h + .6) { bx = hw - (t - w - h - .4); by = -hh; } else { bx = -hw; by = -hh + (t - 2 * w - h - .6); }
        put(g, G.sph(.032, 8, 6), bm, { x: bx, y: lift + h / 2 + by, z: .1, noInk: true, shadow: false }); } }
    let last = -1;
    g.userData.update = (sec) => { if (view !== 'chart') return; const k = clamp01((sec - grow[0]) / grow[1]), e = 1 - Math.pow(1 - k, 3); if (Math.abs(e - last) < .002) return; last = e; drawScreen(x, W, H, view, e, mood); tex.needsUpdate = true; };
    return g;
  },
});

// ---------- A/B choice pill ----------
register('ab-pill', {
  kind: 'fx', tags: ['ui', 'choice', 'option', 'poll', 'label', 'ask'], aliases: ['choice-pill', 'option-pill'],
  desc: 'Rounded pill with a letter badge and two or three words, always faces the camera. A is cyan #3fd0ff "PAY YOUR OWN" (two lines), B is yellow #ffd23f "SPLIT IT". Optional second line (sub), for example "$55 EACH". tall: true forces the two-line height so A and B match. Cyan and yellow are reserved for these two options.',
  opts: { letter: 'A or B (picks the color)', text: 'words on the pill, \\n splits lines', sub: 'optional second line', w: 'width in meters (1.6)', tall: 'true = always the two-line height' },
  build: ({ letter = 'A', text, sub = '', w = 1.6, tall = false } = {}) => {
    const B = letter === 'B', color = B ? OPT_B : OPT_A, label = text || (B ? 'SPLIT IT' : 'PAY YOUR\nOWN'), W = 1024;
    const lines = label.split('\n').concat(sub ? [sub] : []), H = (tall || lines.length > 1) ? 340 : 230;
    const t = ctex(W, H, (x) => {
      x.fillStyle = color; x.strokeStyle = INK; x.lineWidth = 16; x.beginPath(); x.roundRect(14, 14, W - 28, H - 28, Math.min(150, (H - 28) / 2)); x.fill(); x.stroke();
      const r = Math.min(104, (H - 28) * .36), bx = 14 + 40 + r; x.fillStyle = INK; x.beginPath(); x.arc(bx, H / 2, r, 0, 7); x.fill();
      x.fillStyle = '#ffffff'; x.font = '900 ' + Math.round(r * 1.35) + 'px Helvetica, Arial'; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText(letter, bx, H / 2 + r * .06);
      const x0 = bx + r + 36, x1 = W - 62, cx = (x0 + x1) / 2; x.fillStyle = INK; x.textAlign = 'center';
      const px0 = lines.length > 1 ? 128 : 150; const fit = lines.map((ln) => { x.font = '900 ' + px0 + 'px Helvetica, Arial'; const m = x.measureText(ln).width; return Math.min(px0, Math.floor(px0 * (x1 - x0) / m)); });
      const px = Math.min(...fit), step = Math.min(px * 1.06, (H - 70) / lines.length); x.font = '900 ' + px + 'px Helvetica, Arial';
      lines.forEach((ln, k) => x.fillText(ln, cx, H / 2 + (k - (lines.length - 1) / 2) * step + px * .04));
    }, { key: 'abpill2:' + letter + label + sub + H });
    const g = g0(); put(g, G.plane(w, w * H / W), new THREE.MeshBasicMaterial({ map: t, transparent: true, side: THREE.DoubleSide, toneMapped: false }), { y: w * H / W / 2, noInk: true, shadow: false });
    g.userData.billboard = true; return g;
  },
});

// ---------- pay card ----------
register('pay-card', { inkWidth: .004,
  tags: ['money', 'pay', 'card', 'restaurant', 'bill', 'ui'], aliases: ['card', 'credit-card'],
  desc: 'Small payment card with a chip and tap waves. Optional floating amount label above it (always faces the camera), for the "each friend pays their own number" beats. Generic card, no real brand.',
  opts: { amount: 'text of the floating label ($38), empty for none', tagH: 'label height above the card (0.2)', color: 'card color', w: 'label width (0.62)' },
  build: ({ amount = '', tagH = .2, color = PAL.teal, w = .62 } = {}) => {
    const g = g0(), c = group(g, { y: .0 });
    put(c, G.rbox(.17, .11, .014, .012), toon(color), {}); put(c, G.box(.17, .02, .016), toon(PAL.black), { y: .03 });
    put(c, G.box(.04, .03, .017), toon(PAL.steel), { x: -.045, y: -.012 });
    for (let i = 0; i < 3; i++) put(c, G.torus(.014 + i * .011, .0035, 16, Math.PI), toon(0xffffff), { x: .045, y: -.014, z: .008, rz: -Math.PI / 2, noInk: true });
    if (amount) {
      const W = 512, H = 256, t = ctex(W, H, (x) => { x.fillStyle = '#26337e'; x.strokeStyle = INK; x.lineWidth = 14; x.beginPath(); x.roundRect(14, 14, W - 28, H - 28, 60); x.fill(); x.stroke();
        x.fillStyle = '#ffffff'; x.font = '900 150px Helvetica, Arial'; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText(amount, W / 2, H / 2 + 8); }, { key: 'pay:' + amount });
      const lab = group(g, { y: tagH }); put(lab, G.plane(w, w / 2), new THREE.MeshBasicMaterial({ map: t, transparent: true, side: THREE.DoubleSide, toneMapped: false }), { y: w / 4, noInk: true, shadow: false });
      lab.userData.billboard = true;
    }
    return g;
  },
});

// ---------- lettuce leaf ----------
register('lettuce-leaf', { inkWidth: .004,
  tags: ['food', 'restaurant', 'cheap', 'healthy', 'salad', 'prop'], aliases: ['leaf', 'lettuce'],
  desc: 'One big ruffled lettuce leaf, about 0.26 m long. For the "that is all I had" beat. Hold it up between two fingers.',
  opts: {},
  build: () => {
    const g = g0(), light = toon(0x9bd96b), mid = toon(0x7bbf5a), dark = toon(0x5e9c55);
    put(g, G.sph(.1, 20, 12), light, { y: .006, z: -.01, s: [.95, .09, 1.25] });                         // blade
    for (let i = 0; i < 9; i++) { const a = -Math.PI * .5 + i / 8 * Math.PI * 1.8 + .2, rx = .1 * .95, rz = .1 * 1.25;                         // ruffled rim
      put(g, G.sph(.032, 10, 8), i % 2 ? mid : dark, { x: Math.sin(a) * rx * .95, z: -.01 + Math.cos(a) * rz * .95, y: .008, s: [1, .32, 1], ry: a, noInk: true }); }
    put(g, G.box(.01, .004, .18), toon(0xe9f7cf), { y: .017, z: -.015, noInk: true });                    // center rib
    for (const s of [-1, 1]) for (const k of [-1, 0, 1]) put(g, G.box(.005, .004, .05), toon(0xe9f7cf), { x: s * .035, y: .017, z: -.015 + k * .06, ry: s * .7, noInk: true });
    return g;
  },
});

// ---------- long dinner table ----------
// Rectangular table, 4.4 m long and 1.5 m wide, top at y = 0.76, three stools a side (seat top 0.48). Built for a camera at one end:
// the long axis is z, so the people stagger in depth and every face shows. Seats in local coordinates (x, z):
export const LONG_SEATS = [[-1.1, 1.4], [1.1, 1.4], [-1.1, 0], [1.1, 0], [-1.1, -1.4], [1.1, -1.4]];
// layout 'broad': the table runs left to right across the frame (axis x). Four friends sit on the far side, all facing the camera in a
// row (faces never overlap), Jade and Max on the near side turned toward the camera. Seats (x, z, facing ry), in order jade, max, F1 to F4:
export const BROAD_SEATS = [[-1.0, 1.05, .45], [1.0, 1.05, -.45], [-1.35, -1.05, .25], [-.45, -1.05, .1], [.45, -1.05, -.1], [1.35, -1.05, -.25]];
export const FRIEND_LOOKS = [{ body: 0xf08ab0, hair: 'long', hairColor: 0x2b1b12 }, { body: 0x6bbf4a, hair: 'spiky', hairColor: 0x1f1a2e }, { body: 0x2f8f86, hat: 'cap', hatColor: 0xe2463b, glasses: true }, { body: 0x8a2f4a, hair: 'swoop', hairColor: 0x4a2a1a, glasses: true }];
register('long-table', {
  tags: ['table', 'dinner', 'restaurant', 'furniture', 'seats-six', 'group', 'long'], aliases: ['long-dinner-table'],
  desc: 'Long restaurant table that seats six. layout "long": three a side running away from the camera (axis z). layout "broad": runs across the frame (axis x), four far-side seats at x -1.35, -0.45, 0.45, 1.35 (z -1.05) and two near-side seats at x -1, 1 (z 1.05, no backs so the people can turn to camera). cloth: true puts a white tablecloth on it. Top 0.77 m, stool seats 0.48 m.',
  opts: { layout: "'long' or 'broad'", len: 'length (4.4, broad 4.2)', wid: 'width (1.5)', top: 'top color', cloth: 'true = white tablecloth', runner: 'false = no cream table runner (long, no cloth)', stools: 'false = table only',
    seats: "long only (2026-11-14): seats along the sides, an even number (default 6 = the original layout); 8 needs len 5.8. userData.seats lists [x, z, ry] (ry = which way a seated bean faces)", ends: "long only: 'head' adds a seat at the far end (z -), 'both' at both ends", clothColor: 'tablecloth colour (white)' },
  build: ({ layout = 'long', len, wid = 1.5, top = 0xc08a55, cloth = false, runner = true, stools = true, seats = 6, ends = null, clothColor = 0xf8f5ef } = {}) => {
    const broad = layout === 'broad'; len = len ?? (broad ? 4.2 : 4.4);
    const g = g0(), root = broad ? group(g, { ry: Math.PI / 2 }) : g, dark = toon(PAL.woodDark);   // build along z, then turn for broad
    put(root, G.box(wid, .06, len), toon(top), { y: .73 });
    put(root, G.box(wid * .94, .08, len * .96), dark, { y: .66 });
    for (const sx of [-1, 1]) for (const sz of [-1, 1]) put(root, G.cyl(.06, .08, .66, 12), dark, { x: sx * (wid / 2 - .12), z: sz * (len / 2 - .2), y: .33 });
    if (cloth) {
      const cl = toon(clothColor); put(root, G.box(wid + .06, .02, len + .06), cl, { y: .76 });
      for (const sx of [-1, 1]) put(root, G.box(.02, .3, len + .06), cl, { x: sx * (wid / 2 + .04), y: .61 });
      for (const sz of [-1, 1]) put(root, G.box(wid + .06, .3, .02), cl, { z: sz * (len / 2 + .04), y: .61 });
    } else if (runner) put(root, G.box(wid * .5, .008, len * .92), toon(0xf3ece4), { y: .762, noInk: true });
    if (stools) {
      const custom = !broad && (seats !== 6 || ends), n = seats / 2, sp = n > 1 ? Math.min(1.4, (len - 1.0) / (n - 1)) : 0;
      const sx = wid / 2 + .35, longSeats = custom ? [...Array(n)].flatMap((_, i) => [[-sx, ((n - 1) / 2 - i) * sp], [sx, ((n - 1) / 2 - i) * sp]]) : LONG_SEATS;   // custom: front to back, left then right
      const endSeats = !broad && ends ? [[0, -(len / 2 + .5), 'head'], ...(ends === 'both' ? [[0, len / 2 + .5, 'foot']] : [])] : [];
      const list = broad ? BROAD_SEATS.map(([x, z]) => [x, z, z < 0]) : longSeats.map(([x, z]) => [x, z, true]);
      g.userData.seats = broad ? BROAD_SEATS.map((q) => q.slice()) : [...longSeats.map(([x, z]) => [x, z, x < 0 ? Math.PI / 2 : -Math.PI / 2]), ...endSeats.map(([x, z, e]) => [x, z, e === 'head' ? 0 : Math.PI])];
      for (const [x, z, e] of endSeats) { const st = group(root, { x, z, ry: e === 'head' ? 0 : Math.PI });
        put(st, G.cyl(.25, .23, .07, 24), toon(0x4a2a48), { y: .445 }); put(st, G.cyl(.255, .255, .02, 24), toon(0x2f1a30), { y: .41 });
        for (let i = 0; i < 4; i++) { const b = i * Math.PI / 2 + Math.PI / 4; put(st, G.cyl(.022, .026, .4, 8), dark, { x: Math.cos(b) * .17, z: Math.sin(b) * .17, y: .2 }); }
        put(st, G.rbox(.5, .5, .06, .03), toon(0x4a2a48), { y: .82, z: -.27 }); }
      for (const [x, z, back] of list) {
        const st = broad ? group(g, { x, z, ry: z < 0 ? 0 : Math.PI }) : group(root, { x, z, ry: x < 0 ? Math.PI / 2 : -Math.PI / 2 });
        put(st, G.cyl(.25, .23, .07, 24), toon(0x4a2a48), { y: .445 });
        put(st, G.cyl(.255, .255, .02, 24), toon(0x2f1a30), { y: .41 });
        for (let i = 0; i < 4; i++) { const b = i * Math.PI / 2 + Math.PI / 4; put(st, G.cyl(.022, .026, .4, 8), dark, { x: Math.cos(b) * .17, z: Math.sin(b) * .17, y: .2 }); }
        if (back) put(st, G.rbox(.46, .3, .05, .02), toon(0x4a2a48), { y: .72, z: -.27 });
      }
    }
    return g;
  },
});

// ---------- show sign ----------
register('show-sign', {
  kind: 'fx', tags: ['stage', 'gameshow', 'sign', 'logo', 'show', 'title'], aliases: ['show-logo', 'a-or-b-sign'],
  desc: 'Our show mark: a marquee sign reading "A or B?" with the A in cyan #3fd0ff and the B in yellow #ffd23f (the two reserved colors, used for the show name only).',
  opts: { w: 'width (3.2)' },
  build: ({ w = 3.2 } = {}) => {
    const g = g0(), h = w * .38, W = 1024, H = 390;
    const t = ctex(W, H, (x) => {
      x.fillStyle = '#1a1038'; x.beginPath(); x.roundRect(8, 8, W - 16, H - 16, 60); x.fill(); x.strokeStyle = '#0f0d17'; x.lineWidth = 14; x.stroke();
      x.fillStyle = '#fff4f8'; for (let i = 0; i < 30; i++) { const a = i / 30; const px = 50 + a * (W - 100); for (const py of [32, H - 32]) { x.beginPath(); x.arc(px, py, 9, 0, 7); x.fill(); } }
      for (let i = 0; i < 9; i++) { const py = 70 + i / 8 * (H - 140); for (const px of [30, W - 30]) { x.beginPath(); x.arc(px, py, 9, 0, 7); x.fill(); } }
      x.textBaseline = 'middle'; x.lineJoin = 'round'; x.lineWidth = 22; x.strokeStyle = '#0f0d17';
      const word = (t, px, col, size) => { x.font = '900 ' + size + 'px Helvetica, Arial'; x.textAlign = 'center'; x.strokeText(t, px, H / 2 + 8); x.fillStyle = col; x.fillText(t, px, H / 2 + 8); };
      word('A', 190, OPT_A, 330); word('or', 435, '#ffffff', 150); word('B', 690, OPT_B, 330); word('?', 900, '#ffffff', 300);
    }, { key: 'showsign' });
    put(g, G.plane(w, h), new THREE.MeshBasicMaterial({ map: t, transparent: true, toneMapped: false }), { y: h / 2, z: .03, noInk: true, shadow: false });
    put(g, G.box(w * .96, h * .9, .05), toon(0x1a1038), { y: h / 2, z: -.01 });
    return g;
  },
});

// ---------- audience row ----------
register('audience-row', {
  kind: 'fx', tags: ['stage', 'audience', 'crowd', 'foreground', 'silhouette', 'gameshow'], aliases: ['crowd-row'],
  desc: 'A row of dark audience heads and shoulders seen from behind, for foreground depth in the host stage shots. Different hair shapes so the row does not look copied. Stays dark so the hosts pop.',
  opts: { n: 'heads (9)', gap: 'center gap in meters (0.9)', spread: 'half width (3.4)', seed: '' },
  build: ({ n = 9, gap = .9, spread = 3.4, seed = 3 } = {}) => {
    const g = g0(), r = rng(seed), m = toon(0x1c1634), m2 = toon(0x2a2050);
    for (let i = 0; i < n; i++) {
      let x = -spread + i / (n - 1) * spread * 2; if (Math.abs(x) < gap) x += x < 0 ? -gap : gap;
      const p = group(g, { x, y: 0, z: (r() - .5) * .5 }), hgt = .75 + r() * .15;
      put(p, G.cap(.3, .25, 14), i % 2 ? m : m2, { y: hgt - .5, s: [1.15, 1, .8] });
      put(p, G.sph(.26, 18, 14), m, { y: hgt + .12 });
      const k = Math.floor(r() * 4);
      if (k === 0) put(p, G.sph(.13, 12, 8), m2, { y: hgt + .42 });                         // bun
      if (k === 1) put(p, G.sph(.285, 16, 10), m2, { y: hgt + .16, s: [1, .8, 1] });         // big hair
      if (k === 2) for (let q = 0; q < 5; q++) put(p, G.cone(.06, .18, 6), m2, { x: (q - 2) * .09, y: hgt + .36, rz: (q - 2) * -.2 });   // spikes
    }
    return g;
  },
});
