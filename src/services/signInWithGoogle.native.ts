import * as Google from "expo-auth-session/providers/google";
import { GoogleAuthProvider, signInWithCredential } from "firebase/auth";
import { useCallback, useEffect, useRef } from "react";

import { ALLOWED_DOMAIN, requireGoogleClientId } from "@/config";
import { auth } from "@/services/firebase";
import type { GoogleSignInHook } from "@/services/googleAuth.types";
import type { User } from "firebase/auth";

const webClientId = requireGoogleClientId("web");
const androidClientId = requireGoogleClientId("android");
const iosClientId = requireGoogleClientId("ios");

export const useGoogleSignIn: GoogleSignInHook = () => {
  const [request, response, promptAsync] = Google.useIdTokenAuthRequest({
    webClientId,
    androidClientId,
    iosClientId,
    extraParams: {
      hd: ALLOWED_DOMAIN,
      prompt: "select_account",
    },
  });

  const pendingRef = useRef<{
    resolve: (user: User) => void;
    reject: (error: unknown) => void;
  } | null>(null);

  useEffect(() => {
    const pending = pendingRef.current;
    if (!pending || !response) {
      return;
    }

    if (response.type === "cancel" || response.type === "dismiss") {
      pendingRef.current = null;
      pending.reject(
        Object.assign(new Error("Google sign-in was cancelled."), {
          code: "auth/cancelled-native",
        })
      );
      return;
    }

    if (response.type === "error") {
      pendingRef.current = null;
      pending.reject(
        Object.assign(new Error(response.error?.message ?? "Google sign-in failed."), {
          code: response.error?.code ?? "auth/native-sign-in-failed",
        })
      );
      return;
    }

    if (response.type !== "success") {
      return;
    }

    const idToken = response.params.id_token;
    if (!idToken) {
      return;
    }

    pendingRef.current = null;

    const credential = GoogleAuthProvider.credential(idToken);
    signInWithCredential(auth, credential)
      .then((userCredential) => {
        pending.resolve(userCredential.user);
      })
      .catch((error) => {
        pending.reject(error);
      });
  }, [response]);

  const signInWithGoogle = useCallback(async () => {
    if (!request) {
      throw new Error("Google sign-in is not ready yet.");
    }

    if (pendingRef.current) {
      throw new Error("Google sign-in already in progress.");
    }

    return new Promise<User>((resolve, reject) => {
      pendingRef.current = { resolve, reject };

      promptAsync()
        .then((result) => {
          if (pendingRef.current === null) {
            return;
          }

          if (result.type === "cancel" || result.type === "dismiss") {
            pendingRef.current = null;
            reject(
              Object.assign(new Error("Google sign-in was cancelled."), {
                code: "auth/cancelled-native",
              })
            );
            return;
          }

          if (result.type === "error") {
            pendingRef.current = null;
            reject(
              Object.assign(new Error(result.error?.message ?? "Google sign-in failed."), {
                code: result.error?.code ?? "auth/native-sign-in-failed",
              })
            );
            return;
          }

          if (result.type !== "success") {
            pendingRef.current = null;
            reject(
              Object.assign(new Error("Google sign-in failed."), {
                code: "auth/native-sign-in-failed",
              })
            );
            return;
          }

          const idToken = result.params.id_token;
          if (!idToken) {
            return;
          }

          pendingRef.current = null;

          const credential = GoogleAuthProvider.credential(idToken);
          signInWithCredential(auth, credential)
            .then((userCredential) => {
              resolve(userCredential.user);
            })
            .catch((error) => {
              reject(error);
            });
        })
        .catch((error) => {
          if (pendingRef.current) {
            pendingRef.current = null;
            reject(error);
          }
        });
    });
  }, [promptAsync, request]);

  return {
    signInWithGoogle,
    ready: Boolean(request),
  };
};
