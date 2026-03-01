"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { InputDark, ButtonSubmit } from "@/app/components/ui";
import { setUserPassword } from "../actions";

// ─────────────────────────────────────────────
// SET PASSWORD PAGE
// ─────────────────────────────────────────────

function SetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get("email") ?? "";
  const name = searchParams.get("name") ?? "";
  const role = (searchParams.get("role") ?? "athlete") as "athlete" | "brand" | "other";

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password) { setError("Please enter a password."); return; }
    if (password.length < 8) { setError("Password must be at least 8 characters."); return; }
    if (password !== confirmPassword) { setError("Passwords do not match."); return; }

    setSubmitting(true);
    setError("");

    try {
      const result = await setUserPassword({ email, password, confirmPassword, fullName: name, role });
      if (result.error) {
        setError(result.error);
        return;
      }
      router.push("/dashboard");
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
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
            Almost there
          </p>
          <h1
            className="text-[36px] sm:text-[44px] font-bold text-white leading-none mb-3"
            style={{ fontFamily: "'Inter', sans-serif" }}
          >
            Create your password
          </h1>
          <p
            className="text-[15px] text-[#6B6870] leading-relaxed"
            style={{ fontFamily: "'DM Sans', sans-serif" }}
          >
            Choose a password to secure your account. You&apos;ll use it to log
            in next time.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <InputDark
            label="Password"
            type="password"
            name="password"
            value={password}
            onChange={(e) => { setPassword(e.target.value); setError(""); }}
            placeholder="At least 8 characters"
            required
          />

          <InputDark
            label="Confirm Password"
            type="password"
            name="confirmPassword"
            value={confirmPassword}
            onChange={(e) => { setConfirmPassword(e.target.value); setError(""); }}
            placeholder="Repeat your password"
            required
          />

          {/* Error */}
          {error && (
            <p
              className="text-[13px] text-[#FF4D4D]"
              style={{ fontFamily: "'DM Sans', sans-serif" }}
            >
              {error}
            </p>
          )}

          <ButtonSubmit submitting={submitting} label="Create Account" />
        </form>
      </div>
    </div>
  );
}

export default function SetPasswordPage() {
  return (
    <Suspense fallback={null}>
      <SetPasswordForm />
    </Suspense>
  );
}
