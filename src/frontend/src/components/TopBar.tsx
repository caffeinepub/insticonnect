import { Bell, MessageCircle, Search } from "lucide-react";
import { useState } from "react";
import { useApp } from "../App";
import { notifications } from "../mockData";
import SearchModal from "./SearchModal";

export default function TopBar() {
  const { theme, navigate } = useApp();
  const unread = notifications.filter((n) => !n.read).length;
  const [searchOpen, setSearchOpen] = useState(false);

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-40 flex items-center justify-between px-4 h-14
          max-w-[430px] mx-auto
          ${theme === "dark" ? "glass-dark" : "glass"}
          shadow-sm
        `}
      >
        <button
          type="button"
          onClick={() => navigate("home")}
          className="text-xl font-bold tracking-tight gradient-text select-none"
        >
          InstiConnect
        </button>

        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => setSearchOpen(true)}
            className={`p-2 rounded-full transition-all active:scale-90 ${
              theme === "dark" ? "hover:bg-white/10" : "hover:bg-black/5"
            }`}
          >
            <Search size={20} className="opacity-70" />
          </button>

          {/* Chat icon in top bar */}
          <button
            type="button"
            onClick={() => navigate("chat")}
            className={`p-2 rounded-full transition-all active:scale-90 ${
              theme === "dark" ? "hover:bg-white/10" : "hover:bg-black/5"
            }`}
            data-ocid="topbar.chat_button"
          >
            <MessageCircle size={20} className="opacity-70" />
          </button>

          {/* Notifications */}
          <button
            type="button"
            onClick={() => navigate("notifications")}
            className={`relative p-2 rounded-full transition-all active:scale-90 ${
              theme === "dark" ? "hover:bg-white/10" : "hover:bg-black/5"
            }`}
          >
            <Bell size={20} className="opacity-70" />
            {unread > 0 && (
              <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center leading-none">
                {unread}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => navigate("profile")}
            className="w-8 h-8 rounded-full overflow-hidden border-2 transition-transform active:scale-90"
            style={{ borderColor: "#7C3AED" }}
          >
            <img
              src="https://picsum.photos/seed/user1/100/100"
              alt="me"
              className="w-full h-full object-cover"
            />
          </button>
        </div>
      </header>

      {searchOpen && <SearchModal onClose={() => setSearchOpen(false)} />}
    </>
  );
}
