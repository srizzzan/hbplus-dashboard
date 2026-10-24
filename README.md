# HB Plus Dashboard

We built this app as an Expo + React Native dashboard for a domain-restricted internal workspace. The project runs in the browser and on native devices, but the login flow is intentionally locked to the official company domain so that only approved users can access the app.

## Stack

- Expo SDK 58 with Expo Router
- React Native and React Native Web
- TypeScript
- Firebase Authentication and Firestore
- Google Sign-In for web and native OAuth flow
- Netlify for static web hosting

## Setup

1. Install dependencies from the project root.

   ```bash
   npm install
   ```

2. Copy `.env.example` to `.env` and fill in the Firebase and Google values.

3. Restart the Expo process after every `.env` edit so the environment values reload cleanly.

   ```bash
   npx expo start --clear
   ```

4. Start the app for web or device work.

   ```bash
   npx expo start --web
   ```

The environment variables are:

- `EXPO_PUBLIC_FIREBASE_API_KEY`: Firebase web API key for the project.
- `EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN`: Firebase auth domain, for example `hbplus-dashboard.firebaseapp.com`.
- `EXPO_PUBLIC_FIREBASE_PROJECT_ID`: Firebase project ID.
- `EXPO_PUBLIC_FIREBASE_APP_ID`: Firebase web app ID.
- `EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID`: Google OAuth web client ID from the Firebase web app or Google Cloud OAuth client.
- `EXPO_PUBLIC_ANDROID_CLIENT_ID`: Android client ID from the Google Cloud OAuth client used for native Android.
- `EXPO_PUBLIC_IOS_CLIENT_ID`: iOS client ID from the Google Cloud OAuth client used for native iOS.
- `EXPO_PUBLIC_ALLOWED_DOMAIN`: the trusted domain suffix, such as `hbplus.fit`.

We keep the domain in one place in `src/config/index.ts` and the app uses it for both the Google account picker and the final email check. Any `.env` change should be followed by `npx expo start --clear` so the app does not keep stale values in memory.

## Firebase and Google Cloud configuration

We use Firebase Authentication with the Google provider. The setup is:

- In Firebase Console, open Authentication and enable Google under Sign-in method.
- In the same Firebase project, create or confirm the Web app, Android app, and iOS app entries.
- Match the bundle identifiers to the native app configuration in `app.json`:
  - Android package: `com.srijan.hbplusdashboard`
  - iOS bundle identifier: `com.srijan.hbplusdashboard`
- Add the Android SHA-1 certificate fingerprint to the Firebase Android app configuration. The Android login cannot work reliably without the correct SHA-1 in place.
- Copy the generated client IDs into the Expo env vars:
  - Web client ID -> `EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID`
  - Android client ID -> `EXPO_PUBLIC_ANDROID_CLIENT_ID`
  - iOS client ID -> `EXPO_PUBLIC_IOS_CLIENT_ID`
- In Google Cloud Console, make sure the OAuth clients match the Firebase apps and that the authorized redirect URIs are valid for the Firebase auth domain in use.
- In Firebase Authentication, add the allowed login domains under Authorized domains. For local web development, this usually includes `localhost`; for production, the hosted domain should include the actual production host as well. A typical example for the project is `hbplus.fit`.

When we demo a live login in a sandbox environment, we use a substitute domain in place of the internal corporate domain. The app still expects the configured `EXPO_PUBLIC_ALLOWED_DOMAIN` value, and in the examples here we use `hbplus.fit`.

## Web and native auth flow

The app supports both browser and native Google sign-in.

- Web flow: the app creates a Firebase Google sign-in popup with `provider.setCustomParameters({ hd: ALLOWED_DOMAIN, prompt: 'select_account' })`. This narrows the account picker to the permitted domain, but it is only a UX hint. It is not a security boundary by itself.
- Native flow: the app uses `expo-auth-session` to request an ID token from Google, then exchanges that token for a Firebase credential with `signInWithCredential(auth, credential)`. This is the path used on Android and iOS device builds.
- After sign-in, Firebase emits an auth state change. The app then loads the Firestore profile for the user and attaches the app-level role model.

