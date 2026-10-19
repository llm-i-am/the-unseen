/*
 THE UNSEEN IV / COMPOSER OF HIDDEN WORLDS
 Original procedural audio layered atop Volume III's base synthesizer.
 HRTF orbits, additive singing resonators, subharmonic currents,
 stochastic crystalline motifs, delayed self echoes, breath-responsive filters.
 Conceptual inspiration: perceptual segregation/integration, but no 15 Hz audio beat or entrainment claim.
 */
(function(){
"use strict";
const proto=window.UnseenAudio?.prototype;
if(!proto)return;
const clamp=(v,l,h)=>Math.max(l,Math.min(h,v));
const NOTES=[0,2,3,7,10,12,15,17,19,22,24,26,27,31];
proto.initHyper=function(){
 if(this.hyper||!this.ac)return;
 const ac=this.ac,now=ac.currentTime;
 const bus=ac.createGain();bus.gain.value=.68;bus.connect(this.dry);
 const wet=ac.createGain();wet.gain.value=.36;wet.connect(this.reverbInput || this.wet);
 const chorus=ac.createDelay(1.0),feedback=ac.createGain();
 chorus.delayTime.value=.085;feedback.gain.value=.12;
 bus.connect(chorus);chorus.connect(feedback);feedback.connect(chorus);chorus.connect(wet);
 this.hyper={bus,wet,chorus,feedback,orbit:[],choir:[],last:0,nextBell:now+2.1,mode:0,breath:.5,shot:0,energy:.35,seed:1373,visualImpulse:0};
 const h=this.hyper;
 // Four pairs of detuned harmonics, two worlds at different depths.
 for(let i=0;i<4;i++){
  const p=ac.createPanner();
  p.panningModel="HRTF";p.distanceModel="inverse";p.refDistance=2;p.maxDistance=22;p.rolloffFactor=.67;
  const wave=ac.createOscillator(),shadow=ac.createOscillator();
  wave.type=["sine","triangle","sine","triangle"][i];
  shadow.type="sine";
  let filter=ac.createBiquadFilter();filter.type="lowpass";filter.frequency.value=1200+i*230;filter.Q.value=.58;
  let g=ac.createGain();g.gain.value=0;
  const carrier=ac.createGain(),overtone=ac.createGain();
  carrier.gain.value=.22;overtone.gain.value=.076;
  wave.connect(carrier);shadow.connect(overtone);
  carrier.connect(filter);overtone.connect(filter);filter.connect(g);g.connect(p);p.connect(bus);p.connect(wet);
  const frequency=110*Math.pow(2,NOTES[i*2]/12);
  wave.frequency.value=frequency;shadow.frequency.value=frequency*2.002;
  wave.start();shadow.start();
  h.orbit.push({p,g,wave,shadow,filter,i});
 }
 // A second instrument: low-level, lightly detuned additive choir with moving filters.
 for(let i=0;i<6;i++){
  const osc=ac.createOscillator(),lfo=ac.createOscillator();
  const gain=ac.createGain(),vibrato=ac.createGain(),filter=ac.createBiquadFilter();
  const pan=ac.createStereoPanner();
  osc.type=i%3===0?"triangle":"sine";
  osc.frequency.value=110*Math.pow(2,(NOTES[i+3]+12)/12);
  lfo.frequency.value=.035+i*.007;vibrato.gain.value=2.5+i*.7;
  gain.gain.value=.0001;filter.type="lowpass";filter.frequency.value=850;filter.Q.value=.35;
  lfo.connect(vibrato);vibrato.connect(osc.detune);
  osc.connect(filter);filter.connect(gain);gain.connect(pan);pan.connect(bus);pan.connect(wet);
  osc.start();lfo.start();
  h.choir.push({osc,lfo,vibrato,gain,filter,pan,i});
 }
 this.retuneHyper(this.hyper.mode);
};
proto.retuneHyper=function(scene=0){
 const h=this.hyper;if(!h)return;
 h.mode=scene;
 const ac=this.ac,n=ac.currentTime;
 const roots=[73.42,82.41,65.41,87.31,73.42,61.74,82.41,55.00];
 let root=roots[scene]||73.42;
 h.orbit.forEach((v,i)=>{
  let degree=NOTES[(i*3+scene)%NOTES.length];
  const hz=root*Math.pow(2,(degree+12)/12);
  v.wave.frequency.setTargetAtTime(hz,n,1.5);
  v.shadow.frequency.setTargetAtTime(hz*(i%2?2.01:1.502),n,1.8);
 });
 h.choir.forEach((v,i)=>{
  const hz=root*Math.pow(2,(NOTES[(i*2+scene+4)%NOTES.length]+12)/12);
  v.osc.frequency.setTargetAtTime(hz,n,2.4);
 });
 this.transitionChime(scene);
};
proto.transitionChime=function(scene){
 if(!this.active||!this.ac||!this.hyper)return;
 // A three-part shimmer illustrates the moment the environment changes.
 const tones=[0,7,12],now=this.ac.currentTime,root=82.4*Math.pow(2,(scene%6)*.12);
 for(let i=0;i<3;i++)this.hyperBell(root*Math.pow(2,tones[i]/12),now+i*.16,.5+i*.14);
};
proto.hyperBell=function(freq,when,amount=.6){
 const h=this.hyper;
 if(!h||!this.active||!this.ac)return;
 const ac=this.ac,n=when??ac.currentTime;
 const gain=ac.createGain();gain.gain.value=0.00001;
 const pan=ac.createStereoPanner();pan.pan.value=Math.sin(freq*.041)*.7;
 const filter=ac.createBiquadFilter();filter.type="lowpass";filter.frequency.value=2800;
 gain.connect(filter);filter.connect(pan);pan.connect(h.bus);pan.connect(h.wet);
 const partials=[1,2.005,2.99];
 partials.forEach((ratio,i)=>{
  const osc=ac.createOscillator(),pg=ac.createGain();
  osc.type="sine";osc.frequency.value=clamp(freq*ratio,65,6000);pg.gain.value=[.12,.038,.012][i]*amount;
  osc.connect(pg);pg.connect(gain);osc.start(n);osc.stop(n+2.4);
 });
 gain.gain.setValueAtTime(.00001,n);
 gain.gain.exponentialRampToValueAtTime(.35,n+.025);
 gain.gain.exponentialRampToValueAtTime(.00001,n+2.2);
 h.visualImpulse=.9;h.lastBellTime=n;
};
proto.setBreathHyper=function(value){
 if(this.hyper)this.hyper.breath=clamp(value,0,1);
};
proto.updateHyper=function(t,scene,a,b,space,px){
 const h=this.hyper,ac=this.ac;
 if(!h||!this.active||!ac)return;
 const now=ac.currentTime;
 if(now-h.last<.06)return;
 const dt=Math.min(.1,now-h.last);h.last=now;
 const breath=h.breath;
 const altitude=.5+.5*Math.sin(t*.025+scene*.79);
 h.orbit.forEach((v,i)=>{
  // A split ensemble: two worlds rotate in contrary directions and at different distances.
  const sign=i%2?1:-1;
  const theta=t*(.07+i*.009)*sign+i*1.5708;
  const radial=2.5+(i%2?1.7:0)+.42*Math.sin(t*.08+i);
  let x=Math.cos(theta)*radial+(px-.5)*1.2;
  let z=Math.sin(theta)*radial+2.0;
  let y=Math.sin(theta*.76+i)*1.2+(.5-breath)*.34;
  if(v.p.positionX?.setTargetAtTime){
   v.p.positionX.setTargetAtTime(x,now,.15);
   v.p.positionY.setTargetAtTime(y,now,.15);
   v.p.positionZ.setTargetAtTime(z,now,.15);
  }else if(v.p.setPosition)v.p.setPosition(x,y,z);
  const val=.14+.095*altitude+.07*breath;
  v.g.gain.setTargetAtTime(val,now,.36);
  v.filter.frequency.setTargetAtTime(330+(i+1)*245+1450*breath,now,.37);
  // "Suppressed" changes timbre through held interpolation, not flashing/gating.
  v.shadow.detune.setTargetAtTime((i%2?a:b)*5,now,.65);
 });
 h.choir.forEach((v,i)=>{
  const slow=.5+.5*Math.sin(t*(.038+i*.004)+i*.9);
  v.gain.gain.setTargetAtTime(.018+.035*slow,now,.42);
  v.filter.frequency.setTargetAtTime(430+2300*(.2+.8*breath)*slow,now,.45);
  v.pan.pan.setTargetAtTime(Math.sin(t*.085+i*1.2)*(.4+.4*space),now,.38);
 });
 // A stochastic score, one crystallization every 2.5-6 seconds. No flashing.
 if(now>h.nextBell){
  h.seed=(Math.imul(h.seed,1664525)+1013904223)>>>0;
  const rand=h.seed/4294967296;
  const degree=NOTES[Math.floor(rand*NOTES.length)];
  const fundamental=[73.42,82.41,65.41,87.31,73.42,61.74,82.41,55][scene]||73.42;
  this.hyperBell(fundamental*Math.pow(2,(12+degree)/12),now+.05,.55+.2*altitude);
  h.nextBell=now+2.5+rand*3.8;
 }
 h.visualImpulse*=Math.exp(-dt*1.4);
};
})();
