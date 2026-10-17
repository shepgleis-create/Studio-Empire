/* Studio Empire v0.21: actual Babylon daylight lighting, no static renders. */
(function(){'use strict';
const g=window.StudioEmpire3D,B=window.BABYLON;if(!g||!B)return;
const sc=g.scene,color=s=>B.Color3.FromHexString(s);
sc.clearColor=B.Color4.FromHexString('#b7d5e1ff');
sc.ambientColor=color('#707d83');
sc.imageProcessingConfiguration.contrast=1.09;
sc.imageProcessingConfiguration.exposure=1.07;
for(const light of sc.lights)light.intensity=Math.min(2.2,(Number(light.intensity)||1)*1.18);
const sky=new B.HemisphericLight('studio21 ambient daylight',new B.Vector3(-.5,1,.65),sc);
sky.intensity=.26;sky.diffuse=color('#fff0d8');sky.groundColor=color('#668598');
window.StudioEmpireLighting21={debug(){return{scene:'real Babylon meshes',lightCount:sc.lights.length,daylight:true}}};
})();