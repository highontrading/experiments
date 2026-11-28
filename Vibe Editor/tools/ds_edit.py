"""One edit built strictly from DESIGN_SYSTEM.md ("Optimized" universal edit system).

A-roll: white Inter Display captions (S 78 / M 96 / L 182, tracking -3.5 %, soft shadow, no outline), centred at
y 65 %, words enter on their spoken frame (blur 10→0, scale 110→100, rise 24 px, 0.16 s), hard-cut out.
Cards: full-frame white, ink #0B0B0B, exactly one red #F2000A element per card, statement / stack / hero-number
components, blue line icons, visual-in 0.23 s, whip-left out (4 frames + streak), one split-wipe.
Camera: no zooms — framing alternates wide 1.10x / tight 1.32x at every cut. Sound: soft ASMR set, calm bed."""
import json
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from velib import WS, Words, L, S, tw, ms, c, rect, rrect, circle, PEAKS  # noqa: E402

F = "ve-inter-display-bold"
INK, RED, WHITE = "#0B0B0B", "#F2000A", "#FFFFFF"
STROKE, FILL = "#2D6FD9", "#D9E8FF"
CAP = {"S": 78, "M": 96, "L": 182}
CARD = {"S": 82, "M": 124, "P": 108, "L": 184, "XL": 400}
FPS = 30
WHIP = 4 / FPS
BLANK = 2.5 / FPS
CAP_Y = 1330  # ~65–70 %: on the body under the chin (lowered a touch so white words sit on the jeans, not the white tee)

CUTS_BASE = {"remove_pauses": True, "max_pause": 0.18, "pad_before": 0.06, "pad_after": 0.06, "remove_fillers": False}

# ------------------------------------------------------------------ beats (word indices of the cleaned transcripts)
BEATS = {
    "en": {
        "drop_words": [[39, 42]],  # the repeated "Let me show you"
        "aroll": [([0, 1], None), ([2, 3, 4], 2), ([5, 6], 6), ([14, 15, 16, 17], 17), ([23, 24, 25, 26, 27], 27, "phone"),
                  ([28, 29, 30, 31], 31), ([32, 33], 32), ([43, 44, 45, 46], 45)],
        "cards": [
            {"steps": [{"kind": "statement", "words": [7, 8, 9, 10], "red": 10},
                       {"kind": "stack", "lines": [[11, 12]], "key": 13, "icon": "player"}]},
            {"split": True,
             "steps": [{"kind": "hero", "kicker": [18, 19, 20], "number": ([21], "2"), "unit": [22]}]},
            {"steps": [{"kind": "hero", "kicker": [34, 35], "number": ([36, 37], "10×"), "unit": [38]}]},
        ],
    },
    "hi": {
        "drop_words": [],
        "aroll": [([0, 1, 2, 3, 4], 2), ([5, 6, 7, 8], 7), ([16, 17], None), ([26, 27, 28, 29, 30, 31], 29, "phone"),
                  ([32, 33, 34], 34), ([35, 36, 37, 38], 36), ([46, 47, 48], 47)],
        "cards": [
            {"steps": [{"kind": "statement", "words": [9, 10, 11, 12], "red": 11},
                       {"kind": "stack", "lines": [[13, 14]], "key": 15, "icon": "player"}]},
            {"split": True,
             "steps": [{"kind": "hero", "kicker": [18, 19], "number": ([20], "2"), "unit": [21]},
                       {"kind": "statement", "words": [22, 23, 24, 25], "red": 23}]},
            {"steps": [{"kind": "hero", "kicker": [], "number": ([39, 40], "10×"), "unit": [41, 42], "after": [43, 44, 45]}]},
        ],
    },
}


def fsp(size):
    return round(-0.035 * size, 1)


def wdt(text, size):
    return tw(text, F, size, fsp(size))


