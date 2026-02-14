"use client";

// ============================================================
// NATUREHOODOFFICIAL — components/media.tsx
// Visual Media Components for Landing Page
// Images · Videos · Grids · Carousels · Lightbox
// ============================================================

import { useState, useRef, ReactNode } from "react";

// ─────────────────────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────────────────────

type AspectRatio = "16/9" | "4/3" | "1/1" | "3/4" | "2/3" | "21/9";

interface MediaImageProps {
  src: string;
  alt: string;
  aspectRatio?: AspectRatio;
  caption?: string;
  objectFit?: "cover" | "contain";
  overlay?: boolean;
  overlayContent?: ReactNode;
  onClick?: () => void;
}

interface MediaVideoProps {
  src: string;
  poster?: string;
  aspectRatio?: AspectRatio;
  caption?: string;
  autoplay?: boolean;
  muted?: boolean;
  loop?: boolean;
}

interface MediaGridProps {
  children: ReactNode;
  columns?: 2 | 3 | 4;
  gap?: "sm" | "md" | "lg";
}

interface MediaHeroProps {
  src: string;
  type?: "image" | "video";
  overlay?: boolean;
  children?: ReactNode;
  height?: "screen" | "lg" | "md";
}

interface MediaSplitProps {
  imageSrc: string;
  imageAlt: string;
  imagePosition?: "left" | "right";
  children: ReactNode;
  aspectRatio?: AspectRatio;
}

interface MediaCarouselItem {
  type: "image" | "video";
  src: string;
  alt?: string;
  caption?: string;
  poster?: string;
}

interface MediaCarouselProps {
  items: MediaCarouselItem[];
  aspectRatio?: AspectRatio;
}

interface MediaLightboxProps {
  src: string;
  alt: string;
  thumbnail: string;
  type?: "image" | "video";
}

// ─────────────────────────────────────────────────────────────
// 1. MEDIA IMAGE
//    Basic image component with aspect ratio, captions, overlays
// ─────────────────────────────────────────────────────────────
export function MediaImage({
  src,
  alt,
  aspectRatio = "16/9",
  caption,
  objectFit = "cover",
  overlay = false,
  overlayContent,
  onClick,
}: MediaImageProps) {
  return (
    <figure className="group relative w-full">
      <div
        className="relative w-full overflow-hidden bg-[#E8E8E8]"
        style={{ aspectRatio }}
      >
        <img
          src={src}
          alt={alt}
          className={`w-full h-full transition-transform duration-500 ${
            objectFit === "cover" ? "object-cover" : "object-contain"
          } ${onClick ? "cursor-pointer group-hover:scale-105" : ""}`}
          onClick={onClick}
        />
        
        {/* Hover Overlay */}
        {overlay && (
          <div className="absolute inset-0 bg-gradient-to-t from-[#141115]/80 via-[#141115]/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            {overlayContent && (
              <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                {overlayContent}
              </div>
            )}
          </div>
        )}
      </div>
      
      {caption && (
        <figcaption className="mt-3 font-ui text-[11px] text-[#6B6870] leading-relaxed">
          {caption}
        </figcaption>
      )}
    </figure>
  );
}

// ─────────────────────────────────────────────────────────────
// 2. MEDIA VIDEO
//    Video player with custom controls and poster frame
// ─────────────────────────────────────────────────────────────
export function MediaVideo({
  src,
  poster,
  aspectRatio = "16/9",
  caption,
  autoplay = false,
  muted = true,
  loop = false,
}: MediaVideoProps) {
  const [playing, setPlaying] = useState(autoplay);
  const videoRef = useRef<HTMLVideoElement>(null);

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (playing) {
      videoRef.current.pause();
    } else {
      videoRef.current.play();
    }
    setPlaying(!playing);
  };

  return (
    <figure className="group relative w-full">
      <div
        className="relative w-full overflow-hidden bg-[#141115]"
        style={{ aspectRatio }}
      >
        <video
          ref={videoRef}
          src={src}
          poster={poster}
          autoPlay={autoplay}
          muted={muted}
          loop={loop}
          playsInline
          className="w-full h-full object-cover"
          onClick={togglePlay}
        />
        
        {/* Custom Play Button */}
        {!playing && (
          <button
            onClick={togglePlay}
            className="absolute inset-0 flex items-center justify-center bg-[#141115]/30 backdrop-blur-sm transition-opacity duration-300 hover:bg-[#141115]/40"
            aria-label="Play video"
          >
            <div className="w-16 h-16 flex items-center justify-center bg-[#C8F04D] rounded-full transition-transform duration-200 hover:scale-110">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path
                  d="M8 6.5v11l10-5.5L8 6.5z"
                  fill="#141115"
                  stroke="#141115"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
          </button>
        )}
      </div>
      
      {caption && (
        <figcaption className="mt-3 font-ui text-[11px] text-[#6B6870] leading-relaxed">
          {caption}
        </figcaption>
      )}
    </figure>
  );
}

