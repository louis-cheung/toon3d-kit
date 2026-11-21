// The restaurant, upgraded (2026-11-14, "$40 ring"). Everything here runs only when a shot asks for one of the new setOpts,
// so every older episode on 'restaurant' renders exactly as before.
//   practical: true   you can see the light: pendant beams with dust in them, warm pools on the table, a cool window shaft,
//                     wall sconces with their own pools, real spot lights under the pendants. Glossy bottles, china and glass.
//   dress: 'family'   the long family dinner (8 seats + the head of the table), white cloth, china, glasses, candles, flowers.
//   dress: 'thanksgiving'  the same table re-dressed: roast turkey, pumpkins, pies, a leaf runner, a pennant banner, garlands,
//                     and the kids' table (with a little stool for a grown-up).
//   dress: 'date'     date night (N-06, 2026-11-18): small candlelit two-tops packed close, our table (you / mia) with the
//                     anniversary cake, Chloe and Ryan's table right behind Mia, diners, string lights, a dressed front wall.
//   door: true        a glass front door in the back wall (hinged, doorOpen opens it), the night street behind it.
//   street: 'night' | 'gas'  what the window and door look onto ('gas': a GAS & SNACKS station glowing across the street).
//   heroWindow: true  (date dress only, N-06 v3, 2026-11-18, off by default) our table sits right against a big floor-to-ceiling
//                     window onto the night city (a glass wall along x -1.2, the room's left side behind it), Chloe and Ryan's
//                     table moves back to about three tables behind Mia (dz -1.2), and the diners move off the side-shot line to
//                     the right half of the room. Camera 'side' is the reference two-shot (side on, the window behind both).
// Spots, cameras and mood keys for all of it are added to the set (see the restaurant desc in sets.js).
import { THREE, toon, toonGloss, glow, G, put, group, ctex, rng, lightBeam, lightPool, timeHook, inkAll } from '../core.js';
import { raw } from '../registry.js';

