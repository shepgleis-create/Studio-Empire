/* Studio Empire v0.23 daily simulation: one save-backed day per tick, seven-day rival accounting, no offline catchup. */
(function(g){'use strict';
const career=g.StudioEmpireCareer,industry=g.StudioEmpireIndustry,sim=g.StudioEmpireSimulation21;
if(!career||!industry||!sim)return;
const v=(x,d=0)=>Number.isFinite(+x)?+x:d,clamp=(n,a,b)=>Math.min(b,Math.max(a,n));
const monthCosts=[0,1500,3100,6800,16000],diff={story:.7,creative:.7,standard:1,hard:1.2,brutal:1.38};
function calendar(s){return new Date(Date.UTC(s.year,v(s.month,1)-1,v(s.day,(v(s.week,1)-1)*7+1)));}
function advanceDay(store=g.localStorage){
const before=career.read(store);if(!before)return{ok:false,reason:'NO_CAREER'};
if(before.finished||before.year>=2200)return{ok:false,reason:'CAREER_ENDED'};
if(before.project?.ready)return{ok:false,reason:'PROJECT_READY'};
let boundary=false;
const r=industry.transaction('daily-simulation',s=>{
const previousYear=s.year;const d=calendar(s);d.setUTCDate(d.getUTCDate()+1);s.year=d.getUTCFullYear();s.month=d.getUTCMonth()+1;s.day=d.getUTCDate();s.week=Math.ceil(s.day/7);
s.dailySerial=v(s.dailySerial,v(s.weekNumber)*7)+1;boundary=s.dailySerial%7===0;if(boundary)s.weekNumber=v(s.weekNumber)+1;
const monthly=s.staff.reduce((a,x)=>a+v(x.salary),0)+monthCosts[s.office]+v(s.engine,1)*300;
const burn=Math.round(monthly*(diff[s.difficulty]||1)*12/365);s.cash-=burn;s.totalSpent=v(s.totalSpent)+burn;s.yearlyProfit=v(s.yearlyProfit)-burn;
if(s.project){const p=s.project,avg=s.staff.reduce((a,x)=>a+v(x.skill),0)/s.staff.length,energy=s.staff.reduce((a,x)=>a+v(x.energy,80),0)/s.staff.length/100;
const modes={balanced:[0,0,0],quality:[-.12,-.35,.1],crunch:[.52,.38,-1.5],lean:[-.2,.22,-.3]},m=modes[p.strategy]||modes.balanced;
const roles=s.staff.reduce((o,x)=>(o[x.specialty||'generalist']=(o[x.specialty||'generalist']||0)+1,o),{});
const speed=clamp((.7+avg/75)*(.55+s.staff.length*.155)*(.7+energy*.3)*(v(s.morale,80)<45?.72:1),.45,3.6);
const growth=Math.max(.02,speed/7+(m[0]+Math.min(.24,(v(roles.programming)+v(roles.design))*.07))/7);
p.progress=Math.min(v(p.weeks,12),v(p.progress)+growth);
p.rp=v(p.rp)+growth*.6;s.rp=v(s.rp)+growth*.85;
p.bugs=clamp(v(p.bugs)+((.75-avg/100)*.31+m[1]-v(roles.qa)*.12)/7,0,30);
p.match=clamp(v(p.match)+Math.min(.5,(v(roles.programming)+v(roles.design)+v(roles.art)+v(roles.audio))*.10)/7,0,25);
if(Number.isInteger(p.targetWeek)&&s.weekNumber>p.targetWeek){p.deadlineMissed=true;p.bugs=clamp(p.bugs+.02,0,30);}
const cost=Math.round(v(p.weeklyCost)/7);s.cash-=cost;s.totalSpent+=cost;s.yearlyProfit-=cost;
const ratio=p.progress/Math.max(1,v(p.weeks,12)),stage=ratio>=1?'ready':ratio>=.78?'polish':ratio>=.43?'production':ratio>=.18?'prototype':'concept';
if(stage!==p.stage){p.stage=stage;p.milestones=Array.isArray(p.milestones)?p.milestones:[];p.milestones.push({phase:stage,day:s.dailySerial,week:s.weekNumber});}
if(ratio>=1){p.ready=true;p.progress=v(p.weeks,12);}
s.staff.forEach(e=>e.morale=clamp(v(e.morale,80)+m[2]/7,20,100));
}
let revenue=0;for(const game of s.games){const age=v(s.weekNumber)-v(game.releaseWeek,s.weekNumber);if(age<0||age>80)continue;const platform=career.PLATFORMS.find(p=>p.id===game.platform)||career.PLATFORMS[0];const demand=g.StudioEmpirePricing24?.demand(game,game.price)??1;const copies=Math.floor(v(game.initialSales)*.60*Math.pow(.94,age)/7*demand),earned=Math.round(copies*v(game.price,16)*v(game.royalty,1)*platform.royalty);
game.sales=v(game.sales)+copies;game.totalRevenue=v(game.totalRevenue)+earned;revenue+=earned;}
s.cash+=revenue;s.totalRevenue=v(s.totalRevenue)+revenue;s.yearlyProfit=v(s.yearlyProfit)+revenue;
s.staff.forEach(e=>{e.energy=clamp(v(e.energy,80)-(s.project?.23:.06),35,100);e.morale=clamp(v(e.morale,80)+(s.cash>=0?.013:-.1),25,100)});
s.morale=Math.round(s.staff.reduce((a,e)=>a+v(e.morale,80),0)/s.staff.length);
if(boundary&&s.weekNumber%13===0)s.trendIndex=(v(s.trendIndex)+1)%8;
if(s.year!==previousYear){s.finance=[...(s.finance||[]),{date:'JAN '+s.year,profit:s.yearlyProfit,cash:s.cash}].slice(-60);s.yearlyProfit=0;}
return {date:s.day,month:s.month,year:s.year,revenue,burn,projectReady:!!s.project?.ready};
},store);
if(!r.ok)return r;
const rivals=boundary?industry.week(store):null;
const contracts=boundary?g.StudioEmpireRivals23?.weekly?.(store):null;
return {...r,weeklyBoundary:boundary,rivalUpdate:rivals,contracts};
}
function controller({core=career,storage=g.localStorage,now=()=>Date.now(),onChange=()=>{},prefs={}}){
const config={speed:[0,1,2,4,8].includes(+prefs.speed)?+prefs.speed:1,autoRelease:prefs.autoRelease!==false,notifications:prefs.notifications!==false};
let last=now(),progress=0,active=true,reason='',ticks=0;const PERIOD=1400;
function publish(){const result=core.releaseProject(storage);if(result.ok)onChange({type:'release',game:result.game,state:core.read(storage)});return result;}
function step(){const s=core.read(storage);if(!s)return{ok:false,reason:'NO_CAREER'};
if(s.project?.ready){if(!config.autoRelease)return{ok:false,reason:'PROJECT_READY'};const pub=publish();if(!pub.ok)return pub;}
const r=advanceDay(storage);if(r.ok){ticks++;let after=core.read(storage);onChange({type:'week',week:after.dailySerial,state:after,details:r});if(after.project?.ready&&config.autoRelease)publish();}
return r;}
function update(t=now(),allowed=true){const delta=clamp(t-last,0,1000);last=t;if(!active||!allowed||!config.speed)return{advanced:0,progress,reason:!allowed?'INACTIVE':reason||'PAUSED'};
progress+=delta*config.speed;let advanced=0;while(progress>=PERIOD&&advanced<6){const r=step();if(!r.ok){reason=r.reason||'SIMULATION_FAILED';active=false;progress=0;onChange({type:'blocked',reason});break;}advanced++;progress-=PERIOD;reason='';}
return{advanced,progress,reason};}
return {step,update,setSpeed(n){n=+n;if(![0,1,2,4,8].includes(n))return false;config.speed=n;active=true;reason='';last=now();onChange({type:'speed',speed:n});return true;},resume(){active=true;reason='';last=now();return true;},status(){return{...config,active,reason,ticks,progress,periodMs:PERIOD}},prefs:()=>({...config}),setAutoRelease(v){config.autoRelease=!!v;return{...config}},setNotifications(v){config.notifications=!!v;return{...config}}};
}
sim.createController=controller;sim.PERIOD_MS=1400;g.StudioEmpireDaily23={advanceDay,calendar,createController:controller};
})(typeof window!=='undefined'?window:globalThis);