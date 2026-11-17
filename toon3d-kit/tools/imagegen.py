"""Generate character art with Gemini image models, using reference images to keep faces locked.

  .venv/bin/python tools/imagegen.py <jobs.json> --allow-paid [--only name1,name2] [--take 2]

jobs.json:
  {"model": "gemini-3-pro-image", "out": "assets/rich-system/gen", "refs": ["path/to/sheet.jpg"],
   "style": "text appended to every prompt",
   "jobs": [{"name": "ethan-expr", "prompt": "...", "aspect": "16:9", "refs": ["extra.jpg"]}]}

Paths are relative to the jobs file. Results are cached by (model, prompt, refs, take): an unchanged job
never re-bills. Paid calls need --allow-paid. Gemini key: GEMINI_API_KEY from toon3d-kit/.env (never
printed). Cost estimates go to <out>/cost.json. Prices are estimates, not billing data.
"""
import argparse, hashlib, json, os, pathlib, sys, time
from concurrent.futures import ThreadPoolExecutor

ROOT = pathlib.Path(__file__).resolve().parent.parent
# Approximate USD per output image (1K-2K). Check Google's pricing page before trusting these.
PRICE = {'gemini-3-pro-image': 0.134, 'gemini-3-pro-image-preview': 0.134,
         'gemini-3.1-flash-image': 0.045, 'gemini-2.5-flash-image': 0.039}

A = argparse.ArgumentParser()
A.add_argument('jobs'); A.add_argument('--allow-paid', action='store_true')
A.add_argument('--only', default=''); A.add_argument('--take', default='')
A = A.parse_args()

jf = pathlib.Path(A.jobs).resolve(); base = jf.parent
J = json.loads(jf.read_text())
model = J.get('model', 'gemini-3-pro-image')
out = (base / J['out']).resolve(); out.mkdir(parents=True, exist_ok=True)
only = set(filter(None, A.only.split(',')))
jobs = [j for j in J['jobs'] if not only or j['name'] in only]

envf = ROOT / '.env'
if envf.exists():
    for ln in envf.read_text().splitlines():
        if '=' in ln and not ln.strip().startswith('#'):
            k, v = ln.split('=', 1); os.environ.setdefault(k.strip(), v.strip().strip('"\''))
from google import genai
from google.genai import types
from PIL import Image
client = genai.Client(api_key=os.environ['GEMINI_API_KEY'])

