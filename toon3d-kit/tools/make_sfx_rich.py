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

def crunch():
    t = T(1.4); r = rng(2)
    hit = r.uniform(-1, 1, len(t)) * env(t, .002, 18)
    body = lp(r.uniform(-1, 1, len(t)), .08) * env(t, .003, 7) * 2
    scrape = hp(r.uniform(-1, 1, len(t)), .3) * (1 + .8 * np.sin(2 * np.pi * 31 * t)) * np.exp(-((t - .35) / .3) ** 2) * .9
    ring = sum(np.sin(2 * np.pi * f * t) * np.exp(-t * d) for f, d in ((523, 6), (1187, 8), (1830, 10), (2770, 12))) * .25
    rattle = np.zeros_like(t)
    for k in range(7):
        p = int((.55 + k * .09 + r.uniform(0, .04)) * SR); tt = np.arange(3000) / SR
        if p + 3000 < len(t): rattle[p:p + 3000] += np.sin(2 * np.pi * r.uniform(900, 2500) * tt) * np.exp(-tt * 60) * (.5 - k * .06)
    return np.tanh(1.6 * (hit + body + scrape + ring * env(t, .001, 2) + rattle))

def car_alarm():
    t = T(3.0); f = 900 + 500 * (np.sin(2 * np.pi * 2.0 * t) > 0)   # two-tone, 4 switches a second
    f = f + 120 * np.sin(2 * np.pi * 9 * t)
    s = np.sign(np.sin(2 * np.pi * np.cumsum(f) / SR)); x = lp(s, .25) * np.minimum(1, t / .02) * np.minimum(1, (3 - t) / .05)
    return x

def engine_roar():
    t = T(2.0); r = rng(3); rev = 38 + 55 * (1 - np.exp(-t * 1.6))
    x = sum(np.sin(2 * np.pi * np.cumsum(rev * k) / SR) / k for k in (1, 2, 3, 4, 6))
    x = np.tanh(2.2 * x) + lp(r.uniform(-1, 1, len(t)), .05) * 1.5 * (.4 + .6 * t / 2)
    return lp(x, .2) * np.minimum(1, t / .08) * np.minimum(1, (2 - t) / .15)

def brake_hiss():
    t = T(1.3); r = rng(4); x = hp(r.uniform(-1, 1, len(t)), .15)
    return x * np.minimum(1, t / .015) * np.exp(-t * 2.4) * (1 + .3 * np.sin(2 * np.pi * 7 * t)) + np.sin(2 * np.pi * 70 * t) * env(t, .002, 30) * .5

def jingle():
    notes = [(523.3, .0, .16), (659.3, .16, .16), (784.0, .32, .16), (1046.5, .48, .3), (880.0, .82, .14), (1046.5, .98, .14), (1318.5, 1.14, .62)]
    x = np.zeros(int(2.0 * SR))
    for f, st, d in notes:
        tt = np.arange(int((d + .25) * SR)) / SR; v = (np.sign(np.sin(2 * np.pi * f * tt)) * .45 + np.sin(2 * np.pi * f * 2 * tt) * .3 + np.sin(2 * np.pi * f * tt * 1.007) * .5)
        v *= np.minimum(1, tt / .005) * np.exp(-tt * (5 if d > .5 else 9)) * (1 + .15 * np.sin(2 * np.pi * 6 * tt))
        p = int(st * SR); x[p:p + len(v)] += v[:len(x) - p]
    return lp(x, .4)

def ding():
    t = T(.9); return sum(np.sin(2 * np.pi * f * t) * np.exp(-t * d) * a for f, d, a in ((1568, 5, 1), (2093, 6, .6), (3136, 9, .25))) * np.minimum(1, t / .003)

def door_creak():
    t = T(1.6); f = 180 + 140 * np.sin(np.pi * t / 1.6) + 30 * np.sin(2 * np.pi * 1.3 * t)
    pulses = (np.sin(2 * np.pi * np.cumsum(f) / SR) > .93).astype(float)   # stick-slip: a buzzy train of clicks
    x = lp(pulses - pulses.mean(), .5) + .3 * lp(rng(5).uniform(-1, 1, len(t)), .1)
    return x * np.sin(np.pi * np.minimum(1, t / 1.6)) ** .6

def ka_ching():
    t = T(1.3); r = rng(6)
    ka = lp(r.uniform(-1, 1, len(t)), .6) * env(t, .001, 70) + np.sin(2 * np.pi * 140 * t) * env(t, .001, 40) * .6   # drawer clunk
    p = int(.12 * SR); tt = t[:len(t) - p]
    bell = sum(np.sin(2 * np.pi * f * tt) * np.exp(-tt * d) * a for f, d, a in ((2637, 3.2, 1), (3951, 4, .55), (5274, 6, .3), (2660, 3.2, .5)))
    x = ka.copy(); x[p:] += bell * .9
    return x

os.makedirs(OUT, exist_ok=True)
for name, fn in [('rain', rain), ('crunch', crunch), ('car-alarm', car_alarm), ('engine-roar', engine_roar), ('brake-hiss', brake_hiss), ('jingle', jingle), ('ding', ding), ('door-creak', door_creak), ('ka-ching', ka_ching)]:
    write(name, fn())
