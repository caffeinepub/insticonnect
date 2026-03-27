import { ChevronLeft, Image, Send, Trash2, Users } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useApp } from "../App";
import { useAuth } from "../context/AuthContext";
import type { ChatMessage } from "../mockData";
import {
  deleteMessage as fbDeleteMessage,
  sendMessage as fbSendMessage,
  subscribeToMessages,
} from "../utils/firebaseService";

interface ExtendedMessage extends ChatMessage {
  imageUrl?: string;
}

export default function ChatScreen() {
  const { theme, goBack, navigate, pageMeta } = useApp();
  const chatId = pageMeta.chatId as string;
  const isGroup = pageMeta.isGroup as boolean | undefined;
  const chatName = pageMeta.chatName as string | undefined;
  const fromUserId = pageMeta.fromUserId as string | undefined;

  const isGroupChat = isGroup || chatId?.startsWith("plan-");

  const displayName = chatName ?? "Chat";
  const displayAvatar: string | null = null;
  const isOnline = false;

  const [messages, setMessages] = useState<ExtendedMessage[]>([]);
  const [input, setInput] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const longPressTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const { userProfile } = useAuth();

  useEffect(() => {
    if (!chatId) return;
    const unsub = subscribeToMessages(chatId, (msgs) => {
      const converted: ExtendedMessage[] = msgs.map((m) => ({
        id: String(m.id),
        senderId: String(m.senderId ?? ""),
        text: String(m.text ?? ""),
        imageUrl: m.imageUrl ? String(m.imageUrl) : undefined,
        time:
          m.createdAt && typeof (m.createdAt as any).toDate === "function"
            ? (m.createdAt as any)
                .toDate()
                .toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
            : String(m.time ?? ""),
      }));
      setMessages(converted);
    });
    return unsub;
  }, [chatId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }); // eslint-disable-line

  const send = async (imageUrl?: string) => {
    if (!input.trim() && !imageUrl) return;
    const text = imageUrl ? "" : input;
    const senderId = userProfile?.id ?? "unknown";
    setInput("");
    await fbSendMessage(chatId, {
      senderId,
      text,
      imageUrl: imageUrl ?? null,
      time: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
    });
    console.log("[Chat] Message sent to", chatId);
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    send(url);
    e.target.value = "";
  };

  const handleBack = () => {
    if (fromUserId) {
      navigate("other-profile", { userId: fromUserId });
    } else {
      goBack();
    }
  };

  const bg = theme === "dark" ? "bg-[#0D0F14]" : "bg-[#F6F8FB]";
  const surface = theme === "dark" ? "bg-[#1A1D27]" : "bg-white";
  const isDark = theme === "dark";

  return (
    <div className={`min-h-screen ${bg} flex flex-col`}>
      {/* Header */}
      <div
        className={`${surface} flex items-center gap-3 px-4 h-14 shadow-sm flex-shrink-0`}
      >
        <button
          type="button"
          onClick={handleBack}
          className="p-1 -ml-1 active:scale-90 transition-transform"
          data-ocid="chat.button"
        >
          <ChevronLeft size={24} />
        </button>
        {displayAvatar ? (
          <div className="relative">
            <img
              src={displayAvatar}
              alt={displayName}
              className="w-9 h-9 rounded-full object-cover"
            />
            {isOnline && (
              <div className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-green-400 border-2 border-white dark:border-[#1A1D27]" />
            )}
          </div>
        ) : (
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-lg flex-shrink-0">
            🎯
          </div>
        )}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            <p className="font-semibold text-sm truncate">{displayName}</p>
            {isGroupChat && (
              <span className="flex items-center gap-0.5 text-xs bg-purple-100 dark:bg-purple-900/40 text-purple-600 px-1.5 py-0.5 rounded-full">
                <Users size={10} />
                Group
              </span>
            )}
          </div>
          {!isGroupChat && (
            <p
              className={`text-xs ${
                isOnline
                  ? "text-green-500"
                  : isDark
                    ? "text-gray-400"
                    : "text-gray-500"
              }`}
            >
              {isOnline ? "Online" : "Offline"}
            </p>
          )}
        </div>
      </div>

      {/* E2E encrypted banner — WhatsApp style */}
      <div
        className="flex-shrink-0"
        style={{
          background: isDark ? "rgba(30,33,46,0.7)" : "rgba(240,242,247,0.9)",
          backdropFilter: "blur(8px)",
        }}
      >
        <div className="flex items-center justify-center gap-1.5 py-1.5">
          <span
            className="text-[10px]"
            style={{ color: isDark ? "#9ca3af" : "#6b7280" }}
          >
            🔒
          </span>
          <span
            className="text-[10px] font-medium"
            style={{ color: isDark ? "#9ca3af" : "#6b7280" }}
          >
            Messages are end-to-end encrypted
          </span>
        </div>
        <div
          className="mx-4"
          style={{
            height: 1,
            background: isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)",
          }}
        />
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-2 space-y-3 pb-20">
        {messages.length === 0 && (
          <div
            className="flex flex-col items-center justify-center py-16 gap-3"
            data-ocid="chat.empty_state"
          >
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-2xl">
              {isGroupChat ? "💬" : "👋"}
            </div>
            <p
              className={`text-sm ${isDark ? "text-gray-400" : "text-gray-500"}`}
            >
              {isGroupChat
                ? "Group chat started! Say hello 👋"
                : "Start a conversation"}
            </p>
          </div>
        )}
        {messages.map((msg) => {
          const isMine = msg.senderId === userProfile?.id;
          return (
            <div
              key={msg.id}
              className={`flex ${isMine ? "justify-end" : "justify-start"}`}
            >
              {/* biome-ignore lint/a11y/useKeyWithClickEvents: long press message */}
              <div
                className={`max-w-[75%] ${
                  msg.imageUrl ? "" : "px-4 py-2.5"
                } rounded-2xl ${
                  isMine
                    ? "bg-gradient-to-br from-purple-600 to-pink-500 text-white rounded-br-sm"
                    : isDark
                      ? "bg-[#1A1D27] text-gray-100 rounded-bl-sm"
                      : "bg-white text-gray-800 rounded-bl-sm shadow-sm"
                }`}
                onMouseDown={() => {
                  if (!isMine) return;
                  longPressTimer.current = setTimeout(async () => {
                    if (window.confirm("Delete this message?")) {
                      await fbDeleteMessage(chatId, msg.id);
                    }
                  }, 500);
                }}
                onMouseUp={() => {
                  if (longPressTimer.current) {
                    clearTimeout(longPressTimer.current);
                    longPressTimer.current = null;
                  }
                }}
                onMouseLeave={() => {
                  if (longPressTimer.current) {
                    clearTimeout(longPressTimer.current);
                    longPressTimer.current = null;
                  }
                }}
                onTouchStart={() => {
                  if (!isMine) return;
                  longPressTimer.current = setTimeout(async () => {
                    if (window.confirm("Delete this message?")) {
                      await fbDeleteMessage(chatId, msg.id);
                    }
                  }, 500);
                }}
                onTouchEnd={() => {
                  if (longPressTimer.current) {
                    clearTimeout(longPressTimer.current);
                    longPressTimer.current = null;
                  }
                }}
              >
                {msg.imageUrl ? (
                  <img
                    src={msg.imageUrl}
                    alt="sent"
                    className="max-w-[200px] rounded-2xl block"
                  />
                ) : (
                  <>
                    <p className="text-sm leading-relaxed">{msg.text}</p>
                    <p
                      className={`text-[10px] mt-1 ${
                        isMine
                          ? "text-white/60"
                          : isDark
                            ? "text-gray-500"
                            : "text-gray-400"
                      } text-right`}
                    >
                      {msg.time}
                    </p>
                  </>
                )}
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div
        className={`fixed bottom-0 left-0 right-0 max-w-[430px] mx-auto px-4 py-3 ${
          isDark ? "glass-dark" : "glass"
        } border-t border-white/20`}
      >
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => imageInputRef.current?.click()}
            className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 transition-all active:scale-90 ${
              isDark ? "bg-white/10 text-gray-300" : "bg-gray-100 text-gray-600"
            }`}
            data-ocid="chat.upload_button"
          >
            <Image size={18} />
          </button>
          <input
            ref={imageInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleImageSelect}
          />

          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Message..."
            className={`flex-1 px-4 py-2.5 rounded-full text-sm outline-none ${
              isDark ? "bg-white/10" : "bg-gray-100"
            }`}
            onKeyDown={(e) => e.key === "Enter" && send()}
            data-ocid="chat.input"
          />
          <button
            type="button"
            onClick={() => send()}
            className="w-10 h-10 rounded-full btn-gradient flex items-center justify-center flex-shrink-0"
            data-ocid="chat.submit_button"
          >
            <Send size={16} className="text-white" />
          </button>
        </div>
      </div>
    </div>
  );
}
