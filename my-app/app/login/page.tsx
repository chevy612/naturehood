"use client";

import { useState, ChangeEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { loginUser } from "./actions";

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
        return;
      }

      router.push("/home");
    } catch {
      setError("An unexpected error occurred");
    } finally {
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
            style={{ fontFamily: "'Inter', sans-serif" }}
          >
            Log In
          </h1>
          <p
            className="text-[15px] text-[#6B6870] leading-relaxed"
            style={{ fontFamily: "'DM Sans', sans-serif" }}
          >
            Sign in to your NatureHood account to continue.
          </p>
        </div>

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
              className="w-full bg-[#C8F04D] text-[#141115] px-8 py-4 text-[11px] font-bold tracking-[0.2em] uppercase hover:bg-[#b8e038] transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
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
