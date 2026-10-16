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
      trigger="#se20-manage"
      # A new career begins through the fully interactive main menu.
      await page.locator("#studio19-menu").wait_for(state="visible",timeout=25000)
      await page.locator('[data-menu-action="new"]').click()
      await page.locator('#studio19-new-form [name="studio"]').fill("Mosaic Circuit")
      await page.locator('#studio19-new-form [name="founder"]').fill("Morgan Fox")
      await page.locator('#studio19-new-form button[type="submit"]').click()
      await page.wait_for_function("document.body.dataset.engine==='running' && window.StudioEmpireCareer?.read()?.studio==='Mosaic Circuit' && !!window.StudioEmpireUnifiedUI",timeout=85000)
      nav=".mobile-nav" if width<600 else ".navpanel"
      tests=[("team","team"),("games","projects"),("overview","dashboard")]
      for requested,expected in tests:
        if width<600:
          await page.locator(f'{nav} [data-se20-dest="{requested}"]').click()
        else:
          await page.locator(f'{nav} [data-se20-dest="{requested}"]').click()
        assert await page.locator("#career-hub").is_visible(),f"{requested} did not open career"
        assert await page.locator("body").get_attribute("data-se20-page")==expected,f"{requested} wrong page"
        assert not await page.locator("#sheet-cover").is_visible(),"Legacy read-only panel appeared"
        assert await page.evaluate("window.StudioEmpireUnifiedUI.debug().legacySheetHidden")
        await page.screenshot(path=str(OUT/f"{width}-{requested}.png"),full_page=False)
        await page.locator("#career-close").click()
      await page.locator(trigger).click()
      await page.locator('[data-se20-group="games"]').click()
      await page.locator('[data-se20-page="research"]').click()
      assert await page.locator("#career-body button[data-research]").count()>0,"Research not actually integrated"
      assert not await page.locator("#sheet-cover").is_visible()
      await page.locator("#career-close").click()
      if width<600:
        assert await page.locator('.stage').is_visible(), 'Phone must prioritize the 3D scene'
        cam_height=await page.evaluate('Math.abs(window.StudioEmpire3D.camera.orthoTop-window.StudioEmpire3D.camera.orthoBottom)')
        assert cam_height>16, f'Garage camera must fit projected room width: {cam_height}'
        await page.locator('.mobile-nav [data-se20-dest="games"]').click()
        assert await page.locator('#career-hub').is_visible()
        assert await page.locator("body").get_attribute("data-se20-page")=="projects"
        await page.locator('#career-close').click()
      await page.screenshot(path=str(OUT/f"{width}-office.png"),full_page=False)
      assert await page.evaluate("document.documentElement.scrollWidth<=innerWidth+2"),"Horizontal overflow"
      # A cross-domain backup import must be explicitly approved and preserve saved fields.
      await page.locator(trigger).click()
      assert await page.locator('#v17-import-save').is_visible(), 'Import action missing'
      import_json=await page.evaluate('JSON.stringify(window.StudioEmpireCareer.read())')
      page.once('dialog',lambda dialog:asyncio.create_task(dialog.accept()))
      async with page.expect_navigation(wait_until='domcontentloaded',timeout=85000):
        await page.locator('#v17-import-picker').set_input_files({'name':'career.json','mimeType':'application/json','buffer':import_json.encode()})
      await page.wait_for_function("document.body.dataset.engine==='running' && !!window.StudioEmpireSaveImport",timeout=85000)
      assert await page.evaluate("window.StudioEmpireCareer.read().studio==='Mosaic Circuit'"),'Import corrupted career'
      assert await page.evaluate("!!localStorage.getItem(window.StudioEmpireCareer.BACKUP)"),'Backup missing'
      assert not errors,"; ".join(errors)
      reports.append({"width":width,"engine":"running","nav":tests,"legacyModalHidden":True,"researchButtons":True,"errors":errors})
      await context.close()
    await browser.close()
  (OUT/"report.json").write_text(json.dumps(reports,indent=2))
  print(json.dumps(reports,indent=2))
asyncio.run(run())