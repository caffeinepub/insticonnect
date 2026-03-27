import { Bell, ChevronLeft, Moon, Sun } from "lucide-react";
import { useState } from "react";
import { type AccentTheme, useApp } from "../App";
import { useAuth } from "../context/AuthContext";
import { requestNotificationPermission } from "../utils/firebase";

function Toggle({
  checked,
  onChange,
}: { checked: boolean; onChange: () => void }) {
  return (
    <button
      type="button"
      onClick={onChange}
      className={`relative w-12 h-6 rounded-full toggle-track transition-colors ${
        checked ? "bg-purple-600" : "bg-gray-300 dark:bg-gray-600"
      }`}
    >
      <span
        className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow-md toggle-thumb ${
          checked ? "left-[26px]" : "left-0.5"
        }`}
      />
    </button>
  );
}

const ACCENT_THEMES: { id: AccentTheme; label: string; color: string }[] = [
  {
    id: "pride",
    label: "Pride",
    color: "linear-gradient(135deg, #7C3AED, #D946EF, #3B82F6)",
  },
  {
    id: "blue",
    label: "Ocean",
    color: "linear-gradient(135deg, #3B82F6, #60A5FA)",
  },
  {
    id: "pink",
    label: "Sakura",
    color: "linear-gradient(135deg, #EC4899, #F472B6)",
  },
];

export default function Settings() {
  const {
    theme,
    toggleTheme,
    accentTheme,
    setAccentTheme,
    goBack,
    addToast,
    showSavedPosts,
    setShowSavedPosts,
    showLikedPosts,
    setShowLikedPosts,
    user,
    setUser,
    navigate,
  } = useApp();
  const { signOut } = useAuth();

  const handleSignOut = async () => {
    await signOut();
    setUser(null);
    navigate("login");
  };
  const [privateAcc, setPrivateAcc] = useState(false);
  const [anonPosting, setAnonPosting] = useState(false);
  const [msgReq, setMsgReq] = useState(true);
  const [notifEnabled, setNotifEnabled] = useState(false);

  const surface = theme === "dark" ? "bg-[#1A1D27]" : "bg-white";
  const text2 = theme === "dark" ? "text-gray-400" : "text-gray-500";

  const Section = ({
    title,
    children,
  }: { title: string; children: React.ReactNode }) => (
    <div className="mb-4">
      <p
        className={`text-xs font-bold uppercase tracking-wider ${text2} px-4 mb-2`}
      >
        {title}
      </p>
      <div className={`${surface} rounded-2xl overflow-hidden shadow-md mx-4`}>
        {children}
      </div>
    </div>
  );

  const Row = ({
    label,
    sub,
    right,
  }: { label: string; sub?: string; right?: React.ReactNode }) => (
    <div
      className={`flex items-center justify-between px-4 py-3.5 border-b last:border-0 ${
        theme === "dark" ? "border-white/5" : "border-gray-50"
      }`}
    >
      <div>
        <p className="text-sm font-medium">{label}</p>
        {sub && <p className={`text-xs ${text2} mt-0.5`}>{sub}</p>}
      </div>
      {right}
    </div>
  );

  return (
    <div className="page-fade min-h-screen pb-8">
      {/* Top bar */}
      <div
        className={`${surface} sticky top-0 z-10 flex items-center gap-3 px-4 h-14 shadow-sm mb-4`}
      >
        <button
          type="button"
          onClick={goBack}
          className="p-1 -ml-1 active:scale-90 transition-transform"
        >
          <ChevronLeft size={24} />
        </button>
        <h2 className="font-bold text-lg">Settings</h2>
      </div>

      <Section title="Account">
        <Row label="Name" sub={user?.name ?? ""} />
        <Row label="Username" sub={user?.username ? `@${user.username}` : ""} />
        <Row label="Email" sub={user?.email ?? ""} />
      </Section>

      <Section title="Privacy">
        <Row
          label="Private Account"
          sub="Only followers see your posts"
          right={
            <Toggle
              checked={privateAcc}
              onChange={() => setPrivateAcc((v) => !v)}
            />
          }
        />
        <Row
          label="Anonymous Posting"
          sub="Post without showing your name"
          right={
            <Toggle
              checked={anonPosting}
              onChange={() => setAnonPosting((v) => !v)}
            />
          }
        />
        <Row
          label="Message Requests"
          sub="Allow DMs from non-followers"
          right={
            <Toggle checked={msgReq} onChange={() => setMsgReq((v) => !v)} />
          }
        />
        <Row
          label="Show Saved Posts"
          sub="Let others see your saved posts"
          right={
            <Toggle
              checked={showSavedPosts}
              onChange={() => {
                setShowSavedPosts(!showSavedPosts);
                addToast(
                  !showSavedPosts
                    ? "Saved posts visible to others"
                    : "Saved posts hidden",
                  "success",
                );
              }}
            />
          }
        />
        <Row
          label="Show Liked Posts"
          sub="Let others see your liked posts"
          right={
            <Toggle
              checked={showLikedPosts}
              onChange={() => {
                setShowLikedPosts(!showLikedPosts);
                addToast(
                  !showLikedPosts
                    ? "Liked posts visible to others"
                    : "Liked posts hidden",
                  "success",
                );
              }}
            />
          }
        />
      </Section>

      <Section title="Appearance">
        <Row
          label="Dark Mode"
          right={
            <div className="flex items-center gap-2">
              <Sun size={14} className="opacity-50" />
              <Toggle checked={theme === "dark"} onChange={toggleTheme} />
              <Moon size={14} className="opacity-50" />
            </div>
          }
        />
        <div
          className={`px-4 py-3.5 border-t ${
            theme === "dark" ? "border-white/5" : "border-gray-50"
          }`}
        >
          <p className="text-sm font-medium mb-3">Accent Color</p>
          <div className="flex gap-3">
            {ACCENT_THEMES.map((t) => (
              <button
                type="button"
                key={t.id}
                onClick={() => {
                  setAccentTheme(t.id);
                  addToast(`Theme: ${t.label}`, "success");
                }}
                className="flex flex-col items-center gap-1.5 transition-all active:scale-90"
              >
                <div
                  className={`w-12 h-12 rounded-2xl shadow-md transition-transform ${
                    accentTheme === t.id
                      ? "scale-110 shadow-lg ring-2 ring-offset-2 ring-purple-600"
                      : ""
                  }`}
                  style={{ background: t.color }}
                />
                <span
                  className={`text-xs font-medium ${
                    accentTheme === t.id ? "text-purple-600" : text2
                  }`}
                >
                  {t.label}
                </span>
              </button>
            ))}
          </div>
        </div>
      </Section>

      <Section title="Notifications">
        <Row
          label="Push Notifications"
          sub="Get notified about likes, comments, messages"
          right={
            <Toggle
              checked={notifEnabled}
              onChange={async () => {
                if (!notifEnabled) {
                  const token = await requestNotificationPermission();
                  if (token) {
                    setNotifEnabled(true);
                    addToast("Notifications enabled!", "success");
                  } else {
                    addToast(
                      "Please allow notifications in browser settings",
                      "error",
                    );
                  }
                } else {
                  setNotifEnabled(false);
                  addToast("Notifications disabled", "success");
                }
              }}
            />
          }
        />
      </Section>
      <Section title="About">
        <Row label="InstiConnect" sub="Version 1.0.0 • IIT Madras" />
        <Row label="Privacy Policy" />
        <Row
          label="Sign Out"
          right={
            <button
              type="button"
              onClick={() => void handleSignOut()}
              className="text-red-500 text-sm font-medium"
              data-ocid="settings.delete_button"
            >
              Sign Out
            </button>
          }
        />
      </Section>
    </div>
  );
}
