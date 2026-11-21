"""Find assets for a scene without reading ASSETS.md (RULES.md P5).

Usage (from toon3d-kit/):
    .venv/bin/python tools/find_asset.py ring
    .venv/bin/python tools/find_asset.py "fancy restaurant" phone receipt
    .venv/bin/python tools/find_asset.py --kind set beach

Each argument is one thing the script needs; words inside quotes are searched together. It scores every catalog
entry (assets/catalog.json) on name, aliases, tags and description, and prints the best hits with the line in
ASSETS.md where the full entry lives, so only those lines need reading. No hit means it has to be built: ask Louis
for a reference first if it is a new kind of asset.
"""
import argparse
import json
import re
from pathlib import Path

KIT = Path(__file__).resolve().parent.parent
CATALOG = KIT / "assets" / "catalog.json"
ASSETS_MD = KIT / "ASSETS.md"

