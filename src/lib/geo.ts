/** Small geodesy helpers — no dependencies. Coordinates are [lng, lat]. */

export type LngLat = [number, number];

const EARTH_RADIUS_M = 6371008.8;
const toRad = (deg: number) => (deg * Math.PI) / 180;
const toDeg = (rad: number) => (rad * 180) / Math.PI;

/** Great-circle distance in meters between two points. */
export function distanceMeters(a: LngLat, b: LngLat): number {
  const dLat = toRad(b[1] - a[1]);
  const dLng = toRad(b[0] - a[0]);
  const lat1 = toRad(a[1]);
  const lat2 = toRad(b[1]);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
  return 2 * EARTH_RADIUS_M * Math.asin(Math.sqrt(h));
}

/** Initial bearing from `from` to `to`, degrees clockwise from north (0–360). */
export function bearingDegrees(from: LngLat, to: LngLat): number {
  const lat1 = toRad(from[1]);
  const lat2 = toRad(to[1]);
  const dLng = toRad(to[0] - from[0]);
  const y = Math.sin(dLng) * Math.cos(lat2);
  const x =
    Math.cos(lat1) * Math.sin(lat2) -
    Math.sin(lat1) * Math.cos(lat2) * Math.cos(dLng);
  return (toDeg(Math.atan2(y, x)) + 360) % 360;
}

const COMPASS = [
  "north",
  "northeast",
  "east",
  "southeast",
  "south",
  "southwest",
  "west",
  "northwest",
] as const;

/** "northwest", "south", etc. for a bearing. */
export function compassLabel(bearing: number): string {
  return COMPASS[Math.round(((bearing % 360) + 360) % 360 / 45) % 8];
}

/** Human-friendly distance: "85 m" / "1.2 km". */
export function formatDistance(meters: number): string {
  if (meters < 950) return `${Math.round(meters / 5) * 5} m`;
  return `${(meters / 1000).toFixed(1)} km`;
}

/** Rough walking time at 4.5 km/h. */
export function walkingMinutes(meters: number): number {
  return Math.max(1, Math.round(meters / 75));
}
