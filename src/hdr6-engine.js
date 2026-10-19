/* THE UNSEEN VOL VI — SAFARI-NATIVE WEBGPU/EDR RENDERER
 * Primary renderer on Safari 26+, 16-bit float + Display P3 + toneMapping.extended.
 * The legacy WebGL renderer remains available if WebGPU/HDR is unsupported.
 * WebGPU standard clipping is not silently labeled "HDR".
 */
(()=>{
"use strict";
const rt=window.UNSEEN_RUNTIME,source=window.UNSEEN_HDR6_WGSL;
if(!rt||!source)return;
const r=rt.state,sourceCanvas=document.getElementById("stage");
const canvas=document.createElement("canvas");
canvas.id="hdr6";canvas.setAttribute("aria-hidden","true");
canvas.style.cssText="position:fixed;inset:0;display:none;width:100%;height:100%;z-index:2;pointer-events:none;dynamic-range-limit:no-limit;color-scheme:dark";
document.body.appendChild(canvas);
const status={ready:false,hdr:false,canvas,mode:"fallback-webgl",size:[0,0],frames:0,fps:0,errors:[],deviceLost:false};
window.UNSEEN_HDR6=status;
let device=null,context=null,pipeline=null,uniform=null,bind=null,adapter=null;
let active=true,quality=(innerWidth<700?.82:.82),minQ=.58,maxQ=innerWidth<700?1:1.12,frameCount=0,framesSince=0,last=performance.now(),simTime=0,lastReconfigure=0;
let rms=0,readySet=false;
function fail(message){
 status.errors.push(String(message).slice(0,600));status.mode="fallback-webgl";status.ready=false;status.hdr=false;status.deviceLost=true;
 canvas.style.display="none";sourceCanvas.style.opacity="1";r.hdrPrimary=false;
 console.warn("[HDR VI] WebGPU fallback:",message);
}
function measure(){
 const dpr=Math.min(devicePixelRatio||1,1.55);
 const w=Math.max(2,Math.round(innerWidth*dpr*quality));
 const h=Math.max(2,Math.round(innerHeight*dpr*quality));
 if(canvas.width!==w||canvas.height!==h){
  canvas.width=w;canvas.height=h;status.size=[w,h];
  if(context&&device)configure();lastReconfigure=performance.now();
 }
}
function configure(){
 if(!context||!device)return;
 context.configure({
  device,format:"rgba16float",colorSpace:"display-p3",alphaMode:"opaque",
  toneMapping:{mode:"extended"},usage:GPUTextureUsage.RENDER_ATTACHMENT
 });
 const config=context.getConfiguration?.();
 const hasExtended=config?.toneMapping?.mode==="extended";
 status.hdr=!!hasExtended&&!!matchMedia?.("(dynamic-range: high)")?.matches;
 status.mode=hasExtended?"webgpu-extended-p3":"webgpu-p3-sdr";
 // Extended tone mapping is a capability. Display headroom still varies with brightness.
}
async function initialize(){
 if(!navigator.gpu||!window.isSecureContext){status.mode="webgl-fallback";return}
 // An SDR display cannot benefit from an EDR canvas; preserve responsive WebGL there.
 if(!matchMedia("(dynamic-range: high)").matches){status.mode="webgl-sdr-display";return}
 try{
  adapter=await navigator.gpu.requestAdapter({powerPreference:"high-performance"});
  if(!adapter){status.mode="webgl-fallback";return}
  device=await adapter.requestDevice();
  context=canvas.getContext("webgpu");
  if(!context){fail("WebGPU canvas context unavailable");return}
  measure();
  configure();
  const module=device.createShaderModule({code:source,label:"Unseen VI scene-linear HDR optical engine"});
  if(module.getCompilationInfo){
   const info=await module.getCompilationInfo();
   const err=info.messages.filter(m=>m.type==="error");
   if(err.length)throw new Error("WGSL compilation: "+err.map(x=>x.message).join("; "));
  }
  const layout=device.createBindGroupLayout({entries:[{binding:0,visibility:GPUShaderStage.FRAGMENT,buffer:{type:"uniform",minBindingSize:64}}]});
  pipeline=device.createRenderPipeline({
   label:"Unseen VI P3 EDR pipeline",layout:device.createPipelineLayout({bindGroupLayouts:[layout]}),
   vertex:{module,entryPoint:"vs"},
   fragment:{module,entryPoint:"fs",targets:[{format:"rgba16float"}]},
   primitive:{topology:"triangle-list"}
  });
  uniform=device.createBuffer({label:"Unseen VI uniforms",size:64,usage:GPUBufferUsage.UNIFORM|GPUBufferUsage.COPY_DST});
  bind=device.createBindGroup({layout,entries:[{binding:0,resource:{buffer:uniform,size:64}}]});
  device.lost.then(info=>{fail("GPU device lost: "+info.reason);});
  status.ready=true;status.deviceLost=false;
  r.hdrPrimary=true;
  document.documentElement.style.setProperty("dynamic-range-limit","no-limit");
  document.body.style.setProperty("dynamic-range-limit","no-limit");
  sourceCanvas.style.opacity="0";
  canvas.style.display="block";
  readySet=true;
 }catch(e){fail(e.message||String(e));}
}
function paint(now){
 requestAnimationFrame(paint);
 if(!status.ready||!device||!pipeline||!active||document.hidden)return;
 const dt=Math.min(.075,Math.max(0,(now-last)/1000));last=now;
 const im=window.UNSEEN_IMMERSION,run=!!im?.running&&!im?.paused;
 const inGate=!run;
 const chapter=Math.max(0,im?.mode||0);
 // Gate preview deliberately cheap; ramp scene detail immediately after entry.
 const motion=r.reduced?.025:1;
 const velocity=Math.min(5.7,Math.max(.6,r.speed||1));
 if(run)simTime+=dt*velocity*motion;
 else if(!r.reduced)simTime+=dt*.34;
 const bands=rt.audio.getSpectrum?.()||[0,0,0,0];
 const impact=rt.audio.riot?.impact||0;
 const progress=Math.max(0,Math.min(1,((im?.elapsed||0)%180)/180));
 const complexity=r.reduced?.55:1.1;
 const w=canvas.width,h=canvas.height;
 const values=new Float32Array([
  w,h,simTime,progress,
  chapter,((im?.elapsed||0)%12)/12,impact,complexity,
  bands[0]||0,bands[1]||0,bands[2]||0,bands[3]||0,
  .5,.5,r.energy??1,r.reduced?1:0
 ]);
 try{
  device.queue.writeBuffer(uniform,0,values);
  const encoder=device.createCommandEncoder();
  const pass=encoder.beginRenderPass({colorAttachments:[{view:context.getCurrentTexture().createView(),clearValue:{r:0,g:0,b:0,a:1},loadOp:"clear",storeOp:"store"}]});
  pass.setPipeline(pipeline);pass.setBindGroup(0,bind);pass.draw(3);pass.end();
  device.queue.submit([encoder.finish()]);
  status.frames++;frameCount++;framesSince+=dt;
  if(framesSince>1.8){
   status.fps=Math.round(frameCount/framesSince);
   if(run){
    if(status.fps<35&&quality>minQ)quality=Math.max(minQ,quality-.07);
    else if(status.fps>54&&quality<maxQ)quality=Math.min(maxQ,quality+.025);
    measure();
   }
   frameCount=0;framesSince=0;
  }
 }catch(e){fail(e.message||String(e));}
}
const resize=()=>{if(status.ready)measure();};
addEventListener("resize",resize,{passive:true});
document.addEventListener("visibilitychange",()=>{last=performance.now()});
initialize();
requestAnimationFrame(paint);
})();
