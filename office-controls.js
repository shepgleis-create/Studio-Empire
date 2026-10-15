/* Non-simulation presentation controls. Only touches the live office view. */
(()=>{'use strict';
 const stage=document.getElementById('game-stage'),btn=document.getElementById('immersive-office'),meter=document.getElementById('zoom-meter');
 if(!stage||!btn)return;
 let immersive=false;
 const fit=()=>{document.getElementById('reset-camera')?.click(); if(meter){meter.textContent='FIT OFFICE';meter.setAttribute('aria-live','polite');}};
 btn.addEventListener('click',async()=>{
  immersive=!immersive;document.body.classList.toggle('office-immersive',immersive);btn.textContent=immersive?'⤢':'⛶';btn.title=immersive?'Exit immersive office':'Immersive office view';
  // Fullscreen is optional: iOS Safari does not support fullscreen on arbitrary page elements.
  if(immersive&&stage.requestFullscreen){try{await stage.requestFullscreen()}catch(_){}}
  else if(!immersive&&document.fullscreenElement){try{await document.exitFullscreen()}catch(_){}}
  requestAnimationFrame(()=>setTimeout(fit,90));
 });
 document.addEventListener('fullscreenchange',()=>{if(!document.fullscreenElement&&immersive){immersive=false;document.body.classList.remove('office-immersive');btn.textContent='⛶';setTimeout(fit,80)}});
 window.addEventListener('orientationchange',()=>setTimeout(fit,320));
 // Preserve finger panning on the canvas while preventing Safari gesture scroll.
 stage.addEventListener('touchmove',e=>{if(e.target.id==='scene')e.preventDefault()},{passive:false});
 window.addEventListener('keydown',e=>{if(e.key==='Escape'&&immersive)btn.click();if(e.key==='0'&&document.activeElement?.tagName!=='INPUT')fit()});
 window.OfficeControls={fit,immersive:()=>immersive};
})();