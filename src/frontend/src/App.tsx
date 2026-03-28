import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import BottomNav from "./components/BottomNav";
import Toast from "./components/Toast";
import TopBar from "./components/TopBar";
import { AuthProvider, useAuth } from "./context/AuthContext";
import type { Post, User } from "./mockData";
import Chat from "./pages/Chat";
import ChatScreen from "./pages/ChatScreen";
import CreatePost from "./pages/CreatePost";
import Discuss from "./pages/Discuss";
import DiscussDetail from "./pages/DiscussDetail";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Notifications from "./pages/Notifications";
import Onboarding from "./pages/Onboarding";
import OtherProfile from "./pages/OtherProfile";
import Plans from "./pages/Plans";
import Profile from "./pages/Profile";
import Settings from "./pages/Settings";
import UsernameSetup from "./pages/UsernameSetup";

export type Page =
  | "home"
  | "plans"
  | "discuss"
  | "discuss-detail"
  | "chat"
  | "chat-screen"
  | "profile"
  | "other-profile"
  | "notifications"
  | "settings"
  | "login"
  | "onboarding"
  | "username-setup";

export type AccentTheme = "pride" | "blue" | "pink";

export interface ToastItem {
  id: string;
  message: string;
  type: "success" | "error" | "info";
}

interface AppContextType {
  user: User | null;
  setUser: (u: User | null) => void;
  page: Page;
  navigate: (p: Page, meta?: Record<string, unknown>) => void;
  goBack: () => void;
  pageMeta: Record<string, unknown>;
  theme: "light" | "dark";
  toggleTheme: () => void;
  accentTheme: AccentTheme;
  setAccentTheme: (a: AccentTheme) => void;
  addToast: (msg: string, type?: ToastItem["type"]) => void;
  toasts: ToastItem[];
  removeToast: (id: string) => void;
  openCreatePost: () => void;
  onNewPost: (post: Post) => void;
  setOnNewPost: (fn: (post: Post) => void) => void;
  showSavedPosts: boolean;
  setShowSavedPosts: (v: boolean) => void;
  showLikedPosts: boolean;
  setShowLikedPosts: (v: boolean) => void;
}

export const AppContext = createContext<AppContextType>(null!);
export const useApp = () => useContext(AppContext);

// Bridge: syncs Firebase auth state -> AppContext user and handles navigation
function AuthSync() {
  const { userProfile, loading, needsUsernameSetup } = useAuth();
  const { setUser, page, navigate } = useApp();

  // biome-ignore lint/correctness/useExhaustiveDependencies: page/navigate/setUser are stable
  useEffect(() => {
    if (loading) return;
    if (needsUsernameSetup) {
      navigate("username-setup");
      return;
    }
    if (userProfile) {
      setUser(userProfile);
      if (page === "login" || page === "onboarding") {
        navigate("home");
      }
    } else {
      setUser(null);
      if (page !== "username-setup") {
        navigate("login");
      }
    }
  }, [userProfile, loading, needsUsernameSetup]);

  return null;
}

