"""Measure the colour/contrast "premium look" stats of a folder of frames.

Same idea as the claude-animated-shorts repo's grade.py: turn "looks cheap" into
numbers, so STYLE.md can hold targets instead of adjectives.

  .venv/bin/python tools/look_metrics.py <folder-of-jpg-or-png> [--label NAME]
  .venv/bin/python tools/look_metrics.py a/ b/ --label ours --label ref   # compare two folders

Metrics (Rec.709 luma Y' on sRGB-encoded 0..1 values, same convention as the reference study):
  Y' percentiles / mean / std, non-ink Y' p5 (black-point check), ink fraction,
  HSV saturation mean/p50/p90, local contrast (std of Y' minus a 9x9 box blur),
  vignette corner/centre ratio, black point RGB, white point RGB.
"""
import sys, glob, argparse
import numpy as np
from PIL import Image, ImageFilter

def load(path):
    im = Image.open(path).convert('RGB')
    return np.asarray(im).astype(np.float64) / 255.0

def luma(rgb):
    return 0.2126 * rgb[..., 0] + 0.7152 * rgb[..., 1] + 0.0722 * rgb[..., 2]

def local_contrast(y):
    im = Image.fromarray((y * 255).astype(np.uint8))
    blurred = np.asarray(im.filter(ImageFilter.BoxBlur(4))).astype(np.float64) / 255.0
    return float(np.std(y - blurred))

def vignette_ratio(y):
    h, w = y.shape
    yy, xx = np.mgrid[0:h, 0:w]
    cy, cx = (h - 1) / 2, (w - 1) / 2
    r = np.sqrt(((xx - cx) / cx) ** 2 + ((yy - cy) / cy) ** 2) / np.sqrt(2)
    corner = y[r >= 0.9].mean() if (r >= 0.9).any() else float('nan')
    centre = y[r < 0.3].mean() if (r < 0.3).any() else float('nan')
    return float(corner / centre) if centre else float('nan')

def hsv_sat(rgb):
    mx = rgb.max(axis=-1); mn = rgb.min(axis=-1)
    s = np.where(mx > 0, (mx - mn) / np.where(mx == 0, 1, mx), 0)
    return s, mx

def measure_folder(paths):
    ys, sats, lcs, vigs, rgbs = [], [], [], [], []
    for p in paths:
        rgb = load(p)
        y = luma(rgb)
        ys.append(y.ravel())
        s, v = hsv_sat(rgb)
        sats.append(s[v > 0.15].ravel())
        lcs.append(local_contrast(y))
        vigs.append(vignette_ratio(y))
        rgbs.append(rgb.reshape(-1, 3))
    Y = np.concatenate(ys)
    S = np.concatenate(sats)
    RGB = np.concatenate(rgbs)
    Yr = RGB[:, 0] * 0.2126 + RGB[:, 1] * 0.7152 + RGB[:, 2] * 0.0722
    ink = Yr < 0.12
    non_ink = Yr[~ink]
    order = np.argsort(Yr)
    n_dark = max(1, int(0.005 * len(order)))
    black_pt = RGB[order[:n_dark]].mean(axis=0) * 255
    n_light = max(1, int(0.005 * len(order)))
    white_pt = RGB[order[-n_light:]].mean(axis=0) * 255
    pct = lambda a, p: float(np.percentile(a, p))
    return {
        'frames': len(paths),
        "Y' p1": pct(Y, 1), "Y' p5": pct(Y, 5), "Y' p25": pct(Y, 25), "Y' p50": pct(Y, 50),
        "Y' p75": pct(Y, 75), "Y' p95": pct(Y, 95), "Y' p99": pct(Y, 99),
        "Y' mean": float(Y.mean()), "Y' std": float(Y.std()),
        'non-ink Y\' p5': float(np.percentile(non_ink, 5)) if len(non_ink) else float('nan'),
        'ink fraction': float(ink.mean()),
        'HSV S mean': float(S.mean()), 'HSV S p50': pct(S, 50), 'HSV S p90': pct(S, 90),
        'local contrast': float(np.mean(lcs)),
        'vignette corner/centre': float(np.mean(vigs)),
        'black point RGB': tuple(round(x, 1) for x in black_pt),
        'white point RGB': tuple(round(x, 1) for x in white_pt),
    }

def main():
    a = argparse.ArgumentParser()
    a.add_argument('folders', nargs='+')
    a.add_argument('--label', action='append', default=[])
    A = a.parse_args()
    labels = A.label + [f'set{i}' for i in range(len(A.label), len(A.folders))]
    results = {}
    for folder, label in zip(A.folders, labels):
        paths = sorted(glob.glob(folder.rstrip('/') + '/*.png') + glob.glob(folder.rstrip('/') + '/*.jpg'))
        if not paths:
            print(f'{label}: no images found in {folder}', file=sys.stderr); continue
        results[label] = measure_folder(paths)
    keys = list(next(iter(results.values())).keys())
    width = max(len(k) for k in keys)
    header = ' '.join(f'{l:>22}' for l in results)
    print(f'{"metric":<{width}} {header}')
    for k in keys:
        row = ' '.join(f'{str(results[l][k]):>22}' for l in results)
        print(f'{k:<{width}} {row}')

if __name__ == '__main__':
    main()
