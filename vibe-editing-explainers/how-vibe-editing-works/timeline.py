"""Places the voiceover and names every cue after the word it lands on.  -> build/timeline.json"""
import sys; sys.path.insert(0, "../lib")
from tl import Timeline

T = Timeline(__file__, gaps={"hook": 0.7, "brief": 1.1, "assets": 1.0, "agent": 1.0, "render": 1.0, "notes": 1.0, "outro": 1.1}, tail=2.8)
w, L, E = T.w, T.L, T.E
T.save({
    # scene starts: each layout lands just before its line
    "s_brief": L("brief") - 0.55, "s_assets": L("assets") - 0.55, "s_agent": L("agent") - 0.55,
    "s_render": L("render") - 0.55, "s_notes": L("notes") - 0.55, "s_outro": L("outro") - 0.5,
    "cover": 2.3,
    "hook_vibe": w("hook", "vibe"),
    "brief_one": w("brief", "one"), "brief_brief": w("brief", "brief"), "brief_write": w("brief", "write"),
    "brief_plain": w("brief", "plain"), "brief_length": w("brief", "length"), "brief_mood": w("brief", "mood"),
    "brief_look": w("brief", "look"),
    "assets_two": w("assets", "two"), "assets_footage": w("assets", "footage"), "assets_music": w("assets", "music"),
    "assets_voiceover": w("assets", "voiceover"), "assets_real": w("assets", "real"), "assets_folder": w("assets", "folder"),
    "agent_three": w("agent", "three"), "agent_reads": w("agent", "reads"), "agent_looks": w("agent", "looks"),
    "agent_writes": w("agent", "writes"), "agent_cut": w("agent", "cut"), "agent_caption": w("agent", "caption"),
    "agent_sound": w("agent", "sound"), "agent_line": w("agent", "line"),
    "render_four": w("render", "four"), "render_draws": w("render", "draws"), "render_frame": w("render", "frame"),
    "render_thirty": w("render", "thirty"), "render_stitches": w("render", "stitches"), "render_video": w("render", "video"),
    "notes_five": w("notes", "five"), "notes_you": w("notes", "you"), "notes_watch": w("notes", "watch"),
    "notes_notes": w("notes", "notes"), "notes_rewrites": w("notes", "rewrites"), "notes_until": w("notes", "until"),
    "notes_right": w("notes", "right"),
    "outro_brief": w("outro", "brief"), "outro_assets": w("outro", "assets"), "outro_agent": w("outro", "agent"),
    "outro_render": w("outro", "render"), "outro_notes": w("outro", "notes"), "outro_machine": w("outro", "machine"),
    "outro_that": w("outro", "that's"),
})
