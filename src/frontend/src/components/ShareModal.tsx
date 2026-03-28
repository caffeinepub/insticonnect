import { Search, Send, X } from "lucide-react";
import { useEffect, useState } from "react";
import { useApp } from "../App";
import { useAuth } from "../context/AuthContext";
import type { User } from "../mockData";
import {
  createNotification,
  getOrCreateChat,
  searchUsersByUsername,
  sendMessage,
} from "../utils/firebaseService";

interface ShareModalProps {
  open: boolean;
  onClose: () => void;
  postId?: string;
  storyId?: string;
  postImage?: string;
  postOwnerId?: string;
}

export default function ShareModal({
  open,
  onClose,
  postId,
  storyId,
  postImage,
  postOwnerId,
}: ShareModalProps) {
  const { theme, addToast } = useApp();
  const { userProfile } = useAuth();
  const [search, setSearch] = useState("");
  const [users, setUsers] = useState<User[]>([]);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [sending, setSending] = useState(false);
  const isDark = theme === "dark";

  useEffect(() => {
    if (!open || !userProfile) return;
    setSearch("");
    setSelected(new Set());
  }, [open, userProfile]);

  useEffect(() => {
    if (!open || !userProfile) return;
    searchUsersByUsername(search, userProfile.id).then(setUsers);
  }, [search, open, userProfile]);

  const toggleSelect = (uid: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(uid)) next.delete(uid);
      else next.add(uid);
      return next;
    });
  };

  const handleSend = async () => {
    if (!userProfile || selected.size === 0) return;
    setSending(true);
    try {
      for (const targetId of selected) {
        const target = users.find((u) => u.id === targetId);
        if (!target) continue;
        const chatId = await getOrCreateChat(
          userProfile.id,
          targetId,
          { [userProfile.id]: userProfile.name, [targetId]: target.name },
          {
            [userProfile.id]: userProfile.avatar,
            [targetId]: target.avatar,
          },
        );
        if (postId) {
          await sendMessage(chatId, {
            senderId: userProfile.id,
            type: "post",
            postId,
            postImage: postImage ?? "",
            text: "",
          });
          if (postOwnerId && postOwnerId !== userProfile.id) {
            await createNotification({
              userId: postOwnerId,
              senderId: userProfile.id,
              senderName: userProfile.name,
              senderAvatar: userProfile.avatar,
              type: "share",
              postId,
              postImage,
            });
          }
        } else if (storyId) {
          await sendMessage(chatId, {
            senderId: userProfile.id,
            type: "story",
            storyId,
            text: "",
          });
        }
      }
      addToast("Sent!", "success");
      onClose();
    } catch (e) {
      console.error(e);
      addToast("Failed to send", "error");
    } finally {
      setSending(false);
    }
  };

  if (!open) return null;

  const surface = isDark ? "bg-[#1A1D27]" : "bg-white";
  const text2 = isDark ? "text-gray-400" : "text-gray-500";

  return (
    // biome-ignore lint/a11y/useKeyWithClickEvents: backdrop dismiss
    <div
      className="fixed inset-0 z-[200] flex flex-col justify-end"
      style={{ background: "rgba(0,0,0,0.5)", backdropFilter: "blur(4px)" }}
      onClick={onClose}
    >
      {/* biome-ignore lint/a11y/useKeyWithClickEvents: inner panel stop propagation */}
      <div
        className={`${surface} rounded-t-3xl w-full max-w-[430px] mx-auto max-h-[70vh] flex flex-col`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-4 pt-4 pb-3 border-b"
          style={{
            borderColor: isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)",
          }}
        >
          <h3 className="font-bold text-base">Share to</h3>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-full active:scale-90"
            data-ocid="share.close_button"
          >
            <X size={18} />
          </button>
        </div>

        {/* Search */}
        <div className="px-4 py-2">
          <div
            className={`flex items-center gap-2 px-3 py-2 rounded-xl ${
              isDark ? "bg-white/10" : "bg-gray-100"
            }`}
          >
            <Search size={16} className="opacity-50" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search people..."
              className="flex-1 bg-transparent text-sm outline-none"
              data-ocid="share.search_input"
            />
          </div>
        </div>

        {/* Users list */}
        <div className="flex-1 overflow-y-auto px-4">
          {users.length === 0 && (
            <p
              className={`text-center text-sm py-8 ${text2}`}
              data-ocid="share.empty_state"
            >
              No users found
            </p>
          )}
          {users.map((u, idx) => (
            <button
              key={u.id}
              type="button"
              onClick={() => toggleSelect(u.id)}
              className={`w-full flex items-center gap-3 py-3 text-left transition-all ${
                selected.has(u.id)
                  ? isDark
                    ? "bg-purple-900/20"
                    : "bg-purple-50"
                  : ""
              }`}
              data-ocid={`share.item.${idx + 1}`}
            >
              <div className="relative flex-shrink-0">
                <img
                  src={u.avatar}
                  alt={u.username}
                  className="w-10 h-10 rounded-full object-cover"
                />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm truncate">{u.name}</p>
                <p className={`text-xs ${text2} truncate`}>@{u.username}</p>
              </div>
              <div
                className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all ${
                  selected.has(u.id)
                    ? "bg-purple-600 border-purple-600"
                    : isDark
                      ? "border-gray-500"
                      : "border-gray-300"
                }`}
              >
                {selected.has(u.id) && (
                  <div className="w-2 h-2 bg-white rounded-full" />
                )}
              </div>
            </button>
          ))}
        </div>

        {/* Send button */}
        <div
          className="px-4 py-4"
          style={{
            paddingBottom: "calc(1rem + env(safe-area-inset-bottom))",
          }}
        >
          <button
            type="button"
            onClick={() => void handleSend()}
            disabled={selected.size === 0 || sending}
            className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-purple-600 to-pink-500 text-white font-bold text-sm disabled:opacity-50 flex items-center justify-center gap-2"
            data-ocid="share.submit_button"
          >
            <Send size={16} />
            {sending
              ? "Sending..."
              : `Send${
                  selected.size > 0
                    ? ` to ${selected.size} ${selected.size === 1 ? "person" : "people"}`
                    : ""
                }`}
          </button>
        </div>
      </div>
    </div>
  );
}
