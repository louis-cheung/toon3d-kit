// Rich System Ep 2 (2026-11-14): the dealership props (tow truck, sales desk, card terminal).
// Everything that changes over a shot is a pure function of time: update(sec), so frames render in any order.
import { THREE, toon, glow, G, put, group, ctex, rng } from '../core.js';
import { register, find, raw } from '../registry.js';
const g0 = () => new THREE.Group();
const c01 = (t) => Math.max(0, Math.min(1, t));
const sm = (t) => { const k = c01(t); return k * k * (3 - 2 * k); };
const span = (v, sec) => (Array.isArray(v) ? c01((sec - v[0]) / Math.max(.01, v[1] - v[0])) : c01(+v || 0));   // [t0, t1] -> 0..1 over the span, or a held number
const NAVY = '#1c2a6a', GOLD = '#e6b84a', INKC = '#241726';
/** A canvas texture redrawn only when key(sec) changes (same as engine/props/rich.js liveTex). */
function liveTex(w, h, draw, key) {
  const cv = document.createElement('canvas'); cv.width = w; cv.height = h; const x = cv.getContext('2d');
  const t = new THREE.CanvasTexture(cv); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8; let last = null;
  const update = (sec) => { const k = key(sec); if (k === last) return; last = k; x.setTransform(1, 0, 0, 1, 0, 0); x.clearRect(0, 0, w, h); x.lineCap = x.lineJoin = 'round'; draw(x, w, h, sec); t.needsUpdate = true; };
  update(0); return { tex: t, update };
}

// ---------- chairs (used by sales-desk chairs: true) ----------
function officeChair(parent, x, z, ry, seatCol = 0x26337e) {   // swivel chair: five-star base, gas lift, cushion top at y .5, the back on the chair's +x side
  const c = group(parent, { x, z, ry }), dark = toon(0x2e3248), chrome = toon(0xd9dce6), seat = toon(seatCol);
  for (let i = 0; i < 5; i++) { const a = i * Math.PI * 2 / 5 + .3; put(c, G.box(.32, .04, .05), dark, { x: Math.cos(a) * .16, y: .07, z: -Math.sin(a) * .16, ry: a }); put(c, G.sph(.035, 8, 6), dark, { x: Math.cos(a) * .3, y: .035, z: -Math.sin(a) * .3 }); }
  put(c, G.cyl(.03, .03, .32, 10), chrome, { y: .25 }); put(c, G.rbox(.5, .09, .5, .04), seat, { y: .455 });
  put(c, G.box(.05, .34, .06), dark, { x: .25, y: .6 }); put(c, G.rbox(.1, .62, .48, .05), seat, { x: .28, y: .96, rz: -.08 });
  for (const s of [-1, 1]) { put(c, G.box(.04, .2, .04), dark, { x: .05, y: .6, z: s * .25 }); put(c, G.rbox(.3, .05, .07, .02), dark, { x: .02, y: .71, z: s * .25 }); }
  return c;
}
function guestChair(parent, x, z, ry, col = 0xe2463b) {   // modern guest chair on a chrome sled, seat top y .5, the back on the chair's -x side
  const c = group(parent, { x, z, ry }), chrome = toon(0xd9dce6), seat = toon(col);
  for (const s of [-1, 1]) { put(c, G.box(.46, .025, .025), chrome, { y: .015, z: s * .2 }); put(c, G.box(.025, .44, .025), chrome, { x: .2, y: .23, z: s * .2 }); put(c, G.box(.025, .82, .025), chrome, { x: -.22, y: .41, z: s * .2 }); }
  put(c, G.rbox(.46, .08, .46, .04), seat, { y: .46 }); put(c, G.rbox(.07, .42, .46, .04), seat, { x: -.24, y: .74, rz: .1 });
  return c;
}

