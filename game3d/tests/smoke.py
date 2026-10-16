"""Offline and CDN-online smoke checks for Babylon Studio Empire 3D prototype.
On machines unable to reach the Babylon CDN the visual WebGL assertion is SKIPPED,
not incorrectly reported as passed. Use URL of Vercel preview for real 3D checks.
Usage: python tests/smoke.py [http://localhost:8000/game3d/]
"""
import asyncio, json, sys, subprocess, time
from pathlib import Path
from playwright.async_api import async_playwright
BASE = Path(__file__).resolve().parents[2]
url = sys.argv[1] if len(sys.argv) > 1 else None
async def run():
    proc=None
    if len(sys.argv)==1:
        # This sandbox blocks loopback HTTP; local assets are inlined in memory.
        root=BASE/'game3d'
        local_html=(root/'index.html').read_text()
        local_html=local_html.replace('<link rel="stylesheet" href="./styles.css">','<style>'+(root/'styles.css').read_text()+'</style>')
        local_html=local_html.replace('<script src="https://cdn.babylonjs.com/babylon.js" defer></script>','<script>/* offline runner: engine unavailable, no WebGL claims */</script>')
        for fn in ('bridge.js','garage.js'):
            local_html=local_html.replace(f'<script src="./{fn}" defer></script>', '<script>'+(root/fn).read_text()+'</script>')
    try:
        async with async_playwright() as p:
            browser=await p.chromium.launch(executable_path='/usr/bin/chromium',headless=True,args=['--no-sandbox','--use-gl=angle','--use-angle=swiftshader','--enable-webgl','--ignore-gpu-blocklist'])
            for width,height in [(320,730),(390,844),(844,390),(1280,800)]:
                ctx=await browser.new_context(viewport={'width':width,'height':height},device_scale_factor=1,is_mobile=width<800,has_touch=width<800)
                page=await ctx.new_page();errors=[];page.on('pageerror',lambda err:errors.append(str(err)))
                if url: await page.goto(url,wait_until='domcontentloaded',timeout=30000)
                else: await page.set_content(local_html,wait_until='domcontentloaded')
                await page.wait_for_timeout(1800)
                state=await page.locator('body').get_attribute('data-engine')
                assert state in ['running','unavailable'],(width,state)
                await page.locator('[data-panel="staff"]:visible').first.click()
                assert not await page.locator('#sheet-cover').evaluate('(e)=>e.hidden')
                assert await page.locator('#sheet-title').inner_text()=='Staff & Skills'
                await page.locator('#sheet-close').click()
                assert await page.locator('#sheet-cover').evaluate('(e)=>e.hidden')
                size=await page.evaluate('({scroll:document.documentElement.scrollWidth,client:document.documentElement.clientWidth})')
                assert size['scroll']<=size['client']+1, size
                # Snapshot import must read 1975 careers and must not write the old key.
                bridge=await page.evaluate("""() => { let writes=0;const s={studio:'Vintage Games',year:1975,cash:41000,office:1,staff:[{id:42,name:'Casey',role:'Developer'}],games:[]};const storage={getItem(){return JSON.stringify(s)},setItem(){writes++}};const v=window.StudioEmpireBridge.snapshot(storage);return {year:v.year,name:v.studio,staff:v.staff.length,writes};}""")
                assert bridge=={'year':1975,'name':'Vintage Games','staff':1,'writes':0},bridge
                if state=='running':
                    debug=await page.evaluate('window.StudioEmpire3D.debug()')
                    assert debug['objectsAreMeshes'] and debug['cameraMode']==1
                    assert debug['meshes']>=80 and len(debug['staff'])>=3
                    assert debug['legacyWrites']==0
                    out=BASE/'game3d'/f'actual-3d-{width}.png'
                    await page.screenshot(path=str(out))
                    print('PASS LIVE 3D',width,height,'scene meshes',debug['meshes'],'staff',len(debug['staff']),'screenshot',out)
                else: print('PASS UI / SKIP 3D (CDN blocked)',width,height)
                assert not errors,errors
                await ctx.close()
            await browser.close()
    finally:
        if proc:proc.terminate();proc.wait()
asyncio.run(run())