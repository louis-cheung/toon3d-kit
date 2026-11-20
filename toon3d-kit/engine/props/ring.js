// The ring set (Red Flag Tea: "Her Family Laughed At His $40 Engagement Ring", 2026-11-14).
// Built from Louis's references in ../references/from-louis/props/ (tag louis):
//   ring-40-gold-twist-band.png    the $40 ring: a plain thin gold twisted band, no stone        -> ring-cheap
//   ring-box-pink-bow-sticker.webp shape language and shading for the box: thick outline, soft   -> ring-box (color 'pink')
//                                  shading, white highlight streaks, a bow on the lid
//   ring-box-white-pink-velvet.png white box, pink velvet, gold band with a big stone (shape only) -> ring-box (color 'white'), ring-rock
// Everything that moves is a pure function of the shot clock: update(sec). Glints and sparkles are sprites that draw on top.
// Also here: the 2D ring counter (MARRIAGES AT THIS TABLE: 4 with ring icons and DIVORCED states), drawn by the player
// when a shot has `ringCounter` (see drawRingCounter at the bottom).
import { THREE, toon, toonGloss, glow, G, put, group, ctex, rng, hex } from '../core.js';
import { register } from '../registry.js';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
const g0 = () => new THREE.Group();
const c01 = (t) => Math.max(0, Math.min(1, t));
const backOut = (t) => { const c = 1.70158; return 1 + (c + 1) * Math.pow(t - 1, 3) + c * Math.pow(t - 1, 2); };
const easeOut = (t) => 1 - Math.pow(1 - t, 3);
const RING_INK = 0x2a1620;                         // dark plum-brown outline (the sticker ref and Rick's Clips, not pure black)
const METAL = { gold: [0xf0bb3c, 0xfff1b0], deepGold: [0xc8860e, 0xffd25a], silver: [0xd9deea, 0xffffff], rose: [0xeaa184, 0xffe2d4] };   // [body, highlight]   // deepGold (forty-dollar-ring v3, opt-in): reads gold under bright beach light
const PLUM = 0x241726;                             // the flat cast's limb colour (fallback when the hand can't be found)

