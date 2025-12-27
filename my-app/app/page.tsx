import Clock from "./components/clock.js";
import EmailSubscribe from "./components/email.js";
import StickyBar from "./navigation/sticky";
import HeroSection from "./components/hero";
import { IntroSection } from "./components/content";
import MediaContentBlock from "./components/MediaContentBlock.example";

export default function Page() {
  return (
    <div className="min-h-screen flex flex-col justify-start gap-6">
      <StickyBar />
      <HeroSection />
      <IntroSection />
      <MediaContentBlock />
      <HowWeWorkSection />
      <EmailSubscribe />
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
