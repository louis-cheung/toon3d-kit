// The asset registry. Every prop, character and set registers here by name.
// Episodes never draw things themselves: they call asset('computer', {...}) and get a ready, inked object.
import { THREE, inkAll } from './core.js';

const REG = new Map();

/**
 * register(name, spec)
 * spec: { kind: 'prop'|'character'|'set'|'fx', tags: [...], desc: '...', opts: {optionName: 'what it does'}, build: (opts) => Object3D }
 * Sets return {root, camera: {pos, look}, light: 'night'|..., spots: {name:[x,y,z]}} instead of a bare object.
 */
export function register(name, spec) {
  if (REG.has(name)) throw new Error('duplicate asset name: ' + name);
  REG.set(name, { name, kind: 'prop', tags: [], opts: {}, desc: '', aliases: [], ...spec });
}

/** Build an asset by name, alias or tag. Inks it unless opts.ink === false. */
export function asset(name, opts = {}) {
  const spec = find(name);
  if (!spec) throw new Error(`asset "${name}" not in library. Build it in engine/props or engine/sets and register it (see README).`);
  const out = spec.build(opts);
  const root = out.isObject3D ? out : out.root;
  if (opts.ink !== false) inkAll(root, opts.inkWidth ?? spec.inkWidth, opts.inkColor ?? spec.inkColor);   // small props set a thinner spec.inkWidth
  root.userData.asset = spec.name;
  if (opts.at) root.position.set(...opts.at);
