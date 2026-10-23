"""Single source of truth for timing: slides, VO placement, cues, captions.

    python3 timeline.py  ->  build/timeline.json (read by stage.js, render.js, sound.py)

Every on-screen beat is tied to the word the narrator says: a cue names a word
(in the Devanagari the voice read) and gets that word's time from the
ElevenLabs character timings.
"""
import json
import pathlib
import subprocess

from script import SLIDES

ROOT = pathlib.Path(__file__).parent
FPS = 30
TEMPO = 1.05          # VO is played 5% faster than generated (calm, but not slow)
INTRO = 1.5           # title builds before the first word
LEAD = 0.55           # slide lands, then the voice starts
LEAD_CARD = 1.15      # commitment cards get a beat for the reveal
TAIL = 0.65
TAIL_LONG = 1.1       # after a question: let it sit
OUTRO = 5.0           # end card after the last slide
TRANS = 0.7           # transition length (start of each slide)

CARDS = {5, 11, 15, 18}
QUESTIONS = {2, 4, 10, 14, 20}

CUES = {
    2: {"vote": "वोट", "tax": "टैक्स", "complaint": "कंप्लेंट", "consult": "पब्लिक कंसल्टेशन"},
    3: {"more": "कहीं ज़्यादा", "journey": "लगातार", "needs": "ज़रूरतें बताते", "decide": "फ़ैसलों में",
        "track": "प्रगति", "account": "जवाबदेह"},
    4: {"tax": "टैक्स भरना", "licence": "लाइसेंस", "complaint": "कंप्लेंट दर्ज", "but": "लेकिन",
        "how": "फ़ैसले होने", "voice": "अपनी बात"},
    5: {"four": "चार ज़रूरी", "first": "पहला", "listen": "Listen", "mean": "नागरिकों की ज़रूरतों"},
    6: {"citizen": "नागरिक से", "woman": "मान लीजिए", "garden": "पब्लिक गार्डन"},
    7: {"portal": "नीड्स", "proposal": "विचार", "submit": "रख सकती"},
    8: {"support": "समर्थन", "needs": "अपनी ज़रूरतें भी"},
    9: {"officials": "अधिकारी", "collective": "सामूहिक", "local": "लोकल", "budget": "बजट प्लानिंग"},
    10: {"after": "फ़ैसला होने", "before": "प्राथमिकताएँ", "q": "लेकिन नागरिकों", "next": "अगला वादा"},
    11: {"second": "दूसरा", "inform": "Inform", "mean": "ट्रांसपेरेंट"},
    12: {"portal": "ओपन डेटा", "plans": "प्लान्स", "budget": "बजट", "timelines": "टाइमलाइन्स",
         "projects": "चल रहे"},
    13: {"proposal": "अपने प्रपोज़ल", "area": "इलाके", "track": "ट्रैक"},
    14: {"but": "लेकिन", "sat": "संतुष्ट", "what": "तब क्या"},
    15: {"third": "तीसरा", "respond": "Respond", "mean": "प्रभावी"},
    16: {"system": "सेंट्रलाइज़्ड", "register": "कंप्लेंट दर्ज", "ack": "एक्नॉलेजमेंट",
         "track": "समाधान", "dept": "कौनसा विभाग"},
    17: {"timely": "समय पर", "updates": "हर कदम", "resolved": "समस्या हल", "feedback": "फ़ीडबैक",
         "closed": "सिर्फ़ बंद", "solved": "सच में हल"},
    18: {"fourth": "चौथा", "facilitate": "Facilitate", "mean": "डिजिटल ट्रांज़ैक्शन"},
    19: {"window": "सिंगल विंडो", "corp": "म्युनिसिपल कॉर्पोरेशन", "tax": "प्रॉपर्टी टैक्स",
         "licence": "लाइसेंस", "online": "ऑनलाइन", "offices": "अलग-अलग"},
    21: {"system": "प्रॉपर्टी टैक्स", "db": "डेटाबेस", "gis": "जी-आई-एस", "val": "वैल्यूएशन",
         "self": "सेल्फ़", "rev": "रिवीज़न", "integ": "सेवाओं को"},
    20: {"four": "चारों हिस्सों", "journey": "लगातार सफ़र", "listen": "बात सुन", "inform": "जानकारी दे",
         "act": "प्राथमिकताओं", "resolve": "शिकायतों", "cities": "कई भारतीय"},
    22: {"pune": "पुणे", "mumbai": "मुंबई", "bmc": "BMC", "access": "पहुँच", "show": "रास्ता"},
    23: {"smart": "स्मार्ट", "tech": "टेक्नोलॉजी", "resp": "रिस्पॉन्सिव", "trans": "ट्रांसपेरेंट",
         "part": "पार्टिसिपेटरी", "m1": "जो जवाब", "m2": "जो कुछ", "m3": "सबको साथ"},
    24: {"listen": "सुनती", "inform": "जानकारी", "respond": "जवाब", "fac": "काम आसान",
         "partners": "सक्रिय साझेदार"},
    25: {"together": "साथ मिलकर", "today": "आज की", "tomorrow": "कल के", "live": "रहना"},
}


