/* Studio Empire 3D physical scene polish.
 * All visible elements are geometry/materials parented to existing Babylon scenes,
 * never a prerendered concept image, and never baked character sprites.
 */
(function(){'use strict';
const B=window.BABYLON,api=window.StudioEmpire3D,office=window.StudioEmpireOffices;
if(!B||!api||!office)return;
const sc=api.scene,finished=new Set();const colors={};
function mat(k,hex,emissive=false){const name=k+hex;if(colors[name])return colors[name];const m=new B.StandardMaterial(name,sc);m.diffuseColor=B.Color3.FromHexString(hex);m.specularColor=B.Color3.FromHexString('#252f36');if(emissive)m.emissiveColor=B.Color3.FromHexString(hex).scale(.70);return colors[name]=m;}
const metal=mat('trim','#37414c'),wood=mat('wood','#825c41'),brass=mat('brass','#b39b66'),plaster=mat('plaster','#9b8979'),warm=mat('warm','#ffd597',true),cyan=mat('cyan','#69b6d0',true),neon=mat('neon','#e38b6b',true),slate=mat('slate','#172536'),green=mat('green','#517565'),rug=mat('rug','#81545e'),paper=mat('paper','#d8c9ac');
function cube(parent,name,w,h,d,x,y,z,m){const o=B.MeshBuilder.CreateBox(name,{width:w,height:h,depth:d},sc);o.parent=parent;o.position.set(x,y,z);o.material=m;o.isPickable=false;return o;}
function tube(parent,name,r,h,x,y,z,m){const o=B.MeshBuilder.CreateCylinder(name,{diameter:r*2,height:h,tessellation:12},sc);o.parent=parent;o.position.set(x,y,z);o.material=m;o.isPickable=false;return o;}
function sphere(parent,name,r,x,y,z,m){const o=B.MeshBuilder.CreateSphere(name,{diameter:r*2,segments:8},sc);o.parent=parent;o.position.set(x,y,z);o.material=m;o.isPickable=false;return o;}
function mural(parent,text,x,y,z,width=3){let texture=new B.DynamicTexture('logo plate '+text,{width:1024,height:256},sc,true);const c=texture.getContext();c.fillStyle='#112433';c.fillRect(0,0,1024,256);c.strokeStyle='#7b8891';c.lineWidth=6;c.strokeRect(10,10,1004,236);c.fillStyle='#f0a47e';c.font='800 93px system-ui';c.textAlign='center';c.fillText(text.toUpperCase(),512,166,950);texture.update();let m=new B.StandardMaterial('brand sign '+text,sc);m.diffuseTexture=texture;m.emissiveColor=B.Color3.FromHexString('#573830');m.backFaceCulling=false;
 let plane=B.MeshBuilder.CreatePlane('studio wall signage '+text,{width,height:width*.25},sc);plane.parent=parent;plane.position.set(x,y,z);plane.material=m;plane.isPickable=false;return plane;}
function plant(parent,x,z,scale=1){tube(parent,'detailed pot',.22*scale,.43*scale,x,.22*scale,z,brass);cube(parent,'stem',.065*scale,.6*scale,.065*scale,x,.69*scale,z,green);for(let i=0;i<6;i++){let a=i*Math.PI/3;sphere(parent,'plant leaf',.21*scale,x+Math.cos(a)*.24*scale,.99*scale+(i%2)*.12*scale,z+Math.sin(a)*.23*scale,green);}}
function deskLamp(parent,x,z){tube(parent,'desk lamp base',.15,.05,x,1.12,z,metal);cube(parent,'desk lamp spine',.04,.41,.04,x,1.36,z,metal);sphere(parent,'lamp shade',.17,x-.08,1.59,z,warm);}
function wallFixture(parent,x,z){cube(parent,'wall sconce plate',.48,.68,.11,x,2.82,z,metal);cube(parent,'wall sconce glowing core',.25,.42,.13,x,2.82,z+.08,warm);}
function poster(parent,x,z,color=neon){cube(parent,'original illustration frame',.80,1.05,.065,x,2.42,z,metal);cube(parent,'abstract picture panel',.70,.94,.02,x,2.42,z+.043,slate);cube(parent,'picture color motif',.40,.06,.026,x,2.32,z+.061,color);sphere(parent,'picture accent',.15,x+.11,2.58,z+.068,color);}
function loungeCorner(parent,x,z){cube(parent,'break area rug',2.9,.02,2.1,x,.045,z,rug);cube(parent,'lounge coffee table',1.18,.16,.67,x,.45,z,wood);for(const ax of [-.46,.46])for(const az of [-.21,.21])cube(parent,'table legs',.07,.39,.07,x+ax,.2,z+az,metal);tube(parent,'ceramic coffee',.10,.20,x+.23,.65,z,paper);plant(parent,x-1.3,z-.60,.75);}
function detail(level){if(finished.has(level))return;const parent=level===1?new B.TransformNode('garage physical accessories',sc):sc.getTransformNodeByName('Office '+level+' '+office.levels[level-1].name);if(!parent)return;finished.add(level);
 const dimensions=office.levels[level-1].size,w=dimensions[0],d=dimensions[1];
 // physical trim gives the building an architectural outline instead of a plain cube.
 const alongBack=level===1?-4.42:-d/2+.18,alongLeft=level===1?-5.20:-w/2+.17;
 for(let y of [.13,3.24]){cube(parent,'real wooden baseboard back',w-.5,.12,.09,0,y,alongBack,wood);cube(parent,'real wooden baseboard left',.09,.12,d-.5,alongLeft,y,0,wood);}
 for(let i=0;i<Math.min(6,Math.floor(w/3));i++){let x=-w/2+1.5+i*2.8;wallFixture(parent,x,alongBack+.13);}
 for(let i=0;i<Math.min(5,Math.floor(w/4));i++){let x=-w/2+2+i*3.8;poster(parent,x,alongBack+.16,i%2?neon:cyan);}
 for(let i=0;i<Math.min(10,Math.floor(w/2));i++){let x=-w/2+.7+i*2;cube(parent,'floor threshold brass inlay',.035,.012,Math.min(2.5,d-2),x,.055,d/2-1.8,brass);}
 if(level===1){
  mural(parent,'START SMALL · DREAM BIG',-.7,3.4,alongBack+.13,3.0);
  loungeCorner(parent,-3.75,2.8);plant(parent,4.35,3.5);
  deskLamp(parent,-2.4,-2.3);deskLamp(parent,.5,-2.55);poster(parent,-2.55,alongBack+.18);
 }else if(level===2){
  mural(parent,'NEW HORIZONS',0,3.1,alongBack+.13,3.7);loungeCorner(parent,-4.65,3.35);plant(parent,5.15,-3.65);deskLamp(parent,-3.8,-3.15);deskLamp(parent,.35,.85);
  cube(parent,'reception mat',2.4,.02,1.2,3.1,.045,4.1,slate);
 }else if(level===3){
  mural(parent,'DESIGN · DEVELOP · SHIP',0,3.1,alongBack+.13,5);
  loungeCorner(parent,-3,6.35);loungeCorner(parent,7,4.9);for(let i=0;i<8;i++)deskLamp(parent,-7+(i%4)*3.2,-5+Math.floor(i/4)*3.35);
  for(let i=0;i<3;i++)plant(parent,8.7,-6+i*4);
 }else{
  mural(parent,'WORLD CLASS CREATIVE CAMPUS',0,3.1,alongBack+.13,7.2);
  for(let i=0;i<4;i++)loungeCorner(parent,-10+i*6.2,8.0);
  for(let i=0;i<10;i++)deskLamp(parent,-10.8+(i%5)*3,-8.5+Math.floor(i/5)*3.3);
  for(let i=0;i<6;i++)plant(parent,-12+i*4.6,9.5);
  // A furnished central social hub, separated into physical platforms.
  cube(parent,'reception counter',4.5,1.1,1.0,0,.56,9.6,wood);
  cube(parent,'visitor welcome sign',2.4,.8,.05,0,1.55,9.08,slate);
  cube(parent,'glass atrium divider',.08,2.6,6.5,-4,1.40,3.5,mat('glass','#9ec5cd'));
 }
 console.info('[STUDIO EMPIRE] detailed 3D scene tier',level,'built with actual meshes');}
const original=office.selectTier.bind(office);
office.selectTier=function(t){const r=original(t);if(r)detail(Number(t));return r};
detail(office.active);
window.StudioEmpireSceneDetail={debug(){return{tiers:[...finished],built:true,physical:true,sceneMeshes:sc.meshes.length}}};
})();
