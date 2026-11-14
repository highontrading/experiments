#!/usr/bin/env python3
"""Build the interactive student-kit pages from the workflow and skill markdown files.

    python3 tools/build_pages.py

Reads  student-kit/workflows/*.md and student-kit/skills/*/SKILL.md
Writes student-kit/pages/index.html, workflow-01..04.html, skill-<name>.html

Each page is one self-contained HTML file (inline CSS + JS) so students can open it
offline. Visual language follows the provided editorial design system: white canvas,
dark-ink type at modest weights, full-bleed signature cards, near-black primary CTA.
Edit the markdown, then re-run this script.
"""
import html
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
KIT = ROOT / "student-kit"
OUT = KIT / "pages"

STAGES = ["Brief", "Concept", "Visuals", "Motion", "Edit", "Launch"]
STAGE_WF = ["01", "01", "02", "03", "04", "04"]

WORKFLOWS = {
    "01": dict(file="01-plan-the-ad.md", short="Plan the ad", color="#aa2d00", on="#ffffff",
               surface="#fcab79", skills=["ad-strategist"]),
    "02": dict(file="02-photo-to-campaign-images.md", short="Photo → campaign images", color="#0a2e0e",
               on="#ffffff", surface="#a8d8c4", skills=["ad-image-director"]),
    "03": dict(file="03-images-to-video-ad.md", short="Images → video ad", color="#181d26", on="#ffffff",
               surface="#f4d35e", skills=["ad-video-director"]),
    "04": dict(file="04-edit-and-launch.md", short="Edit & launch", color="#d9a441", on="#181d26",
               surface="#f5e9d4", skills=["vibe-editor", "ad-strategist"]),
}

SKILLS = {
    "ad-strategist": dict(
        display="Ad Strategist", nickname="The Planner", color="#aa2d00", on="#ffffff",
        workflows=["01", "04"], modules="1, 2, 8, 11",
        files=["SKILL.md", "hooks-and-scripts.md"],
        modes=[
            ("Mode 1", "Brief & big idea", "A messy client message becomes a one-page brief, 3 big ideas and one recommendation."),
            ("Mode 2", "Hooks, script & storyboard", "30 hooks, the best 5, a timed 15s or 30s script, and a 6-frame storyboard with an image prompt per frame."),
            ("Mode 3", "Brand Bible", "Colours, light, look blocks and a never-do list, so every image and video looks like one brand."),
            ("Mode 4", "Policy check", "Claims, AI disclosure, likeness and rights checked before you launch."),
            ("Mode 5", "Launch & test plan", "Campaign setup, budget, what to compare, and the upload checklist."),
            ("Mode 6", "Read results → next round", "Paste your Ads Manager results. Get keep, kill or scale, the reason, and new variations."),
            ("Mode 7", "Case study & pricing", "Turn your campaign into a portfolio piece, then price and pitch the service."),
        ],
        tips=[
            "Paste the client's message exactly as it is. The skill asks only for what's missing.",
            "One ad, one message. If the message has an \"and\" in it, split it into two ads.",
            "Only use claims you can prove. No \"No.1\", no fake results.",
        ],
    ),
    "ad-image-director": dict(
        display="Ad Image Director", nickname="The Photographer", color="#0a2e0e", on="#ffffff",
        workflows=["02"], modules="3, 4, 8",
        files=["SKILL.md", "recipes.md"],
        modes=[
            ("Mode 1", "Product shots", "Studio packshots, lifestyle scenes, festive sets and e-commerce listing images."),
            ("Mode 2", "Accuracy check", "Your image vs the real product: label, logo, shape. SHIP, FIX or REGENERATE, plus the fix."),
            ("Mode 3", "Consistent model & styling", "A brand model who looks the same in every shot. Indian skin tones and outfits done right."),
            ("Mode 4", "Sets & locations", "One master set, the same light, many angles."),
            ("Mode 5", "Statics in every ratio + 10 variations", "9:16, 4:5 and 1:1 ads with space for text, a 10-variation plan and file names."),
        ],
        tips=[
            "Always attach your real product photo first. That's what keeps the label real.",
            "Change one thing per round. Small edits keep the product; big re-prompts break it.",
            "Zoom into the label on every image. If it's wrong, the ad can't run.",
        ],
    ),
    "ad-video-director": dict(
        display="Ad Video Director", nickname="The Film Director", color="#181d26", on="#ffffff",
        workflows=["03"], modules="5, 6, 7, 10",
        files=["SKILL.md", "recipes.md"],
        modes=[
            ("Mode 1", "Still → video clip", "Your approved image becomes a 4–8s clip in Google Flow, with one clear camera move."),
            ("Mode 2", "Multi-shot film", "Shot list → keyframes → clips, with a continuity sheet so every shot matches."),
            ("Mode 3", "CGI & recipes", "Giant product in a city, splashes, pours, fabric movement, tech reveals."),
            ("Mode 4", "AI UGC & brand ambassador", "Creator-style reviews, unboxings and GRWM in Hinglish, and one face for every campaign."),
            ("Mode 5", "Voice, music & SFX", "Voiceovers in Hindi, English or Hinglish, a jingle, a sonic logo and sound effects."),
            ("Mode 6", "Hybrid real shoot + AI", "What to film for real, what to generate, and how to blend them."),
        ],
        tips=[
            "Start product shots from your approved still (Frames to Video). Text-only video breaks labels.",
            "One shot = one move = one job. Keep clips 4–8 seconds.",
            "Make 2–3 takes per shot and pick the best. Tell the skill what went wrong in one line.",
        ],
    ),
    "vibe-editor": dict(
        display="Vibe Editor", nickname="The Editor", color="#d9a441", on="#181d26",
        workflows=["04"], modules="8, 9",
        files=["SKILL.md", "ffmpeg-recipes.md", "scripts/"],
        modes=[
            ("Step 1", "Dump", "Put all clips, music, voice-over and logo in one folder. Don't trim, don't sort."),
            ("Step 2", "Vibe", "Type the feel: platform + length + energy + look + goal. You get an edit plan first."),
            ("Step 3", "Beat", "Cuts land on the music: every beat or every 2nd beat."),
            ("Step 4", "Layer", "Captions (Hindi too), text, one colour look, end card. One layer at a time."),
            ("Step 5", "Sound", "Music under the voice, sound effects on the cuts, loudness ready for Meta."),
            ("Then", "Director pass", "Watch on your phone. Give 3 notes at most. Repeat until it's right."),
        ],
        tips=[
            "Best in Claude Code or Claude desktop with ffmpeg installed: it edits your real files.",
            "In Claude.ai or ChatGPT with code, it works on short ads. In Gemini you get a CapCut plan.",
            "Always ask to see the edit plan and the captions before it renders.",
        ],
    ),
}

