import { browserLocalPersistence, getAuth, setPersistence } from "firebase/auth";

import { db, firebaseApp } from "@/services/firebase.shared";

export const auth = getAuth(firebaseApp);

setPersistence(auth, browserLocalPersistence).catch(() => {
  // Ignore persistence setup failures on the web; Firebase will continue under the default runtime state.
});

export { db };
