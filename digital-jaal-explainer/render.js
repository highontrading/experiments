// Render stills or frames of stage.html with headless Chromium.
//   node render.js stills 0.5 3.2 ...          -> build/stills/t_XX.jpg
//   node render.js video FROM_FRAME TO_FRAME OUT.mp4   (frames piped to ffmpeg)
const { chromium } = require("playwright");
const { spawn } = require("child_process");
const fs = require("fs");
const PORT = process.env.PORT || 8765;
(async () => {
  const [mode, ...args] = process.argv.slice(2);
  const browser = await chromium.launch({ args: ["--disable-web-security", "--force-color-profile=srgb"] });
  const page = await browser.newPage({ viewport: { width: 600, height: 1000 } });
  page.on("console", m => { if (m.type() === "error") console.error("page:", m.text()); });
  page.on("pageerror", e => console.error("pageerror:", e.message));
  await page.goto(`http://127.0.0.1:${PORT}/stage.html`);
  await page.evaluate(() => window.ready);
  const grab = async t => {
    const url = await page.evaluate(async t => { await window.renderAt(t); return document.getElementById("c").toDataURL("image/jpeg", 0.93); }, t);
    return Buffer.from(url.split(",")[1], "base64");
  };
  if (mode === "stills") {
    fs.mkdirSync("build/stills", { recursive: true });
    for (const a of args) { const t = parseFloat(a); fs.writeFileSync(`build/stills/t_${t.toFixed(2)}.jpg`, await grab(t)); }
  } else {
    const from = parseInt(args[0]), to = parseInt(args[1]), out = args[2];
    const ff = spawn("ffmpeg", ["-v", "error", "-y", "-f", "image2pipe", "-framerate", "30", "-c:v", "mjpeg", "-i", "-",
      "-c:v", "libx264", "-preset", "medium", "-crf", "16", "-pix_fmt", "yuv420p", "-r", "30", out], { stdio: ["pipe", "inherit", "inherit"] });
    const t0 = Date.now();
    for (let f = from; f < to; f++) {
      const buf = await grab(f / 30);
      if (!ff.stdin.write(buf)) await new Promise(r => ff.stdin.once("drain", r));
      if ((f - from) % 60 === 0) console.log(`${out}: frame ${f} (${((Date.now() - t0) / (f - from + 1)).toFixed(0)} ms/f)`);
    }
    ff.stdin.end(); await new Promise(r => ff.on("close", r));
  }
  await browser.close();
})();
