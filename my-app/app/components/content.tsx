"use client";
import { useState, useRef, useEffect } from "react";

export function IntroSection() {
  const title = "Redefining Athlete";
  const content = [
    "Naturehood is a community-led project built to rethink how athletes are valued in today's world.",
    "Competitive athletes invest years into training, discipline, and performance, yet their value is often measured by results alone. Outside of medals and rankings, many athletes struggle to sustain their careers or communicate their story beyond the sport.",
    "Naturehood exists to change that.",
    "We believe athletes are more than results. Their journey, mindset, and daily commitment carry cultural, creative, and commercial value when told with intention."
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
      <div className="flex justify-center gap-2 mt-6">
        {items.map((_, index) => (
          <button
            key={index}
            onClick={() => scrollToIndex(index)}
            className={`w-2 h-2 rounded-full transition-all duration-300 ${
              currentIndex === index 
                ? 'bg-green-500 w-8' 
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