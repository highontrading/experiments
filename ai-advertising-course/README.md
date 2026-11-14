# AI & Advertising: Course Files

| File | For | What it is |
|---|---|---|
| `LECTURE-NOTES.html` | **You** | The lecture notes as an interactive page: tick off each lecture, and use **Recording view** (big text, arrow keys) while you record |
| `LECTURE-NOTES.md` | **You** | The same notes as plain text (edit this one, then rebuild) |
| `LMS-SETUP.html` | **You** | What to type into each field of your LMS admin (Details, 11 modules, 41 lessons, resources), with copy buttons |
| `AGENT-PROMPT.md` | **Your agent** | One prompt for Claude desktop (Claude in Chrome) to fill the whole LMS admin for you |
| `lms/course-content.json` | **You / Claude** | The same content as data, for turning into your admin's Raw JSON |
| `student-kit/` | **Students** | 4 skills, 4 workflows, 3 templates, and `pages/`: interactive HTML (open `pages/index.html`) |
| `dist/` | **Upload** | `student-kit.zip`, plus one zip per skill for Claude |
| `archive/` | Reference | The old detailed version (17 skills, long lecture plans). Not for students. |

## Modules → skills → workflows

| Module | Skill | Workflow |
|---|---|---|
| 1 AI in advertising | all 4 (intro) | — |
| 2 Briefs & big idea | `ad-strategist` | 01 Plan the ad |
| 3 Product photography | `ad-image-director` | 02 Photo → campaign images |
| 4 Models & sets | `ad-image-director` | 02 |
| 5 Video ads & films | `ad-video-director` | 03 Images → video ad |
| 6 Sound, voice, music | `ad-video-director` | 03 |
| 7 UGC & ambassadors | `ad-video-director` | 03 |
| 8 Meta ads & testing | `ad-image-director` + `ad-strategist` | 04 Edit & launch |
| 9 Editing & end cards | `vibe-editor` | 04 |
| 10 Hybrid ads | `ad-video-director` | 03 |
| 11 Capstone | all 4 | 01 → 04 |

## After recording
Name the files `L01_raw.mp4` … `L11_raw.mp4`, put them in a Google Drive folder and send the
folder name. Claude cuts them into the 41 lessons using your "LESSON x.y" markers.

## Rebuild after edits
Edit the markdown in `student-kit/`, then run:

```bash
python3 tools/build_pages.py   # rebuilds the HTML pages + LECTURE-NOTES.html
python3 tools/build_lms.py     # rebuilds LMS-SETUP.html (set KIT_URL in tools/lms_content.py first)
python3 tools/build_agent_prompt.py   # rebuilds AGENT-PROMPT.md from the same data
./make_zips.sh                 # rebuilds the zips
```
