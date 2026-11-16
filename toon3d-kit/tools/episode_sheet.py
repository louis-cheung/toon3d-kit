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

def make_sheet(paths, cols, cell_w=180):
    if not paths: return None
    im0 = Image.open(paths[0])
    cell_h = int(cell_w * im0.height / im0.width)
    rows = (len(paths) + cols - 1) // cols
    sheet = Image.new('RGB', (cols * cell_w, rows * cell_h), '#101014')
    for i, p in enumerate(paths):
        im = Image.open(p).resize((cell_w, cell_h))
        sheet.paste(im, ((i % cols) * cell_w, (i // cols) * cell_h))
    return sheet

def main():
    a = argparse.ArgumentParser()
    a.add_argument('render_dir')
    a.add_argument('--fps', type=float, default=30)
    a.add_argument('--dur', type=float, default=2.0, help='seconds per sheet (default 2.0, 60 frames at 30fps -- the reference recipe)')
    a.add_argument('--start', type=float, default=0.0, help='window start in seconds (ignored with --all)')
    a.add_argument('--all', action='store_true', help='chunk the whole episode into consecutive --dur sheets')
    a.add_argument('--cols', type=int, default=10)
    a.add_argument('--out', help='output path (single-window mode); default <render>/sheet_<start>-<end>.jpg')
    A = a.parse_args()

    paths = sorted(glob.glob(A.render_dir.rstrip('/') + '/frames/f*.jpg'))
    if not paths:
        print(f'no frames found under {A.render_dir}/frames/'); sys.exit(1)
    per_sheet = max(1, round(A.dur * A.fps))

    if A.all:
        out_dir = pathlib.Path(A.render_dir) / 'sheets'
        out_dir.mkdir(exist_ok=True)
        n = (len(paths) + per_sheet - 1) // per_sheet
        for i in range(n):
            chunk = paths[i * per_sheet:(i + 1) * per_sheet]
            sheet = make_sheet(chunk, A.cols)
            t0, t1 = i * A.dur, i * A.dur + len(chunk) / A.fps
            out = out_dir / f'sheet_{i:03d}_{t0:05.1f}-{t1:05.1f}.jpg'
            sheet.save(out, quality=88)
        print(f'{n} sheet(s) -> {out_dir}/')
    else:
        lo = round(A.start * A.fps)
        chunk = paths[lo:lo + per_sheet]
        if not chunk:
            print(f'no frames at/after {A.start}s (have {len(paths)} frames, {len(paths)/A.fps:.1f}s total)'); sys.exit(1)
        sheet = make_sheet(chunk, A.cols)
        out = A.out or str(pathlib.Path(A.render_dir) / f'sheet_{A.start:.1f}-{A.start + len(chunk)/A.fps:.1f}.jpg')
        sheet.save(out, quality=88)
        print(f'{len(chunk)} frames ({A.start:.1f}s-{A.start + len(chunk)/A.fps:.1f}s) -> {out}')

if __name__ == '__main__':
    main()
