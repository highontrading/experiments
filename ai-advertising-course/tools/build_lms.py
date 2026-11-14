#!/usr/bin/env python3
"""Build LMS-SETUP.html (copy-paste guide for the LMS admin) and lms/course-content.json.

    python3 tools/build_lms.py

Content lives in tools/lms_content.py. Lesson "what you'll learn" text and module
descriptions come from LECTURE-NOTES.md, so the LMS always matches the lectures.
"""
import html
import json
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
import build_pages as bp  # noqa: E402
import lms_content as C  # noqa: E402

ROOT = bp.ROOT

LMS_CSS = r"""
.frows{display:grid;gap:var(--s3);margin-top:var(--s5)}
.frow{display:grid;grid-template-columns:220px minmax(0,1fr);gap:var(--s4);align-items:start;padding:var(--s3) 0;border-top:1px solid var(--hairline)}
.frow:first-child{border-top:0}
.flabel{font:500 12px/1.4 var(--mono);letter-spacing:1.2px;text-transform:uppercase;color:var(--muted);padding-top:12px}
.fval{display:flex;gap:var(--s3);align-items:flex-start;background:var(--soft);border:1px solid var(--hairline);border-radius:var(--r-sm);padding:8px 8px 8px 14px;min-height:44px}
.fval span,.fval pre{flex:1;min-width:0;margin:0;color:var(--ink);font:400 15px/1.5 var(--font);white-space:pre-wrap;word-break:break-word;padding-top:3px}
.fval pre{font-family:var(--font)}
.fval.placeholder span{color:var(--muted);font-style:italic}
.fnote{grid-column:2;font-size:14px;line-height:1.45;color:var(--muted);margin-top:-4px}
.lessons-head{margin-top:var(--s6);display:flex;align-items:baseline;justify-content:space-between;gap:var(--s3);flex-wrap:wrap}
.lessons-head b{font-weight:500;color:var(--ink);font-size:16px}
.lessons-head span{font-size:14px;color:var(--muted)}
details.lrow{border:1px solid var(--hairline);border-radius:var(--r-md);margin-top:var(--s2);background:var(--canvas)}
details.lrow>summary{list-style:none;cursor:pointer;display:flex;gap:var(--s3);align-items:center;padding:14px var(--s4)}
details.lrow>summary::-webkit-details-marker{display:none}
details.lrow>summary::after{content:"+";margin-left:auto;font-size:20px;line-height:1;color:var(--muted)}
details.lrow[open]>summary::after{content:"\2212"}
details.lrow>summary b{font-weight:500;color:var(--ink)}
details.lrow>summary small{color:var(--muted);font:400 13px var(--mono)}
details.lrow .frows{padding:0 var(--s4) var(--s4);margin-top:0}
.order{list-style:none;margin:var(--s6) 0 0;padding:0;display:grid;grid-template-columns:repeat(5,minmax(0,1fr));gap:var(--s4);counter-reset:o}
.order li{counter-increment:o;border-top:1px solid rgba(255,255,255,.3);padding-top:var(--s4);font-size:15px;line-height:1.5}
.order li::before{content:counter(o);display:block;font-size:32px;line-height:1.2;margin-bottom:var(--s2)}
.order b{display:block;font-weight:500;font-size:17px;margin-bottom:4px}
.resect{border:1px solid var(--hairline);border-radius:var(--r-lg);padding:var(--s6);margin-top:var(--s5);background:var(--canvas)}
.resect h3{font:500 16px/1.4 var(--font);letter-spacing:.5px;text-transform:uppercase;display:flex;gap:10px;align-items:center}
.resect h3::before{content:"";width:8px;height:8px;background:var(--ink)}
.resect>p{margin-top:var(--s2);font-size:14px;color:var(--muted)}
.ritem{border-top:1px solid var(--hairline);margin-top:var(--s4);padding-top:var(--s3)}
.ritem:first-of-type{border-top:0}
.ritem .frow{grid-template-columns:120px minmax(0,1fr)}
.howto{margin:var(--s4) 0 0;padding-left:20px;display:grid;gap:var(--s2);font-size:15px;line-height:1.5;color:var(--ink)}
@media (max-width:1024px){.order{grid-template-columns:repeat(2,minmax(0,1fr))}}
@media (max-width:767px){.frow,.ritem .frow{grid-template-columns:1fr;gap:6px}.flabel{padding-top:0}.fnote{grid-column:1;margin-top:0}
 .order{grid-template-columns:1fr}.resect{padding:var(--s5) var(--s4)}details.lrow>summary{flex-wrap:wrap}}
"""

