// EXAMPLE EPISODE: copy this file to episodes/<slug>/episode.js and edit.
// Every name below ('villain-lair', 'bean-boss', 'money-rain', ...) comes from the asset library.
// If a shot needs something that isn't in the library, add it to engine/ first (see README), never draw it here.
//
// Shot fields:
//   sec        length in seconds (aim 2 to 4)
//   set        set name; setOpts passes options to it
//   cam        camera name from the set ('main', 'wide', ...) or {from, to, ease, drift, roll}; from/to are names or {pos, look, fov}
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
export const META = { title: 'Demo: The Man Who Wanted Everything', fps: 30, dof: 'auto' };

