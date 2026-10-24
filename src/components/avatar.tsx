import { Image, StyleSheet, Text, View } from "react-native";

import { colors, sizes, typography } from "@/theme";

type AvatarSize = "sm" | "md" | "lg";

type AvatarProps = {
  name?: string | null;
  photoURL?: string | null;
  size?: AvatarSize;
};

const dimensions = {
  sm: sizes.avatarSm,
  md: sizes.avatarMd,
  lg: sizes.avatarLg,
} as const;

const initialTextStyles = {
  sm: typography.caption,
  md: typography.label,
  lg: typography.heading,
} as const;

function getInitials(name?: string | null) {
  const trimmed = (name ?? "").trim();

  if (!trimmed) {
    return "?";
  }

  return trimmed
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join("");
}

export function Avatar({ name, photoURL, size = "md" }: AvatarProps) {
  const dimension = dimensions[size];
  const borderRadius = dimension / 2;
  const accessibilityLabel = name ? `${name} avatar` : "User avatar";

  if (photoURL) {
    return (
      <Image
        accessibilityLabel={accessibilityLabel}
        source={{ uri: photoURL }}
        style={[styles.image, { width: dimension, height: dimension, borderRadius }]}
      />
    );
  }

  return (
    <View
      accessibilityLabel={accessibilityLabel}
      accessibilityRole="image"
      style={[styles.fallback, { width: dimension, height: dimension, borderRadius }]}
    >
      <Text style={[initialTextStyles[size], styles.initials]}>{getInitials(name)}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  image: {
    backgroundColor: colors.surfaceMuted,
  },
  fallback: {
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.accentSoft,
  },
  initials: {
    color: colors.accent,
  },
});
