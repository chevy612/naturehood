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
    <section className="w-full px-2 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-6 md:py-8 rounded-lg shadow-md">
      {/* Title */}
      <h2 className="mb-3 sm:mb-4 md:mb-5">{title}</h2>

      {/* Subtitle with Button */}
      <div className="flex flex-row items-center justify-between gap-2 sm:gap-3 md:gap-4 mb-4 sm:mb-5 md:mb-6">
        <h3 className="flex-1 truncate whitespace-nowrap leading-none text-sm sm:text-base md:text-lg">{subtitle}</h3>
        <button
          onClick={handleButtonClick}
          className="btn-primary p-2 sm:p-2.5 md:p-3 rounded-full flex items-center justify-center transition-colors shrink-0 hover:scale-110"
          aria-label={buttonText}
        >
          <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6" />
        </button>
      </div>

      {/* Media Content */}
      <div className="w-full mb-4 sm:mb-5 md:mb-6 lg:mb-8 rounded-md sm:rounded-lg overflow-hidden">
        {mediaType === "video" ? (
          <video
            src={mediaSrc}
            controls
            className="w-full h-auto max-h-[300px] sm:max-h-[400px] md:max-h-[500px] lg:max-h-[600px] object-cover"
            aria-label={mediaAlt}
          >
            Your browser does not support the video tag.
          </video>
        ) : (
          <img
            src={mediaSrc}
            alt={mediaAlt}
            className="w-full h-auto max-h-[300px] sm:max-h-[400px] md:max-h-[500px] lg:max-h-[600px] object-cover"
          />
        )}
      </div>

      {/* Description */}
      <div className="text-left sm:text-center">
        <p className="text-xs sm:text-sm md:text-base lg:text-lg leading-relaxed">
          {description}
        </p>
      </div>
    </section>
  );
}
