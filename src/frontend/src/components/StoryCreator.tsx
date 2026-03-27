import {
  Bold,
  Check,
  ImagePlus,
  Loader2,
  Palette,
  Type,
  X,
} from "lucide-react";
import { useRef, useState } from "react";
import { currentUser } from "../mockData";
import type { Story } from "../mockData";
import { CLOUDINARY_CONFIG, uploadToCloudinary } from "../utils/cloudinary";

interface StoryCreatorProps {
  onPublish: (story: Story) => void;
  onClose: () => void;
}

const TEXT_COLORS = [
  "#FFFFFF",
  "#000000",
  "#FF3B30",
  "#FF9500",
  "#FFCC00",
  "#34C759",
  "#007AFF",
  "#AF52DE",
  "#FF2D55",
];

const BG_GRADIENTS = [
  "linear-gradient(135deg,#667eea,#764ba2)",
  "linear-gradient(135deg,#f093fb,#f5576c)",
  "linear-gradient(135deg,#4facfe,#00f2fe)",
  "linear-gradient(135deg,#43e97b,#38f9d7)",
  "linear-gradient(135deg,#fa709a,#fee140)",
  "linear-gradient(135deg,#a18cd1,#fbc2eb)",
  "linear-gradient(135deg,#ffecd2,#fcb69f)",
  "linear-gradient(135deg,#2d3436,#636e72)",
];

