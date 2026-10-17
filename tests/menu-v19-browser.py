"""Studio Empire v0.19: browser acceptance of the deployed 3D main menu."""
import asyncio,json
from pathlib import Path
from playwright.async_api import async_playwright
OUT=Path("game3d/tests/menu-v19-proof");OUT.mkdir(parents=True,exist_ok=True)
URL="http://127.0.0.1:8765/game3d/"
async def run():
 results=[]
 async with async_playwright() as p:
  browser=await p.chromium.launch(headless=True,args=["--no-sandbox","--use-gl=angle","--use-angle=swiftshader","--enable-webgl","--enable-unsafe-swiftshader"])
  for width,height in [(320,720),(390,844),(1280,800)]:
   ctx=await browser.new_context(viewport={"width":width,"height":height},is_mobile=width<800,has_touch=width<800)
   page=await ctx.new_page();errors=[]
   page.on("pageerror",lambda x:errors.append(str(x)))
   await page.goto(URL,wait_until="domcontentloaded",timeout=60000)
   await page.wait_for_function("!!window.StudioEmpireMainMenu && document.body.dataset.engine==='running'",timeout=90000)
   assert await page.locator("#studio19-menu").is_visible()
   assert await page.locator('[data-menu-action="continue"]').is_disabled()
   assert await page.evaluate("document.documentElement.scrollWidth<=innerWidth+2")
   await page.screenshot(path=str(OUT/f"{width}-real-menu.png"))
   await page.locator('[data-menu-action="settings"]').click()
   await page.locator('#studio19-settings [name="theme"]').select_option("ice")
   await page.locator('#studio19-settings button[type="submit"]').click()
   assert await page.evaluate("document.body.dataset.studio19Theme==='ice'")
   assert await page.evaluate("JSON.parse(localStorage.getItem('studio-empire-visual-settings-v19')).theme==='ice'")
   await page.locator('[data-menu-action="home"]').click()
   await page.locator('[data-menu-action="new"]').click()
   await page.locator('#studio19-new-form [name="studio"]').fill("Orion Atelier")
   await page.locator('#studio19-new-form [name="founder"]').fill("Riley Carter")
   await page.locator('#studio19-new-form button[type="submit"]').click()
   await page.wait_for_function("window.StudioEmpireCareer?.read()?.studio==='Orion Atelier' && !!window.StudioEmpireMainMenu && document.body.dataset.engine==='running'",timeout=90000)
   assert await page.locator("#studio19-menu").is_hidden()
   assert await page.evaluate("window.StudioEmpireCareer.read().staff.length===1")
   await page.locator("#studio19-menu-toggle").click()
   assert await page.locator("#studio19-menu").is_visible()
   assert await page.locator('[data-menu-action="continue"]').is_enabled()
   await page.locator('[data-menu-action="continue"]').click()
   assert await page.locator("#studio19-menu").is_hidden()
   assert not errors,"; ".join(errors)
   results.append({"width":width,"menu":True,"settings":True,"career":True,"continue":True,"noOverflow":True,"errors":errors})
   await ctx.close()
  await browser.close()
 (OUT/"report.json").write_text(json.dumps(results,indent=2));print(json.dumps(results,indent=2))
asyncio.run(run())
