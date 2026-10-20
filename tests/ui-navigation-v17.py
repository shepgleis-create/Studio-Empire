"""Actual 3D browser regression for the Studio Empire v25 replacement management navigation."""
import asyncio,json
from pathlib import Path
from playwright.async_api import async_playwright
URL='http://127.0.0.1:8765/game3d/'
OUT=Path('game3d/tests/ui-v17-actual');OUT.mkdir(parents=True,exist_ok=True)
async def main():
 reports=[]
 async with async_playwright() as p:
  browser=await p.chromium.launch(headless=True,args=['--no-sandbox','--use-gl=angle','--use-angle=swiftshader','--enable-webgl','--enable-unsafe-swiftshader'])
  for width,height in [(390,844),(320,720),(1280,800)]:
   context=await browser.new_context(viewport={'width':width,'height':height},is_mobile=width<600,has_touch=width<600)
   page=await context.new_page();errors=[]
   page.on('pageerror',lambda e:errors.append(str(e)))
   await page.goto(URL,wait_until='domcontentloaded',timeout=60000)
   await page.wait_for_function("document.body.dataset.engine==='running' && !!window.StudioEmpireConsole25 && !!window.StudioEmpireCareerUI",timeout=85000)
   assert await page.evaluate('window.StudioEmpire3D.debug().objectsAreMeshes')
   await page.locator('#studio19-menu').wait_for(state='visible',timeout=25000)
   await page.locator('[data-menu-action="new"]').click()
   await page.locator('#studio19-new-form [name="studio"]').fill('Mosaic Circuit')
   await page.locator('#studio19-new-form [name="founder"]').fill('Morgan Fox')
   await page.locator('#studio19-new-form button[type="submit"]').click()
   await page.wait_for_function("document.body.dataset.engine==='running' && window.StudioEmpireCareer?.read()?.studio==='Mosaic Circuit' && !!window.StudioEmpireConsole25",timeout=85000)
   await page.locator('#se25-open').click()
   assert await page.locator('#se25').is_visible()
   assert await page.evaluate('window.StudioEmpireConsole25.debug().tabs')==20
   for group,page_name in [('people','staff'),('games','create'),('studio','overview'),('business','offices')]:
    await page.locator('#se25-groups [data-group="'+group+'"]').click()
    assert await page.evaluate('window.StudioEmpireConsole25.debug().page')==page_name
    assert not await page.locator('#sheet-cover').is_visible()
    assert not await page.locator('#career-hub').is_visible()
    await page.screenshot(path=str(OUT/f'{width}-{group}.png'))
   await page.locator('#se25-groups [data-group="games"]').click()
   await page.locator('#se25-tabs [data-page="research"]').click()
   assert await page.locator('#se25 .se25-btn[data-act="research"]').count()>0
   await page.locator('#se25-tabs [data-page="franchises"]').click()
   assert await page.locator('#se25').is_visible()
   await page.locator('#se25-groups [data-group="business"]').click()
   for tab in ['rivals','holdings','marketing','equipment','events','loans']:
    await page.locator('#se25-tabs [data-page="'+tab+'"]').click()
    assert await page.evaluate('window.StudioEmpireConsole25.debug().page')==tab
   await page.locator('#se25 .se25-header [data-close="yes"]').click()
   assert not await page.locator('#se25').is_visible()
   if width<600:
    assert await page.locator('.stage').is_visible()
    camera_height=await page.evaluate('Math.abs(window.StudioEmpire3D.camera.orthoTop-window.StudioEmpire3D.camera.orthoBottom)')
    assert camera_height>16
   assert await page.evaluate('document.documentElement.scrollWidth<=innerWidth+2')
   assert not errors,errors
   reports.append({'width':width,'scene':'real WebGL','tabs':20,'groups':4,'oldPanelsHidden':True,'errors':errors})
   await context.close()
  await browser.close()
 (OUT/'report.json').write_text(json.dumps(reports,indent=2))
 print(json.dumps(reports,indent=2))
if __name__=='__main__':asyncio.run(main())
