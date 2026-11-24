// The Turkey (2026-11-19): see episodes/the-turkey/BUILD.md
// turkey-hood, candle-ring, nora-photo, blue-underwear, dresser, desk-calendar, bush, sun-halo, diner-front.
// Every prop has something that moves, as a pure function of the shot clock (userData.update(sec)).
import { THREE, toon, toonGloss, glow, G, put, group, ctex, rng, hex, PAL, inkAll } from '../core.js';
import { register, raw } from '../registry.js';
import { springFollow, nodsAt } from '../character.js';

const g0 = () => new THREE.Group();
const c01 = (t) => Math.max(0, Math.min(1, t));
const sstep = (t) => { t = c01(t); return t * t * (3 - 2 * t); };
const easeOut = (t) => 1 - Math.pow(1 - c01(t), 3);
const FONT = (px, w = 900) => `${w} ${px}px Helvetica, Arial`;
const basic = (map, o = {}) => new THREE.MeshBasicMaterial({ map, transparent: true, toneMapped: false, ...o });
const addGlow = (m) => glow(m, { transparent: true, depthWrite: false, blending: THREE.AdditiveBlending });
const radial = (key, stops) => ctex(128, 128, (x, w) => { const r = x.createRadialGradient(w / 2, w / 2, 1, w / 2, w / 2, w / 2); stops.forEach(([o, c]) => r.addColorStop(o, c)); x.fillStyle = r; x.fillRect(0, 0, w, w); }, { key });
const HALO_T = () => radial('turkey-halo', [[0, 'rgba(255,230,170,1)'], [.4, 'rgba(255,190,100,.4)'], [1, 'rgba(255,160,80,0)']]);
const GOLD_T = () => radial('turkey-gold', [[0, 'rgba(255,245,190,.95)'], [.35, 'rgba(255,210,90,.45)'], [1, 'rgba(255,190,60,0)']]);
const starTex = () => ctex(64, 64, (x) => { x.fillStyle = '#fffbe0'; x.beginPath(); for (let i = 0; i < 8; i++) { const a = i / 8 * Math.PI * 2 - Math.PI / 2, r = i % 2 ? 7 : 30; x.lineTo(32 + Math.cos(a) * r, 32 + Math.sin(a) * r); } x.closePath(); x.fill(); }, { key: 'turkey-star' });
const sprite = (tex, color, scale, o = {}) => { const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex, color, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, toneMapped: false, opacity: o.opacity ?? 1 })); s.scale.setScalar(scale); return s; };
const heartShape = () => { const s = new THREE.Shape(); s.moveTo(0, -.5); s.bezierCurveTo(-.2, -.3, -.55, -.05, -.55, .2); s.bezierCurveTo(-.55, .5, -.15, .6, 0, .3); s.bezierCurveTo(.15, .6, .55, .5, .55, .2); s.bezierCurveTo(.55, -.05, .2, -.3, 0, -.5); return s; };
const heartGeo = (size, depth = .03) => { const g = new THREE.ExtrudeGeometry(heartShape(), { depth, bevelEnabled: true, bevelSize: .03, bevelThickness: .02, bevelSegments: 2, curveSegments: 10 }); g.scale(size, size, size); g.translate(0, 0, -depth * size / 2); return g; };

