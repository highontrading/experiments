import sys; sys.path.insert(0, "../lib")
from tl import Timeline

T = Timeline(__file__, gaps={"hook": 0.0, "stock": 0.3, "pace": 0.3, "caps": 0.3, "pov": 0.3, "fix": 0.35, "outro": 0.3}, tail=2.4)
w, L, E = T.w, T.L, T.E
T.save({
    # scene starts (a beat before each line)
    "s_stock": L("stock") - 0.25, "s_pace": L("pace") - 0.25, "s_caps": L("caps") - 0.25,
    "s_pov": L("pov") - 0.25, "s_fix": L("fix") - 0.25, "s_outro": L("outro") - 0.25,
    "cover": w("hook", "fake") + 0.4,
    "h_most": w("hook", "most"), "h_fake": w("hook", "fake"), "h_spot": w("hook", "spot"),
    "h_second": w("hook", "second"), "h_why": w("hook", "why"),
    "st_one": w("stock", "one"), "st_generic": w("stock", "generic"), "st_footage": w("stock", "footage"),
    "st_same": w("stock", "same"), "st_everyone": w("stock", "everyone"), "st_uses": w("stock", "uses"),
    "pa_two": w("pace", "two"), "pa_robotic": w("pace", "robotic"), "pa_every": w("pace", "every"),
    "pa_same": w("pace", "same"), "pa_beat": w("pace", "beat"), "pa_metronome": w("pace", "metronome"),
    "ca_three": w("caps", "three"), "ca_captions": w("caps", "captions"), "ca_shout": w("caps", "shout"),
    "ca_bouncing": w("caps", "bouncing"), "ca_every2": w("caps", "every", 2), "ca_yellow": w("caps", "yellow"),
    "po_four": w("pov", "four"), "po_point": w("pov", "point"), "po_view": w("pov", "view"),
    "po_everything": w("pov", "everything"), "po_nothing": w("pov", "nothing"),
    "fx_fix": w("fix", "fix"), "fx_ai": w("fix", "ai"), "fx_more2": w("fix", "more", 2), "fx_you": w("fix", "you"),
    "fx_footage": w("fix", "footage"), "fx_timing": w("fix", "timing"), "fx_opinion": w("fix", "opinion"),
    "ou_clicking": w("outro", "clicking"), "ou_you": w("outro", "you"), "ou_taste": w("outro", "taste"),
    "ou_follow": w("outro", "follow"), "ou_editing": w("outro", "editing"),
})