ATTACH = [
    ("claude", "Claude", [
        "Zip the skill folder (the one with <code>SKILL.md</code> inside).",
        "Go to <strong>Settings → Capabilities → Skills</strong> and upload the zip.",
        "Or, the quick way: attach <code>SKILL.md</code> to a new chat.",
    ]),
    ("chatgpt", "ChatGPT", [
        "Quick way: attach <code>SKILL.md</code> to a new chat.",
        "Reusable way: <strong>Explore GPTs → Create → Configure</strong>. Upload <code>SKILL.md</code> as Knowledge.",
        "Instructions: “Follow the uploaded SKILL.md exactly.”",
    ]),
    ("gemini", "Gemini", [
        "Quick way: attach <code>SKILL.md</code> to a new chat.",
        "Reusable way: <strong>Gems → New Gem</strong>. Upload <code>SKILL.md</code> as Knowledge.",
        "Instructions: “Follow the attached SKILL.md exactly.”",
    ]),
    ("code", "Claude Code", [
        "Copy the skill folder into <code>~/.claude/skills/</code> (all projects) or <code>.claude/skills/</code> in your project.",
        "Open your project folder and just ask. The skill loads by itself.",
        "Best for the Vibe Editor, because it can edit your real video files.",
    ]),
]

# --------------------------------------------------------------------------- parsing

def inline(s):
    s = html.escape(s, quote=False)
    s = re.sub(r"`([^`]+)`", r"<code>\1</code>", s)
    s = re.sub(r"\*\*(.+?)\*\*", r"<strong>\1</strong>", s)
    s = re.sub(r"(?<![*\w])\*([^*\n]+)\*(?![*\w])", r"<em>\1</em>", s)
    return s


def parse_workflow(num, cfg):
    lines = (KIT / "workflows" / cfg["file"]).read_text(encoding="utf-8").splitlines()
    wf = dict(num=num, need=[], steps=[], done=[], mistakes=[], **cfg)
    m = re.match(r"#\s+Workflow\s+\d+:\s*(.+)", lines[0])
    wf["title"] = m.group(1).strip()
    wf["tagline"] = next(l[1:].strip() for l in lines if l.startswith(">"))
    table = [l for l in lines if l.startswith("|")]
    head = [c.strip() for c in table[0].strip("|").split("|")]
    vals = [c.strip() for c in table[2].strip("|").split("|")]
    wf["meta"] = list(zip(head, vals))

    section, step, buf, code, in_code = None, None, [], [], False

    def flush():
        if buf and step is not None:
            step["blocks"].append(("p", " ".join(x.strip() for x in buf)))
        buf.clear()

    for line in lines:
        if in_code:
            if line.startswith("```"):
                step["blocks"].append(("code", "\n".join(code)))
                code.clear()
                in_code = False
            else:
                code.append(line)
            continue
        if line.startswith("## "):
            flush()
            section, step = line[3:].strip().lower(), None
            continue
        if section == "steps":
            if line.startswith("### "):
                flush()
                sm = re.match(r"###\s+Step\s+(\d+)\s*·\s*(.+)", line)
                step = dict(n=int(sm.group(1)), title=sm.group(2).strip(), tool="", get="", blocks=[])
                wf["steps"].append(step)
            elif step is None:
                continue
            elif line.startswith("```"):
                flush()
                in_code = True
            elif line.startswith("**Tool:**"):
                tm = re.match(r"\*\*Tool:\*\*\s*(.*?)\s*·\s*\*\*You get:\*\*\s*(.*)", line)
                if tm:
                    step["tool"], step["get"] = tm.group(1), tm.group(2)
                else:
                    step["tool"] = line[len("**Tool:**"):].strip()
            elif line.startswith("**Type this:**"):
                flush()
            elif line.startswith("**Check:**"):
                flush()
                step["blocks"].append(("check", line[len("**Check:**"):].strip()))
            elif not line.strip():
                flush()
            else:
                buf.append(line)
        elif section == "you need" and line.startswith("- "):
            wf["need"].append(line[2:].strip())
        elif section == "done when" and line.startswith("- [ ]"):
            wf["done"].append(line[5:].strip())
        elif section == "common mistakes" and line.startswith("- "):
            wf["mistakes"].append(line[2:].strip())
    flush()
    return wf


def parse_skill(name, cfg):
    text = (KIT / "skills" / name / "SKILL.md").read_text(encoding="utf-8")
    sk = dict(name=name, **cfg)
    one = re.search(r"## In one line\n(.+?)\n\n", text, re.S)
    sk["oneline"] = " ".join(one.group(1).split())
    ask = re.search(r"## What you can ask it\n(.+?)\n\n", text, re.S)
    sk["asks"] = [l[2:].strip().strip('"“”') for l in ask.group(1).splitlines() if l.startswith("- ")]
    return sk

# --------------------------------------------------------------------------- shared chrome