export default function StoryCreator({
  onPublish,
  onClose,
}: StoryCreatorProps) {
  const [images, setImages] = useState<string[]>([]);
  const [activeFrame, setActiveFrame] = useState(0);
  const [bgGradient, setBgGradient] = useState(BG_GRADIENTS[0]);
  const [textMode, setTextMode] = useState(false);
  const [textValue, setTextValue] = useState("");
  const [textColor, setTextColor] = useState("#FFFFFF");
  const [textBold, setTextBold] = useState(false);
  const [textX, setTextX] = useState(50);
  const [textY, setTextY] = useState(40);
  const [dragging, setDragging] = useState(false);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [showTextColors, setShowTextColors] = useState(false);
  const [showHighlightPrompt, setShowHighlightPrompt] = useState(false);
  const [highlightName, setHighlightName] = useState("");
  const [pendingStories, setPendingStories] = useState<Story[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const canvasRef = useRef<HTMLDivElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const rawFilesRef = useRef<File[]>([]);

  const activeImage = images[activeFrame] ?? null;

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    const newFiles = files.slice(0, 10 - images.length);
    const newUrls = newFiles.map((f) => URL.createObjectURL(f));
    rawFilesRef.current = [...rawFilesRef.current, ...newFiles].slice(0, 10);
    setImages((prev) => {
      const updated = [...prev, ...newUrls].slice(0, 10);
      setActiveFrame(updated.length - 1);
      return updated;
    });
    e.target.value = "";
  };

  const removeImage = (idx: number) => {
    rawFilesRef.current = rawFilesRef.current.filter((_, i) => i !== idx);
    setImages((prev) => {
      const updated = prev.filter((_, i) => i !== idx);
      setActiveFrame(Math.min(activeFrame, Math.max(0, updated.length - 1)));
      return updated;
    });
  };

  const handleCanvasPointerDown = (e: React.PointerEvent) => {
    if (!textValue || textMode) return;
    setDragging(true);
    moveTo(e);
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  };
  const handleCanvasPointerMove = (e: React.PointerEvent) => {
    if (!dragging) return;
    moveTo(e);
  };
  const handleCanvasPointerUp = () => setDragging(false);

  const moveTo = (e: React.PointerEvent) => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    const x = Math.max(
      0,
      Math.min(100, ((e.clientX - rect.left) / rect.width) * 100),
    );
    const y = Math.max(
      0,
      Math.min(100, ((e.clientY - rect.top) / rect.height) * 100),
    );
    setTextX(x);
    setTextY(y);
  };

  const buildStories = (resolvedImages: string[]): Story[] => {
    if (resolvedImages.length === 0) {
      return [
        {
          id: Math.random().toString(36).slice(2),
          userId: currentUser.id,
          username: currentUser.username,
          avatar: currentUser.avatar,
          storyBg: bgGradient,
          storyText: textValue || undefined,
          storyTextColor: textColor,
          storyTextBold: textBold,
          time: "now",
          viewed: false,
        },
      ];
    }
    return resolvedImages.map((img) => ({
      id: Math.random().toString(36).slice(2),
      userId: currentUser.id,
      username: currentUser.username,
      avatar: currentUser.avatar,
      image: img,
      storyText: textValue || undefined,
      storyTextColor: textColor,
      storyTextBold: textBold,
      time: "now",
      viewed: false,
    }));
  };

  const handlePublish = async () => {
    let resolvedImages = [...images];
    if (
      CLOUDINARY_CONFIG.cloudName !== "YOUR_CLOUD_NAME" &&
      rawFilesRef.current.length > 0
    ) {
      setUploading(true);
      try {
        const urls = await Promise.all(
          rawFilesRef.current.map((file, i) =>
            uploadToCloudinary(file, "stories", (p) => {
              setUploadProgress(
                Math.round(((i + p / 100) / rawFilesRef.current.length) * 100),
              );
            }).then((r) => r.url),
          ),
        );
        resolvedImages = urls;
      } catch {
        /* fallback to blob URLs */
      } finally {
        setUploading(false);
        setUploadProgress(0);
      }
    }
    const stories = buildStories(resolvedImages);
    setPendingStories(stories);
    setShowHighlightPrompt(true);
  };

  const confirmPublish = (_addToHL: boolean) => {
    for (const s of pendingStories) onPublish(s);
    setShowHighlightPrompt(false);
  };

  const canShare = images.length > 0 || bgGradient;

  const activateTextMode = () => {
    setTextMode(true);
    setShowColorPicker(false);
    setTimeout(() => textareaRef.current?.focus(), 50);
  };

  // ── Highlight prompt ──────────────────────────────────────────────
  if (showHighlightPrompt) {
    return (
      <div className="fixed inset-0 z-50 bg-black flex flex-col items-center justify-center gap-6 px-8">
        <div className="text-white text-center">
          <div className="text-4xl mb-3">✨</div>
          <h2 className="text-xl font-bold mb-1">Story shared!</h2>
          <p className="text-white/60 text-sm">Add it to your highlights?</p>
        </div>
        <div
          className="w-full"
          style={{
            background: "rgba(255,255,255,0.1)",
            borderRadius: 16,
            padding: 16,
          }}
        >
          <input
            value={highlightName}
            onChange={(e) => setHighlightName(e.target.value)}
            placeholder="Name your highlight (e.g. College Life)"
            className="w-full bg-transparent text-white text-sm outline-none text-center placeholder:text-white/40"
          />
        </div>
        <div className="flex gap-3 w-full">
          <button
            type="button"
            onClick={() => confirmPublish(false)}
            className="flex-1 py-3 rounded-2xl text-white/70 font-semibold text-sm"
            style={{ background: "rgba(255,255,255,0.1)" }}
          >
            Skip
          </button>
          <button
            type="button"
            onClick={() => confirmPublish(true)}
            disabled={!highlightName.trim()}
            className="flex-1 py-3 rounded-2xl text-white font-semibold text-sm btn-gradient disabled:opacity-40"
          >
            Add to Highlights
          </button>
        </div>
      </div>
    );
  }

  // ── Main creator: dark full-screen backdrop, 16:9 card centered ───
  return (
    <div
      className="fixed inset-0 z-50"
      style={{
        background: activeImage ? "#111" : bgGradient,
        fontFamily: "'Outfit', sans-serif",
      }}
    >
      <div
        style={{
          position: "relative",
          width: "100%",
          height: "100%",
        }}
      >
        {/* ── Canvas background ── */}
        <div
          ref={canvasRef}
          role="presentation"
          className="absolute inset-0 select-none"
          style={{
            background: activeImage ? "transparent" : bgGradient,
            cursor: dragging
              ? "grabbing"
              : textValue && !textMode
                ? "grab"
                : "default",
          }}
          onPointerDown={handleCanvasPointerDown}
          onPointerMove={handleCanvasPointerMove}
          onPointerUp={handleCanvasPointerUp}
        >
          {activeImage && (
            <>
              {/* Blurred background to fill letterbox areas */}
              <img
                src={activeImage}
                alt=""
                aria-hidden="true"
                className="absolute inset-0 w-full h-full object-cover"
                style={{
                  filter: "blur(20px) brightness(0.5)",
                  transform: "scale(1.1)",
                }}
              />
              {/* Main image on top */}
              <img
                src={activeImage}
                alt="story frame"
                className="absolute inset-0 w-full h-full object-contain"
                style={{ zIndex: 1 }}
              />
            </>
          )}

          {/* Draggable text overlay */}
          {textValue && (
            <div
              className="absolute pointer-events-none"
              style={{
                left: `${textX}%`,
                top: `${textY}%`,
                transform: "translate(-50%, -50%)",
                zIndex: 2,
              }}
            >
              <span
                style={{
                  color: textColor,
                  fontWeight: textBold ? 800 : 600,
                  fontSize: "1.4rem",
                  textShadow: "0 2px 8px rgba(0,0,0,0.6)",
                  whiteSpace: "pre-wrap",
                  wordBreak: "break-word",
                  maxWidth: "75vw",
                  display: "block",
                  textAlign: "center",
                }}
              >
                {textValue}
              </span>
            </div>
          )}

          {/* Text input overlay */}
          {textMode && (
            <div
              className="absolute inset-x-4"
              style={{ top: "38%", transform: "translateY(-50%)", zIndex: 3 }}
              onPointerDown={(e) => e.stopPropagation()}
            >
              <textarea
                ref={textareaRef}
                value={textValue}
                onChange={(e) => setTextValue(e.target.value)}
                placeholder="Type something..."
                rows={3}
                className="w-full bg-transparent outline-none resize-none text-center text-2xl font-bold placeholder:opacity-40"
                style={{
                  color: textColor,
                  fontWeight: textBold ? 800 : 600,
                  textShadow: "0 2px 8px rgba(0,0,0,0.6)",
                }}
              />
              <div className="flex justify-center mt-3">
                <button
                  type="button"
                  onClick={() => setTextMode(false)}
                  className="px-6 py-2 rounded-full bg-white/20 text-white font-semibold text-sm backdrop-blur"
                >
                  Done
                </button>
              </div>
            </div>
          )}

          {/* Empty state hint */}
          {images.length === 0 && !textMode && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 pointer-events-none">
              <p className="text-white/50 text-sm">
                Tap gallery above to add photos
              </p>
            </div>
          )}

          {/* Frame counter */}
          {images.length > 1 && (
            <div
              className="absolute top-3 right-3 bg-black/50 backdrop-blur text-white text-xs px-2 py-0.5 rounded-full font-semibold"
              style={{ zIndex: 4 }}
            >
              {activeFrame + 1}/{images.length}
            </div>
          )}

          {/* Upload progress */}
          {uploading && (
            <div
              className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center gap-3"
              style={{ zIndex: 5 }}
            >
              <Loader2 size={32} className="text-white animate-spin" />
              <p className="text-white font-semibold">{uploadProgress}%</p>
              <p className="text-white/70 text-sm">Uploading...</p>
            </div>
          )}
        </div>

        {/* ── TOP overlay: close + gallery + text tools ── */}
        <div className="absolute top-0 left-0 right-0 z-10 flex items-start justify-between px-3 pt-3">
          {/* Left side: Close + Gallery upload */}
          <div className="flex items-center gap-2">
            {/* Close */}
            <button
              type="button"
              onClick={onClose}
              className="w-9 h-9 rounded-full bg-black/50 backdrop-blur flex items-center justify-center active:scale-90 transition-transform"
            >
              <X size={18} className="text-white" />
            </button>

            {/* Gallery / Add Photo — prominent, always visible at top */}
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              data-ocid="story_creator.upload_button"
              className="flex items-center gap-1.5 px-3 h-9 rounded-full bg-white/20 backdrop-blur active:scale-90 transition-transform border border-white/30"
            >
              <ImagePlus size={16} className="text-white" />
              <span className="text-white text-xs font-semibold">Gallery</span>
            </button>
          </div>

          {/* Right side: Text tools */}
          <div className="flex items-center gap-2">
            {textMode && (
              <>
                <button
                  type="button"
                  onClick={() => setShowTextColors((v) => !v)}
                  className="w-9 h-9 rounded-full bg-black/50 backdrop-blur flex items-center justify-center active:scale-90 transition-all"
                >
                  <div
                    className="w-4 h-4 rounded-full border-2 border-white"
                    style={{ background: textColor }}
                  />
                </button>
                <button
                  type="button"
                  onClick={() => setTextBold((v) => !v)}
                  className={`w-9 h-9 rounded-full backdrop-blur flex items-center justify-center active:scale-90 transition-all ${
                    textBold ? "bg-white text-black" : "bg-black/50 text-white"
                  }`}
                >
                  <Bold size={16} />
                </button>
              </>
            )}
            <button
              type="button"
              onClick={() => {
                if (textMode) setTextMode(false);
                else activateTextMode();
                setShowTextColors(false);
              }}
              className={`w-9 h-9 rounded-full backdrop-blur flex items-center justify-center active:scale-90 transition-all ${
                textMode ? "bg-white text-black" : "bg-black/50 text-white"
              }`}
            >
              <Type size={16} />
            </button>
          </div>
        </div>

        {/* Text color picker row (just below top bar) */}
        {showTextColors && (
          <div className="absolute top-14 left-0 right-0 z-10 flex gap-2 px-3 overflow-x-auto">
            {TEXT_COLORS.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => {
                  setTextColor(c);
                  setShowTextColors(false);
                }}
                className="w-7 h-7 rounded-full flex-shrink-0 border-2 active:scale-90 transition-transform"
                style={{
                  background: c,
                  borderColor: textColor === c ? "white" : "transparent",
                }}
              />
            ))}
          </div>
        )}

        {/* ── BOTTOM overlay: toolbar + frame strip ── */}
        <div
          className="absolute bottom-0 left-0 right-0 z-10"
          style={{
            background:
              "linear-gradient(to top, rgba(0,0,0,0.75) 0%, transparent 100%)",
          }}
        >
          {/* BG gradient picker */}
          {showColorPicker && images.length === 0 && (
            <div className="flex gap-2 px-3 py-2 overflow-x-auto">
              {BG_GRADIENTS.map((g) => (
                <button
                  key={g}
                  type="button"
                  onClick={() => {
                    setBgGradient(g);
                    setShowColorPicker(false);
                  }}
                  className="w-8 h-8 rounded-full flex-shrink-0 active:scale-90 transition-transform"
                  style={{
                    background: g,
                    border:
                      bgGradient === g
                        ? "3px solid white"
                        : "2px solid transparent",
                  }}
                />
              ))}
            </div>
          )}

          {/* Frame thumbnails */}
          {images.length > 0 && (
            <div className="flex gap-2 px-3 pb-1 overflow-x-auto">
              {images.map((img, frameIdx) => (
                <div key={img} className="relative flex-shrink-0">
                  <button
                    type="button"
                    onClick={() => setActiveFrame(frameIdx)}
                    className="block"
                  >
                    <img
                      src={img}
                      alt="frame thumb"
                      className="w-10 h-10 rounded-lg object-cover"
                      style={{
                        border:
                          activeFrame === frameIdx
                            ? "2.5px solid #a855f7"
                            : "2.5px solid transparent",
                      }}
                    />
                  </button>
                  <button
                    type="button"
                    onClick={() => removeImage(frameIdx)}
                    className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-red-500 flex items-center justify-center"
                  >
                    <X size={8} className="text-white" />
                  </button>
                </div>
              ))}
              {images.length < 10 && (
                <button
                  type="button"
                  onClick={() => fileRef.current?.click()}
                  className="w-10 h-10 rounded-lg flex-shrink-0 flex items-center justify-center"
                  style={{
                    background: "rgba(255,255,255,0.15)",
                    border: "2px dashed rgba(255,255,255,0.4)",
                  }}
                >
                  <ImagePlus size={14} className="text-white/70" />
                </button>
              )}
            </div>
          )}

          {/* Main toolbar row */}
          <div className="flex items-center px-3 pb-4 pt-2 gap-2">
            {/* Aa */}
            <button
              type="button"
              onClick={() => {
                if (textMode) setTextMode(false);
                else activateTextMode();
                setShowColorPicker(false);
              }}
              className="flex items-center justify-center w-11 h-11 rounded-2xl active:scale-90 transition-transform"
              style={{
                background: textMode
                  ? "rgba(255,255,255,0.9)"
                  : "rgba(255,255,255,0.18)",
              }}
              data-ocid="story_creator.toggle"
            >
              <span
                className="font-bold text-base"
                style={{ color: textMode ? "#000" : "#fff" }}
              >
                Aa
              </span>
            </button>

            {/* BG palette (when no images) */}
            {images.length === 0 && (
              <button
                type="button"
                onClick={() => setShowColorPicker((v) => !v)}
                className="flex items-center justify-center w-11 h-11 rounded-2xl active:scale-90 transition-transform"
                style={{
                  background: showColorPicker
                    ? "rgba(255,255,255,0.9)"
                    : "rgba(255,255,255,0.18)",
                }}
              >
                <Palette
                  size={18}
                  style={{ color: showColorPicker ? "#000" : "#fff" }}
                />
              </button>
            )}

            <div className="flex-1" />

            {/* Share */}
            <button
              type="button"
              onClick={handlePublish}
              disabled={!canShare || uploading}
              className="flex items-center gap-2 px-4 h-11 rounded-2xl font-bold text-white text-sm btn-gradient active:scale-95 transition-transform disabled:opacity-40"
              data-ocid="story_creator.submit_button"
            >
              <Check size={16} />
              Share
            </button>
          </div>
        </div>
      </div>

      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={handleImageSelect}
      />
    </div>
  );
}
