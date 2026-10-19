/* HDR6 GPU validation: tests WGSL with software WebGPU where available.
 * No false success claims if runner lacks WebGPU — records "unavailable" explicitly.
 */
const {chromium}=require('playwright');
const fs=require('node:fs'),path=require('node:path');
(async()=>{
 let browser;
 const result={tested:false,available:false,compiled:false,extended:false,errors:[],adapter:"unknown"};
 try{
  browser=await chromium.launch({headless:true,args:[
   '--no-sandbox','--enable-webgpu','--enable-unsafe-webgpu',
   '--enable-features=Vulkan,WebGPU',
   '--use-angle=swiftshader','--enable-unsafe-swiftshader',
   '--enable-dawn-features=allow_unsafe_apis'
  ]});
  const page=await browser.newPage();
  await page.goto('file://'+path.join(process.cwd(),'index.html'),{waitUntil:'load'});
  await page.waitForTimeout(900);
  const data=await page.evaluate(async()=>{
    let out={available:false,compiled:false,extended:false,errors:[]};
    if(!navigator.gpu||!window.UNSEEN_HDR6_WGSL)return out;
    const adapter=await navigator.gpu.requestAdapter({powerPreference:'high-performance'});
    if(!adapter)return out;
    out.available=true;
    const dev=await adapter.requestDevice();
    dev.pushErrorScope('validation');
    const mod=dev.createShaderModule({code:window.UNSEEN_HDR6_WGSL});
    const info=await mod.getCompilationInfo();
    out.errors.push(...info.messages.filter(x=>x.type==='error').map(x=>x.message));
    if(!out.errors.length){
     const layout=dev.createBindGroupLayout({entries:[{binding:0,visibility:GPUShaderStage.FRAGMENT,buffer:{type:'uniform',minBindingSize:64}}]});
     dev.createRenderPipeline({layout:dev.createPipelineLayout({bindGroupLayouts:[layout]}),vertex:{module:mod,entryPoint:'vs'},fragment:{module:mod,entryPoint:'fs',targets:[{format:'rgba16float'}]},primitive:{topology:'triangle-list'}});
    }
    const scope=await dev.popErrorScope();
    if(scope)out.errors.push(scope.message);
    out.compiled=!out.errors.length;
    if(out.compiled){
     const el=document.createElement('canvas');
     const ctx=el.getContext('webgpu');
     try{
      ctx.configure({device:dev,format:'rgba16float',alphaMode:'opaque',colorSpace:'display-p3',toneMapping:{mode:'extended'}});
      out.extended=ctx.getConfiguration?.()?.toneMapping?.mode==='extended';
     }catch(e){out.errors.push('HDR configure: '+e.message);}
    }
    dev.destroy();
    return out;
  });
  Object.assign(result,data);
  result.tested=true;
 }catch(e){result.errors.push(String(e.message||e).slice(0,600))}
 finally{
  if(browser)await browser.close().catch(()=>{});
  fs.mkdirSync('reports',{recursive:true});
  fs.writeFileSync('reports/hdr6-gpu-check.json',JSON.stringify(result,null,2)+'\n');
  console.log(JSON.stringify(result,null,2));
  if(result.available&&!result.compiled)process.exitCode=1;
 }
})();