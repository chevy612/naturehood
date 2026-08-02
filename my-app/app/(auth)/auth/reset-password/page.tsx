"use client";

import { useState, useEffect, ChangeEvent, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { verifyResetToken, resetPassword } from "./actions";

// useSearchParams requires a Suspense boundary
export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<LoadingState />}>
      <ResetPasswordContent />
    </Suspense>
  );
}

function ResetPasswordContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token") ?? "";

  type TokenState = "loading" | "valid" | "expired" | "invalid";
  const [tokenState, setTokenState] = useState<TokenState>("loading");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  // Verify token on mount
  useEffect(() => {
    if (!token) {
      setTokenState("invalid");
      return;
    }

    verifyResetToken(token).then((result) => {
      if (result.valid) {
        setTokenState("valid");
      } else {
        setTokenState(result.reason); // 'expired' | 'invalid'
      }
    });
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      const result = await resetPassword(token, password, confirmPassword);

      if ("error" in result) {
        setError(result.error);
        setLoading(false);
        return;
      }

      setSuccess(true);
      // Redirect to login after 3 seconds
      setTimeout(() => router.push("/login"), 3000);
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
            style={{ fontFamily: "'DM Sans', sans-serif" }}
          >
            New Password
          </h1>
        </div>

        {/* Loading */}
        {tokenState === "loading" && <LoadingState />}

        {/* Invalid token */}
        {tokenState === "invalid" && (
          <ErrorState
            title="Invalid reset link"
            message="This password reset link is invalid. It may have already been used or the URL is malformed."
          />
        )}

        {/* Expired token */}
        {tokenState === "expired" && (
          <ErrorState
            title="Link expired"
            message="This password reset link has expired. Reset links are valid for 60 minutes."
          />
        )}

        {/* Success */}
        {tokenState === "valid" && success && (
          <div className="space-y-6">
            <div className="border border-[#C8F04D]/30 bg-[#C8F04D]/5 p-5">
              <p
                className="text-[13px] text-[#C8F04D] leading-relaxed"
                style={{ fontFamily: "'DM Sans', sans-serif" }}
              >
                Your password has been updated. Redirecting you to log in...
              </p>
            </div>
            <p
              className="text-center text-[13px] text-[#6B6870]"
              style={{ fontFamily: "'DM Sans', sans-serif" }}
            >
              <Link href="/login" className="text-[#C8F04D] hover:underline">
                Go to Log In
              </Link>
            </p>
          </div>
        )}

        {/* Form */}
        {tokenState === "valid" && !success && (
          <form onSubmit={handleSubmit} className="space-y-6">
            <InputDark
              label="New Password"
              name="password"
              type="password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setError("");
              }}
              placeholder="At least 8 characters"
              required
            />

            <InputDark
              label="Confirm Password"
              name="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => {
                setConfirmPassword(e.target.value);
                setError("");
              }}
              placeholder="Repeat your new password"
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
                className="w-full bg-white text-black px-8 py-3.5 rounded-full text-[14px] font-semibold hover:bg-white/90 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ fontFamily: "'DM Sans', sans-serif" }}
              >
                {loading ? "Updating..." : "Update Password"}
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
// LOADING STATE
// ─────────────────────────────────────────────

function LoadingState() {
  return (
    <div className="space-y-4">
      <div className="h-4 bg-[#3A373C] rounded animate-pulse w-3/4" />
      <div className="h-4 bg-[#3A373C] rounded animate-pulse w-1/2" />
    </div>
  );
}

// ─────────────────────────────────────────────
// ERROR STATE
// ─────────────────────────────────────────────

function ErrorState({
  title,
  message,
}: {
  title: string;
  message: string;
}) {
  return (
    <div className="space-y-6">
      <div className="border border-[#FF4D4D]/30 bg-[#FF4D4D]/5 p-5">
        <p
          className="text-[13px] font-semibold text-[#FF4D4D] mb-1"
          style={{ fontFamily: "'DM Sans', sans-serif" }}
        >
          {title}
        </p>
        <p
          className="text-[13px] text-[#6B6870] leading-relaxed"
          style={{ fontFamily: "'DM Sans', sans-serif" }}
        >
          {message}
        </p>
      </div>
      <p
        className="text-center text-[13px] text-[#6B6870]"
        style={{ fontFamily: "'DM Sans', sans-serif" }}
      >
        <Link
          href="/auth/forgot-password"
          className="text-[#C8F04D] hover:underline"
        >
          Request a new reset link
        </Link>
      </p>
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
        autoComplete={name === "password" ? "new-password" : "off"}
        className={`w-full bg-[#1E1B1F] border-none rounded-full px-6 py-3.5 text-[14px] text-white placeholder:text-[#6B6870] outline-none transition-all duration-200 focus:ring-1 focus:ring-white/20 ${
          error ? "ring-1 ring-[#FF4D4D]" : ""
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