# ------------------------------------------------------------------ primitive animations
def word_in(x, y, an, text, t0, t1, size, color, shadow=False):
    """Word enters on its spoken frame: 0.16 s, opacity 0→1, blur 10→0, scale 110→100 %, rise 24 px. Hard cut out."""
    mv = f"\\an{an}\\fsp{fsp(size)}\\move({x:.1f},{y + 24:.1f},{x:.1f},{y:.1f},0,160)\\fscx110\\fscy110"
    out = []
    if shadow:  # rgba(0,0,0,.55), blur 26, y +4
        smv = mv.replace(f"{y + 24:.1f},{x:.1f},{y:.1f}", f"{y + 28:.1f},{x:.1f},{y + 4:.1f}")
        out.append(L(t0, t1, "{" + smv + "\\blur18\\bord6\\3c&H000000&\\alpha&HFF&\\t(0,160,0.6,\\alpha&H80&\\fscx100\\fscy100)}" + text,
                     font=F, size=size, color="#000000", layer=6))
        out.append(L(t0, t1, "{" + smv + "\\blur7\\alpha&HFF&\\t(0,160,0.6,\\alpha&H73&\\fscx100\\fscy100)}" + text,
                     font=F, size=size, color="#000000", layer=7))
    out.append(L(t0, t1, "{" + mv + "\\blur10\\alpha&HFF&\\t(0,160,0.6,\\alpha&H00&\\blur0\\fscx100\\fscy100)}" + text,
                 font=F, size=size, color=color, layer=8))
    return out


def place_line(words, size, y, align="center", x_left=140, x_center=540):
    """Lay out one line of (text, t_spoken, color) words; returns [(x, text, t, color)] with left-anchored x."""
    sp = wdt(" ", size) if wdt(" ", size) > 4 else size * 0.24
    widths = [wdt(t, size) for t, _, _ in words]
    total = sum(widths) + sp * (len(words) - 1)
    x = x_center - total / 2 if align == "center" else x_left
    out = []
    for (t, ts, col), w in zip(words, widths):
        out.append((x, t, ts, col))
        x += w + sp
    return out, total


