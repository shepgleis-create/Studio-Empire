/* v0.22 - Project Production Lab: original career data and economics */
(function(g){'use strict';
const career=g.StudioEmpireCareer,industry=g.StudioEmpireIndustry;if(!career||!industry)return;
const ROLES=Object.freeze({generalist:"Generalist",design:"Game Design",programming:"Programming",art:"Art & Animation",qa:"Quality Assurance",audio:"Audio"});
const STRATEGIES=Object.freeze({balanced:{name:"Balanced",cost:1,speed:0,bugs:0,morale:0},quality:{name:"Quality First",cost:1.28,speed:-.12,bugs:-.35,morale:.1},crunch:{name:"Crunch",cost:1.4,speed:.52,bugs:.38,morale:-1.5},lean:{name:"Lean Production",cost:.76,speed:-.2,bugs:.22,morale:-.3}});
const FOCUS=Object.freeze({balanced:[60,60,60],story:[85,35,60],systems:[40,90,50],visual:[40,55,85],simulation:[80,80,20],polish:[55,55,70]});
const num=(x,d=0)=>Number.isFinite(Number(x))?Number(x):d,clamp=(x,a,b)=>Math.min(b,Math.max(a,x)),fail=reason=>({ok:false,reason});
function changeFocus(points,store=g.localStorage){if(!Array.isArray(points)||points.length!==3||points.some(x=>!Number.isInteger(x)||x<0||x>100)||points.reduce((a,b)=>a+b,0)!==180)return fail("INVALID_180_POINT_BUDGET");return industry.transaction("production-focus",s=>{if(!s.project||s.project.ready)return fail("NO_ACTIVE_DEVELOPMENT");s.project.focus=points.slice();return{focus:s.project.focus};},store);}
function setStrategy(id,store=g.localStorage){const mode=STRATEGIES[id];if(!mode)return fail("INVALID_STRATEGY");return industry.transaction("production-policy",s=>{const p=s.project;if(!p||p.ready)return fail("NO_ACTIVE_DEVELOPMENT");const baseline=Math.max(100,Math.round(num(p.baseWeeklyCost,p.weeklyCost)));p.baseWeeklyCost=baseline;p.strategy=id;p.weeklyCost=Math.max(100,Math.round(baseline*mode.cost));return{strategy:id,weeklyCost:p.weeklyCost};},store);}
function setDeadline(weeks,store=g.localStorage){if(!Number.isInteger(weeks)||weeks<4||weeks>52)return fail("INVALID_TARGET");return industry.transaction("production-target",s=>{if(!s.project||s.project.ready)return fail("NO_ACTIVE_DEVELOPMENT");s.project.targetWeek=num(s.weekNumber)+weeks;s.project.deadlineWeeks=weeks;return{targetWeek:s.project.targetWeek};},store);}
function specialize(id,role,store=g.localStorage){if(!Object.prototype.hasOwnProperty.call(ROLES,role))return fail("INVALID_ROLE");return industry.transaction("staff-specialization",s=>{const person=s.staff.find(p=>String(p.id)===String(id));if(!person)return fail("EMPLOYEE_NOT_FOUND");person.specialty=role;return{employee:person.name,role};},store);}
function phase(progress){return progress>=1?"ready":progress>=.78?"polish":progress>=.43?"production":progress>=.18?"prototype":"concept";}
function applyWeek(previous,store=g.localStorage){
 const state=career.read(store);if(!state?.project||!previous?.project||state.project.id!==previous.project.id)return{ok:true,skipped:true};
 if(state.project.lastProductionWeek===state.weekNumber)return{ok:true,already:true};
 return industry.transaction("production-week",s=>{
 const p=s.project;if(!p||p.id!==previous.project.id||p.lastProductionWeek===s.weekNumber)return{already:true};
 const mode=STRATEGIES[p.strategy]||STRATEGIES.balanced;
 const counts={};for(const person of s.staff)counts[person.specialty||"generalist"]=(counts[person.specialty||"generalist"]||0)+1;
 const developers=(counts.design||0)+(counts.programming||0);
 p.progress=clamp(num(p.progress)+mode.speed+Math.min(.24,developers*.07),0,num(p.weeks,12));if(p.ready)p.progress=num(p.weeks,12);
 p.bugs=clamp(num(p.bugs)+mode.bugs-Math.min(.26,(counts.qa||0)*.12),0,30);
 p.match=clamp(num(p.match)+Math.min(.5,(developers+(counts.art||0)+(counts.audio||0))*.1),0,25);
 const genre=["Action","Adventure","RPG","Simulation","Strategy","Puzzle","Racing","Sports"][num(s.trendIndex)%8];p.trend=clamp(num(p.trend)+(genre===p.genre ? .25 : 0),0,15);
 for(const person of s.staff){person.morale=clamp(num(person.morale,80)+mode.morale,20,100);person.energy=clamp(num(person.energy,80)+(p.strategy==="crunch"?-.5:0),30,100);}
 s.morale=Math.round(s.staff.reduce((sum,p)=>sum+num(p.morale,80),0)/s.staff.length);
 if(Number.isInteger(p.targetWeek)&&s.weekNumber>p.targetWeek&&!p.ready){p.deadlineMissed=true;p.bugs=clamp(p.bugs+.14,0,30);}
 p.velocity=Math.max(.01,num(p.progress)-num(previous.project.progress));p.lastProductionWeek=s.weekNumber;
 p.milestones=Array.isArray(p.milestones)?p.milestones:[];const step=phase(p.progress/Math.max(1,num(p.weeks,12)));
 if(step!==p.stage){p.stage=step;p.milestones.push({phase:step,week:s.weekNumber});s.history=[{date:"W"+s.weekNumber+" / "+s.year,text:p.name+" reached "+step+"."},...(s.history||[])].slice(0,45);}
 if(p.progress>=p.weeks&&!p.ready)p.ready=true;
 return{stage:step,bugs:p.bugs,progress:p.progress};
 },store);
}
const baseAdvance=career.advanceWeek;career.advanceWeek=function(store=g.localStorage){const before=career.read(store),result=baseAdvance(store);if(!result?.ok)return result;const adjusted=applyWeek(before,store);return{...result,production:adjusted?.ok?adjusted:null,productionWarning:adjusted?.ok?null:adjusted?.reason};};
function report(s){if(!s)return null;const p=s.project;if(!p)return{active:false,staff:s.staff.length};const weeks=Math.max(1,num(p.weeks,12)),remaining=Math.max(0,weeks-num(p.progress)),velocity=Math.max(.45,num(p.velocity,.85)),estimate=Math.ceil(remaining/velocity);return{active:true,title:p.name,stage:p.stage||phase(num(p.progress)/weeks),progress:Math.round(num(p.progress)/weeks*100),weeksRemaining:estimate,costRemaining:estimate*(num(p.weeklyCost)+Math.round(s.staff.reduce((sum,p)=>sum+num(p.salary),0)/4)),deadlineWeek:p.targetWeek||null,missed:!!p.deadlineMissed,bugs:num(p.bugs),strategy:p.strategy||"balanced",focus:Array.isArray(p.focus)?p.focus:[60,60,60],milestones:p.milestones||[],team:s.staff.map(p=>({id:p.id,name:p.name,specialty:p.specialty||"generalist"}))};}
g.StudioEmpireProduction22={ROLES,STRATEGIES,FOCUS,changeFocus,setStrategy,setDeadline,specialize,applyWeek,report,phase};
})(typeof window!=="undefined"?window:globalThis);
