/* Studio Empire: reusable procedural office materials and 3D decorative architecture.
 * Everything is applied to actual meshes. No backdrop image and no embedded employees.
 * Low-cost textures are capped at 512px to keep the phone rendering budget reasonable.
 */
(function(){'use strict';
const api=window.StudioEmpire3D,offices=window.StudioEmpireOffices,B=window.BABYLON;
if(!api||!offices||!B)return;
const sc=api.scene,tier=offices.active,profile=offices.levels?.[tier-1];
const roots=sc.transformNodes.filter(n=>n.name==='Office '+tier+' '+profile?.name);
const root=roots[0];if(!root||tier===1)return;
const col=h=>B.Color3.FromHexString(h),v=(x,y,z)=>new B.Vector3(x,y,z);
const mats={};const make=(name,hex,glow=0)=>{let q=new B.StandardMaterial(name,sc);q.diffuseColor=col(hex);q.specularColor=col('#203743');if(glow)q.emissiveColor=col(hex).scale(glow);mats[name]=q;return q};
const bronze=make('premium bronze','#CBA875'),ink=make('premium slate','#1A3145'),white=make('premium warm white','#E3DACB'),aqua=make('premium cyan','#65C5D5',.33),coral=make('premium coral','#D9816A',.3),leaf=make('premium green','#608F73'),pot=make('premium terracotta','#B47D58'),plum=make('premium navy','#384D67'),glass=make('premium glass','#A2CBD0');
glass.alpha=.29;glass.backFaceCulling=false;
function box(id,w,h,d,x,y,z,m){const q=B.MeshBuilder.CreateBox('detail/'+id,{width:w,height:h,depth:d},sc);q.parent=root;q.position=v(x,y,z);q.material=m;q.isPickable=false;return q}
function cyl(id,d,h,x,y,z,m){const q=B.MeshBuilder.CreateCylinder('detail/'+id,{diameter:d,height:h,tessellation:10},sc);q.parent=root;q.position=v(x,y,z);q.material=m;q.isPickable=false;return q}
function light(x,z){cyl('pendant shade',.56,.20,x,3.3,z,ink);cyl('pendant bulb',.21,.19,x,3.14,z,bronze);}
function plant(x,z){cyl('planter',.46,.48,x,.25,z,pot);box('vertical foliage',.15,.77,.15,x,.8,z,leaf);for(let i=0;i<4;i++){const a=i*Math.PI/2;const q=B.MeshBuilder.CreateSphere('detail/leaf',{diameter:.4,segments:6},sc);q.parent=root;q.position=v(x+Math.cos(a)*.26,1.14,z+Math.sin(a)*.26);q.scaling.y=.45;q.material=leaf;q.isPickable=false;}}
function mural(x,z,caption,accent){box('poster frame',1.6,1.22,.12,x,2.25,z,ink);box('poster colored art',1.41,1.02,.03,x,2.25,z+.079,accent);box('poster horizon line',1.15,.055,.035,x,2.08,z+.10,bronze);box('poster lower silhouette',.88,.15,.035,x,1.86,z+.10,plum);}
function tiles(mesh,base='warm'){
 const tex=new B.DynamicTexture('tier '+tier+' detailed flooring',{width:512,height:512},sc,true);
 const c=tex.getContext(),sz=64,baseColor=base==='warm'?'#9a9184':'#8c9c9c';
 c.fillStyle=baseColor;c.fillRect(0,0,512,512);
 for(let y=0;y<8;y++)for(let x=0;x<8;x++){let n=(x*37+y*23)%9,xx=x*sz,yy=y*sz;
  c.fillStyle=n%3===0?'#aea494':n%3===1?'#8c8479':'#a49a8e';c.fillRect(xx+2,yy+2,sz-4,sz-4);
  c.strokeStyle='#534f4822';c.lineWidth=1;for(let j=0;j<5;j++){let px=xx+6+(j*11+n)%51,py=yy+7+(j*9+n)%51;c.beginPath();c.moveTo(px,py);c.lineTo(px+10,py+2);c.stroke();}
  c.fillStyle='#fff6d108';c.fillRect(xx+5,yy+6,26,2);
 }
 tex.update();const baseMat=mesh.material?.clone('premium floor material tier '+tier);if(!baseMat)return;baseMat.diffuseColor=new B.Color3(1,1,1);baseMat.diffuseTexture=tex;baseMat.specularColor=col('#20252c');mesh.material=baseMat;mesh.receiveShadows=true;
}
const floor=sc.meshes.find(q=>q.name==='architectural floor'&&q.parent===root);if(floor)tiles(floor,tier===2?'warm':'cool');
const width=profile.size[0],depth=profile.size[1];
for(let x=-width/2+3;x<width/2-2;x+=5){box('wall wood wainscot',2.4,.15,.08,x,.6,-depth/2+.15,bronze);}
for(let x=-width/2+3;x<width/2-2;x+=6){mural(x,-depth/2+.21,x<0?'GAME DESIGN':'STUDIO GAMES',x%2?coral:aqua);}
for(let z=-depth/2+2;z<depth/2-2;z+=6){light(-width/2+3,z);plant(width/2-1.1,z);}
for(let x=-width/2+3;x<width/2-2;x+=8){light(x,-depth/2+3);}
if(tier>=3){
 // Real physically positioned frameless glass partitions, with metal trims.
 for(let i=0;i<2;i++){const x=width/2-3.2-i*2.5;box('frosted meeting panel',.06,2.0,2.3,x,1.05,depth/2-4.3,glass);box('partition lintel',.11,.09,2.4,x,2.13,depth/2-4.3,ink);}
 for(let x=-width/2+2.8;x<width/2-2;x+=4){box('warm floor runner',2.2,.025,.95,x,.065,depth/2-2.1,plum);}
}
if(tier===4){
 // Department-scale lighting strips and studio fixtures; still full 3D geometry.
 for(let x=-width/2+2;x<width/2-1;x+=3.5){box('creative ceiling strip',2.3,.065,.12,x,3.32,-depth/2+2,aqua);}
 for(let x=-width/2+1.5;x<width/2-1;x+=5){plant(x,depth/2-2.5);}
}
const screenMats=sc.materials.filter(m=>m.name?.startsWith('screen')||m.name?.startsWith('glow'));screenMats.forEach(m=>{m.emissiveColor=col('#56bac3').scale(.24)});
window.StudioEmpireOfficeArt={tier,addedMeshCount:sc.meshes.filter(q=>q.name?.startsWith('detail/')).length,hasProceduralFloor:!!floor,hasReal3DProps:true};
})();