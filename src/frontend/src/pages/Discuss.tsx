import {
  ChevronDown,
  ChevronUp,
  MessageSquare,
  Plus,
  TrendingUp,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useApp } from "../App";
import BottomSheet from "../components/BottomSheet";
import { useAuth } from "../context/AuthContext";
import type { Discussion, Fundae } from "../mockData";
import {
  addDiscussion as fbAddDiscussion,
  addFundae as fbAddFundae,
  subscribeDiscussions,
  subscribeToFundaes,
} from "../utils/firebaseService";

const FILTERS = ["Hot", "New", "Top"];
const DISCUSS_CATEGORIES = [
  "General",
  "Tech",
  "Sports",
  "Culture",
  "Events",
  "Help",
  "Academic",
  "Campus Life",
  "Food",
];

const FAB_SIZE = 64;
const FAB_MARGIN = 16;

function FundaeCard({ f, theme }: { f: Fundae; theme: string }) {
  const { addToast, navigate } = useApp();

  const openFundaeChat = () => {
    addToast("Opening fundae chat...", "info");
    navigate("chat-screen", {
      chatId: "u2",
      chatName: `${f.username} (Fundae Chat)`,
      isGroup: false,
    });
  };

  const openUserProfile = () => {
    navigate("other-profile", { userId: f.username });
  };

  return (
    <div
      className={`${
        theme === "dark" ? "bg-[#1A1D27]" : "bg-white"
      } rounded-2xl p-4 shadow-md card-hover`}
    >
      <div className="flex items-center gap-2 mb-2">
        <button
          type="button"
          onClick={openUserProfile}
          className="flex items-center gap-2"
        >
          <img
            src={f.avatar}
            alt={f.username}
            className="w-7 h-7 rounded-full object-cover"
          />
          <span className="text-sm font-medium">{f.username}</span>
        </button>
        <span
          className={`ml-auto text-xs px-2 py-0.5 rounded-full ${
            f.type === "give"
              ? "bg-green-100 text-green-700"
              : "bg-blue-100 text-blue-700"
          }`}
        >
          {f.type === "give" ? "Giving" : "Requesting"}
        </span>
      </div>
      <h3 className="font-bold text-sm mb-1">{f.title}</h3>
      <p
        className={`text-xs mb-2 ${
          theme === "dark" ? "text-gray-400" : "text-gray-500"
        }`}
      >
        {f.description}
      </p>
      <div className="flex flex-wrap gap-1.5 mb-3">
        {f.tags.map((t) => (
          <span
            key={t}
            className={`text-xs px-2 py-0.5 rounded-full ${
              theme === "dark"
                ? "bg-white/10 text-gray-300"
                : "bg-gray-100 text-gray-600"
            }`}
          >
            #{t}
          </span>
        ))}
      </div>
      <button
        type="button"
        onClick={openFundaeChat}
        className={`w-full py-2 rounded-xl text-sm font-semibold transition-all ${
          f.type === "give"
            ? "btn-gradient text-white"
            : theme === "dark"
              ? "bg-blue-600 text-white"
              : "bg-blue-500 text-white"
        }`}
        data-ocid="discuss.primary_button"
      >
        {f.type === "give" ? "Get Help" : "Offer Help"}
      </button>
    </div>
  );
}

