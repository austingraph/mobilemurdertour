import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { CameraView, useCameraPermissions } from "expo-camera";
import { useEffect, useRef } from "react";
import {
  Animated,
  Easing,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { WebView } from "react-native-webview";

import { PAGES_BASE_URL } from "../config";
import { stopById } from "../data/tour";
import type { RootStackParamList } from "../navigation";
import { colors, fonts, spacing } from "../theme";

type Props = NativeStackScreenProps<RootStackParamList, "AR">;

/**
 * Two lightweight AR modes, no proprietary SDKs:
 *
 * "ghost"  — camera passthrough with an animated translucent apparition
 *            composited on top. Works on every phone with a camera; no
 *            ARCore/ARKit required.
 * "webxr"  — a WebView showing a page from GitHub Pages built with Google's
 *            open-source <model-viewer> web component. On devices with AR
 *            support the page offers true place-in-world AR; elsewhere it
 *            falls back to an interactive 3D model.
 */
export function ARScreen({ navigation, route }: Props) {
  const stop = stopById(route.params.stopId);

  if (!stop) return null;
  if (stop.ar === "webxr" && stop.arPage) {
    return (
      <View style={styles.root}>
        <WebView
          source={{ uri: `${PAGES_BASE_URL}/${stop.arPage}` }}
          style={styles.web}
          allowsInlineMediaPlayback
        />
        <CloseButton onPress={() => navigation.goBack()} />
      </View>
    );
  }
  return <GhostOverlay title={stop.title} caption={stop.teaser} onClose={() => navigation.goBack()} />;
}

function GhostOverlay({
  title,
  caption,
  onClose,
}: {
  title: string;
  caption: string;
  onClose: () => void;
}) {
  const [permission, requestPermission] = useCameraPermissions();
  const opacity = useRef(new Animated.Value(0)).current;
  const drift = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Slow fade-in, then endless breathing + vertical drift.
    Animated.sequence([
      Animated.delay(1200),
      Animated.timing(opacity, {
        toValue: 0.55,
        duration: 4000,
        easing: Easing.inOut(Easing.quad),
        useNativeDriver: true,
      }),
    ]).start(() => {
      Animated.loop(
        Animated.sequence([
          Animated.timing(opacity, {
            toValue: 0.25,
            duration: 3000,
            easing: Easing.inOut(Easing.quad),
            useNativeDriver: true,
          }),
          Animated.timing(opacity, {
            toValue: 0.6,
            duration: 3000,
            easing: Easing.inOut(Easing.quad),
            useNativeDriver: true,
          }),
        ]),
      ).start();
    });
    Animated.loop(
      Animated.sequence([
        Animated.timing(drift, {
          toValue: -18,
          duration: 4500,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(drift, {
          toValue: 0,
          duration: 4500,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ]),
    ).start();
  }, [opacity, drift]);

  if (!permission) return <View style={styles.root} />;
  if (!permission.granted) {
    return (
      <View style={[styles.root, styles.center]}>
        <Text style={styles.permissionText}>
          The apparition viewer needs the camera to overlay the past on the
          present.
        </Text>
        <Pressable style={styles.grantBtn} onPress={requestPermission}>
          <Text style={styles.grantBtnText}>Allow camera</Text>
        </Pressable>
        <Pressable style={styles.closeLink} onPress={onClose}>
          <Text style={styles.closeLinkText}>Not now</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={styles.root}>
      <CameraView style={StyleSheet.absoluteFill} facing="back" />
      <Animated.Image
        source={require("../../assets/ghost.png")}
        style={[
          styles.ghost,
          { opacity, transform: [{ translateY: drift }] },
        ]}
        resizeMode="contain"
      />
      <View style={styles.captionWrap}>
        <Text style={styles.captionTitle}>{title}</Text>
        <Text style={styles.caption}>{caption}</Text>
        <Text style={styles.hint}>
          Hold your phone up to the site. Something lingers here.
        </Text>
      </View>
      <CloseButton onPress={onClose} />
    </View>
  );
}

function CloseButton({ onPress }: { onPress: () => void }) {
  return (
    <Pressable style={styles.closeBtn} onPress={onPress}>
      <Text style={styles.closeBtnText}>✕</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#000" },
  web: { flex: 1, backgroundColor: "#000" },
  center: { alignItems: "center", justifyContent: "center", padding: spacing(4) },
  ghost: {
    position: "absolute",
    top: "18%",
    alignSelf: "center",
    width: 260,
    height: 380,
  },
  captionWrap: {
    position: "absolute",
    bottom: spacing(4),
    left: spacing(2),
    right: spacing(2),
    backgroundColor: "rgba(11,11,16,0.75)",
    borderRadius: 12,
    padding: spacing(2),
  },
  captionTitle: {
    color: colors.text,
    fontFamily: fonts.display,
    fontSize: 18,
  },
  caption: { color: colors.textDim, fontSize: 14, marginTop: 4 },
  hint: { color: colors.ghost, fontSize: 12, marginTop: spacing(1), fontStyle: "italic" },
  permissionText: {
    color: colors.text,
    fontSize: 16,
    lineHeight: 24,
    textAlign: "center",
  },
  grantBtn: {
    backgroundColor: colors.blood,
    borderRadius: 10,
    paddingVertical: spacing(1.5),
    paddingHorizontal: spacing(3),
    marginTop: spacing(3),
  },
  grantBtnText: { color: colors.text, fontSize: 16, fontWeight: "600" },
  closeLink: { marginTop: spacing(2) },
  closeLinkText: { color: colors.textDim },
  closeBtn: {
    position: "absolute",
    top: spacing(6),
    right: spacing(2),
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(11,11,16,0.7)",
    alignItems: "center",
    justifyContent: "center",
  },
  closeBtnText: { color: colors.text, fontSize: 18 },
});
