/* Studio Empire: browser 3D career controller.
 * Uses the original game save key/schema. Reads latest state for every action.
 * Pure transaction entry points accept a storage adapter for deterministic tests.
 * No passive timers that mutate careers; user advances weeks deliberately.
 */
(function(global){'use strict';
const KEY='studio-empire-reboot-v1',BACKUP='studio-empire-3d-backup-v1';
const SIZES=[{id:'indie',name:'Small / Indie',weeks:12,cost:3500,potential:.6},{id:'standard',name:'Standard',weeks:20,cost:9000,potential:1.25},{id:'blockbuster',name:'Blockbuster',weeks:31,cost:24000,potential:2.6}];
const PLATFORMS=[{id:'kit',name:'Home Microcomputer',year:1975,fee:0,share:.55,royalty:.94},{id:'pc',name:'Home Computer',year:1980,fee:0,share:.64,royalty:.92},{id:'arcade',name:'Arcade Cabinets',year:1980,fee:1500,share:.53,royalty:.74},{id:'vector',name:'Vector 8 Console',year:1982,fee:4000,share:.72,royalty:.68},{id:'pocket',name:'PocketPlay Handheld',year:1987,fee:6500,share:.85,royalty:.63},{id:'cd',name:'CD Horizon',year:1993,fee:9000,share:1.08,royalty:.67},{id:'net',name:'Online PC',year:1998,fee:13500,share:1.42,royalty:.86},{id:'mobile',name:'Touch Mobile',year:2008,fee:8000,share:1.68,royalty:.77}];
const TECH=[
{id:'fundamentals',name:'Production Planning',cost:12,year:1975,bonus:3,requires:[]},
{id:'save',name:'Save Game System',cost:16,year:1978,bonus:4,requires:[]},
{id:'arcadekit',name:'Arcade Hardware Tools',cost:18,year:1980,bonus:4,requires:[]},
{id:'audio',name:'Dynamic Sound',cost:22,year:1980,bonus:5,requires:[]},
{id:'qa',name:'QA Testing Lab',cost:24,year:1980,bonus:5,requires:[]},
{id:'marketing',name:'Market Research',cost:18,year:1980,bonus:3,requires:[]},
{id:'graphics',name:'Enhanced 2D Graphics',cost:32,year:1982,bonus:7,requires:[]},
{id:'localization',name:'Localization Pipeline',cost:34,year:1983,bonus:5,requires:[]},
{id:'ai',name:'Advanced Game AI',cost:42,year:1984,bonus:9,requires:[]},
{id:'pipeline',name:'Automated Build Pipeline',cost:39,year:1985,bonus:5,requires:['fundamentals']},
{id:'portable',name:'Handheld Development Kits',cost:46,year:1987,bonus:7,requires:['graphics']},
{id:'3d',name:'Early 3D Engine',cost:75,year:1990,bonus:14,requires:['graphics']},
{id:'cdrom',name:'CD-ROM Authoring',cost:58,year:1993,bonus:8,requires:['audio']},
{id:'online',name:'Multiplayer Networking',cost:105,year:1995,bonus:16,requires:['ai']},
{id:'digital',name:'Digital Distribution',cost:98,year:1998,bonus:13,requires:['online']},
{id:'physics',name:'Physics Middleware',cost:130,year:2000,bonus:19,requires:['3d']},
{id:'procedural',name:'Procedural World Building',cost:155,year:2004,bonus:20,requires:['physics']},
{id:'mobiletools',name:'Mobile Game SDK',cost:104,year:2007,bonus:10,requires:['digital']},
{id:'liveops',name:'Live Operations',cost:170,year:2009,bonus:19,requires:['online']},
{id:'cloud',name:'Cloud Game Services',cost:180,year:2012,bonus:23,requires:['liveops']},
{id:'vr',name:'Immersive VR Tech',cost:250,year:2016,bonus:26,requires:['3d']},
{id:'crossplay',name:'Cross-Platform Services',cost:300,year:2018,bonus:28,requires:['cloud']},
{id:'neural',name:'AI-Assisted Production',cost:390,year:2023,bonus:34,requires:['pipeline']},
{id:'worldsim',name:'Living World Simulation',cost:520,year:2028,bonus:40,requires:['neural','procedural']}
];
const HIRE={junior:{cost:1800,salary:1450,skill:30,label:'Junior Developer'},experienced:{cost:4800,salary:2750,skill:58,label:'Experienced Developer'},expert:{cost:11000,salary:4750,skill:84,label:'Senior Specialist'}};
const GENRES=['Action','Adventure','RPG','Simulation','Strategy','Puzzle','Racing','Sports'];
const PLATFORM_GATES={arcade:'arcadekit',vector:'arcadekit',pocket:'portable',cd:'cdrom',net:'digital',mobile:'mobiletools'};const GENRE_GATES={RPG:'save',Racing:'graphics'};const TOPIC_GATES={Robots:'ai',Space:'graphics'};
const TOPICS=['Fantasy','Space','Detective','Horror','Medieval','Robots','City Life','Pirates','Wild West','Sports','History','Nature'];
const SHIRTS=['#b96452','#608b99','#d4ab69','#668f76','#7867a4'], SKINS=['#ca977b','#a66853','#d5a989','#91614a'];
const clamp=(v,a,b)=>Math.min(b,Math.max(a,v));
const number=(x,d=0)=>Number.isFinite(Number(x))?Number(x):d;
const clean=(x,max=50)=>String(x??'').trim().replace(/[<>\x00-\x1f]/g,'').slice(0,max);
const money=x=>'$'+Math.round(number(x)).toLocaleString('en-US');
const availablePlatforms=s=>PLATFORMS.filter(p=>p.year<=s.year&&(!PLATFORM_GATES[p.id]||(s.technologies||[]).includes(PLATFORM_GATES[p.id])));
const availableGenres=s=>GENRES.filter(g=>!GENRE_GATES[g]||(s.technologies||[]).includes(GENRE_GATES[g]));
const availableTopics=s=>TOPICS.filter(t=>!TOPIC_GATES[t]||(s.technologies||[]).includes(TOPIC_GATES[t]));
const date=s=>['JAN','FEB','MAR','APR','MAY','JUN','JUL','AUG','SEP','OCT','NOV','DEC'][(s.month||1)-1]+' '+s.year;
const capacities=[0,4,6,12,24],rent=[0,1500,3100,6800,16000];
const diff={story:{cash:1.65,cost:.70,sales:1.60},standard:{cash:1,cost:1,sales:1},hard:{cash:.77,cost:1.22,sales:.76},brutal:{cash:.54,cost:1.48,sales:.54}};
function validate(s){return !!s&&Number.isFinite(s.cash)&&s.cash>-1e11&&s.cash<1e14&&Number.isInteger(s.year)&&s.year>=1975&&s.year<=2200&&Number.isInteger(s.office)&&s.office>=1&&s.office<=4&&Array.isArray(s.staff)&&s.staff.length>0&&s.staff.length<=60&&Array.isArray(s.games)&&s.games.length<=5000;}
function read(storage=global.localStorage){try{const str=storage.getItem(KEY);if(!str)return null;const s=JSON.parse(str);return validate(s)?s:null;}catch(_){return null;}}
function result(reason,extra={}){return {ok:false,reason,...extra};}
function stamp(s,text){s.history=[{date:date(s),text},...(Array.isArray(s.history)?s.history:[])].slice(0,45);}
function transact(action,fn,storage=global.localStorage){
 let raw;try{raw=storage.getItem(KEY);}catch(_){return result('STORAGE_UNAVAILABLE');}
 if(!raw)return result('NO_CAREER');let s;try{s=JSON.parse(raw);}catch(_){return result('INVALID_SAVE');}
 if(!validate(s))return result('INVALID_SAVE');
 const n=structuredCopy(s);const outcome=fn(n);
 if(outcome&&outcome.ok===false)return outcome;
 // Don't silently overwrite another tab's change between read and write.
 try{if(storage.getItem(KEY)!==raw)return result('SAVE_CHANGED_IN_ANOTHER_TAB');
   if(!storage.getItem(BACKUP))storage.setItem(BACKUP,raw);
   n._studio3dRevision=number(s._studio3dRevision)+1;
   n._studio3dLastAction=action;
   storage.setItem(KEY,JSON.stringify(n));
   const verified=read(storage);if(!verified||verified._studio3dRevision!==n._studio3dRevision)return result('SAVE_NOT_VERIFIED');
   return {ok:true,action,state:verified,...(outcome||{})};
 }catch(_){return result('SAVE_FAILED');}
}
function structuredCopy(v){return JSON.parse(JSON.stringify(v));}
function createCareer({studio,founder,year=1975,difficulty='standard'},storage=global.localStorage,confirmReplace=false){
 const company=clean(studio,35),name=clean(founder,38);year=Number(year);
 if(difficulty==='creative')difficulty='story';
 if(!company||!name||![1975,1980,1990,2000,2010,2020,2030].includes(year)||!diff[difficulty])return result('INVALID_CAREER_SETTINGS');
 try{
  const previous=storage.getItem(KEY);
  if(previous&&!confirmReplace)return result('CAREER_EXISTS');
  if(previous)storage.setItem(BACKUP,previous);
  const newState={studio:company,founder:name,difficulty,startYear:year,officeVersion:2,office:1,engine:1,cash:Math.round(75000*diff[difficulty].cash*(1+Math.max(0,year-1980)*.021)),fans:0,rep:12,rp:20,hype:0,morale:85,year,month:1,week:1,weekNumber:0,
    staff:[{id:0,name,role:'Founder / Developer',skill:54,salary:1700,energy:90,morale:85,color:SHIRTS[0],skin:SKINS[0],hair:'#34242a',x:0,y:0,dx:0,dy:0,moving:false,mode:'work'}],
    project:null,games:[],technologies:[],pauses:false,speed:1,finance:[],history:[{date:'JAN '+year,text:name+' founded '+company+'.'}],trendIndex:0,awards:0,totalRevenue:0,totalSpent:0,contracts:0,finished:false,deals:[],rivals:[],companies:[],news:[],subsidaries:[],subsidiaries:[],officeHistory:[],yearlyProfit:0,projectPhases:true,_studio3dRevision:1};
  storage.setItem(KEY,JSON.stringify(newState));return {ok:!!read(storage),state:read(storage)};
 }catch(_){return result('SAVE_FAILED');}
}
function hire(tier,storage=global.localStorage){return transact('hire',s=>{
 const t=HIRE[tier];if(!t)return result('INVALID_HIRE_TIER');if(s.staff.length>=capacities[s.office])return result('OFFICE_FULL');
 const cost=Math.round(t.cost*(diff[s.difficulty]?.cost||1));if(s.cash<cost)return result('INSUFFICIENT_CASH',{cost});
 const id=Math.max(-1,...s.staff.map(p=>number(p.id,-1)))+1;
 const names=['Alex Morgan','Sam Rivera','Taylor Chen','Jordan Ellis','Morgan Patel','Casey Brooks','Harper Kim','Drew Wilson','Jamie Cruz','Avery Reed','Quinn Murphy','Skyler Diaz','Emery Clarke','Rowan Taylor'];
 const occupied=new Set(s.staff.map(p=>p.name));let name=names[id%names.length];if(occupied.has(name))name+=' '+String(id+1);
 const person={id,name,role:t.label,skill:t.skill,salary:t.salary,energy:90,morale:80,color:SHIRTS[id%SHIRTS.length],skin:SKINS[id%SKINS.length],hair:'#30252b',x:0,y:0,dx:0,dy:0,moving:false,mode:'work'};
 s.staff.push(person);s.cash-=cost;s.totalSpent=number(s.totalSpent)+cost;s.yearlyProfit=number(s.yearlyProfit)-cost;stamp(s,`Hired ${name} for ${money(cost)}.`);return {person,cost};
 },storage);}
function research(id,storage=global.localStorage){return transact('research',s=>{
 const t=TECH.find(t=>t.id===id);if(!t)return result('INVALID_TECH');
 s.technologies=Array.isArray(s.technologies)?s.technologies:[];
 if(s.technologies.includes(t.id))return result('ALREADY_RESEARCHED');if(s.year<t.year)return result('YEAR_LOCKED');
 if(t.requires.some(dep=>!s.technologies.includes(dep)))return result('PREREQUISITE_LOCKED');
 if(number(s.rp)<t.cost)return result('INSUFFICIENT_RP',{cost:t.cost});
 s.rp-=t.cost;s.technologies.push(t.id);s.researchHistory=[...(Array.isArray(s.researchHistory)?s.researchHistory:[]),{id:t.id,year:s.year,month:s.month}];stamp(s,'Researched '+t.name+'.');return {technology:t};
 },storage);}
function startProject({name,genre='Simulation',topic='City Life',platform='kit',size='indie'},storage=global.localStorage){return transact('project-start',s=>{
 const title=clean(name,45),sz=SIZES.find(x=>x.id===size),p=PLATFORMS.find(x=>x.id===platform);
 if(!title||!GENRES.includes(genre)||!TOPICS.includes(topic)||!sz||!p)return result('INVALID_PROJECT');if(s.project)return result('PROJECT_IN_PROGRESS');
 if(s.year<p.year)return result('PLATFORM_YEAR_LOCKED');
 if(!availablePlatforms(s).some(x=>x.id===p.id))return result('PLATFORM_RESEARCH_LOCKED');
 if(!availableGenres(s).includes(genre))return result('GENRE_RESEARCH_LOCKED');
 if(!availableTopics(s).includes(topic))return result('TOPIC_RESEARCH_LOCKED');
 const costFactor=diff[s.difficulty]?.cost||1;
 const upfront=Math.round((sz.cost+p.fee+number(s.engine,1)*650)*costFactor);
 if(s.cash<upfront)return result('INSUFFICIENT_CASH',{cost:upfront});
 const weeklyCost=Math.round(sz.cost/(sz.weeks*.65)*costFactor);
 s.project={id:(number(s.weekNumber)+1)*100000+number(s.games.length),name:title,genre,topic,platform,size,scope:sz.potential,progress:0,weeks:sz.weeks,weeklyCost,upfront,focus:[60,60,60],match:0,trend:0,ready:false,rp:0,bugs:0,series:null,sequelOf:null,contract:null,features:[]};
 s.cash-=upfront;s.totalSpent=number(s.totalSpent)+upfront;s.yearlyProfit=number(s.yearlyProfit)-upfront;stamp(s,'Started '+title+' for '+money(upfront)+'.');return {upfront,project:s.project};
 },storage);}
function advanceWeek(storage=global.localStorage){return transact('week-advance',s=>{
 if(s.finished)return result('CAREER_ENDED');if(s.project?.ready)return result('RELEASE_GAME_FIRST');
 s.weekNumber=number(s.weekNumber)+1;s.week=number(s.week,1)+1;
 if(s.week>4){s.week=1;s.month=number(s.month,1)+1;if(s.month>12){s.month=1;s.year+=1;}}
 const factor=diff[s.difficulty]?.cost||1;
 // Four calendar weeks per month. Salary and office costs are monthly, not weekly.
 const weeklyBurn=Math.round((s.staff.reduce((a,p)=>a+number(p.salary),0)+rent[s.office]+number(s.engine,1)*300)*factor/4);
 s.cash-=weeklyBurn;s.totalSpent=number(s.totalSpent)+weeklyBurn;s.yearlyProfit=number(s.yearlyProfit)-weeklyBurn;
 let production=0;
 if(s.project){const p=s.project;const skill=s.staff.reduce((a,x)=>a+number(x.skill),0)/s.staff.length;
  const energy=s.staff.reduce((a,x)=>a+number(x.energy,80),0)/(s.staff.length*100);
  production=clamp((.7+skill/75)*(.55+s.staff.length*.155)*(.7+energy*.3)*(number(s.morale,80)<45?.72:1),.45,3.6);
  p.progress=Math.min(number(p.weeks,12),number(p.progress)+production);
  p.rp=number(p.rp)+production*.6;s.rp=number(s.rp)+Math.max(1,Math.round(production*.85));
  p.bugs=clamp(number(p.bugs)+(.75-skill/100)*.31-(p.progress>p.weeks*.79?.3:0),0,30);
  const projectBurn=Math.max(0,number(p.weeklyCost));s.cash-=projectBurn;s.totalSpent+=projectBurn;s.yearlyProfit-=projectBurn;
  if(p.progress>=p.weeks){p.ready=true;stamp(s,p.name+' is ready to publish.');}
 }
 // Continued sales decay. Copies/revenue are actual calculations, not filler stats.
 let salesRevenue=0;for(const g of s.games){const age=s.weekNumber-number(g.releaseWeek,s.weekNumber);if(age<0||age>80)continue;
  const p=PLATFORMS.find(x=>x.id===g.platform)||PLATFORMS[0];const base=Math.max(0,number(g.initialSales))*.60*Math.pow(.94,age);
  const sold=Math.max(0,Math.floor(base));g.sales=number(g.sales)+sold;
  const revenue=Math.round(sold*number(g.price,16)*number(g.royalty,1)*p.royalty);g.totalRevenue=number(g.totalRevenue)+revenue;salesRevenue+=revenue;
 }
 s.cash+=salesRevenue;s.totalRevenue=number(s.totalRevenue)+salesRevenue;s.yearlyProfit+=salesRevenue;
 s.staff.forEach(p=>{p.energy=clamp(number(p.energy,80)-(s.project?1.6:.4),35,100);p.morale=clamp(number(p.morale,80)+(s.cash>=0?.1:-.7),25,100)});
 s.morale=Math.round(s.staff.reduce((a,p)=>a+p.morale,0)/s.staff.length);
 // Keep bankruptcy as an explicit state; don't mint cash out of thin air.
 if(s.cash<0)s.news=[{date:date(s),text:'Cash flow warning: your studio is in debt.',type:'warning'},...(s.news||[])].slice(0,25);
 if(s.weekNumber%13===0)s.trendIndex=(number(s.trendIndex)+1)%8;
 if(s.weekNumber%52===0){s.finance=[...(s.finance||[]),{date:date(s),profit:s.yearlyProfit,cash:s.cash}].slice(-60);s.yearlyProfit=0;}
 return {week:s.weekNumber,weeklyBurn,production,revenue:salesRevenue,projectReady:!!s.project?.ready};
 },storage);}
function releaseProject(storage=global.localStorage){return transact('game-release',s=>{
 const p=s.project;if(!p)return result('NO_ACTIVE_PROJECT');if(!p.ready)return result('PROJECT_NOT_READY');
 const skill=s.staff.reduce((a,x)=>a+number(x.skill),0)/s.staff.length;
 const tech=(s.technologies||[]).reduce((a,id)=>a+(TECH.find(t=>t.id===id)?.bonus||0),0);
 const genreWeight={Action:[.4,1,.16],Adventure:[.5,.25,.9],RPG:[.68,.4,.8],Simulation:[.68,.7,.32],Strategy:[.8,.6,.3],Puzzle:[.8,.25,.3],Racing:[.6,.86,.1],Sports:[.72,.7,.12]}[p.genre]||[.6,.6,.6];
 const focus=(p.focus[0]*genreWeight[0]+p.focus[1]*genreWeight[1]+p.focus[2]*genreWeight[2])/(genreWeight.reduce((a,b)=>a+b,0)*100);
 const quality=clamp(Math.round(32+skill*.25+tech*.42+focus*25+number(p.match)*.45+number(p.trend)*.25+number(s.engine,1)*2-number(p.bugs)*1.35),18,100);
 const platform=PLATFORMS.find(x=>x.id===p.platform)||PLATFORMS[0];
 const copies=Math.max(12,Math.round((quality/100)**3.1*(Math.max(200,number(s.fans))*.085+280)*number(p.scope,1)*platform.share*(diff[s.difficulty]?.sales||1)*(1+number(s.hype)/80)*(1+number(s.rep)/145)));
 const review=quality<35?'A rough start. More polish needed.':quality<50?'Some promise, but not enough to recommend.':quality<65?'A respectable little game.':quality<78?'A charming and well-made release.':quality<90?'An excellent game from an ambitious studio.':'A generation-defining triumph!';
 const price=p.size==='indie'?16:p.size==='standard'?35:60;
 const game={id:p.id,name:p.name,genre:p.genre,topic:p.topic,platform:p.platform,size:p.size,score:quality,review,releaseWeek:s.weekNumber,releaseDate:date(s),price,initialSales:copies,sales:0,totalRevenue:0,royalty:1,series:p.name,sequelOf:null,patches:0,dlc:0,liveBoost:0};
 s.games.unshift(game);s.fans=Math.round(number(s.fans)+Math.max(10,quality*quality*.065*(quality<50?.3:1.2)));
 s.rep=clamp(number(s.rep,12)+(quality-55)/12,0,100);s.rp=number(s.rp)+Math.ceil(number(p.rp));if(quality>=90)s.awards=number(s.awards)+1;
 s.project=null;s.hype=0;s.staff.forEach(x=>{x.energy=clamp(number(x.energy,80)+12,0,100);x.morale=clamp(number(x.morale,80)+4,0,100)});
 stamp(s,`Released ${game.name} — ${quality}/100 review.`);return {game};
 },storage);}
const API={KEY,BACKUP,SIZES,PLATFORMS,TECH,HIRE,GENRES,TOPICS,availablePlatforms,availableGenres,availableTopics,read,validate,createCareer,hire,research,startProject,advanceWeek,releaseProject,money};
global.StudioEmpireCareer=API;
})(typeof window!=='undefined'?window:globalThis);