CSS = r"""
:root{
  --ink:#181d26;--ink-active:#0d1218;--body:#333840;--muted:#41454d;--hairline:#dddddd;--border-strong:#9297a0;
  --canvas:#ffffff;--soft:#f8fafc;--strong:#e0e2e6;--dark:#181d26;
  --coral:#aa2d00;--forest:#0a2e0e;--cream:#f5e9d4;--peach:#fcab79;--mint:#a8d8c4;--yellow:#f4d35e;--mustard:#d9a441;
  --link:#1b61c9;--info-border:#458fff;--success:#006400;
  --r-xs:2px;--r-sm:6px;--r-md:10px;--r-lg:12px;--r-full:9999px;
  --s1:4px;--s2:8px;--s3:12px;--s4:16px;--s5:24px;--s6:32px;--s7:48px;--section:96px;
  --font:"Inter","Haas",-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",sans-serif;
  --mono:"JetBrains Mono",ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;
  color-scheme:light;
}
*{box-sizing:border-box}
html{scroll-behavior:smooth;scroll-padding-top:88px;-webkit-text-size-adjust:100%}
body{margin:0;background:var(--canvas);color:var(--body);font:400 16px/1.5 var(--font);font-optical-sizing:auto;-webkit-font-smoothing:antialiased}
h1,h2,h3,h4{color:var(--ink);font-weight:400;margin:0;letter-spacing:0}
p{margin:0}
a{color:var(--link);text-decoration:none}
a:active{color:#1a3866}
code{font-family:var(--mono);font-size:.88em;background:var(--soft);border:1px solid var(--hairline);border-radius:var(--r-sm);padding:1px 6px;color:var(--ink);overflow-wrap:anywhere}
:focus-visible{outline:2px solid var(--info-border);outline-offset:2px}
.wrap{max-width:1280px;margin:0 auto;padding:0 var(--s7)}
.skip{position:absolute;left:-999px;top:8px;background:var(--ink);color:#fff;padding:8px 12px;border-radius:var(--r-sm);z-index:50}
.skip:focus{left:8px}

/* nav */
.nav{position:sticky;top:0;z-index:20;height:64px;background:var(--canvas);border-bottom:1px solid var(--hairline)}
.nav .wrap{height:100%;display:flex;align-items:center;gap:var(--s6)}
.brand{display:flex;align-items:center;gap:10px;color:var(--ink);font-weight:500;font-size:16px;white-space:nowrap}
.brand-mark{width:24px;height:24px;border-radius:var(--r-sm);display:grid;grid-template-columns:1fr 1fr;gap:2px;overflow:hidden}
.brand-mark i:nth-child(1){background:var(--coral)}.brand-mark i:nth-child(2){background:var(--forest)}
.brand-mark i:nth-child(3){background:var(--ink)}.brand-mark i:nth-child(4){background:var(--mustard)}
.nav-links{display:flex;gap:var(--s5);font-size:14px;flex:1;min-width:0}
.nav-links a{color:var(--ink);white-space:nowrap}
.nav-links a[aria-current=page]{box-shadow:inset 0 -2px 0 var(--ink);padding-bottom:4px}
.nav .btn{padding:10px 16px;font-size:14px}

/* buttons */
.btn{display:inline-flex;align-items:center;justify-content:center;gap:8px;font:500 16px/1.4 var(--font);padding:16px 24px;border-radius:var(--r-lg);border:1px solid transparent;cursor:pointer;text-decoration:none;white-space:nowrap}
.btn-primary{background:var(--ink);color:#fff;box-shadow:0 1px 2px rgba(24,29,38,.12),0 2px 8px rgba(27,97,201,.10)}
.btn-primary:active{background:var(--ink-active);color:#fff}
.btn-secondary{background:var(--canvas);color:var(--ink);border-color:var(--hairline)}
.btn-secondary:active{background:var(--soft);color:var(--ink)}
.btn-small{padding:8px 14px;font-size:14px;border-radius:var(--r-sm)}
.btn-row{display:flex;flex-wrap:wrap;gap:var(--s3)}

/* typography roles */
.eyebrow{font:500 14px/1.35 var(--font);letter-spacing:.16px;color:var(--muted);margin-bottom:var(--s4)}
.display-xl{font-size:48px;line-height:1.1;font-weight:500}
.display-lg{font-size:40px;line-height:1.2}
.display-md{font-size:32px;line-height:1.2}
.title-lg{font-size:24px;line-height:1.35;letter-spacing:.12px}
.title-md{font-size:20px;line-height:1.5}
.lede{font-size:20px;line-height:1.5;color:var(--body);max-width:720px;margin-top:var(--s5)}

/* bands */
.hero{padding:var(--section) 0 var(--s7)}
.band{padding:var(--section) 0}
.band-tight{padding:var(--s7) 0}
.band-cream{background:var(--cream)}
.band-head{display:flex;justify-content:space-between;align-items:flex-end;gap:var(--s5);margin-bottom:var(--s6);flex-wrap:wrap}
.band-head p{max-width:560px;margin-top:var(--s3)}

/* meta row */
.meta{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));border-top:1px solid var(--hairline);border-bottom:1px solid var(--hairline);margin-top:var(--s7)}
.meta div{padding:var(--s5) var(--s5) var(--s5) 0}
.meta div+div{padding-left:var(--s5);border-left:1px solid var(--hairline)}
.meta dt{font:500 14px/1.35 var(--font);color:var(--muted);letter-spacing:.16px}
.meta dd{margin:6px 0 0;font:500 16px/1.4 var(--font);color:var(--ink)}
.hero .btn-row{margin-top:var(--s6)}

/* pipeline */
.pipe{display:grid;grid-template-columns:repeat(6,minmax(0,1fr));gap:var(--s2);margin-top:var(--s6)}
.pipe-stage{border-radius:var(--r-md);padding:var(--s4);background:var(--soft);border:1px solid var(--hairline);min-height:92px;display:flex;flex-direction:column;justify-content:space-between;color:var(--muted)}
.pipe-stage b{font-weight:500;font-size:16px;color:var(--ink)}
.pipe-stage span{font-size:13px}
.pipe-stage.on{background:var(--c);border-color:var(--c);color:var(--o)}
.pipe-stage.on b{color:var(--o)}
a.pipe-stage{text-decoration:none}

/* signature card */
.sig{background:var(--c);color:var(--o);border-radius:var(--r-lg);padding:var(--s7)}
.sig h2,.sig h3{color:var(--o)}
.sig .muted{opacity:.82}
.sig-grid{display:grid;grid-template-columns:minmax(0,5fr) minmax(0,7fr);gap:var(--s7);align-items:start}
.need-list{list-style:none;margin:0;padding:0;display:grid;gap:var(--s3)}
.need-list li{display:flex;gap:var(--s3);align-items:flex-start;font-size:18px;line-height:1.4;padding:var(--s4) 0;border-bottom:1px solid color-mix(in srgb,var(--o) 22%,transparent)}
.need-list li:last-child{border-bottom:0}
.need-list .n{flex:none;width:28px;height:28px;border-radius:var(--r-full);border:1px solid color-mix(in srgb,var(--o) 45%,transparent);display:grid;place-items:center;font-size:13px;font-weight:500}
.sig code{background:color-mix(in srgb,var(--o) 12%,transparent);border-color:color-mix(in srgb,var(--o) 25%,transparent);color:var(--o)}

/* steps */
.steps-layout{display:grid;grid-template-columns:260px minmax(0,1fr);gap:var(--s7);align-items:start}
.rail{position:sticky;top:96px}
.rail ol{list-style:none;margin:var(--s5) 0 0;padding:0;display:grid;gap:2px}
.rail a{display:flex;gap:var(--s3);align-items:center;padding:10px 12px;border-radius:var(--r-md);color:var(--body);font-size:14px;line-height:1.3}
.rail a.is-active{background:var(--soft);color:var(--ink)}
.rail .dot{flex:none;width:26px;height:26px;border-radius:var(--r-full);border:1px solid var(--hairline);display:grid;place-items:center;font-size:12px;font-weight:500;color:var(--ink);background:var(--canvas)}
.rail a.is-done .dot{background:var(--ink);border-color:var(--ink);color:#fff}
.progress{display:grid;gap:var(--s2)}
.progress-track{height:6px;border-radius:var(--r-full);background:var(--strong);overflow:hidden}
.progress-bar{height:100%;width:0;background:var(--ink);border-radius:var(--r-full);transition:width .3s ease}
.progress-text{font:500 14px/1.35 var(--font);color:var(--muted)}
.rail .reset{margin-top:var(--s5);background:none;border:0;padding:0;font:400 14px var(--font);color:var(--link);cursor:pointer}
.mobile-progress{display:none}
.step-list{display:grid;gap:var(--s5)}
.step{border:1px solid var(--hairline);border-radius:var(--r-lg);padding:var(--s6);background:var(--canvas);scroll-margin-top:88px}
.step.is-done{background:var(--soft)}
.step-head{display:flex;gap:var(--s4);align-items:flex-start}
.step-num{flex:none;width:44px;height:44px;border-radius:var(--r-full);background:var(--c);color:var(--o);display:grid;place-items:center;font-weight:500;font-size:16px}
.step.is-done .step-num{background:var(--ink);color:#fff}
.step-kicker{font:500 14px/1.35 var(--font);color:var(--muted);letter-spacing:.16px}
.facts{display:grid;grid-template-columns:1fr 1fr;gap:var(--s3);margin:var(--s5) 0}
.fact{background:var(--soft);border-radius:var(--r-md);padding:var(--s4)}
.step.is-done .fact{background:var(--canvas)}
.fact dt{font:500 13px/1.3 var(--font);color:var(--muted);letter-spacing:.16px}
.fact dd{margin:4px 0 0;color:var(--ink);font-size:15px;line-height:1.4}
.step p{margin-top:var(--s4);font-size:16px;line-height:1.55}
.typebox{margin-top:var(--s5);border-radius:var(--r-md);background:var(--dark);color:#fff;overflow:hidden}
.typebox-head{display:flex;justify-content:space-between;align-items:center;padding:10px 12px 10px 20px;border-bottom:1px solid rgba(255,255,255,.12)}
.typebox-head span{font:500 13px/1.3 var(--font);letter-spacing:.16px;color:rgba(255,255,255,.75)}
.typebox pre{margin:0;padding:20px;font:400 14px/1.65 var(--mono);white-space:pre-wrap;word-break:break-word;color:#fff}
.copy{background:var(--canvas);color:var(--ink);border:1px solid var(--hairline);border-radius:var(--r-sm);font:500 13px/1 var(--font);padding:9px 14px;cursor:pointer;min-height:34px}
.copy:active{background:var(--soft)}
.copy.is-copied{background:var(--success);border-color:var(--success);color:#fff}
.checknote{margin-top:var(--s5);background:var(--cream);border-radius:var(--r-md);padding:var(--s4) var(--s5);display:flex;gap:var(--s3);align-items:flex-start;color:var(--ink);font-size:15px;line-height:1.5}
.checknote b{font-weight:500;flex:none}
.step-foot{margin-top:var(--s5);display:flex;justify-content:flex-end}
.step-toggle[aria-pressed=true]{background:var(--ink);color:#fff;border-color:var(--ink)}

/* checklist */
.checklist{display:grid;gap:var(--s3);max-width:860px}
.check-item{display:flex;gap:var(--s4);align-items:flex-start;background:var(--canvas);border-radius:var(--r-md);padding:var(--s4) var(--s5);cursor:pointer;color:var(--ink);font-size:17px;line-height:1.45}
.check-item input{appearance:none;-webkit-appearance:none;flex:none;width:24px;height:24px;margin:1px 0 0;border:1.5px solid var(--border-strong);border-radius:var(--r-sm);background:var(--canvas);display:grid;place-items:center;cursor:pointer}
.check-item input:checked{background:var(--ink);border-color:var(--ink)}
.check-item input:checked::after{content:"";width:6px;height:11px;border:solid #fff;border-width:0 2px 2px 0;transform:translateY(-1px) rotate(45deg)}
.check-item:has(input:checked) span{color:var(--muted);text-decoration:line-through;text-decoration-color:var(--border-strong)}
.check-status{margin-top:var(--s5);font:500 14px/1.35 var(--font);color:var(--muted)}

/* dark card list */
.mistakes{list-style:none;margin:var(--s6) 0 0;padding:0;display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:var(--s5)}
.mistakes li{border-top:1px solid rgba(255,255,255,.22);padding-top:var(--s4);font-size:16px;line-height:1.5}
.mistakes .x{display:block;font:500 13px/1 var(--font);letter-spacing:.16px;opacity:.7;margin-bottom:var(--s3)}

/* cta band */
.cta{background:var(--strong);border-radius:var(--r-lg);padding:var(--s7);display:flex;justify-content:space-between;align-items:center;gap:var(--s5);flex-wrap:wrap}
.cta p{margin-top:var(--s2)}

/* grids & cards */
.grid{display:grid;gap:var(--s5)}
.grid-2{grid-template-columns:repeat(2,minmax(0,1fr))}
.grid-3{grid-template-columns:repeat(3,minmax(0,1fr))}
.grid-4{grid-template-columns:repeat(4,minmax(0,1fr))}
.uneven{align-items:start}
.card{border-radius:var(--r-md);padding:var(--s5);background:var(--canvas);border:1px solid var(--hairline);color:var(--ink);display:flex;flex-direction:column;gap:var(--s3)}
.card.fill{border-color:transparent;background:var(--bg)}
.card .k{font:500 13px/1.3 var(--font);letter-spacing:.16px;color:var(--muted)}
.card.fill .k{color:rgba(24,29,38,.7)}
.card h3{font-size:20px;line-height:1.35}
.card p{font-size:15px;line-height:1.5;color:var(--body)}
.card.fill p{color:var(--ink)}
.card .go{margin-top:auto;padding-top:var(--s3);font-weight:500;font-size:15px;color:var(--ink)}
a.card{text-decoration:none}
a.card:active{opacity:.92}
.bignum{font-size:48px;line-height:1;font-weight:400;color:var(--ink)}
.chip{display:inline-block;font:500 13px/1.2 var(--font);padding:5px 10px;border-radius:var(--r-sm);background:rgba(255,255,255,.6);color:var(--ink);border:1px solid rgba(24,29,38,.12)}
.mini-progress{font:500 13px/1.3 var(--font);color:rgba(24,29,38,.72)}
.h-180{min-height:180px}.h-220{min-height:220px}.h-260{min-height:260px}.h-300{min-height:300px}

/* asks (copyable rows on signature card) */
.asks{list-style:none;margin:0;padding:0;display:grid;gap:0}
.asks li{display:flex;gap:var(--s4);align-items:center;justify-content:space-between;padding:var(--s4) 0;border-bottom:1px solid color-mix(in srgb,var(--o) 22%,transparent)}
.asks li:last-child{border-bottom:0}
.asks q{font-size:18px;line-height:1.45;quotes:"\201C" "\201D"}

/* tabs */
.tabs{display:grid;grid-template-columns:240px minmax(0,1fr);background:var(--canvas);border-radius:var(--r-lg);overflow:hidden}
.tablist{display:flex;flex-direction:column;padding:var(--s4);gap:2px;border-right:1px solid var(--hairline);background:var(--soft)}
.tab{all:unset;cursor:pointer;padding:12px 16px;border-radius:var(--r-md);font:400 18px/1.4 var(--font);color:var(--muted)}
.tab[aria-selected=true]{background:var(--canvas);color:var(--ink);box-shadow:0 0 0 1px var(--hairline)}
.tab:focus-visible{outline:2px solid var(--info-border)}
.tabpanel{padding:var(--s6)}
.tabpanel ol{margin:0;padding-left:22px;display:grid;gap:var(--s3);font-size:16px;line-height:1.55;color:var(--ink)}
.after-attach{margin-top:var(--s5)}

/* logo strip */
.strip{display:flex;flex-wrap:wrap;gap:var(--s3) var(--s6);color:var(--muted);font-size:15px;padding:var(--s6) 0;border-top:1px solid var(--hairline);border-bottom:1px solid var(--hairline);margin-top:var(--s7)}
.strip b{font-weight:500;color:var(--ink);margin-right:var(--s3)}

/* how it works */
.how{list-style:none;margin:var(--s6) 0 0;padding:0;display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:var(--s5);counter-reset:how}
.how li{counter-increment:how;border-top:1px solid color-mix(in srgb,var(--o) 30%,transparent);padding-top:var(--s4)}
.how li::before{content:counter(how,decimal-leading-zero);display:block;font-size:32px;line-height:1.2;margin-bottom:var(--s3)}
.how b{display:block;font-weight:500;font-size:17px;margin-bottom:6px}
.how span{font-size:15px;line-height:1.5;opacity:.85}

/* footer */
.foot{padding:var(--s7) 0 var(--s6);margin-top:var(--section);border-top:1px solid var(--hairline);font-size:14px;color:var(--muted)}
.foot .wrap{display:flex;justify-content:space-between;gap:var(--s5);flex-wrap:wrap}
.foot nav{display:flex;flex-wrap:wrap;gap:var(--s5)}
.foot a{color:var(--muted)}

@media (max-width:1024px){
  .grid-4{grid-template-columns:repeat(2,minmax(0,1fr))}
  .grid-3{grid-template-columns:repeat(2,minmax(0,1fr))}
  .how{grid-template-columns:repeat(2,minmax(0,1fr))}
  .sig-grid{grid-template-columns:1fr;gap:var(--s5)}
  .mistakes{grid-template-columns:1fr}
}
@media (max-width:900px){
  .steps-layout{grid-template-columns:1fr}
  .rail{display:none}
  .mobile-progress{display:block;position:sticky;top:64px;z-index:10;background:var(--canvas);padding:var(--s3) 0;border-bottom:1px solid var(--hairline);margin-bottom:var(--s5)}
  .nav-links{display:none}
  .tabs{grid-template-columns:1fr}
  .tablist{display:grid;grid-template-columns:1fr 1fr;border-right:0;border-bottom:1px solid var(--hairline)}
  .tab{font-size:16px;white-space:nowrap}
}
@media (max-width:767px){
  .wrap{padding:0 16px}
  .hero{padding:var(--s7) 0 var(--s6)}
  .band{padding:64px 0}
  .display-xl{font-size:36px}
  .display-lg{font-size:32px}
  .display-md{font-size:26px}
  .lede{font-size:18px}
  .meta{grid-template-columns:1fr 1fr}
  .meta div,.meta div+div{padding:var(--s4) var(--s3) var(--s4) 0;border-left:0}
  .meta div:nth-child(even){padding-left:var(--s4);border-left:1px solid var(--hairline)}
  .meta div:nth-child(n+3){border-top:1px solid var(--hairline)}
  .pipe{grid-template-columns:repeat(3,minmax(0,1fr))}
  .sig,.cta{padding:var(--s5)}
  .step{padding:var(--s5) var(--s4)}
  .facts{grid-template-columns:1fr}
  .grid-2,.grid-3,.grid-4,.how{grid-template-columns:1fr}
  .h-180,.h-220,.h-260,.h-300{min-height:0}
  .asks li{flex-direction:column;align-items:flex-start}
  .asks q{font-size:16px}
  .btn-row .btn{flex:1 1 auto}
  .nav .btn{display:none}
  .tabpanel{padding:var(--s5)}
}
@media (prefers-reduced-motion:reduce){html{scroll-behavior:auto}.progress-bar{transition:none}}
"""

