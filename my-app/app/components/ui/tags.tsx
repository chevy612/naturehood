import { ReactNode } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

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
    active:       "bg-[#141115] text-[#F5F5F5]",
    nature:       "bg-[#F5F5F5]/15 text-[#141115] border border-[#F5F5F5]/30",
    accent:       "bg-[#F5F5F5] text-[#141115]",
    "ghost-dark":  "bg-white/10 text-white/60 border border-white/15",
    "ghost-light": "bg-[#141115]/8 text-[#141115]/50 border border-[#141115]/12",
    "ghost-green": "bg-[#F5F5F5]/10 text-[#F5F5F5] border border-[#F5F5F5]/25",
  };

  const sizes: Record<PillSize, string> = {
    sm: "px-2 py-0.5 text-[9px] tracking-[0.04em]",
    md: "px-3 py-1 text-xs tracking-[0.04em]",
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-normal uppercase rounded-full ${sizes[size]} ${variants[variant]}`}
      style={{ fontFamily: "'Sk Modernist', sans-serif" }}
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
// ─────────────────────────────────────────────
// TAG — mirrors naturehood-mobile `@/components/ui/tag`
//    Sentence case, DM Sans. Use on platform workout surfaces.
// ─────────────────────────────────────────────

type TagVariant = "default" | "secondary" | "destructive" | "outline" | "blue" | "green" | "red";
type TagSize = "sm" | "md";

interface TagProps {
  children: ReactNode;
  variant?: TagVariant;
  size?: TagSize;
  onClick?: () => void;
  onRemove?: () => void;
  removeLabel?: string;
  className?: string;
}

const TAG_VARIANTS: Record<TagVariant, string> = {
  default:     "bg-[#4F9D69]/15 border-[#4F9D69]/40 text-[#4F9D69]",
  secondary:   "bg-[#2B282C] border-[#3D3940] text-[#847E89]",
  destructive: "bg-[#E3170A]/15 border-[#E3170A]/40 text-[#E3170A]",
  outline:     "bg-transparent border-[#3D3940] text-white",
  blue:        "bg-[#29339B] border-[#29339B] text-white",
  green:       "bg-[#4F9D69] border-[#4F9D69] text-black",
  red:         "bg-[#F05D5E] border-[#F05D5E] text-black",
};

const TAG_SIZES: Record<TagSize, string> = {
  sm: "px-2 py-0.5 text-[10px]",
  md: "px-3 py-1.5 text-xs",
};

export function Tag({ children, variant = "secondary", size = "md", onClick, onRemove, removeLabel, className }: TagProps) {
  const classes = cn(
    "inline-flex shrink-0 items-center justify-center gap-1 rounded-xl border font-medium leading-none",
    TAG_VARIANTS[variant],
    TAG_SIZES[size],
    onClick && "cursor-pointer transition-opacity hover:opacity-80",
    className,
  );
  const style = { fontFamily: "'DM Sans', sans-serif" };

  if (onClick) {
    return (
      <button type="button" onClick={onClick} className={classes} style={style}>
        {children}
      </button>
    );
  }

  return (
    <span className={classes} style={style}>
      {children}
      {onRemove && (
        <button
          type="button"
          onClick={onRemove}
          aria-label={removeLabel ?? "Remove"}
          className="opacity-60 transition-opacity hover:opacity-100"
        >
          <X size={10} />
        </button>
      )}
    </span>
  );
}
