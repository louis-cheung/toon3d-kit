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
/** Text on a sign texture. */
export function textTex(text, o = {}) {
  const { w = 1024, h = 256, bg = null, fg = '#ffffff', font = 'bold 150px Helvetica, Arial', border = null, align = 'center' } = o;
  return ctex(w, h, (x) => {
    if (bg) { x.fillStyle = bg; x.fillRect(0, 0, w, h); }
    if (border) { x.strokeStyle = border; x.lineWidth = 16; x.strokeRect(8, 8, w - 16, h - 16); }
    x.fillStyle = fg; x.font = font; x.textAlign = align; x.textBaseline = 'middle';
    const lines = String(text).split('\n'), lh = h / (lines.length + .3);
    lines.forEach((l, i) => x.fillText(l, align === 'center' ? w / 2 : 40, h / 2 + (i - (lines.length - 1) / 2) * lh));
  }, { key: o.key });
}
/** Screen content presets: code, dashboard, chart, chat, blank, logo:<text> */
export function screenTex(kind = 'code', seed = 1) {
  return ctex(512, 320, (x, w, h) => {
    const r = rng(seed); x.fillStyle = '#0f1530'; x.fillRect(0, 0, w, h);
    const C = ['#5fd4ff', '#9cf29a', '#f3c56b', '#c9a4ff', '#ff8f8f'];
    if (kind === 'code') for (let i = 0; i < 14; i++) { x.fillStyle = C[i % 4]; x.fillRect(24 + (i % 3) * 22, 18 + i * 21, 60 + r() * 260, 9); }
    if (kind === 'dashboard') {
      x.fillStyle = '#1d2650'; x.fillRect(0, 0, w, 40); x.fillStyle = '#5fd4ff'; x.fillRect(16, 14, 90, 12);
      for (let i = 0; i < 6; i++) { x.fillStyle = '#e8ecff'; x.fillRect(24, 64 + i * 40, 150 + r() * 80, 10); x.fillStyle = C[i % 3]; x.fillRect(330, 58 + i * 40, 140, 22); }
    }
    if (kind === 'chart') {
      x.strokeStyle = '#2a3566'; x.lineWidth = 2; for (let i = 1; i < 6; i++) { x.beginPath(); x.moveTo(0, i * 55); x.lineTo(w, i * 55); x.stroke(); }
      x.strokeStyle = '#9cf29a'; x.lineWidth = 8; x.beginPath(); let y = 270; x.moveTo(20, y);
      for (let i = 1; i <= 10; i++) { y = Math.max(30, y - 10 - r() * 40 + (i === 5 ? 50 : 0)); x.lineTo(20 + i * 47, y); } x.stroke();
    }
    if (kind === 'chat') for (let i = 0; i < 5; i++) { const me = i % 2; x.fillStyle = me ? '#3c7be0' : '#e8ecff'; x.beginPath(); x.roundRect(me ? 200 : 24, 20 + i * 58, 280, 44, 20); x.fill(); }
    if (kind.startsWith('logo:')) { x.fillStyle = '#e8ecff'; x.font = 'bold 120px Helvetica'; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText(kind.slice(5), w / 2, h / 2); }
  }, { key: 'screen:' + kind + seed });
}
/** Building facade with lit windows. */
export function windowsTex(seed = 1, o = {}) {
  const { base = '#232a6e', lit = ['#f3e1a0', '#9fd6ff'], density = .35, cols = 6, rows = 16 } = o;
  return ctex(256, 512, (x, w, h) => {
    const r = rng(seed); x.fillStyle = base; x.fillRect(0, 0, w, h);
    const cw = w / cols, rh = h / rows;
    for (let j = 0; j < rows; j++) for (let i = 0; i < cols; i++) {
      x.fillStyle = r() < density ? lit[r() < .75 ? 0 : 1] : 'rgba(0,0,0,.25)';
      x.fillRect(i * cw + cw * .22, j * rh + rh * .25, cw * .56, rh * .45);
    }
  }, { key: 'win' + seed + JSON.stringify(o) });
}
/** Tiled floor. */
export function tileTex(a = '#2a3570', b = '#1b2350', n = 4, rep = 5) {
  return ctex(512, 512, (x, w) => {
    x.fillStyle = a; x.fillRect(0, 0, w, w); x.strokeStyle = b; x.lineWidth = 6; const s = w / n;
    for (let i = 0; i <= w; i += s) { x.beginPath(); x.moveTo(i, 0); x.lineTo(i, w); x.stroke(); x.beginPath(); x.moveTo(0, i); x.lineTo(w, i); x.stroke(); }
    x.fillStyle = 'rgba(255,255,255,.05)'; x.fillRect(s, 2 * s, s, s); x.fillRect(3 * s, 0, s, s);
  }, { repeat: [rep, rep], key: 'tile' + a + b + n + rep });
}
/** Vertical sky gradient as a scene background. */
export function skyTex(stops) {
  return ctex(8, 512, (x) => { const g = x.createLinearGradient(0, 0, 0, 512); stops.forEach(([p, c]) => g.addColorStop(p, c)); x.fillStyle = g; x.fillRect(0, 0, 8, 512); }, { key: 'sky' + JSON.stringify(stops) });
}

