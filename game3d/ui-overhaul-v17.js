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
window.StudioEmpireUnifiedUI={openSection,get current(){return active},debug(){return{registered:true,legacySheetHidden:!legacy||legacy.hidden,activeSection:active,saveWrites:0}}};
})();