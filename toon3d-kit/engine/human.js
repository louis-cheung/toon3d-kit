// HUMAN RIG: flat 2D drawn people with real proportions (about 6.5 heads tall), for shows where the leads have to
// read as attractive (Rich System). Same house look as the flat bean (unlit flat colour, plum-black outline, drawn
// face on a canvas, drawn hair shell), but with a neck, shoulders, a jawline, real clothes and limbs with thickness.
// Built for the 2026-11-12 look test. Options are listed on register('human') at the bottom.
import { THREE, G, put, group, ctex, hex } from './core.js';
import { register } from './registry.js';
import { EXPRESSIONS, POSES, blinkAt, flatMat, inkPart, hairShell, lump, tooth, baseLine, wrapU } from './character.js';

const INK = 0x241726, INKC = '#241726';
const inkH = (obj, w) => { obj.traverse((m) => { if (m.isMesh && !m.userData.isInk) m.userData.noInk = false; }); return inkPart(obj, w); };
const H = { R: .108, headS: [.94, 1.18, 1.0] };   // head radius and stretch (taller than wide)
const css = (c) => '#' + new THREE.Color(hex(c)).getHexString();
const shade = (c, k) => '#' + new THREE.Color(hex(c)).multiplyScalar(k).getHexString();

// ---------- head shape: a sphere stretched tall, the lower half tapered into a jaw and chin ----------
// chinUp (0..~.4) lifts only the part below the mouth (k > .62), smoothly, so the chin gets shorter and rounder without moving the mouth
function deformPt(x, y, z, jaw, chinDrop, chinUp = 0) {
  const yn = y / (H.R * 1.02);
  if (yn < 0) { const k = Math.min(1, -yn); x *= jaw < .65 ? (k < .5 ? 1 - .1 * k / .5 : .9 - ((k - .5) / .5) ** 1.3 * .5) : 1 - jaw * k ** 1.6; if (z < 0) z *= 1 - .35 * k * k; else z *= 1 - .12 * k * k; y *= chinDrop;
    if (chinUp && k > CHIN_K0) { const t = (k - CHIN_K0) / (1 - CHIN_K0); y *= (CHIN_K0 + (1 - CHIN_K0) * (t - chinUp * t * t)) / k; } }
  return [x, y, z];
}
const CHIN_K0 = .62;
const CHIN_UP = .37;   // Ethan: with the head drawn over the neck, this puts his chin where ref 28's chin line is
function deformHead(geo, jaw = .55, chinDrop = 1.08, chinUp = 0) {
  const p = geo.attributes.position;
  for (let i = 0; i < p.count; i++) p.setXYZ(i, ...deformPt(p.getX(i), p.getY(i), p.getZ(i), jaw, chinDrop, chinUp));
  p.needsUpdate = true; geo.computeVertexNormals(); return geo;
}

