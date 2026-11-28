"""Phrase chunks per language with a semantic role, so every style can treat the same beat its own way."""

# (role, [word indices], [emphasis indices], display override or None)
CHUNKS = {
    "en": [
        ("hook", [0, 1], [1], None),
        ("hook2", [2, 3, 4], [2], None),
        ("reels", [5, 6], [6], None),
        ("content", [7, 8, 9, 10], [10], None),
        ("editing", [11, 12, 13], [13], None),
        ("views", [14, 15, 16, 17], [17], None),
        ("decide", [18, 19], [19], None),
        ("twosec", [20, 21, 22], [21, 22], None),
        ("stay", [23, 24, 25], [25], None),
        ("scroll", [26, 27], [27], None),
        ("same", [28, 29, 30, 31], [31], None),
        ("edited", [32, 33], [32], None),
        ("tenx", [34, 35, 36, 37, 38], [36], {36: "10x", 37: ""}),
        ("show", [43, 44, 45, 46], [45], None),
    ],
    "hi": [
        ("hook", [0, 1, 2, 3, 4], [2], None),
        ("hook2", [5, 6, 7, 8], [6, 7], None),
        ("content", [9, 10, 11, 12], [11], None),
        ("problem", [13, 14], [13], None),
        ("editing", [15, 16, 17], [15], None),
        ("twosec", [18, 19, 20, 21], [20, 21], None),
        ("decide", [22, 23, 24, 25], [23], None),
        ("stay", [26, 27, 28], [26], None),
        ("scroll", [29, 30, 31], [29], None),
        ("same", [32, 33, 34], [33], None),
        ("edited", [35, 36, 37, 38], [35, 36], None),
        ("tenx", [39, 40, 41], [39], {39: "10x", 40: ""}),
        ("views", [42, 43, 44, 45], [42], None),
        ("show", [46, 47, 48], [47], None),
    ],
}


def clean(t):
    return t.strip().rstrip(".,!?;:").replace("'", "’")


class Chunk:
    def __init__(self, words, role, idx, emph, disp, nxt_start, dur):
        self.role = role
        self.idx = idx
        self.emph = set(emph)
        self.disp = disp or {}
        self.start = words.s(idx[0])
        self.end_speech = words.e(idx[-1])
        self.words = [(i, self.disp.get(i, clean(words.t(i))), words.s(i), words.e(i)) for i in idx
                      if self.disp.get(i, "x") != ""]
        self.next = nxt_start if nxt_start is not None else dur
        self.end = self.next  # visible until the next chunk starts

    def text(self):
        return " ".join(w[1] for w in self.words)


def chunks(words, lang):
    spec = CHUNKS[lang]
    out = []
    for k, (role, idx, emph, disp) in enumerate(spec):
        nxt = words.s(spec[k + 1][1][0]) if k + 1 < len(spec) else None
        out.append(Chunk(words, role, idx, emph, disp, nxt, words.dur))
    return out
