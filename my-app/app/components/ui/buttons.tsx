"use client";

import { ReactNode, useEffect, useRef, useState, KeyboardEvent } from "react";
import Link from "next/link";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";


// ─────────────────────────────────────────────
// INTERFACES
// ─────────────────────────────────────────────

interface ButtonBaseProps {
  children: ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  fullWidth?: boolean;
  variant?: "white" | "black";
  className?: string;
  type?: "button" | "submit" | "reset";
}

interface ButtonIconProps {
  icon: ReactNode;
  label: string;
  onClick?: () => void;
  variant?: "outline" | "solid" | "ghost";
}

// ─────────────────────────────────────────────
// SHARED ARROW ICON
// ─────────────────────────────────────────────

function Arrow({ dark = false }: { dark?: boolean }) {
  return (
    <svg
      className="w-3.5 h-3.5 transition-transform duration-200 group-hover:translate-x-1"
      viewBox="0 0 14 14"
      fill="none"
    >
      <path
        d="M1 7h12M8 2l5 5-5 5"
        stroke={dark ? "#141115" : "currentColor"}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

// ─────────────────────────────────────────────
// BUTTON — PRIMARY
// ─────────────────────────────────────────────

export function ButtonPrimary({ children, onClick, disabled, fullWidth, variant = "black", className = "", type = "button" }: ButtonBaseProps) {
  const isWhite = variant === "white";

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`
        inline-flex flex-row items-center justify-center gap-2.5
        ${isWhite
          ? "bg-[#F5F5F5] text-black hover:bg-[#F5F5F5]/80 active:bg-[#F5F5F5]/60"
          : "bg-black text-[#F5F5F5] hover:bg-black/60 active:bg-black/30"}
        px-5 py-3 sm:px-6 sm:py-3.5
        text-[16px] leading-[22px] sm:leading-[24px] font-medium
        rounded-full
        transition-colors duration-200 ease-out
        disabled:bg-[#6B6870] disabled:cursor-not-allowed
        ${fullWidth ? "w-full" : ""}
        ${className}
      `}
      style={{ fontFamily: "'DM Sans', sans-serif" }}
    >
      {children}
    </button>
  );
}

// ─────────────────────────────────────────────
// BUTTON — SECONDARY (outline)
// ─────────────────────────────────────────────

export function ButtonSecondary({ children, onClick, disabled, fullWidth, variant = "black", className = "", type = "button" }: ButtonBaseProps) {
  const isWhite = variant === "white";

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`
        group relative inline-flex items-center justify-center gap-2
        border ${isWhite ? "border-[#E8E8E8] text-[#E8E8E8]" : "border-[#141115] text-[#141115]"} bg-transparent
        px-5 py-3 sm:px-6 sm:py-3.5 md:px-8 md:py-4
        text-xs sm:text-sm font-semibold tracking-widest uppercase
        rounded-full overflow-hidden
        transition-all duration-300 ease-out
        ${isWhite ? "hover:bg-[#E8E8E8] hover:text-[#141115]" : "hover:bg-[#141115] hover:text-[#F5F5F5]"}
        active:scale-[0.97]
        disabled:opacity-40 disabled:cursor-not-allowed
        ${fullWidth ? "w-full" : ""}
        ${className}
      `}
      style={{ fontFamily: "'DM Sans', sans-serif" }}
    >
      {children}
      <Arrow />
    </button>
  );
}

// ─────────────────────────────────────────────
// BUTTON — GHOST (minimal)
// ─────────────────────────────────────────────

export function ButtonGhost({ children, onClick, disabled, className = "", type = "button" }: ButtonBaseProps) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`
        group inline-flex items-center gap-2
        text-sm font-semibold tracking-wider uppercase text-[#141115]
        relative pb-0.5
        transition-all duration-200
        hover:text-[#F5F5F5]
        disabled:opacity-40 disabled:cursor-not-allowed
        ${className}
      `}
      style={{ fontFamily: "'DM Sans', sans-serif" }}
    >
      {children}
      <span className="absolute bottom-0 left-0 h-px w-0 bg-[#F5F5F5] transition-all duration-300 group-hover:w-full" />
    </button>
  );
}

