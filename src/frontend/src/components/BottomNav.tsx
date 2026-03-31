import {
  Calendar,
  Clock,
  Home,
  ImagePlus,
  MapPin,
  MessageSquare,
  Plus,
  User,
  Users,
  X,
} from "lucide-react";
import { useState } from "react";
import { type Page, useApp } from "../App";
import { useAuth } from "../context/AuthContext";
import type { Plan } from "../mockData";
import { addPlan as fbAddPlan } from "../utils/firebaseService";

const PLAN_CATEGORIES = ["Sports", "Study", "Food", "Music", "Tech", "Social"];
const CATEGORY_COLORS: Record<string, string> = {
  Sports: "from-orange-400 to-red-500",
  Study: "from-blue-400 to-indigo-500",
  Food: "from-yellow-400 to-orange-500",
  Music: "from-pink-400 to-purple-500",
  Tech: "from-cyan-400 to-blue-500",
  Social: "from-green-400 to-teal-500",
};

const leftTabs: { icon: typeof Home; label: string; page: Page }[] = [
  { icon: Home, label: "Home", page: "home" },
  { icon: Calendar, label: "Plans", page: "plans" },
];

const rightTabs: { icon: typeof Home; label: string; page: Page }[] = [
  { icon: MessageSquare, label: "Discuss", page: "discuss" },
  { icon: User, label: "Me", page: "profile" },
];

