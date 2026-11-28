const { chromium } = require('playwright');
const path=require('path');
(async()=>{
  const B=process.argv[2], mode=process.argv[3]; // mode: "all" or comma times
  const b=await chromium.launch({args:['--disable-gpu-vsync','--force-color-profile=srgb']});
  const p=await b.newPage({viewport:{width:1080,height:1920},deviceScaleFactor:1});
  p.on('console',m=>console.log('console:',m.text())); p.on('pageerror',e=>console.log('pageerror:',e.message));
  await p.goto('file://'+B+'/index.html'); await p.evaluate(()=>document.fonts.ready);
  const N=754;
  let list = mode==='all' ? [...Array(N).keys()] : mode.split(',').map(s=>Math.min(N-1,Math.round(parseFloat(s)*30)));
  const t0=Date.now();
  for(const i of list){
    const t=i/30, url='file://'+B+'/frames/f'+String(i+1).padStart(4,'0')+'.jpg';
    await p.evaluate(([t,u])=>window.render(t,u),[t,url]);
    const out = mode==='all' ? B+'/out/o'+String(i+1).padStart(4,'0')+'.jpg' : (process.env.SD||B+'/stills')+'/s_'+t.toFixed(2)+'.jpg';
    await p.screenshot({path:out,type:'jpeg',quality:93});
    if(mode==='all' && i%100==0) console.log('frame',i,((Date.now()-t0)/1000).toFixed(1)+'s');
  }
  await b.close();
})();
