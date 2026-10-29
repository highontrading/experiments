"""From film to prompts: place the voice, name every cue after its word."""
import sys; sys.path.insert(0, "../lib")
from tl import Timeline

T = Timeline(__file__, gaps={"hook": 1.0, "film": 1.1, "tape": 1.1, "timeline": 1.0, "prompt": 1.0, "why": 1.0, "outro": 1.0}, tail=2.8)
w, L = T.w, T.L
T.save({
    # one board per line; the camera arrives ~0.45 s before each line
    "s_film": L("film") - 0.55, "s_tape": L("tape") - 0.55, "s_timeline": L("timeline") - 0.55,
    "s_prompt": L("prompt") - 0.55, "s_why": L("why") - 0.6, "s_outro": L("outro") - 0.6,
    "cover": L("hook") + 2.6,

    "hook_editing": w("hook", "editing"), "hook_reinvented": w("hook", "reinvented"), "hook_three": w("hook", "three"),
    "hook_times": w("hook", "times"), "hook_now": w("hook", "now"), "hook_again": w("hook", "again"),

    "film_film": w("film", "film"), "film_editors": w("film", "editors"), "film_cut": w("film", "cut"),
    "film_strip": w("film", "strip"), "film_hand": w("film", "hand"), "film_spliced": w("film", "spliced"),
    "film_together": w("film", "together"),

    "tape_tape": w("tape", "tape"), "tape_video": w("tape", "video"), "tape_magnetic": w("tape", "magnetic"),
    "tape_copying": w("tape", "copying"), "tape_shots": w("tape", "shots"), "tape_machine": w("tape", "machine"),
    "tape_another": w("tape", "another"), "tape_order": w("tape", "order"),

    "tl_timeline": w("timeline", "timeline"), "tl_computers": w("timeline", "computers"), "tl_clips": w("timeline", "clips"),
    "tl_blocks": w("timeline", "blocks"), "tl_drag": w("timeline", "drag"), "tl_trim": w("timeline", "trim"),
    "tl_undo": w("timeline", "undo"),

    "pr_prompt": w("prompt", "prompt"), "pr_describe": w("prompt", "describe"), "pr_words": w("prompt", "words"),
    "pr_ai": w("prompt", "ai"), "pr_builds": w("prompt", "builds"),

    "why_every": w("why", "every"), "why_faster": w("why", "faster"), "why_opened": w("why", "opened"),
    "why_people": w("why", "people"),

    "o_film": w("outro", "film"), "o_tape": w("outro", "tape"), "o_timeline": w("outro", "timeline"),
    "o_text": w("outro", "text"), "o_changing": w("outro", "changing"), "o_goal": w("outro", "goal"),
    "o_tell": w("outro", "tell"), "o_story": w("outro", "story"),
})
