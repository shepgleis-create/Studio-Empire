"""Real Babylon.js screen verification. Office levels are PURCHASES, never free tours."""
import asyncio,json,sys,time,subprocess
from pathlib import Path
from playwright.async_api import async_playwright
ROOT=Path(__file__).resolve().parents[1]
URL=sys.argv[1] if len(sys.argv)>1 else 'http://127.0.0.1:8765/game3d/'
SIZES=[(390,844),(844,390),(1280,800)]
def career(tier):
 count={1:1,2:3,3:5,4:12}[tier]
 return {'studio':'Verified Studio','founder':'Founder','year':2026,'office':tier,'officeVersion':2,'month':4,'cash':800000,'fans':30000,'rep':72,'rp':100,'yearlyProfit':0,'totalSpent':0,
         'staff':[{'id':i+1,'name':'Employee '+str(i+1),'role':'Developer','energy':85} for i in range(count)],
         'games':[{'title':'Released Game '+str(i)} for i in range(10)],'history':[],'officeHistory':[]}
async def main():
 for js in ('garage.js','office-progression.js','office-economy.js','office-art-v015.js','bridge.js'):
  subprocess.run(['node','--check',str(ROOT/js)],check=True)
 subprocess.run(['node',str(ROOT/'tests/office-economy.test.cjs')],check=True)
 report={'url':URL,'results':[]}
 async with async_playwright() as p:
  browser=await p.chromium.launch(headless=True,args=['--no-sandbox','--use-gl=angle','--use-angle=swiftshader','--enable-webgl','--ignore-gpu-blocklist'])
  try:
   for width,height in SIZES:
    tierResults=[]
    for tier in ({390:(1,4),844:(4,),1280:(2,3)}[width]):
     context=await browser.new_context(viewport={'width':width,'height':height},device_scale_factor=1,is_mobile=width<900,has_touch=width<900)
     fixture=json.dumps(career(tier))
     await context.add_init_script('localStorage.setItem("studio-empire-reboot-v1", '+json.dumps(fixture)+')')
     page=await context.new_page();errors=[];page.on('pageerror',lambda e:errors.append(str(e)))
     started=time.monotonic();response=await page.goto(URL,wait_until='domcontentloaded',timeout=60000)
     assert response and response.status==200
     await page.wait_for_function("document.body.dataset.engine === 'running' && !!window.StudioEmpireOffices && !!window.StudioEmpireOfficeEconomy",timeout=60000)
     await page.wait_for_function(f'window.StudioEmpireOffices.active === {tier}',timeout=25000)
     await page.wait_for_timeout(350)
     debug=await page.evaluate('window.StudioEmpireOffices.debug()')
     assert debug['tier']==tier and debug['actors']>=1,debug
     # Attempt to force access to an unpaid tier must be refused.
     locked=4 if tier<4 else 1
     assert await page.evaluate(f'window.StudioEmpireOffices.selectTier({locked})') is False
     assert await page.locator('.owned-step.current').count()==1
     assert await page.locator('.owned-step.locked').count()==4-tier
     if tier>1: assert await page.evaluate('window.StudioEmpireOfficeArt?.hasProceduralFloor') is True
     await page.wait_for_function("""() => {
        let can=document.querySelector('#renderCanvas');if(!can||!can.width||!can.height)return false;
        let c=document.createElement('canvas');c.width=40;c.height=40;let x=c.getContext('2d',{willReadFrequently:true});
        x.drawImage(can,0,0,40,40);let pix=x.getImageData(0,0,40,40).data,n=0;
        for(let i=0;i<pix.length;i+=4)if(pix[i]>110&&pix[i+1]>85&&pix[i+2]>60)n++;return n>10;
     }""",timeout=22000)
     shot=ROOT/f'actual-3d-{width}-tier{tier}.png';await page.screenshot(path=str(shot),full_page=True)
     assert not errors,errors
     tierResults.append({'tier':tier,'actors':debug['actors'],'meshes':debug['meshes'],'screenshot':shot.name})
     await context.close()
    report['results'].append({'width':width,'height':height,'offices':tierResults})
   # Transaction exercised through the real purchase modal.
   context=await browser.new_context(viewport={'width':390,'height':844},is_mobile=True,has_touch=True)
   start=career(1);start['staff']=career(2)['staff'];start['fans']=500;start['games']=[{'title':'First Game'}];start['rep']=20;start['cash']=75000
   await context.add_init_script('localStorage.setItem("studio-empire-reboot-v1", '+json.dumps(json.dumps(start))+')')
   page=await context.new_page();page.on('dialog',lambda d:asyncio.create_task(d.accept()))
   await page.goto(URL,wait_until='domcontentloaded',timeout=60000)
   await page.wait_for_function('!!window.StudioEmpireOfficeEconomy',timeout=60000)
   await page.locator('#office-buy-open').click()
   assert await page.locator('#office-purchase-confirm').is_enabled()
   await page.locator('#office-purchase-confirm').click()
   await page.wait_for_function('window.StudioEmpireOffices?.active===2',timeout=60000)
   saved=await page.evaluate('JSON.parse(localStorage.getItem("studio-empire-reboot-v1"))')
   assert saved['office']==2 and saved['cash']==35000 and saved['officeHistory'][-1]['price']==40000,saved
   await context.close()
   (ROOT/'3d-browser-report.json').write_text(json.dumps(report,indent=2))
   print('PASS paid offices + actual WebGL screenshot checks',json.dumps(report))
  finally:await browser.close()
if __name__=='__main__':asyncio.run(main())
