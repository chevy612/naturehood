"use client";

import { ArrowRight } from "lucide-react";
import { ReadableText } from "./basic/basic";

interface MediaContentBlockProps {
  // Content
  eyebrow?: string;           // Small label above title
  title: string;              // Main heading
  description: string;        // Body text

  // Media
  mediaType: "image" | "video";
  mediaSrc: string;
  mediaAlt?: string;
  videoControls?: boolean;

  // CTA
  buttonText?: string;
  buttonLink?: string;
  onButtonClick?: () => void;

  // Layout
  reverseLayout?: boolean;    // Swap media and content sides
  darkMode?: boolean;         // Dark background variant
}

export default function MediaContentBlock({
  eyebrow,
  title,
  description,
  mediaType,
  mediaSrc,
  mediaAlt = "Media content",
  videoControls = false,
  buttonText,
  buttonLink,
  onButtonClick,
  reverseLayout = false,
  darkMode = false,
}: MediaContentBlockProps) {
  const handleButtonClick = () => {
    if (onButtonClick) {
      onButtonClick();
    } else if (buttonLink) {
      window.location.href = buttonLink;
    }
  };

  // Development mode detection
  const isDevelopment = process.env.NODE_ENV === 'development';
  
  // Video settings - enable controls in development
  const videoSettings = {
    controls: videoControls || isDevelopment,
    autoPlay: !isDevelopment, // Disable autoplay in development
    loop: true,
    muted: true,
    playsInline: true,
  };

  // Color scheme
  const colors = darkMode
    ? {
        bg: "bg-[#141115]",
        eyebrow: "text-[#C8F04D]",
        title: "text-[#F5F5F5]",
        description: "text-[#A09EA3]",
        buttonBg: "bg-[#C8F04D]",
        buttonText: "text-[#141115]",
        buttonHover: "hover:bg-[#b8e038]",
      }
    : {
        bg: "bg-[#F5F5F5]",
        eyebrow: "text-[#6B6870]",
        title: "text-[#141115]",
        description: "text-[#6B6870]",
        buttonBg: "bg-[#141115]",
        buttonText: "text-[#C8F04D]",
        buttonHover: "hover:bg-[#1E1B1F]",
      };

  return (
    <section className={`w-full ${colors.bg} py-16 sm:py-10 md:py-14 lg:py-18`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 lg:px-12">
        {/* Content Grid - Responsive Layout */}
        <div
          className={`grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 xl:gap-16 items-center ${
            reverseLayout ? "lg:grid-flow-dense" : ""
          }`}
        >
          {/* Text Content */}
          <div
            className={`flex flex-col gap-6 ${reverseLayout ? "lg:col-start-2" : ""}`}
          >
            {/* Eyebrow Label */}
            {eyebrow && (
              <p
                className={`text-[10px] font-semibold uppercase tracking-[0.3em] ${colors.eyebrow}`}
                style={{ fontFamily: "'DM Sans', sans-serif" }}
              >
                {eyebrow}
              </p>
            )}

            {/* Title */}
            <h2
              className={`text-3xl sm:text-4xl md:text-5xl font-bold ${colors.title}`}
              style={{
                fontFamily: "'Inter', sans-serif",
                lineHeight: "1.2",
                letterSpacing: "-0.015em",
              }}
            >
              {title}
            </h2>

            {/* Description - Using ReadableText for optimal spacing */}
            <ReadableText
              size="base"
              className={`${colors.description} max-w-none`}
            >
              {description}
            </ReadableText>

            {/* CTA Button */}
            {buttonText && (
              <div className="mt-2">
                <button
                  onClick={handleButtonClick}
                  className={`
                    group inline-flex items-center gap-2
                    ${colors.buttonBg} ${colors.buttonText}
                    px-5 py-3 sm:px-6 sm:py-3.5 md:px-8 md:py-4
                    text-xs sm:text-sm font-bold tracking-widest uppercase
                    transition-all duration-300 ease-out
                    ${colors.buttonHover}
                    active:scale-[0.97]
                  `}
                  style={{ fontFamily: "'Inter', sans-serif" }}
                  aria-label={buttonText}
                >
                  {buttonText}
                  <ArrowRight
                    className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-1"
                    strokeWidth={2.5}
                  />
                </button>
              </div>
            )}
          </div>

          {/* Media Content */}
          <div
            className={`relative overflow-hidden ${
              reverseLayout ? "lg:col-start-1 lg:row-start-1" : ""
            }`}
          >
            {/* Accent Border */}
            <div className="absolute top-0 left-0 w-1 h-full bg-[#C8F04D] z-10" />

            <div className="relative">
              {mediaType === "video" ? (
                <video
                  src={mediaSrc}
                  autoPlay={videoSettings.autoPlay}
                  loop={videoSettings.loop}
                  muted={videoSettings.muted}
                  playsInline={videoSettings.playsInline}
                  controls={videoSettings.controls}
                  disablePictureInPicture={!videoSettings.controls}
                  disableRemotePlayback={!videoSettings.controls}
                  className="w-full h-auto aspect-video object-cover"
                  style={{
                    maxHeight: "600px",
                  }}
                  aria-label={mediaAlt}
                >
                  Your browser does not support the video tag.
                </video>
              ) : (
                <img
                  src={mediaSrc}
                  alt={mediaAlt}
                  className="w-full h-auto aspect-video object-cover"
                  style={{
                    maxHeight: "600px",
                  }}
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ─────────────────────────────────────────────
// EXAMPLE: How to Use MediaContentBlock
// ─────────────────────────────────────────────
/*
<MediaContentBlock
  eyebrow="Step 01"
  title="Create Your Profile"
  description="Join NatureHood in minutes. Build your athlete profile, showcase your achievements, and connect with brands that align with your values and goals."
  mediaType="video"
  mediaSrc="/path/to/video.mp4"
  buttonText="Get Started"
  buttonLink="/signup"
  darkMode={false}
  reverseLayout={false}
/>

<MediaContentBlock
  eyebrow="Step 02"
  title="Find Perfect Matches"
  description="Our AI-powered matching system connects you with opportunities that fit your sport, audience, and brand. Browse partnerships or let brands discover you."
  mediaType="image"
  mediaSrc="/path/to/image.jpg"
  buttonText="Explore Opportunities"
  buttonLink="/explore"
  darkMode={true}
  reverseLayout={true}
/>
*/
