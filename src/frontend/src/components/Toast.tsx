import { AlertCircle, CheckCircle, Info, X } from "lucide-react";
import { useApp } from "../App";

export default function Toast() {
  const { toasts, removeToast } = useApp();

  return (
    <div className="fixed top-4 right-4 z-[999] flex flex-col gap-2 max-w-[320px]">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`toast-enter flex items-center gap-3 px-4 py-3 rounded-2xl shadow-xl text-white text-sm font-medium ${
            t.type === "error"
              ? "bg-red-500"
              : t.type === "info"
                ? "bg-blue-500"
                : "bg-gradient-to-r from-purple-600 to-pink-500"
          }`}
        >
          {t.type === "error" ? (
            <AlertCircle size={16} />
          ) : t.type === "info" ? (
            <Info size={16} />
          ) : (
            <CheckCircle size={16} />
          )}
          <span className="flex-1">{t.message}</span>
          <button
            type="button"
            onClick={() => removeToast(t.id)}
            className="opacity-70 hover:opacity-100"
          >
            <X size={14} />
          </button>
        </div>
      ))}
    </div>
  );
}
