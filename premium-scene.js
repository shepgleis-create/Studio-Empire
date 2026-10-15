/* STUDIO EMPIRE v0.8 - actual simulated office renderer.
   No employees are baked into artwork: furniture, walls, screens and décor are
   rendered to an offscreen static layer; every person is drawn/moved live.
   There are four distinct office tiers, with era-aware decor and staffing. */
(function(){'use strict';
const W=1440,H=850,TAU=Math.PI*2;
let cached=null,cacheTier=0,cacheEra=0,cacheSize=0;
const defs={
 1:{gx:6,gy:5,unit:60,ox:704,oy:330,name:'GARAGE',wood:'#735043',floor:'#9c7b60',accent:'#f5ac60',wall:'#69504a'},
 2:{gx:8,gy:6,unit:54,ox:700,oy:264,name:'WORKSPACE',wood:'#7b584d',floor:'#ae9180',accent:'#efae8c',wall:'#7b7775'},
 3:{gx:11,gy:8,unit:46,ox:700,oy:205,name:'LOFT',wood:'#825448',floor:'#cab69c',accent:'#7cd8c6',wall:'#576974'},
 4:{gx:14,gy:10,unit:39,ox:704,oy:166,name:'CAMPUS',wood:'#4d4546',floor:'#afaea8',accent:'#63c8ec',wall:'#3d4b59'}
};
const slots={
 1:[[1.55,1.65],[3.0,1.6],[1.55,3.2],[3.1,3.2]],
 2:[[1.6,1.8],[3.4,1.9],[5.2,1.7],[1.6,4.2],[3.4,4.15],[5.2,4.1]],
 3:[[1.4,1.6],[3.2,1.7],[5.1,1.7],[7.0,1.7],[8.7,1.7],[1.4,4.0],[3.2,4.0],[5.1,4.0],[7.0,4.0],[8.7,4.0],[4.2,6.3],[6.6,6.2]],
 4:[[1.5,1.6],[3.3,1.6],[5.1,1.6],[6.9,1.6],[8.7,1.6],[10.5,1.6],[12.3,1.6],[1.5,4.1],[3.3,4.1],[5.1,4.1],[6.9,4.1],[8.7,4.1],[10.5,4.1],[12.3,4.1],[1.5,6.7],[3.3,6.7],[5.1,6.7],[6.9,6.7],[8.7,6.7],[10.5,6.7],[12.3,6.7],[3.0,8.5],[6.2,8.5],[9.4,8.5]]
};
function polygon(c,ps,col,stroke='#ffffff18',lineWidth=1){c.beginPath();ps.forEach((p,i)=>i?c.lineTo(p.x,p.y):c.moveTo(p.x,p.y));c.closePath();c.fillStyle=col;c.fill();if(stroke){c.strokeStyle=stroke;c.lineWidth=lineWidth;c.stroke();}}
function rect(c,x,y,w,h,r,col,stroke){c.beginPath();if(c.roundRect)c.roundRect(x,y,w,h,r);else c.rect(x,y,w,h);c.fillStyle=col;c.fill();if(stroke){c.strokeStyle=stroke;c.lineWidth=1;c.stroke()}}
function ell(c,x,y,rx,ry,col){c.beginPath();c.ellipse(x,y,rx,ry,0,0,TAU);c.fillStyle=col;c.fill()}
function L(c,x1,y1,x2,y2,col='#ffffff72',w=2){c.beginPath();c.moveTo(x1,y1);c.lineTo(x2,y2);c.lineWidth=w;c.strokeStyle=col;c.stroke()}
function iso(g,x,y,z=0){return{x:g.ox+(x-y)*g.unit,y:g.oy+(x+y)*g.unit*.49-z};}
function prism(c,g,x,y,w,d,height,top,left,right){const u=[iso(g,x,y),iso(g,x+w,y),iso(g,x+w,y+d),iso(g,x,y+d)];const v=u.map(p=>({x:p.x,y:p.y-height}));polygon(c,[u[1],u[2],v[2],v[1]],right||'#202937');polygon(c,[u[2],u[3],v[3],v[2]],left||'#283947');polygon(c,v,top||'#c0a384');return v;}
function screen(c,g,x,y,z,tone,large=false){const p=iso(g,x,y,z);const ww=large?31:23,hh=large?25:19;
 c.shadowColor=tone;c.shadowBlur=12;rect(c,p.x-ww,p.y-hh,ww*2,hh+10,3,'#0b1727','#7a8893');c.shadowBlur=0;
 let grad=c.createLinearGradient(p.x,p.y-hh,p.x+ww,p.y+5);grad.addColorStop(0,'#345875');grad.addColorStop(.53,'#123148');grad.addColorStop(1,'#0c1d30');rect(c,p.x-ww+4,p.y-hh+4,ww*2-8,hh+1,2,grad);
 for(let i=0;i<4;i++)rect(c,p.x-ww+8,p.y-hh+8+i*5,11+(i%2)*9,2,1,i%2?'#75dfc6':'#66c1ef');L(c,p.x,p.y+10,p.x,p.y+18,'#5b6a70',2);ell(c,p.x,p.y+19,7,2,'#304352');}
function lamp(c,x,y,r,col){let gr=c.createRadialGradient(x,y,2,x,y,r);gr.addColorStop(0,col);gr.addColorStop(.18,col+'94');gr.addColorStop(1,col+'00');ell(c,x,y,r,r*.66,gr)}
function floor(c,g,tier){const corners=[iso(g,0,0),iso(g,g.gx,0),iso(g,g.gx,g.gy),iso(g,0,g.gy)];
 // Deep underfloor with beveled warm edges.
 c.save();c.shadowColor='#000b15d9';c.shadowBlur=80;c.shadowOffsetY=32;
 polygon(c,corners.map(p=>({x:p.x,y:p.y+27})),'#293541');c.restore();
 polygon(c,corners,'#c1a386','#efcfa37d',5);
 polygon(c,[corners[1],corners[2],{x:corners[2].x,y:corners[2].y+27},{x:corners[1].x,y:corners[1].y+27}],'#4a3b38');
 polygon(c,[corners[2],corners[3],{x:corners[3].x,y:corners[3].y+27},{x:corners[2].x,y:corners[2].y+27}],'#8f654f');
 // Individual floor panels, noise grain and selective materials.
 for(let i=0;i<g.gx;i++)for(let j=0;j<g.gy;j++){let p=[iso(g,i,j),iso(g,i+1,j),iso(g,i+1,j+1),iso(g,i,j+1)];let chk=(i*17+j*13)%5;
 const base=tier===1?['#9b7862','#a78469','#aa8064','#a5836d','#a78167'][chk]:tier===2?['#b8a18e','#c5b19c','#bcaa98','#d0bba7','#bfa995'][chk]:tier===3?['#c5b69f','#d2c4ac','#c7bfae','#d7c8b5','#c3baa8'][chk]:['#8c9b9e','#a4aeb0','#b1b6b1','#b7bfbc','#abb5b5'][chk];polygon(c,p,base,'#55473f23',.7);
 const a=iso(g,i+.16,j+.24),b=iso(g,i+.73,j+.24);L(c,a.x,a.y,b.x,b.y,'#ffffff14',.8);
 }
 // Rugs/presentation zones, only once their facilities are affordable.
 if(tier>=2)polygon(c,[iso(g,.45,g.gy-2.4),iso(g,3.0,g.gy-2.4),iso(g,3.0,g.gy-.5),iso(g,.45,g.gy-.5)],tier>=3?'#3c748d88':'#ad675c91','#e7dbc67a',3);
 if(tier>=3)polygon(c,[iso(g,g.gx-4.2,.4),iso(g,g.gx-.5,.4),iso(g,g.gx-.5,3.3),iso(g,g.gx-4.2,3.3)],'#26465890','#e6f7f055',2);
}
function walls(c,g,tier,year){const a=iso(g,0,0),b=iso(g,g.gx,0),d=iso(g,0,g.gy),height=tier===1?131:161;
 let left=c.createLinearGradient(a.x,a.y-height,d.x,d.y);left.addColorStop(0,tier===1?'#654236':'#3e4b57');left.addColorStop(1,tier===1?'#8a6050':'#667986');
 let right=c.createLinearGradient(a.x,a.y-height,b.x,b.y);right.addColorStop(0,tier===1?'#a3775b':'#3d414c');right.addColorStop(1,tier===1?'#6f4b43':'#61727c');
 polygon(c,[a,b,{x:b.x,y:b.y-height},{x:a.x,y:a.y-height}],right,'#ebd8bd99',3);
 polygon(c,[a,d,{x:d.x,y:d.y-height},{x:a.x,y:a.y-height}],left,'#ecdcc0a0',3);
 // exposed beams, geometric brickwork for indie; glass for campus
 for(let i=0;i<g.gx*3;i++){const u=iso(g,i/3,0);L(c,u.x,u.y-130,u.x,u.y-6,tier===1?'#dc9f7940':'#d8e6e520',1.3)}
 for(let j=0;j<g.gy*2;j++){const u=iso(g,0,j/2);L(c,u.x,u.y-128,u.x,u.y-9,tier===1?'#d19d7540':'#d2e4ec20',1.1)}
 for(let k=0;k<g.gx;k++){const p=iso(g,k+.3,0,88);const p2=iso(g,k+.9,0,88);
 if(k%2===0||tier>=3){polygon(c,[{x:p.x,y:p.y-40},{x:p2.x,y:p2.y-40},{x:p2.x,y:p2.y+18},{x:p.x,y:p.y+18}],tier>=2?'#193347':'#3c4e4b','#d5c8ac99',2);
 for(let xx=0;xx<3;xx++){const x=p.x+11+xx*14,y=p.y-24+xx*8;rect(c,x,y,5,7,1,'#f5cb8177');}}
 }
 // Windows with city silhouette no baked people.
 if(tier>=2){const p=iso(g,g.gx*.27,0,67),p2=iso(g,g.gx*.66,0,67);let pts=[{x:p.x,y:p.y-39},{x:p2.x,y:p2.y-39},{x:p2.x,y:p2.y+38},{x:p.x,y:p.y+38}];polygon(c,pts,'#142e4d','#a6d7e599',3);let h=(p2.x-p.x)/8;for(let k=0;k<8;k++){const cx=p.x+k*h;rect(c,cx,p.y-6+(k%3)*5,Math.max(10,h*.8),38,1,'#35516a');for(let n=0;n<4;n++)rect(c,cx+3+(n%3)*7,p.y+(n%3)*9,2,3,0,'#facb8a98');}L(c,p.x,p.y+3,p2.x,p2.y+3,'#e5f8ff73',2)}
 // Structural track lighting, beams and logo sign.
 const u=iso(g,.45,0,118);const v=iso(g,Math.min(3.35,g.gx-.45),0,118);L(c,u.x,u.y,v.x,v.y,'#f6d4a4',5);
 for(let k=0;k<4;k++){const x=u.x+(v.x-u.x)*k/3,y=u.y+(v.y-u.y)*k/3;ell(c,x,y,8,3,'#fff0bd');lamp(c,x,y+23,47,tier===1?'#ffc270':'#bdece0')}
 let logo=iso(g,.18,1.3,78);c.save();c.translate(logo.x,logo.y);c.rotate(-.42);rect(c,-12,-37,115,40,4,'#1b2736','#edb17766');c.font='bold 15px system-ui';c.fillStyle=tier===1?'#ffd5a5':'#7df3e0';c.fillText(tier===1?'INDIE LAB':tier===2?'DEV STUDIO':tier===3?'CREATIVE LAB':'STUDIO CAMPUS',-3,-12);c.restore();
 if(tier===1){let peg=iso(g,g.gx*.68,0,78);rect(c,peg.x-35,peg.y-30,75,51,2,'#716356','#d1af85');for(let i=0;i<8;i++){ell(c,peg.x-26+(i%4)*18,peg.y-20+Math.floor(i/4)*23,2,2,'#f0cb8b')}}
 if(tier>=3){let p=iso(g,g.gx*.73,0,68);rect(c,p.x-32,p.y-39,115,62,4,'#d9e4db','#3a565c');for(let i=0;i<4;i++){L(c,p.x-25,p.y-27+i*11,p.x+30+i*5,p.y-26+i*11,['#4c83a8','#e18e64','#5fa58f'][i%3],2)} }
}
function desk(c,g,x,y,tier,k){const p=iso(g,x,y);ell(c,p.x,p.y+19,60,22,'#000d1f6e');
 prism(c,g,x-.47,y-.33,.94,.64,23,tier<=2?'#d8a17a':'#aa8272','#9f6554','#644841');
 const pa=iso(g,x,y,26);const highlight=c.createLinearGradient(pa.x-30,pa.y-20,pa.x+50,pa.y+10);highlight.addColorStop(0,'#ffe0b2');highlight.addColorStop(1,'#805c4c');ell(c,pa.x,pa.y,31,10,highlight);
 screen(c,g,x,y-.12,65,k%2?'#65e7f0':'#7de9b2',tier>=3);
 if(tier>=3)screen(c,g,x+.33,y-.07,67,'#ffc78b',false);
 let mouse=iso(g,x+.24,y+.15,26);rect(c,mouse.x-4,mouse.y-2,13,6,2,'#293948');
 let key=iso(g,x-.05,y+.20,26);rect(c,key.x-19,key.y-1,31,8,2,'#28333e');for(let t=0;t<5;t++)rect(c,key.x-16+t*6,key.y+1,4,1,1,'#80c4db');
 let cup=iso(g,x-.31,y+.13,26);ell(c,cup.x,cup.y,4,2,'#e2ece1');L(c,cup.x-3,cup.y,cup.x-3,cup.y-6,'#a9ccce',3);
 const chair=iso(g,x+.3,y+.47);ell(c,chair.x,chair.y,13,6,'#0a1c25ac');rect(c,chair.x-14,chair.y-18,23,17,5,k%2?'#264d5c':'#3f5265');L(c,chair.x-4,chair.y,chair.x-4,chair.y+8,'#3c485a',3);
}
function planter(c,g,x,y,k=0){const p=iso(g,x,y);ell(c,p.x,p.y+9,17,8,'#00192372');prism(c,g,x-.16,y-.16,.32,.32,26,k%2?'#b98970':'#76645a','#9d7e66','#775b4c');
 for(let i=0;i<7;i++){let ang=i*2.4,sz=22+(i%3)*9;ell(c,p.x+Math.sin(ang)*15,p.y-36+Math.cos(ang)*7,5+sz*.19,3+sz*.22,`hsl(${130+i*7},${42+i%2*16}%,${26+i%3*8}%)`)}
}
function sofa(c,g,x,y){ell(c,iso(g,x+.55,y+.45).x,iso(g,x+.55,y+.45).y,70,26,'#001a2860');prism(c,g,x,y,1.4,.73,20,'#9f514b','#563842','#302c3f');prism(c,g,x,y,.26,.75,37,'#d28567','#553e41','#492b36');prism(c,g,x,y,1.4,.2,49,'#b96e60','#6c4a45','#593d3f');for(let i=0;i<2;i++){let p=iso(g,x+.44+i*.54,y+.43,38);ell(c,p.x,p.y,13,8,i?'#e1af82':'#e98d6f')}}
function server(c,g,x,y,i){prism(c,g,x,y,.66,.55,91,'#3b4657','#1c2333','#0f1a2a');const p=iso(g,x+.2,y+.28,69);rect(c,p.x-9,p.y-30,22,64,3,'#182636','#647f86');for(let j=0;j<8;j++){rect(c,p.x-6,p.y-26+j*7,15,4,1,'#324f5e');ell(c,p.x+6,p.y-24+j*7,1.7,1.7,(j+i)%3?'#76e4c8':'#a8df5f')}}
function whiteboard(c,g,x,y){const p=iso(g,x,y,84);rect(c,p.x-50,p.y-51,104,62,4,'#e9e3d0','#335662');for(let i=0;i<5;i++){let y2=p.y-36+i*12;L(c,p.x-36,y2,p.x+12+(i%2)*21,y2,['#4c95bb','#ef9d76','#63bd99'][i%3],2)} }
function lounge(c,g,tier){if(tier<2)return;sofa(c,g,.35,g.gy-2.3);let cp=iso(g,2.05,g.gy-1.25);prism(c,g,1.72,g.gy-1.37,.9,.6,25,'#e5b98b','#855b48','#744c48');let p=iso(g,2.2,g.gy-1.25,31);ell(c,p.x,p.y,8,4,'#e4d5b5');let rug=[iso(g,.34,g.gy-2.6),iso(g,3.1,g.gy-2.6),iso(g,3.1,g.gy-.45),iso(g,.34,g.gy-.45)];polygon(c,rug,'#273c4f44','#8ec7bc67');}
function meeting(c,g,tier){if(tier<3)return;let y=g.gy-2.3,x=g.gx-3.5;
 prism(c,g,x,y,2.25,1.1,28,'#e0b99b','#795b50','#694a44');for(let i=0;i<3;i++){let p=iso(g,x+.42+i*.5,y+.48,33);rect(c,p.x-13,p.y-6,19,11,2,i%2?'#9cb8ce':'#c2b4c6');}
 whiteboard(c,g,g.gx-.8,.45);}
function lab(c,g,tier){if(tier===1){let p=iso(g,g.gx-.56,g.gy-.55);rect(c,p.x-18,p.y-26,37,36,4,'#8a6c57','#5d4742');for(let i=0;i<4;i++)rect(c,p.x-13,p.y-19+i*9,26,5,1,'#5c4c46');return}
 server(c,g,g.gx-1.12,.7,0);if(tier>=3){server(c,g,g.gx-1.85,.9,1);let p=iso(g,g.gx-.6,g.gy-1.15,70);rect(c,p.x-36,p.y-65,60,64,2,'#159b69','#6effbb');L(c,p.x-42,p.y-64,p.x-42,p.y+4,'#1c2333',5);
 for(let i=0;i<2;i++){let q=iso(g,g.gx-1.6,g.gy-1.0+i*.85);ell(c,q.x,q.y-40,6,6,'#f3f5cd');L(c,q.x,q.y-32,q.x,q.y+10,'#344e5a',3)}}
}
function props(c,g,tier,year,places){
 // Defined furnishing zones vary significantly by office tier.
 if(tier===1){let p=iso(g,.85,3.7);prism(c,g,.55,3.15,.85,.5,45,'#b1855f','#7a554a','#5e4139');rect(c,p.x-24,p.y-42,40,21,3,'#303c46');L(c,p.x-10,p.y-10,p.x+15,p.y-10,'#f1bd86',2);}
 if(tier>=2)lounge(c,g,tier);meeting(c,g,tier);lab(c,g,tier);
 if(tier>=3){let p=iso(g,g.gx-2.5,1.2);prism(c,g,g.gx-3.0,.5,1.4,.5,93,'#443d3d','#4b3b3b','#231f25');for(let i=0;i<6;i++){rect(c,p.x-26+(i%3)*19,p.y-35+Math.floor(i/3)*16,13,11,2,['#e3b26f','#4e9b96','#b07b70'][i%3])}}
 if(tier>=4){let p=iso(g,.3,g.gy-4.2,55);rect(c,p.x-17,p.y-35,100,63,4,'#243c63','#6db9dba0');rect(c,p.x-12,p.y-29,90,52,2,'#152a45');for(let i=0;i<12;i++)rect(c,p.x-7+i*6,p.y-21+(i%3)*7,2,2,1,'#89d1e4');}
 for(let i=0;i<Math.min(10,2+tier*2);i++){const px=.35+((i*2.47)%(g.gx-1)),py=.5+((i*3.1)%(g.gy-1));if(i%2===0)planter(c,g,px,py,i);else {const p=iso(g,px,py,13);ell(c,p.x,p.y,9,4,'#ffb34f8c')}}
 places.forEach((p,i)=>desk(c,g,p[0],p[1],tier,i));
 if(tier>=3){let pt=iso(g,1,g.gy-.55);rect(c,pt.x-21,pt.y-47,32,45,3,'#202e42','#69b4af');rect(c,pt.x-15,pt.y-40,20,19,3,'#162b55');ell(c,pt.x-7,pt.y-31,8,6,'#ebd7a5');}
 if(tier>=3){ // translucent partitions visibly create separate teams/meeting zones
  for(let k=0;k<2;k++){const px=4.1+k*3.2,py=tier===3?g.gy-2.9:g.gy-3.6;const a=iso(g,px,py,10),b=iso(g,px+1.9,py,10);polygon(c,[a,b,{x:b.x,y:b.y-95},{x:a.x,y:a.y-95}],'#8ac7d013','#a8ceda74',2);L(c,a.x,a.y-93,b.x,b.y-93,'#b3d3d5',3);L(c,(a.x+b.x)/2,(a.y+b.y)/2,(a.x+b.x)/2,(a.y+b.y)/2-92,'#d0e0e068',2)}
  let q=iso(g,2.5,g.gy-2.0);prism(c,g,2.2,g.gy-2.0,1.2,.75,33,'#f3d9ab','#735a53','#533c42');for(let m=0;m<3;m++){const a=iso(g,2.35+m*.26,g.gy-1.85,42);rect(c,a.x-3,a.y-12,8,19,2,['#9bd4d0','#f6bb83','#e3c1c1'][m])}
 }
 if(tier===4){ // separate creative showroom and lounge wall
  let q=iso(g,g.gx-4,g.gy-3.0,50);rect(c,q.x-54,q.y-63,107,62,5,'#16253b','#58809e');for(let i=0;i<7;i++){rect(c,q.x-45+i*13,q.y-53+(i%3)*6,9,13,2,['#e3a46e','#68bcb3','#a17ab9'][i%3])}
  sofa(c,g,g.gx-4.2,g.gy-2.2);planter(c,g,g.gx-5.3,g.gy-1.3,2);
 }
}
function prep(tier,year,staffCount){tier=Math.max(1,Math.min(4,tier));const era=year>=2000?2:year>=1990?1:0;if(cached&&cacheTier===tier&&cacheEra===era&&cacheSize===staffCount)return cached;
 const g=defs[tier],canvas=document.createElement('canvas');canvas.width=W*1.5;canvas.height=H*1.5;const c=canvas.getContext('2d');c.scale(1.5,1.5);
 const gradient=c.createRadialGradient(720,400,90,720,400,920);gradient.addColorStop(0,tier===1?'#263a42':'#233748');gradient.addColorStop(.7,'#101f2d');gradient.addColorStop(1,'#07121d');c.fillStyle=gradient;c.fillRect(0,0,W,H);
 // immersive rim around stage
 for(let i=0;i<72;i++){let x=(i*391)%W,y=(i*223)%H;ell(c,x,y,1.3,1.3,'#d1ead410')}
 floor(c,g,tier);walls(c,g,tier,year);
 const positions=slots[tier];
 props(c,g,tier,year,positions.slice(0,Math.min(positions.length,Math.max(3,staffCount+2))));
 const p=iso(g,g.gx*.50,g.gy*.55);let light=c.createRadialGradient(p.x,p.y,0,p.x,p.y,640);light.addColorStop(0,tier===1?'#e8ba8020':'#b7ecd919');light.addColorStop(1,'#77a8bd00');c.fillStyle=light;c.fillRect(0,0,W,H);
 // stage bottom caption (never an in-game person)
 rect(c,22,H-83,tier===1?245:274,53,10,'#0d2234dd','#5b8e946b');c.fillStyle='#93e9d4';c.font='bold 12px system-ui';c.fillText('YOUR WORKSPACE',40,H-61);c.fillStyle='#e5f6f4';c.font='bold 19px system-ui';c.fillText(['','GARAGE STARTUP','RENTED STUDIO','CREATIVE LOFT','STUDIO CAMPUS'][tier],40,H-38);
 cached=canvas;cacheTier=tier;cacheEra=era;cacheSize=staffCount;return canvas;
}
function frame(stage,camera,tier){const full=defs[tier];let bw=full.gx*full.unit+full.gy*full.unit+225,bh=(full.gx+full.gy)*full.unit*.49+370;
 const availableW=stage.width-16,availableH=stage.height-(stage.width<750?190:100);
 const natural=Math.min(1.5,Math.max(.22,Math.min(availableW/bw,availableH/bh)))*(tier===1?1.13:1.04);const fac=Math.max(.85,Math.min(3,camera.zoom/(camera.initialZoom||camera.zoom||1)));const s=natural*fac;
 const ctr=iso(full,full.gx*.50,full.gy*.48,35);
 const cx=ctr.x,cy=ctr.y-28;
 // Bound camera offset so office can never get lost off-screen.
 const maxX=Math.max(stage.width*.22,bw*s*.50),maxY=Math.max(stage.height*.14,bh*s*.34);
 const panX=Math.max(-maxX,Math.min(maxX,camera.panX)),panY=Math.max(-maxY,Math.min(maxY,camera.panY));
 return{s,x:stage.width*.50+panX-cx*s,y:stage.height*.46+panY-cy*s,cx,cy};
}
function pos(p,tier){const g=defs[tier],place=slots[tier][p.id%slots[tier].length];const old=[{x:2.28,y:2.8},{x:4.6,y:2.72},{x:2.4,y:4.78},{x:4.77,y:4.7},{x:6.64,y:2.5},{x:6.65,y:4.55},{x:8.65,y:2.4},{x:8.65,y:4.4},{x:10.1,y:5.6},{x:9.6,y:7.3},{x:6.5,y:7.4},{x:3.5,y:7.5},{x:11.6,y:2.6},{x:12.5,y:4.0},{x:11.1,y:5.8},{x:9.2,y:8.4},{x:6.4,y:9.1},{x:4.2,y:8.8},{x:13,y:7.1},{x:12,y:9.1},{x:10.2,y:10.2},{x:7.5,y:11.1},{x:5.1,y:10.1},{x:2.6,y:9.2}][p.id%24];const d=.4;return iso(g,Math.max(.4,Math.min(g.gx-.38,place[0]+(p.x-old.x)*d)),Math.max(.4,Math.min(g.gy-.3,place[1]+(p.y-old.y)*d)));}
function staff(c,p,t,tier,project){const {x,y}=pos(p,tier);let walk=!!p.moving||p.mode==='toBreak'||p.mode==='return',osc=Math.sin(t*.009+p.id*1.9),bounce=walk?Math.abs(osc)*3:.2*Math.sin(t*.002+p.id);c.save();c.translate(x,y-7-bounce);
 ell(c,0,5,13,5,'#07101bb6');const left=walk?osc*5:0;
 L(c,-4,-15,-5+left,0,'#232536',5);L(c,5,-15,6-left,0,'#202a34',5);
 ell(c,-5+left,0,5,2,'#101a25');ell(c,6-left,0,5,2,'#101a25');
 let grad=c.createLinearGradient(-10,-38,8,-13);grad.addColorStop(0,p.color||'#e47c72');grad.addColorStop(1,'#243c54');
 rect(c,-12,-36,24,25,7,grad,'#ffffff4d');
 L(c,-11,-29,-15+Math.sin(t*.006+p.id)*2,-18,'#dcb38b',4);L(c,11,-29,15-Math.sin(t*.006+p.id)*2,-19,'#dcb38b',4);
 ell(c,0,-45,10,12,p.skin||'#c69878');ell(c,0,-52,11,5,p.hair||'#3c3139');
 ell(c,-3,-44,1.4,1.4,'#243340');ell(c,4,-44,1.4,1.4,'#243340');
 if(!walk&&p.mode==='work'){let pct=project?Math.min(1,(Math.sin(t*.002+p.id)+1)*.5):.15;
 c.shadowBlur=9;c.shadowColor='#3edab7';rect(c,-19,-72,38,11,5,'#102639dd','#54d9a88b');c.shadowBlur=0;rect(c,-16,-68,30*pct,3,1,'#6effc2');}
 if(p.mode==='break'){ell(c,0,-79,8,5,'#d9b176');c.fillStyle='#fff6cf';c.font='bold 10px system-ui';c.textAlign='center';c.fillText('☕',0,-77)}
 c.restore();}
const hotspots={1:[['develop',2,2],['team',1.0,3.6],['studio',3.2,3.6]],2:[['develop',3.5,2],['team',1.2,4.5],['studio',5.5,4.1],['research',7,1.0]],3:[['develop',4.3,3.5],['team',1.5,6],['studio',8,6],['research',9.2,1]],4:[['develop',4.4,3.0],['team',1.5,7.0],['studio',10.8,6.7],['research',12,1.6],['market',4,8.7]]};
function render(c,stage,state,camera,t){const tier=Math.max(1,Math.min(4,state.office||1)),img=prep(tier,state.year,state.staff.length),f=frame(stage,camera,tier);
 c.fillStyle='#0b1b2b';c.fillRect(0,0,stage.width,stage.height);
 c.save();c.translate(f.x,f.y);c.scale(f.s,f.s);
 c.drawImage(img,0,0,W,H);
 if(state.project&&!state.project.ready){const place=iso(defs[tier],defs[tier].gx*.45,1,54),percent=Math.max(0,Math.min(1,state.project.progress/Math.max(1,state.project.weeks)));rect(c,place.x-75,place.y-65,160,38,9,'#0a2134ed','#78e5c064');rect(c,place.x-65,place.y-35,138,5,3,'#304d58');rect(c,place.x-65,place.y-35,138*percent,5,3,'#71f6ba');c.font='800 12px system-ui';c.fillStyle='#e5f8f4';c.fillText('IN DEVELOPMENT  '+Math.round(percent*100)+'%',place.x-62,place.y-45)}
 // People and action indicators are genuinely dynamic. NO people in backdrop.
 for(const p of [...state.staff].sort((a,b)=>pos(a,tier).y-pos(b,tier).y))staff(c,p,t,tier,!!(state.project&&!state.project.ready));
 c.restore();return true;}
function hit(x,y,stage,state,camera){const tier=Math.max(1,Math.min(4,state.office||1)),f=frame(stage,camera,tier);let px=(x-f.x)/f.s,py=(y-f.y)/f.s;
 for(let i=state.staff.length-1;i>=0;i--){const p=state.staff[i],q=pos(p,tier);if(Math.hypot(px-q.x,py-(q.y-32))<30)return {type:'person',id:p.id,name:p.name,sx:q.x*f.s+f.x,sy:(q.y-32)*f.s+f.y};}
 let nearest=null,min=Infinity;for(const [type,u,v] of hotspots[tier]){const q=iso(defs[tier],u,v,30),d=Math.hypot(px-q.x,py-q.y);if(d<85&&d<min){min=d;nearest={type,name:({develop:'Development desks',team:'Team lounge',studio:'Studio & offices',research:'Research laboratory',market:'Games & market'})[type],sx:q.x*f.s+f.x,sy:q.y*f.s+f.y}}}
 return nearest;}
window.PremiumStudio={get ready(){return true},render,hit,frame:()=>null,resetCache(){cached=null},staffPosition:pos};
})();