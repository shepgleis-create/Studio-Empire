/* STUDIO EMPIRE — living studio art extension. Independent original hand-painted canvas graphics. */
(function(){'use strict';
const TAU=Math.PI*2;
function path(c,p,fill,stroke,width=1){c.beginPath();p.forEach((a,i)=>i?c.lineTo(a.x,a.y):c.moveTo(a.x,a.y));c.closePath();if(fill){c.fillStyle=fill;c.fill()}if(stroke){c.strokeStyle=stroke;c.lineWidth=width;c.stroke()}}
function rect(c,x,y,w,h,color,rad=2){c.fillStyle=color;c.beginPath();if(c.roundRect)c.roundRect(x,y,w,h,rad);else c.rect(x,y,w,h);c.fill()}
function ell(c,x,y,rx,ry,col){c.beginPath();c.ellipse(x,y,rx,ry,0,0,TAU);c.fillStyle=col;c.fill()}
function line(c,a,b,col,w=1){c.beginPath();c.moveTo(a.x,a.y);c.lineTo(b.x,b.y);c.lineWidth=w;c.strokeStyle=col;c.stroke()}
function letter(c,txt,x,y,col='#fff7e7',sz=9){c.fillStyle=col;c.font='800 '+sz+'px system-ui';c.textAlign='center';c.fillText(txt,x,y)}
const base=window.StudioArt||{};
const beforeFloor=base.floor,beforeWall=base.wall,beforeProps=base.props,beforeCharacter=base.character,beforeAmbient=base.ambient;
base.floor=function(c,a){if(beforeFloor)beforeFloor(c,a);const I=a.iso,W=a.officeW(),H=a.officeH();
// Thin parquet grain and grout become more visible when you zoom into the studio.
for(let x=.14;x<W-.1;x+=.52)for(let y=.16;y<H-.1;y+=.55){const p=I(x,y,.4);line(c,{x:p.x-8,y:p.y-2},{x:p.x+9,y:p.y+3},(Math.floor(x*4+y*3)%2?'#fff7db':'#aa7052')+'38',.72)}
// Color-coded activity zones with etched floor markings.
const zones=[{x:1.25,y:1.1,w:3.5,d:3.9,color:'#d26d6c48',label:'CODE'},{x:5.2,y:1.1,w:1.6,d:3.6,color:'#58bcb058',label:'DESIGN'},{x:1.3,y:5.2,w:3.2,d:1.25,color:'#5e86b05e',label:'BREAK'}];
if(a.office>=2)zones.push({x:7.8,y:1.2,w:1.6,d:3,color:'#8b83c056',label:'QA'});
for(const z of zones){const pts=[I(z.x,z.y),I(z.x+z.w,z.y),I(z.x+z.w,z.y+z.d),I(z.x,z.y+z.d)];path(c,pts,z.color,'#fdf0ca46',1);let q=I(z.x+.25,z.y+.3);c.save();c.translate(q.x,q.y);c.rotate(.27);letter(c,z.label,0,0,'#1c6d644c',8);c.restore()}
};
base.wall=function(c,a){if(beforeWall)beforeWall(c,a);const I=a.iso,W=a.officeW(),H=a.officeH(),t=a.time/1000;
// Crown trim and trim studs break up the flat open box.
for(let x=.2;x<W-.2;x+=.48){let p=I(x,0,146);ell(c,p.x,p.y,1.9,2.2,'#ffebc0');}
let ledA=I(.1,0,33),ledB=I(W-.2,0,33);line(c,ledA,ledB,'#ffce97a0',2.6);
// Noticeboard with changing handwritten idea cards.
const q=I(Math.max(3.5,W-1.3),0,113);rect(c,q.x-30,q.y-44,68,57,'#274a59',3);rect(c,q.x-26,q.y-40,60,50,'#ca987c',2);
const colors=['#f8dea9','#b9dcd2','#f9b3a7','#f4e8cb','#d7c4e9','#b6cddc'];
for(let i=0;i<6;i++){let x=q.x-22+(i%3)*18,y=q.y-34+Math.floor(i/3)*20;rect(c,x,y,15,16,colors[i],1);line(c,{x:x+3,y:y+6},{x:x+12,y:y+6},'#59777c77',1);line(c,{x:x+3,y:y+10},{x:x+10,y:y+10},'#59777c77',1);ell(c,x+8,y+2,1.4,1.4,'#bd635d')}
// Decorative perpendicular acoustic panels on the left wall.
for(let y=.55;y<H-1;y+=1.04){const q=I(0,y,96);for(let j=0;j<3;j++){path(c,[{x:q.x-20+j*5,y:q.y-20+j*3},{x:q.x-16+j*5,y:q.y-18+j*3},{x:q.x-16+j*5,y:q.y+17+j*3},{x:q.x-20+j*5,y:q.y+15+j*3}],j%2?'#814e6c60':'#f9cb9892')}}
// A blinking "LIVE BUILD" sign in later offices.
if(a.office>=2){const sign=I(W-2.9,0,100);rect(c,sign.x-31,sign.y-22,63,26,'#193e51',4);ell(c,sign.x-21,sign.y-9,3.1,3.1,Math.sin(t*1.7)>0?'#86f6ba':'#47816a');letter(c,'BUILD LAB',sign.x+5,sign.y-6,'#e8fff3',9)}
};
base.props=function(c,a){const o=beforeProps?beforeProps(c,a):[];const I=a.iso,W=a.officeW(),H=a.officeH(),box=a.box;
function shadow(x,y,size=16){const p=I(x,y);ell(c,p.x,p.y+3,size,size*.33,'#172d3350')}
function floorLamp(x,y){const p=I(x,y);shadow(x,y,11);line(c,{x:p.x,y:p.y-4},{x:p.x,y:p.y-78},'#3c5460',3);line(c,{x:p.x,y:p.y-78},{x:p.x-12,y:p.y-90},'#4d636d',3);ell(c,p.x-16,p.y-90,13,7,'#244a54');ell(c,p.x-16,p.y-85,13,4,'#ffd296');ell(c,p.x-16,p.y-81,29,10,'#fbd28a32')}
function shelf(x,y){box(x,y,.66,.3,0,72,'#597d79','#345f64','#294f55');for(let i=0;i<3;i++){let p=I(x+.35,y+.3,17+i*23);rect(c,p.x-16,p.y-4,32,3,'#d7aa78');for(let j=0;j<5;j++){rect(c,p.x-13+j*6,p.y-16-(j%2)*4,4,12+(j%2)*4,['#fdba90','#8dd4bc','#e9db9d','#6ea8c0','#da97b7'][j],1)}}}
function plant(x,y){const p=I(x,y);shadow(x,y,11);box(x-.14,y-.14,.33,.33,0,14,'#d4aa85','#996e68','#654957');for(let i=0;i<8;i++){const a=i*TAU/8;line(c,{x:p.x,y:p.y-13},{x:p.x+Math.cos(a)*11,y:p.y-31-Math.sin(a)*6},'#3e816f',2.2);ell(c,p.x+Math.cos(a)*13,p.y-31-Math.sin(a)*6,6.5,3.5,i%2?'#4aa08b':'#8ac18a')}}
function collectible(x,y){const p=I(x,y);box(x-.26,y-.2,.52,.48,0,24,'#3a5871','#244057','#18344a');rect(c,p.x-16,p.y-22,32,9,'#a4bbbc');letter(c,'DEVKIT',p.x,p.y-14,'#264759',7);ell(c,p.x-8,p.y-3,2,2,'#9cf1c1');ell(c,p.x+8,p.y-3,2,2,'#efb979');rect(c,p.x-10,p.y+3,21,2,'#7eb1bd')}
function illustration(x,y,txt){const p=I(x,y,102);rect(c,p.x-19,p.y-24,38,39,'#1d495f',3);rect(c,p.x-15,p.y-20,30,27,'#6fbca9');path(c,[{x:p.x-10,y:p.y+4},{x:p.x+2,y:p.y-10},{x:p.x+10,y:p.y+3}],'#255276');ell(c,p.x+6,p.y-13,4,4,'#f6d58d');letter(c,txt,p.x,p.y+13,'#f7dfb5',6)}
function lounge(x,y){const p=I(x,y);shadow(x,y,20);box(x-.36,y-.35,.72,.68,0,9,'#ba785c','#a06551','#784d50');box(x-.12,y-.12,.23,.22,9,7,'#f3c99a','#c79a7b','#a97765');ell(c,p.x,p.y-19,4.5,2.2,'#fff9d7')}
function qaBay(x,y){box(x,y,.94,.66,0,24,'#374c65','#253954','#202f46');let p=I(x+.4,y+.21,50);rect(c,p.x-22,p.y-23,45,29,'#283f51',3);rect(c,p.x-18,p.y-20,37,22,'#225b6c');for(let i=0;i<6;i++)rect(c,p.x-14+i*5,p.y-9-(i%3)*3,3,7+(i%3)*3,['#6ff8c3','#f7db92','#dd83a6'][i%3]);rect(c,p.x-10,p.y+7,22,4,'#ecab80')}
function meetingScreen(x,y){let p=I(x,y,45);rect(c,p.x-20,p.y-29,40,30,'#15374a',4);rect(c,p.x-17,p.y-26,34,22,'#287f87',2);let bars=[16,8,12,19,11];for(let i=0;i<5;i++)rect(c,p.x-12+i*6,p.y-5-bars[i],4,bars[i],'#8ee4b4',1)}
o.push({v:2.8,draw:()=>floorLamp(.92,.7)});
o.push({v:6.5,draw:()=>plant(1.1,4.8)});
o.push({v:5.4,draw:()=>shelf(W-2.6,.45)});
o.push({v:7.6,draw:()=>collectible(W-2.1,1.2)});
o.push({v:8.0,draw:()=>lounge(4.3,4.15)});
o.push({v:10.6,draw:()=>meetingScreen(5.4,2.3)});
if(a.office>=2){o.push({v:11,draw:()=>qaBay(W-2.3,4.6)});o.push({v:13,draw:()=>plant(W-.85,H-1.5)});}
if(a.office>=3){o.push({v:13.5,draw:()=>qaBay(7,6.6)});o.push({v:15.2,draw:()=>shelf(9.2,6.8)});o.push({v:14.2,draw:()=>plant(3.4,H-.8)});}
return o;
};
base.character=function(c,a){if(beforeCharacter)beforeCharacter(c,a);const p=a.person,t=a.now/1000,x=a.x,y=a.y;
// Badge clipped on clothing, shoe highlights and a little purposeful breathing movement.
const center=y-(a.seated?35:32);rect(c,x+4,center+4,7,5,'#e6dfc4',1);rect(c,x+5,center+5,3.5,1.4,'#74a9b6',.5);
if(p.mode==='break'){ell(c,x-10,y-75,18,10,'#18394fdc');letter(c,p.id%2?'☕':'◌',x-10,y-71,'#ffdf9d',12)}
else if(p.mode==='toBreak'||p.mode==='return'){if(Math.sin(t*3+p.id)>-.85)ell(c,x,y-80,2.5,2,'#fcf0c270')}
else if(p.mode==='work'&&Math.sin(t*2.3+p.id*3)>.88){ell(c,x+13,y-76,14,10,'#173a4fc4');letter(c,['{ }','✦','✓','?','↗'][p.id%5],x+13,y-73,'#b5f4df',9)}
};
base.ambient=function(c,a){if(beforeAmbient)beforeAmbient(c,a);const I=a.iso,W=a.officeW(),H=a.officeH(),t=a.time/1000;
// Glass gleam, lively light shafts and screen reflections, all translucent to retain legibility.
const wd=I(1.65,0,95),grd=c.createRadialGradient(wd.x,wd.y,10,wd.x,wd.y,175);grd.addColorStop(0,'#fbe6be1c');grd.addColorStop(1,'#fbe6be00');c.fillStyle=grd;c.beginPath();c.arc(wd.x,wd.y,175,0,TAU);c.fill();
for(let i=0;i<3;i++){const q=I(2+i*1.5,2.65+i*.4,45);ell(c,q.x,q.y,15,8,'#87d3e30c')}
if(a.project&&!a.project.ready){const pt=I(W-1.5,2.4,120);rect(c,pt.x-31,pt.y-27,62,19,'#12384ac7',4);letter(c,'IN PRODUCTION',pt.x,pt.y-14,'#b5f5d6',8)}
};
window.StudioArt=base;
})();