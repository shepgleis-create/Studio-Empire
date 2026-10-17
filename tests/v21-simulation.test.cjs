const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const ctx={Date,Math,console};ctx.globalThis=ctx;vm.createContext(ctx);
vm.runInContext(fs.readFileSync('game3d/simulation-v21.js','utf8'),ctx);
const api=ctx.StudioEmpireSimulation21;
assert.equal(Object.keys(api.BANK).length,8);assert.equal(Object.keys(api.TOPIC).length,12);
for(const genre of Object.keys(api.BANK))for(const topic of Object.keys(api.TOPIC)){
  const title=api.generate({genre,topic,seed:genre+'/'+topic});
  assert.ok(title.length>=6&&title.length<=45);
  assert.equal(title,api.generate({genre,topic,seed:genre+'/'+topic}));
}
const arr=api.suggestions({genre:'RPG',topic:'Fantasy',seed:9});
assert.equal(new Set(arr).size,5);
assert.notEqual(api.generate({genre:'RPG',topic:'Fantasy',seed:9,existing:[api.generate({genre:'RPG',topic:'Fantasy',seed:9})]}),api.generate({genre:'RPG',topic:'Fantasy',seed:9}));
let timestamp=1000,week=0,games=[],project={ready:false,progress:0,name:'Garage Dreams'};
const storage={getItem:()=>null,setItem:()=>{}},core={read:()=>({weekNumber:week,project,games}),advanceWeek:()=>{week++;if(project){project.progress++;if(project.progress>=3)project.ready=true;}return{ok:true}},releaseProject:()=>{if(!project?.ready)return{ok:false,reason:'NOT_READY'};const g={name:project.name,score:82};games.push(g);project=null;return{ok:true,game:g}}};
const clock=api.createController({core,storage,now:()=>timestamp});
function run(ms,allowed=true){let advanced=0;for(let n=0;n<ms;n+=250){timestamp+=250;advanced+=clock.update(timestamp,allowed).advanced;}return advanced}
assert.equal(run(9500),0);assert.equal(run(750),1);
clock.setSpeed(4);assert.equal(run(2500),1);assert.equal(run(2500),1);assert.equal(games.length,1);
clock.setSpeed(8);assert.equal(run(1250),1);const w=week;clock.setSpeed(0);assert.equal(run(12000),0);assert.equal(week,w);
clock.setSpeed(1);assert.equal(run(40000,false),0);assert.equal(run(1000),0);
project={name:'Needs approval',ready:true};clock.setAutoRelease(false);const outcome=clock.step();assert.equal(outcome.reason,'PROJECT_READY');assert.equal(week,w);
assert.equal(api.normalize({speed:72}).speed,1);
console.log('PASS Studio Empire v0.21: 96 genre/topic pairs, 5 unique suggestions, 4 speeds, pause, inactive, auto-release and manual approval');