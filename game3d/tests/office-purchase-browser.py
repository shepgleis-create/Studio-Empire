"""Real WebGL / saved-career purchase verification. Screenshots are from Chromium, not concept images."""
from pathlib import Path
from playwright.sync_api import sync_playwright
import json
root=Path(__file__).resolve().parents[2]
url='http://127.0.0.1:8765/game3d/'
out=Path(__file__).parent/'office-proof';out.mkdir(exist_ok=True)
def fixture(office,staff,cash,year,games,fans,rep):
 return {'studio':'Studio Empire QA','founder':'Founder','year':year,'month':4,'week':2,'office':office,'officeVersion':2,
 'cash':cash,'staff':[{'id':i+1,'name':f'Employee {i+1}','role':'Programmer','energy':90} for i in range(staff)],
 'games':[{'title':f'Game {i}'} for i in range(games)],'fans':fans,'rep':rep,'rp':40,
 'history':[],'officeHistory':[],'totalSpent':0,'yearlyProfit':0}
with sync_playwright() as p:
 browser=p.chromium.launch(headless=True,args=['--no-sandbox','--use-gl=angle','--use-angle=swiftshader','--enable-webgl','--ignore-gpu-blocklist'])
 def new_page(w,h,save=None):
  ctx=browser.new_context(viewport={'width':w,'height':h},device_scale_factor=1,is_mobile=w<=844,has_touch=w<=844)
  page=ctx.new_page()
  if save:
   payload=json.dumps(save)
   page.add_init_script('if(!localStorage.getItem("studio-empire-reboot-v1")) localStorage.setItem("studio-empire-reboot-v1", '+json.dumps(payload)+')')
  errors=[]
  page.on('pageerror',lambda e:errors.append(str(e)))
  page.goto(url,wait_until='domcontentloaded',timeout=60000)
  page.wait_for_function("document.body.dataset.engine==='running' || document.body.dataset.engine==='unavailable'",timeout=60000)
  assert page.evaluate("document.body.dataset.engine")=='running',f'Babylon engine failed: {errors}'
  page.wait_for_function('!!window.StudioEmpireOfficeEconomy && !!window.StudioEmpireOffices',timeout=15000)
  return ctx,page,errors
 # No-career demo: single founder and strictly locked previews.
 ctx,pg,errors=new_page(390,844)
 assert pg.evaluate('window.StudioEmpireOffices.selectTier(4)') is False
 assert pg.evaluate('window.StudioEmpireOffices.active')==1
 assert pg.locator('.owned-step.locked').count()==3
 pg.locator('#office-buy-open').click()
 assert pg.locator('#office-purchase-confirm').is_disabled()
 pg.screenshot(path=str(out/'phone-garage-locked.png'),full_page=True)
 assert not errors,errors;ctx.close()
 # Funded career with 3 hired staff and a released title — verified $40K purchase.
 ctx,pg,errors=new_page(1280,800,fixture(1,3,75000,1980,1,500,20))
 assert pg.evaluate('window.StudioEmpireOffices.selectTier(4)') is False
 pg.locator('#office-buy-open').click()
 assert pg.locator('#office-purchase-confirm').is_enabled()
 pg.on('dialog',lambda dialog:dialog.accept())
 pg.locator('#office-purchase-confirm').click()
 pg.wait_for_function('window.StudioEmpireOffices.active===2',timeout=60000)
 saved=pg.evaluate('JSON.parse(localStorage.getItem("studio-empire-reboot-v1"))')
 assert saved['office']==2 and saved['cash']==35000,(saved['office'],saved['cash'])
 assert saved['officeHistory'][-1]['price']==40000
 assert pg.locator('.owned-step.current').count()==1
 assert pg.locator('.owned-step.locked').count()==2
 pg.wait_for_timeout(800)
 pg.screenshot(path=str(out/'desktop-paid-rented-studio.png'),full_page=True)
 assert not errors,errors;ctx.close()
 # HQ appears only if previously purchased in the career; 3D artwork is geometry.
 ctx,pg,errors=new_page(390,844,fixture(4,12,460000,2026,9,50000,70))
 assert pg.evaluate('window.StudioEmpireOffices.active')==4
 assert pg.evaluate('window.StudioEmpireOfficeArt?.hasProceduralFloor') is True
 assert pg.locator('.owned-step.locked').count()==0
 assert pg.evaluate('window.StudioEmpireOffices.selectTier(2)') is False
 pg.wait_for_timeout(900)
 pg.screenshot(path=str(out/'phone-owned-headquarters.png'),full_page=True)
 assert not errors,errors;ctx.close()
 browser.close()
print('PASS: live WebGL, single-founder locked garage, paid $40k upgrade, persisted save, mobile HQ texture/ownership, no free touring.')
