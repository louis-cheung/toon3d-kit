// 2D overlays drawn by template/player.js on top of the finished frame (after the grade, so they stay full brightness and crisp).
// Rich System Ep 3 ("Every Lie Pays", 2026-11-14): the LIES counter under the NET WORTH corner, the gold money pops over a head,
// and the slot-machine JACKPOT burst. Everything is a pure function of the shot clock. Sizes are in px at 1080 wide.
import { ease, clamp01 } from './core.js';

const INK = '#1d1324';
const back = (t) => ease.back(clamp01(t));
const out3 = (t) => 1 - Math.pow(1 - clamp01(t), 3);

/** The value of a counter at `sec`: steps [{at, value}] tick, roll {from, to, at: [t0, t1]} counts. Returns [value, pop 0..1]. */
function counterAt(c, sec) {
  let v = c.value, pop = 0;
  if (c.steps) { const p = c.steps.filter((q) => sec >= q.at).pop(); if (p) { v = p.value; pop = Math.max(0, 1 - (sec - p.at) / .25); } }
  if (c.roll && sec >= c.roll.at[0]) { const q = clamp01((sec - c.roll.at[0]) / Math.max(.001, c.roll.at[1] - c.roll.at[0])); v = Math.round(c.roll.from + (c.roll.to - c.roll.from) * (1 - Math.pow(1 - q, 2)));
    pop = q < 1 ? .35 + .35 * Math.abs(Math.sin(sec * 30)) : Math.max(0, 1 - (sec - c.roll.at[1]) / .25); }
  return [v, pop];
}

