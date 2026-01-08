import Clock from "./components/clock";
import EmailSubscribe from "./components/email";
import HeroSection from "./components/hero";
import { IntroSection } from "./components/content";
import MediaContentBlock from "./components/MediaContentBlock";
import { checkSupabaseConnection, getUserEmails } from '@/lib/checkConnection'

// Check connection
const result = await checkSupabaseConnection()
if (result.success) {
  console.log('User emails:', result.data)
}

// Or get emails directly
const emails = await getUserEmails()



export default function Page() {
  return (
    <div className="min-h-screen flex flex-col justify-start gap-6">
      <HeroSection />
      <IntroSection />
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
