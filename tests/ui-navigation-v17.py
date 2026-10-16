"""Studio Empire 0.17 — real WebGL browser regression for previously duplicated mobile panels."""
import asyncio, json
from pathlib import Path
from playwright.async_api import async_playwright
URL="http://127.0.0.1:8765/game3d/"
OUT=Path("game3d/tests/ui-v17-actual")
OUT.mkdir(parents=True,exist_ok=True)
async def run():
  reports=[]
  async with async_playwright() as p:
    browser=await p.chromium.launch(headless=True,args=["--no-sandbox","--use-gl=angle","--use-angle=swiftshader","--enable-webgl","--enable-unsafe-swiftshader"])
    for width,height in [(390,844),(320,720),(1280,800)]:
      context=await browser.new_context(viewport={"width":width,"height":height},is_mobile=width<600,has_touch=width<600)
      page=await context.new_page()
      errors=[]
      page.on("pageerror",lambda err:errors.append(str(err)))
      await page.goto(URL,wait_until="domcontentloaded",timeout=60000)
      await page.wait_for_function("document.body.dataset.engine==='running' && !!window.StudioEmpireCareerUI && !!window.StudioEmpireUnifiedUI",timeout=85000)
      assert await page.evaluate("window.StudioEmpire3D.debug().objectsAreMeshes"),"3D must render real meshes"
      # Create a career when this browser profile has no local save.
      trigger="#career-mobile" if width<600 else "#career-open"
      await page.locator(trigger).click()
      if await page.locator("#career-create-form").count():
        await page.locator('#career-create-form [name="studio"]').fill("Mosaic Circuit")
        await page.locator('#career-create-form [name="founder"]').fill("Morgan Fox")
        await page.locator('#career-create-form button[type="submit"]').click()
        await page.wait_for_function("document.body.dataset.engine==='running' && window.StudioEmpireCareer?.read()?.studio==='Mosaic Circuit' && !!window.StudioEmpireUnifiedUI",timeout=85000)
      else:
        await page.locator("#career-close").click()
      nav=".mobile-nav" if width<600 else ".navpanel"
      tests=[("staff","team"),("projects","projects"),("finances","dashboard")]
      for requested,expected in tests:
        await page.locator(f'{nav} [data-panel="{requested}"]').click()
        assert await page.locator("#career-hub").is_visible(),f"{requested} did not open career"
        assert await page.locator(f'[data-career-tab="{expected}"]').get_attribute("class") and "active" in (await page.locator(f'[data-career-tab="{expected}"]').get_attribute("class")),f"{requested} wrong page"
        assert not await page.locator("#sheet-cover").is_visible(),"Legacy read-only panel appeared"
        assert await page.evaluate("window.StudioEmpireUnifiedUI.debug().legacySheetHidden")
        await page.screenshot(path=str(OUT/f"{width}-{requested}.png"),full_page=False)
        await page.locator("#career-close").click()
      await page.locator(trigger).click()
      await page.locator('[data-career-tab="research"]').click()
      assert await page.locator("#career-body button[data-research]").count()>0,"Research not actually integrated"
      assert not await page.locator("#sheet-cover").is_visible()
      await page.locator("#career-close").click()
      await page.screenshot(path=str(OUT/f"{width}-office.png"),full_page=False)
      assert await page.evaluate("document.documentElement.scrollWidth<=innerWidth+2"),"Horizontal overflow"
      assert not errors,"; ".join(errors)
      reports.append({"width":width,"engine":"running","nav":tests,"legacyModalHidden":True,"researchButtons":True,"errors":errors})
      await context.close()
    await browser.close()
  (OUT/"report.json").write_text(json.dumps(reports,indent=2))
  print(json.dumps(reports,indent=2))
asyncio.run(run())