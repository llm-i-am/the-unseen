/* THE UNSEEN V — RIOT ENGINE
 * Sample-free industrial score: sub-pressure, broken syncopation, metallic clatter,
 * detuned FM hits, stereo shrapnel, tempo-shaped voids and approaching doppler forms.
 * Uses the existing dynamics limiter; bounded voice gains and predictable node lifetimes.
 * No 15/16 Hz audio entrainment, no auto-play before user input.
 */
(()=>{
 "use strict";
 const proto=window.UnseenAudio?.prototype;
 if(!proto)return;
 const originalInit=proto.initHyper;
 const originalUpdate=proto.updateHyper;
 const originalRetune=proto.retuneHyper;
 const clamp=(x,a,b)=>Math.max(a,Math.min(b,x));
 const tempos=[124,142,158,108,166,136,176,149];
 proto.initHyper=function(){
  originalInit?.call(this);
  if(this.riot||!this.ac)return;
  const ac=this.ac,bus=ac.createGain(),pan=ac.createStereoPanner();
  bus.gain.value=.57;bus.connect(pan);pan.connect(this.master);
  const hiss=ac.createBuffer(1,ac.sampleRate,ac.sampleRate),data=hiss.getChannelData(0);
  let seed=179173;
  for(let i=0;i<data.length;i++){
   seed=(Math.imul(seed,1664525)+1013904223)>>>0;
   data[i]=(seed/4294967295)*2-1;
  }
  const warp=ac.createWaveShaper();
  let curve=new Float32Array(2048);
  for(let i=0;i<curve.length;i++){
   const x=i/(curve.length-1)*2-1;
   curve[i]=Math.tanh(x*2.6)/Math.tanh(2.6);
  }
  warp.curve=curve;warp.oversample="2x";
  const metal=ac.createGain();metal.gain.value=.14;metal.connect(warp);warp.connect(bus);
  this.riot={bus,pan,metal,hiss,step:0,next:ac.currentTime+.04,mode:0,seed:1129,energy:1,impact:0,chapter:0,enabled:true,tempo:124,drop:0,stereo:0};
 };
 proto.retuneHyper=function(scene){
  originalRetune?.call(this,scene);
  if(this.riot){
   this.riot.mode=scene;
   this.riot.tempo=tempos[scene]||140;
   this.riot.step=0;
   this.riot.drop=.3;
   this.riot.next=this.ac.currentTime+.13;
  }
 };
 function noiseHit(inst,time,decay,freq,level,side){
  const ac=inst.ac,r=inst.riot,src=ac.createBufferSource(),filter=ac.createBiquadFilter(),amp=ac.createGain(),p=ac.createStereoPanner();
  src.buffer=r.hiss;
  filter.type="bandpass";filter.frequency.value=freq;filter.Q.value=freq>4000?.9:.65;
  p.pan.value=side;
  amp.gain.setValueAtTime(.00001,time);
  amp.gain.exponentialRampToValueAtTime(level,time+.006);
  amp.gain.exponentialRampToValueAtTime(.00001,time+decay);
  src.connect(filter);filter.connect(amp);amp.connect(p);p.connect(r.metal);
  src.start(time);src.stop(time+decay+.015);
 }
 function kick(inst,time,force){
  const ac=inst.ac,r=inst.riot,o=ac.createOscillator(),g=ac.createGain(),saturate=ac.createBiquadFilter();
  o.type="sine";
  o.frequency.setValueAtTime(148,time);
  o.frequency.exponentialRampToValueAtTime(40,time+.095);
  g.gain.setValueAtTime(.00001,time);
  g.gain.exponentialRampToValueAtTime(.26*force,time+.009);
  g.gain.exponentialRampToValueAtTime(.00001,time+.42);
  saturate.type="lowpass";saturate.frequency.value=270;
  o.connect(saturate);saturate.connect(g);g.connect(r.bus);
  o.start(time);o.stop(time+.46);
  r.impact=Math.max(r.impact,.55*force);
 }
 function bass(inst,time,pitch,level){
  const ac=inst.ac,r=inst.riot,o=ac.createOscillator(),mod=ac.createOscillator(),modG=ac.createGain(),g=ac.createGain(),fil=ac.createBiquadFilter();
  o.type="sawtooth";mod.type="sine";
  o.frequency.setValueAtTime(pitch,time);
  mod.frequency.value=pitch*1.503;
  modG.gain.value=pitch*.28;
  mod.connect(modG);modG.connect(o.frequency);
  fil.type="lowpass";fil.frequency.value=210;fil.Q.value=1.5;
  g.gain.setValueAtTime(.00001,time);
  g.gain.exponentialRampToValueAtTime(level,time+.03);
  g.gain.exponentialRampToValueAtTime(.00001,time+.31);
  o.connect(fil);fil.connect(g);g.connect(r.bus);
  mod.start(time);o.start(time);mod.stop(time+.35);o.stop(time+.35);
 }
 function shard(inst,time,n){
  const ac=inst.ac,r=inst.riot,o=ac.createOscillator(),g=ac.createGain(),f=ac.createBiquadFilter(),p=ac.createStereoPanner();
  o.type="square";
  const pitch=190+((n*7919)%1500);
  o.frequency.setValueAtTime(pitch,time);o.frequency.exponentialRampToValueAtTime(pitch*.46,time+.09);
  f.type="bandpass";f.frequency.value=Math.min(5000,pitch*1.7);f.Q.value=3.5;
  p.pan.value=n%2?-.82:.82;
  g.gain.setValueAtTime(.00001,time);g.gain.exponentialRampToValueAtTime(.036,time+.009);
  g.gain.exponentialRampToValueAtTime(.00001,time+.14);
  o.connect(f);f.connect(g);g.connect(p);p.connect(r.metal);
  o.start(time);o.stop(time+.16);
 }
 proto.updateRiot=function(t,mode,stateA){
  const r=this.riot,ac=this.ac;
  if(!r||!this.active||!r.enabled||!ac)return;
  const now=ac.currentTime;
  const interval=60/r.tempo/4;
  let count=0;
  while(r.next<now+.12 && count++<5){
   const step=r.step%16,bar=Math.floor(r.step/16),time=Math.max(now+.002,r.next);
   r.seed=(Math.imul(r.seed,1664525)+1013904223)>>>0;
   const dice=r.seed/4294967296;
   // Unexpected omissions are structural rather than an arbitrary random wall of noise.
   const voidStep=(bar%7===5)&&(step<6);
   const hard=step%4===0,back=step%8===4;
   if(!voidStep){
    if(hard||step===14&&dice>.55)kick(this,time,hard?1:.6);
    if(back||step===11&&dice>.68)noiseHit(this,time,.15,1350,.16,step%2?.5:-.5);
    if(step%2===1&&dice>.23)noiseHit(this,time,.045,5400,.095,step%4===1?-.65:.65);
    if((step===0||step===6||step===10||step===13)&&dice>.22){
     const notes=[43.65,49,55,38.9,65.41,46.25,73.42,41.2];
     bass(this,time,notes[mode]||49,.11);
    }
    if(dice>.71 && step%3===0)shard(this,time,r.step);
   }
   r.step++;
   r.next+=interval;
  }
  r.impact*=.88;
  if(r.drop>0)r.drop=Math.max(0,r.drop-.018);
 };
 proto.updateHyper=function(t,mode,a,b,space,px){
  originalUpdate?.call(this,t,mode,a,b,space,px);
  this.updateRiot?.(t,mode,a);
 };
})();
