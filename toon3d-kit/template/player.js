// Episode player: turns an episode file (a list of shots that name library assets) into frames.
// Pure function of the frame number, so frames can render in any order, in parallel, or resume.
import * as L from '../engine/index.js';
import {resolveTiming, captionAt} from './timing.mjs';
import { drawPingOverlay, drawPingTag } from '../engine/props/n06-ping.js';   // N-06 (2026-11-18, off by default): shot.ping (the card overlay) and shot.pingTag (the compact tag on a world point)
const { THREE } = L;

const TRANSITION_FRAMES = 7;

export async function loadEpisode(path) {
  const ep = await import(path);
  const fps = ep.META.fps || 30; let start = 0;
  // voice/built.json (written by tools/voice.py) makes shot lengths, captions and mouths follow the real audio
  let built = null; try { const r = await fetch(path.replace(/[^/]+$/, 'voice/built.json'), { cache: 'no-store' }); if (r.ok) built = await r.json(); } catch (e) { /* not voiced yet */ }
  if (built && built.shots.length !== ep.SHOTS.length) built = null;
  const shots = ep.SHOTS.map((s0, i) => { const s = withVoice(s0, built?.shots[i]); const n = Math.round(s.sec * fps); const o = { ...s, i, start, n }; start += n; return o; });
  return { meta: { fps, w: 1080, h: 1920, ...ep.META }, shots, total: start };
}

