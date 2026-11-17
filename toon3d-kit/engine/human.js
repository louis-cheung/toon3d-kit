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