export default function Discuss() {
  const { theme, navigate, addToast } = useApp();
  const { userProfile } = useAuth();
  const [mainTab, setMainTab] = useState<"discussions" | "fundaes">(
    "discussions",
  );
  const [filter, setFilter] = useState("Hot");
  const [fundaeTab, setFundaeTab] = useState<"give" | "request">("give");
  const [discussions, setDiscussions] = useState<Discussion[]>([]);
  const [fundaes, setFundaes] = useState<Fundae[]>([]);
  const [newOpen, setNewOpen] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newBody, setNewBody] = useState("");
  const [newTags, setNewTags] = useState("");
  const [newCategory, setNewCategory] = useState("General");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [newFundaeType, setNewFundaeType] = useState<"give" | "request">(
    "give",
  );
  const [newFundaeTopic, setNewFundaeTopic] = useState("");
  const [newFundaeTags, setNewFundaeTags] = useState("");

  // Draggable FAB — uses bottom/right so it's always visible above the nav
  const [fabPos, setFabPos] = useState({ right: FAB_MARGIN, bottom: 100 });

  const drag = useRef({
    active: false,
    startX: 0,
    startY: 0,
    originRight: FAB_MARGIN,
    originBottom: 100,
  });

  const setFabPosRef = useRef(setFabPos);
  setFabPosRef.current = setFabPos;

  const openModalRef = useRef(() => setNewOpen(true));
  openModalRef.current = () => setNewOpen(true);

  useEffect(() => {
    const clamp = (v: number, lo: number, hi: number) =>
      Math.min(hi, Math.max(lo, v));

    const handleMove = (cx: number, cy: number) => {
      if (!drag.current.active) return;
      const dx = drag.current.startX - cx;
      const dy = drag.current.startY - cy;
      const newRight = clamp(
        drag.current.originRight + dx,
        0,
        window.innerWidth - FAB_SIZE,
      );
      const newBottom = clamp(
        drag.current.originBottom + dy,
        80,
        window.innerHeight - FAB_SIZE,
      );
      setFabPosRef.current({ right: newRight, bottom: newBottom });
    };

    const handleEnd = (cx: number, cy: number) => {
      if (!drag.current.active) return;
      const ddx = Math.abs(cx - drag.current.startX);
      const ddy = Math.abs(cy - drag.current.startY);
      drag.current.active = false;
      if (ddx < 5 && ddy < 5) openModalRef.current();
    };

    const onMouseMove = (e: MouseEvent) => handleMove(e.clientX, e.clientY);
    const onMouseUp = (e: MouseEvent) => handleEnd(e.clientX, e.clientY);
    const onTouchMove = (e: TouchEvent) => {
      if (drag.current.active) e.preventDefault();
      handleMove(e.touches[0].clientX, e.touches[0].clientY);
    };
    const onTouchEnd = (e: TouchEvent) =>
      handleEnd(e.changedTouches[0].clientX, e.changedTouches[0].clientY);

    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
    window.addEventListener("touchmove", onTouchMove, { passive: false });
    window.addEventListener("touchend", onTouchEnd);
    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
      window.removeEventListener("touchmove", onTouchMove);
      window.removeEventListener("touchend", onTouchEnd);
    };
  }, []);

  const startDrag = (cx: number, cy: number) => {
    drag.current = {
      active: true,
      startX: cx,
      startY: cy,
      originRight: fabPos.right,
      originBottom: fabPos.bottom,
    };
  };

  useEffect(() => {
    const unsubD = subscribeDiscussions((items) => setDiscussions(items));
    const unsubF = subscribeToFundaes((items) =>
      setFundaes(items as unknown as Fundae[]),
    );
    return () => {
      unsubD();
      unsubF();
    };
  }, []);

  const vote = (id: string, dir: "up" | "down") => {
    setDiscussions((ds) =>
      ds.map((d) => {
        if (d.id !== id) return d;
        const wasUp = d.voted === "up";
        const wasDown = d.voted === "down";
        return {
          ...d,
          voted: d.voted === dir ? null : dir,
          upvotes:
            dir === "up"
              ? d.upvotes + (wasUp ? -1 : 1)
              : d.upvotes - (wasDown ? 0 : wasUp ? 1 : 0),
          downvotes:
            dir === "down"
              ? d.downvotes + (wasDown ? -1 : 1)
              : d.downvotes - (wasUp ? 0 : wasDown ? 1 : 0),
        };
      }),
    );
  };

  const resetForm = () => {
    setNewTitle("");
    setNewBody("");
    setNewTags("");
    setNewCategory("General");
    setNewFundaeType("give");
    setNewFundaeTopic("");
    setNewFundaeTags("");
  };

  const surface = theme === "dark" ? "bg-[#1A1D27]" : "bg-white";
  const text2 = theme === "dark" ? "text-gray-400" : "text-gray-500";
  const inputCls = `w-full px-4 py-3 rounded-2xl border text-sm outline-none ${
    theme === "dark"
      ? "bg-white/5 border-white/10 text-white"
      : "bg-gray-50 border-gray-200"
  }`;

  return (
    <div className="page-fade">
      {/* Main tabs */}
      <div
        className={`${surface} sticky top-0 z-10 px-4 pt-4 pb-0 border-b ${
          theme === "dark" ? "border-white/5" : "border-gray-100"
        }`}
      >
        <div className="flex items-center justify-between">
          <div className="flex gap-6">
            {(["discussions", "fundaes"] as const).map((tab) => (
              <button
                type="button"
                key={tab}
                onClick={() => setMainTab(tab)}
                className={`pb-3 text-sm font-semibold capitalize border-b-2 transition-all ${
                  mainTab === tab
                    ? "border-purple-600 text-purple-600"
                    : `border-transparent ${text2}`
                }`}
                data-ocid="discuss.tab"
              >
                {tab === "fundaes" ? "Fundaes 💡" : "Discussions"}
              </button>
            ))}
          </div>
          {/* New Discussion / Fundae button in header */}
          <button
            type="button"
            onClick={() => setNewOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 mb-3 rounded-full btn-gradient text-white text-xs font-semibold shadow-lg shadow-purple-500/30 active:scale-95 transition-transform"
            data-ocid="discuss.open_modal_button"
          >
            <Plus size={14} />
            {mainTab === "fundaes" ? "New Fundae" : "New Discussion"}
          </button>
        </div>
      </div>

      {mainTab === "discussions" && (
        <div className="px-4 pt-3">
          {/* Sort filter chips */}
          <div className="flex gap-2 mb-2 overflow-x-auto">
            {FILTERS.map((f) => (
              <button
                type="button"
                key={f}
                onClick={() => setFilter(f)}
                className={`flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
                  filter === f
                    ? "bg-purple-600 text-white"
                    : theme === "dark"
                      ? "bg-white/10 text-gray-300"
                      : "bg-gray-100 text-gray-600"
                }`}
                data-ocid="discuss.tab"
              >
                {f === "Hot" && <TrendingUp size={12} />}
                {f}
              </button>
            ))}
          </div>
          {/* Category filter chips */}
          <div className="flex gap-2 mb-4 overflow-x-auto">
            {["All", ...DISCUSS_CATEGORIES].map((cat) => (
              <button
                type="button"
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`flex-shrink-0 px-3 py-1 rounded-full text-xs font-semibold transition-all ${
                  selectedCategory === cat
                    ? "bg-purple-500/20 text-purple-500 ring-1 ring-purple-500/40"
                    : theme === "dark"
                      ? "bg-white/5 text-gray-400"
                      : "bg-gray-50 text-gray-500"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {discussions.length === 0 && (
            <div
              className="flex flex-col items-center justify-center py-16 gap-3"
              data-ocid="discuss.empty_state"
            >
              <div className="w-16 h-16 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                <MessageSquare size={28} className="text-purple-500" />
              </div>
              <p className={`text-sm font-medium ${text2}`}>
                No discussions yet. Start the first one!
              </p>
              <button
                type="button"
                onClick={() => setNewOpen(true)}
                className="px-5 py-2.5 rounded-full btn-gradient text-white text-sm font-semibold"
              >
                + New Discussion
              </button>
            </div>
          )}

          <div className="space-y-3 pb-4">
            {discussions
              .filter(
                (d) =>
                  selectedCategory === "All" || d.category === selectedCategory,
              )
              .map((d) => (
                <button
                  type="button"
                  key={d.id}
                  onClick={() =>
                    navigate("discuss-detail", { discussionId: d.id })
                  }
                  className={`w-full text-left ${surface} rounded-2xl p-4 shadow-md card-hover block`}
                >
                  <div className="flex gap-3">
                    {/* Votes */}
                    <div className="flex flex-col items-center gap-1 flex-shrink-0">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          vote(d.id, "up");
                        }}
                        className={`p-1 rounded-lg transition-all ${
                          d.voted === "up" ? "text-orange-500" : text2
                        }`}
                      >
                        <ChevronUp size={18} />
                      </button>
                      <span
                        className={`text-xs font-bold ${
                          d.voted === "up"
                            ? "text-orange-500"
                            : d.voted === "down"
                              ? "text-blue-500"
                              : ""
                        }`}
                      >
                        {d.upvotes - d.downvotes}
                      </span>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          vote(d.id, "down");
                        }}
                        className={`p-1 rounded-lg transition-all ${
                          d.voted === "down" ? "text-blue-500" : text2
                        }`}
                      >
                        <ChevronDown size={18} />
                      </button>
                    </div>

                    <div className="flex-1 min-w-0">
                      {d.category && (
                        <span className="inline-block text-[10px] px-2 py-0.5 rounded-full bg-purple-600/20 text-purple-500 font-semibold mb-1">
                          {d.category}
                        </span>
                      )}
                      <h3 className="font-semibold text-sm leading-tight">
                        {d.title}
                      </h3>
                      <p className={`text-xs ${text2} mt-1 line-clamp-2`}>
                        {d.body}
                      </p>
                      <div className="flex flex-wrap gap-1.5 mt-2">
                        {d.tags.map((t) => (
                          <span
                            key={t}
                            className={`text-[10px] px-2 py-0.5 rounded-full ${
                              theme === "dark"
                                ? "bg-white/10 text-gray-300"
                                : "bg-gray-100 text-gray-600"
                            }`}
                          >
                            #{t}
                          </span>
                        ))}
                      </div>
                      <div
                        className={`flex items-center gap-4 mt-2 text-[11px] ${text2}`}
                      >
                        <span className="flex items-center gap-1">
                          <MessageSquare size={11} />
                          {d.comments.length} comments
                        </span>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate("other-profile", {
                              userId: d.userId || d.username,
                            });
                          }}
                          className="flex items-center gap-1 hover:opacity-80 transition-opacity cursor-pointer"
                        >
                          <img
                            src={d.avatar}
                            alt={d.username}
                            className="w-5 h-5 rounded-full object-cover"
                          />
                          <span>by {d.username}</span>
                        </button>
                        <span>{d.time} ago</span>
                      </div>
                    </div>
                  </div>
                </button>
              ))}
          </div>
        </div>
      )}

      {mainTab === "fundaes" && (
        <div className="px-4 pt-3">
          {/* Sub tabs */}
          <div
            className={`flex rounded-2xl p-1 mb-4 ${
              theme === "dark" ? "bg-white/5" : "bg-gray-100"
            }`}
          >
            {(["give", "request"] as const).map((t) => (
              <button
                type="button"
                key={t}
                onClick={() => setFundaeTab(t)}
                className={`flex-1 py-2 rounded-xl text-sm font-semibold transition-all capitalize ${
                  fundaeTab === t
                    ? "bg-white dark:bg-gray-800 shadow-sm text-purple-600"
                    : text2
                }`}
                data-ocid="discuss.tab"
              >
                {t === "give" ? "Give Fundae 💡" : "Request Help 🙋"}
              </button>
            ))}
          </div>

          <div className="space-y-3 pb-4">
            {fundaes
              .filter((f) => f.type === fundaeTab)
              .map((f) => (
                <FundaeCard key={f.id} f={f} theme={theme} />
              ))}
          </div>
        </div>
      )}

      {/* Draggable FAB — uses bottom/right so it never hides behind bottom nav */}
      <button
        type="button"
        onMouseDown={(e) => {
          e.preventDefault();
          startDrag(e.clientX, e.clientY);
        }}
        onTouchStart={(e) => {
          startDrag(e.touches[0].clientX, e.touches[0].clientY);
        }}
        className="fixed rounded-full btn-gradient flex items-center justify-center z-50 cursor-grab active:cursor-grabbing select-none"
        style={{
          right: fabPos.right,
          bottom: fabPos.bottom,
          width: FAB_SIZE,
          height: FAB_SIZE,
          touchAction: "none",
          boxShadow:
            "0 0 0 3px rgba(168,85,247,0.4), 0 8px 32px rgba(168,85,247,0.5)",
        }}
        data-ocid="discuss.open_modal_button"
        aria-label="New Discussion"
      >
        <Plus size={28} className="text-white drop-shadow-lg" strokeWidth={3} />
      </button>

      <BottomSheet
        open={newOpen}
        onClose={() => {
          setNewOpen(false);
          resetForm();
        }}
        title={mainTab === "fundaes" ? "New Fundae" : "New Discussion"}
      >
        <div className="space-y-3">
          {mainTab === "fundaes" ? (
            <>
              {/* Fundae type toggle */}
              <div
                className={`flex rounded-2xl p-1 ${
                  theme === "dark" ? "bg-white/5" : "bg-gray-100"
                }`}
              >
                {(["give", "request"] as const).map((t) => (
                  <button
                    type="button"
                    key={t}
                    onClick={() => setNewFundaeType(t)}
                    className={`flex-1 py-2 rounded-xl text-sm font-semibold transition-all ${
                      newFundaeType === t
                        ? "bg-white dark:bg-gray-800 shadow-sm text-purple-600"
                        : text2
                    }`}
                  >
                    {t === "give" ? "Give Fundae 💡" : "Request Help 🙋"}
                  </button>
                ))}
              </div>

              <div>
                <p className={`text-xs font-semibold mb-1 block ${text2}`}>
                  Title *
                </p>
                <input
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. DSA Interview Tips"
                  className={inputCls}
                  data-ocid="discuss.input"
                />
              </div>

              <div>
                <p className={`text-xs font-semibold mb-1 block ${text2}`}>
                  Subject / Topic
                </p>
                <input
                  value={newFundaeTopic}
                  onChange={(e) => setNewFundaeTopic(e.target.value)}
                  placeholder="e.g. Machine Learning, DSA"
                  className={inputCls}
                />
              </div>

              <div>
                <p className={`text-xs font-semibold mb-1 block ${text2}`}>
                  Description
                </p>
                <textarea
                  value={newBody}
                  onChange={(e) => setNewBody(e.target.value)}
                  placeholder={
                    newFundaeType === "give"
                      ? "Describe what you can help with..."
                      : "Describe what you need help with..."
                  }
                  rows={3}
                  className={`${inputCls} resize-none`}
                  data-ocid="discuss.textarea"
                />
              </div>

              <div>
                <p className={`text-xs font-semibold mb-1 block ${text2}`}>
                  Tags
                </p>
                <input
                  value={newFundaeTags}
                  onChange={(e) => setNewFundaeTags(e.target.value)}
                  placeholder="Comma-separated, e.g. ml, python, exam"
                  className={inputCls}
                />
              </div>
            </>
          ) : (
            <>
              <div>
                <p className={`text-xs font-semibold mb-1 block ${text2}`}>
                  Discussion Title *
                </p>
                <input
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="What do you want to discuss?"
                  className={inputCls}
                  data-ocid="discuss.input"
                />
              </div>

              <div>
                <p className={`text-xs font-semibold mb-1 block ${text2}`}>
                  Body / Description
                </p>
                <textarea
                  value={newBody}
                  onChange={(e) => setNewBody(e.target.value)}
                  placeholder="Share your thoughts, questions, or ideas..."
                  rows={4}
                  className={`${inputCls} resize-none`}
                  data-ocid="discuss.textarea"
                />
              </div>

              <div>
                <p className={`text-xs font-semibold mb-1 block ${text2}`}>
                  Tags
                </p>
                <input
                  value={newTags}
                  onChange={(e) => setNewTags(e.target.value)}
                  placeholder="Comma-separated, e.g. coding, iitm, exam"
                  className={inputCls}
                />
              </div>

              {/* Category chips */}
              <div>
                <p className={`text-xs font-semibold mb-2 block ${text2}`}>
                  Category
                </p>
                <div className="flex flex-wrap gap-2">
                  {DISCUSS_CATEGORIES.map((cat) => (
                    <button
                      type="button"
                      key={cat}
                      onClick={() => setNewCategory(cat)}
                      className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
                        newCategory === cat
                          ? "bg-purple-600 text-white shadow-md"
                          : theme === "dark"
                            ? "bg-white/10 text-gray-300"
                            : "bg-gray-100 text-gray-600"
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}

          <button
            type="button"
            onClick={async () => {
              if (!newTitle.trim()) return;
              const username = userProfile?.username ?? "user";
              const avatar = userProfile?.avatar ?? "";
              const userId = userProfile?.id ?? "";
              try {
                if (mainTab === "fundaes") {
                  const tags = newFundaeTags
                    .split(",")
                    .map((t) => t.trim())
                    .filter(Boolean);
                  await fbAddFundae({
                    type: newFundaeType,
                    username,
                    avatar,
                    title: newTitle.trim(),
                    description: newBody.trim(),
                    tags,
                    time: "just now",
                  });
                } else {
                  const tags = newTags
                    .split(",")
                    .map((t) => t.trim())
                    .filter(Boolean);
                  await fbAddDiscussion({
                    userId,
                    username,
                    avatar,
                    title: newTitle.trim(),
                    body: newBody.trim(),
                    tags,
                    category: newCategory,
                    upvotes: 0,
                    downvotes: 0,
                    voted: null,
                    comments: [],
                    time: "just now",
                  } as unknown as Omit<Discussion, "id">);
                }
                addToast("Posted! 🎉", "success");
              } catch {
                addToast("Failed to post", "error");
              }
              resetForm();
              setNewOpen(false);
            }}
            disabled={!newTitle.trim()}
            className="w-full py-3.5 rounded-2xl text-white font-semibold text-sm btn-gradient disabled:opacity-40 mt-1"
            data-ocid="discuss.submit_button"
          >
            {mainTab === "fundaes" ? "Post Fundae 💡" : "Post Discussion 🚀"}
          </button>
        </div>
      </BottomSheet>
    </div>
  );
}
