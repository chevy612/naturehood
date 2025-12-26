import Clock from "./components/clock.js";
import EmailSubscribe from "./components/email.js";
import StickyBar from "./navigation/sticky";
import HeroSection from "./components/hero";

export default function Page() {
  return (
    <div className="min-h-screen flex flex-col justify-start gap-6">
      <StickyBar />
      <HeroSection />
      <IntroSection />
      <BusinessModel />
      <EmailSubscribe />
    </div>
  );
}



function IntroSection() {
  const title = "ATHLETES as BRANDS";
  const description =
    "We work closely with athletes to develop professional sport and lifestyle content. This empowers athletes to compete not only on the track, but also in the digital space—where visibility creates opportunity.";
  return (
    <>
      <section className="flex flex-col items-center justify-center text-center px-4 sm:px-6 md:px-10 lg:px-40 py-8 md:py-10">
        <h1>{title}</h1>
        <p className="text-base sm:text-lg md:text-xl font-mono font-medium max-w-4xl px-2">
          {description}
        </p>
      </section>
    </>
  );
}

function BusinessModel() {
  const steps = [
    {
      number: "1",
      title: "Start by creating",
      description:
        "We collaborate with athletes who are committed to performance and storytelling. Together, we create high-quality sport and lifestyle content that reflects their identity, discipline, and journey.",
      image: "/image/athlete-partnership.webp", // Replace with your actual image path
    },
    {
      number: "2",
      title: "Audience & Positioning",
      description:
        "Through consistent content and strategic branding, athletes grow a clearly defined audience—one that extends beyond sport and into culture, lifestyle, and performance-driven communities.",
      image: "/image/audience-positioning.webp", // Replace with your actual image path
    },
    {
      number: "3",
      title: "Brand Collaboration",
      description:
        "We connect athletes with businesses whose products or services naturally align with their audience. Campaigns are designed to be authentic, performance-driven, and story-led—rather than traditional advertising.",
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
