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
