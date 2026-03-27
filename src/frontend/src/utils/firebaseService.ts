import {
  Timestamp,
  addDoc,
  collection,
  doc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
  where,
} from "firebase/firestore";
import type { Post, Story } from "../mockData";
import type { Discussion, Plan } from "../mockData";
import { db, isFirebaseConfigured } from "./firebase";

// ---- Posts ----
export async function addPost(post: Post): Promise<void> {
  if (!isFirebaseConfigured()) return;
  try {
    await addDoc(collection(db, "posts"), {
      ...post,
      createdAt: serverTimestamp(),
    });
  } catch (e) {
    console.warn("[Firebase] addPost failed", e);
  }
}

export function subscribeToPosts(
  callback: (posts: Post[]) => void,
): () => void {
  if (!isFirebaseConfigured()) return () => {};
  try {
    const q = query(collection(db, "posts"), orderBy("createdAt", "desc"));
    return onSnapshot(
      q,
      (snap) => {
        const posts = snap.docs.map((d) => ({ ...d.data(), id: d.id }) as Post);
        callback(posts);
      },
      (err) => console.warn("[Firebase] subscribeToPosts error", err),
    );
  } catch (e) {
    console.warn("[Firebase] subscribeToPosts setup failed", e);
    return () => {};
  }
}

// ---- Stories ----
export async function addStory(story: Story): Promise<void> {
  if (!isFirebaseConfigured()) return;
  try {
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
    await addDoc(collection(db, "stories"), {
      ...story,
      createdAt: serverTimestamp(),
      expiresAt: Timestamp.fromDate(expiresAt),
    });
  } catch (e) {
    console.warn("[Firebase] addStory failed", e);
  }
}

export function subscribeToStories(
  callback: (stories: Story[]) => void,
): () => void {
  if (!isFirebaseConfigured()) return () => {};
  try {
    const now = Timestamp.now();
    const q = query(
      collection(db, "stories"),
      where("expiresAt", ">", now),
      orderBy("expiresAt", "asc"),
    );
    return onSnapshot(
      q,
      (snap) => {
        const stories = snap.docs.map(
          (d) => ({ ...d.data(), id: d.id }) as Story,
        );
        callback(stories);
      },
      (err) => console.warn("[Firebase] subscribeToStories error", err),
    );
  } catch (e) {
    console.warn("[Firebase] subscribeToStories setup failed", e);
    return () => {};
  }
}

// ---- User Profile ----
export async function updateUserProfile(
  uid: string,
  data: Record<string, unknown>,
): Promise<void> {
  if (!isFirebaseConfigured()) return;
  try {
    await updateDoc(doc(db, "users", uid), data);
  } catch (e) {
    console.warn("[Firebase] updateUserProfile failed", e);
  }
}

// ---- Messages ----
export async function sendMessage(
  chatId: string,
  message: Record<string, unknown>,
): Promise<void> {
  if (!isFirebaseConfigured()) return;
  try {
    await addDoc(collection(db, "chats", chatId, "messages"), {
      ...message,
      createdAt: serverTimestamp(),
    });
  } catch (e) {
    console.warn("[Firebase] sendMessage failed", e);
  }
}

export function subscribeToMessages(
  chatId: string,
  callback: (msgs: Record<string, unknown>[]) => void,
): () => void {
  if (!isFirebaseConfigured()) return () => {};
  try {
    const q = query(
      collection(db, "chats", chatId, "messages"),
      orderBy("createdAt", "asc"),
    );
    return onSnapshot(
      q,
      (snap) => {
        const msgs = snap.docs.map((d) => ({ ...d.data(), id: d.id }));
        callback(msgs);
      },
      (err) => console.warn("[Firebase] subscribeToMessages error", err),
    );
  } catch (e) {
    console.warn("[Firebase] subscribeToMessages setup failed", e);
    return () => {};
  }
}

// ---- Plans ----
export async function addPlan(plan: Plan): Promise<void> {
  if (!isFirebaseConfigured()) return;
  try {
    await addDoc(collection(db, "plans"), {
      ...plan,
      createdAt: serverTimestamp(),
    });
  } catch (e) {
    console.warn("[Firebase] addPlan failed", e);
  }
}

export function subscribePlans(callback: (plans: Plan[]) => void): () => void {
  if (!isFirebaseConfigured()) return () => {};
  try {
    const q = query(collection(db, "plans"), orderBy("createdAt", "desc"));
    return onSnapshot(
      q,
      (snap) => {
        const plans = snap.docs.map((d) => ({ ...d.data(), id: d.id }) as Plan);
        callback(plans);
      },
      (err) => console.warn("[Firebase] subscribePlans error", err),
    );
  } catch (e) {
    console.warn("[Firebase] subscribePlans setup failed", e);
    return () => {};
  }
}

// ---- Discussions ----
export async function addDiscussion(d: Discussion): Promise<void> {
  if (!isFirebaseConfigured()) return;
  try {
    await addDoc(collection(db, "discussions"), {
      ...d,
      createdAt: serverTimestamp(),
    });
  } catch (e) {
    console.warn("[Firebase] addDiscussion failed", e);
  }
}

export function subscribeDiscussions(
  callback: (items: Discussion[]) => void,
): () => void {
  if (!isFirebaseConfigured()) return () => {};
  try {
    const q = query(
      collection(db, "discussions"),
      orderBy("createdAt", "desc"),
    );
    return onSnapshot(
      q,
      (snap) => {
        const items = snap.docs.map(
          (d) => ({ ...d.data(), id: d.id }) as Discussion,
        );
        callback(items);
      },
      (err) => console.warn("[Firebase] subscribeDiscussions error", err),
    );
  } catch (e) {
    console.warn("[Firebase] subscribeDiscussions setup failed", e);
    return () => {};
  }
}
