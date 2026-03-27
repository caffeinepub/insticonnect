import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

export const FIREBASE_CONFIG = {
  apiKey: "AIzaSyD-qmMKD_ycEkOrG2hToGPvqwWdXvJtrc0",
  authDomain: "insti-connect.firebaseapp.com",
  projectId: "insti-connect",
  storageBucket: "insti-connect.firebasestorage.app",
  messagingSenderId: "32568655000",
  appId: "1:32568655000:web:fc28075b779609595ae4ed",
  measurementId: "G-D0D7EWTRFH",
};

export const isFirebaseConfigured = () => true;

const app = initializeApp(FIREBASE_CONFIG);
export const auth = getAuth(app);
export const db = getFirestore(app);

export async function requestNotificationPermission(): Promise<string | null> {
  if (typeof window === "undefined" || !("Notification" in window)) return null;
  try {
    const permission = await Notification.requestPermission();
    if (permission !== "granted") return null;
    console.log(
      "[FCM] Permission granted -- add VAPID key to enable token fetch",
    );
    return "permission-granted";
  } catch (e) {
    console.warn("[FCM] Failed to request permission", e);
    return null;
  }
}

export function onForegroundMessage(
  _callback: (payload: unknown) => void,
): () => void {
  return () => {};
}

export default { FIREBASE_CONFIG, isFirebaseConfigured };
