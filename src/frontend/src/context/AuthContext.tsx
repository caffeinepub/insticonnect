import {
  type User as FirebaseUser,
  GoogleAuthProvider,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signInWithPopup,
} from "firebase/auth";
import { doc, getDoc, serverTimestamp, setDoc } from "firebase/firestore";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import type { ReactNode } from "react";
import { currentUser as mockCurrentUser } from "../mockData";
import type { User } from "../mockData";
import { auth, db, isFirebaseConfigured } from "../utils/firebase";

interface AuthContextType {
  currentFirebaseUser: FirebaseUser | null;
  userProfile: User | null;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (
    email: string,
    password: string,
    username: string,
    displayName: string,
  ) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType>(null!);
export const useAuth = () => useContext(AuthContext);

const googleProvider = new GoogleAuthProvider();

export function AuthProvider({ children }: { children: ReactNode }) {
  const [currentFirebaseUser, setCurrentFirebaseUser] =
    useState<FirebaseUser | null>(null);
  const [userProfile, setUserProfile] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchUserProfile = useCallback(
    async (fbUser: FirebaseUser): Promise<User> => {
      if (!isFirebaseConfigured()) return mockCurrentUser;
      try {
        const snap = await getDoc(doc(db, "users", fbUser.uid));
        if (snap.exists()) {
          return snap.data() as User;
        }
        // Create default profile from Firebase user
        const profile: User = {
          id: fbUser.uid,
          name: fbUser.displayName ?? "InstiConnect User",
          username:
            fbUser.email?.split("@")[0].replace(/[^a-z0-9_]/gi, "_") ?? "user",
          email: fbUser.email ?? "",
          avatar:
            fbUser.photoURL ??
            `https://picsum.photos/seed/${fbUser.uid}/100/100`,
          bio: "Hey, I'm on InstiConnect!",
          followers: 0,
          following: 0,
          posts: 0,
        };
        await setDoc(doc(db, "users", fbUser.uid), {
          ...profile,
          createdAt: serverTimestamp(),
        });
        return profile;
      } catch (e) {
        console.warn("[AuthContext] fetchUserProfile failed", e);
        return mockCurrentUser;
      }
    },
    [],
  );

  useEffect(() => {
    if (!isFirebaseConfigured()) {
      setLoading(false);
      return;
    }
    const unsub = onAuthStateChanged(auth, async (fbUser) => {
      setCurrentFirebaseUser(fbUser);
      if (fbUser) {
        const profile = await fetchUserProfile(fbUser);
        setUserProfile(profile);
      } else {
        setUserProfile(null);
      }
      setLoading(false);
    });
    return unsub;
  }, [fetchUserProfile]);

  const signIn = async (email: string, password: string) => {
    if (!isFirebaseConfigured())
      throw new Error(
        "Firebase not configured. Add credentials to firebase.ts",
      );
    await signInWithEmailAndPassword(auth, email, password);
  };

  const signUp = async (
    email: string,
    password: string,
    username: string,
    displayName: string,
  ) => {
    if (!isFirebaseConfigured())
      throw new Error(
        "Firebase not configured. Add credentials to firebase.ts",
      );
    const cred = await createUserWithEmailAndPassword(auth, email, password);
    const profile: User = {
      id: cred.user.uid,
      name: displayName,
      username,
      email,
      avatar: `https://picsum.photos/seed/${cred.user.uid}/100/100`,
      bio: "Hey, I'm on InstiConnect!",
      followers: 0,
      following: 0,
      posts: 0,
    };
    await setDoc(doc(db, "users", cred.user.uid), {
      ...profile,
      createdAt: serverTimestamp(),
    });
    setUserProfile(profile);
  };

  const signInWithGoogle = async () => {
    if (!isFirebaseConfigured())
      throw new Error(
        "Firebase not configured. Add credentials to firebase.ts",
      );
    await signInWithPopup(auth, googleProvider);
  };

  const signOut = async () => {
    if (!isFirebaseConfigured()) return;
    await firebaseSignOut(auth);
    setCurrentFirebaseUser(null);
    setUserProfile(null);
  };

  return (
    <AuthContext.Provider
      value={{
        currentFirebaseUser,
        userProfile,
        signIn,
        signUp,
        signInWithGoogle,
        signOut,
        loading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
