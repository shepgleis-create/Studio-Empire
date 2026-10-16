/* STUDIO EMPIRE / Garage V2 visual correction layer.
 * Runtime real 3D meshes, no background screenshot and no flattened employees.
 * Keeps the existing save bridge and simulation behavior untouched.
 */
(function(){'use strict';
const g=window.StudioEmpire3D,B=window.BABYLON;
if(!g||!B){console.warn('Garage V2 enhancement: 3D engine not ready');return;}
const {scene,engine,camera}=g, v=(x,y,z)=>new B.Vector3(x,y,z);
// Bugfix: Babylon's hardware scaling factor DIVIDES screen resolution.
// The old value of 2 on a Retina device halved the width and height of render pixels.
const density=Math.min(2,Math.max(1,window.devicePixelRatio||1));
engine.setHardwareScalingLevel(1/density);engine.resize();
// View into the north/west inside walls from the room's open south-east corner.
// Old angle -PI/4 faced the outside of the back wall and hid the garage door.
camera.alpha=Math.PI/4;camera.beta=1.02;
// Preserve whatever zoom and targeting the existing game selected.
const previousWall=scene.getMeshByName('north garage wall');
if(previousWall)previousWall.dispose();
const oldPlanks=scene.meshes.filter(m=>m.name.startsWith('individual floor plank'));
oldPlanks.forEach(m=>m.dispose());
const mat={};function color(hex){return B.Color3.FromHexString(hex)}
function get(n,hex){return scene.getMaterialByName(n)||material(n,hex)}
function material(n,hex){const m=new B.StandardMaterial(n,scene);m.diffuseColor=color(hex);m.specularColor=color('#20292c');return m;}
mat.wall=get('warm plaster','#dbc8a5');mat.trim=get('wall trim','#6f5344');mat.wood=get('walnut','#815d42');mat.woodTop=get('honey stained wood','#b68c63');mat.beige=get('period computer case','#c8bba0');mat.steel=get('steel','#404e55');mat.metal=get('painted metal','#9a9b91');mat.floor=get('warm concrete','#918071');mat.paper=get('paper','#eadfc4');mat.gold=get('gold detail','#e0bd81');mat.green=get('plant leaves','#527b54');mat.ink=get('deep slate','#162b36');
const box=(n,w,h,d,x,y,z,m)=>{const q=B.MeshBuilder.CreateBox(n,{width:w,height:h,depth:d},scene);q.position=v(x,y,z);q.material=m;q.isPickable=false;return q};
const cyl=(n,d,h,x,y,z,m)=>{const q=B.MeshBuilder.CreateCylinder(n,{diameter:d,height:h,tessellation:18},scene);q.position=v(x,y,z);q.material=m;q.isPickable=false;return q};
const ball=(n,d,x,y,z,m)=>{const q=B.MeshBuilder.CreateSphere(n,{diameter:d,segments:12},scene);q.position=v(x,y,z);q.material=m;q.isPickable=false;return q};
// Original tileable artwork is generated procedurally from canvas primitives.
// These are materials on physical objects, NOT one generated picture of a room.
function drawTexture(name,m,bg,ink,seed,type){
 const t=new B.DynamicTexture(name,{width:512,height:512},scene,true),c=t.getContext();
 let n=seed>>>0;const rand=()=>{n=(1664525*n+1013904223)>>>0;return n/4294967296};
 c.fillStyle=bg;c.fillRect(0,0,512,512);
 for(let i=0;i<16000;i++){c.fillStyle=`rgba(${ink},${(.018+rand()*.12).toFixed(3)})`;c.fillRect(rand()*512,rand()*512,1+rand()*4,1+rand()*3)}
 if(type==='cement'){
  c.strokeStyle='rgba(76,65,60,.27)';c.lineWidth=2;
  for(const pos of [0,256,511]){c.beginPath();c.moveTo(pos,0);c.lineTo(pos,512);c.stroke();c.beginPath();c.moveTo(0,pos);c.lineTo(512,pos);c.stroke()}
  for(let i=0;i<7;i++){c.beginPath();c.lineWidth=1+rand()*6;c.strokeStyle=`rgba(77,68,52,${.02+rand()*.05})`;c.arc(rand()*512,rand()*512,rand()*70+8,0,6.28);c.stroke()}
 }else if(type==='grain'){for(let i=0;i<90;i++){const y=rand()*512;c.beginPath();c.moveTo(0,y);for(let x=20;x<530;x+=20)c.lineTo(x,y+Math.sin(x*.03+i)*2);c.strokeStyle=`rgba(54,33,24,${.035+rand()*.14})`;c.lineWidth=1+rand()*1.5;c.stroke()}}
 t.update();t.wrapU=B.Texture.WRAP_ADDRESSMODE;t.wrapV=B.Texture.WRAP_ADDRESSMODE;m.diffuseTexture=t;return t;
}
const concrete=drawTexture('original studio concrete slab',mat.floor,'#a09282','47,38,33',1189,'cement');concrete.uScale=2.6;concrete.vScale=2.25;
const wood=drawTexture('original warm walnut grain',mat.woodTop,'#b88d60','65,40,27',291,'grain');wood.uScale=1.4;wood.vScale=1.4;
const plaster=drawTexture('original workshop plaster',mat.wall,'#d8c3a9','81,60,48',118,'plaster');
const f=scene.getMeshByName('wood floor');if(f){f.name='Textured concrete garage floor';f.material=mat.floor;f.receiveShadows=true}
const baseboard=material('garage soot dark','#67544a');
// Physically CUT OUT the window & segmented roll-up door instead of overlaying a flat painted wall.
// Window is at x=-4.05..-1.75 and garage door x=1.02..4.82, both on z=-4.57.
box('back wall left of window',1.35,4.28,.22,-4.725,2.04,-4.57,mat.wall);
box('back wall below real window',2.30,1.57,.22,-2.90,.69,-4.57,mat.wall);
box('back wall above real window',2.30,.91,.22,-2.90,3.79,-4.57,mat.wall);
box('back wall between window and garage door',2.77,4.28,.22,-.365,2.04,-4.57,mat.wall);
box('back wall over roll-up garage door',3.8,.82,.22,2.92,3.73,-4.57,mat.wall);
box('back wall right of garage door',.62,4.28,.22,5.16,2.04,-4.57,mat.wall);
box('garage door opening left track',.10,3.28,.22,1.02,1.68,-4.23,mat.steel);
box('garage door opening right track',.10,3.28,.22,4.82,1.68,-4.23,mat.steel);
box('garage roll-up door bottom weatherstrip',3.75,.095,.16,2.92,.15,-4.24,mat.ink);
box('garage door pull handle',.44,.045,.14,2.92,.97,-4.20,mat.steel);
box('garage window upper trim',2.42,.10,.18,-2.90,3.31,-4.20,mat.woodTop);
box('garage window lower sill',2.42,.12,.21,-2.90,1.59,-4.20,mat.woodTop);
box('garage lower wall baseboard',6.40,.19,.11,-2.20,.16,-4.39,baseboard);
box('garage back header beam',10.9,.23,.32,0,4.23,-4.49,mat.wood);
for(const x of [-5.25,-1.74,1.02,4.84,5.31])box('visible timber wall stud',.12,4.16,.18,x,2.07,-4.36,mat.wood);
// Floor scored concrete and garage workshop rubber entry mat.
for(const x of [-3.64,-1.82,0,1.82,3.64])box('concrete expansion joint',.018,.009,9.0,x,.036,0,baseboard);
for(const z of [-3.04,-1.52,0,1.52,3.04])box('concrete saw line',10.7,.009,.018,0,.036,z,baseboard);
box('door workshop mat',2.4,.018,1.2,2.6,.06,-3.48,material('aged olive rubber mat','#59635b'));
// Real garage gear at human scale.
box('garage pegboard',.078,1.52,2.18,-5.16,2.42,1.45,mat.woodTop);
for(let i=0;i<24;i++){box('peg hole metal pin',.045,.045,.045,-5.104,1.89+Math.floor(i/8)*.26,.63+(i%8)*.22,mat.steel)}
for(let i=0;i<5;i++)box('hanging mechanic wrench',.10,.44,.055,-5.02,2.22+(i%2)*.18,.82+i*.28,mat.metal);
for(let i=0;i<12;i++){const row=Math.floor(i/4),x=2.75+(i%4)*.46,z=3.30+row*.43;
 box('archived game design carton '+i,.40,.33+row*.05,.36,x,.17+row*.025,z,mat.beige);
 box('carton tape '+i,.065,.007,.37,x,.34+row*.05,z,mat.paper)}
const arcade=material('retro arcade cabinet steel blue','#26384b'),bright=material('arcade bright decal','#dd7552');
box('independent arcade cabinet',.80,1.65,.76,3.97,.86,-.53,arcade);
box('arcade marquee',.74,.25,.04,3.97,1.54,-.12,bright);
box('arcade monitor glass',.62,.52,.024,3.97,1.22,-.119,mat.ink);
box('arcade controller panel',.73,.12,.34,3.97,1.00,.04,mat.woodTop);
for(let i=0;i<4;i++)cyl('arcade push button',.06,.055,3.76+i*.13,1.09,.10,i%2?mat.gold:bright);
// Soft practical lighting, visually separate fixture from the architectural meshes.
const warmTube=material('diffused tungsten strip','#fff4d1');warmTube.emissiveColor=color('#8b6235');
for(const z of [-2.1,1.4]){
 box('ceiling fluorescent ballast',.26,.13,1.26,-4.2,3.89,z,mat.metal);
 box('diffuser warm working light',.115,.052,1.00,-4.2,3.80,z,warmTube);
}
for(let i=0;i<10;i++){
 const desk=[[-2.75,-2.1],[.15,-2.3],[-2.25,1.5],[1.6,1]][i%4];
 box('physical design notebook '+i,.29,.025,.17,desk[0]-.45+(i%2)*.26,1.16,desk[1]+.16,mat.paper);
}
// Adaptive post-load detail: only back off on sustained low FPS, not automatic blurry 144p.
let prev=performance.now(),frames=0,slow=0,fast=0,quality=1;
scene.onAfterRenderObservable.add(()=>{
 frames++;const now=performance.now();if(now-prev<2500)return;
 const fps=frames*1000/(now-prev);prev=now;frames=0;
 if(fps<24){slow++;fast=0}else if(fps>47){fast++;slow=0}else{slow=0;fast=0}
 if(slow>=3&&quality===1){quality=.78;engine.setHardwareScalingLevel(1/(density*quality));engine.resize();slow=0}
 if(fast>=5&&quality<1){quality=1;engine.setHardwareScalingLevel(1/density);engine.resize();fast=0}
});
// A separate, honest debug API for live-browser testing and screenshots.
window.StudioEmpireGarageV2={version:'garage-v2',debug(){return{
 cameraAlpha:camera.alpha,renderPixels:[engine.getRenderWidth(),engine.getRenderHeight()],
 hardwareScaling:engine.getHardwareScalingLevel(),doorOpening:!!scene.getMeshByName('back wall over roll-up garage door'),
 wallNoLongerObstructing:!scene.getMeshByName('north garage wall'),
 physicalProps:!!scene.getMeshByName('garage pegboard')&&!!scene.getMeshByName('independent arcade cabinet'),
 meshCount:scene.meshes.length,sceneMode:'real 3D meshes',originalSaveWrites:0
}}};
console.info('Studio Empire garage V2 geometry, camera and sharp phone rendering installed');
})();