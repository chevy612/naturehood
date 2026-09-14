"use client";

import { ReactNode } from "react";
import { twMerge } from "tailwind-merge";

// ─────────────────────────────────────────────
// READABLE TEXT — Optimized paragraph component
// ─────────────────────────────────────────────

interface ReadableTextProps {
  children: ReactNode;
  size?: "sm" | "base" | "lg";
  className?: string;
}

export function ReadableText({
  children,
  size = "base",
  className = "",
}: ReadableTextProps) {
  const sizes = {
    sm: { fontSize: "0.875rem", lineHeight: "1.6", maxWidth: "60ch" },
    base: { fontSize: "1rem", lineHeight: "1.75", maxWidth: "65ch" },
    lg: { fontSize: "1.125rem", lineHeight: "1.75", maxWidth: "70ch" },
  };

  return (
    <p
      className={twMerge("text-black", className)}
      style={{
        fontFamily: "'DM Sans', sans-serif",
        fontSize: sizes[size].fontSize,
        lineHeight: sizes[size].lineHeight,
        maxWidth: sizes[size].maxWidth,
      }}
    >
      {children}
    </p>
  );
}

//Section Header//
interface SectionHeaderProps {
  content: ReactNode;
  className?: string;
  color?: "green" | "gray";
}

export function SectionHeader({ content, className = "" ,color = "gray"}: SectionHeaderProps) {
  return (
    <p
      className={`text-[10px] font-semibold tracking-[0.35em] uppercase mb-4 ${color === "green" ? "text-[#F5F5F5]" : "text-[#6B6870]"} ${className}`}
      style={{ fontFamily: "'DM Sans', sans-serif" }}
    >
      {content}
    </p>
  );
}
