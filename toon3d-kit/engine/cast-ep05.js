// Rich System Ep 5 "Mom's Setup" (2026-11-15): the new cast and poses. New file, nothing else changes.
// Flat 2D look with the rich finish on (shade + detail: drawn shading on clothes, hair and bags, a contact shadow; the head stays flat white).
//   bean-kayla          the rival. Electric cobalt satin corset top (glossy), a white mini skirt, a sleek espresso high ponytail with a gold cuff
//                       and caramel shine, a middle part, big gold drop earrings with a cobalt gem, a gold chain, a silver crossbody bag on a
//                       gold chain strap, long red nails, red lipstick with a gloss glint, lashes. Always holding her phone (holdPhone, 'rec').
//   bean-kayla-friend   n 1: giggly. Lime daisy crop top, denim mini skirt, a copper bob with two space buns (lime scrunchies), blush, pearl studs.
//                       n 2: drawling. Leopard faux-fur jacket over a navy top, dark jeans, a cream knit beanie, a long chocolate braid over her
//                       shoulder, big gold hoops.
//   bean-ethan-mom      Ethan's mom (~55). A terracotta cable-knit house sweater, a grey-brown bun with a pencil through it, tortoiseshell reading
//                       glasses on a gold chain (glasses: true by default), slate trousers, a little gold cross-free locket. apron: true adds a
//                       blue gingham apron.
//   bean-host           the maitre d'. Midnight-navy dinner jacket, white shirt, a gold bow tie, a gold pocket square and lapel pin, slick silver
//                       side part, a thin silver moustache.
//   bean-ethan-delivery Ethan (bean-ethan, unchanged) in an orange delivery jacket over his grey hoodie (the orange-lined hood out over the
//                       collar), a reflective stripe and an EATS chest patch. Every bean-ethan option still works.
// EP05_POSES join the shared pose table, so every flat bean takes them by name (also exported for { pose: EP05_POSES.x }).
// EP05_FACES are expression objects any flat bean can wear (expression: EP05_FACES.sneer); the presets also take them by name.
import { THREE, G, put, group, ctex, hex } from './core.js';
import { register, find } from './registry.js';
import { makeBean, EXPRESSIONS, RICH_FLAT_POSES, POSES as SHARED_POSES, hairShell, baseLine, tooth, lump } from './character.js';
import { DATING_POSES } from './cast-dating.js';

