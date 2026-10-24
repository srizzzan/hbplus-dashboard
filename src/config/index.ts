const requiredEnv = (name: string, value: string | undefined): string => {
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }

  return value;
};

export const firebaseConfig = {
  apiKey: requiredEnv("EXPO_PUBLIC_FIREBASE_API_KEY", process.env.EXPO_PUBLIC_FIREBASE_API_KEY),
  authDomain: requiredEnv(
    "EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN",
    process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN
  ),
  projectId: requiredEnv(
    "EXPO_PUBLIC_FIREBASE_PROJECT_ID",
    process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID
  ),
  appId: requiredEnv("EXPO_PUBLIC_FIREBASE_APP_ID", process.env.EXPO_PUBLIC_FIREBASE_APP_ID),
};

export const ALLOWED_DOMAIN = (process.env.EXPO_PUBLIC_ALLOWED_DOMAIN || "hbplus.fit")
  .trim()
  .replace(/^@/, "")
  .toLowerCase();

export const googleClientIds = {
  web: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID,
  android: process.env.EXPO_PUBLIC_ANDROID_CLIENT_ID,
  ios: process.env.EXPO_PUBLIC_IOS_CLIENT_ID,
};

const GOOGLE_ENV_NAMES: Record<keyof typeof googleClientIds, string> = {
  web: "EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID",
  android: "EXPO_PUBLIC_ANDROID_CLIENT_ID",
  ios: "EXPO_PUBLIC_IOS_CLIENT_ID",
};

export function requireGoogleClientId(platform: keyof typeof googleClientIds): string {
  return requiredEnv(GOOGLE_ENV_NAMES[platform], googleClientIds[platform]);
}
