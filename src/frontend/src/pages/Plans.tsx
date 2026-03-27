import { Clock, MapPin, Plus, Users } from "lucide-react";
import { useState } from "react";
import { useApp } from "../App";
import BottomSheet from "../components/BottomSheet";
import { currentUser, plans as mockPlans, mockUsers } from "../mockData";
import type { Plan } from "../mockData";

const CATEGORIES = [
  "All",
  "Sports",
  "Study",
  "Food",
  "Music",
  "Tech",
  "Social",
];
const PLAN_CATEGORIES = ["Sports", "Study", "Food", "Music", "Tech", "Social"];
const CATEGORY_COLORS: Record<string, string> = {
  Sports: "from-orange-400 to-red-500",
  Study: "from-blue-400 to-indigo-500",
  Food: "from-yellow-400 to-orange-500",
  Music: "from-pink-400 to-purple-500",
  Tech: "from-cyan-400 to-blue-500",
  Social: "from-green-400 to-teal-500",
  All: "from-purple-500 to-pink-500",
};

export default function Plans() {
  const { theme, addToast, navigate } = useApp();
  const [plans, setPlans] = useState<Plan[]>(mockPlans);
  const [selected, setSelected] = useState("All");
  const [createOpen, setCreateOpen] = useState(false);

  // Create form state
  const [newTitle, setNewTitle] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [newLocation, setNewLocation] = useState("");
  const [newSlots, setNewSlots] = useState("");
  const [newCategory, setNewCategory] = useState("Social");

  const filtered =
    selected === "All" ? plans : plans.filter((p) => p.category === selected);

  const joinPlan = (id: string) => {
    const plan = plans.find((p) => p.id === id);
    if (!plan) return;

    const newJoined = plan.isJoined ? plan.joined - 1 : plan.joined + 1;
    const willBeFull = !plan.isJoined && newJoined >= plan.slots;

    setPlans((ps) =>
      ps.map((p) =>
        p.id === id ? { ...p, isJoined: !p.isJoined, joined: newJoined } : p,
      ),
    );

    if (!plan.isJoined) {
      addToast(`Joined ${plan.title} group chat! 🎉`, "success");
      navigate("chat-screen", {
        chatId: `plan-${plan.id}`,
        chatName: plan.title,
        isGroup: true,
      });

      if (willBeFull) {
        setTimeout(() => {
          setPlans((ps) => ps.filter((p) => p.id !== id));
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

  const createPlan = () => {
    if (!newTitle.trim()) return;
    const slots = Math.min(50, Math.max(2, Number(newSlots) || 10));
    const newPlan: Plan = {
      id: Math.random().toString(36).slice(2),
      title: newTitle.trim(),
      description: newDesc.trim() || "No description provided.",
      category: newCategory,
      tags: [],
      slots,
      joined: 1,
      isJoined: true,
      organizer: currentUser.username,
      time: "Today",
      location: newLocation.trim() || "TBD",
    };
    setPlans((ps) => [newPlan, ...ps]);
    setNewTitle("");
    setNewDesc("");
    setNewLocation("");
    setNewSlots("");
    setNewCategory("Social");
    setCreateOpen(false);
    addToast("Plan created! 🎉", "success");
  };

  const openOrganizerProfile = (organizer: string) => {
    if (organizer === "aryan_s") {
      navigate("profile");
    } else {
      const user = mockUsers.find((u) => u.username === organizer);
      if (user) navigate("other-profile", { userId: user.id });
    }
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
        <h2 className="text-xl font-bold mb-4">Campus Plans</h2>

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
        <div className="space-y-4 mt-2 pb-24">
          {filtered.map((plan, idx) => (
            <div
              key={plan.id}
              className={`${surface} rounded-2xl overflow-hidden shadow-md card-hover`}
              data-ocid={`plans.item.${idx + 1}`}
            >
              {/* Color header */}
              <div
                className={`bg-gradient-to-r ${CATEGORY_COLORS[plan.category] || CATEGORY_COLORS.All} h-2`}
              />

              <div className="p-4">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span
                        className={`text-xs px-2 py-0.5 rounded-full bg-gradient-to-r ${CATEGORY_COLORS[plan.category]} text-white font-medium`}
                      >
                        {plan.category}
                      </span>
                      {plan.joined >= plan.slots && (
                        <span className="text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded-full font-medium">
                          Full
                        </span>
                      )}
                    </div>
                    <h3 className="font-bold text-base">{plan.title}</h3>
                    <p className={`text-sm ${text2} mt-1`}>
                      {plan.description}
                    </p>
                  </div>
                </div>

                {/* Info row */}
                <div
                  className={`flex items-center gap-4 mt-3 text-xs ${text2}`}
                >
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
                      className={`h-2 rounded-full transition-all bg-gradient-to-r ${CATEGORY_COLORS[plan.category]}`}
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
                  className={`flex items-center gap-1.5 mt-3 cursor-pointer ${text2} hover:opacity-80 transition-opacity`}
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

      {/* FAB — fixed outside scroll container, always visible */}
      <button
        type="button"
        onClick={() => setCreateOpen(true)}
        className="fixed bottom-24 right-4 w-14 h-14 rounded-full btn-gradient shadow-2xl flex items-center justify-center z-40 transition-transform active:scale-90"
        style={{ boxShadow: "0 8px 32px rgba(124,58,237,0.5)" }}
        data-ocid="plans.open_modal_button"
      >
        <Plus size={26} className="text-white" />
      </button>

      <BottomSheet
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        title="Create a Plan"
      >
        <div className="space-y-3">
          {/* Title */}
          <input
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            placeholder="Plan title"
            className={inputCls}
            data-ocid="plans.input"
          />

          {/* Description */}
          <textarea
            value={newDesc}
            onChange={(e) => setNewDesc(e.target.value)}
            placeholder="Description..."
            rows={2}
            className={`${inputCls} resize-none`}
            data-ocid="plans.textarea"
          />

          {/* Location */}
          <div className="relative">
            <MapPin
              size={15}
              className={`absolute left-3.5 top-1/2 -translate-y-1/2 ${
                theme === "dark" ? "text-gray-400" : "text-gray-400"
              }`}
            />
            <input
              value={newLocation}
              onChange={(e) => setNewLocation(e.target.value)}
              placeholder="Location (e.g. SAC Ground, CLT 217)"
              className={`${inputCls} pl-9`}
            />
          </div>

          {/* Slots */}
          <div className="relative">
            <Users
              size={15}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
            />
            <input
              value={newSlots}
              onChange={(e) => setNewSlots(e.target.value)}
              placeholder="Max slots (e.g. 10)"
              type="number"
              min={2}
              max={50}
              className={`${inputCls} pl-9`}
            />
          </div>

          {/* Category picker */}
          <div>
            <p
              className={`text-xs mb-2 font-medium ${theme === "dark" ? "text-gray-400" : "text-gray-500"}`}
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

          <button
            type="button"
            onClick={createPlan}
            disabled={!newTitle.trim()}
            className="w-full py-3.5 rounded-2xl text-white font-semibold text-sm btn-gradient disabled:opacity-40"
            data-ocid="plans.submit_button"
          >
            Create Plan
          </button>
        </div>
      </BottomSheet>
    </>
  );
}
