#!/usr/bin/env python3
"""Write lms/ai-ad-raw.json: the whole course in the LMS admin's Raw JSON schema
(same shape as the Vibe Editing course export), ready to paste into the RAW JSON tab.

    python3 tools/build_lms.py && python3 tools/build_raw_json.py

Videos and module covers are left empty on purpose (added later in the admin).
Kit links (skills, workflows, templates) are "" until the files are online:
set the hrefs in KIT_LINKS below and rebuild.
"""
import json
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
import lms_content as C  # noqa: E402

ROOT = Path(__file__).resolve().parent.parent
data = json.loads((ROOT / "lms" / "course-content.json").read_text(encoding="utf-8"))

COURSE_ID = "ai-ad"  # the slug the admin already uses; keep it so existing links work
COURSE_COVER = ("https://xfyshcjptayuemcwxnpr.supabase.co/storage/v1/object/public/uploads/"
                "1789887361818-f1e89305-a05b-4d7a-9b0b-7577d60710fe.png")  # current cover (from the admin screenshot)
RESOURCES_PAGE = f"https://app.ideabro.space/course?c={COURSE_ID}&v=resources"

# Fill these when the files are online (Google Drive / Vercel / your site), then rebuild.
KIT_LINKS = {
    "kit-home": "", "wf-01": "", "wf-02": "", "wf-03": "", "wf-04": "",
    "skill-ad-strategist": "", "skill-ad-image-director": "", "skill-ad-video-director": "", "skill-vibe-editor": "",
    "kit-zip": "", "templates": "", "image-recipes": "", "video-recipes": "",
}

SKILL_SHORT = {
    "ad-strategist": "Ad Strategist", "ad-image-director": "Ad Image Director",
    "ad-video-director": "Ad Video Director", "vibe-editor": "Vibe Editor",
}


def banner(mod_src):
    if mod_src["n"] == 1:
        return ("<strong>Start here:</strong> open <strong>Course Resources</strong> and download the Student Kit. "
                "Every lesson tells you which skill and workflow to use.")
    parts = [f"{SKILL_SHORT[s]} skill" for s in mod_src["skills"]]
    parts += [f"Workflow {w}" for w in mod_src["workflows"]]
    return "<strong>Use in this module:</strong> " + " · ".join(parts) + ". Find them in Course Resources."


def lesson_item(l, use, task):
    learn = l["document"].split("\n\n")[0].replace("What you'll learn\n", "", 1)
    return {
        "id": l["slug"],
        "doc": [{"p": f"Use\n{use}\n\nDo this now\n{task}"}],
        "idx": l["number"],
        "desc": learn,
        "kind": "video",
        "tags": [],
        "type": "lesson",
        "title": l["title"],
        "video": {"src": "", "type": "mp4"},
        "duration": "",
        "comingSoon": True,
        "resources": [{
            "ext": True,
            "href": RESOURCES_PAGE,
            "text": f"Skill and workflow for this lesson: {use}",
            "title": "Course Resources",
        }],
    }


modules = []
for src, m in zip(C.MODULES, data["modules"]):
    items = [lesson_item(l, use, task)
             for l, (_num, _slug, _title, task, use) in zip(m["lessons"], src["lessons"])]
    modules.append({
        "n": m["number"],
        "id": m["slug"],
        "type": "lessons",
        "cover": "",
        "items": items,
        "title": m["title"],
        "banner": banner(src),
        "description": m["description"],
    })

details = dict((label, value) for label, value, _n, _l in C.DETAILS)


def res(title, href, text="", tag=""):
    return {"tag": tag, "href": href, "text": text, "title": title}


platforms = next(r for r in C.RESOURCES if r["section"] == "METHOD PLATFORMS")["items"]
examples = next(r for r in C.RESOURCES if r["kind"] == "field")["value"]

resources = {
    "tools": [
        res("Student Kit: start here (HTML)", KIT_LINKS["kit-home"],
            "All 4 workflows and 4 skills as easy pages, with copy buttons.", "Download and Use"),
        res("Workflow 01: Plan the Ad (HTML)", KIT_LINKS["wf-01"], "Brief, big idea, hooks, script, storyboard.", "Download and Use"),
        res("Workflow 02: Photo → Campaign Images (HTML)", KIT_LINKS["wf-02"], "Packshots, lifestyle, models, statics.", "Download and Use"),
        res("Workflow 03: Images → Video Ad (HTML)", KIT_LINKS["wf-03"], "Flow clips, voice, music, UGC, hybrid.", "Download and Use"),
        res("Workflow 04: Edit & Launch (HTML)", KIT_LINKS["wf-04"], "Vibe edit, captions, end card, Meta launch.", "Download and Use"),
    ],
    "agents": [
        res("Ad Strategist (The Planner)", KIT_LINKS["skill-ad-strategist"],
            "Start here. Brief, big idea, hooks, script, storyboard, Brand Bible, launch plan, results.", "Skill"),
        res("Ad Image Director (The Photographer)", KIT_LINKS["skill-ad-image-director"],
            "Packshots, lifestyle, models, sets, accuracy check, statics in every ratio.", "Skill"),
        res("Ad Video Director (The Film Director)", KIT_LINKS["skill-ad-video-director"],
            "Google Flow video prompts, films, CGI, UGC, voice, music, hybrid.", "Skill"),
        res("Vibe Editor (The Editor)", KIT_LINKS["skill-vibe-editor"],
            "Edit by describing it: cuts, captions, end card, every ratio.", "Skill"),
    ],
    "library": [
        res("Student Kit (all files, zip)", KIT_LINKS["kit-zip"], "Every skill, workflow and template in one download.", "Download"),
        res("Templates: Brand Bible, Creative Brief, Capstone Brief", KIT_LINKS["templates"], "", ""),
        res("Image prompt recipes", KIT_LINKS["image-recipes"], "Ready-made image prompts by ad format.", ""),
        res("Video & audio prompt recipes", KIT_LINKS["video-recipes"], "Google Flow, ElevenLabs and Suno prompts.", ""),
    ],
    "examples": [s.strip() for s in examples.split(",")],
    "platforms": [res(name, href, text) for name, href, text in platforms],
}
count = sum(len(v) for k, v in resources.items() if k != "examples")

course = {
    "id": COURSE_ID,
    "cover": COURSE_COVER,
    "short": details["ONE-LINE DESCRIPTION (CARD)"],
    "title": "AI & ADVERTISING",
    "joined": 100,
    "status": {"text": "All new", "style": "lime"},
    "modules": modules,
    "resources": resources,
    "description": details["LONG DESCRIPTION"],
    "joinedNames": ["Aarav", "Meera"],
    "resourcesCount": count,
}

out = ROOT / "lms" / "ai-ad-raw.json"
out.write_text(json.dumps(course, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
missing = [r["title"] for k in ("tools", "agents", "library") for r in resources[k] if not r["href"]]
print(f"{out.relative_to(ROOT)}: {len(modules)} modules, {sum(len(m['items']) for m in modules)} lessons, "
      f"{count} resources ({len(missing)} without a link yet)")
