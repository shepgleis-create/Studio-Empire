"""Runs against real Babylon.js from existing repository on GitHub Actions.
Never reports a success unless the actual WebGL scene renders and UI actions work.
"""
import asyncio, json, os
from pathlib import Path
from playwright.async_api import async_playwright
URL=os.environ.get('STUDIO_URL','http://127.0.0.1:8765/game3d/')
OUT=Path('game3d/tests/career-browser-proof')
OUT.mkdir(parents=True,exist_ok=True)
async def main():
  results=[]
  async with async_playwright() as p:
    b=await p.chromium.launch(headless=True,args=['--no-sandbox','--use-gl=angle','--use-angle=swiftshader','--enable-webgl','--enable-unsafe-swiftshader'])
    for width,height in [(390,844),(1280,800)]:
      ctx=await b.new_context(viewport={'width':width,'height':height},has_touch=width<600,is_mobile=width<600,device_scale_factor=1)
      page=await ctx.new_page();errors=[]
      page.on('pageerror',lambda e:errors.append(str(e)))
      await page.goto(URL,wait_until='domcontentloaded',timeout=60000)
      await page.wait_for_function("document.body.dataset.engine === 'running' && !!window.StudioEmpireCareer && !!window.StudioEmpireCareerUI",timeout=70000)
      assert await page.evaluate('window.StudioEmpire3D.debug().objectsAreMeshes'), 'Game engine scene did not render physical meshes'
      await page.screenshot(path=str(OUT/f'{width}-3d-office.png'))
      launch='#career-mobile' if width<600 else '#career-open'
      await page.locator(launch).click()
      assert await page.locator('#career-create-form').is_visible(), 'First career setup not shown'
      await page.locator('#career-create-form input[name="studio"]').fill('Mosaic Circuit')
      await page.locator('#career-create-form input[name="founder"]').fill('Morgan Fox')
      await page.locator('#career-create-form button[type="submit"]').click()
      await page.wait_for_function("document.body.dataset.engine === 'running' && !!window.StudioEmpireCareerUI && window.StudioEmpireCareer.read()?.studio==='Mosaic Circuit'",timeout=70000)
      assert await page.evaluate('window.StudioEmpireCareer.read().staff.length')==1
      await page.locator(launch).click()
      await page.locator('[data-career-tab="projects"]').click()
      await page.locator('input[name="name"]').fill('First Star')
      await page.locator('#career-project-form button[type="submit"]').click()
      assert await page.evaluate("window.StudioEmpireCareer.read().project?.name==='First Star'")
      # Test time flow through clickable in-game control, not unit fixture.
      for n in range(28):
        if await page.evaluate('window.StudioEmpireCareer.read().project?.ready'):
          break
        await page.locator('[data-do="advance"]').first.click()
      assert await page.evaluate('window.StudioEmpireCareer.read().project?.ready'), 'Project was not completed'
      await page.locator('[data-do="release"]').first.click()
      await page.wait_for_function("document.body.dataset.engine === 'running' && !!window.StudioEmpireCareerUI && window.StudioEmpireCareer.read()?.games?.length===1",timeout=70000)
      await page.locator(launch).click()
      await page.locator('[data-career-tab="dashboard"]').click()
      await page.screenshot(path=str(OUT/f'{width}-career-management.png'))
      assert await page.evaluate("window.StudioEmpireCareer.read().games[0].name==='First Star'")
      assert await page.evaluate('window.StudioEmpireCareer.read().fans>0')
      assert not errors, '\\n'.join(errors)
      results.append({'viewport':width,'engine':'running','career':'Mosaic Circuit','founder':1,'release':'First Star','jsErrors':errors,'meshes':await page.evaluate('window.StudioEmpire3D.debug().meshes')})
      await ctx.close()
    await b.close()
  (OUT/'test-report.json').write_text(json.dumps(results,indent=2))
  print(json.dumps(results,indent=2))
if __name__=='__main__':asyncio.run(main())
