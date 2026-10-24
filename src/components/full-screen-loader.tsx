import { ActivityIndicator, StyleSheet, Text, View } from "react-native";

import { colors, spacing, typography } from "@/theme";

type FullScreenLoaderProps = {
  overlay?: boolean;
};

export function FullScreenLoader({ overlay = false }: FullScreenLoaderProps) {
  return (
    <View
      accessibilityLabel="Loading"
      accessibilityLiveRegion="polite"
      accessibilityRole="progressbar"
      style={[styles.container, overlay && styles.overlay]}
    >
      <ActivityIndicator color={colors.accent} />
      <Text style={styles.text}>Loading...</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
    backgroundColor: colors.background,
  },
  overlay: {
    position: "absolute",
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    zIndex: 1,
  },
  text: {
    ...typography.body,
    color: colors.textMuted,
  },
});
