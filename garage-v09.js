/* Studio Empire 0.9 — GARAGE VERTICAL SLICE
 * Independent spatial objects + live staff. Nothing in a backdrop is a person.
 * Existing simulation/save format are untouched. This module only replaces the
 * tier-one scene renderer and hit testing, with a fall-through for larger offices.
 */
(function(){'use strict';
const previous=window.PremiumStudio; if(!previous)return;
const TAU=Math.PI*2, SIZE={w:1320,h:790}, world={w:7.6,h:6.1,u:70,ox:666,oy:289};
const stations=[{id:'desk_a',type:'desk',x:2.05,y:1.72,chair:{x:2.28,y:2.39}},{id:'desk_b',type:'desk',x:4.12,y:1.86,chair:{x:4.45,y:2.52}},{id:'desk_c',type:'desk',x:2.24,y:4.02,chair:{x:2.58,y:4.66}},{id:'desk_d',type:'desk',x:4.74,y:3.96,chair:{x:5.08,y:4.57}}];
const objects=[
{id:'desk_a',type:'desk',x:2.05,y:1.72,w:1.33,d:.82,layer:'actor',interact:'develop'},
{id:'desk_b',type:'desk',x:4.12,y:1.86,w:1.33,d:.82,layer:'actor',interact:'develop'},
{id:'desk_c',type:'desk',x:2.24,y:4.02,w:1.33,d:.82,layer:'actor',interact:'develop'},
{id:'desk_d',type:'desk',x:4.74,y:3.96,w:1.33,d:.82,layer:'actor',interact:'develop'},
{id:'storage',type:'shelf',x:6.55,y:1.05,w:.85,d:.47,layer:'actor',interact:'studio'},
{id:'coffee',type:'coffee',x:6.55,y:4.8,w:.66,d:.58,layer:'actor',interact:'team'},
{id:'workbench',type:'bench',x:.55,y:3.40,w:1.15,d:.7,layer:'actor',interact:'research'},
{id:'plant',type:'plant',x:.65,y:5.46,w:.5,d:.5,layer:'actor',interact:'studio'},
{id:'boxes',type:'boxes',x:6.55,y:5.35,w:.7,d:.6,layer:'actor',interact:'studio'},
{id:'couch',type:'sofa',x:.80,y:.95,w:1.28,d:.54,layer:'actor',interact:'team'},
{id:'arcade',type:'arcade',x:6.35,y:2.53,w:.62,d:.54,layer:'actor',interact:'studio'},
{id:'floor_lamp',type:'lamp',x:.32,y:2.55,w:.33,d:.34,layer:'actor',interact:'studio'},
{id:'equipment',type:'radio',x:6.10,y:3.63,w:.53,d:.45,layer:'actor',interact:'research'},
{id:'filecabinet',type:'filing',x:5.65,y:.42,w:.5,d:.45,layer:'actor',interact:'studio'},
{id:'worklight',type:'worklight',x:6.9,y:3.35,w:.22,d:.20,layer:'actor',interact:'studio',solid:false},
{id:'designwall',type:'pinwall',x:.30,y:4.30,w:.15,d:.15,layer:'actor',interact:'research',solid:false},
{id:'vinyl',type:'record',x:1.70,y:.64,w:.42,d:.41,layer:'actor',interact:'team'},
{id:'bike',type:'bike',x:6.86,y:4.90,w:.48,d:.35,layer:'actor',interact:'studio',solid:false},
{id:'tooldesk',type:'toolbox',x:4.82,y:.48,w:.50,d:.40,layer:'actor',interact:'studio'},
{id:'rug',type:'rug',x:2.68,y:3.08,w:1.08,d:.55,layer:'floor',interact:'studio',solid:false}
];
const manifest={version:1,projection:{kind:'isometric',tile:[70,35],origin:[world.ox,world.oy]},eraSets:['1975-1989','1990-2009','2010+'],assets:objects.map(o=>({id:o.id,type:o.type,anchor:[o.x,o.y],collision:[o.x-.30,o.y-.26,o.w,o.d],drawLayer:o.layer,interaction:o.interact,tier:1,approxTextureBytes:0}))};
let staticCache=null,cacheEra=-1;const movers=new Map();let lastTime=0;
const iso=(x,y,z=0)=>({x:world.ox+(x-y)*world.u,y:world.oy+(x+y)*world.u*.50-z});
const rgba=(r,g,b,a)=>`rgba(${r},${g},${b},${a})`;
function poly(c,pts,fill,stroke,width=1){c.beginPath();pts.forEach((p,i)=>i?c.lineTo(p.x,p.y):c.moveTo(p.x,p.y));c.closePath();c.fillStyle=fill;c.fill();if(stroke){c.lineWidth=width;c.strokeStyle=stroke;c.stroke()}}
function round(c,x,y,w,h,r,fill,stroke,width=1){c.beginPath();c.roundRect(x,y,w,h,r);c.fillStyle=fill;c.fill();if(stroke){c.lineWidth=width;c.strokeStyle=stroke;c.stroke()}}
function line(c,x,y,X,Y,color,width=1){c.beginPath();c.moveTo(x,y);c.lineTo(X,Y);c.strokeStyle=color;c.lineWidth=width;c.stroke()}
function disk(c,x,y,rx,ry,fill){c.beginPath();c.ellipse(x,y,rx,ry,0,0,TAU);c.fillStyle=fill;c.fill()}
function colorgrad(c,x,y,X,Y,top,bottom){let g=c.createLinearGradient(x,y,X,Y);g.addColorStop(0,top);g.addColorStop(1,bottom);return g}
function prism(c,x,y,w,d,h,top,left,right){const a=iso(x,y),b=iso(x+w,y),e=iso(x+w,y+d),f=iso(x,y+d);const A=iso(x,y,h),B=iso(x+w,y,h),E=iso(x+w,y+d,h),F=iso(x,y+d,h);poly(c,[b,e,E,B],right,'#0000002d',1);poly(c,[e,f,F,E],left,'#00000025',1);poly(c,[A,B,E,F],top,'#ffffff26',1);return {a,b,e,f,A,B,E,F}}
function shadow(c,x,y,rx,ry,alpha=.27){const p=iso(x,y);c.save();c.filter='blur(7px)';disk(c,p.x+4,p.y+11,rx,ry,rgba(5,15,24,alpha));c.restore()}
function detail(c,year){
 const modern=year>=2000;const p=iso(0,0),q=iso(world.w,0),r=iso(0,world.h),s=iso(world.w,world.h);
 let back=c.createRadialGradient(680,355,60,665,375,700);back.addColorStop(0,'#1e3440');back.addColorStop(.58,'#132530');back.addColorStop(1,'#08151f');c.fillStyle=back;c.fillRect(0,0,SIZE.w,SIZE.h);
 // warm pool of light surrounding the tiny office, giving the garage physical depth
 c.save();c.shadowColor='#020914';c.shadowBlur=68;c.shadowOffsetY=31;poly(c,[p,q,s,r],'#876959');c.restore();
 poly(c,[q,s,{x:s.x,y:s.y+28},{x:q.x,y:q.y+28}],'#463c3b');poly(c,[s,r,{x:r.x,y:r.y+28},{x:s.x,y:s.y+28}],'#5b453f');
 for(let i=0;i<world.w;i++)for(let j=0;j<world.h;j++){
  const x=i,y=j,idx=(i*13+j*7)%4;poly(c,[iso(x,y),iso(x+1,y),iso(x+1,y+1),iso(x,y+1)],['#846d59','#8e755f','#917a64','#7c6757'][idx],'#624e4229',.8);
  const scratch=iso(x+.21,y+.36);line(c,scratch.x,scratch.y,scratch.x+12,scratch.y+6,'#f4d5a112',1);
 }
 // distressed garage rug and safety-stained workshop corner
 poly(c,[iso(.73,1.24),iso(4.2,1.24),iso(4.2,3.25),iso(.73,3.25)],'#a5684f90','#d9a37b66',2);
 poly(c,[iso(4.60,3.29),iso(7.1,3.29),iso(7.1,5.68),iso(4.60,5.68)],'#53647755','#bccec644',2);
 // walls: individually visible textured structural surfaces, not a flattened background
 const H=174;
 const left=colorgrad(c,p.x,p.y-H,r.x,r.y,'#896d5b','#5c4540');
 const right=colorgrad(c,p.x,p.y-H,q.x,q.y,'#8f6b54','#4b4b4d');
 poly(c,[p,q,{x:q.x,y:q.y-H},{x:p.x,y:p.y-H}],right,'#ccb397',3);
 poly(c,[p,r,{x:r.x,y:r.y-H},{x:p.x,y:p.y-H}],left,'#d6aa86',3);
 for(let i=0;i<world.w*2;i++){let b=iso(i*.5,0);line(c,b.x,b.y-170,b.x,b.y-3,'#322b2b38',1.1);}
 for(let j=0;j<world.h*2;j++){let b=iso(0,j*.5);line(c,b.x,b.y-170,b.x,b.y-4,'#e0be8d22',1.3)}
 for(let k=0;k<5;k++){const a=iso(.15,1.2+k*.75,136),b=iso(.15,1.54+k*.75,136);line(c,a.x,a.y,b.x,b.y,'#caa98c5b',2)}
 // garage door roll slats on far wall, visually linked to physical property
 const door=[iso(4.4,0,155),iso(7.1,0,155),iso(7.1,0,9),iso(4.4,0,9)];poly(c,door,colorgrad(c,650,100,770,350,'#a19a86','#655e54'),'#d4d0b18c',3);
 for(let k=1;k<9;k++){let a=iso(4.4,0,155-k*15.7),b=iso(7.1,0,155-k*15.7);line(c,a.x,a.y,b.x,b.y,'#292e3960',2)}
 // garage rear window: only a background silhouette, no employees or baked UI
 const win=[iso(1.05,0,145),iso(2.85,0,145),iso(2.85,0,60),iso(1.05,0,60)];poly(c,win,'#243f4e','#e6c49c',6);
 for(let b=0;b<9;b++){let x=win[0].x+14+b*14;round(c,x,win[0].y+55-(b%4)*11,10,43+(b%4)*11,1,'#142733')}
 let a=iso(1.95,0,145),d=iso(1.95,0,60);line(c,a.x,a.y,d.x,d.y,'#e2caad',4);
 // timber beams, hanging lights, warm realistic shadows
 const beam1=iso(0,0,165),beam2=iso(world.w,0,165),beam3=iso(0,world.h,165);
 line(c,beam1.x,beam1.y,beam2.x,beam2.y,'#61483c',11);line(c,beam1.x,beam1.y,beam3.x,beam3.y,'#5b4639',10);
 for(let k=0;k<2;k++){let h=iso(1.8+k*3.1,0,169);line(c,h.x,h.y,h.x,h.y+31,'#2e3032',3);disk(c,h.x,h.y+37,15,6,'#272f36');let gr=c.createRadialGradient(h.x,h.y+56,2,h.x,h.y+56,120);gr.addColorStop(0,'#fff3cf50');gr.addColorStop(1,'#f5c77a00');c.fillStyle=gr;c.fillRect(h.x-130,h.y-80,260,210)}
 // paper plans/garage art on wall, era aware
 let plan=iso(.18,3.0,96);c.save();c.translate(plan.x,plan.y);c.rotate(-.44);round(c,-37,-36,86,65,3,'#c9b49a','#4c4139',3);for(let i=0;i<5;i++){line(c,-28,-25+i*11,14+(i%2)*14,-24+i*11,i%2?'#ad8164':'#46737c',2)}c.restore();
 // The studio sign is now a live branded object, updated from actual career data.
 // ambient light and fine noise are cached with the structural scene
 let light=c.createRadialGradient(690,465,30,690,465,560);light.addColorStop(0,'#ffcf8b19');light.addColorStop(1,'#e2ad5700');c.fillStyle=light;c.fillRect(0,0,SIZE.w,SIZE.h);
}
function screen(c,x,y,year,n){const p=iso(x,y,76);c.save();c.shadowColor='#88c9b7';c.shadowBlur=9;
 round(c,p.x-25,p.y-27,51,41,3,year>=1995?'#101f2b':'#c6bd99','#354349',3);c.shadowBlur=0;
 round(c,p.x-20,p.y-22,41,29,2,year>=1995?'#162c42':'#19374c','#7c9188');
 if(year>=1995){for(let k=0;k<6;k++)round(c,p.x-15,p.y-18+k*4,13+(k%3)*7,1.7,1,'#5ebc96')}else{for(let k=0;k<5;k++)line(c,p.x-16,p.y-16+k*5,p.x+5+k%3*3,p.y-16+k*5,'#98ddaf',1.2)}
 const base=iso(x,y,44);line(c,p.x,p.y+13,base.x,base.y,'#8b958b',3);disk(c,base.x,base.y,15,4,'#373c42');c.restore()}
function desk(c,o,year){const x=o.x,y=o.y;shadow(c,x+.35,y+.35,60,24,.28);
 const b=prism(c,x-.36,y-.24,1.42,.84,32,colorgrad(c,600,290,710,465,'#d5ad7a','#906745'),'#6d4538','#704a3a');
 // legs, drawers and subtle floor bolts
 for(let i=0;i<2;i++){const p=iso(x+i*.72,y+.46,30);line(c,p.x,p.y,p.x,p.y+30,'#3e342e',5);round(c,p.x-4,p.y+27,8,3,1,'#20252a')}
 const keyboard=iso(x+.49,y+.43,35);round(c,keyboard.x-26,keyboard.y-2,45,10,3,'#d8c4a4','#564b43');for(let i=0;i<7;i++){line(c,keyboard.x-22+i*6,keyboard.y,keyboard.x-20+i*6,keyboard.y+4,'#797c73',.7)}
 const mug=iso(x+.05,y+.41,37);disk(c,mug.x,mug.y,6,3,'#f5dbac');line(c,mug.x-3,mug.y,mug.x-3,mug.y-9,'#e5dfc3',5);
 const paper=iso(x+.92,y+.36,35);round(c,paper.x-10,paper.y-5,18,12,1,'#e7d9b6');line(c,paper.x-7,paper.y,paper.x+2,paper.y,'#5c7f87',1);
 screen(c,x+.39,y+.02,year,o.id.length);
 // chair is an independent, physically anchored component
 let p=iso(x+.64,y+.97);shadow(c,x+.64,y+.97,15,8);line(c,p.x,p.y-12,p.x,p.y+7,'#373942',4);disk(c,p.x,p.y-12,17,8,'#3e5960');round(c,p.x-13,p.y-36,25,27,6,'#3d5566','#819398',2);
}
function bench(c,o,year){shadow(c,o.x+.4,o.y+.3,48,18);prism(c,o.x,o.y,1.2,.8,42,'#8d6a50','#5a4640','#51423a');
 for(let i=0;i<5;i++){let p=iso(o.x+.22+i*.17,o.y+.27,45);round(c,p.x-6,p.y-7,12,8,1,['#9bb7bb','#d59e60','#5d837c','#c7b7a7'][i%4])}
 let p=iso(o.x+.65,o.y+.13,53);round(c,p.x-8,p.y-29,20,27,3,'#4f584e');for(let i=0;i<3;i++)line(c,p.x-5,p.y-20+i*7,p.x+6,p.y-20+i*7,'#dfa45e',1.5)}
function shelf(c,o,year){shadow(c,o.x+.4,o.y+.25,32,14);prism(c,o.x,o.y,.85,.46,124,'#594738','#49362f','#372c29');
 for(let k=0;k<4;k++){let p=iso(o.x+.47,o.y+.42,115-k*27);round(c,p.x-23,p.y-2,42,5,1,'#bd9b70');for(let j=0;j<3;j++)round(c,p.x-18+j*12,p.y-17,8,14,1,['#9a7e6c','#74695a','#c6ad81'][j])}}
function coffee(c,o){shadow(c,o.x+.25,o.y+.26,28,12);prism(c,o.x,o.y,.7,.63,53,'#9b7968','#5b524b','#4f4441');const p=iso(o.x+.39,o.y+.38,58);round(c,p.x-12,p.y-25,26,27,4,'#b0a28c','#594a43');disk(c,p.x,p.y-20,10,5,'#3b3634');round(c,p.x-6,p.y-33,12,6,2,'#e1d0b4');}
function boxes(c,o){shadow(c,o.x,o.y,25,12);prism(c,o.x,o.y,.62,.53,34,'#b89160','#6e5140','#866143');let p=iso(o.x+.25,o.y+.32,39);line(c,p.x-8,p.y,p.x+12,p.y+10,'#d8be8766',3);prism(c,o.x+.15,o.y+.14,.33,.37,60,'#caac7a','#806348','#957857')}
function plant(c,o){shadow(c,o.x,o.y,18,10);prism(c,o.x,o.y,.44,.48,30,'#a46a52','#78503f','#6a4137');const p=iso(o.x+.17,o.y+.18,50);for(let j=0;j<9;j++){let a=j*2.3;line(c,p.x,p.y+9,p.x+Math.cos(a)*24,p.y+Math.sin(a)*16-12,'#324a34',3);disk(c,p.x+Math.cos(a)*24,p.y+Math.sin(a)*16-12,11,5,['#3e7153','#5c9065','#6e9e72'][j%3])}}
// Era-aware, individually positioned environmental props. Characters are never baked into the backdrop.
function sofa(c,o){shadow(c,o.x+.55,o.y+.3,70,19,.26);const seat=prism(c,o.x,o.y,1.35,.6,24,'#a35d47','#663e38','#74473a');const back=prism(c,o.x,o.y,.18,.6,66,'#b36c52','#73463b','#885040');for(let j=0;j<3;j++){let q=iso(o.x+.4+j*.33,o.y+.24,32);round(c,q.x-13,q.y-12,26,22,5,j%2?'#a95f4d':'#bf7559','#e6a17b',1)}let q=iso(o.x+.38,o.y+.12,39);round(c,q.x-10,q.y-12,20,18,4,'#e5bd78');}
function arcade(c,o,year){shadow(c,o.x+.28,o.y+.28,30,15);prism(c,o.x,o.y,.65,.55,115,year>=1995?'#364457':'#a85f48','#323641','#252d38');let q=iso(o.x+.54,o.y+.18,91);c.save();c.translate(q.x,q.y);c.rotate(-.15);round(c,-19,-30,40,37,3,'#101e29','#f5ae78',3);round(c,-14,-25,30,26,2,year>=2000?'#2d6b84':'#194661');round(c,-12,-20,18,5,2,'#e7a65c');disk(c,6,-6,5,5,'#a4ebc4');c.restore();q=iso(o.x+.55,o.y+.30,51);disk(c,q.x-5,q.y,4,4,'#e28e62');disk(c,q.x+7,q.y-2,3,3,'#badd7b');}
function lamp(c,o){shadow(c,o.x+.15,o.y+.15,15,8);let q=iso(o.x+.12,o.y+.22);line(c,q.x,q.y-98,q.x,q.y-7,'#514440',6);disk(c,q.x,q.y-97,22,8,'#dfb78c');disk(c,q.x,q.y-85,16,5,'#fff1c3');let glow=c.createRadialGradient(q.x,q.y-73,1,q.x,q.y-73,108);glow.addColorStop(0,'#ffdba055');glow.addColorStop(1,'#ffdba000');c.fillStyle=glow;c.fillRect(q.x-110,q.y-176,220,220)}
function radio(c,o,year){shadow(c,o.x+.25,o.y+.2,22,11);prism(c,o.x,o.y,.51,.43,46,year>=1995?'#626b70':'#b08d66','#625043','#493d39');let q=iso(o.x+.28,o.y+.37,43);round(c,q.x-17,q.y-12,34,20,2,'#303b43','#c9b58c',2);for(let i=0;i<3;i++)disk(c,q.x-8+i*8,q.y-3,3,3,'#bea47a')}

function filing(c,o){shadow(c,o.x+.22,o.y+.2,26,11);prism(c,o.x,o.y,.55,.48,81,'#adb1a2','#52616b','#43515a');for(let j=0;j<3;j++){const p=iso(o.x+.54,o.y+.30,66-j*23);round(c,p.x-14,p.y-8,29,18,2,'#586a76','#b3bcb8',1);round(c,p.x-5,p.y-1,12,3,1,'#d7d7bf')}}
function worklight(c,o){let p=iso(o.x,o.y);shadow(c,o.x,o.y,15,5,.20);line(c,p.x-10,p.y,p.x,p.y-105,'#313f48',5);line(c,p.x,p.y-105,p.x+20,p.y-116,'#313f48',4);disk(c,p.x+20,p.y-111,17,8,'#d6b080');disk(c,p.x+19,p.y-106,11,4,'#ffefbf');let gr=c.createRadialGradient(p.x+20,p.y-105,4,p.x+20,p.y-105,80);gr.addColorStop(0,'#fff2ba42');gr.addColorStop(1,'#fff2ba00');c.fillStyle=gr;c.fillRect(p.x-50,p.y-180,150,150)}
function pinwall(c,o,year){const p=iso(o.x,o.y,94);c.save();c.translate(p.x,p.y);c.rotate(-.45);round(c,-9,-46,101,76,3,'#b38861','#523b31',5);round(c,-4,-40,91,65,2,'#c1ae85');for(let j=0;j<6;j++){let xx=2+(j%3)*28,yy=-34+Math.floor(j/3)*30;round(c,xx,yy,20,23,2,['#f6dec1','#d6c69a','#d0ded2','#f0c19d'][j%4]);line(c,xx+3,yy+6,xx+15,yy+6,'#6e7475',1);line(c,xx+3,yy+11,xx+12,yy+11,'#879aa0',1);disk(c,xx+10,yy+2,2,2,'#ad6b50')}c.restore()}
function record(c,o,year){shadow(c,o.x+.2,o.y+.2,22,9);prism(c,o.x,o.y,.5,.38,33,'#b89268','#614b40','#493b33');let q=iso(o.x+.2,o.y+.18,36);disk(c,q.x,q.y,14,7,'#1f232c');disk(c,q.x,q.y,4,2,'#d7ad73');line(c,q.x+8,q.y-9,q.x+16,q.y-17,'#b2a89a',2)}
function bike(c,o){let p=iso(o.x,o.y);shadow(c,o.x,o.y,29,7,.15);const wheel1={x:p.x-27,y:p.y-18},wheel2={x:p.x+27,y:p.y-5};for(const w of [wheel1,wheel2]){c.beginPath();c.arc(w.x,w.y,16,0,TAU);c.lineWidth=3;c.strokeStyle='#263640';c.stroke();for(let k=0;k<7;k++){let a=k*TAU/7;line(c,w.x,w.y,w.x+14*Math.cos(a),w.y+14*Math.sin(a),'#c3bab0',.7)}}line(c,wheel1.x,wheel1.y,p.x+2,p.y-26,'#e88956',4);line(c,p.x+2,p.y-26,wheel2.x,wheel2.y,'#e88956',4);line(c,wheel1.x,wheel1.y,p.x-3,p.y-1,'#e88956',4);line(c,p.x-3,p.y-1,wheel2.x,wheel2.y,'#e88956',3);line(c,p.x+2,p.y-26,p.x+5,p.y-39,'#263640',3);line(c,p.x-7,p.y-31,p.x+6,p.y-31,'#263640',3);line(c,wheel2.x,wheel2.y,p.x+27,p.y-29,'#263640',3)}
function toolbox(c,o){shadow(c,o.x+.24,o.y+.19,25,8,.18);prism(c,o.x,o.y,.54,.45,49,'#aa5d4b','#863d39','#6f3836');for(let j=0;j<3;j++){let p=iso(o.x+.5,o.y+.32,43-j*10);round(c,p.x-12,p.y-4,25,9,1,'#ad6e63','#573e3b');line(c,p.x-4,p.y+1,p.x+4,p.y+1,'#ead1a5',2)}}
function carpet(c,o){let a=[iso(o.x,o.y),iso(o.x+o.w,o.y),iso(o.x+o.w,o.y+o.d),iso(o.x,o.y+o.d)];poly(c,a,'#6d3c45ac','#d9a17b',3);for(let j=0;j<5;j++){let p=iso(o.x+.12+j*.2,o.y+.1),q=iso(o.x+.14+j*.2,o.y+o.d-.06);line(c,p.x,p.y,q.x,q.y,'#c98c6f78',1.6)}}
function dynamicBrand(c,state){const p=iso(.14,1.35,134);c.save();c.translate(p.x,p.y);c.rotate(-.46);c.shadowColor='#ed9e64';c.shadowBlur=16;round(c,-13,-32,165,43,6,'#172935','#f6b781b0',2);c.shadowBlur=0;c.fillStyle='#ffdca8';c.font='bold 15px system-ui';let label=String(state.studio||'GARAGE').toUpperCase();if(label.length>19)label=label.slice(0,18)+'…';c.fillText(label,0,-6,145);c.restore()}

function drawObj(c,o,year){if(o.type==='desk')desk(c,o,year);else if(o.type==='bench')bench(c,o,year);else if(o.type==='shelf')shelf(c,o,year);else if(o.type==='coffee')coffee(c,o);else if(o.type==='boxes')boxes(c,o);else if(o.type==='plant')plant(c,o);else if(o.type==='sofa')sofa(c,o);else if(o.type==='arcade')arcade(c,o,year);else if(o.type==='lamp')lamp(c,o);else if(o.type==='radio')radio(c,o,year);else if(o.type==='filing')filing(c,o);else if(o.type==='worklight')worklight(c,o);else if(o.type==='pinwall')pinwall(c,o,year);else if(o.type==='record')record(c,o,year);else if(o.type==='bike')bike(c,o);else if(o.type==='toolbox')toolbox(c,o);else if(o.type==='rug')carpet(c,o)}
// Navigation grid with desk/bench/shelf avoidance and a corridor through the middle.
const GRID=3, nx=Math.ceil(world.w*GRID),ny=Math.ceil(world.h*GRID), key=(x,y)=>x+','+y;
function blocked(x,y){if(x<.20||y<.20||x>world.w-.2||y>world.h-.2)return true;
 return objects.some(o=>o.type!=='plant'&&o.solid!==false&&x>o.x-.45&&x<o.x+o.w+.25&&y>o.y-.42&&y<o.y+o.d+.2)}
const walkable=Array.from({length:nx},(_,i)=>Array.from({length:ny},(_,j)=>!blocked((i+.5)/GRID,(j+.5)/GRID)));
function nearestFree(x,y){const ix=Math.max(0,Math.min(nx-1,Math.floor(x*GRID))),iy=Math.max(0,Math.min(ny-1,Math.floor(y*GRID)));if(walkable[ix][iy])return [ix,iy];for(let rad=1;rad<10;rad++)for(let i=ix-rad;i<=ix+rad;i++)for(let j=iy-rad;j<=iy+rad;j++)if(i>=0&&j>=0&&i<nx&&j<ny&&walkable[i][j])return[i,j];return[ix,iy]}
function route(start,end){let [sx,sy]=nearestFree(start.x,start.y),[tx,ty]=nearestFree(end.x,end.y);let open=[{x:sx,y:sy,g:0,f:Math.abs(tx-sx)+Math.abs(ty-sy)}],seen=new Map([[key(sx,sy),open[0]]]),closed=new Set();let last=null;
 for(let k=0;open.length&&k<1200;k++){open.sort((a,b)=>a.f-b.f);const now=open.shift(),id=key(now.x,now.y);if(closed.has(id))continue;closed.add(id);if(now.x===tx&&now.y===ty){last=now;break}
 for(let [dx,dy] of [[1,0],[0,1],[-1,0],[0,-1]]){const x=now.x+dx,y=now.y+dy;if(x<0||y<0||x>=nx||y>=ny||!walkable[x][y]||closed.has(key(x,y)))continue;const cost=now.g+1,q=seen.get(key(x,y));if(q&&q.g<=cost)continue;const next={x,y,g:cost,f:cost+Math.abs(tx-x)+Math.abs(ty-y),prev:now};seen.set(key(x,y),next);open.push(next)} }
 if(!last)return [];let list=[];while(last&&last.prev){list.unshift({x:(last.x+.5)/GRID,y:(last.y+.5)/GRID});last=last.prev}return list}
const DESTS=[{x:6.08,y:4.55,name:'coffee'},{x:1.0,y:3.1,name:'bench'},{x:5.8,y:2.95,name:'whiteboard'},{x:3.8,y:3.26,name:'meeting'}];
function entity(p,i,now){let e=movers.get(p.id);if(!e){const chair=stations[i%stations.length].chair;e={id:p.id,x:chair.x,y:chair.y,target:{...chair},path:[],mode:'work',at:now+(i+1)*1500,seed:i*1793+103};movers.set(p.id,e)}return e}
function selectTarget(p,e,i,time){const current=p.mode||'work',chair=stations[i%stations.length].chair;
 const wantsBreak=current==='break'||current==='toBreak'||p.energy<23;
 const wantsWork=current==='work'||current==='return';const rnd=((Math.floor(time/11000)+i*19)%9);
 const destination=wantsBreak?DESTS[0]:!wantsWork?DESTS[(i+1)%DESTS.length]:rnd===0?DESTS[2]:rnd===1?DESTS[3]:{...chair,name:'work'};
 if(e.target.name!==destination.name||Math.hypot(e.target.x-destination.x,e.target.y-destination.y)>.35){e.target={...destination};e.path=route(e,destination);e.mode='walk';e.at=time+2300}
 else if(!e.path.length)e.mode=destination.name==='work'?'work':destination.name;
}
function tickEmployees(state,t){if(!lastTime)lastTime=t;const dt=Math.min(.05,Math.max(0,(t-lastTime)/1000));lastTime=t;
 const alive=new Set();state.staff.forEach((p,i)=>{alive.add(p.id);let e=entity(p,i,t);if(t>=e.at){selectTarget(p,e,i,t);e.at=t+2800+i*190}if(e.path.length){const q=e.path[0],dx=q.x-e.x,dy=q.y-e.y,length=Math.hypot(dx,dy),speed=dt*(p.energy<25?.37:.63);if(length<=speed){e.x=q.x;e.y=q.y;e.path.shift();if(!e.path.length){e.mode=e.target.name||'work';e.at=t+5000+i*370}}else {e.x+=dx/length*speed;e.y+=dy/length*speed;e.mode='walk'}}});for(const id of movers.keys())if(!alive.has(id))movers.delete(id)}
function drawStaff(c,p,e,t,year,working){let pt=iso(e.x,e.y);const isWork=e.mode==='work',isWalk=e.mode==='walk',bob=isWalk?Math.abs(Math.sin(t*.014+p.id))*2.8:0;shadow(c,e.x,e.y,16,8,.34);c.save();c.translate(pt.x,pt.y-bob);let color=p.color||['#b96452','#608b99','#d4ab69'][p.id%3],skin=p.skin||'#ca977b',hair=p.hair||'#302e33';
 // shadow, shoes and articulated legs with real walk cycle
 const phase=Math.sin(t*.012+p.id*1.17);if(isWork){
  // seated: upper torso anchored to workstation, with forearms tapping keyboard
  round(c,-12,-28,24,22,6,color,'#b4b4ab58');disk(c,0,-38,10,12,skin);disk(c,0,-45,10,5,hair);
  let tap=Math.sin(t*.021+p.id)*3;line(c,-12,-20,-18,-6+tap,skin,5);line(c,12,-20,18,-6-tap,skin,5);
  line(c,-5,-7,-9,5,'#273541',5);line(c,5,-7,9,5,'#273541',5);
 }else{
  line(c,-6,-15,-7+phase*6,1,'#273747',6);line(c,6,-15,7-phase*6,1,'#273747',6);
  disk(c,-7+phase*6,2,5,3,'#171e27');disk(c,7-phase*6,2,5,3,'#171e27');
  round(c,-14,-39,28,27,8,color,'#ffffff4d');line(c,-14,-29,-17-phase*4,-12,skin,5);line(c,14,-29,17+phase*4,-12,skin,5);
  disk(c,0,-48,11,12,skin);disk(c,-1,-57,11,5,hair);
 }
 // slight individual faces, period appropriate dark headset only if advanced enough
 disk(c,-4,-48,1.3,1.5,'#25313a');disk(c,4,-48,1.3,1.5,'#25313a');
 if(year>=1995&&p.id%2===0){line(c,-9,-50,-9,-40,'#262d35',3);line(c,9,-50,9,-40,'#262d35',3)}
 if(e.mode==='coffee'){let cup=iso(0,0);disk(c,17,-19,6,4,'#e3c8aa')}
 if(working&&isWork){const pct=(Math.sin(t*.0018+p.id*2)+1)*.5;round(c,-27,-84,55,12,5,'#122a37df','#6ab5a68c');round(c,-22,-79,43*pct,4,3,'#6be7aa')}
 if(e.mode==='meeting'){c.fillStyle='#fff0bf';c.font='bold 11px system-ui';c.fillText('···',-7,-72)}
 c.restore()}
let lastRender={stage:null,state:null,camera:null,f:null};
function frame(stage,camera){const vw=SIZE.w,vh=SIZE.h,fit=Math.min((stage.width-12)/(vw*.84),(stage.height-(stage.width<700?116:70))/(vh*.88));const mobileSceneBoost=stage.width<600?1.19:1;const rel=Math.max(.9,Math.min(3.1,camera.zoom/Math.max(.01,camera.initialZoom||camera.zoom||1)));let s=fit*rel*mobileSceneBoost;
 // office stays centered in both orientations unless player has panned
 const panX=Math.max(-stage.width*.45,Math.min(stage.width*.45,camera.panX)),panY=Math.max(-stage.height*.34,Math.min(stage.height*.34,camera.panY));return{s,x:(stage.width-vw*s)/2+panX,y:(stage.height-vh*s)/2+panY+stage.height*.03}}
function render(c,stage,state,camera,t){if((state.office||1)!==1)return previous.render(c,stage,state,camera,t);
 const era=state.year>=2000?2:state.year>=1990?1:0;
 if(!staticCache||cacheEra!==era){staticCache=document.createElement('canvas');staticCache.width=SIZE.w*1.6;staticCache.height=SIZE.h*1.6;const ctx=staticCache.getContext('2d');ctx.scale(1.6,1.6);detail(ctx,state.year);cacheEra=era}
 tickEmployees(state,t);let f=frame(stage,camera);c.fillStyle='#0c1d2b';c.fillRect(0,0,stage.width,stage.height);
 c.save();c.translate(f.x,f.y);c.scale(f.s,f.s);c.drawImage(staticCache,0,0,SIZE.w,SIZE.h);dynamicBrand(c,state);
 // painter's algorithm: all interactable objects and actors share the SAME depth sort
 const worldObjects=objects.map(o=>({z:o.layer==='floor'?-1000:iso(o.x+o.w*.5,o.y+o.d*.5).y,draw:()=>drawObj(c,o,state.year)}));
 const people=state.staff.map((p,i)=>{const e=movers.get(p.id);return {z:iso(e.x,e.y).y+.3,draw:()=>drawStaff(c,p,e,t,state.year,!!(state.project&&!state.project.ready))}});
 [...worldObjects,...people].sort((a,b)=>a.z-b.z).forEach(entry=>entry.draw());
 // contextual markers are live UI, NEVER painted into the static layer
 if(state.project&&!state.project.ready){const p=iso(3.1,1.55,119),pct=Math.max(0,Math.min(1,state.project.progress/Math.max(1,state.project.weeks)));round(c,p.x-88,p.y-11,176,36,8,'#112739eb','#89d8be6b');round(c,p.x-77,p.y+13,151,6,3,'#40545b');round(c,p.x-77,p.y+13,151*pct,6,3,'#76eeb2');c.fillStyle='#e8f6e8';c.font='bold 12px system-ui';c.fillText('ACTIVE PROJECT   '+Math.round(pct*100)+'%',p.x-77,p.y+5)}
 c.restore();lastRender={stage,state,camera,f};return true}
function hit(x,y,stage,state,camera){if((state.office||1)!==1)return previous.hit(x,y,stage,state,camera);const f=frame(stage,camera),wx=(x-f.x)/f.s,wy=(y-f.y)/f.s;
 for(let i=state.staff.length-1;i>=0;i--){const p=state.staff[i],e=movers.get(p.id);if(!e)continue;const q=iso(e.x,e.y,27),d=Math.hypot(wx-q.x,wy-q.y);if(d<31)return {type:'person',id:p.id,name:p.name,sx:q.x*f.s+f.x,sy:q.y*f.s+f.y};}
 let best=null,min=Infinity;for(const o of objects){const q=iso(o.x+o.w*.45,o.y+o.d*.4,40),d=Math.hypot(wx-q.x,wy-q.y);if(d<75&&d<min){min=d;best={type:o.interact,name:({develop:'Development workstation',team:'Staff break area',studio:'Garage & expansion',research:'Prototype bench'})[o.interact],sx:q.x*f.s+f.x,sy:q.y*f.s+f.y}}}return best}
window.PremiumStudio={...previous,render,hit,resetCache(){staticCache=null;cacheEra=-1;previous.resetCache?.()},get garageManifest(){return manifest},get garageDebug(){return {staff:[...movers.values()].map(e=>({id:e.id,x:e.x,y:e.y,activity:e.mode,path:e.path.length})),staticEmployees:0,objectCount:objects.length,navigationGrid:[nx,ny],independentSprites:true}},get garageRoute(){return route}};
})();
