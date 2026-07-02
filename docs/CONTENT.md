# Content & User-Flow Guide

## The user flow

```
Launch
  └─ HOME — title card, content warning/etiquette, "Begin the tour"
       └─ MAP — dark MapLibre map, dashed blood-red route, numbered stops
            │     bottom card: "NEXT · STOP 3 OF 9 — Head northeast · 260 m · ~4 min"
            │
            ├─ walk… GEOFENCE ENTER (40 m) ──► arrival card slides up:
            │        "YOU HAVE ARRIVED — A Mother of Three"
            │        [Hear the story]  [Later]
            │              └─ STOP DETAIL — story text, victim, then/now address,
            │                 streamed video, "Summon the apparition" (AR)
            │                        └─ AR — camera + ghost overlay, or
            │                           model-viewer WebXR page (tower)
            │
            ├─ tap any marker anytime ──► STOP DETAIL as a preview (no GPS needed;
            │                             this doubles as the couch/demo mode)
            └─ all stops visited ──► completion card: the eight names
```

Design intents worth keeping as you iterate:

- **Never hard-gate content.** GPS fails, people tour from wheelchairs, some
  users read along from home. Geofences make arrival *feel* special (auto
  unlock + card), but tapping a marker always works.
- **One glance = one decision.** The map's bottom card answers exactly one
  question — "which way and how far?" — with compass words ("head
  northwest"), not degrees.
- **Progress is a set of visited stops**, persisted on-device. "Start over"
  on the Home screen resets it.
- **The optional stop** (Gracie Vance, ~1.6 km north of downtown) is marked
  `optional: true`: drawn on the map but skipped by the route line and the
  "next stop" logic. Pattern to reuse for future side trips.

## Tone

The facts are horrifying enough; the app's spookiness should come from
darkness, place, and restraint, not gore. Recommended register: a quiet,
close-to-the-mic narrator, present tense for the walk ("Look west — in 1884
this was the edge of town"), past tense for the history. Always name the
victims; never dwell admiringly on the killer. The murdered were mostly Black
women erased twice — once by the axe, once by the archive — and the tour's
closing beat (saying the eight names under the moonlight tower) is the
emotional payoff of the whole hour.

## Stop-by-stop content suggestions

Stories for all nine stops are already written in `src/data/tour.ts` (also
served OTA from `web/content/tour.json`). Per-stop media worth producing:

| # | Stop | Video idea (45–90 s) | AR |
|---|------|----------------------|----|
| 1 | The Avenue | Narrated intro over 1880s photos of Congress Ave (Austin History Center has scans; check reuse terms) crossfading to your night footage of the same view | — |
| 2 | Mollie Smith | Slow dolly toward a dark yard; narrator reads the Statesman's first, dismissive paragraphs | ghost |
| 3 | Eliza Shelley | Focus on the three children who woke to a stranger; a candle-lit interior recreation is cheap and effective | ghost |
| 4 | Irene Cross | No video — text-only stop lands harder after two videos (pacing) | ghost |
| 5 | Mary Ramey | Keep it austere: black screen, narrator, one period photograph. Do not dramatize a child's death | — |
| 6 | Gracie Vance (optional) | The "fortified cabin" details: bars, dogs, shotguns — and why none of it worked | ghost |
| 7 | Susan Hancock | The Christmas Eve tension flip: the city that ignored eleven months of murders panics in one night | — |
| 8 | Eula Phillips | The trials, the scandal, the collapse of every prosecution — courtroom sketch style | ghost |
| 9 | Moonlight Tower | Finale: real footage of the tower's violet glow tonight + the names read aloud | model-viewer (tower .glb) |

Production notes:

- **Audio first.** Record narration on your phone in a closet (free, sounds
  professional); Audacity (free) for cleanup. A tour succeeds on narration
  alone; video is a bonus.
- Film vertical 9:16 at night with a handheld light source; shaky is
  atmospheric here.
- Encoding recipe and file-size rules: `web/media/README.md`.
- Historical images: Austin History Center (AF-P collections) and the Portal
  to Texas History have period photos of the Avenue and moonlight towers —
  verify each item's rights statement before publishing.

## Fact-checking & sensitivity checklist (before you publish)

- [ ] Walk the route; correct every coordinate in `tour.ts` (then run
      `node scripts/export-tour.js`)
- [ ] Cross-check names/dates against Hollandsworth's book — the app text is
      faithful to the standard account, but you own the published version
- [ ] All stops are on public sidewalk, not pointing users into private
      property or businesses
- [ ] Content warning is visible before the tour starts (Home screen card)
- [ ] The victims' names appear more prominently than any theory about the
      killer
