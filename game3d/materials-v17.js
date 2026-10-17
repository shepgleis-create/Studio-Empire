/* Studio Empire v0.17 — textured physical materials; no generated background images.
   Repeats procedurally painted wood, plaster and fabric surfaces across real 3D meshes.
   The save game and economic systems are never touched. */
(function(){'use strict';
const B=window.BABYLON,api=window.StudioEmpire3D,office=window.StudioEmpireOffices;
if(!B||!api||!office)return;const sc=api.scene;
let seed=21717;const rand=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296};
function texture(type){
 const tx=new B.DynamicTexture('studio material '+type,{width:512,height:512},sc,true),c=tx.getContext();
 c.fillStyle={floor:'#756553',plaster:'#ae9c87',wood:'#805a42',rug:'#553f48'}[type];c.fillRect(0,0,512,512);
 if(type==='floor'){
  for(let row=0;row<8;row++)for(let col=0;col<4;col++){
   const x=col*128-(row%2)*64,y=row*64;
   c.fillStyle=['#81694f','#79644d','#8a7359','#6f5d4a','#857057'][Math.floor(rand()*5)];
   c.fillRect(x+2,y+2,125,60);c.strokeStyle='#b09a7855';c.lineWidth=1;
   c.beginPath();c.moveTo(x+5,y+8);c.lineTo(x+120,y+8);c.stroke();
   for(let s=0;s<3;s++){c.strokeStyle='#3e312618';c.beginPath();c.moveTo(x+7,y+16+s*11);c.bezierCurveTo(x+32,y+10+s*11,x+88,y+23+s*10,x+121,y+14+s*11);c.stroke()}
  }
 }else if(type==='wood'){
  for(let j=0;j<135;j++){c.strokeStyle=j%2?'#ddb48e19':'#40291c20';c.lineWidth=1+rand()*2;c.beginPath();const y=rand()*512;c.moveTo(0,y);c.bezierCurveTo(140,y+rand()*12,310,y-rand()*12,512,y+rand()*16);c.stroke()}
 }else if(type==='plaster'){
  for(let i=0;i<18000;i++){const v=Math.round(rand()*70);c.fillStyle='rgba('+v+','+v+','+v+','+(rand()*.043)+')';c.fillRect(rand()*512,rand()*512,1+rand()*4,1+rand()*4)}
 }else{
  for(let x=0;x<512;x+=7){c.strokeStyle=x%3?'#916b6438':'#dfb18a29';c.beginPath();c.moveTo(x,0);c.lineTo(x,512);c.stroke()}
  for(let y=0;y<512;y+=24){c.strokeStyle='#dbab8724';c.beginPath();c.moveTo(0,y);c.lineTo(512,y);c.stroke()}
 }
 tx.update(false);tx.wrapU=B.Texture.WRAP_ADDRESSMODE;tx.wrapV=B.Texture.WRAP_ADDRESSMODE;
 tx.uScale=type==='floor'?3:type==='plaster'?3:type==='wood'?2:1;
 tx.vScale=type==='floor'?3:type==='plaster'?2:type==='wood'?2:1;return tx;
}
const mats={};for(const type of ['floor','plaster','wood','rug']){
 const m=new B.StandardMaterial('Studio Empire '+type+' physical texture',sc);
 m.diffuseTexture=texture(type);m.diffuseColor=new B.Color3(1,1,1);
 m.specularColor=new B.Color3(.075,.063,.058);mats[type]=m;
}
const visited=new Set();let count=0;
function decorate(){for(const mesh of sc.meshes){
 if(visited.has(mesh.uniqueId))continue;
 const name=mesh.name||'';let type=null;
 if(/^(wood floor|architectural floor)$/.test(name))type='floor';
 else if(/^(north garage wall|west garage wall|back concrete wall|left concrete wall)$/.test(name))type='plaster';
 else if(/^(desk top \d+|desk-\d+|lounge coffee table|conference table)$/.test(name))type='wood';
 else if(/^(center woven rug|side rug|break area rug)$/.test(name))type='rug';
 if(type){try{mesh.material=mats[type];mesh.receiveShadows=true;visited.add(mesh.uniqueId);count++}catch(e){console.warn('3D surface',name,e)}}
}}
decorate();const old=office.selectTier.bind(office);office.selectTier=function(n){const ok=old(n);if(ok)decorate();return ok};
let previousCount=sc.meshes.length;sc.onBeforeRenderObservable.add(()=>{if(previousCount!==sc.meshes.length){previousCount=sc.meshes.length;decorate()}});
window.StudioEmpireMaterialsV17={debug:()=>({texturedMeshes:count,types:Object.keys(mats),live:true})};
})();