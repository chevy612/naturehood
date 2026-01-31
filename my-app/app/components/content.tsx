"use client";
import { ChevronRight } from "lucide-react";

export default function HowWeWorkSection() {
  const steps = [
    {
      number: "1",
      title: "Athletes as Brands",
      subtitle: "Build audience through storytelling",
      description:
        "We help athletes develop content and personal branding that reflects their performance, mindset, and journey—turning visibility into long-term value, without distracting from training.",
      image: "/image/brand.webp",
      video: "https://jkaucsreqaywqxjwvteh.supabase.co/storage/v1/object/public/public-media/athlete.mp4",
      buttonText: "Learn more",
      buttonLink: "#",
    },
    {
      number: "2",
      title: "Athletes x Business",
      subtitle: "Create value through collaboration",
      description:
        "We match athletes with businesses that align with their audience and values, creating authentic collaborations that benefit both sides—athletes get paid, brands get meaningful exposure.",
      image: "/image/business.webp",
      video: "https://jkaucsreqaywqxjwvteh.supabase.co/storage/v1/object/public/public-media/business.mp4",
      buttonText: "Learn more",
      buttonLink: "#",
    },
    {
      number: "3",
      title: "Growing with Intention",
      subtitle: "A long-term system, built step by step",
      description:
        "Naturehood is a growing ecosystem. We start with community and storytelling, then scale into technology and tools that support performance, visibility, and sustainable athlete careers.",
      image: "/image/future.webp",
      video: "https://jkaucsreqaywqxjwvteh.supabase.co/storage/v1/object/public/public-media/future.mp4",
      buttonText: "Learn more",
      buttonLink: "#",
    },
  ];

  return (
    <section className="px-4 sm:px-6 md:px-10 lg:px-16 xl:px-20 py-12 md:py-16">
      <h1 className="text-center">How We Work</h1>

      <div className="grid grid-cols-1 md:grid-cols-1 lg:grid-cols-1 gap-8 md:gap-8 lg:gap-8 xl:gap-10">
        {steps.map((step) => (
          <MediaContentBlock
            key={step.number}
            title={step.title}
            subtitle={step.subtitle}
            mediaType={step.video ? "video" : "image"}
            mediaSrc={step.video ? step.video : step.image!}
            mediaAlt={step.title}
            description={step.description}
            buttonText={step.buttonText}
            buttonLink={step.buttonLink}
            reverseLayout={parseInt(step.number) % 2 === 0}
          />
        ))}
      </div>
    </section>
  );
}

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

export function MediaContentBlock({
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

  const isDevelopment = process.env.NODE_ENV === 'development';
  
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
              autoPlay={!isDevelopment}
              loop
              muted
              playsInline
              disablePictureInPicture={!isDevelopment}
              disableRemotePlayback={!isDevelopment}
              controls={isDevelopment}
              className={`w-full h-auto max-h-[300px] sm:max-h-[400px] md:max-h-[500px] lg:max-h-[600px] object-cover ${!isDevelopment ? 'pointer-events-none' : ''}`}
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
