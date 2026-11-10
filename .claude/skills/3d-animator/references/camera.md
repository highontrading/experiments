# Camera

## Lens (three.js `fov` is the VERTICAL angle)

| Shot | 9:16 fov | 16:9 fov | Feels like |
|---|---|---|---|
| Hero object, product | 28 to 35 | 20 to 26 | 85 mm, flattering, calm |
| Character, small scene | 35 to 45 | 26 to 34 | 50 mm, natural |
| Room, landscape | 45 to 55 | 34 to 40 | 35 mm, space around |

Above 60 the edges stretch and it reads as a game, not a film.

## Moves (pick one per beat, ease every one with `E.inOut`)

| Move | How | Use for |
|---|---|---|
| Push in | camera travels toward the subject, 10 to 20 percent of the distance | tension, the hook |
| Pull out | the reverse | the reveal, showing the change |
| Truck | slides sideways, aim fixed on the subject | parallax, showing depth |
| Crane | rises or falls, aim fixed | the payoff (rise), arrival (fall) |
| Arc | moves on a short circle, 10 to 30 degrees | showing form, a product turn |

Speed: the whole film's camera travel is small. If the camera move is the first thing you notice,
it is too big. Start and end each move at rest so the loop joins.

## Aim with lag

Keep a `target` vector. Each frame, compute where the action is and ease toward it
from `t`, not from the last frame:

```js
const look = new THREE.Vector3().lerpVectors(beatA, beatB, E.inOut(seg(t, 1.0, 1.8)));
camera.lookAt(look);
```

The aim should arrive 2 to 4 frames after the action starts, never before.

## Framing

- Subject on a third. Room in front of it in the direction it moves or looks.
- Horizon off-centre (lower third for sky, upper third for ground).
- Low angle (camera below the subject's eye line) makes it heroic; high angle makes it small.
- Keep 8 percent of the frame empty on every edge for platform UI. On 9:16 keep the subject
  between 15 and 75 percent of the height; the bottom fifth is covered by captions on phones.

## Depth

Three layers: a foreground piece close to the lens (a leaf, a pedestal edge, out of focus feel),
the subject, the background. `scene.fog = new THREE.Fog(bg, near, far)` in the background colour
fades the far layer and makes the light feel like air.