// ---------- sales desk ----------
function drawLoan(x, w, h, o) {
  x.fillStyle = '#f4f6fb'; x.fillRect(0, 0, w, h);
  x.fillStyle = NAVY; x.fillRect(0, 0, w, 118); x.fillStyle = GOLD; x.fillRect(0, 118, w, 8);
  x.fillStyle = GOLD; x.font = '900 64px Helvetica'; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText('HALE MOTORS ACCOUNTS', w / 2, 62, w - 40);
  x.textAlign = 'left'; x.fillStyle = '#6a7090'; x.font = 'bold 44px Helvetica'; x.fillText('BORROWER', 46, 178);
  x.fillStyle = NAVY; x.font = '900 104px Helvetica'; x.fillText(o.borrower, 46, 258, w - 90);
  x.fillStyle = '#6a7090'; x.font = 'bold 44px Helvetica'; x.fillText('BALANCE', 46, 340);
  x.fillStyle = '#16141c'; x.font = '900 168px Helvetica'; x.fillText(o.balance, 40, 446, w - 70);
  x.fillStyle = '#e8862a'; x.beginPath(); x.roundRect(40, 530, w - 80, 86, 22); x.fill();
  x.fillStyle = '#ffffff'; x.font = '900 56px Helvetica'; x.textAlign = 'center'; x.fillText(o.status, w / 2, 575, w - 120);
}
function drawCars(x, w, h, seed) {
  const r = rng(seed); x.fillStyle = '#152060'; x.fillRect(0, 0, w, h); x.fillStyle = GOLD; x.font = '900 60px Helvetica'; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText('INVENTORY', w / 2, 56);
  const cols = ['#e2463b', '#1f6fff', '#f5c84a', '#f8f6f0', '#2f8f86', '#8a5ad8'];
  for (let i = 0; i < 6; i++) { const cx = 30 + (i % 3) * 328, cy = 110 + Math.floor(i / 3) * 262;
    x.fillStyle = '#26337e'; x.beginPath(); x.roundRect(cx, cy, 304, 240, 18); x.fill();
    x.fillStyle = cols[(i + seed) % 6]; x.beginPath(); x.roundRect(cx + 40, cy + 70, 224, 56, 22); x.fill(); x.beginPath(); x.roundRect(cx + 90, cy + 40, 120, 50, 22); x.fill();
    x.fillStyle = '#16141c'; for (const wx of [cx + 90, cx + 214]) { x.beginPath(); x.arc(wx, cy + 128, 22, 0, 7); x.fill(); }
    x.fillStyle = '#ffffff'; x.font = '900 46px Helvetica'; x.fillText('$' + (20 + Math.floor(r() * 130)) + ',000', cx + 152, cy + 200); }
}
register('sales-desk', {
  tags: ['dealership', 'desk', 'office', 'cars', 'rich-system'], aliases: ['salesman-desk', 'dealer-desk'],
  desc: 'A car salesman\'s desk: white top with a gold edge on chrome legs, a teal front panel, a monitor, keyboard and mouse, a gold nameplate facing the customer, a pen cup, a little plant, a pile of brochures. Origin at the floor under the desk centre; top at y .76, 0.9 deep (x) by 1.7 wide (z). The customer side faces -x, the salesman side +x. The monitor stands on the -z end with its screen facing +z (turned 10 degrees toward the salesman), so a camera over the customer\'s shoulder from the +z side or a side camera reads it. The loan screen: HALE MOTORS ACCOUNTS, BORROWER TYLER, a big BALANCE $58,000 and an orange status row; flagAt blinks a big red PAST DUE flag over it. chairs: true adds the salesman\'s swivel chair (seat top y .5 at local x .78, z 0: a seated bean of height .86 sits at local [.78, .242, 0] with ry -PI/2) and a red guest chair at local [-.88, 0, .42] facing +x; a standing customer goes at local [-1.0, 0, -.25] with ry PI/2.',
  opts: { name: "nameplate text ('BRAD')", screen: "'loan' | 'cars' (default) | 'off'", flagAt: '[t0, t1]: the red PAST DUE flag blinks on over the screen (on, off, on in about half a second), stays on, and is gone after t1',
    balance: "'$58,000'", borrower: "'TYLER'", status: "the orange status row ('3 PAYMENTS MISSED')", screenScale: 'monitor size multiplier (1); 1.4 or so for close-ups', chairs: 'true = add the salesman chair and a guest chair (default false)', seed: 'brochure / inventory variety (1)' },
  inkWidth: .009,
  build: ({ name = 'BRAD', screen = 'cars', flagAt = null, balance = '$58,000', borrower = 'TYLER', status = '3 PAYMENTS MISSED', screenScale = 1, chairs = false, seed = 1 } = {}) => {
    const g = g0(), chrome = toon(0xd9dce6), white = toon(0xf8f6f0), gold = toon(0xe6c25a), dark = toon(0x2a2c38), H = .76;
    put(g, G.rbox(.92, .05, 1.72, .02), white, { y: H - .025 }); put(g, G.box(.93, .02, 1.73), gold, { y: H - .055, noInk: true });
    for (const sx of [-1, 1]) for (const sz of [-1, 1]) put(g, G.cyl(.022, .022, H - .06, 10), chrome, { x: sx * .4, y: (H - .06) / 2, z: sz * .78 });
    for (const sz of [-1, 1]) put(g, G.box(.82, .03, .03), chrome, { y: .08, z: sz * .78 });
    put(g, G.box(.03, .48, 1.6), toon(0x0f5560), { x: -.42, y: .44 }); put(g, G.box(.035, .05, 1.6), gold, { x: -.42, y: .6, noInk: true });
    put(g, G.plane(.5, .14), glow(0xffffff, { transparent: true, map: ctex(512, 140, (x, w, h) => { x.clearRect(0, 0, w, h); x.fillStyle = GOLD; x.font = '900 96px Georgia, serif'; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText('HALE', w / 2, h / 2 + 6); }, { key: 'deskhale' }) }), { x: -.44, y: .38, ry: -Math.PI / 2, noInk: true });
    // the monitor: on the -z end, screen facing +z, turned a little toward the salesman (+x)
    const mon = group(g, { x: .1, y: H, z: -.52, ry: .18 }); mon.scale.setScalar(screenScale);
    put(mon, G.cyl(.11, .13, .02, 20), dark, { y: .01 }); put(mon, G.box(.05, .2, .04), dark, { y: .11, z: -.03 });
    put(mon, G.rbox(.68, .44, .04, .02), dark, { y: .42 });
    let sc = null;
    const st = { borrower, balance, status };
    if (screen === 'loan') sc = liveTex(1024, 640, (x, w, h) => drawLoan(x, w, h, st), () => 'loan');
    else if (screen === 'off') sc = liveTex(512, 320, (x, w, h) => { x.fillStyle = '#141a3a'; x.fillRect(0, 0, w, h); x.fillStyle = 'rgba(160,190,255,.12)'; x.beginPath(); x.moveTo(60, 0); x.lineTo(200, 0); x.lineTo(80, h); x.lineTo(-60, h); x.fill(); }, () => 'off');
    else sc = liveTex(1024, 640, (x, w, h) => drawCars(x, w, h, seed), () => 'cars');
    put(mon, G.plane(.63, .394), glow(0xffffff, { map: sc.tex }), { y: .42, z: .021, noInk: true });
    const flag = group(mon, { y: .42, z: .03, rz: .1 }); flag.visible = false;
    put(flag, G.plane(.58, .17), glow(0xffffff, { transparent: true, map: ctex(1024, 300, (x, w, h) => { x.clearRect(0, 0, w, h); x.fillStyle = '#e2231a'; x.beginPath(); x.roundRect(8, 8, w - 16, h - 16, 26); x.fill(); x.strokeStyle = '#ffffff'; x.lineWidth = 16; x.beginPath(); x.roundRect(26, 26, w - 52, h - 52, 18); x.stroke();
      x.fillStyle = '#ffffff'; x.font = '900 190px Helvetica'; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText('PAST DUE', w / 2, h / 2 + 8, w - 80); }, { key: 'pastdue' }) }), { noInk: true });
    // keyboard, mouse, nameplate, pen cup, plant, brochures, a mug
    put(g, G.box(.17, .02, .46), dark, { x: .2, y: H + .01, z: -.02, ry: .05 }); put(g, G.plane(.15, .43), glow(0xffffff, { map: ctex(128, 360, (x, w, h) => { x.fillStyle = '#3a3e52'; x.fillRect(0, 0, w, h); x.fillStyle = '#d9dce6'; for (let i = 0; i < 4; i++) for (let j = 0; j < 12; j++) x.fillRect(10 + i * 29, 8 + j * 29, 22, 22); }, { key: 'kbd' }) }), { x: .2, y: H + .021, z: -.02, rx: -Math.PI / 2, rz: .05, noInk: true });
    put(g, G.sph(.035, 12, 8), dark, { x: .22, y: H + .015, z: .3, s: [1.4, .6, 1] });
    const np = group(g, { x: -.34, y: H, z: .32 }); put(np, G.box(.07, .05, .4), dark, { y: .025 });
    const npp = group(np, { x: -.02, y: .1, rz: -.25 }); put(npp, G.box(.025, .11, .38), toon(0x16141c), {});
    put(npp, G.plane(.36, .1), glow(0xffffff, { map: ctex(512, 140, (x, w, h) => { x.fillStyle = '#16141c'; x.fillRect(0, 0, w, h); x.strokeStyle = GOLD; x.lineWidth = 10; x.strokeRect(6, 6, w - 12, h - 12); x.fillStyle = GOLD; x.font = '900 96px Helvetica'; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText(name, w / 2, h / 2 + 4, w - 40); }, { key: 'np' + name }) }), { x: -.014, ry: -Math.PI / 2, noInk: true });
    const pc = group(g, { x: .28, y: H, z: -.82 + .1 }); put(pc, G.cyl(.045, .04, .11, 14), toon(0xc8232a), { y: .055 }); for (const [a, c] of [[.2, 0x1f6fff], [-.15, 0x16141c], [.05, 0xe6c25a]]) put(pc, G.cyl(.006, .006, .16, 6), toon(c), { y: .13, x: a * .1, rz: a, noInk: true });
    const pl = group(g, { x: -.28, y: H, z: -.62 }); put(pl, G.cyl(.06, .05, .09, 14), toon(0xf4f1ea), { y: .045 }); for (let i = 0; i < 6; i++) { const a = i * 1.05; put(pl, G.sph(.045, 10, 8), toon(i % 2 ? 0x3f9a55 : 0x5bb865), { x: Math.cos(a) * .04, y: .12 + (i % 3) * .03, z: Math.sin(a) * .04, s: [1.3, .6, .8], ry: -a, rz: .4 }); }
    const br = group(g, { x: -.12, y: H, z: .62, ry: .3 }), bcol = ['#e2463b', '#1f6fff', '#f5c84a', '#2f8f86'];
    for (let i = 0; i < 4; i++) put(br, G.box(.22, .012, .3), toon(new THREE.Color(bcol[(i + seed) % 4]).getHex()), { y: .006 + i * .013, ry: (i - 1.5) * .12, noInk: i < 3 });
    put(br, G.plane(.2, .28), glow(0xffffff, { map: ctex(200, 280, (x, w, h) => { x.fillStyle = bcol[(3 + seed) % 4]; x.fillRect(0, 0, w, h); x.fillStyle = '#ffffff'; x.font = '900 40px Helvetica'; x.textAlign = 'center'; x.fillText('HALE GT', w / 2, 60); x.fillStyle = '#16141c'; x.beginPath(); x.roundRect(30, 140, 140, 40, 16); x.fill(); x.fillStyle = GOLD; x.font = 'bold 26px Helvetica'; x.fillText('DRIVE TODAY', w / 2, 240); }, { key: 'broch' + seed }) }), { y: .06, rx: -Math.PI / 2, rz: .18, noInk: true });
    put(g, G.cyl(.04, .035, .09, 14), toon(0xf8f6f0), { x: .35, y: H + .045, z: .55 }); put(g, G.torus(.025, .008, 8), toon(0xf8f6f0), { x: .39, y: H + .05, z: .55, noInk: true });
