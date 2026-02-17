// ─────────────────────────────────────────────
// SUCCESS MODAL
// Use: Post-action confirmation popup with close icon
// ─────────────────────────────────────────────

interface SuccessModalProps {
  title?: string;
  message?: string;
  onClose: () => void;
  variant?: "dark" | "light";
}

export function SuccessModal({
  title = "Thank you!",
  message = "We've received your submission.",
  onClose,
  variant = "dark",
}: SuccessModalProps) {
  const isDark = variant === "dark";

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center px-4"
      onClick={onClose}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

      {/* Modal */}
      <div
        className={`relative w-full max-w-md p-10 ${isDark ? "bg-[#1E1B1F]" : "bg-white"}`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className={`absolute top-4 right-4 w-8 h-8 flex items-center justify-center transition-opacity duration-200 hover:opacity-70 ${isDark ? "text-[#6B6870]" : "text-[#6B6870]"}`}
          aria-label="Close"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path
              d="M3 3l10 10M13 3L3 13"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
          </svg>
        </button>

        {/* Content */}
        <div className="text-center">
          {/* Checkmark circle */}
          <div
            className={`w-16 h-16 mx-auto mb-6 rounded-full flex items-center justify-center ${isDark ? "bg-[#C8F04D]" : "bg-[#141115]"}`}
          >
            <svg width="32" height="32" viewBox="0 0 40 40" fill="none">
              <path
                d="M8 20l8 8L32 12"
                stroke={isDark ? "#141115" : "#C8F04D"}
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>

          <h3
            className={`text-[24px] font-bold mb-3 ${isDark ? "text-white" : "text-[#141115]"}`}
            style={{ fontFamily: "'Inter', sans-serif" }}
          >
            {title}
          </h3>
          <p
            className="text-[14px] text-[#6B6870] leading-relaxed"
            style={{ fontFamily: "'DM Sans', sans-serif" }}
          >
            {message}
          </p>
        </div>
      </div>
    </div>
  );
}