// ---------- lighting presets ----------
export const SKIES = {
  night: [[0, '#141c55'], [.55, '#4a3f86'], [.85, '#c98a86'], [1, '#f0b98e']],
  dusk: [[0, '#2a3a8a'], [.5, '#a07ab0'], [.8, '#f0a07c'], [1, '#ffd39a']],
  day: [[0, '#5ea8ef'], [.6, '#a8d6ff'], [1, '#e8f5ff']],
  studio: [[0, '#2b2f55'], [1, '#14152a']],
  white: [[0, '#f4f5fa'], [1, '#dfe2ec']],
  restaurant: [[0, '#6a3f33'], [1, '#c98a5e']],
  stage: [[0, '#2a1850'], [1, '#6a2a70']],
  bednight: [[0, '#10143a'], [1, '#232a66']],
  bedroomNight: [[0, '#16205e'], [1, '#2a3a8c']],   // never black: the darkest backdrop is deep navy
  bedroomWarm: [[0, '#5a2a6a'], [1, '#c45a7a']],
  splitNight: [[0, '#141c58'], [.55, '#3a3a96'], [1, '#7a5aa8']],
};
/** Adds lights + background. preset: night | dusk | day | studio | white | bedroomNight | bedroomWarm | splitNight, or an object
 *  { base: 'bedroomNight', hemi: [sky, ground, i], sun: [color, i, [x, y, z]], fill: [color, i], sky: [[stop, color], ...] } that overrides parts of a preset
 *  (a set can aim the moon through its own window this way). Returns {sun, hemi, fill}. */
export function lighting(scene, preset = 'night', o = {}) {
  let over = null; if (preset && typeof preset === 'object') { over = preset; preset = preset.base || 'night'; }
  const P0 = {
    night: { hemi: [0xb9c4ff, 0x2a2350, 1.1], sun: [0xffcfa5, 2.0, [2.5, 6, -8]], fill: [0x9fb4ff, .9] },
    dusk: { hemi: [0xffd9c0, 0x4a3060, 1.2], sun: [0xffb98a, 2.6, [-6, 5, -4]], fill: [0xa8b8ff, .7] },
    day: { hemi: [0xffffff, 0x8a9a7a, 1.4], sun: [0xfff2dc, 2.6, [5, 9, 4]], fill: [0xcfe0ff, .5] },
    studio: { hemi: [0xc8ccff, 0x2a2840, 1.2], sun: [0xffffff, 2.2, [3, 6, 5]], fill: [0xa0b0ff, .8] },
    white: { hemi: [0xffffff, 0xd0d4e4, 1.6], sun: [0xffffff, 2.0, [4, 8, 5]], fill: [0xffffff, .6] },
    restaurant: { hemi: [0xfff1e0, 0x8a5a48, 1.7], sun: [0xffe6c4, 1.9, [-3, 7, 6]], fill: [0xffe0c8, 1.0] },   // warm indoor: bright enough that near-white skin stays near-white
    stage: { hemi: [0xe6d8ff, 0x3a2058, 1.35], sun: [0xfff0f4, 2.3, [2, 8, 6]], fill: [0xd8b8ff, .9] },
    bednight: { hemi: [0x8ea2ff, 0x2a2466, .95], sun: [0xa9c2ff, 1.5, [3.2, 5.5, -9]], fill: [0x7f8cff, .5] },   // dark bedroom: cool moonlight through the window, practicals do the rest
    bedroomNight: { hemi: [0x8fa4ff, 0x3a2f8a, 1.05], sun: [0xb4c8ff, 2.4, [2.6, 5.2, -9]], fill: [0x6f7cff, .55] },   // saturated cold blue room: moon key through the window, lamp + phone do the warm and the faces
    bedroomWarm: { hemi: [0xffb0c8, 0x6a2a7a, .9], sun: [0x9cc4ff, 1.9, [-2.6, 5.2, -9]], fill: [0xff8fb0, .45] },    // Mia: pink and coral room, one cool blue moon key through her window
    splitNight: { hemi: [0xc0b8ff, 0x4a3080, 1.0], sun: [0xd8d0ff, 1.5, [0, 7, 9]], fill: [0x9fa8ff, .45] },             // dollhouse cut: soft front key, each room's practicals give its colour
  };
  const P = { ...P0[preset], ...(over || {}) };
  if (o.background !== false) scene.background = skyTex(dimStops(over?.sky || SKIES[preset], o.skyDim));   // skyDim (mood light only): darken the backdrop
  const hemi = new THREE.HemisphereLight(...P.hemi);
  const sun = new THREE.DirectionalLight(P.sun[0], P.sun[1]); sun.position.set(...P.sun[2]); sun.castShadow = true;
  sun.shadow.mapSize.set(2048, 2048); const S = o.shadowSize || 8;
  Object.assign(sun.shadow.camera, { left: -S, right: S, top: S, bottom: -S, near: .5, far: 60 }); sun.shadow.bias = -.0006; sun.shadow.normalBias = .02;
  const fill = new THREE.DirectionalLight(P.fill[0], P.fill[1]); fill.position.set(3, 4, 7);
  scene.add(hemi, sun, sun.target, fill);
  if (o.fog) scene.fog = new THREE.Fog(o.fog[0], o.fog[1], o.fog[2]);
  return { sun, hemi, fill };
}
/** Warm practical light (lamp, screen glow). */
export function pointLight(scene, x, y, z, color = 0xffd59a, power = 5, dist = 6) { const l = new THREE.PointLight(color, power, dist, 1.6); l.position.set(x, y, z); scene.add(l); return l; }
