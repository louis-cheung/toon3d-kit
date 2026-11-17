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

