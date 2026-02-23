// ─────────────────────────────────────────────
// PILL TAG
// ─────────────────────────────────────────────

type PillVariant = "default" | "active" | "nature" | "accent" | "ghost-dark" | "ghost-light" | "ghost-green";
type PillSize = "sm" | "md";

interface PillTagProps {
  label: string;
  variant?: PillVariant;
  size?: PillSize;
  onRemove?: () => void;
}

export function PillTag({ label, variant = "default", size = "md", onRemove }: PillTagProps) {
  const variants: Record<PillVariant, string> = {
    default:      "bg-[#F5F5F5] text-[#141115] border border-[#E8E8E8]",
    active:       "bg-[#141115] text-[#C8F04D]",
    nature:       "bg-[#C8F04D]/15 text-[#141115] border border-[#C8F04D]/30",
    accent:       "bg-[#C8F04D] text-[#141115]",
    "ghost-dark":  "bg-white/10 text-white/60 border border-white/15",
    "ghost-light": "bg-[#141115]/8 text-[#141115]/50 border border-[#141115]/12",
    "ghost-green": "bg-[#C8F04D]/10 text-[#C8F04D] border border-[#C8F04D]/25",
  };

  const sizes: Record<PillSize, string> = {
    sm: "px-2 py-0.5 text-[9px] tracking-[0.2em]",
    md: "px-3 py-1 text-xs tracking-wider",
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-semibold uppercase ${sizes[size]} ${variants[variant]}`}
      style={{ fontFamily: "'Inter', sans-serif" }}
    >
      {label}
      {onRemove && (
        <button onClick={onRemove} className="hover:opacity-60 transition-opacity">
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
            <path
              d="M2 2l8 8M10 2L2 10"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
          </svg>
        </button>
      )}
    </span>
  );
}