JS = r"""
(function(){
  var page=document.body.getAttribute('data-page');var KEY='aiad:'+page;var state={};
  try{state=JSON.parse(localStorage.getItem(KEY)||'{}')||{}}catch(e){state={}}
  state.steps=state.steps||{};state.checks=state.checks||{};
  function save(){try{localStorage.setItem(KEY,JSON.stringify(state))}catch(e){}}

  function fallbackCopy(t,cb){var ta=document.createElement('textarea');ta.value=t;ta.setAttribute('readonly','');ta.style.position='fixed';ta.style.top='-1000px';document.body.appendChild(ta);ta.select();try{document.execCommand('copy')}catch(e){}document.body.removeChild(ta);cb()}
  document.querySelectorAll('[data-copy]').forEach(function(btn){btn.addEventListener('click',function(){
    var el=document.getElementById(btn.getAttribute('data-copy'));var text=el?el.innerText:'';
    var label=btn.textContent;var done=function(){btn.textContent='Copied';btn.classList.add('is-copied');setTimeout(function(){btn.textContent=label;btn.classList.remove('is-copied')},1600)};
    if(navigator.clipboard&&window.isSecureContext){navigator.clipboard.writeText(text).then(done,function(){fallbackCopy(text,done)})}else{fallbackCopy(text,done)}
  })});

  var steps=[].slice.call(document.querySelectorAll('.step'));
  function renderSteps(){
    var n=steps.filter(function(s){return state.steps[s.id]}).length;
    document.querySelectorAll('[data-progress-text]').forEach(function(e){e.textContent=n+' of '+steps.length+' steps done'});
    document.querySelectorAll('[data-progress-bar]').forEach(function(e){e.style.width=(steps.length?n/steps.length*100:0)+'%'});
    steps.forEach(function(s){var d=!!state.steps[s.id];s.classList.toggle('is-done',d);
      var b=s.querySelector('[data-step-toggle]');if(b){b.setAttribute('aria-pressed',d?'true':'false');b.textContent=d?'Done ✓':'Mark step as done'}
      var r=document.querySelector('.rail a[href="#'+s.id+'"]');if(r){r.classList.toggle('is-done',d)}});
  }
  document.querySelectorAll('[data-step-toggle]').forEach(function(b){b.addEventListener('click',function(){
    var s=b.closest('.step');var id=s.id;state.steps[id]=!state.steps[id];save();renderSteps();
    if(state.steps[id]){var i=steps.indexOf(s);var next=steps[i+1]||document.getElementById('done');if(next){next.scrollIntoView({block:'start'})}}
  })});

  var checks=[].slice.call(document.querySelectorAll('.check-item input'));
  function renderChecks(){var n=checks.filter(function(c){return c.checked}).length;
    document.querySelectorAll('[data-check-text]').forEach(function(e){e.textContent=(checks.length&&n===checks.length)?'All done. You’re ready for the next workflow.':n+' of '+checks.length+' checked'})}
  checks.forEach(function(c){c.checked=!!state.checks[c.id];c.addEventListener('change',function(){state.checks[c.id]=c.checked;save();renderChecks()})});

  document.querySelectorAll('[data-reset]').forEach(function(b){b.addEventListener('click',function(){state={steps:{},checks:{}};save();checks.forEach(function(c){c.checked=false});renderSteps();renderChecks()})});

  if('IntersectionObserver' in window&&steps.length){var io=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){document.querySelectorAll('.rail a').forEach(function(a){a.classList.toggle('is-active',a.getAttribute('href')==='#'+e.target.id)})}})},{rootMargin:'-25% 0px -65% 0px'});steps.forEach(function(s){io.observe(s)})}

  document.querySelectorAll('[role=tablist]').forEach(function(list){var tabs=[].slice.call(list.querySelectorAll('[role=tab]'));
    function select(i){tabs.forEach(function(t,j){t.setAttribute('aria-selected',i===j?'true':'false');t.tabIndex=i===j?0:-1;var p=document.getElementById(t.getAttribute('aria-controls'));if(p){p.hidden=i!==j}})}
    tabs.forEach(function(t,i){t.addEventListener('click',function(){select(i)});t.addEventListener('keydown',function(e){var k=e.key,j=-1;if(k==='ArrowDown'||k==='ArrowRight'){j=(i+1)%tabs.length}if(k==='ArrowUp'||k==='ArrowLeft'){j=(i-1+tabs.length)%tabs.length}if(j>-1){e.preventDefault();select(j);tabs[j].focus()}})})});

  document.querySelectorAll('[data-wf-progress]').forEach(function(el){var st={};try{st=JSON.parse(localStorage.getItem('aiad:'+el.getAttribute('data-wf-progress'))||'{}')||{}}catch(e){}
    var total=+el.getAttribute('data-total');var n=Object.keys(st.steps||{}).filter(function(k){return st.steps[k]}).length;el.textContent=n?(n+' of '+total+' steps done'):total+' steps'});

  renderSteps();renderChecks();
})();
"""

