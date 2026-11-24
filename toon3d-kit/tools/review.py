"""Pack an episode for the scored review: numbered contact sheets plus one brief the verifier reads.

  .venv/bin/python tools/stills.py episodes/<slug>/episode.js        # first, if the stills are missing or stale
  .venv/bin/python tools/review.py episodes/<slug>/episode.js        # writes episodes/<slug>/review/
  .venv/bin/python tools/review.py episodes/<slug>/episode.js --ref ../references/be-honest-refs

Writes review/sheet_1.jpg (and sheet_2.jpg past 12 shots): the middle frame of every shot with a big shot number.
Writes review/ref.jpg when --ref points at a folder of reference frames (what a 10 looks like).
Writes review/BRIEF.md: the rubric, the line each shot must show, the machine numbers, and the answer format.

It also runs the clip check (tools/clipcheck.py, PLAYBOOK 12 rule 38) over every 2nd frame of the episode: any character passing
through a seat, a table, a wall or another character marks those shots CLIP in red on the sheets, is listed in the brief, and makes
this script exit 1. Clipping fails the stills: fix it before the scored review and before the full render. --no-clip skips it.

Then a FRESH agent (never the one that built the episode) reads BRIEF.md and the sheets and answers with seven
scores and at most five fixes. It costs two or three images and about 200 words, once per episode at the stills
stage. Run it a second time only if a score came back under 6. Everything frame-by-frame stays with the free
scripts (tools/qa_frames.py, tools/look_metrics.py); this is the one step that needs eyes.
"""
import argparse, json, pathlib, re, subprocess, tempfile, shutil
from PIL import Image, ImageDraw, ImageFont

