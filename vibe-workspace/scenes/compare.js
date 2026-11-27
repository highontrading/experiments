// node compare.js <out_dir>  -> bg.png, edshadow.png (transparent), mask_raw.png, mask_edited.png, safe.png (transparent)
const { chromium } = require('playwright'); const path=require('path'); const fs=require('fs');
(async()=>{
  const out=process.argv[2]; fs.mkdirSync(out,{recursive:true});
  const b=await chromium.launch(); const p=await b.newPage({viewport:{width:1080,height:1920}});
  await p.goto('file://'+path.resolve(__dirname,'compare.html')); await p.evaluate(()=>document.fonts.ready);
  const L=await p.evaluate(()=>window.L);
  for(const m of ['bg','edshadow','safe']){ await p.evaluate(x=>build(x),m); await p.screenshot({path:path.join(out,m+'.png'),omitBackground:m!=='bg'}); }
  await p.evaluate(()=>build('maskraw')); await p.screenshot({path:path.join(out,'mask_raw.png'),clip:{x:0,y:0,width:L.raw.w,height:L.raw.h}});
  await p.evaluate(()=>build('maskedited')); await p.screenshot({path:path.join(out,'mask_edited.png'),clip:{x:0,y:0,width:L.edited.w,height:L.edited.h}});
  fs.writeFileSync(path.join(out,'layout.json'),JSON.stringify(L)); await b.close();
})();
