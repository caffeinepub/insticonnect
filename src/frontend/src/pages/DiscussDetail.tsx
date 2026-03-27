import { ChevronDown, ChevronLeft, ChevronUp, Send } from "lucide-react";
import { useEffect, useState } from "react";
import { useApp } from "../App";
import { useAuth } from "../context/AuthContext";
import type { Comment, Discussion } from "../mockData";
import { subscribeDiscussions } from "../utils/firebaseService";

export default function DiscussDetail() {
  const { theme, goBack, pageMeta, addToast } = useApp();
  const { userProfile } = useAuth();
  const id = pageMeta.discussionId as string;
  const [disc, setDisc] = useState<Discussion | null>(null);
  const [voted, setVoted] = useState<"up" | "down" | null>(null);
  const [upvotes, setUpvotes] = useState(0);
  const [downvotes, setDownvotes] = useState(0);
  const [reply, setReply] = useState("");
  const [comments, setComments] = useState<Comment[]>([]);

  useEffect(() => {
    const unsub = subscribeDiscussions((items) => {
      const found = items.find((d) => d.id === id);
      if (found) {
        setDisc(found);
        setUpvotes(found.upvotes);
        setDownvotes(found.downvotes);
        setVoted(found.voted);
        setComments(found.comments ?? []);
      }
    });
    return unsub;
  }, [id]);

  const vote = (dir: "up" | "down") => {
    if (voted === dir) {
      setVoted(null);
      if (dir === "up") setUpvotes((v) => v - 1);
      else setDownvotes((v) => v - 1);
    } else {
      if (voted === "up") setUpvotes((v) => v - 1);
      if (voted === "down") setDownvotes((v) => v - 1);
      setVoted(dir);
      if (dir === "up") setUpvotes((v) => v + 1);
      else setDownvotes((v) => v + 1);
    }
  };

  const sendReply = () => {
    if (!reply.trim()) return;
    const newComment: Comment = {
      id: Math.random().toString(36).slice(2),
      username: userProfile?.username ?? "user",
      avatar: userProfile?.avatar ?? "",
      text: reply,
      time: "just now",
      likes: 0,
    };
    setComments((c) => [...c, newComment]);
    setReply("");
    addToast("Comment posted!", "success");
  };

  const surface = theme === "dark" ? "bg-[#1A1D27]" : "bg-white";
  const bg = theme === "dark" ? "bg-[#0D0F14]" : "bg-[#F6F8FB]";
  const text2 = theme === "dark" ? "text-gray-400" : "text-gray-500";

  if (!disc) {
    return (
      <div className={`min-h-screen ${bg} flex items-center justify-center`}>
        <p className={text2}>Loading discussion...</p>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${bg} pb-32`}>
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
        <h2 className="font-bold text-base flex-1 truncate">Discussion</h2>
      </div>

      <div className="px-4 pt-4">
        {/* Post */}
        <div className={`${surface} rounded-2xl p-4 shadow-md mb-4`}>
          <div className="flex items-center gap-3 mb-3">
            <img
              src={disc.avatar}
              alt={disc.username}
              className="w-9 h-9 rounded-full object-cover"
            />
            <div>
              <p className="font-semibold text-sm">{disc.username}</p>
              <p className={`text-xs ${text2}`}>{disc.time} ago</p>
            </div>
          </div>
          <h1 className="font-bold text-base leading-tight mb-2">
            {disc.title}
          </h1>
          <p className={`text-sm ${text2} leading-relaxed`}>{disc.body}</p>
          <div className="flex flex-wrap gap-1.5 mt-3">
            {disc.tags.map((t) => (
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

          {/* Vote buttons */}
          <div
            className="flex items-center gap-2 mt-4 pt-4 border-t"
            style={{
              borderColor:
                theme === "dark" ? "rgba(255,255,255,0.05)" : "#f3f4f6",
            }}
          >
            <button
              type="button"
              onClick={() => vote("up")}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                voted === "up"
                  ? "bg-orange-100 text-orange-600"
                  : theme === "dark"
                    ? "bg-white/10 text-gray-300"
                    : "bg-gray-100 text-gray-600"
              }`}
            >
              <ChevronUp size={16} />
              {upvotes}
            </button>
            <button
              type="button"
              onClick={() => vote("down")}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                voted === "down"
                  ? "bg-blue-100 text-blue-600"
                  : theme === "dark"
                    ? "bg-white/10 text-gray-300"
                    : "bg-gray-100 text-gray-600"
              }`}
            >
              <ChevronDown size={16} />
              {downvotes}
            </button>
            <span className={`text-xs ${text2} ml-2`}>
              {comments.length} comments
            </span>
          </div>
        </div>

        {/* Comments */}
        <h3 className="font-bold text-sm mb-3">Comments</h3>
        {comments.length === 0 && (
          <p className={`text-sm ${text2} text-center py-6`}>
            No comments yet. Be the first!
          </p>
        )}
        <div className="space-y-3">
          {comments.map((c) => (
            <div key={c.id} className={`${surface} rounded-2xl p-3`}>
              <div className="flex items-center gap-2 mb-2">
                <img
                  src={c.avatar}
                  alt={c.username}
                  className="w-7 h-7 rounded-full object-cover"
                />
                <span className="text-xs font-semibold">{c.username}</span>
                <span className={`text-xs ${text2} ml-auto`}>{c.time}</span>
              </div>
              <p className={`text-sm ${text2}`}>{c.text}</p>
              {c.replies?.map((r) => (
                <div
                  key={r.id}
                  className={`ml-6 mt-2 pt-2 border-t ${theme === "dark" ? "border-white/5" : "border-gray-100"}`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <img
                      src={r.avatar}
                      alt={r.username}
                      className="w-6 h-6 rounded-full object-cover"
                    />
                    <span className="text-xs font-semibold">{r.username}</span>
                    <span className={`text-[10px] ${text2} ml-auto`}>
                      {r.time}
                    </span>
                  </div>
                  <p className={`text-xs ${text2}`}>{r.text}</p>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* Comment input */}
      <div
        className={`fixed bottom-0 left-0 right-0 max-w-[430px] mx-auto px-4 py-3 ${
          theme === "dark" ? "glass-dark" : "glass"
        } border-t border-white/20`}
      >
        <div className="flex gap-3 items-center">
          <input
            value={reply}
            onChange={(e) => setReply(e.target.value)}
            placeholder="Add a comment..."
            className={`flex-1 px-4 py-2.5 rounded-full text-sm outline-none ${
              theme === "dark" ? "bg-white/10" : "bg-gray-100"
            }`}
            onKeyDown={(e) => e.key === "Enter" && sendReply()}
          />
          <button
            type="button"
            onClick={sendReply}
            className="w-10 h-10 rounded-full btn-gradient flex items-center justify-center flex-shrink-0"
          >
            <Send size={16} className="text-white" />
          </button>
        </div>
      </div>
    </div>
  );
}
