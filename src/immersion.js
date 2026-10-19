/* THE UNSEEN / VOL III — IMMERSIVE CEREMONY
   5 minutes of gentle 4/6 breathing, slow optical morphing, continuous audio.
   This is a guided-art experience, NOT neural entrainment, therapy, or respiration measurement.
   No breath retention, no intentional hyperventilation, and no full-screen strobe. */
(() => {
"use strict";
const $=id=>document.getElementById(id);
const runtime=window.UNSEEN_RUNTIME;
if(!runtime)return;
const {state:s,audio}=runtime;
const reduced=matchMedia("(prefers-reduced-motion: reduce)").matches;
const startMarkup=`
<section id="immersionGate" class="immersion-gate" aria-labelledby="immersionTitle">
 <div class="im-gate-sky" aria-hidden="true"></div>
 <div class="im-gate-content">
  <div class="im-mark"><img src="./assets/favicon.svg" width="46" height="46" alt=""></div>
  <div class="im-eyebrow">THE UNSEEN · VOLUME III</div>
  <h1 id="immersionTitle">Enter <em>the space<br>between thoughts.</em></h1>
  <div class="im-rule"></div>
  <p>Five minutes. Eight living universes.<br>One gentle rhythm to follow.</p>
  <div class="im-guide-line">Breathe in for 4 · Breathe out for 6</div>
  <button id="imBegin" class="im-primary">BEGIN THE JOURNEY <span aria-hidden="true">↗</span></button>
  <button id="imSilent" class="im-silent">Experience without sound</button>
  <div class="im-disclaimer">Immersive moving imagery and spatial sound. Use comfortable brightness and volume. Breathe naturally if the pace is uncomfortable; never strain or hold your breath. Stop if dizzy or unwell. <a href="https://doi.org/10.64898/2026.10.15.759299" target="_blank" rel="noopener">The science ↗</a></div>
 </div>
</section>
<div id="immersionHUD" class="im-hud" aria-hidden="true">
 <div id="imBreathOrb" class="im-breath-orb" aria-hidden="true">
  <div class="im-orb-halo"></div><div class="im-orb-ring"></div><div class="im-orb-center"></div>
 </div>
 <div id="imPoem" class="im-poem" aria-hidden="true"></div>
 <div class="im-breath-readout" aria-live="off">
  <span class="im-phase" id="imPhase">ARRIVE</span>
  <span id="imInstruction" class="im-instruction">Notice the space around you.</span>
  <span class="im-progress" aria-hidden="true"><i id="imProgress"></i></span>
 </div>
 <button id="imMenuBtn" class="im-menu-trigger" aria-label="Open journey controls" aria-expanded="false" aria-controls="imMenu">···</button>
 <aside id="imMenu" class="im-menu" role="dialog" aria-label="Journey controls" aria-hidden="true">
  <div class="im-menu-title">THE UNSEEN <small>THE JOURNEY</small></div>
  <button id="imPause" class="im-menu-action">Pause journey <span>Ⅱ</span></button>
  <button id="imSound" class="im-menu-action">Mute sound <span>♫</span></button>
  <button id="imBreath" class="im-menu-action">Hide breathing cue <span>◌</span></button>
  <button id="imPace" class="im-menu-action">Use 5 / 5 pace <span>≈</span></button>
  <button id="imComfort" class="im-menu-action">Gentler motion <span>◯</span></button>
  <button id="imNext" class="im-menu-action">Next universe <span>→</span></button>
  <button id="imScience" class="im-menu-action">About the science <span>↗</span></button>
  <button id="imRestart" class="im-menu-action">Restart journey <span>↺</span></button>
  <button id="imExit" class="im-menu-action im-exit">Leave experience <span>×</span></button>
  <p class="im-menu-foot">For a more immersive iPhone experience, open Safari Share → Add to Home Screen → Open as Web App. Safari browser bars cannot be hidden by a webpage itself.</p>
 </aside>
</div>`;
document.body.insertAdjacentHTML("beforeend",startMarkup);

let running=false,paused=false,elapsed=0,last=performance.now(),section=-1,prevPhase="",lastMode=-1;
let wake=null,menu=false,audioEnabled=true,guide=true,comfort=reduced,pace=[4,6],poemUntil=0;
let sceneOffset=0;
const prompts=[
 "You are here.",
 "What you notice is not all that exists.",
 "Let the edges of thought soften.",
 "The hidden is not the absent.",
 "Allow the moment to unfold.",
 "You don't have to follow every thought.",
 "Rest your attention on the moving light.",
 "Let the universe breathe without you."
];
const updateText=(id,text)=>{if($(id).textContent!==text)$(id).textContent=text};
function menuState(open){
 menu=!!open;$("imMenu").setAttribute("aria-hidden",String(!menu));
 $("imMenuBtn").setAttribute("aria-expanded",String(menu));
 document.body.classList.toggle("im-menu-open",menu);
 if(menu)$("imPause").focus();
 else $("imMenuBtn").focus({preventScroll:true});
}
async function lockScreen(){
 if(!("wakeLock" in navigator)||document.hidden)return;
 try{wake=await navigator.wakeLock.request("screen")}catch(e){/* iOS / power policy may decline; proceed normally */}
}
function releaseScreen(){
 if(wake){const w=wake;wake=null;w.release().catch(()=>{})}
}
function fullScreenFromGesture(){
 if(document.fullscreenElement||!document.documentElement.requestFullscreen)return;
 try{let p=document.documentElement.requestFullscreen({navigationUI:"hide"});p?.catch?.(()=>{});}catch(e){/* iOS Safari usually disallows arbitrary-element fullscreen */}
}
function setSound(on){
 audioEnabled=!!on;
 // A user-initiated toggle is allowed to unlock AudioContext. Do not attempt autoplay on load.
 if(on)runtime.enableAudio();else runtime.disableAudio();
 updateText("imSound",on?"Mute sound ♫":"Enable sound ♫");
}
function showPoem(message,time=6){
 const el=$("imPoem");el.textContent=message;el.classList.remove("visible");void el.offsetWidth;
 el.classList.add("visible");poemUntil=elapsed+time;
}
function chooseScene(index){
 const i=(index+8)%8;
 if(i===lastMode)return;
 lastMode=i;
 runtime.setMode(i);
 showPoem(prompts[i],5.5);
}
function onBegin(withSound){
 if(running)return;
 // Invoke audio resume and fullscreen while handling the actual pointer/click gesture.
 audioEnabled=withSound;
 if(withSound)runtime.enableAudio();else runtime.disableAudio();
 fullScreenFromGesture();
 lockScreen();
 runtime.stopTour();
 s.density=1;s.depth=1;s.flux=1;s.energy=1;s.space=.88;
 audio.setSpace?.(.88);
 s.decode=false;s.paused=false;
 s.breath=.5;
 sceneOffset=0;
 $("rightTelemetry").classList.add("off");
 document.body.classList.add("experience-live");
 $("immersionGate").setAttribute("aria-hidden","true");
 $("immersionHUD").setAttribute("aria-hidden","false");
 elapsed=0;last=performance.now();running=true;paused=false;section=-1;prevPhase="";lastMode=-1;guide=true;
 document.body.classList.remove("im-no-guide");
 updateText("imBreath","Hide breathing cue ◌");
 updateText("imPause","Pause journey Ⅱ");
 chooseScene(0);
 $("imPhase").textContent="ARRIVE";
 $("imInstruction").textContent="Allow your shoulders to settle.";
 requestAnimationFrame(animate);
}
function end(){
 running=false;paused=false;menuState(false);
 document.body.classList.remove("experience-live","im-paused","im-no-guide","im-comfort");
 $("immersionHUD").setAttribute("aria-hidden","true");
 $("immersionGate").setAttribute("aria-hidden","false");
 runtime.disableAudio();releaseScreen();
 if(document.fullscreenElement)document.exitFullscreen?.().catch(()=>{});
 $("imBegin").focus({preventScroll:true});
}
function resumePause(){
 paused=!paused;s.paused=paused;
 document.body.classList.toggle("im-paused",paused);
 updateText("imPause",paused?"Resume journey ▶":"Pause journey Ⅱ");
 last=performance.now();
}
function setComfort(val){
 comfort=!!val;
 document.body.classList.toggle("im-comfort",comfort);
 s.reduced=comfort;
 s.energy=comfort?.57:1;
 s.flux=comfort?.35:1;
 s.depth=comfort?.45:1;
 s.breath=comfort?.5:s.breath;
 if(comfort){s.hdr=false;$("hdr").style.display="none";}
 // When restoring full intensity, re-enable the already initialized HDR layer.
 else if(runtime.hdrReady()){s.hdr=true;$("hdr").style.display="block";}
 updateText("imComfort",comfort?"Full intensity ✧":"Gentler motion ◯");
}
function phaseAt(sec){
 if(sec<12)return {phase:"ARRIVE",text:"Allow your shoulders to settle.",level:.5,progress:0};
 if(sec<312){
  const t=sec-12,cycle=pace[0]+pace[1],p=t%cycle;
  if(p<pace[0]){
   let u=p/pace[0],ease=u*u*(3-2*u);
   return {phase:"INHALE",text:"Breathe gently in",level:ease,progress:t/300,edge:p<.08};
  }
  let u=(p-pace[0])/pace[1],ease=u*u*(3-2*u);
  return {phase:"EXHALE",text:"Let the breath slowly go",level:1-ease,progress:t/300,edge:p-pace[0]<.08};
 }
 return {phase:"REST",text:"Breathe freely. Just observe.",level:.5,progress:1};
}
function frameState(sec,now){
 const p=phaseAt(sec);
 if(p.phase!==prevPhase){
  prevPhase=p.phase;
  updateText("imPhase",p.phase);
  updateText("imInstruction",p.text);
  if(audioEnabled&&p.phase==="INHALE")audio.breathCue?.(true);
  if(audioEnabled&&p.phase==="EXHALE")audio.breathCue?.(false);
  if(p.phase==="REST")showPoem("Stay a moment. Nothing more to do.",8);
 }
 if(sec>=12&&sec<312){
  // Only a low-frequency breathing envelope affects the shader and soundscape.
  s.breath=.22+.74*p.level;
  audio.setBreath?.(p.level);
  const scale=.74+.43*p.level;
  $("imBreathOrb").style.setProperty("--im-scale",scale.toFixed(4));
  $("imBreathOrb").style.setProperty("--im-glow",(.12+.21*p.level).toFixed(3));
 }else{
  s.breath=.5;audio.setBreath?.(.5);
  $("imBreathOrb").style.setProperty("--im-scale","0.96");
  $("imBreathOrb").style.setProperty("--im-glow",".18");
 }
 $("imProgress").style.transform="scaleX("+Math.max(.001,p.progress).toFixed(5)+")";
 const act=Math.min(7,Math.floor(sec/42.5));
 if(sec<340)chooseScene((act+sceneOffset)%8);
 else if(sec>360){chooseScene((7+sceneOffset+Math.floor((sec-340)/45))%8);}
 if(poemUntil&&sec>poemUntil){$("imPoem").classList.remove("visible");poemUntil=0}
 if(sec>342&&section!==99){section=99;showPoem("Carry this quiet with you.",10)}
 if(!guide)$("imBreathOrb").style.opacity="0";
 else $("imBreathOrb").style.opacity="1";
}
function animate(now){
 if(!running)return;
 const dt=Math.min(.08,Math.max(0,(now-last)/1000));
 last=now;
 if(!paused&&!document.hidden){
  elapsed+=dt;
  frameState(elapsed,now);
 }
 requestAnimationFrame(animate);
}
// Controls are intentionally behind one very discreet button.
$("imBegin").addEventListener("click",()=>onBegin(true));
$("imSilent").addEventListener("click",()=>onBegin(false));
$("imMenuBtn").addEventListener("click",()=>menuState(!menu));
$("imPause").addEventListener("click",()=>{resumePause();menuState(false)});
$("imSound").addEventListener("click",()=>{setSound(!audioEnabled);menuState(false)});
$("imBreath").addEventListener("click",()=>{guide=!guide;document.body.classList.toggle("im-no-guide",!guide);updateText("imBreath",guide?"Hide breathing cue ◌":"Show breathing cue ◌");menuState(false)});
$("imPace").addEventListener("click",()=>{pace=pace[0]===4?[5,5]:[4,6];updateText("imPace",pace[0]===4?"Use 5 / 5 pace ≈":"Use 4 / 6 pace ≈");menuState(false)});
$("imComfort").addEventListener("click",()=>{setComfort(!comfort);menuState(false)});
$("imNext").addEventListener("click",()=>{sceneOffset=(sceneOffset+1)%8;chooseScene(lastMode+1);menuState(false)});
$("imRestart").addEventListener("click",()=>{elapsed=0;sceneOffset=0;lastMode=-1;prevPhase="";last=performance.now();chooseScene(0);menuState(false)});
$("imScience").addEventListener("click",()=>{$("help").click();menuState(false)});
$("imExit").addEventListener("click",end);
document.addEventListener("keydown",e=>{
 if(!running)return;
 if(e.key==="Escape"&&menu){e.stopPropagation();menuState(false)}
 if(e.key==="Escape"&&!menu&&!document.fullscreenElement){menuState(true)}
});
document.addEventListener("visibilitychange",()=>{
 last=performance.now();
 if(!document.hidden&&running&&!paused)lockScreen();
});
window.addEventListener("pagehide",releaseScreen);
if(reduced)setComfort(true);
// Minimal, readonly state for automated browser verification.
window.UNSEEN_IMMERSION={get running(){return running},get elapsed(){return elapsed},get phase(){return prevPhase},get paused(){return paused},get mode(){return lastMode},get guide(){return guide},get pace(){return [...pace]},get audioEnabled(){return audioEnabled}};
})();
