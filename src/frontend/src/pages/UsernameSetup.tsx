import { useState } from "react";
import { useApp } from "../App";
import { useAuth } from "../context/AuthContext";
import type { User } from "../mockData";
import { saveNewUserProfile } from "../utils/firebaseService";

export default function UsernameSetup() {
  const { navigate, addToast } = useApp();
  const { currentFirebaseUser, setNeedsUsernameSetup } = useAuth();
  const fbUser = currentFirebaseUser;

  const suggestBase = () =>
    (fbUser?.displayName ?? fbUser?.email ?? "user")
      .split("@")[0]
      .toLowerCase()
      .replace(/[^a-z0-9_]/g, "_");

  const [username, setUsername] = useState(suggestBase());
  const [displayName, setDisplayName] = useState(fbUser?.displayName ?? "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const base = suggestBase();
  const suggestions = [
    base,
    `${base}_${Math.floor(Math.random() * 99)}`,
    `${base}.${Math.floor(Math.random() * 99)}`,
  ].filter((s, i, a) => a.indexOf(s) === i);

  const handleSubmit = async () => {
    if (!username.trim() || username.length < 3) {
      setError("Username must be at least 3 characters");
      return;
    }
    if (!displayName.trim()) {
      setError("Display name is required");
      return;
    }
    if (!fbUser) return;
    setLoading(true);
    try {
      const profile: User = {
        id: fbUser.uid,
        name: displayName.trim(),
        username: username.trim().toLowerCase(),
        email: fbUser.email ?? "",
        avatar:
          fbUser.photoURL ?? `https://picsum.photos/seed/${fbUser.uid}/100/100`,
        bio: "Hey, I'm on InstiConnect!",
        followers: 0,
        following: 0,
        posts: 0,
      };
      await saveNewUserProfile(fbUser.uid, profile);
      setNeedsUsernameSetup(false);
      navigate("home");
      addToast("Welcome to InstiConnect! 🎉", "success");
    } catch (e) {
      console.error(e);
      setError("Failed to save profile. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-6"
      style={{ background: "linear-gradient(135deg,#7C3AED 0%,#EC4899 100%)" }}
    >
      <div className="w-full max-w-sm bg-white/10 backdrop-blur-xl rounded-3xl p-8 shadow-2xl border border-white/20">
        {/* Avatar */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-20 h-20 rounded-full overflow-hidden border-4 border-white/40 mb-3">
            <img
              src={
                fbUser?.photoURL ??
                `https://picsum.photos/seed/${fbUser?.uid ?? "user"}/100/100`
              }
              alt="profile"
              className="w-full h-full object-cover"
            />
          </div>
          <h1 className="text-white font-bold text-2xl tracking-tight">
            InstiConnect
          </h1>
          <p className="text-white/70 text-sm mt-1">
            Choose your username to get started
          </p>
        </div>

        {/* Display name */}
        <div className="mb-4">
          <label
            htmlFor="setup-displayname"
            className="block text-white/80 text-xs font-semibold uppercase tracking-widest mb-1.5"
          >
            Display Name
          </label>
          <input
            id="setup-displayname"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            placeholder="Your name"
            className="w-full px-4 py-3 rounded-2xl bg-white/15 border border-white/25 text-white placeholder:text-white/40 outline-none focus:border-white/60 text-sm"
            data-ocid="username_setup.input"
          />
        </div>

        {/* Username */}
        <div className="mb-3">
          <label
            htmlFor="setup-username"
            className="block text-white/80 text-xs font-semibold uppercase tracking-widest mb-1.5"
          >
            Username
          </label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-white/50 font-medium text-sm">
              @
            </span>
            <input
              id="setup-username"
              value={username}
              onChange={(e) =>
                setUsername(
                  e.target.value.toLowerCase().replace(/[^a-z0-9_.]/g, ""),
                )
              }
              placeholder="username"
              className="w-full pl-8 pr-4 py-3 rounded-2xl bg-white/15 border border-white/25 text-white placeholder:text-white/40 outline-none focus:border-white/60 text-sm"
              data-ocid="username_setup.textarea"
            />
          </div>
        </div>

        {/* Suggestions */}
        <div className="flex gap-2 mb-4 flex-wrap">
          {suggestions.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setUsername(s)}
              className="text-xs text-white/70 bg-white/15 px-3 py-1 rounded-full border border-white/20 hover:bg-white/25 transition-all"
            >
              @{s}
            </button>
          ))}
        </div>

        {error && (
          <p
            className="text-red-300 text-xs mb-3"
            data-ocid="username_setup.error_state"
          >
            {error}
          </p>
        )}

        <button
          type="button"
          onClick={() => void handleSubmit()}
          disabled={loading}
          className="w-full py-3.5 rounded-2xl bg-white text-purple-700 font-bold text-sm transition-all active:scale-[0.98] disabled:opacity-60"
          data-ocid="username_setup.submit_button"
        >
          {loading ? "Setting up..." : "Get Started"}
        </button>
      </div>
    </div>
  );
}
