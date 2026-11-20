// Bali and the v3 wedding bits (Red Flag Tea: "He Spent $40 On Her Engagement Ring", script v3, 2026-11-15).
//   coconut-drink   a holdable coconut with a bendy straw, a paper umbrella and a hibiscus (the spit-take: pair with the spray fx)
//   fork-box        a small cardboard box of plastic forks, "300 CT FORKS", a few forks sticking out (replaces the fork mountain)
//   wedding-photo   the mom's framed old wedding photo: young mom in the same lace dress, drawn in code, faded; holdable
//   sweat-drops     panic sweat: drops that pop off the head and fly (attach to headPt), pairs with the panic face
//   beach-lounger, beach-umbrella, palm-tree, beach-hut   the pieces of the beach-resort set (sets/beach.js), usable on their own
// Everything that moves is a pure function of the shot clock (update(sec) on props, timeHook inside a set).
import { THREE, toon, toonGloss, glow, G, put, group, ctex, rng, hex, timeHook, inkAll } from '../core.js';
import { register } from '../registry.js';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';

const g0 = () => new THREE.Group(), PI = Math.PI;
const c01 = (t) => Math.max(0, Math.min(1, t));
const css = (c) => '#' + new THREE.Color(hex(c)).getHexString();
const shadeC = (c, k) => '#' + new THREE.Color(hex(c)).multiplyScalar(k).getHexString();
const UP = new THREE.Vector3(0, 1, 0);
function rodTo(mesh, p0, p1) { const a = new THREE.Vector3(...p0), b = new THREE.Vector3(...p1), d = b.clone().sub(a), l = d.length(); mesh.position.copy(a).add(b).multiplyScalar(.5); mesh.quaternion.setFromUnitVectors(UP, d.normalize()); mesh.scale.set(1, Math.max(.001, l), 1); }
const rod = (parent, r, mat, p0, p1, seg = 10) => { const m = put(parent, G.cyl(r, r, 1, seg), mat); rodTo(m, p0, p1); return m; };
function selfInk(g, w, color) { inkAll(g, w, color); g.traverse((m) => { if (m.isMesh && !m.userData.isInk) m.userData.noInk = true; }); return g; }

