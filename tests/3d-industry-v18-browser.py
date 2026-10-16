"""Real Chromium/WebGL smoke test for v0.18 (not a mock scene or generated concept art)."""
import asyncio,json,os
from pathlib import Path
from playwright.async_api import async_playwright
URL=os.getenv('STUDIO_URL','http://127.0.0.1:8765/game3d/')
OUT=Path('game3d/tests/industry-v18-proof');OUT.mkdir(parents=True,exist_ok=True)
async def main():
 results=[]
 async with async_playwright() as p:
  browser=await p.chromium.launch(headless=True,args=['--no-sandbox','--use-gl=angle','--use-angle=swiftshader','--enable-webgl','--enable-unsafe-swiftshader'])
  for w,h in [(390,844),(1280,800)]:
   context=await browser.new_context(viewport={'width':w,'height':h},has_touch=w<600,is_mobile=w<600)
   page=await context.new_page();errors=[];page.on('pageerror',lambda e:errors.append(str(e)))
   await page.goto(URL,wait_until='domcontentloaded',timeout=60000)
   await page.wait_for_function("document.body.dataset.engine==='running' && !!window.StudioEmpireIndustryUI && !!window.StudioEmpire3D",timeout=70000)
   assert await page.evaluate('StudioEmpire3D.debug().objectsAreMeshes'), 'Missing actual Babylon.js meshes'
   await page.evaluate("""() => {const r=StudioEmpireCareer.createCareer({studio:'Arbor Interactive',founder:'Jordan',year:1980,difficulty:'standard'});if(!r.ok)throw Error(JSON.stringify(r));}""")
   await page.locator('.empire18-entry').click()
   assert await page.locator('.empire18-company').count()==16,'AI companies unavailable'
   await page.screenshot(path=str(OUT/f'{w}-industry-real-3d.png'))
   await page.locator('[data-empire-tab="promotion"]').click()
   await page.locator('[data-industry-action="campaign"][data-id="community"]').click()
   assert await page.evaluate('StudioEmpireCareer.read().fans')==40
   await page.locator('[data-empire-tab="training"]').click()
   await page.locator('[data-industry-action="train"]').first.click()
   assert await page.evaluate('StudioEmpireCareer.read().staff[0].skill')==63
   await page.locator('[data-career-tab="dashboard"]').click()
   await page.locator('[data-do="advance"]').first.click()
   assert await page.evaluate('StudioEmpireCareer.read().industryWeek')==1
   await page.locator('[data-empire-tab="rivals"]').click()
   await page.locator('#empire18-search').fill('Northstar')
   assert await page.locator('.empire18-company').count()==1
   await page.locator('#empire18-search').fill('')
   overflow=await page.evaluate('document.documentElement.scrollWidth-document.documentElement.clientWidth')
   assert overflow<5,f'Unexpected horizontal overflow: {overflow}'
   assert not errors, '\\n'.join(errors)
   results.append({'viewport':w,'real3dMeshes':await page.evaluate('StudioEmpire3D.debug().meshes'),'companies':16,'savedFans':40,'week':1,'errors':errors})
   await context.close()
  await browser.close()
 (OUT/'report.json').write_text(json.dumps(results,indent=2))
 print(json.dumps(results,indent=2))
if __name__=='__main__':asyncio.run(main())
