/*
 * THE UNSEEN IV · CONSTELLATION ENGINE
 * A separate 2D optical depth layer over WebGL, combining:
 * - reciprocal expanding and contracting optic-flow layers (vection-inspired)
 * - flocking-like orbital ribbons and magnetic point clouds
 * - independent two-world colors; changes in geometric trajectory, not luminosity flicker
 * - breath-paced field expansion and a carefully staged dramatic arc
 *
 * This is original generative art, not a validated method of altering consciousness.
 */
(()=>{
"use strict";
const root=window.UNSEEN_RUNTIME;
if(!root)return;
const canvas=document.createElement("canvas");
canvas.id="volumeIVConstellation";
canvas.setAttribute("aria-hidden","true");
Object.assign(canvas.style,{position:"fixed",inset:"0",width:"100%",height:"100%",zIndex:"3",pointerEvents:"none",mixBlendMode:"screen",opacity:".92"});
document.body.appendChild(canvas);
const ctx=canvas.getContext("2d",{alpha:true});
if(!ctx)return;
const mobile=matchMedia("(max-width:720px)").matches,reducedPref=matchMedia("(prefers-reduced-motion:reduce)").matches;
const count=mobile?130:290,stars=[];
let last=0,elapsed=0,lastW=0,lastH=0,seed=13797,shuffled=false;
function rand(){seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296}
for(let i=0;i<count;i++)stars.push({angle:rand()*Math.PI*2,rad:Math.sqrt(rand())*.96,z:.1+rand()*.9,tw:rand()*6.283,size:.4+rand()*1.1,side:i%2?1:-1});
function resize(){
 const dpr=Math.min(devicePixelRatio||1,mobile?1.05:1.35),w=Math.max(2,Math.round(innerWidth*dpr)),h=Math.max(2,Math.round(innerHeight*dpr));
 if(canvas.width!==w||canvas.height!==h){canvas.width=w;canvas.height=h;}
 lastW=w;lastH=h;
}
function rgba(c,a){return "rgba("+c[0]+","+c[1]+","+c[2]+","+Math.max(0,Math.min(1,a)).toFixed(3)+")"}
const inkA=[49,221,241],inkB=[186,132,250],inkC=[255,205,183];
function draw(now){
 requestAnimationFrame(draw);
 if(now-last<32)return;
 const dt=Math.min(.06,Math.max(0,(now-last)/1000));last=now;
 const current=window.UNSEEN_IMMERSION;
 const active=!!current?.running;
 if(!active){ctx.clearRect(0,0,canvas.width,canvas.height);return;}
 if(canvas.width!==lastW||canvas.height!==lastH)resize();
 const s=root.state;
 const w=canvas.width,h=canvas.height,scale=Math.min(w,h);
 const cx=w*.5,cy=h*.5;
 const phase=current.elapsed/340;
 const stage=Math.min(7,Math.floor(current.elapsed/42.5));
 const breath=s.breath||.5;
 const reduced=reducedPref||s.reduced;
 const speed=reduced?.12:1;
 elapsed+=(s.paused?0:dt)*speed;
 ctx.clearRect(0,0,w,h);
 ctx.globalCompositeOperation="lighter";
 // Two spatial flow populations have competing directional interpretations.
 const primary=stage===6?1:-1,alt=stage===3?-1:1;
 const travel=(.004+.014*Math.sin(phase*Math.PI)*Math.sin(phase*Math.PI)) * speed;
 const t=elapsed,interplay=(s.breath-.5)*.22;
 const baseRadius=scale*(stage===7?.57:.50);
 const orbit=stage===5?.37:stage===4?.23:.12;
 const drift=stage===6?.28:.11;
 const focalX=cx+Math.sin(elapsed*.047)*w*.033,focalY=cy+Math.cos(elapsed*.056)*h*.034;
 for(let i=0;i<count;i++){
  const o=stars[i];const side=o.side;
  if(!s.paused&&!reduced){
   o.z+=travel*(side>0?primary:alt)*(.48+.7*o.z);
   if(o.z>1.04)o.z=.06;
   if(o.z<.045)o.z=1.02;
   o.angle+=side*dt*(.025+orbit)*(1+.3*Math.sin(i));
  }
  const r=baseRadius*(.035+Math.pow(o.z,1.62))*(1+.14*interplay);
  const a=o.angle+t*(side>0?.028:-.021);
  const curve=Math.sin(a*3.+t*.064)*drift*.11;
  const x=focalX+Math.cos(a+curve)*r*.95,y=focalY+Math.sin(a-curve)*r*.80;
  const px=focalX+Math.cos(a-.01*side)*r*.92,py=focalY+Math.sin(a-.01*side)*r*.77;
  const alpha=(.036+.17*o.z)*Math.min(1,scale/660)*(.6+.4*Math.sin(t*.17+o.tw));
  const color=stage===7?inkC:side>0?inkA:inkB;
  ctx.strokeStyle=rgba(color,alpha);
  ctx.lineWidth=Math.max(.4,o.size*o.z*(mobile?.7:1));
  ctx.beginPath();ctx.moveTo(px,py);ctx.lineTo(x,y);ctx.stroke();
  // A minority of stars leave long persistence-like curved trails.
  if(i%17===0){
   const span=stage===6?.08:.045;
   ctx.strokeStyle=rgba(color,alpha*.7);
   ctx.lineWidth=.5;
   ctx.beginPath();
   ctx.arc(focalX,focalY,Math.max(3,r*.84),a-span,a+span,false);
   ctx.stroke();
  }
 }
 // Gently refractive low-amplitude arcs arranged at irrational angles.
 if(!reduced){
  for(let k=0;k<6;k++){
   const f=k/6,angle=f*2.3999632+t*(.012+.002*k);
   const radius=scale*(.11+.047*k)*(.94+.06*breath);
   const col=k%2?inkB:inkA;
   ctx.strokeStyle=rgba(col,.04*(1-f*.45));
   ctx.lineWidth=.6;
   ctx.beginPath();
   ctx.ellipse(focalX,focalY,radius,radius*(.22+.24*f),angle,0,Math.PI*2);
   ctx.stroke();
  }
 }
 ctx.globalCompositeOperation="source-over";
 if(!shuffled&&current.elapsed>8)shuffled=true;
}
resize();addEventListener("resize",resize,{passive:true});
requestAnimationFrame(draw);
window.UNSEEN_CONSTELLATION={count,get enabled(){return !!window.UNSEEN_IMMERSION?.running}};
})();
