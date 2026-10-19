const fs=require('node:fs'),path=require('node:path');const {chromium}=require('playwright');
(async()=>{
 const report={version:5,date:new Date().toISOString(),passed:false,desktop:{},mobile:{},errors:[],assets:{}};
 for(const file of ['index.html','rupture.css','src/rupture-field.js','src/riot-audio.js','src/rupture-experience.js','assets/og-cover.png','assets/apple-touch-icon.png']){
  report.assets[file]=fs.existsSync(file)?fs.statSync(file).size:0;
  if(!report.assets[file])report.errors.push('Missing asset '+file);
 }
 let browser;
 try{
  browser=await chromium.launch({headless:true,args:['--enable-webgl','--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader','--no-sandbox']});
  for(const [label,viewport] of [['desktop',{width:1440,height:900}],['mobile',{width:390,height:844}]]){
   const page=await browser.newPage({viewport,deviceScaleFactor:1});
   const errors=[];page.on('pageerror',e=>errors.push(e.message));
   const logs=[];page.on('console',m=>{if(m.type()==='error')logs.push(m.text().slice(0,320));});
   await page.goto('file://'+path.join(process.cwd(),'index.html'),{waitUntil:'load'});
   await page.waitForTimeout(450);
   const gate=await page.locator('#imBegin').isVisible();
   await page.locator(label==='desktop'?'#imBegin':'#imSilent').click({noWaitAfter:true,timeout:20000});
   await page.waitForTimeout(1300);
   const initial=await page.evaluate(()=>{
    const rt=window.UNSEEN_RUNTIME,im=window.UNSEEN_IMMERSION,stage=document.getElementById('stage');
    return {running:im?.running,version:im?.version,backend:document.getElementById('backend').textContent,
     mode:im?.mode,stageSize:[stage.width,stage.height],shaderCompiled:!!rt?.state&&!document.getElementById('backend').textContent.includes('FALLBACK'),
     fractureShader:window.UNSEEN_SHADERS.fragment.includes('v5Breakage'),volume:rt?.state.volume,
     speed:rt?.state.speed,orbits:rt?.audio?.hyper?.orbit?.length||0,choir:rt?.audio?.hyper?.choir?.length||0,
     riot:!!rt?.audio?.riot,fullscreenUIHidden:getComputedStyle(document.querySelector('.toolbar')).display==='none',
     hudShown:document.getElementById('rxHUD').getAttribute('aria-hidden')==='false'};
   });
   fs.mkdirSync('assets',{recursive:true});await page.screenshot({path:'assets/site-preview-'+label+'.jpg',type:'jpeg',quality:84});
   await page.locator('#rxMenuButton').click({noWaitAfter:true});
   const menuShown=await page.locator('#rxMenu').getAttribute('aria-hidden')==='false';
   await page.locator('#rxNext').click({noWaitAfter:true});
   const next=await page.evaluate(()=>window.UNSEEN_IMMERSION.mode);
   await page.locator('#rxMenuButton').click({noWaitAfter:true});
   await page.locator('#rxIntensity').click({noWaitAfter:true});
   const altered=await page.evaluate(()=>window.UNSEEN_IMMERSION.intensity);
   await page.locator('#rxMenuButton').click({noWaitAfter:true});
   await page.locator('#rxPause').click({noWaitAfter:true});
   const paused=await page.evaluate(()=>window.UNSEEN_IMMERSION.paused);
   await page.locator('#rxMenuButton').click({noWaitAfter:true});
   await page.locator('#rxPause').click({noWaitAfter:true});
   const resumed=await page.evaluate(()=>!window.UNSEEN_IMMERSION.paused);
   await page.locator('#rxMenuButton').click({noWaitAfter:true});
   await page.locator('#rxComfort').click({noWaitAfter:true});
   const comfort=await page.evaluate(()=>window.UNSEEN_IMMERSION.reduced);
   await page.locator('#rxMenuButton').click({noWaitAfter:true});
   await page.locator('#rxScience').click({noWaitAfter:true});
   const science=await page.locator('#science').getAttribute('aria-hidden')==='false';
   await page.locator('#closeScience').click({noWaitAfter:true});
   await page.locator('#rxMenuButton').click({noWaitAfter:true});
   await page.locator('#rxRestart').click({noWaitAfter:true});
   const restarted=await page.evaluate(()=>window.UNSEEN_IMMERSION.elapsed<1.5);
   await page.locator('#rxMenuButton').click({noWaitAfter:true});
   await page.locator('#rxExit').click({noWaitAfter:true});
   const exited=await page.evaluate(()=>!window.UNSEEN_IMMERSION.running&&document.getElementById('rxGate').getAttribute('aria-hidden')==='false');
   const pass=gate&&initial.running&&initial.version===5&&initial.shaderCompiled&&initial.fractureShader&&initial.speed>1
     &&initial.hudShown&&initial.fullscreenUIHidden&&initial.stageSize.every(x=>x>0)&&menuShown&&next!==0&&altered!==1
     &&paused&&resumed&&comfort&&science&&restarted&&exited&&errors.length===0&&(label==='mobile'||initial.riot&&initial.orbits===4&&initial.choir===6);
   report[label]={gate,initial,menuShown,next,altered,paused,resumed,comfort,science,restarted,exited,pass,errors,logs};
   if(!pass)report.errors.push(label+' assertion failure');
   if(errors.length)report.errors.push(label+' JavaScript errors: '+errors.join(' | '));
   await page.close();
  }
 }catch(e){report.errors.push(String(e.stack||e))}
 finally{if(browser)await browser.close().catch(()=>{});report.passed=report.errors.length===0;
 fs.mkdirSync('reports',{recursive:true});fs.writeFileSync('reports/verification.json',JSON.stringify(report,null,2)+'\n');
 console.log(JSON.stringify(report,null,2));if(!report.passed)process.exitCode=1;}
})();