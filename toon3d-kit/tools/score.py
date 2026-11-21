"""Make a music bed from code (no samples, no licences). Deterministic: same mood + seed = same file.

  .venv/bin/python tools/score.py episodes/<slug>/audio/bed.wav --mood night
  .venv/bin/python tools/score.py out.wav --mood palace --bpm 80 --bars 8 --seed 3
  .venv/bin/python tools/score.py --list

Moods. The house palette since 2026-11-15 (Louis: "like Mozart ... the old classic music vibes" + "a happier one ... flute"):
  classical  Mozart-like: piano or violins or clarinet on the tune over an Alberti bass, F major, 104 bpm. The default.
  happy      flute on the tune, pizzicato oom-pah, a clarinet a third under, a soft violin pad, glockenspiel on cadences.
  sad        felt piano in D minor, slow, a low bowed string. Only when the story itself is sad.
  calm       sparse felt piano (Minecraft-like). Louis found it "a little too sad" for the default; kept for quiet beats.
Older moods, kept for old episodes:
  night   soft late-night keys, round bass, brushed hats.   Texting, bedrooms, quiet irony. (Case 01's bed.)
  playful  bouncy plucks and a walking bass, major key.       Schemes, flirting, things going well.
  tense    low pulse and a minor pad, sparse.                 A plan about to fail, the wait before a payoff.
  march    kick and snare, plucked bass, brass pad.           History, armies, a crowd doing one stupid thing.
  palace   five-note plucked melody over a drone.             Palace drama, idiom stories, old-China settings.
  low      a lonely minor-key keyboard waltz (3/4), small.     Rock bottom played for laughs: a sad-clown waltz.
                                                              Makes a bad day funnier; never cheerful, never dramatic.

For a bed that changes mood with the story (sad opening, silence, then a lift), build one file from timed
sections with tools/bed.py instead of looping one mood under the whole episode.

The file loops cleanly (notes that ring past the end wrap to the start). Point the episode at it with
META.music = { file: 'audio/bed.wav' }. With META.mix set, tools/voice.py puts it at a fixed level under the voice,
so the loudness of this file does not matter. The twist still gets `musicOff: true` on its shot plus a `sting`.
"""
import argparse, pathlib
import numpy as np
import soundfile as sf

SR = 48000
hz = lambda m: 440 * 2 ** ((m - 69) / 12)


def lowpass(x, cutoff):
    """Brick-ish low-pass in the frequency domain (fast, and a loop stays a loop)."""
    X = np.fft.rfft(x); f = np.fft.rfftfreq(len(x), 1 / SR); X *= 1 / np.sqrt(1 + (f / cutoff) ** 6); return np.fft.irfft(X, len(x))


class Loop:
    def __init__(self, bpm, bars, seed, meter=4):
        # meter: beats per bar (4; the waltz is 3). wrap: notes ringing past the end wrap to the start (a clean loop);
        # tools/bed.py turns it off and renders one long take instead.
        self.beat = 60 / bpm; self.meter = meter; self.n = int(round(bars * meter * self.beat * SR)); self.x = np.zeros(self.n); self.rng = np.random.default_rng(seed); self.wrap = True

