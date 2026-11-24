// Episode player: turns an episode file (a list of shots that name library assets) into frames.
// Pure function of the frame number, so frames can render in any order, in parallel, or resume.
import * as L from '../engine/index.js';
import {resolveTiming, captionAt} from './timing.mjs';
import { drawPingOverlay, drawPingTag } from '../engine/props/n06-ping.js';   // N-06 (2026-11-18, off by default): shot.ping (the card overlay) and shot.pingTag (the compact tag on a world point)
import { drawWrappedTurkeyIcon } from '../engine/props/turkey-screens.js';   // The Turkey rewrite (2026-11-22, off by default): texts[].icon 'wrapped-turkey'
const { THREE } = L;

const TRANSITION_FRAMES = 7;

export async function loadEpisode(path) {
  const ep = await import(path);
  // sets that declare preload (the realistic sets, 2026-11-23) load their models and textures before the first frame; no other set has one
  for (const n of new Set(ep.SHOTS.map((s) => s.set).filter(Boolean))) { const sp = L.find(n); if (sp?.preload) await sp.preload(); }
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

/** A shot with `lines: [{who, text}]` gets its length, caption words and talk track from the voice.
 *  Before the voice exists (or if the text changed since), lengths are estimated from the text so stills still work. */
function withVoice(s, b) {
  if (!s.lines?.length) return s;
  const same = b && b.lines.length === s.lines.length && b.lines.every((l, k) => l.words.map((w) => w[0]).join(' ') === s.lines[k].text.split(/\s+/).join(' '));
  if (s.cues && (!same || !b.cues)) throw new Error('Voice cues need a current voice build. Run tools/voice.py.');
  let talk, sec;
  if (same) { talk = b.lines.map((l, k) => ({ ...l, expr: s.lines[k].expr, ...(s.lines[k].think ? { think: true } : {}), ...(s.lines[k].lipsync ? { lipsync: s.lines[k].lipsync } : {}) })); sec = b.sec; }   // think (Ep 3 v2): a line he only thinks; lipsync: see the cast loop
  else {
    let t = s.lead ?? .12; talk = s.lines.map((l) => { const ws = l.text.split(/\s+/), dur = .0652 * l.text.replace(/[^A-Za-z0-9]/g, '').length + .567;
      const o = { who: l.who, start: t, dur, expr: l.expr, ...(l.think ? { think: true } : {}), ...(l.lipsync ? { lipsync: l.lipsync } : {}), words: ws.map((w, k) => [w, k / ws.length * dur * .92]) }; t += dur + (l.pauseAfter ?? .16); return o; });
    sec = Math.max(t + .12, s.minSec || 0);
  }
  return { ...resolveTiming(s, b?.cues || {}), sec, talk, caption: s.lines.map((l) => l.text).join(' '), words: talk.flatMap((l) => l.words.map(([w, t]) => [w, l.start + t])) };
}

function resolveCam(c, set) { if (!c) return set.cameras.main; if (typeof c === 'string') return set.cameras[c] || set.cameras.main; return { ...set.cameras.main, ...c }; }
function resolveAt(a, set) { if (!a) return [0, 0, 0]; if (typeof a === 'string') return set.spots[a] || [0, 0, 0]; return a; }

