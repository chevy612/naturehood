"use client";

import { useState, ChangeEvent } from "react";
import { useTranslations } from "next-intl";
import { Link, useRouter } from '@/i18n/navigation';
import { loginUser } from "./actions";
import { OAuthButtons } from "@/app/components/ui/oauth-buttons";

export default function LoginPage() {
  const t = useTranslations("Auth");
  const tCommon = useTranslations("Common");
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
      const next = new URLSearchParams(window.location.search).get("next");
      const target = next && next.startsWith("/") && !next.startsWith("//") ? next : "/home";
      router.prefetch(target);
      router.push(target);
    } catch {
      setError(tCommon("errorUnexpected"));
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#141115] flex items-center justify-center px-6 py-16">
      <div className="w-full max-w-md">
        <h1
          className="text-[36px] sm:text-[44px] font-bold text-white leading-none mb-10"
          style={{ fontFamily: "'Sk Modernist', sans-serif" }}
        >
          {t("welcomeBackElite")}
        </h1>

        {/* OAuth */}
        <OAuthButtons mode="login" />

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Email or Username */}
          <InputDark
            label={t("emailOrUsername")}
            name="emailOrUsername"
            value={emailOrUsername}
            onChange={(e) => {
              setEmailOrUsername(e.target.value);
              setError("");
            }}
            placeholder={t("emailOrUsernamePlaceholder")}
            required
          />

          {/* Password */}
          <div>
            <InputDark
              label={t("password")}
              name="password"
              type="password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setError("");
              }}
              placeholder={t("passwordPlaceholder")}
              required
            />
            <div className="mt-2 text-right">
              <Link
                href="/auth/forgot-password"
                className="text-[11px] text-[#6B6870] hover:text-[#F5F5F5] transition-colors"
                style={{ fontFamily: "'DM Sans', sans-serif" }}
              >
                {t("forgotPassword")}
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
              {loading ? t("loggingIn") : t("logIn")}
            </button>
          </div>

          {/* Footer link */}
          <p
            className="text-center text-[13px] text-[#6B6870]"
            style={{ fontFamily: "'DM Sans', sans-serif" }}
          >
            {t("noAccount")}{" "}
            <Link href="/signup" className="text-[#F5F5F5] hover:underline">
              {tCommon("signUp")}
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
        {label} {required && <span className="text-[#F5F5F5]">*</span>}
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
