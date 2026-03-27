import { Check, ChevronDown, ChevronUp, Users, X } from "lucide-react";
import { useEffect, useState } from "react";
import { useApp } from "../App";
import { useAuth } from "../context/AuthContext";
import type { ChatConversation } from "../mockData";
import { subscribeToUserChats } from "../utils/firebaseService";

export default function Chat() {
  const { theme, navigate, addToast } = useApp();
  const { currentFirebaseUser } = useAuth();
  const [chats, setChats] = useState<ChatConversation[]>([]);

  useEffect(() => {
    if (!currentFirebaseUser) return;
    const uid = currentFirebaseUser.uid;
    const unsub = subscribeToUserChats(uid, (raw) => {
      const mapped: ChatConversation[] = raw.map((c) => {
        const participants = (c.participants as string[]) ?? [];
        const otherId = participants.find((p) => p !== uid) ?? "";
        const names = (c.participantNames as Record<string, string>) ?? {};
        const avatars = (c.participantAvatars as Record<string, string>) ?? {};
        const unreadMap = (c.unread as Record<string, number>) ?? {};
        return {
          id: c.id as string,
          userId: otherId,
          username: names[otherId] ?? "Unknown",
          avatar:
            avatars[otherId] ?? `https://picsum.photos/seed/${otherId}/100/100`,
          lastMessage: (c.lastMessage as string) ?? "",
          lastTime: (c.lastTime as string) ?? "",
          unread: unreadMap[uid] ?? 0,
          isOnline: false,
          isRequest: false,
          messages: [],
        };
      });
      setChats(mapped);
    });
    return unsub;
  }, [currentFirebaseUser]);
  const [requestsOpen, setRequestsOpen] = useState(false);

  const requests = chats.filter((c) => c.isRequest);
  const dms = chats.filter((c) => !c.isRequest);

  // Only joined plan groups - stored in local state when user joins a plan
  const joinedGroupChats: { id: string; name: string; lastMessage: string }[] =
    [];

  const accept = (id: string) => {
    setChats((cs) =>
      cs.map((c) => (c.id === id ? { ...c, isRequest: false } : c)),
    );
    addToast("Request accepted!", "success");
  };
  const decline = (id: string) => {
    setChats((cs) => cs.filter((c) => c.id !== id));
    addToast("Request declined", "info");
  };

  const surface = theme === "dark" ? "bg-[#1A1D27]" : "bg-white";
  const text2 = theme === "dark" ? "text-gray-400" : "text-gray-500";
  const border = theme === "dark" ? "border-white/5" : "border-gray-50";

  return (
    <div className="page-fade pt-4 pb-4">
      <div className="px-4 mb-4">
        <h2 className="text-xl font-bold">Messages</h2>
      </div>

      {/* Message requests */}
      {requests.length > 0 && (
        <div
          className={`mx-4 mb-3 ${surface} rounded-2xl overflow-hidden shadow-md`}
        >
          <button
            type="button"
            onClick={() => setRequestsOpen((v) => !v)}
            className="w-full flex items-center justify-between px-4 py-3"
          >
            <div className="flex items-center gap-2">
              <span className="font-semibold text-sm">Message Requests</span>
              <span className="w-5 h-5 rounded-full bg-purple-600 text-white text-[10px] font-bold flex items-center justify-center">
                {requests.length}
              </span>
            </div>
            {requestsOpen ? (
              <ChevronUp size={18} className="opacity-50" />
            ) : (
              <ChevronDown size={18} className="opacity-50" />
            )}
          </button>
          {requestsOpen &&
            requests.map((r) => (
              <div
                key={r.id}
                className={`flex items-center gap-3 px-4 py-3 border-t ${border}`}
              >
                <img
                  src={r.avatar}
                  alt={r.username}
                  className="w-10 h-10 rounded-full object-cover"
                />
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm">{r.username}</p>
                  <p className={`text-xs truncate ${text2}`}>{r.lastMessage}</p>
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => accept(r.id)}
                    className="w-8 h-8 rounded-full bg-green-100 text-green-600 flex items-center justify-center"
                  >
                    <Check size={14} />
                  </button>
                  <button
                    type="button"
                    onClick={() => decline(r.id)}
                    className="w-8 h-8 rounded-full bg-red-100 text-red-500 flex items-center justify-center"
                  >
                    <X size={14} />
                  </button>
                </div>
              </div>
            ))}
        </div>
      )}

      {/* Plan Group Chats — only joined */}
      {joinedGroupChats.length > 0 && (
        <>
          <div className="px-4 mb-2 mt-1">
            <div className="flex items-center gap-2">
              <Users size={15} className="text-purple-500" />
              <span className="text-xs font-semibold uppercase tracking-wide opacity-60">
                Plan Groups
              </span>
            </div>
          </div>
          <div
            className={`${surface} rounded-2xl mx-4 mb-4 shadow-md overflow-hidden`}
          >
            {joinedGroupChats.map((group, i) => (
              <button
                type="button"
                key={group.id}
                onClick={() =>
                  navigate("chat-screen", {
                    chatId: group.id,
                    isGroup: true,
                    chatName: group.name,
                  })
                }
                className={`w-full flex items-center gap-3 px-4 py-3.5 transition-all active:scale-[0.98] text-left ${
                  i < joinedGroupChats.length - 1 ? `border-b ${border}` : ""
                } ${theme === "dark" ? "hover:bg-white/5" : "hover:bg-gray-50"}`}
              >
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-xl flex-shrink-0 shadow-md">
                  🎯
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-baseline">
                    <span className="font-semibold text-sm truncate pr-2">
                      {group.name}
                    </span>
                    <span className={`text-xs ${text2} flex-shrink-0`}>
                      <span className="text-[10px] bg-purple-100 dark:bg-purple-900/30 text-purple-600 px-1.5 py-0.5 rounded-full font-medium">
                        Group
                      </span>
                    </span>
                  </div>
                  <p className={`text-xs truncate mt-0.5 ${text2}`}>
                    {group.lastMessage}
                  </p>
                </div>
              </button>
            ))}
          </div>
        </>
      )}

      {/* DMs */}
      <div className="px-4 mb-2">
        <span className="text-xs font-semibold uppercase tracking-wide opacity-60">
          Direct Messages
        </span>
      </div>
      <div className={`${surface} rounded-2xl mx-4 shadow-md overflow-hidden`}>
        {dms.map((chat, i) => (
          <button
            type="button"
            key={chat.id}
            onClick={() => navigate("chat-screen", { chatId: chat.id })}
            className={`w-full flex items-center gap-3 px-4 py-3.5 transition-all active:scale-[0.98] text-left ${
              i < dms.length - 1 ? `border-b ${border}` : ""
            } ${theme === "dark" ? "hover:bg-white/5" : "hover:bg-gray-50"}`}
          >
            <div className="relative flex-shrink-0">
              <img
                src={chat.avatar}
                alt={chat.username}
                className="w-12 h-12 rounded-full object-cover"
              />
              {chat.isOnline && (
                <div className="absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full bg-green-400 border-2 border-white dark:border-[#1A1D27]" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex justify-between items-baseline">
                <span
                  className={`font-semibold text-sm ${chat.unread > 0 ? "" : "opacity-80"}`}
                >
                  {chat.username}
                </span>
                <span className={`text-xs ${text2} flex-shrink-0`}>
                  {chat.lastTime}
                </span>
              </div>
              <div className="flex justify-between items-center mt-0.5">
                <span
                  className={`text-xs truncate ${chat.unread > 0 ? "font-medium" : text2}`}
                >
                  {chat.lastMessage}
                </span>
                {chat.unread > 0 && (
                  <span className="w-5 h-5 rounded-full bg-purple-600 text-white text-[10px] font-bold flex items-center justify-center flex-shrink-0 ml-2">
                    {chat.unread}
                  </span>
                )}
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
