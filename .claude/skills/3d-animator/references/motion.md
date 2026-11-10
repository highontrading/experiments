# Motion

All motion is a function of `t`. The template gives `seg(t, a, b)` (0 to 1 between two times),
`E` (eases), `lerp`, `settle(t, t0, amp, freq, damp)` (a damped wobble that starts at `t0`) and
`hop(t, t0, height, dur)` (a parabola).

## Eases: which one

| Move | Ease |
|---|---|
| Arrives, appears, lands softly | `E.out3` |
| Leaves, falls, is pulled by gravity | `E.in2` |
| Travels from A to B, camera moves | `E.inOut` |
| Pops in with a little too much energy | `E.back` |
| Idle breathing, sway | `Math.sin(2 * Math.PI * t / LOOP * n)` with whole `n` (loops seamlessly) |

## Timing at 30 fps

| Action | Frames | Seconds |
|---|---|---|
| Anticipation | 4 to 6 | 0.13 to 0.2 |
| Small object pop in | 8 to 12 | 0.27 to 0.4 |
| Hero entrance | 12 to 18 | 0.4 to 0.6 |
| Fall from one body height | 9 to 12 | 0.3 to 0.4 |
| Squash on landing | 2 to 3 down, 6 to 10 to recover | |
| Stagger between group members | 3 to 5 | 0.1 to 0.17 |
| Hold on the payoff | 15 or more | 0.5 or more |

## Squash and stretch, keeping volume

```js
const s = 1 - 0.25 * squashAmount;           // squash on y
mesh.scale.set(1 / Math.sqrt(s), s, 1 / Math.sqrt(s));
```

Stretch along the direction of travel while falling fast (y 1.1, x and z shrink), squash on the
contact frame, overshoot to a slight stretch, settle. Hard objects (metal, glass) barely squash:
they bounce higher and ring longer instead.

## Anticipation and follow-through

Before any move of more than a body length, move 10 to 20 percent the other way first.
After it stops, parts that hang (antenna, ears, tail, a cable) keep going and settle 3 to 6 frames
later than the body. Use `settle()` with a later `t0` for each loose part.

## Seamless loop

Frame 0 and time `LOOP` must look identical. Plan the last 0.6 to 0.8 s as the return: every
object eases back to its frame-0 pose. Idles use whole numbers of cycles per loop.
Test: render `t = 0` and `t = LOOP - 1/30`; they should differ by one frame of motion.
