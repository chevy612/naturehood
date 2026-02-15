"use client";

// ============================================================
// NATUREHOODOFFICIAL — components/forms/form-ui.tsx
// Shared Form UI Components (Light & Dark Mode)
// ============================================================

import { ChangeEvent, ReactNode } from "react";

// ─────────────────────────────────────────────────────────────
// MODE COLOR MAPPING
// ─────────────────────────────────────────────────────────────

type FormMode = "light" | "dark";

const modeColors = {
  light: {
    label: "#141115",
    input: "#141115",
    placeholder: "#A09EA3",
    border: "#6B6870",
    borderFocus: "#141115",
    required: "#FF4D4D",
    error: "#FF4D4D",
    textareaBg: "#FFFFFF",
    textareaBorder: "#E8E8E8",
    checkBg: "#141115",
    checkStroke: "#C8F04D",
    sectionTitle: "#141115",
    sectionDesc: "#6B6870",
    sectionBorder: "#E8E8E8",
  },
  dark: {
    label: "#6B6870",
    input: "#FFFFFF",
    placeholder: "#3A373C",
    border: "#3A373C",
    borderFocus: "#C8F04D",
    required: "#C8F04D",
    error: "#FF4D4D",
    textareaBg: "#1E1B1F",
    textareaBorder: "transparent",
    checkBg: "#C8F04D",
    checkStroke: "#141115",
    sectionTitle: "#FFFFFF",
    sectionDesc: "#6B6870",
    sectionBorder: "#3A373C",
  },
};

// ─────────────────────────────────────────────────────────────
// 1. FORM INPUT
// ─────────────────────────────────────────────────────────────

interface FormInputProps {
  label: string;
  name: string;
  type?: string;
  value: string;
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
  error?: string;
  placeholder?: string;
  required?: boolean;
  mode?: FormMode;
  show?: boolean;
}

