const fs=require('node:fs'),path=require('node:path');
const {chromium}=require('playwright');
(async()=>{
 const report={date:new Date().toISOString(),passed:false,desktop:{},mobile:{},errors:[],assets:{}};
 for(const x of ['assets/og-cover.png','assets/og-alternative.png','assets/apple-touch-icon.png','assets/favicon-32.png','favicon.ico','assets/icon-192.png','assets/icon-512.png']){
  report.assets[x]=fs.existsSync(x)?fs.statSync(x).size:0;
  if(!report.assets[x])report.errors.push('Missing asset: '+x);
 }
 let browser;
 try{
  browser=await chromium.launch({headless:true,args:['--enable-webgl','--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader','--no-sandbox']});
  for(const [label,viewport] of [['desktop',{width:1440,height:900}],['mobile',{width:390,height:844}]]){
   const page=await browser.newPage({viewport,deviceScaleFactor:1});
   const runtime=[];
   page.on('pageerror',e=>runtime.push(e.message));
   await page.goto('file://'+path.join(process.cwd(),'index.html'),{waitUntil:'load'});
   await page.waitForTimeout(1600);
   await page.locator('#enterQuiet').click();
   await page.locator('[data-mode="7"]').click();
   await page.waitForTimeout(700);
   const selected=await page.locator('.mode.selected').getAttribute('data-mode');
   await page.locator('#settingsBtn').click();
   const visible=await page.locator('#settings').evaluate(el=>el.classList.contains('open'));
   await page.locator('#volume').evaluate(el=>{el.value='32';el.dispatchEvent(new Event('input',{bubbles:true}));});
   await page.locator('#closeSettings').click();
   await page.locator('#help').click();
   const science=await page.locator('#science').getAttribute('aria-hidden');
   await page.locator('#closeScience').click();
   await page.locator('[data-mode="0"]').click();
   await page.waitForTimeout(900);
   const state=await page.evaluate(()=>({backend:document.getElementById('backend').textContent,stageWidth:document.getElementById('stage').width,stageHeight:document.getElementById('stage').height,fps:document.getElementById('fps').textContent,modes:document.querySelectorAll('.mode').length,volume:document.getElementById('volume').value}));
   fs.mkdirSync('assets',{recursive:true});
   await page.screenshot({path:'assets/site-preview-'+label+'.png'});
   report[label]={...state,selected,settingsOpened:visible,scienceOpened:science==='false',errors:runtime};
   if(runtime.length)report.errors.push(label+' JS errors: '+runtime.join('; '));
   if(selected!=='7'||!visible||science!=='false'||state.modes!==8||!state.stageWidth||!state.stageHeight||state.volume!=='32')report.errors.push(label+' UI assertion failed');
   await page.close();
  }
 }catch(e){report.errors.push(String(e.stack||e))}
 finally{if(browser)await browser.close().catch(()=>{});report.passed=report.errors.length===0;fs.mkdirSync('reports',{recursive:true});fs.writeFileSync('reports/verification.json',JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify(report,null,2));if(!report.passed)process.exitCode=1;}
})();
