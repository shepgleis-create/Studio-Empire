/* Studio Empire v0.20: unified mobile/desktop navigation; no save mutation. */
(function(){'use strict';
const ui=window.StudioEmpireCareerUI,industry=window.StudioEmpireIndustryUI,hub=document.getElementById('career-hub'),old=hub?.querySelector('.career-tabs');
if(!ui||!hub||!old){console.error('Studio Empire 20: career routing unavailable');return;}
const groups=[{id:'overview',label:'Overview',icon:'⌂',items:[['dashboard','Dashboard'],['finance','Reports'],['milestones','Milestones']]},{id:'games',label:'Games',icon:'▣',items:[['projects','Develop'],['production22','Production Lab'],['publishers','Publishers'],['pricing','Pricing'],['catalog','My games'],['research','Research']]},{id:'team',label:'Team',icon:'♙',items:[['team','Employees'],['training','Training'],['culture','Culture']]},{id:'business',label:'Business',icon:'▥',items:[['offices','Offices'],['rivals','Rivals'],['holdings','Subsidiaries'],['promotion','Marketing'],['market','Market']]}];
const groupByTab=Object.fromEntries(groups.flatMap(g=>g.items.map(([t])=>[t,g.id])));
let active='dashboard',section='overview',lastFocus=null;
old.classList.add('se20-old-tabs');old.setAttribute('aria-hidden','true');old.querySelectorAll('button').forEach(b=>b.tabIndex=-1);
const nav=document.createElement('div');nav.id='se20-navigation';old.before(nav);
nav.innerHTML='<div class="se20-categories"></div><div class="se20-pages"></div>';
const cats=nav.querySelector('.se20-categories'),pages=nav.querySelector('.se20-pages');
cats.innerHTML=groups.map(g=>'<button type="button" data-se20-group="'+g.id+'"><span aria-hidden="true">'+g.icon+'</span>'+g.label+'</button>').join('');
const currentGroup=()=>groups.find(g=>g.id===section)||groups[0];
function sync(){
 cats.querySelectorAll('button').forEach(b=>{let on=b.dataset.se20Group===section;b.classList.toggle('active',on);b.setAttribute('aria-pressed',String(on));});
 pages.innerHTML=currentGroup().items.map(([key,label])=>'<button type="button" class="'+(key===active?'active':'')+'" data-se20-page="'+key+'" aria-pressed="'+(key===active)+'">'+label+'</button>').join('');
 document.body.dataset.se20Section=section;document.body.dataset.se20Page=active;
 document.querySelectorAll('[data-se20-dest]').forEach(b=>{let on=hub.hidden?b.dataset.se20Dest==='office':b.dataset.se20Dest===section;b.classList.toggle('active',on);if(on)b.setAttribute('aria-current','page');else b.removeAttribute('aria-current');});
}
function openPage(page){
 const custom24=['publishers','culture','milestones','pricing'].includes(page);const el=old.querySelector('[data-career-tab="'+page+'"],[data-empire-tab="'+page+'"]');if(!el&&!custom24)return false;
 if(hub.hidden)lastFocus=document.activeElement;
 active=page;section=groupByTab[page]||'overview';
 if(custom24&&window.StudioEmpireExpansionUI24){window.StudioEmpireExpansionUI24.open(page);}else if(page==='production22'&&window.StudioEmpireProductionUI22){window.StudioEmpireExpansionUI24?.close();window.StudioEmpireProductionUI22.open();}else{window.StudioEmpireExpansionUI24?.close();window.StudioEmpireProductionUI22?.close();if(el?.dataset.empireTab && industry)industry.open(page);else{ui.open();el.click();}}
 sync();
 const target=document.getElementById('se24-content')?.hidden===false?document.getElementById('se24-content'):document.getElementById('empire-v18-content')?.hidden===false?document.getElementById('empire-v18-content'):document.getElementById('career-body');
 if(target){target.scrollTop=0;target.classList.remove('se20-page-in');if(!document.body.classList.contains('studio19-no-motion')){void target.offsetWidth;target.classList.add('se20-page-in');}}
 return true;
}
function openGroup(id){const g=groups.find(g=>g.id===id);return !!g && openPage(g.items[0][0]);}
function office(){window.StudioEmpireExpansionUI24?.close();window.StudioEmpireProductionUI22?.close();if(industry?.active)industry.close();ui.close();sync();if(lastFocus?.focus)lastFocus.focus({preventScroll:true});}
nav.addEventListener('click',e=>{let g=e.target.closest('[data-se20-group]')?.dataset.se20Group,t=e.target.closest('[data-se20-page]')?.dataset.se20Page;if(g)openGroup(g);else if(t)openPage(t);});
function choose(dest){if(dest==='office')office();else openGroup(dest);}
const mobile=document.querySelector('.mobile-nav');
if(mobile){mobile.innerHTML='<button type="button" data-se20-dest="office"><span aria-hidden="true">⌂</span>Studio</button>'+groups.slice(1).map(g=>'<button type="button" data-se20-dest="'+g.id+'"><span aria-hidden="true">'+g.icon+'</span>'+g.label+'</button>').join('');
 mobile.addEventListener('click',e=>{const dest=e.target.closest('[data-se20-dest]')?.dataset.se20Dest;if(dest)choose(dest);});}
const desktop=document.querySelector('.navpanel .main-actions');
if(desktop){desktop.innerHTML='<button type="button" data-se20-dest="office" class="se20-side-link"><span>⌂</span>Studio floor</button>'+groups.map(g=>'<button type="button" data-se20-dest="'+g.id+'" class="se20-side-link"><span>'+g.icon+'</span>'+g.label+'</button>').join('');
 desktop.addEventListener('click',e=>{const dest=e.target.closest('[data-se20-dest]')?.dataset.se20Dest;if(dest)choose(dest);});}
const manage=document.createElement('button');manage.id='se20-manage';manage.type='button';manage.textContent='Manage';manage.addEventListener('click',()=>openGroup('overview'));document.querySelector('.scene-header')?.append(manage);
const menu=document.getElementById('studio19-menu-toggle');if(menu){menu.textContent='Menu';menu.setAttribute('aria-label','Open main menu and settings');}
for(const id of ['career-close','career-close-bottom'])document.getElementById(id)?.addEventListener('click',()=>{if(industry?.active)industry.close();sync();});
document.addEventListener('click',e=>{const b=e.target.closest('#career-hub [data-career-tab],#career-hub [data-empire-tab]');if(!b||b.closest('#se20-navigation'))return;active=b.dataset.careerTab||b.dataset.empireTab;section=groupByTab[active]||section;sync();});
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&!hub.hidden&&!window.StudioEmpireMainMenu?.active){e.preventDefault();office();}});
sync();
window.StudioEmpireNavigation20={openPage,openGroup,office,debug(){return{categories:groups.length,pages:groups.reduce((n,g)=>n+g.items.length,0),active,section,oldTabsHidden:old.classList.contains('se20-old-tabs')}}};
})();