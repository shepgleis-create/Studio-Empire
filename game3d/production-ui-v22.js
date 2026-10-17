/* Studio Empire production lab: management screen for existing career, not demo data. */
(function(){'use strict';
const api=window.StudioEmpireProduction22,core=window.StudioEmpireCareer,ui=window.StudioEmpireCareerUI,industry=window.StudioEmpireIndustryUI;
if(!api||!core||!ui)return;
const hub=document.getElementById("career-hub"),main=document.getElementById("career-body"),tabs=hub?.querySelector(".career-tabs");if(!hub||!main||!tabs)return;
const esc=v=>String(v??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const tab=document.createElement("button");tab.type="button";tab.dataset.careerTab="production22";tab.textContent="Production Lab";tabs.append(tab);
const view=document.createElement("section");view.id="se22-production";view.hidden=true;main.after(view);
let note="",lastVersion="";
const card=(title,body,tag="")=>'<article class="se22-card"><header><strong>'+title+'</strong><small>'+tag+'</small></header>'+body+'</article>';
const opt=(action,name,chosen=false)=>'<button type="button" class="se22-option '+(chosen?"selected":"")+'" data-production="'+action+'">'+esc(name)+'</button>';
function render(){
 if(view.hidden)return;const s=core.read(),r=api.report(s);
 if(!s){view.innerHTML=card("Create a studio","<p>Start a career from the main menu.</p>");return;}
 let html='<header class="se22-title"><div><small>PRODUCTION OPERATIONS</small><h2>Production Lab</h2><p>Manage quality, cash burn, workforce skills and delivery milestones.</p></div><b>'+esc(s.year)+" · WEEK "+(s.weekNumber||0)+'</b></header>';
 if(!r.active)html+=card("No active game","<p>Start a new game in the Develop screen to unlock real project controls.</p>"+opt("develop","Create a game →"),"READY");
 else{
  html+='<div class="se22-progress"><div><small>PROJECT IN DEVELOPMENT</small><h3>'+esc(r.title)+'</h3><span>'+esc(r.stage)+' · '+r.progress+'% complete</span></div><b>'+r.progress+'%</b></div><div class="se22-bar"><i style="width:'+Math.min(100,r.progress)+'%"></i></div>';
  html+='<div class="se22-metrics"><div>Estimated time<b>'+r.weeksRemaining+' weeks</b></div><div>Forecast costs<b>'+core.money(r.costRemaining)+'</b></div><div>Detected bugs<b>'+r.bugs.toFixed(1)+'</b></div><div>Release target<b>'+(r.deadlineWeek?'Week '+r.deadlineWeek:"Not set")+'</b></div></div>';
  html+='<div class="se22-grid">'+card("Production strategy","<p>The strategy affects weekly expenses, work speed, bugs and morale.</p><div class='se22-options'>".replace("'se22","\"se22").replace("options'>","options\">")+Object.entries(api.STRATEGIES).map(([id,v])=>opt("strategy:"+id,v.name,r.strategy===id)).join("")+"</div>","OPERATIONS");
  html+=card("Development priorities","<p>Divide the fixed 180 points between design, technology and presentation. Genre weighting affects reviews.</p><div class=\"se22-options\">"+Object.entries(api.FOCUS).map(([id,v])=>opt("focus:"+id,id[0].toUpperCase()+id.slice(1),r.focus.join(",")===v.join(","))).join("")+'</div><div class="se22-focusing">'+r.focus.map((value,i)=>'<div><span>'+["Design","Technology","Presentation"][i]+'</span><b>'+value+'/100</b><i><em style="width:'+value+'%"></em></i></div>').join("")+"</div>","GAME DESIGN")+"</div>";
  const due=r.deadlineWeek?Math.min(52,Math.max(4,r.deadlineWeek-(s.weekNumber||0))):12;
  html+='<div class="se22-grid">'+card("Delivery schedule",'<p>Set a target date. Projects that miss deadlines accrue additional bug risk.</p><form id="se22-target"><label>Weeks from now<input type="number" name="weeks" min="4" max="52" required value="'+due+'"></label><button type="submit">Set target</button></form>'+(r.missed?'<p class="se22-warning">The target date has been missed.</p>':""),"PROJECT TIMELINE");
  html+=card("Assign staff specializations",'<p>Programmers and designers help production speed; QA reduces bugs; art and audio help project matching.</p><div class="se22-staff">'+r.team.map(person=>'<label><span>'+esc(person.name)+'</span><select data-production-staff="'+esc(person.id)+'">'+Object.entries(api.ROLES).map(([id,label])=>'<option value="'+id+'" '+(person.specialty===id?'selected':'')+'>'+esc(label)+'</option>').join("")+'</select></label>').join("")+"</div>","TEAMWORK")+"</div>";
  html+=card("Milestone history",'<div class="se22-milestones">'+["concept","prototype","production","polish","ready"].map(stage=>{const at=r.milestones.find(m=>m.phase===stage);return'<div class="'+(at||r.stage===stage?"done":"")+'"><i></i><span>'+stage+'</span><small>'+(at?'Week '+at.week:"—")+'</small></div>';}).join("")+"</div><p>Stages update as the live simulation runs and remain in your career save.</p>","REAL PROJECT PROGRESS");
 }
 html+='<div class="se22-note" role="status">'+esc(note||"Every change saves to your current career. Simulation advances automatically while playing.")+"</div>";
 view.innerHTML=html;lastVersion=(s._studio3dRevision||0)+":"+(s.weekNumber||0);
}
function open(){industry?.close();ui.open();main.hidden=true;view.hidden=false;render();}
function close(){view.hidden=true;main.hidden=false;}
view.addEventListener("click",event=>{const b=event.target.closest("[data-production]");if(!b)return;const [action,id]=b.dataset.production.split(":");if(action==="develop"){window.StudioEmpireNavigation20?.openPage("projects");return;}
 let r;if(action==="strategy")r=api.setStrategy(id);if(action==="focus")r=api.changeFocus(api.FOCUS[id]);note=r?.ok?"Project settings saved.":"Could not change settings: "+(r?.reason||"UNKNOWN");render();});
view.addEventListener("change",event=>{const el=event.target.closest("[data-production-staff]");if(!el)return;const r=api.specialize(el.dataset.productionStaff,el.value);note=r.ok?"Assigned "+r.employee+" to "+api.ROLES[r.role]+".":"Assignment failed: "+r.reason;render();});
view.addEventListener("submit",event=>{if(event.target.id!=="se22-target")return;event.preventDefault();const weeks=Number(new FormData(event.target).get("weeks")),r=api.setDeadline(weeks);note=r.ok?"Release target set for week "+r.targetWeek+".":"Target failed: "+r.reason;render();});
setInterval(()=>{if(view.hidden||document.hidden)return;const s=core.read(),version=(s?._studio3dRevision||0)+":"+(s?.weekNumber||0);if(version!==lastVersion)render();},1400);
window.StudioEmpireProductionUI22={open,close,render,debug(){return{active:!view.hidden,hasProject:!!api.report(core.read())?.active}}};
})();