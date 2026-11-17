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
