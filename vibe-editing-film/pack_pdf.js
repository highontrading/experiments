// Print build/pack.html to out/PROMPT_PACK_Vibe_Editing.pdf with headless Chromium.
const { chromium } = require("playwright");
const fs = require("fs");
const path = require("path");

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.goto("file://" + path.join(__dirname, "build/pack.html"), { waitUntil: "load" });
  await page.evaluate(() => document.fonts.ready);
  fs.mkdirSync(path.join(__dirname, "out"), { recursive: true });
  const out = path.join(__dirname, "out/PROMPT_PACK_Vibe_Editing.pdf");
  await page.pdf({ path: out, width: "1600px", height: "1000px", printBackground: true });
  await browser.close();
  console.log("-> " + out);
})();
