"""Voice an episode with actor's briefs on gemini-2.5-pro-tts, single takes, an audio judge, and hand-set gaps. Additive; voice.py is only
reached through its opt-in META.voice flags (briefInText, keepDynamics, edge).

  .venv/bin/python tools/voice_brief.py <episode dir> takes [--takes 3] [--rows 1,2] [--max-extra 3]   paid (Vertex): 3 takes a line, Whisper, judge, pick
  .venv/bin/python tools/voice_brief.py <episode dir> js                                              write episode.js from <dir>/voice_lines.py + voice/timing.json
  .venv/bin/python tools/voice_brief.py <episode dir> gaps                                            solve lead/hold/pause so every gap hits its target (reads voice/built.json)
  .venv/bin/python tools/voice_brief.py <episode dir> check                                           measure the real speech-to-speech gaps in built.json against the targets

The episode dir holds voice_lines.py (MODEL, VOICES, GROUPS, LINES, LAST_HOLD, brief()). Flow: takes -> js -> voice.py --allow-paid (cached, 0 new calls)
-> gaps -> js -> voice.py -> check. Raw takes (all of them) live in <dir>/voice/raw; the picked take of each line is copied into voice/takes/<key>.wav,
where voice.py finds it (same key formula as voice.py's take_key). Takes are never loudness-normalised.
"""
import argparse, hashlib, importlib.util, json, pathlib, re, subprocess, sys, threading, time
import numpy as np, soundfile as sf
HERE = pathlib.Path(__file__).resolve().parent
sys.path.insert(0, str(HERE))
import voice_duo as D
from alignment import align_words, letters

