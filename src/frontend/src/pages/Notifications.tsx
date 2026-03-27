import { ChevronLeft } from "lucide-react";
import { useApp } from "../App";
import { notifications as mockNotifications } from "../mockData";

export default function Notifications() {
  const { theme, goBack } = useApp();
  const today = mockNotifications.slice(0, 4);
  const week = mockNotifications.slice(4);
  const surface = theme === "dark" ? "bg-[#1A1D27]" : "bg-white";
  const text2 = theme === "dark" ? "text-gray-400" : "text-gray-500";

  const NotifRow = ({ n }: { n: (typeof mockNotifications)[0] }) => (
    <div
      className={`flex items-center gap-3 px-4 py-3.5 transition-all ${
        !n.read ? (theme === "dark" ? "bg-purple-900/20" : "bg-purple-50") : ""
      }`}
    >
      <div className="relative flex-shrink-0">
        <img
          src={n.avatar}
          alt={n.username}
          className="w-11 h-11 rounded-full object-cover"
        />
        {!n.read && (
          <div className="absolute -top-0.5 -right-0.5 w-3 h-3 rounded-full bg-purple-600 border-2 border-white dark:border-[#1A1D27]" />
        )}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm leading-tight">
          <span className="font-semibold">{n.username}</span>{" "}
          <span className={text2}>{n.action}</span>
        </p>
        <p className={`text-xs ${text2} mt-0.5`}>{n.time} ago</p>
      </div>
      {n.thumbnail && (
        <img
          src={n.thumbnail}
          alt="thumb"
          className="w-11 h-11 rounded-xl object-cover flex-shrink-0"
        />
      )}
    </div>
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
        >
          <ChevronLeft size={24} />
        </button>
        <h2 className="font-bold text-lg">Notifications</h2>
      </div>

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

      <div
        className={`${surface} mx-4 mt-3 rounded-2xl overflow-hidden shadow-md`}
      >
        <div
          className={`px-4 py-2 border-b ${theme === "dark" ? "border-white/5" : "border-gray-100"}`}
        >
          <p className="text-xs font-bold uppercase tracking-wider opacity-50">
            This Week
          </p>
        </div>
        {week.map((n) => (
          <NotifRow key={n.id} n={n} />
        ))}
      </div>
    </div>
  );
}