export function FormInput({
  label,
  name,
  type = "text",
  value,
  onChange,
  error,
  placeholder,
  required,
  mode = "light",
  show = true,
}: FormInputProps) {
  const c = modeColors[mode];

  if (!show) return null;

  return (
    <div className="flex flex-col gap-2">
      <label
        htmlFor={name}
        className="text-[10px] font-semibold tracking-[0.3em] uppercase"
        style={{ fontFamily: "'DM Sans', sans-serif", color: c.label }}
      >
        {label} {required && <span style={{ color: c.required }}>*</span>}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        className="w-full bg-transparent border-b-2 py-3 px-0 text-[15px] outline-none transition-colors duration-200"
        style={{
          fontFamily: "'DM Sans', sans-serif",
          color: c.input,
          borderBottomColor: error ? c.error : c.border,
        }}
        onFocus={(e) => {
          if (!error) e.currentTarget.style.borderBottomColor = c.borderFocus;
        }}
        onBlur={(e) => {
          if (!error) e.currentTarget.style.borderBottomColor = c.border;
        }}
      />
      {error && (
        <p
          className="text-[11px]"
          style={{ fontFamily: "'DM Sans', sans-serif", color: c.error }}
        >
          {error}
        </p>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// 2. FORM SELECT
// ─────────────────────────────────────────────────────────────

interface FormSelectProps {
  label: string;
  name: string;
  options: { value: string; label: string }[];
  value: string;
  onChange: (e: ChangeEvent<HTMLSelectElement>) => void;
  error?: string;
  placeholder?: string;
  required?: boolean;
  mode?: FormMode;
  show?: boolean;
}

export function FormSelect({
  label,
  name,
  options,
  value,
  onChange,
  error,
  placeholder,
  required,
  mode = "light",
  show = true,
}: FormSelectProps) {
  const c = modeColors[mode];

  if (!show) return null;

  return (
    <div className="flex flex-col gap-2">
      <label
        htmlFor={name}
        className="text-[10px] font-semibold tracking-[0.3em] uppercase"
        style={{ fontFamily: "'DM Sans', sans-serif", color: c.label }}
      >
        {label} {required && <span style={{ color: c.required }}>*</span>}
      </label>
      <div className="relative">
        <select
          id={name}
          name={name}
          value={value}
          onChange={onChange}
          required={required}
          className="w-full bg-transparent border-b-2 py-3 pr-8 appearance-none cursor-pointer text-[15px] outline-none transition-colors duration-200"
          style={{
            fontFamily: "'DM Sans', sans-serif",
            color: c.input,
            borderBottomColor: error ? c.error : c.border,
          }}
          onFocus={(e) => {
            if (!error) e.currentTarget.style.borderBottomColor = c.borderFocus;
          }}
          onBlur={(e) => {
            if (!error) e.currentTarget.style.borderBottomColor = c.border;
          }}
        >
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {options.map((opt) => (
            <option
              key={opt.value}
              value={opt.value}
              className={mode === "dark" ? "bg-[#141115]" : ""}
            >
              {opt.label}
            </option>
          ))}
        </select>
        <span
          className="pointer-events-none absolute right-0 top-1/2 -translate-y-1/2"
          style={{ color: c.label }}
        >
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
          className="text-[11px]"
          style={{ fontFamily: "'DM Sans', sans-serif", color: c.error }}
        >
          {error}
        </p>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// 3. FORM TEXTAREA
// ─────────────────────────────────────────────────────────────

interface FormTextAreaProps {
  label: string;
  name: string;
  value: string;
  onChange: (e: ChangeEvent<HTMLTextAreaElement>) => void;
  error?: string;
  placeholder?: string;
  rows?: number;
  required?: boolean;
  mode?: FormMode;
  show?: boolean;
}

export function FormTextArea({
  label,
  name,
  value,
  onChange,
  error,
  placeholder,
  rows = 4,
  required,
  mode = "light",
  show = true,
}: FormTextAreaProps) {
  const c = modeColors[mode];

  if (!show) return null;

  return (
    <div className="flex flex-col gap-2">
      <label
        htmlFor={name}
        className="text-[10px] font-semibold tracking-[0.3em] uppercase"
        style={{ fontFamily: "'DM Sans', sans-serif", color: c.label }}
      >
        {label} {required && <span style={{ color: c.required }}>*</span>}
      </label>
      <textarea
        id={name}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        rows={rows}
        required={required}
        className="w-full border-2 p-4 resize-none text-[15px] outline-none transition-colors duration-200"
        style={{
          fontFamily: "'DM Sans', sans-serif",
          color: c.input,
          backgroundColor: c.textareaBg,
          borderColor: error ? c.error : c.textareaBorder,
        }}
        onFocus={(e) => {
          if (!error) e.currentTarget.style.borderColor = c.borderFocus;
        }}
        onBlur={(e) => {
          if (!error) e.currentTarget.style.borderColor = c.textareaBorder;
        }}
      />
      {error && (
        <p
          className="text-[11px]"
          style={{ fontFamily: "'DM Sans', sans-serif", color: c.error }}
        >
          {error}
        </p>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// 4. FORM CHECKBOX GROUP
// ─────────────────────────────────────────────────────────────

interface FormCheckboxGroupProps {
  label: string;
  name: string;
  options: { value: string; label: string }[];
  selected: string[];
  onChange: (selected: string[]) => void;
  error?: string;
  mode?: FormMode;
  show?: boolean;
}

export function FormCheckboxGroup({
  label,
  name,
  options,
  selected,
  onChange,
  error,
  mode = "light",
  show = true,
}: FormCheckboxGroupProps) {
  const c = modeColors[mode];

  const toggle = (value: string) => {
    if (selected.includes(value)) {
      onChange(selected.filter((v) => v !== value));
    } else {
      onChange([...selected, value]);
    }
  };

  if (!show) return null;

  return (
    <div className="flex flex-col gap-3">
      <label
        className="text-[10px] font-semibold tracking-[0.3em] uppercase"
        style={{ fontFamily: "'DM Sans', sans-serif", color: c.label }}
      >
        {label}
      </label>
      <div className="flex flex-col gap-3 mt-1">
        {options.map((opt) => {
          const isChecked = selected.includes(opt.value);
          return (
            <label
              key={opt.value}
              className="inline-flex items-center gap-3 cursor-pointer group"
            >
              <span className="relative flex-shrink-0">
                <input
                  type="checkbox"
                  name={name}
                  value={opt.value}
                  checked={isChecked}
                  onChange={() => toggle(opt.value)}
                  className="sr-only"
                />
                <span
                  className="block w-5 h-5 border-2 transition-all duration-200"
                  style={{
                    backgroundColor: isChecked ? c.checkBg : "transparent",
                    borderColor: isChecked ? c.checkBg : c.border,
                  }}
                >
                  {isChecked && (
                    <svg
                      className="absolute inset-0 w-full h-full p-0.5"
                      viewBox="0 0 16 16"
                      fill="none"
                    >
                      <path
                        d="M3 8l3.5 3.5L13 5"
                        stroke={c.checkStroke}
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  )}
                </span>
              </span>
              <span
                className="text-[13px] leading-relaxed"
                style={{
                  fontFamily: "'DM Sans', sans-serif",
                  color: c.input,
                }}
              >
                {opt.label}
              </span>
            </label>
          );
        })}
      </div>
      {error && (
        <p
          className="text-[11px]"
          style={{ fontFamily: "'DM Sans', sans-serif", color: c.error }}
        >
          {error}
        </p>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// 5. FORM SECTION
// ─────────────────────────────────────────────────────────────

interface FormSectionProps {
  title: string;
  description?: string;
  children: ReactNode;
  mode?: FormMode;
  show?: boolean;
}

export function FormSection({
  title,
  description,
  children,
  mode = "light",
  show = true,
}: FormSectionProps) {
  const c = modeColors[mode];

  if (!show) return null;

  return (
    <div
      className="p-8 sm:p-10 border mb-6"
      style={{
        backgroundColor: mode === "light" ? "#FFFFFF" : "#1E1B1F",
        borderColor: c.sectionBorder,
      }}
    >
      <h2
        className="text-[24px] font-bold leading-tight mb-2"
        style={{
          fontFamily: "'Inter', sans-serif",
          letterSpacing: "-0.01em",
          color: c.sectionTitle,
        }}
      >
        {title}
      </h2>
      {description && (
        <p
          className="text-[13px] leading-relaxed mb-8"
          style={{
            fontFamily: "'DM Sans', sans-serif",
            color: c.sectionDesc,
          }}
        >
          {description}
        </p>
      )}
      <div className="space-y-7">{children}</div>
    </div>
  );
}
