"use client";

import Image from "next/image";
import { clsx } from "clsx";
import { ReadableText } from "./typography";
import { PillTag } from "./tags";

// ─────────────────────────────────────────────
// PROFILE CARD
// Usage: Founders section, team pages
// Supports dark and light mode + vertical/horizontal layouts
// ─────────────────────────────────────────────

// Inline SVGs — lucide-react has deprecated all brand icons
function LinkedInSVG() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
      <rect x="2" y="9" width="4" height="12" />
      <circle cx="4" cy="4" r="2" />
    </svg>
  );
}

function InstagramSVG() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
    </svg>
  );
}

interface ProfileCardProps {
  name: string;
  role?: string | string[];
  description: string;
  photo?: string;
  linkedinUrl?: string;
  instagramUrl?: string;
  mode?: "dark" | "light";
  layout?: "vertical" | "horizontal";
  className?: string;
}

export function ProfileCard({
  name,
  role,
  description,
  photo,
  linkedinUrl,
  instagramUrl,
  mode = "dark",
  layout = "vertical",
  className = "",
}: ProfileCardProps) {
  const isDark = mode === "dark";

  const initials = name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const hasSocial = linkedinUrl || instagramUrl;

  const cardBase = clsx(
    "transition-all duration-300",
    isDark
      ? "bg-[#2A272C] border border-[#3A373C] hover:border-[#C8F04D]/30 shadow-md"
      : "bg-white border border-[#E8E8E8] hover:border-[#141115]/20 shadow-sm",
    className,
  );

  const Avatar = (
    <div
      className={clsx(
        "relative w-30 h-30 rounded-full overflow-hidden shrink-0 flex items-center justify-center ring-2 ring-[#C8F04D]",
        !photo && (isDark ? "bg-[#C8F04D]" : "bg-[#141115]"),
      )}
    >
      {photo ? (
        <Image
          src={photo}
          alt={name}
          fill
          className="object-cover"
          sizes="120px"
        />
      ) : (
        <span
          className={clsx(
            "text-lg font-bold select-none",
            isDark ? "text-[#141115]" : "text-white",
          )}
          style={{ fontFamily: "'Inter', sans-serif" }}
        >
          {initials}
        </span>
      )}
    </div>
  );

  const RolePills = ({ align }: { align: "center" | "left" }) =>
    role ? (
      <div
        className={clsx(
          "flex flex-wrap gap-1.5 mb-3",
          align === "center" ? "justify-center" : "justify-start",
        )}
      >
        {(Array.isArray(role) ? role : [role]).map((r) => (
          <PillTag
            key={r}
            label={r}
            size="sm"
            variant={isDark ? "ghost-green" : "ghost-light"}
          />
        ))}
      </div>
    ) : null;

  const SocialIcons = ({ align }: { align: "center" | "left" }) =>
    hasSocial ? (
      <div
        className={clsx(
          "flex items-center gap-3 mt-5",
          align === "center" ? "justify-center" : "justify-start",
        )}
      >
        {linkedinUrl && (
          <a
            href={linkedinUrl}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`${name} on LinkedIn`}
            className={clsx(
              "inline-flex items-center justify-center w-8 h-8 transition-all duration-200",
              isDark
                ? "text-[#6B6870] hover:text-[#C8F04D]"
                : "text-[#A09EA3] hover:text-[#141115]",
            )}
          >
            <LinkedInSVG />
          </a>
        )}
        {instagramUrl && (
          <a
            href={instagramUrl}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`${name} on Instagram`}
            className={clsx(
              "inline-flex items-center justify-center w-8 h-8 transition-all duration-200",
              isDark
                ? "text-[#6B6870] hover:text-[#C8F04D]"
                : "text-[#A09EA3] hover:text-[#141115]",
            )}
          >
            <InstagramSVG />
          </a>
        )}
      </div>
    ) : null;

  // ── HORIZONTAL ──────────────────────────────
  if (layout === "horizontal") {
    return (
      <div className={clsx(cardBase, "flex flex-col sm:flex-row gap-8 items-start px-8 py-8")}>
        {/* Left — avatar */}
        <div className="shrink-0 flex sm:flex-col items-center gap-4 sm:gap-0">
          {Avatar}
        </div>

        {/* Right — content */}
        <div className="flex-1 text-left">
          <RolePills align="left" />
          <h3
            className={clsx(
              "text-xl font-semibold mb-3",
              isDark ? "text-white" : "text-[#141115]",
            )}
            style={{ fontFamily: "'Inter', sans-serif", letterSpacing: "-0.01em" }}
          >
            {name}
          </h3>
          <ReadableText size="sm" className="text-[#E8E8E8]">
            {description}
          </ReadableText>
          <SocialIcons align="left" />
        </div>
      </div>
    );
  }

  // ── VERTICAL (default) ───────────────────────
  return (
    <div className={clsx(cardBase, "flex flex-col items-center text-center px-10 py-10")}>
      <RolePills align="center" />
      <div className="mb-5">{Avatar}</div>
      <h3
        className={clsx(
          "text-lg font-semibold mb-3",
          isDark ? "text-white" : "text-[#141115]",
        )}
        style={{ fontFamily: "'Inter', sans-serif", letterSpacing: "-0.01em" }}
      >
        {name}
      </h3>
      <ReadableText size="sm" className="text-[#6B6870]">
        {description}
      </ReadableText>
      <SocialIcons align="center" />
    </div>
  );
}