FONTS = ('<link rel="preconnect" href="https://fonts.googleapis.com">'
         '<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>'
         '<link href="https://fonts.googleapis.com/css2?family=Inter:opsz,wght@14..32,400;14..32,500;14..32,600'
         '&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet">')


def page(page_id, title, desc, body, current=None, color="#181d26", on="#ffffff"):
    links = [("index.html", "Home", "home")] + [
        (f"workflow-{n}.html", f"{n} {w['short']}", f"workflow-{n}") for n, w in WORKFLOWS.items()]
    nav = "".join(
        f'<a href="{h}"{" aria-current=page" if pid == current else ""}>{html.escape(t)}</a>' for h, t, pid in links)
    return f"""<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>{html.escape(title)}</title>
<meta name="description" content="{html.escape(desc)}">
{FONTS}
<style>{CSS}</style>
</head>
<body data-page="{page_id}" style="--c:{color};--o:{on}">
<a class="skip" href="#main">Skip to content</a>
<header class="nav"><div class="wrap">
  <a class="brand" href="index.html"><span class="brand-mark" aria-hidden="true"><i></i><i></i><i></i><i></i></span>AI &amp; Advertising</a>
  <nav class="nav-links" aria-label="Workflows">{nav}</nav>
  <a class="btn btn-primary" href="workflow-01.html">Start Workflow 01</a>
</div></header>
<main id="main">
{body}
</main>
<footer class="foot"><div class="wrap">
  <span>AI &amp; Advertising · Student Kit · Ideabro Studio</span>
  <nav aria-label="Footer">
    <a href="index.html">Home</a><a href="index.html#workflows">Workflows</a><a href="index.html#skills">Skills</a><a href="../START-HERE.md">START-HERE.md</a>
  </nav>
</div></footer>
<script>{JS}</script>
</body>
</html>
"""


