"""Render review stills: first, middle and last frame of every shot (or chosen shots), plus contact sheets.
  .venv/bin/python tools/stills.py episodes/<slug>/episode.js                       # all shots, 3 frames each
  .venv/bin/python tools/stills.py episodes/<slug>/episode.js --shots 3,4 --pts .1,.5,.9
  .venv/bin/python tools/stills.py episodes/<slug>/episode.js --mute                # the sound-off test: no captions, tags or texts
Writes episodes/<slug>/stills/s<shot>_<k>.jpg, sheet_mid.jpg (middle frames) and sheet_ends.jpg (first and last frames).
--mute (2026-11-24) passes ?mute=1 to the player (captions, speaker tags and overlays off; the story text and in-world screens stay) and
writes to stills-mute/ instead. --mute-all also drops the story text (shot.texts).
tools/mutetest.py packs those for a fresh reader.
--cuts (2026-11-24) also renders the middle of every camera cut inside a shot (an insert on a hand, a pov), so a shot's frames are its start,
the middle of each camera, and its end (k = 0..n); a shot with no cuts gets the usual three. The contact sheets are skipped with --cuts.
"""
import sys, base64, argparse, threading, http.server, functools, pathlib
from playwright.sync_api import sync_playwright
from PIL import Image, ImageDraw
ROOT = pathlib.Path(__file__).resolve().parent.parent
a = argparse.ArgumentParser(); a.add_argument('episode'); a.add_argument('--shots'); a.add_argument('--pts', default='.03,.5,.97'); a.add_argument('--scale', type=float, default=1.0); a.add_argument('--gpu', action='store_true'); a.add_argument('--mute', action='store_true'); a.add_argument('--mute-all', action='store_true'); a.add_argument('--cuts', action='store_true'); A = a.parse_args()
ep = pathlib.Path(A.episode).resolve(); A.mute = A.mute or A.mute_all; out = ep.parent / ('stills-mute' if A.mute else 'stills'); out.mkdir(exist_ok=True)
class Q(http.server.SimpleHTTPRequestHandler):
    def log_message(self, *a): pass
srv = http.server.ThreadingHTTPServer(('127.0.0.1', 0), functools.partial(Q, directory=str(ROOT))); threading.Thread(target=srv.serve_forever, daemon=True).start()
rel = '/' + str(ep.relative_to(ROOT)); pts = [float(x) for x in A.pts.split(',')]
args = (['--use-angle=metal', '--enable-gpu', '--ignore-gpu-blocklist'] if sys.platform == 'darwin' else ['--enable-gpu', '--ignore-gpu-blocklist'])   # GPU always (2026-11-24): without these flags headless Chrome draws on the CPU (SwiftShader), ~20x slower
with sync_playwright() as p:
    b = p.chromium.launch(args=args); pg = b.new_page(); errs = []
    pg.on('pageerror', lambda e: errs.append(str(e))); pg.on('console', lambda m: m.type == 'error' and errs.append(m.text))
    pg.goto(f'http://127.0.0.1:{srv.server_address[1]}/template/player.html?ep={rel}&scale={A.scale}' + (('&mute=all' if A.mute_all else '&mute=1') if A.mute else ''))
    pg.wait_for_function('window.ready===true', timeout=90000); info = pg.evaluate('info')
    print(f"{info['total']} frames, {info['total']/info['fps']:.1f}s, {len(info['shots'])} shots")
    pick = [int(x) for x in A.shots.split(',')] if A.shots else range(len(info['shots']))
    for i in pick:
        s = info['shots'][i]
        fps = info['fps']; dur = (s['n'] - 1) / fps
        for old in out.glob(f's{i:02d}_*.jpg'): old.unlink()   # a shot's frame count can change between runs
        if A.cuts:   # start, the middle of every camera span, end
            edges = [0.0] + sorted(c for c in (s.get('cuts') or []) if 0 < c < dur) + [dur]
            fr_list = [pts[0]] + [((a + b) / 2) / max(dur, 1e-3) for a, b in zip(edges, edges[1:])] + [pts[-1]]
            if len(edges) == 2: fr_list = pts
        else: fr_list = pts
        last = None
        for k, fr in enumerate(fr_list):
            f = s['start'] + min(s['n'] - 1, int(fr * (s['n'] - 1)))
            pathlib.Path(out / f's{i:02d}_{k}.jpg').write_bytes(base64.b64decode(pg.evaluate(f'frame({f})').split(',')[1]))
    for e in errs[:10]: print('ERR', e)
    b.close()
def sheet(name, ks, cols, w=270, h=480):
    shots = list(pick); n = len(shots) * len(ks); rows = (n + cols - 1) // cols
    S = Image.new('RGB', (cols * w, rows * h), (20, 20, 28)); d = ImageDraw.Draw(S)
    for j, (i, k) in enumerate([(i, k) for i in shots for k in ks]):
        im = Image.open(out / f's{i:02d}_{k}.jpg').resize((w, h)); S.paste(im, ((j % cols) * w, (j // cols) * h)); d.text(((j % cols) * w + 6, (j // cols) * h + 6), f'{i}.{k}', fill=(255, 255, 255))
    S.save(out / name, quality=88)
mid = len(pts) // 2
if A.cuts: print('stills ->', out); raise SystemExit(0)
sheet('sheet_mid.jpg', [mid], 7); sheet('sheet_ends.jpg', [0, len(pts) - 1], 8)
print('stills ->', out)