class Builder:
    def __init__(self, lang):
        self.lang = lang
        B = BEATS[lang]
        cuts = dict(CUTS_BASE, drop_words=B["drop_words"])
        w0 = Words(lang, cuts=cuts)
        # keep a calm 0.5 s tail after the CTA instead of cutting on the last syllable
        jd = json.load(open(os.path.join(WS, ".vibe", "jobs", lang, "job.json")))
        src_dur = jd["probe"]["duration"]
        segs = list(w0.segs)
        segs[-1] = (segs[-1][0], min(src_dur, segs[-1][1] + 0.45))
        drops = [[round(segs[i][1], 4), round(segs[i + 1][0], 4)] for i in range(len(segs) - 1)]
        if segs[0][0] > 0.001:
            drops.insert(0, [0.0, round(segs[0][0], 4)])
        if segs[-1][1] < src_dur - 0.001:
            drops.append([round(segs[-1][1], 4), src_dur])
        self.cuts = {"remove_pauses": False, "trim_ends": False, "remove_fillers": False, "drop_words": [], "drop": drops}
        self.w = Words(lang, cuts=self.cuts)
        self.D = self.w.dur
        self.events = []
        self.sfx_times = []

    # -------------------------------------------------------------- helpers
    def t(self, i):
        return self.w.s(i)

    def txt(self, i):
        return self.w.t(i).strip()

    def ass(self, at, dur, layers):
        self.events.append({"type": "ass", "at": round(at, 3), "dur": round(dur, 3), "layers": layers})

    def sfx(self, name, t_peak, vol):
        t0 = max(0.0, t_peak - PEAKS.get(name, 0.0))
        if any(abs(t0 - x) < 0.15 for x in self.sfx_times):  # never stack two effects within ~150 ms
            return
        self.sfx_times.append(t0)
        self.events.append({"type": "sfx", "at": round(t0, 3), "name": name + ".wav", "volume": vol})

    # -------------------------------------------------------------- A-roll caption stack / filler run
    def aroll(self, idx, key, a, b, icon=None):
        lays = []
        rel = lambda t: max(0.0, t - a)  # noqa: E731
        end = b - a
        if key is None:  # filler run: 1–2 words in M, centred, replacing each other
            for k in range(0, len(idx), 2):
                pair = idx[k:k + 2]
                p_end = (self.t(idx[k + 2]) - a) if k + 2 < len(idx) else end
                placed, _ = place_line([(self.txt(i), self.t(i), WHITE) for i in pair], CAP["M"], CAP_Y)
                for (x, t, ts, col) in placed:
                    lays += word_in(x, CAP_Y, 4, t, rel(ts), p_end, CAP["M"], col, shadow=True)
            self.ass(a, end, lays)
            return
        above = [i for i in idx if i < key]
        below = [i for i in idx if i > key]
        yk = CAP_Y
        placed, _ = place_line([(self.txt(key), self.t(key), WHITE)], CAP["L"], yk)
        for (x, t, ts, col) in placed:
            lays += word_in(x, yk, 4, t, rel(ts), end, CAP["L"], col, shadow=True)
        gap = 0.43 * (CAP["L"] + CAP["S"]) * 0.86
        if above:
            pl, _ = place_line([(self.txt(i), self.t(i), WHITE) for i in above], CAP["S"], yk - gap)
            for (x, t, ts, col) in pl:
                lays += word_in(x, yk - gap, 4, t, rel(ts), end, CAP["S"], col, shadow=True)
        yb = yk + gap
        if below:
            pl, _ = place_line([(self.txt(i), self.t(i), WHITE) for i in below], CAP["S"], yb)
            for (x, t, ts, col) in pl:
                lays += word_in(x, yb, 4, t, rel(ts), end, CAP["S"], col, shadow=True)
        if icon:  # caption icon under the key word (concrete concept), 14–30 % of the width
            t_ic = self.t(key)
            lays += self.icon(icon, 540, yb + 170 if below else yk + 215, rel(t_ic), end, scale=0.4, white=True)
            self.sfx("ds-pop", t_ic + 0.05, 0.2)
        self.ass(a, end, lays)

    # -------------------------------------------------------------- line icons
    def icon_paths(self, kind):
        if kind == "player":  # video window with play button and scrub bar (w 440, h 330)
            return [(rrect(0, 0, 440, 300, 40), True), ("m 180 100 l 280 150 180 200", True),
                    ("m 40 360 l 400 360", False), (circle(170, 360, 18), True)], (440, 380)
        if kind == "phone":  # phone with feed rows (w 250, h 440)
            return [(rrect(0, 0, 250, 440, 44), True), (rrect(36, 64, 178, 110, 18), False),
                    (rrect(36, 196, 178, 110, 18), False), ("m 36 344 l 214 344", False), ("m 36 380 l 160 380", False)], (250, 440)
        raise KeyError(kind)

    def icon(self, kind, cx, cy, t0, t1, scale=1.0, white=False):
        """Line icon: 8 px rounded blue stroke, flat light-blue fill; visual-in 0.23 s from the right."""
        paths, (w, h) = self.icon_paths(kind)
        x0, y0 = cx - w * scale / 2, cy - h * scale / 2
        stroke = WHITE if white else STROKE
        sc = f"\\fscx{scale * 106:.1f}\\fscy{scale * 106:.1f}\\t(0,230,0.6,\\fscx{scale * 100:.1f}\\fscy{scale * 100:.1f}"
        base = (f"\\an7\\move({x0 + 46:.0f},{y0:.0f},{x0:.0f},{y0:.0f},0,230){sc}\\blur0)\\blur9\\alpha&HFF&"
                f"\\t(0,120,\\alpha&H00&)")
        lays = []
        for pth, filled in paths:
            if filled and not white:
                lays.append(S(t0, t1, "{" + base + "\\p1}" + pth, FILL, layer=5))
            lays.append(S(t0, t1, "{" + base + f"\\1a&HFF&\\bord{4 / scale:.1f}\\3c{c(stroke)}\\p1}}" + pth, stroke, layer=6))
            if white:
                lays.insert(0, S(t0, t1, "{" + base.replace("\\alpha&HFF&\\t(0,120,\\alpha&H00&)", "\\alpha&HFF&\\t(0,120,\\alpha&H8C&)")
                                 + f"\\1a&HFF&\\bord{6 / scale:.1f}\\blur10\\3c&H000000&\\p1}}" + pth, "#000000", layer=4))
        self._last_icon = (paths, x0, y0, scale, stroke)
        return lays

    # -------------------------------------------------------------- cards
    def card(self, spec, a, b):
        """Full-frame white card from a to b; steps build word by word and whip out between steps."""
        steps = spec["steps"]
        bg = rect(-20, -20, 1120, 1960)
        if spec.get("split"):  # split-wipe: a white band opens from x 53 % to full width in 5 frames
            bgl = S(0, b - a, "{\\an7\\pos(0,0)\\clip(572,0,574,1920)\\t(0,166,\\clip(0,0,1080,1920))\\p1}" + bg, WHITE, layer=2)
            self.sfx("ds-paper", a + 0.02, 0.28)
        else:
            bgl = S(0, b - a, "{\\an7\\pos(0,0)\\p1}" + bg, WHITE, layer=2)
            self.sfx("ds-tap", a + 0.01, 0.25)
        self.ass(a, b - a, [bgl])
        for k, st in enumerate(steps):
            first = self.first_word(st)
            s0 = a if k == 0 else self.t(first) - 0.04
            if k + 1 < len(steps):
                nxt = self.t(self.first_word(steps[k + 1]))
                w0 = max(s0 + 0.3, nxt - WHIP - BLANK - 0.04)
                items = self.step(st, s0, w0)
                self.whip(items, w0)
                self.sfx("ds-whoosh", w0 + 0.03, 0.22)
            else:
                self.step(st, s0, b)

    def first_word(self, st):
        if st["kind"] == "statement":
            return st["words"][0]
        if st["kind"] == "stack":
            return st["lines"][0][0] if st["lines"] and st["lines"][0] else st["key"]
        return (st["kicker"] or st["number"][0])[0]

    def step(self, st, a, b):
        """Build one card step; returns placed items for the whip."""
        lays, items = [], []
        end = b - a
        rel = lambda t: max(0.0, t - a)  # noqa: E731

        def put(x, y, an, text, ts, size, color):
            lays.extend(word_in(x, y, an, text, rel(ts), end, size, color))
            items.append(("t", x, y, an, text, size, color, rel(ts)))

        if st["kind"] == "statement":  # one centred P line (two if long); the red word is the punchline
            ws = [(self.txt(i), self.t(i), RED if i == st["red"] else INK) for i in st["words"]]
            size = CARD["P"]
            lines = [ws]
            if wdt(" ".join(w[0] for w in ws), size) > 860:
                half = (len(ws) + 1) // 2
                lines = [ws[:half], ws[half:]]
            y0 = 900 - (len(lines) - 1) * size * 0.44
            for li, ln in enumerate(lines):
                pl, _ = place_line(ln, size, y0 + li * size * 0.88)
                for (x, t, ts, col) in pl:
                    put(x, y0 + li * size * 0.88, 4, t, ts, size, col)
        elif st["kind"] == "stack":  # S words top-left, red key word in L, then the visual
            y = 640
            for ln in st["lines"]:
                pl, _ = place_line([(self.txt(i), self.t(i), INK) for i in ln], CARD["S"], y, align="left")
                for (x, t, ts, col) in pl:
                    put(x, y, 4, t, ts, CARD["S"], col)
                y += 0.86 * CARD["S"]
            y += 0.43 * (CARD["S"] + CARD["L"]) * 0.86 - 0.86 * CARD["S"] + 10
            pl, _ = place_line([(self.txt(st["key"]), self.t(st["key"]), RED)], CARD["L"], y, align="left")
            for (x, t, ts, col) in pl:
                put(x, y, 4, t, ts, CARD["L"], col)
            if st.get("icon"):
                t_ic = self.t(st["key"])
                cx, cy = (640, 1240) if st["icon"] == "player" else (720, 1250)
                lays.extend(self.icon(st["icon"], cx, cy, rel(t_ic) + 0.05, end))
                items.append(("i", self._last_icon, rel(t_ic) + 0.05))
                self.sfx("ds-pop", t_ic + 0.08, 0.2)
        elif st["kind"] == "hero":  # kicker S, giant red number XL, unit M (+ optional S line)
            yk, yn, yu = 600, 905, 1175
            if st["kicker"]:
                pl, _ = place_line([(self.txt(i), self.t(i), INK) for i in st["kicker"]], CARD["S"], yk)
                for (x, t, ts, col) in pl:
                    put(x, yk, 4, t, ts, CARD["S"], col)
            nidx, ntext = st["number"]
            tn = self.t(nidx[0])
            pl, _ = place_line([(ntext, tn, RED)], CARD["XL"], yn)
            for (x, t, ts, col) in pl:
                put(x, yn, 4, t, ts, CARD["XL"], col)
            self.sfx("ds-shimmer", tn + 0.04, 0.22)
            pl, _ = place_line([(self.txt(i), self.t(i), INK) for i in st["unit"]], CARD["M"], yu)
            for (x, t, ts, col) in pl:
                put(x, yu, 4, t, ts, CARD["M"], col)
            if st.get("after"):
                pl, _ = place_line([(self.txt(i), self.t(i), INK) for i in st["after"]], CARD["S"], yu + 118)
                for (x, t, ts, col) in pl:
                    put(x, yu + 118, 4, t, ts, CARD["S"], col)
        self.ass(a, end, lays)
        return items, a

    def whip(self, items_a, w0):
        """Whip left: 4 frames, ~1300 px, near-linear, with a horizontal motion-blur streak (trailing copies)."""
        items, a = items_a
        d = WHIP
        lays = []
        for it in items:
            if it[0] == "t":
                _, x, y, an, text, size, color, _t = it
                for k, al in enumerate(("&H00&", "&H90&", "&HC8&")):
                    off = 60 * k
                    lays.append(L(0, d, f"{{\\an{an}\\fsp{fsp(size)}\\move({x + off:.0f},{y:.0f},{x - 1300 + off:.0f},{y:.0f})"
                                        f"\\blur{3 + 5 * k}\\fscx{100 + 25 * k}\\alpha{al}}}" + text, font=F, size=size, color=color, layer=8 - k))
            else:
                _, (paths, x0, y0, scale, stroke), _t = it
                for pth, filled in paths:
                    mv = f"\\an7\\move({x0:.0f},{y0:.0f},{x0 - 1300:.0f},{y0:.0f})\\fscx{scale * 100:.0f}\\fscy{scale * 100:.0f}\\blur4"
                    if filled:
                        lays.append(S(0, d, "{" + mv + "\\p1}" + pth, FILL, layer=5))
                    lays.append(S(0, d, "{" + mv + f"\\1a&HFF&\\bord{4 / scale:.1f}\\3c{c(stroke)}\\p1}}" + pth, stroke, layer=6))
        self.ass(w0, d, lays)

    # -------------------------------------------------------------- framing (wide 1.10x / tight 1.32x at every cut)
    def framing(self, aroll_windows):
        bounds = []
        acc = 0.0
        for a, b in self.w.segs:
            acc += b - a
            bounds.append(acc)
        tight = False
        for a, b in aroll_windows:
            cuts = [a] + [x for x in bounds if a + 0.05 < x < b - 0.05] + [b]
            for k in range(len(cuts) - 1):
                if tight:
                    self.events.append({"type": "zoom", "at": round(cuts[k], 3), "until": round(cuts[k + 1], 3),
                                        "style": "cut", "amount": 1.2, "focus": [0.5, 0.3], "sfx": False})
                tight = not tight

    # -------------------------------------------------------------- build
    def build(self):
        B = BEATS[self.lang]
        # card windows: from the first word of the card (hard cut) to the next A-roll phrase
        aroll_starts = sorted(self.t(p[0][0]) for p in B["aroll"])
        windows = []
        for spec in B["cards"]:
            a = self.t(self.first_word(spec["steps"][0])) - 0.04
            b = min([s for s in aroll_starts if s > a] + [self.D])
            windows.append((a, b, spec))
        # A-roll phrases run until the next phrase or card
        starts = sorted([self.t(p[0][0]) for p in B["aroll"]] + [w[0] for w in windows])
        for p in B["aroll"]:
            idx, key = p[0], p[1]
            icon = p[2] if len(p) > 2 else None
            a = self.t(idx[0]) - (0.0 if idx[0] == 0 else 0.03)
            b = min([s for s in starts if s > a + 0.05] + [self.D])
            self.aroll(idx, key, max(0.0, a), b, icon)
        for a, b, spec in windows:
            self.card(spec, a, b)
        # framing alternation on the A-roll only
        aroll_windows, cur = [], 0.0
        for a, b, _ in sorted(windows, key=lambda w: w[0]):
            aroll_windows.append((cur, a))
            cur = b
        aroll_windows.append((cur, self.D))
        self.framing(aroll_windows)
        self.sfx("ds-swell", 0.45, 0.3)
        card_time = sum(b - a for a, b, _ in windows)
        print(f"{self.lang}: {self.D:.2f}s, cards {card_time:.2f}s = {100 * card_time / self.D:.0f}%")
        return {
            "format": "9:16", "reframe": {"mode": "crop", "x": 0.5, "y": 0.5, "zoom": 1.10},
            "look": {"filter": "eq=contrast=1.08:brightness=0.015:saturation=1.06,"
                               "colorbalance=rm=0.02:gm=0.004:bm=-0.016:rh=0.015:bh=-0.012,unsharp=5:5:0.35:5:5:0"},
            "cuts": self.cuts, "captions": {"enabled": False},
            "audio": {"denoise": False, "loudness": -14, "music": {"file": "m-calm.wav", "volume": 0.2, "duck": True}},
            "auto_sfx": True, "events": self.events, "output": {"name": f"optimized-{self.lang}"},
        }


if __name__ == "__main__":
    for lang in sys.argv[1:] or ["en", "hi"]:
        plan = Builder(lang).build()
        path = os.path.join(WS, "plans", f"optimized-{lang}.json")
        json.dump(plan, open(path, "w"), indent=1, ensure_ascii=False)
        print(path)