// ---------- face ----------
// The face shell covers theta .55..2.75 (top to below the chin) and +-45 degrees around the front, on a 1024 canvas.
// Features are placed in head-radius units (x right, y up, 0 = centre of the head) and converted to pixels.
const FT0 = .3, FT1 = 2.6;
const PX = (x) => 512 + x * 651.9 / .94;
const PY = (y) => (Math.PI / 2 - y / H.headS[1] - FT0) * (1024 / (FT1 - FT0));
function drawHumanFace(x, e, blink, fo) {
  const fem = fo.female, ink = INKC, skin = css(fo.skin), skinDk = shade(fo.skin, .86);
  x.lineCap = x.lineJoin = 'round';
  const M = (a, b) => x.moveTo(PX(a), PY(b)), L = (a, b) => x.lineTo(PX(a), PY(b)), Q = (cx, cy, a, b) => x.quadraticCurveTo(PX(cx), PY(cy), PX(a), PY(b));
  // the shadow the fringe throws on the forehead (shows between the hair tips)
  if (fo.fringeShadow !== false) { x.fillStyle = skinDk; x.beginPath(); M(-1.3, 1.6); L(1.3, 1.6); L(1, fo.shadowY); for (let k = 0; k <= 12; k++) { const xx = 1 - k / 6; L(xx, fo.shadowY - (k % 2 ? .07 : 0)); } x.closePath(); x.fill(); }
  // shading, anime style (refs 13 and 14): almost none. A tiny soft nose shadow, a little blush for her; jawShadow only for heavy faces.
  // (No big cheek shadow: the face is a shell over the skull, and paint that reaches its edge shows a seam.)
  if (fo.jawLine) {
    const jaw = () => { M(-.9, -.6); Q(-.66, -.9, -.3, -1.0); Q(0, -1.1, .3, -1.0); Q(.66, -.9, .9, -.6); };
    x.fillStyle = shade(fo.skin, .86); x.beginPath(); jaw(); L(1.4, -.6); L(1.4, -1.6); L(-1.4, -1.6); L(-1.4, -.6); x.closePath(); x.fill();
    x.strokeStyle = 'rgba(36,23,38,.5)'; x.lineWidth = fem ? 5 : 6; x.beginPath(); jaw(); x.stroke(); }
  if (fo.jawShadow) { x.fillStyle = shade(fo.skin, .86); x.beginPath(); M(-1.3, -.5); L(-.8, -.6); Q(-.42, -1.02, 0, -1.04); Q(.42, -1.02, .8, -.6); L(1.3, -.5); L(1.3, -1.6); L(-1.3, -1.6); x.closePath(); x.fill(); }   // under the jaw: reads as a double chin, so only for heavier characters (Brad, Big Mike)
  { const nx = PX(.03), ny = PY(-.36), gr = x.createRadialGradient(nx, ny, 0, nx, ny, 22); gr.addColorStop(0, css(new THREE.Color(hex(fo.skin)).multiplyScalar(.84))); gr.addColorStop(1, 'rgba(0,0,0,0)');
    x.fillStyle = gr; x.beginPath(); x.ellipse(nx, ny, 16, 24, .2, 0, 7); x.fill(); }
  if (fem && !(e.extra || []).includes('blush')) { x.fillStyle = 'rgba(255,135,150,.13)'; for (const s of [-1, 1]) { x.beginPath(); x.ellipse(PX(s * .44), PY(-.32), 50, 20, 0, 0, 7); x.fill(); } }
  // blush
  if ((e.extra || []).includes('blush')) { x.fillStyle = fem ? 'rgba(255,128,140,.26)' : 'rgba(255,128,140,.2)'; for (const s of [-1, 1]) { x.beginPath(); x.ellipse(PX(s * .4), PY(-.3), 58, 26, 0, 0, 7); x.fill(); } }
  if ((e.extra || []).includes('gloom')) { const g0 = x.createLinearGradient(0, PY(.55), 0, PY(-.32)); g0.addColorStop(0, 'rgba(60,70,190,.75)'); g0.addColorStop(.7, 'rgba(80,90,200,.35)'); g0.addColorStop(1, 'rgba(80,90,200,0)');
    x.fillStyle = g0; x.fillRect(0, PY(.6), 1024, PY(-.32) - PY(.6)); x.strokeStyle = 'rgba(30,30,110,.55)'; x.lineWidth = 4;
    for (let k = -6; k <= 6; k++) { const xx = k * .11; x.beginPath(); M(xx, .55); L(xx, .2 - (k % 3) * .06); x.stroke(); } }
  const by = Array.isArray(e.browY) ? e.browY : [e.browY || 0, e.browY || 0];
  const kind = blink >= 1 ? 'shut' : ({ dot: 'open', shine: 'open', sparkle: 'open', small: 'open', side: 'side', lid: 'lid', dreamy: 'lid', wide: 'wide', stare: 'wide', shock: 'wide', blank: 'open', teary: 'open', shut: 'shut', happy: 'happy', closed: 'happy', sleepy: 'shut', heart: 'open' })[e.eyes] || 'open';
  const half = blink > 0 && blink < 1;
  // eyes
  const EXo = fem ? .39 : .38, EYc = -.07, a = fem ? .245 : .23, hu0 = fem ? .112 : .075, hl = fem ? .06 : .05;
  for (const s of [-1, 1]) {
    const cx = s * EXo, cy = EYc, inX = cx - s * a, outX = cx + s * a, tilt = fem ? .02 : .03;
    let hu = hu0 * (kind === 'wide' ? (fem ? 1.5 : 1.75) : kind === 'lid' ? .55 : 1) * (half ? .45 : 1); const hlk = kind === 'wide' ? 2.1 : 1;
    if (kind === 'happy') { x.strokeStyle = ink; x.lineWidth = 11; x.beginPath(); M(inX, cy - .02); Q(cx, cy + hu0 * 1.9, outX, cy - .01); x.stroke(); continue; }
    if (kind === 'shut') { x.strokeStyle = ink; x.lineWidth = 10; x.beginPath(); M(inX, cy); Q(cx, cy - .05, outX, cy + tilt * .5); x.stroke(); if (fem) { x.lineWidth = 6; for (let k = 0; k < 3; k++) { const t = .55 + k * .2; const lx = inX + (outX - inX) * t; x.beginPath(); M(lx, cy - .035 + k * .005); L(lx + s * .035, cy - .07); x.stroke(); } } continue; }
    const almond = () => { x.beginPath(); M(inX, cy); Q(cx - s * a * .15, cy + hu * 2.1, outX, cy + tilt); Q(cx + s * a * .05, cy - hl * hlk * 2.0, inX, cy); x.closePath(); };
    // white of the eye
    x.fillStyle = '#fbf7f2'; almond(); x.fill();
    // iris + pupil + highlights, clipped to the eye
    x.save(); almond(); x.clip();
    if (e.eyes !== 'blank') {
    const ix = cx + (kind === 'side' ? s * .06 : 0), iy = kind === 'wide' ? cy + (hu * 2.1 - hl * hlk * 2) / 4 : cy - .03, ir = (fem ? .14 : .122) * (e.eyes === 'shock' ? .42 : kind === 'wide' ? .7 : 1);
    const ir_px = ir * 651.9;
    const grd = x.createLinearGradient(0, PY(iy) - ir_px * 1.15, 0, PY(iy) + ir_px * 1.15); grd.addColorStop(0, shade(fo.iris, .55)); grd.addColorStop(.45, css(fo.iris)); grd.addColorStop(1, shade(fo.iris, 1.25));
    x.fillStyle = grd; x.beginPath(); x.ellipse(PX(ix), PY(iy), ir_px, ir_px * 1.12, 0, 0, 7); x.fill();
    x.strokeStyle = shade(fo.iris, .4); x.lineWidth = 6; x.beginPath(); x.ellipse(PX(ix), PY(iy), ir_px * .97, ir_px * 1.09, 0, 0, 7); x.stroke();
    x.fillStyle = shade(fo.iris, .3); x.beginPath(); x.ellipse(PX(ix), PY(iy), ir_px * .48, ir_px * .54, 0, 0, 7); x.fill();
    x.fillStyle = '#fff'; x.beginPath(); x.ellipse(PX(ix - .035), PY(iy + .04), ir_px * .34, ir_px * .3, -.4, 0, 7); x.fill();
    x.globalAlpha = .8; x.beginPath(); x.arc(PX(ix + .03), PY(iy - .035), ir_px * .13, 0, 7); x.fill(); x.globalAlpha = 1;
    }
    if (e.eyes === 'teary') { x.fillStyle = 'rgba(175,225,255,.6)'; x.beginPath(); M(inX, cy - hl * .2); for (let k = 1; k <= 6; k++) L(inX + (outX - inX) * k / 6, cy - hl * .2 + (k % 2 ? .025 : -.01)); L(outX, cy - hl * 3); L(inX, cy - hl * 3); x.closePath(); x.fill();
      x.fillStyle = '#fff'; for (const [dx, dy, r] of [[-.05, -.02, 9], [.04, -.05, 6], [.09, -.01, 5]]) { x.beginPath(); x.arc(PX(cx + dx), PY(cy + dy), r, 0, 7); x.fill(); } }
    // the upper lid casts a shadow band on the eye
    x.fillStyle = 'rgba(60,30,50,.22)'; x.beginPath(); M(inX - .05, cy + .2); L(outX + s * .05, cy + .2); L(outX + s * .05, cy + tilt + hu * .9); Q(cx, cy + hu * 1.2, inX - .05, cy + hu * .5); x.closePath(); x.fill();
    x.restore();
    // upper lid: a thick tapered lash line, heavier at the outer corner, with a flick for her
    x.fillStyle = ink; x.beginPath(); M(inX - s * .005, cy - .005); Q(cx - s * a * .15, cy + hu * 2.15, outX + s * (fem ? .035 : .015), cy + tilt + (fem ? .02 : 0));
    if (fem) L(outX + s * .06, cy + tilt + .04);
    Q(cx - s * a * .1, cy + hu * 2.15 + (fem ? .15 : .11), inX - s * .005, cy + .02); x.closePath(); x.fill();
    if (fem) { x.strokeStyle = ink; x.lineWidth = 6; for (let k = 0; k < 2; k++) { const bx = outX - s * (.03 + k * .05), byy = cy + tilt + hu * 1.4 - k * .01; x.beginPath(); M(bx, byy); Q(bx + s * .03, byy + .05, bx + s * .06, byy + .06); x.stroke(); } }
    // crease above the lid
    if (fem && kind !== 'lid') { x.strokeStyle = shade(fo.skin, .78); x.lineWidth = 4; x.beginPath(); M(cx - s * a * .55, cy + hu * 2.1 + .045); Q(cx, cy + hu * 2.3 + .06, outX - s * .01, cy + tilt + .06); x.stroke(); }
    // lower lash for wide eyes only (ink, short, outer half): sells the round shocked eye
    if (kind === 'wide') { x.strokeStyle = ink; x.lineWidth = fem ? 5 : 4; x.beginPath(); M(cx + s * a * .1, cy - hl * hlk * 1.75); Q(cx + s * a * .7, cy - hl * hlk * 1.5, outX, cy + tilt * .3); x.stroke(); }
  }
  // brows: nearly straight, thick at the inner end, tapering out. They rise and fall with the upper lid (wide eyes lift them, a narrowed lid lowers them).
  const browLift = kind === 'wide' ? (fem ? .06 : .09) : kind === 'lid' ? -.035 : 0;   // small: her fringe sits just above the brows
  for (const s of [-1, 1]) {
    const i = s < 0 ? 0 : 1, ang = e.brows[i] * .8, dy = -by[i] * .0045 + browLift;
    const x0 = s * .15, x1 = s * (fem ? .56 : .56), y0 = (fem ? .25 : .17) + dy;
    const rot = (px, py) => { const dx = px - x0, dyy = py - y0, c = Math.cos(-s * ang), sn = Math.sin(-s * ang); return [x0 + dx * c - dyy * sn, y0 + dx * sn + dyy * c]; };
    const tw = fem ? .025 : .036, arch = fem ? .018 : .01;
    const pts = [rot(x0, y0 + tw), rot((x0 + x1) / 2, y0 + tw * .55 + arch), rot(x1, y0 + tw * .15), rot((x0 + x1) / 2, y0 + arch - tw * .3), rot(x0, y0 - tw * .6)];
    x.fillStyle = fo.browColor || ink; x.beginPath(); M(...pts[0]); Q(...pts[1], ...pts[2]); Q(...pts[3], ...pts[4]); x.closePath(); x.fill();
  }
  // nose
  x.strokeStyle = shade(fo.skin, .6); x.lineWidth = fem ? 4 : 5;
  x.beginPath(); M(-.01, -.405); Q(.02, -.418, .045, -.4); x.stroke();
  // mouth
  const my = fem ? -.66 : -.68, mw = fem ? .11 : .11; x.strokeStyle = ink; x.lineWidth = 8;
  const lips = (open) => { if (!fem) return; const lp = fo.lip || 0xd9707c;
    x.fillStyle = shade(lp, 1.18); x.beginPath(); M(-mw * .8, my - .005); Q(0, my - (open ? .12 : .09), mw * .8, my - .005); Q(0, my - .015, -mw * .8, my - .005); x.fill();   // lower lip, lighter
    x.fillStyle = shade(lp, .82); x.beginPath(); M(-mw * .95, my + .008); Q(-mw * .35, my + .05, 0, my + .03); Q(mw * .35, my + .05, mw * .95, my + .008); Q(0, my - .01, -mw * .95, my + .008); x.fill(); };   // upper lip, darker, with a bow
  const m = e.mouth;
  if (['o', 'drop'].includes(m)) {
    const lp = fo.lip || 0xd9707c, cyM = my - (m === 'o' ? .05 : .1);
    // 'o': a small oval. 'drop': wide AND open (anime shock), a gently arched top and a round bottom.
    const rx = m === 'o' ? .06 : .135, top = cyM + (m === 'o' ? .1 : .13), bot = cyM - (m === 'o' ? .1 : .17);
    const cd = m === 'o' ? 0 : .045;   // shock: the corners pull down, the top arches up (reads as alarm, not a grin)
    const hole = (g = 0) => { x.beginPath(); M(-rx - g, top - cd + g * .8); Q(0, top + .03 + cd + g, rx + g, top - cd + g * .8); Q(rx * (m === 'o' ? 1.15 : .98) + g, bot + (top - bot) * .15, 0, bot - g * 1.4); Q(-rx * (m === 'o' ? 1.15 : .98) - g, bot + (top - bot) * .15, -rx - g, top - cd + g * .8); x.closePath(); };
    if (fem) { x.fillStyle = css(lp); hole(.022); x.fill(); x.fillStyle = shade(lp, 1.16); x.beginPath(); x.ellipse(PX(0), PY(bot - .02), rx * .5 * 693, 6, 0, 0, 7); x.fill(); }   // her lips, a lower-lip shine
    x.fillStyle = '#3a1522'; hole(); x.fill();
    x.save(); hole(); x.clip();
    x.fillStyle = '#c4566a'; x.beginPath(); x.ellipse(PX(0), PY(bot + .02), rx * .8 * 693, (top - bot) * .3 * 377, 0, 0, 7); x.fill();   // tongue
    x.fillStyle = '#fbf6f0'; x.fillRect(PX(-rx * 1.1), PY(top + .04), rx * 2.2 * 693, (.04 + (top - bot) * .18) * 377);   // upper teeth
    x.restore();
    x.strokeStyle = INKC; x.lineWidth = fem ? 4 : 5; hole(); x.stroke();
  }
  else if (m === 'grit') { const rx = .12, t = my + .035, b = my - .07; x.fillStyle = '#fbf6f0'; x.beginPath(); M(-rx, t); Q(0, t + .015, rx, t); Q(rx * 1.08, (t + b) / 2, rx * .9, b); Q(0, b - .015, -rx * .9, b); Q(-rx * 1.08, (t + b) / 2, -rx, t); x.closePath(); x.fill();
    x.strokeStyle = INKC; x.lineWidth = 3; x.beginPath(); M(-rx * .95, (t + b) / 2); L(rx * .95, (t + b) / 2); for (const tx of [-.06, 0, .06]) { M(tx, t); L(tx + .004, b); } x.stroke(); x.lineWidth = 5; x.beginPath(); M(-rx, t); Q(0, t + .015, rx, t); Q(rx * 1.08, (t + b) / 2, rx * .9, b); Q(0, b - .015, -rx * .9, b); Q(-rx * 1.08, (t + b) / 2, -rx, t); x.closePath(); x.stroke(); }
  else if (m === 'tri') { x.fillStyle = '#e98a90'; x.beginPath(); M(0, my + .07); Q(.02, my + .06, .1, my - .17); Q(0, my - .19, -.1, my - .17); Q(-.02, my + .06, 0, my + .07); x.closePath(); x.fill(); x.strokeStyle = INKC; x.lineWidth = 5; x.stroke(); }
  else if (m === 'nervous') { const rx = .15, t = my + .03, b = my - .16; const sh = () => { x.beginPath(); M(-rx, t + .02); Q(0, t - .02, rx, t + .02); Q(rx * .7, b + .02, 0, b); Q(-rx * .7, b + .02, -rx, t + .02); x.closePath(); };
    x.fillStyle = '#3a1522'; sh(); x.fill(); x.save(); sh(); x.clip(); x.fillStyle = '#fbf6f0'; x.fillRect(PX(-rx), PY(t + .03), rx * 2 * 693, .05 * 377); x.fillStyle = '#c4566a'; x.beginPath(); x.ellipse(PX(0), PY(b + .02), rx * .55 * 693, 18, 0, 0, 7); x.fill(); x.restore();
    x.strokeStyle = INKC; x.lineWidth = 5; sh(); x.stroke(); }
  else if (['open', 'laugh', 'grin', 'grinWavy', 'talk2', 'talk3'].includes(m)) { const d = m === 'talk2' ? .05 : m === 'talk3' ? .08 : .1; x.fillStyle = '#4a1f2e'; x.beginPath(); M(-mw, my + .01); Q(0, my - .015, mw, my + .01); Q(0, my - d * 1.6, -mw, my + .01); x.fill(); if (m === 'grin' || m === 'laugh') { x.fillStyle = '#fff'; x.beginPath(); M(-mw * .8, my); Q(0, my - .02, mw * .8, my); Q(0, my - .035, -mw * .8, my); x.fill(); } }
  else if (m === 'talk1') { lips(0); x.fillStyle = '#4a1f2e'; x.beginPath(); x.ellipse(PX(0), PY(my - .01), 26, 9, 0, 0, 7); x.fill(); }
  else {
    lips(0);
    const up = m === 'smile' ? .035 : m === 'small' ? .018 : m === 'frown' ? -.03 : 0;
    x.beginPath();
    if (m === 'smirk' || m === 'side') { M(-mw * .8, my); Q(mw * .2, my - .02, mw * 1.05, my + .035); }
    else if (m === 'wavy') { M(-mw, my); for (let k = 1; k <= 4; k++) Q(-mw + (k - .5) * mw / 2, my + (k % 2 ? .02 : -.02), -mw + k * mw / 2, my); }
    else { const w = m === 'tiny' ? mw * .5 : mw; M(-w, my + up); Q(0, my - up * 1.2, w, my + up); }
    x.stroke();
  }
  for (const ex of e.extra || []) {
    if (ex === 'sweat') { x.fillStyle = '#bfe6ff'; x.strokeStyle = '#5a8fc0'; x.lineWidth = 3; for (const [sx0, sy0, k] of [[.66, -.02, 1], [-.7, .05, .7], [.56, -.3, .6]]) { x.beginPath(); M(sx0, sy0 + .1 * k); Q(sx0 + .05 * k, sy0 - .02 * k, sx0, sy0 - .06 * k); Q(sx0 - .05 * k, sy0 - .02 * k, sx0, sy0 + .1 * k); x.fill(); x.stroke(); } }
    if (ex === 'tears' || e.eyes === 'teary') { x.strokeStyle = 'rgba(150,210,255,.85)'; x.lineWidth = 7; for (const s of [-1, 1]) { x.beginPath(); M(s * .5, -.16); Q(s * .53, -.32, s * .5, -.48); x.stroke(); } }
    if (ex === 'vein') { x.strokeStyle = '#d8283a'; x.lineWidth = 7; x.lineCap = 'round'; const vx = .62, vy = .2; for (const [ax, ay] of [[1, 1], [-1, 1], [1, -1], [-1, -1]]) { x.beginPath(); M(vx + ax * .025, vy + ay * .05); Q(vx + ax * .025, vy + ay * .018, vx + ax * .07, vy + ay * .018); x.stroke(); } }
  }
}
/** Named expressions for the human rig, built from the anime references (references/rich-system-refs/19-26).
 *  Brows [left, right]: positive = outer end down (worried, sad); negative = outer end up (angry V). */
