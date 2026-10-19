/*
  THE UNSEEN IV — SHEPARD / RISSET-LIKE AUDITORY HELIX
  Eight carefully windowed sine carriers cycle over four octaves.
  The ensemble creates an ambiguous endlessly climbing auditory contour.
  It changes pitch continuously, not brightness and not brainwave frequencies.
*/
(()=>{
"use strict";
const p=window.UnseenAudio?.prototype;if(!p)return;
const init=p.initHyper,update=p.updateHyper;
p.initHyper=function(){
 init.call(this);
 if(this.risset||!this.ac)return;
 const ac=this.ac;
 const bus=ac.createGain();bus.gain.value=.22;bus.connect(this.dry);
 const wet=ac.createGain();wet.gain.value=.12;wet.connect(this.reverbInput||this.wet);
 const tones=[];
 for(let i=0;i<8;i++){
  const carrier=ac.createOscillator(),gain=ac.createGain(),pan=ac.createStereoPanner();
  carrier.type="sine";carrier.frequency.value=75*Math.pow(2,i*.5);
  gain.gain.value=.00001;pan.pan.value=Math.sin(i*2.4)*.4;
  carrier.connect(gain);gain.connect(pan);pan.connect(bus);pan.connect(wet);carrier.start();
  tones.push({carrier,gain,pan,i});
 }
 this.risset={tones,bus,wet,last:0,orientation:1};
};
p.updateHyper=function(t,scene,a,b,space,px){
 update.call(this,t,scene,a,b,space,px);
 const r=this.risset,ac=this.ac;if(!r||!this.active||!ac)return;
 const now=ac.currentTime;if(now-r.last<.11)return;r.last=now;
 const direction=scene===3||scene===7?-1:1;
 const length=43+scene*2;
 const travel=(t/length*direction)%1;
 const root=[55,62,49,65,55,46,61,52][scene]||55;
 r.tones.forEach(({carrier,gain,pan,i})=>{
  const k=((i/8+travel)%1+1)%1;
  const frequency=root*Math.pow(2,4*k);
  const window=Math.sin(Math.PI*k)**2;
  carrier.frequency.setTargetAtTime(frequency,now,.085);
  gain.gain.setTargetAtTime(.011*window,now,.16);
  pan.pan.setTargetAtTime(Math.sin(t*.047+i*.785)*(.12+.48*space),now,.34);
 });
};
})();
