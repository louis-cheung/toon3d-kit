"""The render gate (RULES P9): template/render.py refuses a frame render until the stills have passed.

  .venv/bin/python tools/gate.py episodes/<slug>/episode.js                                   # show the gate, exit 1 if shut
  .venv/bin/python tools/gate.py episodes/<slug>/episode.js --scores "story 8 | staging 8 | ..." --scores "..." --scores "..."   # three verifiers
  .venv/bin/python tools/gate.py episodes/<slug>/episode.js --scores "..." --scores "..." --scores "..." --blocking 2
      # --blocking counts the fixes marked blocking by at least 2 of the 3 verifiers on the same shot (the director counts them)

The gate opens only when all of this is true for the episode file exactly as it is now:
  1. tools/review.py ran its clip check on it and found no clipping (it writes review/gate.json),
  2. three fresh verifiers' seven scores (STYLE.md 10b) were recorded here (one --scores each, run in parallel on the
     same stills), and the median of each area is 6 or more (Louis, 2026-11-24: "let's switch to 3"),
  3. no fix was marked blocking by 2 or more of them.
Editing episode.js shuts it again: re-run tools/stills.py and tools/review.py, then record the new scores.
There is no override flag. Stills (render.py --stills, tools/stills.py) are never gated.
"""
import argparse, hashlib, json, pathlib, re, statistics, sys, time

AREAS = ['story', 'staging', 'characters', 'colour', 'depth', 'variety', 'continuity']
MIN = 6
VERIFIERS = 3   # RULES P9, 2026-11-24: three fresh verifiers per round; the gate reads the median of each area

