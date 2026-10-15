/* STUDIO EMPIRE / ISOMETRIC REBOOT — ORIGINAL GAME ENGINE */
(() => {
'use strict';
const $ = id => document.getElementById(id);
const canvas=$('scene'), ctx=canvas.getContext('2d',{alpha:false});
const stage=$('game-stage');
const WIDTH=94, HEIGHT=49, FLOOR_Z=0;
const GENRES=['Action','Adventure','RPG','Simulation','Strategy','Puzzle','Racing','Sports'];
const TOPICS=['Fantasy','Space','Detective','Horror','Medieval','Robots','City Life','Pirates','Wild West','Sports','History','Nature'];
const PLATFORMS=[{id:'pc',name:'Home Computer',year:1980,fee:0,share:.64,royalty:.92},{id:'arcade',name:'Arcade Cabinets',year:1980,fee:1500,share:.53,royalty:.74},{id:'vector',name:'Vector 8 Console',year:1982,fee:4000,share:.72,royalty:.68},{id:'pocket',name:'PocketPlay Handheld',year:1987,fee:6500,share:.85,royalty:.63},{id:'cd',name:'CD Horizon',year:1993,fee:9000,share:1.08,royalty:.67},{id:'net',name:'Online PC',year:1998,fee:13500,share:1.42,royalty:.86},{id:'mobile',name:'Touch Mobile',year:2008,fee:8000,share:1.68,royalty:.77}];
const SIZES=[{id:'indie',name:'Small / Indie',weeks:12,cost:3500,potential:.6},{id:'standard',name:'Standard',weeks:20,cost:9000,potential:1.25},{id:'blockbuster',name:'Blockbuster',weeks:31,cost:24000,potential:2.6}];
const TECH=[{id:'save',name:'Save Game System',cost:16,year:1980,bonus:4,desc:'Persistent saves and richer adventure systems.'},{id:'audio',name:'Dynamic Sound',cost:22,year:1980,bonus:5,desc:'Responsive sound and richer atmosphere.'},{id:'graphics',name:'Enhanced 2D Graphics',cost:32,year:1982,bonus:7,desc:'Bolder sprites, art and smoother animation.'},{id:'ai',name:'Advanced Game AI',cost:42,year:1984,bonus:9,desc:'Deeper characters, rivals and challenges.'},{id:'3d',name:'Early 3D Engine',cost:75,year:1990,bonus:14,desc:'Unlock experimental three-dimensional games.'},{id:'online',name:'Multiplayer Networking',cost:105,year:1995,bonus:16,desc:'Online interactions and connected worlds.'},{id:'physics',name:'Physics Middleware',cost:130,year:2000,bonus:19,desc:'Modern movement and interactive environments.'},{id:'cloud',name:'Cloud Game Services',cost:180,year:2012,bonus:23,desc:'Connected updates, persistence and live games.'}];
const FIRST_NAMES=['Maya','Alex','Jules','Theo','Sam','Nina','Eli','Robin','Zoe','Amir','Casey','Morgan'];
const SURNAMES=['Park','Reyes','Stone','Cruz','Wells','Kim','Brooks','Chen','Cole','Bennett','Rivera','Ng'];
const SHIRTS=['#e87376','#65a8b9','#f2b65f','#83b48a','#987dbf','#ed9a74','#5e94a9','#9bcb75'];
const SKINS=['#e7ad76','#ce8b5d','#f0cb9c','#b97955','#edb48c','#8f543f'];
const HAIR=['#3a2925','#5a3f2f','#bd7546','#302f3b','#734e45','#d3a45d'];
const TRENDS=[{genre:'Adventure',topic:'Fantasy',name:'Adventure games are heating up',desc:'Players want memorable stories and faraway worlds.'},{genre:'Simulation',topic:'City Life',name:'Simulation games are booming',desc:'More players are interested in life and management sims.'},{genre:'Action',topic:'Space',name:'Action is taking over the charts',desc:'Fast action and ambitious sci-fi sell this season.'},{genre:'RPG',topic:'Medieval',name:'RPG audiences are growing',desc:'Long campaigns and persistent heroes drive interest.'},{genre:'Strategy',topic:'History',name:'Strategy fans are buying big',desc:'Complex strategy games are getting strong attention.'},{genre:'Racing',topic:'Sports',name:'Competitive games are surging',desc:'Players are looking for skill-based competition.'},{genre:'Puzzle',topic:'Nature',name:'Puzzle games have momentum',desc:'Accessible gameplay has reached new audiences.'}];
const PAIRS={Action:['Space','Robots','Horror','Pirates'],Adventure:['Fantasy','Detective','Pirates','Wild West'],RPG:['Fantasy','Medieval','Space'],Simulation:['City Life','Nature','Sports'],Strategy:['Medieval','History','Space'],Puzzle:['Detective','Nature','Robots'],Racing:['Sports','City Life','Wild West'],Sports:['Sports','Nature','City Life']};
const CHAIRS=[{x:2.28,y:2.8},{x:4.6,y:2.72},{x:2.4,y:4.78},{x:4.77,y:4.7},{x:6.64,y:2.5},{x:6.65,y:4.55},{x:8.65,y:2.4},{x:8.65,y:4.4},{x:10.1,y:5.6},{x:9.6,y:7.3},{x:6.5,y:7.4},{x:3.5,y:7.5}];
const SAVE_KEY='studio-empire-reboot-v1';
let state, activePanel='', modalOpen=false, didDrag=false, hover=null, pointerData=new Map(), dragStart=null, stars=[], camera={panX:0,panY:0,zoom:1,initialZoom:1,cx:0,cy:0}, sceneW=0,sceneH=0, lastDraw=0;
const random=(min=0,max=1)=>min+Math.random()*(max-min);
const clamp=(v,min,max)=>Math.max(min,Math.min(max,v));
const money=v=>(v<0?'−':'')+'$'+Math.abs(Math.round(v)).toLocaleString('en-US');
const mini=v=>Math.abs(v)>=1000000?(v/1000000).toFixed(2)+'M':Math.abs(v)>=1000?(v/1000).toFixed(1)+'K':String(Math.round(v));
const h=t=>String(t).replace(/[&<>"']/g, k=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[k]));
const seedPerson=(id,name,skill,salary,color,skin,hair)=>({id,name,skill,salary,color,skin,hair,energy:90,morale:83,x:CHAIRS[id%CHAIRS.length].x,y:CHAIRS[id%CHAIRS.length].y,dx:0,dy:0,moving:false,breakTime:0});
function initial(){return {studio:'Pioneer Games',cash:75000,fans:240,rep:14,rp:20,hype:0,morale:82,year:1980,month:1,week:1,weekNumber:0,office:1,engine:1,staff:[seedPerson(0,'Maya Park',56,2000,SHIRTS[0],SKINS[0],HAIR[0]),seedPerson(1,'Alex Reyes',48,1850,SHIRTS[1],SKINS[1],HAIR[2]),seedPerson(2,'Jules Stone',40,1550,SHIRTS[2],SKINS[2],HAIR[3])],games:[],project:null,technologies:[],pauses:false,speed:1,finance:[],history:[{date:'Jan 1980',text:'Pioneer Games opened its doors.'}],trendIndex:0,awards:0,totalRevenue:0,totalSpent:0,contracts:0,finished:false,deals:[],rivals:[],news:[],yearlyProfit:0,projectPhases:true};}
function load(){try{let s=JSON.parse(localStorage.getItem(SAVE_KEY));if(s&&s.staff&&s.year>=1980&&typeof s.cash==='number'){state={...initial(),...s};state.staff=state.staff.map((p,i)=>({...seedPerson(i,p.name,p.skill,p.salary,p.color,p.skin,p.hair),...p,dx:0,dy:0,moving:false}));state.games=state.games.map(g=>({...g,patches:g.patches||0,dlc:g.dlc||0,liveBoost:g.liveBoost||0,series:g.series||null}));state.deals=Array.isArray(state.deals)?state.deals:[];state.rivals=Array.isArray(state.rivals)?state.rivals:[];state.news=Array.isArray(state.news)?state.news:[];return;}}catch(e){console.warn('Save could not be read',e)}state=initial();}
function save(){try{localStorage.setItem(SAVE_KEY,JSON.stringify(state));}catch(e){console.warn('Could not autosave',e)}}
const officeW=()=>state.office===1?8:state.office===2?10:12;
const officeH=()=>state.office===1?7:state.office===2?8:9;
const capacity=()=>[0,4,8,12][state.office];
const floorCost=()=>[0,40000,110000,210000][state.office]||0;
const monthlyCosts=()=>state.staff.reduce((n,p)=>n+p.salary,0)+[0,1500,3800,7700][state.office]+state.engine*300;
const studioVal=()=>Math.max(0,Math.round(state.cash+state.games.reduce((n,g)=>n+g.totalRevenue*.23,0)+state.office*22000+state.engine*9000+state.fans*2));
const date=()=>['JAN','FEB','MAR','APR','MAY','JUN','JUL','AUG','SEP','OCT','NOV','DEC'][state.month-1]+' '+state.year;
function log(text){state.history.unshift({date:date(),text});state.history=state.history.slice(0,45)}
function toast(msg){const e=document.createElement('div');e.className='toast';e.textContent=msg;$('toast-stack').append(e);setTimeout(()=>e.remove(),4500)}
function feed(text){let el=document.createElement('div');el.className='feed-item';el.innerHTML=text;$('eventfeed').prepend(el);while($('eventfeed').children.length>3)$('eventfeed').lastElementChild.remove();setTimeout(()=>el.remove(),7400)}
function refreshHUD(){
 $('cash').textContent=money(state.cash);$('cash').style.color=state.cash<0?'#ff9e91':'#fff';
 $('fans').textContent=mini(state.fans);$('reputation').innerHTML=Math.round(state.rep)+' <i>/100</i>';$('rp').textContent=Math.round(state.rp)+' RP';
 $('clock').textContent=date()+' · W'+state.week;$('pause').textContent=state.pauses?'▶':'Ⅱ';$('speed').textContent=state.speed+'×';
 $('studio-label').textContent=state.studio.toUpperCase();$('side-studio').textContent=state.studio;
 $('staff-count').textContent=state.staff.length+' / '+capacity()+' STAFF';$('morale-label').textContent='MORALE '+Math.round(state.morale)+'%';
 $('valuation').textContent=money(studioVal());$('growth').textContent=state.year;
 $('office-label').textContent=['','GARAGE STUDIO','CREATIVE LOFT','GAME CAMPUS'][state.office];
 $('team-caption').textContent=state.staff.length+' developers on the floor';$('studio-caption').textContent='Office level '+state.office+' · '+capacity()+' desks';
 $('research-caption').textContent=state.rp+' research points';
 const trend=TRENDS[state.trendIndex];$('trend-name').textContent=trend.name;$('trend-desc').textContent=trend.desc;$('trend-year').textContent=state.year;
 if(state.project){const p=state.project, frac=clamp(p.progress/p.weeks,0,1);const phase=frac<.26?'PLANNING':frac<.79?'PRODUCTION':frac<1?'POLISH':'COMPLETE';$('ribbon-title').textContent=(p.ready?'READY TO RELEASE: ':'IN DEVELOPMENT: ')+p.name;$('project-progress').style.width=(frac*100)+'%';$('project-detail').textContent=p.ready?'Your game is ready. Open Develop to publish.':phase+' · '+Math.round(frac*100)+'% · '+p.weeks+' week plan';}else{$('ribbon-title').textContent=state.games.length?'Your next big idea is waiting':'Waiting for our first hit';$('project-progress').style.width='0%';$('project-detail').textContent='Create a game to put your team to work';}
}
function coreSim(){
 if(state.finished)return;
 state.weekNumber++;state.week++;if(state.week>4){state.week=1;state.month++;if(state.month>12){state.month=1;state.year++;}}
 let revenue=0;for(const game of state.games){let age=state.weekNumber-game.releaseWeek;
 const decay=(.907+(game.patches||0)*.006+(game.dlc||0)*.012);const multiplier=Math.pow(Math.min(.967,decay),age)*(.94+Math.sin((age+game.score)*.7)*.06)*(1+(game.liveBoost||0)/100);
 const platform=PLATFORMS.find(p=>p.id===game.platform)||PLATFORMS[0];
 const gross=Math.max(0,Math.round(game.initialSales*multiplier*game.price*platform.royalty*(game.royalty??1)));
 game.totalRevenue+=gross;game.sales+=Math.round(game.initialSales*multiplier);revenue+=gross;if(game.liveBoost>0)game.liveBoost=Math.max(0,game.liveBoost-1.4);
 if(age===6&&game.score>=84){state.fans+=Math.round(game.score*3);}
 }
 state.cash+=revenue;state.totalRevenue+=revenue;state.yearlyProfit=(state.yearlyProfit||0)+revenue;
 let burn=0;
 if(state.week===1){burn=monthlyCosts();state.cash-=burn;state.totalSpent+=burn;state.yearlyProfit-=burn;state.finance.unshift({period:date(),rev:revenue,expenses:burn});state.finance=state.finance.slice(0,24);}
 else if(state.finance.length){state.finance[0].rev+=revenue;}
 if(state.project&&!state.project.ready){const p=state.project;const avg=state.staff.reduce((sum,s)=>sum+s.skill,0)/Math.max(state.staff.length,1);const energy=state.staff.reduce((sum,s)=>sum+s.energy,0)/(Math.max(state.staff.length,1)*100);let rate=clamp((.7+avg/75)*(.55+state.staff.length*.155)*(.7+energy*.3)*(state.morale<45?.72:1)*(p.deadlineBoost||1),.45,3.6);
 p.progress+=rate;p.rp+=Math.max(1,rate*.6);state.rp+=Math.round(rate*.85);p.bugs=clamp((p.bugs||0)+(.75-state.staff.reduce((n,s)=>n+s.skill,0)/(state.staff.length*100))*.31-(p.progress>p.weeks*.79?.3:0),0,30);
 let devBurn=Math.round(p.weeklyCost);state.cash-=devBurn;state.totalSpent+=devBurn;state.yearlyProfit-=devBurn;
 if(p.progress>=p.weeks){p.progress=p.weeks;p.ready=true;state.pauses=true;feed('<b>'+h(p.name)+'</b> has completed development.');log(p.name+' finished development.');toast('Development complete! Your game is ready to release.');setTimeout(()=>openPanel('develop'),200);}
 }
 state.staff.forEach(s=>{s.energy=clamp(s.energy-(state.project?1.8:.5),35,100);s.morale=clamp(s.morale+(state.cash>0?.2:-.65),25,100)});
 state.morale=Math.round(state.staff.reduce((n,s)=>n+s.morale,0)/Math.max(1,state.staff.length));
 state.hype=Math.max(0,state.hype-1.4);
 if(state.weekNumber%13===0){spawnRival();}if(state.weekNumber%14===0){state.trendIndex=(state.trendIndex+1)%TRENDS.length;feed('<b>MARKET TREND</b> '+h(TRENDS[state.trendIndex].name));}
 if(state.weekNumber%52===0){const profit=state.yearlyProfit||0;state.news.unshift({date:date(),text:'Fiscal year result: '+money(profit),type:profit>=0?'growth':'warning'});state.yearlyProfit=0;state.news=state.news.slice(0,25);}if(state.weekNumber%16===0){const msgs=['A competing studio has announced a new game.','Industry press is predicting a strong holiday season.','A rival publisher is investing heavily in new hardware.','Fans are debating the future of game graphics.'];feed('<b>INDUSTRY</b> '+msgs[Math.floor(random(0,msgs.length))]);}
 if(state.cash<0&&state.cash>-30000&&state.weekNumber%4===0)toast('Warning: Your studio is operating in debt.');
 if(state.cash< -50000&&!state.finished){state.finished=true;state.pauses=true;openPanel('bankrupt');}
 refreshHUD();save();
}
function startGame(form){const name=String(form.get('name')||'Pioneer Games').trim().slice(0,35);if(!name)return;state=initial();state.studio=name;log('Founded '+name+'.');save();refreshHUD();closePanel();centerCamera(true);toast('New studio founded. Your story begins.');}
function startProject(form){if(state.project){toast('Finish your current project first.');return;}
 const name=String(form.get('name')||'Untitled Game').trim().slice(0,45);if(!name){toast('Enter a game title.');return;}
 const genre=String(form.get('genre')),topic=String(form.get('topic')),platform=String(form.get('platform')),size=String(form.get('size'));
 const preset=SIZES.find(s=>s.id===size)||SIZES[0],plat=PLATFORMS.find(s=>s.id===platform)||PLATFORMS[0];
 if(state.year<plat.year){toast('This platform has not launched yet.');return;}
 const upfront=preset.cost+plat.fee+state.engine*650;if(state.cash<upfront){toast('Not enough cash to start this game.');return;}
 const focus=[Number(form.get('gameplay')||50),Number(form.get('technology')||50),Number(form.get('story')||50)];if(focus.some(v=>!Number.isFinite(v)||v<0||v>100)||focus.reduce((a,b)=>a+b,0)>180){toast('Allocate a maximum of 180 development points.');return;}
 const weeklyCost=Math.round(preset.cost/(preset.weeks*.65));
 state.cash-=upfront;state.totalSpent+=upfront;state.yearlyProfit-=upfront;
 const match=PAIRS[genre]?.includes(topic)?12:-4;
 const trend=(TRENDS[state.trendIndex].genre===genre?9:0)+(TRENDS[state.trendIndex].topic===topic?5:0);const predecessor=state.games.find(g=>g.name===String(form.get('series')||''));const sequelOf=predecessor?predecessor.id:null;const series=predecessor?(predecessor.series||predecessor.name):null;
 state.project={id:Date.now(),name,genre,topic,platform,size,scope:preset.potential,progress:0,weeks:preset.weeks,weeklyCost,upfront,focus,match,trend,ready:false,rp:0,bugs:0,series,sequelOf,contract:null};
 state.pauses=false;log('Started development of '+name+'.');feed('<b>NEW PROJECT</b> '+h(name)+' is now in development.');refreshHUD();save();closePanel();}
function releaseProject(){const p=state.project;if(!p||!p.ready)return;const avg=state.staff.reduce((s,x)=>s+x.skill,0)/Math.max(state.staff.length,1);const tech=state.technologies.reduce((s,id)=>s+(TECH.find(t=>t.id===id)?.bonus||0),0);
 const genreWeight={Action:[.4,1,.16],Adventure:[.5,.25,.9],RPG:[.68,.4,.8],Simulation:[.68,.7,.32],Strategy:[.8,.6,.3],Puzzle:[.8,.25,.3],Racing:[.6,.86,.1],Sports:[.72,.7,.12]}[p.genre]||[.6,.6,.6];
 const focusVal=(p.focus[0]*genreWeight[0]+p.focus[1]*genreWeight[1]+p.focus[2]*genreWeight[2])/(genreWeight.reduce((a,b)=>a+b,0)*100);
 const quality=clamp(Math.round(32+avg*.25+tech*.42+focusVal*25+p.match*.45+p.trend*.25+state.engine*2+(p.series?4:0)-(p.bugs||0)*1.35+random(-12,11)),18,100);
 const platform=PLATFORMS.find(x=>x.id===p.platform);let initialSales=Math.max(12,Math.round((quality/100)**3.1*(Math.max(200,state.fans)*.085+280)*p.scope*platform.share*(1+state.hype/80)*(1+state.rep/145)));
 const reviews=[quality<35?'A rough start. More polish needed.':quality<50?'Some promise, but not enough to recommend.':quality<65?'A respectable little game.':quality<78?'A charming and well-made release.':quality<90?'An excellent game from an ambitious studio.':'A generation-defining triumph!'];
 const review=quality<35?reviews[0]:quality<50?reviews[1]:quality<65?reviews[2]:quality<78?reviews[3]:quality<90?reviews[4]:reviews[5];
 const price=p.size==='indie'?16:p.size==='standard'?35:60;const royalty=p.contract?p.contract.royalty:1;
 const game={id:p.id,name:p.name,genre:p.genre,topic:p.topic,platform:p.platform,size:p.size,score:quality,review,releaseWeek:state.weekNumber,releaseDate:date(),price,initialSales,sales:0,totalRevenue:0,royalty,series:p.series||p.name,sequelOf:p.sequelOf||null,patches:0,dlc:0,liveBoost:0,publisher:p.contract?.name||null};
 state.games.unshift(game);state.fans+=Math.max(10,Math.round(quality*quality*.065*(quality<50?.3:1.2)));
 state.rep=clamp(state.rep+(quality-55)/12,0,100);state.rp+=Math.ceil(p.rp);
 if(quality>=90)state.awards++;
 state.project=null;state.hype=0;state.pauses=false;state.staff.forEach(s=>{s.energy=clamp(s.energy+12,0,100);s.morale=clamp(s.morale+4,0,100)});
 log('Released '+game.name+' ('+quality+'/100).');feed('<b>GAME RELEASED</b> '+h(game.name)+' scored '+quality+'/100.');toast(game.name+' released with a '+quality+'/100 review!');refreshHUD();save();openPanel('review',game.id);
}
function pay(cost){if(state.cash<cost){toast('Not enough funds.');return false;}state.cash-=cost;state.totalSpent+=cost;state.yearlyProfit=(state.yearlyProfit||0)-cost;return true;}
function recruit(tier){const tiers={junior:{cost:1800,salary:1450,skill:30},experienced:{cost:4800,salary:2750,skill:58},expert:{cost:11000,salary:4750,skill:84}};const t=tiers[tier];if(!t||state.staff.length>=capacity()){toast('You need more desks. Expand your office.');return;}
 if(!pay(t.cost))return;const id=state.staff.length,person=seedPerson(id,FIRST_NAMES[(id*7+state.weekNumber)%FIRST_NAMES.length]+' '+SURNAMES[(id*5+state.weekNumber)%SURNAMES.length],Math.round(t.skill+random(-8,9)),t.salary,SHIRTS[id%SHIRTS.length],SKINS[id%SKINS.length],HAIR[id%HAIR.length]);state.staff.push(person);log('Hired '+person.name+'.');feed('<b>NEW TEAM MEMBER</b> '+h(person.name)+' joins the studio.');refreshHUD();save();openPanel('team');}
function train(id){const p=state.staff.find(s=>s.id===id);if(!p)return;if(!pay(4600))return;p.skill=clamp(p.skill+9,0,100);p.energy=clamp(p.energy+15,0,100);log(p.name+' completed advanced training.');toast(p.name+' gained +9 skill.');refreshHUD();save();openPanel('team');}
function treat(){if(!pay(1750))return;state.staff.forEach(p=>{p.morale=clamp(p.morale+18,0,100);p.energy=clamp(p.energy+27,0,100)});state.morale=Math.round(state.staff.reduce((n,s)=>n+s.morale,0)/state.staff.length);feed('<b>TEAM EVENT</b> Studio team day boosted morale.');refreshHUD();save();openPanel('team');}
function research(id){let t=TECH.find(x=>x.id===id);if(!t||state.technologies.includes(id)||t.year>state.year)return;if(state.rp<t.cost){toast('You need more research points.');return;}state.rp-=t.cost;state.technologies.push(id);log('Researched '+t.name+'.');feed('<b>RESEARCH UNLOCKED</b> '+t.name);refreshHUD();save();openPanel('research');}
function upgradeEngine(){const cost=state.engine*17000;if(!pay(cost))return;state.engine++;log('Built proprietary engine version '+state.engine+'.');feed('<b>ENGINE UPGRADE</b> Improved game development tools.');refreshHUD();save();openPanel('research');}
function expand(){if(state.office>=3){toast('You have the largest office available in this build.');return;}const cost=floorCost();if(!pay(cost))return;state.office++;log('Expanded into a new studio.');feed('<b>OFFICE UPGRADED</b> '+h(['','Garage Studio','Creative Loft','Game Campus'][state.office]));centerCamera(true);refreshHUD();save();openPanel('studio');}
function promote(){if(!pay(3000))return;state.hype=clamp(state.hype+26,0,100);log('Ran a studio marketing campaign.');toast('Marketing campaign launched. Hype +26.');refreshHUD();save();openPanel('market');}
// GAME WORLD EXTENSIONS - safe for existing v0.3 save files.
const PUBLISHERS=[
 {id:'northstar',name:'Northstar Interactive',advance:9500,royalty:.72,minScore:0,description:'Accessible advance with an ordinary revenue split.'},
 {id:'golden',name:'Golden Cartridge',advance:18500,royalty:.55,minScore:50,description:'Higher funding, but your publisher takes more of every sale.'},
 {id:'aurora',name:'Aurora Arts',advance:36000,royalty:.40,minScore:74,description:'Prestige funding for proven studios. You keep less revenue.'}
];
const RIVAL_NAMES=['Silver Sparrow','Pixel Circuit','Nebula Forge','Orchid Works','Eclipse Byte','Copper Dragon','Thunder Lab','Red Lantern'];
function spawnRival(){
 const ix=Math.floor(state.weekNumber/13)%RIVAL_NAMES.length,genre=GENRES[(ix+state.year)%GENRES.length];
 const name=RIVAL_NAMES[ix],score=clamp(Math.round(36+((ix*19+state.year*3)%53)),25,93);
 const units=Math.round((score/100)**3*15000*(1+Math.max(0,state.year-1980)*.08));
 const story={name,genre,score,units,date:date(),title:genre+' project'};
 state.rivals.unshift(story);state.rivals=state.rivals.slice(0,30);
 state.news.unshift({date:date(),text:name+' launched a '+genre+' title. Critics: '+score+'/100.',type:'rival'});state.news=state.news.slice(0,25);
}
function signDeal(id){
 const p=state.project,pub=PUBLISHERS.find(x=>x.id===id);if(!p||p.ready||p.contract||!pub)return;
 if(state.rep<pub.minScore){toast('Requires studio reputation '+pub.minScore+'.');return;}
 const extra=Math.round(pub.advance*(p.size==='indie'?1:p.size==='standard'?1.55:2.2));
 p.contract={name:pub.name,royalty:pub.royalty,advance:extra};
 state.cash+=extra;state.totalRevenue+=extra;state.yearlyProfit+=extra;state.contracts++;
 log('Signed '+pub.name+' for '+p.name+'. Advance '+money(extra)+'.');
 feed('<b>PUBLISHING DEAL</b> '+h(pub.name)+' invested '+money(extra));save();refreshHUD();openPanel('develop');
}
function updatePrice(id,change){
 const g=state.games.find(g=>String(g.id)===String(id));if(!g)return;
 const step=change==='up'?5:-5;const next=clamp(g.price+step,5,100);
 if(next===g.price)return;g.price=next;g.initialSales=Math.max(6,Math.round(g.initialSales*(step>0?.94:1.06)));
 log('Adjusted '+g.name+' price to '+money(next)+'.');save();openPanel('market');
}
function patchGame(id){
 const g=state.games.find(g=>String(g.id)===String(id));if(!g||g.patches>=4)return;
 const cost=2100+g.patches*2300;if(!pay(cost))return;
 g.patches++;g.liveBoost=clamp(g.liveBoost+14,0,90);g.score=clamp(g.score+1,0,100);
 log('Shipped patch '+g.patches+' for '+g.name+'.');feed('<b>GAME UPDATE</b> '+h(g.name)+' patch shipped.');save();refreshHUD();openPanel('market');
}
function shipDlc(id){
 const g=state.games.find(g=>String(g.id)===String(id));if(!g||g.dlc>=3)return;
 if(state.weekNumber-g.releaseWeek<8){toast('DLC requires 8 weeks after release.');return;}
 const cost=9500+g.dlc*5500;if(!pay(cost))return;
 g.dlc++;g.liveBoost=clamp(g.liveBoost+45,0,90);g.initialSales=Math.round(g.initialSales*1.13);
 const newFans=Math.round(g.score*12);state.fans+=newFans;
 log('Released DLC '+g.dlc+' for '+g.name+'.');feed('<b>DLC RELEASED</b> '+h(g.name)+' has a new expansion.');save();refreshHUD();openPanel('market');
}
function restTeam(){
 if(state.project&&!state.project.ready){toast('Finish or release the current project before taking a break.');return;}
 const cost=950;if(!pay(cost))return;
 for(const p of state.staff){p.energy=100;p.morale=clamp(p.morale+12,0,100);}state.morale=Math.round(state.staff.reduce((a,p)=>a+p.morale,0)/state.staff.length);
 log('Studio took a well-earned rest week.');save();refreshHUD();openPanel('team');
}
function financePanel(){
 const last=state.finance.slice(0,12),totalRev=last.reduce((a,f)=>a+f.rev,0),totalExp=last.reduce((a,f)=>a+f.expenses,0);
 const max=Math.max(1,...last.map(f=>Math.max(f.rev,f.expenses)));
 return `<div class="stats-row">${stat('12-MO SALES',money(totalRev))}${stat('12-MO OVERHEAD',money(totalExp))}${stat('CASH RUNWAY',state.cash>0?Math.floor(state.cash/Math.max(1,monthlyCosts()))+' MONTHS':'IN DEBT')}</div><h3>Monthly financial history</h3><p>Game sales and payroll/rent by month. Upfront project costs and research spending are tracked in lifetime spending.</p><div class="finance-bars">${last.length?last.map(f=>`<div class="bar-row"><span>${h(f.period)}</span><div class="bar-track"><i style="width:${Math.max(1,100*f.rev/max)}%;background:#57aa94"></i><i style="width:${Math.max(1,100*f.expenses/max)}%;background:#e99173"></i></div><strong>${money(f.rev-f.expenses)}</strong></div>`).join(''):'<p>Advance a month to see a financial report.</p>'}</div><div class="info-strip">Green = game sales. Coral = monthly payroll and operating costs.</div>`;
}
function renderRivals(){
 const current=TRENDS[state.trendIndex];const ourHits=state.games.slice().sort((a,b)=>b.totalRevenue-a.totalRevenue).slice(0,4);
 return `<div class="stats-row">${stat('RIVAL RELEASES',state.rivals.length)}${stat('YOUR TITLES',state.games.length)}${stat('REPUTATION',Math.round(state.rep)+'/100')}</div><div class="info-strip">${h(current.name)} — ${h(current.desc)}</div><h3>Latest competing releases</h3><div class="stack">${state.rivals.length?state.rivals.slice(0,8).map(r=>`<div class="list-item"><div style="flex:1"><b>${h(r.name)}</b><p>${h(r.genre)} · ${h(r.date)} · ${mini(r.units)} units</p></div><div class="score">${r.score}</div></div>`).join(''):'<div class="info-strip">The first rival releases arrive during your first year. Advance time to see the industry grow.</div>'}</div><h3>Your best-selling games</h3><div class="stack">${ourHits.length?ourHits.map(g=>`<div class="list-item"><b>${h(g.name)}</b><strong>${money(g.totalRevenue)}</strong></div>`).join(''):'<p>Release a game to enter the market.</p>'}</div><h3>Industry news</h3><div class="history">${state.news.slice(0,8).map(r=>`<div class="history-item"><span>${h(r.date)}</span>${h(r.text)}</div>`).join('')||'<p>Industry reports will arrive as you advance time.</p>'}</div>`;
}
function getOptions(values,selected){return values.map(v=>{const obj=typeof v==='string'?{id:v,name:v}:v;return `<option value="${h(obj.id||obj.name)}" ${selected===(obj.id||obj.name)?'selected':''}>${h(obj.name)}</option>`}).join('');}
function stat(label,value){return `<div class="statblock"><small>${h(label)}</small><strong>${h(String(value))}</strong></div>`;}
function button(label,action,id='',disabled=false,kind=''){return `<button class="btn ${kind}" type="button" data-action="${h(action)}" data-id="${h(id)}" ${disabled?'disabled':''}>${label}</button>`;}
function renderDevelop(){
 if(state.project){const p=state.project;return `<div class="stats-row">${stat('GAME',p.name)}${stat('PROGRESS',Math.floor(p.progress/p.weeks*100)+'%')}${stat('DEVELOPMENT',p.ready?'DONE':Math.round(p.weeks-p.progress)+' WKS LEFT')}</div><div class="info-strip ${p.ready?'':'warning'}">${p.ready?'Development is complete. Review the project and release your game to the public.':'Your team is building the game in the office. Time passes automatically when the simulation is running. Hiring stronger developers accelerates production.'}</div><h3>Project details</h3><div class="gridcards"><div class="featurecard"><div><b>${h(p.genre)} / ${h(p.topic)}</b><p>${h(PLATFORMS.find(x=>x.id===p.platform).name)}</p></div><span class="game-chip">${h(p.size)}</span></div><div class="featurecard"><div><b>Weekly development</b><p>${money(p.weeklyCost)} plus company overhead</p></div></div></div><h3>Publisher financing</h3>${p.contract?`<div class="info-strip">${h(p.contract.name)} funded this project for ${money(p.contract.advance)} upfront. Your studio retains ${Math.round(p.contract.royalty*100)}% of its normal net sales revenue.</div>`:p.ready?'<div class="info-strip">Funding negotiations closed at development completion.</div>':`<div class="gridcards">${PUBLISHERS.map(pub=>`<div class="featurecard"><div><b>${h(pub.name)}</b><p>${h(pub.description)}</p><span class="tag">${money(Math.round(pub.advance*(p.size==='indie'?1:p.size==='standard'?1.55:2.2)))} ADVANCE · ${Math.round(pub.royalty*100)}% NET REV</span></div>${button('SIGN','deal',pub.id,state.rep<pub.minScore,'dark')}</div>`).join('')}</div>`}<div class="panel-actions">${p.ready?button('RELEASE GAME →','release','','', 'primary'):button('ADVANCE A WEEK →','advance')}</div>`;}
 const available=PLATFORMS.filter(p=>p.year<=state.year);
 return `<p>Build your next game from a real production brief. Your developers will visibly work on the office floor as the project progresses.</p><form id="create-game-form"><div class="form-row"><div class="form-field"><label for="game-name">GAME TITLE</label><input id="game-name" name="name" placeholder="e.g. Galaxy Quest" maxlength="45" required autofocus /></div><div class="form-field"><label for="game-platform">PLATFORM</label><select id="game-platform" name="platform">${getOptions(available,'pc')}</select></div></div>${state.games.length?`<div class="form-field"><label>FRANCHISE / SEQUEL (OPTIONAL)</label><select name="series">${getOptions([{id:'',name:'Original IP — new series'},...state.games.slice(0,16).map(g=>({id:g.name,name:g.name+' · '+g.genre}))],'')}</select></div>`:''}<div class="form-row"><div class="form-field"><label>GENRE</label><select name="genre">${getOptions(GENRES,'Adventure')}</select></div><div class="form-field"><label>TOPIC</label><select name="topic">${getOptions(TOPICS,'Fantasy')}</select></div></div><div class="form-row"><div class="form-field"><label>PROJECT SCOPE</label><select name="size" id="project-size">${getOptions(SIZES,'indie')}</select></div><div class="form-field"><label>RELEASE PRICE</label><div class="info-strip" style="margin:0;padding:11px 12px">Small $16 · Standard $35 · Blockbuster $60</div></div></div><h3>Development priorities · 180 POINT BUDGET</h3><p style="margin-top:-4px"> Allocate 180 points total across these three priorities. Increasing one reduces the points available for the others. Genre fit affects reviews.</p>${['Gameplay','Technology','Story & world'].map((t,i)=>`<div class="range-row"><label>${t.toUpperCase()}</label><input type="range" min="0" max="100" name="${['gameplay','technology','story'][i]}" value="${[65,45,70][i]}"/><output>${[65,45,70][i]}</output></div>`).join('')}<div class="info-strip" id="focus-budget">180 / 180 POINTS ALLOCATED</div><div id="project-cost-info" class="info-strip warning">Starting cost: ${money(3500+state.engine*650)} · Estimated production time: 12 weeks. Current trend: ${h(TRENDS[state.trendIndex].genre)} games.</div><div class="panel-actions"><button type="submit" class="btn primary">START DEVELOPMENT →</button></div></form>`;
}
function renderTeam(){return `<div class="stats-row">${stat('EMPLOYEES',state.staff.length+' / '+capacity())}${stat('MONTHLY PAYROLL',money(state.staff.reduce((n,p)=>n+p.salary,0)))}${stat('TEAM MORALE',state.morale+'%')}</div><h3>Your development team</h3><div class="stack">${state.staff.map(p=>`<div class="list-item"><span class="employee-avatar" style="background:${p.color}">${h(p.name[0])}</span><div style="flex:1;min-width:0"><b>${h(p.name)}</b><p>Skill ${p.skill}/100 · Energy ${Math.round(p.energy)}% · ${money(p.salary)}/mo</p></div>${button('TRAIN $4.6K','train',p.id,state.cash<4600)}</div>`).join('')}</div><div class="panel-actions" style="justify-content:flex-start">${button('TEAM DAY $1.75K','treat','',state.cash<1750,'outline')}${button('REST & RECOVER $950','rest','',state.cash<950||Boolean(state.project&&!state.project.ready),'outline')}</div><hr class="section-divider"/><h3>Recruitment</h3><p>Experienced workers deliver better games and faster development. Each additional employee increases your monthly operating costs.</p><div class="gridcards">${[{id:'junior',name:'Junior Developer',skill:'~30 SKILL',cost:1800,salary:1450},{id:'experienced',name:'Experienced Developer',skill:'~58 SKILL',cost:4800,salary:2750},{id:'expert',name:'Industry Expert',skill:'~84 SKILL',cost:11000,salary:4750}].map(t=>`<div class="featurecard"><div><b>${t.name}</b><p>${t.skill} · ${money(t.salary)}/month</p><span class="tag">${money(t.cost)} SIGNING BONUS</span></div>${button('HIRE','hire',t.id,state.cash<t.cost||state.staff.length>=capacity(),'dark')}</div>`).join('')}</div>${state.staff.length>=capacity()?'<div class="info-strip warning">No free desks. Expand your office to hire more developers.</div>':''}`;}
function renderResearch(){return `<div class="stats-row">${stat('RESEARCH POINTS',state.rp+' RP')}${stat('ENGINE VERSION','V'+state.engine+'.0')}${stat('TECH UNLOCKED',state.technologies.length+'/'+TECH.length)}</div><div class="info-strip">Your team earns research points by developing games. Research directly improves the quality of future releases.</div><h3>Available technologies</h3><div class="gridcards">${TECH.map(t=>{let owned=state.technologies.includes(t.id),future=state.year<t.year;return `<div class="featurecard"><div><b>${h(t.name)}</b><p>${h(t.desc)}</p><span class="tag">${future?'UNLOCKS '+t.year:owned?'RESEARCHED · +'+t.bonus+' QUALITY':t.cost+' RP · +'+t.bonus+' QUALITY'}</span></div>${button(owned?'DONE':future?'LOCKED':'UNLOCK','research',t.id,owned||future||state.rp<t.cost,owned?'outline':'dark')}</div>`}).join('')}</div><hr class="section-divider"/><h3>Build a proprietary game engine</h3><div class="featurecard"><div><b>Studio Engine V${state.engine+1}.0</b><p>Improve internal tools and efficiency across all future projects. Higher versions improve release quality.</p><span class="tag">${money(state.engine*17000)}</span></div>${button('UPGRADE','engine','',state.cash<state.engine*17000,'dark')}</div>`;}
function renderStudio(){let expandPrice=floorCost();return `<div class="stats-row">${stat('STUDIO VALUE',money(studioVal()))}${stat('OFFICE','LEVEL '+state.office)}${stat('FANBASE',mini(state.fans))}</div><div class="featurecard"><div><b>${['','Garage Studio','Creative Loft','Game Campus'][state.office]}</b><p>${capacity()} workstations · ${state.staff.length} employees · More rooms and desks appear directly in your isometric studio as you expand.</p><span class="tag">${state.office<3?'NEXT EXPANSION '+money(expandPrice):'MAXIMUM SPACE REACHED'}</span></div>${button(state.office===3?'MAX':'EXPAND','expand','',state.office===3||state.cash<expandPrice,'primary')}</div><hr class="section-divider"/><h3>Company finances</h3><div class="panel-actions">${button('VIEW MONTHLY FINANCIALS','navigate','finances','','primary')}</div><div class="stack"><div class="list-item"><b>Current cash</b><b>${money(state.cash)}</b></div><div class="list-item"><b>Monthly overhead incl. salaries</b><b>${money(monthlyCosts())}</b></div><div class="list-item"><b>Lifetime game revenue</b><b>${money(state.totalRevenue)}</b></div><div class="list-item"><b>Lifetime company spending</b><b>${money(state.totalSpent)}</b></div></div><hr class="section-divider"/><h3>Studio & save management</h3><div class="panel-actions" style="justify-content:flex-start">${button('EXPORT SAVE','export','','','outline')}${button('IMPORT SAVE','import','','','outline')}${button('NEW STUDIO','new','','','outline')}</div><p>Your game autosaves in this browser. Export a backup before clearing website data or switching devices.</p><input id="save-file-input" type="file" accept=".json,application/json" hidden/><hr class="section-divider"/><h3>Studio timeline</h3><div class="history">${state.history.slice(0,8).map(v=>`<div class="history-item"><span>${h(v.date)}</span>${h(v.text)}</div>`).join('')}</div>`;}
function renderMarket(){const best=state.games.reduce((n,g)=>Math.max(n,g.score),0);return `<div class="stats-row">${stat('RELEASES',state.games.length)}${stat('BEST REVIEW',best?best+'/100':'—')}${stat('TOTAL SALES',mini(state.games.reduce((n,g)=>n+g.sales,0)))}</div><div class="info-strip"><b>Current trend:</b> ${h(TRENDS[state.trendIndex].name)}. ${h(TRENDS[state.trendIndex].desc)}</div><div class="featurecard"><div><b>Promote your studio</b><p>Spend on public relations and advertising to boost hype for your upcoming release. Hype fades over time.</p><span class="tag">CURRENT HYPE ${Math.round(state.hype)}/100</span></div>${button('PROMOTE $3K','promote','',state.cash<3000,'dark')}</div><hr class="section-divider"/><div class="panel-actions">${button('RIVAL STUDIOS & NEWS','navigate','rivals','','outline')}${button('FINANCIAL REPORT','navigate','finances','','outline')}</div><h3>Your released games</h3>${state.games.length?`<div class="stack">${state.games.map(g=>`<div class="list-item"><div style="flex:1;min-width:0"><b>${h(g.name)}</b><p>${h(g.genre)} · ${h(g.releaseDate)} · ${h(PLATFORMS.find(x=>x.id===g.platform)?.name||'PC')}</p><p>${mini(g.sales)} sold · ${money(g.totalRevenue)} earned · ${money(g.price)} each ${g.publisher?'· '+h(g.publisher):''}</p><p>${g.patches||0} patches · ${g.dlc||0} DLC · ${g.series&&g.series!==g.name?'Sequel of '+h(g.series):'Original franchise'}</p><div class="game-management">${button('PRICE −$5','priceDown',g.id,g.price<=5,'outline')}${button('PRICE +$5','priceUp',g.id,g.price>=100,'outline')}${button('PATCH '+money(2100+(g.patches||0)*2300),'patch',g.id,g.patches>=4||state.cash<2100+(g.patches||0)*2300,'dark')}${button('DLC '+money(9500+(g.dlc||0)*5500),'dlc',g.id,g.dlc>=3||state.weekNumber-g.releaseWeek<8||state.cash<9500+(g.dlc||0)*5500,'dark')}</div></div><div class="score">${g.score}</div></div>`).join('')}</div>`:'<div class="info-strip warning">No releases yet. Develop and publish your first game to start building a fanbase and generating revenue.</div>'}<hr class="section-divider"/><h3>Business history</h3><div class="history">${state.history.slice(0,12).map(v=>`<div class="history-item"><span>${h(v.date)}</span>${h(v.text)}</div>`).join('')}</div>`;}
function renderReview(id){const g=state.games.find(x=>String(x.id)===String(id))||state.games[0];if(!g)return renderMarket();return `<div style="text-align:center;padding:24px 8px"><div style="font:800 12px 'Space Grotesk';letter-spacing:.25em;color:#cf866c">THE REVIEWS ARE IN</div><h2 style="font:700 31px 'Space Grotesk';margin:12px 0">${h(g.name)}</h2><div style="display:inline-grid;place-items:center;border:8px solid ${g.score>=70?'#80c9a5':'#f0b874'};background:white;color:#284c41;border-radius:50%;width:130px;height:130px;font:800 51px 'Space Grotesk'">${g.score}</div><p style="font:700 20px 'Space Grotesk';color:#4e6263">“${h(g.review)}”</p><p>Your game is on sale! Advance time to watch revenue, sales, and fans accumulate. Check Releases & Market for performance.</p><div class="panel-actions" style="justify-content:center">${button('VIEW YOUR RELEASES','navigate','market','','primary')}${button('BACK TO THE OFFICE','close')}</div></div>`;}
function renderHelp(){return `<h3>Welcome to your studio</h3><p>Everything important happens on the isometric office floor. Your employees work, chat, and take breaks as your studio grows.</p><div class="stack"><div class="list-item"><b>1. Develop a game</b><p>Choose a genre, topic, platform, scope and development priorities. Watch progress in your office.</p></div><div class="list-item"><b>2. Run your business</b><p>Payroll and rent are charged monthly. Published games generate sales and fade as they age.</p></div><div class="list-item"><b>3. Research & hire</b><p>Build your technology and grow your team. Skills and technology improve reviews.</p></div><div class="list-item"><b>4. Expand</b><p>Buy a larger office to add more workstations and unlock a bigger, busier space.</p></div><div class="list-item"><b>5. Explore the room</b><p>Drag to pan, pinch or scroll to zoom, and tap employees, desks, props or equipment to interact. Camera reset centers the building.</p></div></div><div class="info-strip">New features: negotiate publisher advances during development, build sequels from previous releases, price and patch games after launch, publish DLC after 8 weeks, track rivals, and view monthly operating finances.</div><div class="info-strip">The time controls in the top right let you pause, change speed, or advance manually. Your game saves automatically on this device.</div>`;}
function renderNew(){return `<p>Start a completely new studio. This resets the current career. Export your current save first if you want to keep it.</p><form id="new-studio-form"><div class="form-field"><label>STUDIO NAME</label><input name="name" maxlength="35" value="Pioneer Games" required/></div><div class="panel-actions"><button type="submit" class="btn primary">START NEW CAREER →</button></div></form>`;}
function renderBankrupt(){return `<div style="text-align:center;padding:18px"><h3>Studio closed</h3><p>Your studio has fallen too far into debt. The industry is unforgiving, but every failure teaches something.</p><div class="stats-row">${stat('RELEASES',state.games.length)}${stat('FANS',mini(state.fans))}${stat('YEARS',state.year-1980)}</div><div class="panel-actions">${button('START AGAIN','new','','','primary')}</div></div>`;}
function renderPerson(id){const p=state.staff.find(s=>String(s.id)===String(id));if(!p)return renderTeam();return `<div class="stats-row">${stat('SKILL',p.skill+'/100')}${stat('ENERGY',Math.round(p.energy)+'%')}${stat('MORALE',Math.round(p.morale)+'%')}</div><div class="info-strip">${h(p.name)} is a developer on your team. ${state.project?'They are helping build '+h(state.project.name)+'.':'They are waiting for the next studio project.'}</div><div class="panel-actions">${button('TRAIN '+h(p.name.split(' ')[0])+' · $4.6K','train',p.id,state.cash<4600,'primary')}${button('VIEW TEAM','navigate','team')}</div>`;}
const headings={develop:['PRODUCTION FLOOR','Create a game'],team:['YOUR PEOPLE','Team & hiring'],research:['INNOVATION','Research & engine'],studio:['COMPANY HQ','Manage studio'],market:['PUBLISHING','Releases & market'],review:['CRITICS & PLAYERS','Game released!'],help:['HOW TO PLAY','Welcome to Studio Empire'],new:['NEW CAREER','Start a new studio'],bankrupt:['GAME OVER','Studio closure'],person:['EMPLOYEE PROFILE','Meet your developer'],finances:['FINANCE DEPARTMENT','Financial performance'],rivals:['MARKET INTELLIGENCE','Competitors & industry news']};
function openPanel(name,arg){activePanel=name;modalOpen=true;const header=headings[name]||headings.help;$('modal-eyebrow').textContent=header[0];$('modal-title').textContent=name==='person'?state.staff.find(s=>String(s.id)===String(arg))?.name||header[1]:header[1];$('modal-body').innerHTML=({develop:renderDevelop,team:renderTeam,research:renderResearch,studio:renderStudio,market:renderMarket,review:()=>renderReview(arg),help:renderHelp,new:renderNew,bankrupt:renderBankrupt,person:()=>renderPerson(arg),finances:financePanel,rivals:renderRivals}[name]||renderHelp)();$('modal-backdrop').hidden=false; }
function closePanel(){modalOpen=false;activePanel='';$('modal-backdrop').hidden=true;}
function downloadSave(){const blob=new Blob([JSON.stringify({...state,exportedAt:new Date().toISOString()},null,2)],{type:'application/json'});const url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download='studio-empire-'+state.year+'-save.json';document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),3000);toast('Save exported.');}
$('modal-body').addEventListener('submit',e=>{e.preventDefault();const fd=new FormData(e.target);if(e.target.id==='create-game-form')startProject(fd);if(e.target.id==='new-studio-form')startGame(fd);});
$('modal-body').addEventListener('click',e=>{let b=e.target.closest('[data-action]');if(!b)return;const act=b.dataset.action,id=b.dataset.id;
switch(act){case'release':releaseProject();break;case'advance':coreSim();openPanel('develop');break;case'hire':recruit(id);break;case'train':train(Number(id));break;case'treat':treat();break;case'research':research(id);break;case'engine':upgradeEngine();break;case'expand':expand();break;case'promote':promote();break;case'deal':signDeal(id);break;case'priceUp':updatePrice(id,'up');break;case'priceDown':updatePrice(id,'down');break;case'patch':patchGame(id);break;case'dlc':shipDlc(id);break;case'rest':restTeam();break;case'navigate':openPanel(id);break;case'new':openPanel('new');break;case'close':closePanel();break;case'export':downloadSave();break;case'import':$('save-file-input').click();break;}
});
$('modal-body').addEventListener('input',e=>{if(e.target.type==='range'){const parent=e.target.closest('.range-row');if(parent){const sliders=[...$('create-game-form')?.querySelectorAll('input[type=range]')||[]];const current=Number(e.target.value),others=sliders.filter(el=>el!==e.target).reduce((a,el)=>a+Number(el.value),0);if(current+others>180)e.target.value=Math.max(0,180-others);parent.querySelector('output').textContent=e.target.value;const budget=$('focus-budget');if(budget)budget.textContent=sliders.reduce((a,el)=>a+Number(el.value),0)+' / 180 POINTS ALLOCATED';}}if(e.target.id==='project-size'||e.target.id==='game-platform'){let s=SIZES.find(v=>v.id===$('project-size')?.value)||SIZES[0],p=PLATFORMS.find(v=>v.id===$('game-platform')?.value)||PLATFORMS[0];const el=$('project-cost-info');if(el)el.textContent='Starting cost: '+money(s.cost+p.fee+state.engine*650)+' · Estimated production time: '+s.weeks+' weeks. Trend: '+TRENDS[state.trendIndex].genre+'.';}});
$('modal-body').addEventListener('change',e=>{if(e.target.id==='save-file-input'&&e.target.files?.[0]){const reader=new FileReader();reader.onload=()=>{try{const obj=JSON.parse(reader.result);if(!obj.staff||!Array.isArray(obj.games)||!Number.isFinite(obj.cash)||obj.year<1980)throw Error('Invalid save format');state={...initial(),...obj};state.staff=state.staff.map((p,i)=>({...seedPerson(i,p.name,p.skill,p.salary,p.color,p.skin,p.hair),...p}));state.deals=Array.isArray(state.deals)?state.deals:[];state.rivals=Array.isArray(state.rivals)?state.rivals:[];state.news=Array.isArray(state.news)?state.news:[];state.games=state.games.map(g=>({...g,patches:g.patches||0,dlc:g.dlc||0,liveBoost:g.liveBoost||0}));save();refreshHUD();centerCamera(true);closePanel();toast('Save imported. Welcome back!');}catch(err){toast('That file is not a valid Studio Empire save.')}};reader.readAsText(e.target.files[0]);}});
$('close-modal').onclick=closePanel;$('modal-backdrop').addEventListener('pointerdown',e=>{if(e.target.id==='modal-backdrop')closePanel()});
document.querySelectorAll('[data-panel]').forEach(b=>b.addEventListener('click',()=>openPanel(b.dataset.panel)));
$('help').onclick=()=>openPanel('help');$('advance').onclick=coreSim;
$('pause').onclick=()=>{state.pauses=!state.pauses;refreshHUD();save()};$('speed').onclick=()=>{state.speed=state.speed===1?2:state.speed===2?4:1;refreshHUD();save()};
document.querySelectorAll('[data-zoom]').forEach(b=>b.onclick=()=>{camera.zoom=clamp(camera.zoom*(b.dataset.zoom==='+'?1.17:.85),.35,2.25)});
$('reset-camera').onclick=()=>centerCamera(true);
// ISOMETRIC SCENE RENDERER
function iso(x,y,z=0){return {x:(x-y)*WIDTH/2,y:(x+y)*HEIGHT/2-z};}
function polygon(points,color,stroke,strokeWidth=1){ctx.beginPath();points.forEach((p,i)=>i?ctx.lineTo(p.x,p.y):ctx.moveTo(p.x,p.y));ctx.closePath();ctx.fillStyle=color;ctx.fill();if(stroke){ctx.strokeStyle=stroke;ctx.lineWidth=strokeWidth;ctx.stroke()}}
function line(a,b,color,width=1){ctx.beginPath();ctx.moveTo(a.x,a.y);ctx.lineTo(b.x,b.y);ctx.strokeStyle=color;ctx.lineWidth=width;ctx.stroke()}
function ellipse(x,y,rx,ry,color){ctx.beginPath();ctx.ellipse(x,y,rx,ry,0,0,Math.PI*2);ctx.fillStyle=color;ctx.fill()}
function roundRect(x,y,w,h,r,color,stroke){ctx.beginPath();if(typeof ctx.roundRect==='function'){ctx.roundRect(x,y,w,h,r)}else{ctx.rect(x,y,w,h)}ctx.fillStyle=color;ctx.fill();if(stroke){ctx.strokeStyle=stroke;ctx.lineWidth=1;ctx.stroke()}}
function box(x,y,w,d,z,height,top='#e4b98e',left='#c28b68',right='#986849'){const bottom=[iso(x,y,z),iso(x+w,y,z),iso(x+w,y+d,z),iso(x,y+d,z)],upper=bottom.map(p=>({x:p.x,y:p.y-height}));polygon([bottom[1],bottom[2],upper[2],upper[1]],right);polygon([bottom[2],bottom[3],upper[3],upper[2]],left);polygon(upper,top,'#3d39332c');return upper;}
function screenBox(x,y,z,w=13,h=13,bright='#49c3d8'){const p=iso(x,y,z);polygon([{x:p.x-w,y:p.y-h},{x:p.x+w,y:p.y-h-3},{x:p.x+w,y:p.y+5},{x:p.x-w,y:p.y+8}],'#34404c','#132b3a',2);polygon([{x:p.x-w+3,y:p.y-h+3},{x:p.x+w-3,y:p.y-h+2},{x:p.x+w-3,y:p.y+1},{x:p.x-w+3,y:p.y+4}],'#153c57');for(let i=0;i<3;i++)roundRect(p.x-w+5,p.y-h+6+i*5,random(6,w+1),1.5,1,bright);}
function drawBoard(x,y,z,words){let p=iso(x,y,z);roundRect(p.x-43,p.y-61,85,53,3,'#f5f3dd','#bf9c77');ctx.save();ctx.translate(p.x,p.y-40);ctx.rotate(-.015);for(let i=0;i<4;i++){roundRect(-31,-15+i*9,random(30,62),2,1,['#6d8a9c','#e5a86f','#91bda4'][i%3]);}ctx.restore();}
function drawShadow(x,y,rx=31,ry=12){let p=iso(x,y);ellipse(p.x,p.y,rx,ry,'#2c4e4c30')}
function drawRug(x,y,w,d,color){let points=[iso(x,y),iso(x+w,y),iso(x+w,y+d),iso(x,y+d)];polygon(points,color,'#ffffff35',1);}
function drawWall(){let w=officeW(),hh=officeH();const A=iso(0,0,0),B=iso(w,0,0),C=iso(0,hh,0);polygon([A,B,{x:B.x,y:B.y-156},{x:A.x,y:A.y-156}],'#ef988b','#d57975',2);polygon([A,C,{x:C.x,y:C.y-153},{x:A.x,y:A.y-153}],'#ffad83','#d89f7f',2);
 // roof trim
 line(iso(0,0,153),iso(w,0,153),'#f6ded1',8);line(iso(0,0,153),iso(0,hh,153),'#fff1d9',8);
 // window along back wall
 const w1=iso(1.15,0,116),w2=iso(2.45,0,116),w3=iso(1.15,0,64),w4=iso(2.45,0,64);
 polygon([w1,w2,w4,w3],'#34566c','#fff3da',5);for(let j=0;j<3;j++){let a=iso(1.3+j*.35,0,102);line(a,iso(1.3+j*.35,0,70),'#729fb4',3)}
 // wall graphic art
 for(const [x,t,c] of [[3.4,'PXL','#5b92a3'],[5.7,'PLAY','#354d60']]){const p=iso(x,0,105);roundRect(p.x-20,p.y-34,47,38,2,c,'#fff0df');ctx.font='800 9px Space Grotesk, sans-serif';ctx.textAlign='center';ctx.fillStyle='#e9ddd1';ctx.fillText(t,p.x+4,p.y-13)}
 // left wall mural
 const p=iso(0,2.0,99);polygon([{x:p.x-26,y:p.y-29},{x:p.x+26,y:p.y+1},{x:p.x+26,y:p.y+34},{x:p.x-26,y:p.y+4}],'#4b8ca0','#ffead0',3);ctx.fillStyle='#ffe3a6';ctx.font='800 16px Space Grotesk, sans-serif';ctx.fillText('★',p.x-9,p.y+8);
 // whiteboard on back wall
 let q=iso(w-1.35,0,107);polygon([{x:q.x-43,y:q.y-34},{x:q.x+34,y:q.y-11},{x:q.x+34,y:q.y+43},{x:q.x-43,y:q.y+20}],'#fff9ed','#c9dad7',4);for(let i=0;i<4;i++)line({x:q.x-33,y:q.y-12+i*9},{x:q.x+8+i*3,y:q.y+i*7-5},i%2?'#f4b073':'#83a8a2',2);
}
function drawFloors(now){const w=officeW(),hh=officeH();let frame=[iso(0,0),iso(w,0),iso(w,hh),iso(0,hh)];polygon(frame,'#f6cf88','#30434a',3);
 for(let x=0;x<w;x++)for(let y=0;y<hh;y++){const c=((x+y)%2)?'#f0ce91':'#ffe1a4';polygon([iso(x,y),iso(x+1,y),iso(x+1,y+1),iso(x,y+1)],c,'#d3aa7569',.8)}
 drawRug(1.1,1.35,4.15,4.6,'#f3b095ae');drawRug(5.22,1.25,2.05,4.65,'#91d0abae');
 if(state.office>=2)drawRug(7.5,1.1,2,5.8,'#a8c4d2a8');if(state.office>=3)drawRug(1.05,6.2,7,1.4,'#d4b3b5a8');
 // bottom edges give office thickness
 polygon([iso(w,0),iso(w,hh),{x:iso(w,hh).x,y:iso(w,hh).y+19},{x:iso(w,0).x,y:iso(w,0).y+19}],'#b08459','#99764e');
 polygon([iso(w,hh),iso(0,hh),{x:iso(0,hh).x,y:iso(0,hh).y+19},{x:iso(w,hh).x,y:iso(w,hh).y+19}],'#bc9162','#99764e');
 // grout edge
 line(iso(0,hh),iso(w,hh),'#faf0cc',4);line(iso(w,0),iso(w,hh),'#f9e5bc',4);
}
function drawDesk(x,y,person){drawShadow(x+.54,y+.48,36,12);const cp=iso(x+.75,y+.15);ellipse(cp.x-3,cp.y-8,13,8,'#5b6471');roundRect(cp.x-13,cp.y-28,23,22,7,'#707e8b','#374954');
 box(x+.08,y+.12,.06,.65,0,25,'#7b9fa5','#517580','#4b6976');box(x+1,y+.12,.06,.65,0,25,'#7b9fa5','#517580','#4b6976');
 box(x,y,1.25,.85,24,11,'#dda777','#ae7455','#9a674c');
 box(x+.2,y+.16,.22,.23,35,17,'#d2ddd6','#849995','#435867');
 const p=iso(x+.49,y+.22,43);polygon([{x:p.x-20,y:p.y-19},{x:p.x+14,y:p.y-15},{x:p.x+14,y:p.y+4},{x:p.x-20,y:p.y}],'#303f4e','#1b2831',2);
 polygon([{x:p.x-17,y:p.y-16},{x:p.x+11,y:p.y-13},{x:p.x+11,y:p.y+1},{x:p.x-17,y:p.y-2}],'#1c5264');
 roundRect(p.x-13,p.y-12,18,2,1,'#6dd0ca');roundRect(p.x-13,p.y-8,10,2,1,'#d9b685');roundRect(p.x-13,p.y-4,21,1,1,'#75969d');
 const k=iso(x+.6,y+.55,38);polygon([{x:k.x-13,y:k.y},{x:k.x+7,y:k.y-3},{x:k.x+17,y:k.y+4},{x:k.x-5,y:k.y+8}],'#55626a');
 // desk cup
 let mug=iso(x+.98,y+.23,37);ellipse(mug.x,mug.y,4,2,'#fff3d9');roundRect(mug.x-4,mug.y-6,8,6,2,'#f5d1a2');
 if(state.project&&!state.project.ready){const q=iso(x+.64,y+.31,87);ctx.fillStyle='#182e3bab';roundRect(q.x-16,q.y-15,34,6,3,'#153e4e9b');roundRect(q.x-15,q.y-14,30*clamp(state.project.progress/state.project.weeks,0,1),4,2,'#88edb6');}
}
function drawCharacter(p,now){const seated=!p.moving&&p.mode!=='break'&&p.mode!=='toBreak'&&p.mode!=='return';let px=iso(p.x,p.y,0).x,py=iso(p.x,p.y,0).y;const bob=seated?Math.sin(now/90+p.id)*.45:Math.sin(now/170+p.id)*1.2;
 ellipse(px,py,13,5,'#32484a55');
 // walking stride is tied to the animation clock rather than the management clock.
 const stride=seated?0:Math.sin(now/130+p.id);
 line({x:px-3,y:py-14},{x:px-9+stride*5,y:py-2},'#40545f',5);line({x:px+5,y:py-13},{x:px+10-stride*5,y:py-3},'#40545f',5);
 // body shirt
 let bodyY=py-(seated?38:35)+bob;
 polygon([{x:px-12,y:bodyY-3},{x:px+11,y:bodyY-3},{x:px+13,y:bodyY+22},{x:px-12,y:bodyY+22}],p.color,'#344450',1.5);
 // arms
 line({x:px-11,y:bodyY+4},{x:px-19+(seated?6:0),y:bodyY+18},p.skin,5);line({x:px+11,y:bodyY+4},{x:px+17-(seated?6:0),y:bodyY+18},p.skin,5);
 const hy=bodyY-14;
 ellipse(px,hy,9.5,11,p.skin);ellipse(px-4,hy-1,1,1.3,'#403935');ellipse(px+3,hy-1,1,1.3,'#403935');
 ctx.beginPath();ctx.ellipse(px,hy-7,10,6,0,Math.PI,Math.PI*2);ctx.fillStyle=p.hair;ctx.fill();roundRect(px-9,hy-11,19,5,3,p.hair);
 if(p.id===0||p.id===3||p.id===6){ellipse(px-9,hy+1,3,7,p.hair)}
 if(state.project&&!state.project.ready&&p.breakTime<0.1&&Math.sin(now/680+p.id*3)>.76){const parts=['{ }','+1','</>','✦'];const word=parts[p.id%parts.length];roundRect(px+12,hy-43,27,19,6,'#1e6374ec','#98c9c5');ctx.fillStyle='#fff1ce';ctx.font='700 10px Space Grotesk';ctx.textAlign='center';ctx.fillText(word,px+25,hy-30)}
}
function drawPlant(x,y){const p=iso(x,y,0);box(x-.16,y-.16,.36,.36,0,13,'#e5b57d','#bc7865','#9f6251');for(let i=0;i<7;i++){const endX=p.x+Math.cos(i*2.4)*random(12,24),endY=p.y-30-Math.abs(Math.sin(i))*random(0,10);line({x:p.x,y:p.y-12},{x:endX,y:endY},'#4e9774',3);ellipse(endX,endY,6,12,i%2?'#4b9271':'#74b48b')}}
function drawCouch(x,y){box(x,y,1.6,.78,0,18,'#93b9b9','#648e96','#4e7984');box(x,y,1.6,.17,18,28,'#9ccbd0','#6b98a2','#527e87');box(x,y,.17,.75,16,20,'#91c2c9','#628f98','#48737e');box(x+1.43,y,.17,.75,16,20,'#91c2c9','#628f98','#48737e');}
function drawServer(x,y){box(x,y,.64,.55,0,78,'#465b67','#334650','#263742');const p=iso(x+.3,y+.65,38);for(let i=0;i<5;i++){roundRect(p.x-14,p.y-28+i*9,25,6,2,'#1d3643');roundRect(p.x-11,p.y-26+i*9,4,2,1,i%2?'#a6f5aa':'#8bdde2');roundRect(p.x-3,p.y-26+i*9,10,1.5,1,'#607e8a')}}
function drawArcade(x,y){box(x,y,.55,.53,0,63,'#d36063','#954759','#5f3e54');const p=iso(x+.31,y+.54,52);polygon([{x:p.x-14,y:p.y-20},{x:p.x+11,y:p.y-25},{x:p.x+11,y:p.y-5},{x:p.x-14,y:p.y}],'#243c5b','#ffdf96',1.3);ctx.fillStyle='#fbd16f';ctx.font='13px sans-serif';ctx.fillText('✦',p.x-4,p.y-8);ellipse(p.x-4,p.y+6,3,3,'#76e1bf')}
function drawCoffee(x,y){box(x,y,.48,.65,0,35,'#d2d3bc','#9caba3','#779393');box(x+.06,y+.09,.36,.42,35,9,'#ebf1e4','#a0c4c2','#839ea5');const p=iso(x+.25,y+.35,43);ellipse(p.x,p.y,5,3,'#a2d9da');}
function drawGreenScreen(x,y){
 const lower=iso(x,y,12), upper=iso(x,y,111),rLower=iso(x+1.35,y,12),rUpper=iso(x+1.35,y,111);
 polygon([upper,rUpper,rLower,lower],'#35d17b','#12824c',5);
 const p=iso(x+.67,y,79);ellipse(p.x,p.y,15,9,'#87ffc576');
 const stand=iso(x+.7,y+.75,0);line({x:stand.x,y:stand.y-58},{x:stand.x,y:stand.y-6},'#293d47',3);
 line({x:stand.x,y:stand.y-12},{x:stand.x-14,y:stand.y+5},'#35454a',3);line({x:stand.x,y:stand.y-12},{x:stand.x+13,y:stand.y+6},'#35454a',3);
 ellipse(stand.x,stand.y-60,9,7,'#455362');ellipse(stand.x,stand.y-60,4,3,'#b2f8d6');
}
function drawFoosball(x,y){box(x,y,1.1,.59,0,24,'#c37245','#935034','#6e483d');box(x+.09,y+.07,.94,.45,24,3,'#238b79','#17796b','#116557');for(let i=0;i<4;i++){let p=iso(x+.16+i*.23,y+.32,29);line({x:p.x-12,y:p.y},{x:p.x+16,y:p.y},i%2?'#e9ede4':'#e8a74f',2);ellipse(p.x+2,p.y,3,3,i%2?'#f2ca7b':'#ec7a67')}}
function drawGameBox(x,y,z,color){const a=iso(x,y,z);roundRect(a.x-11,a.y-25,22,25,3,color,'#ffffff65');roundRect(a.x-7,a.y-20,14,5,2,'#ffeeceb0');roundRect(a.x-6,a.y-11,11,7,2,'#214451b8')}
function drawFloorSpot(x,y,color){const p=iso(x,y);ellipse(p.x,p.y,24,9,color)}
function drawMeeting(x,y){box(x,y,1.55,1.07,0,24,'#ae8672','#977364','#846352');box(x-.05,y-.05,1.65,1.17,22,7,'#eece9b','#cc9974','#b27e62');for(let i=0;i<3;i++){let p=iso(x+.29+i*.4,y+.35,31);polygon([{x:p.x-10,y:p.y},{x:p.x+7,y:p.y-1},{x:p.x+6,y:p.y+9},{x:p.x-11,y:p.y+10}],['#a6c4d0','#efb5ac','#aac59f'][i])}}
function drawDecor(){const W=officeW(),H=officeH();let objects=[];
 objects.push({v:2.1,draw:()=>drawCouch(1.1,.55)});
 objects.push({v:4.25,draw:()=>drawCoffee(.68,3.48)});
 objects.push({v:W-.8+1,draw:()=>drawServer(W-.99,.58)});
 objects.push({v:7.1,draw:()=>drawMeeting(4.9,1.1)});
 objects.push({v:6.4,draw:()=>drawArcade(1.05,5.12)});objects.push({v:6.1,draw:()=>drawFoosball(1.65,5.4)});objects.push({v:6.8,draw:()=>drawGameBox(3.15,3.95,0,'#7ebaca')});
 objects.push({v:W+H-.7,draw:()=>drawPlant(W-.6,H-.5)});if(state.games.length){objects.push({v:4.7,draw:()=>drawGameBox(1.7,3.2,45,'#b26a9d')});}if(state.technologies.includes('graphics')){objects.push({v:7.4,draw:()=>drawGameBox(5.7,2.1,38,'#74a7d2')});}objects.push({v:2,draw:()=>drawGreenScreen(W-1.6,0)});
 objects.push({v:2.6,draw:()=>drawPlant(.57,2.2)});
 if(state.office>=2){objects.push({v:9.3,draw:()=>drawServer(8.05,.9)});objects.push({v:12.3,draw:()=>drawArcade(8.7,3.1)});objects.push({v:W+H-2,draw:()=>drawPlant(W-1.5,H-1)});}
 if(state.office>=3){objects.push({v:14,draw:()=>drawCouch(3.2,7.5)});objects.push({v:14.8,draw:()=>drawMeeting(7.3,6.2)});objects.push({v:15.3,draw:()=>drawCoffee(10.3,5.5)});}
 const placements=CHAIRS.slice(0,capacity()).map((p,i)=>({x:p.x-.75,y:p.y-.15,v:p.x+p.y-.3,employee:state.staff[i]||null,i}));
 for(const item of placements){objects.push({v:item.v,draw:()=>drawDesk(item.x,item.y,item.employee)});if(item.employee)objects.push({v:item.v+.4,draw:()=>drawCharacter(item.employee,performance.now())});}
 objects.sort((a,b)=>a.v-b.v);objects.forEach(o=>o.draw());
 // floor decals near meeting room
}
let previousFrame=0;
function animateStaff(time){
 const dt=clamp(previousFrame?(time-previousFrame)/1000:0,0,.07);previousFrame=time;
 for(const p of state.staff){
  if(!p.mode){p.mode='work';p.nextBreak=7+p.id*3;}
  if(p.mode==='work'){
   p.nextBreak-=dt;
   if(p.nextBreak<=0){p.mode='toBreak';p.moving=true;p.target=(p.id%3===1)?{x:4.96,y:1.03}:{x:.77,y:3.55};}
  }else if(p.mode==='toBreak'||p.mode==='return'){
   const dx=p.target.x-p.x,dy=p.target.y-p.y,d=Math.hypot(dx,dy),step=dt*.72;
   if(d<=step){p.x=p.target.x;p.y=p.target.y;p.moving=false;if(p.mode==='toBreak'){p.mode='break';p.breakTime=2.7+p.id%3;}
   else {p.mode='work';p.nextBreak=13+(p.id*4)%9;}}
   else {p.x+=dx/d*step;p.y+=dy/d*step;}
  }else if(p.mode==='break'){
    p.breakTime-=dt;if(p.breakTime<=0){const chair=CHAIRS[p.id%CHAIRS.length];p.mode='return';p.moving=true;p.target={x:chair.x,y:chair.y};p.morale=clamp(p.morale+1.8,0,100);p.energy=clamp(p.energy+1.8,0,100)}
  }
 }
}
function drawOutdoor(t){let grd=ctx.createLinearGradient(0,0,0,sceneH);grd.addColorStop(0,'#315666');grd.addColorStop(.75,'#2d525f');grd.addColorStop(1,'#203b4b');ctx.fillStyle=grd;ctx.fillRect(0,0,sceneW,sceneH);ctx.fillStyle='#a6cbd00f';for(let x=13;x<sceneW+50;x+=43)for(let y=10;y<sceneH+50;y+=42){const shift=(Math.floor(y/42)%2)*21;ctx.beginPath();ctx.arc(x+shift,y,1.6,0,Math.PI*2);ctx.fill()}}
function drawScene(time){animateStaff(time);const rect=stage.getBoundingClientRect();if(rect.width!==sceneW||rect.height!==sceneH){setCanvasSize();}drawOutdoor(time);ctx.save();ctx.translate(sceneW/2+camera.panX,sceneH*.51+camera.panY);ctx.scale(camera.zoom,camera.zoom);ctx.translate(-camera.cx,-camera.cy);
 const ww=officeW(),hh=officeH();let center=iso(ww*.5,hh*.5);ellipse(center.x,center.y+67,Math.max(120,(ww+hh)*38),165,'#0e2d3c68');
 drawFloors(time);drawWall();drawDecor();
 // building glint
 ctx.restore();if(!canvas.dataset.ready){canvas.dataset.ready='true';canvas.style.opacity='1';$('office-poster').hidden=true;$('preview-notice').hidden=true;}lastDraw=time;requestAnimationFrame(drawScene)}
function setCanvasSize(){const r=stage.getBoundingClientRect();sceneW=r.width;sceneH=r.height;const dpr=Math.min(window.devicePixelRatio||1,2);canvas.width=Math.max(1,Math.floor(r.width*dpr));canvas.height=Math.max(1,Math.floor(r.height*dpr));ctx.setTransform(dpr,0,0,dpr,0,0);}
function centerCamera(resetZoom){const w=officeW(),hh=officeH();const c=iso(w*.5,hh*.5,0);camera.cx=c.x;camera.cy=c.y-31;camera.panX=0;camera.panY=0;if(resetZoom){const availableW=stage.clientWidth,availableH=stage.clientHeight;camera.zoom=clamp(Math.min((availableW-22)/((w+hh)*WIDTH/2+40),(availableH-180)/((w+hh)*HEIGHT/2+160))*1.05,.36,1.35);camera.initialZoom=camera.zoom;}}
function getNearest(x,y){const targets=[];for(const p of state.staff){let pt=iso(p.x,p.y,0);targets.push({type:'person',id:p.id,name:p.name,x:pt.x,y:pt.y-48})}
 const things=[{name:'Development desks',x:3.1,y:3.6,type:'develop'},{name:'Meeting table',x:5.5,y:1.7,type:'studio'},{name:'Research servers',x:officeW()-.9,y:1,type:'research'},{name:'Coffee corner',x:.6,y:3.6,type:'team'},{name:'Arcade corner',x:1.05,y:5.1,type:'team'}];for(const p of things){let pt=iso(p.x,p.y,0);targets.push({...p,x:pt.x,y:pt.y-35});}
 let hit=null,best=Infinity;for(const t of targets){let sx=(t.x-camera.cx)*camera.zoom+sceneW/2+camera.panX,sy=(t.y-camera.cy)*camera.zoom+sceneH*.51+camera.panY;let d=Math.hypot(sx-x,sy-y);if(d<Math.max(29,40*camera.zoom)&&d<best){best=d;hit={...t,sx,sy}}}return hit;}
function pointerEnd(e){if(!pointerData.has(e.pointerId))return;const info=pointerData.get(e.pointerId);pointerData.delete(e.pointerId);if(!didDrag&&pointerData.size===0&&!modalOpen){const rect=stage.getBoundingClientRect(),hit=getNearest(e.clientX-rect.left,e.clientY-rect.top);if(hit){if(hit.type==='person')openPanel('person',hit.id);else openPanel(hit.type);}}if(pointerData.size===0){dragStart=null;didDrag=false;}}
stage.addEventListener('pointerdown',e=>{if(e.target!==stage&&e.target!==canvas)return;stage.setPointerCapture(e.pointerId);pointerData.set(e.pointerId,{x:e.clientX,y:e.clientY});didDrag=false;dragStart={x:e.clientX,y:e.clientY,px:camera.panX,py:camera.panY,zoom:camera.zoom};});
stage.addEventListener('pointermove',e=>{if(pointerData.has(e.pointerId)){const prev=pointerData.get(e.pointerId);const dx=e.clientX-prev.x,dy=e.clientY-prev.y;if(Math.abs(dx)+Math.abs(dy)>1.5)didDrag=true;pointerData.set(e.pointerId,{x:e.clientX,y:e.clientY});if(pointerData.size===1){camera.panX+=dx;camera.panY+=dy}else if(pointerData.size===2){let pts=[...pointerData.values()],d=Math.hypot(pts[0].x-pts[1].x,pts[0].y-pts[1].y);let oldDist=dragStart?.dist||d;if(oldDist!==d)camera.zoom=clamp(camera.zoom*(d/oldDist),.32,2.25);if(dragStart)dragStart.dist=d;}}else if(e.pointerType==='mouse'){const r=stage.getBoundingClientRect(),hit=getNearest(e.clientX-r.left,e.clientY-r.top);$('hover-bubble').hidden=!hit;if(hit){$('hover-bubble').style.left=hit.sx+'px';$('hover-bubble').style.top=hit.sy+'px';$('hover-bubble').textContent=hit.name;}}});
stage.addEventListener('pointerup',pointerEnd);stage.addEventListener('pointercancel',pointerEnd);stage.addEventListener('pointerleave',()=>{$('hover-bubble').hidden=true});
stage.addEventListener('wheel',e=>{if(e.target===canvas||e.target===stage){e.preventDefault();camera.zoom=clamp(camera.zoom*(e.deltaY<0?1.08:.92),.32,2.25)}},{passive:false});
window.addEventListener('resize',()=>{setCanvasSize();centerCamera(false)});
load();refreshHUD();setCanvasSize();centerCamera(true);try{requestAnimationFrame(drawScene)}catch(e){console.error('Scene unavailable in this file viewer',e)}
let lastTick=Date.now();setInterval(()=>{if(!state.pauses&&!modalOpen&&!state.finished&&Date.now()-lastTick>=(state.speed===1?4000:state.speed===2?1800:750)){lastTick=Date.now();coreSim();}},250);
feed('<b>WELCOME TO THE STUDIO.</b> Tap Develop a Game to start your first project.');
})();