"use client";

import { ReactNode, ChangeEvent } from "react";
import { cn } from "@/lib/utils";

// ─────────────────────────────────────────────
// INTERFACES
// ─────────────────────────────────────────────

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

// ─────────────────────────────────────────────
// INPUT FIELD (light mode)
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
          className="text-[11px] font-normal uppercase tracking-[0.04em] text-[#141115]"
          style={{ fontFamily: "'Sk Modernist', sans-serif" }}
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
          w-full bg-[#F5F5F5] border rounded-lg px-[14px] py-3
          text-[#141115] text-[14px] placeholder:text-[#6B6870]
          outline-none
          [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none
          transition-colors duration-200
          ${error
            ? "border-red-400 focus:border-red-500"
            : "border-[#3D3940] focus:border-[#141115]"
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
// TEXTAREA
// ─────────────────────────────────────────────

export function TextArea({ label, placeholder, value, onChange, rows = 4, error }: TextAreaProps) {
  return (
    <div className="flex flex-col gap-1.5 w-full">
      {label && (
        <label
          className="text-[11px] font-normal uppercase tracking-[0.04em] text-[#141115]"
          style={{ fontFamily: "'Sk Modernist', sans-serif" }}
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
// SELECT FIELD
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
          className="text-[11px] font-normal uppercase tracking-[0.04em] text-[#141115]"
          style={{ fontFamily: "'Sk Modernist', sans-serif" }}
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
// CHECKBOX
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
                stroke="#F5F5F5"
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
// DARK MODE FORM COMPONENTS
// Shared across signup, login, and other dark-themed pages
// ─────────────────────────────────────────────

export function InputDark({
  label,
  name,
  type = "text",
  value,
  onChange,
  error,
  placeholder,
  required,
  inputMode,
  maxLength,
  disabled,
  readOnly,
}: {
  label: string;
  name: string;
  type?: string;
  value: string;
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
  error?: string;
  placeholder?: string;
  required?: boolean;
  inputMode?: "text" | "numeric" | "decimal";
  maxLength?: number;
  disabled?: boolean;
  readOnly?: boolean;
}) {
  return (
    <div className="flex flex-col gap-2">
      <label
        htmlFor={name}
        className="text-[11px] font-normal tracking-[0.04em] uppercase text-[#6B6870]"
        style={{ fontFamily: "'Sk Modernist', sans-serif" }}
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
        inputMode={inputMode}
        maxLength={maxLength}
        disabled={disabled}
        readOnly={readOnly}
        className={`w-full bg-[#1E1B1F] border-none rounded-full px-6 py-3.5 text-[14px] text-white placeholder:text-[#6B6870] outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none transition-all duration-200 focus:ring-1 focus:ring-white/20 ${
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

export function SelectDark({
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
        className="text-[11px] font-normal tracking-[0.04em] uppercase text-[#6B6870]"
        style={{ fontFamily: "'Sk Modernist', sans-serif" }}
      >
        {label}
      </label>
      <div className="relative">
        <select
          id={name}
          name={name}
          value={value}
          onChange={onChange}
          className={`w-full bg-[#1E1B1F] border-none rounded-full px-6 py-3.5 pr-10 appearance-none cursor-pointer text-[14px] text-white outline-none transition-all duration-200 focus:ring-1 focus:ring-white/20 ${
            error ? "ring-1 ring-[#FF4D4D]" : ""
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
        <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-[#6B6870]">
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

export function TextAreaDark({
  label,
  name,
  value,
  onChange,
  placeholder,
  rows = 4,
  error,
  required,
  readOnly,
}: {
  label: string;
  name: string;
  value: string;
  onChange: (e: ChangeEvent<HTMLTextAreaElement>) => void;
  placeholder?: string;
  rows?: number;
  error?: string;
  required?: boolean;
  readOnly?: boolean;
}) {
  return (
    <div className="flex flex-col gap-2">
      <label
        htmlFor={name}
        className="text-[11px] font-normal tracking-[0.04em] uppercase text-[#6B6870]"
        style={{ fontFamily: "'Sk Modernist', sans-serif" }}
      >
        {label} {required && <span className="text-[#F5F5F5]">*</span>}
      </label>
      <textarea
        id={name}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        rows={rows}
        readOnly={readOnly}
        className={`w-full bg-[#1E1B1F] border-none rounded-2xl px-6 py-4 text-[14px] text-white placeholder:text-[#6B6870] outline-none resize-none transition-all duration-200 focus:ring-1 focus:ring-white/20 ${
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

export function CheckboxDark({
  label,
  checked,
  onChange,
  error,
}: {
  label: ReactNode;
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
                ? "bg-[#F5F5F5] border-[#F5F5F5]"
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

// Mirrors naturehood-mobile `@/components/ui/switch`
export function SwitchDark({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: ReactNode;
}) {
  return (
    <label className="inline-flex items-center gap-3 cursor-pointer">
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={`flex h-[1.15rem] w-8 shrink-0 items-center rounded-full border border-transparent px-px transition-colors duration-200 outline-none focus-visible:ring-[3px] focus-visible:ring-[#009245]/50 ${
          checked ? "bg-[#F5F5F5]" : "bg-[#3D3940]"
        }`}
      >
        <span
          className={`block size-4 rounded-full transition-transform duration-200 ${
            checked ? "translate-x-3.5 bg-[#141115]" : "translate-x-0 bg-white"
          }`}
        />
      </button>
      {label && (
        <span
          className="text-[13px] text-[#847E89]"
          style={{ fontFamily: "'DM Sans', sans-serif" }}
        >
          {label}
        </span>
      )}
    </label>
  );
}

// ─────────────────────────────────────────────
// INLINE FIELDS (Linear-style, borderless until hover/focus)
//    Use: dense editable tables and property lists on dark platform pages
// ─────────────────────────────────────────────

export function InputInline({
  value,
  onValueChange,
  type = "text",
  placeholder,
  ariaLabel,
  step,
  min,
  max,
  align = "left",
  className,
}: {
  value: string | number | null | undefined;
  onValueChange: (value: string) => void;
  type?: "text" | "number";
  placeholder?: string;
  ariaLabel?: string;
  step?: number | string;
  min?: number;
  max?: number;
  align?: "left" | "right";
  className?: string;
}) {
  return (
    <input
      type={type}
      inputMode={type === "number" ? "decimal" : undefined}
      value={value ?? ""}
      onChange={(e) => onValueChange(e.target.value)}
      placeholder={placeholder}
      aria-label={ariaLabel ?? placeholder}
      step={step}
      min={min}
      max={max}
      className={cn(
        "h-8 w-full min-w-0 rounded-md border border-transparent bg-transparent px-2 text-[13px] text-white tabular-nums outline-none transition-colors duration-150",
        "placeholder:text-[#6B6870] hover:border-[#3D3940] focus:border-[#847E89] focus:bg-[#1E1B1F]",
        "[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none",
        align === "right" && "text-right",
        className,
      )}
      style={{ fontFamily: "'DM Sans', sans-serif" }}
    />
  );
}

export function TextAreaInline({
  value,
  onValueChange,
  placeholder,
  ariaLabel,
  className,
}: {
  value: string | null | undefined;
  onValueChange: (value: string) => void;
  placeholder?: string;
  ariaLabel?: string;
  className?: string;
}) {
  return (
    <textarea
      value={value ?? ""}
      onChange={(e) => onValueChange(e.target.value)}
      placeholder={placeholder}
      aria-label={ariaLabel ?? placeholder}
      rows={2}
      className={cn(
        "field-sizing-content min-h-[3.25rem] w-full resize-none rounded-md border border-transparent bg-transparent px-2 py-1.5 text-[14px] leading-relaxed text-[#E8E8E8] outline-none transition-colors duration-150",
        "placeholder:text-[#6B6870] hover:border-[#3D3940] focus:border-[#847E89] focus:bg-[#1E1B1F]",
        className,
      )}
      style={{ fontFamily: "'DM Sans', sans-serif" }}
    />
  );
}
