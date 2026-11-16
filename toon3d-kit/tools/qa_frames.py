"""Automated frame QA, the way claude-animated-shorts' short_qa.py does it: scan every rendered
frame for the things a still-sheet eyeball check misses, instead of trusting that stills_sheet.jpg
looked fine on 4-8 sampled frames.

  .venv/bin/python tools/qa_frames.py episodes/<slug>/render [--audio episodes/<slug>/voice/mix.wav] [--fps 30]

Reads <render>/frames/f*.jpg (render.py's own frame dump -- no re-encode needed). Flags:
  - black / white frames      mean luma outside [0.02, 0.98]
  - frozen spans              >= 12 consecutive frames with near-zero motion (STYLE.md: "every shot moves";
                               a flat hold reads as a freeze -- this is the same frozen-span rule the repo's
                               short_qa.py and SKILL.md's "Readability traps" call out)
  - pop frames                one frame far from both neighbours (a single bad/glitched frame)
  - clipped audio / too quiet mix.wav peak and RMS, if given

Frames are checked at a small downsample (64x114) for speed -- this is a motion/exposure scan, not a
pixel-perfect compare.
"""
import sys, glob, argparse
import numpy as np
from PIL import Image

DOWN = (64, 114)  # w, h

def load_small(path):
    im = Image.open(path).convert('RGB')
    im.draft('RGB', DOWN)
    im = im.resize(DOWN)
    return np.asarray(im).astype(np.float64) / 255.0

def luma(rgb):
    return 0.2126 * rgb[..., 0] + 0.7152 * rgb[..., 1] + 0.0722 * rgb[..., 2]

def main():
    a = argparse.ArgumentParser()
    a.add_argument('render_dir')
    a.add_argument('--audio')
    a.add_argument('--fps', type=float, default=30)
    a.add_argument('--frozen-frames', type=int, default=12, help='consecutive near-still frames to flag (default 12, matches the bridge QA threshold)')
    a.add_argument('--frozen-thresh', type=float, default=0.004, help='mean abs luma diff below this counts as "no motion"')
    a.add_argument('--pop-thresh', type=float, default=0.12, help='mean abs luma diff above this vs both neighbours flags a pop frame')
    A = a.parse_args()

    paths = sorted(glob.glob(A.render_dir.rstrip('/') + '/frames/f*.jpg'))
    if not paths:
        print(f'no frames found under {A.render_dir}/frames/'); sys.exit(1)
    print(f'scanning {len(paths)} frames ...')

