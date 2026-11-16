"""Full-frame-rate contact sheets for an already-rendered episode: the same recipe
claude-animated-shorts used to actually watch 20 reference shorts frame by frame instead of
sampling a few here and there -- "every 2 seconds of video became one contact sheet, 60 frames
on a single image". Use it to zoom into a moment tools/qa_frames.py flagged, or to eyeball a
whole episode at true frame rate before calling it done.

  # one sheet covering a 2s window (default), every real frame -- e.g. to look at a flagged frame
  .venv/bin/python tools/episode_sheet.py episodes/<slug>/render --start 3.0

  # the whole episode, chunked into consecutive 2s sheets
  .venv/bin/python tools/episode_sheet.py episodes/<slug>/render --all

Needs <render>/frames/f*.jpg on disk (render.py's own frame dump; don't delete it before QA).
"""
import sys, glob, argparse, pathlib
from PIL import Image

