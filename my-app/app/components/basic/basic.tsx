"use client";

import { useState, ReactNode, ChangeEvent } from "react";

// ─────────────────────────────────────────────
// NATUREHOODOFFICIAL — CTA & FORMS COMPONENT LIBRARY
// Stack: Next.js + Tailwind CSS + TypeScript
// Aesthetic: Clean modern · Editorial · Athletic
// ─────────────────────────────────────────────

// ── DESIGN TOKENS (Updated - Designer Spec v3) ────────────────────────────
// Typography: Inter (headings) + DM Sans (body/UI)
export const tokens = {
  font: {
    heading: "'Inter', sans-serif",     // NEW: Inter for headings (was Syne)
    body: "'DM Sans', sans-serif",      // KEEP: DM Sans (future: Aktiv Grotesk)
  },
  color: {
    ink:     '#141115',
    cloud:   '#F5F5F5',
    surface2: '#2A272C',
    surface1: '#1E1B1F',
    textSecondary: '#6B6870',
    accent: "#C8F04D", // electric lime
    border:        '#3A373C',
    muted:         '#E8E8E8',
    textDisabled:  '#A09EA3',
    warning:       '#F5A623',
    error:         '#FF4D4D',
    info:          '#4DA6FF',
    white:         '#FFFFFF',
  },
  spacing: {
    section: "py-12 sm:py-16 md:py-20 lg:py-24",
    sectionSm: "py-8 sm:py-10 md:py-12 lg:py-16",
    container: "px-4 sm:px-6 md:px-8 lg:px-12",
  },
  typography: {
    // Hero - Inter 900 ExtraBold
    hero: {
      fontFamily: "'Inter', sans-serif",
      fontSize: "clamp(52px, 8vw, 88px)",
      fontWeight: "900",
      lineHeight: "0.95",
      letterSpacing: "-0.02em",
    },
    // H1 - Inter 700 Bold
    h1: {
      fontFamily: "'Inter', sans-serif",
      fontSize: "clamp(38px, 5vw, 60px)",
      fontWeight: "700",
      lineHeight: "1.0",
      letterSpacing: "-0.02em",
    },
    // H2 - Inter 700 Bold
    h2: {
      fontFamily: "'Inter', sans-serif",
      fontSize: "clamp(26px, 4vw, 40px)",
      fontWeight: "700",
      lineHeight: "1.05",
      letterSpacing: "-0.015em",
    },
    // H3 - Inter 600 SemiBold
    h3: {
      fontFamily: "'Inter', sans-serif",
      fontSize: "clamp(20px, 3vw, 28px)",
      fontWeight: "600",
      lineHeight: "1.1",
      letterSpacing: "-0.01em",
    },
    // Label - DM Sans 600, 0.3em, uppercase
    label: {
      fontFamily: "'DM Sans', sans-serif",
      fontSize: "10px",
      fontWeight: "600",
      letterSpacing: "0.3em",
      textTransform: "uppercase" as const,
    },
    // Body - DM Sans 400
    body: {
      fontFamily: "'DM Sans', sans-serif",
      fontSize: "16px",
      fontWeight: "400",
      lineHeight: "1.75",
    },
    // Small - DM Sans 400, 13px
    small: {
      fontFamily: "'DM Sans', sans-serif",
      fontSize: "13px",
      fontWeight: "400",
      lineHeight: "1.65",
    },
    // Caption - DM Sans 400, 11px
    caption: {
      fontFamily: "'DM Sans', sans-serif",
      fontSize: "11px",
      fontWeight: "400",
      letterSpacing: "0.06em",
    },
  },
  // Responsive utility classes
  responsive: {
    text: {
      hero: "text-5xl sm:text-6xl md:text-7xl lg:text-8xl",
      h1: "text-4xl sm:text-5xl md:text-6xl",
      h2: "text-3xl sm:text-4xl md:text-5xl",
      h3: "text-xl sm:text-2xl md:text-3xl",
      body: "text-sm sm:text-base",
      small: "text-xs sm:text-sm",
    },
  },
} as const;

// ── FONT LOADER (paste in your app/layout.tsx) ────
/*
import { Inter, DM_Sans } from 'next/font/google'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter', weight: ['400','600','700','800','900'] })
const dm    = DM_Sans({ subsets: ['latin'], variable: '--font-dm',    weight: ['300','400','500','600'] })

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${dm.variable}`}>
      <body>{children}</body>
    </html>
  )
}
*/

// ─────────────────────────────────────────────
// PROP INTERFACES
// ─────────────────────────────────────────────

interface ButtonBaseProps {
  children: ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  fullWidth?: boolean;
  variant?: "white" | "black";
}

interface ButtonIconProps {
  icon: ReactNode;
  label: string;
  onClick?: () => void;
  variant?: "outline" | "solid" | "ghost";
}

interface InputFieldProps {
  label?: string;
  placeholder?: string;
  type?: "text" | "email" | "password" | "tel" | "url" | "number";
  value: string;
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
  error?: string;
  hint?: string;
}

interface TextAreaProps {
  label?: string;
  placeholder?: string;
  value: string;
  onChange: (e: ChangeEvent<HTMLTextAreaElement>) => void;
  rows?: number;
  error?: string;
}

interface SelectOption {
  value: string;
  label: string;
}

interface SelectFieldProps {
  label?: string;
  options: SelectOption[];
  value: string;
  onChange: (e: ChangeEvent<HTMLSelectElement>) => void;
  placeholder?: string;
  error?: string;
}

