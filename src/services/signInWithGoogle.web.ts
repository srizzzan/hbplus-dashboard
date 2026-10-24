import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";

import { ALLOWED_DOMAIN } from "@/config";
import { auth } from "@/services/firebase";
import type { GoogleSignInHook, SignInWithGoogle } from "@/services/googleAuth.types";

export const signInWithGoogle: SignInWithGoogle = async () => {
  const provider = new GoogleAuthProvider();

  // hd only filters the account picker; AuthContext enforces the domain.
  provider.setCustomParameters({
    hd: ALLOWED_DOMAIN,
    prompt: "select_account",
  });

  const result = await signInWithPopup(auth, provider);

  return result.user;
};

export const useGoogleSignIn: GoogleSignInHook = () => ({
  signInWithGoogle,
  ready: true,
});
