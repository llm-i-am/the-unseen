/* THE UNSEEN / VOLUME VI — PRIMARY HDR WEBGPU ENGINE
 * WebGPU rgba16float / Display-P3 / extended tone mapping on Safari 26.
 * Original WGSL — layered ray-folding, infinite corridors, interference lattices,
 * rotating high-contrast labyrinths, optical flow, refractive caustics and spectral geometry.
 * Highlights above SDR white occupy fine geometry instead of flickering entire screen.
 * Source: WebKit Safari 26 release notes and GPUCanvasContext.configure specification.
 */
window.UNSEEN_HDR6_WGSL=String.raw`
struct Frame {
  a: vec4<f32>,  // px width, height, time, progress
  b: vec4<f32>,  // act index, kinetic phase, scene pulse, complexity
  c: vec4<f32>,  // four audio-spectrum bands
  d: vec4<f32>   // touch x/y, intensity, reduced-motion flag
};
@group(0) @binding(0) var<uniform> u:Frame;
const PI:f32=3.14159265;
fn rot(q:vec2<f32>,a:f32)->vec2<f32>{
 let s=sin(a);let c=cos(a);return vec2<f32>(q.x*c-q.y*s,q.x*s+q.y*c);
}
fn hash(p:vec2<f32>)->f32 {
 let q=fract(p*vec2<f32>(123.34,345.45));
 return fract(sin(dot(q,vec2<f32>(127.1,311.7)))*43758.5453);
}
fn noise(p:vec2<f32>)->f32{
 let i=floor(p);let f=fract(p);let w=f*f*(vec2<f32>(3.)-2.*f);
 return mix(mix(hash(i),hash(i+vec2<f32>(1.,0.)),w.x),
            mix(hash(i+vec2<f32>(0.,1.)),hash(i+vec2<f32>(1.,1.)),w.x),w.y);
}
fn fbm(p:vec2<f32>)->f32{
 var q=p;var v=0.;var a=.5;
 for(var i:i32=0;i<4;i=i+1){v=v+a*noise(q);q=rot(q*2.04,.47);a=a*.48;}
 return v;
}
fn sat(x:f32)->f32{return clamp(x,0.,1.);}
fn stroke(x:f32,w:f32)->f32{return exp(-abs(x)/max(.0003,w));}
fn ring(x:f32,r:f32,w:f32)->f32{return exp(-pow((x-r)/max(w,.0002),2.));}
fn glowPalette(x:f32,mode:f32)->vec3<f32>{
 let a=vec3<f32>(.16,.64,1.18);
 let b=vec3<f32>(.96,.09,.55);
 let c=vec3<f32>(.18,1.22,.89);
 let d=vec3<f32>(1.1,.68,.07);
 if(mode<.5){return mix(mix(a,b,.5+.5*sin(x*1.9)),c,.35+.28*sin(x*3.));}
 if(mode<1.5){return mix(mix(b,d,.5+.5*cos(x*2.)),a,.14+.22*sin(x));}
 return mix(mix(a,c,.5+.5*sin(x*2.6)),b,.23+.2*cos(x*1.3));
}
fn warpWorld(q:vec2<f32>,t:f32,act:f32)->vec2<f32>{
 let grain=fbm(q*2.5+vec2<f32>(t*.09,-t*.06));
 let wave=vec2<f32>(sin(q.y*8.2+grain*7.+t*.8),cos(q.x*7.3-grain*6.-t*.68));
 let w=.045+.032*sin(act*.79);
 return q+wave*w;
}
fn circuitry(q:vec2<f32>,t:f32,act:f32)->vec3<f32>{
 let v=rot(q,.14*t+act*.37);
 let n=fbm(v*3.+t*.06);
 let h=stroke(sin((v.x+.09*sin(v.y*5.+t*.3))*18.+n*3.),.045);
 let j=stroke(cos((v.y+.08*cos(v.x*6.-t*.36))*21.-n*3.),.05);
 let cross=h*j;
 let aa=atan2(v.y,v.x);
 let rr=length(v);
 let strand=stroke(sin(aa*(13.+floor(act%5.))+log(rr+.15)*16.+t*1.28),.04)*exp(-rr*1.5);
 let lens=ring(rr,.28+.06*sin(aa*7.+t*.27),.008);
 return vec3<f32>(h*.07+j*.05+cross*.28+strand*.17+lens*.32,
                  j*.14+cross*.32+strand*.06+lens*.43,
                  h*.24+j*.14+cross*.16+strand*.31+lens*.47);
}
fn mirror(q:vec2<f32>,t:f32,act:f32)->vec3<f32>{
 var v=rot(q,.08*t);
 var wire=0.;
 for(var i:i32=0;i<7;i=i+1){
   v=abs(v)-vec2<f32>(.21,.15)+vec2<f32>(sin(t*.12+f32(i))*.014,0.);
   v=rot(v,.67+sin(f32(i)*1.8+t*.09)*.05);
   wire=wire+stroke(length(v)-(.14+f32(i)*.002),.006)*(.18-.012*f32(i));
 }
 let r=length(q);let an=atan2(q.y,q.x);
 let flower=pow(sat(.5+.5*cos(an*17.+r*57.-t*1.2)),27.);
 let interference=pow(sat(.5+.5*cos((q.x-q.y)*29.+sin(q.y*6.)*2.2)),16.);
 return vec3<f32>(wire*.55+flower*.28+interference*.10,
                  wire*.35+flower*.16+interference*.16,
                  wire*.69+flower*.52+interference*.08);
}
fn corridor(q:vec2<f32>,t:f32)->vec3<f32>{
 var c=vec3<f32>(0.);
 for(var i:i32=0;i<10;i=i+1){
  let z=fract(f32(i)*.1+t*.075);
  let scale=.16+z*z*4.5;
  let p=q*scale;
  let side=stroke(abs(p.x)-(.2+.07*sin(p.y*3.)),.012);
  let vault=stroke(length(vec2<f32>(abs(p.x),max(0.,p.y*.75+.21)))-.62,.015);
  let stairs=stroke(sin(p.y*16.),.035)*.2;
  let gate=(side+vault)*(1.-z)*(.25+.75*z);
  c=c+vec3<f32>(.20,.64,1.0)*gate*.20+vec3<f32>(.8,.24,.72)*stairs*gate*.09;
 }
 return c;
}
fn eventHorizon(q:vec2<f32>,t:f32)->vec3<f32>{
 let r=length(q);let a=atan2(q.y,q.x);let lens=a+1.0/(r+.2);
 let disc=ring(length(q*vec2<f32>(1.,2.2)),.45,.07);
 let ray=pow(sat(.5+.5*cos(lens*39.+r*75.-t*.85)),17.);
 let acc=ring(r,.36,.014)*(.5+.5*ray);
 let dark=1.-smoothstep(.15,.25,r);
 return (vec3<f32>(.89,.27,.65)*disc*(.27+.33*ray)+
 vec3<f32>(.25,.7,1.18)*acc*.72+vec3<f32>(.8,.9,1.2)*ring(r,.24,.004)*.18)*(1.-dark*.98);
}
fn latticeFlow(q:vec2<f32>,t:f32,act:f32)->vec3<f32>{
 let r=length(q);let a=atan2(q.y,q.x);
 let inward=stroke(sin(log(r+.09)*30.+t*1.4),.075);
 let outward=stroke(sin(log(r+.09)*36.-t*1.1),.075);
 let helix=stroke(sin(a*25.+r*40.+t*.6+sin(r*14.)*1.3),.049);
 let nodes=stroke(sin(q.x*20.+t*.19),.06)*stroke(cos(q.y*17.-t*.23),.06);
 let q2=rot(q,act*.65);
 let soft=fbm(q2*2.8+vec2<f32>(t*.036,-t*.05));
 return vec3<f32>(outward*.19+helix*.1+nodes*.06,
                  inward*.22+helix*.12+nodes*.04,
                  outward*.28+inward*.12+helix*.27+soft*.025);
}
@vertex fn vs(@builtin(vertex_index) i:u32)->@builtin(position) vec4<f32>{
 let p=array<vec2<f32>,3>(vec2<f32>(-1.,-1.),vec2<f32>(3.,-1.),vec2<f32>(-1.,3.));
 return vec4<f32>(p[i],0.,1.);
}
@fragment fn fs(@builtin(position) pos:vec4<f32>)->@location(0) vec4<f32>{
 let res=u.a.xy;
 let t=u.a.z;
 let act=u.b.x;
 let actPhase=u.b.y;
 let kinetic=u.b.z;
 let complexity=u.b.w;
 let spec=u.c;
 let reduced=u.d.w;
 let p=u.d.xy;
 var q=(pos.xy-.5*res)/min(res.x,res.y)*2.15;
 q=q-vec2<f32>((p.x-.5)*.1,(p.y-.5)*.1);
 q=rot(q,sin(t*.091)*.09*(1.-reduced));
 let radius=length(q);
 let state=sin(t*.41+act*.7);
 q=warpWorld(q,t*(1.-reduced),act);
 let scene=u32(max(0.,floor(act)))%8u;
 var c=vec3<f32>(0.);
 if(scene==0u){c=mirror(q,t,act)+circuitry(q,t,act);}
 else if(scene==1u){c=latticeFlow(q,t,act)+circuitry(q,t,act)*.8;}
 else if(scene==2u){c=mirror(q,t*1.7,act)+latticeFlow(q,t,act)*.7;}
 else if(scene==3u){c=corridor(q,t)+circuitry(q,t,act)*.45;}
 else if(scene==4u){c=corridor(q,t*1.4)+mirror(q,t,act)*.4;}
 else if(scene==5u){c=eventHorizon(q,t)+latticeFlow(q,t,act)*.75;}
 else if(scene==6u){c=latticeFlow(q,t*1.35,act)+mirror(q,t,act)*.36;}
 else {c=eventHorizon(q,t*1.3)+circuitry(q,t,act)*.45;}
 let n=fbm(q*2.4+vec2<f32>(t*.13,-t*.08));
 let bend=pow(sat(.5+.5*cos(atan2(q.y,q.x)*12.+radius*28.-t*.67+n*4.)),19.);
 let warpGlow=ring(radius,.37+.15*sin(t*.33),.022);
 let chroma=glowPalette(radius*1.4+act*.13+t*.03,f32(scene%3u));
 c=c*chroma*(.85+.5*complexity);
 c=c+chroma*bend*ring(radius,.52,.29)*.12;
 // Bright local caustics above reference white: real scene-linear HDR values.
 let laser=ring(radius,.39+.1*sin(atan2(q.y,q.x)*10.+t*.28),.003);
 let flashless=stroke(sin(q.x*31.+q.y*19.+t*.31),.033)*stroke(sin(q.y*27.-q.x*11.),.07);
 let peak=laser*.76+flashless*.12+warpGlow*.21;
 let e=.5+.5*sin(t*.2+act);
 c=c+vec3<f32>(.43,.72,1.0)*peak*(.9+.3*e+spec.x*.25);
 let pearl=pow(sat(.5+.5*cos(atan2(q.y,q.x)*26.+radius*91.-t*.75)),30.);
 c=c+vec3<f32>(1.,.37,.88)*pearl*ring(radius,.62,.20)*.13;
 // No frame-wide exposure pumping: audio alters fine local detail only.
 c=c+chroma*spec.y*flashless*.045;
 let vignette=1.-smoothstep(.8,1.8,radius)*.81;
 c=c*vignette;
 // SDR surrounding field remains dark for HDR highlight contrast.
 c=c+vec3<f32>(.002,.004,.008);
 // Output >1.0 HDR encoded in 16-bit floating-point framebuffer, not clipped at SDR white.
 let highlight=pow(sat(peak),2.2)*min(2.5,.4+complexity*1.4);
 c=c+vec3<f32>(.84,1.21,1.45)*highlight;
 // Smooth transitions deliberately maintain baseline light with no strobe inversion.
 return vec4<f32>(max(c,vec3<f32>(0.)),1.);
}
`;
