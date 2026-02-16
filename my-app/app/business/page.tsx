"use client";

// ============================================================
// NATUREHOODOFFICIAL — /business
// Brand Partnership Page (Application + Book a Meeting)
// ============================================================

import { useState, ChangeEvent } from "react";
import { Container, tokens } from "@/app/components/basic/basic";
import {
  FormInput,
  FormSelect,
  FormTextArea,
  FormCheckboxGroup,
  FormSection,
} from "@/app/components/forms/form-ui";
import { submitBrandPartnership } from "@/app/signup/actions";

// ─────────────────────────────────────────────────────────────
// FORM DATA MODEL
// ─────────────────────────────────────────────────────────────

interface BrandPartnershipFormData {
  companyName: string;
  website: string;
  industry: string;
  companySize: string;
  contactName: string;
  jobTitle: string;
  email: string;
  phone: string;
  partnershipTypes: string[];
  athleteInterests: string;
  budget: string;
  timeline: string;
  additionalInfo: string;
}

// ─────────────────────────────────────────────────────────────
// SELECT OPTIONS
// ─────────────────────────────────────────────────────────────

const industries = [
  { value: "outdoor-gear", label: "Outdoor Gear & Equipment" },
  { value: "athletic-apparel", label: "Athletic Apparel" },
  { value: "nutrition", label: "Nutrition & Supplements" },
  { value: "technology", label: "Technology & Wearables" },
  { value: "footwear", label: "Footwear" },
  { value: "travel", label: "Travel & Adventure" },
  { value: "other", label: "Other" },
];

const companySizes = [
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
  { value: "immediately", label: "Immediately" },
  { value: "1-3-months", label: "1-3 months" },
  { value: "3-6-months", label: "3-6 months" },
  { value: "6+-months", label: "6+ months" },
];

const partnershipTypeOptions = [
  { value: "content-creation", label: "Content creation & storytelling" },
  { value: "product-launch", label: "Product launches & campaigns" },
  { value: "social-media", label: "Social media campaigns" },
];

// ─────────────────────────────────────────────────────────────
// PAGE COMPONENT
// ─────────────────────────────────────────────────────────────

