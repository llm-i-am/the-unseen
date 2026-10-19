/*
 * THE UNSEEN IV · OPTICAL ARCHITECTURE
 * A collection of original light-field illusions composed over the base GLSL worlds.
 * References that inspired approaches, not copied code:
 * - optokinetic flow / vection research, doi:10.1146/annurev-vision-121423-013200
 * - chromostereopsis, PMCID: PMC4382974
 * - glsl shader organization: patriciogonzalezvivo/lygia
 * - neural content multiplexing: doi:10.64898/2026.10.15.759299
 * No deliberate repetitive global luminance flashing.
 */
(function () {
  "use strict";
  const shader = window.UNSEEN_SHADERS;
  if (!shader?.fragment) return;
  const header = "uniform vec4 uSpectrum;\nuniform float uJourney,uArc;\n";
  const definitions = `
float hfLine(float d,float width){return exp(-abs(d)/max(.001,width));}
vec3 hfHue(float k){return palette(fract(k));}
vec3 hyperfield(vec2 p,float t,float mode,float a,float b){
  float r=length(p),th=atan(p.y,p.x);
  float breath=uBreath-.5;
  vec3 color=vec3(0.);
  float excursion=.5+.5*sin(t*.11+uJourney*5.);
  float first=max(0.,uSpectrum.x),middle=max(0.,uSpectrum.y),upper=max(0.,uSpectrum.z);
  vec2 eye=vec2((uPointer.x-.5)*.09,(uPointer.y-.5)*.09);
  if(mode<.5){
    // A slowly rotating Penrose-like family of nested elliptical light paths.
    vec2 q=rot(p,.11*t+.33*sin(uJourney*5.));
    float rings=0.;
    for(int i=0;i<7;i++){
      float k=float(i);
      vec2 loop=rot(q,k*.44+.2*sin(t*.13+k));
      float radius=length(loop*vec2(1.+.28*sin(k),.76+.22*cos(k)));
      float level=.20+k*.072+.025*sin(k*1.3+t*.16);
      rings+=hfLine(radius-level,.0032+.0015*k)*(.7-.055*k);
    }
    color=hfHue(.43+.18*sin(th*5.))*rings*.11;
    float throat=pow(max(0.,.5+.5*cos(th*11.+log(r+.04)*15.+t*.28)),22.);
    color+=vec3(.28,.46,1.)*throat*exp(-r*3.)*.055;
  }else if(mode<1.5){
    // Competing visual hypotheses, with different coordinate systems, not alternating flashes.
    vec2 qa=rot(p+eye*.5,.19*t);
    vec2 qb=rot(p-eye*.5,-.13*t);
    float stripes=hfLine(sin(qa.x*28.+sin(qa.y*8.+t*.16)*2.),.07);
    float rings=hfLine(sin(length(qb)*39.+atan(qb.y,qb.x)*3.),.075);
    float mask=smoothstep(-.28,.28, sin(p.x*2.7+fbm(p*2.8)*2.7+t*.08));
    vec3 first=vec3(.03,.73,.87)*stripes;
    vec3 second=vec3(.70,.20,1.)*rings;
    color+=mix(first,second,mask)*.11;
    // Cross-patch state affects direction and curvature (not screen brightness).
    color+=hfHue(.2+mask*.5)*hfLine(sin((p.x+a*.012)*11.+p.y*9.+b*.02),.06)*.021;
  }else if(mode<2.5){
    // Nested Lissajous orbits, quasiperiodic frequency ratios based on golden angle.
    float k=0.;
    for(int i=0;i<7;i++){
      float j=float(i)+1.;
      vec2 q=p+vec2(.22*sin(t*.09+j*2.39),.22*cos(t*.11+j*1.67));
      float orbit=sin(atan(q.y,q.x)*j*2.+t*.055*j+sin(length(q)*j*8.)*.55);
      k+=hfLine(orbit,.043)*exp(-length(q)*1.9)/(j*.47+1.);
    }
    color=hfHue(th/6.283+.2)*k*.15;
  }else if(mode<3.5){
    // A double-exposure field: the suppressed state occupies a different perspective.
    vec2 q=rot(p+eye*.6,t*.056);
    vec2 q2=rot(p-eye*.6,-t*.062);
    float ghost1=hfLine(sin(length(q)*37.+atan(q.y,q.x)*7.),.045);
    float ghost2=hfLine(sin(length(q2)*35.-atan(q2.y,q2.x)*8.),.045);
    float weight=.5+.22*a;
    color=vec3(.16,.64,.96)*ghost1*(.035+.07*weight)+vec3(.64,.29,1.)*ghost2*(.11-.065*weight);
  }else if(mode<4.5){
    // Infinite hallway of glowing arches, expanding in perspective.
    float sum=0.;
    for(int i=0;i<10;i++){
      float j=float(i);
      float z=fract(j/10.+t*.025);
      vec2 q=p*(.2+z*z*4.);
      float doorway=abs(q.x)-(.27+.09*sin(q.y*2.+j*.4));
      float crown=length(vec2(max(0.,abs(q.x)-.27),max(0.,q.y-.16)))-.29;
      float edge=min(abs(doorway),abs(crown));
      float shape=hfLine(edge,.007)*smoothstep(.12,.93,z);
      sum+=shape*(1.-z)*.72;
    }
    color=vec3(.35,.59,1.)*sum*.18;
  }else if(mode<5.5){
    // Recursive fold with moiré bands; no global blinking.
    vec2 q=p;
    float n=0.;
    for(int i=0;i<8;i++){
      float k=float(i);
      q=abs(q)-vec2(.13+.025*sin(t*.064+k),.17);
      q=rot(q,.65+.08*sin(k+t*.08));
      n+=hfLine(length(q)-.13,.008)/(1.+k*.35);
    }
    color=hfHue(.5+fbm(q*3.5))*.19*n;
    color+=vec3(.09,.41,.66)*hfLine(sin(q.x*50.+q.y*36.),.045)*exp(-r*1.4)*.024;
  }else if(mode<6.5){
    // Expanding and contracting optic flow on separate strata.
    // Contradictory radial signs create ambiguous perceived travel.
    vec2 far=p+eye*.3,near=p-eye*.4;
    float outward=hfLine(sin(log(length(far)+.06)*30.-t*.62),.10);
    float inward=hfLine(sin(log(length(near)+.06)*25.+t*.49),.09);
    float foam=hfLine(sin(atan(p.y,p.x)*21.+fbm(p*8.+t*.04)*4.),.08);
    color=vec3(.04,.67,.83)*outward*.095+vec3(.39,.21,1.)*inward*.085;
    color+=hfHue(.75)*foam*exp(-r*1.1)*.05;
  }else{
    // Warped lensing rings and low-luminance nebula.
    float lens=th+(.29/(r+.14))+.05*t;
    float disc=hfLine(length(p*vec2(1.,2.3))-.39,.023);
    float caustic=hfLine(sin(lens*23.+r*28.+t*.18),.065);
    color=vec3(.68,.38,.94)*disc*(.06+.14*caustic);
    color+=vec3(.18,.62,.96)*hfLine(r-.23,.004)*.1;
  }
  // Perceptual integration: cross-modal sound controls spatial size/sheen, not rapid light flashes.
  float harmonicCloud=fbm(p*(2.1+.12*middle)+vec2(t*.019,-t*.013));
  vec3 haze=hfHue(.48+.22*harmonicCloud)*exp(-r*2.8)*(.006+.008*middle);
  color+=haze;
  // Gentle persistent chromatic depth: cyan/magenta separation, not red strobes.
  float chroma=hfLine(r-(.38+.09*sin(th*3.+t*.09)),.005);
  color+=vec3(.036,.08,.18)*chroma*(.5+.5*excursion);
  return max(color,vec3(0.));
}
`;
  shader.fragment = shader.fragment.replace("void main(){", header + definitions + "void main(){");
  shader.fragment = shader.fragment.replace(
    "float warp=fbm(p*2.+t*.034);",
    "col += hyperfield(p,t,region,a,b)*(1.05+.18*uArc);\n  float warp=fbm(p*2.+t*.034);"
  );
})();
