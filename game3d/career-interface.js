/* Real, save-backed in-world management for the Babylon.js 3D branch.
 * No fabricated cash, employee counts, progress, or click-through demo actions.
 */
(function(){'use strict';
const core=window.StudioEmpireCareer,economy=window.StudioEmpireOfficeEconomy;if(!core)return;
const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const $=id=>document.getElementById(id);
const root=document.createElement('section');root.id='career-hub';root.className='career-hub';root.hidden=true;
root.innerHTML=`<div class="career-backdrop" data-dismiss="1"></div><div class="career-shell" role="dialog" aria-modal="true" aria-label="Studio management">
 <header class="career-head"><div><span class="career-kicker">STUDIO EMPIRE / MANAGEMENT</span><h2 id="career-hub-title">Company operations</h2></div><div class="career-head-actions"><button id="career-export" title="Export a backup of your career">Export save</button><button id="career-close" aria-label="Close studio management">✕</button></div></header>
 <div class="career-metrics" id="career-metrics"></div>
 <nav class="career-tabs" aria-label="Studio management sections">
 <button data-career-tab="dashboard">Overview</button><button data-career-tab="projects">Create game</button><button data-career-tab="team">Team</button><button data-career-tab="research">Research</button><button data-career-tab="offices">Offices</button><button data-career-tab="market">Market</button></nav>
 <div class="career-body" id="career-body"></div><footer class="career-footer"><span id="career-message" role="status">Save-backed career · no artificial game statistics</span><button id="career-close-bottom">BACK TO OFFICE</button></footer>
 </div>`;
document.body.appendChild(root);
const trigger=document.createElement('button');trigger.id='career-open';trigger.type='button';trigger.innerHTML='<span class="career-open-dot">◆</span> MANAGE STUDIO <span aria-hidden="true">↗</span>';document.querySelector('.scene-header')?.appendChild(trigger);
const mobile=document.createElement('button');mobile.id='career-mobile';mobile.type='button';mobile.textContent='MANAGE';document.querySelector('.mobile-nav')?.appendChild(mobile);
let active='dashboard',message='';
const price=core.money;
function date(s){return ['JAN','FEB','MAR','APR','MAY','JUN','JUL','AUG','SEP','OCT','NOV','DEC'][(s.month||1)-1]+' '+s.year+' · W'+(s.week||1)}
function get(){return core.read()}
function stat(label,value,sub=''){return `<div class="career-metric"><span>${label}</span><b>${esc(value)}</b>${sub?`<small>${esc(sub)}</small>`:''}</div>`;}
function note(text){return `<p class="career-info">${text}</p>`}
function box(title,body,tag=''){return `<article class="career-card"><header><strong>${title}</strong>${tag?`<span class="career-tag">${tag}</span>`:''}</header>${body}</article>`}
function notify(t){message=t;const m=$('career-message');if(m)m.textContent=t;}
function available(s){return core.availablePlatforms(s);}
function formCreate(){return `<div class="career-split">${box('Create a new studio',`<form id="career-create-form" class="career-form">
 <label>Company name<input name="studio" required maxlength="35" placeholder="Pioneer Games" value="Pioneer Games"></label>
 <label>Founder name<input name="founder" required maxlength="38" placeholder="Your founder" value="Alex Morgan"></label>
 <div class="career-fields"><label>Starting year<select name="year">${[1975,1980,1990,2000,2010,2020,2030].map(y=>`<option value="${y}" ${y===1975?'selected':''}>${y}</option>`).join('')}</select></label>
 <label>Difficulty<select name="difficulty"><option value="story">Creative</option><option value="standard" selected>Standard</option><option value="hard">Hard</option><option value="brutal">Brutal</option></select></label></div>
 <button type="submit" class="career-action">START CAREER WITH ONE FOUNDER</button></form>`,`Real simulation`)}
 ${box('The growth path',`<div class="career-list"><p><b>1. Garage</b><span>One founder and a few workstations</span></p><p><b>2. Rented Studio</b><span>Hire, release games and purchase an upgrade</span></p><p><b>3. Established Studio</b><span>Departments, stronger technology and larger teams</span></p><p><b>4. Global HQ</b><span>A large company earned through business success</span></p></div>`,'4 offices')}</div>`;}
function dashboard(s){const project=s.project;const last=s.games?.[0];const p=project?Math.min(100,Math.round(100*project.progress/Math.max(1,project.weeks))):0;
 return `<div class="career-dashboard-grid">
 ${box('Current production',project?`<h3>${esc(project.name)}</h3><p>${esc(project.genre)} / ${esc(project.topic)} · ${esc(project.size)}</p><div class="career-progress"><i style="width:${p}%"></i></div><p>${p}% complete · ${project.ready?'Ready to release':`${Math.ceil(project.weeks-project.progress)} production weeks left`}</p>${project.ready?'<button data-do="release" class="career-action">PUBLISH GAME</button>':'<p class="career-info">Production advances automatically as the simulation runs. Use the speed controls to adjust time.</p>'}`:`<h3>No active project</h3><p>Create a game, choose a genre and platform, and manage development from here.</p><button data-jump="projects" class="career-action">START A GAME</button>`,'Production')}
 ${box('Studio finances',`<div class="career-list"><p><b>Company cash</b><span>${price(s.cash)}</span></p><p><b>Monthly staffing</b><span>${price(s.staff.reduce((n,x)=>n+(Number(x.salary)||0),0))}</span></p><p><b>Office overhead</b><span>${price([0,1500,3100,6800,16000][s.office])}</span></p><p><b>Total earnings</b><span>${price(s.totalRevenue)}</span></p></div><p class="career-info">Payroll and sales advance automatically while this game is open. No offline charges or catch-up simulation.</p>`,'Actual save')}
 ${box('Studio progress',`<div class="career-list"><p><b>Games released</b><span>${s.games.length}</span></p><p><b>Team members</b><span>${s.staff.length} / ${[0,4,6,12,24][s.office]}</span></p><p><b>Research points</b><span>${Math.floor(s.rp||0)} RP</span></p><p><b>Last title</b><span>${esc(last?.name||'None')}</span></p></div><button data-jump="offices" class="career-ghost">VIEW OFFICE UPGRADES</button>`,'Growth')}
 ${box('Advance the business',`<p class="career-info">A week advances production, payroll, property expenses and real sales from released games.</p><p class="career-info">Automatic simulation: 1×, 2×, 4×, 8× or pause, available in the office.</p><p class="career-info">${project?.ready?'Finished titles publish automatically when Auto-publish is enabled.':'Real weeks pass without having to tap Continue.'}</p>`,'Time controls')}
 </div>`;}
function projectTab(s){const p=s.project;if(p){const pct=Math.round(100*p.progress/Math.max(1,p.weeks));return box('Development underway',`<h3>${esc(p.name)}</h3><p>${esc(p.genre)} · ${esc(p.topic)} · ${esc(p.platform)} · ${esc(p.size)}</p><div class="career-progress"><i style="width:${pct}%"></i></div><div class="career-list"><p><b>Production</b><span>${pct}%</span></p><p><b>Weekly development cost</b><span>${price(p.weeklyCost)}</span></p><p><b>Outstanding weeks</b><span>${Math.ceil(Math.max(0,p.weeks-p.progress))}</span></p><p><b>Detected bugs</b><span>${Number(p.bugs||0).toFixed(1)}</span></p></div>${p.ready?'<button class="career-action" data-do="release">PUBLISH GAME</button>':'<p class="career-info">Your developers are working automatically. Control the pace in the office view.</p>'}`,p.ready?'Ready to publish':'In production');}
 return `<div class="career-split">${box('New game project',`<form id="career-project-form" class="career-form"><label>Game title<input name="name" maxlength="45" required placeholder="Your new game"></label><div class="career-fields">
 <label>Genre<select name="genre">${core.availableGenres(s).map(t=>`<option>${esc(t)}</option>`).join('')}</select></label><label>Theme<select name="topic">${core.availableTopics(s).map(t=>`<option>${esc(t)}</option>`).join('')}</select></label>
 <label>Platform<select name="platform">${available(s).map(p=>`<option value="${p.id}">${esc(p.name)}</option>`).join('')}</select></label><label>Project scale<select name="size">${core.SIZES.map(z=>`<option value="${z.id}">${z.name}</option>`).join('')}</select></label></div><button class="career-action" type="submit">BEGIN DEVELOPMENT</button></form>`,'Real project')}
 ${box('Production planning',`<p>Projects use the same project fields and production sizes as the original Studio Empire save.</p><div class="career-list">${core.SIZES.map(x=>`<p><b>${x.name}</b><span>${x.weeks} baseline weeks · ${price(x.cost)} base scope</span></p>`).join('')}</div><p class="career-info">Actual upfront price includes engine and platform fees. Payroll and development costs continue each week.</p>`,'Career economy')}</div>`;}
function teamTab(s){const full=s.staff.length>=[0,4,6,12,24][s.office];return `<div class="career-split">${box('Your employees',`<div class="career-employees">${s.staff.map(p=>`<div><span class="career-avatar">${esc((p.name||'?').slice(0,1))}</span><div><b>${esc(p.name)}</b><small>${esc(p.role||'Developer')} · ${p.skill||0} skill · ${Math.round(p.energy||80)} energy</small></div><strong>${price(p.salary)}/mo</strong></div>`).join('')}</div>`,'Real team')}
 ${box('Recruitment',`<p>${s.staff.length} of ${[0,4,6,12,24][s.office]} workstations occupied.</p>${Object.entries(core.HIRE).map(([id,t])=>`<div class="career-hire"><div><b>${esc(t.label)}</b><small>Skill ${t.skill} · ${price(t.salary)}/month</small></div><button data-hire="${id}" ${full||s.cash<t.cost?'disabled':''}>HIRE ${price(t.cost)}</button></div>`).join('')}${full?note('Studio full. Purchase the next office once its requirements are met.'):''}`,'Hire & grow')}</div>`;}
function researchTab(s){return `<div class="career-tech-grid">${core.TECH.map(t=>{let owned=(s.technologies||[]).includes(t.id),locked=t.year>s.year||(t.requires||[]).some(x=>!(s.technologies||[]).includes(x)),afford=(s.rp||0)>=t.cost;
 return box(esc(t.name),`<p>Available ${t.year}${t.requires.length?' · Requires '+t.requires.join(', '):''}</p><div class="career-list"><p><b>Research cost</b><span>${t.cost} RP</span></p><p><b>Unlocked</b><span>${owned?'Yes':'No'}</span></p></div><button data-research="${t.id}" ${owned||locked||!afford?'disabled':''}>${owned?'RESEARCHED':locked?'LOCKED':!afford?'MORE RP NEEDED':'RESEARCH NOW'}</button>`,owned?'Unlocked':t.year>s.year?'Future tech':'Technology');}).join('')}</div>`;}
function officeTab(s){const next=s.office+1,t=economy?.SPECS?.[next-1],check=t?economy.eligibility(s,next):null;return `<div class="career-split">${box('Current location',`<h3>Level ${s.office} · ${esc(economy?.SPECS?.[s.office-1]?.name||'Garage')}</h3><p>Workstations: ${[0,4,6,12,24][s.office]} · Team: ${s.staff.length}</p><div class="career-list"><p><b>Building expenses per month</b><span>${price([0,1500,3100,6800,16000][s.office])}</span></p><p><b>Previously purchased</b><span>${Array.isArray(s.officeHistory)?s.officeHistory.length:0}</span></p></div>`,'Owned')}
 ${box(t?'Next upgrade: '+esc(t.name):'Global Headquarters reached',t?`<h3>${price(t.cost)}</h3><p>${price(t.monthly)} monthly overhead · ${t.capacity} workstations</p><div class="career-list">${check.requirements.map(x=>`<p><b>${x.ok?'✓':'○'} ${esc(x.text)}</b><span>${x.ok?'Met':'Not yet'}</span></p>`).join('')}</div><button data-do="buy-office" class="career-action" ${check.ok?'':'disabled'}>PURCHASE & MOVE</button>`:'<p>You already own the largest office. Expand your game library, research and company portfolio.</p>','Pay to upgrade')}</div>`;}
function marketTab(s){const companies=(s.companies||[]).filter(x=>x&&typeof x.name==='string');return `<div class="career-split">${box('Industry & competitors',companies.length?`<div class="career-list">${companies.slice(0,20).map(c=>`<p><b>${esc(c.name)}</b><span>${price(c.value)} value · ${c.owned?'Owned':'Independent'}</span></p>`).join('')}</div>`:'<p>The existing game generates rival companies during normal career progression. Their records will appear here once available.</p>','Saved rivals')}
 ${box('Recent releases',s.games.length?`<div class="career-list">${s.games.slice(0,12).map(g=>`<p><b>${esc(g.name)}</b><span>${g.score||'?'} / 100 · ${Number(g.sales||0).toLocaleString()} sold</span></p>`).join('')}</div>`:'<p>Release a game to begin building your portfolio and fanbase.</p>','Your portfolio')}</div>`;}
function show(){root.hidden=false;render();}
function hide(){root.hidden=true;}
function render(){const s=get();$('career-hub-title').textContent=s?`${s.studio||'Your studio'} · ${date(s)}`:'Create a career';
 $('career-metrics').innerHTML=s?stat('CASH',price(s.cash),'real balance')+stat('FANS',(s.fans||0).toLocaleString(),'audience')+stat('REPUTATION',Math.round(s.rep||0)+'/100','industry')+stat('OFFICE','TIER '+s.office,'owned')+stat('STAFF',s.staff.length,'employees'):stat('STATUS','NO CAREER','create one to begin');
 document.querySelectorAll('[data-career-tab]').forEach(b=>{b.classList.toggle('active',b.dataset.careerTab===active);b.disabled=!s&&b.dataset.careerTab!=='dashboard';});
 $('career-body').innerHTML=!s?formCreate():active==='projects'?projectTab(s):active==='team'?teamTab(s):active==='research'?researchTab(s):active==='offices'?officeTab(s):active==='market'?marketTab(s):dashboard(s);
 $('career-message').textContent=message||(s?'Changes are saved to your existing Studio Empire career.':'Career saves stay on this device.');
 // Keep the main HUD accurate when progressing without a reload.
 if(s){for(const [id,val] of [['cash',price(s.cash)],['year',s.year],['crew',s.staff.length]]){if($(id))$(id).textContent=val;}
  const cashTile=document.querySelector('.concept-snapshot [data-open="finances"] b');if(cashTile)cashTile.textContent=price(s.cash);
  const staffTile=document.querySelector('.concept-snapshot [data-open="staff"] b');if(staffTile)staffTile.textContent=s.staff.length+' staff';
 }
}
function execute(action){let r;
 if(action==='advance')r=core.advanceWeek();
 else if(action==='release')r=core.releaseProject();
 else if(action==='buy-office'){
  const s=get(),tier=(s?.office||0)+1,info=economy?.SPECS?.[tier-1];if(!info)return notify('Office system unavailable.');
  if(!window.confirm(`Purchase ${info.name} for ${price(info.cost)}?`))return;
  r=economy.purchase(tier);
 }else return;
 if(!r?.ok){notify(`Action failed: ${String(r?.reason||'UNKNOWN_ERROR').replaceAll('_',' ')}.`);render();return;}
 message=action==='advance'?`Week advanced · ${price(r.weeklyBurn)} operating costs · ${price(r.revenue)} revenue`:action==='release'?`${r.game.name} released · ${r.game.score}/100 review`:action==='buy-office'?'New office purchased and saved.':'Saved.';
 render();if(action==='buy-office'||action==='release'){window.location.reload();}
}
root.addEventListener('click',e=>{const t=e.target.closest('button');if(e.target.matches('[data-dismiss]')){hide();return;}if(!t)return;
 if(t.dataset.careerTab){active=t.dataset.careerTab;render();}
 if(t.dataset.jump){active=t.dataset.jump;render();}
 if(t.dataset.do)execute(t.dataset.do);
 if(t.dataset.hire){const r=core.hire(t.dataset.hire);if(!r.ok){notify('Hiring failed: '+r.reason);render();return;}message=r.person.name+' hired. Workstation added to your career.';window.location.reload();}
 if(t.dataset.research){const r=core.research(t.dataset.research);message=r.ok?'Research complete: '+r.technology.name:'Research blocked: '+r.reason;render();}
});
root.addEventListener('submit',e=>{e.preventDefault();const f=new FormData(e.target);
 if(e.target.id==='career-create-form'){const existing=get();if(existing&&!window.confirm('Replace this existing career? A backup will be kept.'))return;const r=core.createCareer(Object.fromEntries(f),window.localStorage,!!existing);if(!r.ok){notify('Could not create career: '+r.reason);return;}window.location.reload();}
 if(e.target.id==='career-project-form'){const r=core.startProject(Object.fromEntries(f));if(!r.ok){notify('Could not start project: '+r.reason);render();return;}message='Development started. Your team will work as the simulation runs.';render();}
});
function exportSave(){const s=get();if(!s){notify('No career to export yet.');return;}const blob=new Blob([JSON.stringify(s,null,2)],{type:'application/json'}),url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download='studio-empire-career-'+s.year+'.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);notify('Export prepared. Save the JSON backup in Files.');}
$('career-export').onclick=exportSave;$('career-close').onclick=hide;$('career-close-bottom').onclick=hide;trigger.addEventListener('click',show);mobile.addEventListener('click',show);
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&!root.hidden)hide();});
window.addEventListener('storage',e=>{if(e.key===core.KEY&&!root.hidden){message='Career changed in another tab. Showing latest saved data.';render();}});
window.StudioEmpireCareerUI={open:show,close:hide,render};
})();
