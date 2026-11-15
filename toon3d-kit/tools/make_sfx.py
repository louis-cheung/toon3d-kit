"""Generate the BAIT sound effects from code (no samples, no licences): python3 scripts/make_sfx.py
Writes public/sfx/<name>.wav, 44.1 kHz mono 16-bit. Deterministic (fixed seeds), so re-running gives the same files.
  thud     low body hit for a death card            buzzer   flat game-over buzz (the zero-pay death)
  rewind   reverse whoosh that swells into the flash glitch    digital tear for the vanishing comment
  chime    soft stat-gain chime                    stamp    rubber stamp / VALIDATED slam
  clank    chain drop on the roof door             boom     the Gate closing, then a hush
  tick     UI tick for counters and rule lines
"""
import math, random, struct, wave, os
SR = 44100
OUT = os.path.join(os.path.dirname(__file__), '..', 'public', 'sfx')

def write(name, xs):
    peak = max(1e-9, max(abs(x) for x in xs))
    g = 0.89 / peak
    with wave.open(os.path.join(OUT, name + '.wav'), 'wb') as w:
        w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR)
        w.writeframes(b''.join(struct.pack('<h', int(max(-1, min(1, x * g)) * 32767)) for x in xs))

def n(sec): return int(sec * SR)

def lowpass(xs, a):
    y, out = 0.0, []
    for x in xs: y += a * (x - y); out.append(y)
    return out

def noise(sec, seed):
    r = random.Random(seed); return [r.uniform(-1, 1) for _ in range(n(sec))]

def thud():
    xs = []
    for i in range(n(0.7)):
        t = i / SR; f = 38 + 70 * math.exp(-t * 18)
        xs.append(math.sin(2 * math.pi * f * t) * math.exp(-t * 6.5))
    nz = lowpass(noise(0.7, 1), 0.08)
    return [x + 0.5 * z * math.exp(-i / SR * 30) for i, (x, z) in enumerate(zip(xs, nz))]

def buzzer():
    xs = []
    for i in range(n(0.65)):
        t = i / SR; env = min(1, t / 0.01) * (1 if t < 0.55 else max(0, 1 - (t - 0.55) / 0.1))
        s = sum(math.sin(2 * math.pi * 92 * k * t) / k for k in (1, 2, 3, 5))
        xs.append(math.tanh(2.5 * s) * env * 0.7)
    return lowpass(xs, 0.35)

def rewind():
    nz = noise(1.1, 2); xs = []; y = 0
    for i, z in enumerate(nz):
        t = i / SR; p = t / 1.1
        a = 0.02 + 0.5 * p ** 2.2  # filter opens as it swells
        y += a * (z - y)
        tone = math.sin(2 * math.pi * (180 + 900 * p ** 2) * t) * 0.25 * p
        env = p ** 1.6 * (1 if p < 0.97 else (1 - p) / 0.03)
        xs.append((y * 1.4 + tone) * env)
    return xs

def glitch():
    r = random.Random(3); xs = []
    while len(xs) < n(0.45):
        seg = n(r.uniform(0.008, 0.04)); f = r.choice([220, 440, 1320, 2600, 80])
        sq = r.random() < 0.5; z = r.uniform(0.3, 1)
        for i in range(seg):
            t = i / SR; v = math.sin(2 * math.pi * f * t)
            xs.append((1 if v > 0 else -1) * z if sq else r.uniform(-z, z))
    return [x * (1 - i / len(xs)) ** 0.5 for i, x in enumerate(xs)]

def chime():
    xs = []
    for i in range(n(1.2)):
        t = i / SR
        s = sum(math.sin(2 * math.pi * f * t) * math.exp(-t * d) * a for f, d, a in ((1318.5, 3.5, 1), (1975.5, 5, 0.5), (2637, 7, 0.25)))
        xs.append(s * min(1, t / 0.004))
    return xs

def stamp():
    nz = lowpass(noise(0.4, 4), 0.25)
    return [z * math.exp(-i / SR * 28) + math.sin(2 * math.pi * 60 * i / SR) * math.exp(-i / SR * 14) * 0.8 for i, z in enumerate(nz)]

def clank():
    xs = [0.0] * n(1.0); r = random.Random(5)
    for k in range(6):
        st = n(k * 0.11 + r.uniform(0, 0.03)); fs = [r.uniform(900, 3200) for _ in range(4)]
        for i in range(n(0.5)):
            if st + i >= len(xs): break
            t = i / SR
            xs[st + i] += sum(math.sin(2 * math.pi * f * t) for f in fs) * math.exp(-t * 14) * (0.9 - k * 0.12)
    return xs

def boom():
    nz = lowpass(noise(2.4, 6), 0.03); xs = []
    for i, z in enumerate(nz):
        t = i / SR; env = math.exp(-t * 2.2)
        xs.append((math.sin(2 * math.pi * (30 + 40 * math.exp(-t * 4)) * t) + z * 1.5) * env * (1 if t > 0.005 else t / 0.005))
    return xs

def tick():
    return [math.sin(2 * math.pi * 2400 * i / SR) * math.exp(-i / SR * 90) for i in range(n(0.08))]

for name, fn in [('thud', thud), ('buzzer', buzzer), ('rewind', rewind), ('glitch', glitch), ('chime', chime), ('stamp', stamp), ('clank', clank), ('boom', boom), ('tick', tick)]:
    write(name, fn()); print('wrote', name)
