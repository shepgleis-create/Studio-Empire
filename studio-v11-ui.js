/* Studio Empire v0.11: real HUD data, existing panel handlers, no baked-in UI assets. */
(()=>{'use strict';
 const $=id=>document.getElementById(id);const KEY='studio-empire-reboot-v1';
 const nav=[['studio','⌂','Office'],['develop','◈','Projects'],['team','♟','Team'],['research','⚗','Research'],['rivals','♜','Rivals'],['finances','▥','Finance'],['market','◉','Market']];
 const app=$('app'),stage=$('game-stage');if(!app||!stage)return;
 const rail=document.createElement('aside');rail.className='premium-rail';rail.setAttribute('aria-label','Management navigation');
 rail.innerHTML=`<div class="rail-caption">OPERATIONS</div>${nav.map(([p,ico,label])=>`<button type="button" data-panel="${p}" class="rail-action ${p==='studio'?'active':''}" aria-label="${label}"><span aria-hidden="true">${ico}</span><b>${label}</b></button>`).join('')}<div class="rail-bottom"><div class="next-goal">★ NEXT MILESTONE<br><strong id="rail-goal">Release your first game</strong></div><span class="alive-dot"></span> LIVE SIMULATION <small>Every decision shapes your company</small></div>`;
 app.insertBefore(rail,app.querySelector('.game-wrap'));
 const deck=document.createElement('section');deck.className='command-deck';deck.setAttribute('aria-label','Studio operations dashboard');
 deck.innerHTML=`<button type="button" id="deck-collapse" class="deck-collapse" aria-expanded="true" aria-controls="deck-cards"><span>◫</span> LIVE OPERATIONS <span class="deck-toggle-text">HIDE</span></button>
 <div id="deck-cards" class="deck-cards">
  <button type="button" data-panel="develop" class="deck-card" id="card-project"><div class="deck-head"><span>◈ ACTIVE PROJECT</span><em>VIEW ↗</em></div><strong id="deck-project-title">Ready for the next hit</strong><p id="deck-project-sub">Start your first game development project</p><div class="deck-track"><span id="deck-project-progress"></span></div><div class="deck-foot"><span id="deck-project-phase">PLANNING</span><span id="deck-project-percent">0%</span></div></button>
  <button type="button" data-panel="research" class="deck-card" id="card-research"><div class="deck-head"><span>⚗ RESEARCH & TECH</span><em>OPEN ↗</em></div><strong id="deck-rp">—</strong><p>Research points available</p><div class="deck-metrics"><span>ENGINE <b id="deck-engine">1</b></span><span>UNLOCKED <b id="deck-unlocks">0</b></span></div><div class="deck-hint">Unlock the tools behind your next hit →</div></button>
  <button type="button" data-panel="rivals" class="deck-card" id="card-rivals"><div class="deck-head"><span>♜ INDUSTRY RIVALS</span><em>EXPLORE ↗</em></div><strong id="deck-rivals">—</strong><p>Competing studios in the market</p><div class="deck-metrics"><span>OWNED <b id="deck-owned">0</b></span><span>FANS <b id="deck-fans">—</b></span></div><div class="deck-hint">Acquire, merge and grow your empire →</div></button>
  <button type="button" data-panel="finances" class="deck-card" id="card-finances"><div class="deck-head"><span>▥ STUDIO FINANCES</span><em>DETAILS ↗</em></div><strong id="deck-cash">—</strong><p>Available company cash</p><div class="deck-metrics"><span>EMPLOYEES <b id="deck-staff">3</b></span><span>OFFICE <b id="deck-office">GARAGE</b></span></div><div class="deck-hint">Plan the next expansion →</div></button>
 </div>`;
 stage.appendChild(deck);
 const quick=document.createElement('div');quick.className='quick-context';quick.setAttribute('aria-label','Office view controls');quick.innerHTML=`<span class="context-live"><span class="alive-dot"></span> INTERACTIVE STUDIO</span><span class="context-detail">Drag to look around · Tap a team member</span><button id="v11-fit" type="button" title="Fit office to screen" aria-label="Fit office to screen">⛶ FIT</button>`;
 stage.appendChild(quick);$('v11-fit').addEventListener('click',e=>{e.stopPropagation();$('reset-camera')?.click()});
 const toggle=$('deck-collapse');const dock=()=>{const closed=stage.classList.toggle('deck-closed');toggle.setAttribute('aria-expanded',String(!closed));toggle.querySelector('.deck-toggle-text').textContent=closed?'SHOW':'HIDE';};toggle.addEventListener('click',dock);
 if(matchMedia('(max-width:760px), (orientation:landscape) and (max-height:540px)').matches){stage.classList.add('deck-closed');toggle.setAttribute('aria-expanded','false');toggle.querySelector('.deck-toggle-text').textContent='SHOW';}
 document.querySelectorAll('.premium-rail [data-panel],.mobile-nav [data-panel],.command-deck [data-panel]').forEach(btn=>btn.addEventListener('click',()=>{
  document.querySelectorAll('.premium-rail .rail-action').forEach(x=>x.classList.toggle('active',x.dataset.panel===btn.dataset.panel));
  // Dynamic controls are added after the game initializes its listeners. Route through the real existing control.
  if(btn.closest('.premium-rail')||btn.closest('.command-deck'))document.querySelector('.mobile-nav [data-panel="'+btn.dataset.panel+'"]')?.click();
 }));
 function currency(n){const v=Number(n)||0;if(Math.abs(v)>=1e9)return (v<0?'−':'')+'$'+(Math.abs(v)/1e9).toFixed(1)+'B';if(Math.abs(v)>=1e6)return (v<0?'−':'')+'$'+(Math.abs(v)/1e6).toFixed(2)+'M';return (v<0?'−':'')+'$'+Math.abs(v).toLocaleString('en-US',{maximumFractionDigits:0});}
 function update(){let s;try{s=JSON.parse(localStorage.getItem(KEY));}catch{}if(!s)return;
  const p=s.project,percent=p?Math.min(100,Math.round((p.progress||0)/Math.max(1,p.weeks||1)*100)):0;
  $('deck-project-title').textContent=p?.name|| (s.games?.length?'Create your next project':'Your first game starts here');
  $('deck-project-sub').textContent=p?(p.ready?'Ready to release':(p.genre||'Game')+' · '+(p.platform||'PC')+' · '+(p.ready?'Complete':'In development')):'Plan, produce, polish and publish';
  $('deck-project-progress').style.width=percent+'%';$('deck-project-percent').textContent=percent+'%';$('deck-project-phase').textContent=p?.ready?'RELEASE READY':p?'IN DEVELOPMENT':'NO ACTIVE PROJECT';
  $('deck-rp').textContent=Math.round(s.rp||0)+' RP';$('deck-engine').textContent=s.engine||1;$('deck-unlocks').textContent=s.technologies?.length||0;
  $('deck-rivals').textContent=(s.companies?.filter(x=>!x.merged).length||0)+' COMPANIES';$('deck-owned').textContent=s.companies?.filter(x=>x.owned&&!x.merged).length||0;
  $('deck-fans').textContent=(s.fans||0).toLocaleString('en-US');$('deck-cash').textContent=currency(s.cash);$('deck-cash').classList.toggle('negative',(s.cash||0)<0);
  $('rail-goal').textContent=(s.games?.length||0)?'Grow the next big franchise':'Release your first game';$('deck-staff').textContent=s.staff?.length||0;$('deck-office').textContent=['','GARAGE','RENTED','LOFT','CAMPUS'][s.office||1]||'GARAGE';
  document.body.classList.toggle('era-vintage',(s.year||1980)<1990);
 }
 window.addEventListener('storage',update);setInterval(update,1200);update();
 document.addEventListener('keydown',e=>{if(e.key==='Escape'&&document.body.classList.contains('office-immersive'))$('immersive-office')?.click()});
})();
