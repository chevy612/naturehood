"use client";

import { useState } from "react";
import { signInWithOAuth } from "@/app/(auth)/login/oauth-actions";

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
      <path
        d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844a4.14 4.14 0 0 1-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615Z"
        fill="#4285F4"
      />
      <path
        d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18Z"
        fill="#34A853"
      />
      <path
        d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.997 8.997 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332Z"
        fill="#FBBC05"
      />
      <path
        d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58Z"
        fill="#EA4335"
      />
    </svg>
  );
}

function AppleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 22" fill="currentColor">
      <path d="M14.94 11.58c-.03-2.78 2.27-4.12 2.37-4.18-1.29-1.89-3.3-2.15-4.02-2.18-1.71-.17-3.34 1.01-4.21 1.01-.87 0-2.22-.98-3.65-.96-1.88.03-3.61 1.09-4.58 2.78-1.95 3.38-.5 8.4 1.4 11.15.93 1.34 2.04 2.86 3.5 2.8 1.4-.06 1.93-.91 3.63-.91 1.7 0 2.18.91 3.67.88 1.51-.03 2.48-1.37 3.4-2.72 1.07-1.56 1.51-3.07 1.54-3.15-.03-.01-2.95-1.13-2.98-4.49l.03-.03ZM12.13 3.54C12.91 2.6 13.44 1.3 13.3 0c-1.07.04-2.37.71-3.14 1.61-.69.8-1.29 2.07-1.13 3.29 1.19.09 2.41-.6 3.1-1.36Z" />
    </svg>
  );
}

export function OAuthButtons({ mode = "login" }: { mode?: "login" | "signup" }) {
  const [loading, setLoading] = useState<"google" | "apple" | null>(null);
  const [error, setError] = useState("");

  const label = mode === "signup" ? "Sign up" : "Continue";

  const handleOAuth = async (provider: "google" | "apple") => {
    setLoading(provider);
    setError("");

    try {
      const result = await signInWithOAuth(provider);

      if (result.error) {
        setError(result.error);
        setLoading(null);
        return;
      }

      if (result.url) {
        window.location.href = result.url;
      }
    } catch {
      setError("Something went wrong. Please try again.");
      setLoading(null);
    }
  };

  return (
    <div className="space-y-3">
      {/* Google */}
      <button
        type="button"
        onClick={() => handleOAuth("google")}
        disabled={loading !== null}
        className="w-full flex items-center justify-center gap-3 bg-white text-black px-6 py-3.5 rounded-full text-[14px] font-semibold hover:bg-white/90 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
        style={{ fontFamily: "'DM Sans', sans-serif" }}
      >
        {loading === "google" ? (
          "Connecting..."
        ) : (
          <>
            <GoogleIcon />
            {label} with Google
          </>
        )}
      </button>

      {/* Apple */}
      <button
        type="button"
        onClick={() => handleOAuth("apple")}
        disabled={loading !== null}
        className="w-full flex items-center justify-center gap-3 bg-[#141115] text-white border border-white/20 px-6 py-3.5 rounded-full text-[14px] font-semibold hover:bg-white/5 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
        style={{ fontFamily: "'DM Sans', sans-serif" }}
      >
        {loading === "apple" ? (
          "Connecting..."
        ) : (
          <>
            <AppleIcon />
            {label} with Apple
          </>
        )}
      </button>

      {/* Error */}
      {error && (
        <p
          className="text-[13px] text-[#FF4D4D] text-center"
          style={{ fontFamily: "'DM Sans', sans-serif" }}
        >
          {error}
        </p>
      )}

      {/* Divider */}
      <div className="flex items-center gap-4 py-2">
        <div className="flex-1 h-px bg-white/10" />
        <span
          className="text-[12px] text-[#6B6870] uppercase tracking-wider"
          style={{ fontFamily: "'DM Sans', sans-serif" }}
        >
          or
        </span>
        <div className="flex-1 h-px bg-white/10" />
      </div>
    </div>
  );
}
