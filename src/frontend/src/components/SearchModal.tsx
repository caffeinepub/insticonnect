import { Search, X } from "lucide-react";
import { useMemo, useState } from "react";
import { useApp } from "../App";
import { currentUser, mockUsers } from "../mockData";

interface SearchModalProps {
  onClose: () => void;
}

export default function SearchModal({ onClose }: SearchModalProps) {
  const { theme, navigate } = useApp();
  const [query, setQuery] = useState("");

  const allUsers = useMemo(() => [currentUser, ...mockUsers], []);

  const results = useMemo(() => {
    const q = query.toLowerCase().trim();
    if (!q) return allUsers;
    return allUsers.filter(
      (u) =>
        u.username.toLowerCase().includes(q) ||
        u.name.toLowerCase().includes(q),
    );
  }, [query, allUsers]);

  const surface = theme === "dark" ? "bg-[#1A1D27]" : "bg-white";
  const inputBg = theme === "dark" ? "bg-white/10" : "bg-gray-100";
  const text2 = theme === "dark" ? "text-gray-400" : "text-gray-500";

  const goToProfile = (userId: string) => {
    onClose();
    if (userId === currentUser.id) {
      navigate("profile");
    } else {
      navigate("other-profile", { userId });
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col"
      style={{ background: theme === "dark" ? "#0D0F14" : "#F6F8FB" }}
    >
      {/* Header */}
      <div
        className={`flex items-center gap-3 px-4 pt-12 pb-3 border-b ${
          theme === "dark" ? "border-white/10" : "border-gray-100"
        }`}
      >
        <div
          className={`flex items-center gap-2 flex-1 ${inputBg} rounded-2xl px-3 h-11`}
        >
          <Search size={16} className="opacity-50 flex-shrink-0" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search users..."
            className="flex-1 bg-transparent outline-none text-sm"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery("")}
              className="opacity-50 active:scale-90"
            >
              <X size={14} />
            </button>
          )}
        </div>
        <button
          type="button"
          onClick={onClose}
          className="text-sm font-semibold text-purple-600 active:scale-95 transition-transform"
        >
          Cancel
        </button>
      </div>

      {/* Results */}
      <div className="flex-1 overflow-y-auto">
        {results.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <span className="text-4xl">🔍</span>
            <p className={`text-sm ${text2}`}>No users found</p>
          </div>
        ) : (
          <div
            className={`mt-2 mx-4 ${surface} rounded-2xl overflow-hidden shadow-sm`}
          >
            {results.map((user, i) => (
              <button
                key={user.id}
                type="button"
                onClick={() => goToProfile(user.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 text-left active:scale-[0.98] transition-all ${
                  i < results.length - 1
                    ? `border-b ${theme === "dark" ? "border-white/5" : "border-gray-50"}`
                    : ""
                } ${theme === "dark" ? "hover:bg-white/5" : "hover:bg-gray-50"}`}
              >
                <div className="relative flex-shrink-0">
                  <img
                    src={user.avatar}
                    alt={user.username}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                  {user.isOnline && (
                    <div className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-green-400 border-2 border-white dark:border-[#1A1D27]" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm">{user.name}</p>
                  <p className={`text-xs ${text2}`}>@{user.username}</p>
                  {user.badges && user.badges.length > 0 && (
                    <div className="flex gap-1 mt-1 flex-wrap">
                      {user.badges.slice(0, 2).map((b) => (
                        <span
                          key={b}
                          className="text-[10px] bg-purple-100 dark:bg-purple-900/30 text-purple-600 px-1.5 py-0.5 rounded-full"
                        >
                          {b}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
                {user.id === currentUser.id && (
                  <span className={`text-[10px] ${text2}`}>You</span>
                )}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
