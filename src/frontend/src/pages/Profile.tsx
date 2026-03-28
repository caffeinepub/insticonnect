import {
  Bookmark,
  Camera,
  Check,
  ChevronRight,
  Clock,
  Grid3X3,
  LogOut,
  MoreHorizontal,
  Settings,
  Smartphone,
  UserCheck,
  X,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useApp } from "../App";
import PostDetailModal from "../components/PostDetailModal";
import StoryViewer from "../components/StoryViewer";
import { useAuth } from "../context/AuthContext";
import type { Highlight, Post, User } from "../mockData";
import { uploadToCloudinary } from "../utils/cloudinary";
import {
  addHighlight as fbAddHighlight,
  deleteHighlight as fbDeleteHighlight,
  deletePost as fbDeletePost,
  updateUserProfile as fbUpdateUserProfile,
  subscribeToHighlights,
  subscribeToTaggedPosts,
  subscribeToUserPosts,
  subscribeToUserProfile,
} from "../utils/firebaseService";

const USERNAME_COOLDOWN_MS = 30 * 24 * 60 * 60 * 1000;

function daysUntilUsernameChange(lastChanged: number | undefined): number {
  if (!lastChanged) return 0;
  const diff = USERNAME_COOLDOWN_MS - (Date.now() - lastChanged);
  return diff > 0 ? Math.ceil(diff / (1000 * 60 * 60 * 24)) : 0;
}