interface CheckboxProps {
  label: string;
  checked: boolean;
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
}

type PillVariant = "default" | "active" | "nature" | "accent";

interface PillTagProps {
  label: string;
  variant?: PillVariant;
  onRemove?: () => void;
}

interface CTAEmailCaptureProps {
  headline?: string;
  subtext?: string;
  placeholder?: string;
}

interface CTAApplicationFormProps {
  title?: string;
  subtitle?: string;
  onSubmit?: (data: ApplicationFormData) => void;
}

interface ApplicationFormData {
  name: string;
  email: string;
  role: string;
  message: string;
  terms: boolean;
}

interface ArrowProps {
  dark?: boolean;
}

interface SectionLabelProps {
  children: ReactNode;
}

interface ContainerProps {
  children: ReactNode;
  className?: string;
}

interface SectionProps {
  children: ReactNode;
  className?: string;
  id?: string;
}

interface StackProps {
  children: ReactNode;
  spacing?: 2 | 3 | 4 | 6 | 8 | 10 | 12;
  className?: string;
}

interface GridProps {
  children: ReactNode;
  cols?: { default?: 1 | 2 | 3 | 4; sm?: 1 | 2 | 3 | 4; md?: 1 | 2 | 3 | 4; lg?: 1 | 2 | 3 | 4 };
  gap?: 4 | 6 | 8 | 10 | 12;
  className?: string;
}

interface HeroTemplateProps {
  eyebrow?: string;               // Optional label above title
  title: string | ReactNode;      // Can include JSX for accent words
  subtitle: string;
  primaryCTA?: ReactNode;
  secondaryCTA?: ReactNode;
  backgroundVideo?: string;
  backgroundImage?: string;
  videoControls?: boolean;
  stats?: Array<{ value: string; label: string }>;  // Optional stats row
}

interface Feature {
  icon?: ReactNode;
  title: string;
  description: string;
}

interface FeatureSectionProps {
  title?: string;
  subtitle?: string;
  features: Feature[];
  columns?: 2 | 3 | 4;
}

interface StatsSectionProps {
  stats: Array<{ value: string; label: string }>;
}

interface CTASectionProps {
  headline: string;
  subtext?: string;
  primaryCTA?: ReactNode;
  secondaryCTA?: ReactNode;
  variant?: "dark" | "light";
}

interface FeatureCardProps {
  number: string;
  title: string;
  description: string;
  linkText?: string;
  linkHref?: string;
}

// ─────────────────────────────────────────────
// 1. BUTTON — PRIMARY
//    Use: Main CTA, hero sections, key actions
// ─────────────────────────────────────────────
export function ButtonPrimary({ children, onClick, disabled, fullWidth }: ButtonBaseProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`
        group relative inline-flex items-center justify-center gap-2
        bg-[#141115] text-[#C8F04D]
        px-8 py-4
        text-sm font-semibold tracking-widest uppercase
        overflow-hidden
        transition-all duration-300 ease-out
        hover:bg-[#1E1B1F]
        active:scale-[0.97]
        disabled:opacity-40 disabled:cursor-not-allowed
        ${fullWidth ? "w-full" : ""}
      `}
      style={{ fontFamily: "'Inter', sans-serif" }}
    >
      {/* animated underline bar */}
      <span className="absolute bottom-0 left-0 h-[2px] w-0 bg-[#C8F04D] transition-all duration-500 group-hover:w-full" />
      {children}
      <Arrow />
    </button>
  );
}

// ─────────────────────────────────────────────
// 2. BUTTON — SECONDARY (outline)
//    Use: Alternative actions, less priority
// ─────────────────────────────────────────────
export function ButtonSecondary({ children, onClick, disabled, fullWidth, variant = "black" }: ButtonBaseProps) {
  const isWhite = variant === "white";
  
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`
        group relative inline-flex items-center justify-center gap-2
        border ${isWhite ? "border-[#E8E8E8] text-[#E8E8E8]" : "border-[#141115] text-[#141115]"} bg-transparent
        px-8 py-4
        text-sm font-semibold tracking-widest uppercase
        overflow-hidden
        transition-all duration-300 ease-out
        ${isWhite ? "hover:bg-[#E8E8E8] hover:text-[#141115]" : "hover:bg-[#141115] hover:text-[#C8F04D]"}
        active:scale-[0.97]
        disabled:opacity-40 disabled:cursor-not-allowed
        ${fullWidth ? "w-full" : ""}
      `}
      style={{ fontFamily: "'Inter', sans-serif" }}
    >
      {children}
      <Arrow />
    </button>
  );
}

// ─────────────────────────────────────────────
// 3. BUTTON — GHOST (minimal)
//    Use: Nav links, tertiary actions, text CTAs
// ─────────────────────────────────────────────
export function ButtonGhost({ children, onClick, disabled }: ButtonBaseProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="
        group inline-flex items-center gap-2
        text-sm font-semibold tracking-wider uppercase text-[#141115]
        relative pb-0.5
        transition-all duration-200
        hover:text-[#C8F04D]
        disabled:opacity-40 disabled:cursor-not-allowed
      "
      style={{ fontFamily: "'Inter', sans-serif" }}
    >
      {children}
      {/* animated underline */}
      <span className="absolute bottom-0 left-0 h-px w-0 bg-[#C8F04D] transition-all duration-300 group-hover:w-full" />
    </button>
  );
}

// ─────────────────────────────────────────────
// 4. BUTTON — ACCENT (lime pop)
//    Use: Hero primary CTA, "Apply Now", "Join"
// ─────────────────────────────────────────────
export function ButtonAccent({ children, onClick, disabled, fullWidth }: ButtonBaseProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`
        group relative inline-flex items-center justify-center gap-2
        bg-[#C8F04D] text-[#141115]
        px-8 py-4
        text-sm font-bold tracking-widest uppercase
        transition-all duration-300 ease-out
        hover:bg-[#b8e038] hover:shadow-lg hover:shadow-[#C8F04D]/30
        active:scale-[0.97]
        disabled:opacity-40 disabled:cursor-not-allowed
        ${fullWidth ? "w-full" : ""}
      `}
      style={{ fontFamily: "'Inter', sans-serif" }}
    >
      {children}
      <Arrow dark />
    </button>
  );
}

