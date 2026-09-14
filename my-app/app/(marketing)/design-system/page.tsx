"use client";

import { tokens } from "@/app/components/ui/tokens";
import {
  ButtonPrimary,
  ButtonSecondary,
  ButtonAccent,
  ButtonGhost,
  ButtonSubmit,
} from "@/app/components/ui/buttons";
import { PillTag } from "@/app/components/ui/tags";
import { ReadableText, SectionHeader } from "@/app/components/ui/typography";

// ── Color swatch component ──────────────────────────────────

function ColorSwatch({
  name,
  value,
  light,
}: {
  name: string;
  value: string;
  light?: boolean;
}) {
  return (
    <div className="flex flex-col gap-2">
      <div
        className="w-full aspect-[3/2] rounded-lg border border-black/10"
        style={{ backgroundColor: value }}
      />
      <div>
        <p
          className="text-[13px] font-semibold"
          style={{
            fontFamily: "'DM Sans', sans-serif",
            color: light ? "#141115" : "#141115",
          }}
        >
          {name}
        </p>
        <p
          className="text-[11px]"
          style={{
            fontFamily: "'DM Sans', sans-serif",
            color: "#6B6870",
          }}
        >
          {value}
        </p>
      </div>
    </div>
  );
}

// ── Section wrapper ─────────────────────────────────────────

function Section({
  title,
  children,
  dark,
}: {
  title: string;
  children: React.ReactNode;
  dark?: boolean;
}) {
  return (
    <section
      className={`px-[15px] sm:px-[25px] lg:px-[35px] py-12 md:py-16 ${
        dark ? "bg-[#141115]" : "bg-white"
      }`}
    >
      <div className="max-w-[1224px] mx-auto">
        <p
          className="text-[10px] font-semibold tracking-[0.35em] uppercase mb-8"
          style={{
            fontFamily: "'DM Sans', sans-serif",
            color: dark ? "#F5F5F5" : "#6B6870",
          }}
        >
          {title}
        </p>
        {children}
      </div>
    </section>
  );
}

// ── Main page ───────────────────────────────────────────────

