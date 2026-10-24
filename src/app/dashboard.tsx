import type { Timestamp } from "firebase/firestore";
import { Redirect } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Avatar } from "@/components/avatar";
import { Button } from "@/components/button";
import { Card } from "@/components/card";
import { ErrorBanner } from "@/components/error-banner";
import { RoleBadge } from "@/components/role-badge";
import { useAuth } from "@/context/AuthContext";
import { useBreakpoint } from "@/hooks/use-breakpoint";
import { listUsers } from "@/services/users";
import { borders, colors, radii, sizes, spacing, typography } from "@/theme";
import type { AppUser } from "@/types";
import { mapAuthError } from "@/utils/errors";

function formatDate(value: Timestamp | null) {
  if (!value) {
    return "Not available";
  }

  return value.toDate().toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export default function DashboardScreen() {
  const { user, appUser, loading, error, clearError, signOut } = useAuth();
  const { isWide } = useBreakpoint();
  const [loggingOut, setLoggingOut] = useState(false);
  const [users, setUsers] = useState<AppUser[]>([]);
  const [usersStatus, setUsersStatus] = useState<"idle" | "success" | "error">("idle");
  const [usersError, setUsersError] = useState<string | null>(null);
  const isAdmin = appUser?.role === "admin";
  const usersLoading = isAdmin && usersStatus === "idle";

  useEffect(() => {
    if (!isAdmin) {
      return;
    }

    let active = true;

    listUsers()
      .then((result) => {
        if (active) {
          setUsers(result);
          setUsersError(null);
          setUsersStatus("success");
        }
      })
      .catch((listError: unknown) => {
        if (active) {
          setUsersError(mapAuthError(listError));
          setUsersStatus("error");
        }
      });

    return () => {
      active = false;
    };
  }, [isAdmin]);

  const handleSignOut = useCallback(async () => {
    setLoggingOut(true);

    try {
      await signOut();
    } finally {
      setLoggingOut(false);
    }
  }, [signOut]);

  if (loading) {
    return null;
  }

  if (!user || !appUser) {
    return <Redirect href="/login" />;
  }

  const displayName = appUser.name || user.displayName || appUser.email || "User";
  const email = appUser.email || user.email || "No email";
  const photoURL = appUser.photoURL ?? user.photoURL;

  const content = (
    <View style={styles.contentInner}>
      {error ? <ErrorBanner message={error} onDismiss={clearError} /> : null}

      <View style={styles.headingBlock}>
        <Text style={styles.pageTitle}>Overview</Text>
        <Text style={styles.pageSubtitle}>Your account details.</Text>
      </View>

      <Card style={[styles.profileCard, isWide && styles.profileCardWide]}>
        <Avatar name={displayName} photoURL={photoURL} size="lg" />
        <View style={styles.profileInfo}>
          <View style={styles.nameRow}>
            <Text style={styles.profileName}>{displayName}</Text>
            <RoleBadge role={appUser.role} />
          </View>
          <Text style={styles.email}>{email}</Text>
          <View style={styles.dateList}>
            <View style={styles.dateRow}>
              <Text style={styles.dateLabel}>Created</Text>
              <Text style={styles.dateValue}>{formatDate(appUser.createdAt)}</Text>
            </View>
            <View style={styles.dateRow}>
              <Text style={styles.dateLabel}>Last login</Text>
              <Text style={styles.dateValue}>{formatDate(appUser.lastLoginAt)}</Text>
            </View>
          </View>
        </View>
      </Card>

      {isAdmin ? (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Registered users</Text>
          {usersLoading ? (
            <View style={styles.listState}>
              <ActivityIndicator color={colors.accent} />
              <Text style={styles.listStateText}>Loading users...</Text>
            </View>
          ) : usersError ? (
            <ErrorBanner message={usersError} onDismiss={() => setUsersError(null)} />
          ) : users.length === 0 ? (
            <Card>
              <Text style={styles.emptyText}>No registered users yet.</Text>
            </Card>
          ) : (
            <Card style={styles.listCard}>
              {users.map((item, index) => (
                <View
                  key={item.uid}
                  style={[styles.userRow, index > 0 && styles.userRowBorder]}
                >
                  <Avatar name={item.name || item.email} photoURL={item.photoURL} size="sm" />
                  <View style={styles.userInfo}>
                    <Text style={styles.userName}>
                      {item.name || item.email || "Unnamed user"}
                    </Text>
                    <Text style={styles.userEmail}>{item.email || "No email"}</Text>
                    <View style={styles.userMetaRow}>
                      <RoleBadge role={item.role} />
                      <Text style={styles.userLastLogin}>{formatDate(item.lastLoginAt)}</Text>
                    </View>
                  </View>
                </View>
              ))}
            </Card>
          )}
        </View>
      ) : null}
    </View>
  );

  if (isWide) {
    return (
      <SafeAreaView style={styles.screen}>
        <View style={styles.wideLayout}>
          <View style={styles.sidebar}>
            <Text style={styles.brand}>HB Plus Dashboard</Text>
            <View style={styles.navItem}>
              <Text style={styles.navItemText}>Overview</Text>
            </View>
            <View style={styles.sidebarFooter}>
              <View style={styles.userSummary}>
                <Avatar name={displayName} photoURL={photoURL} size="sm" />
                <View style={styles.userSummaryText}>
                  <Text numberOfLines={1} style={styles.userSummaryName}>
                    {displayName}
                  </Text>
                  <Text numberOfLines={1} style={styles.userSummaryEmail}>
                    {email}
                  </Text>
                </View>
              </View>
              <Button
                fullWidth
                disabled={loggingOut}
                label="Log out"
                loading={loggingOut}
                onPress={() => void handleSignOut()}
                variant="secondary"
              />
            </View>
          </View>
          <ScrollView contentContainerStyle={styles.contentContainer} style={styles.contentScroll}>
            {content}
          </ScrollView>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.screen}>
      <View style={styles.topBar}>
        <Text numberOfLines={1} style={styles.brand}>
          HB Plus Dashboard
        </Text>
        <Button
          disabled={loggingOut}
          label="Log out"
          loading={loggingOut}
          onPress={() => void handleSignOut()}
          variant="ghost"
        />
      </View>
      <ScrollView contentContainerStyle={styles.contentContainer} style={styles.contentScroll}>
        {content}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  wideLayout: {
    flex: 1,
    flexDirection: "row",
  },
  sidebar: {
    width: sizes.sidebarWidth,
    gap: spacing.lg,
    padding: spacing.xl,
    borderRightWidth: borders.thin,
    borderRightColor: colors.border,
    backgroundColor: colors.surface,
  },
  brand: {
    ...typography.heading,
    flexShrink: 1,
    color: colors.text,
  },
  navItem: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    borderRadius: radii.md,
    backgroundColor: colors.accentSoft,
  },
  navItemText: {
    ...typography.label,
    color: colors.accent,
  },
  sidebarFooter: {
    marginTop: "auto",
    gap: spacing.lg,
  },
  userSummary: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  userSummaryText: {
    flex: 1,
    gap: spacing.xs,
  },
  userSummaryName: {
    ...typography.label,
    color: colors.text,
  },
  userSummaryEmail: {
    ...typography.caption,
    color: colors.textMuted,
  },
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.md,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderBottomWidth: borders.thin,
    borderBottomColor: colors.border,
    backgroundColor: colors.surface,
  },
  contentScroll: {
    flex: 1,
  },
  contentContainer: {
    width: "100%",
    maxWidth: sizes.contentMaxWidth,
    alignSelf: "center",
    gap: spacing.xl,
    padding: spacing.xl,
  },
  contentInner: {
    gap: spacing.xl,
  },
  headingBlock: {
    gap: spacing.xs,
  },
  pageTitle: {
    ...typography.title,
    color: colors.text,
  },
  pageSubtitle: {
    ...typography.body,
    color: colors.textMuted,
  },
  profileCard: {
    gap: spacing.lg,
  },
  profileCardWide: {
    flexDirection: "row",
    alignItems: "center",
  },
  profileInfo: {
    flex: 1,
    gap: spacing.sm,
  },
  nameRow: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    gap: spacing.sm,
  },
  profileName: {
    ...typography.heading,
    color: colors.text,
  },
  email: {
    ...typography.body,
    color: colors.textMuted,
  },
  dateList: {
    gap: spacing.xs,
    marginTop: spacing.xs,
  },
  dateRow: {
    flexDirection: "row",
    alignItems: "baseline",
    flexWrap: "wrap",
    gap: spacing.sm,
  },
  dateLabel: {
    ...typography.caption,
    color: colors.textMuted,
  },
  dateValue: {
    ...typography.body,
    color: colors.text,
  },
  section: {
    gap: spacing.md,
  },
  sectionTitle: {
    ...typography.heading,
    color: colors.text,
  },
  listState: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    paddingVertical: spacing.lg,
  },
  listStateText: {
    ...typography.body,
    color: colors.textMuted,
  },
  listCard: {
    paddingVertical: spacing.sm,
  },
  emptyText: {
    ...typography.body,
    color: colors.textMuted,
  },
  userRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: spacing.md,
    paddingVertical: spacing.md,
  },
  userRowBorder: {
    borderTopWidth: borders.thin,
    borderTopColor: colors.border,
  },
  userInfo: {
    flex: 1,
    gap: spacing.xs,
  },
  userName: {
    ...typography.label,
    color: colors.text,
  },
  userEmail: {
    ...typography.caption,
    color: colors.textMuted,
  },
  userMetaRow: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    gap: spacing.sm,
    marginTop: spacing.xs,
  },
  userLastLogin: {
    ...typography.caption,
    color: colors.textMuted,
  },
});
