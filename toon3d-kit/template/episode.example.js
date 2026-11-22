// EXAMPLE EPISODE: copy this file to episodes/<slug>/episode.js and edit.
// Every name below ('villain-lair', 'bean-boss', 'money-rain', ...) comes from the asset library.
// If a shot needs something that isn't in the library, add it to engine/ first (see README), never draw it here.
//
// Shot fields:
//   sec        length in seconds (aim 2 to 4)
//   set        set name; setOpts passes options to it
//   cam        camera name from the set ('main', 'wide', ...) or {from, to, ease, drift, roll}; from/to are names or {pos, look, fov}
//              or a library move: cam('follow-behind', { on: 'ETHAN' }) from engine/shots.js (names in CAMERA.md, RULES K3; use these first)
//   enter      'cut' (default) | 'whip' | 'flash' | 'black'
//   shake      true = small impact shake at the start
//   cast       [{asset, at (spot name or [x,y,z]), ry, expression, expressionTo, exprAt, pose, poseTo, poseAt:[t0,t1], walkTo, walkAt, turn, hop, ...bean options}]
//   props      [{asset, at, ry, scale, opts}]
//   caption    narration line shown one word at a time (*word* = highlighted). words: [[word, sec], ...] for real voice timing
//   dof        lens blur. META.dof: 'auto' blurs the background on close-ups; per shot: false, or {focus, to, at, blur, band} (STYLE.md 6b)
//   fog        [color, near, far] to override the set's fog, false to turn it off
//   META.mix   {} locks music and effects at fixed levels under the voice (STYLE.md 8); META.music = { file } from tools/score.py
//   note       the director's intent in a few words, shown to the scored review so a deliberate choice is not marked as a mistake
//   tag        calendar tag top right ('YEAR 5', '+75 YEARS', 'DAY 1')
//   reaction   { face: 'shock_gasp' } (an ANIME_FACES name): a 1-2 s close-up reaction cut, the face's backdrop fills the screen, one
//              cast entry (the reacting character), the line said in that emotion. RULES L14, STYLE.md section 2. No set needed.
//   META.faces 'anime': every character gets the anime face (RULES L1). Keep it on for every new episode.
export const META = { title: 'Demo: The Man Who Wanted Everything', fps: 30, dof: 'auto', faces: 'anime' };

export const SHOTS = [
  {
    sec: 3.2, set: 'villain-lair', cam: { from: { pos: [0, 3.2, 6.5], look: [0, 1.4, -1.5], fov: 45 }, to: { pos: [.6, 2.0, 2.8], look: [0, 1.6, -1.5], fov: 42 } },
    cast: [{ asset: 'bean-boss', at: 'hero', expression: 'smug', pose: 'idle', poseTo: 'armsUp', poseAt: [.35, .55] }],
    props: [{ asset: 'money-rain', at: [0, .2, -1.5], opts: { n: 45, area: [4, 3.4, 3] } }],
    caption: 'He wanted *everything.*',
  },
  {
    sec: 3, set: 'aerial-campus', setOpts: { roofText: 'MEGA' }, enter: 'whip',
    cam: { from: { pos: [-10, 26, 34], look: [2, 0, -2], fov: 45 }, to: { pos: [-4, 16, 22], look: [1, 0, 0], fov: 45 } },
    caption: 'So he built the *biggest* factory on Earth.',
  },
  {
    sec: 3, set: 'server-hall', setOpts: { label: 'DAY', value: '122' }, enter: 'flash', tag: 'DAY 122',
    cam: { from: { pos: [0, 1.6, 3.5], look: [0, 1.5, -12] }, to: { pos: [0, 1.5, 0], look: [0, 1.5, -12] } },
    cast: [{ asset: 'bean-worker', at: 'hero', ry: Math.PI * .1, expression: 'happy', pose: 'idle', poseTo: 'cheer', poseAt: [.4, .55] },
           { asset: 'bean-worker', at: 'tech', ry: -.4, expression: 'neutral', pose: 'phone', hold: 'tablet', body: 0x3c7be0 }],
    caption: 'In just *122* days.',
  },
  {
    sec: 3.2, set: 'office-night', enter: 'whip', shake: true,
    cam: { from: { pos: [.4, 1.8, 3.4], look: [-.4, 1.3, -.9], fov: 42 }, to: { pos: [0, 1.75, 2.4], look: [-.4, 1.4, -.9], fov: 40 } },
    cast: [{ asset: 'bean-everyman', at: 'hero', expression: 'neutral', expressionTo: 'shock', exprAt: .35, pose: 'phone', hold: 'phone', poseTo: 'shrug', poseAt: [.4, .55] }],
    caption: 'But one *problem* remained...',
  },
];
