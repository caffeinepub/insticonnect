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
import { useEffect, useState } from "react";
import { useApp } from "../App";
import PostDetailModal from "../components/PostDetailModal";
import StoryViewer from "../components/StoryViewer";
import { useAuth } from "../context/AuthContext";
import type { Post, Story, User } from "../mockData";
import {
  createNotification,
  followUser,
  getOrCreateChat,
  getUserById,
  isFollowingUser,
  subscribeToStories,
  subscribeToTaggedPosts,
  subscribeToUserPosts,
  subscribeToUserProfile,
  unfollowUser,
} from "../utils/firebaseService";

type TabKey = "posts" | "tagged";

export default function OtherProfile() {
  const { theme, navigate, pageMeta, addToast, goBack } = useApp();
  const { userProfile } = useAuth();
  const userId = pageMeta.userId as string | undefined;

  const [user, setUser] = useState<User | undefined>(undefined);
  const [followerCount, setFollowerCount] = useState(0);

  // Load initial user data
  useEffect(() => {
    if (!userId) return;
    getUserById(userId).then((u) => {
      if (u) {
        setUser(u);
        setFollowerCount(u.followers ?? 0);
      }
    });
  }, [userId]);

  // Live follower/following updates
  useEffect(() => {
    if (!userId) return;
    const unsub = subscribeToUserProfile(userId, (profile) => {
      setUser(profile);
      setFollowerCount(profile.followers ?? 0);
    });
    return unsub;
  }, [userId]);

  const [isFollowing, setIsFollowing] = useState(false);
  const [followLoading, setFollowLoading] = useState(false);

  // Check initial follow state
  useEffect(() => {
    if (!userProfile?.id || !userId) return;
    isFollowingUser(userProfile.id, userId).then(setIsFollowing);
  }, [userProfile?.id, userId]);

  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [viewingStoryIdx, setViewingStoryIdx] = useState<number | null>(null);
  const [userPosts, setUserPosts] = useState<Post[]>([]);
  const [taggedPosts, setTaggedPosts] = useState<Post[]>([]);
  const [userStories, setUserStories] = useState<Story[]>([]);
  const [activeTab, setActiveTab] = useState<TabKey>("posts");

  // Subscribe to this user's posts from Firestore using subscribeToUserPosts
  useEffect(() => {
    if (!userId) return;
    const unsub = subscribeToUserPosts(
      userId,
      (posts) => setUserPosts(posts),
      userProfile?.id,
    );
    return unsub;
  }, [userId, userProfile?.id]);

  // Subscribe to tagged posts
  useEffect(() => {
    if (!user?.username) return;
    const unsub = subscribeToTaggedPosts(
      user.username,
      (posts) => setTaggedPosts(posts),
      userProfile?.id,
    );
    return unsub;
  }, [user?.username, userProfile?.id]);

  // Subscribe to this user's stories
  useEffect(() => {
    if (!userId) return;
    const unsub = subscribeToStories((allStories) => {
      setUserStories(allStories.filter((s) => s.userId === userId));
    });
    return unsub;
  }, [userId]);

  const toggleFollow = async () => {
    if (!userProfile?.id || !userId || followLoading) return;
    setFollowLoading(true);
    try {
      if (isFollowing) {
        await unfollowUser(userProfile.id, userId);
        setIsFollowing(false);
        addToast(`Unfollowed @${user?.username}`, "success");
      } else {
        await followUser(userProfile.id, userId);
        setIsFollowing(true);
        addToast(`Following @${user?.username}`, "success");
        await createNotification({
          userId,
          senderId: userProfile.id,
          senderName: userProfile.name,
          senderAvatar: userProfile.avatar,
          type: "follow",
        });
      }
    } catch {
      addToast("Failed, try again", "error");
    } finally {
      setFollowLoading(false);
    }
  };

  const handleMessage = async () => {
    if (!userProfile || !userId || !user) return;
    try {
      const chatId = await getOrCreateChat(
        userProfile.id,
        userId,
        { [userProfile.id]: userProfile.name, [userId]: user.name },
        { [userProfile.id]: userProfile.avatar, [userId]: user.avatar },
      );
      navigate("chat-screen", {
        chatId,
        chatName: user.name,
        fromUserId: userId,
      });
    } catch {
      addToast("Could not open chat", "error");
    }
  };

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

  const tabs: { key: TabKey; icon: React.ReactNode; label: string }[] = [
    { key: "posts", icon: <Grid3X3 size={20} />, label: "Posts" },
    { key: "tagged", icon: <UserCheck size={20} />, label: "Tagged" },
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
              { label: "Posts", value: userPosts.length },
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
            onClick={() => void toggleFollow()}
            disabled={followLoading}
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
            onClick={() => void handleMessage()}
            className={`flex-1 h-9 rounded-xl font-semibold text-sm flex items-center justify-center gap-1.5 transition-all active:scale-95 ${surface} border ${border}`}
            data-ocid="other_profile.button"
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
            className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 text-sm transition-colors ${
              activeTab === tab.key
                ? "border-b-2 border-purple-600 text-purple-600"
                : text2
            }`}
          >
            {tab.icon}
            <span className="text-xs">{tab.label}</span>
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
                src={post.image || post.images?.[0]}
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
          {userPosts.length === 0 && (
            <div
              className={`col-span-3 py-12 text-center ${text2}`}
              data-ocid="other_profile.empty_state"
            >
              <p className="text-3xl mb-2">📷</p>
              <p className="font-semibold">No posts yet</p>
            </div>
          )}
        </div>
      )}

      {activeTab === "tagged" && (
        <div className="grid grid-cols-3 gap-0.5">
          {taggedPosts.length === 0 ? (
            <div
              className={`col-span-3 py-12 text-center ${text2}`}
              data-ocid="other_profile.empty_state"
            >
              <p className="text-3xl mb-2">🏷️</p>
              <p className="font-semibold">No tagged posts yet</p>
            </div>
          ) : (
            taggedPosts.map((post) => (
              <button
                key={post.id}
                type="button"
                onClick={() => setSelectedPost(post)}
                className="relative aspect-square overflow-hidden active:scale-95 transition-transform"
              >
                <img
                  src={post.image || post.images?.[0]}
                  alt="tagged"
                  className="w-full h-full object-cover"
                />
              </button>
            ))
          )}
        </div>
      )}

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
