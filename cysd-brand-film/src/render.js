const { chromium } = require('playwright');
const path=require('path'),fs=require('fs');
(async()=>{
 let [,,mode,a,b,outdir,workers]=process.argv; if(mode==='stills'){workers=outdir;outdir=b;}
 const browser=await chromium.launch({args:['--allow-file-access-from-files','--disable-web-security']});
 const url='file://'+path.resolve(__dirname,'index.html');
 fs.mkdirSync(outdir,{recursive:true});
 let times=[];
 if(mode==='stills') times=a.split(',').map(Number).map(t=>({t,name:`s_${t.toFixed(2)}.jpg`}));
 else {for(let f=+a;f<+b;f++)times.push({t:f/30,name:String(f).padStart(5,'0')+'.jpg'});}
 const N=+(workers||1);const chunks=Array.from({length:N},(_,i)=>times.filter((_,j)=>j%N===i));
 await Promise.all(chunks.map(async ch=>{
  const page=await browser.newPage({viewport:{width:1920,height:1080},deviceScaleFactor:1});
  page.on('pageerror',e=>console.error('PAGEERR',e.message));
  await page.goto(url);await page.evaluate(()=>window.ready);
  for(const {t,name} of ch){
   await page.evaluate(async t=>{await window.setTime(t);await new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r)));},t);
   await page.screenshot({path:path.join(outdir,name),type:'jpeg',quality:94});
  }
 }));
 await browser.close();
})();
