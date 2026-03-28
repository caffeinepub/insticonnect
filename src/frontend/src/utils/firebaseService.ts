import {
  Timestamp,
  addDoc,
  arrayRemove,
  arrayUnion,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  limit,
  onSnapshot,
  orderBy,
  query,
  runTransaction,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
} from "firebase/firestore";
import type {
  Comment,
  Discussion,
  Highlight,
  Plan,
  Post,
  Story,
  User,
} from "../mockData";
import { db } from "./firebase";

// ---- Posts ----
export async function addPost(post: Omit<Post, "id">): Promise<string> {
  try {
    const ref = await addDoc(collection(db, "posts"), {
      ...post,
      createdAt: serverTimestamp(),
    });
    console.log("[Firestore] Post saved:", ref.id);
    return ref.id;
  } catch (e) {
    console.error("[Firestore] addPost failed", e);
    throw e;
  }
}

export async function deletePost(postId: string): Promise<void> {
  try {
    await deleteDoc(doc(db, "posts", postId));
    console.log("[Firestore] Post deleted:", postId);
  } catch (e) {
    console.error("[Firestore] deletePost failed", e);
  }
}

export async function toggleLike(
  postId: string,
  uid: string,
  isLiking: boolean,
): Promise<void> {
  try {
    const postRef = doc(db, "posts", postId);
    await runTransaction(db, async (transaction) => {
      const postSnap = await transaction.get(postRef);
      if (!postSnap.exists()) return;
      const likedBy: string[] = postSnap.data().likedBy ?? [];
      const alreadyLiked = likedBy.includes(uid);
      // Enforce one-like-per-user: no-op if state already matches
      if (isLiking && alreadyLiked) return;
      if (!isLiking && !alreadyLiked) return;
      const newLikedBy = isLiking
        ? [...likedBy, uid]
        : likedBy.filter((id) => id !== uid);
      transaction.update(postRef, {
        likedBy: newLikedBy,
        likes: newLikedBy.length,
      });
    });
    console.log("[Firestore] Like toggled:", postId, isLiking);
  } catch (e) {
    console.error("[Firestore] toggleLike failed", e);
  }
}

export async function likePost(
  postId: string,
  uid: string,
  isLiking: boolean,
): Promise<void> {
  return toggleLike(postId, uid, isLiking);
}

export async function savePost(postId: string, saved: boolean): Promise<void> {
  try {
    await updateDoc(doc(db, "posts", postId), { saved });
  } catch (e) {
    console.error("[Firestore] savePost failed", e);
  }
}

export function subscribeToPosts(
  callback: (posts: Post[]) => void,
  uid?: string,
): () => void {
  try {
    const q = query(collection(db, "posts"), orderBy("createdAt", "desc"));
    return onSnapshot(
      q,
      (snap) => {
        const posts = snap.docs.map((d) => {
          const data = d.data();
          const likedBy: string[] = data.likedBy ?? [];
          return {
            ...data,
            id: d.id,
            liked: uid ? likedBy.includes(uid) : false,
            likes: likedBy.length,
            comments: data.comments ?? [],
          } as Post;
        });
        console.log("[Firestore] Posts snapshot:", posts.length);
        callback(posts);
      },
      (err) => console.error("[Firestore] subscribeToPosts error", err),
    );
  } catch (e) {
    console.error("[Firestore] subscribeToPosts setup failed", e);
    return () => {};
  }
}

export function subscribeToUserPosts(
  userId: string,
  callback: (posts: Post[]) => void,
  uid?: string,
): () => void {
  try {
    const q = query(
      collection(db, "posts"),
      where("userId", "==", userId),
      orderBy("createdAt", "desc"),
    );
    return onSnapshot(
      q,
      (snap) => {
        const posts = snap.docs.map((d) => {
          const data = d.data();
          const likedBy: string[] = data.likedBy ?? [];
          return {
            ...data,
            id: d.id,
            liked: uid ? likedBy.includes(uid) : false,
            likes: likedBy.length,
            comments: data.comments ?? [],
          } as Post;
        });
        console.log("[Firestore] User posts snapshot:", posts.length);
        callback(posts);
      },
      (err) => console.error("[Firestore] subscribeToUserPosts error", err),
    );
  } catch (e) {
    console.error("[Firestore] subscribeToUserPosts setup failed", e);
    return () => {};
  }
}