export default function Profile() {
  const {
    theme,
    navigate,
    addToast,
    user: appUser,
    setUser: setAppUser,
  } = useApp();
  const { signOut: firebaseSignOut, currentFirebaseUser } = useAuth();
  const [tab, setTab] = useState<"posts" | "saved" | "tagged">("posts");
  const user: User = appUser ?? {
    id: "",
    name: "",
    username: "",
    email: "",
    avatar: "",
    bio: "",
    followers: 0,
    following: 0,
    posts: 0,
  };
  const [editOpen, setEditOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<Event | null>(null);
  const isIOS = /iphone|ipad|ipod/i.test(navigator.userAgent);

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const handleAddToHome = async () => {
    if (isIOS) {
      addToast('Tap Share → "Add to Home Screen" in Safari', "success");
      return;
    }
    if (!deferredPrompt) {
      addToast("Already installed or not supported in this browser", "success");
      return;
    }
    (deferredPrompt as any).prompt();
    const { outcome } = await (deferredPrompt as any).userChoice;
    if (outcome === "accepted")
      addToast("InstiConnect added to home screen!", "success");
    setDeferredPrompt(null);
  };

  const [myPosts, setMyPosts] = useState<Post[]>([]);
  const [taggedPosts, setTaggedPosts] = useState<Post[]>([]);
  const [liveFollowers, setLiveFollowers] = useState<number>(user.followers);
  const [liveFollowing, setLiveFollowing] = useState<number>(user.following);
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);

  // Subscribe to user's own posts from Firestore (by userId)
  useEffect(() => {
    if (!user.id) return;
    const unsub = subscribeToUserPosts(
      user.id,
      (posts) => setMyPosts(posts),
      user.id,
    );
    return unsub;
  }, [user.id]);

  // Subscribe to tagged posts
  useEffect(() => {
    if (!user.username) return;
    const unsub = subscribeToTaggedPosts(
      user.username,
      (posts) => setTaggedPosts(posts),
      user.id,
    );
    return unsub;
  }, [user.username, user.id]);

  // Live followers/following from Firestore
  useEffect(() => {
    if (!user.id) return;
    const unsub = subscribeToUserProfile(user.id, (profile) => {
      setLiveFollowers(profile.followers ?? 0);
      setLiveFollowing(profile.following ?? 0);
    });
    return unsub;
  }, [user.id]);

  // Subscribe to highlights from Firestore
  const [highlights, setHighlights] = useState<Highlight[]>([]);
  useEffect(() => {
    if (!user.id) return;
    const unsub = subscribeToHighlights(user.id, (items) =>
      setHighlights(items),
    );
    return unsub;
  }, [user.id]);

  const [viewingHighlight, setViewingHighlight] = useState<Highlight | null>(
    null,
  );

  const [editName, setEditName] = useState(user.name);
  const [editUsername, setEditUsername] = useState(user.username);
  const [editBio, setEditBio] = useState(user.bio);
  const [editAvatar, setEditAvatar] = useState(user.avatar);
  const avatarFileRef = useRef<HTMLInputElement>(null);

  const daysLeft = daysUntilUsernameChange(user.usernameLastChanged);
  const canChangeUsername = daysLeft === 0;

  const dark = theme === "dark";
  const text2 = dark ? "text-gray-400" : "text-gray-500";
  const surface = dark ? "bg-[#1A1D27]" : "bg-white";
  const inputBg = dark
    ? "bg-white/8 border-white/10"
    : "bg-gray-50 border-gray-200";

  const openEdit = () => {
    setEditName(user.name);
    setEditUsername(user.username);
    setEditBio(user.bio);
    setEditAvatar(user.avatar);
    setEditOpen(true);
  };

  const handleAvatarSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const localUrl = URL.createObjectURL(file);
    setEditAvatar(localUrl);
    e.target.value = "";
    try {
      const { url } = await uploadToCloudinary(file, "avatars");
      setEditAvatar(url);
    } catch {
      // Keep local blob URL on upload failure
    }
  };

  const handleSave = async () => {
    const trimName = editName.trim();
    const trimUsername = editUsername.trim().replace(/^@/, "");
    const trimBio = editBio.trim();

    if (!trimName) {
      addToast("Name cannot be empty", "error");
      return;
    }
    if (!trimUsername) {
      addToast("Username cannot be empty", "error");
      return;
    }
    if (!/^[a-z0-9_]{3,20}$/.test(trimUsername)) {
      addToast(
        "Username: 3-20 chars, lowercase, numbers, underscores",
        "error",
      );
      return;
    }

    const usernameChanged = trimUsername !== user.username;
    if (usernameChanged && !canChangeUsername) {
      addToast(
        `Username locked for ${daysLeft} more day${daysLeft > 1 ? "s" : ""}`,
        "error",
      );
      return;
    }

    const updated = {
      ...user,
      name: trimName,
      username: trimUsername,
      bio: trimBio,
      avatar: editAvatar,
      usernameLastChanged: usernameChanged
        ? Date.now()
        : user.usernameLastChanged,
    };
    setAppUser(updated);
    if (currentFirebaseUser) {
      await fbUpdateUserProfile(currentFirebaseUser.uid, updated);
    }
    setEditOpen(false);
    addToast("Profile updated!", "success");
  };

  const handleSignOut = async () => {
    await firebaseSignOut();
    setAppUser(null);
    navigate("login");
  };

  const handlePostUpdate = (updated: Post) => {
    setMyPosts((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
    if (selectedPost?.id === updated.id) setSelectedPost(updated);
  };

  const handlePostDelete = (postId: string) => {
    fbDeletePost(postId);
    // Firestore subscription will update state automatically
  };

  return (
    <div className="page-fade pb-20">
      {/* Top bar */}
      <div className="flex items-center justify-between px-4 pt-4 pb-2">
        <h2 className="text-xl font-bold">{user.username}</h2>
        <div className="flex items-center gap-1">
          <div className="relative">
            <button
              type="button"
              onClick={() => setMenuOpen((v) => !v)}
              className={`p-2 rounded-full ${
                dark ? "hover:bg-white/10" : "hover:bg-gray-100"
              } transition-all active:scale-90`}
              data-ocid="profile.open_modal_button"
            >
              <MoreHorizontal size={22} className="opacity-70" />
            </button>
            {menuOpen && (
              <>
                {/* biome-ignore lint/a11y/useKeyWithClickEvents: menu backdrop */}
                <div
                  className="fixed inset-0 z-[55]"
                  onClick={() => setMenuOpen(false)}
                />
                <div
                  className={`absolute right-0 top-full mt-1 rounded-2xl shadow-2xl border z-[56] min-w-[160px] overflow-hidden ${
                    dark
                      ? "bg-[#1A1D27] border-white/10"
                      : "bg-white border-gray-100"
                  }`}
                  data-ocid="profile.dropdown_menu"
                >
                  <button
                    type="button"
                    onClick={() => {
                      setMenuOpen(false);
                      navigate("settings");
                    }}
                    className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-semibold ${
                      dark ? "text-gray-200" : "text-gray-700"
                    }`}
                    data-ocid="profile.link"
                  >
                    <Settings size={16} /> Settings
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setMenuOpen(false);
                      addToast("Archive coming soon!", "success");
                    }}
                    className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-semibold ${
                      dark ? "text-gray-200" : "text-gray-700"
                    }`}
                    data-ocid="profile.link"
                  >
                    <Bookmark size={16} /> Archive
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setMenuOpen(false);
                      void handleSignOut();
                    }}
                    className="w-full flex items-center gap-3 px-4 py-3 text-sm font-semibold text-red-500"
                    data-ocid="profile.delete_button"
                  >
                    <LogOut size={16} /> Sign Out
                  </button>
                </div>
              </>
            )}
          </div>
          <button
            type="button"
            onClick={() => navigate("settings")}
            className={`p-2 rounded-full ${
              dark ? "hover:bg-white/10" : "hover:bg-gray-100"
            } transition-all active:scale-90`}
            data-ocid="profile.link"
          >
            <Settings size={22} className="opacity-70" />
          </button>
        </div>
      </div>

      {/* Profile card */}
      <div
        className={`${surface} mx-4 rounded-3xl overflow-hidden shadow-lg mb-4`}
      >
        <div
          className="h-24 relative"
          style={{ background: "linear-gradient(135deg,#7C3AED,#D946EF)" }}
        >
          <div className="absolute -bottom-8 left-1/2 -translate-x-1/2">
            <div className="story-ring">
              <div className="story-ring-inner">
                <img
                  src={user.avatar}
                  alt={user.name}
                  className="w-16 h-16 rounded-full object-cover"
                />
              </div>
            </div>
          </div>
        </div>
        <div className="pt-12 pb-5 px-5 text-center">
          <h2 className="font-bold text-lg">{user.name}</h2>
          <p className={`text-sm ${text2}`}>@{user.username}</p>
          <p className={`text-sm mt-2 ${text2}`}>{user.bio}</p>
          <div className="flex justify-center flex-wrap gap-1.5 mt-3">
            {user.badges?.map((b) => (
              <span
                key={b}
                className="text-xs px-3 py-1 rounded-full bg-purple-100 dark:bg-purple-900/30 text-purple-600 font-medium"
              >
                {b}
              </span>
            ))}
          </div>
          <div
            className="grid grid-cols-3 gap-4 mt-5 pt-4 border-t"
            style={{ borderColor: dark ? "rgba(255,255,255,0.05)" : "#f3f4f6" }}
          >
            {[
              { label: "Posts", value: myPosts.length },
              { label: "Followers", value: liveFollowers },
              { label: "Following", value: liveFollowing },
            ].map((s) => (
              <div key={s.label}>
                <p className="font-bold text-xl">{s.value.toLocaleString()}</p>
                <p className={`text-xs ${text2}`}>{s.label}</p>
              </div>
            ))}
          </div>
          <button
            type="button"
            onClick={openEdit}
            className={`mt-4 w-full py-2.5 rounded-xl text-sm font-semibold transition-all flex items-center justify-center gap-2 ${
              dark ? "bg-white/10 text-gray-200" : "bg-gray-100 text-gray-700"
            }`}
            data-ocid="profile.edit_button"
          >
            Edit Profile <ChevronRight size={16} className="opacity-60" />
          </button>
          {(deferredPrompt !== null || isIOS) && (
            <button
              type="button"
              onClick={handleAddToHome}
              className="mt-2 w-full py-2.5 rounded-xl text-sm font-semibold transition-all flex items-center justify-center gap-2 bg-gradient-to-r from-purple-600 to-pink-500 text-white"
              data-ocid="profile.button"
            >
              <Smartphone size={15} />
              Add to Home Screen
            </button>
          )}
        </div>
      </div>

      {/* Story Highlights */}
      <div className="px-4 mb-4">
        <div className="flex gap-4 overflow-x-auto no-scrollbar pb-1">
          {highlights.map((h) => (
            <button
              key={h.id}
              type="button"
              onClick={() => setViewingHighlight(h)}
              className="flex flex-col items-center gap-1.5 flex-shrink-0 active:scale-95 transition-transform"
              data-ocid="profile.button"
            >
              <div
                className="w-16 h-16 rounded-full p-0.5"
                style={{
                  background: "linear-gradient(135deg,#7C3AED,#EC4899)",
                }}
              >
                <div
                  className={`w-full h-full rounded-full p-0.5 ${
                    dark ? "bg-[#0F0F1A]" : "bg-white"
                  }`}
                >
                  {h.coverImage ? (
                    <img
                      src={h.coverImage}
                      alt={h.title}
                      className="w-full h-full rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full rounded-full bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center text-xl">
                      {h.emoji}
                    </div>
                  )}
                </div>
              </div>
              <span className={`text-xs font-medium ${text2}`}>{h.title}</span>
            </button>
          ))}
          {/* Add new highlight */}
          <button
            type="button"
            className="flex flex-col items-center gap-1.5 flex-shrink-0 active:scale-95 transition-transform"
            onClick={() => {
              const name = window.prompt("Name for new highlight:");
              if (name?.trim()) {
                addToast(`Highlight "${name.trim()}" created!`, "success");
              }
            }}
            data-ocid="profile.button"
          >
            <div
              className={`w-16 h-16 rounded-full border-2 border-dashed flex items-center justify-center ${
                dark ? "border-white/20" : "border-gray-300"
              }`}
            >
              <span className={`text-2xl font-light ${text2}`}>+</span>
            </div>
            <span className={`text-xs font-medium ${text2}`}>New</span>
          </button>
        </div>
      </div>

      {/* Posts / Saved / Tagged tabs */}
      <div className={`${surface} mx-4 rounded-2xl overflow-hidden shadow-md`}>
        <div
          className={`flex border-b ${dark ? "border-white/5" : "border-gray-100"}`}
        >
          {[
            {
              key: "posts" as const,
              icon: <Grid3X3 size={16} />,
              label: "Posts",
            },
            {
              key: "saved" as const,
              icon: <Bookmark size={16} />,
              label: "Saved",
            },
            {
              key: "tagged" as const,
              icon: <UserCheck size={16} />,
              label: "Tagged",
            },
          ].map((t) => (
            <button
              type="button"
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`flex-1 flex items-center justify-center gap-1.5 py-3 text-sm font-semibold transition-all border-b-2 ${
                tab === t.key
                  ? "border-purple-600 text-purple-600"
                  : `border-transparent ${text2}`
              }`}
              data-ocid="profile.tab"
            >
              {t.icon}
              <span className="text-xs">{t.label}</span>
            </button>
          ))}
        </div>

        {/* Posts grid */}
        {tab === "posts" && (
          <div className="grid grid-cols-3 gap-0.5">
            {myPosts.map((post, i) => (
              <button
                key={post.id}
                type="button"
                onClick={() => setSelectedPost(post)}
                className="aspect-square overflow-hidden relative group"
                data-ocid={`profile.item.${i + 1}`}
              >
                <img
                  src={post.image || post.images?.[0]}
                  alt="post"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-200 flex items-center justify-center opacity-0 group-hover:opacity-100">
                  <div className="flex items-center gap-3 text-white text-xs font-bold">
                    <span>❤️ {post.likes}</span>
                    <span>💬 {post.comments.length}</span>
                  </div>
                </div>
              </button>
            ))}
            {myPosts.length === 0 && (
              <div
                className={`col-span-3 py-12 text-center ${text2}`}
                data-ocid="profile.empty_state"
              >
                <p className="text-3xl mb-2">📷</p>
                <p className="font-semibold">No posts yet</p>
                <p className="text-sm">Share your first photo!</p>
              </div>
            )}
          </div>
        )}

        {/* Saved grid — empty for now */}
        {tab === "saved" && (
          <div
            className={`col-span-3 py-12 text-center ${text2}`}
            data-ocid="profile.empty_state"
          >
            <p className="text-3xl mb-2">🔖</p>
            <p className="font-semibold">No saved posts yet</p>
          </div>
        )}

        {/* Tagged grid */}
        {tab === "tagged" && (
          <div className="grid grid-cols-3 gap-0.5">
            {taggedPosts.length === 0 ? (
              <div
                className={`col-span-3 py-12 text-center ${text2}`}
                data-ocid="profile.empty_state"
              >
                <p className="text-3xl mb-2">🏷️</p>
                <p className="font-semibold">No tagged posts yet</p>
              </div>
            ) : (
              taggedPosts.map((p, i) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => setSelectedPost(p)}
                  className="aspect-square overflow-hidden"
                  data-ocid={`profile.item.${i + 1}`}
                >
                  <img
                    src={p.image || p.images?.[0]}
                    alt="tagged"
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                  />
                </button>
              ))
            )}
          </div>
        )}
      </div>

      {/* Post Detail Modal */}
      {selectedPost && (
        <PostDetailModal
          post={selectedPost}
          onClose={() => setSelectedPost(null)}
          onDelete={handlePostDelete}
          onUpdate={handlePostUpdate}
        />
      )}

      {/* Highlight Viewer */}
      {viewingHighlight && viewingHighlight.stories.length > 0 && (
        <StoryViewer
          stories={viewingHighlight.stories}
          startIndex={0}
          onClose={() => setViewingHighlight(null)}
        />
      )}
      {viewingHighlight && viewingHighlight.stories.length === 0 && (
        <button
          type="button"
          className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center w-full"
          onClick={() => setViewingHighlight(null)}
        >
          <div className="text-center text-white">
            <p className="text-5xl mb-4">{viewingHighlight.emoji}</p>
            <p className="font-bold text-lg">{viewingHighlight.title}</p>
            <p className="text-sm opacity-60 mt-2">No stories yet</p>
          </div>
        </button>
      )}

      {/* Edit Profile Sheet */}
      {editOpen && (
        <div
          className="fixed inset-0 z-50 flex flex-col"
          style={{ fontFamily: "'Outfit',sans-serif" }}
        >
          {/* biome-ignore lint/a11y/useKeyWithClickEvents: backdrop close */}
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setEditOpen(false)}
          />
          <div
            className={`absolute bottom-0 inset-x-0 rounded-t-3xl ${
              dark ? "bg-[#0F0F1A]" : "bg-white"
            } max-h-[90vh] overflow-y-auto`}
            style={{ boxShadow: "0 -8px 40px rgba(0,0,0,0.3)" }}
          >
            <div className="flex justify-center pt-3 pb-1">
              <div
                className={`w-10 h-1 rounded-full ${
                  dark ? "bg-white/20" : "bg-gray-300"
                }`}
              />
            </div>
            <div className="flex items-center justify-between px-5 py-3">
              <button
                type="button"
                onClick={() => setEditOpen(false)}
                className="p-1.5 rounded-xl active:scale-90 transition-transform"
              >
                <X size={20} />
              </button>
              <span className="font-bold text-base">Edit Profile</span>
              <button
                type="button"
                onClick={handleSave}
                className="p-1.5 rounded-xl active:scale-90 transition-transform text-purple-600 font-semibold"
              >
                <Check size={20} />
              </button>
            </div>

            <div className="px-5 pb-10 space-y-5">
              {/* Avatar */}
              <div className="flex flex-col items-center gap-3">
                <div className="relative">
                  <img
                    src={editAvatar}
                    alt="avatar"
                    className="w-24 h-24 rounded-full object-cover border-4 border-purple-500"
                  />
                  <button
                    type="button"
                    onClick={() => avatarFileRef.current?.click()}
                    className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-purple-600 flex items-center justify-center shadow-lg active:scale-90 transition-transform"
                    data-ocid="profile.upload_button"
                  >
                    <Camera size={16} className="text-white" />
                  </button>
                </div>
                <button
                  type="button"
                  onClick={() => avatarFileRef.current?.click()}
                  className="text-purple-500 text-sm font-semibold"
                  data-ocid="profile.upload_button"
                >
                  Change profile photo
                </button>
                <input
                  ref={avatarFileRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleAvatarSelect}
                />
              </div>

              {/* Name */}
              <div>
                <label
                  htmlFor="edit-name"
                  className={`text-xs font-semibold uppercase tracking-wide ${text2} mb-1 block`}
                >
                  Name
                </label>
                <input
                  id="edit-name"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  placeholder="Your display name"
                  maxLength={50}
                  className={`w-full px-4 py-3 rounded-2xl border text-sm outline-none ${inputBg}`}
                  data-ocid="profile.input"
                />
              </div>

              {/* Username */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label
                    htmlFor="edit-username"
                    className={`text-xs font-semibold uppercase tracking-wide ${text2}`}
                  >
                    Username
                  </label>
                  {!canChangeUsername && (
                    <span
                      className={`text-xs flex items-center gap-1 ${
                        dark ? "text-amber-400" : "text-amber-600"
                      }`}
                    >
                      <Clock size={12} /> Locked {daysLeft}d
                    </span>
                  )}
                </div>
                <div className="relative">
                  <span
                    className={`absolute left-4 top-1/2 -translate-y-1/2 text-sm font-medium ${
                      canChangeUsername ? "text-purple-500" : text2
                    }`}
                  >
                    @
                  </span>
                  <input
                    id="edit-username"
                    value={editUsername}
                    onChange={(e) =>
                      canChangeUsername &&
                      setEditUsername(
                        e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ""),
                      )
                    }
                    placeholder="username"
                    maxLength={20}
                    disabled={!canChangeUsername}
                    className={`w-full pl-8 pr-4 py-3 rounded-2xl border text-sm outline-none ${
                      canChangeUsername
                        ? inputBg
                        : `${inputBg} opacity-50 cursor-not-allowed`
                    }`}
                    data-ocid="profile.input"
                  />
                </div>
                <p className={`text-xs mt-1.5 ${text2}`}>
                  {!canChangeUsername
                    ? `You can change your username again in ${daysLeft} day${
                        daysLeft > 1 ? "s" : ""
                      }.`
                    : "Lowercase letters, numbers, underscores only. 30-day cooldown after change."}
                </p>
              </div>

              {/* Bio */}
              <div>
                <label
                  htmlFor="edit-bio"
                  className={`text-xs font-semibold uppercase tracking-wide ${text2} mb-1 block`}
                >
                  Bio
                </label>
                <textarea
                  id="edit-bio"
                  value={editBio}
                  onChange={(e) => setEditBio(e.target.value)}
                  placeholder="Tell people about yourself..."
                  rows={3}
                  maxLength={150}
                  className={`w-full px-4 py-3 rounded-2xl border text-sm outline-none resize-none ${inputBg}`}
                  data-ocid="profile.textarea"
                />
                <p className={`text-xs text-right mt-1 ${text2}`}>
                  {editBio.length}/150
                </p>
              </div>

              <button
                type="button"
                onClick={handleSave}
                className="w-full py-3.5 rounded-2xl text-white font-semibold btn-gradient"
                data-ocid="profile.save_button"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
