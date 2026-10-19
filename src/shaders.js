/* THE UNSEEN / VISUAL ENGINE — original GLSL ES 3.00 and WGSL.
   Continuous luminous geometry, no high-frequency brightness strobing.
   Neural micro-epochs modulate slowly integrated morphology only. */
window.UNSEEN_SHADERS = {
vertex: `#version 300 es
precision highp float;
void main(){vec2 p=vec2(gl_VertexID==1?3.:-1.,gl_VertexID==2?3.:-1.);gl_Position=vec4(p,0.,1.);}`,
fragment: `#version 300 es
precision highp float;
out vec4 outColor;
uniform vec2 uResolution,uPointer,uTouchPoint;
uniform float uTime,uMode,uEnergy,uDensity,uDepth,uFlux,uStateA,uStateB,uOnOff,uBand,uBeat,uTouchAge,uPalette,uSpeed;
#define PI 3.141592653589793
#define TAU 6.283185307179586
float sat(float x){return clamp(x,0.,1.);}
float hash21(vec2 p){p=fract(p*vec2(123.34,345.45));p+=dot(p,p+34.345);return fract(p.x*p.y);}
float hash11(float x){return fract(sin(x*43.271)*43758.5453);}
vec2 rot(vec2 v,float a){float s=sin(a),c=cos(a);return vec2(c*v.x-s*v.y,s*v.x+c*v.y);}
float noise(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(hash21(i),hash21(i+vec2(1,0)),f.x),mix(hash21(i+vec2(0,1)),hash21(i+1.),f.x),f.y);}
float fbm(vec2 p){float a=0.,v=.5;for(int i=0;i<5;i++){a+=v*noise(p);p=rot(p*2.07,.36);v*=.49;}return a;}
float line(float x,float w){return exp(-max(0.,abs(x))/max(w,.001));}
float ring(float r,float at,float w){return exp(-pow((r-at)/max(w,.001),2.));}
float spark(vec2 p,vec2 at,float w){return exp(-length(p-at)/w);}
vec3 palette(float a){
 vec3 p0=vec3(.08,.37,.95),p1=vec3(.5,.13,1.13),p2=vec3(.02,.94,.87);
 if(uPalette>.5&&uPalette<1.5){p0=vec3(.02,.77,.76);p1=vec3(.05,.36,.93);p2=vec3(.8,.85,.45);}
 if(uPalette>1.5){p0=vec3(1.,.28,.06);p1=vec3(.76,.05,.48);p2=vec3(1.,.72,.28);}
 return p0*.55+p1*.34*cos(TAU*(vec3(.0,.22,.47)+a))*.6+p2*(.2+.5*sin(a*2.7));
}
vec3 grade(vec3 c){
 c=max(c,0.);
 c*=1.04+uEnergy*1.7;
 c=1.-exp(-c*.74);
 return pow(max(c,0.),vec3(.93,.97,1.04));
}
vec3 stars(vec2 p,float t){
 vec3 c=vec3(0.);
 for(int i=0;i<3;i++){
  float sc=22.*pow(2.,float(i));
  vec2 q=p*sc,cell=floor(q),f=fract(q)-.5;
  float h=hash21(cell),gate=smoothstep(.987,.997,h);
  vec2 shift=vec2(hash21(cell+3.8),hash21(cell+5.2))-.5;
  float v=gate*pow(sat(1.-length(f-shift)*2.),14.);
  c+=(.2+.35*float(i))*v*palette(h+float(i));
 }
 return c;
}
vec3 aperture(vec2 p,float t,float a,float b){
 vec2 q=p;float r=length(q),ang=atan(q.y,q.x);
 float swirl=ang+1.14*log(r+.32)+t*.16+fbm(q*2.4+t*.08)*.65;
 float distortion=fbm(vec2(swirl*2.7,r*4.1)-t*.07);
 float core=ring(r,.29+.09*sin(swirl*3.3),.029+.012*uDensity);
 float strand=pow(sat(.5+.5*cos(ang*17.+11.*log(r+.31)-t*.65+distortion*6.+a*.36)),12.);
 float ribbon=pow(sat(.5+.5*cos(ang*7.-r*17.+t*.34+distortion*3.+b*.2)),10.);
 float atmosphere=exp(-r*4.)*(.12+.2*fbm(q*8.+t*.06));
 float halo=ring(r,.43,.19)*(.08+.12*sin(ang*9.+t*.16));
 float ray=pow(sat(.5+.5*cos(ang*37.+sin(r*8.)*3.)),24.)*exp(-r*2.7);
 vec3 c=palette(swirl*.13+r*1.4)*(.13*halo+.19*atmosphere+strand*.47*ring(r,.44,.27)+ribbon*.28*ring(r,.42,.25)+ray*.12);
 c+=vec3(.5,.64,1.2)*core*.36;
 c+=vec3(.07,.12,.26)*exp(-r*18.)*.5;
 c+=palette(r+t*.1)*ring(r,.73,.23)*.034;
 return c;
}
vec3 rivalry(vec2 p,float t,float a,float b){
 vec2 q=rot(p,t*.055);
 float n=fbm(q*2.1+vec2(a*.17,b*.14));
 float checker=sin((q.x+q.y*.33)*17.+sin(q.y*7.+t*.36)*1.4)*cos((q.y-q.x*.18)*16.);
 float lattice=pow(sat(1.-abs(checker)),10.);
 float rings=pow(sat(.5+.5*cos(length(q+vec2(.13*sin(t*.1),0.))*55.-t*.48+n*4.)),14.);
 float spiral=pow(sat(.5+.5*cos(atan(q.y,q.x)*12.+length(q)*30.+t*.23)),18.);
 float boundary=.5+.5*sin(q.x*3.3+q.y*1.5+fbm(q*3.)*3.+t*.14);
 float mixv=smoothstep(.25,.75,boundary+.16*a-.1*b);
 vec3 x=palette(.2+q.x*.2)*(lattice*.35+spiral*.22);
 vec3 y=palette(.72+q.y*.3)*(rings*.42+lattice*.08);
 return mix(x,y,mixv)+palette(n)*.03*exp(-length(q));
}
vec3 multiplex(vec2 p,float t,float a,float b){
 float r=length(p),ang=atan(p.y,p.x);
 vec3 col=vec3(0.);
 for(int i=0;i<16;i++){
  float j=float(i),phase=j*2.399963;
  vec2 o=vec2(cos(phase),sin(phase))*(.1+j*.048);
  vec2 v=p-o-vec2(.024*sin(t*.27+j*.6),.024*cos(t*.23+j*.8));
  float x=length(v);float petal=sin(atan(v.y,v.x)*(4.+mod(j,4.)) + t*.16+j)*.017;
  float wire=ring(x,.11+petal,.004+.003*uDensity);
  float bloom=ring(x,.11+petal,.05);
  col+=palette(j*.097+a*.03)*(wire*.20+bloom*.007);
 }
 col+=palette(ang/TAU)*ring(r,.50,.16)*.09;
 col+=palette(r*.4)*pow(sat(.5+.5*sin(ang*25.+r*33.-t*.38)),17.)*.035;
 return col;
}
vec3 ghost(vec2 p,float t,float a,float b){
 vec2 q=rot(p,-.09*t);float n=fbm(q*4.+t*.09);
 vec3 c=vec3(0.);
 for(int i=0;i<8;i++){
  float j=float(i),s=1.+j*.073;
  vec2 v=q*s+vec2(sin(t*.17+j*1.2)*.06,cos(t*.1+j*.6)*.05);
  float rr=length(v)-.17*sin(atan(v.y,v.x)*5.+t*.07);
  float trace=ring(rr,.38+j*.024+n*.01,.006+j*.001);
  c+=palette(j*.13+.12)*(trace*.12);
 }
 float veil=pow(sat(.5+.5*cos(q.x*18.+sin(q.y*6.+t*.18)*2.)),18.);
 c+=palette(n)*veil*.045*ring(length(q),.45,.43);
 c+=palette(.6+q.x*.2)*exp(-length(q)*3.)*.035;
 return c;
}
vec3 cathedral(vec2 p,float t,float a,float b){
 vec2 q=p;float ang=atan(q.y,q.x);
 vec3 c=vec3(0.);
 for(int i=0;i<9;i++){
  float j=float(i),z=fract(j/9.+t*.043),scale=mix(.07,3.4,z*z);
  vec2 v=q*scale;float xx=abs(v.x),yy=v.y;
  float arch=abs(length(vec2(xx,max(0.,yy*.55+.21)))-.65);
  float ribs=exp(-abs(xx-(.32+.12*sin(yy*4.+j)))/.009);
  float grid=exp(-abs(sin(yy*9.+a*.17))/.05)*.4;
  float beam=exp(-arch/.016)*(1.-z)*.33;
  c+=palette(z+.1)*beam*.38 + palette(z+.3)*ribs*grid*.021;
 }
 float rose=pow(sat(.5+.5*cos(ang*12.+sin(length(q)*13.+t*.12)*2.)),18.);
 c+=palette(.65)*rose*ring(length(q),.18,.09)*.12;
 c+=palette(.2)*exp(-abs(q.x)*12.)*.013;
 return c;
}
vec3 fold(vec2 p,float t,float a,float b){
 vec2 q=p;float d=0.;
 for(int i=0;i<7;i++){q=abs(q)-vec2(.19,.14);q=rot(q,.41+sin(t*.11+float(i))*.09);d+=exp(-abs(length(q)-.24)*70.)*.12;}
 float field=fbm(q*12.+t*.07),wire=pow(sat(.5+.5*cos(q.x*70.+field*3.)),19.);
 float orb=exp(-length(p)*2.8);
 return palette(field+atan(q.y,q.x)*.07)*(d*.29+wire*orb*.09)+palette(.7)*orb*.016;
}
vec3 neuralSea(vec2 p,float t,float a,float b){
 vec2 q=p*2.5;
 float s=0.,glow=0.;vec3 c=vec3(0.);
 for(int j=0;j<3;j++){
  float k=float(j);vec2 v=rot(q,k*.62+sin(t*.09+k)*.15);
  float n=fbm(v*1.9+t*.11+k*7.);
  float wave=sin(v.x*9.+n*5.+t*.52)*cos(v.y*8.-n*4.-t*.31);
  float fibril=pow(sat(.5+.5*wave),20.);
  c+=palette(k*.2+.08+n*.22)*fibril*.065;
  s+=n/3.;
 }
 for(int i=0;i<11;i++){
  float fi=float(i),ph=fi*2.399+uTime*.085;
  vec2 o=vec2(cos(ph+fi),sin(ph-fi*.18))*(.13+.058*fi);
  float pt=exp(-length(p-o)*55.)*(.4+.6*hash11(fi*2.1));
  c+=palette(fi*.12)*pt*.32;
 }
 glow=exp(-length(p)*3.)*.05;
 return c+palette(s)*glow;
}
vec3 eventHorizon(vec2 p,float t,float a,float b){
 vec2 q=rot(p,.09*t);float r=length(q),an=atan(q.y,q.x);
 float lens=an+.32/(r+.08)+.2*sin(t*.18);
 float dust=fbm(vec2(lens*3.5,log(r+.12)*4.)+t*.06);
 float disk=exp(-pow((length(vec2(q.x,q.y*2.1))-.37)/.065,2.));
 float filament=pow(sat(.5+.5*cos(lens*48.+r*70.-t*.65+dust*4.)),20.);
 float acc=ring(r,.31,.043)*(.3+.7*filament);
 float photon=ring(r,.22,.008);
 float horiz=1.-smoothstep(.14,.25,r);
 vec3 c=palette(r*.8+t*.035)*disk*(.17+.18*filament);
 c+=palette(lens*.06)*acc*.3;
 c+=vec3(.51,.72,1.08)*photon*.11;
 c*=1.-horiz*.97;
 c+=palette(dust)*ring(r,.68,.24)*filament*.022;
 return c;
}
void main(){
 vec2 uv=(gl_FragCoord.xy-.5*uResolution)/min(uResolution.x,uResolution.y);
 uv*=1.42;uv.x+=(uPointer.x-.5)*uDepth*.12;uv.y+=(uPointer.y-.5)*uDepth*.12;
 float t=uTime*uSpeed;float a=uStateA,b=uStateB;
 // Patch states influence local orientation, not frame-wide illumination.
 vec2 p=rot(uv,.016*a*uFlux+.025*b*uFlux);
 float region=uMode;
 vec3 col=vec3(0.);
 if(region<.5)col=aperture(p,t,a,b);
 else if(region<1.5)col=rivalry(p,t,a,b);
 else if(region<2.5)col=multiplex(p,t,a,b);
 else if(region<3.5)col=ghost(p,t,a,b);
 else if(region<4.5)col=cathedral(p,t,a,b);
 else if(region<5.5)col=fold(p,t,a,b);
 else if(region<6.5)col=neuralSea(p,t,a,b);
 else col=eventHorizon(p,t,a,b);
 float warp=fbm(p*2.+t*.034);
 vec3 background=palette(warp*.14+.14)*(.005+.014*exp(-length(p)*1.8));
 vec3 star=stars(p+vec2(t*.002),t)*.3;
 col=background+col*(.6+uDensity*.85)+star;
 float ripple=ring(length(p-uTouchPoint),max(0.,uTouchAge)*.38,.023+.012*uFlux)*exp(-uTouchAge*1.25);
 col+=palette(uTouchAge*.22+.4)*ripple*.08;
 // Softly integrated auditory spectrum, never high-frequency full-field flashing.
 col+=palette(.16)*uBand*.012*exp(-length(p)*1.5);
 float vignette=1.-smoothstep(.22,1.33,length(p))*.68;
 col=grade(col*vignette);
 float grain=(hash21(gl_FragCoord.xy+fract(t)*239.1)-.5)*.007;
 outColor=vec4(max(col+grain,0.),1.);
}`,
hdr: `
struct Params { resolution:vec2<f32>, time:f32, mode:f32, energy:f32, state:f32, pointer:vec2<f32> };
@group(0) @binding(0) var<uniform> u:Params;
@vertex fn vs(@builtin(vertex_index) i:u32)->@builtin(position) vec4<f32> {
 let p=array<vec2<f32>,3>(vec2<f32>(-1.,-1.),vec2<f32>(3.,-1.),vec2<f32>(-1.,3.));
 return vec4<f32>(p[i],0.,1.);
}
@fragment fn fs(@builtin(position) pos:vec4<f32>)->@location(0) vec4<f32> {
 let p=(pos.xy-.5*u.resolution)/min(u.resolution.x,u.resolution.y)*2.;
 let r=length(p);
 let theta=atan2(p.y,p.x);
 let spin=theta+log(r+.15)*1.2+u.time*.09;
 let peaks=pow(max(0.,.5+.5*cos(spin*13.-r*37.+u.time*.13)),18.);
 let radius=select(.34,.46,u.mode>3.);
 let light=exp(-pow((r-radius)/.015,2.))*peaks;
 let spark=exp(-r*17.)*.16;
 let intensity=(light*.32+spark)*u.energy;
 let color=vec3<f32>(.45,.63,1.)+vec3<f32>(.21,-.13,.35)*sin(spin*2.);
 return vec4<f32>(color*intensity*2.1,min(.28,intensity*.24));
}`
};
