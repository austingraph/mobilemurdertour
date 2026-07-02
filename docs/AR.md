# AR without paid SDKs

Two tiers, both already wired into the app, both free and open source. A stop
opts in via its `ar` field in `src/data/tour.ts`:

```ts
ar: "ghost"                                  // tier 1 — camera overlay
ar: "webxr", arPage: "ar/moonlight-tower.html"  // tier 2 — model-viewer page
```

## Tier 1 — the "apparition" camera overlay (`ghost`)

`src/screens/ARScreen.tsx` opens the camera (expo-camera) and composites a
translucent, slowly-breathing spectral figure over the feed, with the stop's
caption below. No ARCore, no motion tracking — which means it works on
**every** phone, in the dark, instantly. For a night-time ghost tour this
"haunted viewfinder" is honestly more reliable *and* more atmospheric than
real AR, which struggles without daylight texture for tracking.

The artwork is `assets/ghost.png`, generated procedurally by
`node scripts/generate-ghost.js`. Replace it with any translucent PNG
(≈512×768, alpha channel) whenever you have better art — a scanned ink
drawing at 40 % opacity looks fantastic. Ideas per stop: a different figure
silhouette, a floating axe, period newspaper headlines drifting like smoke.

Cheap upgrades, in effort order:

1. Per-stop overlay images: add an `overlay` field to `TourStop` and swap the
   `require` for a lookup.
2. Audio whispers: `expo-audio` playing a quiet loop while the AR view is
   open.
3. A "look around" parallax: shift the ghost's `translateX` with the
   gyroscope via `expo-sensors` (still no AR SDK needed).

## Tier 2 — true AR via `<model-viewer>` (`webxr`)

For stops where placing a 3D object in the world earns its keep (the 165-foot
moonlight tower at the finale), the app opens `react-native-webview` pointed
at a page on your GitHub Pages site — `web/ar/moonlight-tower.html` — built
with Google's Apache-licensed **`<model-viewer>`** web component.

- **Android with Google Play Services for AR** (most modern phones): the
  "Raise the tower here" button launches Scene Viewer and anchors the model
  to the pavement at true scale (`ar-scale="fixed"`).
- **Anything else**: the same page is an interactive 3D orbit view. No crash,
  no error, no SDK.
- **iOS later**: add a `.usdz` next to the `.glb` and Quick Look AR works
  automatically (the page already references it).

### Getting a free tower model

1. **Blender** (free): the tower is geometrically simple — a tapering
   triangular lattice + a lamp crown. A low-poly version is a nice evening
   project; export as `.glb` (File → Export → glTF 2.0).
2. **Sketchfab / Poly Haven**: search "lattice tower" / "transmission tower",
   filter by CC0/CC-BY, download glTF, credit accordingly.
3. Optimize to under ~10 MB (in Blender: decimate modifier; or
   `npx @gltf-transform/cli optimize in.glb out.glb`).
4. Drop it at `web/ar/moonlight-tower.glb`, push, done — the page finds it by
   filename. Until then the page shows setup instructions instead.

## Why not a "real" AR framework?

- **ViroReact / react-native-arcore wrappers**: heavier native deps, spotty
  maintenance, and ARCore tracking needs well-lit, textured scenes — the
  opposite of a night tour.
- **Unity AR Foundation**: free tier exists but it's a second engine, a
  second build system, and Unity's licensing has burned people before —
  against the "no proprietary" constraint.
- **8th Wall / Niantic**: excellent, and priced like it. No.

The two-tier approach gives every user *something* magical and gives capable
devices the full effect, at zero license cost and ~zero maintenance.
