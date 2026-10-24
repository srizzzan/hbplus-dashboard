import { StyleSheet, Text, View } from "react-native";

import { Button } from "@/components/button";
import { borders, colors, radii, spacing, typography } from "@/theme";

type ErrorBannerProps = {
  message: string;
  onDismiss?: () => void;
};

export function ErrorBanner({ message, onDismiss }: ErrorBannerProps) {
  return (
    <View accessibilityLiveRegion="polite" accessibilityRole="alert" style={styles.container}>
      <Text style={styles.message}>{message}</Text>
      {onDismiss ? (
        <Button
          accessibilityLabel="Dismiss error"
          label="Dismiss"
          onPress={onDismiss}
          style={styles.dismissButton}
          variant="ghost"
        />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    padding: spacing.md,
    borderWidth: borders.thin,
    borderColor: colors.danger,
    borderRadius: radii.md,
    backgroundColor: colors.surface,
  },
  message: {
    ...typography.body,
    flex: 1,
    color: colors.danger,
  },
  dismissButton: {
    minHeight: 0,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderWidth: borders.none,
  },
});
