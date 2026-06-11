import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React from "react";
import {
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import colors from "@/constants/colors";
import { useColors } from "@/hooks/useColors";

function InfoRow({
  icon,
  label,
  value,
  colors: c,
}: {
  icon: string;
  label: string;
  value: string;
  colors: ReturnType<typeof useColors>;
}) {
  return (
    <View style={[styles.infoRow, { borderBottomColor: c.border }]}>
      <View style={styles.infoLeft}>
        <Ionicons name={icon as any} size={18} color={c.primary} />
        <Text style={[styles.infoLabel, { color: c.mutedForeground, fontFamily: "Inter_500Medium" }]}>
          {label}
        </Text>
      </View>
      <Text style={[styles.infoValue, { color: c.foreground, fontFamily: "Inter_400Regular" }]}>
        {value}
      </Text>
    </View>
  );
}

export default function AboutScreen() {
  const insets = useSafeAreaInsets();
  const c = useColors();
  const webTopInset = Platform.OS === "web" ? 67 : 0;

  return (
    <View style={[styles.container, { backgroundColor: c.background }]}>
      {/* Header for web / standalone */}
      <View
        style={[
          styles.header,
          {
            paddingTop: insets.top + 12 + webTopInset,
            backgroundColor: c.card,
            borderBottomColor: c.border,
          },
        ]}
      >
        <Pressable
          onPress={() => router.back()}
          style={({ pressed }) => [styles.backBtn, { opacity: pressed ? 0.5 : 1 }]}
        >
          <Ionicons name="close" size={24} color={c.foreground} />
        </Pressable>
        <Text style={[styles.headerTitle, { color: c.foreground, fontFamily: "Inter_600SemiBold" }]}>
          About
        </Text>
        <View style={{ width: 32 }} />
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={[
          styles.content,
          { paddingBottom: insets.bottom + 32 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Logo */}
        <View style={styles.logoSection}>
          <View style={[styles.orb, { borderColor: c.primary, shadowColor: c.glow as string }]}>
            <Ionicons name="flash" size={40} color={c.primary} />
          </View>
          <Text style={[styles.appName, { color: c.foreground, fontFamily: "Inter_700Bold" }]}>
            ENOSX
          </Text>
          <Text style={[styles.tagline, { color: c.mutedForeground, fontFamily: "Inter_400Regular" }]}>
            AI Assistant
          </Text>
        </View>

        {/* Info Card */}
        <View style={[styles.card, { backgroundColor: c.card, borderColor: c.border }]}>
          <InfoRow icon="flash-outline" label="Model" value="llama-3.3-70b" colors={c} />
          <InfoRow icon="server-outline" label="Provider" value="Groq Cloud" colors={c} />
          <InfoRow icon="code-slash-outline" label="Version" value="1.0.0" colors={c} />
          <View style={[styles.infoRow, { borderBottomWidth: 0 }]}>
            <View style={styles.infoLeft}>
              <Ionicons name="phone-portrait-outline" size={18} color={c.primary} />
              <Text style={[styles.infoLabel, { color: c.mutedForeground, fontFamily: "Inter_500Medium" }]}>
                Platform
              </Text>
            </View>
            <Text style={[styles.infoValue, { color: c.foreground, fontFamily: "Inter_400Regular" }]}>
              {Platform.OS === "ios" ? "iOS" : Platform.OS === "android" ? "Android" : "Web"}
            </Text>
          </View>
        </View>

        {/* Features */}
        <Text style={[styles.sectionTitle, { color: c.foreground, fontFamily: "Inter_600SemiBold" }]}>
          Features
        </Text>
        <View style={[styles.card, { backgroundColor: c.card, borderColor: c.border }]}>
          {[
            { icon: "flash-outline", text: "Real-time streaming responses" },
            { icon: "shield-checkmark-outline", text: "Secure server-side API key" },
            { icon: "chatbubbles-outline", text: "Multi-turn conversations" },
            { icon: "moon-outline", text: "Dark-first cyberpunk design" },
          ].map((feat, i) => (
            <View
              key={i}
              style={[
                styles.featRow,
                i < 3 && { borderBottomWidth: 1, borderBottomColor: c.border },
              ]}
            >
              <Ionicons name={feat.icon as any} size={18} color={c.primary} />
              <Text style={[styles.featText, { color: c.foreground, fontFamily: "Inter_400Regular" }]}>
                {feat.text}
              </Text>
            </View>
          ))}
        </View>

        <Text style={[styles.footer, { color: c.mutedForeground, fontFamily: "Inter_400Regular" }]}>
          Built with Groq · Expo · React Native
        </Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
  },
  backBtn: {
    padding: 4,
    width: 32,
  },
  headerTitle: {
    fontSize: 17,
  },
  content: {
    padding: 20,
    gap: 16,
  },
  logoSection: {
    alignItems: "center",
    paddingVertical: 24,
    gap: 8,
  },
  orb: {
    width: 90,
    height: 90,
    borderRadius: 45,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 24,
    elevation: 12,
    marginBottom: 4,
  },
  appName: {
    fontSize: 32,
    letterSpacing: 8,
  },
  tagline: {
    fontSize: 14,
    letterSpacing: 1,
  },
  card: {
    borderRadius: 16,
    borderWidth: 1,
    overflow: "hidden",
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
  },
  infoLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  infoLabel: {
    fontSize: 14,
  },
  infoValue: {
    fontSize: 14,
  },
  featRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  featText: {
    fontSize: 14,
    lineHeight: 20,
  },
  sectionTitle: {
    fontSize: 13,
    textTransform: "uppercase",
    letterSpacing: 1.5,
    paddingHorizontal: 4,
    marginTop: 4,
  },
  footer: {
    fontSize: 12,
    textAlign: "center",
    paddingTop: 8,
  },
});
