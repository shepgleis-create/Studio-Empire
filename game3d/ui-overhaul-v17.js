/* Studio Empire v0.17 — route ALL management navigation to save-backed career screens.
   Obsolete read-only garage sheets are retired. No career data is modified here. */
(function(){'use strict';
const ui=window.StudioEmpireCareerUI;
if(!ui){console.error('Studio Empire: career UI missing');return;}
const map={studio:'dashboard',staff:'team',team:'team',projects:'projects',finances:'dashboard',company:'dashboard',research:'research',offices:'offices',market:'market'};
const legacy=document.getElementById('sheet-cover');
if(legacy){legacy.hidden=true;legacy.setAttribute('aria-hidden','true')}
let active='dashboard';
function openSection(name){
 const tab=map[name]||name||'dashboard';
 const button=document.querySelector('[data-career-tab="'+tab+'"]');
 if(!button)return false;
 if(legacy)legacy.hidden=true;
 ui.open();button.click();active=tab;document.body.dataset.managementSection=tab;
 document.querySelectorAll('.mobile-nav [data-panel],.navpanel [data-panel]').forEach(el=>{
   const selected=map[el.dataset.panel]===tab;
   el.classList.toggle('active',selected);el.classList.toggle('selected',selected);
   if(selected)el.setAttribute('aria-current','page');else el.removeAttribute('aria-current');
 });
 return true;
}
// Capture before garage.js's old click listeners fire, even when tapping nested icons.
document.addEventListener('click',event=>{
 const node=event.target.closest('.mobile-nav [data-panel],.navpanel [data-panel],.concept-snapshot [data-open],#inspect-team');
 if(!node||node.closest('#career-hub'))return;
 const dest=node.dataset.panel||node.dataset.open||(node.id==='inspect-team'?'team':null);
 if(!dest)return;
 event.preventDefault();event.stopPropagation();event.stopImmediatePropagation();
 openSection(dest);
},true);
if(legacy)new MutationObserver(()=>{if(!legacy.hidden)legacy.hidden=true}).observe(legacy,{attributes:true,attributeFilter:['hidden']});
document.querySelector('#career-hub .career-tabs')?.addEventListener('click',e=>{
 const node=e.target.closest('[data-career-tab]');if(node){active=node.dataset.careerTab;document.body.dataset.managementSection=active}
});
const stage=document.getElementById('stage');
if(stage)stage.setAttribute('aria-label','Interactive three-dimensional office: drag to pan, pinch to zoom');
document.querySelector('.mobile-nav')?.setAttribute('aria-label','Studio Empire career sections');
const marker=document.createElement('span');marker.className='v17-ui-marker';marker.textContent='LIVE CAREER';
document.querySelector('.scene-header')?.append(marker);
// Compact live mobile intelligence strip uses the real career snapshot, never demo totals.
const brief=document.createElement('div');brief.className='v17-mobile-brief';
brief.innerHTML='<button data-brief="projects"><span>ACTIVE PROJECT</span><strong id="v17-project">—</strong><small id="v17-project-state">Tap to develop</small></button>'+
 '<button data-brief="offices"><span>STUDIO GROWTH</span><strong id="v17-upgrade">—</strong><small id="v17-upgrade-state">Tap for requirements</small></button>';
document.querySelector('.bottom-row')?.insertAdjacentElement('afterend',brief);
const dollar=v=>'$'+Math.max(0,Math.round(Number(v)||0)).toLocaleString('en-US');
function updateBrief(){
 const s=window.StudioEmpireCareer?.read?.();
 const p=s?.project;
 document.getElementById('v17-project').textContent=p?.name||'No active game';
 document.getElementById('v17-project-state').textContent=p?(p.ready?'Ready to release':Math.round(Math.min(100,100*Number(p.progress||0)/Math.max(1,Number(p.weeks)||1)))+'% development'):'Create your first title';
 const next=window.StudioEmpireOfficeEconomy?.SPECS?.[s?.office||1];
 document.getElementById('v17-upgrade').textContent=!s?'Start your career':!next?'Global HQ owned':next.name;
 document.getElementById('v17-upgrade-state').textContent=!s?'One founder · garage':!next?'Maximum office':'Upgrade: '+dollar(next.cost);
}
brief.addEventListener('click',e=>{
 const dest=e.target.closest('[data-brief]')?.dataset.brief;
 if(dest)openSection(dest);
});
document.querySelector('#career-hub')?.addEventListener('click',()=>setTimeout(updateBrief,0));
document.querySelector('#career-hub')?.addEventListener('submit',()=>setTimeout(updateBrief,0));
window.addEventListener('storage',e=>{if(e.key===window.StudioEmpireCareer?.KEY)updateBrief()});
updateBrief();
window.StudioEmpireUnifiedUI={openSection,get current(){return active},debug(){return{registered:true,legacySheetHidden:!legacy||legacy.hidden,activeSection:active,saveWrites:0}}};
})();