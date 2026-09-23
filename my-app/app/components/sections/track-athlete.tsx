import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { ContentContainer, SplitGrid } from "@/app/components/ui/container";
import { landingImages } from "@/lib/landing-images";

interface DiscoverCardProps {
  href: string;
  image: string;
  title: string;
  hint: string;
}

function DiscoverCard({ href, image, title, hint }: DiscoverCardProps) {
  return (
    <Link
      href={href}
      aria-label={`${title} — ${hint}`}
      className="group relative block w-full h-[330px] sm:h-[440px] md:h-auto md:aspect-[4/5] overflow-hidden rounded-[30px] focus:outline-none focus-visible:ring-4 focus-visible:ring-white/70 focus-visible:ring-offset-2 focus-visible:ring-offset-white"
    >
      <Image
        src={image}
        alt={title}
        fill
        sizes="(max-width: 768px) 100vw, 612px"
        className="object-cover transition-transform duration-700 ease-out group-hover:scale-105 motion-reduce:transform-none"
      />
      {/* Gradient overlay — darkens on hover for legibility + feedback */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/20 to-black/10 transition-all duration-500 group-hover:from-black/70 group-hover:via-black/40" />

      {/* Content */}
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 p-8 text-center">
        <h3
          className="text-white font-bold text-[30px] leading-[36px] sm:text-[40px] sm:leading-[44px] lg:text-[52px] lg:leading-[54px] xl:text-[56px] xl:leading-[56px] transition-transform duration-500 ease-out group-hover:-translate-y-1 motion-reduce:transform-none"
          style={{
            fontFamily: "'Sk Modernist', sans-serif",
            letterSpacing: "-0.3px",
            textShadow: "0px 4px 4px rgba(0, 0, 0, 0.25)",
          }}
        >
          {title}
        </h3>

        {/* Reveal hint — always visible on touch, slides up + fades in on hover/focus for pointer devices */}
        <span
          className="inline-flex items-center gap-1.5 rounded-full bg-white/15 backdrop-blur-sm px-4 py-2 text-white text-[14px] font-medium
                     opacity-100 translate-y-0
                     lg:opacity-0 lg:translate-y-2
                     lg:group-hover:opacity-100 lg:group-hover:translate-y-0
                     lg:group-focus-visible:opacity-100 lg:group-focus-visible:translate-y-0
                     transition-all duration-500 ease-out motion-reduce:transition-none"
          style={{ fontFamily: "'DM Sans', sans-serif" }}
        >
          {hint}
          <ArrowUpRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
        </span>
      </div>
    </Link>
  );
}

export default function TrackAthleteSection() {
  return (
    <ContentContainer className="py-2.5 md:py-[25px]" maxWidth="max-w-[1370px]">
      <SplitGrid>
        <DiscoverCard
          href="/events"
          image={landingImages.trackMeet}
          title="Track Meet"
          hint="See upcoming meets"
        />
        <DiscoverCard
          href="/athletes"
          image={landingImages.athletes}
          title="Athlete"
          hint="Meet the athletes"
        />
      </SplitGrid>
    </ContentContainer>
  );
}