export const HEXPR = {
  calm: { eyes: 'dot', brows: [0, 0], mouth: 'flat' },
  smile: { eyes: 'dot', brows: [.05, .05], mouth: 'smile' },
  happy: { eyes: 'happy', brows: [.08, .08], mouth: 'smile', extra: ['blush'] },
  smirk: { eyes: 'lid', brows: [-.1, .12], mouth: 'smirk' },
  surprised: { eyes: 'wide', brows: [.12, .12], mouth: 'o' },
  shock: { eyes: 'shock', brows: [.22, .22], mouth: 'drop' },
  worried: { eyes: 'dot', brows: [.28, .28], mouth: 'frown' },
  teary: { eyes: 'teary', brows: [.3, .3], mouth: 'wavy' },
  angry: { eyes: 'lid', brows: [-.38, -.38], mouth: 'grit', extra: ['vein'] },
  fuming: { eyes: 'shut', brows: [-.38, -.38], mouth: 'o', extra: ['vein'] },
  rage: { eyes: 'blank', brows: [-.45, -.45], mouth: 'tri' },
  gloom: { eyes: 'shock', brows: [.3, .3], mouth: 'nervous', extra: ['gloom', 'sweat'] },
};
function humanFaceTex(expr, blink, fo) {
  const e = typeof expr === 'object' ? expr : HEXPR[expr] || EXPRESSIONS[expr] || EXPRESSIONS.neutral;
  return ctex(1024, 1024, (x) => { drawHumanFace(x, e, blink, fo); if (fo.shades) drawShades(x, fo); }, { key: 'hface:' + JSON.stringify([e, blink, fo]) });
}
// Sunglasses pushed down the nose (Madison's hook shot): two dark lenses under the eyes, the eyes looking over the top.
function drawShades(x, fo) {
  const M = (a, b) => x.moveTo(PX(a), PY(b)), L = (a, b) => x.lineTo(PX(a), PY(b)), Q = (cx, cy, a, b) => x.quadraticCurveTo(PX(cx), PY(cy), PX(a), PY(b));
  const y0 = fo.female ? -.17 : -.18, hh = .2, ww = .26;
  const lens = (s) => { const cx = s * .37; x.beginPath(); M(cx - ww, y0); Q(cx, y0 + .025, cx + ww, y0); Q(cx + ww * 1.02, y0 - hh * .7, cx + s * .02, y0 - hh); Q(cx - ww * 1.04, y0 - hh * .8, cx - ww, y0); x.closePath(); };
  for (const s of [-1, 1]) { x.fillStyle = '#211a2a'; lens(s); x.fill(); x.lineWidth = 7; x.strokeStyle = INKC; x.stroke();
    x.strokeStyle = 'rgba(255,255,255,.55)'; x.lineWidth = 6; x.beginPath(); M(s * .37 - .12, y0 - .04); L(s * .37 - .03, y0 - .13); x.stroke(); }
  x.strokeStyle = INKC; x.lineWidth = 7; x.beginPath(); M(-.11, y0 - .02); Q(0, y0 + .03, .11, y0 - .02); x.stroke();
}

