"use client";

import { useState, ChangeEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { loginUser } from "./actions";
import { OAuthButtons } from "@/app/components/ui/oauth-buttons";

export default function LoginPage() {
  const [emailOrUsername, setEmailOrUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const result = await loginUser({ emailOrUsername, password });

      if (result.error) {
        setError(result.error);
        setLoading(false);
        return;
      }

      // Keep spinner active through navigation — component unmounts on arrival
      router.prefetch("/home");
      router.push("/home");
    } catch {
      setError("An unexpected error occurred");
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
            Welcome Back
          </p>
          <h1
            className="text-[36px] sm:text-[44px] font-bold text-white leading-none mb-3"
            style={{ fontFamily: "'DM Sans', sans-serif" }}
          >
            Log In
          </h1>
          <p
            className="text-[15px] text-[#6B6870] leading-relaxed"
            style={{ fontFamily: "'DM Sans', sans-serif" }}
          >
            Sign in to your Naturehood account to continue.
          </p>
        </div>

        {/* OAuth */}
        <OAuthButtons mode="login" />

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Email or Username */}
          <InputDark
            label="Email or Username"
            name="emailOrUsername"
            value={emailOrUsername}
            onChange={(e) => {
              setEmailOrUsername(e.target.value);
              setError("");
            }}
            placeholder="you@example.com"
            required
          />

          {/* Password */}
          <div>
            <InputDark
              label="Password"
              name="password"
              type="password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setError("");
              }}
              placeholder="Your password"
              required
            />
            <div className="mt-2 text-right">
              <Link
                href="/auth/forgot-password"
                className="text-[11px] text-[#6B6870] hover:text-[#C8F04D] transition-colors"
                style={{ fontFamily: "'DM Sans', sans-serif" }}
              >
                Forgot password?
              </Link>
            </div>
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

          {/* Submit */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-white text-black px-8 py-3.5 rounded-full text-[14px] font-semibold hover:bg-white/90 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ fontFamily: "'DM Sans', sans-serif" }}
            >
              {loading ? "Logging in..." : "Log In"}
            </button>
          </div>

          {/* Footer link */}
          <p
            className="text-center text-[13px] text-[#6B6870]"
            style={{ fontFamily: "'DM Sans', sans-serif" }}
          >
            Don&apos;t have an account?{" "}
            <Link href="/signup" className="text-[#C8F04D] hover:underline">
              Sign up
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// DARK MODE INPUT (matches signup page)
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
