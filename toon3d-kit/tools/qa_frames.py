"""Automated frame QA, the way claude-animated-shorts' short_qa.py does it: scan every rendered
frame for the things a still-sheet eyeball check misses, instead of trusting that stills_sheet.jpg
looked fine on 4-8 sampled frames.

  .venv/bin/python tools/qa_frames.py episodes/<slug>/render [--audio episodes/<slug>/voice/mix.wav] [--fps 30]

Reads <render>/frames/f*.jpg (render.py's own frame dump -- no re-encode needed). Flags:
  - black / white frames      mean luma outside [0.02, 0.98]
  - frozen spans              >= 12 consecutive frames with near-zero motion (STYLE.md: "every shot moves";
                               a flat hold reads as a freeze -- this is the same frozen-span rule the repo's
                               short_qa.py and SKILL.md's "Readability traps" call out)
  - pop frames                one frame far from both neighbours (a single bad/glitched frame)
  - clipped audio / too quiet mix.wav peak and RMS, if given

Frames are checked at a small downsample (64x114) for speed -- this is a motion/exposure scan, not a
pixel-perfect compare.
"""
import sys, glob, argparse
import numpy as np
from PIL import Image

DOWN = (64, 114)  # w, h

def load_small(path):
    im = Image.open(path).convert('RGB')
    im.draft('RGB', DOWN)
    im = im.resize(DOWN)
    return np.asarray(im).astype(np.float64) / 255.0

def luma(rgb):
    return 0.2126 * rgb[..., 0] + 0.7152 * rgb[..., 1] + 0.0722 * rgb[..., 2]

def main():
    a = argparse.ArgumentParser()
    a.add_argument('render_dir')
    a.add_argument('--audio')
    a.add_argument('--fps', type=float, default=30)
    a.add_argument('--frozen-frames', type=int, default=12, help='consecutive near-still frames to flag (default 12, matches the bridge QA threshold)')
    a.add_argument('--frozen-thresh', type=float, default=0.004, help='mean abs luma diff below this counts as "no motion"')
    a.add_argument('--pop-thresh', type=float, default=0.12, help='mean abs luma diff above this vs both neighbours flags a pop frame')
    A = a.parse_args()

    paths = sorted(glob.glob(A.render_dir.rstrip('/') + '/frames/f*.jpg'))
    if not paths:
        print(f'no frames found under {A.render_dir}/frames/'); sys.exit(1)
    print(f'scanning {len(paths)} frames ...')

    frames_small = [load_small(p) for p in paths]
    ys = np.array([luma(f).mean() for f in frames_small])

    issues = []
    for i, y in enumerate(ys):
        if y < 0.02: issues.append((i, 'black frame', f'luma {y:.3f}'))
        elif y > 0.98: issues.append((i, 'white frame', f'luma {y:.3f}'))

    # per-pixel RGB diff (not just mean luma) so a blink or a small head/camera move still counts as motion
    diffs = np.array([np.abs(frames_small[i + 1] - frames_small[i]).mean() for i in range(len(frames_small) - 1)])
    run_start = None
    for i in range(len(diffs)):
        still = diffs[i] < A.frozen_thresh
        if still and run_start is None: run_start = i
        if (not still or i == len(diffs) - 1) and run_start is not None:
            run_len = i - run_start + (0 if still else 0) + 1
            if run_len >= A.frozen_frames:
                issues.append((run_start, 'frozen span', f'{run_len} frames (~{run_len / A.fps:.1f}s) with no motion'))
            run_start = None

    # A real pop/glitch frame differs from both neighbours, but ITS neighbours look like a continuous
    # sequence without it (skip-diff small) -- this is what tells it apart from an intentional whip/cut,
    # where the frames before and after the cut are genuinely different from each other too.
    for i in range(1, len(diffs)):
        d_prev, d_next = diffs[i - 1], diffs[i]
        d_skip = np.abs(frames_small[i + 1] - frames_small[i - 1]).mean()
        if d_prev > A.pop_thresh and d_next > A.pop_thresh and d_skip < A.pop_thresh * 0.5:
            issues.append((i, 'pop frame', f'diff {d_prev:.3f} / {d_next:.3f} from neighbours, skip-diff {d_skip:.3f}'))

    if A.audio:
        import soundfile as sf
        wav, sr = sf.read(A.audio)
        mono = wav.mean(axis=1) if wav.ndim > 1 else wav
        peak = float(np.abs(mono).max())
        rms = float(np.sqrt(np.mean(mono ** 2)))
        if peak >= 0.999: issues.append(('audio', 'clipped', f'peak {peak:.3f}'))
        if rms < 0.02: issues.append(('audio', 'too quiet', f'rms {rms:.4f}'))
        print(f'audio: peak {peak:.3f}, rms {rms:.4f}' + (f' ({20*np.log10(rms):.1f} dBFS)' if rms > 0 else ''))

    if not issues:
        print(f'clean: {len(paths)} frames, no black/white/frozen/pop frames flagged.')
        return
    print(f'{len(issues)} issue(s):')
    for frame, kind, detail in issues:
        where = f'frame {frame:05d}' if isinstance(frame, int) else frame
        print(f'  {where:<16} {kind:<14} {detail}')
    sys.exit(1)

if __name__ == '__main__':
    main()