The important part is that both flows ultimately rely on Firebase ID tokens and the authenticated user state. We do not trust the client-only boundary as the final security layer.

## Three-layer domain restriction

We enforce the domain in three layers so the app is not only checking a string in the browser.

1. Account-picker layer: the Google provider is given `hd: hbplus.fit`, which restricts the visible account list and makes the user experience consistent.
2. App validation layer: `isAllowedEmail(email, emailVerified)` checks the signed-in user email and verifies that it ends with `@hbplus.fit` before the app treats the user as valid. The app also signs the user out immediately if the domain is not allowed.
3. Security and data layer: the app treats `user && appUser` as the authenticated condition and uses route guards to hide sensitive screens. This is still client-side logic, so it should be paired with Firestore rules and backend enforcement for true protection.

Client-only checks are not enough. A user can bypass a UI restriction in a modified app or by intercepting the client; the real trust boundary is the authenticated token and the server-side data access rules. We handle the token flow through Firebase auth and keep the app-level email validation as a fast, user-friendly enforcement layer before a session is considered valid.

## Token handling and route protection

We rely on Firebase auth state and the user profile document to drive the app.

- `onAuthStateChanged` watches the Firebase user.
- If the user is missing, we clear the app profile and return to the login route.
- If the user email does not match the allowed domain, we reject the session and sign them out.
- If the user is valid, we create or update the Firestore `users/{uid}` profile and read the role.
- The dashboard is routed through `Stack.Protected` so authenticated users land on the dashboard and unauthenticated users are redirected to login.

The route protection is intentionally simple and explicit:

- login is protected when `!isAuthenticated`
- dashboard is protected when `isAuthenticated`

The app also maintains a server-backed role model in Firestore. We store `role` on each user document and treat `admin` differently from the default `user` role in the dashboard view.

## Running locally

### Web

```bash
npx expo start --web
```

This is the easiest way to open the app in a browser.

### Android

Android native sign-in requires a development build, not Expo Go. We configure Android in the project and we do not claim the Android native path was tested here.

Use a development build workflow such as:

```bash
npx expo run:android
```

or build a native development build through EAS.

### iOS

The app is configured for iOS, but the project was not tested on a Mac environment. Native iOS work requires a macOS machine, Xcode, and a development build setup.

```bash
npx expo run:ios
```

This is configured, but it is not a local verification step we performed here.

## Netlify deployment

We deploy the web build through Netlify.

1. Build the web bundle from the project root.

   ```bash
   npx expo export -p web
   ```

2. Netlify publishes the `dist/` directory generated by Expo.
3. Keep the `_redirects` file in the app root so that client-side routes resolve correctly.
4. Add the required `EXPO_PUBLIC_*` values in the Netlify environment settings before the first deploy or before each redeploy after an env change.
5. Redeploy the site after adjusting env values.
6. Make sure the production domain is included in the Firebase Authentication authorized domains list.

For this project, the sample domain we use in examples is `hbplus.fit`, and the same pattern applies to the real production host once the app is moved to a live environment.

## Project structure

- `src/app`: screens and Expo Router routes
- `src/components`: reusable UI elements
- `src/context`: auth provider and app state
- `src/services`: Firebase, Google auth, and user profile helpers
- `src/config`: environment and app config values
- `src/theme`: shared design tokens
- `src/types`: shared TypeScript models
- `src/utils`: helper utilities
- `public/_redirects`: Netlify SPA rewrite rule
- `.env.example`: required env template
- `app.json`: Expo app metadata and native config

## Notes

We keep the production logic aligned with the official domain policy, and the app intentionally blocks users who do not match the configured domain. The demo environment can be exercised with a substitute domain while preserving the same enforcement flow that would be used in production.
