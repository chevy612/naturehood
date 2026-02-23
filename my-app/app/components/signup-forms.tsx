"use client";

// ============================================================
// NATUREHOODOFFICIAL — components/signup-forms.tsx
// Athlete Sign-up (Dark Mode) · Brand Sign-up (Light Mode)
// ============================================================

import { useState, ChangeEvent } from "react";

// ─────────────────────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────────────────────

interface AthleteFormData {
  fullName: string;
  email: string;
  phone: string;
  sport: string;
  instagram: string;
  followers: string;
  location: string;
  yearsExperience: string;
  projectIdea: string;
  portfolio: string;
  availability: string;
  hearAboutUs: string;
}

interface BrandFormData {
  companyName: string;
  contactName: string;
  email: string;
  phone: string;
  website: string;
  industry: string;
  teamSize: string;
  budget: string;
  timeline: string;
  projectIdea: string;
  goals: string;
  targetAudience: string;
  feedback: string;
}

// ─────────────────────────────────────────────────────────────
// 1. ATHLETE SIGN-UP FORM (DARK MODE)
// ─────────────────────────────────────────────────────────────
export function AthleteSignUpForm({
  onSubmit,
}: {
  onSubmit?: (data: AthleteFormData) => void;
}) {
  const [form, setForm] = useState<AthleteFormData>({
    fullName: "",
    email: "",
    phone: "",
    sport: "",
    instagram: "",
    followers: "",
    location: "",
    yearsExperience: "",
    projectIdea: "",
    portfolio: "",
    availability: "",
    hearAboutUs: "",
  });

  const [errors, setErrors] = useState<Partial<Record<keyof AthleteFormData, string>>>({});
  const [submitted, setSubmitted] = useState(false);

  const sports = [
    { value: "track & field", label: "Track & Field" },
    { value: "trail running", label: "Trail Running"},
    { value: "climbing", label: "Climbing / Bouldering" },
    { value: "yoga", label: "Yoga / Wellness" },
    { value: "crossfit", label: "CrossFit / Fitness" },
    { value: "other", label: "Other" },
  ];

  const followerRanges = [
    { value: "0-5k", label: "0 - 5K" },
    { value: "5k-20k", label: "5K - 20K" },
    { value: "20k-50k", label: "20K - 50K" },
    { value: "50k-100k", label: "50K - 100K" },
    { value: "100k+", label: "100K+" },
  ];

  const validate = (): Partial<Record<keyof AthleteFormData, string>> => {
    const e: Partial<Record<keyof AthleteFormData, string>> = {};
    if (!form.fullName.trim()) e.fullName = "Name required";
    if (!/\S+@\S+\.\S+/.test(form.email)) e.email = "Valid email required";
    if (!form.sport) e.sport = "Please select your sport";
    if (!form.projectIdea.trim()) e.projectIdea = "Tell us your project idea";
    return e;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length) {
      setErrors(validationErrors);
      return;
    }
    setSubmitted(true);
    onSubmit?.(form);
  };

  const setField = (field: keyof AthleteFormData) => (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
    setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-[#141115] flex items-center justify-center p-8">
        <div className="max-w-md text-center">
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-[#C8F04D] flex items-center justify-center">
            <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
              <path
                d="M8 20l8 8L32 12"
                stroke="#141115"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
          <h2
            className="text-[32px] font-bold text-white mb-4"
            style={{ fontFamily: "'Inter', sans-serif" }}
          >
            Welcome to Naturehood
          </h2>
          <p
            className="text-[15px] text-[#6B6870] leading-relaxed mb-8"
            style={{ fontFamily: "'DM Sans', sans-serif" }}
          >
            We've received your application. Our team will review your profile and
            get back to you within 48 hours.
          </p>
          <p
            className="text-[13px] text-[#6B6870]"
            style={{ fontFamily: "'DM Sans', sans-serif" }}
          >
            Check your email for next steps.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#141115] py-16 px-6">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-12">
          <p
            className="text-[10px] font-semibold tracking-[0.3em] uppercase text-[#C8F04D] mb-3"
            style={{ fontFamily: "'DM Sans', sans-serif" }}
          >
            Athlete Application
          </p>
          <h1
            className="text-[48px] md:text-[60px] font-bold text-white leading-none mb-4"
            style={{ fontFamily: "'Inter', sans-serif" }}
          >
            Join Naturehood
          </h1>
          <p
            className="text-[15px] text-[#6B6870] leading-relaxed max-w-lg"
            style={{ fontFamily: "'DM Sans', sans-serif" }}
          >
            Connect with brands who value authentic athletes. Create projects that
            matter. Get paid to do what you love.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Personal Info */}
          <div className="space-y-6">
            <h3
              className="text-[20px] font-semibold text-white"
              style={{ fontFamily: "'Inter', sans-serif" }}
            >
              About You
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <InputDark
                label="Full Name"
                name="fullName"
                value={form.fullName}
                onChange={setField("fullName")}
                error={errors.fullName}
                required
              />
              <InputDark
                label="Email"
                type="email"
                name="email"
                value={form.email}
                onChange={setField("email")}
                error={errors.email}
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <InputDark
                label="Phone"
                type="tel"
                name="phone"
                value={form.phone}
                onChange={setField("phone")}
                placeholder="+1 (555) 123-4567"
              />
              <InputDark
                label="Location (City, Country)"
                name="location"
                value={form.location}
                onChange={setField("location")}
                placeholder="Denver, USA"
              />
            </div>
          </div>

          {/* Athletic Background */}
          <div className="space-y-6 pt-6 border-t border-[#3A373C]">
            <h3
              className="text-[20px] font-semibold text-white"
              style={{ fontFamily: "'Inter', sans-serif" }}
            >
              Athletic Background
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <SelectDark
                label="Primary Sport"
                name="sport"
                options={sports}
                value={form.sport}
                onChange={setField("sport")}
                placeholder="Select your sport"
                error={errors.sport}
              />
              <InputDark
                label="Years of Experience"
                type="number"
                name="yearsExperience"
                value={form.yearsExperience}
                onChange={setField("yearsExperience")}
                placeholder="5"
              />
            </div>
          </div>

          {/* Social Presence */}
          <div className="space-y-6 pt-6 border-t border-[#3A373C]">
            <h3
              className="text-[20px] font-semibold text-white"
              style={{ fontFamily: "'Inter', sans-serif" }}
            >
              Social Presence
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <InputDark
                label="Instagram Handle"
                name="instagram"
                value={form.instagram}
                onChange={setField("instagram")}
                placeholder="@yourusername"
              />
              <SelectDark
                label="Follower Count"
                name="followers"
                options={followerRanges}
                value={form.followers}
                onChange={setField("followers")}
                placeholder="Select range"
              />
            </div>

            <InputDark
              label="Portfolio / Website (optional)"
              name="portfolio"
              value={form.portfolio}
              onChange={setField("portfolio")}
              placeholder="https://yourwebsite.com"
            />
          </div>

          {/* Project Ideas */}
          <div className="space-y-6 pt-6 border-t border-[#3A373C]">
            <h3
              className="text-[20px] font-semibold text-white"
              style={{ fontFamily: "'Inter', sans-serif" }}
            >
              Creative Vision
            </h3>

            <TextAreaDark
              label="Project Ideas"
              name="projectIdea"
              value={form.projectIdea}
              onChange={setField("projectIdea")}
              error={errors.projectIdea}
              rows={6}
              placeholder="Tell us about creative projects you'd love to work on with brands. What stories do you want to tell? What kind of content excites you?"
              required
            />

            <InputDark
              label="Availability"
              name="availability"
              value={form.availability}
              onChange={setField("availability")}
              placeholder="e.g., Available immediately, 2-3 projects per month"
            />
          </div>

          {/* How did you hear */}
          <div className="space-y-6 pt-6 border-t border-[#3A373C]">
            <InputDark
              label="How did you hear about Naturehood?"
              name="hearAboutUs"
              value={form.hearAboutUs}
              onChange={setField("hearAboutUs")}
              placeholder="Instagram, friend, search, etc."
            />
          </div>

          {/* Submit */}
          <div className="pt-6">
            <button
              type="submit"
              className="w-full bg-[#C8F04D] text-[#141115] px-8 py-4 text-[11px] font-bold tracking-[0.2em] uppercase hover:bg-[#b8e038] transition-colors duration-200"
              style={{ fontFamily: "'DM Sans', sans-serif" }}
            >
              Submit Application
            </button>
            <p
              className="mt-4 text-center text-[11px] text-[#6B6870]"
              style={{ fontFamily: "'DM Sans', sans-serif" }}
            >
              We'll review your application and respond within 48 hours
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// 2. BRAND SIGN-UP FORM (LIGHT MODE)
// ─────────────────────────────────────────────────────────────
export function BrandSignUpForm({
  onSubmit,
}: {
  onSubmit?: (data: BrandFormData) => void;
}) {
  const [form, setForm] = useState<BrandFormData>({
    companyName: "",
    contactName: "",
    email: "",
    phone: "",
    website: "",
    industry: "",
    teamSize: "",
    budget: "",
    timeline: "",
    projectIdea: "",
    goals: "",
    targetAudience: "",
    feedback: "",
  });

  const [errors, setErrors] = useState<Partial<Record<keyof BrandFormData, string>>>({});
  const [submitted, setSubmitted] = useState(false);

  const industries = [
    { value: "footwear", label: "Footwear" },
    { value: "apparel", label: "Apparel / Outdoor Gear" },
    { value: "nutrition", label: "Nutrition / Supplements" },
    { value: "technology", label: "Technology / Wearables" },
    { value: "travel", label: "Travel / Hospitality" },
    { value: "wellness", label: "Wellness / Recovery" },
    { value: "other", label: "Other" },
  ];

  const teamSizes = [
    { value: "1-10", label: "1-10 employees" },
    { value: "11-50", label: "11-50 employees" },
    { value: "51-200", label: "51-200 employees" },
    { value: "201-500", label: "201-500 employees" },
    { value: "500+", label: "500+ employees" },
  ];

  const budgetRanges = [
    { value: "5k-15k", label: "$5K - $15K" },
    { value: "15k-30k", label: "$15K - $30K" },
    { value: "30k-50k", label: "$30K - $50K" },
    { value: "50k-100k", label: "$50K - $100K" },
    { value: "100k+", label: "$100K+" },
  ];

  const timelines = [
    { value: "urgent", label: "ASAP (Within 2 weeks)" },
    { value: "soon", label: "Soon (1-2 months)" },
    { value: "flexible", label: "Flexible (2-3 months)" },
    { value: "planning", label: "Just Planning" },
  ];

  const validate = (): Partial<Record<keyof BrandFormData, string>> => {
    const e: Partial<Record<keyof BrandFormData, string>> = {};
    if (!form.companyName.trim()) e.companyName = "Company name required";
    if (!/\S+@\S+\.\S+/.test(form.email)) e.email = "Valid email required";
    if (!form.projectIdea.trim()) e.projectIdea = "Please describe your project idea";
    return e;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Debug: Log form data and validation
    console.log('Brand form submission started');
    console.log('Form data:', form);
    
    const validationErrors = validate();
    console.log('Validation errors:', validationErrors);
    
    if (Object.keys(validationErrors).length) {
      setErrors(validationErrors);
      console.log('Form submission blocked by validation errors');
      return;
    }
    
    console.log('Brand form validation passed, calling onSubmit...');
    setSubmitted(true);
    onSubmit?.(form);
  };

  const setField = (field: keyof BrandFormData) => (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
    setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-[#F5F5F5] flex items-center justify-center p-8">
        <div className="max-w-md text-center">
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-[#141115] flex items-center justify-center">
            <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
              <path
                d="M8 20l8 8L32 12"
                stroke="#C8F04D"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
          <h2
            className="text-[32px] font-bold text-[#141115] mb-4"
            style={{ fontFamily: "'Inter', sans-serif" }}
          >
            Thank You for Your Interest
          </h2>
          <p
            className="text-[15px] text-[#6B6870] leading-relaxed mb-8"
            style={{ fontFamily: "'DM Sans', sans-serif" }}
          >
            We've received your partnership inquiry. Our team will review your project
            and reach out within 24 hours to discuss next steps.
          </p>
          <p
            className="text-[13px] text-[#6B6870]"
            style={{ fontFamily: "'DM Sans', sans-serif" }}
          >
            Watch for an email from team@naturehood.com
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F5F5F5] py-16 px-6">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-12">
          <p
            className="text-[10px] font-semibold tracking-[0.3em] uppercase text-[#6B6870] mb-3"
            style={{ fontFamily: "'DM Sans', sans-serif" }}
          >
            Brand Partnership
          </p>
          <h1
            className="text-[48px] md:text-[60px] font-bold text-[#141115] leading-none mb-4"
            style={{ fontFamily: "'Inter', sans-serif" }}
          >
            Partner with Naturehood
          </h1>
          <p
            className="text-[15px] text-[#6B6870] leading-relaxed max-w-lg"
            style={{ fontFamily: "'DM Sans', sans-serif" }}
          >
            Connect with authentic athletes who genuinely use and love your products.
            Create campaigns that perform.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Company Info */}
          <div className="space-y-6">
            <h3
              className="text-[20px] font-semibold text-[#141115]"
              style={{ fontFamily: "'Inter', sans-serif" }}
            >
              Company Information
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <InputLight
                label="Company Name"
                name="companyName"
                value={form.companyName}
                onChange={setField("companyName")}
                error={errors.companyName}
                required
              />
              <InputLight
                label="Email"
                type="email"
                name="email"
                value={form.email}
                onChange={setField("email")}
                error={errors.email}
                required
              />
            </div>

            <InputLight
              label="Website"
              name="website"
              value={form.website}
              onChange={setField("website")}
              placeholder="https://yourbrand.com"
            />
          </div>

          {/* Project Details */}
          <div className="space-y-6 pt-6 border-t border-[#E8E8E8]">
            <h3
              className="text-[20px] font-semibold text-[#141115]"
              style={{ fontFamily: "'Inter', sans-serif" }}
            >
              Project Details
            </h3>

            <TextAreaLight
              label="Project Idea"
              name="projectIdea"
              value={form.projectIdea}
              onChange={setField("projectIdea")}
              error={errors.projectIdea}
              rows={6}
              placeholder="Describe the creative project you have in mind. What type of content are you looking to create? Which sports/athletes are you interested in?"
              required
            />

            <InputLight
              label="Target Audience"
              name="targetAudience"
              value={form.targetAudience}
              onChange={setField("targetAudience")}
              placeholder="e.g., Trail runners aged 25-40, outdoor enthusiasts"
            />
          </div>

          {/* Budget & Timeline */}
          <div className="space-y-6 pt-6 border-t border-[#E8E8E8]">
            <h3
              className="text-[20px] font-semibold text-[#141115]"
              style={{ fontFamily: "'Inter', sans-serif" }}
            >
              Budget & Timeline
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <SelectLight
                label="Budget Range"
                name="budget"
                options={budgetRanges}
                value={form.budget}
                onChange={setField("budget")}
                placeholder="Select budget"
              />
              <SelectLight
                label="Timeline"
                name="timeline"
                options={timelines}
                value={form.timeline}
                onChange={setField("timeline")}
                placeholder="Select timeline"
              />
            </div>
          </div>

          {/* Feedback */}
          <div className="space-y-6 pt-6 border-t border-[#E8E8E8]">
            <h3
              className="text-[20px] font-semibold text-[#141115]"
              style={{ fontFamily: "'Inter', sans-serif" }}
            >
              Help Us Improve
            </h3>

            <TextAreaLight
              label="Feedback (Optional)"
              name="feedback"
              value={form.feedback}
              onChange={setField("feedback")}
              rows={4}
              placeholder="Any suggestions or feedback about our platform? What would make Naturehood more valuable for brands like yours?"
            />
          </div>

          {/* Submit */}
          <div className="pt-6">
            <button
              type="submit"
              className="w-full bg-[#141115] text-[#C8F04D] px-8 py-4 text-[11px] font-bold tracking-[0.2em] uppercase hover:bg-[#1E1B1F] transition-colors duration-200"
              style={{ fontFamily: "'DM Sans', sans-serif" }}
            >
              Submit Partnership Inquiry
            </button>
            <p
              className="mt-4 text-center text-[11px] text-[#6B6870]"
              style={{ fontFamily: "'DM Sans', sans-serif" }}
            >
              Our team will respond within 24 hours
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// DARK MODE INPUT COMPONENTS
// ─────────────────────────────────────────────────────────────

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
        required={required}
        className={`w-full bg-transparent border-b-2 py-3 px-0 text-[15px] text-white placeholder:text-[#3A373C] outline-none transition-colors duration-200 ${
          error
            ? "border-[#FF4D4D] focus:border-[#FF4D4D]"
            : "border-[#3A373C] focus:border-[#C8F04D]"
        }`}
        style={{ fontFamily: "'DM Sans', sans-serif" }}
      />
      {error && (
        <p className="text-[11px] text-[#FF4D4D]" style={{ fontFamily: "'DM Sans', sans-serif" }}>
          {error}
        </p>
      )}
    </div>
  );
}

function TextAreaDark({
  label,
  name,
  value,
  onChange,
  error,
  placeholder,
  rows = 4,
  required,
}: {
  label: string;
  name: string;
  value: string;
  onChange: (e: ChangeEvent<HTMLTextAreaElement>) => void;
  error?: string;
  placeholder?: string;
  rows?: number;
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
      <textarea
        id={name}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        rows={rows}
        required={required}
        className={`w-full bg-[#1E1B1F] border-2 p-4 resize-none text-[15px] text-white placeholder:text-[#3A373C] outline-none transition-colors duration-200 ${
          error
            ? "border-[#FF4D4D] focus:border-[#FF4D4D]"
            : "border-transparent focus:border-[#C8F04D]"
        }`}
        style={{ fontFamily: "'DM Sans', sans-serif" }}
      />
      {error && (
        <p className="text-[11px] text-[#FF4D4D]" style={{ fontFamily: "'DM Sans', sans-serif" }}>
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
  placeholder,
}: {
  label: string;
  name: string;
  options: { value: string; label: string }[];
  value: string;
  onChange: (e: ChangeEvent<HTMLSelectElement>) => void;
  error?: string;
  placeholder?: string;
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
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {options.map((opt) => (
            <option key={opt.value} value={opt.value} className="bg-[#141115]">
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
        <p className="text-[11px] text-[#FF4D4D]" style={{ fontFamily: "'DM Sans', sans-serif" }}>
          {error}
        </p>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// LIGHT MODE INPUT COMPONENTS
// ─────────────────────────────────────────────────────────────

function InputLight({
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
        className="text-[10px] font-semibold tracking-[0.3em] uppercase text-[#141115]"
        style={{ fontFamily: "'DM Sans', sans-serif" }}
      >
        {label} {required && <span className="text-[#FF4D4D]">*</span>}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        className={`w-full bg-transparent border-b-2 py-3 px-0 text-[15px] text-[#141115] placeholder:text-[#A09EA3] outline-none transition-colors duration-200 ${
          error
            ? "border-[#FF4D4D] focus:border-[#FF4D4D]"
            : "border-[#6B6870] focus:border-[#141115]"
        }`}
        style={{ fontFamily: "'DM Sans', sans-serif" }}
      />
      {error && (
        <p className="text-[11px] text-[#FF4D4D]" style={{ fontFamily: "'DM Sans', sans-serif" }}>
          {error}
        </p>
      )}
    </div>
  );
}

function TextAreaLight({
  label,
  name,
  value,
  onChange,
  error,
  placeholder,
  rows = 4,
  required,
}: {
  label: string;
  name: string;
  value: string;
  onChange: (e: ChangeEvent<HTMLTextAreaElement>) => void;
  error?: string;
  placeholder?: string;
  rows?: number;
  required?: boolean;
}) {
  return (
    <div className="flex flex-col gap-2">
      <label
        htmlFor={name}
        className="text-[10px] font-semibold tracking-[0.3em] uppercase text-[#141115]"
        style={{ fontFamily: "'DM Sans', sans-serif" }}
      >
        {label} {required && <span className="text-[#FF4D4D]">*</span>}
      </label>
      <textarea
        id={name}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        rows={rows}
        required={required}
        className={`w-full bg-white border-2 p-4 resize-none text-[15px] text-[#141115] placeholder:text-[#A09EA3] outline-none transition-colors duration-200 ${
          error
            ? "border-[#FF4D4D] focus:border-[#FF4D4D]"
            : "border-[#E8E8E8] focus:border-[#141115]"
        }`}
        style={{ fontFamily: "'DM Sans', sans-serif" }}
      />
      {error && (
        <p className="text-[11px] text-[#FF4D4D]" style={{ fontFamily: "'DM Sans', sans-serif" }}>
          {error}
        </p>
      )}
    </div>
  );
}

function SelectLight({
  label,
  name,
  options,
  value,
  onChange,
  error,
  placeholder,
}: {
  label: string;
  name: string;
  options: { value: string; label: string }[];
  value: string;
  onChange: (e: ChangeEvent<HTMLSelectElement>) => void;
  error?: string;
  placeholder?: string;
}) {
  return (
    <div className="flex flex-col gap-2">
      <label
        htmlFor={name}
        className="text-[10px] font-semibold tracking-[0.3em] uppercase text-[#141115]"
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
          className={`w-full bg-transparent border-b-2 py-3 pr-8 appearance-none cursor-pointer text-[15px] text-[#141115] outline-none transition-colors duration-200 ${
            error
              ? "border-[#FF4D4D]"
              : "border-[#6B6870] focus:border-[#141115]"
          }`}
          style={{ fontFamily: "'DM Sans', sans-serif" }}
        >
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
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
      {error && (
        <p className="text-[11px] text-[#FF4D4D]" style={{ fontFamily: "'DM Sans', sans-serif" }}>
          {error}
        </p>
      )}
    </div>
  );
}
