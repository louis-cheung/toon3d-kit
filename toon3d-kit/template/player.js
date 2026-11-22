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
  // carryLine (The Turkey remake, 2026-11-22, off by default): a line-less shot right after a shot whose last take runs past its end (the
  // voice shot's negative hold) picks that take up: its captions, speaker tag and mouth continue on this shot's clock, so one take can be
  // split across a cut (Nora's "Dad, he can't / breathe in there!" over the rain reaction cut). The audio is already placed by voice.py.
  for (const o of shots) if (o.carryLine && o.i > 0 && !o.lines?.length) {
    const p = shots[o.i - 1], ps = p.n / fps, tail = (p.talk || []).filter((l) => l.start + l.dur > ps).map((l) => ({ ...l, start: l.start - ps }));
    if (tail.length) { o.talk = tail; o.caption = tail.map((l) => l.words.map((w) => w[0]).join(' ')).join(' '); o.words = tail.flatMap((l) => l.words.map(([w, t]) => [w, l.start + t])); }
  }
  return { meta: { fps, w: 1080, h: 1920, ...ep.META }, shots, total: start };
}

