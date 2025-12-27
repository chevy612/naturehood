"use client";
import { ChevronRight } from "lucide-react";

interface MediaContentBlockProps {
  title: string;
  subtitle: string;
  mediaType: "image" | "video";
  mediaSrc: string;
  mediaAlt?: string;
  description: string;
  buttonText: string;
  buttonLink: string;
  onButtonClick?: () => void;
}

export default function MediaContentBlock({
  title,
  subtitle,
  mediaType,
  mediaSrc,
  mediaAlt = "Media content",
  description,
  buttonText,
  buttonLink,
  onButtonClick,
}: MediaContentBlockProps) {
  const handleButtonClick = () => {
    if (onButtonClick) {
      onButtonClick();
    } else if (buttonLink) {
      window.location.href = buttonLink;
    }
  };

  return (
    <section className="w-full px-4 sm:px-6 md:px-10 lg:px-40 py-8 md:py-1 rounded-lg shadow-lg">
      {/* Title */}
      <h1 className="justify-start">{title}</h1>

      {/* Subtitle with Button */}
      <div className="flex items-center justify-between gap-4 mb-6 md:mb-8">
        <h2 className="mb-0 flex-1">{subtitle}</h2>
        <button
          onClick={handleButtonClick}
          className="btn-primary p-2 sm:p-3  text-black rounded-full transition-colors"
          aria-label={buttonText}
        >
          <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7" />
        </button>
      </div>

      {/* Media Content */}
      <div className="w-full mb-6 md:mb-8 rounded-lg overflow-hidden">
        {mediaType === "video" ? (
          <video
            src={mediaSrc}
            controls
            className="w-full h-auto max-h-[600px] object-cover"
            aria-label={mediaAlt}
          >
            Your browser does not support the video tag.
          </video>
        ) : (
          <img
            src={mediaSrc}
            alt={mediaAlt}
            className="w-full h-auto max-h-[600px] object-cover"
          />
        )}
      </div>

      {/* Description */}
      <div className="text-center max-w-4xl mx-auto">
        <p className="text-base sm:text-lg md:text-xl leading-relaxed">
          {description}
        </p>
      </div>
    </section>
  );
}
