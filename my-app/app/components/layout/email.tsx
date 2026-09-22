"use client";

import { ChangeEvent, useState } from "react";
import { ContentContainer } from "@/app/components/ui/container";
import { ButtonPrimary } from "@/app/components/ui/buttons";

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
    <section className="w-full bg-black">
      <ContentContainer as="div" className="py-16 md:py-24">
        <div className="max-w-xl mx-auto text-center flex flex-col items-center gap-6">
          <h2 className="nh-h2 text-white">
            {headline ?? "Join the community"}
          </h2>
          {subtext && (
            <p
              className="text-white/40 text-[15px] max-w-md leading-relaxed"
              style={{ fontFamily: "'DM Sans', sans-serif" }}
            >
              {subtext}
            </p>
          )}
          {submitted ? (
            <div
              className="flex items-center gap-2 text-white"
              style={{ fontFamily: "'DM Sans', sans-serif" }}
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
              <span className="text-[14px] font-medium tracking-wide">
                You&apos;re in. We&apos;ll be in touch.
              </span>
            </div>
          ) : (
            <div className="flex flex-col w-full max-w-md gap-3 mt-2">
              <input
                type="email"
                value={email}
                onChange={(e: ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
                placeholder={placeholder}
                onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
                className="w-full bg-[#1E1B1F] border-none rounded-full px-5 py-3 sm:px-6 sm:py-3.5 text-white placeholder:text-[#6B6870] text-[16px] leading-[22px] sm:leading-[24px] outline-none focus:ring-1 focus:ring-white/20 transition-all duration-200"
                style={{ fontFamily: "'DM Sans', sans-serif" }}
              />
              <ButtonPrimary variant="white" onClick={handleSubmit} fullWidth>
                Join us
              </ButtonPrimary>
            </div>
          )}
        </div>
      </ContentContainer>
    </section>
  );
}
