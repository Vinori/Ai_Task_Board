import { getApp, getApps, initializeApp, type FirebaseApp } from "firebase/app";

function readConfig() {
  const apiKey = import.meta.env.VITE_FIREBASE_API_KEY;
  const authDomain = import.meta.env.VITE_FIREBASE_AUTH_DOMAIN;
  const projectId = import.meta.env.VITE_FIREBASE_PROJECT_ID;
  const storageBucket = import.meta.env.VITE_FIREBASE_STORAGE_BUCKET;
  const messagingSenderId = import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID;
  const appId = import.meta.env.VITE_FIREBASE_APP_ID;
  const measurementId = import.meta.env.VITE_FIREBASE_MEASUREMENT_ID;

  if (!apiKey || !projectId || !appId) return null;

  return {
    apiKey,
    authDomain: authDomain ?? `${projectId}.firebaseapp.com`,
    projectId,
    storageBucket: storageBucket ?? `${projectId}.appspot.com`,
    messagingSenderId: messagingSenderId ?? "",
    appId,
    ...(measurementId ? { measurementId } : {}),
  };
}

/** Firebase Web App instance; `null` until env vars from the console are set. */
export function getFirebaseApp(): FirebaseApp | null {
  if (getApps().length > 0) {
    try {
      return getApp();
    } catch {
      return null;
    }
  }

  const options = readConfig();
  if (!options) return null;

  return initializeApp(options);
}
