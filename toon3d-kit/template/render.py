"""Render an episode.
  python3 template/render.py episodes/<slug>/episode.js --stills        # one still per shot + contact sheet (fast check)
  python3 template/render.py episodes/<slug>/episode.js                 # all frames -> out.mp4
Options: --scale 0.5 (draft resolution), --audio voice.mp3 (muxed in), --out <dir>, --frames 0-120, --gpu (on a Mac with a real GPU)
"""
import sys, os, base64, argparse, threading, http.server, functools, pathlib, subprocess, time
from playwright.sync_api import sync_playwright
ROOT = pathlib.Path(__file__).resolve().parent.parent
a = argparse.ArgumentParser(); a.add_argument('episode'); a.add_argument('--stills', action='store_true'); a.add_argument('--scale', type=float, default=1.0)
a.add_argument('--resume', action='store_true', help='Reuse existing frames only after checking sources are unchanged'); a.add_argument('--audio'); a.add_argument('--out'); a.add_argument('--frames'); a.add_argument('--gpu', action='store_true'); A = a.parse_args()
ep = pathlib.Path(A.episode).resolve(); A.audio = A.audio or (str(ep.parent / 'voice' / 'mix.wav') if (ep.parent / 'voice' / 'mix.wav').exists() else None); out = pathlib.Path(A.out or ep.parent / 'render'); (out / 'frames').mkdir(parents=True, exist_ok=True)
class Q(http.server.SimpleHTTPRequestHandler):
    def log_message(self, *a): pass
srv = http.server.ThreadingHTTPServer(('127.0.0.1', 0), functools.partial(Q, directory=str(ROOT))); threading.Thread(target=srv.serve_forever, daemon=True).start()
rel = '/' + str(ep.relative_to(ROOT))
args = [] if A.gpu else ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist']
def save(d, p): pathlib.Path(p).write_bytes(base64.b64decode(d.split(',')[1]))
with sync_playwright() as p:
    b = p.chromium.launch(args=args); pg = b.new_page(); errs = []
    pg.on('pageerror', lambda e: errs.append(str(e))); pg.on('console', lambda m: m.type == 'error' and errs.append(m.text))
    pg.goto(f'http://127.0.0.1:{srv.server_address[1]}/template/player.html?ep={rel}&scale={A.scale}')
    try: pg.wait_for_function('window.ready===true', timeout=90000)
    except Exception: print('\n'.join(errs)); raise
    info = pg.evaluate('info'); print(f"{info['total']} frames, {info['total']/info['fps']:.1f}s, {len(info['shots'])} shots, {info['w']}x{info['h']}")
    if A.stills:
