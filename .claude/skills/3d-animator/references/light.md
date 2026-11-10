# Light and materials

## Renderer (already in the template)

```js
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.0;
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture; // soft reflections
```

## Three-point setups

| Mood | Key | Fill | Rim | Background |
|---|---|---|---|---|
| Warm studio (default) | `DirectionalLight` #fff1e0, 2.5, from upper left front | `HemisphereLight` sky #dfe8ff ground #3a3030, 0.6 | `DirectionalLight` #ffffff, 3, from behind right | light warm grey or cream |
| Night | `SpotLight` #ffd9a0, 30, penumbra 0.6, from one practical source | Hemisphere #6077b0 / #101018, 0.3 | cool #9fb8ff, 2, behind | deep blue, never black |
| Product | large soft key from front left, 2 | Hemisphere 0.8 | two rims, both sides, 2 to 4 | flat colour, seamless floor |

Key to fill about 3:1. The rim should draw a bright edge on the subject's silhouette; if you can't
see that edge, move the rim further behind.

## Shadows

- Only the key casts shadows. `light.shadow.mapSize.set(2048, 2048)`, `light.shadow.radius = 6`,
  `light.shadow.bias = -0.0005`, and a tight `shadow.camera` box around the action.
- Every object casts and the floor receives. Something floating gets a soft dark disc under it
  that shrinks and fades as it rises: that is how a viewer reads height.

## Materials

| Look | Material | Settings |
|---|---|---|
| Clay, toy, matte plastic | Standard | roughness 0.55 to 0.75, metalness 0 |
| Glossy plastic, ceramic | Physical | roughness 0.25, clearcoat 1, clearcoatRoughness 0.2 |
| Metal | Standard | metalness 1, roughness 0.25 to 0.4, needs the environment |
| Glass | Physical | transmission 1, thickness 0.5, roughness 0.05, ior 1.45 |
| Glow (a screen, a bulb) | Standard | emissive in the accent colour, emissiveIntensity 1.5 to 3 |

Use `RoundedBoxGeometry` instead of `BoxGeometry`: sharp edges never catch light and look fake.
Bevels, rounded edges and slightly imperfect proportions read as made by hand.

## Colour

Palette of three: background tone (60 percent of the frame), hero (30), accent (10, used once,
on the thing that matters). Pick colours with some grey in them; ACES makes pure colours glow.
Background and fog share one colour.
