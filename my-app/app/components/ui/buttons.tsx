"use client";

import { ReactNode } from "react";


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

export function ButtonPrimary({ children, onClick, disabled, fullWidth, className = "", type = "button" }: ButtonBaseProps) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`
        group relative inline-flex items-center justify-center gap-2
        bg-[#141115] text-[#C8F04D]
        px-5 py-3 sm:px-6 sm:py-3.5 md:px-8 md:py-4
        text-xs sm:text-sm font-semibold tracking-widest uppercase
        overflow-hidden
        transition-all duration-300 ease-out
        hover:bg-[#1E1B1F]
        active:scale-[0.97]
        disabled:opacity-40 disabled:cursor-not-allowed
        ${fullWidth ? "w-full" : ""}
        ${className}
      `}
      style={{ fontFamily: "'Inter', sans-serif" }}
    >
      <span className="absolute bottom-0 left-0 h-[2px] w-0 bg-[#C8F04D] transition-all duration-500 group-hover:w-full" />
      {children}
      <Arrow />
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
        overflow-hidden
        transition-all duration-300 ease-out
        ${isWhite ? "hover:bg-[#E8E8E8] hover:text-[#141115]" : "hover:bg-[#141115] hover:text-[#C8F04D]"}
        active:scale-[0.97]
        disabled:opacity-40 disabled:cursor-not-allowed
        ${fullWidth ? "w-full" : ""}
        ${className}
      `}
      style={{ fontFamily: "'Inter', sans-serif" }}
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
        hover:text-[#C8F04D]
        disabled:opacity-40 disabled:cursor-not-allowed
        ${className}
      `}
      style={{ fontFamily: "'Inter', sans-serif" }}
    >
      {children}
      <span className="absolute bottom-0 left-0 h-px w-0 bg-[#C8F04D] transition-all duration-300 group-hover:w-full" />
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
        bg-[#C8F04D] text-[#141115]
        px-4 py-2.5 sm:px-6 sm:py-3 md:px-8 md:py-4
        text-xs sm:text-sm font-bold tracking-widest uppercase
        transition-all duration-300 ease-out
        hover:bg-[#b8e038] hover:shadow-lg hover:shadow-[#C8F04D]/30
        active:scale-[0.97]
        disabled:opacity-40 disabled:cursor-not-allowed
        ${fullWidth ? "w-full" : ""}
        ${className}
      `}
      style={{ fontFamily: "'Inter', sans-serif" }}
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
    "inline-flex items-center justify-center w-11 h-11 transition-all duration-200 active:scale-95";
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
