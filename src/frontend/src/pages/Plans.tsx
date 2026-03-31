import { Calendar, Clock, MapPin, Plus, Tag, Users } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useApp } from "../App";
import BottomSheet from "../components/BottomSheet";
import { useAuth } from "../context/AuthContext";
import type { Plan } from "../mockData";
import {
  addPlan as fbAddPlan,
  deletePlan as fbDeletePlan,
  updatePlan as fbUpdatePlan,
  subscribePlans,
} from "../utils/firebaseService";

const CATEGORIES = [
  "All",
  "Sports",
  "Study",
  "Food",
  "Music",
  "Tech",
  "Social",
];
const PLAN_CATEGORIES = [
  "Sports",
  "Study",
  "Food",
  "Music",
  "Tech",
  "Social",
  "Travel",
  "Culture",
  "Gaming",
  "Random",
];
const CATEGORY_COLORS: Record<string, string> = {
  Sports: "from-orange-400 to-red-500",
  Study: "from-blue-400 to-indigo-500",
  Food: "from-yellow-400 to-orange-500",
  Music: "from-pink-400 to-purple-500",
  Tech: "from-cyan-400 to-blue-500",
  Social: "from-green-400 to-teal-500",
  Travel: "from-sky-400 to-cyan-500",
  Culture: "from-rose-400 to-pink-500",
  Gaming: "from-violet-400 to-purple-500",
  Random: "from-amber-400 to-orange-500",
  All: "from-purple-500 to-pink-500",
};

const FAB_SIZE = 64;
const FAB_MARGIN = 16;