// ---------- hair ----------
// Anime-style hair on the shared hairShell builder: a hairline with long pointed locks (fringe, side locks,
// nape), soft volume lumps, strand strokes, and a lighter "ring" highlight band around the crown.
function hairTexH(color, strands, ring, ringColor) {
  const c = new THREE.Color(hex(color)), base = '#' + c.getHexString(), dk = '#' + (c.getHSL({}).l < .12 ? c.clone().lerp(new THREE.Color(0x5a6688), .45) : c.clone().multiplyScalar(.62)).getHexString(),
    lt = ringColor ? css(ringColor) : '#' + c.clone().lerp(new THREE.Color(1, .9, .8), .32).getHexString();
  return ctex(1024, 512, (x, w, h) => {
    x.fillStyle = base; x.fillRect(0, 0, w, h);
    const U = (u) => (u + Math.PI) / (Math.PI * 2) * w;
    if (ring) { const [t0, t1] = ring; x.fillStyle = lt; x.beginPath(); x.moveTo(0, h * t0); for (let k = 0; k <= 40; k++) x.lineTo(k / 40 * w, h * (t0 + (k % 2 ? .02 : -.01))); for (let k = 40; k >= 0; k--) x.lineTo(k / 40 * w, h * (t1 + (k % 3 === 0 ? .07 : 0))); x.fill(); }
    x.strokeStyle = dk; x.lineCap = 'round';
    for (const [u, t0, t1, bend, lw] of strands) { x.lineWidth = (lw || 5) * .6; x.beginPath(); x.moveTo(U(u), h * t0); x.quadraticCurveTo(U(u + bend), h * (t0 + t1) / 2, U(u + bend * 1.5), h * t1); x.stroke(); }
  }, { key: 'hairH' + base + JSON.stringify([strands, ring, ringColor]) });
}
const HAIR = {
  // Ethan: messy layered fringe of pointed locks down to the brows, side locks over the ears, tufts at the nape
  ethan: () => ({
    line: (u) => { let t = baseLine(.74, 1.5, 2.2)(u); let k = 0;
      for (const [c, Lh, wl, wr, p] of [[-.98, .55, .36, .16, 2.0], [-.6, .82, .4, .14, 2.1], [-.22, .66, .32, .12, 2.0], [.06, .95, .36, .12, 2.2], [.4, .74, .36, .14, 2.0], [.78, .6, .36, .16, 1.9],
        [-1.2, .2, .24, .12, 1.4], [1.18, .2, .2, .16, 1.4], [-1.48, .16, .2, .16, 1.3], [1.48, .16, .2, .16, 1.3], [-2.1, .3, .28, .22, 1.3], [2.1, .3, .22, .28, 1.3], [-2.6, .34, .28, .22, 1.3], [2.6, .34, .22, .28, 1.3], [Math.PI, .34, .26, .26, 1.3]])
        k = Math.max(k, tooth(u, c, Lh, wl, wr, p)); return t + k; },
    bump: (d, th, u) => lump([[[-.45, .85, .25], .11, .55], [[.4, .88, .1], .1, .55], [[0, .9, -.4], .13, .6], [[-.85, .45, -.1], .09, .5], [[.85, .45, -.1], .09, .5], [[0, .3, -.9], .08, .7], [[-.3, .7, .6], .07, .4], [[.25, .7, .62], .06, .4], [[.12, 1, -.05], .04, .35]])(d) + (Math.cos(u) > .4 && th < 1.0 ? .03 * Math.cos(u) : 0), scale: 1.02,
    strands: [[-.8, .3, .85, .12, 6], [-.35, .28, .88, .1, 6], [.15, .3, .9, .1, 6], [.6, .3, .85, .12, 6], [-.6, .5, .95, .06, 4], [-.1, .5, .97, .05, 4], [.35, .5, .96, .06, 4], [.8, .5, .95, .05, 4], [-1.0, .45, .95, .02, 4], [1.3, .35, .9, .05, 5], [-1.3, .35, .9, -.05, 5], [2.2, .3, .85, .1, 5], [-2.2, .3, .85, -.1, 5]],
  }),
  // Madison: black, centre-ish part, curtain fringe swept to the sides, long face-framing locks, the rest pulled back
  madison: () => ({
    line: (u) => { let t = baseLine(.66, 1.5, 1.95)(u); let k = 0;
      for (const [c, Lh, wl, wr, p] of [[-.4, .66, .34, .36, .65], [.36, .64, .36, .3, .65], [-.06, .56, .12, .1, .8], [.1, .5, .1, .09, .8], [-.8, 1.0, .13, .09, .6], [.78, .96, .09, .13, .6]])
        k = Math.max(k, tooth(u, c, Lh, wl, wr, p)); return t + k; },
    bump: lump([[[0, .75, -.66], .07, .7], [[-.5, .8, .2], .05, .5], [[.5, .8, .2], .05, .5], [[-.85, .3, .2], .05, .5], [[.85, .3, .2], .05, .5]]), flare: .15, scale: 1.03,
    strands: [[-.6, .25, .95, .2, 5], [.55, .25, .95, -.2, 5], [-1.6, .25, .9, .0, 4], [1.6, .25, .9, 0, 4], [-2.4, .25, .9, .1, 4], [2.4, .25, .9, -.1, 4], [Math.PI - .05, .2, .9, 0, 4]],
  }),
  // Bob (Madison, from the 2026-11-12 model sheet): a jaw-length bob with a side-swept fringe that stops above the brows,
  // hanging straight at the sides (past HANG) and framing the cheeks, slightly shorter at the back.
  bob: () => ({
    line: (u) => { const a = Math.abs(wrapU(u)), ss = (x) => x <= 0 ? 0 : x >= 1 ? 1 : x * x * (3 - 2 * x);
      let t = 1.17 + 1.31 * ss((a - .66) / .36) - .12 * ss((a - 1.9) / 1.0);
      let k = 0; for (const [c, Lh, wl, wr, p] of [[-.5, .2, .2, .12, 1.5], [-.3, .24, .14, .12, 1.6], [-.1, .2, .13, .12, 1.6], [.1, .23, .13, .12, 1.6], [.3, .2, .12, .14, 1.6], [.5, .16, .12, .2, 1.5]]) k = Math.max(k, tooth(u, c, Lh, wl, wr, p));
      for (const [c, Lh] of [[-.95, .14], [.95, .14], [-1.25, .1], [1.25, .1], [-1.7, .12], [1.7, .12], [-2.3, .1], [2.3, .1], [Math.PI, .1]]) k = Math.max(k, tooth(u, c, Lh, .14, .14, 1.4));
      return t + k; },
    bump: lump([[[0, .92, -.25], .09, .8], [[-.6, .7, -.3], .05, .6], [[.6, .7, -.3], .05, .6], [[0, .45, -.85], .06, .7]]), flare: .22, scale: 1.04,
    strands: [[-.45, .2, .9, .15, 5], [.1, .2, .92, .2, 5], [.55, .25, .9, .1, 5], [-1.1, .3, .97, 0, 4], [1.1, .3, .97, 0, 4], [-1.7, .3, .97, 0, 4], [1.7, .3, .97, 0, 4], [-2.5, .3, .95, .05, 4], [2.5, .3, .95, -.05, 4], [Math.PI, .3, .95, 0, 4]],
  }),
};
// Tyler: slicked back, no fringe, a little quiff at the front, short at the back and sides
HAIR.slick = () => ({
  line: (u) => { const a = Math.abs(wrapU(u)); let t = baseLine(.62, 1.3, 1.95)(u); for (const [c, Lh] of [[-1.25, .08], [1.25, .08], [Math.PI, .12], [-2.4, .1], [2.4, .1]]) t += tooth(u, c, Lh, .25, .25, 1.2); return t + (a < .6 ? .03 * Math.cos(a * 5) : 0); },
  bump: lump([[[0, .75, .55], .1, .55], [[0, .95, .1], .07, .7], [[.25, .8, .45], .05, .4]]), scale: 1.02,
  strands: [[-.5, .25, .8, -.25, 5], [-.15, .25, .85, -.2, 5], [.2, .25, .85, -.2, 5], [.55, .25, .8, -.15, 5], [-1.2, .3, .9, -.1, 4], [1.2, .3, .9, .1, 4], [2.3, .3, .85, 0, 4], [-2.3, .3, .85, 0, 4]],
});
// short crop with a receding front (the old man, Big Mike under his cap)
HAIR.short = () => ({
  line: (u) => baseLine(.5, 1.32, 1.85)(u) + tooth(u, -1.3, .1, .2, .2, 1.2) + tooth(u, 1.3, .1, .2, .2, 1.2),
  bump: lump([[[0, .9, -.3], .04, .8]]), scale: 1.0,
  strands: [[-.4, .3, .8, 0, 4], [.4, .3, .8, 0, 4], [-1.4, .3, .9, 0, 4], [1.4, .3, .9, 0, 4], [Math.PI, .3, .9, 0, 4]],
});
function humanHair(head, style, color, o) {
  const make = HAIR[style]; if (!make) return null;
  const HH = make(), R = H.R, g = group(head); g.scale.set(...H.headS.map((v) => v * (HH.scale || 1)));
  const { geo, edge } = hairShell(R, HH.line, HH.bump, HH.flare || 0);
  const shell = put(g, geo, flatMat(0xffffff, { tint: o.tint, map: hairTexH(color, HH.strands, HH.ring, HH.ringColor) }), { noInk: true }); shell.userData.part = 'hair';
  const hull = put(shell, hairShell(R, HH.line, HH.bump, HH.flare || 0, .0038).geo, flatMat(INK, { side: THREE.BackSide }), { shadow: false }); hull.userData.isInk = true;
  put(g, new THREE.TubeGeometry(edge, 400, .0016, 5, true), flatMat(INK), { noInk: true, shadow: false });
  // loose locks: tapered tubes that leave the scalp and curl out and down, breaking the silhouette (two tones)
  const dk = new THREE.Color(hex(color)).multiplyScalar(.72).getHex(), lt = new THREE.Color(hex(color)).lerp(new THREE.Color(1, .92, .85), .12).getHex();
  for (const [th, u, len, droop, side, tone, r0] of (HH.locks || [])) {
    const d = new THREE.Vector3(Math.sin(th) * Math.sin(u), Math.cos(th), Math.sin(th) * Math.cos(u)), down = new THREE.Vector3(0, -1, 0), sv = new THREE.Vector3(Math.cos(u), 0, -Math.sin(u));
    const p0 = d.clone().multiplyScalar(R * .98), p1 = p0.clone().add(d.clone().multiplyScalar(R * .3 * len)).add(down.clone().multiplyScalar(R * .12 * droop)).add(sv.clone().multiplyScalar(R * .08 * side));
    const p2 = p0.clone().add(d.clone().multiplyScalar(R * .48 * len)).add(down.clone().multiplyScalar(R * .45 * droop)).add(sv.clone().multiplyScalar(R * .2 * side));
    const lk = put(g, taperTube(new THREE.CatmullRomCurve3([p0, p1, p2]), R * (r0 || .16), R * .01, 24, 10), flatMat(tone ? dk : lt, { tint: o.tint }), { noInk: true }); inkH(lk, .0025);
  }
  return g;
}

