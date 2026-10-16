"""Require *real WebGL* Babylon.js rendering and capture browser screenshots.
Unlike offline UI smoke checks, this test fails if CDN/renderer never starts.
Runs on GitHub-hosted Ubuntu with Playwright Chromium installed.
"""
import asyncio,json,sys,time,subprocess
from pathlib import Path
from playwright.async_api import async_playwright
ROOT=Path(__file__).resolve().parents[1]
URL=sys.argv[1] if len(sys.argv)>1 else 'http://127.0.0.1:8765/game3d/'
SIZES=[(390,844),(844,390),(1280,800)]
async def main():
    for js in ('garage.js','office-progression.js','bridge.js'):
        subprocess.run(['node','--check',str(ROOT/js)],check=True)
    report={'url':URL,'results':[]}
    async with async_playwright() as p:
        browser=await p.chromium.launch(headless=True,args=[
            '--no-sandbox','--use-gl=angle','--use-angle=swiftshader',
            '--enable-webgl','--ignore-gpu-blocklist',
        ])
        try:
            for width,height in SIZES:
                context=await browser.new_context(viewport={'width':width,'height':height},device_scale_factor=1,is_mobile=width<900,has_touch=width<900)
                page=await context.new_page();errors=[]
                page.on('pageerror',lambda exc:errors.append(str(exc)))
                started=time.monotonic()
                response=await page.goto(URL,wait_until='load',timeout=45000)
                assert response and response.status==200,('HTTP',response.status if response else None)
                await page.wait_for_function("document.body.dataset.engine === 'running'",timeout=35000)
                ready_ms=round((time.monotonic()-started)*1000)
                debug=await page.evaluate('window.StudioEmpire3D.debug()')
                assert debug['engine']=='Babylon.js' and debug['objectsAreMeshes'] and debug['engineReady'],debug
                assert debug['meshes']>=80 and len(debug['staff'])>=1,debug
                assert await page.evaluate('window.StudioEmpireBridge.snapshot().staff.length >= 1'), 'No founder/employee'
                before=await page.evaluate("({zoom:window.StudioEmpire3D.camera.orthoTop,target:window.StudioEmpire3D.camera.target.x})")
                await page.locator('#zoom-in').click();await page.wait_for_timeout(300)
                after=await page.evaluate("window.StudioEmpire3D.camera.orthoTop")
                assert after<before['zoom'],('zoom control failed',before,after)
                await page.locator('#fit').click()
                viewport=page.locator('#renderCanvas')
                box=await viewport.bounding_box()
                if box:
                    await page.mouse.move(box['x']+box['width']*.47,box['y']+box['height']*.52)
                    await page.mouse.down();await page.mouse.move(box['x']+box['width']*.55,box['y']+box['height']*.58,steps=8);await page.mouse.up()
                await page.wait_for_timeout(1200)
                assert await page.evaluate('Boolean(window.StudioEmpireOffices)'), 'Office progression failed to load'
                tier_results=[]
                for tier in (2,3,4):
                    await page.locator(f'[data-office-tier="{tier}"]').click()
                    await page.wait_for_timeout(500)
                    state=await page.evaluate('window.StudioEmpireOffices.debug()')
                    assert state['tier']==tier and state['previewOnly'] and state['writesToCareer']==0,state
                    assert state['actors']>0 and state['meshes']>debug['meshes'],state
                    shot=ROOT/f'actual-3d-{width}-tier{tier}.png'
                    await page.screenshot(path=str(shot),full_page=True)
                    tier_results.append({'tier':tier,'actors':state['actors'],'meshes':state['meshes']})
                await page.locator('[data-office-tier="1"]').click()
                assert await page.evaluate('window.StudioEmpireOffices.debug().tier===1')
                screenshot=ROOT/f'actual-3d-{width}.png'
                await page.screenshot(path=str(screenshot),full_page=True)
                assert not errors,errors
                report['results'].append({'width':width,'height':height,'real3d':True,'meshes':debug['meshes'],'staff':len(debug['staff']),'ready_ms':ready_ms,'office_tiers':tier_results,'screenshot':str(screenshot.name)})
                await context.close()
            (ROOT/'3d-browser-report.json').write_text(json.dumps(report,indent=2))
            print(json.dumps(report,indent=2))
        finally:
            await browser.close()
if __name__=='__main__': asyncio.run(main())
