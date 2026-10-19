/* THE UNSEEN / SONIC ARCHITECTURE
   Entirely synthesized in the browser: no recordings, external assets or binaural-beat claims.
   Sixteen tonal oscillators + noise textures + independent moving sources + algorithmic reverb.
   Slow gain envelopes preserve comfortable listening; no 15 Hz rhythmic entrainment. */
window.UnseenAudio=class UnseenAudio {
 constructor(){this.ac=null;this.active=false;this.voices=[];this.last=0;this.master=null;this.anal=null;this.buf=null;this.modes=[
  [0,3,7,10,14,17,22,24],[0,1,5,7,10,12,15,19],[0,2,7,9,12,14,17,21],
  [0,3,7,10,12,19,22,26],[-12,0,5,7,12,17,19,24],[0,1,6,7,12,13,18,19],
  [0,2,3,7,9,12,14,19],[-12,-5,0,2,7,10,12,17]]}
 init(){
  if(this.ac)return;
  const C=window.AudioContext||window.webkitAudioContext;
  if(!C)throw new Error("Web Audio API unavailable");
  const ac=this.ac=new C();
  this.master=ac.createGain();this.master.gain.value=0;
  const eq=ac.createBiquadFilter();eq.type="highpass";eq.frequency.value=32;
  const limiter=ac.createDynamicsCompressor();limiter.threshold.value=-23;limiter.knee.value=18;limiter.ratio.value=9;limiter.attack.value=.012;limiter.release.value=.34;
  this.anal=ac.createAnalyser();this.anal.fftSize=256;this.freq=new Uint8Array(this.anal.frequencyBinCount);
  this.master.connect(eq);eq.connect(limiter);limiter.connect(this.anal);this.anal.connect(ac.destination);
  // Algorithmic room impulse: randomized, decaying stereo reflections, bandwidth softened.
  const length=Math.round(ac.sampleRate*2.8),ir=ac.createBuffer(2,length,ac.sampleRate);
  for(let ch=0;ch<2;ch++){let dat=ir.getChannelData(ch),seed=ch?1729:4141,last=0;for(let n=0;n<length;n++){seed=(1664525*seed+1013904223)>>>0;let v=seed/4294967295*2-1;last=last*.32+v*.68;dat[n]=last*Math.exp(-n/(ac.sampleRate*.51))*.58;}}
  const conv=ac.createConvolver();conv.buffer=ir;this.reverbInput=conv;this.wet=ac.createGain();this.wet.gain.value=.35;conv.connect(this.wet);this.wet.connect(this.master);
  const dry=ac.createGain();dry.gain.value=.64;dry.connect(this.master);this.dry=dry;
  const pingL=ac.createDelay(2),pingR=ac.createDelay(2),feedbackL=ac.createGain(),feedbackR=ac.createGain(),pingMix=ac.createGain();
  pingL.delayTime.value=.371;pingR.delayTime.value=.517;feedbackL.gain.value=.23;feedbackR.gain.value=.21;pingMix.gain.value=.21;
  pingL.connect(feedbackL);feedbackL.connect(pingR);pingR.connect(feedbackR);feedbackR.connect(pingL);
  pingL.connect(pingMix);pingR.connect(pingMix);pingMix.connect(this.master);
  this.delayIn=pingL;
  const root=73.42;
  for(let i=0;i<8;i++){
   const voiceGain=ac.createGain();voiceGain.gain.value=.0001;
   const filter=ac.createBiquadFilter();filter.type=i%2?"lowpass":"bandpass";filter.frequency.value=250+i*100;filter.Q.value=i%2?.55:1.7;
   const panner=ac.createStereoPanner(),dryTap=ac.createGain(),wetTap=ac.createGain();
   dryTap.gain.value=.7;wetTap.gain.value=i%2?.5:.3;
   voiceGain.connect(filter);filter.connect(panner);panner.connect(dryTap);panner.connect(wetTap);
   dryTap.connect(dry);wetTap.connect(conv);
   if(i<5){const tap=ac.createGain();tap.gain.value=.10;wetTap.connect(tap);tap.connect(this.delayIn)}
   const primary=ac.createOscillator(),second=ac.createOscillator();
   primary.type=["sine","triangle","sine","sine","triangle","sine","sawtooth","sine"][i];
   second.type=["sine","sine","triangle","sine","sine","triangle","sine","sine"][i];
   const left=ac.createGain(),right=ac.createGain();left.gain.value=i===0?.22:.11;right.gain.value=.055;
   primary.connect(left);left.connect(voiceGain);second.connect(right);right.connect(voiceGain);
   primary.frequency.value=root*Math.pow(2,this.modes[0][i]/12);second.frequency.value=primary.frequency.value*2.001;
   second.detune.value=i%2?3.1:-3.1;primary.start();second.start();
   this.voices.push({i,primary,second,voiceGain,filter,panner});
  }
  // Two independently filtered diffuse noise beds; sounds like air and moving surf.
  const nb=ac.createBuffer(1,ac.sampleRate*4,ac.sampleRate),d=nb.getChannelData(0);
  let state=22337,brown=0;
  for(let n=0;n<d.length;n++){state=(Math.imul(state,1664525)+1013904223)>>>0;const white=state/4294967295*2-1;brown=(brown+.02*white)/1.02;d[n]=brown*1.8;}
  this.noise=[];
  for(let i=0;i<2;i++){
   const node=ac.createBufferSource();node.buffer=nb;node.loop=true;
   const filter=ac.createBiquadFilter();filter.type=i?"highpass":"lowpass";filter.frequency.value=i?580:210;filter.Q.value=.6;
   const gain=ac.createGain();gain.gain.value=i?.035:.032;const pan=ac.createStereoPanner();pan.pan.value=i?-.5:.5;
   node.connect(filter);filter.connect(gain);gain.connect(pan);pan.connect(dry);pan.connect(conv);node.start();
   this.noise.push({filter,gain,pan});
  }
  this.retune(0);
  this.setSpace(.68);
  this.initHyper?.();
 }
 retune(scene=0){if(!this.ac)return;const n=this.ac.currentTime,notes=this.modes[scene]||this.modes[0];
  this.voices.forEach(v=>{const f=73.42*Math.pow(2,notes[v.i]/12);v.primary.frequency.setTargetAtTime(f,n,2.1);v.second.frequency.setTargetAtTime(f*2.002,n,2.4)});this.retuneHyper?.(scene);}
 setSpace(x){if(!this.ac)return;const n=this.ac.currentTime;this.wet.gain.setTargetAtTime(.11+.45*x,n,.25);this.dry.gain.setTargetAtTime(.65-.12*x,n,.25);}
 setVolume(x){this.volume=x;if(this.ac&&this.active)this.master.gain.setTargetAtTime(.03+.18*x,this.ac.currentTime,.15)}
 async toggle(on){try{if(!this.ac)this.init();await this.ac.resume();this.active=on===undefined?!this.active:!!on;this.master.gain.cancelScheduledValues(this.ac.currentTime);this.master.gain.setTargetAtTime(this.active?.03+.18*(this.volume??.46):0,this.ac.currentTime,.18);if(this.active)this.transitionChime?.(0);return this.active}catch(e){console.warn("Audio failed",e);return false}}
 update(t,scene,stateA,stateB,flux,space,px){
  if(!this.ac||!this.active||t-this.last<.055)return 0;this.last=t;
  const now=this.ac.currentTime;
  this.voices.forEach(v=>{
   let i=v.i;
   const breath=Math.sin(t*(.13+i*.007)+i*.89);
   const slow=.5+.5*Math.sin(t*.043+i*.73);
   const amplitude=(.055+slow*.14)*(i<3?1.1:.7)*(1+.1*stateA*Math.sin(i));
   v.voiceGain.gain.setTargetAtTime(amplitude,now,.32);
   const open=190+2800*slow*(.35+.65*space)+320*(.5+.5*stateB);
   v.filter.frequency.setTargetAtTime(open,now,.27);
   v.panner.pan.setTargetAtTime(Math.sin(t*(.075+i*.009)+i*1.9)*(.2+.75*space)+(.5-px)*.16,now,.3);
   v.primary.detune.setTargetAtTime(breath*5+stateA*1.6*flux,now,.17);
  });
  this.noise.forEach((n,i)=>{n.pan.pan.setTargetAtTime(Math.sin(t*.1+i*2.4)*space,now,.3);n.gain.gain.setTargetAtTime((i?.016:.021)*(1+.25*Math.sin(t*.3+i)),now,.35)});
  this.updateHyper?.(t,scene,stateA,stateB,space,px);
   this.anal.getByteFrequencyData(this.freq);let sum=0;for(let i=1;i<28;i++)sum+=this.freq[i];return Math.min(1,sum/(27*160));
 }
 getSpectrum(){
  if(!this.ac||!this.active||!this.anal)return [0,0,0,0];
  this.anal.getByteFrequencyData(this.freq);
  const bands=[[1,6],[6,16],[16,35],[35,68]];
  if(!this.spectrum)this.spectrum=[0,0,0,0];
  bands.forEach(([a,b],i)=>{let sum=0;for(let k=a;k<Math.min(b,this.freq.length);k++)sum+=this.freq[k];const next=Math.min(1,sum/((b-a)*105));this.spectrum[i]=this.spectrum[i]*.80+next*.20;});
  return this.spectrum;
 }
 /* Breathing follows a slow visual envelope; never pulses at micro-epoch frequencies. */
 setBreath(level){
  if(!this.ac||!this.active)return;
  const n=this.ac.currentTime,amount=Math.max(0,Math.min(1,level));
  if(n-(this.lastBreathUpdate??-1)<.08)return;
  this.lastBreathUpdate=n;this.setBreathHyper?.(level);
  this.noise.forEach((v,i)=>{
   v.filter.frequency.setTargetAtTime((i?420:160)+(i?780:260)*amount,n,.27);
  });
 }
 breathCue(inhale){
  if(!this.ac||!this.active)return;
  const ac=this.ac,n=ac.currentTime;
  const g=ac.createGain(),o=ac.createOscillator(),p=ac.createStereoPanner();
  o.type="sine";o.frequency.setValueAtTime(inhale?392:329.63,n);
  o.frequency.exponentialRampToValueAtTime(inhale?440:293.66,n+.72);
  p.pan.setValueAtTime(inhale?-.24:.24,n);
  g.gain.setValueAtTime(.0001,n);
  g.gain.exponentialRampToValueAtTime(.012,n+.14);
  g.gain.exponentialRampToValueAtTime(.0001,n+1.85);
  o.connect(g);g.connect(p);p.connect(this.master);o.start(n);o.stop(n+1.88);
 }
 impulse(pitch=0){
  if(!this.ac||!this.active)return;const ac=this.ac,n=ac.currentTime;
  // Interaction event: a soft, pitched bead through reverb and space.
  const o=ac.createOscillator(),g=ac.createGain(),f=ac.createBiquadFilter(),pan=ac.createStereoPanner();
  o.type="sine";const note=180+pitch*420;o.frequency.setValueAtTime(note*1.45,n);o.frequency.exponentialRampToValueAtTime(note,n+.22);
  f.type="lowpass";f.frequency.value=1500;pan.pan.value=pitch*1.8-1;
  g.gain.setValueAtTime(.0001,n);g.gain.exponentialRampToValueAtTime(.07,n+.016);g.gain.exponentialRampToValueAtTime(.0001,n+1.6);
  o.connect(g);g.connect(f);f.connect(pan);pan.connect(this.dry);pan.connect(this.wet);o.start(n);o.stop(n+1.65);
 }
 suspend(){if(this.ac&&this.active)this.ac.suspend().catch(()=>{})}
 resume(){if(this.ac&&this.active)this.ac.resume().catch(()=>{})}
};