/** A tube whose radius tapers from r0 to r1 along a curve (ponytail, locks). */
function taperTube(curve, r0, r1, seg = 40, rad = 14) {
  const pos = [], idx = [], frames = curve.computeFrenetFrames(seg, false);
  for (let i = 0; i <= seg; i++) { const t = i / seg, p = curve.getPointAt(t), r = r0 + (r1 - r0) * t ** 1.3 - (t > .92 ? (t - .92) * 2 * r1 : 0);
    for (let j = 0; j <= rad; j++) { const a = j / rad * Math.PI * 2, n = frames.normals[i].clone().multiplyScalar(Math.cos(a)).add(frames.binormals[i].clone().multiplyScalar(Math.sin(a))); pos.push(p.x + n.x * r, p.y + n.y * r, p.z + n.z * r); } }
  for (let i = 0; i < seg; i++) for (let j = 0; j < rad; j++) { const a = i * (rad + 1) + j, b = a + rad + 1; idx.push(a, b, a + 1, b, b + 1, a + 1); }
  const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); g.setIndex(idx); g.computeVertexNormals(); return g;
}

// ---------- body ----------
/** Torso: a capsule widened at the shoulders (or bust/hips for her) and flattened front to back. */
function torsoGeo(fem) {
  const g = new THREE.CapsuleGeometry(.155, .3, 10, 32), p = g.attributes.position, uv = g.attributes.uv;
  const sm = (a, b, t) => { const k = Math.max(0, Math.min(1, (t - a) / (b - a))); return k * k * (3 - 2 * k); };
  for (let i = 0; i < p.count; i++) {
    const y = p.getY(i), yn = y / .305; let f;
    if (fem) f = .98 - .16 * Math.exp(-(((yn + .05) / .3) ** 2)) + .06 * sm(.2, .6, yn) - .04 * sm(.75, 1, yn);
    else f = .94 + .36 * sm(-.7, .62, yn) - .06 * sm(.85, 1, yn);
    p.setX(i, p.getX(i) * f); p.setZ(i, p.getZ(i) * (fem ? .64 : .62) * (fem ? 1 + .1 * Math.exp(-(((yn - .42) / .2) ** 2)) * (p.getZ(i) > 0 ? 1 : 0) : 1));
    uv.setY(i, (y + .305) / .61);
  }
  p.needsUpdate = true; g.computeVertexNormals(); return g;
}
/** Draw a front feature centred on the capsule seam (u = 0 and u = 1 are both the front). */
const front = (x, w, fn) => { for (const ox of [0, w]) { x.save(); x.translate(ox, 0); fn(); x.restore(); } };
function hoodieTex(c, sh) {
  return ctex(1024, 512, (x, w, h) => {
    x.fillStyle = css(c); x.fillRect(0, 0, w, h);
    x.fillStyle = shade(c, .78); x.beginPath(); x.moveTo(w * .2, 0); x.quadraticCurveTo(w * .23, h * .5, w * .2, h); x.lineTo(w * .5, h); x.lineTo(w * .5, 0); x.fill();   // cel shadow side
    x.fillStyle = shade(c, .86); x.fillRect(0, h * .92, w, h * .08);   // ribbed hem
    front(x, w, () => { x.strokeStyle = shade(c, .6); x.lineWidth = 6; x.fillStyle = shade(c, .9);   // kangaroo pocket
      x.beginPath(); x.moveTo(-90, h * .86); x.lineTo(-70, h * .58); x.lineTo(70, h * .58); x.lineTo(90, h * .86); x.closePath(); x.fill(); x.stroke();
      x.strokeStyle = css(sh || 0xf3efe6); x.lineWidth = 7; for (const s of [-1, 1]) { x.beginPath(); x.moveTo(s * 22, h * .02); x.quadraticCurveTo(s * 26, h * .16, s * 20, h * .3); x.stroke(); x.fillStyle = css(sh || 0xf3efe6); x.beginPath(); x.arc(s * 20, h * .31, 7, 0, 7); x.fill(); } });
  }, { key: 'hood' + c });
}
function jacketTex(c, inner) {
  return ctex(1024, 512, (x, w, h) => {
    x.fillStyle = css(c); x.fillRect(0, 0, w, h);
    x.fillStyle = shade(c, .7); x.beginPath(); x.moveTo(w * .2, 0); x.quadraticCurveTo(w * .23, h * .5, w * .2, h); x.lineTo(w * .5, h); x.lineTo(w * .5, 0); x.fill();
    x.fillStyle = 'rgba(255,255,255,.12)'; x.fillRect(w * .87, 0, 26, h); x.fillRect(w * .1, 0, 14, h);   // sheen
    front(x, w, () => {
      x.fillStyle = css(inner); x.beginPath(); x.moveTo(-60, 0); x.lineTo(60, 0); x.lineTo(0, h * .62); x.closePath(); x.fill();   // the turtleneck in the V
      x.fillStyle = shade(c, 1.9); x.strokeStyle = INKC; x.lineWidth = 5;   // lapels
      for (const s of [-1, 1]) { x.beginPath(); x.moveTo(s * 60, 0); x.lineTo(s * 150, h * .06); x.lineTo(s * 105, h * .3); x.lineTo(s * 120, h * .34); x.lineTo(s * 4, h * .63); x.closePath(); x.fill(); x.stroke(); }
      x.strokeStyle = shade(c, .55); x.lineWidth = 6; x.beginPath(); x.moveTo(0, h * .63); x.lineTo(0, h); x.stroke();
      x.fillStyle = shade(c, 2.2); x.beginPath(); x.arc(-16, h * .74, 9, 0, 7); x.fill(); });
  }, { key: 'jack' + c + inner });
}
function plainTex(c, k = .8) {
  return ctex(512, 256, (x, w, h) => { x.fillStyle = css(c); x.fillRect(0, 0, w, h); x.fillStyle = shade(c, k); x.beginPath(); x.moveTo(w * .2, 0); x.quadraticCurveTo(w * .23, h * .5, w * .2, h); x.lineTo(w * .5, h); x.lineTo(w * .5, 0); x.fill(); }, { key: 'plain' + c + k });
}
const limb = (r0, r1, len) => { const g = new THREE.CylinderGeometry(r0, r1, len, 18, 4); g.translate(0, -len / 2, 0); const cap0 = new THREE.SphereGeometry(r0, 18, 10); return [g, cap0]; };

