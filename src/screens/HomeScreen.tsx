import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useEffect, useState } from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { TOUR_INTRO, TOUR_STOPS, TOUR_TITLE } from "../data/tour";
import { getVisited, resetVisited } from "../lib/storage";
import type { RootStackParamList } from "../navigation";
import { colors, fonts, spacing } from "../theme";

type Props = NativeStackScreenProps<RootStackParamList, "Home">;

export function HomeScreen({ navigation }: Props) {
  const [visitedCount, setVisitedCount] = useState(0);

  useEffect(() => {
    const unsub = navigation.addListener("focus", () => {
      getVisited().then((v) => setVisitedCount(v.size));
    });
    return unsub;
  }, [navigation]);

  const total = TOUR_STOPS.length;
  const started = visitedCount > 0;

  return (
    <ScrollView style={styles.root} contentContainerStyle={styles.content}>
      <Text style={styles.kicker}>AUSTIN · TEXAS · 1885</Text>
      <Text style={styles.title}>{TOUR_TITLE}</Text>
      <Text style={styles.body}>{TOUR_INTRO}</Text>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Before you walk</Text>
        <Text style={styles.cardBody}>
          • Best after dusk. Bring headphones.{"\n"}
          • Stories unlock automatically as you reach each site.{"\n"}
          • Everything on the route is public sidewalk — please respect
          residents and businesses.{"\n"}
          • These were real people. We walk to remember them.
        </Text>
      </View>

      <Pressable
        style={styles.primaryBtn}
        onPress={() => navigation.navigate("Map")}
      >
        <Text style={styles.primaryBtnText}>
          {started ? `Continue the tour (${visitedCount}/${total})` : "Begin the tour"}
        </Text>
      </Pressable>

      {started && (
        <Pressable
          style={styles.secondaryBtn}
          onPress={async () => {
            await resetVisited();
            setVisitedCount(0);
          }}
        >
          <Text style={styles.secondaryBtnText}>Start over</Text>
        </Pressable>
      )}

      <Pressable
        style={styles.secondaryBtn}
        onPress={() => navigation.navigate("About")}
      >
        <Text style={styles.secondaryBtnText}>About & sources</Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing(3), paddingTop: spacing(8) },
  kicker: {
    color: colors.accent,
    letterSpacing: 4,
    fontSize: 12,
    marginBottom: spacing(1),
  },
  title: {
    color: colors.text,
    fontFamily: fonts.display,
    fontSize: 34,
    lineHeight: 40,
    marginBottom: spacing(2),
  },
  body: { color: colors.textDim, fontSize: 16, lineHeight: 24 },
  card: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 12,
    padding: spacing(2),
    marginVertical: spacing(3),
  },
  cardTitle: {
    color: colors.accent,
    fontFamily: fonts.display,
    fontSize: 18,
    marginBottom: spacing(1),
  },
  cardBody: { color: colors.textDim, fontSize: 14, lineHeight: 22 },
  primaryBtn: {
    backgroundColor: colors.blood,
    borderRadius: 12,
    padding: spacing(2),
    alignItems: "center",
  },
  primaryBtnText: { color: colors.text, fontSize: 18, fontWeight: "600" },
  secondaryBtn: {
    padding: spacing(2),
    alignItems: "center",
    marginTop: spacing(1),
  },
  secondaryBtnText: { color: colors.textDim, fontSize: 15 },
});
