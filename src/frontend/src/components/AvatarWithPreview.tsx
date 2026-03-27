import { useRef, useState } from "react";

interface AvatarWithPreviewProps {
  src: string;
  username: string;
  hasStory?: boolean;
  onTapStory?: () => void;
  onTapProfile?: () => void;
  size?: number;
  className?: string;
  storyRing?: boolean;
}

export default function AvatarWithPreview({
  src,
  username,
  hasStory = false,
  onTapStory,
  onTapProfile,
  size = 36,
  className = "",
  storyRing = false,
}: AvatarWithPreviewProps) {
  const [showPopup, setShowPopup] = useState(false);
  const [popupPos, setPopupPos] = useState({ x: 0, y: 0 });
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pressedRef = useRef(false);
  const didLongPress = useRef(false);

  const handleTouchStart = (e: React.TouchEvent) => {
    pressedRef.current = true;
    didLongPress.current = false;
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    timerRef.current = setTimeout(() => {
      if (pressedRef.current) {
        didLongPress.current = true;
        setPopupPos({ x: rect.left + rect.width / 2, y: rect.top });
        setShowPopup(true);
      }
    }, 500);
  };

  const cancelLongPress = () => {
    pressedRef.current = false;
    if (timerRef.current) clearTimeout(timerRef.current);
  };

  const handleTouchEnd = () => {
    cancelLongPress();
    if (!didLongPress.current) {
      if (hasStory && onTapStory) onTapStory();
      else if (onTapProfile) onTapProfile();
    }
  };

  const handleClick = () => {
    if (!showPopup) {
      if (hasStory && onTapStory) onTapStory();
      else if (onTapProfile) onTapProfile();
    }
  };

  const closePopup = () => setShowPopup(false);

  return (
    <>
      <button
        type="button"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        onTouchMove={cancelLongPress}
        onClick={handleClick}
        className={`flex-shrink-0 active:scale-90 transition-transform ${className}`}
        style={{ width: size, height: size }}
      >
        {storyRing && hasStory ? (
          <div className="story-ring" style={{ width: size, height: size }}>
            <div className="story-ring-inner" style={{ padding: 2 }}>
              <img
                src={src}
                alt={username}
                className="rounded-full object-cover"
                style={{ width: size - 8, height: size - 8 }}
              />
            </div>
          </div>
        ) : (
          <img
            src={src}
            alt={username}
            className="w-full h-full rounded-full object-cover"
          />
        )}
      </button>

      {showPopup && (
        <>
          {/* Backdrop */}
          <button
            type="button"
            aria-label="Close profile preview"
            className="fixed inset-0 z-[300] cursor-default"
            onClick={closePopup}
            style={{ background: "transparent", border: "none" }}
          />
          {/* Popup */}
          <div
            className="fixed z-[301] flex flex-col items-center pointer-events-none"
            style={{
              left: popupPos.x,
              top: Math.max(80, popupPos.y - 140),
              transform: "translateX(-50%)",
            }}
          >
            <div
              className="flex flex-col items-center gap-2 px-4 py-4 rounded-2xl shadow-2xl pointer-events-auto"
              style={{
                background: "rgba(15,15,26,0.96)",
                backdropFilter: "blur(20px)",
                border: "1px solid rgba(255,255,255,0.12)",
                minWidth: 120,
              }}
            >
              <img
                src={src}
                alt={username}
                className="w-24 h-24 rounded-full object-cover ring-[3px] ring-purple-500"
              />
              <p className="text-white text-xs font-semibold">@{username}</p>
              {hasStory && (
                <button
                  type="button"
                  onClick={() => {
                    setShowPopup(false);
                    onTapStory?.();
                  }}
                  className="text-[10px] text-purple-400 font-medium"
                >
                  View story
                </button>
              )}
            </div>
            {/* Triangle */}
            <div
              style={{
                width: 0,
                height: 0,
                borderLeft: "8px solid transparent",
                borderRight: "8px solid transparent",
                borderTop: "8px solid rgba(15,15,26,0.96)",
              }}
            />
          </div>
        </>
      )}
    </>
  );
}
