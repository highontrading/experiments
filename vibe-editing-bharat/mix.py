# Mix the soundtrack from build/timing.json -> build/mix.wav
# music (ducked under the voices) + every voice line on cue + city ambience + SFX.
import json, os, subprocess
SUF = "" if os.environ.get("VERSION", "en") == "en" else "_" + os.environ["VERSION"]
T = json.load(open(f"build/timing{SUF}.json"))
MUSIC_START = 0.0
dur = T["dur"]
inputs, chains, vox, bed = [], [], [], []
def add(path):
    inputs.extend(["-i", path]); return len(inputs) // 2 - 1
ms = lambda s: max(0, int(round(s * 1000)))

# voices
for v in T["voices"]:
    i = add(f"voice/{v.get('file', v['id'])}.mp3")
    g = 0.95 if v["id"].startswith("g_") else 1.0
    chains.append(f"[{i}:a]aresample=48000,aformat=channel_layouts=stereo,volume={g},adelay={ms(v['at'])}|{ms(v['at'])}[v{i}]")
    vox.append(f"[v{i}]")
# city ambience under each language scene
for sc in T["scenes"]:
    p = f"assets/audio/amb_{sc.get('clip', '')}.m4a"
    if sc.get("clip") and os.path.exists(p):
        i = add(p); d = sc["dur"] + 0.6
        chains.append(f"[{i}:a]aresample=48000,aformat=channel_layouts=stereo,atrim=0:{d},asetpts=N/SR/TB,"
                      f"afade=t=in:d=0.5,afade=t=out:st={d - 0.7}:d=0.7,volume=0.32,adelay={ms(sc['start'] - 0.3)}|{ms(sc['start'] - 0.3)}[a{i}]")
        bed.append(f"[a{i}]")
# sfx
for k, s in enumerate(T["sfx"]):
    i = add(f"assets/audio/sfx_{s['name']}.mp3")
    chains.append(f"[{i}:a]aresample=48000,aformat=channel_layouts=stereo,volume={0.55 * s['gain']:.3f},adelay={ms(s['at'])}|{ms(s['at'])}[s{i}]")
    bed.append(f"[s{i}]")
# music
mi = add("assets/audio/music.mp3")
chains.append(f"[{mi}:a]aresample=48000,aformat=channel_layouts=stereo,atrim={MUSIC_START}:{MUSIC_START + dur},asetpts=N/SR/TB,"
              f"volume=0.42,afade=t=in:d=0.4,afade=t=out:st={dur - 2.2}:d=2.2[mus]")
n = len(vox)
chains.append(f"{''.join(vox)}amix=inputs={n}:normalize=0:duration=longest,asplit=2[vox][key]")
chains.append("[mus][key]sidechaincompress=threshold=0.02:ratio=5:attack=15:release=420:makeup=1[ducked]")
chains.append(f"[vox][ducked]{''.join(bed)}amix=inputs={2 + len(bed)}:normalize=0:duration=longest,"
              f"apad=whole_dur={dur},atrim=0:{dur},loudnorm=I=-14:TP=-1.2:LRA=9,aresample=48000[out]")
cmd = ["ffmpeg", "-loglevel", "error", "-y", *inputs, "-filter_complex", ";".join(chains), "-map", "[out]", "-ac", "2", f"build/mix{SUF}.wav"]
subprocess.run(cmd, check=True)
print(f"build/mix{SUF}.wav", subprocess.check_output(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", f"build/mix{SUF}.wav"]).decode().strip(), "s")
