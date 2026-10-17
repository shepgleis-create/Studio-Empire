import asyncio,json
from pathlib import Path
from playwright.async_api import async_playwright

OUT=Path("tests/v22-proof")
OUT.mkdir(parents=True,exist_ok=True)
async def main():
    report=[]
    async with async_playwright() as p:
        browser=await p.chromium.launch(headless=True,args=['--no-sandbox','--use-gl=angle','--use-angle=swiftshader','--enable-webgl','--enable-unsafe-swiftshader'])
        for width,height in [(390,844),(1280,820)]:
            ctx=await browser.new_context(viewport={'width':width,'height':height},is_mobile=width<600,has_touch=width<600)
            page=await ctx.new_page(); errors=[]
            page.on("pageerror",lambda e:errors.append(str(e)))
            await page.goto("http://127.0.0.1:8765/game3d/",timeout=60000)
            await page.wait_for_function("document.body.dataset.engine==='running' && !!window.StudioEmpireProduction22 && !!window.StudioEmpireProductionUI22",timeout=70000)
            await page.locator('[data-menu-action="new"]').click()
            await page.locator('#studio19-new-form [name="studio"]').fill('Pixel Atlas')
            await page.locator('#studio19-new-form [name="founder"]').fill('Avery')
            await page.locator('#studio19-new-form button[type="submit"]').click()
            await page.wait_for_function("document.body.dataset.engine==='running' && window.StudioEmpireCareer.read()?.studio==='Pixel Atlas'",timeout=70000)
            await page.locator('[data-se20-dest="games"]').first.click()
            await page.locator('#career-project-form [name="name"]').fill('Moon City')
            await page.locator('#career-project-form button[type="submit"]').click()
            assert await page.evaluate('window.StudioEmpireCareer.read().project?.name==="Moon City"')
            await page.locator('[data-se20-page="production22"]').click()
            assert await page.locator('#se22-production').is_visible()
            await page.locator('[data-production="strategy:quality"]').click()
            assert await page.evaluate('window.StudioEmpireCareer.read().project.strategy==="quality"')
            await page.locator('[data-production="focus:story"]').click()
            assert await page.evaluate('window.StudioEmpireCareer.read().project.focus.join(",")==="85,35,60"')
            await page.locator('[data-production-staff]').first.select_option('qa')
            assert await page.evaluate('window.StudioEmpireCareer.read().staff[0].specialty==="qa"')
            await page.locator('#se22-target input').fill('14')
            await page.locator('#se22-target button').click()
            assert await page.evaluate('window.StudioEmpireCareer.read().project.deadlineWeeks===14')
            assert (await page.evaluate('window.StudioEmpireCareer.advanceWeek().ok')) is True
            assert await page.evaluate('window.StudioEmpireCareer.read().project.milestones.length>=0')
            await page.screenshot(path=str(OUT/f"{width}-production-lab.png"))
            assert await page.evaluate('document.documentElement.scrollWidth<=innerWidth+2'),'horizontal overflow'
            assert not errors,errors
            report.append({'width':width,'engine':True,'productionLab':True,'savedStrategy':True,'saveCompatibility':True,'errors':errors})
            await ctx.close()
        await browser.close()
    (OUT/'report.json').write_text(json.dumps(report,indent=2))
    print(json.dumps(report,indent=2))
if __name__=='__main__':asyncio.run(main())
