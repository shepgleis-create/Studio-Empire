/* Studio Empire: purchase-only, career-linked office upgrades. Preserves existing saves. */
(function(global){'use strict';
const KEY='studio-empire-reboot-v1';
const TIERS=Object.freeze([
 {tier:1,name:'Garage',cost:0,monthly:1500,capacity:4,staff:1,games:0,fans:0,rep:0,year:1975},
 {tier:2,name:'Rented Studio',cost:40000,monthly:3100,capacity:6,staff:3,games:1,fans:400,rep:15,year:1975},
 {tier:3,name:'Established Studio',cost:115000,monthly:6800,capacity:12,staff:5,games:3,fans:3000,rep:25,year:1990},
 {tier:4,name:'Global Headquarters',cost:340000,monthly:16000,capacity:24,staff:10,games:8,fans:25000,rep:55,year:2010}]);
const money=v=>'$'+Math.round(Number(v)||0).toLocaleString('en-US');
const byId=id=>typeof document==='undefined'?null:document.getElementById(id);
function read(storage=global.localStorage){try{let s=JSON.parse(storage.getItem(KEY));return s&&Number.isFinite(s.cash)&&Number.isFinite(s.year)&&Number.isInteger(s.office)&&s.office>=1&&s.office<=4&&Array.isArray(s.staff)&&Array.isArray(s.games)?s:null}catch(_){return null}}
function requirements(s,tier){
 let t=TIERS[tier-1];if(!t)return [{id:'tier',ok:false,text:'Invalid tier'}];
 if(!s)return [{id:'career',ok:false,text:'Create a Studio Empire career first'}];
 return [
 {id:'order',ok:s.office===tier-1,text:'Own office tier '+(tier-1)},
 {id:'cash',ok:s.cash>=t.cost,text:'Have '+money(t.cost)+' (available '+money(s.cash)+')'},
 {id:'staff',ok:s.staff.length>=t.staff,text:'Hire '+t.staff+' staff (have '+s.staff.length+')'},
 {id:'games',ok:s.games.length>=t.games,text:'Release '+t.games+' games (have '+s.games.length+')'},
 {id:'fans',ok:(s.fans||0)>=t.fans,text:'Reach '+t.fans.toLocaleString()+' fans (have '+(s.fans||0).toLocaleString()+')'},
 {id:'rep',ok:(s.rep||0)>=t.rep,text:'Reach '+t.rep+' reputation (have '+(s.rep||0)+')'},
 {id:'year',ok:s.year>=t.year,text:'Reach year '+t.year+' (now '+s.year+')'}];
}
function eligibility(s,tier){
 if(!Number.isInteger(tier)||tier<2||tier>4)return {ok:false,reason:'INVALID_TIER',requirements:[]};
 if(!s)return {ok:false,reason:'NO_CAREER',requirements:requirements(null,tier)};
 if(s.office>=tier)return {ok:false,reason:'ALREADY_OWNED',requirements:[]};
 if(tier!==s.office+1)return {ok:false,reason:'BUY_IN_ORDER',requirements:requirements(s,tier)};
 const list=requirements(s,tier);return {ok:list.every(x=>x.ok),reason:list.every(x=>x.ok)?'READY':'REQUIREMENTS',requirements:list};
}
function purchase(tier,storage=global.localStorage){
 const s=read(storage),check=eligibility(s,tier);if(!check.ok)return {ok:false,reason:check.reason,requirements:check.requirements};
 const t=TIERS[tier-1];
 const n={...s,cash:s.cash-t.cost,office:tier,officeVersion:2,totalSpent:(s.totalSpent||0)+t.cost,yearlyProfit:(s.yearlyProfit||0)-t.cost};
 n.officeHistory=[...(Array.isArray(s.officeHistory)?s.officeHistory:[]),{office:tier,price:t.cost,date:String(s.month||1)+'/'+s.year,source:'3d-career'}];
 n.history=[{date:String(s.month||1)+'/'+s.year,text:'Purchased '+t.name+' for '+money(t.cost)+'.'},...(Array.isArray(s.history)?s.history:[])].slice(0,45);
 n.last3dOfficePurchase={office:tier,cost:t.cost,at:new Date().toISOString()};
 try{storage.setItem(KEY,JSON.stringify(n))}catch(_){return {ok:false,reason:'SAVE_ERROR',requirements:check.requirements}};
 const verified=read(storage);if(!verified||verified.office!==tier||verified.cash!==n.cash)return {ok:false,reason:'SAVE_VERIFY_FAILED',requirements:check.requirements};
 return {ok:true,office:tier,cash:verified.cash,price:t.cost,monthly:t.monthly};
}
const API={SAVE_KEY:KEY,SPECS:TIERS,read,requirements,eligibility,purchase,fmt:money};global.StudioEmpireOfficeEconomy=API;
if(typeof document==='undefined'||!global.StudioEmpireOffices)return;
const office3d=global.StudioEmpireOffices,esc=s=>String(s).replace(/[&<>"]/g,v=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[v]));
const career=read(),current=career?.office||1;
if(career)office3d.selectTier(current);
const bar=document.querySelector('.office-stage-switch');
if(bar){bar.classList.add('owned-office-track');bar.innerHTML='<b>OFFICE PROGRESSION</b>'+TIERS.map(t=>'<span class="owned-step '+(t.tier===current?'current':t.tier<current?'owned':'locked')+'">'+(t.tier===current?'◆ ':t.tier<current?'✓ ':'🔒 ')+t.tier+' '+esc(t.name)+'</span>').join('')+(current<4?'<button type="button" id="office-buy-open">UPGRADE ↗</button>':'<strong>MAX LEVEL</strong>')}
const status=byId('tour-status');if(status)status.textContent=career?'PURCHASED OFFICE · REAL CAREER':'CAREER REQUIRED';
const goal=byId('tour-detail');if(goal)goal.textContent=career?(current===4?'Maximum office purchased':('Next: '+TIERS[current].name+' · '+money(TIERS[current].cost))):'Start a career in the original game to purchase offices';
const small=document.querySelector('.concept-goals small');if(small)small.textContent='Earn upgrades · No free office tours';
const officeCard=document.querySelector('.concept-snapshot [data-open="studio"]');
if(officeCard){const b=officeCard.querySelector('b'),sm=officeCard.querySelector('small');if(b)b.textContent='OWNED LEVEL '+current+'/4';if(sm)sm.textContent=current<4?'Next office '+money(TIERS[current].cost):'Global headquarters owned'}
const cash=byId('cash');if(cash&&career)cash.textContent=money(career.cash);
const saveStatus=byId('save-status');if(saveStatus&&career)saveStatus.textContent='Career linked · Property upgrades spend real saved funds';
const dialog=document.createElement('div');dialog.id='office-purchase-cover';dialog.className='office-purchase-cover';dialog.hidden=true;
dialog.innerHTML='<section class="office-purchase-dialog" role="dialog" aria-modal="true" aria-labelledby="office-purchase-heading"><header><h2 id="office-purchase-heading">Office Upgrade</h2><button id="office-purchase-close" aria-label="Close">×</button></header><div id="office-purchase-details"></div><footer><button id="office-purchase-cancel">NOT NOW</button><button id="office-purchase-confirm">PURCHASE OFFICE</button></footer></section>';document.body.append(dialog);
const close=()=>{dialog.hidden=true};byId('office-purchase-close').onclick=close;byId('office-purchase-cancel').onclick=close;dialog.addEventListener('click',e=>{if(e.target===dialog)close()});
function open(){
 const s=read(),tier=(s?.office||1)+1,t=TIERS[tier-1],confirmButton=byId('office-purchase-confirm');
 if(!t){byId('office-purchase-heading').textContent='Maximum office owned';byId('office-purchase-details').textContent='You already own the headquarters.';confirmButton.disabled=true;dialog.hidden=false;return}
 const result=eligibility(s,tier);byId('office-purchase-heading').textContent='Tier '+tier+' · '+t.name;
 byId('office-purchase-details').innerHTML='<p class="office-price">'+money(t.cost)+' <small>one-time</small></p><p>Monthly office overhead: <b>'+money(t.monthly)+'</b>. Capacity: <b>'+t.capacity+' workstations</b>.</p><div class="office-req">'+result.requirements.map(r=>'<div class="'+(r.ok?'met':'missing')+'"><b>'+(r.ok?'✓':'○')+'</b>'+esc(r.text)+'</div>').join('')+'</div><p class="office-warning">Upgrades spend REAL cash from your existing Studio Empire save. Close other tabs of the old game before purchase to avoid overwriting changes.</p>';
 confirmButton.disabled=!result.ok;confirmButton.dataset.tier=tier;confirmButton.textContent=result.ok?'BUY FOR '+money(t.cost):'LOCKED — KEEP GROWING';dialog.hidden=false;
}
byId('office-buy-open')?.addEventListener('click',open);
if(officeCard)officeCard.addEventListener('click',e=>{e.preventDefault();e.stopImmediatePropagation();open()},true);
byId('office-purchase-confirm').onclick=()=>{
 const tier=Number(byId('office-purchase-confirm').dataset.tier),t=TIERS[tier-1];if(!t)return;
 if(!global.confirm('Pay '+money(t.cost)+' to move into '+t.name+'? Your saved cash will be deducted and monthly overhead will increase.'))return;
 const result=purchase(tier);if(!result.ok){open();if(['SAVE_ERROR','SAVE_VERIFY_FAILED'].includes(result.reason))global.alert('Could not verify the save; purchase not confirmed.');return}
 global.location.reload();
};
})(typeof window!=='undefined'?window:globalThis);