export function subscribeToTaggedPosts(
  username: string,
  callback: (posts: Post[]) => void,
  uid?: string,
): () => void {
  try {
    const q = query(
      collection(db, "posts"),
      where("taggedUsers", "array-contains", username),
      orderBy("createdAt", "desc"),
    );
    return onSnapshot(
      q,
      (snap) => {
        const posts = snap.docs.map((d) => {
          const data = d.data();
          const likedBy: string[] = data.likedBy ?? [];
          return {
            ...data,
            id: d.id,
            liked: uid ? likedBy.includes(uid) : false,
            likes: likedBy.length,
            comments: data.comments ?? [],
          } as Post;
        });
        callback(posts);
      },
      (err) => console.error("[Firestore] subscribeToTaggedPosts error", err),
    );
  } catch (e) {
    console.error("[Firestore] subscribeToTaggedPosts setup failed", e);
    return () => {};
  }
}

export function subscribeToUserProfile(
  uid: string,
  callback: (user: User) => void,
): () => void {
  try {
    return onSnapshot(
      doc(db, "users", uid),
      (snap) => {
        if (snap.exists()) {
          callback({ ...snap.data(), id: snap.id } as User);
        }
      },
      (err) => console.error("[Firestore] subscribeToUserProfile error", err),
    );
  } catch (e) {
    console.error("[Firestore] subscribeToUserProfile setup failed", e);
    return () => {};
  }
}

// ---- Comments ----
export async function addComment(
  postId: string,
  comment: { username: string; avatar: string; text: string; userId: string },
): Promise<void> {
  try {
    await addDoc(collection(db, "posts", postId, "comments"), {
      ...comment,
      createdAt: serverTimestamp(),
      likes: 0,
    });
    console.log("[Firestore] Comment added to post:", postId);
  } catch (e) {
    console.error("[Firestore] addComment failed", e);
    throw e;
  }
}

export function subscribeToComments(
  postId: string,
  callback: (comments: Comment[]) => void,
): () => void {
  try {
    const q = query(
      collection(db, "posts", postId, "comments"),
      orderBy("createdAt", "asc"),
    );
    return onSnapshot(
      q,
      (snap) => {
        const comments = snap.docs.map((d) => {
          const data = d.data();
          return {
            id: d.id,
            username: data.username,
            avatar: data.avatar,
            text: data.text,
            time: data.createdAt?.toDate
              ? timeAgo(data.createdAt.toDate())
              : "just now",
            likes: data.likes ?? 0,
          } as Comment;
        });
        callback(comments);
      },
      (err) => console.error("[Firestore] subscribeToComments error", err),
    );
  } catch (e) {
    console.error("[Firestore] subscribeToComments setup failed", e);
    return () => {};
  }
}

