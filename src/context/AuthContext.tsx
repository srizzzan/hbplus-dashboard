import { signOut as firebaseSignOut, onAuthStateChanged, type User } from "firebase/auth";
import {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useRef,
    useState,
    type ReactNode,
} from "react";

import { auth } from "@/services/firebase";
import { useGoogleSignIn } from "@/services/signInWithGoogle";
import { createUserIfMissing, getUserProfile } from "@/services/users";
import type { AppUser } from "@/types";
import { DOMAIN_REJECTION_MESSAGE, isAllowedEmail } from "@/utils/domain";
import { mapAuthError } from "@/utils/errors";

type AuthContextValue = {
  user: User | null;
  appUser: AppUser | null;
  loading: boolean;
  error: string | null;
  signingIn: boolean;
  signIn: () => Promise<void>;
  signOut: () => Promise<void>;
  clearError: () => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [appUser, setAppUser] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [signingIn, setSigningIn] = useState(false);
  const requestIdRef = useRef(0);
  const { signInWithGoogle } = useGoogleSignIn();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      const requestId = requestIdRef.current + 1;
      requestIdRef.current = requestId;
      setUser(firebaseUser);

      if (!firebaseUser) {
        setAppUser(null);

        if (requestId === requestIdRef.current) {
          setLoading(false);
        }

        return;
      }

      if (!isAllowedEmail(firebaseUser.email, firebaseUser.emailVerified)) {
        setError(DOMAIN_REJECTION_MESSAGE);
        setAppUser(null);

        try {
          await firebaseSignOut(auth);
        } finally {
          if (requestId === requestIdRef.current) {
            setLoading(false);
          }
        }

        return;
      }

      try {
        await createUserIfMissing(firebaseUser);
        const profile = await getUserProfile(firebaseUser.uid);

        if (requestId !== requestIdRef.current) {
          return;
        }

        setAppUser(profile);
        setError(null);
      } catch (profileError) {
        if (requestId !== requestIdRef.current) {
          return;
        }

        setAppUser(null);
        setError(mapAuthError(profileError));
      } finally {
        if (requestId === requestIdRef.current) {
          setLoading(false);
        }
      }
    });

    return () => {
      requestIdRef.current += 1;
      unsubscribe();
    };
  }, []);

  const signIn = useCallback(async () => {
    setSigningIn(true);
    setError(null);

    try {
      await signInWithGoogle();
    } catch (signInError) {
      setError(mapAuthError(signInError));
    } finally {
      setSigningIn(false);
    }
  }, [signInWithGoogle]);

  const signOut = useCallback(async () => {
    setError(null);

    try {
      await firebaseSignOut(auth);
    } catch (signOutError) {
      setError(mapAuthError(signOutError));
    } finally {
      setAppUser(null);
      setLoading(false);
    }
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const value = useMemo(
    () => ({
      user,
      appUser,
      loading,
      error,
      signingIn,
      signIn,
      signOut,
      clearError,
    }),
    [user, appUser, loading, error, signingIn, signIn, signOut, clearError]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }

  return context;
}
