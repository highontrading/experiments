"""Mix VO + ducked music + SFX cues -> build/mix.wav (loudness -14 LUFS)."""
import json, subprocess, os
root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
os.chdir(root)
DUR, VO_OFF = 42.5, 0.5
cues = json.load(open("sfx_cues.json"))
inputs = ["-i", "assets/vo/jeet_v2.mp3", "-i", "assets/music/bed2.mp3"]
f = []
f.append(f"[0:a]aresample=48000,adelay={int(VO_OFF*1000)}|{int(VO_OFF*1000)},apad=whole_dur={DUR},"
         "highpass=f=70,acompressor=threshold=0.12:ratio=3:attack=5:release=120,"
         "equalizer=f=3500:t=q:w=1.2:g=2.5,volume=1.0,asplit=2[vo][vosc]")
f.append(f"[1:a]aresample=48000,volume=0.42,afade=t=in:d=0.3,afade=t=out:st={DUR-1.2}:d=1.2,apad=whole_dur={DUR}[mus]")
f.append("[mus][vosc]sidechaincompress=threshold=0.04:ratio=5:attack=30:release=350:makeup=1[musd]")
labels = []
for k, (t, name, db) in enumerate(cues):
    inputs += ["-i", f"assets/sfx/{name}.mp3"]
    ms = int(t * 1000)
    f.append(f"[{k+2}:a]aresample=48000,aformat=channel_layouts=stereo,volume={db}dB,adelay={ms}|{ms}[s{k}]")
    labels.append(f"[s{k}]")
f.append("".join(labels) + f"amix=inputs={len(labels)}:normalize=0,volume=0.9[sfx]")
f.append(f"[vo][musd][sfx]amix=inputs=3:normalize=0,atrim=0:{DUR},alimiter=limit=0.95[pre]")
cmd = ["ffmpeg", "-v", "error", "-y", *inputs, "-filter_complex", ";".join(f), "-map", "[pre]", "-ar", "48000", "build/premix.wav"]
subprocess.run(cmd, check=True)
# two-pass loudnorm to -14 LUFS
r = subprocess.run(["ffmpeg", "-hide_banner", "-i", "build/premix.wav", "-af", "loudnorm=I=-14:TP=-1.2:LRA=9:print_format=json", "-f", "null", "-"], capture_output=True, text=True)
j = json.loads(r.stderr[r.stderr.rindex("{"):])
af = (f"loudnorm=I=-14:TP=-1.2:LRA=9:measured_I={j['input_i']}:measured_TP={j['input_tp']}:measured_LRA={j['input_lra']}:"
      f"measured_thresh={j['input_thresh']}:offset={j['target_offset']}:linear=true")
subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", "build/premix.wav", "-af", af, "-ar", "48000", "build/mix.wav"], check=True)
print("mix ok", j["input_i"])
