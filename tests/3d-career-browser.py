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
      launch='.mobile-nav [data-se20-dest="games"]' if width<600 else '.se20-side-link[data-se20-dest="games"]'
      # New careers begin at the real main menu (not an obsolete overlay).
      await page.locator('#studio19-menu').wait_for(state='visible',timeout=25000)
      await page.locator('[data-menu-action="new"]').click()
      await page.locator('#studio19-new-form [name="studio"]').fill('Mosaic Circuit')
      await page.locator('#studio19-new-form [name="founder"]').fill('Morgan Fox')
      await page.locator('#studio19-new-form button[type="submit"]').click()
      await page.wait_for_function("document.body.dataset.engine === 'running' && !!window.StudioEmpireCareerUI && window.StudioEmpireCareer.read()?.studio==='Mosaic Circuit'",timeout=70000)
      assert await page.evaluate('window.StudioEmpireCareer.read().staff.length')==1
      await page.locator(launch).click()
      assert await page.locator('#career-hub').is_visible()
      assert await page.locator('body').get_attribute('data-se20-page')=='projects'
      await page.locator('input[name="name"]').fill('First Star')
      await page.locator('#career-project-form button[type="submit"]').click()
      assert await page.evaluate("window.StudioEmpireCareer.read().project?.name==='First Star'")
      # Verify the actual continuous game clock, not removed click-to-advance controls.
      await page.locator('.mobile-nav [data-se20-dest="office"]' if width<600 else '.se20-side-link[data-se20-dest="office"]').click()
      before_day=await page.evaluate('window.StudioEmpireCareer.read().dailySerial || 0')
      await page.locator('#se21-timebar [data-se21-speed="8"]').click()
      await page.wait_for_function('(before) => (window.StudioEmpireCareer.read()?.dailySerial||0)>before+2',arg=before_day,timeout=25000)
      await page.wait_for_function("window.StudioEmpireCareer.read()?.games?.some(g=>g.name==='First Star')",timeout=70000)
      await page.locator('#se21-toggle').click()
      frozen=await page.evaluate('window.StudioEmpireCareer.read().dailySerial')
      await page.wait_for_timeout(550)
      assert await page.evaluate('window.StudioEmpireCareer.read().dailySerial')==frozen,'Paused clock progressed'
      # No page reload or click required to publish with default auto-publish enabled.
      await page.locator(launch).click()
      await page.locator('[data-se20-group="overview"]').click()
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
