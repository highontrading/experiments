"""Run the Vibe Editor CLI with a local fix: AI background swap merges in RGB so the mask also covers chroma
(the stock engine merges in yuv420p, which leaks the new background's colour into the person)."""
import inspect, sys, textwrap
sys.path.insert(0, "/root/.claude/plugins/synced/74f9fb4e-54c6-46fc-b018-a3707af7e8e4_cc95731b-4d6e-4461-a267-c1f8fc836df4/vibe-editor/skills/edit/scripts")
from vibe_engine import ai, cli

src = textwrap.dedent(inspect.getsource(ai.apply_ai))
old = 'G.push(f"[{bg}]format=yuv420p[{out}b];[{src}]format=yuv420p[{out}s];[{out}b][{out}s][{pool.get((a, b))}]maskedmerge[{out}]")'
new = ('G.push(f"[{bg}]format=gbrp[{out}b];[{src}]format=gbrp[{out}s];[{pool.get((a, b))}]format=gray,format=gbrp[{out}m];'
       '[{out}b][{out}s][{out}m]maskedmerge,format=yuv420p[{out}]")')
assert old in src, "engine changed — patch not applied"
exec(compile(src.replace(old, new), ai.__file__, "exec"), ai.__dict__)

# Hard framing changes for DESIGN_SYSTEM.md (alternate wide/tight at each cut): zoom style "cut" = instant step.
from vibe_engine import fx_video, render  # noqa: E402
zsrc = textwrap.dedent(inspect.getsource(fx_video.zoom_expr))
zold = '        elif st == "pulse":'
assert zold in zsrc, "engine changed — zoom patch not applied"
zsrc = zsrc.replace(zold, '        elif st == "cut":\n            ri, ro = 0.001, 0.001\n' + zold)
exec(compile(zsrc, fx_video.__file__, "exec"), fx_video.__dict__)

# Music bed per DESIGN_SYSTEM.md §6: fade in 0.8 s, out 1.2 s, gentler ducking (ratio 3).
asrc = textwrap.dedent(inspect.getsource(render.audio_graph))
for o, n in (("afade=t=in:d=0.6", "afade=t=in:d=0.8"), ("tm.duration - 1.5):.3f}:d=1.5", "tm.duration - 1.2):.3f}:d=1.2"),
             ("sidechaincompress=threshold=0.04:ratio=6", "sidechaincompress=threshold=0.04:ratio=3")):
    assert o in asrc, "engine changed — audio patch not applied: " + o
    asrc = asrc.replace(o, n)
exec(compile(asrc, render.__file__, "exec"), render.__dict__)

if __name__ == "__main__":
    cli.main()
