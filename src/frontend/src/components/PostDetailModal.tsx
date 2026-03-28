import {
  Bookmark,
  Flag,
  Heart,
  MessageCircle,
  MoreHorizontal,
  Send,
  Trash2,
  X,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { useApp } from "../App";
import { useAuth } from "../context/AuthContext";
import type { Comment, Post } from "../mockData";
import {
  createNotification,
  addComment as fbAddComment,
} from "../utils/firebaseService";
import PostCarousel from "./PostCarousel";

interface PostDetailModalProps {
  post: Post;
  onClose: () => void;
  onDelete?: (postId: string) => void;
  onUpdate?: (post: Post) => void;
}

export default function PostDetailModal({
  post: initialPost,
  onClose,
  onDelete,
  onUpdate,
}: PostDetailModalProps) {
  const { theme, addToast } = useApp();
  const { currentFirebaseUser, userProfile } = useAuth();
  const [post, setPost] = useState<Post>(initialPost);
  const [commentText, setCommentText] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);
  const commentInputRef = useRef<HTMLInputElement>(null);

  const isOwn =
    !!currentFirebaseUser && post.userId === currentFirebaseUser.uid;
  const dark = theme === "dark";

  // Sync if parent updates
  useEffect(() => {
    setPost(initialPost);
  }, [initialPost]);

  const handleLike = () => {
    const updated = {
      ...post,
      liked: !post.liked,
      likes: post.liked ? post.likes - 1 : post.likes + 1,
    };
    setPost(updated);
    onUpdate?.(updated);
  };

  const handleSave = () => {
    const updated = { ...post, saved: !post.saved };
    setPost(updated);
    onUpdate?.(updated);
    addToast(updated.saved ? "Post saved!" : "Post unsaved", "success");
  };

  const handleAddComment = async () => {
    const text = commentText.trim();
    if (!text || !userProfile) return;
    setCommentText("");
    const newComment: Comment = {
      id: Math.random().toString(36).slice(2),
      username: userProfile.username ?? "You",
      avatar: userProfile.avatar ?? "https://picsum.photos/seed/me/100/100",
      text,
      time: "now",
      likes: 0,
    };
    const updated = {
      ...post,
      comments: [...post.comments, newComment],
    };
    setPost(updated);
    onUpdate?.(updated);
    try {
      await fbAddComment(post.id, {
        userId: userProfile.id,
        username: userProfile.username,
        avatar: userProfile.avatar ?? "",
        text,
      });
      if (post.userId && post.userId !== userProfile.id) {
        await createNotification({
          userId: post.userId,
          senderId: userProfile.id,
          senderName: userProfile.name || userProfile.username,
          senderAvatar: userProfile.avatar ?? "",
          type: "comment",
          postId: post.id,
          postImage: (post as any).image || (post as any).mediaUrl,
          text,
        });
      }
    } catch (e) {
      console.error("[PostDetailModal] comment failed", e);
    }
  };

  const handleDelete = () => {
    setMenuOpen(false);
    onDelete?.(post.id);
    onClose();
    addToast("Post deleted", "success");
  };

  const handleReport = () => {
    setMenuOpen(false);
    addToast("Post reported. We'll review it shortly.", "success");
  };

  const surface = dark ? "bg-[#0F0F1A]" : "bg-white";
  const textMuted = dark ? "text-gray-400" : "text-gray-500";
  const borderColor = dark ? "border-white/8" : "border-gray-100";
  const inputBg = dark ? "bg-white/8" : "bg-gray-100";

  return (
    <AnimatePresence>
      <div
        className="fixed inset-0 z-[60] flex flex-col"
        style={{ fontFamily: "'Outfit', sans-serif" }}
      >
        {/* Backdrop */}
        {/* biome-ignore lint/a11y/useKeyWithClickEvents: backdrop close */}
        <div
          className="absolute inset-0 bg-black/80 backdrop-blur-sm"
          onClick={onClose}
        />

        <motion.div
          initial={{ y: "100%" }}
          animate={{ y: 0 }}
          exit={{ y: "100%" }}
          transition={{ type: "spring", damping: 28, stiffness: 320 }}
          className={`absolute inset-x-0 bottom-0 rounded-t-3xl ${surface} flex flex-col`}
          style={{
            maxHeight: "95vh",
            paddingBottom: "env(safe-area-inset-bottom, 16px)",
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Handle */}
          <div className="flex justify-center pt-3 pb-1 flex-shrink-0">
            <div
              className={`w-10 h-1 rounded-full ${
                dark ? "bg-white/20" : "bg-gray-300"
              }`}
            />
          </div>

          {/* Header */}
          <div
            className={`flex items-center justify-between px-4 py-2.5 border-b ${borderColor} flex-shrink-0`}
          >
            <button
              type="button"
              onClick={onClose}
              className="w-9 h-9 rounded-full flex items-center justify-center active:scale-90 transition-transform"
              data-ocid="post_detail.close_button"
            >
              <X size={20} className={textMuted} />
            </button>
            <div className="flex items-center gap-2">
              <img
                src={post.avatar}
                alt={post.username}
                className="w-7 h-7 rounded-full object-cover"
              />
              <span className="font-bold text-sm">{post.username}</span>
            </div>
            <div className="relative">
              <button
                type="button"
                onClick={() => setMenuOpen((v) => !v)}
                className="w-9 h-9 rounded-full flex items-center justify-center active:scale-90 transition-transform"
                data-ocid="post_detail.open_modal_button"
              >
                <MoreHorizontal size={20} className={textMuted} />
              </button>

              {menuOpen && (
                <>
                  {/* biome-ignore lint/a11y/useKeyWithClickEvents: menu backdrop */}
                  <div
                    className="fixed inset-0 z-[61]"
                    onClick={() => setMenuOpen(false)}
                  />
                  <div
                    className={`absolute right-0 top-full mt-1 rounded-2xl shadow-2xl border z-[62] min-w-[160px] overflow-hidden ${
                      dark
                        ? "bg-[#1A1D27] border-white/10"
                        : "bg-white border-gray-100"
                    }`}
                    data-ocid="post_detail.dropdown_menu"
                  >
                    {isOwn ? (
                      <button
                        type="button"
                        onClick={handleDelete}
                        className="w-full flex items-center gap-3 px-4 py-3 text-red-500 font-semibold text-sm active:bg-red-50 dark:active:bg-red-900/20"
                        data-ocid="post_detail.delete_button"
                      >
                        <Trash2 size={16} /> Delete Post
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={handleReport}
                        className={`w-full flex items-center gap-3 px-4 py-3 font-semibold text-sm ${
                          dark
                            ? "text-gray-200 active:bg-white/10"
                            : "text-gray-700 active:bg-gray-50"
                        }`}
                        data-ocid="post_detail.button"
                      >
                        <Flag size={16} /> Report
                      </button>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Scrollable content */}
          <div className="flex-1 overflow-y-auto">
            {/* Post Image */}
            {post.images && post.images.length > 0 ? (
              <PostCarousel images={post.images} />
            ) : post.image ? (
              <div className="w-full bg-black">
                <img
                  src={post.image}
                  alt="post"
                  className="w-full object-contain"
                  style={{ maxHeight: "55vh" }}
                />
              </div>
            ) : null}

            {/* Action Bar */}
            <div className="flex items-center justify-between px-4 pt-3 pb-1">
              <div className="flex items-center gap-4">
                <button
                  type="button"
                  onClick={handleLike}
                  className="flex items-center gap-1.5 active:scale-90 transition-transform"
                  data-ocid="post_detail.toggle"
                >
                  <Heart
                    size={26}
                    className={`transition-all ${
                      post.liked
                        ? "fill-red-500 text-red-500 scale-110"
                        : textMuted
                    }`}
                  />
                </button>
                <button
                  type="button"
                  onClick={() => commentInputRef.current?.focus()}
                  className="active:scale-90 transition-transform"
                  data-ocid="post_detail.button"
                >
                  <MessageCircle size={26} className={textMuted} />
                </button>
                <button
                  type="button"
                  onClick={() => addToast("Link copied!", "success")}
                  className="active:scale-90 transition-transform"
                  data-ocid="post_detail.button"
                >
                  <Send size={24} className={textMuted} />
                </button>
              </div>
              <button
                type="button"
                onClick={handleSave}
                className="active:scale-90 transition-transform"
                data-ocid="post_detail.toggle"
              >
                <Bookmark
                  size={26}
                  className={`transition-all ${
                    post.saved ? "fill-yellow-400 text-yellow-400" : textMuted
                  }`}
                />
              </button>
            </div>

            {/* Likes */}
            <p className="px-4 font-bold text-sm mt-0.5">
              {post.likes.toLocaleString()} likes
            </p>

            {/* Caption */}
            {post.caption && (
              <p className="px-4 mt-1 text-sm leading-snug">
                <span className="font-bold mr-1.5">{post.username}</span>
                <span className={textMuted}>{post.caption}</span>
              </p>
            )}

            {/* Time */}
            <p className={`px-4 mt-1 text-xs ${textMuted}`}>{post.time} ago</p>

            {/* Comments */}
            {post.comments.length > 0 && (
              <div
                className={`mt-3 border-t ${borderColor} px-4 pt-3 space-y-3`}
              >
                {post.comments.map((c, i) => (
                  <div
                    key={c.id}
                    className="flex items-start gap-2.5"
                    data-ocid={`post_detail.item.${i + 1}`}
                  >
                    <img
                      src={c.avatar}
                      alt={c.username}
                      className="w-7 h-7 rounded-full object-cover flex-shrink-0 mt-0.5"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm leading-snug">
                        <span className="font-bold mr-1">{c.username}</span>
                        <span className={textMuted}>{c.text}</span>
                      </p>
                      <p className={`text-xs mt-0.5 ${textMuted}`}>{c.time}</p>
                    </div>
                    <button
                      type="button"
                      className="flex items-center gap-1 flex-shrink-0 active:scale-90 transition-transform"
                    >
                      <Heart size={12} className={textMuted} />
                      {c.likes > 0 && (
                        <span className={`text-xs ${textMuted}`}>
                          {c.likes}
                        </span>
                      )}
                    </button>
                  </div>
                ))}
              </div>
            )}

            {post.comments.length === 0 && (
              <p className={`px-4 mt-3 text-sm ${textMuted} italic`}>
                No comments yet. Be the first!
              </p>
            )}

            <div className="h-4" />
          </div>

          {/* Add Comment Input */}
          <div
            className={`flex items-center gap-3 px-4 py-3 border-t ${borderColor} flex-shrink-0`}
          >
            <img
              src={
                userProfile?.avatar ?? "https://picsum.photos/seed/me/100/100"
              }
              alt="me"
              className="w-8 h-8 rounded-full object-cover flex-shrink-0"
            />
            <input
              ref={commentInputRef}
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleAddComment()}
              placeholder="Add a comment..."
              className={`flex-1 px-3 py-2 rounded-full text-sm outline-none ${inputBg}`}
              data-ocid="post_detail.input"
            />
            <button
              type="button"
              onClick={handleAddComment}
              disabled={!commentText.trim()}
              className="text-purple-500 font-bold text-sm disabled:opacity-40 active:scale-90 transition-transform"
              data-ocid="post_detail.submit_button"
            >
              Post
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