export default function Plans() {
  const { theme, addToast, navigate } = useApp();
  const { userProfile } = useAuth();
  const [plans, setPlans] = useState<Plan[]>([]);

  useEffect(() => {
    const unsub = subscribePlans((firestorePlans) => setPlans(firestorePlans));
    return unsub;
  }, []);

  const [selected, setSelected] = useState("All");
  const [createOpen, setCreateOpen] = useState(false);

  // Create form state
  const [newTitle, setNewTitle] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [newLocation, setNewLocation] = useState("");
  const [newSlots, setNewSlots] = useState("");
  const [newCategory, setNewCategory] = useState("Social");
  const [newDate, setNewDate] = useState("");
  const [newTime, setNewTime] = useState("");

  // Draggable FAB — uses bottom/right so it's always visible above the nav
  const [fabPos, setFabPos] = useState({ right: FAB_MARGIN, bottom: 100 });

  const drag = useRef({
    active: false,
    startX: 0,
    startY: 0,
    originRight: FAB_MARGIN,
    originBottom: 100,
  });

  const setFabPosRef = useRef(setFabPos);
  setFabPosRef.current = setFabPos;

  const openModalRef = useRef(() => setCreateOpen(true));
  openModalRef.current = () => setCreateOpen(true);

  useEffect(() => {
    const clamp = (v: number, lo: number, hi: number) =>
      Math.min(hi, Math.max(lo, v));

    const handleMove = (cx: number, cy: number) => {
      if (!drag.current.active) return;
      const dx = drag.current.startX - cx;
      const dy = drag.current.startY - cy;
      const newRight = clamp(
        drag.current.originRight + dx,
        0,
        window.innerWidth - FAB_SIZE,
      );
      const newBottom = clamp(
        drag.current.originBottom + dy,
        80,
        window.innerHeight - FAB_SIZE,
      );
      setFabPosRef.current({ right: newRight, bottom: newBottom });
    };

    const handleEnd = (cx: number, cy: number) => {
      if (!drag.current.active) return;
      const ddx = Math.abs(cx - drag.current.startX);
      const ddy = Math.abs(cy - drag.current.startY);
      drag.current.active = false;
      if (ddx < 5 && ddy < 5) openModalRef.current();
    };

    const onMouseMove = (e: MouseEvent) => handleMove(e.clientX, e.clientY);
    const onMouseUp = (e: MouseEvent) => handleEnd(e.clientX, e.clientY);
    const onTouchMove = (e: TouchEvent) => {
      if (drag.current.active) e.preventDefault();
      handleMove(e.touches[0].clientX, e.touches[0].clientY);
    };
    const onTouchEnd = (e: TouchEvent) =>
      handleEnd(e.changedTouches[0].clientX, e.changedTouches[0].clientY);

    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
    window.addEventListener("touchmove", onTouchMove, { passive: false });
    window.addEventListener("touchend", onTouchEnd);
    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
      window.removeEventListener("touchmove", onTouchMove);
      window.removeEventListener("touchend", onTouchEnd);
    };
  }, []);

  const startDrag = (cx: number, cy: number) => {
    drag.current = {
      active: true,
      startX: cx,
      startY: cy,
      originRight: fabPos.right,
      originBottom: fabPos.bottom,
    };
  };

  const filtered =
    selected === "All" ? plans : plans.filter((p) => p.category === selected);

  const joinPlan = async (id: string) => {
    const plan = plans.find((p) => p.id === id);
    if (!plan) return;

    const newJoined = plan.isJoined ? plan.joined - 1 : plan.joined + 1;
    const willBeFull = !plan.isJoined && newJoined >= plan.slots;
    const newIsJoined = !plan.isJoined;

    void fbUpdatePlan(id, { isJoined: newIsJoined, joined: newJoined });

    if (!plan.isJoined) {
      addToast(`Joined ${plan.title} group chat! 🎉`, "success");
      navigate("chat-screen", {
        chatId: `plan-${plan.id}`,
        chatName: plan.title,
        isGroup: true,
      });

      if (willBeFull) {
        setTimeout(() => {
          void fbDeletePlan(id);
          addToast(
            "Plan is full — it's been removed from the board! 🎉",
            "info",
          );
        }, 1500);
      }
    } else {
      addToast("Left the plan", "info");
    }
  };

  const createPlan = async () => {
    if (!newTitle.trim()) return;
    const slots = Math.min(50, Math.max(2, Number(newSlots) || 10));
    const organizer = userProfile?.username ?? "user";
    const newPlan: Omit<Plan, "id"> = {
      title: newTitle.trim(),
      description: newDesc.trim() || "No description provided.",
      category: newCategory,
      tags: [],
      slots,
      joined: 1,
      isJoined: false,
      organizer,
      time:
        newDate && newTime
          ? `${newDate} at ${newTime}`
          : newDate || newTime || "TBD",
      location: newLocation.trim() || "TBD",
    };
    try {
      await fbAddPlan(newPlan);
      addToast("Plan created! 🎉", "success");
    } catch (_e) {
      addToast("Failed to create plan", "error");
    }
    setNewTitle("");
    setNewDesc("");
    setNewLocation("");
    setNewSlots("");
    setNewDate("");
    setNewTime("");
    setNewCategory("Social");
    setCreateOpen(false);
  };

  const openOrganizerProfile = async (organizer: string) => {
    if (organizer === userProfile?.username) {
      navigate("profile");
      return;
    }
    navigate("other-profile", { userId: organizer });
  };

  const surface = theme === "dark" ? "bg-[#1A1D27]" : "bg-white";
  const text2 = theme === "dark" ? "text-gray-400" : "text-gray-500";
  const inputCls = `w-full px-4 py-3 rounded-2xl border text-sm outline-none ${
    theme === "dark"
      ? "bg-white/5 border-white/10 text-white"
      : "bg-gray-50 border-gray-200"
  }`;

  return (
    <>
      <div className="page-fade px-4 pt-4 pb-4">
        {/* Header row with Add Plan button */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold">Campus Plans</h2>
          <button
            type="button"
            onClick={() => setCreateOpen(true)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-full btn-gradient text-white text-sm font-semibold shadow-lg shadow-purple-500/30 active:scale-95 transition-transform"
            data-ocid="plans.open_modal_button"
          >
            <Plus size={16} />
            Add Plan
          </button>
        </div>

        {/* Category filter chips */}
        <div className="flex gap-2 overflow-x-auto pb-3 -mx-4 px-4">
          {CATEGORIES.map((cat) => (
            <button
              type="button"
              key={cat}
              onClick={() => setSelected(cat)}
              className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-all ${
                selected === cat
                  ? "bg-purple-600 text-white shadow-lg shadow-purple-500/30"
                  : theme === "dark"
                    ? "bg-white/10 text-gray-300"
                    : "bg-gray-100 text-gray-600"
              }`}
              data-ocid="plans.tab"
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Plan cards */}
        <div className="space-y-4 mt-2 pb-32">
          {filtered.length === 0 && (
            <div
              className="flex flex-col items-center justify-center py-16 gap-3"
              data-ocid="plans.empty_state"
            >
              <div className="w-16 h-16 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                <Calendar size={28} className="text-purple-500" />
              </div>
              <p className={`text-sm font-medium ${text2}`}>
                No plans yet. Create the first one!
              </p>
              <button
                type="button"
                onClick={() => setCreateOpen(true)}
                className="px-5 py-2.5 rounded-full btn-gradient text-white text-sm font-semibold"
              >
                + Create Plan
              </button>
            </div>
          )}

          {filtered.map((plan, idx) => (
            <div
              key={plan.id}
              className={`${surface} rounded-2xl overflow-hidden shadow-md card-hover`}
              data-ocid={`plans.item.${idx + 1}`}
            >
              {/* Color header */}
              <div
                className={`bg-gradient-to-r ${
                  CATEGORY_COLORS[plan.category] || CATEGORY_COLORS.All
                } h-2`}
              />

              <div className="p-4">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span
                        className={`text-xs px-2 py-0.5 rounded-full bg-gradient-to-r ${
                          CATEGORY_COLORS[plan.category]
                        } text-white font-medium`}
                      >
                        {plan.category}
                      </span>
                      {plan.joined >= plan.slots && (
                        <span className="text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded-full font-medium">
                          Full
                        </span>
                      )}
                    </div>
                    <h3 className="font-bold text-base">
                      {plan.title || "Untitled Plan"}
                    </h3>
                    <p className={`text-sm ${text2} mt-1`}>
                      {plan.description}
                    </p>
                  </div>
                </div>

                {/* Info row */}
                <div
                  className={`flex items-center gap-4 mt-3 text-xs ${text2}`}
                >
                  <span className="flex items-center gap-1 font-semibold text-purple-500">
                    <Tag size={12} />
                    {plan.title || "Untitled Plan"}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock size={12} />
                    {plan.time}
                  </span>
                  <span className="flex items-center gap-1">
                    <MapPin size={12} />
                    {plan.location}
                  </span>
                </div>

                {/* Tags */}
                {plan.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-3">
                    {plan.tags.map((t) => (
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
                )}

                {/* Slots progress */}
                <div className="mt-3">
                  <div className="flex justify-between text-xs mb-1">
                    <span className={`flex items-center gap-1 ${text2}`}>
                      <Users size={12} />
                      {plan.joined} / {plan.slots} joined
                    </span>
                    <span
                      className={`font-medium ${
                        plan.joined >= plan.slots
                          ? "text-red-500"
                          : "text-green-500"
                      }`}
                    >
                      {plan.joined >= plan.slots
                        ? "Full"
                        : `${plan.slots - plan.joined} spots left`}
                    </span>
                  </div>
                  <div
                    className={`w-full h-2 rounded-full ${
                      theme === "dark" ? "bg-white/10" : "bg-gray-100"
                    }`}
                  >
                    <div
                      className={`h-2 rounded-full transition-all bg-gradient-to-r ${
                        CATEGORY_COLORS[plan.category]
                      }`}
                      style={{
                        width: `${Math.min(100, (plan.joined / plan.slots) * 100)}%`,
                      }}
                    />
                  </div>
                </div>

                {/* Organizer row */}
                <button
                  type="button"
                  onClick={() => openOrganizerProfile(plan.organizer)}
                  className={`flex items-center gap-1.5 mt-3 cursor-pointer ${
                    text2
                  } hover:opacity-80 transition-opacity`}
                >
                  <img
                    src={`https://picsum.photos/seed/${plan.organizer}/100/100`}
                    alt={plan.organizer}
                    className="w-6 h-6 rounded-full object-cover"
                  />
                  <span className="text-xs">by @{plan.organizer}</span>
                </button>

                {/* Join button */}
                <button
                  type="button"
                  onClick={() => joinPlan(plan.id)}
                  disabled={plan.joined >= plan.slots && !plan.isJoined}
                  className={`mt-4 w-full py-2.5 rounded-xl text-sm font-semibold transition-all ${
                    plan.isJoined
                      ? theme === "dark"
                        ? "bg-white/10 text-gray-300"
                        : "bg-gray-100 text-gray-600"
                      : plan.joined >= plan.slots
                        ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                        : "btn-gradient text-white"
                  }`}
                  data-ocid={`plans.primary_button.${idx + 1}`}
                >
                  {plan.isJoined
                    ? "Joined ✓ (View Chat)"
                    : plan.joined >= plan.slots
                      ? "Plan Full"
                      : "Join Plan"}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Draggable FAB — uses bottom/right so it never hides behind bottom nav */}
      <button
        type="button"
        onMouseDown={(e) => {
          e.preventDefault();
          startDrag(e.clientX, e.clientY);
        }}
        onTouchStart={(e) => {
          startDrag(e.touches[0].clientX, e.touches[0].clientY);
        }}
        className="fixed rounded-full btn-gradient flex items-center justify-center z-50 cursor-grab active:cursor-grabbing select-none shadow-2xl shadow-purple-500/50"
        style={{
          right: fabPos.right,
          bottom: fabPos.bottom,
          width: FAB_SIZE,
          height: FAB_SIZE,
          touchAction: "none",
          boxShadow:
            "0 0 0 3px rgba(168,85,247,0.4), 0 8px 32px rgba(168,85,247,0.5)",
        }}
        data-ocid="plans.open_modal_button"
        aria-label="Add Plan"
      >
        <Plus size={28} className="text-white drop-shadow-lg" strokeWidth={3} />
      </button>

      <BottomSheet
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        title="Create a Plan"
      >
        <div className="space-y-3">
          {/* Plan Name */}
          <div>
            <p
              className={`text-xs font-semibold mb-1 block ${
                theme === "dark" ? "text-gray-400" : "text-gray-500"
              }`}
            >
              Plan Name *
            </p>
            <input
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              placeholder="e.g. Cricket at SAC Ground"
              className={inputCls}
              data-ocid="plans.input"
            />
          </div>

          {/* Description */}
          <div>
            <p
              className={`text-xs font-semibold mb-1 block ${
                theme === "dark" ? "text-gray-400" : "text-gray-500"
              }`}
            >
              Description
            </p>
            <textarea
              value={newDesc}
              onChange={(e) => setNewDesc(e.target.value)}
              placeholder="Tell people what this plan is about..."
              rows={2}
              className={`${inputCls} resize-none`}
              data-ocid="plans.textarea"
            />
          </div>

          {/* Date & Time */}
          <div>
            <p
              className={`text-xs font-semibold mb-1 block ${
                theme === "dark" ? "text-gray-400" : "text-gray-500"
              }`}
            >
              Date & Time
            </p>
            <div className="grid grid-cols-2 gap-2">
              <div className="relative">
                <Calendar
                  size={15}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
                />
                <input
                  type="date"
                  value={newDate}
                  onChange={(e) => setNewDate(e.target.value)}
                  className={`${inputCls} pl-9`}
                />
              </div>
              <div className="relative">
                <Clock
                  size={15}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
                />
                <input
                  type="time"
                  value={newTime}
                  onChange={(e) => setNewTime(e.target.value)}
                  className={`${inputCls} pl-9`}
                />
              </div>
            </div>
          </div>

          {/* Location */}
          <div>
            <p
              className={`text-xs font-semibold mb-1 block ${
                theme === "dark" ? "text-gray-400" : "text-gray-500"
              }`}
            >
              Location
            </p>
            <div className="relative">
              <MapPin
                size={15}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
              />
              <input
                value={newLocation}
                onChange={(e) => setNewLocation(e.target.value)}
                placeholder="e.g. SAC Ground, CLT 217"
                className={`${inputCls} pl-9`}
              />
            </div>
          </div>

          {/* Slots */}
          <div>
            <p
              className={`text-xs font-semibold mb-1 block ${
                theme === "dark" ? "text-gray-400" : "text-gray-500"
              }`}
            >
              Number of Slots
            </p>
            <div className="relative">
              <Users
                size={15}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
              />
              <input
                value={newSlots}
                onChange={(e) => setNewSlots(e.target.value)}
                placeholder="Max slots (2–50)"
                type="number"
                min={2}
                max={50}
                className={`${inputCls} pl-9`}
              />
            </div>
          </div>

          {/* Category picker */}
          <div>
            <p
              className={`text-xs font-semibold mb-2 block ${
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
                  onClick={() => setNewCategory(cat)}
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
                    newCategory === cat
                      ? `bg-gradient-to-r ${CATEGORY_COLORS[cat] ?? "from-purple-500 to-pink-500"} text-white shadow-md`
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

          <button
            type="button"
            onClick={createPlan}
            disabled={!newTitle.trim()}
            className="w-full py-3.5 rounded-2xl text-white font-semibold text-sm btn-gradient disabled:opacity-40 mt-1"
            data-ocid="plans.submit_button"
          >
            Create Plan 🎉
          </button>
        </div>
      </BottomSheet>
    </>
  );
}
