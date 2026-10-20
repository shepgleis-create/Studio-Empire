/* Studio Empire v0.23 deterministic daily economy + rival actions regression. */
const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
class Store{constructor(){this.values={}}getItem(k){return this.values[k]??null}setItem(k,v){this.values[k]=String(v)}removeItem(k){delete this.values[k]}}
const localStorage=new Store(),ctx={localStorage,console,Date,Math,JSON,Map,Set};ctx.window=ctx;ctx.globalThis=ctx;vm.createContext(ctx);
for(const file of ['career-simulation.js','industry-v18.js','production-v22.js','simulation-v21.js','daily-v23.js','rivals-v23.js']){
const path='game3d/'+file;vm.runInContext(fs.readFileSync(path,'utf8'),ctx,{filename:path});
}
let passed=0;function ok(v,msg){assert.ok(v,msg);passed++}function equal(a,b,msg){assert.equal(a,b,msg);passed++}
const core=ctx.StudioEmpireCareer,day=ctx.StudioEmpireDaily23,rivals=ctx.StudioEmpireRivals23;
ok(core.createCareer({studio:'Testing Studio',founder:'Founder',year:1975,difficulty:'standard'},localStorage).ok,'create');
equal(core.read().staff.length,1,'one founder');equal(core.read().year,1975);
let cash=core.read().cash;
ok(day.advanceDay().ok,'one day');equal(core.read().day,2,'advances calendar');equal(core.read().weekNumber,0,'no early weekly settlement');ok(core.read().cash<cash,'charges daily costs');
for(let i=0;i<6;i++)ok(day.advanceDay().ok,'daily tick');equal(core.read().weekNumber,1,'one weekly boundary');
equal(core.read().industryWeek,1,'one rival tick');
ok(core.startProject({name:'Game One',genre:'Simulation',topic:'City Life',platform:'kit',size:'indie'}).ok,'start project');
let progress=core.read().project.progress;ok(day.advanceDay().ok);ok(core.read().project.progress>progress,'daily development');
let t=0;const clock=ctx.StudioEmpireSimulation21.createController({core,storage:localStorage,now:()=>t,onChange:()=>{},prefs:{speed:1}});
const d0=core.read().dailySerial;clock.setSpeed(0);t+=999999;clock.update(t,true);equal(core.read().dailySerial,d0,'pause freezes');
clock.setSpeed(8);t+=999999;clock.update(t,false);equal(core.read().dailySerial,d0,'hidden tab freezes');
for(let i=0;i<4;i++){t+=250;clock.update(t,true)}ok(core.read().dailySerial>d0,'resumed runs');
let s=core.read();s.cash=900000;s.rep=45;localStorage.setItem(core.KEY,JSON.stringify(s));
let rival=core.read().companies.find(x=>!x.owned&&x.staff>=2);ok(rival,'rival available');
let r=rivals.contract(rival.id,'partner');ok(r.ok,'paid research partnership');equal(core.read().rivalDeals.length,1);
ok(!rivals.contract(rival.id,'partner').ok,'duplicate contract blocked');
let rp=core.read().rp;for(let i=0;i<7;i++)ok(day.advanceDay().ok);ok(core.read().rp>=rp,'research & settlement');
let hire=rivals.contract(rival.id,'recruit');ok(hire.ok,'rival employee hired');equal(core.read().staff.length,2);
console.log('Studio Empire v23 daily + rival regression:',passed,'assertions passed.');
