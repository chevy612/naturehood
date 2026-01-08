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
  reverseLayout?: boolean;
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
  reverseLayout = false,
}: MediaContentBlockProps) {
  const handleButtonClick = () => {
    if (onButtonClick) {
      onButtonClick();
    } else if (buttonLink) {
      window.location.href = buttonLink;
    }
  };

  return (
    <section className="w-full py-8">
      {/* Title */}
      <h3 className="flex-1 truncate whitespace-nowrap leading-none text-sm sm:text-base md:text-lg">{title}</h3>
      <h2 className="mb-6">{subtitle}</h2>

      {/* Content Layout - stacked on mobile, side-by-side on larger screens */}
      <div className={`flex flex-col ${reverseLayout ? 'lg:flex-row-reverse' : 'lg:flex-row'} gap-8`}>
        {/* Left Side: Description and Button */}
        <div className="flex flex-col lg:w-1/2">
          <div className="flex flex-row items-center justify-between gap-4">
            <div className="text-left">
              <p className="text-xs sm:text-sm md:text-base lg:text-lg leading-relaxed">
                {description}
              </p>
            </div>
            {/*<button
              onClick={handleButtonClick}
              className="btn-primary p-2 sm:p-2.5 md:p-3 rounded-full flex items-center justify-center transition-colors shrink-0 hover:scale-110"
              aria-label={buttonText}
            >
              <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6" />
            </button>*/}
          </div>
        </div>

        {/* Right Side: Media Content */}
        <div className="w-full lg:w-1/2 overflow-hidden">
          {mediaType === "video" ? (
            <video
              src={mediaSrc}
              autoPlay
              loop
              muted
              playsInline
              disablePictureInPicture
              disableRemotePlayback
              className="w-full h-auto max-h-[300px] sm:max-h-[400px] md:max-h-[500px] lg:max-h-[600px] object-cover pointer-events-none"
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
      </div>
    </section>
  );
}
