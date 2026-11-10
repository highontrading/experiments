# Sound

The template synthesizes every sound in code with Web Audio, so there are no files and no
licences. A cue is `{ t, s, gain, pan, pitch }`:
- `t` seconds into the loop; `s` one of `pop`, `click`, `thud`, `whoosh`, `chime`, `tick`, `swell`;
- `gain` 0 to 1 (0.6 is normal), `pan` -1 left to 1 right, `pitch` 1 is normal, 0.5 an octave down.

## Which sound for which action

| Action | Sound | Timing |
|---|---|---|
| Something appears, pops in | `pop`, pitch up for small things | the first frame it is visible |
| A switch, a button, a snap, a lock | `click` | the frame it changes |
| A landing, an impact | `thud`, pitch down for heavy things | the contact frame; smaller second thud on a bounce |
| A fast travel, a camera whip | `whoosh` | starts about 0.15 s before arrival, the template peaks it at `t` |
| Small repeated steps (counting, typing, rolling) | `tick`, slight pitch changes | one per step |
| The payoff, the reveal, the change of state | `chime` or `swell` | the frame the change completes |

## Mix

- One sound per action. Two at once at most.
- The payoff is the loudest cue (gain 0.8); the rest sit around 0.5 to 0.6; ticks 0.3.
- Pan with the object's x position on screen (left edge -0.6, right edge 0.6).
- Leave at least 0.3 s of silence before the payoff so it lands.
- No music bed unless asked. If asked, `swell` across the loop at gain 0.2 under the cues.