// ─────────────────────────────────────────────
// 5. BUTTON — ICON (square icon-only button)
//    Use: Social links, compact actions, toolbars
// ─────────────────────────────────────────────
export function ButtonIcon({ icon, onClick, label, variant = "outline" }: ButtonIconProps) {
  const base =
    "inline-flex items-center justify-center w-11 h-11 transition-all duration-200 active:scale-95";
  const variants: Record<NonNullable<ButtonIconProps["variant"]>, string> = {
    outline: "border border-[#141115] text-[#141115] hover:bg-[#141115] hover:text-white",
    solid: "bg-[#141115] text-white hover:bg-[#1E1B1F]",
    ghost: "text-[#141115] hover:bg-[#F5F5F5]",
  };
  return (
    <button onClick={onClick} aria-label={label} className={`${base} ${variants[variant]}`}>
      {icon}
    </button>
  );
}

// ─────────────────────────────────────────────
// 6. INPUT — TEXT FIELD
//    Use: Forms, search, sign-up flows
// ─────────────────────────────────────────────
export function InputField({
  label,
  placeholder,
  type = "text",
  value,
  onChange,
  error,
  hint,
}: InputFieldProps) {
  return (
    <div className="flex flex-col gap-1.5 w-full">
      {label && (
        <label
          className="text-xs font-semibold uppercase tracking-widest text-[#141115]"
          style={{ fontFamily: "'Inter', sans-serif" }}
        >
          {label}
        </label>
      )}
      <input
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className={`
          w-full bg-transparent border-b-2 py-3 px-0
          text-[#141115] text-base placeholder:text-[#6B6870]
          outline-none
          transition-all duration-200
          ${error
            ? "border-red-400 focus:border-red-500"
            : "border-[#6B6870] focus:border-[#141115]"
          }
        `}
        style={{ fontFamily: "'DM Sans', sans-serif" }}
      />
      {error && <p className="text-xs text-red-500 mt-0.5">{error}</p>}
      {hint && !error && <p className="text-xs text-[#6B6870] mt-0.5">{hint}</p>}
    </div>
  );
}

