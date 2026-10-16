"""Studio Empire garage smoke tests. Requires: pip install playwright; playwright install chromium"""
import asyncio
import json
from pathlib import Path
from playwright.async_api import async_playwright

ROOT = Path(__file__).resolve().parents[1]
CSS = ["app.css", "studio-theme.css", "empire-ui.css", "office-v08.css"]
SCRIPTS = ["studio-art.js", "studio-world.js", "premium-scene.js",
           "garage-v09.js", "app.js", "office-controls.js"]

async def run():
    html = (ROOT / "index.html").read_text()
    for name in CSS:
        html = html.replace(f'<link rel="stylesheet" href="{name}">',
                            "<style>" + (ROOT / name).read_text() + "</style>")
    for name in SCRIPTS:
        html = html.replace(f'<script src="{name}" defer></script>',
                            "<script>" + (ROOT / name).read_text() + "</script>")

    async with async_playwright() as pw:
        browser = await pw.chromium.launch(headless=True)
        for width, height in [(320, 690), (390, 844), (844, 390), (1280, 800)]:
            context = await browser.new_context(
                viewport={"width": width, "height": height},
                is_mobile=width < 700, has_touch=width < 700)
            page = await context.new_page()
            errors = []
            page.on("pageerror", lambda err: errors.append(str(err)))
            await page.set_content(html, wait_until="load")
            await page.locator("#career-new").click()
            await page.locator("#career-menu-content [name=year]").select_option("1975")
            await page.locator("#career-menu-content [type=submit]").click()
            await page.wait_for_timeout(600)
            info = await page.evaluate("""() => ({
              ready: document.querySelector('#scene').dataset.ready,
              people: PremiumStudio.garageDebug.staff.length,
              bakedPeople: PremiumStudio.garageDebug.staticEmployees,
              props: PremiumStudio.garageManifest.assets.length,
              route: PremiumStudio.garageRoute({x:1,y:3},{x:6,y:4}).length,
              overflow: document.documentElement.scrollWidth>innerWidth
            })""")
            assert not errors, errors
            assert info["ready"] == "true", info
            assert info["people"] == 3 and info["bakedPeople"] == 0, info
            assert info["props"] >= 13 and info["route"] > 0, info
            assert not info["overflow"], info
            if width == 390:
                await page.locator(".mobile-nav [data-panel=studio]").click()
                saved = {"year": 1975, "startYear": 1975, "studio": "Legacy",
                         "cash": 50000, "games": [], "office": 1,
                         "staff": [{"id": 0, "name": "Test", "skill": 45, "salary": 1300}]}
                await page.locator("#save-file-input").set_input_files({
                    "name": "1975.json", "mimeType": "application/json",
                    "buffer": json.dumps(saved).encode("utf-8")})
                await page.wait_for_timeout(250)
                assert "Save imported" in await page.locator("#toast-stack").inner_text()
            print(width, height, "PASS", info)
            await context.close()
        await browser.close()

if __name__ == "__main__":
    asyncio.run(run())
