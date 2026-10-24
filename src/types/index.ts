import type { Timestamp } from "firebase/firestore";

export type Role = "admin" | "user";

export type AppUser = {
  uid: string;
  email: string;
  name: string;
  photoURL: string | null;
  role: Role;
  createdAt: Timestamp | null;
  lastLoginAt: Timestamp | null;
};
