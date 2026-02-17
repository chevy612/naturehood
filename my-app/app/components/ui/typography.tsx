"use client";

import { ReactNode } from "react";

// ─────────────────────────────────────────────
// PROSE — Long-form content with auto spacing
// ─────────────────────────────────────────────

interface ProseProps {
  children: ReactNode;
  className?: string;
  maxWidth?: "sm" | "md" | "lg" | "xl" | "readable";
}

export function Prose({ children, className = "", maxWidth = "readable" }: ProseProps) {
  const maxWidthClasses = {
    sm: "max-w-[45ch]",
    md: "max-w-[65ch]",
    lg: "max-w-[75ch]",
    xl: "max-w-[85ch]",
    readable: "max-w-[65ch]",
  };

  return (
    <div
      className={`prose-content ${maxWidthClasses[maxWidth]} ${className}`}
      style={{ fontFamily: "'DM Sans', sans-serif" }}
    >
      <style jsx>{`
        .prose-content {
          font-size: 1rem;
          line-height: 1.75;
          color: #6B6870;
        }
        .prose-content > * + * {
          margin-top: 1rem;
        }
        .prose-content h2 {
          margin-top: 2rem;
          margin-bottom: 1rem;
          color: #141115;
        }
        .prose-content h3 {
          margin-top: 1.5rem;
          margin-bottom: 0.75rem;
          color: #141115;
        }
        .prose-content p {
          margin-bottom: 1rem;
        }
        .prose-content ul, .prose-content ol {
          margin-top: 1rem;
          margin-bottom: 1rem;
          padding-left: 1.5rem;
        }
        .prose-content li + li {
          margin-top: 0.5rem;
        }
      `}</style>
      {children}
    </div>
  );
}

// ─────────────────────────────────────────────
// TEXT BLOCK — Container with paragraph spacing
// ─────────────────────────────────────────────

interface TextBlockProps {
  children: ReactNode;
  spacing?: "tight" | "normal" | "relaxed" | "loose";
  className?: string;
}

export function TextBlock({ children, spacing = "normal", className = "" }: TextBlockProps) {
  const spacingClasses = {
    tight: "space-y-3",
    normal: "space-y-4",
    relaxed: "space-y-6",
    loose: "space-y-8",
  };

  return (
    <div className={`${spacingClasses[spacing]} ${className}`}>
      {children}
    </div>
  );
}

// ─────────────────────────────────────────────
// READABLE TEXT — Optimized paragraph component
// ─────────────────────────────────────────────

interface ReadableTextProps {
  children: ReactNode;
  size?: "sm" | "base" | "lg";
  className?: string;
}

export function ReadableText({ children, size = "base", className = "" }: ReadableTextProps) {
  const sizes = {
    sm: { fontSize: "0.875rem", lineHeight: "1.6", maxWidth: "60ch" },
    base: { fontSize: "1rem", lineHeight: "1.75", maxWidth: "65ch" },
    lg: { fontSize: "1.125rem", lineHeight: "1.75", maxWidth: "70ch" },
  };

  return (
    <p
      className={className}
      style={{
        fontFamily: "'DM Sans', sans-serif",
        fontSize: sizes[size].fontSize,
        lineHeight: sizes[size].lineHeight,
        maxWidth: sizes[size].maxWidth,
        color: "#6B6870",
      }}
    >
      {children}
    </p>
  );
}
