"""The render gate (RULES P9): template/render.py refuses a frame render until the stills have passed.

  .venv/bin/python tools/gate.py episodes/<slug>/episode.js                                   # show the gate, exit 1 if shut
  .venv/bin/python tools/gate.py episodes/<slug>/episode.js --scores "story 8 | staging 8 | characters 8 | colour 7 | depth 8 | variety 8 | continuity 8"
  .venv/bin/python tools/gate.py episodes/<slug>/episode.js --scores "..." --blocking 2      # the verifier marked 2 fixes blocking

The gate opens only when all of this is true for the episode file exactly as it is now:
  1. tools/review.py ran its clip check on it and found no clipping (it writes review/gate.json),
  2. a fresh verifier's seven scores (STYLE.md 10b) were recorded here, every one 6 or more,
  3. no fix was marked blocking.
Editing episode.js shuts it again: re-run tools/stills.py and tools/review.py, then record the new scores.
There is no override flag. Stills (render.py --stills, tools/stills.py) are never gated.
"""
import argparse, hashlib, json, pathlib, re, sys, time

AREAS = ['story', 'staging', 'characters', 'colour', 'depth', 'variety', 'continuity']
MIN = 6

