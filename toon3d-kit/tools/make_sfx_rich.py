"""Rich System Ep 1 v2 sound effects, made from code (no samples, no licences). Deterministic (fixed seeds).
  .venv/bin/python tools/make_sfx_rich.py            # writes audio/sfx/<name>.wav, 44.1 kHz mono 16-bit
  rain        4 s loop of rain on a bus roof and glass (seamless: the tail is crossfaded into the head)
  crunch      metal crunch: a car door torn off (impact, grinding scrape, rattle)
  car-alarm   3 s whooping two-tone car alarm
  engine-roar 2 s diesel bus flooring it (low rumble rising)
  brake-hiss  air-brake release hiss
  jingle      2 s cheap game-show jingle (the SYSTEM's)
  ding        a text-message ding
  door-creak  an apartment door creaking open
  ka-ching    cash-register ka-ching (bell + drawer)
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

def lp(x, a):   # one-pole low-pass, a in (0, 1]: bigger = brighter
    y = np.empty_like(x); s = 0.0
    for i, v in enumerate(x): s += a * (v - s); y[i] = s
    return y
def hp(x, a): return x - lp(x, a)
def env(t, att, dec): return np.minimum(1, t / max(att, 1e-4)) * np.exp(-t * dec)
def tone(f, t, ph=0): return np.sin(2 * np.pi * np.cumsum(np.broadcast_to(f, t.shape)) / SR + ph)

def rain():
    n = int(4.3 * SR); r = rng(1); x = hp(lp(r.uniform(-1, 1, n), .35), .02) * .35   # steady wash
    for _ in range(1400):   # drops: tiny clicky pings at random times
        p = r.integers(0, n - 2000); f = r.uniform(1800, 5200); tt = np.arange(1500) / SR
        x[p:p + 1500] += np.sin(2 * np.pi * f * tt) * np.exp(-tt * r.uniform(250, 600)) * r.uniform(.05, .35)
    L = int(4 * SR); fade = n - L; k = np.linspace(0, 1, fade)
    out = x[:L].copy(); out[:fade] = x[:fade] * k + x[L:] * (1 - k)   # seamless loop
    return out

