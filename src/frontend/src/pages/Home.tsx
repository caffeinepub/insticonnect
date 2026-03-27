import {
  Bookmark,
  Heart,
  MessageCircle,
  Plus,
  Send,
  Trash2,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useApp } from "../App";
import AvatarWithPreview from "../components/AvatarWithPreview";
import PostCarousel from "../components/PostCarousel";
import StoryCreator from "../components/StoryCreator";
import StoryViewer from "../components/StoryViewer";

import { useAuth } from "../context/AuthContext";
import type { Post, Story } from "../mockData";
import {
  addComment as fbAddComment,
  deletePost as fbDeletePost,
  toggleLike as fbToggleLike,
  subscribeToPosts,
  subscribeToStories,
} from "../utils/firebaseService";

export default function Home() {
  const { theme, addToast, setOnNewPost, navigate, user: appUser } = useApp();
  const { userProfile } = useAuth();
  const realUser = userProfile ?? appUser;
  const [stories, setStories] = useState<Story[]>([]);
  const [posts, setPosts] = useState<Post[]>([]);
  // Story viewer: show only the tapped user's stories
  const [viewingUserStories, setViewingUserStories] = useState<Story[] | null>(
    null,
  );
  const [viewingStoryIndex, setViewingStoryIndex] = useState(0);
  const [expandedComments, setExpandedComments] = useState<Set<string>>(
    new Set(),
  );
  const [newPostId, setNewPostId] = useState<string | null>(null);
  const [likedAnim, setLikedAnim] = useState<Set<string>>(new Set());
  const [commentInputs, setCommentInputs] = useState<Record<string, string>>(
    {},
  );
  const [storyCreatorOpen, setStoryCreatorOpen] = useState(false);

  // Pull-to-refresh state
  const feedRef = useRef<HTMLDivElement>(null);
  const touchStartY = useRef(0);
  const pullDist = useRef(0);
  const [pullIndicator, setPullIndicator] = useState(false);
  const [pullProgress, setPullProgress] = useState(0);
  const isRefreshing = useRef(false);

  // Subscribe to Firestore (fallback to mock if not configured)
  useEffect(() => {
    const unsubPosts = subscribeToPosts((firestorePosts) => {
      setPosts(firestorePosts);
    });
    const unsubStories = subscribeToStories((firestoreStories) => {
      setStories(firestoreStories);
    });
    return () => {
      unsubPosts();
      unsubStories();
    };
  }, []);

  // Register this page's post handler with global App context
  useEffect(() => {
    setOnNewPost((post: Post) => {
      setPosts((ps) => [post, ...ps]);
      setNewPostId(post.id);
      setTimeout(() => setNewPostId(null), 600);
    });
  }, [setOnNewPost]);

  const openUserStory = (userId: string) => {
    const userStories = stories.filter((s) => s.userId === userId);
    if (userStories.length === 0) {
      navigate("other-profile", { userId });
      return;
    }
    setViewingUserStories(userStories);
    setViewingStoryIndex(0);
  };

  const toggleLike = (postId: string) => {
    const post = posts.find((p) => p.id === postId);
    if (!post) return;
    const uid = realUser?.id ?? "";
    const isLiking = !post.liked;
    setPosts((ps) =>
      ps.map((p) =>
        p.id === postId
          ? {
              ...p,
              liked: !p.liked,
              likes: p.liked ? p.likes - 1 : p.likes + 1,
            }
          : p,
      ),
    );
    if (uid) void fbToggleLike(postId, uid, isLiking);
    setLikedAnim((s) => {
      const n = new Set(s);
      n.add(postId);
      setTimeout(
        () =>
          setLikedAnim((prev) => {
            const p2 = new Set(prev);
            p2.delete(postId);
            return p2;
          }),
        500,
      );
      return n;
    });
  };

  const toggleSave = (postId: string) => {
    setPosts((ps) =>
      ps.map((p) => (p.id === postId ? { ...p, saved: !p.saved } : p)),
    );
    addToast("Post saved!", "success");
  };

  const toggleComments = (postId: string) => {
    setExpandedComments((s) => {
      const n = new Set(s);
      if (n.has(postId)) n.delete(postId);
      else n.add(postId);
      return n;
    });
  };

  const submitComment = (postId: string) => {
    const text = commentInputs[postId]?.trim();
    if (!text) return;
    const username = realUser?.username ?? "user";
    const avatar = realUser?.avatar ?? "";
    const userId = realUser?.id ?? "";
    setPosts((ps) =>
      ps.map((p) =>
        p.id === postId
          ? {
              ...p,
              comments: [
                ...p.comments,
                {
                  id: Math.random().toString(36).slice(2),
                  username,
                  avatar,
                  text,
                  time: "just now",
                  likes: 0,
                },
              ],
            }
          : p,
      ),
    );
    setCommentInputs((ci) => ({ ...ci, [postId]: "" }));
    if (userId) {
      void fbAddComment(postId, { username, avatar, text, userId });
    }
  };

  const deletePost = (postId: string) => {
    setPosts((ps) => ps.filter((p) => p.id !== postId));
    void fbDeletePost(postId);
    addToast("Post deleted", "info");
  };

  const handleStoryPublish = (story: Story) => {
    // Ensure userId is set correctly so filtering works
    const publishedStory: Story = {
      ...story,
      userId: (story.userId || realUser?.id) ?? "",
    };
    setStories((s) => [publishedStory, ...s]);
    addToast("Story added!", "success");
    setStoryCreatorOpen(false);
  };

  // Pull-to-refresh handlers
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartY.current = e.touches[0].clientY;
    pullDist.current = 0;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (isRefreshing.current) return;
    const el = feedRef.current;
    if (!el) return;
    if (el.scrollTop > 0) return;
    const dy = e.touches[0].clientY - touchStartY.current;
    if (dy <= 0) return;
    pullDist.current = Math.min(dy, 120);
    const progress = Math.min(pullDist.current / 70, 1);
    setPullProgress(progress);
    setPullIndicator(true);
  };

  const handleTouchEnd = () => {
    if (isRefreshing.current) return;
    if (pullDist.current > 60) {
      isRefreshing.current = true;
      setPullProgress(1);
      setTimeout(() => {
        setPosts((ps) => [...ps].reverse());
        addToast("Feed refreshed ✓", "success");
        setPullIndicator(false);
        setPullProgress(0);
        pullDist.current = 0;
        isRefreshing.current = false;
      }, 900);
    } else {
      setPullIndicator(false);
      setPullProgress(0);
      pullDist.current = 0;
    }
  };

  const surface = theme === "dark" ? "bg-[#1A1D27]" : "bg-white";
  const border = theme === "dark" ? "border-white/5" : "border-gray-100";
  const text2 = theme === "dark" ? "text-gray-400" : "text-gray-500";

  // Filter out expired stories (24hr)
  const now = Date.now();
  const activeStories = stories.filter(
    (s) => !s.expiresAt || s.expiresAt > now,
  );

  // Deduplicate story bubbles: one per userId
  const storyUsers = activeStories.reduce<Story[]>((acc, s) => {
    if (!acc.some((a) => a.userId === s.userId)) acc.push(s);
    return acc;
  }, []);

  return (
    <div
      ref={feedRef}
      className="page-fade h-full overflow-y-auto"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Pull-to-refresh indicator */}
      {pullIndicator && (
        <div
          className="flex items-center justify-center overflow-hidden transition-all"
          style={{ height: `${pullProgress * 52}px`, opacity: pullProgress }}
        >
          <div
            className="w-7 h-7 rounded-full border-2 border-purple-500 border-t-transparent"
            style={{
              animation: isRefreshing.current
                ? "spin 0.7s linear infinite"
                : "none",
              transform: isRefreshing.current
                ? "none"
                : `rotate(${pullProgress * 270}deg)`,
            }}
          />
        </div>
      )}

      {/* Stories */}
      <div className={`${surface} border-b ${border} px-4 py-3`}>
        <div className="flex gap-4 overflow-x-auto pb-1">
          {/* Add story */}
          <button
            type="button"
            onClick={() => setStoryCreatorOpen(true)}
            className="flex flex-col items-center gap-1.5 flex-shrink-0 active:scale-95 transition-transform"
            data-ocid="home.upload_button"
          >
            <div
              className={`w-14 h-14 rounded-full border-2 border-dashed flex items-center justify-center ${
                theme === "dark" ? "border-gray-600" : "border-gray-300"
              }`}
            >
              <Plus size={22} className="opacity-50" />
            </div>
            <span className="text-[10px] opacity-60 w-14 text-center truncate">
              Your story
            </span>
          </button>

          {/* One bubble per user */}
          {storyUsers.map((s) => (
            <button
              type="button"
              key={s.userId}
              onClick={() => openUserStory(s.userId)}
              className="flex flex-col items-center gap-1.5 flex-shrink-0 active:scale-95 transition-transform"
            >
              <div className={`story-ring ${s.viewed ? "opacity-50" : ""}`}>
                <div className="story-ring-inner">
                  <img
                    src={s.avatar}
                    alt={s.username}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                </div>
              </div>
              <span className="text-[10px] w-14 text-center truncate opacity-80">
                {s.username}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Posts */}
      <div className="space-y-3 pb-4">
        {posts.map((post, idx) => (
          <article
            key={post.id}
            className={`${surface} border-b ${border} ${
              post.id === newPostId ? "post-slide-in" : ""
            }`}
            data-ocid={`home.item.${idx + 1}`}
          >
            {/* Header */}
            <div className="flex items-center gap-3 px-4 py-3">
              <AvatarWithPreview
                src={post.avatar}
                username={post.username}
                hasStory={
                  !post.isAnonymous &&
                  activeStories.some((s) => s.userId === post.userId)
                }
                onTapStory={() => openUserStory(post.userId)}
                onTapProfile={() =>
                  !post.isAnonymous &&
                  navigate("other-profile", { userId: post.userId })
                }
                size={36}
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() =>
                      !post.isAnonymous &&
                      navigate("other-profile", { userId: post.userId })
                    }
                    className="font-semibold text-sm active:opacity-70 transition-opacity"
                  >
                    {post.isAnonymous ? "anonymous" : post.username}
                  </button>
                  {post.isAnonymous && (
                    <span className="text-xs bg-gray-200 dark:bg-gray-700 px-1.5 py-0.5 rounded-full">
                      👤 anon
                    </span>
                  )}
                  {post.isPrivate && !post.isAnonymous && (
                    <span className="text-xs bg-purple-100 dark:bg-purple-900/40 text-purple-600 px-1.5 py-0.5 rounded-full">
                      🔒
                    </span>
                  )}
                  {!post.isPrivate && !post.isAnonymous && (
                    <span className="text-xs bg-green-100 dark:bg-green-900/40 text-green-600 px-1.5 py-0.5 rounded-full">
                      ✓
                    </span>
                  )}
                </div>
                <p className={`text-xs ${text2}`}>{post.time} ago</p>
              </div>
              {post.userId === (realUser?.id ?? "") ? (
                <button
                  type="button"
                  onClick={() => deletePost(post.id)}
                  className="p-1.5 rounded-xl text-red-400 active:scale-90 transition-transform hover:bg-red-50 dark:hover:bg-red-900/20"
                  data-ocid={`home.delete_button.${idx + 1}`}
                >
                  <Trash2 size={16} />
                </button>
              ) : (
                <button type="button" className={`text-xs ${text2}`}>
                  ···
                </button>
              )}
            </div>

            {/* Image / Carousel */}
            {post.images && post.images.length > 0 ? (
              <PostCarousel images={post.images} />
            ) : post.image ? (
              <div className="w-full aspect-[4/3] overflow-hidden">
                <img
                  src={post.image}
                  alt="post"
                  className="w-full h-full object-cover"
                />
              </div>
            ) : null}

            {/* Actions */}
            <div className="px-4 pt-3 pb-1">
              <div className="flex items-center gap-4">
                <button
                  type="button"
                  onClick={() => toggleLike(post.id)}
                  className={`transition-transform active:scale-90 ${
                    likedAnim.has(post.id) ? "like-pulse" : ""
                  }`}
                  data-ocid={`home.toggle.${idx + 1}`}
                >
                  <Heart
                    size={24}
                    strokeWidth={1.8}
                    className={`transition-all ${
                      post.liked
                        ? "fill-red-500 text-red-500 scale-110"
                        : "text-gray-700 dark:text-gray-300"
                    }`}
                  />
                </button>
                <button
                  type="button"
                  onClick={() => toggleComments(post.id)}
                  className="transition-transform active:scale-90"
                >
                  <MessageCircle
                    size={24}
                    strokeWidth={1.8}
                    className="text-gray-700 dark:text-gray-300"
                  />
                </button>
                <button
                  type="button"
                  className="transition-transform active:scale-90"
                >
                  <Send
                    size={22}
                    strokeWidth={1.8}
                    className="text-gray-700 dark:text-gray-300"
                  />
                </button>
                <div className="flex-1" />
                <button
                  type="button"
                  onClick={() => toggleSave(post.id)}
                  className="transition-transform active:scale-90"
                >
                  <Bookmark
                    size={24}
                    strokeWidth={1.8}
                    className={`transition-all ${
                      post.saved
                        ? "fill-purple-600 text-purple-600"
                        : "text-gray-700 dark:text-gray-300"
                    }`}
                  />
                </button>
              </div>

              <p className="text-sm font-semibold mt-2">
                {post.likes.toLocaleString()} likes
              </p>

              {post.caption && (
                <p className="text-sm mt-1">
                  <span className="font-semibold">
                    {post.isAnonymous ? "anonymous" : post.username}{" "}
                  </span>
                  {post.caption}
                </p>
              )}

              {post.comments.length > 0 && (
                <button
                  type="button"
                  onClick={() => toggleComments(post.id)}
                  className={`text-sm ${text2} mt-1`}
                >
                  {expandedComments.has(post.id)
                    ? "Hide comments"
                    : `View ${post.comments.length} comment${
                        post.comments.length > 1 ? "s" : ""
                      }`}
                </button>
              )}

              {expandedComments.has(post.id) && (
                <div
                  className="mt-2 space-y-2 border-t pt-2"
                  style={{
                    borderColor:
                      theme === "dark" ? "rgba(255,255,255,0.05)" : "#f3f4f6",
                  }}
                >
                  {post.comments.map((c) => (
                    <div key={c.id} className="flex gap-2">
                      <img
                        src={c.avatar}
                        alt={c.username}
                        className="w-7 h-7 rounded-full object-cover flex-shrink-0"
                      />
                      <div>
                        <span className="text-xs font-semibold">
                          {c.username}{" "}
                        </span>
                        <span className="text-xs opacity-80">{c.text}</span>
                        <p className={`text-[10px] ${text2} mt-0.5`}>
                          {c.time} ago · {c.likes} likes
                        </p>
                      </div>
                    </div>
                  ))}

                  {/* Comment input */}
                  <div className="flex items-center gap-2 pt-1">
                    <img
                      src={realUser?.avatar ?? ""}
                      alt="me"
                      className="w-7 h-7 rounded-full object-cover flex-shrink-0"
                    />
                    <input
                      value={commentInputs[post.id] || ""}
                      onChange={(e) =>
                        setCommentInputs((ci) => ({
                          ...ci,
                          [post.id]: e.target.value,
                        }))
                      }
                      onKeyDown={(e) =>
                        e.key === "Enter" && submitComment(post.id)
                      }
                      placeholder="Add a comment..."
                      className={`flex-1 px-3 py-1.5 rounded-full text-xs outline-none ${
                        theme === "dark" ? "bg-white/10" : "bg-gray-100"
                      }`}
                      data-ocid={`home.input.${idx + 1}`}
                    />
                    <button
                      type="button"
                      onClick={() => submitComment(post.id)}
                      className="text-purple-600 text-xs font-semibold"
                    >
                      Post
                    </button>
                  </div>
                </div>
              )}

              <p className={`text-xs ${text2} mt-2 mb-2`}>{post.time} ago</p>
            </div>
          </article>
        ))}

        {posts.length === 0 && (
          <div
            className="flex flex-col items-center py-20 gap-3"
            data-ocid="home.empty_state"
          >
            <p className={`text-sm ${text2}`}>No posts yet. Be the first!</p>
          </div>
        )}
      </div>

      {/* Story Viewer — filtered to viewing user's stories only */}
      {viewingUserStories && viewingUserStories.length > 0 && (
        <StoryViewer
          stories={viewingUserStories}
          startIndex={viewingStoryIndex}
          onClose={() => setViewingUserStories(null)}
          onProfileTap={() => {
            const firstStory = viewingUserStories[0];
            if ((firstStory && firstStory.userId !== realUser?.id) ?? "") {
              navigate("other-profile", { userId: firstStory.userId });
              setViewingUserStories(null);
            }
          }}
        />
      )}

      {/* Instagram-style Story Creator */}
      {storyCreatorOpen && (
        <StoryCreator
          onPublish={handleStoryPublish}
          onClose={() => setStoryCreatorOpen(false)}
        />
      )}
    </div>
  );
}
