import {
  ArrowLeft,
  Bookmark,
  Grid3X3,
  Heart,
  Lock,
  MessageCircle,
  MoreHorizontal,
  UserCheck,
  UserPlus,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useApp } from "../App";
import PostDetailModal from "../components/PostDetailModal";
import StoryViewer from "../components/StoryViewer";
import {
  posts as allPosts,
  stories as allStories,
  mockUsers,
} from "../mockData";
import type { Post, Story, User } from "../mockData";

type TabKey = "posts" | "saved" | "liked";

export default function OtherProfile() {
  const {
    theme,
    navigate,
    pageMeta,
    addToast,
    goBack,
    showSavedPosts,
    showLikedPosts,
  } = useApp();
  const userId = pageMeta.userId as string | undefined;

  const user: User | undefined = useMemo(
    () => mockUsers.find((u) => u.id === userId),
    [userId],
  );

  const [isFollowing, setIsFollowing] = useState(false);
  const [followerCount, setFollowerCount] = useState(user?.followers ?? 0);
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [viewingStoryIdx, setViewingStoryIdx] = useState<number | null>(null);
  const [userPosts, setUserPosts] = useState<Post[]>([]);
  const [userStories, setUserStories] = useState<Story[]>([]);
  const [activeTab, setActiveTab] = useState<TabKey>("posts");

  useEffect(() => {
    if (!user) return;
    setFollowerCount(user.followers);
    setIsFollowing(false);
    const up = allPosts.filter((p) => p.userId === user.id);
    if (up.length === 0) {
      setUserPosts(
        Array.from({ length: 6 }, (_, i) => ({
          id: `op-${user.id}-${i}`,
          userId: user.id,
          username: user.username,
          avatar: user.avatar,
          image: `https://picsum.photos/seed/${user.username}${i}/600/600`,
          caption: "Check this out! ✨",
          likes: Math.floor(Math.random() * 300) + 20,
          liked: false,
          saved: false,
          comments: [],
          time: `${i + 1}d`,
          isAnonymous: false,
          isPrivate: false,
        })),
      );
    } else {
      setUserPosts(up);
    }
    const us = allStories.filter((s) => s.userId === user.id);
    setUserStories(us);
  }, [user]);

  const toggleFollow = () => {
    setIsFollowing((f) => {
      const next = !f;
      setFollowerCount((c) => (next ? c + 1 : c - 1));
      addToast(
        next ? `Following @${user?.username}` : `Unfollowed @${user?.username}`,
        "success",
      );
      return next;
    });
  };

  // Mock saved/liked grids
  const savedImages = Array.from({ length: 6 }, (_, i) => ({
    id: `saved-${i}`,
    src: `https://picsum.photos/seed/saved${i + 1}/600/600`,
  }));
  const likedImages = Array.from({ length: 6 }, (_, i) => ({
    id: `liked-${i}`,
    src: `https://picsum.photos/seed/liked${i + 1}/600/600`,
  }));

  const surface = theme === "dark" ? "bg-[#1A1D27]" : "bg-white";
  const text2 = theme === "dark" ? "text-gray-400" : "text-gray-500";
  const border = theme === "dark" ? "border-white/10" : "border-gray-100";

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4">
        <span className="text-5xl">😕</span>
        <p className={`${text2}`}>User not found</p>
        <button
          type="button"
          onClick={goBack}
          className="text-purple-600 font-semibold text-sm"
        >
          Go back
        </button>
      </div>
    );
  }

  const tabs: { key: TabKey; icon: React.ReactNode }[] = [
    { key: "posts", icon: <Grid3X3 size={20} /> },
    { key: "saved", icon: <Bookmark size={20} /> },
    { key: "liked", icon: <Heart size={20} /> },
  ];

  return (
    <div className="page-fade pb-6">
      {/* Custom top bar */}
      <div
        className={`flex items-center justify-between px-4 pt-12 pb-3 sticky top-0 z-30 ${
          theme === "dark" ? "glass-dark" : "glass"
        }`}
      >
        <button
          type="button"
          onClick={goBack}
          className="w-9 h-9 rounded-full flex items-center justify-center active:scale-90 transition-transform"
        >
          <ArrowLeft size={20} />
        </button>
        <span className="font-bold text-base">@{user.username}</span>
        <button
          type="button"
          className="w-9 h-9 rounded-full flex items-center justify-center active:scale-90"
        >
          <MoreHorizontal size={20} />
        </button>
      </div>

      {/* Profile header */}
      <div className="px-4 pt-4">
        {/* Avatar + stats */}
        <div className="flex items-center gap-4 mb-4">
          <div
            className="w-20 h-20 rounded-full flex-shrink-0"
            style={{
              padding: 2,
              background: "linear-gradient(135deg,#7C3AED,#EC4899)",
            }}
          >
            <img
              src={user.avatar}
              alt={user.username}
              className="w-full h-full rounded-full object-cover border-2 border-white dark:border-[#0D0F14]"
            />
          </div>
          <div className="flex-1 flex justify-around">
            {[
              { label: "Posts", value: user.posts },
              { label: "Followers", value: followerCount },
              { label: "Following", value: user.following },
            ].map(({ label, value }) => (
              <div key={label} className="text-center">
                <p className="font-bold text-base leading-none">{value}</p>
                <p className={`text-xs mt-0.5 ${text2}`}>{label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Name + bio */}
        <div className="mb-3">
          <p className="font-bold text-base">{user.name}</p>
          <p className={`text-sm mt-0.5 ${text2}`}>{user.bio}</p>
          {user.badges && user.badges.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {user.badges.map((b) => (
                <span
                  key={b}
                  className="text-[11px] bg-purple-100 dark:bg-purple-900/30 text-purple-600 px-2 py-0.5 rounded-full font-medium"
                >
                  {b}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Action buttons */}
        <div className="flex gap-2 mb-4">
          <button
            type="button"
            onClick={toggleFollow}
            className={`flex-1 h-9 rounded-xl font-semibold text-sm flex items-center justify-center gap-1.5 transition-all active:scale-95 ${
              isFollowing ? `${surface} border ${border}` : "text-white"
            }`}
            style={
              isFollowing
                ? undefined
                : { background: "linear-gradient(135deg,#7C3AED,#EC4899)" }
            }
          >
            {isFollowing ? (
              <>
                <UserCheck size={15} /> Following
              </>
            ) : (
              <>
                <UserPlus size={15} /> Follow
              </>
            )}
          </button>
          <button
            type="button"
            onClick={() =>
              navigate("chat-screen", {
                chatId: user.id,
                chatName: user.name,
                fromUserId: user.id,
              })
            }
            className={`flex-1 h-9 rounded-xl font-semibold text-sm flex items-center justify-center gap-1.5 transition-all active:scale-95 ${surface} border ${border}`}
          >
            <MessageCircle size={15} /> Message
          </button>
          <button
            type="button"
            className={`w-9 h-9 rounded-xl font-semibold flex items-center justify-center ${surface} border ${border} active:scale-95 transition-transform`}
          >
            <MoreHorizontal size={16} />
          </button>
        </div>

        {/* Stories row */}
        {userStories.length > 0 && (
          <div className="flex gap-3 overflow-x-auto no-scrollbar pb-2 mb-3">
            {userStories.map((story, idx) => (
              <button
                key={story.id}
                type="button"
                onClick={() => setViewingStoryIdx(idx)}
                className="flex-shrink-0 flex flex-col items-center gap-1"
              >
                <div
                  className="w-14 h-14 rounded-full"
                  style={{
                    padding: 2,
                    background: "linear-gradient(135deg,#7C3AED,#EC4899)",
                  }}
                >
                  <img
                    src={story.image || user.avatar}
                    alt="story"
                    className="w-full h-full rounded-full object-cover border-2 border-white dark:border-[#0D0F14]"
                  />
                </div>
                <span className={`text-[10px] ${text2}`}>{story.time}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Tab bar */}
      <div
        className={`flex border-b ${border} mb-1 sticky top-14 z-20 ${
          theme === "dark" ? "bg-[#0D0F14]" : "bg-[#F6F8FB]"
        }`}
      >
        {tabs.map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => setActiveTab(tab.key)}
            className={`flex-1 flex items-center justify-center py-2.5 transition-colors ${
              activeTab === tab.key
                ? "border-b-2 border-purple-600 text-purple-600"
                : text2
            }`}
          >
            {tab.icon}
          </button>
        ))}
      </div>

      {/* Tab content */}
      {activeTab === "posts" && (
        <div className="grid grid-cols-3 gap-0.5">
          {userPosts.map((post) => (
            <button
              key={post.id}
              type="button"
              onClick={() => setSelectedPost(post)}
              className="relative aspect-square overflow-hidden active:scale-95 transition-transform"
            >
              <img
                src={post.image}
                alt="post"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-black/0 hover:bg-black/10 transition-colors flex items-center justify-center opacity-0 hover:opacity-100">
                <div className="flex gap-3 text-white">
                  <span className="flex items-center gap-1 text-xs font-bold">
                    <Heart size={14} fill="white" /> {post.likes}
                  </span>
                  <span className="flex items-center gap-1 text-xs font-bold">
                    <MessageCircle size={14} fill="white" />{" "}
                    {post.comments.length}
                  </span>
                </div>
              </div>
            </button>
          ))}
        </div>
      )}

      {activeTab === "saved" &&
        (showSavedPosts ? (
          <div className="grid grid-cols-3 gap-0.5">
            {savedImages.map((img) => (
              <div
                key={img.id}
                className="relative aspect-square overflow-hidden"
              >
                <img
                  src={img.src}
                  alt="saved"
                  className="w-full h-full object-cover"
                />
              </div>
            ))}
          </div>
        ) : (
          <div
            className="flex flex-col items-center justify-center py-20 gap-3"
            data-ocid="other_profile.empty_state"
          >
            <div
              className={`w-16 h-16 rounded-full flex items-center justify-center ${
                theme === "dark" ? "bg-white/10" : "bg-gray-100"
              }`}
            >
              <Lock size={28} className={text2} />
            </div>
            <p className={`text-sm font-medium ${text2} text-center px-8`}>
              This account's saved posts are private
            </p>
          </div>
        ))}

      {activeTab === "liked" &&
        (showLikedPosts ? (
          <div className="grid grid-cols-3 gap-0.5">
            {likedImages.map((img) => (
              <div
                key={img.id}
                className="relative aspect-square overflow-hidden"
              >
                <img
                  src={img.src}
                  alt="liked"
                  className="w-full h-full object-cover"
                />
              </div>
            ))}
          </div>
        ) : (
          <div
            className="flex flex-col items-center justify-center py-20 gap-3"
            data-ocid="other_profile.empty_state"
          >
            <div
              className={`w-16 h-16 rounded-full flex items-center justify-center ${
                theme === "dark" ? "bg-white/10" : "bg-gray-100"
              }`}
            >
              <Lock size={28} className={text2} />
            </div>
            <p className={`text-sm font-medium ${text2} text-center px-8`}>
              This account's liked posts are private
            </p>
          </div>
        ))}

      {/* Post Detail Modal */}
      {selectedPost && (
        <PostDetailModal
          post={selectedPost}
          onClose={() => setSelectedPost(null)}
          onDelete={() => setSelectedPost(null)}
          onUpdate={(updated) => {
            setUserPosts((ps) =>
              ps.map((p) => (p.id === updated.id ? updated : p)),
            );
            setSelectedPost(updated);
          }}
        />
      )}

      {/* Story viewer */}
      {viewingStoryIdx !== null && (
        <StoryViewer
          stories={userStories}
          startIndex={viewingStoryIdx}
          onClose={() => setViewingStoryIdx(null)}
          onProfileTap={() => {
            setViewingStoryIdx(null);
          }}
        />
      )}
    </div>
  );
}