// ─────────────────────────────────────────────
// BUTTON — ACCENT (lime pop)
// ─────────────────────────────────────────────

export function ButtonAccent({ children, onClick, disabled, fullWidth, className = "", type = "button" }: ButtonBaseProps) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`
        group relative inline-flex items-center justify-center gap-2
        bg-[#F5F5F5] text-[#141115]
        px-4 py-2.5 sm:px-6 sm:py-3 md:px-8 md:py-4
        text-xs sm:text-sm font-bold tracking-widest uppercase
        rounded-full
        transition-all duration-300 ease-out
        hover:bg-white hover:shadow-lg hover:shadow-[#F5F5F5]/30
        active:scale-[0.97]
        disabled:opacity-40 disabled:cursor-not-allowed
        ${fullWidth ? "w-full" : ""}
        ${className}
      `}
      style={{ fontFamily: "'DM Sans', sans-serif" }}
    >
      {children}
      <Arrow dark />
    </button>
  );
}

// ─────────────────────────────────────────────
// BUTTON — ICON (square icon-only button)
// ─────────────────────────────────────────────

export function ButtonIcon({ icon, onClick, label, variant = "outline" }: ButtonIconProps) {
  const base =
    "inline-flex items-center justify-center w-11 h-11 rounded-lg transition-all duration-200 active:scale-95";
  const variants: Record<NonNullable<ButtonIconProps["variant"]>, string> = {
    outline: "border border-[#141115] text-[#141115] hover:bg-[#141115] hover:text-white",
    solid: "bg-[#141115] text-white hover:bg-[#1E1B1F]",
    ghost: "text-[#141115] hover:bg-[#F5F5F5]",
  };
  return (
    <button onClick={onClick} aria-label={label} className={`${base} ${variants[variant]}`}>
      {icon}
    </button>
  );
}

// ─────────────────────────────────────────────
// BUTTON — TAB (segmented control item)
//    Use: Tab bars, segmented controls
// ─────────────────────────────────────────────

interface ButtonTabProps {
  children: ReactNode;
  active: boolean;
  onClick: () => void;
}

export function ButtonTab({ children, active, onClick }: ButtonTabProps) {
  return (
    <button
      onClick={onClick}
      className={`flex-1 px-4 py-3 text-[10px] sm:px-6 sm:py-4 sm:text-[11px] font-semibold tracking-[0.2em] uppercase rounded-full transition-all duration-200 ${
        active
          ? "bg-[#141115] text-[#F5F5F5]"
          : "bg-white text-[#6B6870] hover:text-[#141115]"
      }`}
      style={{ fontFamily: "'DM Sans', sans-serif" }}
    >
      {children}
    </button>
  );
}

// ─────────────────────────────────────────────
// BUTTON - SUBMIT (for forms)
// ─────────────────────────────────────────────

interface ButtonSubmitProps {
  submitting?: boolean;
  label?: string;
  showArrow?: boolean;
  className?: string;
}

export function ButtonSubmit({ submitting = false, label = "Submit Application", showArrow = false, className = "" }: ButtonSubmitProps) {
  return (
    <button
      type="submit"
      disabled={submitting}
      className={`w-full bg-white text-black px-6 py-3 text-[13px] sm:px-8 sm:py-3.5 sm:text-[14px] font-semibold rounded-full hover:bg-white/90 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 ${className}`}
      style={{ fontFamily: "'DM Sans', sans-serif" }}
    >
      {submitting ? "Submitting..." : label}
      {!submitting && showArrow && <Arrow dark />}
    </button>
  );
}

// ─────────────────────────────────────────────
// BUTTON - SMALL (compact actions inside list rows)
// ─────────────────────────────────────────────

