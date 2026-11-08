"""Render design/og/og.html to public/og-image.png (1200x630) and the PWA install screenshots.

Usage: pip install playwright && playwright install chromium
       python scripts/render-og.py
"""
from pathlib import Path

from playwright.sync_api import sync_playwright

root = Path(__file__).resolve().parent.parent

with sync_playwright() as p:
    browser = p.chromium.launch()
    page = browser.new_page(viewport={"width": 1200, "height": 630}, device_scale_factor=1)
    page.goto((root / "design" / "og" / "og.html").as_uri())
    page.wait_for_load_state("networkidle")
    page.wait_for_timeout(500)
    page.screenshot(path=str(root / "public" / "og-image.png"))
    browser.close()

print("wrote public/og-image.png")
