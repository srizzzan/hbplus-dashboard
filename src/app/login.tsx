import { Redirect } from "expo-router";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Button } from "@/components/button";
import { Card } from "@/components/card";
import { ErrorBanner } from "@/components/error-banner";
import { ALLOWED_DOMAIN } from "@/config";
import { useAuth } from "@/context/AuthContext";
import { useBreakpoint } from "@/hooks/use-breakpoint";
import { colors, sizes, spacing, typography } from "@/theme";

export default function LoginScreen() {
  const { user, appUser, loading, error, signingIn, signIn, clearError } = useAuth();
  const { isWide } = useBreakpoint();

  if (loading) {
    return null;
  }

  if (user && appUser) {
    return <Redirect href="/dashboard" />;
  }

  const content = (
    <>
      <View style={styles.header}>
        <Text style={styles.appName}>HB Plus Dashboard</Text>
        <Text style={styles.description}>
          Sign in with your @{ALLOWED_DOMAIN} Google account.
        </Text>
      </View>
      <Button
        accessibilityLabel="Sign in with Google"
        disabled={signingIn}
        fullWidth
        label="Sign in with Google"
        loading={signingIn}
        onPress={() => void signIn()}
      />
      {error ? <ErrorBanner message={error} onDismiss={clearError} /> : null}
    </>
  );

  return (
    <SafeAreaView style={styles.screen}>
      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        {isWide ? (
          <Card style={styles.card}>{content}</Card>
        ) : (
          <View style={styles.phoneContent}>{content}</View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    flexGrow: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.xxl,
  },
  card: {
    width: "100%",
    maxWidth: sizes.cardMaxWidth,
    gap: spacing.lg,
  },
  phoneContent: {
    width: "100%",
    gap: spacing.lg,
  },
  header: {
    gap: spacing.sm,
  },
  appName: {
    ...typography.title,
    color: colors.text,
  },
  description: {
    ...typography.body,
    color: colors.textMuted,
  },
});
