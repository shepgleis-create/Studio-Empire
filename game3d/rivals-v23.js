/* v0.23: persistent rival partnerships, publishing contracts, recruitment and subsidiary funding. */
(function(g){'use strict';
const api=g.StudioEmpireIndustry,career=g.StudioEmpireCareer;if(!api||!career)return;
const n=(x,d=0)=>Number.isFinite(+x)?+x:d,fail=(reason,extra={})=>({ok:false,reason,...extra});
function contract(id,type,storage=g.localStorage){
if(!['partner','publish','recruit','invest'].includes(type))return fail('INVALID_ACTION');
return api.transaction('rival-'+type,s=>{
const c=(s.companies||[]).find(x=>String(x.id)===String(id));if(!c||c.merged)return fail('NOT_FOUND');
if(type==='invest'&&!c.owned)return fail('NOT_SUBSIDIARY');
if(type!=='invest'&&c.owned)return fail('ALREADY_OWNED');
const week=n(s.weekNumber),deals=s.rivalDeals||[];
if(type!=='recruit'&&deals.some(d=>d.id===c.id&&d.type===type&&d.ends>week))return fail('ALREADY_ACTIVE');
if(type==='recruit'&&(n(c.staff,1)<2||s.staff.length>=[0,4,6,12,24][s.office]))return fail('OFFICE_FULL_OR_RIVAL_EMPTY');
if((type==='publish'||type==='recruit')&&n(s.rep)<(type==='publish'?20:15))return fail('REPUTATION_REQUIRED');
const earlier=(s.rivalActions||[]).find(a=>a.id===c.id&&a.type===type);
if(earlier&&week-n(earlier.week)<(type==='recruit'?12:4))return fail('COOLDOWN');
const cost=type==='partner'?Math.max(2500,Math.round(n(c.value)*.025)):type==='publish'?Math.max(4000,Math.round(n(c.value)*.04)):type==='recruit'?Math.max(3800,Math.round(n(c.staff,1)*350)):Math.max(5000,Math.round(n(c.value)*.045));
if(s.cash<cost)return fail('INSUFFICIENT_CASH',{cost});
s.cash-=cost;s.totalSpent=n(s.totalSpent)+cost;s.yearlyProfit=n(s.yearlyProfit)-cost;
s.rivalActions=[...(s.rivalActions||[]).filter(a=>!(a.id===c.id&&a.type===type)),{id:c.id,type,week}].slice(-120);
if(type==='recruit'){c.staff=n(c.staff)-1;const employeeId=Math.max(-1,...s.staff.map(p=>n(p.id,-1)))+1;s.staff.push({id:employeeId,name:'Recruit '+String(c.name).split(' ')[0]+' '+employeeId,role:'Experienced Developer',skill:Math.min(85,Math.round(38+n(c.rep)*.28)),salary:2800,energy:82,morale:76,specialty:'generalist',color:'#748da0',skin:'#b88b72',hair:'#45312d'});}
else{const term=type==='partner'?16:type==='publish'?12:20;s.rivalDeals=[...deals,{id:c.id,type,cost,started:week,ends:week+term,lastPaid:week}];
if(type==='publish'){s.hype=n(s.hype)+8;s.fans=n(s.fans)+Math.round(n(c.fans)*.002);}
if(type==='invest'){c.cash=n(c.cash)+cost;c.value=n(c.value)+Math.round(cost*.65);}}
s.history=[{date:'W'+week,text:type+' agreement with '+c.name+' for $'+cost.toLocaleString()},...(s.history||[])].slice(0,45);
return {company:c.name,cost,type};
},storage);
}
function weekly(storage=g.localStorage){const state=career.read(storage),w=n(state?.weekNumber);
if(!state?.rivalDeals?.some(d=>d.ends>=w&&d.lastPaid<w))return{ok:true,skipped:true};
return api.transaction('rival-settlement',s=>{let earnings=0,research=0;
for(const d of s.rivalDeals||[]){if(d.lastPaid>=w||d.ends<w)continue;const c=(s.companies||[]).find(x=>x.id===d.id);if(!c||c.merged)continue;d.lastPaid=w;
if(d.type==='partner'){const rp=2+Math.ceil(n(c.researchLevel,1)*.38);s.rp=n(s.rp)+rp;research+=rp;}
if(d.type==='publish'){const amount=Math.min(n(c.cash),Math.max(150,Math.floor((n(c.annualRevenue)+n(c.fans)*.6)/52*.035)));c.cash-=amount;earnings+=amount;}
if(d.type==='invest'){c.value=Math.floor(n(c.value)*1.012);c.rep=Math.min(100,n(c.rep)+.18);}
}
s.cash+=earnings;s.totalRevenue=n(s.totalRevenue)+earnings;s.yearlyProfit=n(s.yearlyProfit)+earnings;s.lastRivalContractIncome=earnings;
s.rivalDeals=(s.rivalDeals||[]).filter(d=>d.ends>=w-4).slice(-100);
return {earnings,research};},storage);}
function status(s){return(s?.rivalDeals||[]).filter(d=>d.ends>=n(s.weekNumber)).map(d=>({...d,remaining:d.ends-n(s.weekNumber)}));}
g.StudioEmpireRivals23={contract,weekly,status};
const ui=g.StudioEmpireIndustryUI;if(!ui||typeof document==='undefined')return;const view=document.getElementById('empire-v18-content');if(!view)return;
const renderOriginal=ui.render.bind(ui),openOriginal=ui.open.bind(ui);let msg='';
const esc=v=>String(v??'').replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
function decorate(){if(view.hidden||!['rivals','holdings'].includes(ui.active))return;
const state=career.read();if(!state)return;view.querySelector('#se23-relations')?.remove();
const own=ui.active==='holdings',list=(state.companies||[]).filter(c=>!c.merged&&!!c.owned===own);
const el=document.createElement('section');el.id='se23-relations';el.className='se23-relations';
el.innerHTML='<header><div><small>INDUSTRY RELATIONSHIPS</small><h3>'+(own?'Manage subsidiaries':'Negotiate with studios')+'</h3><p>Real contracts, salaries and company funds.</p></div><b>'+status(state).length+' active</b></header><label>Choose a company<select id="se23-company">'+list.map(c=>'<option value="'+esc(c.id)+'">'+esc(c.name)+' · $'+Math.round(n(c.value)).toLocaleString()+'</option>').join('')+'</select></label><div class="se23-actions">'+(own?[['invest','Fund subsidiary']]:[['partner','Research partnership'],['publish','Publishing contract'],['recruit','Recruit competitor staff']]).map(([k,t])=>'<button data-se23-action="'+k+'" '+(!list.length?'disabled':'')+'>'+t+'</button>').join('')+'</div><p id="se23-status" role="status">'+esc(msg||'Contracts charge funds immediately; weekly effects persist in your career.')+'</p>'+status(state).map(d=>{const company=(state.companies||[]).find(c=>c.id===d.id);return '<div class="se23-contract"><b>'+esc(company?.name||'Studio')+'</b><span>'+esc(d.type)+' · '+d.remaining+' weeks left</span></div>';}).join('');
view.prepend(el);}
ui.render=function(){renderOriginal();decorate()};ui.open=function(tab){const r=openOriginal(tab);decorate();return r};
view.addEventListener('click',e=>{const b=e.target.closest('[data-se23-action]');if(!b)return;const id=view.querySelector('#se23-company')?.value,type=b.dataset.se23Action,c=career.read()?.companies?.find(c=>String(c.id)===id);if(!c)return;
const quotedCost=type==='partner'?Math.max(2500,Math.round(n(c.value)*.025)):type==='publish'?Math.max(4000,Math.round(n(c.value)*.04)):type==='recruit'?Math.max(3800,Math.round(n(c.staff,1)*350)):Math.max(5000,Math.round(n(c.value)*.045));if(!g.confirm('Pay 
const r=contract(id,type);msg=r.ok?'Signed '+type+' with '+r.company+' · $'+r.cost.toLocaleString()+' spent.':'Action blocked: '+r.reason.replaceAll('_',' ').toLowerCase();ui.render();});
})(typeof window!=='undefined'?window:globalThis);+quotedCost.toLocaleString()+' for '+type+' with '+c.name+'? The payment will be deducted from your career.'))return;
const r=contract(id,type);msg=r.ok?'Signed '+type+' with '+r.company+' · $'+r.cost.toLocaleString()+' spent.':'Action blocked: '+r.reason.replaceAll('_',' ').toLowerCase();ui.render();});
})(typeof window!=='undefined'?window:globalThis);