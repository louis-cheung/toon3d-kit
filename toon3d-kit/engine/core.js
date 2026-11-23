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
  const m = new THREE.MeshToonMaterial({ color: hex(color), gradientMap: G3, ...rest });
  m.onBeforeCompile = (sh) => {
    sh.uniforms.glossAmt = { value: gloss }; sh.uniforms.glossCut = { value: cut };
    sh.fragmentShader = sh.fragmentShader.replace('#include <lights_toon_pars_fragment>', TOON_GLOSS_PARS)
      .replace('vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + totalEmissiveRadiance;',
        'vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + reflectedLight.directSpecular + totalEmissiveRadiance;');
  };
  m.customProgramCacheKey = () => 'toonGloss1';
  m.userData.gloss = true;
  if (!rest.map) glossCache.set(key, m); return m;
}

// ---------- ink outline (inverted hull, constant-ish screen width) ----------
export const INK = { width: 0.016 };
const inkMat = new THREE.ShaderMaterial({
  side: THREE.BackSide, fog: true,
  uniforms: THREE.UniformsUtils.merge([THREE.UniformsLib.fog, { w: { value: INK.width }, c: { value: new THREE.Color(PAL.ink) } }]),
  vertexShader: `uniform float w;
    #include <fog_pars_vertex>
    void main(){ vec4 mvPosition = modelViewMatrix*vec4(position,1.); vec3 n = normalize(normalMatrix*normal);
    mvPosition.xyz += n * w * (1. + (-mvPosition.z) * 0.12); gl_Position = projectionMatrix*mvPosition;
    #include <fog_vertex>
    }`,
  fragmentShader: `uniform vec3 c;
    #include <fog_pars_fragment>
    void main(){ gl_FragColor = vec4(c,1.);
    #include <fog_fragment>
    }`,
});
const hullCache = new WeakMap();
function hullOf(geo) {
  if (hullCache.has(geo)) return hullCache.get(geo);
  const g = geo.clone(); for (const k of Object.keys(g.attributes)) if (k !== 'position') g.deleteAttribute(k);
  const m = mergeVertices(g, 1e-4); m.computeVertexNormals(); hullCache.set(geo, m); return m;
}
const FLAT = /Plane|Circle|Ring|Shape/;
/** Add black outlines to every mesh in an object (skips flat planes and anything with userData.noInk). */
export function inkAll(obj, width, color) {
  const list = []; obj.traverse((o) => { if (o.isMesh && !o.userData.noInk && !o.userData.isInk && !FLAT.test(o.geometry.type)) list.push(o); });
  for (const m of list) {
    const mat = (width || color != null) ? inkMat.clone() : inkMat; if (width) mat.uniforms.w.value = width; if (color != null) mat.uniforms.c.value = new THREE.Color(color);
    const h = new THREE.Mesh(hullOf(m.geometry), mat); h.userData.isInk = true; h.castShadow = false; m.add(h);
  }
  return obj;
}

// ---------- geometry shortcuts ----------
export const G = {
  box: (w, h, d) => new THREE.BoxGeometry(w, h, d),
  cyl: (rt, rb, h, s = 24) => new THREE.CylinderGeometry(rt, rb, h, s),
  sph: (r, w = 28, h = 20) => new THREE.SphereGeometry(r, w, h),
  cap: (r, l, s = 20) => new THREE.CapsuleGeometry(r, l, 8, s),
  cone: (r, h, s = 24) => new THREE.ConeGeometry(r, h, s),
  torus: (R, r, s = 24, arc = Math.PI * 2) => new THREE.TorusGeometry(R, r, 10, s, arc),
  plane: (w, h) => new THREE.PlaneGeometry(w, h),
  /** Rounded box (soft corners read more "cartoon" than sharp boxes). */
  rbox: (w, h, d, r = 0.04) => {
    const s = new THREE.Shape(), x = -w / 2 + r, y = -h / 2 + r, W = w - 2 * r, H = h - 2 * r;
    s.moveTo(x, y - r); s.lineTo(x + W, y - r); s.quadraticCurveTo(x + W + r, y - r, x + W + r, y); s.lineTo(x + W + r, y + H);
    s.quadraticCurveTo(x + W + r, y + H + r, x + W, y + H + r); s.lineTo(x, y + H + r); s.quadraticCurveTo(x - r, y + H + r, x - r, y + H);
    s.lineTo(x - r, y); s.quadraticCurveTo(x - r, y - r, x, y - r);
    const g = new THREE.ExtrudeGeometry(s, { depth: d - 2 * r, bevelEnabled: true, bevelSize: r * .6, bevelThickness: r, bevelSegments: 3, curveSegments: 6 });
    g.translate(0, 0, -(d - 2 * r) / 2); return g;
  },
};

/** Add a mesh to a parent. o: {x,y,z, rx,ry,rz, s (number or [x,y,z]), shadow, noInk} */
export function put(parent, geo, mat, o = {}) {
  const m = new THREE.Mesh(geo, mat);
  m.position.set(o.x || 0, o.y || 0, o.z || 0); m.rotation.set(o.rx || 0, o.ry || 0, o.rz || 0);
  if (o.s != null) Array.isArray(o.s) ? m.scale.set(...o.s) : m.scale.setScalar(o.s);
  m.castShadow = o.shadow !== false; m.receiveShadow = true; if (o.noInk) m.userData.noInk = true;
  parent.add(m); return m;
}
export function group(parent, o = {}) {
  const g = new THREE.Group(); g.position.set(o.x || 0, o.y || 0, o.z || 0); g.rotation.set(o.rx || 0, o.ry || 0, o.rz || 0);
  if (o.s != null) g.scale.setScalar(o.s); if (parent) parent.add(g); return g;
}

// ---------- canvas textures ----------
const texCache = new Map();
/** Draw a texture with a 2D canvas. key caches it. opts: {pixel, repeat:[x,y]} */
export function ctex(w, h, draw, opts = {}) {
  if (opts.key && texCache.has(opts.key)) return texCache.get(opts.key);
  const c = document.createElement('canvas'); c.width = w; c.height = h; const x = c.getContext('2d'); x.lineCap = x.lineJoin = 'round';
  draw(x, w, h);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4;
  if (opts.pixel) t.magFilter = t.minFilter = THREE.NearestFilter;
  if (opts.repeat) { t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(...opts.repeat); }
  if (opts.key) texCache.set(opts.key, t); return t;
}
