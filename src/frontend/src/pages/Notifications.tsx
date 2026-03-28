import { ChevronLeft } from "lucide-react";
import { useEffect, useState } from "react";
import { useApp } from "../App";
import { useAuth } from "../context/AuthContext";
import {
  markNotificationRead,
  subscribeToNotificationsFixed,
} from "../utils/firebaseService";

interface NotifItem {
  id: string;
  userId: string;
  senderId: string;
  senderName: string;
  senderAvatar: string;
  type: "like" | "comment" | "follow" | "tag" | "share";
  postId?: string;
  postImage?: string;
  text?: string;
  createdAt?: { toDate: () => Date } | null;
  isRead: boolean;
}

function typeToAction(type: string): string {
  switch (type) {
    case "like":
      return "liked your post";
    case "comment":
      return "commented on your post";
    case "follow":
      return "started following you";
    case "tag":
      return "tagged you in a post";
    case "share":
      return "shared your post";
    default:
      return "interacted with you";
  }
}

function timeAgo(date?: Date | null): string {
  if (!date) return "just now";
  const s = Math.floor((Date.now() - date.getTime()) / 1000);
  if (s < 60) return "just now";
  if (s < 3600) return `${Math.floor(s / 60)}m`;
  if (s < 86400) return `${Math.floor(s / 3600)}h`;
  return `${Math.floor(s / 86400)}d`;
}

export default function Notifications() {
  const { theme, goBack, navigate } = useApp();
  const { currentFirebaseUser } = useAuth();
  const [notifications, setNotifications] = useState<NotifItem[]>([]);

  useEffect(() => {
    if (!currentFirebaseUser?.uid) return;
    const unsub = subscribeToNotificationsFixed(
      currentFirebaseUser.uid,
      (items) => {
        setNotifications(items as unknown as NotifItem[]);
      },
    );
    return unsub;
  }, [currentFirebaseUser?.uid]);

  const handleClick = async (n: NotifItem) => {
    if (!n.isRead) {
      await markNotificationRead(n.id);
    }
    if (n.postId) {
      navigate("home");
    } else if (n.senderId) {
      navigate("other-profile", { userId: n.senderId });
    }
  };

  const today = notifications.filter((n) => {
    if (!n.createdAt?.toDate) return true;
    const d = n.createdAt.toDate();
    return Date.now() - d.getTime() < 86400000;
  });
  const older = notifications.filter((n) => {
    if (!n.createdAt?.toDate) return false;
    const d = n.createdAt.toDate();
    return Date.now() - d.getTime() >= 86400000;
  });

  const surface = theme === "dark" ? "bg-[#1A1D27]" : "bg-white";
  const text2 = theme === "dark" ? "text-gray-400" : "text-gray-500";

  const NotifRow = ({ n }: { n: NotifItem }) => (
    <button
      type="button"
      onClick={() => handleClick(n)}
      className={`w-full flex items-center gap-3 px-4 py-3.5 text-left transition-all ${
        !n.isRead
          ? theme === "dark"
            ? "bg-purple-900/20"
            : "bg-purple-50"
          : ""
      }`}
      data-ocid="notifications.item.1"
    >
      <div className="relative flex-shrink-0">
        <img
          src={n.senderAvatar || `https://picsum.photos/seed/${n.senderId}/100`}
          alt={n.senderName}
          className="w-11 h-11 rounded-full object-cover"
        />
        {!n.isRead && (
          <div className="absolute -top-0.5 -right-0.5 w-3 h-3 rounded-full bg-purple-600 border-2 border-white dark:border-[#1A1D27]" />
        )}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm leading-tight">
          <span className="font-semibold">{n.senderName || "Someone"}</span>{" "}
          <span className={text2}>{typeToAction(n.type)}</span>
        </p>
        <p className={`text-xs ${text2} mt-0.5`}>
          {timeAgo(n.createdAt?.toDate ? n.createdAt.toDate() : null)}
        </p>
      </div>
      {n.postImage && (
        <img
          src={n.postImage}
          alt="post"
          className="w-11 h-11 rounded-xl object-cover flex-shrink-0"
        />
      )}
    </button>
  );

  return (
    <div className="page-fade min-h-screen">
      {/* Top bar */}
      <div
        className={`${surface} sticky top-0 z-10 flex items-center gap-3 px-4 h-14 shadow-sm`}
      >
        <button
          type="button"
          onClick={goBack}
          className="p-1 -ml-1 active:scale-90 transition-transform"
          data-ocid="notifications.button"
        >
          <ChevronLeft size={24} />
        </button>
        <h2 className="font-bold text-lg">Notifications</h2>
      </div>

      {notifications.length === 0 && (
        <div
          className="flex flex-col items-center justify-center py-20 gap-3"
          data-ocid="notifications.empty_state"
        >
          <span className="text-5xl">🔔</span>
          <p className={`text-sm ${text2}`}>No notifications yet</p>
        </div>
      )}

      {today.length > 0 && (
        <div
          className={`${surface} mx-4 mt-4 rounded-2xl overflow-hidden shadow-md`}
        >
          <div
            className={`px-4 py-2 border-b ${theme === "dark" ? "border-white/5" : "border-gray-100"}`}
          >
            <p className="text-xs font-bold uppercase tracking-wider opacity-50">
              Today
            </p>
          </div>
          {today.map((n) => (
            <NotifRow key={n.id} n={n} />
          ))}
        </div>
      )}

      {older.length > 0 && (
        <div
          className={`${surface} mx-4 mt-3 mb-4 rounded-2xl overflow-hidden shadow-md`}
        >
          <div
            className={`px-4 py-2 border-b ${theme === "dark" ? "border-white/5" : "border-gray-100"}`}
          >
            <p className="text-xs font-bold uppercase tracking-wider opacity-50">
              Older
            </p>
          </div>
          {older.map((n) => (
            <NotifRow key={n.id} n={n} />
          ))}
        </div>
      )}
    </div>
  );
}