// ─────────────────────────────────────────────────────────────
// 3. MEDIA GRID
//    Responsive grid container for images/videos
// ─────────────────────────────────────────────────────────────
export function MediaGrid({
  children,
  columns = 3,
  gap = "md",
}: MediaGridProps) {
  const gapClasses = {
    sm: "gap-2",
    md: "gap-4",
    lg: "gap-6",
  };

  const gridCols = {
    2: "grid-cols-1 md:grid-cols-2",
    3: "grid-cols-1 md:grid-cols-2 lg:grid-cols-3",
    4: "grid-cols-1 md:grid-cols-2 lg:grid-cols-4",
  };

  return (
    <div className={`grid ${gridCols[columns]} ${gapClasses[gap]} w-full`}>
      {children}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// 4. MEDIA HERO
//    Full-width background media with content overlay
// ─────────────────────────────────────────────────────────────
export function MediaHero({
  src,
  type = "image",
  overlay = true,
  children,
  height = "lg",
}: MediaHeroProps) {
  const heights = {
    screen: "min-h-screen",
    lg: "min-h-[600px]",
    md: "min-h-[400px]",
  };

  return (
    <div className={`relative w-full ${heights[height]} overflow-hidden`}>
      {/* Background Media */}
      {type === "image" ? (
        <img
          src={src}
          alt=""
          className="absolute inset-0 w-full h-full object-cover"
        />
      ) : (
        <video
          src={src}
          autoPlay
          muted
          loop
          playsInline
          className="absolute inset-0 w-full h-full object-cover"
        />
      )}
      
      {/* Gradient Overlay */}
      {overlay && (
        <div className="absolute inset-0 bg-gradient-to-b from-[#141115]/60 via-[#141115]/40 to-[#141115]/80" />
      )}
      
      {/* Content */}
      {children && (
        <div className="relative z-10 flex items-center justify-center w-full h-full px-8">
          {children}
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// 5. MEDIA SPLIT
//    Image + content side-by-side layout
// ─────────────────────────────────────────────────────────────
export function MediaSplit({
  imageSrc,
  imageAlt,
  imagePosition = "left",
  children,
  aspectRatio = "4/3",
}: MediaSplitProps) {
  return (
    <div
      className={`grid grid-cols-1 lg:grid-cols-2 gap-0 lg:gap-8 items-center ${
        imagePosition === "right" ? "lg:flex-row-reverse" : ""
      }`}
    >
      {/* Image */}
      <div className={imagePosition === "right" ? "lg:order-2" : ""}>
        <MediaImage
          src={imageSrc}
          alt={imageAlt}
          aspectRatio={aspectRatio}
          objectFit="cover"
        />
      </div>
      
      {/* Content */}
      <div className={`py-12 lg:py-0 ${imagePosition === "right" ? "lg:order-1" : ""}`}>
        {children}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// 6. MEDIA CAROUSEL
//    Swipeable carousel for project showcases
// ─────────────────────────────────────────────────────────────
export function MediaCarousel({
  items,
  aspectRatio = "16/9",
}: MediaCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  const next = () => {
    setCurrentIndex((prev) => (prev + 1) % items.length);
  };

  const prev = () => {
    setCurrentIndex((prev) => (prev - 1 + items.length) % items.length);
  };

  const goTo = (index: number) => {
    setCurrentIndex(index);
  };

  const currentItem = items[currentIndex];

  return (
    <div className="relative w-full">
      {/* Main Display */}
      <div className="relative">
        {currentItem.type === "image" ? (
          <MediaImage
            src={currentItem.src}
            alt={currentItem.alt || ""}
            aspectRatio={aspectRatio}
            caption={currentItem.caption}
          />
        ) : (
          <MediaVideo
            src={currentItem.src}
            poster={currentItem.poster}
            aspectRatio={aspectRatio}
            caption={currentItem.caption}
          />
        )}
        
        {/* Navigation Arrows */}
        {items.length > 1 && (
          <>
            <button
              onClick={prev}
              className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center bg-[#141115]/80 text-white hover:bg-[#141115] transition-colors duration-200"
              aria-label="Previous"
            >
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path
                  d="M12 4l-6 6 6 6"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
            
            <button
              onClick={next}
              className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center bg-[#141115]/80 text-white hover:bg-[#141115] transition-colors duration-200"
              aria-label="Next"
            >
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path
                  d="M8 4l6 6-6 6"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
          </>
        )}
      </div>
      
      {/* Dot Indicators */}
      {items.length > 1 && (
        <div className="flex items-center justify-center gap-2 mt-6">
          {items.map((_, index) => (
            <button
              key={index}
              onClick={() => goTo(index)}
              className={`w-2 h-2 rounded-full transition-all duration-200 ${
                index === currentIndex
                  ? "bg-[#C8F04D] w-6"
                  : "bg-[#6B6870] hover:bg-[#141115]"
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// 7. MEDIA LIGHTBOX
//    Click to expand full-screen
// ─────────────────────────────────────────────────────────────
export function MediaLightbox({
  src,
  alt,
  thumbnail,
  type = "image",
}: MediaLightboxProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Thumbnail */}
      <div
        onClick={() => setIsOpen(true)}
        className="cursor-pointer group relative overflow-hidden"
      >
        <img
          src={thumbnail}
          alt={alt}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-[#141115]/0 group-hover:bg-[#141115]/20 transition-colors duration-300 flex items-center justify-center">
          <div className="w-12 h-12 flex items-center justify-center bg-[#C8F04D] rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path
                d="M14 6l-8 8M6 6l8 8"
                stroke="#141115"
                strokeWidth="2"
                strokeLinecap="round"
              />
              <path
                d="M14 6h-8v8"
                stroke="#141115"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                opacity="0.5"
              />
            </svg>
          </div>
        </div>
      </div>
      
      {/* Lightbox Modal */}
      {isOpen && (
        <div
          className="fixed inset-0 z-50 bg-[#141115]/95 flex items-center justify-center p-4 lg:p-8"
          onClick={() => setIsOpen(false)}
        >
          <button
            onClick={() => setIsOpen(false)}
            className="absolute top-4 right-4 w-10 h-10 flex items-center justify-center bg-[#C8F04D] hover:bg-[#b8e038] transition-colors duration-200"
            aria-label="Close"
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path
                d="M4 4l12 12M16 4L4 16"
                stroke="#141115"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
          </button>
          
          <div
            className="max-w-6xl max-h-full w-full"
            onClick={(e) => e.stopPropagation()}
          >
            {type === "image" ? (
              <img
                src={src}
                alt={alt}
                className="w-full h-auto max-h-[90vh] object-contain"
              />
            ) : (
              <video
                src={src}
                controls
                autoPlay
                className="w-full h-auto max-h-[90vh]"
              />
            )}
          </div>
        </div>
      )}
    </>
  );
}

// ─────────────────────────────────────────────────────────────
// 8. PROJECT SHOWCASE CARD
//    Combined component for case studies - image + metadata
// ─────────────────────────────────────────────────────────────
interface ProjectCardProps {
  imageSrc: string;
  videoSrc?: string;
  title: string;
  brand: string;
  athlete: string;
  category: string;
  results?: string;
  onClick?: () => void;
}

export function ProjectCard({
  imageSrc,
  videoSrc,
  title,
  brand,
  athlete,
  category,
  results,
  onClick,
}: ProjectCardProps) {
  return (
    <article
      className="group relative cursor-pointer"
      onClick={onClick}
    >
      {/* Media */}
      {videoSrc ? (
        <MediaVideo
          src={videoSrc}
          poster={imageSrc}
          aspectRatio="4/3"
          muted
          loop
        />
      ) : (
        <MediaImage
          src={imageSrc}
          alt={title}
          aspectRatio="4/3"
          overlay
          overlayContent={
            <div className="transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
              <p className="font-ui text-[10px] font-semibold tracking-[0.3em] uppercase text-[#C8F04D] mb-2">
                {category}
              </p>
              <h3 className="font-heading text-[24px] font-bold leading-tight mb-1">
                {title}
              </h3>
              {results && (
                <p className="font-ui text-[13px] text-white/80 mt-2">
                  {results}
                </p>
              )}
            </div>
          }
        />
      )}
      
      {/* Metadata */}
      <div className="mt-4 flex items-start justify-between gap-4">
        <div>
          <p className="font-ui text-[10px] font-semibold tracking-[0.3em] uppercase text-[#6B6870]">
            {brand}
          </p>
          <p className="font-heading text-[18px] font-semibold mt-1">
            {title}
          </p>
          <p className="font-ui text-[13px] text-[#6B6870] mt-1">
            with {athlete}
          </p>
        </div>
        
        <svg
          width="20"
          height="20"
          viewBox="0 0 20 20"
          fill="none"
          className="flex-shrink-0 mt-1 transition-transform duration-200 group-hover:translate-x-1"
        >
          <path
            d="M4 10h12M11 5l5 5-5 5"
            stroke="#141115"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
    </article>
  );
}
