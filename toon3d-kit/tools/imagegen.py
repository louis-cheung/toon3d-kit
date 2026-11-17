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

def run(j):
    refs = [(base / r).resolve() for r in J.get('refs', []) + j.get('refs', [])]
    prompt = j['prompt'] + ('\n\n' + J['style'] if J.get('style') else '')
    take = j.get('take', A.take)
    key = hashlib.md5('|'.join([model, prompt, take, j.get('aspect', '')] +
                               [hashlib.md5(r.read_bytes()).hexdigest() for r in refs]).encode()).hexdigest()[:10]
    dst = out / f"{j['name']}{'-t' + take if take else ''}.png"
    stamp = out / f".{j['name']}{'-t' + take if take else ''}.key"
    if dst.exists() and stamp.exists() and stamp.read_text() == key:
        return j['name'], 'cached', 0.0
    if not A.allow_paid:
        return j['name'], 'SKIPPED (needs --allow-paid)', 0.0
    contents = [Image.open(r) for r in refs] + [prompt]
    cfg = types.GenerateContentConfig(response_modalities=['IMAGE'],
                                      image_config=types.ImageConfig(aspect_ratio=j.get('aspect', '1:1')))
    for attempt in range(3):
        try:
            r = client.models.generate_content(model=model, contents=contents, config=cfg)
            for p in r.candidates[0].content.parts:
                if getattr(p, 'inline_data', None) and p.inline_data.data:
                    dst.write_bytes(p.inline_data.data); stamp.write_text(key)
                    return j['name'], 'ok', PRICE.get(model, 0.134)
            return j['name'], 'NO IMAGE: ' + str(r.candidates[0].finish_reason), 0.0
        except Exception as e:
            print(f'  {j["name"]} retry ({type(e).__name__}: {str(e)[:120]})'); time.sleep(5 * (attempt + 1))
    return j['name'], 'FAILED', 0.0

with ThreadPoolExecutor(4) as ex:
    res = list(ex.map(run, jobs))
cf = out / 'cost.json'
cost = json.loads(cf.read_text()) if cf.exists() else {'calls': []}
for n, s, usd in res:
    print(f'{n}: {s}')
    if usd: cost['calls'].append({'name': n, 'model': model, 'usd': usd, 'at': time.strftime('%Y-%m-%d %H:%M')})
cf.write_text(json.dumps(cost, indent=1))
print(f"est ${sum(u for *_, u in res):.2f} this run, ${sum(c['usd'] for c in cost['calls']):.2f} total in {out.name}")
