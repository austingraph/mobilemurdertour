import {
  Camera,
  type CameraRef,
  Layer,
  GeoJSONSource,
  Map as MapLibreMap,
  UserLocation,
  ViewAnnotation,
} from "@maplibre/maplibre-react-native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { MAP_STYLE_URL } from "../config";
import { routeGeoJSON, TOUR_STOPS, type TourStop } from "../data/tour";
import { useTourLocation } from "../hooks/useTourLocation";
import {
  bearingDegrees,
  compassLabel,
  formatDistance,
  walkingMinutes,
} from "../lib/geo";
import { getVisited, markVisited } from "../lib/storage";
import { logVisit } from "../lib/supabase";
import type { RootStackParamList } from "../navigation";
import { colors, fonts, spacing } from "../theme";

type Props = NativeStackScreenProps<RootStackParamList, "Map">;

const TOUR_CENTER: [number, number] = [-97.7427, 30.2685];

export function MapScreen({ navigation }: Props) {
  const cameraRef = useRef<CameraRef>(null);
  const [visited, setVisited] = useState<Set<string>>(new Set());
  const [arrivedStop, setArrivedStop] = useState<TourStop | null>(null);

  useEffect(() => {
    const unsub = navigation.addListener("focus", () => {
      getVisited().then(setVisited);
    });
    return unsub;
  }, [navigation]);

  const onEnter = useCallback((stop: TourStop) => {
    setArrivedStop(stop);
    markVisited(stop.id).then(setVisited);
    logVisit(stop.id);
  }, []);

  const { position, permission, proximities } = useTourLocation(
    TOUR_STOPS,
    onEnter,
  );

  /** Next unvisited stop on the main route, in order. */
  const nextStop = useMemo(
    () =>
      TOUR_STOPS.filter((s) => !s.optional && !visited.has(s.id)).sort(
        (a, b) => a.order - b.order,
      )[0] ?? null,
    [visited],
  );

  const nextInfo = useMemo(() => {
    if (!nextStop || !position) return null;
    const d = proximities.find((p) => p.stop.id === nextStop.id)?.distanceM;
    if (d == null) return null;
    return {
      distance: formatDistance(d),
      minutes: walkingMinutes(d),
      direction: compassLabel(bearingDegrees(position, nextStop.coordinate)),
    };
  }, [nextStop, position, proximities]);

  const route = useMemo(() => routeGeoJSON(), []);

  return (
    <View style={styles.root}>
      <MapLibreMap
        style={styles.map}
        mapStyle={MAP_STYLE_URL}
        attribution
        attributionPosition={{ top: 8, right: 8 }}
        logo={false}
        compass
      >
        <Camera
          ref={cameraRef}
          initialViewState={{ center: TOUR_CENTER, zoom: 14 }}
        />

        <GeoJSONSource id="route" data={route} lineMetrics>
          <Layer
            id="route-line"
            type="line"
            style={{
              lineColor: colors.blood,
              lineWidth: 3,
              lineDasharray: [1.5, 2],
              lineOpacity: 0.85,
            }}
          />
        </GeoJSONSource>

        {TOUR_STOPS.map((stop) => {
          const isVisited = visited.has(stop.id);
          const isNext = nextStop?.id === stop.id;
          return (
            <ViewAnnotation
              key={stop.id}
              id={`stop-${stop.id}`}
              lngLat={stop.coordinate}
              anchor="center"
              onPress={() =>
                navigation.navigate("Stop", { stopId: stop.id })
              }
            >
              <View
                style={[
                  styles.marker,
                  isVisited && styles.markerVisited,
                  isNext && styles.markerNext,
                ]}
              >
                <Text style={styles.markerText}>{stop.order}</Text>
              </View>
            </ViewAnnotation>
          );
        })}

        <UserLocation heading accuracy />
      </MapLibreMap>

      {permission === "denied" && (
        <View style={styles.banner}>
          <Text style={styles.bannerText}>
            Location is off — you can still tap any numbered site to read its
            story. Enable location in Settings for guided mode.
          </Text>
        </View>
      )}

      {arrivedStop && (
        <View style={styles.arrivalCard}>
          <Text style={styles.arrivalKicker}>YOU HAVE ARRIVED</Text>
          <Text style={styles.arrivalTitle}>{arrivedStop.title}</Text>
          <Text style={styles.arrivalTeaser}>{arrivedStop.teaser}</Text>
          <View style={styles.row}>
            <Pressable
              style={styles.primaryBtn}
              onPress={() => {
                const id = arrivedStop.id;
                setArrivedStop(null);
                navigation.navigate("Stop", { stopId: id, arrived: true });
              }}
            >
              <Text style={styles.primaryBtnText}>Hear the story</Text>
            </Pressable>
            <Pressable
              style={styles.dismissBtn}
              onPress={() => setArrivedStop(null)}
            >
              <Text style={styles.dismissText}>Later</Text>
            </Pressable>
          </View>
        </View>
      )}

      {!arrivedStop && nextStop && (
        <View style={styles.guideCard}>
          <Text style={styles.guideKicker}>
            NEXT · STOP {nextStop.order} OF {TOUR_STOPS.length}
          </Text>
          <Text style={styles.guideTitle}>{nextStop.title}</Text>
          <Text style={styles.guideText}>
            {nextInfo
              ? `Head ${nextInfo.direction} · ${nextInfo.distance} · ~${nextInfo.minutes} min walk`
              : "Waiting for GPS…"}
          </Text>
          <View style={styles.row}>
            <Pressable
              style={styles.smallBtn}
              onPress={() =>
                cameraRef.current?.flyTo({
                  center: nextStop.coordinate,
                  zoom: 16,
                  duration: 1200,
                })
              }
            >
              <Text style={styles.smallBtnText}>Show on map</Text>
            </Pressable>
            {position && (
              <Pressable
                style={styles.smallBtn}
                onPress={() =>
                  cameraRef.current?.flyTo({
                    center: position,
                    zoom: 16,
                    duration: 800,
                  })
                }
              >
                <Text style={styles.smallBtnText}>Recenter on me</Text>
              </Pressable>
            )}
          </View>
        </View>
      )}

      {!arrivedStop && !nextStop && (
        <View style={styles.guideCard}>
          <Text style={styles.guideTitle}>The tour is complete.</Text>
          <Text style={styles.guideText}>
            Eight names, one unsolved year. Walk home in the light.
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
  map: { flex: 1 },
  marker: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: colors.surfaceRaised,
    borderColor: colors.blood,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
  },
  markerVisited: { borderColor: colors.accent, opacity: 0.85 },
  markerNext: { backgroundColor: colors.blood, borderColor: colors.text },
  markerText: { color: colors.text, fontWeight: "700", fontSize: 14 },
  banner: {
    position: "absolute",
    top: spacing(2),
    left: spacing(2),
    right: spacing(2),
    backgroundColor: colors.surface,
    borderRadius: 10,
    padding: spacing(1.5),
    borderColor: colors.border,
    borderWidth: 1,
  },
  bannerText: { color: colors.textDim, fontSize: 13, lineHeight: 18 },
  guideCard: {
    position: "absolute",
    bottom: spacing(3),
    left: spacing(2),
    right: spacing(2),
    backgroundColor: colors.surface,
    borderRadius: 14,
    padding: spacing(2),
    borderColor: colors.border,
    borderWidth: 1,
  },
  guideKicker: { color: colors.accent, fontSize: 11, letterSpacing: 2 },
  guideTitle: {
    color: colors.text,
    fontFamily: fonts.display,
    fontSize: 20,
    marginTop: 2,
  },
  guideText: { color: colors.textDim, fontSize: 14, marginTop: 4 },
  arrivalCard: {
    position: "absolute",
    bottom: spacing(3),
    left: spacing(2),
    right: spacing(2),
    backgroundColor: colors.surfaceRaised,
    borderRadius: 14,
    padding: spacing(2),
    borderColor: colors.accent,
    borderWidth: 1,
  },
  arrivalKicker: { color: colors.accent, fontSize: 11, letterSpacing: 3 },
  arrivalTitle: {
    color: colors.text,
    fontFamily: fonts.display,
    fontSize: 22,
    marginTop: 2,
  },
  arrivalTeaser: { color: colors.textDim, fontSize: 14, marginTop: 4 },
  row: { flexDirection: "row", gap: spacing(1), marginTop: spacing(1.5) },
  primaryBtn: {
    backgroundColor: colors.blood,
    borderRadius: 10,
    paddingVertical: spacing(1.25),
    paddingHorizontal: spacing(2),
  },
  primaryBtnText: { color: colors.text, fontWeight: "600", fontSize: 15 },
  dismissBtn: {
    paddingVertical: spacing(1.25),
    paddingHorizontal: spacing(2),
  },
  dismissText: { color: colors.textDim, fontSize: 15 },
  smallBtn: {
    backgroundColor: colors.surfaceRaised,
    borderRadius: 8,
    paddingVertical: spacing(1),
    paddingHorizontal: spacing(1.5),
    borderColor: colors.border,
    borderWidth: 1,
  },
  smallBtnText: { color: colors.text, fontSize: 13 },
});
