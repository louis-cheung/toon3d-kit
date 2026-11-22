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
    if (chairs) { officeChair(g, .78, 0, 0); guestChair(g, -.88, .42, 0); }
    g.userData.update = (sec) => {
      sc.update(sec);
      if (flagAt) { const t = sec - flagAt[0]; const on = sec >= flagAt[0] && sec < flagAt[1] && !(t >= .16 && t < .32); flag.visible = on; if (on) flag.scale.setScalar(1 + .12 * Math.max(0, 1 - (t >= .32 ? t - .32 : t) / .12)); }
    };
    g.userData.update(0); return g;
  },
});

// ---------- card terminal ----------
function drawTerminal(x, w, h, paid, amount, merchant = 'HALE MOTORS') {
  if (!paid) {
    x.fillStyle = '#f7f7fb'; x.fillRect(0, 0, w, h); x.fillStyle = NAVY; x.fillRect(0, 0, w, 70);
    x.fillStyle = '#ffffff'; x.font = 'bold 40px Helvetica'; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText(merchant, w / 2, 37);
    x.fillStyle = '#16141c'; x.font = '900 100px Helvetica'; x.fillText(amount, w / 2, 150, w - 30);
    x.strokeStyle = '#1f6fff'; x.lineWidth = 18; for (let i = 0; i < 4; i++) { x.beginPath(); x.arc(w / 2 - 70, 300, 30 + i * 30, -.85, .85); x.stroke(); }
    x.fillStyle = '#1f6fff'; x.beginPath(); x.arc(w / 2 - 70, 300, 14, 0, 7); x.fill();
    x.fillStyle = '#16141c'; x.font = '900 62px Helvetica'; x.fillText('TAP TO PAY', w / 2, 430, w - 30);
  } else {
    x.fillStyle = '#1fa856'; x.fillRect(0, 0, w, h);
    x.fillStyle = '#ffffff'; x.beginPath(); x.arc(w / 2, 170, 112, 0, 7); x.fill();
    x.strokeStyle = '#1fa856'; x.lineWidth = 30; x.beginPath(); x.moveTo(w / 2 - 56, 172); x.lineTo(w / 2 - 12, 218); x.lineTo(w / 2 + 62, 122); x.stroke();
    x.fillStyle = '#ffffff'; x.font = '900 110px Helvetica'; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText('PAID', w / 2, 360);
    x.font = '900 64px Helvetica'; x.fillText(amount, w / 2, 448, w - 30);
  }
}
register('card-terminal', {
  tags: ['pay', 'card', 'tap', 'checkout', 'dealership', 'rich-system'], aliases: ['tap-terminal', 'payment-terminal', 'pos-terminal'],
  desc: 'Countertop tap-to-pay card terminal on a little chrome stand. Faces +z with the screen tilted up toward the customer (about 30 degrees). The screen is most of its face: a big amount, contactless waves and TAP TO PAY; at paidAt it flips to green with a big white check, PAID and the amount, with a small pop. Origin at the bottom of the stand (put it on a counter top). Real size about 11 x 20 cm, top at y .27; size scales it.',
  opts: { merchant: "name on the screen header ('HALE MOTORS')", amount: "'$58,000'", paidAt: 'sec when it flips to PAID (null = never)', paid: 'true = already paid', size: 'scale (1)' },
  inkWidth: .004,
  build: ({ amount = '$58,000', paidAt = null, paid = false, size = 1, merchant = 'HALE MOTORS' } = {}) => {
    const g = g0(), inner = group(g); inner.scale.setScalar(size); const dark = toon(0x2a2c38), chrome = toon(0xd9dce6);
    put(inner, G.cyl(.07, .08, .015, 24), chrome, { y: .0075 }); put(inner, G.cyl(.015, .02, .08, 10), chrome, { y: .05 });
    const head = group(inner, { y: .17, z: .0, rx: -.52 });
    put(head, G.rbox(.115, .2, .035, .014), dark, {});
    const isPaid = (sec) => paid || (paidAt != null && sec >= paidAt);
    const sc = liveTex(400, 480, (x, w, h, sec) => drawTerminal(x, w, h, isPaid(sec), amount, merchant), (sec) => isPaid(sec));
    const scr = put(head, G.plane(.1, .12), glow(0xffffff, { map: sc.tex }), { y: .03, z: .0181, noInk: true });
    put(head, G.plane(.1, .05), glow(0xffffff, { map: ctex(200, 100, (x, w, h) => { x.fillStyle = '#2a2c38'; x.fillRect(0, 0, w, h); const c = ['#d9dce6', '#d9dce6', '#d9dce6']; for (let i = 0; i < 3; i++) for (let j = 0; j < 3; j++) { x.fillStyle = c[i]; x.beginPath(); x.roundRect(14 + i * 62, 8 + j * 30, 50, 22, 6); x.fill(); }
      x.fillStyle = '#e2463b'; x.fillRect(14, 96, 50, 4); }, { key: 'tkeys' }) }), { y: -.065, z: .0181, noInk: true });
    put(head, G.box(.07, .008, .02), toon(0x16141c), { y: .1, z: 0, noInk: true });   // card slot on the top edge
    g.userData.update = (sec) => { sc.update(sec); const t = paidAt != null ? sec - paidAt : -1; const pop = t >= 0 && t < .28 ? Math.sin(t / .28 * Math.PI) * .14 : 0; scr.scale.setScalar(1 + pop); head.position.y = .17 + pop * .05; };
    g.userData.update(0); return g;
  },
});

