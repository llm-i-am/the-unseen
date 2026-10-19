/* THE UNSEEN / ORCHESTRATOR
   Paper-inspired, explicitly synthetic two-patch switching, cross-validation-inspired decoding,
   independent on/off gain, continuous GPU imagery and WebAudio.
   Not human brain measurement; not a stimulus entrainment protocol. */
(() => {"use strict";
 const $=id=>document.getElementById(id),clamp=(x,a,b)=>Math.min(b,Math.max(a,x));
 const cn=$("stage"),hdr=$("hdr"),strip=$("raster"),paint=strip.getContext("2d");
 const mobile=matchMedia("(max-width:780px)").matches;
 const motionPref=matchMedia("(prefers-reduced-motion: reduce)");
 const s={mode:0,density:1,depth:1,flux:1,energy:1,dwell:64,coupling:.18,space:.88,volume:.42,breath:.5,paused:false,reduced:motionPref.matches,palette:0,hdr:false,decode:false,anaglyph:false};
 let gl=null,prg=null,u={},ctx2d=null,device=null,gpuctx=null,gpupipe=null,gpubind=null,gpubuf=null,gpuReady=false,backend="INITIALIZING";
 const audio=new UnseenAudio();audio.volume=s.volume;
 let time=0,last=performance.now(),tick=0,frames=0,acc=0,fps=60,quality=mobile?.68:.86,clip=1,tourTimer=0,tourOn=false;
 let pointer=[.5,.5],pointerGoal=[.5,.5],touchPoint=[0,0],lastTouch=-100,beat=0,lastShot=-100;
 const patches=[{state:0,next:0,smoothed:0},{state:1,next:0,smoothed:0}];
 const cellRates=Array.from({length:128},(_,i)=>({A:4.5+12*Math.pow(.5+.5*Math.sin(i*.717+i*i*.0007),2),B:4.5+12*Math.pow(.5+.5*Math.cos(i*.529+i*i*.0008),2)}));
 const hist=[0,0],shots=[];
 const scenes=[
  ["ACT 01 — THE APERTURE","The threshold<br><i>is not a wall.</i>","Hold still. A second universe is already here."],
  ["ACT 02 — RIVALRY","Two truths.<br><i>One witness.</i>","Watch incompatible representations occupy the same space."],
  ["ACT 03 — MULTIPLEX","Infinity<br><i>in the interval.</i>","Every luminous filament is a different possible world."],
  ["ACT 04 — GHOST","Nothing<br><i>really vanishes.</i>","An afterimage of what never reached awareness."],
  ["ACT 05 — CATHEDRAL","The architecture<br><i>of thought.</i>","Move through a geometry too large to contain."],
  ["ACT 06 — FOLD","Reality<br><i>folds inward.</i>","A self-similar map with no edges, no destination."],
  ["ACT 07 — NEURAL SEA","A trillion<br><i>quiet signals.</i>","Listen to a world that exists beneath the world."],
  ["ACT 08 — EVENT HORIZON","Beyond<br><i>the observer.</i>","Light collects at the boundary of what can be known."]
 ];
 function toast(message){if(document.body.classList.contains("experience-live"))return;const t=$("toast");t.textContent=message;t.classList.add("on");clearTimeout(toast.id);toast.id=setTimeout(()=>t.classList.remove("on"),2400)}
 const setText=(id,value)=>$(id).textContent=value;
 function setMode(i){
  s.mode=(i+8)%8;
  document.querySelectorAll(".mode").forEach(b=>b.classList.toggle("selected",+b.dataset.mode===s.mode));
  let v=scenes[s.mode];setText("chapter",v[0]);$("sceneTitle").innerHTML=v[1];setText("sceneDescription",v[2]);
  $("titlebox").classList.remove("hide");clearTimeout(setMode.id);
  setMode.id=setTimeout(()=>$("titlebox").classList.add("hide"),4800);
  audio.retune(s.mode);
 }
 function resize(){
  let dpr=Math.min(devicePixelRatio||1,mobile?1.25:1.75),w=Math.max(2,Math.floor(innerWidth*dpr*quality)),h=Math.max(2,Math.floor(innerHeight*dpr*quality));
  if(cn.width!==w||cn.height!==h){cn.width=w;cn.height=h;if(gl)gl.viewport(0,0,w,h)}
  if(gpuReady){const x=Math.max(2,Math.floor(innerWidth*Math.min(1.35,dpr)*quality)),y=Math.max(2,Math.floor(innerHeight*Math.min(1.35,dpr)*quality));
   if(hdr.width!==x||hdr.height!==y){hdr.width=x;hdr.height=y;configureHDR()}}
 }
 function shader(type,src){let z=gl.createShader(type);gl.shaderSource(z,src);gl.compileShader(z);if(!gl.getShaderParameter(z,gl.COMPILE_STATUS))throw Error(gl.getShaderInfoLog(z));return z}
 function initGL(){
  try{
   gl=cn.getContext("webgl2",{alpha:false,antialias:false,powerPreference:"high-performance"});
   if(!gl)throw Error("No WebGL2");
   if("drawingBufferColorSpace" in gl)try{gl.drawingBufferColorSpace="display-p3"}catch{}
   let v=shader(gl.VERTEX_SHADER,UNSEEN_SHADERS.vertex),f=shader(gl.FRAGMENT_SHADER,UNSEEN_SHADERS.fragment);
   prg=gl.createProgram();gl.attachShader(prg,v);gl.attachShader(prg,f);gl.linkProgram(prg);gl.deleteShader(v);gl.deleteShader(f);
   if(!gl.getProgramParameter(prg,gl.LINK_STATUS))throw Error(gl.getProgramInfoLog(prg));
   for(let n of ["Resolution","Pointer","TouchPoint","Time","Mode","Energy","Density","Depth","Flux","StateA","StateB","OnOff","Band","Beat","TouchAge","Palette","Speed","Anaglyph","Breath"])u[n]=gl.getUniformLocation(prg,"u"+n);
   const vao=gl.createVertexArray();gl.bindVertexArray(vao);
   backend=gl.drawingBufferColorSpace==="display-p3"?"WEBGL2 · DISPLAY P3":"WEBGL2 · SDR";setText("backend",backend);
  }catch(e){console.warn("WebGL2 fallback:",e);try{ctx2d=cn.getContext("2d",{alpha:false})}catch{};backend="CANVAS2D · FALLBACK";setText("backend",backend);}
  resize();
 }
 function configureHDR(){
  if(!gpuctx||!device)return false;
  try{gpuctx.configure({device,format:"rgba16float",alphaMode:"premultiplied",colorSpace:"display-p3",toneMapping:{mode:"extended"}});
   return gpuctx.getConfiguration()?.toneMapping?.mode==="extended"}
  catch(e){console.info("HDR unavailable:",e);return false}
 }
 async function initHDR(){
  if(!navigator.gpu)return false;
  try{
   const adapter=await navigator.gpu.requestAdapter({powerPreference:"high-performance"});if(!adapter)return false;
   device=await adapter.requestDevice();gpuctx=hdr.getContext("webgpu");if(!gpuctx)return false;
   // Canvas size is set before the initial configure.
   hdr.width=Math.max(2,Math.floor(innerWidth*quality));hdr.height=Math.max(2,Math.floor(innerHeight*quality));
   if(!configureHDR())return false;
   const module=device.createShaderModule({code:UNSEEN_SHADERS.hdr});
   if(module.getCompilationInfo){let info=await module.getCompilationInfo();if(info.messages.some(x=>x.type==="error"))throw Error(info.messages.map(x=>x.message).join("; "))}
   const layout=device.createBindGroupLayout({entries:[{binding:0,visibility:GPUShaderStage.FRAGMENT,buffer:{type:"uniform"}}]});
   gpupipe=device.createRenderPipeline({layout:device.createPipelineLayout({bindGroupLayouts:[layout]}),vertex:{module,entryPoint:"vs"},fragment:{module,entryPoint:"fs",targets:[{format:"rgba16float",blend:{color:{srcFactor:"src-alpha",dstFactor:"one",operation:"add"},alpha:{srcFactor:"one",dstFactor:"one-minus-src-alpha",operation:"add"}}}]},primitive:{topology:"triangle-list"}});
   gpubuf=device.createBuffer({size:32,usage:GPUBufferUsage.UNIFORM|GPUBufferUsage.COPY_DST});
   gpubind=device.createBindGroup({layout,entries:[{binding:0,resource:{buffer:gpubuf}}]});gpuReady=true;resize();return true;
  }catch(e){console.warn("HDR setup failed:",e);return false}
 }
 function renderHDR(){
  if(!gpuReady||!s.hdr||s.reduced||!device)return;
  try{
   device.queue.writeBuffer(gpubuf,0,new Float32Array([hdr.width,hdr.height,time,s.mode,s.energy,patches[0].smoothed,pointer[0],pointer[1]]));
   let cmd=device.createCommandEncoder();let pass=cmd.beginRenderPass({colorAttachments:[{view:gpuctx.getCurrentTexture().createView(),loadOp:"clear",storeOp:"store",clearValue:{r:0,g:0,b:0,a:0}}]});
   pass.setPipeline(gpupipe);pass.setBindGroup(0,gpubind);pass.draw(3);pass.end();device.queue.submit([cmd.finish()]);
  }catch(e){console.warn(e);s.hdr=false;hdr.style.display="none";setToggle("hdrBtn",false)}
 }
 function nextDwell(){const u=Math.max(.00001,Math.random());return clamp(-Math.log(u)*(s.dwell/Math.log(2))/1000,.018,.55)}
 function cortical(dt){
  if(!s.paused&&!s.reduced){
   for(let i=0;i<2;i++){
    let p=patches[i],count=0;
    while(time>=p.next&&count++<5){
     p.state^=1;p.next=time+nextDwell();
     if(i===0&&Math.random()<s.coupling){patches[1].state=p.state;patches[1].next=time+nextDwell();}
    }
   }
  }
  for(let p of patches)p.smoothed+=(p.state*2-1-p.smoothed)*Math.min(1,dt*(s.reduced?.18:2.4));
  return .5+.5*Math.sin(time*.38);
 }
 function drawRaster(dt){
  if(!s.decode)return;
  const w=strip.width,h=strip.height,px=Math.max(1,Math.ceil(dt*45));
  paint.drawImage(strip,px,0,w-px,h,0,0,w-px,h);
  paint.fillStyle="rgba(3,9,23,.82)";paint.fillRect(w-px,0,px,h);
  const p0=patches[0].state,p1=patches[1].state;
  let popA=0,popB=0,heldA=0,heldB=0;
  for(let i=0;i<128;i++){
   let rate=(i<64?(p0===0?cellRates[i].A*1.21:cellRates[i].B):(p1===0?cellRates[i].A*1.21:cellRates[i].B));
   rate*=.8+.15*Math.sin(time*.43+i*.2);
   const spike=Math.random()<rate*dt;
   if(spike){paint.fillStyle=i<64?"rgba(126,237,236,.82)":"rgba(198,142,255,.9)";paint.fillRect(w-px,Math.round(i/128*h),px,1.6);}
   if(i<64){popA+=spike?1:0;}else{popB+=spike?1:0;}
   if(i>=32&&i<64){heldA+=(spike?1:0)*(cellRates[i].A-cellRates[i].B);}
   if(i>=96){heldB+=(spike?1:0)*(cellRates[i].A-cellRates[i].B);}
  }
  // Split synthetic neurons into inference and heldout readout pools for illustration.
  hist[0]=hist[0]*.92+(p0===0?1:0)*.08;hist[1]=hist[1]*.92+(p1===0?1:0)*.08;
  $("barA").style.width=(Math.round(hist[0]*100))+"%";
  $("barB").style.width=(Math.round((1-hist[1])*100))+"%";
  if(++tick%17===0){setText("stateMetric",p0===0?"A / VISIBLE":"B / HIDDEN");setText("dwellMetric",s.dwell+" ms");setText("decode","HELD-OUT READOUT · "+(heldA+heldB>0?"A":"B")+" (SIM.)");}
 }
 function draw2D(){
  if(!ctx2d)return;const w=cn.width,h=cn.height,cx=w*(.5+(pointer[0]-.5)*.12),cy=h*(.5+(pointer[1]-.5)*.12),size=Math.min(w,h),t=s.reduced?0:time;
  const g=ctx2d.createRadialGradient(cx,cy,4,cx,cy,size*.79);
  g.addColorStop(0,s.palette===2?"#412013":"#102340");g.addColorStop(.45,s.palette===1?"#071d2c":"#090c25");g.addColorStop(1,"#02040b");
  ctx2d.fillStyle=g;ctx2d.fillRect(0,0,w,h);ctx2d.save();ctx2d.translate(cx,cy);ctx2d.globalCompositeOperation="screen";
  const mode=s.mode;for(let i=0;i<140;i++){
   let f=i/140,ang=f*Math.PI*14+t*(.07+mode*.008),r=size*(.04+f*.55),rad=r*(1+.17*Math.sin(f*28+t*.22+mode));
   let x=Math.cos(ang)*rad,y=Math.sin(ang)*rad;
   let hue=(190+i*1.35+mode*37+s.palette*60)%360;
   ctx2d.strokeStyle="hsla("+hue+",95%,70%,"+(.06+.24*(1-f))+")";
   ctx2d.lineWidth=.7+(1-f)*1.5;
   ctx2d.beginPath();ctx2d.ellipse(0,0,rad*.96,rad*(.33+.55*Math.sin(mode*.3+f*2)),ang*.3,0,Math.PI*2);ctx2d.stroke();
   ctx2d.fillStyle="hsla("+hue+",90%,74%,"+(.18*(1-f))+")";
   ctx2d.fillRect(x,y,2,2);
  }
  ctx2d.restore();
 }
 function render(now){
  requestAnimationFrame(render);
  const dt=clamp((now-last)/1000,0,.05);last=now;frames++;acc+=dt;
  if(acc>=1.4){fps=frames/acc;setText("fps",Math.round(fps)+" FPS");
   if(gl&&fps<33&&quality>.42){quality=Math.max(.42,quality-.07);resize()}
   else if(gl&&fps>56&&quality<(mobile?.82:1.0)){quality=Math.min(mobile?.82:1,quality+.022);resize()}
   frames=0;acc=0;}
  pointer[0]+=(pointerGoal[0]-pointer[0])*.055;pointer[1]+=(pointerGoal[1]-pointer[1])*.055;
  if(!s.paused&&!s.reduced)time+=dt;
  const onOff=cortical(dt);
  beat=audio.update(time,s.mode,patches[0].smoothed,patches[1].smoothed,s.flux,s.space,pointer[0])||beat*.99;
  if(gl&&prg&&!s.hdrPrimary){
   gl.useProgram(prg);
   gl.uniform2f(u.Resolution,cn.width,cn.height);gl.uniform2f(u.Pointer,pointer[0],pointer[1]);
   // Touch location mapped into shader world coordinates.
   gl.uniform2f(u.TouchPoint,(touchPoint[0]-.5)*(cn.width/Math.min(cn.width,cn.height))*1.42,(touchPoint[1]-.5)*(cn.height/Math.min(cn.width,cn.height))*1.42);
   for(let [name,v] of Object.entries({Time:time,Mode:s.mode,Energy:s.energy,Density:s.density,Depth:s.depth,Flux:s.flux,StateA:patches[0].smoothed,StateB:patches[1].smoothed,OnOff:onOff,Band:beat,Beat:0,TouchAge:time-lastTouch,Palette:s.palette,Speed:s.reduced?0:(s.speed||1),Anaglyph:s.anaglyph?1:0,Breath:s.breath}))gl.uniform1f(u[name],v);
   gl.drawArrays(gl.TRIANGLES,0,3);
  }else if(!s.hdrPrimary)draw2D();
  if(!s.hdrPrimary)renderHDR();drawRaster(dt);
 }
 function setToggle(id,on){$(id).setAttribute("aria-pressed",String(on))}
 function toggleTour(on){tourOn=!!on;clearInterval(tourTimer);setToggle("tourBtn",tourOn);$("tourBtn").querySelector("span").textContent=tourOn?"STOP ODYSSEY":"ODYSSEY TOUR";if(tourOn){tourTimer=setInterval(()=>{if(!s.paused&&!document.hidden)setMode((s.mode+1)%8)},13000);toast("Odyssey engaged — eight worlds, one journey")}else toast("Odyssey paused")}
 function setOpen(id,on){$(id).classList.toggle("open",on);$(id).setAttribute("aria-hidden",String(!on))}
 function setSettings(on){setOpen("settings",on);setToggle("settingsBtn",on)}
 function setReduce(on){
  s.reduced=!!on;setToggle("motionBtn",s.reduced);if(s.reduced&&s.hdr){s.hdr=false;hdr.style.display="none";setToggle("hdrBtn",false)}
  toast(s.reduced?"Reduced motion enabled":"Full motion restored");
 }
 async function setAudio(on){
  let active=await audio.toggle(on);setToggle("soundBtn",active);$("soundBtn").querySelector("span").textContent=active?"SOUND ON":"SOUND OFF";toast(active?"Soundscape activated. Set a comfortable volume.":"Sound muted.");
 }
 async function setHDR(on){if(on&&!gpuReady){toast("True extended-range HDR not supported by this browser/display.");return}
  if(on&&s.reduced){toast("Disable reduced motion to enable HDR highlights.");return}
  s.hdr=on;hdr.style.display=on?"block":"none";setToggle("hdrBtn",on);toast(on?"Extended HDR highlight renderer active":"HDR highlight layer disabled");}
 function preset(k){
  const value={abyss:{palette:0,energy:.72,flux:.82,density:.92,depth:.9},aurora:{palette:1,energy:.66,flux:.5,density:.89,depth:.7},ember:{palette:2,energy:.83,flux:.72,density:.72,depth:.88}}[k];if(!value)return;
  Object.assign(s,value);for(let key of ["energy","flux","density","depth"]){$(key).value=Math.round(s[key]*100);setText(key+"Out",Math.round(s[key]*100)+"%")}toast(k.toUpperCase()+" configuration");}
 function install(){
  const sliderDefs=["density","depth","flux","energy","dwell","coupling","space","volume"];
  for(const id of sliderDefs){$(id).addEventListener("input",()=>{let val=+$(id).value;s[id]=id==="dwell"?val:val/100;setText(id+"Out",val+(id==="dwell"?"ms":"%"));if(id==="space")audio.setSpace(s.space);if(id==="volume")audio.setVolume(s.volume)})}
  document.querySelectorAll(".mode").forEach(b=>b.addEventListener("click",()=>{if(tourOn)toggleTour(false);setMode(+b.dataset.mode)}));
  document.querySelectorAll("[data-preset]").forEach(b=>b.addEventListener("click",()=>preset(b.dataset.preset)));
  $("randomize").onclick=()=>{s.palette=Math.floor(Math.random()*3);s.mode=Math.floor(Math.random()*8);for(let key of ["density","flux","depth","energy"]){let n=Math.round(48+Math.random()*49);s[key]=n/100;$(key).value=n;setText(key+"Out",n+"%")}setMode(s.mode)};
  $("tourBtn").onclick=()=>toggleTour(!tourOn);
  $("settingsBtn").onclick=()=>setSettings(!$("settings").classList.contains("open"));
  $("closeSettings").onclick=()=>setSettings(false);
  $("soundBtn").onclick=()=>setAudio();
  $("freezeBtn").onclick=()=>{s.paused=!s.paused;setToggle("freezeBtn",s.paused);$("freezeBtn").querySelector("span").textContent=s.paused?"RESUME":"PAUSE";toast(s.paused?"Universe paused":"Universe moving")};
  $("motionBtn").onclick=()=>setReduce(!s.reduced);
  $("hdrBtn").onclick=()=>setHDR(!s.hdr);
  $("glassesBtn").onclick=()=>{s.anaglyph=!s.anaglyph;setToggle("glassesBtn",s.anaglyph);if(s.anaglyph){setMode(1);toast("Red/cyan filter mode · use matching glasses");}else toast("Glasses mode off")};
  $("decodeBtn").onclick=()=>{s.decode=!s.decode;setToggle("decodeBtn",s.decode);$("rightTelemetry").classList.toggle("off",!s.decode)};
  $("help").onclick=()=>setOpen("science",true);
  $("closeScience").onclick=()=>setOpen("science",false);
  $("science").onclick=e=>{if(e.target===$("science"))setOpen("science",false)};
  $("fullscreen").onclick=()=>{if(document.fullscreenElement)document.exitFullscreen?.();else document.documentElement.requestFullscreen?.().catch(()=>toast("Fullscreen unavailable here"))};
  $("shareBtn").onclick=async()=>{try{if(navigator.share)await navigator.share({title:"THE UNSEEN · A 60ms Observatory",text:"Eight astonishing worlds of science-inspired audiovisual art.",url:"https://llm-i-am.github.io/the-unseen/"});
   else if(navigator.clipboard){await navigator.clipboard.writeText("https://llm-i-am.github.io/the-unseen/");toast("Website link copied");}else toast("Share: llm-i-am.github.io/the-unseen/")}catch(e){if(e.name!=="AbortError")toast("Could not share from this browser")}};
  $("enterAudio").onclick=async()=>{$("entry").classList.add("gone");await setAudio(true);setMode(0)};
  $("enterQuiet").onclick=()=>{$("entry").classList.add("gone");setMode(0)};
  addEventListener("keydown",e=>{if(e.target instanceof HTMLInputElement||e.target instanceof HTMLTextAreaElement)return;
   if(/^[1-8]$/.test(e.key))setMode(+e.key-1);else if(e.key.toLowerCase()==="m")setAudio();
   else if(e.key.toLowerCase()==="h")setSettings(!$("settings").classList.contains("open"));
   else if(e.key.toLowerCase()==="f")$("fullscreen").click();
   else if(e.key===" "){e.preventDefault();$("freezeBtn").click()}
   else if(e.key==="Escape"){setOpen("science",false);setSettings(false)}});
  addEventListener("pointermove",e=>{if(e.target.closest("button,input,.settings,.entry,.modal,.nav,.top"))return;pointerGoal=[e.clientX/innerWidth,1-e.clientY/innerHeight]},{passive:true});
  cn.addEventListener("pointerdown",e=>{const x=e.clientX/innerWidth,y=1-e.clientY/innerHeight;lastTouch=time;touchPoint=[x,y];if(time-lastShot>.15){lastShot=time;audio.impulse(x)}} ,{passive:true});
  addEventListener("resize",resize);
  document.addEventListener("visibilitychange",()=>{last=performance.now();if(document.hidden)audio.suspend();else audio.resume()});
  if(motionPref.matches)setToggle("motionBtn",true);
  cn.addEventListener("webglcontextlost",e=>{e.preventDefault();prg=null;setText("backend","RESTARTING GPU")});
  cn.addEventListener("webglcontextrestored",()=>{gl=null;prg=null;initGL()});
 }
 window.UNSEEN_RUNTIME={state:s,setMode,enableAudio:()=>setAudio(true),disableAudio:()=>setAudio(false),audio,setHDR,setReduce,resize,stopTour:()=>{if(tourOn)toggleTour(false)},hdrReady:()=>gpuReady};
 install();initGL();if(!window.UNSEEN_HDR6_ENABLED)initHDR().then(ok=>{if(ok&&!s.reduced){s.hdr=true;hdr.style.display="block";setToggle("hdrBtn",true);setText("backend",backend+" · HDR");}});
 requestAnimationFrame(render);
 setTimeout(()=>$("titlebox").classList.add("hide"),6900);
})();