def pipeline(active_wf=None, link=False):
    out = []
    for stage, n in zip(STAGES, STAGE_WF):
        w = WORKFLOWS[n]
        on = active_wf is None or active_wf == n
        cls = "pipe-stage on" if on else "pipe-stage"
        style = f' style="--c:{w["color"]};--o:{w["on"]}"'
        inner = f"<b>{stage}</b><span>Workflow {n}</span>"
        if link:
            out.append(f'<a class="{cls}" href="workflow-{n}.html"{style}>{inner}</a>')
        else:
            out.append(f'<div class="{cls}"{style}>{inner}</div>')
    label = "The 6 steps of every ad, and which workflow covers each"
    return f'<div class="pipe" role="list" aria-label="{label}">' + "".join(
        x.replace(' class="pipe-stage', ' role="listitem" class="pipe-stage', 1) for x in out) + "</div>"


def skill_link(name):
    return f'<a href="skill-{name}.html"><code>{name}</code></a>'

# --------------------------------------------------------------------------- workflow page

def build_workflow(wf, nxt):
    n = wf["num"]
    meta = "".join(
        f"<div><dt>{html.escape(k)}</dt><dd>{inline(v)}</dd></div>" for k, v in wf["meta"])
    skill_btns = "".join(
        f'<a class="btn btn-secondary" href="skill-{s}.html">Skill: {SKILLS[s]["nickname"]}</a>'
        for s in wf["skills"])
    need = "".join(f'<li><span class="n">{i}</span><span>{inline(x)}</span></li>' for i, x in enumerate(wf["need"], 1))
    rail = "".join(
        f'<li><a href="#step-{s["n"]}"><span class="dot">{s["n"]}</span><span>{html.escape(s["title"])}</span></a></li>'
        for s in wf["steps"])
    steps = []
    for s in wf["steps"]:
        parts = []
        code_i = 0
        for kind, val in s["blocks"]:
            if kind == "p":
                parts.append(f"<p>{inline(val)}</p>")
            elif kind == "code":
                code_i += 1
                cid = f"type-{s['n']}-{code_i}"
                parts.append(
                    f'<div class="typebox"><div class="typebox-head"><span>Type this</span>'
                    f'<button class="copy" type="button" data-copy="{cid}">Copy</button></div>'
                    f'<pre id="{cid}">{html.escape(val)}</pre></div>')
            elif kind == "check":
                parts.append(f'<div class="checknote"><b>Check</b><span>{inline(val)}</span></div>')
        facts = ""
        if s["tool"] or s["get"]:
            facts = (f'<dl class="facts"><div class="fact"><dt>Tool</dt><dd>{inline(s["tool"])}</dd></div>'
                     f'<div class="fact"><dt>You get</dt><dd>{inline(s["get"])}</dd></div></dl>')
        steps.append(f"""
<article class="step" id="step-{s['n']}" aria-labelledby="step-{s['n']}-t">
  <div class="step-head"><span class="step-num" aria-hidden="true">{s['n']}</span>
    <div><div class="step-kicker">Step {s['n']} of {len(wf['steps'])}</div><h3 class="title-lg" id="step-{s['n']}-t">{html.escape(s['title'])}</h3></div></div>
  {facts}
  {''.join(parts)}
  <div class="step-foot"><button class="btn btn-secondary btn-small step-toggle" type="button" data-step-toggle aria-pressed="false">Mark step as done</button></div>
</article>""")
    done = "".join(
        f'<label class="check-item"><input type="checkbox" id="done-{i}"><span>{inline(x)}</span></label>'
        for i, x in enumerate(wf["done"], 1))
    mistakes = "".join(
        f'<li><span class="x">Mistake {i}</span>{inline(x)}</li>' for i, x in enumerate(wf["mistakes"], 1))
    if nxt:
        nw = WORKFLOWS[nxt]
        cta = (f'<div><h2 class="display-md">Next: Workflow {nxt}</h2><p>{html.escape(nw["short"])}</p></div>'
               f'<div class="btn-row"><a class="btn btn-primary" href="workflow-{nxt}.html">Go to Workflow {nxt}</a>'
               f'<a class="btn btn-secondary" href="index.html#workflows">All workflows</a></div>')
    else:
        cta = ('<div><h2 class="display-md">That’s the full loop.</h2><p>Brief to live ad. For your capstone, run Workflows 01 → 04 for one brand.</p></div>'
               '<div class="btn-row"><a class="btn btn-primary" href="workflow-01.html">Back to Workflow 01</a>'
               '<a class="btn btn-secondary" href="index.html">Home</a></div>')
    total = len(wf["steps"])
    body = f"""
<section class="hero"><div class="wrap">
  <div class="eyebrow">Workflow {n} of 04</div>
  <h1 class="display-lg">{html.escape(wf['title'])}</h1>
  <p class="lede">{inline(wf['tagline'])}</p>
  <div class="btn-row"><a class="btn btn-primary" href="#step-1">Start step 1</a>{skill_btns}</div>
  <dl class="meta">{meta}</dl>
  {pipeline(n, link=True)}
</div></section>

<section class="band-tight"><div class="wrap"><div class="sig">
  <div class="sig-grid">
    <div><div class="eyebrow" style="color:inherit;opacity:.8">Before you start</div><h2 class="display-md">You need</h2>
    <p class="muted" style="margin-top:12px">Get these ready. Then follow the {total} steps in order.</p></div>
    <ul class="need-list">{need}</ul>
  </div>
</div></div></section>

<section class="band" aria-labelledby="steps-t"><div class="wrap">
  <div class="band-head"><div><div class="eyebrow">{total} steps</div><h2 class="display-md" id="steps-t">Do it step by step</h2>
  <p>Copy each <strong>Type this</strong> box into the chat with the skill attached. Tick each step when it’s done. Your progress is saved in this browser.</p></div></div>
  <div class="mobile-progress"><div class="progress"><div class="progress-track"><div class="progress-bar" data-progress-bar></div></div><div class="progress-text" data-progress-text>0 of {total} steps done</div></div></div>
  <div class="steps-layout">
    <aside class="rail" aria-label="Steps">
      <div class="progress"><div class="progress-track"><div class="progress-bar" data-progress-bar></div></div><div class="progress-text" data-progress-text>0 of {total} steps done</div></div>
      <ol>{rail}</ol>
      <button class="reset" type="button" data-reset>Reset my progress</button>
    </aside>
    <div class="step-list">{''.join(steps)}</div>
  </div>
</div></section>

<section class="band band-cream" id="done" aria-labelledby="done-t"><div class="wrap">
  <div class="band-head"><div><div class="eyebrow">Finish line</div><h2 class="display-md" id="done-t">Done when</h2>
  <p>Tick every box before you move on.</p></div></div>
  <div class="checklist">{done}</div>
  <div class="check-status" data-check-text aria-live="polite"></div>
</div></section>

<section class="band-tight" style="padding-top:var(--section)"><div class="wrap">
  <div class="sig" style="--c:#181d26;--o:#ffffff">
    <div class="eyebrow" style="color:inherit;opacity:.75">Avoid these</div>
    <h2 class="display-md">Common mistakes</h2>
    <ul class="mistakes">{mistakes}</ul>
  </div>
</div></section>

<section class="band-tight"><div class="wrap"><div class="cta">{cta}</div></div></section>
"""
    return page(f"workflow-{n}", f"Workflow {n}: {wf['title']}", wf["tagline"], body,
                current=f"workflow-{n}", color=wf["color"], on=wf["on"])

