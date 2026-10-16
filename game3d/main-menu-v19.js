/* Studio Empire 3D v0.19 / proper main menu and save-safe career launch. */
(function(){
'use strict';
const core=window.StudioEmpireCareer;
if(!core){console.error('Main menu requires StudioEmpireCareer');return;}
const key='studio-empire-visual-settings-v19',enterKey='studio-empire-menu-enter';
const read=()=>core.read();
const escape=s=>String(s??'').replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
let config;
try{config=Object.assign({theme:'violet',quality:'balanced',motion:true,compact:false},JSON.parse(localStorage.getItem(key))||{});}catch(_){config={theme:'violet',quality:'balanced',motion:true,compact:false};}
function apply(){
 document.body.dataset.studio19Theme=['violet','amber','ice'].includes(config.theme)?config.theme:'violet';
 document.body.classList.toggle('studio19-no-motion',!config.motion);
 document.body.classList.toggle('studio19-compact',!!config.compact);
 const e=window.StudioEmpire3D?.engine;
 if(e&&!e.isDisposed?.()){const d=Math.max(1,devicePixelRatio||1);e.setHardwareScalingLevel(config.quality==='eco'?Math.max(1.8,d):config.quality==='ultra'?1:Math.max(1,Math.min(d,1.65)));}
}
const overlay=document.createElement('div');overlay.id='studio19-menu';overlay.className='studio19-menu';overlay.hidden=true;
overlay.innerHTML='<div class="studio19-shell" role="dialog" aria-label="Studio Empire main menu" aria-modal="true"><header class="studio19-top"><div class="studio19-logo"><span class="studio19-brand-icon">✦</span><span><strong>STUDIO <em>EMPIRE</em></strong><small>THE GAME DEVELOPMENT COMPANY SIMULATOR</small></span></div><small class="studio19-build">THE STUDIO ERA <b>v0.19</b></small></header><main class="studio19-layout"><section class="studio19-hero"><span class="studio19-eyebrow">◆ &nbsp; YOUR STORY. YOUR STUDIO.</span><h1>Build the next <i>gaming empire.</i></h1><p>Start alone in a garage. Develop your first title, grow your team and build a studio that takes on the industry.</p><div id="studio19-actions" class="studio19-actions"></div><div id="studio19-feedback" role="status" class="studio19-feedback"></div></section><aside id="studio19-side" class="studio19-side"></aside></main><footer class="studio19-footer"><span>STUDIO EMPIRE // FOUNDERS EDITION</span><span>Career saves remain on this device</span></footer></div>';
document.body.append(overlay);
const $=id=>document.getElementById(id),actions=$('studio19-actions'),side=$('studio19-side'),feedback=$('studio19-feedback'),app=$('app');
const fmt=v=>'$'+Math.round(Number(v)||0).toLocaleString();
function button(action,title,sub='',primary=false,disabled=false){return '<button type="button" data-menu-action="'+action+'" class="studio19-button '+(primary?'primary':'')+'" '+(disabled?'disabled':'')+'><span><strong>'+title+'</strong><small>'+sub+'</small></span><b aria-hidden="true">→</b></button>';}
function message(s){feedback.textContent=s||'';}
function home(){
 const s=read();actions.innerHTML=button('continue',s?'Continue Career':'No Career Yet',s?escape(s.studio)+' · '+s.year:'Create a studio to begin',true,!s)+button('new','New Career','Start with one founder in a garage')+button('import','Import Saved Career','Restore a JSON file from your iPhone')+button('settings','Settings','Graphics, interface and colors');
 side.innerHTML='<header class="studio19-side-heading"><span class="studio19-eyebrow">'+(s?'YOUR STUDIO':'THE JOURNEY BEGINS')+'</span><strong>'+escape(s?s.studio:'From a garage to greatness.')+'</strong></header><div class="studio19-blueprint"><div class="studio19-map"><div class="studio19-map-grid"></div><div class="studio19-map-room a"></div><div class="studio19-map-room b"></div><div class="studio19-map-room c"></div><span>BLUEPRINT / 4 OFFICE TIERS</span></div></div><div class="studio19-records">'+(s?'<div>FOUNDED<br><b>'+s.year+'</b></div><div>CASH<br><b>'+fmt(s.cash)+'</b></div><div>EMPLOYEES<br><b>'+s.staff.length+'</b></div><div>RELEASED GAMES<br><b>'+s.games.length+'</b></div>':'<div>STARTING TEAM<br><b>1 Founder</b></div><div>OFFICE TIERS<br><b>4</b></div><div>FIRST YEAR<br><b>1975+</b></div><div>SAVE SYSTEM<br><b>Local + Export</b></div>')+'</div>';
}
function render(page='home'){
 message('');
 if(page==='new'){
 actions.innerHTML='<form id="studio19-new-form" class="studio19-form"><label>COMPANY NAME<input required name="studio" maxlength="35" value="Pioneer Games"></label><label>FOUNDER NAME<input required name="founder" maxlength="38" value="Alex Morgan"></label><div class="studio19-fields"><label>STARTING YEAR<select name="year">'+[1975,1980,1990,2000,2010,2020,2030].map(y=>'<option value="'+y+'">'+y+'</option>').join('')+'</select></label><label>DIFFICULTY<select name="difficulty"><option value="story">Creative</option><option value="standard" selected>Standard</option><option value="hard">Hard</option><option value="brutal">Brutal</option></select></label></div><button class="studio19-button primary" type="submit"><span><strong>Found Your Studio</strong><small>One founder · Garage headquarters</small></span><b>→</b></button><button class="studio19-textbutton" data-menu-action="home" type="button">← Main menu</button></form>';
 side.innerHTML='<header class="studio19-side-heading"><span class="studio19-eyebrow">LEVEL 01</span><strong>The Garage</strong></header><div class="studio19-newcopy"><span class="studio19-large-number">01</span><p>Develop and release games to earn larger offices. Every move has a cost and requirements.</p><small>GARAGE → RENTED → ESTABLISHED → GLOBAL HQ</small></div>';
 }else if(page==='settings'){
 actions.innerHTML='<form id="studio19-settings" class="studio19-form"><label>COLOR THEME<select name="theme"><option value="violet">Nocturne — Violet and Champagne</option><option value="amber">Foundry — Amber and Graphite</option><option value="ice">Arctic — Blue and Silver</option></select></label><label>3D QUALITY<select name="quality"><option value="eco">Battery Saver</option><option value="balanced">Balanced</option><option value="ultra">High Detail</option></select></label><label class="studio19-switch"><input type="checkbox" name="motion">Enable UI animations</label><label class="studio19-switch"><input type="checkbox" name="compact">Compact game dashboard</label><button class="studio19-button primary" type="submit"><span><strong>Save Settings</strong><small>Career progress is never changed</small></span><b>✓</b></button><button class="studio19-textbutton" data-menu-action="home" type="button">← Main menu</button></form>';
 const f=$('studio19-settings');f.elements.theme.value=config.theme;f.elements.quality.value=config.quality;f.elements.motion.checked=!!config.motion;f.elements.compact.checked=!!config.compact;
 side.innerHTML='<header class="studio19-side-heading"><span class="studio19-eyebrow">PERSONALIZATION</span><strong>Choose your aesthetic.</strong></header><div class="studio19-newcopy"><p>All themes change the actual game interface. Battery saver lowers the 3D rendering resolution.</p></div>';
 }else if(page==='import'){
 actions.innerHTML='<div class="studio19-import"><p>Import a Studio Empire career JSON file. The current career is backed up before any approved replacement.</p><input type="file" id="studio19-import-file" accept=".json,application/json"><button data-menu-action="upload" class="studio19-button primary"><span><strong>Import Career</strong><small>Maximum 2 MB</small></span><b>↥</b></button><button data-menu-action="home" class="studio19-textbutton">← Main menu</button></div>';
 side.innerHTML='<header class="studio19-side-heading"><span class="studio19-eyebrow">SAVE FILES</span><strong>Carry your studio forward.</strong></header><div class="studio19-newcopy"><p>Export a save from the career manager to move between preview URLs or devices.</p></div>';
 }else home();
}
function open(page='home'){render(page);overlay.hidden=false;document.body.classList.add('studio19-menu-active');if(app)app.inert=true;}
function close(){if(!read()){message('Create a career to continue.');return false;}overlay.hidden=true;document.body.classList.remove('studio19-menu-active');if(app)app.inert=false;return true;}
function enter(){try{sessionStorage.setItem(enterKey,'1');}catch(_){}const u=new URL(location.href);u.searchParams.set('play','1');location.replace(u.href);}
async function importFile(){const file=$('studio19-import-file')?.files?.[0];if(!file){message('Select a JSON file first.');return;}if(file.size>2097152){message('File is larger than 2 MB.');return;}let data;try{data=JSON.parse(await file.text());}catch(_){message('Invalid JSON file.');return;}if(!core.validate(data)){message('This is not a supported career save.');return;}const old=read();if(old&&!confirm('Replace '+old.studio+'? A backup will be kept.'))return;const result=window.StudioEmpireSaveImport?.importObject?.(data,localStorage,true);if(!result?.ok){message('Could not import: '+(result?.reason||'IMPORTER_UNAVAILABLE'));return;}enter();}
overlay.addEventListener('click',e=>{const el=e.target.closest('[data-menu-action]');if(!el)return;const action=el.dataset.menuAction;if(action==='continue')close();else if(action==='upload')importFile();else render(action);});
overlay.addEventListener('submit',e=>{e.preventDefault();const form=e.target;
 if(form.id==='studio19-new-form'){const old=read();if(old&&!confirm('Replace '+old.studio+'? A backup will be kept.'))return;const result=core.createCareer(Object.fromEntries(new FormData(form)),localStorage,!!old);if(!result.ok){message('Could not start: '+result.reason);return;}enter();}
 if(form.id==='studio19-settings'){const f=form.elements;config={theme:f.theme.value,quality:f.quality.value,motion:f.motion.checked,compact:f.compact.checked};try{localStorage.setItem(key,JSON.stringify(config));}catch(_){message('Storage unavailable.');return;}apply();message('Settings saved and applied.');}
});
const toggle=document.createElement('button');toggle.type='button';toggle.id='studio19-menu-toggle';toggle.className='studio19-menu-toggle';toggle.textContent='☰ MENU';toggle.addEventListener('click',()=>open());document.querySelector('.topbar')?.append(toggle);
addEventListener('keydown',e=>{if(e.key==='Escape'&&!overlay.hidden){e.preventDefault();close();}});
apply();let autostart=false;try{autostart=sessionStorage.getItem(enterKey)==='1';sessionStorage.removeItem(enterKey);}catch(_){}
const url=new URL(location.href);if(url.searchParams.has('play')){autostart=true;url.searchParams.delete('play');try{history.replaceState(null,'',url.pathname+url.search+url.hash);}catch(_){}}
if(!(autostart&&read()))open();
window.StudioEmpireMainMenu={open,close,render,get active(){return !overlay.hidden},get settings(){return {...config}},debug(){return {menuOpen:!overlay.hidden,hasCareer:!!read(),theme:config.theme}}};
})();