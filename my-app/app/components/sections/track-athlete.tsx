import Image from "next/image";
import Link from "next/link";
import { ContentContainer, SplitGrid } from "@/app/components/ui/container";
import { landingImages } from "@/lib/landing-images";

export default function TrackAthleteSection() {
  return (
    <ContentContainer className="py-2.5 md:py-[25px]" maxWidth="max-w-[1370px]">
      <SplitGrid>
        {/* Track Meet Card */}
        <Link
          href="/events"
          className="group relative w-full h-[330px] md:h-auto md:aspect-[670/765] overflow-hidden rounded-[30px]"
        >
          <Image
            src={landingImages.trackMeet}
            alt="Track Meet"
            fill
            sizes="(max-width: 768px) 100vw, 612px"
            className="object-cover transition-transform duration-700 group-hover:scale-105"
          />
          {/* Dark overlay — linear-gradient(0deg, rgba(0,0,0,.2), rgba(0,0,0,.2)) per Figma */}
          <div className="absolute inset-0 bg-black/20" />
          <div className="absolute inset-0 flex items-center justify-center p-8">
            <h3
              className="text-white font-bold text-[30px] leading-[36px] md:text-[56px] md:leading-[56px]"
              style={{
                fontFamily: "'Sk Modernist', sans-serif",
                letterSpacing: "-0.3px",
                textShadow: "0px 4px 4px rgba(0, 0, 0, 0.25)",
              }}
            >
              Track Meet
            </h3>
          </div>
        </Link>

        {/* Athlete Card */}
        <Link
          href="/athletes"
          className="group relative w-full h-[330px] md:h-auto md:aspect-[670/765] overflow-hidden rounded-[30px]"
        >
          <Image
            src={landingImages.athletes}
            alt="Athlete"
            fill
            sizes="(max-width: 768px) 100vw, 612px"
            className="object-cover transition-transform duration-700 group-hover:scale-105"
          />
          {/* Dark overlay — matches the Track Meet card for consistent legibility */}
          <div className="absolute inset-0 bg-black/20" />
          <div className="absolute inset-0 flex items-center justify-center p-8">
            <h3
              className="text-white font-bold text-[30px] leading-[36px] md:text-[56px] md:leading-[56px]"
              style={{
                fontFamily: "'Sk Modernist', sans-serif",
                letterSpacing: "-0.3px",
                textShadow: "0px 4px 4px rgba(0, 0, 0, 0.25)",
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
