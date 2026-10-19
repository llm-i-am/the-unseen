const fs = require('node:fs');
const path = require('node:path');
const { chromium } = require('playwright');
(async () => {
 const report = {version:3, date:new Date().toISOString(), passed:false, desktop:{}, mobile:{}, errors:[], assets:{}};
 const required=['assets/og-cover.png','assets/og-alternative.png','assets/apple-touch-icon.png','assets/favicon-32.png','favicon.ico','assets/icon-192.png','assets/icon-512.png','immersive.css','src/immersion.js'];
 for(const f of required){report.assets[f]=fs.existsSync(f)?fs.statSync(f).size:0;if(!report.assets[f])report.errors.push('Missing '+f)}
 let browser;
 try{
  browser=await chromium.launch({headless:true,args:['--enable-webgl','--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader','--no-sandbox']});
  for(const [label,viewport] of [['desktop',{width:1440,height:900}],['mobile',{width:390,height:844}]]){
   const page=await browser.newPage({viewport,deviceScaleFactor:1,acceptDownloads:false});
   const errors=[];
   page.on('pageerror',e=>errors.push(e.message));
   await page.goto('file://'+path.join(process.cwd(),'index.html'),{waitUntil:'load'});
   await page.waitForTimeout(350);
   const gateVisible=await page.locator('#imBegin').isVisible();
   const originalEntryHidden=await page.locator('#entry').evaluate(el=>getComputedStyle(el).display==='none');
   await page.locator(label==='desktop'?'#imBegin':'#imSilent').click({timeout:15000});
   await page.waitForTimeout(2100);
   const initial=await page.evaluate(()=>{
    let rt=window.UNSEEN_RUNTIME,im=window.UNSEEN_IMMERSION,stage=document.getElementById('stage');
    return {running:im?.running,elapsed:im?.elapsed,phase:im?.phase,mode:im?.mode,backend:document.getElementById('backend').textContent,
      stageSize:[stage.width,stage.height],hdrActive:rt?.state.hdr,intensity:[rt?.state.density,rt?.state.energy,rt?.state.flux,rt?.state.depth],
      titleHidden:getComputedStyle(document.querySelector('.titlebox')).display==='none',
      toolbarHidden:getComputedStyle(document.querySelector('.toolbar')).display==='none',
      progress:document.getElementById('imProgress').style.transform
    };
   });
   const screenshot='assets/site-preview-'+label+'.jpg';
   await page.screenshot({path:screenshot,type:'jpeg',quality:85});
   await page.locator('#imMenuBtn').click();
   const menuShown=await page.locator('#imMenu').getAttribute('aria-hidden')==='false';
   await page.locator('#imPace').click();
   const pace=await page.evaluate(()=>window.UNSEEN_IMMERSION.pace);
   await page.locator('#imMenuBtn').click();
   await page.locator('#imBreath').click();
   const breathHidden=await page.evaluate(()=>document.body.classList.contains('im-no-guide'));
   await page.locator('#imMenuBtn').click();
   await page.locator('#imBreath').click();
   await page.locator('#imMenuBtn').click();
   await page.locator('#imPause').click();
   const paused=await page.evaluate(()=>window.UNSEEN_IMMERSION.paused);
   await page.locator('#imMenuBtn').click();
   await page.locator('#imPause').click();
   const resumed=await page.evaluate(()=>!window.UNSEEN_IMMERSION.paused);
   await page.locator('#imMenuBtn').click();
   const prev=await page.evaluate(()=>window.UNSEEN_IMMERSION.mode);
   await page.locator('#imNext').click();
   await page.waitForTimeout(120);
   const advanced=await page.evaluate(()=>window.UNSEEN_IMMERSION.mode);
   await page.locator('#imMenuBtn').click();
   await page.locator('#imScience').click();
   const scienceOpened=await page.locator('#science').getAttribute('aria-hidden')==='false';
   await page.locator('#closeScience').click();
   await page.locator('#imMenuBtn').click();
   await page.locator('#imRestart').click();
   const restarted=await page.evaluate(()=>window.UNSEEN_IMMERSION.elapsed<1.5);
   await page.locator('#imMenuBtn').click();
   await page.locator('#imExit').click();
   const exited=await page.evaluate(()=>!window.UNSEEN_IMMERSION.running&&document.getElementById('immersionGate').getAttribute('aria-hidden')==='false');
   report[label]={gateVisible,originalEntryHidden,initial,menuShown,pace,breathHidden,paused,resumed,prev,advanced,scienceOpened,restarted,exited,errors};
   const assertion=gateVisible&&originalEntryHidden&&initial.running&&initial.elapsed>0&&initial.stageSize[0]>0&&initial.stageSize[1]>0&&initial.titleHidden&&initial.toolbarHidden
      &&initial.intensity.every(n=>n===1)&&menuShown&&pace.join(',')==='5,5'&&breathHidden&&paused&&resumed&&advanced!==(prev)&&scienceOpened&&restarted&&exited&&errors.length===0;
   if(!assertion)report.errors.push(label+' assertions failed');
   if(errors.length)report.errors.push(label+' runtime: '+errors.join('; '));
   await page.close();
  }
 }catch(e){report.errors.push(String(e.stack||e))}
 finally{
  if(browser)await browser.close().catch(()=>{});
  report.passed=report.errors.length===0;
  fs.mkdirSync('reports',{recursive:true});
  fs.writeFileSync('reports/verification.json',JSON.stringify(report,null,2)+'\n');
  console.log(JSON.stringify(report,null,2));
  if(!report.passed)process.exitCode=1;
 }
})();