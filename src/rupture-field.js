/*
 * THE UNSEEN V / RUPTURE FIELD
 * Procedural shattered-light, geometric discontinuities, liquid chrome and moiré lattice.
 * Original GLSL equations. Temporal motion and shape warps; NO deliberate wide-area strobing.
 * Requires only the original uniforms: uTime, uSpeed, uMode, uFlux, uBreath,
 * uSpectrum, uStateA/B, and uPalette from the existing shaders.
 */
(()=>{
 "use strict";
 const shader=window.UNSEEN_SHADERS;
 if(!shader || typeof shader.fragment!=="string")return;
 const src=`
vec2 v5Fold(vec2 p,float t){
  float n=fbm(p*2.1+vec2(t*.17,-t*.11));
  // Keep discontinuities local rather than globally flashing.
  float edge=sin(p.y*11.+n*6.+t*.52);
  p.x+=.055*sin(p.y*31.+t*1.7)*smoothstep(.60,.82,n);
  p.y+=.032*sin(p.x*18.-t*1.15)+.014*sin(edge*12.);
  return p;
}
vec3 v5Breakage(vec2 p,float t,float scene){
 float r=length(p),a=atan(p.y,p.x);
 float angle=a+log(r+.12)*.94;
 float roar=sin(t*.25+scene*1.17);
 float raw=0.;
 float n=fbm(p*2.7+vec2(t*.15,-t*.11));
 vec2 q=rot(p,t*(scene<3.?.18:-.17));
 // Fractal cuts, rotated and repeated into crystalline hard-light surfaces.
 vec2 fold=q;
 for(int i=0;i<5;i++){
   fold=abs(fold)-vec2(.11,.17);
   fold=rot(fold,.55+.11*sin(t*.15+float(i)));
   raw+=exp(-abs(length(fold)-.16)*105.)*.14;
 }
 float lattice=pow(max(0.,.5+.5*cos(q.x*29.+sin(q.y*17.+t)*1.3)),25.);
 float spiral=pow(max(0.,.5+.5*cos(angle*16.-r*49.+t*1.15)),23.);
 float moire=pow(max(0.,.5+.5*cos((p.x+p.y)*37.+6.*fbm(p*6.+t*.11))),30.);
 float knife=exp(-abs(sin(a*19.+r*16.+t*.56))/.027)*ring(r,.35,.3);
 float vacuum=exp(-r*3.2);
 // Spectral motion affects local contours, not whole-frame luminance.
 float bass=uSpectrum.x,treble=uSpectrum.z;
 vec3 ice=vec3(.07,.97,1.16),hot=vec3(1.1,.09,.71),violet=vec3(.65,.19,1.12);
 vec3 cool=ice*spiral*.1+hot*lattice*.085+violet*moire*.06;
 float shred=raw*(.33+.11*sin(scene*1.91));
 vec3 c=cool + palette(.31+n*.4+scene*.06)*shred*.2;
 if(scene<1.5){c+=ice*knife*.05+hot*vacuum*moire*.028;}
 else if(scene<3.5){c+=violet*spiral*ring(r,.39,.4)*.13;}
 else if(scene<5.5){c+=ice*raw*ring(r,.55,.36)*.07;}
 else {c+=hot*knife*.038+violet*spiral*.025;}
 c+=palette(t*.012+.63)*bass*.02*ring(r,.26+treble*.025,.19);
 // Moving color separation: apparent surface dislocation.
 float split=.013*sin(t*.24+scene*1.71);
 vec2 offset=vec2(split,-split*.47);
 float sig=exp(-length(p-offset)*5.)*raw;
 c+=vec3(.1,.03,.18)*sig*.08;
 return c;
}
`;
 // Append functions just before fragment main. Hyperfield was already appended earlier.
 if(!shader.fragment.includes("vec3 v5Breakage")){
   shader.fragment=shader.fragment.replace("void main(){",src+"\nvoid main(){");
   shader.fragment=shader.fragment.replace(
     "vec2 p=rot(uv*(1.07-.14*uBreath),.016*a*uFlux+.025*b*uFlux);",
     "vec2 p=rot(uv*(1.07-.14*uBreath),.016*a*uFlux+.025*b*uFlux); p=v5Fold(p,t);"
   );
   shader.fragment=shader.fragment.replace(
     "float warp=fbm(p*2.+t*.034);",
     "col+=v5Breakage(p,t,region);\n  float warp=fbm(p*2.+t*.034);"
   );
 }
})();
