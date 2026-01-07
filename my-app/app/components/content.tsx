"use client";
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
  const steps = [
    {
      number: "1",
      title: "Athletes as Brands",
      subtitle:"Bulid audience through storytelling",
      description:
        "We help athletes develop content and personal branding that reflects their performance, mindset, and journey—turning visibility into long-term value, without distracting from training.",
      image: "/image/athlete-partnership.webp", // Replace with your actual image path
    },
    {
      number: "2",
      title: "Athletes x Business",
      subtitle:"Authentic collaborations that create value",
      description:"We match athletes with businesses that align with their audience and values, creating authentic collaborations that benefit both sides—athletes get paid, brands get meaningful exposure.",
      image: "/image/audience-positioning.webp", // Replace with your actual image path
    },
    {
      number: "3",
      title: "Growing with Intention",
      subtitle:"A long-term system, built step by step",
      description:"Naturehood is a growing ecosystem. We start with community and storytelling, then scale into technology and tools that support performance, visibility, and sustainable athlete careers.",
      image: "/image/brand-collaboration.webp", // Replace with your actual image path
    },
  ];

  return (
    <section className="px-4 sm:px-6 md:px-10 lg:px-40 py-12 md:py-16">
      <h2 className="text-center">How We Work</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-10 lg:gap-12">
        {steps.map((step) => (
          <div key={step.number} className="flex flex-col gap-4">
            {/* Image */}
            <div className="w-full aspect-square overflow-hidden rounded-lg bg-gray-200">
              <img
                src={step.image}
                alt={step.title}
                className="w-full h-full object-cover"
              />
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
      </div>
    </section>
  );
}
