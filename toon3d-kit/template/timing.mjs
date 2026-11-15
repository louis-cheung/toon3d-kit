// Shared shot clock: cues, gestures and captions all use seconds of the measured audio.
export function resolveTiming(value, cues) {
  if (Array.isArray(value)) return value.map(v => resolveTiming(v, cues));
  if (value && typeof value === 'object') {
    if ('span' in value) return Math.max(.01, cues[value.span[1]] - cues[value.span[0]]);
    if ('cue' in value) {
      if (!(value.cue in cues)) throw new Error(`Missing voice cue: ${value.cue}`);
      return Math.round(Math.max(0, cues[value.cue] + (value.offset || 0)) * 1000) / 1000;
    }
    return Object.fromEntries(Object.entries(value).map(([k,v]) => [k, resolveTiming(v,cues)]));
  }
  return value;
}
export function captionAt(shot, sec) {
  if (shot.talk) {
    for (const line of shot.talk) {
      const local = sec - line.start;
      for (let i = line.words.length - 1; i >= 0; i--) {
        const [word, start] = line.words[i];
        const end = line.wordEnds?.[i] ?? line.words[i + 1]?.[1] ?? line.dur;
        if (local >= start && local < end) return {word, start: line.start + start};
      }
    }
    return null;
  }
  const words = shot.words || shot.caption?.split(/\s+/).map((w,i,a)=>[w,i/a.length*shot.sec*.92]) || [];
  let result = null;
  for (const [word,start] of words) if (sec >= start) result = {word,start};
  return result;
}
