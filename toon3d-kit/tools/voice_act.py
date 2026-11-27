"""Voice test 2 for "Seven Inches": actor's briefs, two Gemini TTS models, single takes, audio judge. Additive; does not touch voice.py.

  .venv/bin/python tools/voice_act.py <outdir> [--takes 3]

Variants per volley:  lite = gemini-3.8-flash-lite-tts, brief in speech_metadata.style (as voice.py).
                      best = gemini-2.5-pro-tts, brief in the text turn ("not to be spoken", then "say exactly this line"), because the
                             pro model bills only the bare text when speech_metadata is sent (it drops it).
Every take is checked word for word with local faster-whisper (capitals and ! do not matter to the check). No per-line loudness
normalising: takes keep their own dynamics; only the assembled volley is normalised. Paid: Vertex.
"""
import argparse, io, json, pathlib, sys, time, re
import numpy as np, soundfile as sf
sys.path.insert(0, str(pathlib.Path(__file__).resolve().parent))
import voice_duo as D
from concurrent.futures import ThreadPoolExecutor

LITE, BEST = 'gemini-3.8-flash-lite-tts', 'gemini-2.5-pro-tts'
JUDGES = ['gemini-3.1-pro-preview', 'gemini-3.5-flash']
VOICES = {'YOU': ('Umbriel', 1.15), 'MIA': ('Aoede', 1.10)}
VERB = 'Read the supplied line verbatim; never speak these notes. '

