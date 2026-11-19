// Rich System Ep 5 "Mom's Setup" (2026-11-15): the champagne and the ride home.
// champagne-bottle (ROYAL RESERVE, gold foil), champagne-cart (gold-trimmed service cart on casters), champagne-flute,
// delivery-bike (pedal bike with a rack for the delivery-bag), bike-helmet, single-flower, kettle, fruit-bowl, kitchen-mug.
// Also the planar reflection used by neon-street and restaurant-hall (export planarReflector): a real mirror of the scene
// drawn on a floor or a wet road, smeared and rippled so it reads as a cartoon wet street, not a chrome mirror.
// Everything animates as a pure function of the shot clock (userData.update(sec) or timeHook), and every wheel turns by how far
// its prop has travelled (its world position), so a prop slid along by the player's from/move rolls without extra keys.
import { THREE, toon, toonGloss, glow, G, put, group, ctex, rng, timeHook, hex, lightBeam } from '../core.js';
import { register, raw } from '../registry.js';

const c01 = (t) => Math.max(0, Math.min(1, t));
const GOLD = 0xe6c25a, BRASS = 0xd9a441;
const goldM = () => toonGloss(GOLD, { cut: .9, gloss: 1.2 });
const brassM = () => toonGloss(BRASS, { cut: .9, gloss: 1.1 });
const chromeM = () => toonGloss(0xaeb4c6, { cut: .9, gloss: 1.4 });
const glassM = (o = {}) => toonGloss(0xdcecff, { cut: .9, gloss: 1.3, transparent: true, opacity: .5, depthWrite: false, emissive: 0x5a7090, ...o });

