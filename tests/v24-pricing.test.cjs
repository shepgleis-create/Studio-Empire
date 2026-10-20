const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),path=require('node:path');
const root=path.join(__dirname,'../game3d');
class Store{constructor(){this.m=new Map()}getItem(k){return this.m.has(k)?this.m.get(k):null}setItem(k,v){this.m.set(k,String(v))}removeItem(k){this.m.delete(k)}}
let storage=new Store(),c={localStorage:storage,Date,Math,JSON,Map,Set,console};c.window=c;c.globalThis=c;vm.createContext(c);
for(const f of ['career-simulation.js','industry-v18.js','simulation-v21.js','daily-v23.js','empire-expansion-v24.js','pricing-v24.js'])vm.runInContext(fs.readFileSync(path.join(root,f),'utf8'),c,{filename:f});
const core=c.StudioEmpireCareer,day=c.StudioEmpireDaily23,prices=c.StudioEmpirePricing24;let checks=0;
function eq(a,b,msg){assert.equal(a,b,msg);checks++}function ok(a,msg){assert.ok(a,msg);checks++}
ok(core.createCareer({studio:'Price Studio',founder:'Founder',year:1975,difficulty:'standard'},storage).ok);
ok(core.startProject({name:'City Story',genre:'Simulation',topic:'City Life',platform:'kit',size:'indie'},storage).ok);
let state=core.read(storage);state.project.ready=true;state.project.progress=state.project.weeks;storage.setItem(core.KEY,JSON.stringify(state));
ok(core.releaseProject(storage).ok);
state=core.read(storage);const game=state.games[0],id=game.id,base=prices.priceFor(game);
eq(base,16);eq(prices.demand(game,base),1);
ok(prices.demand(game,8)>1);ok(prices.demand(game,32)<1);
eq(prices.change(id,2,storage).reason,'INVALID_PRICE');
ok(prices.change(id,24,storage).ok);eq(core.read(storage).games[0].price,24);
eq(prices.change(id,16,storage).reason,'PRICE_CHANGE_COOLDOWN');
for(let i=0;i<14;i++)ok(day.advanceDay(storage).ok,'daily step '+i);
ok(prices.change(id,16,storage).ok);
for(let i=0;i<14;i++)ok(day.advanceDay(storage).ok);
ok(prices.discount(id,20,7,storage).ok);
state=core.read(storage);const g=state.games[0];eq(g.price,13);ok(g.saleEndsDay>state.dailySerial);
eq(prices.discount(id,20,7,storage).reason,'SALE_ALREADY_ACTIVE');
eq(prices.change(id,32,storage).reason,'SALE_IN_PROGRESS');
for(let i=0;i<7;i++)ok(day.advanceDay(storage).ok);
state=core.read(storage);eq(state.games[0].price,16);ok(!state.games[0].saleEndsDay);
eq(prices.discount(id,50,7,storage).reason,'INVALID_SALE');
console.log('v24 pricing and discount assertions passed:',checks);