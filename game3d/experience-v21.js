/* Studio Empire v0.21 — live clock, title workshop and career HUD wiring. */
(function(){'use strict';
const api=window.StudioEmpireSimulation21,core=window.StudioEmpireCareer;if(!api||!core)return;
const $=s=>document.querySelector(s),money=v=>'$'+Math.round(Number(v)||0).toLocaleString();
let pref;try{pref=JSON.parse(localStorage.getItem(api.PREF))||{}}catch(_){pref={}}
const clock=api.createController({core,storage:localStorage,prefs:pref,onChange:onTick});
let lastSpeed=clock.status().speed||1,lastNote='',roll=0,latestWeek=-1;
const holder=document.createElement('div');holder.id='se21-timebar';
holder.innerHTML='<div class="se21-time-label"><span class="se21-live-dot"></span><span id="se21-date">SIMULATION</span><small id="se21-cycle">AUTO</small></div><div class="se21-speed-controls" role="group" aria-label="Simulation speed"><button type="button" id="se21-toggle" aria-label="Pause simulation">Ⅱ</button>'+api.SPEEDS.slice(1).map(n=>'<button type="button" data-se21-speed="'+n+'" aria-label="'+n+' times speed">'+n+'×</button>').join('')+'</div><div class="se21-timeline"><i id="se21-progress"></i></div>';
const old=$('.bottom-row .times');if(old){old.hidden=true;old.after(holder)}else $('.scene-header')?.after(holder);
const notices=document.createElement('div');notices.id='se21-notices';notices.setAttribute('role','status');notices.setAttribute('aria-live','polite');document.body.append(notices);
const panel=document.createElement('div');panel.className='se21-auto-panel';
panel.innerHTML='<label><input type="checkbox" id="se21-auto-publish"> Auto-publish completed games</label><label><input type="checkbox" id="se21-show-notices"> Show simulation notices</label><p>Time advances while this game is open and visible. No offline catch-up charges.</p>';
const host=$('.scene-header')||$('.topbar'),options=document.createElement('button');
options.type='button';options.id='se21-options';options.textContent='⚙ Simulation';host?.append(options);
options.addEventListener('click',()=>{panel.hidden=!panel.hidden;});panel.hidden=true;host?.append(panel);
const publish=$('#se21-auto-publish'),showNotice=$('#se21-show-notices');
publish.checked=clock.status().autoRelease;showNotice.checked=clock.status().notifications;
function store(){try{localStorage.setItem(api.PREF,JSON.stringify(clock.prefs()))}catch(_){}}
publish.addEventListener('change',()=>{clock.setAutoRelease(publish.checked);store();});
showNotice.addEventListener('change',()=>{clock.setNotifications(showNotice.checked);store();});
function alertMessage(t){lastNote=t;if(!clock.status().notifications)return;notices.textContent=t;notices.classList.add('show');clearTimeout(alertMessage.timer);alertMessage.timer=setTimeout(()=>notices.classList.remove('show'),3600);}
function refreshHeader(){const s=core.read();if(!s)return;
for(const [id,value] of [['year',s.year],['cash',money(s.cash)],['crew',s.staff?.length||0]]){const node=document.getElementById(id);if(node)node.textContent=value;}
const date=$('#se21-date');if(date){const d=new Date(Date.UTC(s.year,(s.month||1)-1,s.day||((s.week||1)-1)*7+1));date.textContent=d.toLocaleDateString('en-US',{timeZone:'UTC',month:'short',day:'numeric',year:'numeric'});}
const project=$('#v17-project');if(project)project.textContent=s.project?.name||'No active game';
const pState=$('#v17-project-state');if(pState)pState.textContent=s.project?(s.project.ready?'Ready to publish':Math.round(100*(s.project.progress||0)/Math.max(1,s.project.weeks))+'% complete'):'Start developing';
const tile=$('.concept-snapshot [data-open="finances"] b');if(tile)tile.textContent=money(s.cash);
}
function onTick(e){if(e.type==='speed'){store();paint();return;}
if(e.type==='release')alertMessage('Released '+e.game.name+' · '+e.game.score+'/100');
if(e.type==='week'&&e.state){if(e.week!==latestWeek){latestWeek=e.week;refreshHeader();}
const hub=$('#career-hub');if(hub&&!hub.hidden){
 const s=e.state,metrics=hub.querySelectorAll('.career-metric b');
 if(metrics.length>=5){metrics[0].textContent=money(s.cash);metrics[1].textContent=(s.fans||0).toLocaleString();metrics[2].textContent=Math.round(s.rep||0)+'/100';metrics[3].textContent='TIER '+s.office;metrics[4].textContent=s.staff.length;}
 const status=hub.querySelector('#career-message');if(status)status.textContent='Live simulation · Week '+s.weekNumber+' · Switch sections for refreshed results.';
 // Never replace active forms or reset a scrolled management page on a clock tick.
}
}
if(e.type==='blocked')alertMessage('Simulation stopped: '+String(e.reason).replaceAll('_',' ').toLowerCase());paint();}
function paint(){const s=clock.status();holder.dataset.paused=String(s.speed===0||!s.active);
const toggle=$('#se21-toggle');toggle.textContent=s.speed===0||!s.active?'▶':'Ⅱ';toggle.setAttribute('aria-label',s.speed===0?'Resume simulation':'Pause simulation');
holder.querySelectorAll('[data-se21-speed]').forEach(b=>{b.classList.toggle('active',Number(b.dataset.se21Speed)===s.speed);b.setAttribute('aria-pressed',String(Number(b.dataset.se21Speed)===s.speed));});
$('#se21-cycle').textContent=!s.active?'NEEDS ATTENTION':s.speed===0?'PAUSED':s.speed+'× RUNNING';
$('#se21-progress').style.width=Math.min(100,Math.max(0,s.progress/s.periodMs*100))+'%';}
holder.addEventListener('click',e=>{const v=e.target.closest('[data-se21-speed]')?.dataset.se21Speed;
if(v){clock.setSpeed(Number(v));lastSpeed=Number(v);paint();return;}
if(e.target.closest('#se21-toggle')){const n=clock.status().speed;if(n){lastSpeed=n;clock.setSpeed(0);}else clock.setSpeed(lastSpeed||1);clock.resume();paint();}});
function active(){return !document.hidden&&!window.StudioEmpireMainMenu?.active;}
let timer=setInterval(()=>{clock.update(undefined,active());paint();},250);
window.addEventListener('pagehide',()=>{clearInterval(timer);timer=null;});
window.addEventListener('pageshow',()=>{if(!timer)timer=setInterval(()=>{clock.update(undefined,active());paint();},250);});
function enhanceNameForm(){const form=$('#career-project-form');if(!form||form.dataset.se21Enhanced)return;
form.dataset.se21Enhanced='true';const input=form.querySelector('input[name="name"]');if(!input)return;
const genre=form.querySelector('[name="genre"]'),topic=form.querySelector('[name="topic"]');input.parentElement.classList.add('se21-title-field');
const actions=document.createElement('div');actions.className='se21-title-tools';
actions.innerHTML='<button type="button" data-se21-random>✦ Generate title</button><button type="button" data-se21-ideas>More ideas</button>';input.after(actions);
const suggestions=document.createElement('div');suggestions.className='se21-title-suggestions';actions.after(suggestions);
function parameters(){return{genre:genre?.value||'Adventure',topic:topic?.value||'Fantasy',existing:(core.read()?.games||[]).map(x=>x.name).concat(core.read()?.project?.name||'').filter(Boolean)};}
function more(){roll++;const names=api.suggestions({...parameters(),seed:Date.now()+':'+roll});suggestions.replaceChildren();
for(const title of names){const b=document.createElement('button');b.type='button';b.textContent=title;b.addEventListener('click',()=>{input.value=title;input.dispatchEvent(new Event('input',{bubbles:true}));});suggestions.append(b);}}
actions.addEventListener('click',e=>{if(e.target.closest('[data-se21-random]')){roll++;input.value=api.generate({...parameters(),seed:Date.now()+':'+roll});input.dispatchEvent(new Event('input',{bubbles:true}));more();}else if(e.target.closest('[data-se21-ideas]'))more();});
genre?.addEventListener('change',more);topic?.addEventListener('change',more);more();}
const root=$('#career-body');if(root){new MutationObserver(enhanceNameForm).observe(root,{childList:true,subtree:false});enhanceNameForm();}
window.StudioEmpireExperience21={clock,enhanceNameForm,debug(){return{...clock.status(),titleField:!!$('#career-project-form [data-se21-random]'),running:!document.hidden,lastNote}}};
refreshHeader();paint();
})();
