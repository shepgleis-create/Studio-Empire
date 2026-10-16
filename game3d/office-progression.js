/* Studio Empire: four actual Babylon.js office environments. Preview only:
   tours do not purchase buildings or overwrite career saves. */
(function(){
'use strict';
const api=window.StudioEmpire3D,B=window.BABYLON,bridge=window.StudioEmpireBridge;
if(!api||!B||!bridge)return;
const sc=api.scene,cam=api.camera,career=bridge.snapshot(),root=new B.TransformNode('office tier scenes',sc);
const baseMeshes=sc.meshes.slice(),baseStaff=api.staff.map(x=>x.root);
const $=id=>document.getElementById(id);
const specs=[
 {name:'Garage',staff:1,cost:0,rent:150,desc:'One founder, one workstation',size:[11,9]},
 {name:'Rented Studio',staff:8,cost:12500,rent:2200,desc:'Small development team',size:[14,12]},
 {name:'Established Studio',staff:32,cost:135000,rent:14800,desc:'Art, programming, QA and R&D',size:[22,17]},
 {name:'Global Headquarters',staff:150,cost:1600000,rent:78000,desc:'Multi-department company campus',size:[30,23]}
];
let active=1;
const scenes=new Map(),textures=new Map(),animated=new Map();
function material(name,color,alpha=1){
 const key=name+color+alpha;if(textures.has(key))return textures.get(key);
 const m=new B.StandardMaterial(key,sc);
 m.diffuseColor=B.Color3.FromHexString(color);
 m.specularColor=B.Color3.FromHexString('#343D4B');
 m.alpha=alpha;if(alpha<1)m.backFaceCulling=false;
 if(name==='glow')m.emissiveColor=B.Color3.FromHexString(color).scale(.45);
 textures.set(key,m);return m;
}
const mat={
 wall:material('wall','#C9BBAA'),floor:material('floor','#9A8B7D'),floor2:material('floor2','#B2AAA0'),
 beam:material('beam','#685548'),steel:material('steel','#374856'),metal:material('metal','#86929A'),
 desk:material('desk','#98704F'),wood:material('wood','#5D493F'),chair:material('chair','#76594F'),
 neon:material('glow','#5EC9E5'),screen:material('screen','#214761'),body:material('body','#669A90'),
 body2:material('body2','#C47E72'),skin:material('skin','#D3A281'),
 rug:material('rug','#A05D60'),plant:material('plant','#56865D'),pot:material('pot','#B07954'),
 glass:material('glass','#98CBD6',.32),paper:material('paper','#E9DBBC'),
 equipment:material('equipment','#182C3A')
};
const shapeCache=new Map();
function cube(parent,id,w,h,d,x,y,z,m,label){
 // Repeated desks, windows, racks and furniture share GPU geometry within a room.
 // Instancing preserves individual positions and pick metadata.
 const key=parent.name+'|'+w+'|'+h+'|'+d+'|'+m.name;
 let proto=shapeCache.get(key);
 const q=proto?proto.createInstance(id):B.MeshBuilder.CreateBox(id,{width:w,height:h,depth:d},sc);
 if(!proto)shapeCache.set(key,q);
 q.position.set(x,y,z);if(!proto)q.material=m;
 q.parent=parent;q.isPickable=!!label;
 if(label)q.metadata={label,kind:'3D office object'};return q;
}
function cylinder(parent,id,diam,h,x,y,z,m){
 const q=B.MeshBuilder.CreateCylinder(id,{diameter:diam,height:h,tessellation:12},sc);
 q.position.set(x,y,z);q.parent=parent;q.material=m;q.isPickable=false;return q;
}
function sphere(parent,id,diam,x,y,z,m){
 const q=B.MeshBuilder.CreateSphere(id,{diameter:diam,segments:10},sc);
 q.position.set(x,y,z);q.parent=parent;q.material=m;q.isPickable=false;return q;
}
function plant(g,x,z){cylinder(g,'pot',.42,.42,x,.21,z,mat.pot);
 cylinder(g,'stem',.09,.67,x,.72,z,mat.plant);
 for(let i=0;i<5;i++){const a=i*Math.PI*2/5;
 sphere(g,'leaf',.37,x+Math.cos(a)*.26,1.12+(i%2)*.15,z+Math.sin(a)*.26,mat.plant);}
}
function light(g,x,z){cylinder(g,'ceiling light',.54,.19,x,3.45,z,mat.metal);sphere(g,'bulb',.20,x,3.31,z,mat.paper);}
function chair(g,x,z){
 cylinder(g,'chair seat',.62,.12,x,.66,z,mat.chair);
 cube(g,'chair back',.66,.75,.17,x,1.04,z+.3,mat.chair);
 cylinder(g,'chair support',.085,.65,x,.34,z,mat.steel);
}
function desk(g,x,z,i){
 cube(g,'desk-'+i,1.9,.13,.92,x,1.04,z,mat.desk,'Workstation '+(i+1));
 for(let side of [-.78,.78])for(let depth of [-.33,.33])cube(g,'desk leg',.08,1,.08,x+side,.51,z+depth,mat.steel);
 cube(g,'monitor case',.8,.58,.13,x,1.65,z-.14,mat.equipment);
 cube(g,'monitor screen',.70,.47,.022,x,1.67,z-.060,mat.screen);
 for(let k=0;k<5;k++)cube(g,'screen code',.13+(k%3)*.10,.012,.015,x-.23,1.80-k*.073,z-.045,mat.neon);
 cube(g,'keyboard',.64,.05,.22,x,1.12,z+.23,mat.paper);
 cube(g,'computer tower',.32,.62,.44,x+.86,.39,z-.14,mat.equipment);
 cylinder(g,'coffee mug',.17,.16,x-.68,1.20,z+.21,mat.paper);
 chair(g,x,z+.95);
}
function conference(g,x,z){
 cube(g,'conference table',3.5,.15,1.18,x,1.00,z,mat.wood,'Meeting room');
 for(let i=0;i<6;i++){
  let side=i%2===0?-1:1;
  chair(g,x-1.15+Math.floor(i/2)*1.15,z+side*.95);
 }
}
function server(g,x,z){
 cube(g,'hardware server cabinet',.8,2.25,.75,x,1.13,z,mat.equipment,'Server and hardware lab');
 for(let j=0;j<6;j++){
  cube(g,'rack',.68,.23,.035,x,.35+j*.32,z+.39,mat.steel);
  sphere(g,'server LED',.034,x-.2,.35+j*.32,z+.413,mat.neon);
 }
}
function sofa(g,x,z){
 cube(g,'sofa seat',1.9,.41,.84,x,.45,z,mat.chair,'Employee lounge');
 cube(g,'sofa back',1.9,.8,.19,x,.82,z-.4,mat.chair);
 for(let side of [-1,1])cube(g,'sofa arm',.18,.5,.83,x+side*.95,.61,z,mat.chair);
 cube(g,'coffee table',1.32,.22,.62,x,.43,z+1.1,mat.wood);
}
function sign(g,label,x,z,w=3.4){
 const t=new B.DynamicTexture('sign texture '+label,{width:768,height:128},sc,true);
 const c=t.getContext();c.fillStyle='#182B3D';c.fillRect(0,0,768,128);
 c.textAlign='center';c.fillStyle='#DBEDF3';c.font='bold 65px system-ui';
 c.fillText(label,384,86,718);t.update();
 const m=new B.StandardMaterial('sign '+label,sc);m.diffuseTexture=t;m.emissiveColor=B.Color3.FromHexString('#364455');m.backFaceCulling=false;
 const mesh=B.MeshBuilder.CreatePlane('department sign '+label,{width:w,height:.56},sc);
 mesh.parent=g;mesh.material=m;mesh.position.set(x,2.85,z);mesh.isPickable=false;
}
function partition(g,x,z,d){
 cube(g,'partition glass',.055,2.55,d,x,1.42,z,mat.glass,'Glass-walled department');
 for(let dz=-d/2;dz<d/2;dz+=2.2)cube(g,'partition mullion',.105,2.55,.10,x,1.42,z+dz,mat.steel);
}
function building(level){
 if(scenes.has(level))return scenes.get(level);
 const spec=specs[level-1],g=new B.TransformNode('Office '+level+' '+spec.name,sc);
 g.parent=root;const [w,d]=spec.size,workspots=[];
 cube(g,'foundation',w+.3,.32,d+.3,0,-.23,0,mat.equipment);
 cube(g,'architectural floor',w,.12,d,0,-.03,0,level===3?mat.floor:mat.floor2);
 cube(g,'back concrete wall',w,3.5,.16,0,1.76,-d/2,mat.wall);
 cube(g,'left concrete wall',.16,3.5,d,-w/2,1.76,0,mat.wall);
 cube(g,'wall top trim',w,.18,.23,0,3.55,-d/2,mat.beam);
 for(let x=-w/2+2;x<w/2;x+=2)cube(g,'floor seam',.018,.01,d,x,.041,0,mat.steel);
 for(let z=-d/2+2;z<d/2;z+=2)cube(g,'floor seam',w,.01,.018,0,.041,z,mat.steel);
 if(level===2){
  sign(g,'SMALL STUDIO',-3,-d/2+.13);
  for(let i=0;i<6;i++){const x=-4+(i%3)*3.25,z=-3+Math.floor(i/3)*3.8;desk(g,x,z,i);workspots.push([x,z]);}
  conference(g,3.0,3.5);sofa(g,-4.6,4.4);
  partition(g,5,0,6);
  for(let i=0;i<5;i++)plant(g,-5.4+(i%3)*5,-4+(i%2)*8);
  light(g,-3,-2);light(g,3,1);
 }else if(level===3){
  sign(g,'PROGRAMMING',-6,-d/2+.13);
  sign(g,'ART & DESIGN',5,-d/2+.13);
  for(let i=0;i<14;i++){const x=-8+(i%5)*3.2,z=-5+Math.floor(i/5)*3.35;desk(g,x,z,i);workspots.push([x,z]);}
  partition(g,5,1,9);conference(g,7,-4);
  for(let i=0;i<4;i++)server(g,6+(i%2)*1.1,1.7+Math.floor(i/2)*1.2);
  sofa(g,-2,5.5);
  for(let i=0;i<10;i++)plant(g,-9+(i%5)*4.2,-6+(i%2)*11);
  for(let i=0;i<4;i++)light(g,-7+i*4,0);
 }else{
  sign(g,'PROGRAMMING',-10,-d/2+.13);
  sign(g,'ART & DESIGN',0,-d/2+.13);
  sign(g,'QA / TESTING',10,-d/2+.13);
  for(let i=0;i<24;i++){const x=-11.4+(i%8)*3.1,z=-8.2+Math.floor(i/8)*3.25;desk(g,x,z,i);workspots.push([x,z]);}
  partition(g,-5.0,5,9);partition(g,5.0,5,9);
  conference(g,-10,7);conference(g,0,7);sofa(g,8,7);
  for(let i=0;i<7;i++)server(g,6.7+(i%4)*1.0,.8+Math.floor(i/4)*1.05);
  cube(g,'audio stage',4,.12,3,11, .1,7.5,mat.rug,'Audio and capture studio');
  cube(g,'recording studio backdrop',2.9,2.5,.11,11,1.4,6.2,mat.screen);
  cylinder(g,'audio microphone',.13,1.6,11.6,.95,8.3,mat.steel);
  for(let i=0;i<15;i++)plant(g,-13.5+(i%5)*6,-9+(i%3)*8);
  for(let i=0;i<8;i++)light(g,-10+(i%4)*7,-8+(i%2)*11);
  sign(g,'GLOBAL HQ',-10,-d/2+.12);
 }
 const figures=[];const count=level===2?4:level===3?10:20;
 for(let i=0;i<count;i++){
  const p=workspots[i%workspots.length];
  const pivot=new B.TransformNode('3D visitor '+i,sc);pivot.parent=g;pivot.position.set(p[0],0,p[1]+1.0);
  const skin=mat.skin,shirt=i%3===0?mat.body2:mat.body;
  cube(pivot,'visitor torso',.43,.64,.30,0,1,0,shirt,'Preview employee');
  sphere(pivot,'visitor head',.35,0,1.54,0,skin);
  sphere(pivot,'visitor hair',.33,0,1.69,0,mat.wood);
  const limbs=[];
  for(let side of [-1,1]){
   let leg=new B.TransformNode('leg rig',sc);leg.parent=pivot;leg.position.set(side*.11,.65,0);
   cube(leg,'leg',.14,.57,.19,0,-.3,0,mat.equipment);limbs.push(leg);
   let arm=new B.TransformNode('arm rig',sc);arm.parent=pivot;arm.position.set(side*.31,1.2,0);
   cube(arm,'arm',.15,.44,.16,0,-.22,0,shirt);limbs.push(arm);
  }
  figures.push({pivot,limbs,x:p[0],z:p[1]+1,phase:i*1.2});
 }
 g.setEnabled(false);const r={root:g,figures};scenes.set(level,r);return r;
}
function frameCamera(tier){
 const heights=[15,22,34,47],height=heights[tier-1];
 const aspect=Math.max(.45,api.engine.getRenderWidth()/Math.max(1,api.engine.getRenderHeight()));
 cam.setTarget(new B.Vector3(0,1.0,0));cam.orthoTop=height/2;cam.orthoBottom=-height/2;
 cam.orthoLeft=-height*aspect/2;cam.orthoRight=height*aspect/2;
 cam.radius=[19,26,40,54][tier-1];
}
function selectTier(t){
 t=Number(t);if(!Number.isInteger(t)||t<1||t>4)return false;
 baseMeshes.forEach(x=>x.setEnabled(t===1));
 baseStaff.forEach(x=>x.setEnabled(t===1));
 scenes.forEach(x=>x.root.setEnabled(false));
 if(t>1)building(t).root.setEnabled(true);
 active=t;frameCamera(t);
 document.querySelectorAll('[data-office-tier]').forEach(el=>{el.classList.toggle('selected-tier',Number(el.dataset.officeTier)===t);el.setAttribute('aria-pressed',String(Number(el.dataset.officeTier)===t));});
 const status=$('tour-status');if(status)status.textContent=t===1?'LIVE CAREER · GARAGE':'3D ARCHITECTURE TOUR · NOT PURCHASED';
 const label=$('tour-label');if(label)label.textContent=specs[t-1].name.toUpperCase();
 const detail=$('tour-detail');if(detail)detail.textContent=t===1?'One founder, one garage':specs[t-1].desc+' · $'+specs[t-1].cost.toLocaleString()+' to unlock in future integrated gameplay';
 return true;
}
function hud(){
 document.body.classList.add('studio-concept-hud');
 const title=document.querySelector('.scene-header h1');
 if(title)title.innerHTML='<span id="tour-label">GARAGE</span> <small id="tour-status">LIVE CAREER · GARAGE</small>';
 const toolbar=document.createElement('div');toolbar.className='office-stage-switch';
 toolbar.innerHTML='<b>OFFICE TIERS</b>'+specs.map((s,i)=>'<button type="button" data-office-tier="'+(i+1)+'">'+(i+1)+'. '+s.name+'</button>').join('');
 document.querySelector('.scene-header')?.appendChild(toolbar);
 toolbar.addEventListener('click',e=>{const b=e.target.closest('[data-office-tier]');if(b)selectTier(b.dataset.officeTier);});
 const stats=document.querySelector('.topbar .stats');
 if(stats){stats.insertAdjacentHTML('beforeend','<div class="concept-stat"><small>FANS</small><strong>'+Number(career.fans||0).toLocaleString()+'</strong></div><div class="concept-stat"><small>REPUTATION</small><strong>'+Math.round(career.reputation||0)+'</strong></div>');}
 const stage=$('stage');
 if(stage)stage.insertAdjacentHTML('beforeend','<div class="concept-goals"><strong>CURRENT GOALS</strong><p id="tour-detail">One founder, one garage</p><p>Develop games, hire staff, grow the studio</p><small>Office selection is a preview, not a purchase.</small></div>');
 const bottom=document.querySelector('.bottom-row');
 if(bottom)bottom.insertAdjacentHTML('afterend','<div class="concept-snapshot"><button data-open="projects"><span>ACTIVE PROJECT</span><b>'+escape(career.project?.title||'No project in development')+'</b><small>Actual saved career data</small></button><button data-open="staff"><span>EMPLOYEES</span><b>'+career.staff.length+' saved</b><small>Founder-led studio progression</small></button><button data-open="finances"><span>COMPANY CASH</span><b>$'+Number(career.cash||0).toLocaleString()+'</b><small>No tour purchases are charged</small></button><button data-open="studio"><span>OFFICE GROWTH</span><b>4 distinct tiers</b><small>Garage → Global HQ</small></button></div>');
 document.querySelectorAll('.concept-snapshot [data-open]').forEach(b=>b.addEventListener('click',()=>document.querySelector('.menuitem[data-panel="'+b.dataset.open+'"]')?.click()));
 const time=document.querySelector('.times'),top=document.querySelector('.topbar');
 if(time&&top)top.insertBefore(time,top.querySelector('.old-game'));
}
function escape(s){return String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}
hud();selectTier(1);
let last=0;
sc.onBeforeRenderObservable.add(()=>{
 if(active===1)return;
 let t=performance.now()/1000,dt=Math.min(.05,Math.max(0,t-last));last=t;
 for(let i=0,people=scenes.get(active).figures;i<people.length;i++){
  const p=people[i],v=Math.sin(t*2.5+p.phase),working=i%4!==0;
  p.pivot.position.y=working?-.1:Math.abs(v)*.025;
  p.pivot.rotation.y=working?Math.PI:Math.PI/2;
  p.limbs[2].rotation.x=working?-.76+Math.sin(t*6+p.phase)*.14:v*.18;
  p.limbs[3].rotation.x=working?-.76-Math.sin(t*6+p.phase)*.14:-v*.18;
  if(!working){p.pivot.position.x=p.x+Math.sin(t*.35+p.phase)*.58;p.limbs[0].rotation.x=v*.4;p.limbs[1].rotation.x=-v*.4;}
 }
});
const reset=$('fit');
reset?.addEventListener('click',e=>{e.stopImmediatePropagation();frameCamera(active);},true);
for(const [id,factor] of [['zoom-in',.82],['zoom-out',1.22]]){
 $(id)?.addEventListener('click',e=>{e.stopImmediatePropagation();
 const h=Math.abs(cam.orthoTop-cam.orthoBottom)*factor,aspect=Math.max(.45,api.engine.getRenderWidth()/Math.max(1,api.engine.getRenderHeight()));
 cam.orthoTop=h/2;cam.orthoBottom=-h/2;cam.orthoLeft=-h*aspect/2;cam.orthoRight=h*aspect/2;
 },true);
}
if(typeof ResizeObserver!=='undefined')new ResizeObserver(()=>{if(active>1)frameCamera(active);}).observe($('stage'));
window.StudioEmpireOffices={selectTier,get active(){return active;},get levels(){return specs.map(x=>({...x}));},debug(){return{tier:active,meshes:sc.meshes.length,actors:active===1?api.staff.length:scenes.get(active)?.figures.length,previewOnly:active!==1,writesToCareer:0}}};
})();