interface ButtonSmallProps {
  children: ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  variant?: "accent" | "outline" | "danger";
  type?: "button" | "submit";
  ariaLabel?: string;
}

export function ButtonSmall({ children, onClick, disabled, variant = "outline", type = "button", ariaLabel }: ButtonSmallProps) {
  const variants = {
    accent: "bg-[#F5F5F5] text-[#141115] hover:bg-white",
    outline: "border border-[#3A373C] text-white hover:bg-white/5",
    danger: "border border-[#FF4D4D]/40 text-[#FF4D4D] hover:bg-[#FF4D4D]/10",
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      aria-label={ariaLabel}
      className={`inline-flex items-center justify-center gap-1.5 rounded-full px-3.5 py-1.5 text-[11px] font-semibold uppercase tracking-[0.12em] transition-colors duration-150 disabled:cursor-not-allowed disabled:opacity-40 ${variants[variant]}`}
      style={{ fontFamily: "'DM Sans', sans-serif" }}
    >
      {children}
    </button>
  );
}

// ─────────────────────────────────────────────
// BUTTON — mirrors naturehood-mobile `@/components/ui/button`
//    Sentence case, DM Sans 14px medium. Default for platform pages.
//    Pass `href` to render a Next.js Link with the same styling.
// ─────────────────────────────────────────────

type ButtonVariant = "primary" | "outline" | "secondary" | "destructive" | "ghost" | "link";
type ButtonSize = "sm" | "default" | "lg" | "xl" | "icon" | "icon-sm";

interface ButtonProps {
  children: ReactNode;
  variant?: ButtonVariant;
  size?: ButtonSize;
  href?: string;
  onClick?: () => void;
  disabled?: boolean;
  fullWidth?: boolean;
  type?: "button" | "submit" | "reset";
  ariaLabel?: string;
  className?: string;
}

const BUTTON_VARIANTS: Record<ButtonVariant, string> = {
  primary:     "bg-[#F5F5F5] text-[#141115] hover:bg-[#F5F5F5]/90 active:bg-[#F5F5F5]/90",
  outline:     "border border-[#F5F5F5] bg-transparent text-[#F5F5F5] hover:bg-[#F5F5F5]/10 active:border-[#F5F5F5]/70",
  secondary:   "rounded-lg bg-[#2B282C] text-white hover:bg-[#2B282C]/80",
  destructive: "bg-[#E3170A]/60 text-white hover:bg-[#E3170A]/90",
  ghost:       "text-[#847E89] hover:bg-[#2B282C] hover:text-white active:bg-[#4F9D69]/50",
  link:        "text-[#F5F5F5] underline-offset-4 hover:underline",
};

const BUTTON_SIZES: Record<ButtonSize, string> = {
  sm:        "h-8 gap-1.5 px-3",
  default:   "h-9 px-4 py-2",
  lg:        "h-10 px-6 text-base",
  xl:        "h-[52px] px-5 text-lg",
  icon:      "h-9 w-9",
  "icon-sm": "h-7 w-7",
};

export function Button({
  children,
  variant = "primary",
  size = "default",
  href,
  onClick,
  disabled,
  fullWidth,
  type = "button",
  ariaLabel,
  className,
}: ButtonProps) {
  const classes = cn(
    "inline-flex shrink-0 items-center justify-center gap-2 whitespace-nowrap rounded-full text-sm font-medium transition-colors duration-150",
    "disabled:pointer-events-none disabled:opacity-50 [&_svg]:shrink-0",
    BUTTON_VARIANTS[variant],
    BUTTON_SIZES[size],
    variant === "link" && "h-auto px-0",
    fullWidth && "w-full",
    className,
  );
  const style = { fontFamily: "'DM Sans', sans-serif" };

  if (href) {
    return (
      <Link href={href} aria-label={ariaLabel} className={classes} style={style}>
        {children}
      </Link>
    );
  }

  return (
    <button type={type} onClick={onClick} disabled={disabled} aria-label={ariaLabel} className={classes} style={style}>
      {children}
    </button>
  );
}

