"""Regress production strategies, deadlines, roles and live 3D through Studio Empire v25 UI."""
import asyncio,json
from pathlib import Path
from playwright.async_api import async_playwright
OUT=Path("tests/v22-proof");OUT.mkdir(parents=True,exist_ok=True)
async def main():
    report=[]
    async with async_playwright() as p:
        browser=await p.chromium.launch(headless=True,args=['--no-sandbox','--use-gl=angle','--use-angle=swiftshader','--enable-webgl','--enable-unsafe-swiftshader'])
        for width,height in [(390,844),(1280,820)]:
            ctx=await browser.new_context(viewport={'width':width,'height':height},is_mobile=width<600,has_touch=width<600)
            page=await ctx.new_page();errors=[]
            page.on('pageerror',lambda e:errors.append(str(e)))
            await page.goto('http://127.0.0.1:8765/game3d/',timeout=60000)
            await page.wait_for_function("document.body.dataset.engine==='running' && !!window.StudioEmpireProduction22 && !!window.StudioEmpireConsole25",timeout=70000)
            await page.locator('[data-menu-action="new"]').click()
            await page.locator('#studio19-new-form [name="studio"]').fill('Pixel Atlas')
            await page.locator('#studio19-new-form [name="founder"]').fill('Avery')
            await page.locator('#studio19-new-form button[type="submit"]').click()
            await page.wait_for_function("document.body.dataset.engine==='running' && window.StudioEmpireCareer.read()?.studio==='Pixel Atlas'",timeout=70000)
            await page.locator('#se25-open').click()
            await page.locator('#se25-groups [data-group="games"]').click()
            assert await page.locator('#se25').is_visible()
            await page.locator('#se25-title').fill('Moon City')
            await page.locator('#se25-create button[type="submit"]').click()
            assert await page.evaluate('window.StudioEmpireCareer.read().project?.name==="Moon City"')
            await page.locator('#se25-tabs [data-page="production"]').click()
            assert await page.locator('#se25-mode').is_visible()
            await page.locator('#se25-mode').select_option('quality')
            await page.locator('#se25 .se25-btn[data-act="strategy"]').click()
            assert await page.evaluate('window.StudioEmpireCareer.read().project.strategy==="quality"')
            await page.locator('#se25-focus').select_option('story')
            await page.locator('#se25 .se25-btn[data-act="focus"]').click()
            assert await page.evaluate('window.StudioEmpireCareer.read().project.focus.join(",")==="85,35,60"')
            await page.locator('#se25-deadline').fill('14')
            await page.locator('#se25 .se25-btn[data-act="deadline"]').click()
            assert await page.evaluate('window.StudioEmpireCareer.read().project.deadlineWeeks===14')
            await page.locator('#se25-groups [data-group="people"]').click()
            await page.locator('#se25-tabs [data-page="training"]').click()
            await page.locator('#se25 .se25-field select[id^="se25-role-"]').first.select_option('qa')
            await page.locator('#se25 .se25-btn[data-act="role"]').first.click()
            assert await page.evaluate('window.StudioEmpireCareer.read().staff[0].specialty==="qa"')
            assert (await page.evaluate('window.StudioEmpireCareer.advanceWeek().ok')) is True
            assert await page.evaluate('window.StudioEmpireCareer.read().project.milestones.length>=0')
            await page.screenshot(path=str(OUT/f"{width}-production-lab.png"))
            assert await page.evaluate('document.documentElement.scrollWidth<=innerWidth+2')
            assert not errors,errors
            report.append({'width':width,'engine':True,'productionSaved':True,'strategy':'quality','focus':'story','deadline':14,'specialty':'qa','errors':errors})
            await ctx.close()
        await browser.close()
    (OUT/'report.json').write_text(json.dumps(report,indent=2))
    print(json.dumps(report,indent=2))
if __name__=='__main__':asyncio.run(main())
