"use client";

import { ReactNode } from "react";

interface ContainerProps {
  children: ReactNode;
  className?: string;
}


export function Container({ children, className = "" }: ContainerProps) {
  return (
    <div className={`w-full max-w-7xl mx-auto px-4 sm:px-6 md:px-8 lg:px-12 ${className}`}>
      {children}
    </div>
  );
}

// ─────────────────────────────────────────────
// CONTENT CONTAINER — Landing / marketing pages
// Outer responsive padding + 1224px inner max-width
// ─────────────────────────────────────────────

interface ContentContainerProps {
  children: ReactNode;
  className?: string;
  as?: "section" | "div";
}

export function ContentContainer({
  children,
  className = "",
  as: Tag = "section",
}: ContentContainerProps) {
  return (
    <Tag className={`w-full px-6 sm:px-12 md:px-[108px] ${className}`}>
      <div className="max-w-[1224px] mx-auto">{children}</div>
    </Tag>
  );
}

// ─────────────────────────────────────────────
// SPLIT GRID — Two-column layout (50/50)
// Stacks vertically on mobile, side-by-side on md+
// ─────────────────────────────────────────────

interface SplitGridProps {
  children: ReactNode;
  className?: string;
}

export function SplitGrid({ children, className = "" }: SplitGridProps) {
  return (
    <div
      className={`grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-[30px] ${className}`}
    >
      {children}
    </div>
  );
}

// ─────────────────────────────────────────────
// STACK — Vertical spacing between elements
// ─────────────────────────────────────────────

interface StackProps {
  children: ReactNode;
  spacing?: 2 | 3 | 4 | 6 | 8 | 10 | 12;
  className?: string;
}

export function Stack({ children, spacing = 4, className = "" }: StackProps) {
  return (
    <div className={`flex flex-col gap-${spacing} ${className}`}>
      {children}
    </div>
  );
}

// ─────────────────────────────────────────────
// GRID — Responsive grid layouts
// ─────────────────────────────────────────────

interface GridProps {
  children: ReactNode;
  cols?: { default?: 1 | 2 | 3 | 4; sm?: 1 | 2 | 3 | 4; md?: 1 | 2 | 3 | 4; lg?: 1 | 2 | 3 | 4 };
  gap?: 4 | 6 | 8 | 10 | 12;
  className?: string;
}

export function Grid({
  children,
  cols = { default: 1, md: 2, lg: 3 },
  gap = 6,
  className = ""
}: GridProps) {
  const colsDefault = cols.default || 1;
  const colsSm = cols.sm || colsDefault;
  const colsMd = cols.md || colsSm;
  const colsLg = cols.lg || colsMd;

  return (
    <div
      className={`grid grid-cols-${colsDefault} ${colsSm !== colsDefault ? `sm:grid-cols-${colsSm}` : ''} ${colsMd !== colsSm ? `md:grid-cols-${colsMd}` : ''} ${colsLg !== colsMd ? `lg:grid-cols-${colsLg}` : ''} gap-${gap} ${className}`}
    >
      {children}
    </div>
  );
}