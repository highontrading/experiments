# SFX stack: Openverse → earshot → real-sfx

Real sound effects for code-made videos, in three layers. Claude can't hear, so each layer does the part a
language model is bad at:

| layer | tool | job | where |
|---|---|---|---|
| 1. source | [Openverse](https://github.com/WordPress/openverse) API | search ~5M openly licensed sounds (mostly Freesound) and download candidates | `openverse_fetch.py` |
| 2. ears | [earshot](https://github.com/Leonxlnx/earshot) | listen to every candidate (CLAP match + realness), keep the ones that fit, generate a take when nothing does | `earshot_pick.py`, `.claude/skills/earshot` |
| 3. placement | real-sfx skill | find every moment in the edit, put the right sound on the exact frame, keep the music, remove synthesized SFX, critique | `.claude/skills/real-sfx` |

To run it on any video, give Claude the prompt in [`CHAIN_PROMPT.md`](CHAIN_PROMPT.md).

## Setup (once per machine)

```bash
bash sfx-stack/setup.sh
```

This needs Python 3.10+ and ffmpeg. It creates `~/.venvs/sfx` with CPU torch and `earshot[listen,mcp,images]`,
downloads earshot's two listening models (about 1.1 GB), and initialises real-sfx with its 78 bundled CC0 UI
sounds. The skills are committed in `.claude/skills/`, so Claude Code picks them up automatically in this repo.

**Openverse rate limit.** Anonymous use allows 1,000 requests a day per IP address. A shared cloud IP can use
that up, and then the API returns HTTP 429. For a much higher limit, register a free app:

```bash
curl -X POST https://api.openverse.org/v1/auth_tokens/register/ \
  -H "Content-Type: application/json" \
  -d '{"name": "my-sfx-stack", "description": "SFX sourcing for my videos", "email": "you@example.com"}'
```

Then export `OPENVERSE_CLIENT_ID` and `OPENVERSE_CLIENT_SECRET`. The fetcher exchanges them for a token
automatically. `--wait SECONDS` makes it sleep through a 429 instead of stopping.

## The pipeline by hand

```bash
PY=~/.venvs/sfx/bin/python
W=sfx-stack/work            # gitignored

# 1. moments: the project's own event list (here the Vibe Editing film) -> real-sfx kinds + a music-only stem
$PY vibe-editing-film/export_audio.py

# 2. source: one entry per event kind, with search words and a one-line "listen" description
python3 sfx-stack/openverse_fetch.py --plan sfx-stack/plans/vibe_editing_film.json --out $W/candidates

# 3. ears: rank, keep the real and fitting ones, generate what is missing -> a sorted library
$PY sfx-stack/earshot_pick.py --plan sfx-stack/plans/vibe_editing_film.json \
    --candidates $W/candidates --library sfx-stack/library

# 4. placement (from the real-sfx folder)
cd .claude/skills/real-sfx
python3 scripts/setup.py add-library openverse ../../../sfx-stack/library --tier main --index
python3 scripts/from_cues.py ../../../vibe-editing-film/build/cues.json \
    --video ../../../vibe-editing-film/out/vibe_editing.mp4 --out ../../../$W/cues.json --ui library \
    --kind boing=role:cartoon --kind powerdown=role:power --kind yay=role:voice
python3 scripts/mix.py ../../../$W/cues.json --out ../../../$W/result/vibe_editing_sfx.mp4
python3 scripts/critique.py ../../../$W/result/vibe_editing_sfx_resolved_cues.json \
    ../../../$W/result/vibe_editing_sfx_sfx_track.wav
```

## Files

| file | what it is |
|---|---|
| `openverse_fetch.py` | Layer 1. Takes a plan (or `--type/--query`) and writes `OUT/<type>/ov_*.mp3` plus `manifest.json`, which records the licence, creator and landing page of every file. Defaults to CC0 and PDM; add `--license by` and credits become required. |
| `earshot_pick.py` | Layer 2. Runs `api.rank` and `api.realness` for each type, keeps the best files as `library/<type>/`, and writes `catalog.json` (the real-sfx sorted-pack format), `picks.json` (every score) and `CREDITS.md`. |
| `plans/*.json` | One sourcing plan per film. Each entry has `type` (a real-sfx pack type: whoosh, impact, riser, pop, click, typing, chime, foley, paper, cartoon, power, voice …), `queries`, `n`, `max_dur` and `listen`. |
| `setup.sh` | Installs earshot and initialises real-sfx. |
| `CHAIN_PROMPT.md` | The one prompt that runs all three layers. |
| `library/`, `work/` | Downloaded and generated audio. These are gitignored; rebuild them from the plan. |