// ---------- tow truck ----------
// Truck-local: origin on the road under the middle of the truck, front +x. Body x -3.25 (rear) .. +3.6 (front bumper), width 2.4.
// The boom tip pulley is at x -3.57, y 3.4. The wheel-lift cradle sits at x -4.65 under the towed car's front wheels.
// The towed car (option car) is a sports-car with its root at (-5.95, 0, 0) facing +x: its front wheels (car x 1.3) on the cradle,
// its nose .4 m behind the truck's rear, the hook cupping its front bumper in that gap. To tow a car parked at P facing +x, put the truck at P + [5.95, 0, 0], ry 0.
const TT = { carX: -5.95, cradleX: -4.65, tipX: -3.57, tipY: 3.4, rearAxle: -1.35, frontAxle: 1.3, lift: .2, hookPt: [2.38, .47] };
register('tow-truck', {
  tags: ['vehicle', 'truck', 'tow', 'wrecker', 'street', 'dealership', 'rich-system'], aliases: ['wrecker'],
  desc: 'Chunky cartoon wrecker: bright orange cab with HALE TOWING on both doors, a chrome grille and bumper, an amber light bar on the roof, a yellow boom arm rising back over the rear with a winch cable and a big steel hook, and a low wheel-lift arm at the back. Front points +x, about 6.9 m long (x -3.25..3.6, the wheel lift reaches back to -4.75), wheels on y 0, origin on the road under the middle of the truck. The hook hangs from the boom tip at x -3.57 (stowed about 2.9 m up); dropped, it cups the towed car front bumper at about truck-local [-3.57, .47, 0]. The towed car (car option) is built behind the truck with its root at truck-local [-5.95, 0, 0], facing +x, nose to the wheel lift: to tow a car parked at P facing +x, put the truck at P + [5.95, 0, 0] with ry 0 and pass car. With carLift the car pivots on its rear axle (rear wheels stay on the road) so its nose comes up 11 degrees; the hook rides on its front bumper. Wheels turn with drive and with any from/move of the prop.',
  opts: { lights: 'true, or a start second: the amber light bar flashes (default off)', hookDrop: '[t0, t1]: the hook drops on its cable from stowed to the car\'s front bumper height, overshoots, swings and settles (the clank)', hook: '0..1 held hook position (0 stowed; default 1 when car is given and hookDrop is not, else 0)',
    car: 'sports-car options object (e.g. {rearDamage: 1, airbags: true, bumperDrop: 0, hazards: true}) or null (default): builds Tyler\'s car hooked up behind the truck. Its own timed options (bumperDrop [t0, t1], hazards, airbags) animate; a fallen bumper lies on the road even when the car is tilted, and stays there when the truck drives off', carColor: 'shortcut for car.color',
    carLift: '0..1 or [t0, t1]: the towed car\'s front rises onto the wheel lift (nose up 11 degrees, rear wheels on the road) and the cable goes taut (default 0)',
    drive: '[t0, t1, metres]: the whole truck (with the car) drives forward along +x that far over the span; it eases in (accelerates over the first 40%) then rolls at a steady speed and stops at t1, so end the shot or be off frame by t1. Truck and car wheels turn to match' },
  inkWidth: .014,
  build: ({ lights = false, hookDrop = null, hook = null, car = null, carColor = null, carLift = 0, drive = null } = {}) => {
    const root = g0(), mv = group(root), orange = toon(0xff8a1f), yellow = toon(0xf5c84a), chrome = toon(0xd9dce6), steel = toon(0x8f96a8), dark = toon(0x232842), tyre = toon(0x1c1820), white = toon(0xf8f6f0);
    // chassis, deck, fenders
    put(mv, G.box(6.3, .28, 1.0), dark, { y: .72 });
    put(mv, G.box(4.3, .12, 2.3), toon(0x9aa0b0, { map: ctex(128, 128, (x, w) => { x.fillStyle = '#9aa0b0'; x.fillRect(0, 0, w, w); x.fillStyle = '#c4c9d6'; for (let i = 0; i < 8; i++) for (let j = 0; j < 8; j++) { x.save(); x.translate(i * 16 + 8, j * 16 + 8); x.rotate((i + j) % 2 ? .7 : -.7); x.fillRect(-5, -1.5, 10, 3); x.restore(); } }, { key: 'diamondplate', repeat: [4, 2] }) }), { x: -1.1, y: .92 });
    for (const s of [-1, 1]) { put(mv, G.rbox(3.3, .85, .55, .06), orange, { x: -1.35, y: 1.4, z: s * .9 });   // side tool boxes
      for (let i = 0; i < 3; i++) put(mv, G.box(.9, .62, .02), toon(0xf07a12), { x: -2.45 + i * 1.08, y: 1.42, z: s * 1.18, noInk: true });
      for (let i = 0; i < 3; i++) put(mv, G.box(.16, .04, .03), chrome, { x: -2.45 + i * 1.08, y: 1.62, z: s * 1.2, noInk: true });
      put(mv, G.box(3.4, .1, .04), white, { x: -1.35, y: 1.0, z: s * 1.19, noInk: true });
      put(mv, G.box(1.3, .08, .62), dark, { x: -1.9, y: 1.06 - .1, z: s * .95 });   // rear fender over the tandem
      put(mv, G.box(.06, .4, .5), dark, { x: -3.0, y: .45, z: s * .95, noInk: true });   // mud flap
      put(mv, G.cyl(.18, .18, .7, 16), chrome, { x: .45, y: .58, z: s * .95, rz: Math.PI / 2 }); }   // fuel tanks
    // cab + hood
    put(mv, G.rbox(1.55, 1.8, 2.3, .14), orange, { x: 1.72, y: 1.9 });
    put(mv, G.rbox(.85, .9, 2.2, .12), orange, { x: 2.85, y: 1.38 });
    put(mv, G.rbox(.9, .06, 2.1, .02), toon(0xf07a12), { x: 2.85, y: 1.84, noInk: true });
    for (const s of [-1, 1]) { put(mv, G.box(1.56, .12, .02), white, { x: 1.72, y: 1.12, z: s * 1.16, noInk: true }); put(mv, G.box(.86, .12, .02), white, { x: 2.85, y: 1.12, z: s * 1.11, noInk: true }); }
    put(mv, G.box(.03, .78, 1.95), glow(0x8fc8f0), { x: 2.6, y: 2.3, noInk: true }); put(mv, G.box(.02, .1, 1.7), glow(0xd9f0ff), { x: 2.62, y: 2.55, noInk: true });
    for (const s of [-1, 1]) put(mv, G.plane(.95, .6), glow(0x8fc8f0), { x: 1.82, y: 2.32, z: s * 1.162, ry: s > 0 ? 0 : Math.PI, noInk: true });
    const door = ctex(640, 300, (x, w, h) => { x.fillStyle = '#ffffff'; x.beginPath(); x.roundRect(6, 6, w - 12, h - 12, 40); x.fill(); x.lineWidth = 10; x.strokeStyle = INKC; x.stroke();
      x.fillStyle = NAVY; x.font = '900 130px Georgia, serif'; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText('HALE', w / 2, 100); x.fillStyle = '#d5322c'; x.font = '900 92px Helvetica'; x.fillText('TOWING', w / 2, 200); x.fillStyle = NAVY; x.font = 'bold 42px Helvetica'; x.fillText('555-0187  24 HRS', w / 2, 262); }, { key: 'towdoor' });
    for (const s of [-1, 1]) put(mv, G.plane(1.1, .52), glow(0xffffff, { map: door }), { x: 1.72, y: 1.55, z: s * 1.163, ry: s > 0 ? 0 : Math.PI, noInk: true });
    // grille, bumper, lights, mirrors, exhaust
    put(mv, G.rbox(.1, .72, 1.5, .03), chrome, { x: 3.39, y: 1.32 });
    put(mv, G.plane(1.3, .58), glow(0xffffff, { map: ctex(256, 128, (x, w, h) => { x.fillStyle = '#c9ccd6'; x.fillRect(0, 0, w, h); x.fillStyle = '#3a3e52'; for (let i = 0; i < 7; i++) x.fillRect(10, 8 + i * 17, w - 20, 9); x.fillStyle = '#e6b84a'; x.beginPath(); x.arc(w / 2, h / 2, 22, 0, 7); x.fill(); x.fillStyle = NAVY; x.font = '900 30px Georgia'; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText('H', w / 2, h / 2 + 2); }, { key: 'towgrille' }) }), { x: 3.475, y: 1.32, ry: Math.PI / 2, noInk: true });
    put(mv, G.rbox(.24, .3, 2.45, .06), toon(0xc4c8d4), { x: 3.45, y: .74 });
    for (const s of [-1, 1]) { put(mv, G.cyl(.15, .15, .1, 18), chrome, { x: 3.36, y: 1.6, z: s * .82, rz: Math.PI / 2 }); put(mv, G.cyl(.12, .12, .105, 18), glow(0xfff6d0), { x: 3.365, y: 1.6, z: s * .82, rz: Math.PI / 2, noInk: true });
      put(mv, G.box(.06, .08, .2), glow(0xffb43a), { x: 3.37, y: 1.12, z: s * .95, noInk: true });
      put(mv, G.cyl(.015, .015, .5, 6), chrome, { x: 2.45, y: 2.1, z: s * 1.38, rx: Math.PI / 2 }); put(mv, G.rbox(.08, .42, .2, .03), chrome, { x: 2.45, y: 2.25, z: s * 1.6 }); }
    put(mv, G.cyl(.07, .07, 1.9, 12), chrome, { x: .85, y: 2.2, z: -1.0 }); put(mv, G.cyl(.075, .075, .2, 12), dark, { x: .85, y: 3.15, z: -1.0, rz: .3 });
    // amber light bar on the roof
    put(mv, G.rbox(.42, .14, 2.0, .04), dark, { x: 1.7, y: 2.87 });
    const lamps = []; for (let i = 0; i < 4; i++) { const m = put(mv, G.rbox(.36, .16, .4, .05), glow(0x6a4010), { x: 1.7, y: 2.97, z: -.72 + i * .48, noInk: true }); lamps.push(m); }
    put(mv, G.box(.38, .02, 1.98), chrome, { x: 1.7, y: 3.06, noInk: true });
    // the wrecker: turret, boom arm, ram, pulley
    put(mv, G.rbox(.8, .7, 1.0, .06), yellow, { x: -.35, y: 1.33 });