export default function DesignSystemPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero */}
      <section className="px-[15px] sm:px-[25px] lg:px-[35px] pt-32 pb-16 bg-[#141115]">
        <div className="max-w-[1224px] mx-auto">
          <h1
            className="nh-hero text-white mb-4"
          >
            Design System
          </h1>
          <p
            className="text-white/60 text-[16px] sm:text-[18px] max-w-xl leading-relaxed"
            style={{ fontFamily: "'DM Sans', sans-serif" }}
          >
            NATUREHOOD brand tokens, typography, colors, and component patterns.
            This page renders live from the codebase — what you see here is what
            ships.
          </p>
        </div>
      </section>

      {/* ── TYPOGRAPHY ─────────────────────────────────────── */}
      <Section title="Typography — Font System">
        <div className="space-y-2 mb-12">
          <p
            className="text-[14px] text-[#6B6870]"
            style={{ fontFamily: "'DM Sans', sans-serif" }}
          >
            2-font system — Inter has been removed
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-16">
          {/* Sk Modernist */}
          <div>
            <p
              className="text-[10px] font-semibold tracking-[0.35em] uppercase text-[#6B6870] mb-4"
              style={{ fontFamily: "'DM Sans', sans-serif" }}
            >
              Display — Sk Modernist
            </p>
            <p
              className="text-[48px] font-bold text-[#141115] leading-tight"
              style={{
                fontFamily: "'Sk Modernist', sans-serif",
                letterSpacing: "-0.02em",
              }}
            >
              Hero, H1, H2
            </p>
            <p
              className="text-[13px] text-[#6B6870] mt-2"
              style={{ fontFamily: "'DM Sans', sans-serif" }}
            >
              Used for large editorial headings only
            </p>
          </div>

          {/* DM Sans */}
          <div>
            <p
              className="text-[10px] font-semibold tracking-[0.35em] uppercase text-[#6B6870] mb-4"
              style={{ fontFamily: "'DM Sans', sans-serif" }}
            >
              Everything Else — DM Sans
            </p>
            <p
              className="text-[48px] font-semibold text-[#141115] leading-tight"
              style={{
                fontFamily: "'DM Sans', sans-serif",
                letterSpacing: "-0.01em",
              }}
            >
              H3, Body, UI
            </p>
            <p
              className="text-[13px] text-[#6B6870] mt-2"
              style={{ fontFamily: "'DM Sans', sans-serif" }}
            >
              Headings (h3+), body, buttons, labels, nav, forms
            </p>
          </div>
        </div>

        {/* Type Scale */}
        <p
          className="text-[10px] font-semibold tracking-[0.35em] uppercase text-[#6B6870] mb-8"
          style={{ fontFamily: "'DM Sans', sans-serif" }}
        >
          Type Scale
        </p>
        <div className="space-y-8">
          <div className="border-b border-[#E8E8E8] pb-6">
            <p className="nh-hero text-[#141115]">Hero</p>
            <p
              className="text-[11px] text-[#6B6870] mt-2"
              style={{ fontFamily: "'DM Sans', sans-serif" }}
            >
              .nh-hero · Sk Modernist · clamp(52px, 9vw, 96px) · 700 · 0.95
              line-height
            </p>
          </div>

          <div className="border-b border-[#E8E8E8] pb-6">
            <p className="nh-h1 text-[#141115]">Heading 1</p>
            <p
              className="text-[11px] text-[#6B6870] mt-2"
              style={{ fontFamily: "'DM Sans', sans-serif" }}
            >
              .nh-h1 · Sk Modernist · clamp(38px, 5.5vw, 60px) · 700 · 1.0
              line-height
            </p>
          </div>

          <div className="border-b border-[#E8E8E8] pb-6">
            <p className="nh-h2 text-[#141115]">Heading 2</p>
            <p
              className="text-[11px] text-[#6B6870] mt-2"
              style={{ fontFamily: "'DM Sans', sans-serif" }}
            >
              .nh-h2 · Sk Modernist · clamp(26px, 4vw, 40px) · 700 · 1.05
              line-height
            </p>
          </div>

          <div className="border-b border-[#E8E8E8] pb-6">
            <p className="nh-h3 text-[#141115]">Heading 3</p>
            <p
              className="text-[11px] text-[#6B6870] mt-2"
              style={{ fontFamily: "'DM Sans', sans-serif" }}
            >
              .nh-h3 · DM Sans · clamp(20px, 3vw, 28px) · 600 · 1.1
              line-height
            </p>
          </div>

          <div className="border-b border-[#E8E8E8] pb-6">
            <p className="nh-label">Label Text</p>
            <p
              className="text-[11px] text-[#6B6870] mt-2"
              style={{ fontFamily: "'DM Sans', sans-serif" }}
            >
              .nh-label · DM Sans · 10px · 600 · 0.3em tracking · uppercase
            </p>
          </div>

          <div className="border-b border-[#E8E8E8] pb-6">
            <p className="nh-body">
              Body text — The quick brown fox jumps over the lazy dog.
              NATUREHOOD connects athletes and brands through authentic
              partnerships.
            </p>
            <p
              className="text-[11px] text-[#6B6870] mt-2"
              style={{ fontFamily: "'DM Sans', sans-serif" }}
            >
              .nh-body · DM Sans · 16px · 400 · 1.75 line-height
            </p>
          </div>

          <div className="border-b border-[#E8E8E8] pb-6">
            <p className="nh-small">
              Small text — Secondary content and metadata
            </p>
            <p
              className="text-[11px] text-[#6B6870] mt-2"
              style={{ fontFamily: "'DM Sans', sans-serif" }}
            >
              .nh-small · DM Sans · 13px · 400 · 1.65 line-height
            </p>
          </div>

          <div className="pb-6">
            <p className="nh-caption">
              Caption text — Timestamps and fine print
            </p>
            <p
              className="text-[11px] text-[#6B6870] mt-2"
              style={{ fontFamily: "'DM Sans', sans-serif" }}
            >
              .nh-caption · DM Sans · 11px · 400 · 0.06em tracking
            </p>
          </div>
        </div>
      </Section>

      {/* ── COLORS ─────────────────────────────────────────── */}
      <Section title="Colors — Brand Palette">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
          {Object.entries(tokens.color).map(([name, value]) => (
            <ColorSwatch key={name} name={name} value={value} light />
          ))}
        </div>
      </Section>

      {/* ── MARKETING THEME PREVIEW ────────────────────────── */}
      <Section title="Theme — Marketing (Light)">
        <div className="bg-[#F5F5F5] rounded-xl p-8 md:p-12 space-y-6">
          <SectionHeader content="Section Label" color="gray" />
          <h2 className="nh-h2 text-[#141115]">Marketing Heading</h2>
          <ReadableText>
            This is how body text appears on the marketing light theme. The
            background is cloud (#F5F5F5) or white, with secondary text color
            for body copy.
          </ReadableText>
          <div className="flex flex-wrap gap-3 pt-4">
            <ButtonPrimary>Primary</ButtonPrimary>
            <ButtonSecondary>Secondary</ButtonSecondary>
            <ButtonGhost>Ghost Link</ButtonGhost>
          </div>
        </div>
      </Section>

      {/* ── PLATFORM THEME PREVIEW ─────────────────────────── */}
      <Section title="Theme — Platform (Dark)" dark>
        <div className="bg-[#1A1719] rounded-xl border border-[#3A373C] p-8 md:p-12 space-y-6">
          <p
            className="text-[10px] font-semibold tracking-[0.3em] uppercase text-[#F5F5F5]"
            style={{ fontFamily: "'DM Sans', sans-serif" }}
          >
            Section Label
          </p>
          <p
            className="text-[20px] font-semibold text-white"
            style={{
              fontFamily: "'DM Sans', sans-serif",
              letterSpacing: "-0.01em",
            }}
          >
            Platform Heading
          </p>
          <p
            className="text-[13px] text-[#6B6870] leading-relaxed max-w-xl"
            style={{ fontFamily: "'DM Sans', sans-serif" }}
          >
            This is how text appears on the platform dark theme. The background
            is ink (#141115) with card surfaces in slightly lighter shades.
          </p>
          <div className="flex flex-wrap gap-3 pt-4">
            <ButtonAccent>Accent CTA</ButtonAccent>
            <ButtonSubmit label="Submit" className="max-w-xs" />
          </div>
        </div>
      </Section>

      {/* ── BUTTONS ────────────────────────────────────────── */}
      <Section title="Components — Buttons">
        <div className="space-y-12">
          <div>
            <p
              className="text-[13px] font-semibold text-[#141115] mb-4"
              style={{ fontFamily: "'DM Sans', sans-serif" }}
            >
              Marketing Buttons (pill-shaped)
            </p>
            <div className="flex flex-wrap gap-4 items-center">
              <ButtonPrimary>Primary</ButtonPrimary>
              <ButtonSecondary>Secondary</ButtonSecondary>
              <ButtonAccent>Accent</ButtonAccent>
              <ButtonGhost>Ghost</ButtonGhost>
            </div>
          </div>

          <div>
            <p
              className="text-[13px] font-semibold text-[#141115] mb-4"
              style={{ fontFamily: "'DM Sans', sans-serif" }}
            >
              Form Buttons
            </p>
            <div className="max-w-sm">
              <ButtonSubmit label="Submit Application" showArrow />
            </div>
          </div>
        </div>
      </Section>

      {/* ── TAGS ───────────────────────────────────────────── */}
      <Section title="Components — Tags">
        <div className="flex flex-wrap gap-3">
          <PillTag label="Ghost Green" variant="ghost-green" />
          <PillTag label="Ghost Dark" variant="ghost-dark" />
          <PillTag label="Accent" variant="accent" />
          <PillTag label="Ghost Light" variant="ghost-light" />
          <PillTag label="Default" />
          <PillTag label="Active" variant="active" />
          <PillTag label="Nature" variant="nature" />
        </div>
      </Section>

      {/* ── TYPOGRAPHY COMPONENTS ──────────────────────────── */}
      <Section title="Components — Typography">
        <div className="space-y-8 max-w-2xl">
          <div>
            <p
              className="text-[11px] text-[#6B6870] mb-2"
              style={{ fontFamily: "'DM Sans', sans-serif" }}
            >
              SectionHeader (green)
            </p>
            <SectionHeader content="Section Title" color="green" />
          </div>

          <div>
            <p
              className="text-[11px] text-[#6B6870] mb-2"
              style={{ fontFamily: "'DM Sans', sans-serif" }}
            >
              SectionHeader (gray)
            </p>
            <SectionHeader content="Section Title" color="gray" />
          </div>

          <div>
            <p
              className="text-[11px] text-[#6B6870] mb-2"
              style={{ fontFamily: "'DM Sans', sans-serif" }}
            >
              ReadableText (sm)
            </p>
            <ReadableText size="sm">
              Small readable text for secondary content and supporting
              descriptions.
            </ReadableText>
          </div>

          <div>
            <p
              className="text-[11px] text-[#6B6870] mb-2"
              style={{ fontFamily: "'DM Sans', sans-serif" }}
            >
              ReadableText (base)
            </p>
            <ReadableText size="base">
              Base readable text for standard body content. This component
              enforces optimal line length for readability.
            </ReadableText>
          </div>

          <div>
            <p
              className="text-[11px] text-[#6B6870] mb-2"
              style={{ fontFamily: "'DM Sans', sans-serif" }}
            >
              ReadableText (lg)
            </p>
            <ReadableText size="lg">
              Large readable text for lead paragraphs and introductory content.
            </ReadableText>
          </div>
        </div>
      </Section>

      {/* ── SPACING ────────────────────────────────────────── */}
      <Section title="Tokens — Spacing Scale">
        <div className="space-y-4">
          {[
            { name: "xs", value: 4 },
            { name: "sm", value: 8 },
            { name: "md", value: 16 },
            { name: "lg", value: 24 },
            { name: "xl", value: 32 },
            { name: "2xl", value: 48 },
            { name: "3xl", value: 64 },
            { name: "4xl", value: 96 },
          ].map(({ name, value }) => (
            <div key={name} className="flex items-center gap-4">
              <p
                className="text-[13px] text-[#6B6870] w-12 text-right"
                style={{ fontFamily: "'DM Sans', sans-serif" }}
              >
                {name}
              </p>
              <div
                className="h-4 bg-[#F5F5F5] rounded-sm"
                style={{ width: value * 2 }}
              />
              <p
                className="text-[11px] text-[#A09EA3]"
                style={{ fontFamily: "'DM Sans', sans-serif" }}
              >
                {value}px
              </p>
            </div>
          ))}
        </div>
      </Section>

      {/* ── SOURCE INFO ────────────────────────────────────── */}
      <section className="px-[15px] sm:px-[25px] lg:px-[35px] py-12 bg-[#F5F5F5]">
        <div className="max-w-[1224px] mx-auto">
          <p
            className="text-[10px] font-semibold tracking-[0.35em] uppercase text-[#6B6870] mb-4"
            style={{ fontFamily: "'DM Sans', sans-serif" }}
          >
            Source
          </p>
          <p
            className="text-[13px] text-[#6B6870] leading-relaxed"
            style={{ fontFamily: "'DM Sans', sans-serif" }}
          >
            This page renders live from <code className="text-[#141115] bg-white px-1.5 py-0.5 rounded text-[12px]">brand/tokens/*.json</code> via{" "}
            <code className="text-[#141115] bg-white px-1.5 py-0.5 rounded text-[12px]">tokens.ts</code>.
            Edit the JSON source and run <code className="text-[#141115] bg-white px-1.5 py-0.5 rounded text-[12px]">npm run brand:build</code> to
            update.
          </p>
        </div>
      </section>
    </div>
  );
}
