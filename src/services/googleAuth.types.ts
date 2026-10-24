import type { User } from "firebase/auth";

export type SignInWithGoogle = () => Promise<User>;

export type GoogleSignInHook = () => {
  signInWithGoogle: SignInWithGoogle;
  ready: boolean;
};