# --------------------------------------------------------------------------- skill page

def build_skill(sk):
    name = sk["name"]
    asks = "".join(
        f'<li><q id="ask-{i}">{html.escape(a)}</q><button class="copy" type="button" data-copy="ask-{i}">Copy</button></li>'
        for i, a in enumerate(sk["asks"], 1))
    surfaces = ["#fcab79", "#a8d8c4", "#f4d35e", "#f5e9d4", "#f8fafc", "#a8d8c4", "#fcab79"]
    heights = ["h-220", "h-180", "h-260", "h-180", "h-220", "h-260", "h-180"]
    modes = "".join(
        f'<div class="card fill {heights[i % len(heights)]}" style="--bg:{surfaces[i % len(surfaces)]}">'
        f'<span class="k">{html.escape(k)}</span><h3>{html.escape(t)}</h3><p>{html.escape(d)}</p></div>'
        for i, (k, t, d) in enumerate(sk["modes"]))
    tabs = "".join(
        f'<button class="tab" role="tab" id="tab-{tid}" aria-controls="panel-{tid}" aria-selected="{"true" if i == 0 else "false"}" tabindex="{0 if i == 0 else -1}">{label}</button>'
        for i, (tid, label, _) in enumerate(ATTACH))
    panels = "".join(
        f'<div class="tabpanel" role="tabpanel" id="panel-{tid}" aria-labelledby="tab-{tid}"{"" if i == 0 else " hidden"}>'
        f'<ol>{"".join(f"<li>{x}</li>" for x in items)}</ol></div>'
        for i, (tid, _, items) in enumerate(ATTACH))
    first_line = ("Follow this skill. My product is ___. My goal is ___. "
                  "I've attached my product photos and Brand Bible.")
    tips = "".join(f'<li><span class="x">Tip {i}</span>{html.escape(t)}</li>' for i, t in enumerate(sk["tips"], 1))
    wf_links = ", ".join(f'<a href="workflow-{w}.html">Workflow {w}</a>' for w in sk["workflows"])
    files = ", ".join(f"<code>{html.escape(f)}</code>" for f in sk["files"])
    main_wf = sk["workflows"][0]
    ffmpeg = ""
    if name == "vibe-editor":
        ffmpeg = ('<div class="checknote" style="margin-top:24px;background:var(--canvas)"><b>ffmpeg</b><span>For full auto editing, install ffmpeg once. '
                  'Mac: <code>brew install ffmpeg</code> · Windows: <code>winget install Gyan.FFmpeg</code> · Linux: <code>sudo apt install ffmpeg</code>. '
                  'Check with <code>ffmpeg -version</code>.</span></div>')
    body = f"""
<section class="hero"><div class="wrap">
  <div class="eyebrow">Skill · {html.escape(sk['nickname'])}</div>
  <h1 class="display-lg">{html.escape(sk['display'])}</h1>
  <p class="lede">{html.escape(sk['oneline'])}</p>
  <div class="btn-row"><a class="btn btn-primary" href="../skills/{name}/SKILL.md">Open SKILL.md</a><a class="btn btn-secondary" href="#attach">How to attach it</a></div>
  <dl class="meta">
    <div><dt>Skill file</dt><dd><code>{name}</code></dd></div>
    <div><dt>Used in</dt><dd>{wf_links}</dd></div>
    <div><dt>Modules</dt><dd>{sk['modules']}</dd></div>
    <div><dt>Works in</dt><dd>Claude, ChatGPT, Gemini, Claude Code</dd></div>
  </dl>
</div></section>

<section class="band-tight"><div class="wrap"><div class="sig" style="--c:{sk['color']};--o:{sk['on']}">
  <div class="sig-grid">
    <div><div class="eyebrow" style="color:inherit;opacity:.8">Copy, then change the details</div><h2 class="display-md">Ask it like this</h2>
    <p class="muted" style="margin-top:12px">Attach the skill, then type requests like these. Use your own product and goal.</p></div>
    <ul class="asks">{asks}</ul>
  </div>
</div></div></section>

<section class="band" aria-labelledby="modes-t"><div class="wrap">
  <div class="band-head"><div><div class="eyebrow">What’s inside</div><h2 class="display-md" id="modes-t">What it can do</h2>
  <p>You don’t pick a mode. Just ask, and the skill picks the right one.</p></div></div>
  <div class="grid grid-3 uneven">{modes}</div>
</div></section>

<section class="band band-cream" id="attach" aria-labelledby="attach-t"><div class="wrap">
  <div class="band-head"><div><div class="eyebrow">Setup, once</div><h2 class="display-md" id="attach-t">How to attach it</h2>
  <p>Pick your app. Menu names change sometimes; look for Skills, Knowledge or Instructions.</p></div></div>
  <div class="tabs"><div class="tablist" role="tablist" aria-label="Choose your app">{tabs}</div><div>{panels}</div></div>
  <div class="typebox after-attach"><div class="typebox-head"><span>Then type this first</span><button class="copy" type="button" data-copy="first-line">Copy</button></div><pre id="first-line">{html.escape(first_line)}</pre></div>
  {ffmpeg}
  <p style="margin-top:16px;font-size:14px;color:var(--muted)">Files in this skill folder: {files}</p>
</div></section>

<section class="band-tight" style="padding-top:var(--section)"><div class="wrap">
  <div class="sig" style="--c:#181d26;--o:#ffffff">
    <div class="eyebrow" style="color:inherit;opacity:.75">Get better results</div>
    <h2 class="display-md">Good to know</h2>
    <ul class="mistakes">{tips}</ul>
  </div>
</div></section>

<section class="band-tight"><div class="wrap"><div class="cta">
  <div><h2 class="display-md">Use it in Workflow {main_wf}</h2><p>{html.escape(WORKFLOWS[main_wf]['short'])}, step by step.</p></div>
  <div class="btn-row"><a class="btn btn-primary" href="workflow-{main_wf}.html">Go to Workflow {main_wf}</a><a class="btn btn-secondary" href="index.html#skills">All skills</a></div>
</div></div></section>
"""
    return page(f"skill-{name}", f"{sk['display']}: {sk['nickname']}", sk["oneline"], body,
                current=None, color=sk["color"], on=sk["on"])

