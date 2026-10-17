/* Studio Empire v0.21 — continuous time engine and genre-aware game titles. */
(function(global){'use strict';
const BANK={
Action:['Iron','Shadow','Crimson','Neon','Last','Nova','Rogue','Midnight','Velocity','Storm'],
Adventure:['Lost','Hidden','Beyond','Forgotten','Eternal','Wandering','Distant','Golden','Silent','First'],
RPG:['Elder','Mythic','Rune','Dragon','Fallen','Fate','Astral','Sacred','Ancient','Eclipse'],
Simulation:['City','Micro','Life','Grand','Urban','Open','World','Everyday','Ultimate','New'],
Strategy:['Iron','Empire','Frontier','Siege','Crown','Dominion','War','Dynasty','Order','Command'],
Puzzle:['Echo','Mind','Crystal','Spectrum','Lumen','Prism','Pattern','Puzzle','Shift','Hidden'],
Racing:['Nitro','Velocity','Apex','Redline','Turbo','Circuit','Midnight','Drift','Horizon','Limit'],
Sports:['Pro','Ultimate','Arena','Rival','Champion','Next','World','Legends','Elite','Dynamic']};
const TOPIC={
Fantasy:['Kingdom','Chronicles','Citadel','Sorcery','Relics','Dragons'],
Space:['Orbit','Starlight','Nebula','Galaxy','Outpost','Voyager'],
Detective:['Evidence','Casefiles','Alibi','Noir','Mystery','Cipher'],
Horror:['Nightfall','Wraith','Dread','Haunting','Abyss','Whispers'],
Medieval:['Throne','Keep','Banner','Crusade','Sovereigns','Sword'],
Robots:['Mech','Circuit','Automata','Protocol','Machine','Steel'],
'City Life':['Metropolis','District','Downtown','Skyline','Streets','Neighborhood'],
Pirates:['Tides','Corsairs','Blackwater','Reef','Sea','Treasure'],
'Wild West':['Outlaws','Dust','Sundown','Frontier','Desperados','Badlands'],
Sports:['Champions','League','Stadium','Cup','Finals','Allstars'],
History:['Legacy','Empire','Ages','Archives','Origins','Centuries'],
Nature:['Wildlands','Evergreen','Bloom','Oceans','Wilderness','Roots']};
const SUFFIX=['Origins','Unbound','Reborn','Odyssey','Horizons','Legacy','Zero','Ascension','Stories','Revolution','Awakening','Reckoning'];
const FORMATS=['pair','pair','pair','of','colon','single','edition'];
function hash(x){let n=2166136261>>>0;for(const c of String(x))n=Math.imul(n^c.charCodeAt(0),16777619)>>>0;return n;}
function rng(seed){let n=(seed>>>0)||0x9e3779b9;return()=>{n+=0x6d2b79f5;let t=n;t=Math.imul(t^(t>>>15),t|1);t^=t+Math.imul(t^(t>>>7),t|61);return((t^(t>>>14))>>>0)/4294967296;};}
const choose=(r,a)=>a[Math.floor(r()*a.length)];
function generate({genre='Adventure',topic='Fantasy',existing=[],seed,series=''}={}){
const used=new Set(existing.map(x=>String(x).trim().toLowerCase())),a=BANK[genre]||BANK.Adventure,b=TOPIC[topic]||TOPIC.Fantasy;
const r=rng(seed===undefined?hash(Date.now()+':'+Math.random()):hash(seed));
for(let i=0;i<180;i++){
 const prefix=choose(r,a),subject=choose(r,b),format=choose(r,FORMATS);let title;
 if(series&&i%8===0)title=series+': '+choose(r,SUFFIX);
 else if(format==='of')title=subject+' of '+choose(r,['Tomorrow','Fire','Fate','Shadows','Legends','Dreams']);
 else if(format==='colon')title=prefix+' '+subject+': '+choose(r,SUFFIX);
 else if(format==='single')title=subject+' '+choose(r,SUFFIX);
 else if(format==='edition')title=prefix+' '+subject+' '+choose(r,['II','III','X','2040','Zero']);
 else title=prefix+' '+subject;
 if(title.length<=45&&!used.has(title.toLowerCase()))return title;
}
return('Untitled '+String(genre).slice(0,16)+' '+(Math.floor(r()*9900)+100)).slice(0,45);
}
function suggestions(opts={}){const arr=[];for(let i=0;i<5;i++)arr.push(generate({...opts,existing:[...(opts.existing||[]),...arr],seed:hash(String(opts.seed||'')+':'+i+':'+(opts.genre||'')+':'+(opts.topic||''))}));return arr;}
const SPEEDS=Object.freeze([0,1,2,4,8]),PERIOD_MS=10000,PREF='studio-empire-simulation-v21';
function normalize(p){return{speed:SPEEDS.includes(Number(p?.speed))?Number(p.speed):1,autoRelease:p?.autoRelease!==false,notifications:p?.notifications!==false};}
function createController({core,storage,now=()=>Date.now(),onChange=()=>{},prefs={}}){
let config=normalize(prefs),last=now(),progress=0,running=true,reason='',ticks=0;
function publish(){const r=core.releaseProject(storage);if(r?.ok)onChange({type:'release',game:r.game,state:core.read(storage)});return r;}
function step(){const before=core.read(storage);if(!before)return{ok:false,reason:'NO_CAREER'};if(before.finished)return{ok:false,reason:'CAREER_ENDED'};
 if(before.project?.ready){if(!config.autoRelease)return{ok:false,reason:'PROJECT_READY'};const released=publish();if(!released?.ok)return released;}
 let r=core.advanceWeek(storage);
 if(!r?.ok&&r?.reason==='RELEASE_GAME_FIRST'&&config.autoRelease){const release=publish();if(release?.ok)r=core.advanceWeek(storage);}
 if(r?.ok){ticks++;const after=core.read(storage);onChange({type:'week',week:after?.weekNumber,state:after,details:r});if(after?.project?.ready&&config.autoRelease)publish();}
 return r;
}
function update(ts=now(),allowed=true){const dt=Math.max(0,Math.min(1000,ts-last));last=ts;
 if(!running||!allowed||config.speed===0)return{advanced:0,progress,reason:reason||(!allowed?'INACTIVE':'PAUSED')};
 progress+=dt*config.speed;let advanced=0;
 while(progress>=PERIOD_MS&&advanced<2){progress-=PERIOD_MS;const r=step();if(!r?.ok){progress=0;reason=r?.reason||'SIMULATION_FAILED';running=false;onChange({type:'blocked',reason});break;}advanced++;reason='';}
 return{advanced,progress,reason};
}
function setSpeed(n){n=Number(n);if(!SPEEDS.includes(n))return false;config.speed=n;last=now();running=true;reason='';onChange({type:'speed',speed:n});return true;}
function setAutoRelease(v){config.autoRelease=!!v;return{...config};}
function setNotifications(v){config.notifications=!!v;return{...config};}
function resume(){running=true;reason='';last=now();return true;}
function status(){return{speed:config.speed,autoRelease:config.autoRelease,notifications:config.notifications,active:running,reason,ticks,progress,periodMs:PERIOD_MS};}
return{step,update,setSpeed,setAutoRelease,setNotifications,resume,status,prefs:()=>({...config})};
}
global.StudioEmpireSimulation21={BANK,TOPIC,SUFFIX,SPEEDS,PERIOD_MS,PREF,generate,suggestions,createController,normalize};
})(typeof window!=='undefined'?window:globalThis);