function timeAgo(date: Date): string {
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
  if (seconds < 60) return "just now";
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h`;
  return `${Math.floor(seconds / 86400)}d`;
}

// ---- Stories ----
export async function addStory(story: Omit<Story, "id">): Promise<void> {
  try {
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
    const ref = await addDoc(collection(db, "stories"), {
      ...story,
      createdAt: serverTimestamp(),
      expiresAt: Timestamp.fromDate(expiresAt),
    });
    console.log("[Firestore] Story saved:", ref.id);
  } catch (e) {
    console.error("[Firestore] addStory failed", e);
    throw e;
  }
}

export async function deleteStory(storyId: string): Promise<void> {
  try {
    await deleteDoc(doc(db, "stories", storyId));
  } catch (e) {
    console.error("[Firestore] deleteStory failed", e);
  }
}

export function subscribeToStories(
  callback: (stories: Story[]) => void,
): () => void {
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
        console.log("[Firestore] Stories snapshot:", stories.length);
        callback(stories);
      },
      (err) => console.error("[Firestore] subscribeToStories error", err),
    );
  } catch (e) {
    console.error("[Firestore] subscribeToStories setup failed", e);
    return () => {};
  }
}

// ---- User Profile ----
export async function getUserById(uid: string): Promise<User | null> {
  try {
    const snap = await getDoc(doc(db, "users", uid));
    if (!snap.exists()) return null;
    return { ...snap.data(), id: snap.id } as User;
  } catch (e) {
    console.error("[Firestore] getUserById failed", e);
    return null;
  }
}

export async function updateUserProfile(
  uid: string,
  data: Record<string, unknown>,
): Promise<void> {
  try {
    await updateDoc(doc(db, "users", uid), data);
    console.log("[Firestore] User profile updated:", uid);
  } catch (e) {
    console.error("[Firestore] updateUserProfile failed", e);
  }
}

// ---- Highlights ----
export function subscribeToHighlights(
  uid: string,
  callback: (highlights: Highlight[]) => void,
): () => void {
  try {
    const q = query(
      collection(db, "users", uid, "highlights"),
      orderBy("createdAt", "desc"),
    );
    return onSnapshot(
      q,
      (snap) => {
        const highlights = snap.docs.map(
          (d) => ({ ...d.data(), id: d.id }) as Highlight,
        );
        callback(highlights);
      },
      (err) => console.error("[Firestore] subscribeToHighlights error", err),
    );
  } catch (e) {
    console.error("[Firestore] subscribeToHighlights setup failed", e);
    return () => {};
  }
}

export async function addHighlight(
  uid: string,
  highlight: Omit<Highlight, "id">,
): Promise<void> {
  try {
    const ref = await addDoc(collection(db, "users", uid, "highlights"), {
      ...highlight,
      createdAt: serverTimestamp(),
    });
    console.log("[Firestore] Highlight added:", ref.id);
  } catch (e) {
    console.error("[Firestore] addHighlight failed", e);
    throw e;
  }
}

export async function deleteHighlight(
  uid: string,
  highlightId: string,
): Promise<void> {
  try {
    await deleteDoc(doc(db, "users", uid, "highlights", highlightId));
  } catch (e) {
    console.error("[Firestore] deleteHighlight failed", e);
  }
}

// ---- Messages ----
export async function sendMessage(
  chatId: string,
  message: Record<string, unknown>,
): Promise<void> {
  try {
    const ref = await addDoc(collection(db, "chats", chatId, "messages"), {
      ...message,
      createdAt: serverTimestamp(),
    });
    // Update last message in chat doc
    await setDoc(
      doc(db, "chats", chatId),
      {
        lastMessage: message.text ?? "",
        lastTime: serverTimestamp(),
        updatedAt: serverTimestamp(),
      },
      { merge: true },
    );
    console.log("[Firestore] Message sent:", ref.id);
  } catch (e) {
    console.error("[Firestore] sendMessage failed", e);
  }
}

export function subscribeToMessages(
  chatId: string,
  callback: (msgs: Record<string, unknown>[]) => void,
): () => void {
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
      (err) => console.error("[Firestore] subscribeToMessages error", err),
    );
  } catch (e) {
    console.error("[Firestore] subscribeToMessages setup failed", e);
    return () => {};
  }
}

export function subscribeToUserChats(
  uid: string,
  callback: (chats: Record<string, unknown>[]) => void,
): () => void {
  try {
    const q = query(
      collection(db, "chats"),
      where("participants", "array-contains", uid),
      orderBy("updatedAt", "desc"),
    );
    return onSnapshot(
      q,
      (snap) => {
        const chats = snap.docs.map((d) => ({ ...d.data(), id: d.id }));
        callback(chats);
      },
      (err) => console.error("[Firestore] subscribeToUserChats error", err),
    );
  } catch (e) {
    console.error("[Firestore] subscribeToUserChats setup failed", e);
    return () => {};
  }
}

// ---- Delete Message ----
export async function deleteMessage(
  chatId: string,
  messageId: string,
): Promise<void> {
  try {
    await deleteDoc(doc(db, "chats", chatId, "messages", messageId));
  } catch (e) {
    console.error("[Firestore] deleteMessage failed", e);
  }
}

// ---- Notifications ----
export function subscribeToNotifications(
  uid: string,
  callback: (notifications: Record<string, unknown>[]) => void,
): () => void {
  try {
    const q = query(
      collection(db, "notifications"),
      where("userId", "==", uid),
      orderBy("createdAt", "desc"),
    );
    return onSnapshot(
      q,
      (snap) => {
        const notifs = snap.docs.map((d) => ({ ...d.data(), id: d.id }));
        callback(notifs);
      },
      (err) => console.error("[Firestore] subscribeToNotifications error", err),
    );
  } catch (e) {
    console.error("[Firestore] subscribeToNotifications setup failed", e);
    return () => {};
  }
}

// ---- Plans ----
export async function addPlan(plan: Omit<Plan, "id">): Promise<string> {
  try {
    const ref = await addDoc(collection(db, "plans"), {
      ...plan,
      createdAt: serverTimestamp(),
    });
    console.log("[Firestore] Plan created:", ref.id);
    return ref.id;
  } catch (e) {
    console.error("[Firestore] addPlan failed", e);
    throw e;
  }
}

export async function updatePlan(
  planId: string,
  data: Record<string, unknown>,
): Promise<void> {
  try {
    await updateDoc(doc(db, "plans", planId), data);
  } catch (e) {
    console.error("[Firestore] updatePlan failed", e);
  }
}

export async function deletePlan(planId: string): Promise<void> {
  try {
    await deleteDoc(doc(db, "plans", planId));
  } catch (e) {
    console.error("[Firestore] deletePlan failed", e);
  }
}

export function subscribePlans(callback: (plans: Plan[]) => void): () => void {
  try {
    const q = query(collection(db, "plans"), orderBy("createdAt", "desc"));
    return onSnapshot(
      q,
      (snap) => {
        const plans = snap.docs.map((d) => ({ ...d.data(), id: d.id }) as Plan);
        console.log("[Firestore] Plans snapshot:", plans.length);
        callback(plans);
      },
      (err) => console.error("[Firestore] subscribePlans error", err),
    );
  } catch (e) {
    console.error("[Firestore] subscribePlans setup failed", e);
    return () => {};
  }
}

// ---- Discussions ----
export async function addDiscussion(
  d: Omit<Discussion, "id">,
): Promise<string> {
  try {
    const ref = await addDoc(collection(db, "discussions"), {
      ...d,
      createdAt: serverTimestamp(),
    });
    console.log("[Firestore] Discussion created:", ref.id);
    return ref.id;
  } catch (e) {
    console.error("[Firestore] addDiscussion failed", e);
    throw e;
  }
}

export function subscribeDiscussions(
  callback: (items: Discussion[]) => void,
): () => void {
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
        console.log("[Firestore] Discussions snapshot:", items.length);
        callback(items);
      },
      (err) => console.error("[Firestore] subscribeDiscussions error", err),
    );
  } catch (e) {
    console.error("[Firestore] subscribeDiscussions setup failed", e);
    return () => {};
  }
}

// ---- Fundaes ----
export async function addFundae(
  fundae: Record<string, unknown>,
): Promise<void> {
  try {
    const ref = await addDoc(collection(db, "fundaes"), {
      ...fundae,
      createdAt: serverTimestamp(),
    });
    console.log("[Firestore] Fundae created:", ref.id);
  } catch (e) {
    console.error("[Firestore] addFundae failed", e);
    throw e;
  }
}

export function subscribeToFundaes(
  callback: (fundaes: Record<string, unknown>[]) => void,
): () => void {
  try {
    const q = query(collection(db, "fundaes"), orderBy("createdAt", "desc"));
    return onSnapshot(
      q,
      (snap) => {
        const items = snap.docs.map((d) => ({ ...d.data(), id: d.id }));
        callback(items);
      },
      (err) => console.error("[Firestore] subscribeToFundaes error", err),
    );
  } catch (e) {
    console.error("[Firestore] subscribeToFundaes setup failed", e);
    return () => {};
  }
}

// ---- Notifications (create + unread count) ----
export async function createNotification(data: {
  userId: string;
  senderId: string;
  senderName: string;
  senderAvatar: string;
  type: "like" | "comment" | "follow" | "tag" | "share";
  postId?: string;
  postImage?: string;
  text?: string;
}): Promise<void> {
  try {
    await addDoc(collection(db, "notifications"), {
      ...data,
      createdAt: serverTimestamp(),
      isRead: false,
    });
  } catch (e) {
    console.error("[Firestore] createNotification failed", e);
  }
}

export function subscribeToUnreadNotificationCount(
  uid: string,
  callback: (count: number) => void,
): () => void {
  try {
    const q = query(
      collection(db, "notifications"),
      where("userId", "==", uid),
      where("isRead", "==", false),
    );
    return onSnapshot(
      q,
      (snap) => callback(snap.size),
      (err) =>
        console.error(
          "[Firestore] subscribeToUnreadNotificationCount error",
          err,
        ),
    );
  } catch (e) {
    console.error(
      "[Firestore] subscribeToUnreadNotificationCount setup failed",
      e,
    );
    return () => {};
  }
}

export async function markNotificationRead(notifId: string): Promise<void> {
  try {
    await updateDoc(doc(db, "notifications", notifId), { isRead: true });
  } catch (e) {
    console.error("[Firestore] markNotificationRead failed", e);
  }
}

export function subscribeToNotificationsFixed(
  uid: string,
  callback: (notifications: Record<string, unknown>[]) => void,
): () => void {
  try {
    const q = query(
      collection(db, "notifications"),
      where("userId", "==", uid),
      orderBy("createdAt", "desc"),
    );
    return onSnapshot(
      q,
      (snap) => {
        const notifs = snap.docs.map((d) => ({ ...d.data(), id: d.id }));
        callback(notifs);
      },
      (err) =>
        console.error("[Firestore] subscribeToNotificationsFixed error", err),
    );
  } catch (e) {
    console.error("[Firestore] subscribeToNotificationsFixed setup failed", e);
    return () => {};
  }
}

// ---- Follow system ----
export async function followUser(
  followerId: string,
  followingId: string,
): Promise<void> {
  try {
    const docId = `${followerId}_${followingId}`;
    await setDoc(doc(db, "follows", docId), {
      followerId,
      followingId,
      createdAt: serverTimestamp(),
    });
    await updateDoc(doc(db, "users", followingId), {
      followers:
        (await getDoc(doc(db, "users", followingId))).data()?.followers + 1 ||
        1,
    });
    await updateDoc(doc(db, "users", followerId), {
      following:
        (await getDoc(doc(db, "users", followerId))).data()?.following + 1 || 1,
    });
  } catch (e) {
    console.error("[Firestore] followUser failed", e);
    throw e;
  }
}

export async function unfollowUser(
  followerId: string,
  followingId: string,
): Promise<void> {
  try {
    const docId = `${followerId}_${followingId}`;
    await deleteDoc(doc(db, "follows", docId));
    const fSnap = await getDoc(doc(db, "users", followingId));
    const erSnap = await getDoc(doc(db, "users", followerId));
    await updateDoc(doc(db, "users", followingId), {
      followers: Math.max(0, (fSnap.data()?.followers ?? 1) - 1),
    });
    await updateDoc(doc(db, "users", followerId), {
      following: Math.max(0, (erSnap.data()?.following ?? 1) - 1),
    });
  } catch (e) {
    console.error("[Firestore] unfollowUser failed", e);
    throw e;
  }
}

export async function isFollowingUser(
  followerId: string,
  followingId: string,
): Promise<boolean> {
  try {
    const snap = await getDoc(
      doc(db, "follows", `${followerId}_${followingId}`),
    );
    return snap.exists();
  } catch (e) {
    console.error("[Firestore] isFollowingUser failed", e);
    return false;
  }
}

// ---- getOrCreateChat ----
export async function getOrCreateChat(
  uid1: string,
  uid2: string,
  names: Record<string, string>,
  avatars: Record<string, string>,
): Promise<string> {
  const sorted = [uid1, uid2].sort();
  const chatId = `${sorted[0]}_${sorted[1]}`;
  try {
    const snap = await getDoc(doc(db, "chats", chatId));
    if (!snap.exists()) {
      await setDoc(doc(db, "chats", chatId), {
        participants: [uid1, uid2],
        participantNames: names,
        participantAvatars: avatars,
        lastMessage: "",
        updatedAt: serverTimestamp(),
      });
    }
    return chatId;
  } catch (e) {
    console.error("[Firestore] getOrCreateChat failed", e);
    throw e;
  }
}

// ---- getUserByUsername ----
export async function getUserByUsername(
  username: string,
): Promise<User | null> {
  try {
    const q = query(
      collection(db, "users"),
      where("username", "==", username.toLowerCase()),
      limit(1),
    );
    const snap = await getDocs(q);
    if (snap.empty) return null;
    return { ...snap.docs[0].data(), id: snap.docs[0].id } as User;
  } catch (e) {
    console.error("[Firestore] getUserByUsername failed", e);
    return null;
  }
}

// ---- Save new user profile (for username setup after Google sign-in) ----
export async function saveNewUserProfile(
  uid: string,
  profile: User,
): Promise<void> {
  await setDoc(doc(db, "users", uid), {
    ...profile,
    createdAt: serverTimestamp(),
  });
}

// ---- Search users by username prefix ----
export async function searchUsersByUsername(
  prefix: string,
  excludeUid: string,
): Promise<User[]> {
  try {
    const term = prefix.toLowerCase().trim();
    const q = term
      ? query(
          collection(db, "users"),
          where("username", ">=", term),
          where("username", "<=", `${term}\uf8ff`),
          limit(20),
        )
      : query(collection(db, "users"), limit(30));
    const snap = await getDocs(q);
    return snap.docs
      .filter((d) => d.id !== excludeUid)
      .map((d) => ({ ...d.data(), id: d.id }) as User);
  } catch (e) {
    console.error("[Firestore] searchUsersByUsername failed", e);
    return [];
  }
}