// ─────────────────────────────────────────────
// BUTTON — TOGGLE (on/off flag, mirrors mobile `Toggle` outline sm)
//    Use: per-row flags (WU / F / D, PB / SB, OK / DNF)
// ─────────────────────────────────────────────

interface ButtonToggleProps {
  children: ReactNode;
  pressed: boolean;
  onPressedChange: (pressed: boolean) => void;
  tone?: "default" | "destructive";
  ariaLabel?: string;
}

export function ButtonToggle({ children, pressed, onPressedChange, tone = "default", ariaLabel }: ButtonToggleProps) {
  return (
    <button
      type="button"
      aria-pressed={pressed}
      aria-label={ariaLabel}
      onClick={() => onPressedChange(!pressed)}
      className={cn(
        "inline-flex h-7 min-w-7 shrink-0 items-center justify-center rounded-sm border px-2 text-[10px] font-medium uppercase transition-colors duration-150",
        !pressed && "border-[#3D3940] text-[#847E89] hover:bg-[#2B282C]",
        pressed && tone === "default" && "border-[#F5F5F5] bg-[#F5F5F5] text-[#141115]",
        pressed && tone === "destructive" && "border-[#E3170A] bg-[#E3170A] text-white",
      )}
      style={{ fontFamily: "'DM Sans', sans-serif" }}
    >
      {children}
    </button>
  );
}

// ─────────────────────────────────────────────
// BUTTON — SEGMENTED (single-select, mirrors mobile `TabsList variant="primary"`)
//    Use: picking one value from a short list (session type, intensity…)
//    `allowDeselect` lets a second click clear the value.
// ─────────────────────────────────────────────

interface SegmentOption<T extends string> {
  value: T;
  label: ReactNode;
}

interface ButtonSegmentedProps<T extends string> {
  options: readonly SegmentOption<T>[];
  value: T | null | undefined;
  onChange: (value: T | null) => void;
  allowDeselect?: boolean;
  size?: "sm" | "md";
  ariaLabel?: string;
}

