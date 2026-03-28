import { ChevronLeft, Eye, EyeOff } from "lucide-react";
import { useState } from "react";
import { useApp } from "../App";
import { useAuth } from "../context/AuthContext";

const SUGGESTIONS = [
  "aryan_iitm",
  "aryan_s26",
  "aryansharma_cs",
  "aryan2026",
  "aryn_s",
  "arycs26",
];

function Toggle({
  checked,
  onChange,
}: { checked: boolean; onChange: () => void }) {
  return (
    <button
      type="button"
      onClick={onChange}
      className={`relative w-12 h-6 rounded-full toggle-track transition-colors ${
        checked ? "bg-purple-600" : "bg-gray-300 dark:bg-gray-600"
      }`}
    >
      <span
        className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow-md toggle-thumb ${
          checked ? "left-[26px]" : "left-0.5"
        }`}
      />
    </button>
  );
}

export default function Onboarding() {
  const { addToast, theme } = useApp();
  const { signUp } = useAuth();
  const [step, setStep] = useState(0);
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [gender, setGender] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [anonymous, setAnonymous] = useState(false);
  const [privateAcc, setPrivateAcc] = useState(false);
  const [msgRequests, setMsgRequests] = useState(true);
  const [emailError, setEmailError] = useState("");
  const [direction, setDirection] = useState<"forward" | "back">("forward");

  const genders = ["He/Him", "She/Her", "They/Them"];

  const pwStrength = (pw: string) => {
    if (pw.length === 0) return 0;
    let s = 0;
    if (pw.length >= 8) s++;
    if (/[A-Z]/.test(pw)) s++;
    if (/[0-9]/.test(pw)) s++;
    if (/[^A-Za-z0-9]/.test(pw)) s++;
    return s;
  };

  const strength = pwStrength(password);
  const strengthLabel = ["", "Weak", "Fair", "Good", "Strong"];
  const strengthColor = [
    "",
    "bg-red-400",
    "bg-yellow-400",
    "bg-blue-400",
    "bg-green-400",
  ];

  const go = (dir: "forward" | "back") => {
    setDirection(dir);
    if (dir === "forward") {
      if (step === 0) {
        // smail restriction removed
        if (!name.trim()) {
          setEmailError("Please enter your name");
          return;
        }
        if (!gender) {
          setEmailError("Please select a gender");
          return;
        }
        setEmailError("");
      }
      if (step === 1 && !username.trim()) {
        setEmailError("Please enter a username");
        return;
      }
      if (step === 2) {
        if (password.length < 6) {
          setEmailError("Password must be at least 6 characters");
          return;
        }
        if (password !== confirm) {
          setEmailError("Passwords do not match");
          return;
        }
        setEmailError("");
      }
      setStep((s) => s + 1);
    } else {
      setEmailError("");
      setStep((s) => Math.max(0, s - 1));
    }
  };

  const finish = async () => {
    try {
      await signUp(email, password, username, name);
      // AuthSync in App.tsx will handle setting user and navigating to home
      addToast("Welcome to InstiConnect! 🎉", "success");
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Sign up failed";
      addToast(msg.replace("Firebase: ", ""), "error");
    }
  };

  const bg = theme === "dark" ? "bg-[#0D0F14]" : "bg-[#F6F8FB]";
  const card = theme === "dark" ? "bg-[#1A1D27]" : "bg-white";
  const cls = direction === "forward" ? "page-enter" : "page-enter-back";

  return (
    <div
      className={`min-h-screen ${bg} flex flex-col items-center justify-center p-6 relative overflow-hidden`}
    >
      {/* Blobs */}
      <div
        className="absolute -top-20 -left-20 w-72 h-72 rounded-full opacity-20"
        style={{
          background: "radial-gradient(ellipse, #7C3AED, transparent 70%)",
        }}
      />
      <div
        className="absolute -bottom-20 -right-10 w-64 h-64 rounded-full opacity-15"
        style={{
          background: "radial-gradient(ellipse, #D946EF, transparent 70%)",
        }}
      />

      <div
        className={`${cls} ${card} rounded-3xl shadow-2xl w-full max-w-sm p-7 relative z-10`}
      >
        {/* Back button */}
        {step > 0 && (
          <button
            type="button"
            onClick={() => go("back")}
            className="absolute top-5 left-5 p-1 opacity-60 hover:opacity-100 transition-opacity"
          >
            <ChevronLeft size={22} />
          </button>
        )}

        {/* Logo */}
        <div className="text-center mb-6">
          <h1 className="gradient-text text-3xl font-bold mb-1">
            InstiConnect
          </h1>
          <p className="text-sm opacity-60">IIT Madras Community</p>
        </div>

        {/* Progress dots */}
        <div className="flex justify-center gap-2 mb-7">
          {[0, 1, 2, 3].map((i) => (
            <div
              key={i}
              className={`rounded-full transition-all duration-300 ${
                i === step
                  ? "w-6 h-2.5 bg-purple-600"
                  : i < step
                    ? "w-2.5 h-2.5 bg-purple-400"
                    : "w-2.5 h-2.5 bg-gray-300"
              }`}
            />
          ))}
        </div>

        {/* Step 0 */}
        {step === 0 && (
          <div className="space-y-4">
            <div>
              <label
                htmlFor="onboard-email"
                className="text-xs font-semibold opacity-60 uppercase tracking-wider"
              >
                Email
              </label>
              <input
                id="onboard-email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                className={`mt-1.5 w-full px-4 py-3 rounded-2xl border text-sm outline-none transition-all ${
                  theme === "dark"
                    ? "bg-white/5 border-white/10 focus:border-purple-500"
                    : "bg-gray-50 border-gray-200 focus:border-purple-500"
                } focus:ring-2 focus:ring-purple-500/20`}
              />
            </div>
            <div>
              <label
                htmlFor="onboard-name"
                className="text-xs font-semibold opacity-60 uppercase tracking-wider"
              >
                Real Name{" "}
                <span className="normal-case text-purple-400">(private)</span>
              </label>
              <input
                id="onboard-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Full name"
                className={`mt-1.5 w-full px-4 py-3 rounded-2xl border text-sm outline-none transition-all ${
                  theme === "dark"
                    ? "bg-white/5 border-white/10 focus:border-purple-500"
                    : "bg-gray-50 border-gray-200 focus:border-purple-500"
                } focus:ring-2 focus:ring-purple-500/20`}
              />
            </div>
            <div>
              <p className="text-xs font-semibold opacity-60 uppercase tracking-wider">
                Gender
              </p>
              <div className="flex gap-2 mt-1.5 flex-wrap">
                {genders.map((g) => (
                  <button
                    type="button"
                    key={g}
                    onClick={() => setGender(g)}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                      gender === g
                        ? "bg-purple-600 text-white shadow-lg shadow-purple-500/30"
                        : theme === "dark"
                          ? "bg-white/10 text-gray-300"
                          : "bg-gray-100 text-gray-600"
                    }`}
                  >
                    {g}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Step 1 */}
        {step === 1 && (
          <div className="space-y-4">
            <div>
              <label
                htmlFor="onboard-username"
                className="text-xs font-semibold opacity-60 uppercase tracking-wider"
              >
                Username
              </label>
              <input
                id="onboard-username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="choose a username"
                className={`mt-1.5 w-full px-4 py-3 rounded-2xl border text-sm outline-none transition-all ${
                  theme === "dark"
                    ? "bg-white/5 border-white/10 focus:border-purple-500"
                    : "bg-gray-50 border-gray-200 focus:border-purple-500"
                } focus:ring-2 focus:ring-purple-500/20`}
              />
            </div>
            <div>
              <p className="text-xs font-semibold opacity-60 uppercase tracking-wider mb-2">
                Suggestions
              </p>
              <div className="flex flex-wrap gap-2">
                {SUGGESTIONS.map((s) => (
                  <button
                    type="button"
                    key={s}
                    onClick={() => setUsername(s)}
                    className={`px-3 py-1.5 rounded-full text-sm transition-all ${
                      username === s
                        ? "bg-purple-600 text-white"
                        : theme === "dark"
                          ? "bg-white/10 text-gray-300"
                          : "bg-gray-100 text-gray-600"
                    }`}
                  >
                    @{s}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Step 2 */}
        {step === 2 && (
          <div className="space-y-4">
            <div>
              <label
                htmlFor="onboard-password"
                className="text-xs font-semibold opacity-60 uppercase tracking-wider"
              >
                Password
              </label>
              <div className="relative mt-1.5">
                <input
                  id="onboard-password"
                  type={showPw ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Create a password"
                  className={`w-full px-4 py-3 rounded-2xl border text-sm outline-none transition-all pr-12 ${
                    theme === "dark"
                      ? "bg-white/5 border-white/10 focus:border-purple-500"
                      : "bg-gray-50 border-gray-200 focus:border-purple-500"
                  } focus:ring-2 focus:ring-purple-500/20`}
                />
                <button
                  type="button"
                  onClick={() => setShowPw((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 opacity-50 hover:opacity-100"
                >
                  {showPw ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {password && (
                <div className="mt-2">
                  <div className="flex gap-1">
                    {[1, 2, 3, 4].map((i) => (
                      <div
                        key={i}
                        className={`flex-1 h-1.5 rounded-full transition-all ${
                          i <= strength
                            ? strengthColor[strength]
                            : "bg-gray-200"
                        }`}
                      />
                    ))}
                  </div>
                  <p className="text-xs mt-1 opacity-60">
                    {strengthLabel[strength]}
                  </p>
                </div>
              )}
            </div>
            <div>
              <label
                htmlFor="onboard-confirm-password"
                className="text-xs font-semibold opacity-60 uppercase tracking-wider"
              >
                Confirm Password
              </label>
              <div className="relative mt-1.5">
                <input
                  id="onboard-confirm-password"
                  type={showConfirm ? "text" : "password"}
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  placeholder="Confirm your password"
                  className={`w-full px-4 py-3 rounded-2xl border text-sm outline-none transition-all pr-12 ${
                    theme === "dark"
                      ? "bg-white/5 border-white/10 focus:border-purple-500"
                      : "bg-gray-50 border-gray-200 focus:border-purple-500"
                  } focus:ring-2 focus:ring-purple-500/20`}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 opacity-50 hover:opacity-100"
                >
                  {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {confirm && password !== confirm && (
                <p className="text-xs text-red-500 mt-1">
                  Passwords don't match
                </p>
              )}
            </div>
          </div>
        )}

        {/* Step 3 */}
        {step === 3 && (
          <div className="space-y-5">
            <p className="text-sm opacity-60 text-center">
              Customize your experience
            </p>
            {[
              {
                label: "Anonymous Posting",
                sub: "Post without your username",
                val: anonymous,
                set: () => setAnonymous((v) => !v),
              },
              {
                label: "Private Account",
                sub: "Only followers see your posts",
                val: privateAcc,
                set: () => setPrivateAcc((v) => !v),
              },
              {
                label: "Message Requests",
                sub: "Allow DMs from non-followers",
                val: msgRequests,
                set: () => setMsgRequests((v) => !v),
              },
            ].map(({ label, sub, val, set }) => (
              <div key={label} className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-sm">{label}</p>
                  <p className="text-xs opacity-50">{sub}</p>
                </div>
                <Toggle checked={val} onChange={set} />
              </div>
            ))}
          </div>
        )}

        {/* Error */}
        {emailError && (
          <p className="text-red-500 text-xs mt-3 text-center">{emailError}</p>
        )}

        {/* CTA */}
        <button
          type="button"
          onClick={() => {
            if (step === 3) {
              void finish();
            } else {
              go("forward");
            }
          }}
          className="mt-7 w-full py-3.5 rounded-2xl text-white font-semibold text-sm btn-gradient shadow-lg"
        >
          {step === 3 ? "Get Started ✨" : "Continue"}
        </button>

        {step === 0 && (
          <p className="text-center text-xs opacity-50 mt-4">
            By continuing you agree to our Terms & Privacy Policy
          </p>
        )}
      </div>
    </div>
  );
}
