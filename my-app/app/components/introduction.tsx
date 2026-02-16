"use client";
import { useState, useRef, useEffect } from "react";
import { ReadableText, ButtonGhost, ButtonSecondary, Prose } from "./basic/basic";
import Link from "next/link";

export function IntroSection() {
  const title = "What is Naturehood?";
  const content = [
    "Naturehood is a community-led project built to challenge how athletes are valued in today's world.\n\n\nCompetitive athletes dedicate years to training, discipline, and performance—yet their value is often reduced to results, rankings, or medals alone.",
    "Outside competition, many athletes struggle to sustain their careers or express who they are beyond the sport.\n\n\nTheir effort, mindset, and daily commitment remain largely unseen—despite shaping culture, inspiring others, and driving influence far beyond the field of play.",
    "Naturehood exists to change that.\n\n\nWe believe athletes are more than results. Their journey, identity, and way of living carry cultural, creative, and commercial value—when told with intention.\n\n\n\This is where performance meets storytelling.\n\n\nThis is how athlete value is redefined."
  ]

  return (
      <div className="w-full">
      {/* Section Header */}
      <div className="py-12 sm:py-16 md:py-20 bg-[#f5f5f5]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 lg:px-12">
          <div className="text-center">
            <p
              className="text-[10px] font-semibold uppercase tracking-[0.3em] text-[#6B6870] mb-4"
              style={{ fontFamily: "'DM Sans', sans-serif" }}
            >
              Introduction
            </p>
            <h2
              className="text-4xl sm:text-5xl md:text-6xl font-bold text-[#141115] mb-6"
              style={{
                fontFamily: "'Inter', sans-serif",
                lineHeight: "1.1",
                letterSpacing: "-0.02em",
              }}
            >
              What is Naturehood
            </h2>
          </div>
          
          <div className="flex justify-center">
            <div className="max-w-[55ch] text-left">
              <Prose 
                className="mb-8"
                >
                Naturehood is a startup that connects athletes and brands.
                We don't just introduce them — we plan, research, and produce the collaboration from start to finish.
                From creative direction to content production, we build projects that serve both the athlete's identity and the brand's goals.

              </Prose>
            </div>
          </div>
          
          <div className="flex justify-center">
            <Link href="/about">
              <ButtonSecondary>Meet us</ButtonSecondary>
            </Link>
          </div>
        </div>
      </div>
    </div>
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