/**
 * makeHuman(o): options
 *  sex: 'm'|'f', height (metres, default 1.82 m / 1.66 f), skin, iris, hair: 'ethan'|'madison', hairColor,
 *  top: 'hoodie'|'jacket', topColor, innerColor (turtleneck), legsColor, shoes, bag (delivery backpack colour),
 *  ribbon (colour), earrings (colour), lip, expression, pose (POSES name or {L,R}), tint
 */
let HUMAN_REF = 0;
export function makeHuman(o = {}) {
  const fem = o.sex === 'f';
  o = { skin: 0xf6dfcf, iris: fem ? 0x7a4430 : 0x8a5a2e, expression: 'neutral', pose: 'idle', top: fem ? 'jacket' : 'hoodie', topColor: fem ? 0x24202c : 0x7b808c,
    innerColor: 0x19161f, legsColor: fem ? 0x221f2a : 0x3d4c6e, shoes: fem ? 0x17141c : 0xf1ede4, ...o };
  const tint = o.tint, skinM = flatMat(o.skin, { tint }), skinDkM = flatMat(new THREE.Color(hex(o.skin)).multiplyScalar(.86).getHex(), { tint });
  const root = new THREE.Group(), hips = group(root, { y: fem ? .82 : .87 });
  const TH = fem ? .37 : .4, SH = fem ? .36 : .39;   // thigh and shin
  const W = fem ? .9 : 1;   // width scale
  // legs
  const legM = flatMat(0xffffff, { tint, map: plainTex(o.legsColor, .75) }), shoeM = flatMat(o.shoes, { tint });
  const legs = [];
  for (const s of [-1, 1]) {
    const hp = group(hips, { x: s * .09 * W, y: -.02 }); const [tg, tc] = limb(fem ? .07 : .074, .056, TH);
    put(hp, tg, legM, { noInk: true }); put(hp, tc, legM, { noInk: true });
    const knee = group(hp, { y: -TH }); const [sg, sc] = limb(.054, fem ? .038 : .045, SH); put(knee, sg, legM, { noInk: true }); put(knee, sc, legM, { noInk: true });
    const ankle = group(knee, { y: -SH });
    put(ankle, G.rbox(fem ? .075 : .1, fem ? .1 : .085, fem ? .2 : .26, .035), shoeM, { y: -.02, z: .045, noInk: true });
    if (!fem) put(ankle, G.box(.104, .02, .262), flatMat(0x2a2530, { tint }), { y: -.06, z: .045, noInk: true });   // sole
    legs.push({ hp, knee, ankle }); inkH(hp, .006);
  }
  // pelvis
  const pel = put(hips, G.sph(1, 24, 16), legM, { y: .03, s: [.16 * W * (fem ? 1.1 : 1), .1, .095], noInk: true }); inkH(pel, .006);
  // torso
  const topMap = o.top === 'hoodie' ? hoodieTex(o.topColor, o.strings) : o.top === 'jacket' ? jacketTex(o.topColor, o.innerColor) : plainTex(o.topColor);
  const topM = flatMat(0xffffff, { tint, map: topMap });
  const torso = put(hips, torsoGeo(fem), topM, { y: .3, noInk: true }); inkH(torso, .007);
    // neck (+ turtleneck)
  const neckM = o.top === 'jacket' ? flatMat(o.innerColor, { tint }) : skinDkM;
    const neck = put(hips, G.cyl(fem ? .038 : .046, fem ? .045 : .054, .15, 20), neckM, { y: .6, noInk: true }); inkH(neck, .005);
  if (o.top === 'jacket') { const col = put(hips, G.cyl(.05, .056, .05, 24), flatMat(o.innerColor, { tint }), { y: .585, noInk: true }); inkH(col, .005);
  }
  if (o.top === 'hoodie') {   // the hood, bunched around the back of the neck, open at the front
    const hood = put(hips, G.sph(1, 28, 18), flatMat(new THREE.Color(hex(o.topColor)).multiplyScalar(.9).getHex(), { tint }), { y: .575, z: -.075, rx: -.3, s: [.14, .075, .085], noInk: true }); inkH(hood, .006);
  }
  // head
  const head = group(hips, { y: fem ? .74 : .752 });   // Ethan: a shorter chin and the head a touch lower (ref 28 paintover); Madison unchanged
  // skull: below the jaw line (same curve as the face texture's) it takes the neck tone, so the jaw reads past the face shell too
  const skullRaw = new THREE.SphereGeometry(H.R, 160, 120), sp = skullRaw.attributes.position, cols = [];
  const cSkin = new THREE.Color(hex(o.skin)).multiply(new THREE.Color(hex(o.tint ?? 0xffffff))), cNeck = cSkin.clone().multiplyScalar(.86);
  const jawY = (xt) => { const a = Math.min(1, Math.abs(xt) / .9); return Math.abs(xt) > .9 ? -.6 : -1.06 + .46 * a ** 1.8; };
  for (let i = 0; i < sp.count; i++) { const th = Math.acos(Math.max(-1, Math.min(1, sp.getY(i) / H.R))), u = Math.atan2(sp.getX(i), sp.getZ(i));
    const c = o.jawTone && (Math.PI / 2 - th) * 1.18 < jawY(.94 * u) ? cNeck : cSkin; cols.push(c.r, c.g, c.b); }
  skullRaw.setAttribute('color', new THREE.Float32BufferAttribute(cols, 3));
  const skullGeo = deformHead(skullRaw, fem ? .68 : .62, fem ? 1.02 : .98, fem ? 0 : CHIN_UP);
  const skull = put(head, skullGeo, new THREE.MeshBasicMaterial({ vertexColors: true, toneMapped: false }), { s: H.headS, noInk: true }); inkH(skull, .0065);
  { // jaw line (anime face outline where the face meets the neck): a second, half-opacity outline of the head that is pulled
    // forward in the depth test, so it shows over the neck right at the jaw/chin edge. The main outline stays solid on the silhouette.
    const hull = skull.children.find((c) => c.userData.isInk);
    if (hull) { const m2 = hull.material.clone(); m2.fragmentShader = m2.fragmentShader.replace('vec4(c,1.)', 'vec4(c,.5)'); m2.transparent = true; m2.depthWrite = false;
      m2.polygonOffset = true; m2.polygonOffsetFactor = -14; m2.polygonOffsetUnits = -6000; m2.uniforms.w.value = fem ? .0045 : .005;
      // only the lower head (cheeks, jaw, chin): above that it would peek through the hair
      const hg = hull.geometry, pos = hg.attributes.position, src = hg.index ? hg.index.array : [...Array(pos.count).keys()], keep = [];
      for (let i = 0; i < src.length; i += 3) { const ys = [src[i], src[i + 1], src[i + 2]].map((v) => pos.getY(v)); if (Math.max(...ys) < -H.R * .25) keep.push(src[i], src[i + 1], src[i + 2]); }
      const lg = new THREE.BufferGeometry(); for (const k in hg.attributes) lg.setAttribute(k, hg.attributes[k]); lg.setIndex(keep);
      const jh = new THREE.Mesh(lg, m2); jh.userData.isInk = true; jh.castShadow = false; jh.renderOrder = 2; skull.add(jh); } }
  { // stencil: the skull marks its own pixels. The jaw line (pulled forward in depth) never draws there, so from far away it can't
    // spread over the face; for Ethan the neck doesn't either, so the chin's true silhouette is the face/neck edge and the line sits on it.
    const ref = (HUMAN_REF = HUMAN_REF % 254 + 1);
    Object.assign(skull.material, { stencilWrite: true, stencilRef: ref, stencilFunc: THREE.AlwaysStencilFunc, stencilZPass: THREE.ReplaceStencilOp }); skull.renderOrder = -1;
    const jh = skull.children.find((c) => c.userData.isInk && c.renderOrder === 2);
    if (jh) Object.assign(jh.material, { stencilWrite: true, stencilRef: ref, stencilFunc: THREE.NotEqualStencilFunc, stencilFail: THREE.KeepStencilOp, stencilZFail: THREE.KeepStencilOp, stencilZPass: THREE.KeepStencilOp });
    if (!fem) neck.traverse((m) => { if (!m.isMesh) return; m.material = m.material.clone(); m.renderOrder = 1;
      Object.assign(m.material, { stencilWrite: true, stencilRef: ref, stencilFunc: THREE.NotEqualStencilFunc, stencilFail: THREE.KeepStencilOp, stencilZFail: THREE.KeepStencilOp, stencilZPass: THREE.KeepStencilOp }); });
  }
  const fo = { female: fem, skin: o.skin, iris: o.iris, lip: o.lip, shadowY: fem ? .44 : .33, fringeShadow: false, shades: !!o.shades, jawShadow: !!o.jawShadow, browColor: o.browColor };
  const faceGeo = deformHead(new THREE.SphereGeometry(H.R * 1.01, 64, 48, Math.PI / 4, Math.PI / 2, FT0, FT1 - FT0), fem ? .68 : .62, fem ? 1.02 : .98, fem ? 0 : CHIN_UP);
  const faceMat = new THREE.MeshBasicMaterial({ map: humanFaceTex(o.expression, 0, fo), transparent: true, depthWrite: false, toneMapped: false });
  const face = put(head, faceGeo, faceMat, { s: H.headS, noInk: true, shadow: false }); face.renderOrder = 3;
  for (const s of [-1, 1]) { if (o.hair !== 'bob') { const ear = put(head, G.sph(1, 16, 12), skinM, { x: s * H.R * .9, y: -.012, z: -.01, s: [.014, .034, .024], noInk: true }); inkH(ear, .004); }
    if (o.earrings && o.hoops) { const er = put(head, new THREE.TorusGeometry(.012, .0022, 8, 28), flatMat(o.earrings, { tint }), { x: s * H.R * .93, y: -.068, z: -.004, ry: s * .5, noInk: true }); inkH(er, .0015); }
    else if (o.earrings) { const er = put(head, G.sph(.0075, 12, 8), flatMat(o.earrings, { tint }), { x: s * H.R * .92, y: -.055, z: -.005, noInk: true }); inkH(er, .002); } }
  humanHair(head, o.hair || (fem ? 'madison' : 'ethan'), o.hairColor ?? (fem ? 0x1c1924 : 0x5a3c28), o);
  if (o.cap) {   // a driver's peaked cap (Big Mike): crown, band, short brim
    const cm = flatMat(o.cap, { tint }), cg = group(head, { y: H.R * .5, rx: -.12 });
    const crown = put(cg, new THREE.SphereGeometry(H.R * 1.1, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2), cm, { s: [1, .62, 1.05], noInk: true }); inkH(crown, .004);
    const band = put(cg, G.cyl(H.R * 1.1, H.R * 1.1, H.R * .32, 32), flatMat(o.capBand ?? 0x1c1a24, { tint }), { y: -H.R * .05, s: [1, 1, 1.05], noInk: true }); inkH(band, .004);
    const brim = put(cg, new THREE.CylinderGeometry(H.R * .9, H.R * .95, H.R * .08, 32, 1, false, -Math.PI / 2, Math.PI), flatMat(o.capBand ?? 0x1c1a24, { tint }), { y: -H.R * .2, z: H.R * .55, rx: .25, s: [1.05, 1, .75], noInk: true }); inkH(brim, .004);
    if (o.capBadge) put(cg, G.box(H.R * .4, H.R * .22, H.R * .02), flatMat(o.capBadge, { tint }), { y: H.R * .05, z: H.R * 1.13, noInk: true });
  }
  if (o.girth) { hips.scale.x = o.girth; hips.scale.z = 1 + (o.girth - 1) * .8; head.scale.x = 1 / o.girth; head.scale.z = 1 / hips.scale.z; }
  if (o.hair === 'madison' || (fem && !o.hair)) {   // low ponytail and a ribbon bow
    const hm = flatMat(o.hairColor ?? 0x1c1924, { tint });
    const c = new THREE.CatmullRomCurve3([[-.02, -.03, -.085], [-.075, -.1, -.08], [-.12, -.2, -.01], [-.135, -.32, .085], [-.12, -.45, .12]].map((v) => new THREE.Vector3(...v)));
    const pony = put(head, taperTube(c, .036, .016), hm, { noInk: true }); inkH(pony, .005);
    const rb = flatMat(o.ribbon ?? 0xf6f1ea, { tint }), bow = group(head, { x: -.07, y: -.085, z: -.075, ry: -1.1, rx: .2 });
    for (const s of [-1, 1]) { const lp = put(bow, G.sph(1, 16, 10), rb, { x: s * .032, y: .006, rz: s * .35, s: [.034, .019, .012], noInk: true }); inkH(lp, .003);
      const tl = put(bow, G.box(.016, .085, .004), rb, { x: s * .014, y: -.045, rz: s * .22, noInk: true }); inkH(tl, .003); }
    const kn = put(bow, G.sph(.012, 12, 8), rb, { noInk: true }); inkH(kn, .003);
  }
  // arms
  const sleeveM = o.top === 'hoodie' ? flatMat(0xffffff, { tint, map: plainTex(o.topColor, .8) }) : flatMat(0xffffff, { tint, map: plainTex(o.topColor, .7) });
  const arms = {};
  for (const [side, s] of [['L', -1], ['R', 1]]) {
    const sh = group(hips, { x: s * (fem ? .155 : .19), y: fem ? .5 : .52 });
    put(sh, G.sph(fem ? .036 : .046, 20, 14), sleeveM, { x: -s * .01, noInk: true });
    const [ug, uc] = limb(fem ? .045 : .056, fem ? .04 : .05, .28); put(sh, ug, sleeveM, { noInk: true });
    const el = group(sh, { y: -.28 }); put(el, uc.clone(), sleeveM, { noInk: true, s: fem ? .9 : .95 }); const [fg] = limb(fem ? .04 : .05, fem ? .033 : .044, .25); put(el, fg, sleeveM, { noInk: true });
    if (o.top === 'hoodie') put(el, G.cyl(.046, .046, .04, 18), flatMat(new THREE.Color(hex(o.topColor)).multiplyScalar(.85).getHex(), { tint }), { y: -.24, noInk: true });   // cuff
    const hand = group(el, { y: -.26 });
    put(hand, G.sph(1, 16, 12), skinM, { y: -.035, s: [fem ? .028 : .034, fem ? .056 : .066, fem ? .019 : .024], noInk: true });
    put(hand, G.sph(1, 12, 8), skinM, { x: -s * .02, y: -.015, z: .012, s: [.011, .024, .011], rz: -s * .5, noInk: true });
    inkH(sh, .0055); arms[side] = { sh, el, hand };
  }
  // holdPhone: 'R' | 'L' puts a small phone in that hand, screen out along the palm (Big Mike holding his up)
  if (o.holdPhone) { const ph = group(arms[o.holdPhone === 'L' ? 'L' : 'R'].hand, { y: -.07, z: .03, rx: o.phoneTilt ?? 0 });
    put(ph, G.rbox(.074, .148, .014, .006), flatMat(0x30343e, { tint }), { noInk: true });
    put(ph, G.plane(.062, .128), flatMat(0xeef6ff, { tint, map: ctex(124, 256, (x, w, h) => { x.fillStyle = '#eef6ff'; x.fillRect(0, 0, w, h); x.fillStyle = '#2f9a5a'; x.fillRect(10, 70, w - 20, 70); x.fillStyle = '#fff'; x.font = 'bold 34px Helvetica'; x.textAlign = 'center'; x.fillText(o.phoneText ?? '+$1K', w / 2, 118, w - 14); x.fillStyle = '#c9d2e0'; for (let i = 0; i < 3; i++) x.fillRect(14, 162 + i * 26, w - 28, 12); }, { key: 'mike-phone' + (o.phoneText ?? '') }) }), { z: .0075, noInk: true });
    inkH(ph, .004); }
  // delivery backpack (Ethan's lock)
  if (o.bag) { const bm = flatMat(0xffffff, { tint, map: ctex(256, 256, (x, w, h) => { x.fillStyle = css(o.bag); x.fillRect(0, 0, w, h); x.fillStyle = shade(o.bag, .78); x.fillRect(0, 0, w * .25, h); x.fillStyle = '#fff6e8'; x.font = 'bold 54px Helvetica'; x.textAlign = 'center'; x.fillText('EATS', w * .6, h * .55); x.strokeStyle = shade(o.bag, .6); x.lineWidth = 8; x.strokeRect(14, 14, w - 28, h - 28); }, { key: 'bag' + o.bag }) });
    const bag = put(hips, G.rbox(.36, .4, .26, .04), bm, { y: .33, z: -.25, noInk: true }); inkH(bag, .007);
    for (const s of [-1, 1]) { put(hips, G.box(.026, .24, .01), flatMat(0x4a4552, { tint }), { x: s * .13, y: .45, z: .088, rz: s * .14, rx: .12, noInk: true }); } }
  // ---------- rig ----------
  const rig = { hips, head, face, arms, legs, torso, L: arms.L, R: arms.R };   // L / R: so a prop can attach {cast, hand} to a human's hand
  root.userData.rig = rig; root.userData.opts = o;
  root.userData.setExpression = (e, blink) => { faceMat.map = humanFaceTex(e, o.noBlink ? 0 : blink, fo); faceMat.needsUpdate = true; };
  const restOut = fem ? .1 : .14;
  root.userData.setPose = (p, amt = 1, from = POSES.idle) => {
    const P = typeof p === 'string' ? POSES[p] || POSES.idle : p, F = typeof from === 'string' ? POSES[from] || POSES.idle : from;
    const mix = (a, b) => a.map((v, i) => v + (b[i] - v) * amt);
    for (const [side, s] of [['L', -1], ['R', 1]]) { const [out, fwd, elb] = mix(F[side], P[side]), tw = (F[side][3] || 0) + ((P[side][3] || 0) - (F[side][3] || 0)) * amt;   // optional 4th number: twist (negative turns the forearm in across the body)
      arms[side].sh.rotation.set(-fwd, s * tw, s * Math.max(restOut * .6, out)); arms[side].el.rotation.x = -elb; }
    const lg = (F.legs || 0) + ((P.legs || 0) - (F.legs || 0)) * amt;   // seated: thighs forward, shins hang down (the bus seats)
    for (const l of legs) { l.hp.rotation.x = -lg; l.knee.rotation.x = lg * (P.shin === false ? 0 : 1); }
  };
  root.userData.setWalk = (phase, amt = 1) => { const a = Math.sin(phase * Math.PI * 2) * .45 * amt; legs[0].hp.rotation.x = a; legs[1].hp.rotation.x = -a; arms.L.sh.rotation.x = -a * .6; arms.R.sh.rotation.x = a * .6; };
  root.userData.idle = (f, seed = 1, expr = o.expression, talk = 0) => {
    const t = f / 30 + seed * 7.3;
    torso.scale.y = 1 + Math.sin(t * 2.4) * .006; head.rotation.z = Math.sin(t * .9) * .02 + (o.headRoll || 0); head.rotation.y = Math.sin(t * .6 + 1) * .03 + (o.headYaw || 0); head.rotation.x = (o.headTilt || 0) + (talk ? .012 * talk : 0);
    const e = talk ? { ...(typeof expr === 'object' ? expr : EXPRESSIONS[expr] || EXPRESSIONS.neutral), mouth: 'talk' + talk } : expr;
    root.userData.setExpression(e, blinkAt(t, seed));
  };
  root.userData.setPose(o.pose);
