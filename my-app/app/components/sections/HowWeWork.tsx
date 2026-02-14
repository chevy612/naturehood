"use client";

import MediaContentBlock from "@/app/components/MediaContentBlock";
import { ReadableText } from "../basic/basic";

// ─────────────────────────────────────────────
// HOW WE WORK SECTION - Content & Component
// All content and logic in one place for easy maintenance
// ─────────────────────────────────────────────

// Content Data
const HOW_WE_WORK_STEPS = [
  {
    number: "01",
    eyebrow: "For athletes",
    title: "Athletes as Brands",
    subtitle: "Build audience through storytelling",
    description:
      "We help athletes develop content and personal branding that reflects their performance, mindset, and journey—turning visibility into long-term value, without distracting from training.",
    video: "https://jkaucsreqaywqxjwvteh.supabase.co/storage/v1/object/public/public-media/athlete.mp4",
    image: "/image/brand.webp",
    buttonText: "Learn More",
    buttonLink: "#athletes",
  },
  {
    number: "02",
    eyebrow: "For brands",
    title: "Athletes × Business",
    subtitle: "Create value through collaboration",
    description:
      "We match athletes with businesses that align with their audience and values, creating authentic collaborations that benefit both sides—athletes get paid, brands get meaningful exposure.",
    video: "https://jkaucsreqaywqxjwvteh.supabase.co/storage/v1/object/public/public-media/business.mp4",
    image: "/image/business.webp",
    buttonText: "Explore Partnerships",
    buttonLink: "#partnerships",
  },
  {
    number: "03",
    eyebrow: "For the community",
    title: "Growing with Intention",
    subtitle: "A long-term system, built step by step",
    description:
      "NatureHood is a growing startup. We start with creative projects, then scale into technology and tools that accerelate the sport economy in Hong Kong and beyond.",
    video: "https://jkaucsreqaywqxjwvteh.supabase.co/storage/v1/object/public/public-media/future.mp4",
    image: "/image/future.webp",
    buttonText: "Our Vision",
    buttonLink: "#vision",
  },
];

// Main Component
export default function HowWeWorkSection() {
  return (
    <div className="w-full">
      {/* Section Header */}
      <div className="text-center py-12 sm:py-16 md:py-20 px-4 bg-[#E8E8E8]">
        <p
          className="text-[10px] font-semibold uppercase tracking-[0.3em] text-[#6B6870] mb-4"
          style={{ fontFamily: "'DM Sans', sans-serif" }}
        >
          Our Process
        </p>
        <h1
          className="text-4xl sm:text-5xl md:text-6xl font-bold text-[#141115] mb-2"
          style={{
            fontFamily: "'Inter', sans-serif",
            lineHeight: "1.1",
            letterSpacing: "-0.02em",
          }}
        >
          How We Work
        </h1>        
      </div>

      {/* Steps - Using MediaContentBlock */}
      <div className="w-full">
        {HOW_WE_WORK_STEPS.map((step, index) => (
          <MediaContentBlock
            key={step.number}
            eyebrow={step.eyebrow}
            title={step.title}
            description={step.description}
            mediaType="video"
            mediaSrc={step.video}
            mediaAlt={step.title}
            buttonText={step.buttonText}
            buttonLink={step.buttonLink}
            darkMode={index % 2 === 1} // Alternate dark/light
            reverseLayout={index % 2 === 1} // Alternate layout
          />
        ))}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// USAGE EXAMPLE
// ─────────────────────────────────────────────
/*
Import and use in your page:

import HowWeWorkSection from '@/app/components/sections/HowWeWork';

export default function HomePage() {
  return (
    <main>
      <HeroSection />
      <HowWeWorkSection />
      <CTASection />
    </main>
  );
}
*/
