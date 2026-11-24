"""Render an episode.
  python3 template/render.py episodes/<slug>/episode.js --stills        # one still per shot + contact sheet (fast check)
  python3 template/render.py episodes/<slug>/episode.js                 # all frames -> out.mp4 (refused until tools/gate.py is open)
Options: --scale 0.5 (draft resolution), --audio voice.mp3 (muxed in), --out <dir>, --frames 0-120, --gpu (on a Mac with a real GPU)
"""
import sys, os, base64, argparse, threading, http.server, functools, pathlib, subprocess, time
from playwright.sync_api import sync_playwright
ROOT = pathlib.Path(__file__).resolve().parent.parent
a = argparse.ArgumentParser(); a.add_argument('episode'); a.add_argument('--stills', action='store_true'); a.add_argument('--scale', type=float, default=1.0)
a.add_argument('--resume', action='store_true', help='Reuse existing frames only after checking sources are unchanged'); a.add_argument('--audio'); a.add_argument('--out'); a.add_argument('--frames'); a.add_argument('--gpu', action='store_true', help='kept for old commands; the GPU is the default now'); a.add_argument('--cpu', action='store_true'); A = a.parse_args()
ep = pathlib.Path(A.episode).resolve(); A.audio = A.audio or (str(ep.parent / 'voice' / 'mix.wav') if (ep.parent / 'voice' / 'mix.wav').exists() else None); out = pathlib.Path(A.out or ep.parent / 'render'); (out / 'frames').mkdir(parents=True, exist_ok=True)
if not A.stills:   # the render gate (RULES P9): no frames until the stills passed. tools/gate.py explains it. No override.
    sys.path.insert(0, str(ROOT / 'tools')); import gate; why = gate.problems(ep)
    if why: raise SystemExit('RENDER REFUSED: the stills have not passed.\n' + '\n'.join('  - ' + w for w in why))
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
        picks = [s['start'] + s['n'] // 2 for s in info['shots']]
        for i, f in enumerate(picks): save(pg.evaluate(f'frame({f})'), out / f'still_{i:02d}.jpg')
        from PIL import Image
        ims = [Image.open(out / f'still_{i:02d}.jpg') for i in range(len(picks))]; w, h = 270, 480
        sheet = Image.new('RGB', (w * len(ims), h)); [sheet.paste(im.resize((w, h)), (i * w, 0)) for i, im in enumerate(ims)]; sheet.save(out / 'stills_sheet.jpg', quality=88)
        print('stills ->', out / 'stills_sheet.jpg')
    else:
        lo, hi = (map(int, A.frames.split('-')) if A.frames else (0, info['total'] - 1)); t0 = time.time()
        for f in range(lo, hi + 1):
            fp = out / 'frames' / f'f{f:05d}.jpg'
            if A.resume and fp.exists(): continue
            save(pg.evaluate(f'frame({f})'), fp)
            if f % 30 == 0: print(f'frame {f}/{hi}  {(time.time()-t0)/(f-lo+1):.2f}s/frame', flush=True)
        if A.frames:
            print(f'frames {lo}-{hi} -> {out / "frames"}')
        else:
            cmd = ['ffmpeg', '-y', '-loglevel', 'error', '-framerate', str(info['fps']), '-i', str(out / 'frames' / 'f%05d.jpg')]
            if A.audio: cmd += ['-i', A.audio, '-c:a', 'aac', '-b:a', '192k', '-shortest']
            cmd += ['-frames:v', str(info['total']), '-c:v', 'libx264', '-preset', 'veryfast', '-crf', '18', '-pix_fmt', 'yuv420p', '-colorspace', 'bt709', '-movflags', '+faststart', str(out / 'out.mp4')]
            subprocess.run(cmd, check=True); print('video ->', out / 'out.mp4')
    if errs: print('ERRORS:\n' + '\n'.join(errs[:10]))
    b.close()
