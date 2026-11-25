"""Two-speaker Gemini TTS test (additive; does not touch voice.py).

RESULT 2026-11-23: Louis picked single takes (RULES W24 point 6). Kept only as a record of the test; do not use for
production voicing.

  .venv/bin/python tools/voice_duo.py <outdir> [--model M] [--only v1|v2] [--modes A,B] [--takes N]

Voices two dialogue volleys of "Seven Inches" two ways, so Louis can hear which sounds more like a conversation:
  A  one single-voice take per line, built the way voice.py builds it (same prompt, rate, LEAD / TAIL / GAP).
  B  one two-speaker request (multi_speaker_voice_config), per-speaker cast style and per-line acting notes in
     speech_metadata.style (never in the spoken text), cut at the turn boundaries so each speaker gets his or her own rate.
FINDING (2026-11-23): on a multi-speaker request, speech_metadata.style is DROPPED by 2.5-flash (billed input = transcript only,
  52 to 64 tokens) and the lite model rejects it with 400. So B now defaults to a short preamble in the text itself (style_in_metadata=False),
  which bills the preamble (about 250+ tokens). It can be read aloud on short runs: the Whisper check rejects such takes.
Every take is checked word for word with local faster-whisper. Writes volleyN_A_single / volleyN_B_duo .wav and .m4a plus
raw takes in <outdir>/raw and calls.json (tokens and cost estimate). Paid: Vertex, VERTEX_PROJECT from toon3d-kit/.env.
"""
import argparse, io, json, os, pathlib, re, subprocess, sys, time
import numpy as np, soundfile as sf

