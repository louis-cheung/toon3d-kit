// N-06 "Thought Notifications" (2026-11-18): the ping card, the engine of the episode. ONE design used everywhere:
//   a chunky white light-mode card, ink outline. Left: a big round avatar with the person's real face (the cast head rendered
//   from the bean rig, cached), with the app badge on it. Middle: the saved name, big and bold, small grey "thought about you".
//   Right: the count, the biggest thing on the card, red (or gold). The count pops on every change: a quick roll for a tick,
//   a flip for the 8-to-9 the viewer watches.
// Three ways to show it, all with the same timeline options (cards, ticks, flip, scroll, pingAt, darkAt):
//   a. in-world phone screen: phone-chat (and table-phone, a held phone) screen 'ping'   (engine/props/home.js calls drawPingScreen)
//      lock: true = the lock screen with the app icon on it (and the cards as notifications under the time)
//   b. 2D overlay for inserts: shot.ping (template/player.js calls drawPingOverlay), the card big over the frame, inside the safe zones
//   c. compact tag anchored to a world point: shot.pingTag (drawPingTag), the avatar and the big number only, for medium and wide
//      shots where the phone is too small to read. Follows the anchor, pops with a ring on every tick, stays up.
// The app has no spoken name; the icon is a pink thought bubble; the tiny made-up label (appName) defaults to 'thinky'.
// Ping sound for the episode builder: audio/sfx/thought-ping.wav (sfx name 'thought-ping').
import { THREE, RENDERER, lighting } from '../core.js';
import { asset, find } from '../registry.js';

const INK = '#2a2233', RED = '#ff3348', GOLD = '#f2b21c', PINK = '#ff5c9a', GREY = '#8a8296';
const c01 = (t) => Math.max(0, Math.min(1, t));
const backE = (t, c = 1.70158) => { t = c01(t) - 1; return 1 + (c + 1) * t * t * t + c * t * t; };
const out3 = (t) => 1 - Math.pow(1 - c01(t), 3);
const sstep = (t) => { t = c01(t); return t * t * (3 - 2 * t); };
export const CARD = { W: 920, H: 250, GAP: 40 };   // card size in its own px (the overlay draws it at 1:1 on a 1080-wide frame)

