"use client";

import { useState, ChangeEvent } from "react";
import Link from "next/link";
import { SuccessModal } from "@/app/components/basic/basic";
import { quickSignUp } from "./actions";

// ─────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────

interface SignUpFormData {
  fullName: string;
  email: string;
  role: "athlete" | "brand";
  agreeTerms: boolean;
  receiveNews: boolean;
}

// ─────────────────────────────────────────────
// SIGN UP PAGE
// ─────────────────────────────────────────────

export default function SignUpPage() {
  const [form, setForm] = useState<SignUpFormData>({
    fullName: "",
    email: "",
    role: "athlete",
    agreeTerms: false,
    receiveNews: false,
  });

  const [errors, setErrors] = useState<
    Partial<Record<keyof SignUpFormData, string>>
  >({});
  const [loading, setLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [serverError, setServerError] = useState("");

  const roles = [
    { value: "athlete", label: "Athlete" },
    { value: "brand", label: "Brand" },
  ];

  const validate = (): Partial<Record<keyof SignUpFormData, string>> => {
    const e: Partial<Record<keyof SignUpFormData, string>> = {};
    if (!form.fullName.trim()) e.fullName = "Name is required";
    if (!/\S+@\S+\.\S+/.test(form.email)) e.email = "Valid email required";
    if (!form.agreeTerms) e.agreeTerms = "You must agree to continue";
    return e;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const validationErrors = validate();
    if (Object.keys(validationErrors).length) {
      setErrors(validationErrors);
      return;
    }

    setLoading(true);
    setServerError("");

    try {
      const result = await quickSignUp(form);

      if (result.error) {
        setServerError(result.error);
        return;
      }

      setShowSuccess(true);
    } catch {
      setServerError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const setField =
    (field: keyof SignUpFormData) =>
    (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      setForm((prev) => ({ ...prev, [field]: e.target.value }));
      setErrors((prev) => ({ ...prev, [field]: undefined }));
      setServerError("");
    };

  return (
    <>
      {showSuccess && (
        <SuccessModal
          title="Welcome to NatureHood"
          message="You're all set! We'll be in touch with updates and opportunities tailored to your profile."
          onClose={() => setShowSuccess(false)}
          variant="dark"
        />
      )}

      <div className="min-h-screen bg-[#141115] flex items-center justify-center px-6 py-16">
        <div className="w-full max-w-md">
          {/* Header */}
          <div className="mb-10">
            <p
              className="text-[10px] font-semibold tracking-[0.3em] uppercase text-[#C8F04D] mb-3"
              style={{ fontFamily: "'DM Sans', sans-serif" }}
            >
              Get Started
            </p>
            <h1
              className="text-[36px] sm:text-[44px] font-bold text-white leading-none mb-3"
              style={{ fontFamily: "'Inter', sans-serif" }}
            >
              Join Naturehood
            </h1>
            <p
              className="text-[15px] text-[#6B6870] leading-relaxed"
              style={{ fontFamily: "'DM Sans', sans-serif" }}
            >
              Sign up in seconds. Connect with brands and athletes who share
              your passion.
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Full Name */}
            <InputDark
              label="Full Name"
              name="fullName"
              value={form.fullName}
              onChange={setField("fullName")}
              error={errors.fullName}
              placeholder="Your full name"
              required
            />

            {/* Email */}
            <InputDark
              label="Email"
              type="email"
              name="email"
              value={form.email}
              onChange={setField("email")}
              error={errors.email}
              placeholder="you@example.com"
              required
            />

            {/* Role Select */}
            <SelectDark
              label="I am a..."
              name="role"
              options={roles}
              value={form.role}
              onChange={setField("role")}
            />

            {/* Checkboxes */}
            <div className="space-y-4 pt-2">
              <CheckboxDark
                label={
                  <>
                    I agree to the NatureHood{" "}
                    <Link
                      href="/terms"
                      className="text-[#C8F04D] hover:underline"
                    >
                      Terms of Service
                    </Link>{" "}
                    and{" "}
                    <Link
                      href="/privacy"
                      className="text-[#C8F04D] hover:underline"
                    >
                      Privacy Policy
                    </Link>
                  </>
                }
                checked={form.agreeTerms}
                onChange={(e) => {
                  setForm((prev) => ({
                    ...prev,
                    agreeTerms: e.target.checked,
                  }));
                  setErrors((prev) => ({ ...prev, agreeTerms: undefined }));
                }}
                error={errors.agreeTerms}
              />

              <CheckboxDark
                label="I'd like to receive news, updates, and opportunities from NatureHood"
                checked={form.receiveNews}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    receiveNews: e.target.checked,
                  }))
                }
              />
            </div>

            {/* Server Error */}
            {serverError && (
              <p
                className="text-[13px] text-[#FF4D4D]"
                style={{ fontFamily: "'DM Sans', sans-serif" }}
              >
                {serverError}
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
                {loading ? "Signing up..." : "Sign Up"}
              </button>
            </div>

            {/* Footer link */}
            <p
              className="text-center text-[13px] text-[#6B6870]"
              style={{ fontFamily: "'DM Sans', sans-serif" }}
            >
              Already have an account?{" "}
              <Link
                href="/login"
                className="text-[#C8F04D] hover:underline"
              >
                Log in
              </Link>
            </p>
          </form>
        </div>
      </div>
    </>
  );
}

