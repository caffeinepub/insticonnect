import { Send, Trash2, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useApp } from "../App";
import { useAuth } from "../context/AuthContext";
import type { Story } from "../mockData";
import { deleteStory } from "../utils/firebaseService";

interface Props {
  stories: Story[];
  startIndex: number;
  onClose: () => void;
  onProfileTap?: () => void;
}

export default function StoryViewer({
  stories,
  startIndex,
  onClose,
  onProfileTap,
}: Props) {
  const { addToast } = useApp();
  const { currentFirebaseUser } = useAuth();
  const [current, setCurrent] = useState(startIndex);
  const [reply, setReply] = useState("");
  const barRef = useRef<HTMLDivElement>(null);
  const story = stories[current];
  const isOwnStory =
    !!currentFirebaseUser && story?.userId === currentFirebaseUser.uid;
  const DURATION = 5000;

  useEffect(() => {
    const timer = setTimeout(() => {
      if (current < stories.length - 1) setCurrent((c) => c + 1);
      else onClose();
    }, DURATION);
    return () => clearTimeout(timer);
  }, [current, stories.length, onClose]);

  const handleTap = (e: React.MouseEvent<HTMLDivElement>) => {
    const mid =
      (e.currentTarget as HTMLDivElement).getBoundingClientRect().width / 2;
    if (e.clientX < mid) {
      if (current > 0) setCurrent((c) => c - 1);
    } else {
      if (current < stories.length - 1) setCurrent((c) => c + 1);
      else onClose();
    }
  };

  const handleKeyNav = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowRight" || e.key === " ") {
      if (current < stories.length - 1) setCurrent((c) => c + 1);
      else onClose();
    } else if (e.key === "ArrowLeft") {
      if (current > 0) setCurrent((c) => c - 1);
    } else if (e.key === "Escape") {
      onClose();
    }
  };

  const handleReply = () => {
    if (reply.trim()) {
      addToast(`Replied to ${story.username}!`, "success");
      setReply("");
    }
  };

  const handleDeleteStory = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!window.confirm("Delete this story?")) return;
    await deleteStory(story.id);
    addToast("Story deleted", "success");
    if (current < stories.length - 1) setCurrent((c) => c + 1);
    else onClose();
  };

  if (!story) return null;

  return (
    <div className="fixed inset-0 z-[100] bg-black flex items-center justify-center">
      <div
        className="relative w-full h-full max-w-[430px] mx-auto"
        onClick={handleTap}
        onKeyDown={handleKeyNav}
        role="presentation"
      >
        {/* Background gradient (for text/color-only stories) */}
        {story.storyBg && !story.image && (
          <div
            className="absolute inset-0"
            style={{ background: story.storyBg }}
          />
        )}

        {/* Image — contain mode: full image visible, black bars on sides/top */}
        {story.image && (
          <img
            src={story.image}
            alt={story.username}
            className="absolute inset-0 w-full h-full object-contain"
            style={{ background: "#000" }}
          />
        )}

        {/* Story text overlay */}
        {story.storyText && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <span
              style={{
                color: story.storyTextColor ?? "#ffffff",
                fontWeight: story.storyTextBold ? 800 : 600,
                fontSize: "1.75rem",
                textShadow: "0 2px 12px rgba(0,0,0,0.7)",
                textAlign: "center",
                maxWidth: "80vw",
                display: "block",
                whiteSpace: "pre-wrap",
                wordBreak: "break-word",
              }}
            >
              {story.storyText}
            </span>
          </div>
        )}

        {/* Dark overlay top/bottom */}
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(to bottom, rgba(0,0,0,0.5) 0%, transparent 25%, transparent 70%, rgba(0,0,0,0.6) 100%)",
          }}
        />

        {/* Progress bars */}
        <div className="absolute top-0 left-0 right-0 flex gap-1 p-3 pt-4">
          {stories.map((s, i) => (
            <div
              key={s.id}
              className="flex-1 h-[3px] bg-white/30 rounded-full overflow-hidden"
            >
              <div
                ref={i === current ? barRef : null}
                className={`h-full bg-white rounded-full ${
                  i < current ? "w-full" : i > current ? "w-0" : ""
                }`}
                style={
                  i === current
                    ? {
                        animation: `storyProgress ${DURATION}ms linear forwards`,
                      }
                    : {}
                }
              />
            </div>
          ))}
        </div>

        {/* Header */}
        <div className="absolute top-8 left-0 right-0 flex items-center justify-between px-4">
          <button
            type="button"
            className="flex items-center gap-3"
            onClick={(e) => {
              e.stopPropagation();
              if (onProfileTap) onProfileTap();
            }}
          >
            <div className="story-ring">
              <div className="story-ring-inner">
                <img
                  src={story.avatar}
                  alt={story.username}
                  className="w-9 h-9 rounded-full object-cover"
                />
              </div>
            </div>
            <div>
              <p className="text-white font-semibold text-sm">
                {story.username}
              </p>
              <p className="text-white/70 text-xs">{story.time} ago</p>
            </div>
          </button>
          <div className="flex items-center gap-1">
            {isOwnStory && (
              <button
                type="button"
                onClick={handleDeleteStory}
                className="text-white p-1"
                data-ocid="story.delete_button"
              >
                <Trash2 size={22} />
              </button>
            )}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onClose();
              }}
              className="text-white p-1"
            >
              <X size={24} />
            </button>
          </div>
        </div>

        {/* Reply bar */}
        <div
          className="absolute bottom-8 left-4 right-4 flex items-center gap-3"
          onClick={(e) => e.stopPropagation()}
          onKeyDown={(e) => e.stopPropagation()}
          role="presentation"
        >
          <input
            value={reply}
            onChange={(e) => setReply(e.target.value)}
            placeholder={`Reply to ${story.username}...`}
            className="flex-1 bg-white/20 backdrop-blur-sm text-white placeholder-white/60 border border-white/30 rounded-full px-4 py-2.5 text-sm outline-none"
            onKeyDown={(e) => e.key === "Enter" && handleReply()}
          />
          <button
            type="button"
            onClick={handleReply}
            className="w-10 h-10 rounded-full flex items-center justify-center btn-gradient"
          >
            <Send size={16} className="text-white" />
          </button>
        </div>
      </div>
    </div>
  );
}
