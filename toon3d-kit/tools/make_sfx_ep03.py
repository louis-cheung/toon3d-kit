"""Rich System Ep 3 ("Every Lie Pays") sound effects, made from code (no samples, no licences). Deterministic (fixed seeds).
  .venv/bin/python tools/make_sfx_ep03.py            # writes audio/sfx/<name>.wav, 44.1 kHz mono 16-bit
  jackpot     3.2 s slot machine: reels whirring with fast clicks (0 to 1.1 s), three reel-stop clunks (.6, .85, 1.1 s), then the win:
              a ringing bell, a bright major fanfare and a long shower of coins
  coins       1.6 s shower of coins landing (for money falling)
  big-ching   a heavier ka-ching for the BIG and HUGE lies: a low thump under a double register bell
Reuses the helpers of tools/make_sfx_rich.py (same writer and filters) without running that script's own outputs.
"""
import os, wave
import numpy as np
SR = 44100
OUT = os.path.join(os.path.dirname(__file__), '..', 'audio', 'sfx')
T = lambda sec: np.arange(int(sec * SR)) / SR
rng = np.random.default_rng

def write(name, x, peak=.89):
    x = np.asarray(x, dtype=np.float64); x = x / max(1e-9, np.abs(x).max()) * peak
    with wave.open(os.path.join(OUT, name + '.wav'), 'wb') as w:
        w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR); w.writeframes((x * 32767).astype('<i2').tobytes())
    print('wrote', name, f'{len(x) / SR:.2f}s')

def lp(x, a):
    y = np.empty_like(x); s = 0.0
    for i, v in enumerate(x): s += a * (v - s); y[i] = s
    return y
def env(t, att, dec): return np.minimum(1, t / max(att, 1e-4)) * np.exp(-t * dec)
def place(dst, src, at, g=1.0):
    p = int(at * SR); n = min(len(src), len(dst) - p)
    if n > 0: dst[p:p + n] += src[:n] * g

def clink(r, f=None):
    t = T(.18); f = f or r.uniform(2800, 5200)
    return sum(np.sin(2 * np.pi * f * k * t) * np.exp(-t * (40 + 25 * k)) / k for k in (1, 2.76, 5.4)) * np.minimum(1, t / .0008)

def coins(sec=1.6, n=70, seed=11):
    r = rng(seed); x = np.zeros(int(sec * SR))
    for i in range(n):
        at = (i / n) ** 1.4 * (sec - .2) + r.uniform(0, .03); place(x, clink(r), at, r.uniform(.25, 1) * (1 - .5 * i / n))
    return x

def bell(sec=1.6):
    t = T(sec); ring = sum(np.sin(2 * np.pi * f * t) * np.exp(-t * d) * a for f, d, a in ((1318.5, 2.2, 1), (1975.5, 2.6, .7), (2637, 3.4, .5), (3520, 4.5, .3)))
    trem = (np.sin(2 * np.pi * 18 * t) > 0).astype(float) * .5 + .5   # an electric bell's clapper
    return ring * trem * np.minimum(1, t / .002)

def fanfare():
    notes = [(523.3, 0, .12), (659.3, .1, .12), (784, .2, .12), (1046.5, .3, .5), (784, .62, .1), (1046.5, .72, .7)]
    x = np.zeros(int(1.6 * SR))
    for f, st, d in notes:
        tt = np.arange(int((d + .3) * SR)) / SR
        v = (np.sign(np.sin(2 * np.pi * f * tt)) * .35 + np.sin(2 * np.pi * f * tt) * .6 + np.sin(2 * np.pi * f * 2.003 * tt) * .25) * np.minimum(1, tt / .006) * np.exp(-tt * (3 if d > .4 else 8))
        place(x, v, st)
    return lp(x, .35)

def jackpot():
    x = np.zeros(int(3.2 * SR)); r = rng(5)
    # reels whirring: a filtered noise bed and clicks that speed up, then thin out as the reels stop
    t = T(1.1); place(x, lp(r.uniform(-1, 1, len(t)), .08) * np.minimum(1, t / .05) * .35, 0)
    k = 0.0
    while k < 1.1:
        rate = 22 + 30 * min(1, k / .3) * (1 - .55 * max(0, (k - .6) / .5)); place(x, clink(r, 1800 + r.uniform(0, 400)) * .35, k); k += 1 / rate
    for at in (.6, .85, 1.1):   # reel stops: a clunk and a little bounce
        tt = T(.25); place(x, (np.sin(2 * np.pi * 110 * tt) * env(tt, .001, 30) + lp(r.uniform(-1, 1, len(tt)), .4) * env(tt, .001, 60)) * .9, at)
    place(x, bell(1.8), 1.12, .7); place(x, fanfare(), 1.12, .8); place(x, coins(1.9, 110, 7), 1.18, .8)
    tt = T(.5); place(x, np.sin(2 * np.pi * 60 * tt) * env(tt, .002, 7) * 1.2, 1.1)   # the boom of the win
    return x

def big_ching():
    t = T(1.4); r = rng(8); x = np.zeros(len(t))
    place(x, np.sin(2 * np.pi * 55 * t[:int(.5 * SR)]) * env(t[:int(.5 * SR)], .002, 8) * 1.1, 0)
    place(x, lp(r.uniform(-1, 1, len(t)), .6) * env(t, .001, 70) * .8, 0)
    tt = t[:int(1.2 * SR)]; b = sum(np.sin(2 * np.pi * f * tt) * np.exp(-tt * d) * a for f, d, a in ((2637, 3.0, 1), (3951, 3.8, .55), (5274, 5.5, .3), (2660, 3.0, .5)))
    place(x, b * .9, .1); place(x, b * .6, .2)
    return x

os.makedirs(OUT, exist_ok=True)
for name, fn in [('jackpot', jackpot), ('coins', coins), ('big-ching', big_ching)]:
    write(name, fn())
