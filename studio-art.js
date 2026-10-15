/* Studio Empire — Original hand-drawn isometric art direction v0.5.
   The rendering extensions intentionally do not modify game state. */
(function(){
'use strict';
const P=Math.PI*2;
const poly=(ctx,pts,fill,stroke,width=1)=>{ctx.beginPath();pts.forEach((p,i)=>i?ctx.lineTo(p.x,p.y):ctx.moveTo(p.x,p.y));ctx.closePath();if(fill){ctx.fillStyle=fill;ctx.fill()}if(stroke){ctx.strokeStyle=stroke;ctx.lineWidth=width;ctx.stroke()}};
const L=(ctx,a,b,col,w=1)=>{ctx.beginPath();ctx.moveTo(a.x,a.y);ctx.lineTo(b.x,b.y);ctx.lineWidth=w;ctx.strokeStyle=col;ctx.stroke()};
const E=(ctx,x,y,rx,ry,col)=>{ctx.beginPath();ctx.ellipse(x,y,rx,ry,0,0,P);ctx.fillStyle=col;ctx.fill()};
const R=(ctx,x,y,w,h,r,col)=>{ctx.beginPath();ctx.roundRect(x,y,w,h,r);ctx.fillStyle=col;ctx.fill()};
const I=(iso,x,y,z=0)=>iso(x,y,z);
function wall(ctx,a){
 const {iso,officeW,officeH,time}=a,w=officeW(),h=officeH(),t=time/1000;
 // Deep architectural kickboards and warm-lit slats.
 for(let x=.2;x<w-.1;x+=.65){let v=I(iso,x,0,13);L(ctx,v,I(iso,x+.22,0,13),'#e6a58c78',1.5)}
 for(let y=.2;y<h-.1;y+=.65){L(ctx,I(iso,0,y,13),I(iso,0,y+.2,13),'#ffe6b277',1.5)}
 // Large glass view with skyline, taking perspective from the room wall.
 const x1=.53,x2=2.85,top=140,bot=66;const p=[I(iso,x1,0,top),I(iso,x2,0,top),I(iso,x2,0,bot),I(iso,x1,0,bot)];
 ctx.save();ctx.beginPath();p.forEach((v,i)=>i?ctx.lineTo(v.x,v.y):ctx.moveTo(v.x,v.y));ctx.closePath();ctx.clip();
 const grad=ctx.createLinearGradient(p[0].x,p[0].y-40,p[2].x,p[2].y+40);grad.addColorStop(0,'#23596d');grad.addColorStop(.48,'#74afb8');grad.addColorStop(1,'#fbc790');ctx.fillStyle=grad;ctx.fillRect(p[0].x-12,p[0].y-30,p[2].x-p[0].x+30,130);
 for(let i=0;i<11;i++){let u=(i+.2)/11,v=I(iso,x1+(x2-x1)*u,0,bot);let high=14+((i*17)%35);ctx.fillStyle=i%2?'#396b80':'#51798b';ctx.fillRect(v.x-4,v.y-high,9,high+20);ctx.fillStyle='#f6d39b';for(let yy=v.y-high+4;yy<v.y-4;yy+=9)ctx.fillRect(v.x-1,yy,2,3)}
 E(ctx,p[0].x+43,p[0].y+34,16,16,'#ffde9c80');ctx.restore();
 poly(ctx,p,null,'#f7efe0',5);L(ctx,I(iso,1.69,0,top),I(iso,1.69,0,bot),'#f1e2d1',4);L(ctx,I(iso,x1,0,104),I(iso,x2,0,104),'#f1e2d1',3);
 // Venetian sunlight streaks across the upper area.
 for(let i=0;i<4;i++){let p=I(iso,.65+i*.52,0,52);L(ctx,{x:p.x-3,y:p.y+2},{x:p.x+17,y:p.y+10},'#ffedd170',2)}
 // Art prints: independent original artwork, not branded game artwork.
 const art=[{x:3.42,label:'NEW WORLDS',accent:'#74cfb7'},{x:4.73,label:'CREATE',accent:'#f9b56f'},{x:6.25,label:'PLAY MORE',accent:'#7cb6dc'}];
 art.filter(p=>p.x<w-.8).forEach((o,i)=>{const v=I(iso,o.x,0,104);R(ctx,v.x-26,v.y-33,49,49,3,'#1a394a');R(ctx,v.x-22,v.y-29,41,37,2,i%2?'#285d70':'#875e6d');poly(ctx,[{x:v.x-16,y:v.y-1},{x:v.x-4,y:v.y-20},{x:v.x+15,y:v.y-8},{x:v.x+5,y:v.y+1}],o.accent);E(ctx,v.x+3,v.y-14,5,5,'#ffdca2');ctx.fillStyle='#fff2d9';ctx.textAlign='center';ctx.font='700 6.8px system-ui';ctx.fillText(o.label,v.x-1,v.y+11)});
 // Acoustic wall panels and little pin-board.
 for(let j=0;j<3;j++){let p=I(iso,0,1.35+j*.75,121);poly(ctx,[{x:p.x-20,y:p.y-25},{x:p.x+12,y:p.y-7},{x:p.x+12,y:p.y+34},{x:p.x-20,y:p.y+16}],j%2?'#b87d76':'#678b91','#ffdbc080',1)}
 // Ceiling string lights, deliberately drawn inside the 2D world.
 for(let i=0;i<9;i++){const x=.5+i*(w-1)/8;const v=I(iso,x,0,147);E(ctx,v.x,v.y,3.4,3.4,'#fff6b6');E(ctx,v.x,v.y,7,6,'#ffebae22')}
}
function floor(ctx,a){const {iso,officeW,officeH,time}=a,w=officeW(),h=officeH();
 // Tile insets and carpet borders, subtle enough to keep characters readable.
 for(let x=.37;x<w-.15;x+=1.01)for(let y=.37;y<h-.15;y+=1.01){let p=I(iso,x,y,.1);E(ctx,p.x,p.y,1.5,1,'#b77c5145')}
 for(let i=0;i<8;i++){let p=I(iso,.4+i*.77,.5,0);L(ctx,p,{x:p.x+7,y:p.y+3},'#fff6d648',1)}
 // Thin decorative accent stripe marking the production area.
 L(ctx,I(iso,1.0,1.15),I(iso,5.5,1.15),'#e68f7f65',2);
 // Floor decals showing different rooms when expanded.
 if(a.office>=2){L(ctx,I(iso,7.2,.8),I(iso,7.2,6.8),'#d8f7f274',2)}
 if(a.office>=3){L(ctx,I(iso,.65,6.4),I(iso,10.8,6.4),'#d9e8fb74',2)}
}
function props(ctx,a){const {iso,box,officeW,officeH,office}=a,w=officeW(),h=officeH();const o=[];
 const add=(v,draw)=>o.push({v,draw});
 const rug=(x,y,s)=>{const p=I(iso,x,y);E(ctx,p.x,p.y,17*s,7*s,'#3d3d4933')};
 const lamp=(x,y)=>{const p=I(iso,x,y);rug(x,y,1);L(ctx,{x:p.x,y:p.y-6},{x:p.x,y:p.y-65},'#435c65',3);E(ctx,p.x,p.y-65,13,7,'#f8cd8a');E(ctx,p.x,p.y-60,19,10,'#ffeebd39');E(ctx,p.x,p.y-5,6,3,'#53727b')};
 add(2.1,()=>lamp(.78,.76));
 add(7.9,()=>{ // Standing planning shelf, board games and game boxes.
   box(5.65,.54,.67,.38,0,55,'#e3b27f','#ac7f64','#785b58');
   for(let j=0;j<4;j++){let p=I(iso,5.78+j*.13,.88,38+j%2*5);R(ctx,p.x-5,p.y-24,7,24,1,['#6eacbf','#e59d78','#dfd899','#ad8ac2'][j]);L(ctx,{x:p.x-2,y:p.y-18},{x:p.x+2,y:p.y-18},'#fff5da',1)}
 });
 add(3.1,()=>{ // Notebooks & stationery near development desks.
   let p=I(iso,3.36,1.75,1);poly(ctx,[{x:p.x-14,y:p.y},{x:p.x+4,y:p.y-8},{x:p.x+18,y:p.y},{x:p.x,y:p.y+8}],'#f7dfb2','#e9b885');L(ctx,{x:p.x-8,y:p.y},{x:p.x+4,y:p.y+5},'#64b3ad',2);
 });
 add(7.8,()=>{ // Developer console with glowing status panel.
   box(w-1.74,2.58,.58,.45,0,50,'#7b9b9e','#537181','#344d61');let p=I(iso,w-1.46,2.98,53);R(ctx,p.x-13,p.y-18,26,19,2,'#133c50');R(ctx,p.x-10,p.y-14,19,5,1,'#74e6d0');for(let n=0;n<4;n++)E(ctx,p.x-8+n*5,p.y-3,1.5,1.5,'#ffd27d')
 });
 add(9.4,()=>{let p=I(iso,w-1.3,h-1.4,0);E(ctx,p.x,p.y-2,16,7,'#203e4a5c');box(w-1.6,h-1.7,.65,.7,0,13,'#db8e7a','#ab665d','#7e595c');let q=I(iso,w-1.29,h-1.36,19);R(ctx,q.x-13,q.y-15,26,5,2,'#fff1d9');R(ctx,q.x-9,q.y-9,18,5,1,'#f7e1b3')});
 if(office>=2){add(11.9,()=>{box(8.2,5.6,1.18,.73,0,21,'#bc8f70','#866351','#5d4d4e');let p=I(iso,8.6,5.85,28);R(ctx,p.x-20,p.y-17,40,14,2,'#294451');ctx.fillStyle='#81e2bb';ctx.font='bold 9px system-ui';ctx.textAlign='center';ctx.fillText('QA LAB',p.x,p.y-6)})}
 if(office>=3){add(16.4,()=>{box(9.8,7.6,.66,.53,0,60,'#74b6a6','#3c908c','#236965');let p=I(iso,10.1,7.9,70);E(ctx,p.x,p.y-17,12,4,'#c1ffdd');R(ctx,p.x-8,p.y-16,16,9,2,'#163e55')})}
 return o;
}
function character(ctx,a){const {person:p,now,x,y,seated}=a,t=now/1000;
 // Hair texture, animated glasses, headphones, badges, silhouettes.
 const bob=seated?Math.sin(now/90+p.id)*.45:Math.sin(now/170+p.id)*1.2;
 const body=y-(seated?38:35)+bob,hy=body-14;
 if(p.id%3===0){ctx.strokeStyle='#2d3c4c';ctx.lineWidth=3;ctx.beginPath();ctx.arc(x,hy-2,10,Math.PI*1.09,Math.PI*1.9);ctx.stroke();R(ctx,x-13,hy-5,5,11,2,'#45576a');R(ctx,x+9,hy-5,5,11,2,'#45576a')}
 if(p.id%3===1){L(ctx,{x:x-5,y:hy},{x:x-1,y:hy},'#354856',1.2);L(ctx,{x:x+1,y:hy},{x:x+6,y:hy},'#354856',1.2);E(ctx,x,hy,1,1,'#354856')}
 R(ctx,x-3,body+3,7,3,1,'#e9d1a7');E(ctx,x,hy+5,1.5,.7,'#9a675a');
 if(p.id%3===2){R(ctx,x-7,hy-12,15,3,2,p.hair);E(ctx,x+8,hy-9,3,4,p.hair)}
}
function ambient(ctx,a){const {iso,officeW,officeH,time,project}=a,t=time/1000,w=officeW(),h=officeH();
 // A restrained ambient glass highlight and time-dependent monitor flicker.
 const q=I(iso,w-1.65,.65,98);E(ctx,q.x,q.y-10,5+Math.sin(t*2)*.6,4,'#96fad02e');
 // Soft ceiling-suspended light spot near the collaborative meeting area.
 let p=I(iso,5.55,2.2,0);E(ctx,p.x,p.y,64,25,'#fff7cc0b');
 if(project&&!project.ready){const wv=I(iso,3.54,2.48,127),val=Math.round(100*project.progress/project.weeks);R(ctx,wv.x-37,wv.y-14,75,24,7,'#15384ecf');R(ctx,wv.x-34,wv.y+5,69,2,2,'#62c8b6');ctx.font='700 10px system-ui';ctx.fillStyle='#e4fff6';ctx.textAlign='center';ctx.fillText('BUILD '+val+'%',wv.x,wv.y+1)}
}
window.StudioArt={wall,floor,props,character,ambient};
})();