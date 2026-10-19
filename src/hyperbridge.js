/* THE UNSEEN IV / GPU-AUDIO BRIDGE.
   Optional GLSL uniforms are fed by the live audio analyser and journey arc.
   Gracefully degrades to original visuals in WebGL1/2D or unsupported contexts.
 */
(()=>{
  "use strict";
  const canvas=document.getElementById("stage");
  const runtime=window.UNSEEN_RUNTIME;
  if(!canvas||!runtime)return;
  let gl=null,program=null,locations=null,last=0;
  let spectral=[0,0,0,0];
  function loop(now){
    requestAnimationFrame(loop);
    if(now-last<34)return;
    last=now;
    const state=runtime.state;
    const im=window.UNSEEN_IMMERSION;
    if(im&&im.running)state.journey=Math.min(1,Math.max(0,im.elapsed/340));
    else state.journey=0;
    if(state.reduced)return;
    try{
      if(!gl)gl=canvas.getContext("webgl2");
      if(!gl)return;
      const current=gl.getParameter(gl.CURRENT_PROGRAM);
      if(!current)return;
      if(program!==current){
        program=current;
        locations={
          bands:gl.getUniformLocation(program,"uSpectrum"),
          journey:gl.getUniformLocation(program,"uJourney"),
          arc:gl.getUniformLocation(program,"uArc")
        };
      }
      gl.useProgram(program);
      const fresh=runtime.audio.getSpectrum?.()||[0,0,0,0];
      for(let i=0;i<4;i++)spectral[i]=spectral[i]*.78+(fresh[i]||0)*.22;
      if(locations.bands!==null)gl.uniform4f(locations.bands,...spectral);
      if(locations.journey!==null)gl.uniform1f(locations.journey,state.journey);
      if(locations.arc!==null)gl.uniform1f(locations.arc,runtime.audio.hyper?.visualImpulse||0);
    }catch(err){
      // Context may be lost: the base renderer handles restoration.
      program=null;locations=null;
    }
  }
  requestAnimationFrame(loop);
  window.UNSEEN_VOLUME_IV={ready:true,version:4,get spectrum(){return spectral.slice()}};
})();
