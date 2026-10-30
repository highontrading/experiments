# Soundtrack for one ad: narrator + chorus on cue, ElevenLabs music ducked under speech, SFX on their words.
#   AD=a1 python3 mix.py  -> build/a1/mix.wav
import json, os, subprocess
AD = os.environ.get("AD", "a1")
T = json.load(open(f"build/{AD}/timing.json"))
dur = T["dur"]; inputs, chains, vox, bed = [], [], [], []
def add(p): inputs.extend(["-i", p]); return len(inputs) // 2 - 1
ms = lambda s: max(0, int(round(s * 1000)))
for v in T["voices"]:
    i = add(f"voice/{v['id']}.mp3"); g = 0.9 if v["role"] == "chorus" else 1.0
    chains.append(f"[{i}:a]aresample=48000,aformat=channel_layouts=stereo,volume={g},adelay={ms(v['at'])}|{ms(v['at'])}[v{i}]"); vox.append(f"[v{i}]")
EV = json.load(open(f"build/{AD}/sfx.json")) if os.path.exists(f"build/{AD}/sfx.json") else {"music": None, "events": T["sfx"]}
for s in EV["events"]:
    i = add(f"assets/audio/sfx_{s['name']}.mp3")
    chains.append(f"[{i}:a]aresample=48000,aformat=channel_layouts=stereo,volume={0.5 * s['gain']:.3f},adelay={ms(s['at'])}|{ms(s['at'])}[s{i}]"); bed.append(f"[s{i}]")
mi = add(f"assets/audio/{EV.get('music') or 'music_' + AD}.mp3")
chains.append(f"[{mi}:a]aresample=48000,aformat=channel_layouts=stereo,atrim=0:{dur},asetpts=N/SR/TB,volume=0.5,"
              f"afade=t=in:d=0.15,afade=t=out:st={dur - 0.8}:d=0.8[mus]")
chains.append(f"{''.join(vox)}amix=inputs={len(vox)}:normalize=0:duration=longest,asplit=2[vox][key]")
chains.append("[mus][key]sidechaincompress=threshold=0.025:ratio=4:attack=12:release=380:makeup=1[ducked]")
chains.append(f"[vox][ducked]{''.join(bed)}amix=inputs={2 + len(bed)}:normalize=0:duration=longest,apad=whole_dur={dur},atrim=0:{dur},"
              "loudnorm=I=-14:TP=-1.2:LRA=9,aresample=48000[out]")
subprocess.run(["ffmpeg", "-loglevel", "error", "-y", *inputs, "-filter_complex", ";".join(chains), "-map", "[out]", "-ac", "2", f"build/{AD}/mix.wav"], check=True)
print(f"build/{AD}/mix.wav", dur, "s")