_ids = [0]


def fid():
    _ids[0] += 1
    return f"f{_ids[0]}"


def frow(label, value, note="", long=False):
    i = fid()
    placeholder = value.startswith("(")
    tag = "pre" if long else "span"
    copy = "" if placeholder else f'<button class="copy" type="button" data-copy="{i}">Copy</button>'
    note_html = f'<div class="fnote">{bp.inline(note)}</div>' if note else ""
    cls = "fval placeholder" if placeholder else "fval"
    return (f'<div class="frow"><div class="flabel">{html.escape(label)}</div>'
            f'<div class="{cls}"><{tag} id="{i}">{html.escape(value)}</{tag}>{copy}</div>{note_html}</div>')


def notes_lookup():
    nt = bp.parse_notes()
    points, teach = {}, {}
    for m in nt["modules"]:
        teach[m["n"]] = m["extra"].get("Teach", "")
        for num, txt in m["points"]:
            points[num] = txt
    return points, teach


def strip_md(s):
    return s.replace("**", "").replace("`", "")


def lesson_resources(mod):
    out = [f"{C.SKILL_NAMES[s]}: {C.KIT_URL}/pages/skill-{s}.html" for s in mod["skills"]]
    out += [f"{C.WORKFLOW_NAMES[w]}: {C.KIT_URL}/pages/workflow-{w}.html" for w in mod["workflows"]]
    return out


def module_banner(mod):
    parts = [f'<a href="{C.KIT_URL}/pages/skill-{s}.html" target="_blank">{C.SKILL_NAMES[s].split(" (")[0]}</a>'
             for s in mod["skills"]]
    parts += [f'<a href="{C.KIT_URL}/pages/workflow-{w}.html" target="_blank">Workflow {w}</a>' for w in mod["workflows"]]
    if mod["n"] == 1:
        return (f'<strong>Start here:</strong> open your <a href="{C.KIT_URL}/pages/index.html" target="_blank">Student Kit</a> '
                f'and attach the 4 skills as you go.')
    return "<strong>Use in this module:</strong> " + " · ".join(parts)


def build_data():
    points, teach = notes_lookup()
    mods = []
    for m in C.MODULES:
        lessons = []
        for num, slug, title, task, use in m["lessons"]:
            learn = strip_md(points.get(num, ""))
            doc = f"What you'll learn\n{learn}\n\nUse\n{use}\n\nDo this now\n{task}"
            lessons.append(dict(number=num, slug=slug, title=title,
                                video=f"M{m['n']:02d}_L{num}_{slug}.mp4", document=doc,
                                resources=lesson_resources(m)))
        mods.append(dict(number=m["n"], slug=m["slug"], title=m["title"], type="Video lessons",
                         description=strip_md(teach.get(m["n"], "")), banner=module_banner(m), lessons=lessons))
    details = {label: value for label, value, _, _ in C.DETAILS}
    resources = []
    for r in C.RESOURCES:
        if r["kind"] == "field":
            resources.append(dict(section=r["section"], value=r["value"]))
        else:
            resources.append(dict(section=r["section"],
                                  items=[dict(name=a, link=b, description=c) for a, b, c in r["items"]]))
    return dict(details=details, modules=mods, resources=resources, kit_url=C.KIT_URL)