const PAGES_WITH_NAV: Page[] = ["home", "plans", "discuss", "chat", "profile"];
const PAGES_NO_TOP: Page[] = [
  "chat-screen",
  "login",
  "onboarding",
  "other-profile",
  "username-setup",
];
const SWIPEABLE_TABS: Page[] = ["home", "plans", "discuss"];

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [page, setPage] = useState<Page>("login");
  const historyRef = useRef<Page[]>([]);
  const [pageMeta, setPageMeta] = useState<Record<string, unknown>>({});
  const [pageDir, setPageDir] = useState<"forward" | "back">("forward");
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [accentTheme, setAccentTheme] = useState<AccentTheme>("pride");
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const [createPostOpen, setCreatePostOpen] = useState(false);
  const newPostCallbackRef = useRef<((post: Post) => void) | null>(null);
  const pageRef = useRef(page);
  pageRef.current = page;
  const [showSavedPosts, setShowSavedPosts] = useState(true);
  const [showLikedPosts, setShowLikedPosts] = useState(true);

  // Swipe gesture state
  const touchStartX = useRef(0);
  const touchStartY = useRef(0);

  useEffect(() => {
    if (theme === "dark") document.documentElement.classList.add("dark");
    else document.documentElement.classList.remove("dark");
  }, [theme]);

  useEffect(() => {
    document.documentElement.className =
      document.documentElement.className.replace(/accent-\w+/g, "");
    document.documentElement.classList.add(`accent-${accentTheme}`);
    if (theme === "dark") document.documentElement.classList.add("dark");
  }, [accentTheme, theme]);

  const navigate = useCallback(
    (p: Page, meta: Record<string, unknown> = {}) => {
      historyRef.current = [...historyRef.current, pageRef.current];
      setPageMeta(meta);
      setPageDir("forward");
      setPage(p);
    },
    [],
  );

  const goBack = useCallback(() => {
    const h = historyRef.current;
    const prev = (h[h.length - 1] as Page) || "home";
    historyRef.current = h.slice(0, -1);
    setPageDir("back");
    setPage(prev);
  }, []);

  const toggleTheme = useCallback(
    () => setTheme((t) => (t === "light" ? "dark" : "light")),
    [],
  );

  const removeToast = useCallback(
    (id: string) => setToasts((t) => t.filter((x) => x.id !== id)),
    [],
  );

  const addToast = useCallback(
    (message: string, type: ToastItem["type"] = "success") => {
      const id = Math.random().toString(36).slice(2);
      setToasts((t) => [...t, { id, message, type }]);
      setTimeout(() => removeToast(id), 3500);
    },
    [removeToast],
  );

  const openCreatePost = useCallback(() => setCreatePostOpen(true), []);

  const onNewPost = useCallback(
    (post: Post) => {
      if (newPostCallbackRef.current) newPostCallbackRef.current(post);
      addToast("Post shared! 🎉", "success");
      if (pageRef.current !== "home") navigate("home");
    },
    [addToast, navigate],
  );

  const setOnNewPost = useCallback((fn: (post: Post) => void) => {
    newPostCallbackRef.current = fn;
  }, []);

  // Swipe tab navigation
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
  }, []);

  const handleTouchEnd = useCallback((e: React.TouchEvent) => {
    const curPage = pageRef.current;
    if (!SWIPEABLE_TABS.includes(curPage)) return;
    const dx = e.changedTouches[0].clientX - touchStartX.current;
    const dy = e.changedTouches[0].clientY - touchStartY.current;
    if (Math.abs(dx) < 50 || Math.abs(dy) > Math.abs(dx) * 0.8) return;
    const idx = SWIPEABLE_TABS.indexOf(curPage);
    if (dx < -50 && idx < SWIPEABLE_TABS.length - 1) {
      // swipe left -> next tab
      setPageDir("forward");
      setPageMeta({});
      historyRef.current = [...historyRef.current, curPage];
      setPage(SWIPEABLE_TABS[idx + 1]);
    } else if (dx > 50 && idx > 0) {
      // swipe right -> prev tab
      setPageDir("back");
      setPageMeta({});
      historyRef.current = [...historyRef.current, curPage];
      setPage(SWIPEABLE_TABS[idx - 1]);
    }
  }, []);

  const showNav = PAGES_WITH_NAV.includes(page);
  const showTop = !PAGES_NO_TOP.includes(page) && user !== null;
  const hideTopForPage = ["notifications", "settings"].includes(page);

  const renderPage = () => {
    if (page === "username-setup") {
      return (
        <div key="username-setup" className="page-enter">
          <UsernameSetup />
        </div>
      );
    }
    if (!user) {
      if (page === "onboarding") {
        return (
          <div
            key={page}
            className={pageDir === "forward" ? "page-enter" : "page-enter-back"}
          >
            <Onboarding />
          </div>
        );
      }
      return (
        <div key="login" className="page-enter">
          <Login />
        </div>
      );
    }
    const cls = pageDir === "forward" ? "page-enter" : "page-enter-back";
    switch (page) {
      case "home":
        return (
          <div key={page} className={cls}>
            <Home />
          </div>
        );
      case "plans":
        return (
          <div key={page} className={cls}>
            <Plans />
          </div>
        );
      case "discuss":
        return (
          <div key={page} className={cls}>
            <Discuss />
          </div>
        );
      case "discuss-detail":
        return (
          <div key={page} className={cls}>
            <DiscussDetail />
          </div>
        );
      case "chat":
        return (
          <div key={page} className={cls}>
            <Chat />
          </div>
        );
      case "chat-screen":
        return (
          <div key={page} className={cls}>
            <ChatScreen />
          </div>
        );
      case "profile":
        return (
          <div key={page} className={cls}>
            <Profile />
          </div>
        );
      case "other-profile":
        return (
          <div key={`${page}-${JSON.stringify(pageMeta)}`} className={cls}>
            <OtherProfile />
          </div>
        );
      case "notifications":
        return (
          <div key={page} className={cls}>
            <Notifications />
          </div>
        );
      case "settings":
        return (
          <div key={page} className={cls}>
            <Settings />
          </div>
        );
      default:
        return (
          <div key={page} className={cls}>
            <Home />
          </div>
        );
    }
  };

  const mainClass = [
    "flex-1 overflow-y-auto",
    showNav ? "pb-20" : "",
    showTop && !hideTopForPage ? "pt-16" : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <AuthProvider>
      <AppContext.Provider
        value={{
          user,
          setUser,
          page,
          navigate,
          goBack,
          pageMeta,
          theme,
          toggleTheme,
          accentTheme,
          setAccentTheme,
          addToast,
          toasts,
          removeToast,
          openCreatePost,
          onNewPost,
          setOnNewPost,
          showSavedPosts,
          setShowSavedPosts,
          showLikedPosts,
          setShowLikedPosts,
        }}
      >
        {/* Sync Firebase auth state -> AppContext */}
        <AuthSync />

        <div
          className={`blob-bg min-h-screen font-[Outfit,sans-serif] relative ${
            theme === "dark"
              ? "bg-[#0D0F14] text-[#F9FAFB]"
              : "bg-[#F6F8FB] text-[#111827]"
          }`}
        >
          <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
            <div
              className="absolute -top-32 -left-32 w-96 h-96 rounded-full opacity-20"
              style={{
                background:
                  "radial-gradient(ellipse, #7C3AED 0%, transparent 70%)",
              }}
            />
            <div
              className="absolute -bottom-24 -right-24 w-80 h-80 rounded-full opacity-15"
              style={{
                background:
                  "radial-gradient(ellipse, #D946EF 0%, transparent 70%)",
              }}
            />
            <div
              className="absolute top-1/2 left-1/2 w-64 h-64 rounded-full opacity-10"
              style={{
                background:
                  "radial-gradient(ellipse, #3B82F6 0%, transparent 70%)",
                transform: "translate(-50%,-50%)",
              }}
            />
          </div>

          <div className="relative z-10 max-w-[430px] mx-auto min-h-screen flex flex-col">
            {showTop && !hideTopForPage && <TopBar />}
            <main
              className={mainClass}
              onTouchStart={handleTouchStart}
              onTouchEnd={handleTouchEnd}
            >
              {renderPage()}
            </main>
            {showNav && <BottomNav />}
          </div>

          {createPostOpen && (
            <CreatePost
              onPost={(post) => {
                onNewPost(post);
                setCreatePostOpen(false);
              }}
              onClose={() => setCreatePostOpen(false)}
            />
          )}

          <Toast />
        </div>
      </AppContext.Provider>
    </AuthProvider>
  );
}
