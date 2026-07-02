# GitHub Pages: the tour's free CDN

The `web/` folder is a static site that serves three jobs:

1. **`content/tour.json`** — live tour content. The app fetches it at launch
   and overlays it on the bundled stops (`src/lib/remoteContent.ts`), so
   story edits and coordinate fixes reach phones without an app rebuild.
2. **`media/*.mp4`** — the stop videos, streamed by `expo-video`.
3. **`ar/*.html` + models** — the `<model-viewer>` AR experiences shown in
   the in-app WebView.

Plus a human-readable landing page (`index.html`) listing the route.

## One-time setup

1. Push the repo to GitHub (`main` branch).
2. Repo **Settings → Pages → Build and deployment → Source: GitHub Actions**.
3. Done — `.github/workflows/pages.yml` publishes `web/` on every push to
   `main` that touches it. Your site: `https://<user>.github.io/mobilemurdertour/`.
4. Make sure `PAGES_BASE_URL` in `src/config.ts` matches that URL.

## Editing workflow

```powershell
# change a story or coordinate in src/data/tour.ts, then:
node scripts/export-tour.js     # regenerates web/content/tour.json
git add -A; git commit -m "Fix Eliza Shelley coordinates"; git push
# live in ~1 minute; apps pick it up on next launch
```

(You can also edit `web/content/tour.json` directly for a quick hotfix, but
`tour.ts` is the source of truth — keep them in sync via the script.)

## Limits that matter (and why we're fine)

- Max file size 100 MB; keep videos ≤ 25 MB (recipe in `web/media/README.md`).
- Soft site cap ~1 GB, soft bandwidth ~100 GB/month — dozens of daily walkers
  streaming 7 videos ≈ 2 GB/day worst case. If the tour becomes a hit, move
  `media/` to Cloudflare R2/Pages (free tier, no egress fees) and change
  `PAGES_BASE_URL`; nothing else in the app changes.
- Pages is public. Everything in `web/` is on the open internet — no secrets,
  and only media you have rights to publish.
