const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch();
const c=await b.newContext({viewport:{width:1920,height:1080},recordVideo:{dir:'rec',size:{width:1920,height:1080}}});
const p=await c.newPage();await p.goto('file://'+process.cwd()+'/ui.html');await p.waitForTimeout(7500);await c.close();
const c2=await b.newContext({viewport:{width:1920,height:1080},recordVideo:{dir:'rec2',size:{width:1920,height:1080}}});
const q=await c2.newPage();await q.goto('https://community.ideabrostudio.com/courses/ai-and-advertising',{waitUntil:'networkidle'});await q.waitForTimeout(2500);
for(let k=0;k<70;k++){await q.mouse.wheel(0,120);await q.waitForTimeout(60)}
await q.waitForTimeout(800);
const y=await q.evaluate(()=>{const e=[...document.querySelectorAll('*')].find(n=>n.textContent.trim()==='THE OLD WAY');return e?e.getBoundingClientRect().top+scrollY-200:0});
await q.evaluate(v=>scrollTo({top:v,behavior:'smooth'}),y);await q.waitForTimeout(2500);
for(let k=0;k<40;k++){await q.mouse.wheel(0,90);await q.waitForTimeout(60)}
const y2=await q.evaluate(()=>{const e=[...document.querySelectorAll('*')].find(n=>n.textContent.trim()==='TOOLS YOU’LL USE');return e?e.getBoundingClientRect().top+scrollY-150:0});
await q.evaluate(v=>scrollTo({top:v,behavior:'smooth'}),y2);await q.waitForTimeout(2500);
for(let k=0;k<50;k++){await q.mouse.wheel(0,100);await q.waitForTimeout(60)}
await c2.close();await b.close()})();
