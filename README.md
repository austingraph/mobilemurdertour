# The Midnight Assassin: Austin 1885 — Mobile Walking Tour

A spooky, GPS-guided walking tour of the sites of Austin's unsolved 1884–85
"Servant Girl" murders, as chronicled in Skip Hollandsworth's *The Midnight
Assassin*. React Native (Expo) + MapLibre + Supabase + GitHub Pages —
everything free and open source, built on Windows, no Mac required.

> Historical note: the murders ran **Dec 30, 1884 → Dec 24, 1885** (not 1890).
> All app content uses the correct dates.

## What the app does

- **Dark MapLibre map** of downtown Austin with a dashed route through nine
  stops and a guidance card: "NEXT · STOP 3 OF 9 — Head northeast · 260 m · ~4 min".
- **Geofences** (plain TypeScript, 40 m enter / 65 m exit hysteresis) unlock
  each stop's story automatically when you physically arrive.
- **Stories** for every stop are written and bundled, with over-the-air
  updates from `web/content/tour.json` on GitHub Pages — edit content without
  rebuilding the app.
- **Videos** stream per-stop from GitHub Pages (expo-video).
- **AR, two tiers**: a camera "apparition" overlay that works on any phone,
  and a `<model-viewer>` WebXR page for true place-in-the-world AR at the
  moonlight-tower finale.
- **Supabase (optional)**: anonymous visit logging + field feedback; the app
  is fully functional offline without it.

## Start here

| You want to… | Read |
| --- | --- |
| See the whole plan, architecture, and roadmap | [`docs/PLAN.md`](docs/PLAN.md) |
| Set up your Windows PC and run the app | [`docs/WINDOWS_SETUP.md`](docs/WINDOWS_SETUP.md) |
| Write/produce content; understand the user flow | [`docs/CONTENT.md`](docs/CONTENT.md) |
| Understand the AR options | [`docs/AR.md`](docs/AR.md) |
| Turn on the Supabase backend | [`docs/SUPABASE.md`](docs/SUPABASE.md) |
| Publish media & live content | [`docs/GITHUB_PAGES.md`](docs/GITHUB_PAGES.md) |

### 60-second version (after the one-time setup in WINDOWS_SETUP.md)

```powershell
git clone https://github.com/austingraph/mobilemurdertour.git
cd mobilemurdertour
npm install
npx expo run:android      # phone on USB, or an Android Studio emulator
```

Tap any numbered marker to preview a stop from the couch; walk the route (or
fake GPS in the emulator) to trigger the geofences for real.

## Repo layout

```
App.tsx, index.ts          app entry + navigation
src/
  config.ts                map style, Pages URL, Supabase env, geofence radii
  data/tour.ts             ★ the nine stops: coordinates + stories (source of truth)
  hooks/useTourLocation.ts location watcher + JS geofencing
  lib/                     geo math, storage, supabase, OTA content
  screens/                 Home, Map, StopDetail, AR, About
assets/ghost.png           procedural apparition overlay (scripts/generate-ghost.js)
web/                       GitHub Pages site: tour.json, media/, AR pages
supabase/schema.sql        visits + feedback tables, insert-only RLS
docs/                      the full plan and step-by-step guides
scripts/                   export-tour.js (tour.ts → tour.json), generate-ghost.js
```

## The stops

1. The Avenue (6th & Congress) — introduction
2. Mollie Smith — 901 W Pecan St, Dec 30 1884
3. Eliza Shelley — May 7 1885
4. Irene Cross — May 23 1885
5. Mary Ramey — Aug 30 1885
6. Gracie Vance & Orange Washington — Sep 28 1885 *(optional side trip)*
7. Susan Hancock — Dec 24 1885
8. Eula Phillips — Dec 24 1885
9. Epilogue: a surviving 1895 Moonlight Tower

⚠️ **Coordinates are approximate** — streets were renamed in 1886 and the
original buildings are gone. Walk the route and refine them in
`src/data/tour.ts` (then `node scripts/export-tour.js`).

## Remembrance

Mollie Smith · Eliza Shelley · Irene Cross · Mary Ramey · Gracie Vance ·
Orange Washington · Susan Hancock · Eula Phillips.

Most of the victims were Black women whose lives went largely unrecorded.
This tour exists to remember them, not the man who killed them.
