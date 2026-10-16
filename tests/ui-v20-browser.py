"""Real Studio Empire v0.20 navigation regression, using the running Babylon.js branch."""
import asyncio,json
from pathlib import Path
from playwright.async_api import async_playwright
BASE='http://127.0.0.1:8765/game3d/'
OUT=Path('verified/ui-v20');OUT.mkdir(parents=True,exist_ok=True)
async def main():
 results=[]
 async with async_playwright() as p:
  browser=await p.chromium.launch(headless=True,args=['--no-sandbox','--use-gl=angle','--use-angle=swiftshader','--enable-webgl','--enable-unsafe-swiftshader'])
  for w,h in [(320,700),(390,844),(1280,800)]:
   ctx=await browser.new_context(viewport={'width':w,'height':h},is_mobile=w<800,has_touch=w<800)
   page=await ctx.new_page();errors=[];page.on('pageerror',lambda e:errors.append(str(e)))
   await page.goto(BASE,wait_until='domcontentloaded',timeout=60000)
   await page.wait_for_function("() => window.StudioEmpireNavigation20 && window.StudioEmpire3D && document.body.dataset.engine==='running'",timeout=90000)
   assert await page.locator('#studio19-menu').is_visible()
   await page.evaluate("() => { const r=StudioEmpireCareer.createCareer({studio:'Pioneer Lab',founder:'Alex Morgan',year:1975,difficulty:'standard'}); if(!r.ok)throw Error(r.reason) }")
   await page.goto(BASE+'?play=1',wait_until='domcontentloaded',timeout=60000)
   await page.wait_for_function("() => window.StudioEmpireNavigation20 && window.StudioEmpire3D && document.body.dataset.engine==='running'",timeout=90000)
   assert await page.locator('#studio19-menu').is_hidden()
   assert await page.locator('.se20-categories button').count()==4
   assert await page.locator('.career-tabs.se20-old-tabs').count()==1
   await page.evaluate("StudioEmpireNavigation20.openGroup('games')")
   assert await page.locator('#career-hub').is_visible()
   await page.locator('[data-se20-page=catalog]').click()
   assert await page.locator('#empire-v18-content').is_visible()
   await page.locator('[data-se20-page=research]').click()
   assert await page.locator('#career-body').is_visible()
   await page.locator('[data-se20-group=team]').click()
   assert await page.locator('body').get_attribute('data-se20-page')=='team'
   if w==390:await page.screenshot(path=str(OUT/'390-team.png'))
   await page.locator('[data-se20-page=training]').click()
   assert await page.locator('#empire-v18-content').is_visible()
   await page.locator('[data-se20-group=business]').click()
   await page.locator('[data-se20-page=rivals]').click()
   assert await page.locator('#empire18-search').is_visible()
   assert await page.locator('.empire18-company').count()==16
   if w==390:await page.screenshot(path=str(OUT/'390-business.png'))
   await page.locator('[data-se20-group=overview]').click()
   assert await page.locator('#career-body').is_visible()
   if w==390:await page.screenshot(path=str(OUT/'390-overview.png'))
   await page.keyboard.press('Escape')
   assert await page.locator('#career-hub').is_hidden()
   if w==390:await page.screenshot(path=str(OUT/'390-office.png'))
   if w==1280:await page.screenshot(path=str(OUT/'1280-office.png'))
   overflow=await page.evaluate('document.documentElement.scrollWidth-document.documentElement.clientWidth')
   assert overflow<=2,f'Horizontal overflow {w}: {overflow}'
   assert not errors,errors
   results.append({'width':w,'webgl':True,'tabs':4,'overflow':overflow,'errors':errors,'meshCount':await page.evaluate('StudioEmpire3D.debug().meshes')})
   await ctx.close()
  await browser.close()
 (OUT/'report.json').write_text(json.dumps(results,indent=2));print(json.dumps(results,indent=2))
asyncio.run(main())
