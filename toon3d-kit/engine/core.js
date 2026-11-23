// toon3d core: materials, ink outline, geometry helpers, textures, lighting, renderer.
// Every asset in the library is built from these, so the whole library shares one look.
import * as THREE from 'three';
import { mergeVertices } from 'three/addons/utils/BufferGeometryUtils.js';
export { THREE };

// ---------- palette (STYLE.md explains what each color means) ----------
export const PAL = {
  navy: 0x26337e, navyDeep: 0x1a2260, navyFloor: 0x2a3570, ink: 0x0f0d17,
  cyan: 0x7fe3ff, gold: 0xe6c25a, white: 0xf3f3f6, offwhite: 0xe7e4ee,
  black: 0x22232b, wood: 0xb98552, woodDark: 0x8a5d38, steel: 0x8d93a6,
  grass: 0x7bbf5a, leaf: 0x5e9c55, leafDark: 0x3f7a45, terracotta: 0xc8763f,
  red: 0xe2463b, orange: 0xef8a3c, yellow: 0xf5c84a, blue: 0x3c7be0, sky: 0x9fd2ff,
  pink: 0xf2a6b3, purple: 0x8a6ad8, teal: 0x2f8f86, skin: 0xf6f6f8,
};
export const hex = (c) => (typeof c === 'string' ? new THREE.Color(c).getHex() : c);

// ---------- seeded random ----------
export function rng(seed = 1) { let s = (seed * 9301 + 49297) % 233280 || 1; return () => (s = (s * 16807) % 2147483647) / 2147483647; }

// ---------- materials ----------
function gradMap(steps) {
  const d = new Uint8Array(steps * 4);
  for (let i = 0; i < steps; i++) { const v = Math.round(95 + 160 * i / (steps - 1)); d.set([v, v, v, 255], i * 4); }
  const t = new THREE.DataTexture(d, steps, 1); t.minFilter = t.magFilter = THREE.NearestFilter; t.needsUpdate = true; return t;
}
const G3 = gradMap(3);
const matCache = new Map();
/** Cel-shaded material (3 tones). Same color returns the same material. */
export function toon(color, opts = {}) {
  const key = hex(color) + JSON.stringify(opts, (k, v) => (v && v.isTexture ? v.uuid : v));
  if (!opts.map && matCache.has(key)) return matCache.get(key);
  const m = new THREE.MeshToonMaterial({ color: hex(color), gradientMap: G3, ...opts });
  if (!opts.map) matCache.set(key, m); return m;
}
/** Unlit material for screens, signs, glowing strips, skyline windows. */
export function glow(color, opts = {}) { return new THREE.MeshBasicMaterial({ color: hex(color), toneMapped: false, ...opts }); }

// ---------- glossy toon (2026-11-14, ring set + practical-light kit) ----------
// The same 3-tone cel material plus a HARD specular highlight: a clean white spot or streak that slides over the surface
// as the camera or light moves, the way an illustrator paints a shine on a hat brim, a glass or a ring box. Matte things
// (cloth, wood, skin) stay on toon(); shiny things (glass, cutlery, metal, lacquer, satin boxes) use toonGloss().
// gloss: highlight strength (1), cut: how tight the highlight is (.955; .9 is a broad sheen, .985 a pin point).
const TOON_GLOSS_PARS = `varying vec3 vViewPosition;
uniform float glossAmt; uniform float glossCut;
struct ToonMaterial { vec3 diffuseColor; };
void RE_Direct_Toon( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in ToonMaterial material, inout ReflectedLight reflectedLight ) {
  vec3 irradiance = getGradientIrradiance( geometryNormal, directLight.direction ) * directLight.color;
  reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
  float hv = dot( normalize( directLight.direction + geometryViewDir ), geometryNormal );
  reflectedLight.directSpecular += min( directLight.color, vec3( 1.6 ) ) * smoothstep( glossCut, glossCut + .012, hv ) * glossAmt;
}
void RE_IndirectDiffuse_Toon( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in ToonMaterial material, inout ReflectedLight reflectedLight ) {
  reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
#define RE_Direct RE_Direct_Toon
#define RE_IndirectDiffuse RE_IndirectDiffuse_Toon`;
const glossCache = new Map();
/** Cel material with a hard, moving specular highlight (glossy). Same color + opts returns the same material. */
export function toonGloss(color, opts = {}) {
  const { gloss = 1, cut = .955, ...rest } = opts;
  const key = hex(color) + ':' + gloss + ':' + cut + JSON.stringify(rest, (k, v) => (v && v.isTexture ? v.uuid : v));
  if (!rest.map && glossCache.has(key)) return glossCache.get(key);
