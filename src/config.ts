/**
 * Central configuration. Everything the app talks to lives here so you can
 * swap tiles, media hosting, or Supabase without touching feature code.
 */

/**
 * MapLibre style URL. CARTO's Dark Matter GL style is free to use with
 * attribution and needs no API key, which suits a night-time murder tour.
 *
 * Alternatives (also free, no key):
 *   https://tiles.openfreemap.org/styles/liberty
 *   https://tiles.openfreemap.org/styles/positron
 * Or self-host your own style.json on GitHub Pages and point here.
 */
export const MAP_STYLE_URL =
  "https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json";

/**
 * Base URL for tour media (videos, images, AR pages) served from GitHub
 * Pages — the `web/` folder of this repo published at:
 *   https://<your-username>.github.io/mobilemurdertour
 */
export const PAGES_BASE_URL = "https://austingraph.github.io/mobilemurdertour";

/** Remote tour content (lets you edit stories without shipping an app update). */
export const REMOTE_TOUR_URL = `${PAGES_BASE_URL}/content/tour.json`;

/**
 * Supabase — optional. The app works fully offline without it; when these are
 * set (via .env or here), visits and feedback sync to your project.
 * Create a .env file with:
 *   EXPO_PUBLIC_SUPABASE_URL=https://xyzcompany.supabase.co
 *   EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJ...
 */
export const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL ?? "";
export const SUPABASE_ANON_KEY =
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ?? "";

/** Geofencing defaults (meters). Exit radius > enter radius avoids GPS jitter. */
export const GEOFENCE_ENTER_RADIUS_M = 40;
export const GEOFENCE_EXIT_RADIUS_M = 65;

/** How often the position watcher reports, at most. */
export const LOCATION_TIME_INTERVAL_MS = 2000;
export const LOCATION_DISTANCE_INTERVAL_M = 3;