# --------------------------------------------------------------------------- hub page

def build_index(wfs, sks):
    heights = ["h-300", "h-260", "h-300", "h-260"]
    wcards = []
    for i, wf in enumerate(wfs):
        skills = " ".join(f'<span class="chip">{s}</span>' for s in wf["skills"])
        wcards.append(
            f'<a class="card fill {heights[i]}" style="--bg:{wf["surface"]}" href="workflow-{wf["num"]}.html">'
            f'<span class="bignum">{wf["num"]}</span><h3>{html.escape(wf["title"])}</h3>'
            f'<p>{inline(wf["tagline"])}</p><div>{skills}</div>'
            f'<span class="mini-progress" data-wf-progress="workflow-{wf["num"]}" data-total="{len(wf["steps"])}">{len(wf["steps"])} steps</span>'
            f'<span class="go">Open workflow →</span></a>')
    scards = []
    for sk in sks:
        wl = ", ".join(f"Workflow {w}" for w in sk["workflows"])
        scards.append(
            f'<a class="card" href="skill-{sk["name"]}.html"><span class="k">{html.escape(sk["nickname"])}</span>'
            f'<h3>{html.escape(sk["display"])}</h3><p>{html.escape(sk["oneline"])}</p>'
            f'<span class="k">Used in {wl}</span><span class="go">Open skill →</span></a>')
    body = f"""
<section class="hero"><div class="wrap">
  <div class="eyebrow">AI &amp; Advertising · Student Kit</div>
  <h1 class="display-xl">From brief to live ad.<br>4 skills. 4 workflows.</h1>
  <p class="lede">Attach a skill to Claude, ChatGPT or Gemini. It writes your prompts. You paste them into Google Flow or ChatGPT, and direct the result.</p>
  <div class="btn-row"><a class="btn btn-primary" href="workflow-01.html">Start Workflow 01</a><a class="btn btn-secondary" href="#skills">Meet the skills</a></div>
  {pipeline(None, link=True)}
  <div class="strip"><span><b>Tools</b></span><span>Google Flow (Google Omni Flash 1.2 · Nano Banana 1.1)</span><span>ChatGPT (GPT Image 2.6)</span><span>Claude</span><span>Gemini</span><span>ElevenLabs</span><span>Suno</span><span>Meta Ads Manager</span></div>
</div></section>

<section class="band-tight"><div class="wrap"><div class="sig" style="--c:#aa2d00;--o:#ffffff">
  <div class="eyebrow" style="color:inherit;opacity:.8">The basic loop</div>
  <h2 class="display-md">How every lesson works</h2>
  <ol class="how">
    <li><b>Attach a skill</b><span>Upload it in Claude, or attach <code>SKILL.md</code> in ChatGPT or Gemini.</span></li>
    <li><b>Say what you want</b><span>Your product, your goal. Attach product photos and your Brand Bible.</span></li>
    <li><b>Paste the prompts</b><span>Copy each prompt into Google Flow or ChatGPT and generate.</span></li>
    <li><b>Direct the result</b><span>Bring it back: “label is wrong, warmer light”. Three notes per round.</span></li>
  </ol>
</div></div></section>

<section class="band" id="workflows" aria-labelledby="wf-t"><div class="wrap">
  <div class="band-head"><div><div class="eyebrow">Follow in order</div><h2 class="display-md" id="wf-t">The 4 workflows</h2>
  <p>Each one is a short list of steps with exactly what to type. Do them in order with your own brand. That’s your capstone.</p></div></div>
  <div class="grid grid-4 uneven">{''.join(wcards)}</div>
</div></section>

<section class="band band-cream" id="skills" aria-labelledby="sk-t"><div class="wrap">
  <div class="band-head"><div><div class="eyebrow">Your AI team</div><h2 class="display-md" id="sk-t">The 4 skills</h2>
  <p>Each skill turns any AI chat into a specialist. They work in Claude, ChatGPT, Gemini and Claude Code.</p></div></div>
  <div class="grid grid-4">{''.join(scards)}</div>
</div></section>

<section class="band-tight" style="padding-top:var(--section)"><div class="wrap">
  <div class="sig" style="--c:#181d26;--o:#ffffff">
    <div class="eyebrow" style="color:inherit;opacity:.75">Do this once</div>
    <h2 class="display-md">Before you start</h2>
    <ul class="mistakes">
      <li><span class="x">1</span>Pick your brand: your own, a client’s, or a made-up one. You’ll use it all course.</li>
      <li><span class="x">2</span>Take 5 product photos: front, both sides, back and top, on a plain background in daylight.</li>
      <li><span class="x">3</span>Make your Brand Bible with the <code>ad-strategist</code> skill (Workflow 01, step 6).</li>
    </ul>
  </div>
</div></section>

<section class="band-tight"><div class="wrap"><div class="cta">
  <div><h2 class="display-md">Start with the plan.</h2><p>Workflow 01 takes about an hour.</p></div>
  <div class="btn-row"><a class="btn btn-primary" href="workflow-01.html">Start Workflow 01</a></div>
</div></div></section>
"""
    return page("home", "AI & Advertising: Student Kit",
                "4 skills and 4 workflows that take you from a brief to a live ad.", body, current="home")

# --------------------------------------------------------------------------- main

def main():
    OUT.mkdir(parents=True, exist_ok=True)
    wfs = [parse_workflow(n, cfg) for n, cfg in WORKFLOWS.items()]
    sks = [parse_skill(n, cfg) for n, cfg in SKILLS.items()]
    nums = list(WORKFLOWS)
    for i, wf in enumerate(wfs):
        nxt = nums[i + 1] if i + 1 < len(nums) else None
        (OUT / f"workflow-{wf['num']}.html").write_text(build_workflow(wf, nxt), encoding="utf-8")
    for sk in sks:
        (OUT / f"skill-{sk['name']}.html").write_text(build_skill(sk), encoding="utf-8")
    (OUT / "index.html").write_text(build_index(wfs, sks), encoding="utf-8")
    for wf in wfs:
        print(f"workflow-{wf['num']}: {len(wf['steps'])} steps, {len(wf['need'])} needs, "
              f"{len(wf['done'])} checks, {len(wf['mistakes'])} mistakes, "
              f"{sum(1 for s in wf['steps'] for b in s['blocks'] if b[0] == 'code')} type-boxes")
    for sk in sks:
        print(f"skill-{sk['name']}: {len(sk['asks'])} asks, {len(sk['modes'])} modes")
    print("->", OUT)


if __name__ == "__main__":
    main()
