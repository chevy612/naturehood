"use client";

import { useState, ChangeEvent } from "react";
import Link from "next/link";
import { requestPasswordReset } from "./actions";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const result = await requestPasswordReset(email);

      if ("error" in result) {
        setError(result.error);
        setLoading(false);
        return;
      }

      setSubmitted(true);
    } catch {
      setError("An unexpected error occurred. Please try again.");
      setLoading(false);
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
            Account Recovery
          </p>
          <h1
            className="text-[36px] sm:text-[44px] font-bold text-white leading-none mb-3"
            style={{ fontFamily: "'Inter', sans-serif" }}
          >
            Forgot Password
          </h1>
          <p
            className="text-[15px] text-[#6B6870] leading-relaxed"
            style={{ fontFamily: "'DM Sans', sans-serif" }}
          >
            Enter your email address and we&apos;ll send you a link to reset
            your password.
          </p>
        </div>

        {submitted ? (
          /* Success state — always shown regardless of whether email exists */
          <div className="space-y-6">
            <div className="border border-[#C8F04D]/30 bg-[#C8F04D]/5 p-5">
              <p
                className="text-[13px] text-[#C8F04D] leading-relaxed"
                style={{ fontFamily: "'DM Sans', sans-serif" }}
              >
                If an account with that email exists, you&apos;ll receive a
                password reset link shortly. Check your inbox — the link expires
                in 60 minutes.
              </p>
            </div>
            <p
              className="text-center text-[13px] text-[#6B6870]"
              style={{ fontFamily: "'DM Sans', sans-serif" }}
            >
              <Link href="/login" className="text-[#C8F04D] hover:underline">
                Back to Log In
              </Link>
            </p>
          </div>
        ) : (
          /* Form */
          <form onSubmit={handleSubmit} className="space-y-6">
            <InputDark
              label="Email Address"
              name="email"
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setError("");
              }}
              placeholder="you@example.com"
              required
            />

            {error && (
              <p
                className="text-[13px] text-[#FF4D4D]"
                style={{ fontFamily: "'DM Sans', sans-serif" }}
              >
                {error}
              </p>
            )}

            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#C8F04D] text-[#141115] px-8 py-4 text-[11px] font-bold tracking-[0.2em] uppercase hover:bg-[#b8e038] transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ fontFamily: "'DM Sans', sans-serif" }}
              >
                {loading ? "Sending..." : "Send Reset Link"}
              </button>
            </div>

            <p
              className="text-center text-[13px] text-[#6B6870]"
              style={{ fontFamily: "'DM Sans', sans-serif" }}
            >
              <Link href="/login" className="text-[#C8F04D] hover:underline">
                Back to Log In
              </Link>
            </p>
          </form>
        )}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// DARK MODE INPUT (matches login page style)
// ─────────────────────────────────────────────

function InputDark({
  label,
  name,
  type = "text",
  value,
  onChange,
  error,
  placeholder,
  required,
}: {
  label: string;
  name: string;
  type?: string;
  value: string;
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
  error?: string;
  placeholder?: string;
  required?: boolean;
}) {
  return (
    <div className="flex flex-col gap-2">
      <label
        htmlFor={name}
        className="text-[10px] font-semibold tracking-[0.3em] uppercase text-[#6B6870]"
        style={{ fontFamily: "'DM Sans', sans-serif" }}
      >
        {label} {required && <span className="text-[#C8F04D]">*</span>}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className={`w-full bg-transparent border-b-2 py-3 px-0 text-[15px] text-white placeholder:text-[#3A373C] outline-none transition-colors duration-200 ${
          error
            ? "border-[#FF4D4D] focus:border-[#FF4D4D]"
            : "border-[#3A373C] focus:border-[#C8F04D]"
        }`}
        style={{ fontFamily: "'DM Sans', sans-serif" }}
      />
      {error && (
        <p
          className="text-[11px] text-[#FF4D4D]"
          style={{ fontFamily: "'DM Sans', sans-serif" }}
        >
          {error}
        </p>
      )}
    </div>
  );
}
