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

/** LIES row under the NET WORTH box. Called inside drawCorner's transform (the box's own space: 330 x 116 at 0,0).
 *  lies: { value, steps: [{at, value}], roll: {from, to, at: [t0, t1]}, label ('LIES'), color ('#ff5a7a') } */
export function drawLiesRow(ctx, lies, sec) {
  const [v, pop] = counterAt(lies, sec), col = lies.color || '#ff5a7a', s = 1 + .16 * pop;
  ctx.save(); ctx.translate(0, 128);
  ctx.translate(125, 42); ctx.scale(s, s); ctx.translate(-125, -42);
  if (pop > 0) { ctx.save(); ctx.shadowColor = 'rgba(255,90,122,.9)'; ctx.shadowBlur = 30 * pop; ctx.fillStyle = 'rgba(255,90,122,.45)'; ctx.beginPath(); ctx.roundRect(0, 0, 250, 84, 20); ctx.fill(); ctx.restore(); }
  ctx.fillStyle = 'rgba(42,10,28,.88)'; ctx.beginPath(); ctx.roundRect(0, 0, 250, 84, 20); ctx.fill(); ctx.lineWidth = 5; ctx.strokeStyle = col; ctx.stroke();
  ctx.fillStyle = col; ctx.font = 'bold 30px Helvetica, Arial'; ctx.textAlign = 'left'; ctx.textBaseline = 'middle'; ctx.fillText(lies.label || 'LIES', 22, 44);
  ctx.fillStyle = '#ffffff'; ctx.font = '900 54px Helvetica, Arial'; ctx.textAlign = 'right'; ctx.fillText(String(v), 232, 46, 120);
  ctx.restore();
}

/** Gold text with a thick ink outline, a lighter top and a white glint. */
function goldText(ctx, text, px, stroke = .16) {
  ctx.font = `900 ${px}px Helvetica, Arial`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.lineJoin = 'round';
  ctx.lineWidth = px * stroke * 2; ctx.strokeStyle = INK; ctx.strokeText(text, 0, 0);
  const g = ctx.createLinearGradient(0, -px * .5, 0, px * .5); g.addColorStop(0, '#fff6b8'); g.addColorStop(.45, '#ffd23a'); g.addColorStop(.55, '#f2b01e'); g.addColorStop(1, '#c97a10');
  ctx.fillStyle = g; ctx.fillText(text, 0, 0);
  ctx.lineWidth = px * .035; ctx.strokeStyle = 'rgba(255,255,255,.75)'; ctx.strokeText(text, 0, -px * .03);
}
function star4(ctx, x, y, r, col) { ctx.fillStyle = col; ctx.beginPath(); ctx.moveTo(x, y - r); ctx.lineTo(x + r * .28, y - r * .28); ctx.lineTo(x + r, y); ctx.lineTo(x + r * .28, y + r * .28); ctx.lineTo(x, y + r); ctx.lineTo(x - r * .28, y + r * .28); ctx.lineTo(x - r, y); ctx.lineTo(x - r * .28, y - r * .28); ctx.closePath(); ctx.fill(); }

