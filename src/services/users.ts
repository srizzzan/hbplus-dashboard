import type { User } from "firebase/auth";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  serverTimestamp,
  setDoc,
  updateDoc,
} from "firebase/firestore";

import { db } from "@/services/firebase";
import type { AppUser, Role } from "@/types";

export async function createUserIfMissing(user: User) {
  const userRef = doc(db, "users", user.uid);
  const snapshot = await getDoc(userRef);

  if (!snapshot.exists()) {
    await setDoc(userRef, {
      uid: user.uid,
      email: user.email ?? "",
      name: user.displayName ?? "",
      photoURL: user.photoURL ?? null,
      role: "user",
      createdAt: serverTimestamp(),
      lastLoginAt: serverTimestamp(),
    });

    return;
  }

  await updateDoc(userRef, {
    lastLoginAt: serverTimestamp(),
  });
}

export async function getUserProfile(uid: string): Promise<AppUser | null> {
  const snapshot = await getDoc(doc(db, "users", uid));

  if (!snapshot.exists()) {
    return null;
  }

  const data = snapshot.data() as AppUser;

  return {
    ...data,
    uid: snapshot.id,
    role: data.role === "admin" ? "admin" : "user",
  };
}

export async function getUserRole(uid: string): Promise<Role> {
  const profile = await getUserProfile(uid);

  return profile?.role === "admin" ? "admin" : "user";
}

export async function listUsers(): Promise<AppUser[]> {
  const snapshot = await getDocs(collection(db, "users"));

  return snapshot.docs.map((document) => {
    const data = document.data() as AppUser;

    return {
      ...data,
      uid: document.id,
      role: data.role === "admin" ? "admin" : "user",
    };
  });
}
