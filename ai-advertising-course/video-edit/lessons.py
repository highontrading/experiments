# Edit decision list: which parts of the raw recordings become which lesson.
# Times are seconds in the raw file. "blocks" are played in order; "cuts" are removed inside them.

PROTECT = {  # never cut inside these (playbacks: trailer, films, music, voice, final ad)
    "vid1": [(95.0, 151.9), (1131.0, 1231.8)],
    "vid2": [(3420.0, 3433.0), (3460.0, 3482.0), (3700.0, 3722.0), (3863.9, 3884.7), (4865.0, 4995.0)],
}

LESSONS = [
    dict(id="1.1", title="Where AI fits in every type of ad", slug="where-ai-fits",
         blocks=[("vid1", 4.3, 420.6), ("vid1", 1096.9, 1264.5)],
         cuts=[("vid1", 403.4, 409.95, "second mention of the cancer-care film (shown at the end instead)")]),
    dict(id="1.2", title="Your AI ad stack and what it costs", slug="ai-ad-stack",
         blocks=[("vid1", 514.6, 1028.4)],
         cuts=[("vid1", 606.4, 611.35, "unclear model name 'Vorn 3.3-- 3.0'"),
               ("vid1", 869.8, 888.55, "buying resold Google Flow accounts ($12 for 18 months)"),
               ("vid1", 945.3, 962.6, "'now let's move to the next part' + 15s pause, mid-topic")]),
    dict(id="1.3", title="Setting up: course resources and your Claude workspace", slug="tool-setup",
         blocks=[("vid2", 58.8, 97.4), ("vid1", 421.2, 513.7), ("vid2", 248.1, 529.8)],
         cuts=[]),
    dict(id="2.1", title="The brief: give Claude your product and goal", slug="reading-a-brief",
         blocks=[("vid2", 151.8, 228.7), ("vid2", 530.3, 1139.0)],
         cuts=[("vid2", 570.75, 584.6, "fumbling while picking a product"),
               ("vid2", 595.8, 606.2, "'Suppose...' + 10s pause"),
               ("vid2", 647.7, 652.2, "repeated 'So let me just type.'"),
               ("vid2", 896.95, 905.25, "'use multiple accounts' to get the $1 plan"),
               ("vid2", 1052.35, 1106.75, "tangent on Claude vs Grok strictness")]),
    dict(id="2.2", title="Brand bible, creative brief and the big idea", slug="audience-angle-positioning",
         blocks=[("vid2", 1138.8, 1615.4)], cuts=[]),
    dict(id="2.3", title="Hooks, script and storyboard", slug="scroll-stopping-hooks",
         blocks=[("vid2", 1616.5, 1723.4)], cuts=[]),
    dict(id="3.1", title="Image prompts for every frame + a clean product shot", slug="studio-packshots",
         blocks=[("vid2", 1723.8, 1983.7)],
         cuts=[("vid2", 1779.7, 1786.75, "phone ringing"),
               ("vid2", 1847.6, 1861.4, "file not opening")]),
    dict(id="4.1", title="Consistent characters with character sheets", slug="consistent-ai-models",
         blocks=[("vid2", 1985.15, 2154.6)], cuts=[]),
    dict(id="4.2", title="Designing the set (the rooftop)", slug="sets-and-locations",
         blocks=[("vid2", 2155.2, 2255.5)], cuts=[]),
    dict(id="4.3", title="Story frames: characters + product + set", slug="story-frames",
         blocks=[("vid2", 2256.5, 3003.9)],
         cuts=[("vid2", 2314.85, 2319.55, "phone ringing"),
               ("vid2", 2541.1, 2563.0, "'I think you're liking this course...'"),
               ("vid2", 2724.0, 2735.4, "repeated 'use this agent a lot'"),
               ("vid2", 2975.4, 2977.9, "'just forget this line'"),
               ("vid2", 2980.2, 2984.7, "'She's seeing the sun... Sorry'")]),
    dict(id="5.1", title="Image to video in Google Flow (Omni Flash 1.2)", slug="image-to-video-camera-moves",
         blocks=[("vid2", 3004.6, 3308.4)],
         cuts=[("vid2", 3188.5, 3198.85, "promise to place a clip at the module start")]),
    dict(id="6.1", title="Voiceover with ElevenLabs", slug="voiceovers-dubbing",
         blocks=[("vid2", 3309.4, 3509.8)],
         cuts=[("vid2", 3414.1, 3420.4, "garbled 'Like we want first lists'")]),
    dict(id="6.2", title="Music and sound effects with ElevenLabs", slug="music-and-sound-effects",
         blocks=[("vid2", 3510.6, 3889.1)],
         cuts=[("vid2", 3533.85, 3537.35, "'Suno I think it's not good' (contradicted next line)"),
               ("vid2", 3749.6, 3774.5, "'So let me just tell the...' + 21s pause")]),
    dict(id="9.1", title="Vibe editing: hand Claude your files and get an edit plan", slug="vibe-editing-ads",
         blocks=[("vid2", 3892.55, 4414.9)],
         cuts=[("vid2", 4291.9, 4299.8, "'I hope you are liking this course'"),
               ("vid2", 4378.0, 4382.0, "repeated 'See the beauty'"),
               ("vid2", 4405.7, 4411.4, "repeated 'See the beauty'")]),
    dict(id="9.2", title="Visual storyboard, approve and render", slug="captions-type-colour",
         blocks=[("vid2", 4417.0, 4854.7)],
         cuts=[("vid2", 4620.5, 4636.7, "talking about how the recording is being cut"),
               ("vid2", 4652.6, 4660.5, "'it is gone again... click on--'"),
               ("vid2", 4805.5, 4835.2, "buying a resold Flow account + contact details")]),
    dict(id="9.3", title="The final ad", slug="end-cards",
         blocks=[("vid2", 4855.9, 5049.2)], cuts=[]),
]

GLOSSARY = [
    (r"\bOmni[- ]?[Ff]lash\b|\bOmniFlash\b", "Omni Flash"),
    (r"\bNanoBanana\b", "Nano Banana"),
    (r"\bCedans\b", "Seedance"),
    (r"\bHaxfield\b", "Higgsfield"),
    (r"ideapro\.space", "ideabro.space"),
    (r"\bbrand babble\b", "brand bible"),
    (r"\bElevenLab Music\b", "ElevenLabs Music"),
    (r"\b11[Vv]4\b", "Eleven v4"),
    (r"resourcessss", "resources"),
    (r"\bremame, rename\b", "rename"),
    (r"\bin slime color\b", "in lime color"),
    (r"\bOmni Opus\b", "Opus"),
    (r"\bfour is to five\b", "4:5"),
    (r"\broofsi-?\s+", ""),
    (r"\bone is to one\b", "1:1"),
]

# Media that already has its own on-screen text: no captions from us here.
NO_CAPTION = {"vid1": [(95.0, 151.9), (1131.0, 1231.8)]}
# The LUNA ad's own voiceover (the ad shows its own captions): drop these words when the ad plays.
VO_SEQS = [
    "tonight the moon went lime so i skipped the syrup something crisp something light turns out i wasn't the only one same crew same night just lighter luna keep it light lighter",
    "so i skipped the sy rup",
]
VO_RANGE = {"vid2": (4860.0, 5049.5)}
# While the vertical ad fills the middle of the screen, put commentary captions on the left.
SIDE_CAPTION = {"vid2": [(4865.0, 4995.0)]}