export function ButtonSegmented<T extends string>({
  options,
  value,
  onChange,
  allowDeselect = false,
  size = "md",
  ariaLabel,
}: ButtonSegmentedProps<T>) {
  return (
    <div
      role="radiogroup"
      aria-label={ariaLabel}
      className="inline-flex max-w-full flex-wrap items-center gap-0.5 rounded-lg border border-[#3D3940] p-[3px]"
    >
      {options.map((opt) => {
        const active = opt.value === value;
        return (
          <button
            key={opt.value}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => onChange(active && allowDeselect ? null : opt.value)}
            className={cn(
              "inline-flex items-center justify-center whitespace-nowrap rounded-md font-medium transition-colors duration-150",
              size === "md" ? "h-8 px-3 text-sm" : "h-7 px-2 text-xs",
              active ? "bg-[#F5F5F5] text-[#141115]" : "text-[#847E89] hover:text-white",
            )}
            style={{ fontFamily: "'DM Sans', sans-serif" }}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}

// ─────────────────────────────────────────────
// BUTTON — PROPERTY SELECT (Linear-style property chip)
//    Use: compact metadata labels that open a picker
//    (session type, intensity, block type, status…)
//    Shows the selected option's icon + label; empty state shows `placeholder`.
// ─────────────────────────────────────────────

interface PropertyOption<T extends string> {
  value: T;
  label: string;
  icon?: ReactNode;
}

interface ButtonPropertySelectProps<T extends string> {
  label: string;
  options: readonly PropertyOption<T>[];
  value: T | null | undefined;
  onChange: (value: T | null) => void;
  placeholder?: string;
  icon?: ReactNode;
  allowClear?: boolean;
  align?: "left" | "right";
  className?: string;
}

export function ButtonPropertySelect<T extends string>({
  label,
  options,
  value,
  onChange,
  placeholder,
  icon,
  allowClear = false,
  align = "left",
  className,
}: ButtonPropertySelectProps<T>) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const selected = options.find((o) => o.value === value);

  useEffect(() => {
    if (!open) return;
    const onPointer = (e: PointerEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("pointerdown", onPointer);
    // Focus the selected (or first) item when the menu opens
    const items = menuRef.current?.querySelectorAll<HTMLButtonElement>("[role=option]");
    const idx = Math.max(0, options.findIndex((o) => o.value === value));
    items?.[idx]?.focus();
    return () => document.removeEventListener("pointerdown", onPointer);
  }, [open, options, value]);

  const onMenuKey = (e: KeyboardEvent<HTMLDivElement>) => {
    const items = Array.from(menuRef.current?.querySelectorAll<HTMLButtonElement>("[role=option]") ?? []);
    const i = items.indexOf(document.activeElement as HTMLButtonElement);
    if (e.key === "ArrowDown") { e.preventDefault(); items[(i + 1) % items.length]?.focus(); }
    if (e.key === "ArrowUp") { e.preventDefault(); items[(i - 1 + items.length) % items.length]?.focus(); }
    if (e.key === "Escape" || e.key === "Tab") setOpen(false);
  };

  const pick = (v: T | null) => {
    onChange(v);
    setOpen(false);
  };

  return (
    <div ref={rootRef} className={cn("relative inline-flex", className)}>
      <button
        type="button"
        title={label}
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
        className={cn(
          "inline-flex h-7 items-center gap-1.5 rounded-md border border-[#3D3940] px-2 text-[12px] font-medium transition-colors duration-150",
          "hover:border-[#4A464D] hover:bg-[#2B282C] [&_svg]:size-3.5 [&_svg]:shrink-0",
          open && "border-[#4A464D] bg-[#2B282C]",
          selected ? "text-[#E8E8E8]" : "text-[#847E89]",
        )}
        style={{ fontFamily: "'DM Sans', sans-serif" }}
      >
        <span className={selected ? "text-[#A09EA3]" : "text-[#6B6870]"}>{selected?.icon ?? icon}</span>
        {selected?.label ?? placeholder ?? label}
      </button>

      {open && (
        <div
          ref={menuRef}
          role="listbox"
          aria-label={label}
          onKeyDown={onMenuKey}
          className={cn(
            "absolute top-full z-30 mt-1 min-w-[200px] rounded-lg border border-[#3D3940] bg-[#1E1B1F] p-1 shadow-xl shadow-black/50",
            align === "right" ? "right-0" : "left-0",
          )}
          style={{ fontFamily: "'DM Sans', sans-serif" }}
        >
          <p
            className="px-2 pb-1 pt-1.5 text-[11px] font-normal uppercase tracking-[0.04em] text-[#6B6870]"
            style={{ fontFamily: "'Sk Modernist', sans-serif" }}
          >
            {label}
          </p>
          {options.map((opt) => {
            const active = opt.value === value;
            return (
              <button
                key={opt.value}
                type="button"
                role="option"
                aria-selected={active}
                onClick={() => pick(opt.value)}
                className="flex h-8 w-full items-center gap-2 rounded-md px-2 text-left text-[13px] text-[#E8E8E8] outline-none hover:bg-[#2B282C] focus:bg-[#2B282C] [&_svg]:size-3.5 [&_svg]:shrink-0"
              >
                <span className="text-[#A09EA3]">{opt.icon}</span>
                <span className="flex-1">{opt.label}</span>
                {active && <Check className="text-[#E8E8E8]" />}
              </button>
            );
          })}
          {allowClear && value != null && (
            <>
              <div className="my-1 h-px bg-[#3D3940]" />
              <button
                type="button"
                role="option"
                aria-selected={false}
                onClick={() => pick(null)}
                className="flex h-8 w-full items-center rounded-md px-2 text-left text-[13px] text-[#847E89] outline-none hover:bg-[#2B282C] focus:bg-[#2B282C]"
              >
                Clear
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}
