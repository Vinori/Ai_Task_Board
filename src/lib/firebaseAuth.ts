import { getAuth, GoogleAuthProvider, type Auth } from "firebase/auth";
import { getFirebaseApp } from "@/lib/firebase";

/** Firebase Auth instance, or `null` if the web app is not initialized. */
export function getFirebaseAuth(): Auth | null {
  const app = getFirebaseApp();
  if (!app) return null;
  return getAuth(app);
}

let googleProvider: GoogleAuthProvider | null = null;

/** Shared Google provider for popup / redirect flows. */
export function getGoogleAuthProvider(): GoogleAuthProvider | null {
  if (!getFirebaseApp()) return null;
  if (!googleProvider) {
    googleProvider = new GoogleAuthProvider();
    googleProvider.setCustomParameters({ prompt: "select_account" });
  }
  return googleProvider;
}
