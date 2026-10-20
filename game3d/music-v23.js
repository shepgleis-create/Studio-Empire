/* v0.23 original opt-in synthesized background music; iOS gesture required. */
(function(g){'use strict';
let context,gain,loop,next=0,step=0,active=false;const KEY='studio-empire-music-v23';
const controls=document.querySelector('#se21-timebar .se21-speed-controls');if(!controls)return;
const button=document.createElement('button');button.id='se23-music';button.type='button';button.textContent='♫ Off';button.setAttribute('aria-pressed','false');button.title='Tap to start original synthesized background music';controls.append(button);
const melody=[57,60,64,67,64,60,59,55,57,62,64,69,67,64,60,55],bass=[45,45,41,41,43,43,40,40];
function note(midi,t,duration,kind='sine',amp=.08){if(!context||!gain)return;
const o=context.createOscillator(),a=context.createGain();o.type=kind;o.frequency.setValueAtTime(440*Math.pow(2,(midi-69)/12),t);a.gain.setValueAtTime(.0001,t);a.gain.exponentialRampToValueAtTime(amp,t+.02);a.gain.exponentialRampToValueAtTime(.0001,t+duration);o.connect(a);a.connect(gain);o.start(t);o.stop(t+duration+.04);}
function schedule(){if(!active||!context||document.hidden)return;while(next<context.currentTime+.34){const i=step++;note(melody[i%16],next,i%4===0?.27:.16,i%4===0?'triangle':'sine',.06);if(i%4===0)note(bass[Math.floor(i/4)%8],next,.92,'sine',.1);next+=.28;}}
function paint(){button.textContent=active?'♫ On':'♫ Off';button.classList.toggle('is-on',active);button.setAttribute('aria-pressed',String(active));button.setAttribute('aria-label',active?'Turn music off':'Turn music on');}
async function start(){const Audio=g.AudioContext||g.webkitAudioContext;if(!Audio){button.title='Web Audio is not supported';return false;}try{if(!context){context=new Audio();gain=context.createGain();gain.gain.value=.16;gain.connect(context.destination);}await context.resume();active=true;next=context.currentTime+.06;step=0;schedule();clearInterval(loop);loop=setInterval(schedule,120);paint();return true;}catch(_){active=false;paint();return false;}}
function stop(){active=false;clearInterval(loop);loop=null;if(context?.state==='running')context.suspend().catch(()=>{});paint();}
button.addEventListener('click',()=>active?stop():start());document.addEventListener('visibilitychange',()=>{if(document.hidden)stop()});g.addEventListener('pagehide',stop);
g.StudioEmpireMusic23={start,stop,get active(){return active}};paint();
})(typeof window!=='undefined'?window:globalThis);