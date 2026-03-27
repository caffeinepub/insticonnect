import { Calendar, Home, MessageSquare, Plus, User } from "lucide-react";
import { type Page, useApp } from "../App";

const leftTabs: { icon: typeof Home; label: string; page: Page }[] = [
  { icon: Home, label: "Home", page: "home" },
  { icon: Calendar, label: "Plans", page: "plans" },
];

const rightTabs: { icon: typeof Home; label: string; page: Page }[] = [
  { icon: MessageSquare, label: "Discuss", page: "discuss" },
  { icon: User, label: "Me", page: "profile" },
];

export default function BottomNav() {
  const { page, navigate, theme, openCreatePost } = useApp();

  const renderTab = ({
    icon: Icon,
    label,
    page: tabPage,
  }: (typeof leftTabs)[0]) => {
    const active =
      page === tabPage || (tabPage === "discuss" && page === "discuss-detail");
    return (
      <button
        type="button"
        key={tabPage}
        onClick={() => navigate(tabPage)}
        className={`flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-2xl transition-all active:scale-90 ${
          active
            ? "text-purple-600"
            : theme === "dark"
              ? "text-gray-400"
              : "text-gray-500"
        }`}
      >
        <div
          className={`relative p-1.5 rounded-xl transition-all ${
            active
              ? theme === "dark"
                ? "bg-purple-600/20"
                : "bg-purple-50"
              : ""
          }`}
        >
          <Icon size={22} strokeWidth={active ? 2.5 : 1.8} />
        </div>
        <span
          className={`text-[10px] font-medium ${
            active ? "text-purple-600 font-semibold" : ""
          }`}
        >
          {label}
        </span>
      </button>
    );
  };

  return (
    <nav
      className={`fixed bottom-0 left-0 right-0 z-40 max-w-[430px] mx-auto
        ${theme === "dark" ? "glass-dark" : "glass"}
        border-t border-white/20 pb-safe
      `}
    >
      <div className="flex items-center justify-around px-2 h-16">
        {leftTabs.map(renderTab)}

        {/* Center Post Button */}
        <button
          type="button"
          onClick={openCreatePost}
          className="flex flex-col items-center gap-0.5 -mt-5"
          data-ocid="bottom_nav.create_post"
        >
          <div
            className="w-14 h-14 rounded-full btn-gradient flex items-center justify-center shadow-lg active:scale-90 transition-transform"
            style={{ boxShadow: "0 6px 24px rgba(124,58,237,0.45)" }}
          >
            <Plus size={28} className="text-white" strokeWidth={2.5} />
          </div>
          <span
            className={`text-[10px] font-medium mt-0.5 ${
              theme === "dark" ? "text-gray-400" : "text-gray-500"
            }`}
          >
            Post
          </span>
        </button>

        {rightTabs.map(renderTab)}
      </div>
    </nav>
  );
}
