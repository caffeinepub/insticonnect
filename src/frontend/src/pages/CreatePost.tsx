import {
  ArrowLeft,
  AtSign,
  Hash,
  ImagePlus,
  Loader2,
  Users,
  X,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useApp } from "../App";
import { useAuth } from "../context/AuthContext";
import type { Post } from "../mockData";
import { uploadToCloudinary } from "../utils/cloudinary";
import {
  addPost,
  createNotification,
  getUserByUsername,
} from "../utils/firebaseService";

interface CreatePostProps {
  onPost: (post: Post) => void;
  onClose: () => void;
}

export default function CreatePost({ onPost, onClose }: CreatePostProps) {
  const { theme, addToast, user: appUser } = useApp();
  const { userProfile } = useAuth();
  const realUser = userProfile ?? appUser;
  const [step, setStep] = useState<1 | 2>(1);
  const [images, setImages] = useState<string[]>([]);
  const [activeIdx, setActiveIdx] = useState(0);
  const [caption, setCaption] = useState("");
  const [hashtags, setHashtags] = useState("");
  const [tagPeople, setTagPeople] = useState("");
  const [isAnon, setIsAnon] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileRef = useRef<HTMLInputElement>(null);
  const rawFilesRef = useRef<File[]>([]);

  const isDark = theme === "dark";
  const surface = isDark ? "bg-[#0F0F1A]" : "bg-white";
  const textClass = isDark ? "text-white" : "text-gray-900";
  const sub = isDark ? "text-gray-400" : "text-gray-500";

  useEffect(() => {
    const t = setTimeout(() => fileRef.current?.click(), 100);
    return () => clearTimeout(t);
  }, []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    const newFiles = files.slice(0, 10 - images.length);
    const newUrls = newFiles.map((f) => URL.createObjectURL(f));
    rawFilesRef.current = [...rawFilesRef.current, ...newFiles].slice(0, 10);
    setImages((prev) => {
      const updated = [...prev, ...newUrls].slice(0, 10);
      setActiveIdx(updated.length - 1);
      return updated;
    });
    e.target.value = "";
  };

  const removeImage = (idx: number) => {
    rawFilesRef.current = rawFilesRef.current.filter((_, i) => i !== idx);
    setImages((prev) => {
      const updated = prev.filter((_, i) => i !== idx);
      setActiveIdx(Math.min(activeIdx, Math.max(0, updated.length - 1)));
      return updated;
    });
  };

  const buildCaption = () => {
    if (!hashtags.trim()) return caption;
    const tags = hashtags
      .trim()
      .split(" ")
      .map((t) => (t.startsWith("#") ? t : `#${t}`))
      .join(" ");
    return `${caption} ${tags}`;
  };

  const handleShare = async () => {
    let finalImages = [...images];
    if (rawFilesRef.current.length > 0) {
      setUploading(true);
      try {
        const uploadedUrls = await Promise.all(
          rawFilesRef.current.map((file, i) =>
            uploadToCloudinary(file, "posts", (p) => {
              setUploadProgress(
                Math.round(((i + p / 100) / rawFilesRef.current.length) * 100),
              );
            }).then((r) => {
              console.log("[Cloudinary] Upload result:", r.url);
              return r.url;
            }),
          ),
        );
        finalImages = uploadedUrls;
        console.log("[Cloudinary] All images uploaded:", finalImages);
      } catch {
        addToast("Image upload failed, using local preview", "error");
      } finally {
        setUploading(false);
        setUploadProgress(0);
      }
    }

    // Parse tagged usernames from input
    const taggedUsernames = tagPeople
      .split(/[,\s]+/)
      .map((t) => t.replace(/^@/, "").trim().toLowerCase())
      .filter(Boolean);

    const postData = {
      userId: realUser?.id ?? "unknown",
      username: isAnon ? "anonymous" : (realUser?.username ?? "user"),
      avatar: isAnon
        ? "https://api.dicebear.com/7.x/shapes/svg?seed=anon"
        : (realUser?.avatar ?? ""),
      image: finalImages[0] || undefined,
      images: finalImages.length > 0 ? finalImages : undefined,
      caption: buildCaption(),
      likes: 0,
      liked: false,
      likedBy: [],
      saved: false,
      comments: [],
      time: "just now",
      isAnonymous: isAnon,
      isPrivate: false,
      taggedUsers: taggedUsernames,
    };

    // Save to Firestore
    console.log("[CreatePost] Saving to Firestore...", postData);
    const docId = await addPost(postData as any);
    console.log("[CreatePost] Saved with ID:", docId);
    const newPost: Post = { ...postData, id: docId };
    onPost(newPost);

    // Send tag notifications
    if (!isAnon && realUser?.id && taggedUsernames.length > 0) {
      for (const uname of taggedUsernames) {
        const taggedUser = await getUserByUsername(uname);
        if (taggedUser && taggedUser.id !== realUser.id) {
          void createNotification({
            userId: taggedUser.id,
            senderId: realUser.id,
            senderName: realUser.name,
            senderAvatar: realUser.avatar,
            type: "tag",
            postId: docId,
            postImage: finalImages[0],
          });
        }
      }
    }
  };

  const inputClass = `w-full px-4 py-3 rounded-2xl text-sm outline-none border ${
    isDark
      ? "bg-white/5 border-white/10 text-white"
      : "bg-gray-50 border-gray-200 text-gray-900"
  } placeholder:opacity-40`;

  return (
    <div
      className={`fixed inset-0 z-50 flex flex-col ${surface} ${textClass}`}
      style={{ fontFamily: "Outfit, sans-serif" }}
    >
      {/* Header */}
      <div
        className={`flex items-center gap-3 px-4 py-3 border-b ${
          isDark ? "border-white/5" : "border-gray-100"
        } flex-shrink-0`}
      >
        <button
          type="button"
          onClick={step === 2 ? () => setStep(1) : onClose}
          className="p-1.5 rounded-xl active:scale-90 transition-transform"
        >
          <ArrowLeft size={22} />
        </button>
        <h1 className="font-bold text-base flex-1">
          {step === 1 ? "New Post" : "Add Details"}
        </h1>
        {step === 1 ? (
          <button
            type="button"
            onClick={() => images.length > 0 && setStep(2)}
            disabled={images.length === 0}
            className="text-purple-500 font-semibold text-sm disabled:opacity-40"
            data-ocid="create_post.button"
          >
            Next
          </button>
        ) : (
          <button
            type="button"
            onClick={handleShare}
            disabled={uploading}
            className="text-purple-500 font-semibold text-sm disabled:opacity-40 flex items-center gap-1"
            data-ocid="create_post.submit_button"
          >
            {uploading && <Loader2 size={14} className="animate-spin" />}
            {uploading ? `${uploadProgress}%` : "Share"}
          </button>
        )}
      </div>

      {/* Step 1: Image selection */}
      {step === 1 && (
        <div className="flex-1 flex flex-col overflow-hidden">
          <div
            className="relative w-full flex-shrink-0 overflow-hidden"
            style={{ aspectRatio: "1/1" }}
          >
            {images.length > 0 ? (
              <>
                <img
                  src={images[activeIdx]}
                  alt=""
                  aria-hidden="true"
                  className="absolute inset-0 w-full h-full object-cover scale-110"
                  style={{ filter: "blur(20px)", opacity: 0.6 }}
                />
                <div className="absolute inset-0 bg-black/30" />
                <img
                  src={images[activeIdx]}
                  alt="selected"
                  className="absolute inset-0 w-full h-full object-contain"
                />
                {images.length > 1 && (
                  <div className="absolute top-2 right-2 bg-black/60 text-white text-xs px-2 py-0.5 rounded-full font-semibold">
                    {activeIdx + 1}/{images.length}
                  </div>
                )}
              </>
            ) : (
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                className={`w-full h-full flex flex-col items-center justify-center gap-4 ${
                  isDark ? "bg-white/3" : "bg-gray-50"
                }`}
                data-ocid="create_post.upload_button"
              >
                <div
                  className="w-24 h-24 rounded-3xl flex items-center justify-center"
                  style={{
                    background:
                      "linear-gradient(135deg, rgba(168,85,247,0.15), rgba(236,72,153,0.15))",
                    border: "2px dashed",
                    borderColor: isDark
                      ? "rgba(168,85,247,0.5)"
                      : "rgba(168,85,247,0.4)",
                  }}
                >
                  <ImagePlus
                    size={36}
                    className="text-purple-400"
                    strokeWidth={1.5}
                  />
                </div>
                <div className="flex flex-col items-center gap-1">
                  <p
                    className={`text-base font-semibold ${
                      isDark ? "text-white" : "text-gray-800"
                    }`}
                  >
                    Add Photos
                  </p>
                  <p className={`text-sm ${sub}`}>Tap to open your gallery</p>
                  <p className={`text-xs ${sub} opacity-60 mt-1`}>
                    Up to 10 images · Carousel supported
                  </p>
                </div>
              </button>
            )}
          </div>

          <div
            className={`flex gap-2 p-3 overflow-x-auto border-t ${
              isDark ? "border-white/5" : "border-gray-100"
            } flex-shrink-0`}
          >
            {images.map((img, i) => (
              <div key={img} className="relative flex-shrink-0">
                <button type="button" onClick={() => setActiveIdx(i)}>
                  <img
                    src={img}
                    alt={`frame ${i + 1}`}
                    className="w-16 h-16 rounded-xl object-cover"
                    style={{
                      border:
                        i === activeIdx
                          ? "2.5px solid #a855f7"
                          : "2.5px solid transparent",
                    }}
                  />
                </button>
                <button
                  type="button"
                  onClick={() => removeImage(i)}
                  className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-red-500 flex items-center justify-center"
                  data-ocid={`create_post.delete_button.${i + 1}`}
                >
                  <X size={9} className="text-white" />
                </button>
              </div>
            ))}
            {images.length < 10 && (
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                className={`w-16 h-16 rounded-xl flex-shrink-0 flex items-center justify-center ${
                  isDark ? "bg-white/5" : "bg-gray-100"
                }`}
                data-ocid="create_post.upload_button"
              >
                <ImagePlus size={20} className={sub} />
              </button>
            )}
          </div>
        </div>
      )}

      {/* Step 2: Caption + details */}
      {step === 2 && (
        <div className="flex-1 overflow-y-auto">
          <div className="flex items-start gap-3 px-4 py-4">
            <img
              src={
                realUser?.avatar ??
                "https://api.dicebear.com/7.x/shapes/svg?seed=me"
              }
              alt="me"
              className="w-10 h-10 rounded-full object-cover flex-shrink-0"
            />
            <textarea
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              placeholder="Write a caption..."
              rows={4}
              className={`flex-1 bg-transparent outline-none resize-none text-sm ${
                isDark ? "text-white" : "text-gray-900"
              } placeholder:opacity-40`}
              data-ocid="create_post.textarea"
            />
            {images[0] && (
              <img
                src={images[0]}
                alt="preview"
                className="w-14 h-14 rounded-xl object-cover flex-shrink-0"
              />
            )}
          </div>

          <div
            className={`border-t ${
              isDark ? "border-white/5" : "border-gray-100"
            } px-4 py-4 space-y-3`}
          >
            <div className="relative">
              <Hash
                size={16}
                className={`absolute left-3 top-1/2 -translate-y-1/2 ${sub}`}
              />
              <input
                value={hashtags}
                onChange={(e) => setHashtags(e.target.value)}
                placeholder="Add hashtags (e.g. iitm fest college)"
                className={`${inputClass} pl-9`}
                data-ocid="create_post.input"
              />
            </div>
            <div className="relative">
              <AtSign
                size={16}
                className={`absolute left-3 top-1/2 -translate-y-1/2 ${sub}`}
              />
              <input
                value={tagPeople}
                onChange={(e) => setTagPeople(e.target.value)}
                placeholder="Tag people"
                className={`${inputClass} pl-9`}
                data-ocid="create_post.input"
              />
            </div>

            <div
              className={`flex items-center justify-between py-3 border-t ${
                isDark ? "border-white/5" : "border-gray-100"
              }`}
            >
              <div className="flex items-center gap-2">
                <Users size={16} className={sub} />
                <span className="text-sm">Post anonymously</span>
              </div>
              <button
                type="button"
                onClick={() => setIsAnon((v) => !v)}
                className={`relative w-11 h-6 rounded-full transition-colors ${
                  isAnon
                    ? "bg-purple-600"
                    : isDark
                      ? "bg-white/20"
                      : "bg-gray-200"
                }`}
                data-ocid="create_post.toggle"
              >
                <span
                  className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${
                    isAnon ? "translate-x-5" : "translate-x-0.5"
                  }`}
                />
              </button>
            </div>
          </div>
        </div>
      )}

      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={handleFileSelect}
      />
    </div>
  );
}
