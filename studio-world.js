/* Studio Empire v0.6 — living studio artwork, original vector scene */
(function(){'use strict';
const prev=window.StudioArt||{},TWOPI=Math.PI*2,oldProps=prev.props,oldWall=prev.wall,oldFloor=prev.floor,oldCharacter=prev.character,oldAmbient=prev.ambient;
function poly(c,ps,col){c.fillStyle=col;c.beginPath();ps.forEach((p,i)=>i?c.lineTo(p.x,p.y):c.moveTo(p.x,p.y));c.closePath();c.fill()}
function line(c,a,b,color,w=2){c.strokeStyle=color;c.lineWidth=w;c.beginPath();c.moveTo(a.x,a.y);c.lineTo(b.x,b.y);c.stroke()}
function rect(c,x,y,w,h,col,r=2){c.fillStyle=col;c.beginPath();if(c.roundRect)c.roundRect(x,y,w,h,r);else c.rect(x,y,w,h);c.fill()}
function ell(c,x,y,rx,ry,col){c.fillStyle=col;c.beginPath();c.ellipse(x,y,rx,ry,0,0,TWOPI);c.fill()}
function label(c,s,x,y,size=8){c.textAlign='center';c.font='800 '+size+'px system-ui';c.fillStyle='#e8fff2';c.fillText(s,x,y)}
prev.floor=function(c,a){if(oldFloor)oldFloor(c,a);const I=a.iso,w=a.officeW(),h=a.officeH();
for(let x=.14;x<w-.15;x+=.51)for(let y=.17;y<h-.16;y+=.54){const p=I(x,y);line(c,{x:p.x-9,y:p.y-2},{x:p.x+9,y:p.y+3},'#af825524',.7)}
const zones=[{x:1.2,y:1.2,w:3.6,h:3.8,c:'#d8778650'},{x:5.1,y:1.1,w:1.6,h:3.7,c:'#50bdaf53'},{x:1.1,y:5.2,w:3.2,h:1.3,c:'#6a8cbd5c'}];
if(a.office>=2)zones.push({x:7.8,y:1.1,w:1.6,h:3.5,c:'#9b83c05c'});
for(const z of zones)poly(c,[I(z.x,z.y),I(z.x+z.w,z.y),I(z.x+z.w,z.y+z.h),I(z.x,z.y+z.h)],z.c)
};
prev.wall=function(c,a){if(oldWall)oldWall(c,a);const I=a.iso,w=a.officeW(),h=a.officeH(),t=a.time/1000;
for(let x=.2;x<w-.1;x+=.46){const p=I(x,0,146);ell(c,p.x,p.y,2.2,2.2,'#fff1bd')}
line(c,I(.2,0,33),I(w-.1,0,33),'#fbd7a0a1',3);
const q=I(Math.max(3.5,w-1.3),0,113);
rect(c,q.x-30,q.y-44,68,57,'#274b58',3);rect(c,q.x-26,q.y-40,60,50,'#cc9d7e',2);
const cols=['#f8dea9','#b9dcd2','#f9b3a7','#f4e8cb','#d7c4e9','#b6cddc'];
for(let i=0;i<6;i++){const x=q.x-22+(i%3)*18,y=q.y-34+Math.floor(i/3)*20;rect(c,x,y,15,16,cols[i],1);rect(c,x+3,y+6,10,1,'#527e8180',1);rect(c,x+3,y+9,8,1,'#527e8180',1);ell(c,x+7,y+2,1.4,1.4,'#bc716b')}
if(a.office>=2){const r=I(w-3,0,99);rect(c,r.x-34,r.y-22,67,28,'#163d4d',3);ell(c,r.x-24,r.y-8,3.2,3.2,Math.sin(t)>0?'#99f5c8':'#3a806a');label(c,'BUILD LAB',r.x+6,r.y-5,9)}
};
prev.props=function(c,a){const list=oldProps?oldProps(c,a):[],I=a.iso,w=a.officeW(),h=a.officeH(),box=a.box;
function plant(x,y){const p=I(x,y);box(x-.14,y-.14,.35,.35,0,13,'#b68a77','#a36b65','#7b535c');for(let i=0;i<8;i++){const th=i*TWOPI/8;line(c,{x:p.x,y:p.y-13},{x:p.x+Math.cos(th)*13,y:p.y-30-Math.sin(th)*8},'#4c9179',2);ell(c,p.x+Math.cos(th)*14,p.y-31-Math.sin(th)*8,6,3.8,i%2?'#63ab8b':'#92ba86')}}
function lamp(x,y){const p=I(x,y);ell(c,p.x,p.y,14,6,'#213a4455');line(c,{x:p.x,y:p.y-3},{x:p.x,y:p.y-78},'#3a5766',3);line(c,{x:p.x,y:p.y-78},{x:p.x-14,y:p.y-92},'#42636a',3);ell(c,p.x-14,p.y-92,12,8,'#244955');ell(c,p.x-14,p.y-85,18,6,'#ffe1a5');ell(c,p.x-14,p.y-80,26,9,'#ffe3a72a')}
function shelf(x,y){box(x,y,.68,.31,0,66,'#77908c','#557576','#3c5964');for(let i=0;i<3;i++){let p=I(x+.34,y+.3,17+i*20);rect(c,p.x-16,p.y-4,32,3,'#d7ae85');for(let j=0;j<5;j++){rect(c,p.x-12+j*6,p.y-15,4,12,['#fac18d','#7fc6b4','#e7da9e','#79b5c6','#e4a2b0'][j])}}}
function gameKit(x,y){const p=I(x,y);box(x-.25,y-.19,.53,.42,0,27,'#395b71','#294459','#23344b');rect(c,p.x-15,p.y-25,30,8,'#b4b6b1');label(c,'DEV KIT',p.x,p.y-18,6);ell(c,p.x-8,p.y,2,2,'#9cf1bf');ell(c,p.x+8,p.y,2,2,'#f0b97e')}
function board(x,y){const p=I(x,y,45);rect(c,p.x-22,p.y-29,45,30,'#1d4757');rect(c,p.x-18,p.y-25,37,23,'#206474');for(let j=0;j<5;j++)rect(c,p.x-13+j*7,p.y-5-(j%3)*4,5,12+(j%3)*4,['#8bd9c9','#facf8d','#edaa93'][j%3])}
list.push({v:2.4,draw:()=>lamp(.84,.72)},{v:6.7,draw:()=>plant(1.04,4.78)},{v:6.9,draw:()=>shelf(w-2.55,.6)},{v:7.7,draw:()=>gameKit(w-2.1,1.2)},{v:11.0,draw:()=>board(5.4,2.3)});
if(a.office>=2)list.push({v:11.7,draw:()=>gameKit(8.2,4.6)},{v:15,draw:()=>plant(w-.75,h-1.3)});
if(a.office>=3)list.push({v:13.8,draw:()=>shelf(9.2,6.9)},{v:16,draw:()=>plant(3.4,h-.65)});
return list;
};
prev.character=function(c,a){if(oldCharacter)oldCharacter(c,a);const p=a.person,x=a.x,y=a.y,t=a.now/1000;rect(c,x+4,y-31,7,5,'#e5e1ce',1);rect(c,x+5,y-30,4,1.7,'#6db3ac',1);
if(p.mode==='break'){ell(c,x-11,y-75,17,10,'#17384cdb');label(c,p.id%2?'COFFEE':'BREAK',x-11,y-72,6)}
if(p.mode==='work'&&Math.sin(t*2.1+p.id*3)>.9){ell(c,x+14,y-74,16,10,'#163648ba');label(c,['CODE','IDEA','QA','ART'][p.id%4],x+14,y-71,6)}
};
prev.ambient=function(c,a){if(oldAmbient)oldAmbient(c,a);const I=a.iso,w=a.officeW();const p=I(1.6,0,97),g=c.createRadialGradient(p.x,p.y,10,p.x,p.y,190);g.addColorStop(0,'#ffe3aa1a');g.addColorStop(1,'#ffe3aa00');c.fillStyle=g;c.beginPath();c.arc(p.x,p.y,190,0,TWOPI);c.fill();if(a.project&&!a.project.ready){const z=I(w-1.5,2.4,125);rect(c,z.x-32,z.y-28,64,19,'#123a4cbd',4);label(c,'IN PRODUCTION',z.x,z.y-15,7)}};
window.StudioArt=prev;
})();