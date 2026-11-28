"""Audio QA: integrated loudness, true peak, and momentary-loudness spikes relative to speech level."""
import json
import re
import subprocess
import sys

import numpy as np


def ebur(path):
    r = subprocess.run(["ffmpeg", "-hide_banner", "-nostats", "-i", path, "-af", "ebur128=peak=true:framelog=verbose",
                        "-f", "null", "-"], capture_output=True, text=True).stderr
    m2 = subprocess.run(["ffmpeg", "-hide_banner", "-nostats", "-i", path, "-af",
                         "ebur128=metadata=1,ametadata=print:key=lavfi.r128.M", "-f", "null", "-"], capture_output=True, text=True).stderr
    ts = [float(x) for x in re.findall(r"pts_time:([\d.]+)", m2)]
    ms_ = [float(x) for x in re.findall(r"lavfi.r128.M=(-?[\d.]+)", m2)]
    mom = list(zip(ts, ms_))
    I = float(re.search(r"I:\s*(-?[\d.]+) LUFS", r.split("Summary:")[-1]).group(1))
    tp = float(re.search(r"Peak:\s*(-?[\d.]+) dBFS", r.split("Summary:")[-1]).group(1))
    return I, tp, mom


if __name__ == "__main__":
    for p in sys.argv[1:]:
        I, tp, mom = ebur(p)
        m = np.array([x[1] for x in mom])
        t = np.array([x[0] for x in mom])
        speech = np.median(m[m > -40]) if (m > -40).any() else -99
        spikes = [(round(a, 1), round(b - speech, 1)) for a, b in zip(t, m) if b - speech > 4.5]
        tail = m[t > t.max() - 0.6].mean() if len(m) else -99
        print(json.dumps({"file": p.split("/")[-1], "LUFS": I, "truePeak": tp, "speechM": round(float(speech), 1),
                          "spikes(t,+LU)": spikes[:8], "tailM": round(float(tail), 1)}))