export default function BottomNav() {
  const { page, navigate, theme, openCreatePost, addToast } = useApp();
  const { userProfile } = useAuth();

  // Action sheet state
  const [sheetOpen, setSheetOpen] = useState(false);
  // "select" | "plan"
  const [mode, setMode] = useState<"select" | "plan">("select");

  // Plan form
  const [planName, setPlanName] = useState("");
  const [planDesc, setPlanDesc] = useState("");
  const [planLocation, setPlanLocation] = useState("");
  const [planSlots, setPlanSlots] = useState("");
  const [planCategory, setPlanCategory] = useState("Social");
  const [planDate, setPlanDate] = useState("");
  const [planTime, setPlanTime] = useState("");
  const [planLoading, setPlanLoading] = useState(false);

  const openSheet = () => {
    setMode("select");
    setSheetOpen(true);
  };

  const closeSheet = () => {
    setSheetOpen(false);
    setMode("select");
    setPlanName("");
    setPlanDesc("");
    setPlanLocation("");
    setPlanSlots("");
    setPlanCategory("Social");
    setPlanDate("");
    setPlanTime("");
  };

  const handleNewPost = () => {
    closeSheet();
    openCreatePost();
  };

  const handleCreatePlan = async () => {
    if (!planName.trim()) return;
    setPlanLoading(true);
    const slots = Math.min(50, Math.max(2, Number(planSlots) || 10));
    const organizer = userProfile?.username ?? "user";
    const newPlan: Omit<Plan, "id"> = {
      title: planName.trim(),
      description: planDesc.trim() || "No description provided.",
      category: planCategory,
      tags: [],
      slots,
      joined: 1,
      isJoined: false,
      organizer,
      time:
        planDate && planTime
          ? `${planDate} at ${planTime}`
          : planDate || planTime || "TBD",
      location: planLocation.trim() || "TBD",
    };
    try {
      await fbAddPlan(newPlan);
      addToast("Plan created! 🎉", "success");
      closeSheet();
      navigate("plans");
    } catch (_e) {
      addToast("Failed to create plan", "error");
    }
    setPlanLoading(false);
  };

  const inputCls = `w-full px-4 py-3 rounded-2xl border text-sm outline-none transition-colors ${
    theme === "dark"
      ? "bg-white/5 border-white/10 text-white placeholder:text-gray-500"
      : "bg-gray-50 border-gray-200 text-gray-900 placeholder:text-gray-400"
  }`;

  const renderTab = ({
    icon: Icon,
    label,
    page: tabPage,
  }: (typeof leftTabs)[0]) => {
    const active =
      page === tabPage || (tabPage === "discuss" && page === "discuss-detail");
    return (
      <button
        type="button"
        key={tabPage}
        onClick={() => navigate(tabPage)}
        className={`flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-2xl transition-all active:scale-90 ${
          active
            ? "text-purple-600"
            : theme === "dark"
              ? "text-gray-400"
              : "text-gray-500"
        }`}
      >
        <div
          className={`relative p-1.5 rounded-xl transition-all ${
            active
              ? theme === "dark"
                ? "bg-purple-600/20"
                : "bg-purple-50"
              : ""
          }`}
        >
          <Icon size={22} strokeWidth={active ? 2.5 : 1.8} />
        </div>
        <span
          className={`text-[10px] font-medium ${
            active ? "text-purple-600 font-semibold" : ""
          }`}
        >
          {label}
        </span>
      </button>
    );
  };

  return (
    <>
      <nav
        className={`fixed bottom-0 left-0 right-0 z-40 max-w-[430px] mx-auto
          ${theme === "dark" ? "glass-dark" : "glass"}
          border-t border-white/20 pb-safe
        `}
      >
        <div className="flex items-center justify-around px-2 h-16">
          {leftTabs.map(renderTab)}

          {/* Center Action Button — flush in nav bar */}
          <button
            type="button"
            onClick={openSheet}
            className="flex flex-col items-center gap-0.5 px-3 py-1.5 transition-all active:scale-90"
            data-ocid="bottom_nav.create_post"
          >
            <div
              className="w-11 h-11 rounded-2xl btn-gradient flex items-center justify-center shadow-md transition-transform"
              style={{ boxShadow: "0 4px 16px rgba(124,58,237,0.4)" }}
            >
              <Plus size={22} className="text-white" strokeWidth={2.5} />
            </div>
            <span
              className={`text-[10px] font-medium ${
                theme === "dark" ? "text-gray-400" : "text-gray-500"
              }`}
            >
              Create
            </span>
          </button>

          {rightTabs.map(renderTab)}
        </div>
      </nav>

      {/* Action Sheet Overlay */}
      {sheetOpen && (
        <div
          role="presentation"
          className="fixed inset-0 z-50 flex items-end justify-center"
          style={{ background: "rgba(0,0,0,0.5)" }}
          onClick={(e) => {
            if (e.target === e.currentTarget) closeSheet();
          }}
          onKeyDown={(e) => {
            if (e.key === "Escape") closeSheet();
          }}
        >
          <div
            className={`w-full max-w-[430px] rounded-t-3xl ${
              theme === "dark" ? "bg-[#1A1D27]" : "bg-white"
            } shadow-2xl`}
            style={{ animation: "slideUp 0.25s ease" }}
          >
            {/* Scrollable content */}
            <div className="max-h-[80vh] overflow-y-auto p-5 pb-10">
              {/* Header */}
              <div className="flex items-center justify-between mb-5">
                <h3 className="text-lg font-bold">
                  {mode === "select" ? "Create" : "New Plan"}
                </h3>
                <button
                  type="button"
                  onClick={closeSheet}
                  className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    theme === "dark" ? "bg-white/10" : "bg-gray-100"
                  }`}
                >
                  <X size={16} />
                </button>
              </div>

              {mode === "select" ? (
                // Option cards
                <div className="grid grid-cols-2 gap-3">
                  {/* New Post */}
                  <button
                    type="button"
                    onClick={handleNewPost}
                    className={`flex flex-col items-center gap-3 p-5 rounded-2xl border-2 transition-all active:scale-95 ${
                      theme === "dark"
                        ? "border-white/10 bg-white/5 hover:border-purple-500/50"
                        : "border-gray-100 bg-gray-50 hover:border-purple-200"
                    }`}
                  >
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                      <ImagePlus size={22} className="text-white" />
                    </div>
                    <div className="text-center">
                      <p className="font-semibold text-sm">New Post</p>
                      <p
                        className={`text-xs mt-0.5 ${theme === "dark" ? "text-gray-400" : "text-gray-500"}`}
                      >
                        Photo or carousel
                      </p>
                    </div>
                  </button>

                  {/* New Plan */}
                  <button
                    type="button"
                    onClick={() => setMode("plan")}
                    className={`flex flex-col items-center gap-3 p-5 rounded-2xl border-2 transition-all active:scale-95 ${
                      theme === "dark"
                        ? "border-white/10 bg-white/5 hover:border-purple-500/50"
                        : "border-gray-100 bg-gray-50 hover:border-purple-200"
                    }`}
                  >
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-orange-400 to-pink-500 flex items-center justify-center">
                      <Calendar size={22} className="text-white" />
                    </div>
                    <div className="text-center">
                      <p className="font-semibold text-sm">New Plan</p>
                      <p
                        className={`text-xs mt-0.5 ${theme === "dark" ? "text-gray-400" : "text-gray-500"}`}
                      >
                        Campus activity
                      </p>
                    </div>
                  </button>
                </div>
              ) : (
                // Plan creation form
                <div className="space-y-3">
                  {/* Plan Name */}
                  <div>
                    <p
                      className={`text-xs font-semibold mb-1.5 ${
                        theme === "dark" ? "text-gray-400" : "text-gray-500"
                      }`}
                    >
                      Plan Name *
                    </p>
                    <input
                      value={planName}
                      onChange={(e) => setPlanName(e.target.value)}
                      placeholder="e.g. Football at SAC"
                      className={inputCls}
                    />
                  </div>

                  {/* Category */}
                  <div>
                    <p
                      className={`text-xs font-semibold mb-2 ${
                        theme === "dark" ? "text-gray-400" : "text-gray-500"
                      }`}
                    >
                      Category
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {PLAN_CATEGORIES.map((cat) => (
                        <button
                          type="button"
                          key={cat}
                          onClick={() => setPlanCategory(cat)}
                          className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
                            planCategory === cat
                              ? `bg-gradient-to-r ${CATEGORY_COLORS[cat]} text-white shadow-md`
                              : theme === "dark"
                                ? "bg-white/10 text-gray-300"
                                : "bg-gray-100 text-gray-600"
                          }`}
                        >
                          {cat}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Slots */}
                  <div>
                    <p
                      className={`text-xs font-semibold mb-1.5 ${
                        theme === "dark" ? "text-gray-400" : "text-gray-500"
                      }`}
                    >
                      How many slots?
                    </p>
                    <div className="relative">
                      <Users
                        size={14}
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                      />
                      <input
                        value={planSlots}
                        onChange={(e) => setPlanSlots(e.target.value)}
                        placeholder="e.g. 10 (max 50)"
                        type="number"
                        min={2}
                        max={50}
                        className={`${inputCls} pl-8`}
                      />
                    </div>
                  </div>

                  {/* Date & Time */}
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <p
                        className={`text-xs font-semibold mb-1.5 ${theme === "dark" ? "text-gray-400" : "text-gray-500"}`}
                      >
                        Date
                      </p>
                      <div className="relative">
                        <Calendar
                          size={14}
                          className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                        />
                        <input
                          type="date"
                          value={planDate}
                          onChange={(e) => setPlanDate(e.target.value)}
                          className={`${inputCls} pl-8`}
                        />
                      </div>
                    </div>
                    <div>
                      <p
                        className={`text-xs font-semibold mb-1.5 ${theme === "dark" ? "text-gray-400" : "text-gray-500"}`}
                      >
                        Time
                      </p>
                      <div className="relative">
                        <Clock
                          size={14}
                          className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                        />
                        <input
                          type="time"
                          value={planTime}
                          onChange={(e) => setPlanTime(e.target.value)}
                          className={`${inputCls} pl-8`}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Location */}
                  <div>
                    <p
                      className={`text-xs font-semibold mb-1.5 ${
                        theme === "dark" ? "text-gray-400" : "text-gray-500"
                      }`}
                    >
                      Location (optional)
                    </p>
                    <div className="relative">
                      <MapPin
                        size={14}
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                      />
                      <input
                        value={planLocation}
                        onChange={(e) => setPlanLocation(e.target.value)}
                        placeholder="e.g. SAC Ground"
                        className={`${inputCls} pl-8`}
                      />
                    </div>
                  </div>

                  {/* Description */}
                  <div>
                    <p
                      className={`text-xs font-semibold mb-1.5 ${
                        theme === "dark" ? "text-gray-400" : "text-gray-500"
                      }`}
                    >
                      Description (optional)
                    </p>
                    <textarea
                      value={planDesc}
                      onChange={(e) => setPlanDesc(e.target.value)}
                      placeholder="What's the plan about?"
                      rows={2}
                      className={`${inputCls} resize-none`}
                    />
                  </div>

                  {/* Submit */}
                  <button
                    type="button"
                    onClick={handleCreatePlan}
                    disabled={!planName.trim() || planLoading}
                    className="w-full py-3.5 rounded-2xl text-white font-semibold text-sm btn-gradient disabled:opacity-40 transition-all active:scale-95"
                  >
                    {planLoading ? "Creating..." : "Create Plan"}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
