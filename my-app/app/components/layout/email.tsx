"use client";

import { ChangeEvent, useState } from "react";

interface CTAEmailCaptureProps {
  headline?: string;
  subtext?: string;
  placeholder?: string;
  onSubmit?: (email: string) => Promise<void>;
}

export function CTAEmailCapture({
  headline,
  subtext,
  placeholder = "Your email",
  onSubmit,
}: CTAEmailCaptureProps) {
  const [email, setEmail] = useState<string>("");
  const [submitted, setSubmitted] = useState<boolean>(false);

  const handleSubmit = async (): Promise<void> => {
    if (!email) return;
    if (onSubmit) await onSubmit(email);
    setSubmitted(true);
  };

  return (
    <div className="w-full bg-[#141115] px-8 py-12 md:py-16">
      <div className="max-w-2xl mx-auto text-center flex flex-col items-center gap-6">
        <h2
          className="text-3xl md:text-4xl font-bold text-white leading-tight"
          style={{ fontFamily: "'Sk Modernist', sans-serif" }}
        >
          {headline ?? "Connect. Create. Dominate."}
        </h2>
        {subtext && (
          <p
            className="text-[#6B6870] text-base max-w-md"
            style={{ fontFamily: "'DM Sans', sans-serif" }}
          >
            {subtext}
          </p>
        )}
        {submitted ? (
          <div
            className="flex items-center gap-2 text-[#C8F04D]"
            style={{ fontFamily: "'Inter', sans-serif" }}
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path
                d="M4 10l4.5 4.5L16 7"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <span className="text-sm font-semibold uppercase tracking-widest">
              You&apos;re in. We&apos;ll be in touch.
            </span>
          </div>
        ) : (
          <div className="flex w-full max-w-md gap-0">
            <input
              type="email"
              value={email}
              onChange={(e: ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
              placeholder={placeholder}
              onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
              className="
                flex-1 bg-white/10 border border-white/20 border-r-0
                px-4 py-3.5 text-white placeholder:text-white/40
                text-sm outline-none focus:bg-white/15
                transition-all duration-200
              "
              style={{ fontFamily: "'DM Sans', sans-serif" }}
            />
            <button
              onClick={handleSubmit}
              className="
                bg-[#C8F04D] text-[#141115] px-6 py-3.5
                text-xs font-bold uppercase tracking-widest
                hover:bg-[#b8e038] transition-colors duration-200
                flex-shrink-0
              "
              style={{ fontFamily: "'Inter', sans-serif" }}
            >
              Join
            </button>
          </div>
        )}
      </div>
    </div>
  );
}