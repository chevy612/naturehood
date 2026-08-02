"use client";

import { useState, useRef, Suspense, KeyboardEvent, ClipboardEvent } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ButtonSubmit } from "@/app/components/ui";
import { verifySignUpOtp, initiateSignUp } from "../actions";

// ─────────────────────────────────────────────
// OTP VERIFY PAGE
// ─────────────────────────────────────────────

function VerifyForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get("email") ?? "";
  const name = searchParams.get("name") ?? "";
  const role = (searchParams.get("role") ?? "athlete") as "athlete" | "brand" | "other";
  const newsletter = searchParams.get("newsletter") === "true";

  const [digits, setDigits] = useState(["", "", "", "", "", ""]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [resendCooldown, setResendCooldown] = useState(0);
  const [resendMessage, setResendMessage] = useState("");
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const handleDigitChange = (index: number, value: string) => {
    const digit = value.replace(/\D/g, "").slice(-1);
    const next = [...digits];
    next[index] = digit;
    setDigits(next);
    setError("");

    if (digit && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !digits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (!pasted) return;
    const next = [...digits];
    pasted.split("").forEach((ch, i) => { if (i < 6) next[i] = ch; });
    setDigits(next);
    const lastFilled = Math.min(pasted.length, 5);
    inputRefs.current[lastFilled]?.focus();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const code = digits.join("");
    if (code.length < 6) {
      setError("Please enter the full 6-digit code.");
      return;
    }

    setSubmitting(true);
    setError("");

    try {
      const result = await verifySignUpOtp(email, code);
      if (result.error) {
        setError(result.error);
        return;
      }

      const params = new URLSearchParams({ email, name, role });
      router.push(`/signup/set-password?${params.toString()}`);
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleResend = async () => {
    if (resendCooldown > 0) return;
    setResendMessage("");
    setError("");

    try {
      const result = await initiateSignUp({ fullName: name, email, role, receiveNews: newsletter, agreeTerms: true });
      if (result.error) {
        setError(result.error);
        return;
      }
      setResendMessage("A new code has been sent.");
      setDigits(["", "", "", "", "", ""]);
      inputRefs.current[0]?.focus();
      setResendCooldown(60);
      const interval = setInterval(() => {
        setResendCooldown((prev) => {
          if (prev <= 1) { clearInterval(interval); return 0; }
          return prev - 1;
        });
      }, 1000);
    } catch {
      setError("Failed to resend code.");
    }
  };

  return (
    <div className="min-h-screen bg-[#141115] flex items-center justify-center px-6 py-16">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="mb-10">
          <p
            className="text-[10px] font-semibold tracking-[0.3em] uppercase text-[#C8F04D] mb-3"
            style={{ fontFamily: "'DM Sans', sans-serif" }}
          >
            Verify Email
          </p>
          <h1
            className="text-[36px] sm:text-[44px] font-bold text-white leading-none mb-3"
            style={{ fontFamily: "'DM Sans', sans-serif" }}
          >
            Check your email
          </h1>
          <p
            className="text-[15px] text-[#6B6870] leading-relaxed"
            style={{ fontFamily: "'DM Sans', sans-serif" }}
          >
            We sent a 6-digit code to{" "}
            <span className="text-white font-medium">{email}</span>.
            Enter it below to continue.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* 6-digit inputs */}
          <div className="flex gap-3 justify-between">
            {digits.map((digit, i) => (
              <input
                key={i}
                ref={(el) => { inputRefs.current[i] = el; }}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={(e) => handleDigitChange(i, e.target.value)}
                onKeyDown={(e) => handleKeyDown(i, e)}
                onPaste={handlePaste}
                className="w-12 h-14 text-center text-2xl font-bold text-white bg-[#1E1B1F] border-none rounded-xl focus:outline-none focus:ring-1 focus:ring-white/20 transition-all"
                style={{ fontFamily: "'DM Sans', sans-serif" }}
                autoFocus={i === 0}
              />
            ))}
          </div>

          {/* Error */}
          {error && (
            <p
              className="text-[13px] text-[#FF4D4D]"
              style={{ fontFamily: "'DM Sans', sans-serif" }}
            >
              {error}
            </p>
          )}

          {/* Resend message */}
          {resendMessage && (
            <p
              className="text-[13px] text-[#C8F04D]"
              style={{ fontFamily: "'DM Sans', sans-serif" }}
            >
              {resendMessage}
            </p>
          )}

          {/* Submit */}
          <ButtonSubmit submitting={submitting} label="Verify Code" />

          {/* Resend */}
          <p
            className="text-center text-[13px] text-[#6B6870]"
            style={{ fontFamily: "'DM Sans', sans-serif" }}
          >
            Didn&apos;t receive it?{" "}
            <button
              type="button"
              onClick={handleResend}
              disabled={resendCooldown > 0}
              className="text-[#C8F04D] hover:underline disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : "Resend code"}
            </button>
          </p>
        </form>
      </div>
    </div>
  );
}

export default function VerifyPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#141115] flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-[#C8F04D] border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <VerifyForm />
    </Suspense>
  );
}
