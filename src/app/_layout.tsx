import { Stack } from "expo-router";
import { StyleSheet, View } from "react-native";

import { FullScreenLoader } from "@/components/full-screen-loader";
import { AuthProvider, useAuth } from "@/context/AuthContext";
import { colors } from "@/theme";

function RootNavigator() {
  const { user, appUser, loading } = useAuth();
  const isAuthenticated = Boolean(user && appUser);

  return (
    <View style={styles.root}>
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: colors.background },
        }}
      >
        <Stack.Screen name="index" />
        <Stack.Protected guard={isAuthenticated} redirectTo="/login">
          <Stack.Screen name="dashboard" />
        </Stack.Protected>
        <Stack.Protected guard={!isAuthenticated} redirectTo="/dashboard">
          <Stack.Screen name="login" />
        </Stack.Protected>
        <Stack.Screen name="+not-found" />
      </Stack>
      {loading ? <FullScreenLoader overlay /> : null}
    </View>
  );
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <RootNavigator />
    </AuthProvider>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.background,
  },
});