export default function BusinessPage() {
  const [activeTab, setActiveTab] = useState<"apply" | "meeting">("apply");
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<Partial<Record<string, string>>>({});

  const [form, setForm] = useState<BrandPartnershipFormData>({
    companyName: "",
    website: "",
    industry: "",
    companySize: "",
    contactName: "",
    jobTitle: "",
    email: "",
    phone: "",
    partnershipTypes: [],
    athleteInterests: "",
    budget: "",
    timeline: "",
    additionalInfo: "",
  });

  const setField =
    (field: keyof BrandPartnershipFormData) =>
    (
      e: ChangeEvent<
        HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
      >,
    ) => {
      setForm((prev) => ({ ...prev, [field]: e.target.value }));
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    };

  const validate = () => {
    const e: Partial<Record<string, string>> = {};
    if (!form.companyName.trim()) e.companyName = "Company name required";
    if (!form.contactName.trim()) e.contactName = "Contact name required";
    if (!/\S+@\S+\.\S+/.test(form.email)) e.email = "Valid email required";
    if (!form.industry) e.industry = "Please select your industry";
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
    const result = await submitBrandPartnership(form);
    setSubmitting(false);

    if (result.error) {
      alert(result.error);
      return;
    }

    setSubmitted(true);
  };

  // ─── SUCCESS STATE ───
  if (submitted) {
    return (
      <div className="min-h-screen bg-[#F5F5F5] flex items-center justify-center p-8">
        <div className="max-w-md text-center">
          <div className="w-20 h-20 mx-auto mb-6 bg-[#141115] flex items-center justify-center rounded-full">
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
            Application Submitted!
          </h2>
          <p
            className="text-[15px] text-[#6B6870] leading-relaxed mb-8"
            style={{ fontFamily: "'DM Sans', sans-serif" }}
          >
            Thanks for your interest in partnering with NatureHood. We'll review
            your application and get back to you within 48 hours.
          </p>
          <p
            className="text-[13px] text-[#6B6870]"
            style={{ fontFamily: "'DM Sans', sans-serif" }}
          >
            Watch for an email from partnerships@naturehood.com
          </p>
        </div>
      </div>
    );
  }

  // ─── MAIN PAGE ───
  return (
    <div className="min-h-screen bg-[#F5F5F5]">
      <Container>
        {/* Hero */}
        <div className="text-center max-w-[640px] mx-auto pt-16 pb-12 md:pt-24 md:pb-16">
          <p
            className="text-[10px] font-semibold tracking-[0.35em] uppercase text-[#6B6870] mb-4"
            style={{ fontFamily: "'DM Sans', sans-serif" }}
          >
            Our Services
          </p>
          <h1
            className="text-[#141115] mb-5"
            style={{
              fontFamily: "'Inter', sans-serif",
              fontSize: "clamp(38px, 5vw, 56px)",
              fontWeight: 700,
              lineHeight: 1.0,
              letterSpacing: "-0.02em",
            }}
          >
            Marketing with Naturehood
          </h1>
          <p
            className="text-[16px] leading-relaxed text-[#6B6870] max-w-[520px] mx-auto"
            style={{ fontFamily: "'DM Sans', sans-serif" }}
          >
            Connect with athletes who align with your brand values.
            Let's build creative campaigns that resonate.
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="flex flex-col sm:flex-row gap-[2px] bg-[#E8E8E8] p-[2px] mb-12 max-w-[600px] mx-auto">
          <button
            onClick={() => setActiveTab("apply")}
            className={`flex-1 px-6 py-4 text-[11px] font-semibold tracking-[0.2em] uppercase transition-all duration-200 ${
              activeTab === "apply"
                ? "bg-[#141115] text-[#C8F04D]"
                : "bg-white text-[#6B6870] hover:text-[#141115]"
            }`}
            style={{ fontFamily: "'DM Sans', sans-serif" }}
          >
            Submit Application
          </button>
          <button
            onClick={() => setActiveTab("meeting")}
            className={`flex-1 px-6 py-4 text-[11px] font-semibold tracking-[0.2em] uppercase transition-all duration-200 ${
              activeTab === "meeting"
                ? "bg-[#141115] text-[#C8F04D]"
                : "bg-white text-[#6B6870] hover:text-[#141115]"
            }`}
            style={{ fontFamily: "'DM Sans', sans-serif" }}
          >
            Book a Meeting
          </button>
        </div>

        {/* ════════════════════════════════════════════
            TAB 1: APPLICATION FORM
            ════════════════════════════════════════════ */}
        {activeTab === "apply" && (
          <div className="max-w-[680px] mx-auto pb-20 animate-fadeIn">
            {/* Info box */}
            <div
              className="border px-5 py-4 mb-8 text-[12px] leading-relaxed"
              style={{
                fontFamily: "'DM Sans', sans-serif",
                backgroundColor: "rgba(200, 240, 77, 0.1)",
                borderColor: "rgba(200, 240, 77, 0.35)",
                color: "#141115",
              }}
            >
              <strong>Takes ~5 minutes.</strong> We'll review your application
              and reach out within 24 hours.
            </div>

            <form onSubmit={handleSubmit}>
              {/* Company Information */}
              <FormSection
                title="Company Information"
                description="Tell us about your brand"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormInput
                    label="Company Name"
                    name="companyName"
                    value={form.companyName}
                    onChange={setField("companyName")}
                    error={errors.companyName}
                    required
                  />
                  <FormInput
                    label="Website"
                    name="website"
                    type="url"
                    value={form.website}
                    onChange={setField("website")}
                    placeholder="https://yourbrand.com"
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormSelect
                    label="Industry"
                    name="industry"
                    options={industries}
                    value={form.industry}
                    onChange={setField("industry")}
                    placeholder="Select industry"
                    error={errors.industry}
                    required
                  />
                  <FormSelect
                    label="Company Size"
                    name="companySize"
                    options={companySizes}
                    value={form.companySize}
                    onChange={setField("companySize")}
                    placeholder="Select size"
                  />
                </div>
              </FormSection>

              {/* Contact Details */}
              <FormSection
                title="Your Details"
                description="Who should we contact?"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormInput
                    label="Full Name"
                    name="contactName"
                    value={form.contactName}
                    onChange={setField("contactName")}
                    error={errors.contactName}
                    required
                  />
                  <FormInput
                    label="Job Title"
                    name="jobTitle"
                    value={form.jobTitle}
                    onChange={setField("jobTitle")}
                    placeholder="Marketing Director"
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormInput
                    label="Email Address"
                    name="email"
                    type="email"
                    value={form.email}
                    onChange={setField("email")}
                    error={errors.email}
                    required
                  />
                  <FormInput
                    label="Phone Number"
                    name="phone"
                    type="tel"
                    value={form.phone}
                    onChange={setField("phone")}
                    placeholder="+852 1234 5678"
                  />
                </div>
              </FormSection>

              {/* Project Goals */}
              <FormSection
                title="Marketing Goals"
                description="What are you looking to achieve?"
              >
                <FormCheckboxGroup
                  label="What type of marketing services interest you?"
                  name="partnershipTypes"
                  options={partnershipTypeOptions}
                  selected={form.partnershipTypes}
                  onChange={(selected) => {
                    setForm((prev) => ({
                      ...prev,
                      partnershipTypes: selected,
                    }));
                  }}
                />
                <FormInput
                  label="What types of athletes are you interested in?"
                  name="athleteInterests"
                  value={form.athleteInterests}
                  onChange={setField("athleteInterests")}
                  placeholder="e.g., Trail runners, climbers, cyclists..."
                  show={false}
                />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormSelect
                    label="Estimated Partnership Budget"
                    name="budget"
                    options={budgetRanges}
                    value={form.budget}
                    onChange={setField("budget")}
                    placeholder="Select budget range"
                  />
                  <FormSelect
                    label="When are you looking to start?"
                    name="timeline"
                    options={timelines}
                    value={form.timeline}
                    onChange={setField("timeline")}
                    placeholder="Select timeline"
                  />
                </div>
                <FormTextArea
                  label="Tell us more about your vision (optional)"
                  name="additionalInfo"
                  value={form.additionalInfo}
                  onChange={setField("additionalInfo")}
                  rows={5}
                  placeholder="Share any specific campaign ideas, partnership goals, or questions you have..."
                />
              </FormSection>

              {/* Submit */}
              <button
                type="submit"
                disabled={submitting}
                className="w-full bg-[#C8F04D] text-[#141115] px-8 py-4 text-[11px] font-bold tracking-[0.2em] uppercase hover:bg-[#b8e038] transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                style={{ fontFamily: "'DM Sans', sans-serif" }}
              >
                {submitting ? "Submitting..." : "Submit Application"}
                {!submitting && (
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 14 14"
                    fill="none"
                    className="transition-transform group-hover:translate-x-1"
                  >
                    <path
                      d="M1 7h12M8 2l5 5-5 5"
                      stroke="#141115"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                )}
              </button>
            </form>
          </div>
        )}

        {/* ════════════════════════════════════════════
            TAB 2: BOOK A MEETING
            ════════════════════════════════════════════ */}
        {activeTab === "meeting" && (
          <div className="max-w-[680px] mx-auto pb-20 animate-fadeIn">
            {/* Dark Meeting Panel */}
            <div className="bg-[#141115] border border-[#3A373C] p-10 sm:p-12 text-center mb-8">
              <p
                className="text-[10px] font-semibold tracking-[0.35em] uppercase text-[#C8F04D] mb-5"
                style={{ fontFamily: "'DM Sans', sans-serif" }}
              >
                Skip the Form
              </p>
              <h2
                className="text-[#F5F5F5] mb-4"
                style={{
                  fontFamily: "'Inter', sans-serif",
                  fontSize: "clamp(28px, 4vw, 40px)",
                  fontWeight: 700,
                  lineHeight: 1.05,
                  letterSpacing: "-0.015em",
                }}
              >
                Book a Call with Our Team
              </h2>
              <p
                className="text-[15px] leading-relaxed text-[#6B6870] max-w-[480px] mx-auto mb-8"
                style={{ fontFamily: "'DM Sans', sans-serif" }}
              >
                Prefer to discuss your partnership goals directly? Schedule a
                30-minute intro call with our partnerships team. We'll explore
                how NatureHood can help you connect with the right athletes for
                your brand.
              </p>

              <a
                href="https://calendly.com"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 bg-[#C8F04D] text-[#141115] px-9 py-4 text-[11px] font-semibold tracking-[0.2em] uppercase hover:bg-[#b8e038] hover:shadow-lg hover:shadow-[#C8F04D]/20 transition-all duration-200"
                style={{ fontFamily: "'DM Sans', sans-serif" }}
              >
                Schedule Meeting
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <path
                    d="M1 7h12M8 2l5 5-5 5"
                    stroke="#141115"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </a>

              {/* Stats */}
              <div className="flex flex-col sm:flex-row justify-center gap-8 sm:gap-12 mt-10 pt-8 border-t border-[#3A373C]">
                {[
                  { num: "30 min", label: "Call Duration" },
                  { num: "24hr", label: "Response Time" },
                  { num: "100%", label: "Free Consultation" },
                ].map((stat) => (
                  <div key={stat.label} className="text-center">
                    <div
                      className="text-[32px] font-bold text-[#F5F5F5] leading-none mb-1"
                      style={{
                        fontFamily: "'Inter', sans-serif",
                        letterSpacing: "-0.02em",
                      }}
                    >
                      {stat.num}
                    </div>
                    <div
                      className="text-[10px] font-medium tracking-[0.2em] uppercase text-[#6B6870]"
                      style={{ fontFamily: "'DM Sans', sans-serif" }}
                    >
                      {stat.label}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* What to Expect */}
            <div className="bg-white border border-[#E8E8E8] p-8 sm:p-10">
              <h2
                className="text-[24px] font-bold text-[#141115] mb-2"
                style={{
                  fontFamily: "'Inter', sans-serif",
                  letterSpacing: "-0.01em",
                }}
              >
                What to Expect
              </h2>
              <p
                className="text-[13px] text-[#6B6870] leading-relaxed mb-6"
                style={{ fontFamily: "'DM Sans', sans-serif" }}
              >
                During our call, we'll discuss:
              </p>

              <div className="flex flex-col gap-5">
                {[
                  {
                    num: "01",
                    title: "The Brand Story",
                    desc: "How the brand got started, the mission, and what it stands for",
                  },
                  {
                    num: "02",
                    title: "Introducing Naturehood",
                    desc: "How we work, our athlete community, and partnership opportunities",
                  },
                  {
                    num: "03",
                    title: "Creative Project Structure",
                    desc: "Timeline, deliverables, and partnership models",
                  },
                  {
                    num: "04",
                    title: "Next Steps",
                    desc: "Clear action items and timeline for getting started",
                  },
                ].map((item) => (
                  <div key={item.num} className="flex gap-3">
                    <span
                      className="text-[#C8F04D] font-bold text-[14px] shrink-0"
                      style={{ fontFamily: "'Inter', sans-serif" }}
                    >
                      {item.num}
                    </span>
                    <div>
                      <strong
                        className="block text-[14px] text-[#141115] mb-1"
                        style={{ fontFamily: "'DM Sans', sans-serif" }}
                      >
                        {item.title}
                      </strong>
                      <span
                        className="text-[13px] text-[#6B6870]"
                        style={{ fontFamily: "'DM Sans', sans-serif" }}
                      >
                        {item.desc}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </Container>

      {/* Fade-in animation */}
      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.4s ease;
        }
      `}</style>
    </div>
  );
}
