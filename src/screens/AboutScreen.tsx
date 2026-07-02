import { useState } from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

import { submitFeedback, supabase } from "../lib/supabase";
import { colors, fonts, spacing } from "../theme";

export function AboutScreen() {
  const [message, setMessage] = useState("");
  const [sent, setSent] = useState<null | boolean>(null);

  return (
    <ScrollView style={styles.root} contentContainerStyle={styles.content}>
      <Text style={styles.title}>About this tour</Text>
      <Text style={styles.body}>
        Between December 30, 1884 and December 24, 1885, eight Austinites —
        Mollie Smith, Eliza Shelley, Irene Cross, Mary Ramey, Gracie Vance,
        Orange Washington, Susan Hancock, and Eula Phillips — were murdered by
        an assailant who was never identified. The case predates London's
        Whitechapel murders by three years and is often described as the first
        tracked serial-killer case in America.
      </Text>
      <Text style={styles.body}>
        The tour draws on Skip Hollandsworth's book *The Midnight Assassin:
        Panic, Scandal, and the Hunt for America's First Serial Killer* (2016),
        contemporary reporting in the Austin Daily Statesman, and public
        research from the Austin History Center. Site positions are
        approximate: the city renamed its streets in 1886 and nearly all the
        original buildings are gone.
      </Text>
      <Text style={styles.body}>
        The victims were mostly Black women whose lives went largely unrecorded
        outside of these crimes. This tour tries to keep the attention on them
        and on the city that failed them — not on glamorizing their killer.
      </Text>

      <Text style={styles.heading}>Sources & further reading</Text>
      <Text style={styles.body}>
        • Skip Hollandsworth, *The Midnight Assassin* (Henry Holt, 2016){"\n"}
        • "Capital Murder," Texas Monthly, July 2000{"\n"}
        • Austin History Center — Servant Girl Annihilator files{"\n"}
        • PBS *History Detectives*: "Texas Servant Girl Murders" (2014)
      </Text>

      {supabase && (
        <View style={styles.feedback}>
          <Text style={styles.heading}>Report a correction or a chill</Text>
          <TextInput
            style={styles.input}
            multiline
            placeholder="Corrections, better coordinates, or what you felt out there…"
            placeholderTextColor={colors.textDim}
            value={message}
            onChangeText={setMessage}
          />
          <Pressable
            style={styles.sendBtn}
            onPress={async () => {
              if (!message.trim()) return;
              const ok = await submitFeedback(null, message.trim());
              setSent(ok);
              if (ok) setMessage("");
            }}
          >
            <Text style={styles.sendBtnText}>Send</Text>
          </Pressable>
          {sent === true && <Text style={styles.sentOk}>Received. Thank you.</Text>}
          {sent === false && (
            <Text style={styles.sentFail}>Could not send — try again later.</Text>
          )}
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing(3), paddingBottom: spacing(6) },
  title: {
    color: colors.text,
    fontFamily: fonts.display,
    fontSize: 28,
    marginBottom: spacing(2),
  },
  heading: {
    color: colors.accent,
    fontFamily: fonts.display,
    fontSize: 18,
    marginTop: spacing(2),
    marginBottom: spacing(1),
  },
  body: {
    color: colors.text,
    fontSize: 15,
    lineHeight: 24,
    marginBottom: spacing(2),
  },
  feedback: { marginTop: spacing(2) },
  input: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 10,
    color: colors.text,
    minHeight: 90,
    padding: spacing(1.5),
    textAlignVertical: "top",
  },
  sendBtn: {
    backgroundColor: colors.blood,
    borderRadius: 10,
    padding: spacing(1.5),
    alignItems: "center",
    marginTop: spacing(1),
  },
  sendBtnText: { color: colors.text, fontWeight: "600" },
  sentOk: { color: colors.success, marginTop: spacing(1) },
  sentFail: { color: colors.bloodBright, marginTop: spacing(1) },
});
