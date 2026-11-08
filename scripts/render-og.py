"""Render design/og/og.html to public/og-image.png (1200x630).

Usage: pip install playwright && playwright install chromium
       python scripts/render-og.py            # renders the default variant into public/og-image.png
       python scripts/render-og.py 1 2 3 4    # renders design/og/og-variant-N.png for comparison
"""
import sys
from pathlib import Path

from playwright.sync_api import sync_playwright

root = Path(__file__).resolve().parent.parent
src = (root / "design" / "og" / "og.html").as_uri()
variants = sys.argv[1:]

with sync_playwright() as p:
    browser = p.chromium.launch()
    page = browser.new_page(viewport={"width": 1200, "height": 630}, device_scale_factor=1)
    targets = [(v, root / "design" / "og" / f"og-variant-{v}.png") for v in variants] or [(None, root / "public" / "og-image.png")]
    for v, out in targets:
        page.goto(src + (f"#{v}" if v else ""))
        page.reload()  # hash-only navigation doesn't re-run the page script
        page.wait_for_load_state("networkidle")
        page.wait_for_timeout(500)
        page.screenshot(path=str(out))
        print("wrote", out.relative_to(root))
    browser.close()