def dur(p):
    return float(subprocess.check_output(
        ["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", str(p)]))


def build():
    vo_dir = ROOT / "build/vo"
    seg_info = json.loads((vo_dir / "segments.json").read_text())
    order = [n for n, _ in SLIDES]
    slides, vo, caps = {}, [], []
    t = 0.0
    for take in seg_info["takes"]:
        tid, nums = take["id"], take["slides"]
        al = json.loads((vo_dir / f"{tid}.json").read_text())
        text = "".join(al["characters"])
        starts = al["character_start_times_seconds"]
        tdur = dur(vo_dir / f"{tid}.mp3") / TEMPO
        first = nums[0]
        lead = INTRO if first == 1 else (LEAD_CARD if first in CARDS else LEAD)
        v0 = t + lead
        vo.append({"id": tid, "t": round(v0, 3), "dur": round(tdur, 3)})
        segs = [s for s in seg_info["segments"] if s["take"] == tid]
        for s in segs:
            caps.append({"slide": s["slide"], "text": s["text"],
                         "t0": round(v0 + s["t0"] / TEMPO, 3), "t1": round(v0 + s["t1"] / TEMPO, 3)})
        # slide starts: first at t, joined slide where its first word begins
        bounds = [t]
        for n in nums[1:]:
            s0 = next(s for s in segs if s["slide"] == n)
            bounds.append(v0 + s0["t0"] / TEMPO - 0.12)
        last = nums[-1]
        end = v0 + tdur + (TAIL_LONG if last in QUESTIONS else TAIL)
        if last == 25:
            end += 1.6
        bounds.append(end)
        # cues: search each slide's keywords inside its own part of the take text
        pos = 0
        for k, n in enumerate(nums):
            seg_text = "".join(d for num, segs_ in SLIDES if num == n for _, d in segs_)
            cues = {}
            for name, kw in CUES.get(n, {}).items():
                i = text.find(kw, pos)
                assert i >= 0, (n, name, kw)
                cues[name] = round(v0 + starts[i] / TEMPO - bounds[k], 3)
            pos += len(seg_text)
            slides[n] = {"n": n, "start": round(bounds[k], 3), "end": round(bounds[k + 1], 3),
                         "vo": round(v0 - bounds[k], 3), "cues": cues}
        t = end
    total = t + OUTRO
    out = {"fps": FPS, "dur": round(total, 3), "trans": TRANS, "tempo": TEMPO,
           "order": order, "slides": [slides[n] for n in order],
           "outro": {"start": round(t, 3), "end": round(total, 3)},
           "vo": vo, "captions": caps}
    (ROOT / "build/timeline.json").write_text(json.dumps(out, ensure_ascii=False, indent=1))
    (ROOT / "build/timeline.js").write_text("window.TL = " + json.dumps(out, ensure_ascii=False) + ";\n")
    return out


if __name__ == "__main__":
    tl = build()
    for s in tl["slides"]:
        print(f"slide {s['n']:>2}  {s['start']:7.2f} -> {s['end']:7.2f}  ({s['end'] - s['start']:5.2f}s)")
    print(f"total {tl['dur']:.2f}s = {int(tl['dur'] // 60)}:{tl['dur'] % 60:05.2f}, "
          f"{round(tl['dur'] * FPS)} frames")