// ─────────────────────────────────────────────
// 7. INPUT — TEXTAREA
//    Use: Project descriptions, brand briefs
// ─────────────────────────────────────────────
export function TextArea({ label, placeholder, value, onChange, rows = 4, error }: TextAreaProps) {
  return (
    <div className="flex flex-col gap-1.5 w-full">
      {label && (
        <label
          className="text-xs font-semibold uppercase tracking-widest text-[#141115]"
          style={{ fontFamily: "'Inter', sans-serif" }}
        >
          {label}
        </label>
      )}
      <textarea
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        rows={rows}
        className={`
          w-full bg-[#F5F5F5] border-2 p-4 resize-none
          text-[#141115] text-base placeholder:text-[#6B6870]
          outline-none
          transition-all duration-200
          ${error
            ? "border-red-400 focus:border-red-500"
            : "border-transparent focus:border-[#141115]"
          }
        `}
        style={{ fontFamily: "'DM Sans', sans-serif" }}
      />
      {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
    </div>
  );
}

// ─────────────────────────────────────────────
// 8. SELECT FIELD
//    Use: Dropdowns — role, sport type, region
// ─────────────────────────────────────────────
export function SelectField({
  label,
  options,
  value,
  onChange,
  placeholder,
  error,
}: SelectFieldProps) {
  return (
    <div className="flex flex-col gap-1.5 w-full">
      {label && (
        <label
          className="text-xs font-semibold uppercase tracking-widest text-[#141115]"
          style={{ fontFamily: "'Inter', sans-serif" }}
        >
          {label}
        </label>
      )}
      <div className="relative">
        <select
          value={value}
          onChange={onChange}
          className="
            w-full bg-transparent border-b-2 border-[#6B6870]
            py-3 px-0 pr-8
            text-[#141115] text-base appearance-none
            outline-none cursor-pointer
            focus:border-[#141115]
            transition-all duration-200
          "
          style={{ fontFamily: "'DM Sans', sans-serif" }}
        >
          {placeholder && <option value="">{placeholder}</option>}
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        {/* custom chevron */}
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
      {error && <p className="text-xs text-red-500 mt-0.5">{error}</p>}
    </div>
  );
}

// ─────────────────────────────────────────────
// 9. CHECKBOX
//    Use: Terms & conditions, filters, settings
// ─────────────────────────────────────────────
export function Checkbox({ label, checked, onChange }: CheckboxProps) {
  return (
    <label className="inline-flex items-start gap-3 cursor-pointer group">
      <span className="relative mt-0.5 flex-shrink-0">
        <input type="checkbox" checked={checked} onChange={onChange} className="sr-only" />
        <span
          className={`
            block w-5 h-5 border-2 transition-all duration-200
            ${
              checked
                ? "bg-[#141115] border-[#141115]"
                : "bg-white border-[#6B6870] group-hover:border-[#141115]"
            }
          `}
        >
          {checked && (
            <svg
              className="absolute inset-0 w-full h-full p-0.5"
              viewBox="0 0 16 16"
              fill="none"
            >
              <path
                d="M3 8l3.5 3.5L13 5"
                stroke="#C8F04D"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          )}
        </span>
      </span>
      <span
        className="text-sm text-[#141115] leading-relaxed"
        style={{ fontFamily: "'DM Sans', sans-serif" }}
      >
        {label}
      </span>
    </label>
  );
}

// ─────────────────────────────────────────────
// 10. PILL / BADGE TAG
//     Use: Sport category, status tags, filters
// ─────────────────────────────────────────────
export function PillTag({ label, variant = "default", onRemove }: PillTagProps) {
  const variants: Record<PillVariant, string> = {
    default: "bg-[#F5F5F5] text-[#141115] border border-[#E8E8E8]",
    active: "bg-[#141115] text-[#C8F04D]",
    nature: "bg-[#C8F04D]/15 text-[#141115] border border-[#C8F04D]/30",
    accent: "bg-[#C8F04D] text-[#141115]",
  };
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-3 py-1 text-xs font-semibold uppercase tracking-wider ${variants[variant]}`}
      style={{ fontFamily: "'Inter', sans-serif" }}
    >
      {label}
      {onRemove && (
        <button onClick={onRemove} className="hover:opacity-60 transition-opacity">
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
            <path
              d="M2 2l8 8M10 2L2 10"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
          </svg>
        </button>
      )}
    </span>
  );
}

// ─────────────────────────────────────────────
// 11. CTA BANNER — inline email capture
//     Use: Homepage mid-section, footer CTA
// ─────────────────────────────────────────────
export function CTAEmailCapture({
  headline,
  subtext,
  placeholder = "Your email",
}: CTAEmailCaptureProps) {
  const [email, setEmail] = useState<string>("");
  const [submitted, setSubmitted] = useState<boolean>(false);

  const handleSubmit = (): void => {
    if (email) setSubmitted(true);
  };

  return (
    <div className="w-full bg-[#141115] px-8 py-12 md:py-16">
      <div className="max-w-2xl mx-auto text-center flex flex-col items-center gap-6">
        <h2
          className="text-3xl md:text-4xl font-bold text-white leading-tight"
          style={{ fontFamily: "'Inter', sans-serif" }}
        >
          {headline ?? "Connect. Create. Dominate."}
        </h2>
        {subtext && (
          <p
            className="text-[#6B6870] text-base max-w-md"
            style={{ fontFamily: "'DM Sans', sans-serif" }}
          >
            {subtext}
          </p>
        )}
        {submitted ? (
          <div
            className="flex items-center gap-2 text-[#C8F04D]"
            style={{ fontFamily: "'Inter', sans-serif" }}
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path
                d="M4 10l4.5 4.5L16 7"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <span className="text-sm font-semibold uppercase tracking-widest">
              You&apos;re in. We&apos;ll be in touch.
            </span>
          </div>
        ) : (
          <div className="flex w-full max-w-md gap-0">
            <input
              type="email"
              value={email}
              onChange={(e: ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
              placeholder={placeholder}
              onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
              className="
                flex-1 bg-white/10 border border-white/20 border-r-0
                px-4 py-3.5 text-white placeholder:text-white/40
                text-sm outline-none focus:bg-white/15
                transition-all duration-200
              "
              style={{ fontFamily: "'DM Sans', sans-serif" }}
            />
            <button
              onClick={handleSubmit}
              className="
                bg-[#C8F04D] text-[#141115] px-6 py-3.5
                text-xs font-bold uppercase tracking-widest
                hover:bg-[#b8e038] transition-colors duration-200
                flex-shrink-0
              "
              style={{ fontFamily: "'Inter', sans-serif" }}
            >
              Join
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// 12. CTA SECTION — full application / contact
//     Use: "Apply as athlete", "Partner with us"
// ─────────────────────────────────────────────
export function CTAApplicationForm({ title, subtitle, onSubmit }: CTAApplicationFormProps) {
  const [form, setForm] = useState<ApplicationFormData>({
    name: "",
    email: "",
    role: "",
    message: "",
    terms: false,
  });
  const [errors, setErrors] = useState<Partial<Record<keyof ApplicationFormData, string>>>({});
  const [submitted, setSubmitted] = useState<boolean>(false);

  const roles: SelectOption[] = [
    { value: "athlete", label: "Athlete" },
    { value: "brand", label: "Brand / Sponsor" },
    { value: "agency", label: "Creative Agency" },
    { value: "other", label: "Other" },
  ];

  const validate = (): Partial<Record<keyof ApplicationFormData, string>> => {
    const e: Partial<Record<keyof ApplicationFormData, string>> = {};
    if (!form.name.trim()) e.name = "Name is required";
    if (!form.email.trim() || !/\S+@\S+\.\S+/.test(form.email)) e.email = "Valid email required";
    if (!form.role) e.role = "Please select your role";
    if (!form.terms) e.terms = "You must agree to continue";
    return e;
  };

  const handleSubmit = (): void => {
    const e = validate();
    if (Object.keys(e).length) {
      setErrors(e);
      return;
    }
    setSubmitted(true);
    onSubmit?.(form);
  };

  // Generic setter for text/select inputs
  const setField =
    (field: keyof ApplicationFormData) =>
    (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>): void => {
      const val =
        e.target instanceof HTMLInputElement && e.target.type === "checkbox"
          ? (e.target as HTMLInputElement).checked
          : e.target.value;
      setForm((prev) => ({ ...prev, [field]: val }));
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    };

  // Dedicated setter for checkbox (ChangeEvent<HTMLInputElement>)
  const setCheckbox =
    (field: keyof ApplicationFormData) =>
    (e: ChangeEvent<HTMLInputElement>): void => {
      setForm((prev) => ({ ...prev, [field]: e.target.checked }));
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    };

  if (submitted) {
    return (
      <div className="w-full max-w-xl mx-auto text-center py-20 flex flex-col items-center gap-4">
        <span className="text-5xl">🌿</span>
        <h3
          className="text-2xl font-bold text-[#141115]"
          style={{ fontFamily: "'Inter', sans-serif" }}
        >
          Application received.
        </h3>
        <p className="text-[#6B6870] text-sm" style={{ fontFamily: "'DM Sans', sans-serif" }}>
          We&apos;ll review and get back to you within 48 hours.
        </p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-xl mx-auto py-12">
      {title && (
        <h2
          className="text-3xl font-bold text-[#141115] mb-2"
          style={{ fontFamily: "'Inter', sans-serif" }}
        >
          {title}
        </h2>
      )}
      {subtitle && (
        <p
          className="text-[#6B6870] text-sm mb-10"
          style={{ fontFamily: "'DM Sans', sans-serif" }}
        >
          {subtitle}
        </p>
      )}
      <div className="flex flex-col gap-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <InputField
            label="Full Name"
            placeholder="Alex Rivers"
            value={form.name}
            onChange={setField("name")}
            error={errors.name}
          />
          <InputField
            label="Email"
            type="email"
            placeholder="alex@domain.com"
            value={form.email}
            onChange={setField("email")}
            error={errors.email}
          />
        </div>
        <SelectField
          label="I am a..."
          options={roles}
          value={form.role}
          onChange={setField("role")}
          placeholder="Select your role"
          error={errors.role}
        />
        <TextArea
          label="Tell us about your project"
          placeholder="Describe what you're working on, what you're looking for..."
          value={form.message}
          onChange={setField("message")}
          rows={4}
        />
        <Checkbox
          checked={form.terms}
          onChange={setCheckbox("terms")}
          label="I agree to the NatureHood Terms of Service and Privacy Policy"
        />
        {errors.terms && <p className="text-xs text-red-500 -mt-6">{errors.terms}</p>}
        <ButtonAccent onClick={handleSubmit} fullWidth>
          Submit Application
        </ButtonAccent>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// 13. LAYOUT — CONTAINER
//     Use: Wrap all sections for consistent max-width & padding
// ─────────────────────────────────────────────
export function Container({ children, className = "" }: ContainerProps) {
  return (
    <div className={`w-full max-w-7xl mx-auto px-4 sm:px-6 md:px-8 lg:px-12 ${className}`}>
      {children}
    </div>
  );
}

// ─────────────────────────────────────────────
// 14. LAYOUT — SECTION
//     Use: Wrap content blocks for consistent vertical spacing
// ─────────────────────────────────────────────
export function Section({ children, className = "", id }: SectionProps) {
  return (
    <section id={id} className={`py-12 sm:py-16 md:py-20 lg:py-24 ${className}`}>
      {children}
    </section>
  );
}

// ─────────────────────────────────────────────
// 15. LAYOUT — STACK
//     Use: Vertical spacing between elements
// ─────────────────────────────────────────────
export function Stack({ children, spacing = 4, className = "" }: StackProps) {
  return (
    <div className={`flex flex-col gap-${spacing} ${className}`}>
      {children}
    </div>
  );
}

// ─────────────────────────────────────────────
// 16. LAYOUT — GRID
//     Use: Responsive grid layouts
// ─────────────────────────────────────────────
export function Grid({
  children,
  cols = { default: 1, md: 2, lg: 3 },
  gap = 6,
  className = ""
}: GridProps) {
  const colsDefault = cols.default || 1;
  const colsSm = cols.sm || colsDefault;
  const colsMd = cols.md || colsSm;
  const colsLg = cols.lg || colsMd;

  return (
    <div
      className={`grid grid-cols-${colsDefault} ${colsSm !== colsDefault ? `sm:grid-cols-${colsSm}` : ''} ${colsMd !== colsSm ? `md:grid-cols-${colsMd}` : ''} ${colsLg !== colsMd ? `lg:grid-cols-${colsLg}` : ''} gap-${gap} ${className}`}
    >
      {children}
    </div>
  );
}

// ─────────────────────────────────────────────
// 17. TEMPLATE — HERO SECTION
//     Use: Main hero section with background video/image
//     Design: Inter 900 ExtraBold hero title, DM Sans body
// ─────────────────────────────────────────────
export function HeroTemplate({
  eyebrow,
  title,
  subtitle,
  primaryCTA,
  secondaryCTA,
  backgroundVideo,
  backgroundImage,
  videoControls = false,
  stats,
}: HeroTemplateProps) {
  const isDevelopment = process.env.NODE_ENV === 'development';

  return (
    <section className="relative w-full flex h-[500px] md:h-[700px] lg:h-[900px] overflow-hidden bg-[#141115]">
      {/* Background Media */}
      {backgroundVideo && (
        <video
          src={backgroundVideo}
          autoPlay={!isDevelopment}
          loop
          muted
          playsInline
          controls={videoControls || isDevelopment}
          className="absolute inset-0 object-cover w-full h-full opacity-20"
        />
      )}
      {backgroundImage && !backgroundVideo && (
        <div
          className="absolute inset-0 w-full h-full opacity-40 bg-cover bg-center"
          style={{ backgroundImage: `url(${backgroundImage})` }}
        />
      )}

      {/* Accent Edge (optional design element) */}
      <div className="absolute top-0 left-0 w-1 h-full bg-[#C8F04D] z-10" />

      {/* Content */}
      <div className="absolute inset-0 flex flex-col justify-start pt-20 sm:pt-28 md:pt-32 lg:pt-40 px-6 sm:px-8 md:px-12 lg:px-16">
        <Container>
          <div className="text-left max-w-4xl">

            {/* Eyebrow Label */}
            {eyebrow && (
              <p
                className="mb-5 md:mb-6"
                style={{
                  fontFamily: "'DM Sans', sans-serif",
                  fontSize: '10px',
                  fontWeight: '600',
                  letterSpacing: '0.4em',
                  textTransform: 'uppercase',
                  color: '#C8F04D',
                }}
              >
                {eyebrow}
              </p>
            )}

            {/* Hero Title - Inter 900 ExtraBold */}
            <h1
              className="mb-7 md:mb-8"
              style={{
                fontFamily: "'Inter', sans-serif",
                fontSize: 'clamp(2.75rem, 9vw, 6.25rem)',  // 44px - 100px
                fontWeight: '900',
                lineHeight: '0.95',
                letterSpacing: '-0.02em',
                color: '#F4F4F4',
              }}
            >
              {title}
            </h1>

            {/* Subtitle - DM Sans 400 */}
            <p
              className="mb-11 max-w-xl md:max-w-2xl"
              style={{
                fontFamily: "'DM Sans', sans-serif",
                fontSize: 'clamp(0.9375rem, 2vw, 1.125rem)',  // 15px - 18px
                fontWeight: '400',
                lineHeight: '1.75',
                color: '#A09EA3',
              }}
            >
              {subtitle}
            </p>

            {/* CTAs */}
            {(primaryCTA || secondaryCTA) && (
              <div className="flex flex-col sm:flex-row gap-3 mb-14 md:mb-16">
                {primaryCTA}
                {secondaryCTA}
              </div>
            )}

            {/* Stats Row (optional) */}
            {stats && stats.length > 0 && (
              <div className="flex flex-wrap gap-8 md:gap-10 pt-8 border-t border-[#3A373C]">
                {stats.map((stat, i) => (
                  <div key={i}>
                    <div
                      style={{
                        fontFamily: "'Inter', sans-serif",
                        fontSize: 'clamp(1.875rem, 4vw, 2.375rem)',  // 30px - 38px
                        fontWeight: '700',
                        lineHeight: '1',
                        letterSpacing: '-0.02em',
                        color: '#F5F5F5',
                        marginBottom: '0.25rem',
                      }}
                    >
                      {stat.value}
                    </div>
                    <div
                      style={{
                        fontFamily: "'DM Sans', sans-serif",
                        fontSize: '10px',
                        fontWeight: '500',
                        letterSpacing: '0.2em',
                        textTransform: 'uppercase',
                        color: '#6B6870',
                      }}
                    >
                      {stat.label}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </Container>
      </div>
    </section>
  );
}

// ─────────────────────────────────────────────
// 18. TEMPLATE — FEATURE SECTION
//     Use: Display features in a grid layout
// ─────────────────────────────────────────────
export function FeatureSection({
  title,
  subtitle,
  features,
  columns = 3,
}: FeatureSectionProps) {
  return (
    <Section>
      <Container>
        {title && (
          <div className="text-center mb-12 md:mb-16">
            <h2
              className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-4"
              style={{ fontFamily: "'Inter', sans-serif" }}
            >
              {title}
            </h2>
            {subtitle && (
              <p
                className="text-base sm:text-lg md:text-xl text-[#6B6870] max-w-2xl mx-auto"
                style={{ fontFamily: "'DM Sans', sans-serif" }}
              >
                {subtitle}
              </p>
            )}
          </div>
        )}
        <div className={`grid grid-cols-1 ${columns === 2 ? 'md:grid-cols-2' : columns === 3 ? 'md:grid-cols-2 lg:grid-cols-3' : 'md:grid-cols-2 lg:grid-cols-4'} gap-8 md:gap-10`}>
          {features.map((feature, i) => (
            <div key={i} className="flex flex-col gap-4">
              {feature.icon && (
                <div className="text-[#C8F04D] w-12 h-12 flex items-center justify-center">
                  {feature.icon}
                </div>
              )}
              <h3
                className="text-xl sm:text-2xl font-semibold text-white"
                style={{ fontFamily: "'Inter', sans-serif" }}
              >
                {feature.title}
              </h3>
              <p
                className="text-sm sm:text-base text-[#6B6870] leading-relaxed"
                style={{ fontFamily: "'DM Sans', sans-serif" }}
              >
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </Container>
    </Section>
  );
}

// ─────────────────────────────────────────────
// 19. TEMPLATE — STATS SECTION
//     Use: Display key metrics/numbers
// ─────────────────────────────────────────────
export function StatsSection({ stats }: StatsSectionProps) {
  return (
    <Section className="bg-[#1E1B1F]">
      <Container>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12">
          {stats.map((stat, i) => (
            <div key={i} className="text-center">
              <div
                className="text-4xl sm:text-5xl md:text-6xl font-bold text-[#C8F04D] mb-2"
                style={{ fontFamily: "'Inter', sans-serif" }}
              >
                {stat.value}
              </div>
              <p
                className="text-sm sm:text-base text-[#6B6870] uppercase tracking-wider"
                style={{ fontFamily: "'DM Sans', sans-serif" }}
              >
                {stat.label}
              </p>
            </div>
          ))}
        </div>
      </Container>
    </Section>
  );
}

// ─────────────────────────────────────────────
// 20. TEMPLATE — CTA SECTION
//     Use: Call-to-action section with buttons
// ─────────────────────────────────────────────
export function CTASection({
  headline,
  subtext,
  primaryCTA,
  secondaryCTA,
  variant = "dark",
}: CTASectionProps) {
  return (
    <Section className={variant === "dark" ? "bg-[#141115]" : "bg-[#F5F5F5]"}>
      <Container>
        <div className="text-center max-w-3xl mx-auto">
          <h2
            className={`text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-6 ${variant === "dark" ? "text-white" : "text-[#141115]"}`}
            style={{ fontFamily: "'Inter', sans-serif" }}
          >
            {headline}
          </h2>
          {subtext && (
            <p
              className={`text-base sm:text-lg md:text-xl mb-8 ${variant === "dark" ? "text-[#6B6870]" : "text-[#6B6870]"}`}
              style={{ fontFamily: "'DM Sans', sans-serif" }}
            >
              {subtext}
            </p>
          )}
          {(primaryCTA || secondaryCTA) && (
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              {primaryCTA}
              {secondaryCTA}
            </div>
          )}
        </div>
      </Container>
    </Section>
  );
}

// ─────────────────────────────────────────────
// 21. COMPONENT — FEATURE CARD
//     Use: Numbered feature cards with description and link
// ─────────────────────────────────────────────
export function FeatureCard({
  number,
  title,
  description,
  linkText,
  linkHref,
}: FeatureCardProps) {
  return (
    <div className="bg-white p-8 md:p-10 border border-[#E8E8E8] hover:border-[#C8F04D] transition-all duration-300">
      {/* Numbered Badge */}
      <div
        className="inline-block bg-[#141115] text-[#C8F04D] px-3 py-1 mb-6"
        style={{ fontFamily: "'Inter', sans-serif" }}
      >
        <span className="text-[11px] font-bold tracking-[0.2em]">{number}</span>
      </div>

      {/* Title */}
      <h3
        className="text-2xl font-bold mb-4 leading-tight"
        style={{
          fontFamily: "'Inter', sans-serif",
          letterSpacing: "-0.01em",
        }}
      >
        {title}
      </h3>

      {/* Description */}
      <p
        className="text-[13px] text-[#6B6870] leading-relaxed mb-6"
        style={{ fontFamily: "'DM Sans', sans-serif" }}
      >
        {description}
      </p>

      {/* Link */}
      {linkText && linkHref && (
        <a
          href={linkHref}
          className="inline-flex items-center text-[10px] font-semibold tracking-[0.2em] uppercase text-[#141115] border-b border-[#C8F04D] pb-0.5 hover:text-[#C8F04D] transition-colors"
          style={{ fontFamily: "'DM Sans', sans-serif" }}
        >
          {linkText} →
        </a>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────
// SHARED UTILITIES
// ─────────────────────────────────────────────
function Arrow({ dark = false }: ArrowProps) {
  return (
    <svg
      className="w-3.5 h-3.5 transition-transform duration-200 group-hover:translate-x-1"
      viewBox="0 0 14 14"
      fill="none"
    >
      <path
        d="M1 7h12M8 2l5 5-5 5"
        stroke={dark ? "#141115" : "currentColor"}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function SectionLabel({ children }: SectionLabelProps) {
  return (
    <div className="flex items-center gap-4 mb-8">
      <p
        className="text-xs font-semibold uppercase tracking-[0.3em] text-[#6B6870]"
        style={{ fontFamily: "'Inter', sans-serif" }}
      >
        {children}
      </p>
      <span className="flex-1 h-px bg-[#E8E8E8]" />
    </div>
  );
}

// ─────────────────────────────────────────────
// PREVIEW PAGE — remove in production
// Place at: app/design-system/page.tsx
// ─────────────────────────────────────────────
export default function NatureHoodComponentPreview() {
  const [checked, setChecked] = useState<boolean>(false);
  const [inputVal, setInputVal] = useState<string>("");

  return (
    <div
      className="min-h-screen bg-[#F5F5F5] p-8 md:p-16"
      style={{ fontFamily: "'DM Sans', sans-serif" }}
    >
      {/* Google Fonts — replace with next/font in production */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:wght@300;400;500;600&display=swap');
      `}</style>

      {/* Header */}
      <div className="max-w-4xl mx-auto mb-16">
        <p
          className="text-xs font-semibold uppercase tracking-[0.3em] text-[#6B6870] mb-3"
          style={{ fontFamily: "'Inter', sans-serif" }}
        >
          NatureHoodOfficial
        </p>
        <h1
          className="text-5xl md:text-6xl font-bold text-[#141115] leading-none"
          style={{ fontFamily: "'Inter', sans-serif" }}
        >
          Component Library
        </h1>
        <p className="text-[#6B6870] mt-4 text-lg">CTA · Buttons · Forms · Tags</p>
      </div>

      <div className="max-w-4xl mx-auto space-y-20">

        {/* BUTTONS */}
        <section>
          <SectionLabel>Buttons</SectionLabel>
          <div className="flex flex-wrap gap-4 items-center">
            <ButtonPrimary>Apply Now</ButtonPrimary>
            <ButtonSecondary>Learn More</ButtonSecondary>
            <ButtonAccent>Join NatureHood</ButtonAccent>
            <ButtonGhost>View Projects</ButtonGhost>
            <ButtonIcon
              label="Close"
              icon={
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path
                    d="M3 3l10 10M13 3L3 13"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                  />
                </svg>
              }
            />
            <ButtonIcon
              variant="solid"
              label="Add"
              icon={
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path
                    d="M8 3v10M3 8h10"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                  />
                </svg>
              }
            />
          </div>
          {/* disabled states */}
          <div className="flex flex-wrap gap-4 items-center mt-4">
            <ButtonPrimary disabled>Disabled Primary</ButtonPrimary>
            <ButtonSecondary disabled>Disabled Secondary</ButtonSecondary>
          </div>
        </section>

        {/* PILL TAGS */}
        <section>
          <SectionLabel>Tags & Pills</SectionLabel>
          <div className="flex flex-wrap gap-3">
            <PillTag label="Trail Running" />
            <PillTag label="Active" variant="active" />
            <PillTag label="Sustainability" variant="nature" />
            <PillTag label="Featured" variant="accent" />
            <PillTag label="Climbing" onRemove={() => {}} />
          </div>
        </section>

        {/* FORM FIELDS */}
        <section>
          <SectionLabel>Form Inputs</SectionLabel>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 max-w-2xl">
            <InputField
              label="Full Name"
              placeholder="Alex Rivers"
              value={inputVal}
              onChange={(e) => setInputVal(e.target.value)}
              hint="As it appears on your profile"
            />
            <InputField
              label="Email Address"
              type="email"
              placeholder="alex@domain.com"
              value=""
              onChange={() => {}}
              error="Please enter a valid email"
            />
            <SelectField
              label="Role"
              options={[
                { value: "athlete", label: "Athlete" },
                { value: "brand", label: "Brand / Sponsor" },
                { value: "agency", label: "Creative Agency" },
              ]}
              value=""
              onChange={() => {}}
              placeholder="Select your role"
            />
            <div className="flex flex-col gap-4 pt-2">
              <Checkbox
                label="Subscribe to project opportunities"
                checked={checked}
                onChange={(e) => setChecked(e.target.checked)}
              />
              <Checkbox
                label="I agree to the Terms of Service"
                checked={false}
                onChange={() => {}}
              />
            </div>
          </div>
          <div className="mt-8 max-w-2xl">
            <TextArea
              label="Project Brief"
              placeholder="Describe your creative project, goals, and what kind of athletes or brands you're looking for..."
              value=""
              onChange={() => {}}
            />
          </div>
        </section>

        {/* CTA EMAIL BANNER */}
        <section>
          <SectionLabel>CTA Email Banner</SectionLabel>
          <CTAEmailCapture
            headline="Connect. Create. Dominate."
            subtext="Join athletes and brands building the next generation of creative projects."
            placeholder="Your email address"
          />
        </section>

        {/* APPLICATION FORM */}
        <section>
          <SectionLabel>Application Form</SectionLabel>
          <div className="bg-white p-8 md:p-12 border border-[#E8E8E8]">
            <CTAApplicationForm
              title="Start a Project"
              subtitle="Tell us who you are and what you're building."
            />
          </div>
        </section>
      </div>

      {/* DESIGN TOKEN REFERENCE */}
      <div className="max-w-4xl mx-auto mt-24 pt-8 border-t border-[#E8E8E8]">
        <p
          className="text-xs text-[#6B6870] mb-4"
          style={{ fontFamily: "'Inter', sans-serif" }}
        >
          DESIGN TOKENS
        </p>
        <div className="flex flex-wrap gap-6">
          {(
            [
              { name: "Ink",       hex: "#141115", border: false },
              { name: "Cloud",     hex: "#F5F5F5", border: true  },
              { name: "Surface 1", hex: "#1E1B1F", border: false },
              { name: "Surface 2", hex: "#2A272C", border: false },
              { name: "Border",    hex: "#3A373C", border: false },
              { name: "Muted",     hex: "#E8E8E8", border: true  },
              { name: "Text Sec.", hex: "#6B6870", border: false },
              { name: "Disabled",  hex: "#A09EA3", border: false },
              { name: "Accent",    hex: "#C8F04D", border: false },
              { name: "Warning",   hex: "#F5A623", border: false },
              { name: "Error",     hex: "#FF4D4D", border: false },
              { name: "Info",      hex: "#4DA6FF", border: false },
            ] satisfies { name: string; hex: string; border: boolean }[]
          ).map((c) => (
            <div key={c.name} className="flex items-center gap-2">
              <span
                className={`w-8 h-8 flex-shrink-0 ${c.border ? "border border-[#E8E8E8]" : ""}`}
                style={{ backgroundColor: c.hex }}
              />
              <div>
                <p
                  className="text-xs font-semibold text-[#141115]"
                  style={{ fontFamily: "'Inter', sans-serif" }}
                >
                  {c.name}
                </p>
                <p className="text-xs text-[#6B6870]">{c.hex}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}