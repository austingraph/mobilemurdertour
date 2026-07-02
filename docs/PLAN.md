# Master Plan — The Midnight Assassin Walking Tour App

A spooky, GPS-guided walking tour of the sites of Austin's 1884–85 "Servant
Girl" murders (the case chronicled in Skip Hollandsworth's *The Midnight
Assassin*). One historical note up front: the murders ran **December 1884 to
Christmas Eve 1885**, not 1890 — the app and content use the correct dates.

## Goals and constraints

- **Free, end to end.** Every tool and service below has a $0 tier and the
  stack never requires a paid SDK: React Native + Expo (MIT), MapLibre (BSD),
  free vector tiles (CARTO/OpenFreeMap, attribution only), Supabase free tier,
  GitHub Pages for media hosting. The only unavoidable cost is the **one-time
  $25 Google Play registration** *if* you ever publish to the Play Store —
  installing on your own phone via USB is free forever.
- **Windows-only development for now.** Everything targets Android built
  locally with Android Studio's free toolchain. The project stays 100 %
  iOS-compatible (Expo + all chosen libraries support iOS), so when you get
  Mac/Xcode access later it's `npx expo run:ios`, not a rewrite.
- **Lightweight, no proprietary plugins.** Geofencing is ~60 lines of plain
  TypeScript (distance checks on the location stream), AR is a camera overlay
  plus an optional open-source `<model-viewer>` page, and navigation guidance
  is bearing/distance math — no paid SDKs, no closed services.

## Why React Native + Expo (your presumption was right)

React Native is the right call: you get one TypeScript codebase for Android
now and iOS later, and MapLibre/Supabase both have first-class RN support.
Within RN, this project uses **Expo** (also free/open source) rather than the
bare CLI because it removes the sharpest edges for a first-time RN developer:
permissions config, native project generation, location/camera/video modules
that just work. We do **not** use Expo's paid cloud build service (EAS) —
builds run locally on your PC with Android Studio.

## Architecture

```
┌─────────────────────────────── Phone (Expo app) ───────────────────────────┐
│  React Native + TypeScript                                                 │
│  ├─ MapLibre React Native ──► free vector tiles (CARTO dark style)         │
│  ├─ expo-location ──► JS geofencing (enter 40 m / exit 65 m hysteresis)    │
│  ├─ expo-video ──► streams MP4s from GitHub Pages                          │
│  ├─ expo-camera ──► "apparition" AR overlay (translucent ghost composite)  │
│  ├─ react-native-webview ──► <model-viewer> AR page (optional, per stop)   │
│  └─ @supabase/supabase-js ──► optional visit logging + feedback            │
├────────────────────────────── GitHub Pages (web/) ─────────────────────────┤
│  content/tour.json   ← over-the-air story/coordinate updates, no rebuild   │
│  media/*.mp4         ← stop videos (720p H.264, <25 MB each)               │
│  ar/*.html + *.glb   ← model-viewer AR experiences                         │
├────────────────────────────────── Supabase ────────────────────────────────┤
│  visits, feedback tables (insert-only via RLS) — strictly optional         │
└─────────────────────────────────────────────────────────────────────────────┘
```

Key design decisions:

1. **JS geofencing instead of native/background geofences.** A walking tour
   has the app open in hand, so foreground `watchPositionAsync` + a haversine
   distance check per fix is all you need. This avoids Android background
   location permissions (a Play Store review headache), works identically on
   iOS later, and is trivially debuggable. Hysteresis (enter at 40 m, exit at
   65 m) prevents GPS jitter from re-firing a fence. See
   `src/hooks/useTourLocation.ts`.
2. **Media on GitHub Pages, not in the APK.** Keeps the app under ~40 MB,
   and you can re-edit videos without shipping an update. The app also pulls
   `content/tour.json` at launch, so story text and coordinate fixes are a
   `git push`, not a release (see `src/lib/remoteContent.ts`).
3. **Supabase is optional by construction.** `src/lib/supabase.ts` returns a
   null client when env vars are unset; every call no-ops. The tour must
   never break because a database is down or the phone is offline.
4. **Two AR tiers** (details in `docs/AR.md`): a camera-overlay "apparition"
   that works on *every* phone, and a WebView `<model-viewer>` page that
   gives true place-in-the-world AR on ARCore-capable Androids and degrades
   gracefully elsewhere.

