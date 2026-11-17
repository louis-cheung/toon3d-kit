"""Measured caption timing and transcript validation. Never estimates missing words."""
import re

def letters(text):
    # ASR punctuation and hyphenation may differ without changing what was said.
    return re.sub('[^a-z0-9]', '', text.lower().replace('’', "'"))

def align_words(text, heard):
    expected = text.split()
    target = ''.join(letters(w) for w in expected)
    actual = ''.join(letters(w['word']) for w in heard)
    offset = actual.find(target)
    if offset < 0 or not target:
        raise ValueError(f'Transcript mismatch: expected {text!r}; heard {" ".join(w["word"] for w in heard)!r}. Review the take; no estimated fallback.')
    positions=[]
    for i,w in enumerate(heard): positions.extend([i]*len(letters(w['word'])))
    # Do not cut inside a recognized word, or mistake a substring for a match.
    stop=offset+len(target)
    if (offset and positions[offset-1]==positions[offset]) or (stop<len(positions) and positions[stop-1]==positions[stop]):
        raise ValueError('Script match cuts through a spoken word')
    rows=[]; ends=[]; cursor=offset
    for w in expected:
        n=len(letters(w))
        if not n: raise ValueError('Caption word contains no speech')
        first,last=heard[positions[cursor]],heard[positions[cursor+n-1]]
        rows.append([w,round(first['start'],3)]); ends.append(round(last['end'],3)); cursor+=n
    return {'words':rows,'ends':ends,'trim':[heard[positions[offset]]['start'],heard[positions[stop-1]]['end']],
            'prefixEnd': heard[positions[offset]-1]['end'] if offset else 0,
            'suffixStart': heard[positions[stop]]['start'] if stop < len(positions) else None,
            'extraPrefix':[w['word'] for w in heard[:positions[offset]]],
            'extraSuffix':[w['word'] for w in heard[positions[stop-1]+1:]]}

def resolve_cues(specs, lines):
    result={}
    for name,spec in specs.items():
        line=lines[spec.get('line',0)]
        if spec.get('after'):
            at=line['start']+line['dur']
        else:
            matches=[i for i,(w,t) in enumerate(line['words']) if letters(w)==letters(spec['word'])]
            if len(matches)<=spec.get('occurrence',0): raise ValueError(f'Missing cue word: {name}: {spec}')
            index=matches[spec.get('occurrence',0)]
            at=line['start']+(line['wordEnds'][index] if spec.get('end') else line['words'][index][1])
        result[name]=round(at+spec.get('offset',0),3)
    return result

def resolve_timing(value,cues):
    if isinstance(value,list): return [resolve_timing(v,cues) for v in value]
    if isinstance(value,dict):
        if 'span' in value: return round(max(.01, cues[value['span'][1]]-cues[value['span'][0]]),3)
        if 'cue' in value: return round(max(0,cues[value['cue']]+value.get('offset',0)),3)
        return {k:resolve_timing(v,cues) for k,v in value.items()}
    return value
