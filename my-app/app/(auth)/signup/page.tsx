"use client";

import { useState, ChangeEvent, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { InputDark, SelectDark, CheckboxDark, ButtonSubmit } from "@/app/components/ui";
import { OAuthButtons } from "@/app/components/ui/oauth-buttons";
import { initiateSignUp } from "./actions";

// ─────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────

interface SignUpFormData {
  fullName: string;
  email: string;
  role: "athlete" | "brand"| "other";
  agreeTerms: boolean;
  receiveNews: boolean;
}

// ─────────────────────────────────────────────
// SIGN UP PAGE
// ─────────────────────────────────────────────

function SignUpForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const roleParam = searchParams.get("role");
  const initialRole: "athlete" | "brand" | "other" = roleParam === "brand" ? "brand" : roleParam === "other" ? "other" : "athlete";

  const [form, setForm] = useState<SignUpFormData>({
    fullName: "",
    email: "",
    role: initialRole,
    agreeTerms: false,
    receiveNews: false,
  });

  const [errors, setErrors] = useState<
    Partial<Record<keyof SignUpFormData, string>>
  >({});
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState("");

  const roles = [
    { value: "athlete", label: "Athlete" },
    { value: "brand", label: "Brand" },
    { value: "other", label: "Other / Just Exploring" }
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

    setSubmitting(true);
    setServerError("");

    try {
      const result = await initiateSignUp(form);

      if (result.error) {
        setServerError(result.error);
        return;
      }

      const params = new URLSearchParams({
        email: form.email,
        name: form.fullName,
        role: form.role,
        newsletter: String(form.receiveNews),
      });
      router.push(`/signup/verify?${params.toString()}`);
    } catch {
      setServerError("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
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
              style={{ fontFamily: "'DM Sans', sans-serif" }}
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

          {/* OAuth */}
          <OAuthButtons mode="signup" />

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
                    I agree to the Naturehood{" "}
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
                label="I'd like to receive news, updates, and opportunities from Naturehood"
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
            <ButtonSubmit submitting={submitting} label="Sign Up"/>

              
            <p
              className="text-center text-[13px] text-[#6B6870]"
              style={{ fontFamily: "'DM Sans', sans-serif" }}
            >
              Already have an account?{" "}
              <Link href="/login" className="text-[#C8F04D] hover:underline">
                Log in
              </Link>
            </p>
          </form>
        </div>
      </div>
    </>
  );
}

export default function SignUpPage() {
  return (
    <Suspense fallback={null}>
      <SignUpForm />
    </Suspense>
  );
}
