// ─────────────────────────────────────────────
// PILL TAG
// ─────────────────────────────────────────────

type PillVariant = "default" | "active" | "nature" | "accent";

interface PillTagProps {
  label: string;
  variant?: PillVariant;
  onRemove?: () => void;
}

export function PillTag({ label, variant = "default", onRemove }: PillTagProps) {
  const variants: Record<PillVariant, string> = {
    default: "bg-[#F5F5F5] text-[#141115] border border-[#E8E8E8]",
    active: "bg-[#141115] text-[#C8F04D]",
    nature: "bg-[#C8F04D]/15 text-[#141115] border border-[#C8F04D]/30",
    accent: "bg-[#C8F04D] text-[#141115]",
  };
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-3 py-1 text-xs font-semibold uppercase tracking-wider ${variants[variant]}`}
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