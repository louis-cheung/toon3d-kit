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

