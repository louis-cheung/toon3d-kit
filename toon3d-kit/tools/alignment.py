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