// ─────────────────────────────────────────────
// DARK MODE FORM COMPONENTS
// (Matches NatureHood design system)
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

function SelectDark({
  label,
  name,
  options,
  value,
  onChange,
  error,
}: {
  label: string;
  name: string;
  options: { value: string; label: string }[];
  value: string;
  onChange: (e: ChangeEvent<HTMLSelectElement>) => void;
  error?: string;
}) {
  return (
    <div className="flex flex-col gap-2">
      <label
        htmlFor={name}
        className="text-[10px] font-semibold tracking-[0.3em] uppercase text-[#6B6870]"
        style={{ fontFamily: "'DM Sans', sans-serif" }}
      >
        {label}
      </label>
      <div className="relative">
        <select
          id={name}
          name={name}
          value={value}
          onChange={onChange}
          className={`w-full bg-transparent border-b-2 py-3 pr-8 appearance-none cursor-pointer text-[15px] text-white outline-none transition-colors duration-200 ${
            error
              ? "border-[#FF4D4D]"
              : "border-[#3A373C] focus:border-[#C8F04D]"
          }`}
          style={{ fontFamily: "'DM Sans', sans-serif" }}
        >
          {options.map((opt) => (
            <option
              key={opt.value}
              value={opt.value}
              className="bg-[#141115]"
            >
              {opt.label}
            </option>
          ))}
        </select>
        <span className="pointer-events-none absolute right-0 top-1/2 -translate-y-1/2 text-[#6B6870]">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path
              d="M4 6l4 4 4-4"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </span>
      </div>
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

function CheckboxDark({
  label,
  checked,
  onChange,
  error,
}: {
  label: React.ReactNode;
  checked: boolean;
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
  error?: string;
}) {
  return (
    <div>
      <label className="inline-flex items-start gap-3 cursor-pointer group">
        <span className="relative mt-0.5 flex-shrink-0">
          <input
            type="checkbox"
            checked={checked}
            onChange={onChange}
            className="sr-only"
          />
          <span
            className={`block w-5 h-5 border-2 transition-all duration-200 ${
              checked
                ? "bg-[#C8F04D] border-[#C8F04D]"
                : "bg-transparent border-[#3A373C] group-hover:border-[#6B6870]"
            }`}
          >
            {checked && (
              <svg
                className="absolute inset-0 w-full h-full p-0.5"
                viewBox="0 0 16 16"
                fill="none"
              >
                <path
                  d="M3 8l3.5 3.5L13 5"
                  stroke="#141115"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            )}
          </span>
        </span>
        <span
          className="text-[13px] text-[#6B6870] leading-relaxed"
          style={{ fontFamily: "'DM Sans', sans-serif" }}
        >
          {label}
        </span>
      </label>
      {error && (
        <p
          className="text-[11px] text-[#FF4D4D] mt-1 ml-8"
          style={{ fontFamily: "'DM Sans', sans-serif" }}
        >
          {error}
        </p>
      )}
    </div>
  );
}
