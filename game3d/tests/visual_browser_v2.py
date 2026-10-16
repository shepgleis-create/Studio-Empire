"""Capture proof from the actual running Babylon.js room on a browser with WebGL and CDN access.
This is not a substitute for testing Safari on a physical iPhone.
"""
import os
from pathlib import Path
from playwright.sync_api import sync_playwright
url=os.environ.get('STUDIO_3D_URL','http://127.0.0.1:8765/game3d/')
proof=Path('game3d/tests/actual-proof');proof.mkdir(parents=True,exist_ok=True)
with sync_playwright() as p:
  browser=p.chromium.launch(headless=True,args=['--no-sandbox','--use-gl=angle','--use-angle=swiftshader','--enable-webgl','--ignore-gpu-blocklist'])
  for w,h,dpr,label in [(390,844,2,'phone-portrait'),(844,390,1,'landscape'),(1280,800,1,'desktop')]:
    context=browser.new_context(viewport={'width':w,'height':h},device_scale_factor=dpr,is_mobile=w<900,has_touch=w<900)
    page=context.new_page();errors=[]
    page.on('pageerror',lambda e: errors.append(str(e)))
    page.goto(url,wait_until='domcontentloaded',timeout=45000)
    page.wait_for_function("document.body.dataset.engine==='running'||document.body.dataset.engine==='unavailable'",timeout=60000)
    assert page.evaluate('document.body.dataset.engine')=='running',f'{label} Babylon did not load'
    page.wait_for_timeout(1400)
    d=page.evaluate('window.StudioEmpireGarageV2.debug()')
    assert d['doorOpening'] and d['wallNoLongerObstructing'] and d['physicalProps'],d
    assert d['cameraAlpha']>0 and d['hardwareScaling']<=1.01,d
    assert d['meshCount']>120,d
    assert not errors,errors
    path=proof/(label+'.png');page.screenshot(path=str(path),full_page=True)
    print('PASS ACTUAL WEBGL',label,d['renderPixels'],d['meshCount'],path)
    context.close()
  browser.close()
