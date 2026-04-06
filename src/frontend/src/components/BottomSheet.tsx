import { X } from "lucide-react";
import { useEffect } from "react";
import { useApp } from "../App";

interface Props {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
}

export default function BottomSheet({ open, onClose, title, children }: Props) {
  const { theme } = useApp();

  // Prevent body scroll when sheet is open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  if (!open) return null;

  // Overlay starts at top-16 (64px) so the fixed InstiConnect TopBar (h-14 = 56px)
  // stays fully visible. z-[60] ensures this sits above all sticky page headers (z-20).
  return (
    <div className="fixed inset-x-0 bottom-0 top-16 z-[60] flex items-end justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
        onKeyDown={(e) => e.key === "Escape" && onClose()}
        role="button"
        tabIndex={0}
        aria-label="Close"
      />
      {/* Sheet panel */}
      <div
        className={`sheet-enter relative w-full max-w-[430px] rounded-t-3xl pb-safe ${
          theme === "dark" ? "bg-[#1A1D27]" : "bg-white"
        } shadow-2xl max-h-[88vh] overflow-y-auto`}
      >
        {/* Drag handle */}
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 rounded-full bg-gray-300 dark:bg-gray-600" />
        </div>
        {title && (
          <div className="flex items-center justify-between px-5 py-3">
            <h3 className="font-bold text-lg">{title}</h3>
            <button
              type="button"
              onClick={onClose}
              className="p-1 rounded-full opacity-60 hover:opacity-100 transition-opacity"
            >
              <X size={20} />
            </button>
          </div>
        )}
        <div className="px-5 pb-8">{children}</div>
      </div>
    </div>
  );
}