def build_page(data):
    total_lessons = sum(len(m["lessons"]) for m in data["modules"])
    total_res = sum(len(r.get("items", [])) for r in data["resources"])
    kit_set = not C.KIT_URL.startswith("https://YOUR")

    details = "".join(frow(l, v, n, lg) for l, v, n, lg in C.DETAILS)

    mod_cards = []
    for m in data["modules"]:
        fields = (frow("SLUG", m["slug"]) + frow("NUMBER", str(m["number"])) + frow("TITLE", m["title"]) +
                  frow("MODULE TYPE", m["type"], "Pick from the dropdown.") +
                  frow("COVER IMAGE", "(optional: a frame from this lecture, 16:9)") +
                  frow("DESCRIPTION", m["description"], "", True) +
                  frow("BANNER NOTE ABOVE THE LESSON LIST (HTML OK)", m["banner"], "", True))
        lrows = []
        for l in m["lessons"]:
            inner = (frow("LESSON NUMBER", l["number"]) + frow("TITLE", l["title"]) + frow("SLUG", l["slug"]) +
                     frow("VIDEO", l["video"], "The edited lesson file Claude sends you. Upload it in the lesson's video field.") +
                     frow("DOCUMENT", l["document"], "Paste into the lesson's document field.", True) +
                     frow("RESOURCES", "\n".join(l["resources"]), "Add each line as one resource (name + link).", True))
            lrows.append(f'<details class="lrow"><summary><b>{l["number"]} · {html.escape(l["title"])}</b>'
                         f'<small>{l["slug"]}</small></summary><div class="frows">{inner}</div></details>')
        mod_cards.append(f"""
<article class="step" id="mod-{m['number']}" aria-labelledby="mod-{m['number']}-t">
  <div class="step-head"><span class="step-num" aria-hidden="true">{m['number']}</span>
    <div><div class="step-kicker">Module {m['number']} · {len(m['lessons'])} lessons · + ADD on the Modules tab</div>
    <h3 class="title-lg" id="mod-{m['number']}-t">{html.escape(m['title'])}</h3></div></div>
  <div class="frows">{fields}</div>
  <div class="lessons-head"><b>Lessons</b><span>Press SAVE CHANGES on the module first, then + LESSON for each one below.</span></div>
  {''.join(lrows)}
  <div class="step-foot"><button class="btn btn-secondary btn-small step-toggle" type="button" data-step-toggle aria-pressed="false" data-off="Mark module as added" data-on="Added ✓">Mark module as added</button></div>
</article>""")

    res_html = []
    for r in C.RESOURCES:
        if r["kind"] == "field":
            res_html.append(f'<div class="resect"><h3>Examples by format</h3>'
                            f'<div class="frows">{frow(r["section"], r["value"], r["note"], True)}</div></div>')
            continue
        items = "".join(
            f'<div class="ritem"><div class="frows">{frow("NAME", a)}{frow("LINK", b)}{frow("TEXT", c, "", True)}</div></div>'
            for a, b, c in r["items"])
        res_html.append(f'<div class="resect"><h3>{html.escape(r["section"].title())}</h3><p>{bp.inline(r["note"])}</p>{items}</div>')

    rail = "".join(
        f'<li><a href="#mod-{m["number"]}"><span class="dot">{m["number"]}</span><span>{html.escape(m["title"])}</span></a></li>'
        for m in data["modules"])

    kit_warn = "" if kit_set else (
        '<div class="checknote" style="margin-top:24px"><b>Links</b><span>Links below start with '
        '<code>https://YOUR-KIT-LINK</code>. Put the Student Kit online first (step 2 below), send Claude the link, '
        'and this page gets rebuilt with the real links.</span></div>')

    prep = [
        "<b>Back up.</b> Open the <code>RAW JSON</code> tab, select all, copy, and save it in a text file. If anything goes wrong, paste it back.",
        "<b>Put the Student Kit online.</b> Drag the <code>student-kit</code> folder onto <a href=\"https://app.netlify.com/drop\" target=\"_blank\">Netlify Drop</a> (free; sign in to keep it), or upload it to your own site, e.g. <code>/kit</code>. You get one link, and that's your Kit link.",
        "<b>Have the lesson videos ready.</b> Claude sends them named like <code>M03_L3.2_lifestyle-scenes.mp4</code>, so each one matches its lesson below.",
        "<b>Save often.</b> Press ⌘S / SAVE CHANGES after every module. Save the module <em>before</em> opening its lessons.",
    ]
    prep_html = "".join(f'<label class="check-item"><input type="checkbox" id="prep-{i}"><span>{p}</span></label>'
                        for i, p in enumerate(prep, 1))

    body = f"""
<section class="hero"><div class="wrap">
  <div class="eyebrow">Admin panel · Courses → AI &amp; Advertising</div>
  <h1 class="display-xl">Set up the course in your LMS</h1>
  <p class="lede">Everything to type into each tab of the admin, in order. Click <strong>Copy</strong>, paste it into the matching field, save.</p>
  <div class="btn-row"><a class="btn btn-primary" href="#details">Start with Details</a><a class="btn btn-secondary" href="#rawjson">The faster way: Raw JSON</a></div>
  <dl class="meta">
    <div><dt>Tabs to fill</dt><dd>Details · Modules · Course resources</dd></div>
    <div><dt>Modules</dt><dd>{len(data['modules'])} (replace the old 4)</dd></div>
    <div><dt>Lessons</dt><dd>{total_lessons}</dd></div>
    <div><dt>Resources</dt><dd>{total_res} items</dd></div>
  </dl>
  {kit_warn}
</div></section>

<section class="band-tight"><div class="wrap"><div class="sig" style="--c:#aa2d00;--o:#ffffff">
  <div class="eyebrow" style="color:inherit;opacity:.8">The order that works</div>
  <h2 class="display-md">5 steps, top to bottom</h2>
  <ol class="order">
    <li><b>Back up</b>Copy the Raw JSON into a text file.</li>
    <li><b>Kit online</b>Upload the student-kit folder and get its link.</li>
    <li><b>Details tab</b>Title, descriptions, banner.</li>
    <li><b>Modules tab</b>Delete the old 4, add the 11 below, with their lessons.</li>
    <li><b>Course resources</b>Platforms, library and the 4 skills.</li>
  </ol>
</div></div></section>

<section class="band" aria-labelledby="prep-t"><div class="wrap">
  <div class="band-head"><div><div class="eyebrow">Before you start</div><h2 class="display-md" id="prep-t">Get ready</h2></div></div>
  <div class="checklist">{prep_html}</div>
  <div class="check-status" data-check-text aria-live="polite"></div>
</div></section>

<section class="band band-cream" id="details" aria-labelledby="det-t"><div class="wrap">
  <div class="band-head"><div><div class="eyebrow">Tab 1</div><h2 class="display-md" id="det-t">DETAILS</h2>
  <p>Same order as the fields in your admin. Grey values in italics are things only you know.</p></div></div>
  <div class="resect" style="margin-top:0"><div class="frows" style="margin-top:0">{details}</div></div>
</div></section>

<section class="band" id="modules" aria-labelledby="mods-t" style="background:var(--soft)"><div class="wrap">
  <div class="band-head"><div><div class="eyebrow">Tab 2</div><h2 class="display-md" id="mods-t">MODULES</h2>
  <p>First delete the 4 old modules (Onboarding, AI model catalog, Method fundamentals, Formats); they belong to another course. Your backup keeps them safe. Then add these 11 in order.</p></div></div>
  <div class="mobile-progress" style="background:var(--soft)"><div class="progress"><div class="progress-track"><div class="progress-bar" data-progress-bar></div></div><div class="progress-text" data-progress-text>0 of {len(data['modules'])} modules added</div></div></div>
  <div class="steps-layout">
    <aside class="rail" aria-label="Modules">
      <div class="progress"><div class="progress-track"><div class="progress-bar" data-progress-bar></div></div><div class="progress-text" data-progress-text>0 of {len(data['modules'])} modules added</div></div>
      <ol>{rail}</ol>
      <button class="reset" type="button" data-reset>Reset my progress</button>
    </aside>
    <div class="step-list">{''.join(mod_cards)}</div>
  </div>
</div></section>

<section class="band" id="resources" aria-labelledby="res-t"><div class="wrap">
  <div class="band-head"><div><div class="eyebrow">Tab 3</div><h2 class="display-md" id="res-t">COURSE RESOURCES</h2>
  <p>Your admin already has these sections. Swap the old items for these. If an item has an upload button instead of a link, upload the file named in its LINK.</p></div></div>
  {''.join(res_html)}
</div></section>

<section class="band-tight" id="rawjson"><div class="wrap">
  <div class="sig" style="--c:#181d26;--o:#ffffff">
    <div class="eyebrow" style="color:inherit;opacity:.75">Skip most of the clicking</div>
    <h2 class="display-md">The faster way: Raw JSON</h2>
    <ol class="howto" style="color:#fff">
      <li>Open the <code>RAW JSON</code> tab and copy everything (that's also your backup).</li>
      <li>Send it to Claude: “Here's my course Raw JSON. Fill it with the AI &amp; Advertising content.”</li>
      <li>Claude returns the full course in your exact format: details, 11 modules, 41 lessons, resources.</li>
      <li>Paste it into the <code>RAW JSON</code> tab, save, then check it with VIEW THE ACADEMY.</li>
    </ol>
    <p class="muted" style="margin-top:16px">Lesson videos still need uploading one by one, unless your JSON takes video links.</p>
  </div>
</div></section>

<section class="band-tight"><div class="wrap"><div class="cta">
  <div><h2 class="display-md">Last: check it as a student</h2><p>Click VIEW THE ACADEMY. Check the module order, play one video, open one resource link, and read the course card.</p></div>
</div></div></section>
"""
    return f"""<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>LMS Setup Guide</title>
<meta name="description" content="What to type into each field of the LMS admin for AI &amp; Advertising.">
{bp.FONTS}
<style>{bp.CSS}{LMS_CSS}</style>
</head>
<body data-page="lms-setup" data-unit="modules added" style="--c:#181d26;--o:#ffffff">
<a class="skip" href="#main">Skip to content</a>
<header class="nav"><div class="wrap">
  <a class="brand" href="#main"><span class="brand-mark" aria-hidden="true"><i></i><i></i><i></i><i></i></span>LMS Setup</a>
  <nav class="nav-links" aria-label="Tabs"><a href="#details">Details</a><a href="#modules">Modules</a><a href="#resources">Course resources</a><a href="#rawjson">Raw JSON</a></nav>
  <a class="btn btn-primary" href="#details">Start</a>
</div></header>
<main id="main">
{body}
</main>
<footer class="foot"><div class="wrap">
  <span>AI &amp; Advertising · LMS Setup Guide · Ideabro Studio</span>
  <nav aria-label="Footer"><a href="LECTURE-NOTES.html">Lecture notes</a><a href="student-kit/pages/index.html">Student pages</a></nav>
</div></footer>
<script>{bp.JS}</script>
</body>
</html>
"""


def main():
    data = build_data()
    (ROOT / "lms").mkdir(exist_ok=True)
    (ROOT / "lms" / "course-content.json").write_text(json.dumps(data, ensure_ascii=False, indent=2), encoding="utf-8")
    (ROOT / "LMS-SETUP.html").write_text(build_page(data), encoding="utf-8")
    missing = [l["number"] for m in data["modules"] for l in m["lessons"] if "What you'll learn\n\n" in l["document"]]
    print(f"modules {len(data['modules'])}, lessons {sum(len(m['lessons']) for m in data['modules'])}, "
          f"missing lecture points: {missing or 'none'}")
    print("-> LMS-SETUP.html, lms/course-content.json")


if __name__ == "__main__":
    main()
