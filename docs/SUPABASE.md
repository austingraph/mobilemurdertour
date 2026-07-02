# Supabase setup (optional, ~30 minutes)

The app is deliberately usable with **zero** backend: without configuration,
`src/lib/supabase.ts` exports a null client and every sync call no-ops. Add
Supabase when you want to know how walkers actually use the tour and to
collect corrections/feedback from the field.

## 1. Create the project

1. <https://supabase.com> → sign in with GitHub → **New project** (free tier).
2. Name it `mobilemurdertour`, pick the closest region (US Central for
   Austin), generate a database password (you rarely need it again).

## 2. Create the tables

Dashboard → **SQL Editor** → New query → paste the contents of
`supabase/schema.sql` → **Run**. That creates:

- `visits` — one row each time a device enters a stop's geofence
- `feedback` — free-text reports from the About screen
- `stop_funnel` — a view answering "how far into the tour do people get?"

Both tables have Row Level Security allowing anonymous **insert only** — a
stranger with your anon key (it ships inside the APK, that's normal) can add
rows but never read, edit, or delete anything.

## 3. Wire the app

Dashboard → **Settings → API**: copy the *Project URL* and the *anon public*
key, then in the repo root:

```powershell
copy .env.example .env
# edit .env:
#   EXPO_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
#   EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOi...
npx expo run:android
```

`.env` is gitignored; `EXPO_PUBLIC_*` vars are compiled into the JS bundle at
build time (hence: only ever the anon key here, never the service key).

## 4. Look at the data

- SQL Editor: `select * from stop_funnel;`
- Table editor → `feedback` for corrections people send from the street.

## Ideas for later (all free-tier friendly)

- **Content in the database**: move stops into a `stops` table with a
  public-read RLS policy and have `remoteContent.ts` read from Supabase
  instead of tour.json — worth it only if a non-technical person will edit
  content.
- **Guest book**: per-stop public notes ("candle left for Mary, 12/24") —
  add a `notes` table with public read + insert, surface in StopDetail.
- **Photo drops**: Supabase Storage bucket for user photos at stops
  (moderate before display!).
- **Edge Function** to send you an email when feedback arrives.
