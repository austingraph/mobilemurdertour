import { REMOTE_TOUR_URL } from "../config";
import { TOUR_STOPS, type TourStop } from "../data/tour";

/**
 * Over-the-air content updates without app releases.
 *
 * On launch we fetch web/content/tour.json from GitHub Pages and patch any
 * matching fields onto the bundled stops (matched by id). Editing a story,
 * nudging a coordinate, or pointing at a new video is then just a git push to
 * the Pages branch — no rebuild, no store update. If the device is offline or
 * the file is missing, the bundled content simply stands.
 *
 * Only fields present in the JSON are overridden; new stops in the JSON are
 * appended.
 */
type RemoteStop = Partial<TourStop> & { id: string };

export async function applyRemoteTour(): Promise<void> {
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 4000);
    const res = await fetch(REMOTE_TOUR_URL, { signal: controller.signal });
    clearTimeout(timer);
    if (!res.ok) return;
    const remote = (await res.json()) as { stops?: RemoteStop[] };
    if (!Array.isArray(remote.stops)) return;

    for (const patch of remote.stops) {
      const existing = TOUR_STOPS.find((s) => s.id === patch.id);
      if (existing) {
        Object.assign(existing, patch);
      } else if (
        typeof patch.order === "number" &&
        typeof patch.title === "string" &&
        Array.isArray(patch.coordinate)
      ) {
        TOUR_STOPS.push(patch as TourStop);
      }
    }
    TOUR_STOPS.sort((a, b) => a.order - b.order);
  } catch {
    // Offline or Pages not set up yet — bundled content is fine.
  }
}
