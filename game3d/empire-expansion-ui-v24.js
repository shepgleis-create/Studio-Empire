/* v0.24: Publisher Deals, Studio Culture and Career Milestones in the existing career interface. */
(function(g){'use strict';
const api=g.StudioEmpireExpansion24,core=g.StudioEmpireCareer,ui=g.StudioEmpireCareerUI,industry=g.StudioEmpireIndustryUI;
const hub=document.getElementById('career-hub'),body=document.getElementById('career-body');
if(!api||!core||!ui||!hub||!body)return;
const esc=x=>String(x??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const fmt=x=>'$'+Math.round(Number(x)||0).toLocaleString();
const view=document.createElement('main');view.id='se24-content';view.className='se24-content';view.hidden=true;view.tabIndex=-1;body.after(view);
let section='publishers',notice='';
const title={publishers:'Publisher Deals',culture:'Studio Culture',milestones:'Milestones & Forecast',pricing:'Game Pricing'};
const button=(label,act,attrs='',disabled=false)=>'<button type="button" class="se24-action" data-se24-act="'+act+'" '+attrs+(disabled?' disabled':'')+'>'+esc(label)+'</button>';
const row=(k,v)=>'<div class="se24-row"><span>'+esc(k)+'</span><b>'+esc(v)+'</b></div>';
const card=(name,body,tag='')=>'<article class="se24-card"><header><h3>'+esc(name)+'</h3><small>'+esc(tag)+'</small></header>'+body+'</article>';
function publishers(s){
if(!s.project)return card('Your next publishing deal','<p>Start a game under Games → Develop. Rival publishers can then finance it for a share of sales revenue. You can always self-publish.</p>','NO PROJECT');
const active=(s.publisherDeals||[]).find(d=>d.projectId===s.project.id&&['active','late'].includes(d.status));
const historical=(s.publisherDeals||[]).filter(d=>d.status==='delivered').slice(-5);
return '<div class="se24-summary"><strong>'+esc(s.project.name)+'</strong><p>Publisher investment is real money. In exchange, the publisher receives a permanent percentage of this game’s revenue.</p></div>'+
(active?card(active.studioName,row('Paid upfront',fmt(active.paidAdvance))+row('Your royalty',Math.round(active.royalty*100)+'%')+row('Contract deadline','Day '+active.deadline)+row('Status',active.status==='late'?'Late — financial penalty assessed':'Active')+button('Cancel agreement','cancel','',s.cash<active.paidAdvance*1.3),'SIGNED CONTRACT'):'<div class="se24-grid">'+api.offers(s).filter(o=>!(s.publisherOffersRejected||[]).includes(o.id)).map(o=>card(o.studioName,row('Advance',fmt(o.advance))+row('Publisher share',Math.round(o.cut*100)+'%')+row('Marketing', '+'+o.marketing+' hype')+row('Deadline',o.termDays+' simulated days')+'<div class="se24-buttons">'+button('Accept','accept','data-id="'+esc(o.id)+'"')+button('Counteroffer','counter','data-id="'+esc(o.id)+'"')+button('Decline','reject','data-id="'+esc(o.id)+'"')+'</div>','OFFER')).join('')+'</div>')+
(historical.length?card('Previous publishing partnerships',historical.map(d=>row(d.studioName,Math.round(d.royalty*100)+'% royalties')).join(''),'HISTORY'):'');}
function culture(s){
const selected=s.workPolicy||'balanced';
return card('Company work policy','<p>Policies change actual operating costs, employee wellbeing, development speed and project bugs.</p><div class="se24-policy-grid">'+Object.entries(api.POLICIES).map(([id,p])=>'<button type="button" data-se24-act="policy" data-id="'+id+'" class="se24-policy '+(id===selected?'selected':'')+'"><strong>'+esc(p.name)+'</strong><small>'+fmt(p.cost)+'/day</small><small>'+(id==='intensive'?'Rapid progress, higher stress and bug risk':id==='sustainable'?'Restored energy and fewer bugs':id==='flexible'?'Better work-life balance':'Steady production, no added cost')+'</small></button>').join('')+'</div>','CURRENT: '+selected.toUpperCase())+
card('Employees & compensation','<p>Raises permanently increase payroll. Paid time off restores energy. Dismissals require severance and affect remaining staff morale.</p>'+s.staff.map(e=>'<div class="se24-employee"><strong>'+esc(e.name)+'</strong><small>'+esc(e.role||'Developer')+'</small>'+row('Monthly salary',fmt(e.salary))+row('Energy / Morale',Math.round(e.energy)+'% / '+Math.round(e.morale)+'%')+'<div class="se24-buttons">'+button('Raise 5%','raise','data-id="'+esc(e.id)+'" data-pct="5"')+button('Raise 10%','raise','data-id="'+esc(e.id)+'" data-pct="10"')+button('Paid time off','leave','data-id="'+esc(e.id)+'"')+(e.role?.includes('Founder')?'':button('Dismiss','dismiss','data-id="'+esc(e.id)+'"'))+'</div></div>').join(''),'YOUR TEAM');}
function milestones(s){
const f=api.forecast(s),rows=api.achievementRows(s);
return card('Business outlook','<p>Calculated from your actual career save; projections are estimates and do not guarantee future sales.</p><div class="se24-forecast">'+[['Cash',fmt(f.cash)],['Daily operating costs',fmt(f.dailyBurn)],['Estimated daily game sales',fmt(f.salesEstimate)],['Estimated net / day',fmt(f.netEstimate)]].map(([a,b])=>'<div><small>'+esc(a)+'</small><b>'+esc(b)+'</b></div>').join('')+'</div>'+row('Runway before sales',f.runwayDays+' days')+row('Monthly payroll & property',fmt(f.monthlyOverhead))+row('Active publishing deals',f.activeDeals),'FINANCE')+
card('Career achievements','<p>Complete each milestone, then claim its reward once. Unclaimed rewards remain available in your save.</p>'+rows.map(a=>'<div class="se24-goal"><div><strong>'+esc(a.name)+'</strong><small>'+a.progress.toLocaleString()+' / '+a.target.toLocaleString()+' · '+fmt(a.reward)+' + '+a.rep+' reputation</small><progress value="'+a.progress+'" max="'+a.target+'"></progress></div>'+button(a.claimed?'Collected':a.earned?'Claim reward':'Locked','claim','data-id="'+esc(a.id)+'"',!a.earned||a.claimed)+'</div>').join(''),'12 GOALS');}
function pricing(s){const mod=g.StudioEmpirePricing24;if(!mod)return card('Pricing module unavailable','<p>Try refreshing the page.</p>');
if(!s.games.length)return card('Your games','<p>Release a game first. After launch, you can experiment with permanent pricing and timed discounts to influence daily sales.</p>','NO RELEASES');
return card('Pricing & distribution','<p>Price changes affect demand every simulated day. Raising prices increases revenue per copy but reduces sales volume. Lowering prices increases volume but earns less per copy. Changes have a 14-day cooldown.</p>'+s.games.slice(0,30).map(game=>{
const base=mod.priceFor(game),current=Number(game.price)||base,f=mod.forecast(game,current),active=!!game.saleEndsDay,wait=Math.max(0,(Number.isFinite(Number(game.lastPriceDay))?Number(game.lastPriceDay):-100)+14-(Number(s.dailySerial)||0));
const choices=[Math.max(5,Math.round(base*.75)),base,Math.min(90,Math.round(base*1.25))];
return '<div class="se24-employee"><strong>'+esc(game.name)+'</strong><small>'+esc(game.genre)+' · '+esc(game.platform)+'</small>'+row('Current price',fmt(current))+row('Estimated demand vs launch',f.relativeUnits+'%')+row('Gross revenue vs launch',f.relativeGross+'%')+(active?'<p>Limited-time sale · '+Math.max(0,game.saleEndsDay-(Number(s.dailySerial)||0))+' days remaining</p>':wait>0?'<p>Pricing cooldown · '+wait+' days left</p>':'')+'<div class="se24-buttons">'+choices.map(price=>button('Set '+fmt(price),'price','data-id="'+esc(game.id)+'" data-price="'+price+'"',active||wait>0||current===price)).join('')+'</div><div class="se24-buttons">'+button('20% off · 14 days','sale','data-id="'+esc(game.id)+'" data-pct="20" data-days="14"',active||wait>0)+button('30% off · 7 days','sale','data-id="'+esc(game.id)+'" data-pct="30" data-days="7"',active||wait>0)+'</div></div>'}).join(''),'LIVE SALES ECONOMY');}
function render(){const s=core.read();if(!s){view.innerHTML='<p>Create or continue a career to use these systems.</p>';return;}
view.innerHTML='<header class="se24-head"><div><small>STUDIO MANAGEMENT</small><h2>'+title[section]+'</h2></div><strong>'+esc(s.studio)+'</strong></header>'+(notice?'<div class="se24-status" role="status">'+esc(notice)+'</div>':'')+(section==='publishers'?publishers(s):section==='culture'?culture(s):section==='milestones'?milestones(s):pricing(s));}
function open(page){if(!title[page])return false;section=page;notice='';ui.open();industry?.close();g.StudioEmpireProductionUI22?.close();body.hidden=true;const other=document.getElementById('empire-v18-content');if(other)other.hidden=true;view.hidden=false;render();view.focus({preventScroll:true});return true;}
function close(){view.hidden=true;body.hidden=false;}
view.addEventListener('click',e=>{const b=e.target.closest('[data-se24-act]');if(!b)return;let r;const id=b.dataset.id,act=b.dataset.se24Act;
if(['accept','counter','reject'].includes(act))r=api.deal(id,act);
else if(act==='cancel'){if(!confirm('Cancel the publisher contract and pay the cancellation fee?'))return;r=api.cancel();}
else if(act==='policy')r=api.setPolicy(id);
else if(act==='raise')r=api.raise(id,Number(b.dataset.pct));
else if(act==='leave')r=api.leave(id);
else if(act==='dismiss'){if(!confirm('Dismiss this employee and pay severance?'))return;r=api.dismiss(id);}
else if(act==='claim')r=api.claim(id);
else if(act==='price')r=g.StudioEmpirePricing24?.change(id,Number(b.dataset.price));
else if(act==='sale')r=g.StudioEmpirePricing24?.discount(id,Number(b.dataset.pct),Number(b.dataset.days));
if(!r)return;notice=r.ok?'Saved. Career finances and progress updated.':'Action unavailable: '+String(r.reason||'UNKNOWN').replaceAll('_',' ').toLowerCase();render();ui.render();});
g.StudioEmpireExpansionUI24={open,close,render,get active(){return !view.hidden},debug(){return{page:section,visible:!view.hidden}}};
})(window);