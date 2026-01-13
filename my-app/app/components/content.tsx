"use client";
<<<<<<< HEAD
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
=======
import { useState, useRef, useEffect } from "react";

export function IntroSection() {
  const title = "Redefining Athlete";
  const content = [
    "Naturehood is a community-led project built to challenge how athletes are valued in today’s world.\n\n\nCompetitive athletes dedicate years to training, discipline, and performance—yet their value is often reduced to results, rankings, or medals alone.",
    "Outside competition, many athletes struggle to sustain their careers or express who they are beyond the sport.\n\n\nTheir effort, mindset, and daily commitment remain largely unseen—despite shaping culture, inspiring others, and driving influence far beyond the field of play.",
    "Naturehood exists to change that.\n\n\nWe believe athletes are more than results. Their journey, identity, and way of living carry cultural, creative, and commercial value—when told with intention.\n\n\n\This is where performance meets storytelling.\n\n\nThis is how athlete value is redefined."
  ]

  return (
    <>
      <section className="flex flex-col items-center justify-center text-center px-4 sm:px-6 md:px-10 lg:px-40 py-8 md:py-10">
        <h1>{title}</h1>
        <HorizontalScroll items={content} />
      </section>
    </>
  );
}

interface HorizontalScrollProps {
  items: string[];
}

export function HorizontalScroll({ items }: HorizontalScrollProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      if (scrollContainerRef.current) {
        const scrollLeft = scrollContainerRef.current.scrollLeft;
        const itemWidth = scrollContainerRef.current.scrollWidth / items.length;
        const newIndex = Math.round(scrollLeft / itemWidth);
        setCurrentIndex(newIndex);
      }
    };

    const container = scrollContainerRef.current;
    if (container) {
      container.addEventListener('scroll', handleScroll);
      return () => container.removeEventListener('scroll', handleScroll);
    }
  }, [items.length]);

  const scrollToIndex = (index: number) => {
    setCurrentIndex(index);
    const element = document.getElementById(`scroll-item-${index}`);
    element?.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
  };

  return (
    <div className="w-full max-w-4xl">
      {/* Scrollable content */}
      <div 
        ref={scrollContainerRef}
        className="overflow-x-auto scroll-smooth snap-x snap-mandatory hide-scrollbar"
      >
        <div className="flex gap-4">
          {items.map((item, index) => (
            <div
              key={index}
              id={`scroll-item-${index}`}
              className="min-w-full snap-center flex items-center justify-center px-2"
            >
              <p className="text-base sm:text-lg md:text-xl font-mono font-medium">
                {item}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Navigation dots */}
      <div className="flex justify-center gap-5 mt-6">
        {items.map((_, index) => (
          <button
            key={index}
            onClick={() => scrollToIndex(index)}
            className={`w-2 h-2 rounded-full transition-all duration-300 ${
              currentIndex === index 
                ? 'bg-gray-100 ring-2 hover:bg-gray-500 ring-gray-100' 
                : 'bg-gray-400 hover:bg-gray-500'
            }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>

      <style jsx>{`
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .hide-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
}

function HowWeWorkSection() {
  const steps: Array<{
    number: string;
    title: string;
    subtitle: string;
    description: string;
    image?: string;
    video?: string;
  }> = [
    {
      number: "1",
      title: "Athletes as Brands",
      subtitle:"Bulid audience through storytelling",
      description:
        "We help athletes develop content and personal branding that reflects their performance, mindset, and journey—turning visibility into long-term value, without distracting from training.",
      image: "/image/athlete-partnership.webp", // Replace with your actual image path
>>>>>>> 7a9937d14e3d55973890e4611c6b3831970b0921
    },
    {
      number: "2",
      title: "Athletes x Business",
<<<<<<< HEAD
      subtitle: "Create value through collaboration",
      description:
        "We match athletes with businesses that align with their audience and values, creating authentic collaborations that benefit both sides—athletes get paid, brands get meaningful exposure.",
      image: "/image/business.webp",
      buttonText: "Learn more",
      buttonLink: "#",
=======
      subtitle:"Authentic collaborations that create value",
      description:"We match athletes with businesses that align with their audience and values, creating authentic collaborations that benefit both sides—athletes get paid, brands get meaningful exposure.",
      image: "/image/audience-positioning.webp", // Replace with your actual image path
>>>>>>> 7a9937d14e3d55973890e4611c6b3831970b0921
    },
    {
      number: "3",
      title: "Growing with Intention",
<<<<<<< HEAD
      subtitle: "A long-term system, built step by step",
      description:
        "Naturehood is a growing ecosystem. We start with community and storytelling, then scale into technology and tools that support performance, visibility, and sustainable athlete careers.",
      image: "/image/future.webp",
      video: "https://jkaucsreqaywqxjwvteh.supabase.co/storage/v1/object/public/public-media/future.mp4",
      buttonText: "Learn more",
      buttonLink: "#",
=======
      subtitle:"A long-term system, built step by step",
      description:"Naturehood is a growing ecosystem. We start with community and storytelling, then scale into technology and tools that support performance, visibility, and sustainable athlete careers.",
      image: "/image/brand-collaboration.webp", // Replace with your actual image path
      video: "https://jkaucsreqaywqxjwvteh.supabase.co/storage/v1/object/public/public-media/future.mp4"
>>>>>>> 7a9937d14e3d55973890e4611c6b3831970b0921
    },
  ];

  return (
<<<<<<< HEAD
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
=======
    <section className="px-4 sm:px-6 md:px-10 lg:px-40 py-12 md:py-16">
      <h2 className="text-center">How We Work</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-10 lg:gap-12">
        {steps.map((step) => (
          <div key={step.number} className="flex flex-col gap-4">
            {/* Media (Image or Video) */}
            <div className="w-full aspect-square overflow-hidden rounded-lg bg-gray-200">
              {step.video ? (
                <video
                  className="w-full h-full object-cover"
                  autoPlay
                  loop
                  muted
                  playsInline
                  controls
                  preload="metadata"
                >
                  <source src={step.video} type="video/mp4" />
                  Your browser does not support the video tag.
                </video>
              ) : (
                <img
                  src={step.image}
                  alt={step.title}
                  className="w-full h-full object-cover"
                />
              )}
            </div>

            {/* Content */}
            <div className="flex flex-col gap-3">
              <h3>{step.title}</h3>
              <p className="text-sm sm:text-base font-mono font-medium text-gray-700 leading-relaxed">
                {step.description}
              </p>
            </div>
          </div>
        ))}
>>>>>>> 7a9937d14e3d55973890e4611c6b3831970b0921
      </div>
    </section>
  );
}
