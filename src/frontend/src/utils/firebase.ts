// Firebase integration -- paste your credentials below to activate
export const FIREBASE_CONFIG = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT_ID.appspot.com",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID",
};

export const isFirebaseConfigured = () =>
  FIREBASE_CONFIG.apiKey !== "YOUR_API_KEY" &&
  FIREBASE_CONFIG.projectId !== "YOUR_PROJECT_ID";

// Lazily initialize Firebase only when credentials are present
let _app: unknown = null;
let _auth: unknown = null;
let _db: unknown = null;
let _messaging: unknown = null;

async function getFirebaseModules() {
  if (!isFirebaseConfigured()) return null;
  try {
    const [{ initializeApp }, { getAuth }, { getFirestore }] =
      await Promise.all([
        import("firebase/app" as string),
        import("firebase/auth" as string),
        import("firebase/firestore" as string),
      ]);
    if (!_app) _app = initializeApp(FIREBASE_CONFIG);
    if (!_auth) _auth = getAuth(_app as any);
    if (!_db) _db = getFirestore(_app as any);
    return { app: _app, auth: _auth, db: _db };
  } catch {
    return null;
  }
}

// Synchronous exports for backwards compat -- will be null until configured
export let auth: any = null;
export let db: any = null;
export let messaging: any = null;

// Initialize if configured
if (isFirebaseConfigured()) {
  getFirebaseModules().then((mods) => {
    if (mods) {
      auth = mods.auth;
      db = mods.db;
    }
  });
}

export async function requestNotificationPermission(): Promise<string | null> {
  if (!isFirebaseConfigured()) return null;
  if (typeof window === "undefined" || !("Notification" in window)) return null;
  try {
    const permission = await Notification.requestPermission();
    if (permission !== "granted") return null;
    // FCM messaging -- requires firebase/messaging and a VAPID key
    // Add your VAPID key and uncomment when ready:
    // const { getMessaging, getToken } = await import('firebase/messaging');
    // const msg = getMessaging(_app as any);
    // return getToken(msg, { vapidKey: 'YOUR_VAPID_KEY' });
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
  // Wire up after adding firebase/messaging dependency
  return () => {};
}

export default { FIREBASE_CONFIG, isFirebaseConfigured };
