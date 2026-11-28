const { chromium } = require('playwright');
const fs=require('fs'),path=require('path');
(async()=>{
  const dir=__dirname, out=process.argv[2], mode=process.argv[3]||'all';
  fs.mkdirSync(out,{recursive:true});
  const words=JSON.parse(fs.readFileSync(path.join(dir,'outwords.json'))).words;
  const b=await chromium.launch();
  const p=await b.newPage({viewport:{width:1080,height:1920},deviceScaleFactor:1});
  await p.goto('file://'+path.join(dir,'overlay.html'));
  await p.evaluate(w=>window.init(w),words);
  await p.evaluate(()=>document.fonts.ready);
  const FPS=30, TOTAL=parseFloat(process.env.TOTAL||'36.67');
  let times=[];
  if(mode==='all'){for(let i=0;i<Math.round(TOTAL*FPS);i++)times.push(i/FPS)}
  else times=mode.split(',').map(Number);
  for(let i=0;i<times.length;i++){
    await p.evaluate(g=>window.render(g),times[i]);
    const name=mode==='all'?String(i).padStart(5,'0')+'.png':'t_'+times[i].toFixed(2)+'.png';
    await p.screenshot({path:path.join(out,name),omitBackground:true});
    if(mode==='all'&&i%150===0)console.log('frame',i);
  }
  await b.close();
})();
