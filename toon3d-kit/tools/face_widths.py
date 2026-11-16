"""Measure how wide each character's VISIBLE face is, in pixels, on chosen frames.
  .venv/bin/python tools/face_widths.py episodes/<slug>/episode.js --shots 0,4,8 --pts .05,.5,.97
Renders the frames with ?faces=1 (every face patch painted a flat unique color, grade off, captions drawn but ignored), then for each
character counts the pixels of its color: bbox width and height of what is actually visible (occlusion by people in front shrinks it),
at the 1080 frame width. Order of colors: cast index 0 red, 1 green, 2 blue, 3 magenta, 4 cyan, 5 yellow (debug colors only).
"""
import sys, base64, argparse, threading, http.server, functools, pathlib
import numpy as np
from PIL import Image
import io
from playwright.sync_api import sync_playwright
ROOT = pathlib.Path(__file__).resolve().parent.parent
a = argparse.ArgumentParser(); a.add_argument('episode'); a.add_argument('--shots', required=True); a.add_argument('--pts', default='.05,.5,.97'); a.add_argument('--gpu', action='store_true'); a.add_argument('--names', default='JADE,MAX,F1,F2,F3,F4'); A = a.parse_args()
ep = pathlib.Path(A.episode).resolve()
class Q(http.server.SimpleHTTPRequestHandler):
    def log_message(self, *a): pass
srv = http.server.ThreadingHTTPServer(('127.0.0.1', 0), functools.partial(Q, directory=str(ROOT))); threading.Thread(target=srv.serve_forever, daemon=True).start()
rel = '/' + str(ep.relative_to(ROOT)); pts = [float(x) for x in A.pts.split(',')]; names = A.names.split(',')
COL = [(255, 0, 0), (0, 255, 0), (0, 0, 255), (255, 0, 255), (0, 255, 255), (255, 255, 0)]
args = [] if A.gpu else ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist']
with sync_playwright() as p:
    b = p.chromium.launch(args=args); pg = b.new_page()
    pg.goto(f'http://127.0.0.1:{srv.server_address[1]}/template/player.html?ep={rel}&scale=1&faces=1')
    pg.wait_for_function('window.ready===true', timeout=90000); info = pg.evaluate('info')
    worst = {}
    for i in [int(x) for x in A.shots.split(',')]:
        s = info['shots'][i]; rows = []
        for fr in pts:
            f = s['start'] + min(s['n'] - 1, int(fr * (s['n'] - 1)))
            im = np.asarray(Image.open(io.BytesIO(base64.b64decode(pg.evaluate(f'frame({f})').split(',')[1]))).convert('RGB')).astype(int)
            res = []
            for k, c in enumerate(COL):
                m = (np.abs(im - np.array(c)).max(axis=-1) < 40)
                m[1240:1420] = False   # caption band is white text on dark, never face colors, but be safe
                if m.sum() < 30: res.append((names[k], 0, 0)); continue
                xs = np.where(m.any(axis=0))[0]; ys = np.where(m.any(axis=1))[0]; res.append((names[k], int(xs.max() - xs.min() + 1), int(ys.max() - ys.min() + 1)))
            rows.append((fr, res))
        for fr, res in rows:
            print(f'shot {i:02d} at {fr:.2f}: ' + '  '.join(f'{n} {w}x{h}' for n, w, h in res) + f'   smallest face width {min(w for _, w, _ in res)} px')
        worst[i] = min(min(w for _, w, _ in res) for _, res in rows)
    print('smallest visible face width per shot (px at 1080):', worst)
    b.close()
