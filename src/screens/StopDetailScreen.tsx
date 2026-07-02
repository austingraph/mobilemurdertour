import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useVideoPlayer, VideoView } from "expo-video";
import { useMemo } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

import { PAGES_BASE_URL } from "../config";
import { stopById } from "../data/tour";
import type { RootStackParamList } from "../navigation";
import { colors, fonts, spacing } from "../theme";

type Props = NativeStackScreenProps<RootStackParamList, "Stop">;

export function StopDetailScreen({ navigation, route }: Props) {
  const { stopId, arrived } = route.params;
  const stop = stopById(stopId);

  const videoUrl = stop?.video ? `${PAGES_BASE_URL}/media/${stop.video}` : null;
  const player = useVideoPlayer(videoUrl, (p) => {
    p.loop = false;
  });

  const paragraphs = useMemo(
    () => (stop ? stop.story.split("\n\n") : []),
    [stop],
  );

  if (!stop) {
    return (
      <View style={styles.root}>
        <Text style={styles.body}>Unknown stop.</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.root} contentContainerStyle={styles.content}>
      <Text style={styles.kicker}>
        {arrived ? "YOU ARE HERE" : `STOP ${stop.order}`}
        {stop.date ? ` · ${stop.date.toUpperCase()}` : ""}
      </Text>
      <Text style={styles.title}>{stop.title}</Text>
      {stop.victim && <Text style={styles.victim}>{stop.victim}</Text>}
      <Text style={styles.address}>
        {stop.addressThen ? `Then: ${stop.addressThen}\n` : ""}
        Now: {stop.addressNow}
      </Text>

      {videoUrl && (
        <View style={styles.videoWrap}>
          <VideoView
            player={player}
            style={styles.video}
            nativeControls
            fullscreenOptions={{ enable: true }}
            contentFit="contain"
          />
          <Text style={styles.videoHint}>
            Short film for this site (streams from the tour server).
          </Text>
        </View>
      )}

      {paragraphs.map((p, i) => (
        <Text key={i} style={styles.body}>
          {p}
        </Text>
      ))}

      {stop.ar && (
        <Pressable
          style={styles.arBtn}
          onPress={() => navigation.navigate("AR", { stopId: stop.id })}
        >
          <Text style={styles.arBtnText}>
            {stop.ar === "ghost"
              ? "🕯  Summon the apparition (camera view)"
              : "🗼  View in augmented reality"}
          </Text>
        </Pressable>
      )}

      <Pressable style={styles.backBtn} onPress={() => navigation.goBack()}>
        <Text style={styles.backBtnText}>Back to the map</Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing(3), paddingBottom: spacing(6) },
  kicker: {
    color: colors.accent,
    fontSize: 11,
    letterSpacing: 3,
    marginBottom: spacing(1),
  },
  title: {
    color: colors.text,
    fontFamily: fonts.display,
    fontSize: 30,
    lineHeight: 36,
  },
  victim: {
    color: colors.bloodBright,
    fontFamily: fonts.display,
    fontSize: 18,
    marginTop: spacing(0.5),
  },
  address: {
    color: colors.textDim,
    fontSize: 13,
    lineHeight: 20,
    marginTop: spacing(1),
    marginBottom: spacing(2),
  },
  videoWrap: { marginBottom: spacing(2) },
  video: {
    width: "100%",
    aspectRatio: 16 / 9,
    borderRadius: 12,
    backgroundColor: colors.surface,
  },
  videoHint: { color: colors.textDim, fontSize: 12, marginTop: spacing(0.5) },
  body: {
    color: colors.text,
    fontSize: 16,
    lineHeight: 26,
    marginBottom: spacing(2),
  },
  arBtn: {
    backgroundColor: colors.surfaceRaised,
    borderColor: colors.accent,
    borderWidth: 1,
    borderRadius: 12,
    padding: spacing(2),
    alignItems: "center",
    marginTop: spacing(1),
  },
  arBtnText: { color: colors.accent, fontSize: 16 },
  backBtn: {
    padding: spacing(2),
    alignItems: "center",
    marginTop: spacing(1),
  },
  backBtnText: { color: colors.textDim, fontSize: 15 },
});
