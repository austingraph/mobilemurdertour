import * as Location from "expo-location";
import { useEffect, useRef, useState } from "react";

import {
  GEOFENCE_ENTER_RADIUS_M,
  GEOFENCE_EXIT_RADIUS_M,
  LOCATION_DISTANCE_INTERVAL_M,
  LOCATION_TIME_INTERVAL_MS,
} from "../config";
import type { TourStop } from "../data/tour";
import { distanceMeters, type LngLat } from "../lib/geo";

export interface StopProximity {
  stop: TourStop;
  distanceM: number;
}

export interface TourLocationState {
  /** null until the first fix arrives. */
  position: LngLat | null;
  headingDeg: number | null;
  permission: "unknown" | "granted" | "denied";
  /** All stops sorted nearest-first (empty until first fix). */
  proximities: StopProximity[];
  /** Stop whose ENTER radius currently contains the user, if any. */
  insideStop: TourStop | null;
}

/**
 * Foreground location watcher + JS geofencing.
 *
 * Why not native/background geofences? A walking tour has the app open in the
 * hand the whole time, so a simple distance check on each position update is
 * enough — no background-location permission dance, no extra native module,
 * works identically on Android and iOS. Hysteresis (enter at 40 m, exit at
 * 65 m) stops GPS jitter from re-triggering the same stop over and over.
 *
 * `onEnter` fires once each time the user walks into a stop's radius.
 */
export function useTourLocation(
  stops: TourStop[],
  onEnter?: (stop: TourStop) => void,
): TourLocationState {
  const [state, setState] = useState<TourLocationState>({
    position: null,
    headingDeg: null,
    permission: "unknown",
    proximities: [],
    insideStop: null,
  });

  // Refs so the watcher callback always sees current values without resubscribing.
  const insideIdsRef = useRef<Set<string>>(new Set());
  const onEnterRef = useRef(onEnter);
  onEnterRef.current = onEnter;
  const stopsRef = useRef(stops);
  stopsRef.current = stops;

  useEffect(() => {
    let cancelled = false;
    let sub: Location.LocationSubscription | null = null;

    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (cancelled) return;
      if (status !== Location.PermissionStatus.GRANTED) {
        setState((s) => ({ ...s, permission: "denied" }));
        return;
      }
      setState((s) => ({ ...s, permission: "granted" }));

      sub = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.BestForNavigation,
          timeInterval: LOCATION_TIME_INTERVAL_MS,
          distanceInterval: LOCATION_DISTANCE_INTERVAL_M,
        },
        (loc) => {
          const here: LngLat = [loc.coords.longitude, loc.coords.latitude];

          const proximities = stopsRef.current
            .map((stop) => ({
              stop,
              distanceM: distanceMeters(here, stop.coordinate),
            }))
            .sort((a, b) => a.distanceM - b.distanceM);

          const inside = insideIdsRef.current;
          let insideStop: TourStop | null = null;
          for (const { stop, distanceM } of proximities) {
            const enterR = stop.radiusM ?? GEOFENCE_ENTER_RADIUS_M;
            const exitR = Math.max(enterR + 15, GEOFENCE_EXIT_RADIUS_M);
            if (inside.has(stop.id)) {
              if (distanceM > exitR) inside.delete(stop.id);
              else insideStop = insideStop ?? stop;
            } else if (distanceM <= enterR) {
              inside.add(stop.id);
              insideStop = insideStop ?? stop;
              onEnterRef.current?.(stop);
            }
          }

          setState({
            position: here,
            headingDeg: loc.coords.heading ?? null,
            permission: "granted",
            proximities,
            insideStop,
          });
        },
      );
    })();

    return () => {
      cancelled = true;
      sub?.remove();
    };
  }, []);

  return state;
}
