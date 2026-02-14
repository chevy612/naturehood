'use client';

import Link from 'next/link';
import { useState } from 'react';
import {
  HeroTemplate,
  FeatureSection,
  StatsSection,
  CTASection,
  Container,
  Section,
  ButtonSecondary,
  ButtonAccent,
  Prose,
  TextBlock,
  ReadableText,
  tokens,
} from '@/app/components/basic/basic';
import HowWeWorkSection from '@/app/components/sections/HowWeWork';
import { Zap, Users, TrendingUp, Shield, Award, Target, CheckCircle2, XCircle } from 'lucide-react';

export default function LandingDemo() {
  const [showSpacingDemo, setShowSpacingDemo] = useState(false);

  return (
    <main>
      {/* ═══════════════════════════════════════════
          DEMO TOGGLE BUTTON (Fixed Position)
          ═══════════════════════════════════════════ */}
      <button
        onClick={() => setShowSpacingDemo(!showSpacingDemo)}
        className="fixed top-4 right-4 z-50 bg-[#C8F04D] text-[#141115] px-6 py-3 font-bold text-sm uppercase tracking-wider hover:bg-[#b8e038] transition-all shadow-lg"
        style={{ fontFamily: "'Inter', sans-serif" }}
      >
        {showSpacingDemo ? '← Back to Landing' : 'View Spacing Demo →'}
      </button>

      {showSpacingDemo ? (
        /* ═══════════════════════════════════════════
            SPACING & READABILITY DEMONSTRATION
            ═══════════════════════════════════════════ */
        <div className="min-h-screen bg-[#F5F5F5] py-20 px-4">
          <Container>
            {/* Header */}
            <div className="text-center mb-16">
              <h1
                className="text-5xl md:text-6xl font-bold text-[#141115] mb-4"
                style={{ fontFamily: "'Inter', sans-serif", lineHeight: "1.1" }}
              >
                Typography Spacing Guide
              </h1>
              <p
                className="text-lg text-[#6B6870] max-w-[65ch] mx-auto"
                style={{ fontFamily: "'DM Sans', sans-serif", lineHeight: "1.75" }}
              >
                Visual demonstration of text spacing, line height, and readability standards for the NatureHood design system.
              </p>
            </div>

            {/* ═══════════════════════════════════════════
                1. LINE HEIGHT COMPARISON
                ═══════════════════════════════════════════ */}
            <section className="mb-20 bg-white p-8 md:p-12 border-l-4 border-[#C8F04D]">
              <h2
                className="text-3xl font-bold text-[#141115] mb-6"
                style={{ fontFamily: "'Inter', sans-serif" }}
              >
                1. Line Height Impact
              </h2>
              <p className="text-sm text-[#6B6870] mb-10">
                Line height dramatically affects readability. Compare these examples:
              </p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Too Tight */}
                <div className="bg-[#FFE5E5] p-6 border border-red-300">
                  <div className="flex items-center gap-2 mb-3">
                    <XCircle size={16} className="text-red-600" />
                    <span className="text-xs font-bold uppercase tracking-wider text-red-700">
                      Too Tight (1.2)
                    </span>
                  </div>
                  <p style={{ lineHeight: "1.2", fontFamily: "'DM Sans', sans-serif", fontSize: "16px" }}>
                    This paragraph has a line height of 1.2, which is too tight for comfortable reading.
                    The lines feel cramped and your eyes struggle to track from one line to the next.
                    This reduces reading speed and comprehension significantly.
                  </p>
                </div>

                {/* Perfect */}
                <div className="bg-[#E5F8E5] p-6 border border-green-300">
                  <div className="flex items-center gap-2 mb-3">
                    <CheckCircle2 size={16} className="text-green-600" />
                    <span className="text-xs font-bold uppercase tracking-wider text-green-700">
                      Optimal (1.75)
                    </span>
                  </div>
                  <p style={{ lineHeight: "1.75", fontFamily: "'DM Sans', sans-serif", fontSize: "16px" }}>
                    This paragraph has our optimal line height of 1.75. Notice how comfortable it is to read.
                    Your eyes can easily find the start of each new line. The spacing creates a natural rhythm
                    that enhances comprehension and reduces fatigue.
                  </p>
                </div>

                {/* Too Loose */}
                <div className="bg-[#FFE5E5] p-6 border border-red-300">
                  <div className="flex items-center gap-2 mb-3">
                    <XCircle size={16} className="text-red-600" />
                    <span className="text-xs font-bold uppercase tracking-wider text-red-700">
                      Too Loose (2.5)
                    </span>
                  </div>
                  <p style={{ lineHeight: "2.5", fontFamily: "'DM Sans', sans-serif", fontSize: "16px" }}>
                    This paragraph has a line height of 2.5, which is too loose.
                    The excessive spacing breaks the visual connection between lines.
                    Readers lose the sense of flow and cohesion in the text.
                  </p>
                </div>
              </div>
            </section>

            {/* ═══════════════════════════════════════════
                2. MAX WIDTH FOR READABILITY
                ═══════════════════════════════════════════ */}
            <section className="mb-20 bg-white p-8 md:p-12 border-l-4 border-[#C8F04D]">
              <h2
                className="text-3xl font-bold text-[#141115] mb-6"
                style={{ fontFamily: "'Inter', sans-serif" }}
              >
                2. Line Length (Measure)
              </h2>
              <p className="text-sm text-[#6B6870] mb-10">
                Optimal line length is 60-75 characters. Too wide = eye strain. Too narrow = choppy reading.
              </p>

              {/* Too Wide */}
              <div className="mb-8 bg-[#FFE5E5] p-6 border border-red-300">
                <div className="flex items-center gap-2 mb-3">
                  <XCircle size={16} className="text-red-600" />
                  <span className="text-xs font-bold uppercase tracking-wider text-red-700">
                    Too Wide (No Max Width)
                  </span>
                </div>
                <p style={{ lineHeight: "1.75", fontFamily: "'DM Sans', sans-serif" }}>
                  This paragraph spans the full width of its container. When lines are too long, readers have difficulty tracking back to the start of the next line. This creates eye strain and slows down reading speed dramatically. Studies show that lines exceeding 90 characters significantly reduce comprehension and increase fatigue. The optimal line length for comfortable reading is between 60-75 characters per line.
                </p>
              </div>

              {/* Optimal */}
              <div className="mb-8 bg-[#E5F8E5] p-6 border border-green-300">
                <div className="flex items-center gap-2 mb-3">
                  <CheckCircle2 size={16} className="text-green-600" />
                  <span className="text-xs font-bold uppercase tracking-wider text-green-700">
                    Optimal (65ch ~65 characters)
                  </span>
                </div>
                <p className="max-w-[65ch]" style={{ lineHeight: "1.75", fontFamily: "'DM Sans', sans-serif" }}>
                  This paragraph uses max-width: 65ch, limiting each line to approximately 65 characters. This is the sweet spot for readability. Your eyes can comfortably scan each line without getting lost. The rhythm feels natural, and you can read faster with better comprehension. This is our recommended standard for all body text.
                </p>
              </div>

              {/* Too Narrow */}
              <div className="bg-[#FFF5E5] p-6 border border-orange-300">
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-xs font-bold uppercase tracking-wider text-orange-700">
                    ⚠ Too Narrow (30ch)
                  </span>
                </div>
                <p className="max-w-[30ch]" style={{ lineHeight: "1.75", fontFamily: "'DM Sans', sans-serif" }}>
                  This paragraph is constrained to just 30 characters per line. While sometimes acceptable for side notes or mobile interfaces, this creates choppy reading. Your eyes have to jump to new lines too frequently, which disrupts the natural flow of reading.
                </p>
              </div>
            </section>

            {/* ═══════════════════════════════════════════
                3. PARAGRAPH SPACING
                ═══════════════════════════════════════════ */}
            <section className="mb-20 bg-white p-8 md:p-12 border-l-4 border-[#C8F04D]">
              <h2
                className="text-3xl font-bold text-[#141115] mb-6"
                style={{ fontFamily: "'Inter', sans-serif" }}
              >
                3. Paragraph Spacing
              </h2>
              <p className="text-sm text-[#6B6870] mb-10">
                Space between paragraphs should be 0.75x to 1x the line height for optimal flow.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Without Spacing */}
                <div className="bg-[#FFE5E5] p-6 border border-red-300">
                  <div className="flex items-center gap-2 mb-3">
                    <XCircle size={16} className="text-red-600" />
                    <span className="text-xs font-bold uppercase tracking-wider text-red-700">
                      No Spacing
                    </span>
                  </div>
                  <div>
                    <p style={{ lineHeight: "1.75", fontFamily: "'DM Sans', sans-serif", marginBottom: "0" }}>
                      This is the first paragraph without any spacing between paragraphs. Notice how hard it is to distinguish where one thought ends.
                    </p>
                    <p style={{ lineHeight: "1.75", fontFamily: "'DM Sans', sans-serif", marginBottom: "0" }}>
                      And the next one begins. The lack of visual separation makes the text feel dense and overwhelming.
                    </p>
                    <p style={{ lineHeight: "1.75", fontFamily: "'DM Sans', sans-serif", marginBottom: "0" }}>
                      Readers struggle to parse the content into meaningful chunks. This reduces comprehension.
                    </p>
                  </div>
                </div>

                {/* With Optimal Spacing */}
                <div className="bg-[#E5F8E5] p-6 border border-green-300">
                  <div className="flex items-center gap-2 mb-3">
                    <CheckCircle2 size={16} className="text-green-600" />
                    <span className="text-xs font-bold uppercase tracking-wider text-green-700">
                      Optimal (1rem / 16px)
                    </span>
                  </div>
                  <div className="paragraph-spacing">
                    <p style={{ lineHeight: "1.75", fontFamily: "'DM Sans', sans-serif" }}>
                      This is the first paragraph with optimal spacing. See how the visual break helps you identify separate ideas?
                    </p>
                    <p style={{ lineHeight: "1.75", fontFamily: "'DM Sans', sans-serif" }}>
                      Each paragraph gets breathing room. The 16px gap (1rem) creates a clear distinction between thoughts.
                    </p>
                    <p style={{ lineHeight: "1.75", fontFamily: "'DM Sans', sans-serif" }}>
                      This makes the content scannable and improves overall comprehension significantly.
                    </p>
                  </div>
                </div>
              </div>
            </section>

            {/* ═══════════════════════════════════════════
                4. COMPONENT DEMONSTRATIONS
                ═══════════════════════════════════════════ */}
            <section className="mb-20 bg-white p-8 md:p-12 border-l-4 border-[#C8F04D]">
              <h2
                className="text-3xl font-bold text-[#141115] mb-6"
                style={{ fontFamily: "'Inter', sans-serif" }}
              >
                4. Spacing Components
              </h2>
              <p className="text-sm text-[#6B6870] mb-10">
                Use these components to automatically apply optimal spacing rules.
              </p>

              {/* Prose Component */}
              <div className="mb-12">
                <h3
                  className="text-xl font-semibold text-[#141115] mb-4"
                  style={{ fontFamily: "'Inter', sans-serif" }}
                >
                  &lt;Prose&gt; Component
                </h3>
                <div className="bg-[#F5F5F5] p-6 border-2 border-[#C8F04D]">
                  <Prose>
                    <h2>The Future of Athletic Partnerships</h2>
                    <p>
                      NatureHood is revolutionizing how athletes and brands connect. We believe in authentic
                      partnerships that benefit both parties and create genuine value for audiences.
                    </p>
                    <p>
                      Our platform removes the middleman and puts control back in the hands of athletes.
                      Whether you're a professional competitor or an emerging talent, you deserve fair
                      compensation for your influence and dedication.
                    </p>
                    <h3>Why Choose NatureHood?</h3>
                    <p>
                      Traditional sponsorship models are broken. They favor celebrities while leaving talented
                      athletes without opportunities. We're changing that narrative.
                    </p>
                  </Prose>
                </div>
                <p className="text-xs text-[#6B6870] mt-2 italic">
                  ↑ Automatically applies line-height: 1.75, max-width: 65ch, and paragraph spacing
                </p>
              </div>

              {/* TextBlock Component */}
              <div className="mb-12">
                <h3
                  className="text-xl font-semibold text-[#141115] mb-4"
                  style={{ fontFamily: "'Inter', sans-serif" }}
                >
                  &lt;TextBlock&gt; Component
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-[#F5F5F5] p-6">
                    <p className="text-xs font-bold uppercase tracking-wider mb-3 text-[#141115]">Tight Spacing</p>
                    <TextBlock spacing="tight">
                      <p className="text-sm text-[#6B6870]">First paragraph with tight spacing.</p>
                      <p className="text-sm text-[#6B6870]">Second paragraph follows closely.</p>
                      <p className="text-sm text-[#6B6870]">Use for compact layouts.</p>
                    </TextBlock>
                  </div>
                  <div className="bg-[#E5F8E5] p-6 border-2 border-[#C8F04D]">
                    <p className="text-xs font-bold uppercase tracking-wider mb-3 text-[#141115]">Normal Spacing (Recommended)</p>
                    <TextBlock spacing="normal">
                      <p className="text-sm text-[#6B6870]">First paragraph with normal spacing.</p>
                      <p className="text-sm text-[#6B6870]">Second paragraph has breathing room.</p>
                      <p className="text-sm text-[#6B6870]">Perfect for most content.</p>
                    </TextBlock>
                  </div>
                  <div className="bg-[#F5F5F5] p-6">
                    <p className="text-xs font-bold uppercase tracking-wider mb-3 text-[#141115]">Relaxed Spacing</p>
                    <TextBlock spacing="relaxed">
                      <p className="text-sm text-[#6B6870]">First paragraph with relaxed spacing.</p>
                      <p className="text-sm text-[#6B6870]">Second paragraph feels spacious.</p>
                      <p className="text-sm text-[#6B6870]">Great for landing pages.</p>
                    </TextBlock>
                  </div>
                </div>
              </div>

              {/* ReadableText Component */}
              <div className="mb-12">
                <h3
                  className="text-xl font-semibold text-[#141115] mb-4"
                  style={{ fontFamily: "'Inter', sans-serif" }}
                >
                  &lt;ReadableText&gt; Component
                </h3>
                <div className="space-y-6">
                  <div className="bg-[#F5F5F5] p-6">
                    <p className="text-xs font-bold uppercase tracking-wider mb-3 text-[#141115]">Small (14px)</p>
                    <ReadableText size="sm">
                      This text uses the small size (14px) with optimal line-height (1.6) and max-width (60ch).
                      Perfect for secondary content, captions, or supporting information that needs to be readable
                      but not dominate the page.
                    </ReadableText>
                  </div>
                  <div className="bg-[#E5F8E5] p-6 border-2 border-[#C8F04D]">
                    <p className="text-xs font-bold uppercase tracking-wider mb-3 text-[#141115]">Base (16px) - Recommended</p>
                    <ReadableText size="base">
                      This text uses the base size (16px) with optimal line-height (1.75) and max-width (65ch).
                      This is the recommended size for all body text. It provides the best balance of readability,
                      accessibility, and professional appearance across all devices.
                    </ReadableText>
                  </div>
                  <div className="bg-[#F5F5F5] p-6">
                    <p className="text-xs font-bold uppercase tracking-wider mb-3 text-[#141115]">Large (18px)</p>
                    <ReadableText size="lg">
                      This text uses the large size (18px) with optimal line-height (1.75) and max-width (70ch).
                      Excellent for introductory paragraphs, pull quotes, or content that needs emphasis.
                    </ReadableText>
                  </div>
                </div>
              </div>
            </section>

            {/* ═══════════════════════════════════════════
                5. DESIGN TOKEN REFERENCE
                ═══════════════════════════════════════════ */}
            <section className="bg-[#141115] text-white p-8 md:p-12">
              <h2
                className="text-3xl font-bold mb-6"
                style={{ fontFamily: "'Inter', sans-serif" }}
              >
                5. Spacing Tokens Reference
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
                {/* Line Heights */}
                <div>
                  <h3 className="text-sm font-bold uppercase tracking-wider text-[#C8F04D] mb-4">
                    Line Heights
                  </h3>
                  <div className="space-y-2 text-sm font-mono">
                    <div className="flex justify-between">
                      <span className="text-[#A09EA3]">tight:</span>
                      <span className="text-white">{tokens.textSpacing.lineHeight.tight}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#A09EA3]">snug:</span>
                      <span className="text-white">{tokens.textSpacing.lineHeight.snug}</span>
                    </div>
                    <div className="flex justify-between bg-[#C8F04D]/10 px-2 py-1">
                      <span className="text-[#C8F04D]">normal:</span>
                      <span className="text-[#C8F04D] font-bold">{tokens.textSpacing.lineHeight.normal}</span>
                    </div>
                    <div className="flex justify-between bg-[#C8F04D]/10 px-2 py-1">
                      <span className="text-[#C8F04D]">relaxed:</span>
                      <span className="text-[#C8F04D] font-bold">{tokens.textSpacing.lineHeight.relaxed}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#A09EA3]">loose:</span>
                      <span className="text-white">{tokens.textSpacing.lineHeight.loose}</span>
                    </div>
                  </div>
                </div>

                {/* Paragraph Spacing */}
                <div>
                  <h3 className="text-sm font-bold uppercase tracking-wider text-[#C8F04D] mb-4">
                    Paragraph Spacing
                  </h3>
                  <div className="space-y-2 text-sm font-mono">
                    <div className="flex justify-between">
                      <span className="text-[#A09EA3]">tight:</span>
                      <span className="text-white">{tokens.textSpacing.paragraph.tight}</span>
                    </div>
                    <div className="flex justify-between bg-[#C8F04D]/10 px-2 py-1">
                      <span className="text-[#C8F04D]">normal:</span>
                      <span className="text-[#C8F04D] font-bold">{tokens.textSpacing.paragraph.normal}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#A09EA3]">relaxed:</span>
                      <span className="text-white">{tokens.textSpacing.paragraph.relaxed}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#A09EA3]">loose:</span>
                      <span className="text-white">{tokens.textSpacing.paragraph.loose}</span>
                    </div>
                  </div>
                </div>

                {/* Section Spacing */}
                <div>
                  <h3 className="text-sm font-bold uppercase tracking-wider text-[#C8F04D] mb-4">
                    Section Spacing
                  </h3>
                  <div className="space-y-2 text-sm font-mono">
                    <div className="flex justify-between">
                      <span className="text-[#A09EA3]">xs:</span>
                      <span className="text-white">{tokens.textSpacing.section.xs}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#A09EA3]">sm:</span>
                      <span className="text-white">{tokens.textSpacing.section.sm}</span>
                    </div>
                    <div className="flex justify-between bg-[#C8F04D]/10 px-2 py-1">
                      <span className="text-[#C8F04D]">md:</span>
                      <span className="text-[#C8F04D] font-bold">{tokens.textSpacing.section.md}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#A09EA3]">lg:</span>
                      <span className="text-white">{tokens.textSpacing.section.lg}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#A09EA3]">xl:</span>
                      <span className="text-white">{tokens.textSpacing.section.xl}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Quick Usage Guide */}
              <div className="bg-[#1E1B1F] p-6 mt-8">
                <h3 className="text-lg font-bold mb-4 text-[#C8F04D]">Quick Usage Guide</h3>
                <div className="space-y-3 text-sm">
                  <div>
                    <code className="text-[#C8F04D]">&lt;Prose&gt;</code>
                    <span className="text-[#A09EA3]"> - For long-form content with automatic spacing</span>
                  </div>
                  <div>
                    <code className="text-[#C8F04D]">&lt;TextBlock spacing="normal"&gt;</code>
                    <span className="text-[#A09EA3]"> - For multiple paragraphs with controlled spacing</span>
                  </div>
                  <div>
                    <code className="text-[#C8F04D]">&lt;ReadableText size="base"&gt;</code>
                    <span className="text-[#A09EA3]"> - For single paragraphs with optimal line-height</span>
                  </div>
                  <div>
                    <code className="text-[#C8F04D]">className="max-w-readable"</code>
                    <span className="text-[#A09EA3]"> - Utility class for 65ch max-width</span>
                  </div>
                  <div>
                    <code className="text-[#C8F04D]">className="paragraph-spacing"</code>
                    <span className="text-[#A09EA3]"> - Utility class for automatic paragraph gaps</span>
                  </div>
                </div>
              </div>
            </section>

            {/* Best Practices Checklist */}
            <section className="mt-20 bg-[#E5F8E5] p-8 md:p-12 border-2 border-[#C8F04D]">
              <h2
                className="text-2xl font-bold text-[#141115] mb-6"
                style={{ fontFamily: "'Inter', sans-serif" }}
              >
                ✓ Readability Best Practices Checklist
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  'Line height: 1.75 for body text',
                  'Max width: 65ch for optimal reading',
                  'Paragraph spacing: 1rem (16px) minimum',
                  'Letter spacing: -0.02em for large headings',
                  'Section spacing: 4-6rem between major sections',
                  'Color contrast: Use #6B6870 on light backgrounds',
                  'Font size: 16px minimum for body text',
                  'Avoid text on busy background images',
                ].map((item, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <CheckCircle2 size={20} className="text-green-600 flex-shrink-0 mt-0.5" />
                    <span className="text-sm text-[#141115]">{item}</span>
                  </div>
                ))}
              </div>
            </section>
          </Container>
        </div>
      ) : (
        /* ═══════════════════════════════════════════
            ORIGINAL LANDING PAGE DEMO
            ═══════════════════════════════════════════ */
        <>
          <HeroTemplate
            title="Empower Athletes. Amplify Brands."
            subtitle="Join the next generation of athlete-brand partnerships. Authentic collaborations that drive real results."
            backgroundVideo="https://jkaucsreqaywqxjwvteh.supabase.co/storage/v1/object/public/public-media/hero.mp4"
            primaryCTA={
              <Link href="/signup">
                <ButtonAccent>Get Started Free</ButtonAccent>
              </Link>
            }
            secondaryCTA={
              <Link href="/about">
                <ButtonSecondary variant="white">Learn More</ButtonSecondary>
              </Link>
            }
          />

          <FeatureSection
            title="Why NatureHood?"
            subtitle="Everything you need to build authentic athlete-brand partnerships"
            columns={3}
            features={[
              {
                icon: <Zap size={32} />,
                title: 'Instant Connections',
                description: 'Match with brands and athletes that align with your values and goals in seconds.',
              },
              {
                icon: <Users size={32} />,
                title: 'Verified Community',
                description: 'Join a curated network of authentic athletes and trusted brands.',
              },
              {
                icon: <TrendingUp size={32} />,
                title: 'Track Performance',
                description: 'Monitor campaign metrics and ROI with real-time analytics.',
              },
              {
                icon: <Shield size={32} />,
                title: 'Secure Payments',
                description: 'Safe and transparent payment processing for all collaborations.',
              },
              {
                icon: <Award size={32} />,
                title: 'Portfolio Building',
                description: 'Showcase your work and build credibility in the athletic community.',
              },
              {
                icon: <Target size={32} />,
                title: 'Smart Matching',
                description: 'AI-powered recommendations connect you with the perfect partners.',
              },
            ]}
          />

          <StatsSection
            stats={[
              { value: '10K+', label: 'Active Athletes' },
              { value: '500+', label: 'Brand Partners' },
              { value: '$2M+', label: 'Earnings Paid' },
              { value: '98%', label: 'Satisfaction Rate' },
            ]}
          />

          {/* ═══════════════════════════════════════════
              HOW IT WORKS SECTION
              ═══════════════════════════════════════════ */}
          <HowWeWorkSection />

          <Section>
            <Container>
              <div className="text-center mb-16">
                <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-[#141115] mb-4" style={{ fontFamily: "'Inter', sans-serif" }}>
                  Trusted by Athletes & Brands
                </h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {[
                  { name: 'Sarah Chen', role: 'Trail Runner', quote: 'NatureHood connected me with brands that truly align with my values.' },
                  { name: 'Peak Performance', role: 'Sports Brand', quote: 'We found authentic athletes who genuinely love our products.' },
                  { name: 'Marcus Lee', role: 'Climber', quote: 'Finally earning from doing what I love. Game changer.' },
                ].map((item, i) => (
                  <div key={i} className="bg-[#1E1B1F] p-8">
                    <Prose maxWidth="lg">
                      <p className="text-base text-[#F5F5F5] mb-6 italic" style={{ fontFamily: "'DM Sans', sans-serif" }}>
                        &ldquo;{item.quote}&rdquo;
                      </p>
                    </Prose>
                    <div className="border-t border-[#3A373C] pt-4">
                      <p className="text-sm font-semibold text-white" style={{ fontFamily: "'Inter', sans-serif" }}>
                        {item.name}
                      </p>
                      <p className="text-xs text-[#6B6870]" style={{ fontFamily: "'DM Sans', sans-serif" }}>
                        {item.role}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </Container>
          </Section>

          <CTASection
            headline="Ready to Start Your Journey?"
            subtext="Join thousands of athletes and brands building the future of sports partnerships."
            variant="dark"
            primaryCTA={
              <Link href="/signup">
                <ButtonAccent>Sign Up Now</ButtonAccent>
              </Link>
            }
            secondaryCTA={
              <Link href="/contact">
                <ButtonSecondary variant="white">Contact Sales</ButtonSecondary>
              </Link>
            }
          />
        </>
      )}
    </main>
  );
}
