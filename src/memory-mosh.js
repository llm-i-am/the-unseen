/* VOLUME V / MEMORY-MOSH — original frame-history collage.
 * Inspired by interframe feedback art, not borrowed third-party code.
 * Draws small displaced regions of previous frames over continuous geometry.
 * Small-area local shearing; NO repetitive full-screen luminance flashes.
 */
(()=>{
"use strict";
const rt=window.UNSEEN_RUNTIME,stage=document.getElementById("stage");
if(!rt||!stage)return;
const layer=document.createElement("canvas");layer.id="rxMemoryMosh";
layer.setAttribute("aria-hidden","true");
Object.assign(layer.style,{position:"fixed",inset:"0",width:"100%",height:"100%",zIndex:"4",pointerEvents:"none",mixBlendMode:"screen",opacity:".55"});
document.body.appendChild(layer);
const ctx=layer.getContext("2d",{alpha:true}),mem=document.createElement("canvas"),back=mem.getContext("2d",{alpha:true});
if(!ctx||!back)return;
let w=0,h=0,last=0,seed=4884,shots=0;
const rand=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296};
function resize(){
 const f=Math.min(devicePixelRatio||1,1.0)*.56;
 const width=Math.max(120,Math.floor(innerWidth*f)),height=Math.max(160,Math.floor(innerHeight*f));
 if(width!==w||height!==h){w=width;h=height;layer.width=mem.width=w;layer.height=mem.height=h;}
}
function draw(now){
 requestAnimationFrame(draw);
 if(now-last<70)return;last=now;
 const live=!!window.UNSEEN_IMMERSION?.running;
 if(!live||rt.state.reduced){ctx.clearRect(0,0,w,h);back.clearRect(0,0,w,h);return;}
 if(Math.abs(w-innerWidth*.56)>w*.18||Math.abs(h-innerHeight*.56)>h*.18)resize();
 const current=window.UNSEEN_IMMERSION.mode||0;
 // Slowly decay the delayed image rather than flickering it on/off.
 back.globalCompositeOperation="source-over";
 back.fillStyle="rgba(0,0,0,.24)";
 back.fillRect(0,0,w,h);
 try{
   back.globalAlpha=.10;
   back.drawImage(layer,(rand()-.5)*4,(rand()-.5)*4,w,h);
   back.globalAlpha=.30;
   for(let i=0;i<3;i++){
     const y=rand()*h,rw=w*(.16+rand()*.24),rh=h*(.006+rand()*.014);
     const sx=rand()*Math.max(1,w-rw),sy=rand()*Math.max(1,h-rh);
     const activeSource=window.UNSEEN_HDR6?.ready?window.UNSEEN_HDR6.canvas:stage;
     back.drawImage(activeSource,sx/w*activeSource.width,sy/h*activeSource.height,rw/w*activeSource.width,rh/h*activeSource.height,
       sx+(rand()-.5)*w*.11,y,rw,rh*1.5);
   }
   back.globalAlpha=1;
 }catch(e){/* browsers may decline compositing GPU contexts: keep baseline */}
 ctx.clearRect(0,0,w,h);
 ctx.globalCompositeOperation="screen";
 ctx.globalAlpha=current%3===0?.56:.37;
 ctx.drawImage(mem,0,0,w,h);
 ctx.globalAlpha=1;ctx.globalCompositeOperation="source-over";
 shots++;
}
resize();addEventListener("resize",resize,{passive:true});requestAnimationFrame(draw);
window.UNSEEN_MOSH={get ready(){return w>0},get frames(){return shots}};
})();
