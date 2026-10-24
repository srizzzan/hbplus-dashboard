import { StyleSheet, Text, View } from "react-native";

import { borders, colors, radii, spacing, typography } from "@/theme";
import type { Role } from "@/types";

type RoleBadgeProps = {
  role: Role;
};

export function RoleBadge({ role }: RoleBadgeProps) {
  const isAdmin = role === "admin";
  const label = isAdmin ? "Admin" : "User";

  return (
    <View
      accessibilityLabel={`Role: ${label}`}
      style={[styles.badge, isAdmin ? styles.admin : styles.user]}
    >
      <Text style={[styles.text, isAdmin ? styles.adminText : styles.userText]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    alignSelf: "flex-start",
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderWidth: borders.thin,
    borderRadius: radii.pill,
  },
  admin: {
    backgroundColor: colors.accentSoft,
    borderColor: colors.accent,
  },
  user: {
    backgroundColor: colors.surfaceMuted,
    borderColor: colors.border,
  },
  text: {
    ...typography.caption,
    fontWeight: "600",
  },
  adminText: {
    color: colors.accent,
  },
  userText: {
    color: colors.textMuted,
  },
});
