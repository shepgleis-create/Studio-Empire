/* Studio Empire v0.24 — publisher negotiations, workforce operations, and career milestones.
 All state lives in the current career save and uses the existing transaction safeguards. */
(function(g){'use strict';
const core=g.StudioEmpireCareer,industry=g.StudioEmpireIndustry;if(!core||!industry)return;
const n=(x,d=0)=>Number.isFinite(+x)?+x:d,clamp=(x,a,b)=>Math.max(a,Math.min(b,x)),no=reason=>({ok:false,reason}),day=s=>n(s.dailySerial,n(s.weekNumber)*7);
const POLICIES={balanced:{name:'Balanced',cost:0,energy:0,morale:0,progress:0,bugs:0},flexible:{name:'Flexible',cost:150,energy:.17,morale:.075,progress:.003,bugs:0},sustainable:{name:'Healthy Studio',cost:350,energy:.45,morale:.14,progress:-.01,bugs:-.018},intensive:{name:'Intensive Sprint',cost:240,energy:-.38,morale:-.28,progress:.11,bugs:.045}};
const goals=[
{id:'first',name:'First Release',target:1,get:s=>s.games.length,reward:2500,rep:1},
{id:'trilogy',name:'Growing Library',target:3,get:s=>s.games.length,reward:9000,rep:2},
{id:'fandom',name:'Cult Following',target:1000,get:s=>n(s.fans),reward:5000,rep:2},
{id:'regional',name:'Household Name',target:20000,get:s=>n(s.fans),reward:25000,rep:3},
{id:'staff',name:'Teamwork',target:5,get:s=>s.staff.length,reward:4500,rep:1},
{id:'ten',name:'Department Heads',target:10,get:s=>s.staff.length,reward:12000,rep:2},
{id:'office',name:'A Real Office',target:2,get:s=>s.office,reward:7000,rep:1},
{id:'campus',name:'Industry Landmark',target:4,get:s=>s.office,reward:30000,rep:4},
{id:'quality',name:'Critical Darling',target:85,get:s=>s.games.reduce((a,x)=>Math.max(a,n(x.score)),0),reward:12000,rep:3},
{id:'research',name:'Pioneer',target:5,get:s=>(s.technologies||[]).length,reward:7500,rep:2},
{id:'publisher',name:'Signed!',target:1,get:s=>(s.publisherDeals||[]).filter(x=>x.status==='delivered').length,reward:7000,rep:2},
{id:'holding',name:'Corporate Family',target:1,get:s=>(s.companies||[]).filter(x=>x.owned).length,reward:10000,rep:2}
];
function transaction(action,fn,store=g.localStorage){return industry.transaction('exp24-'+action,fn,store)}
function offers(s){if(!s?.project||s.project.ready||(s.publisherDeals||[]).some(d=>d.projectId===s.project.id&&['active','late'].includes(d.status)))return[];
const p=s.project,studios=(s.companies||[]).filter(c=>!c.owned&&!c.merged&&n(c.cash)>10000).sort((a,b)=>n(b.value)-n(a.value));
const sources=studios.length?studios:[{id:'independent',name:'Independent Publishing Group',rep:32}];
const cost=Math.max(1000,n(p.upfront)+n(p.weeklyCost)*n(p.weeks));
return[0,1,2].map(i=>{const c=sources[(Math.abs(n(p.id))+i)%sources.length];const days=clamp(Math.round(n(p.weeks)*7*(1.3+i*.22)),24,360);return{id:String(p.id)+'-'+c.id+'-'+i,projectId:p.id,studioId:String(c.id),studioName:c.name,advance:Math.round(cost*(.38+.13*i)),cut:.19+.085*i,marketing:Math.round(10+i*5+n(c.rep,35)/12),termDays:days,deadline:day(s)+days}})}
function deal(id,action,store=g.localStorage){if(!['accept','counter','reject'].includes(action))return no('INVALID_ACTION');
return transaction('publisher-'+action,s=>{const o=offers(s).find(x=>x.id===id);if(!o)return no('OFFER_UNAVAILABLE');
s.publisherOffersRejected=Array.isArray(s.publisherOffersRejected)?s.publisherOffersRejected:[];
if(s.publisherOffersRejected.includes(o.id))return no('OFFER_REJECTED');
if(action==='reject'){s.publisherOffersRejected.push(o.id);return{declined:true}}
if(action==='counter'){const average=s.staff.reduce((v,x)=>v+n(x.skill,50),0)/s.staff.length;
const chance=(n(s.project.id)*17+day(s)*7+o.id.length*11)%100;
if(chance>=clamp(30+n(s.rep)*.45+average*.2,25,85)){s.publisherOffersRejected.push(o.id);return{counterRejected:true}}
o.advance=Math.round(o.advance*1.17);o.cut=Math.max(.12,o.cut-.055)}
s.publisherDeals=Array.isArray(s.publisherDeals)?s.publisherDeals:[];
const contract={...o,paidAdvance:o.advance,royalty:1-o.cut,status:'active',signedDay:day(s)};
s.publisherDeals.push(contract);s.project.publisherDealId=contract.id;
s.cash+=contract.advance;s.totalRevenue=n(s.totalRevenue)+contract.advance;s.yearlyProfit=n(s.yearlyProfit)+contract.advance;
s.hype=clamp(n(s.hype)+o.marketing,0,100);
s.history=[{date:s.month+'/'+(s.day||1)+'/'+s.year,text:'Signed '+o.studioName+' publisher deal for '+s.project.name},...(s.history||[])].slice(0,60);
return{contract}},store)}
function cancel(store=g.localStorage){return transaction('cancel-publisher',s=>{const d=(s.publisherDeals||[]).find(x=>x.projectId===s.project?.id&&['active','late'].includes(x.status));if(!d)return no('NO_ACTIVE_PUBLISHER');
const cost=Math.round(d.paidAdvance*1.3);if(s.cash<cost)return{ok:false,reason:'INSUFFICIENT_CASH',cost};
s.cash-=cost;s.totalSpent=n(s.totalSpent)+cost;s.yearlyProfit=n(s.yearlyProfit)-cost;d.status='cancelled';s.project.publisherDealId=null;return{cost}},store)}
function settle(s){for(const d of s.publisherDeals||[]){if(!['active','late'].includes(d.status))continue;
const game=s.games.find(x=>x.id===d.projectId);
if(game){game.royalty=Math.min(n(game.royalty,1),d.royalty);game.publisher=d.studioName;game.publisherCut=d.cut;d.lateDelivery=d.status==='late';d.status='delivered';d.deliveredDay=day(s)}
else if(d.status==='active'&&day(s)>d.deadline){const fee=Math.min(Math.max(0,s.cash),Math.round(d.paidAdvance*.2));s.cash-=fee;s.totalSpent=n(s.totalSpent)+fee;s.yearlyProfit=n(s.yearlyProfit)-fee;s.rep=clamp(n(s.rep)-2,0,100);d.status='late';d.lateFee=fee}}}
function setPolicy(id,store=g.localStorage){if(!POLICIES[id])return no('INVALID_POLICY');return transaction('staff-policy',s=>{s.workPolicy=id;return{policy:id}},store)}
function raise(id,percent=10,store=g.localStorage){if(![5,10,20].includes(+percent))return no('INVALID_RAISE');
return transaction('raise',s=>{const person=s.staff.find(x=>String(x.id)===String(id));if(!person)return no('EMPLOYEE_NOT_FOUND');
const old=n(person.salary);person.salary=Math.ceil(old*(1+percent/100));person.morale=clamp(n(person.morale,80)+percent*.6,20,100);
return{name:person.name,monthlyIncrease:person.salary-old}},store)}
function leave(id,store=g.localStorage){return transaction('time-off',s=>{const p=s.staff.find(x=>String(x.id)===String(id));if(!p)return no('EMPLOYEE_NOT_FOUND');
if(day(s)<n(p.lastLeaveDay,-100)+14)return no('LEAVE_COOLDOWN');
const cost=Math.ceil(n(p.salary)/15);if(s.cash<cost)return{ok:false,reason:'INSUFFICIENT_CASH',cost};
s.cash-=cost;s.totalSpent=n(s.totalSpent)+cost;s.yearlyProfit=n(s.yearlyProfit)-cost;p.lastLeaveDay=day(s);p.energy=clamp(n(p.energy,80)+20,0,100);p.morale=clamp(n(p.morale,80)+8,0,100);return{cost}},store)}
function dismiss(id,store=g.localStorage){return transaction('dismissal',s=>{const i=s.staff.findIndex(p=>String(p.id)===String(id));if(i<0)return no('EMPLOYEE_NOT_FOUND');
const p=s.staff[i];if(s.staff.length<=1||p.role?.includes('Founder'))return no('FOUNDER_PROTECTED');const fee=Math.ceil(n(p.salary)*.5);if(s.cash<fee)return{ok:false,reason:'INSUFFICIENT_CASH',cost:fee};
s.cash-=fee;s.totalSpent=n(s.totalSpent)+fee;s.yearlyProfit=n(s.yearlyProfit)-fee;s.staff.splice(i,1);s.staff.forEach(e=>e.morale=clamp(n(e.morale,80)-3,20,100));return{name:p.name,fee}},store)}
function onDay(s){const policy=POLICIES[s.workPolicy]||POLICIES.balanced;
if(policy.cost){s.cash-=policy.cost;s.totalSpent=n(s.totalSpent)+policy.cost;s.yearlyProfit=n(s.yearlyProfit)-policy.cost}
for(const p of s.staff){p.energy=clamp(n(p.energy,80)+policy.energy,35,100);p.morale=clamp(n(p.morale,80)+policy.morale,20,100)}
if(s.project&&!s.project.ready){s.project.progress=Math.min(n(s.project.weeks,12),n(s.project.progress)+policy.progress);s.project.bugs=clamp(n(s.project.bugs)+policy.bugs,0,30);if(s.project.progress>=n(s.project.weeks,12))s.project.ready=true}
settle(s);s.achievements=Array.isArray(s.achievements)?s.achievements:[];
for(const goal of goals){if(goal.get(s)>=goal.target&&!s.achievements.some(a=>a.id===goal.id))s.achievements.push({id:goal.id,unlockedDay:day(s),claimed:false})}}
function achievementRows(s){return goals.map(goal=>{const entry=(s.achievements||[]).find(a=>a.id===goal.id);return{id:goal.id,name:goal.name,target:goal.target,progress:Math.min(goal.target,goal.get(s)),reward:goal.reward,rep:goal.rep,earned:goal.get(s)>=goal.target,claimed:!!entry?.claimed}})}
function claim(id,store=g.localStorage){const goal=goals.find(x=>x.id===id);if(!goal)return no('INVALID_GOAL');return transaction('milestone-claim',s=>{
if(goal.get(s)<goal.target)return no('GOAL_NOT_COMPLETE');
s.achievements=Array.isArray(s.achievements)?s.achievements:[];
let a=s.achievements.find(x=>x.id===id);if(!a){a={id,unlockedDay:day(s),claimed:false};s.achievements.push(a)}
if(a.claimed)return no('ALREADY_CLAIMED');a.claimed=true;a.claimedDay=day(s);
s.cash+=goal.reward;s.totalRevenue=n(s.totalRevenue)+goal.reward;s.yearlyProfit=n(s.yearlyProfit)+goal.reward;s.rep=clamp(n(s.rep)+goal.rep,0,100);return{reward:goal.reward,rep:goal.rep}},store)}
function forecast(s){const p=POLICIES[s.workPolicy]||POLICIES.balanced;
const monthly=s.staff.reduce((a,x)=>a+n(x.salary),0)+([0,1500,3100,6800,16000][s.office]||1500)+n(s.engine,1)*300;
const daily=Math.ceil(monthly*12/365+(s.project?n(s.project.weeklyCost)/7:0)+p.cost);
const sales=(s.games||[]).reduce((sum,x)=>{const age=n(s.weekNumber)-n(x.releaseWeek);if(age<0||age>80)return sum;
const platform=core.PLATFORMS.find(p=>p.id===x.platform)||core.PLATFORMS[0];
return sum+Math.floor(n(x.initialSales)*.6*Math.pow(.94,age)/7)*n(x.price,16)*n(x.royalty,1)*n(platform.royalty,1)},0);
return{cash:n(s.cash),dailyBurn:daily,salesEstimate:Math.floor(sales),netEstimate:Math.floor(sales-daily),runwayDays:Math.floor(Math.max(0,n(s.cash))/Math.max(1,daily)),monthlyOverhead:monthly,activeDeals:(s.publisherDeals||[]).filter(x=>['active','late'].includes(x.status)).length}}
const originalTransaction=industry.transaction;
industry.transaction=function(action,fn,store=g.localStorage){if(action==='daily-simulation')return originalTransaction(action,s=>{const r=fn(s);if(r?.ok!==false)onDay(s);return r},store);return originalTransaction(action,fn,store)};
const originalRelease=core.releaseProject;core.releaseProject=function(store=g.localStorage){const r=originalRelease(store);if(r.ok){const settled=transaction('publisher-release',s=>{settle(s);return{}},store);r.publisherSettled=settled.ok}return r};
g.StudioEmpireExpansion24={offers,deal,cancel,setPolicy,raise,leave,dismiss,achievementRows,claim,forecast,POLICIES,goals};
})(typeof window!=='undefined'?window:globalThis);