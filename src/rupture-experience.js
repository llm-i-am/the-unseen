/* RUPTURE // V — not meditation. A violent-feeling generative artwork,
   without repeated large-area luminance flashes or guaranteed neurophysiological effects. */
(()=>{
"use strict";
const $=id=>document.getElementById(id),rt=window.UNSEEN_RUNTIME;
if(!rt)return;
const s=rt.state,osReduce=matchMedia("(prefers-reduced-motion:reduce)").matches;
const acts=[
["WRONG DOOR","//",0,2,5.0,8,"THERE IS NO SAFE CENTER."],
["DOUBLE EXPOSURE","◈",1,0,5.6,7,"TWO WORLDS. ZERO AGREEMENT."],
["TEETH OF LIGHT","✳",5,2,6.2,8,"LOOK THROUGH THE CUT."],
["INFINITE WRONG","∞",2,1,5.8,7,"KEEP FALLING UP."],
["THE ROOM BENDS","⌁",4,0,5.2,8,"THE WALLS ARE LISTENING."],
["ECHOES OF YOU","◌",3,2,5.9,7,"WHICH ONE IS THE GHOST?"],
["FAULT LINE","〽",5,1,6.4,8,"EVERY EDGE IS LYING."],
["NERVE STORM","⁂",6,2,6.2,8,"SIGNAL / NOISE / SIGNAL"],
["FALSE HORIZON","◉",7,0,6.0,7,"YOUR EYES HAVE LOST THE MAP."],
["NO EXIT","×",1,2,5.7,7,"IT WAS NEVER A ROOM."],
["CRYSTAL DAMAGE","◇",2,0,6.1,8,"THE FRACTURE IS THE IMAGE."],
["DEEPER","↓",0,1,6.0,7,"STOP LOOKING FOR THE BOTTOM."],
["CHROME DREAM","✶",4,2,5.9,8,"THE MACHINE REMEMBERS YOU."],
["TWIN IMPOSSIBLE","↭",3,1,6.2,7,"BOTH ARE TRUE. NEITHER IS REAL."],
["EVENT COLLAPSE","⊗",7,2,6.2,8,"THE WORLD BLINKS. YOU DO NOT."],
["AFTER THE IMAGE","∴",6,0,5.6,7,"WHAT REMAINS WHEN IT LEAVES?"]
];
const duration=acts.reduce((n,c)=>n+c[5],0);
document.body.insertAdjacentHTML("beforeend",`
<section id="rxGate" class="rx-gate" aria-labelledby="rxTitle">
<div class="rx-gate-haze" aria-hidden="true"></div>
<div class="rx-gate-inside">
<div class="rx-overline">THE UNSEEN / VOL. 05 <span>● LIVE SYNTHETIC EXPERIENCE</span></div>
<div class="rx-skull" aria-hidden="true">◉</div>
<h1 id="rxTitle">NO<br><em>SAFE</em><br>CENTER<span class="rx-period">.</span></h1>
<div class="rx-gate-rule"></div>
<p class="rx-manifesto">THIS IS NOT MEDITATION.<br>THIS IS A MACHINE BUILT TO MAKE REALITY FEEL WEIRD.</p>
<button id="imBegin" class="rx-launch">ENTER THE RUPTURE <b>↗</b></button>
<button id="imSilent" class="rx-alt">SOUND OFF / ENTER ANYWAY</button>
<p class="rx-warning">Intense moving geometry, depth illusions, unpredictable sounds. Motion or flashing imagery can cause symptoms. No repeated full-screen strobing is used. Use comfortable volume; stop if dizzy or unwell. <a href="https://doi.org/10.64898/2026.10.15.759299" target="_blank" rel="noopener noreferrer">Science inspiration ↗</a></p>
</div></section>
<section id="rxHUD" class="rx-hud" aria-hidden="true">
 <div class="rx-corner" aria-hidden="true"><span>RUPTURE // 05</span><i id="rxIndex">01 / 16</i></div>
 <button id="rxMenuButton" class="rx-menu-button" aria-expanded="false" aria-label="Open controls">•••</button>
 <div id="rxTitleBurst" class="rx-title-burst" aria-live="off">
  <div id="rxGlyph" class="rx-glyph">//</div><div id="rxChapter">WRONG DOOR</div><div id="rxLine">THERE IS NO SAFE CENTER.</div>
 </div>
 <div class="rx-lower" aria-hidden="true"><div class="rx-line"><i id="rxProgress"></i></div><span>THE UNSEEN <b>／</b> EVERYTHING IS ALIVE</span></div>
 <div id="rxMenu" class="rx-menu" aria-hidden="true" role="dialog" aria-label="Rupture controls">
 <div class="rx-menu-heading">CONTROL THE DAMAGE <small>VOL. 05</small></div>
 <button id="rxPause">Ⅱ <span>PAUSE / RESUME</span></button>
 <button id="rxMute">♫ <span>MUTE / UNMUTE</span></button>
 <button id="rxNext">→ <span>SKIP TO THE NEXT REALITY</span></button>
 <button id="rxIntensity">◇ <span>INTENSITY: MAXIMUM</span></button>
 <button id="rxComfort">◯ <span>GENTLER MOTION</span></button>
 <button id="rxScience">? <span>THE SCIENCE</span></button>
 <button id="rxRestart">↺ <span>RESTART</span></button>
 <button id="rxExit">× <span>GET ME OUT</span></button>
 <p>Tap the light field to generate an original sonic fragment. No brainwave entrainment or neural measurements.</p>
 </div>
</section>`);
let running=false,paused=false,elapsed=0,last=performance.now(),chapter=-1,sound=true,menu=false,comfort=osReduce,intensity=1,offset=0,wake=null,burstTimer=null;
function toggleMenu(on){menu=!!on;$("rxMenu").setAttribute("aria-hidden",String(!menu));$("rxMenuButton").setAttribute("aria-expanded",String(menu));}
function applyAct(i){
 chapter=((i%acts.length)+acts.length)%acts.length;
 const [name,glyph,scene,palette,speed,,line]=acts[chapter];
 rt.setMode(scene);s.palette=palette;
 s.speed=comfort?.16:speed*(intensity===2?1.3:intensity===0?.58:1);
 s.energy=comfort?.52:1;s.depth=comfort?.44:1;s.flux=comfort?.34:1;
 s.coupling=chapter%3===0?.33:.11;
 s.breath=.46+((chapter*7)%5)*.08;
 if(rt.audio.riot)rt.audio.riot.tempo=(intensity===0?128:155+chapter%6*9+(intensity===2?14:0));
 $("rxChapter").textContent=name;$("rxGlyph").textContent=glyph;$("rxLine").textContent=line;
 $("rxIndex").textContent=String(chapter+1).padStart(2,"0")+" / "+acts.length;
 $("rxTitleBurst").classList.remove("rx-on");
 clearTimeout(burstTimer);burstTimer=setTimeout(()=>$("rxTitleBurst").classList.remove("rx-on"),0);
}
function actAt(t){let x=t%duration;for(let i=0;i<acts.length;i++){x-=acts[i][5];if(x<0)return i;}return acts.length-1;}
function loop(now){
 if(!running)return;
 let dt=Math.min(.07,Math.max(0,(now-last)/1000));last=now;
 if(!paused&&!document.hidden){
  elapsed+=dt;
  const i=(actAt(elapsed)+offset)%acts.length;
  if(i!==chapter)applyAct(i);
  s.journey=(elapsed%duration)/duration;
  s.breath=.48+.08*Math.sin(elapsed*.36);
  $("rxProgress").style.transform="scaleX("+((elapsed%duration)/duration).toFixed(5)+")";
 }
 requestAnimationFrame(loop);
}
function start(withSound){
 if(running)return;
 document.body.classList.add("experience-live","rx-live","v6-hudless");
 $("toast")?.classList.remove("on");
 try{document.documentElement.requestFullscreen?.({navigationUI:"hide"})?.catch(()=>{})}catch{}
 if("wakeLock" in navigator)navigator.wakeLock.request("screen").then(x=>wake=x).catch(()=>{});
 rt.stopTour();sound=withSound;
 if(sound)rt.enableAudio();else rt.disableAudio();
 running=true;paused=false;s.paused=false;elapsed=0;offset=0;chapter=-1;last=performance.now();
 rt.audio.setSpace?.(.94);s.decode=false;applyAct(0);
 $("rxGate").setAttribute("aria-hidden","true");$("rxHUD").setAttribute("aria-hidden","false");
 toggleMenu(false);requestAnimationFrame(loop);
}
function exit(){
 running=false;paused=false;s.paused=false;rt.disableAudio();
 if(wake){wake.release().catch(()=>{});wake=null;}
 if(document.fullscreenElement)document.exitFullscreen?.().catch(()=>{});
 document.body.classList.remove("experience-live","rx-live","v6-hudless");
 $("rxGate").setAttribute("aria-hidden","false");$("rxHUD").setAttribute("aria-hidden","true");toggleMenu(false);
}
function setComfort(on){
 comfort=!!on;s.reduced=comfort;document.body.classList.toggle("rx-comfort",comfort);
 if(comfort){s.hdr=false;$("hdr").style.display="none";}
 else if(rt.hdrReady()){s.hdr=true;$("hdr").style.display="block";}
 if(running)applyAct(chapter);
 $("rxComfort").querySelector("span").textContent=comfort?"RESTORE FULL MOTION":"GENTLER MOTION";
}
$("imBegin").addEventListener("click",()=>start(true));
$("imSilent").addEventListener("click",()=>start(false));
$("rxMenuButton").addEventListener("click",()=>toggleMenu(!menu));
$("rxPause").addEventListener("click",()=>{paused=!paused;s.paused=paused;if(paused)rt.audio.suspend();else rt.audio.resume();toggleMenu(false);last=performance.now()});
$("rxMute").addEventListener("click",()=>{sound=!sound;if(sound)rt.enableAudio();else rt.disableAudio();toggleMenu(false)});
$("rxNext").addEventListener("click",()=>{offset=(offset+1)%acts.length;applyAct(chapter+1);toggleMenu(false)});
$("rxIntensity").addEventListener("click",()=>{intensity=(intensity+1)%3;if(running)applyAct(chapter);$("rxIntensity").querySelector("span").textContent=["INTENSITY: LITE","INTENSITY: MAXIMUM","INTENSITY: BEYOND"][intensity];toggleMenu(false)});
$("rxComfort").addEventListener("click",()=>{setComfort(!comfort);toggleMenu(false)});
$("rxScience").addEventListener("click",()=>{$("help").click();toggleMenu(false)});
$("rxRestart").addEventListener("click",()=>{elapsed=0;offset=0;chapter=-1;applyAct(0);toggleMenu(false)});
$("rxExit").addEventListener("click",exit);
document.addEventListener("keydown",e=>{if(!running)return;if(e.key==="Escape")toggleMenu(!menu);
 if(e.key==="ArrowRight")$("rxNext").click();
 if(e.key===" "){e.preventDefault();$("rxPause").click();}
});
document.addEventListener("visibilitychange",()=>{last=performance.now();if(!document.hidden&&running&&"wakeLock"in navigator)navigator.wakeLock.request("screen").then(x=>wake=x).catch(()=>{})});
window.addEventListener("pagehide",()=>{if(wake)wake.release().catch(()=>{})});
if(osReduce)setComfort(true);
// A clean, fully unobstructed experience. Two-finger touch or a deliberate double-tap opens controls.
let lastTap=0,lastTapX=0,lastTapY=0;
document.addEventListener("touchstart",event=>{
 if(running&&event.touches.length===2){event.preventDefault();toggleMenu(!menu);}
},{passive:false});
document.addEventListener("pointerup",event=>{
 if(!running||event.target.closest("button,.rx-menu"))return;
 const now=performance.now();
 const close=Math.hypot(event.clientX-lastTapX,event.clientY-lastTapY)<45;
 if(close&&now-lastTap<350){toggleMenu(!menu);lastTap=0;}
 else{lastTap=now;lastTapX=event.clientX;lastTapY=event.clientY;}
},{passive:true});
window.UNSEEN_IMMERSION={get running(){return running},get elapsed(){return elapsed},get mode(){return chapter},get paused(){return paused},get soundEnabled(){return sound},get intensity(){return intensity},get reduced(){return comfort},get version(){return 6}};
})();