## What's already built (this repo)

- Complete Expo SDK 57 + TypeScript app: home → map → stop detail → AR flow
- All nine tour stops written (`src/data/tour.ts`) with stories, dates, and
  approximate coordinates — **verify coordinates on the ground**
- MapLibre dark map with route line, numbered markers, user puck, and a
  guidance card (next stop, compass direction, distance, walking time)
- Geofence hook with enter/exit hysteresis; arrival card → story unlock;
  progress persisted on-device; optional Supabase visit logging
- Ghost-overlay AR screen + WebXR page for the moonlight tower
- GitHub Pages site (`web/`) with landing page, tour.json, AR page, and a
  deploy workflow (`.github/workflows/pages.yml`)
- Supabase schema with insert-only RLS (`supabase/schema.sql`)

## Phased roadmap

### Phase 0 — Tooling on your PC (~1–2 h, one time)
Follow `docs/WINDOWS_SETUP.md`: Node LTS, Android Studio + SDK, JDK 17, a
device or emulator, then `npm install` and `npx expo run:android`.
**Milestone: the app runs on your phone.**

### Phase 1 — Walk the route (1 evening + 1 daytime walk)
1. Run the app, tap through every stop from the couch (markers open stories
   without GPS — that's the built-in simulator).
2. Walk downtown with the app and a printout of `src/data/tour.ts`; stand at
   each site and note corrected lat/lng (long-press in Google Maps or
   maps.openfreemap.org to read coordinates).
3. Fix coordinates in `tour.ts`, run `node scripts/export-tour.js`, push.
**Milestone: geofences fire at the right street corners.**

### Phase 2 — Publish the content pipeline (~1 h)
1. Push to `main`, enable GitHub Pages (Settings → Pages → Source: GitHub
   Actions). The included workflow deploys `web/` automatically.
2. Set `PAGES_BASE_URL` in `src/config.ts` to your Pages URL.
3. Confirm the app now shows "updated" content when you edit
   `web/content/tour.json` alone.
**Milestone: story edits go live without rebuilding the app.**

### Phase 3 — Media (ongoing, the fun part)
Record narration/video per stop (phone camera is fine — vertical, at night,
handheld lantern optional but excellent), encode with the free ffmpeg recipe
in `web/media/README.md`, drop into `web/media/`, push. Content and script
suggestions per stop are in `docs/CONTENT.md`.
**Milestone: every main stop has a 45–90 s film.**

### Phase 4 — Supabase (optional, ~30 min)
Create a free project, run `supabase/schema.sql`, put the URL + anon key in
`.env`, rebuild. You now see how far walkers get (`stop_funnel` view) and
receive corrections/feedback. Details: `docs/SUPABASE.md`.

### Phase 5 — AR upgrades (optional)
Better ghost art for the overlay (any translucent PNG replaces
`assets/ghost.png`), and a `moonlight-tower.glb` model for true AR at the
finale. Details and free-asset workflow: `docs/AR.md`.

### Phase 6 — Distribution
- **Free:** build a release APK (`docs/WINDOWS_SETUP.md` §7) and share the
  file directly (email/Drive); Android installs it after one settings toggle.
- **$25 once, optional:** Google Play closed testing → production.
- **Later, with a Mac:** `npx expo run:ios`; same codebase. Apple's $99/yr
  developer fee only applies when you distribute through the App Store.

## Risks / gotchas to know about

- **GPS in downtown canyons** drifts 10–30 m near tall buildings. The 40 m
  radius absorbs most of it; if a fence misfires during your test walk,
  raise that stop's `radiusM` in `tour.ts` rather than the global default.
- **Battery:** continuous GPS + screen-on navigation uses ~15–25 %/hour.
  The About screen should eventually suggest a charged phone; fine for a
  90-minute tour.
- **Coordinates are approximate** until you walk them (street renames in
  1886, buildings gone). Marked prominently in `tour.ts`.
- **model-viewer AR** needs Google Play Services for AR on the device;
  the page silently falls back to 3D orbit view without it. The ghost
  overlay never needs it — that's why it's the default AR mode.
- **Windows path length**: keep the repo near the drive root (e.g.
  `C:\dev\mobilemurdertour`) — Android builds can hit the 260-char limit.
