import Image from "next/image";
import Link from "next/link";
import { ContentContainer, SplitGrid } from "@/app/components/ui/container";

export default function TrackAthleteSection() {
  return (
    <ContentContainer className="py-6 md:py-[30px]">
      <SplitGrid>
        {/* Track Meet Card */}
        <Link
          href="/events"
          className="group relative w-full aspect-[597/765] overflow-hidden"
        >
          <Image
            src="/images/landing/track-meet.jpg"
            alt="Track Meet"
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
          <div className="absolute inset-0 flex items-center justify-center">
            <h3
              className="text-white text-[36px] sm:text-[48px] md:text-[56px]"
              style={{
                fontFamily: "'DM Sans', sans-serif",
                fontWeight: 700,
                lineHeight: "60px",
                letterSpacing: "-0.3px",
              }}
            >
              Track Meet
            </h3>
          </div>
        </Link>

        {/* Athlete Card */}
        <Link
          href="/athletes"
          className="group relative w-full aspect-[597/765] overflow-hidden"
        >
          <Image
            src="/images/landing/athlete.jpg"
            alt="Athlete"
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-black/20" />
          <div className="absolute inset-0 flex items-center justify-center">
            <h3
              className="text-white text-[36px] sm:text-[48px] md:text-[56px]"
              style={{
                fontFamily: "'DM Sans', sans-serif",
                fontWeight: 700,
                lineHeight: "60px",
                letterSpacing: "-0.3px",
              }}
            >
              Athlete
            </h3>
          </div>
        </Link>
      </SplitGrid>
    </ContentContainer>
  );
}
