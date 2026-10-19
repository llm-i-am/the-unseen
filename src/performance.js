/* THE UNSEEN IV / ENTRY PERFORMANCE GOVERNOR.
 * Prevent full-resolution GPU rendering behind the translucent title screen.
 * Progressive re-resolution after the actual entry click keeps controls responsive.
 * The original adaptive renderer manages sustained quality after activation.
 */
(()=>{
"use strict";
const cn=document.getElementById("stage"),rt=window.UNSEEN_RUNTIME;
if(!cn||!rt)return;
let active=false,restoreTimer=null;
const pick=()=>({w:Math.max(160,Math.round(innerWidth*.32)),h:Math.max(220,Math.round(innerHeight*.32))});
function lowerPreview(){
 if(active||document.body.classList.contains("experience-live"))return;
 const target=pick();
 if(cn.width>target.w*1.18||cn.height>target.h*1.18){
  cn.width=target.w;cn.height=target.h;
  const gl=cn.getContext("webgl2");if(gl)gl.viewport(0,0,target.w,target.h);
 }
}
lowerPreview();
const timer=setInterval(()=>{if(!active)lowerPreview()},850);
function wake(){
 if(active)return;
 active=true;clearInterval(timer);
 // Delay the expensive realloc by a moment so the tap and sound unlock complete.
 restoreTimer=setTimeout(()=>rt.resize(),750);
}
document.getElementById("imBegin")?.addEventListener("click",wake);
document.getElementById("imSilent")?.addEventListener("click",wake);
document.getElementById("imExit")?.addEventListener("click",()=>{
 active=false;
 clearTimeout(restoreTimer);
 lowerPreview();
});
})();
