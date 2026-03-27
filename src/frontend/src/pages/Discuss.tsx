import {
  ChevronDown,
  ChevronUp,
  MessageSquare,
  Plus,
  TrendingUp,
} from "lucide-react";
import { useEffect, useState } from "react";
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
  const [newFundaeType, _setNewFundaeType] = useState<"give" | "request">(
    "give",
  );

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

  const surface = theme === "dark" ? "bg-[#1A1D27]" : "bg-white";
  const text2 = theme === "dark" ? "text-gray-400" : "text-gray-500";

  return (
    <div className="page-fade">
      {/* Main tabs */}
      <div
        className={`${surface} sticky top-0 z-20 px-4 pt-4 pb-0 border-b ${
          theme === "dark" ? "border-white/5" : "border-gray-100"
        }`}
      >
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
      </div>

      {mainTab === "discussions" && (
        <div className="px-4 pt-3">
          {/* Filter chips */}
          <div className="flex gap-2 mb-4 overflow-x-auto">
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

          <div className="space-y-3 pb-4">
            {discussions.map((d) => (
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

      {/* FAB */}
      <button
        type="button"
        onClick={() => setNewOpen(true)}
        className="fixed bottom-24 right-4 w-14 h-14 rounded-full btn-gradient shadow-2xl flex items-center justify-center z-30 transition-transform active:scale-90"
        style={{ boxShadow: "0 8px 32px rgba(124,58,237,0.5)" }}
        data-ocid="discuss.open_modal_button"
      >
        <Plus size={26} className="text-white" />
      </button>

      <BottomSheet
        open={newOpen}
        onClose={() => setNewOpen(false)}
        title={mainTab === "fundaes" ? "New Fundae" : "New Discussion"}
      >
        <div className="space-y-3">
          <input
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            placeholder="Title"
            className={`w-full px-4 py-3 rounded-2xl border text-sm outline-none ${
              theme === "dark"
                ? "bg-white/5 border-white/10"
                : "bg-gray-50 border-gray-200"
            }`}
            data-ocid="discuss.input"
          />
          <textarea
            value={newBody}
            onChange={(e) => setNewBody(e.target.value)}
            placeholder="What do you want to discuss?"
            rows={3}
            className={`w-full px-4 py-3 rounded-2xl border text-sm outline-none resize-none ${
              theme === "dark"
                ? "bg-white/5 border-white/10"
                : "bg-gray-50 border-gray-200"
            }`}
            data-ocid="discuss.textarea"
          />
          <button
            type="button"
            onClick={async () => {
              if (!newTitle.trim()) return;
              const username = userProfile?.username ?? "user";
              const avatar = userProfile?.avatar ?? "";
              const userId = userProfile?.id ?? "";
              try {
                if (mainTab === "fundaes") {
                  await fbAddFundae({
                    type: newFundaeType,
                    username,
                    avatar,
                    title: newTitle.trim(),
                    description: newBody.trim(),
                    tags: [],
                    time: "just now",
                  });
                } else {
                  await fbAddDiscussion({
                    userId,
                    username,
                    avatar,
                    title: newTitle.trim(),
                    body: newBody.trim(),
                    tags: [],
                    upvotes: 0,
                    downvotes: 0,
                    voted: null,
                    comments: [],
                    time: "just now",
                  });
                }
                addToast("Posted!", "success");
              } catch {
                addToast("Failed to post", "error");
              }
              setNewTitle("");
              setNewBody("");
              setNewOpen(false);
            }}
            className="w-full py-3.5 rounded-2xl text-white font-semibold text-sm btn-gradient"
            data-ocid="discuss.submit_button"
          >
            Post
          </button>
        </div>
      </BottomSheet>
    </div>
  );
}
