/* Studio Empire v0.17 secure local save import for cross-domain preview migration.
   Accepts only structurally valid Studio Empire JSON, backs up before replacing.
   Import is an explicit user action; never automatic. */
(function(){'use strict';
const core=window.StudioEmpireCareer,ui=window.StudioEmpireCareerUI;
if(!core||!ui)return;
const actions=document.querySelector('#career-hub .career-head-actions');
if(!actions)return;
const button=document.createElement('button');button.id='v17-import-save';button.type='button';button.textContent='Import save';
button.setAttribute('aria-label','Import Studio Empire JSON career backup from Files');
const picker=document.createElement('input');picker.type='file';picker.accept='.json,application/json';picker.id='v17-import-picker';picker.hidden=true;
actions.insertBefore(button,actions.firstChild);actions.appendChild(picker);
function inform(message){const el=document.getElementById('career-message');if(el)el.textContent=message;}
function importObject(value,storage=window.localStorage,approve){
 if(!core.validate(value))return {ok:false,reason:'UNSUPPORTED_CAREER'};
 const current=storage.getItem(core.KEY);
 if(current&&!approve)return {ok:false,reason:'REPLACEMENT_NOT_APPROVED'};
 const payload=JSON.stringify(value);
 if(payload.length>2*1024*1024)return {ok:false,reason:'FILE_TOO_LARGE'};
 try{
  if(current)storage.setItem(core.BACKUP,current);
  storage.setItem(core.KEY,payload);
  const result=core.read(storage);
  if(!result || result.studio!==value.studio || result.year!==value.year)throw Error('VERIFY_FAILED');
  return {ok:true,studio:result.studio,year:result.year};
 }catch(e){
  try{if(current!==null)storage.setItem(core.KEY,current);else storage.removeItem(core.KEY);}catch(_){}
  return {ok:false,reason:'SAVE_FAILED'};
 }
}
button.addEventListener('click',()=>picker.click());
picker.addEventListener('change',async()=>{
 const f=picker.files?.[0];if(!f)return;
 try{
  if(f.size>2*1024*1024){inform('Import failed: file is larger than 2 MB.');return;}
  let parsed;
  try{parsed=JSON.parse(await f.text());}catch(_){inform('Import failed: invalid JSON file.');return;}
  if(!core.validate(parsed)){inform('Import failed: not a supported Studio Empire career.');return;}
  const current=core.read();
  if(current&&!window.confirm('Replace your current career with '+parsed.studio+'? A backup of your current career will be kept.')){inform('Import cancelled; current career unchanged.');return;}
  const result=importObject(parsed,window.localStorage,true);
  if(!result.ok){inform('Import failed: '+result.reason+'.');return;}
  inform('Imported '+result.studio+'. Reloading the 3D office…');
  window.location.reload();
 }catch(e){console.error('Career import',e);inform('Import could not be completed; current career remains unchanged.')}
 finally{picker.value='';}
});
window.StudioEmpireSaveImport={importObject,validate:core.validate};
})();