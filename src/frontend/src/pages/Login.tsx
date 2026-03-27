import { Eye, EyeOff, Sparkles } from "lucide-react";
import { useState } from "react";
import { useApp } from "../App";
import { useAuth } from "../context/AuthContext";
import { currentUser as mockUser } from "../mockData";
import { isFirebaseConfigured } from "../utils/firebase";

export default function Login() {
  const { setUser, navigate, addToast, theme } = useApp();
  const { signIn: firebaseSignIn, signInWithGoogle } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const signIn = async () => {
    setError("");
    if (!email.trim() || !password.trim()) {
      setError("Please fill in all fields.");
      return;
    }
    setLoading(true);
    if (isFirebaseConfigured()) {
      try {
        await firebaseSignIn(email, password);
        setUser(mockUser);
        navigate("home");
      } catch (e: unknown) {
        const msg =
          e instanceof Error ? e.message : "Sign in failed. Try again.";
        setError(msg.replace("Firebase: ", "").replace(/ \(auth\/.*\)\.?/, ""));
        addToast("Sign in failed", "error");
      } finally {
        setLoading(false);
      }
    } else {
      // Mock sign-in when Firebase not configured
      setTimeout(() => {
        setLoading(false);
        setUser(mockUser);
        navigate("home");
      }, 900);
    }
  };

  const handleGoogle = async () => {
    setError("");
    setGoogleLoading(true);
    if (isFirebaseConfigured()) {
      try {
        await signInWithGoogle();
        setUser(mockUser);
        navigate("home");
      } catch (e: unknown) {
        const msg = e instanceof Error ? e.message : "Google sign in failed.";
        addToast(msg, "error");
      } finally {
        setGoogleLoading(false);
      }
    } else {
      setTimeout(() => {
        setGoogleLoading(false);
        setUser(mockUser);
        navigate("home");
      }, 900);
    }
  };

  const inputCls = `w-full px-4 py-3.5 rounded-2xl text-sm outline-none transition-all ${
    theme === "dark"
      ? "bg-white/10 border border-white/15 text-white placeholder:text-gray-500 focus:border-purple-400"
      : "bg-gray-50 border border-gray-200 text-gray-900 placeholder:text-gray-400 focus:border-purple-400"
  }`;

  return (
    <div
      className={`min-h-screen flex flex-col items-center justify-center px-6 relative ${
        theme === "dark" ? "bg-[#0D0F14]" : "bg-[#F6F8FB]"
      }`}
    >
      {/* Background blobs */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div
          className="absolute -top-32 -left-32 w-96 h-96 rounded-full opacity-20"
          style={{
            background: "radial-gradient(ellipse, #7C3AED 0%, transparent 70%)",
          }}
        />
        <div
          className="absolute -bottom-24 -right-24 w-80 h-80 rounded-full opacity-15"
          style={{
            background: "radial-gradient(ellipse, #D946EF 0%, transparent 70%)",
          }}
        />
        <div
          className="absolute top-1/2 left-1/2 w-64 h-64 rounded-full opacity-10"
          style={{
            background: "radial-gradient(ellipse, #3B82F6 0%, transparent 70%)",
            transform: "translate(-50%,-50%)",
          }}
        />
      </div>

      <div className="relative z-10 w-full max-w-[380px] flex flex-col items-center">
        {/* Logo area */}
        <div className="mb-8 text-center">
          <h1
            className="gradient-text text-5xl font-black tracking-tight mb-2"
            style={{ fontFamily: "Outfit, sans-serif" }}
          >
            InstiConnect
          </h1>
          <div className="flex items-center justify-center gap-1.5 mt-2">
            <Sparkles size={13} className="text-purple-400" />
            <span
              className={`text-xs font-medium tracking-wide ${
                theme === "dark" ? "text-gray-400" : "text-gray-500"
              }`}
            >
              Powered by{" "}
              <span className="text-purple-500 font-semibold">IITM Bazaar</span>
            </span>
            <Sparkles size={13} className="text-pink-400" />
          </div>
        </div>

        {/* Glass card */}
        <div
          className={`w-full rounded-3xl p-6 shadow-2xl ${
            theme === "dark" ? "glass-dark" : "glass"
          }`}
          data-ocid="login.card"
        >
          <h2 className="text-xl font-bold mb-1">Welcome back 👋</h2>
          <p
            className={`text-sm mb-6 ${
              theme === "dark" ? "text-gray-400" : "text-gray-500"
            }`}
          >
            Sign in to your campus community
          </p>

          <div className="space-y-3">
            {/* Email */}
            <div>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@smail.iitm.ac.in"
                className={inputCls}
                onKeyDown={(e) => e.key === "Enter" && signIn()}
                data-ocid="login.input"
              />
            </div>

            {/* Password */}
            <div className="relative">
              <input
                type={showPw ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                className={`${inputCls} pr-12`}
                onKeyDown={(e) => e.key === "Enter" && signIn()}
                data-ocid="login.input"
              />
              <button
                type="button"
                onClick={() => setShowPw((v) => !v)}
                className={`absolute right-3.5 top-1/2 -translate-y-1/2 ${
                  theme === "dark" ? "text-gray-400" : "text-gray-500"
                }`}
              >
                {showPw ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>

            {error && (
              <p
                className="text-xs text-red-500 font-medium"
                data-ocid="login.error_state"
              >
                {error}
              </p>
            )}

            {/* Sign in button */}
            <button
              type="button"
              onClick={signIn}
              disabled={loading}
              className="w-full py-3.5 rounded-2xl text-white font-semibold text-sm btn-gradient transition-all active:scale-[0.98] disabled:opacity-70 mt-2"
              data-ocid="login.submit_button"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg
                    className="animate-spin h-4 w-4"
                    viewBox="0 0 24 24"
                    fill="none"
                    aria-hidden="true"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                    />
                  </svg>
                  Signing in...
                </span>
              ) : (
                "Sign In"
              )}
            </button>

            {/* Google Sign In */}
            <button
              type="button"
              onClick={handleGoogle}
              disabled={googleLoading}
              className={`w-full py-3 rounded-2xl text-sm font-semibold flex items-center justify-center gap-2 transition-all active:scale-[0.98] disabled:opacity-70 ${
                theme === "dark"
                  ? "bg-white/10 border border-white/15 text-white"
                  : "bg-white border border-gray-200 text-gray-700"
              }`}
              data-ocid="login.secondary_button"
            >
              {googleLoading ? (
                <svg
                  className="animate-spin h-4 w-4"
                  viewBox="0 0 24 24"
                  fill="none"
                  aria-hidden="true"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                  />
                </svg>
              ) : (
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 18 18"
                  aria-hidden="true"
                >
                  <path
                    d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844a4.14 4.14 0 01-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z"
                    fill="#4285F4"
                  />
                  <path
                    d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 009 18z"
                    fill="#34A853"
                  />
                  <path
                    d="M3.964 10.71A5.41 5.41 0 013.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 000 9c0 1.452.348 2.827.957 4.042l3.007-2.332z"
                    fill="#FBBC05"
                  />
                  <path
                    d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 00.957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z"
                    fill="#EA4335"
                  />
                </svg>
              )}
              Continue with Google
            </button>
          </div>

          {/* Divider */}
          <div className="flex items-center gap-3 my-5">
            <div
              className={`flex-1 h-px ${
                theme === "dark" ? "bg-white/10" : "bg-gray-200"
              }`}
            />
            <span
              className={`text-xs ${
                theme === "dark" ? "text-gray-500" : "text-gray-400"
              }`}
            >
              or
            </span>
            <div
              className={`flex-1 h-px ${
                theme === "dark" ? "bg-white/10" : "bg-gray-200"
              }`}
            />
          </div>

          {/* Sign up link */}
          <p
            className={`text-center text-sm ${
              theme === "dark" ? "text-gray-400" : "text-gray-500"
            }`}
          >
            New to InstiConnect?{" "}
            <button
              type="button"
              onClick={() => navigate("onboarding")}
              className="text-purple-500 font-semibold hover:underline"
              data-ocid="login.link"
            >
              Sign up
            </button>
          </p>
        </div>

        {/* Footer badge */}
        <div className="mt-6 flex items-center gap-2">
          <div
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium ${
              theme === "dark"
                ? "bg-white/5 border border-white/10 text-gray-400"
                : "bg-white/80 border border-gray-200 text-gray-500"
            }`}
          >
            <span>🏛️</span>
            <span>IIT Madras Campus Network</span>
          </div>
        </div>
      </div>
    </div>
  );
}
