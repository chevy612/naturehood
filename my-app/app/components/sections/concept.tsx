import Image from "next/image";
import Link from "next/link";
import { ContentContainer } from "@/app/components/ui/container";
import { ButtonPrimary } from "@/app/components/ui/buttons";
import { landingImages } from "@/lib/landing-images";

export default function ConceptSection() {
  return (
    <ContentContainer className="py-2.5 md:py-[25px]" maxWidth="max-w-[1370px]">
      {/*
        Figma "Our concept" (mobile 363×440): column, justify-end, 30px padding,
        80px gap between the text group and the CTA. On md+ the card is wide &
        short (405px), so content centers with a 30px rhythm instead.
      */}
      <div className="group relative overflow-hidden rounded-[30px] min-h-[440px] md:min-h-[405px] flex flex-col items-center justify-end gap-20 md:justify-center md:gap-[30px] p-[30px] sm:p-16">
        {/* Background Image — subtle zoom on hover for interactivity */}
        <Image
          src={landingImages.concept}
          alt="Athlete close-up"
          fill
          sizes="(max-width: 1224px) 100vw, 1224px"
          className="object-cover pointer-events-none transition-transform duration-[1200ms] ease-out group-hover:scale-105 motion-reduce:transform-none"
        />
        {/* Dark overlay — always on for legible text; deepens slightly on hover */}
        <div className="absolute inset-0 bg-black/30 md:bg-black/40 transition-colors duration-500 group-hover:bg-black/50" />

        {/* Frame 18 — title + paragraph, 20px gap (Figma) → 30px on desktop */}
        <div className="relative z-10 flex flex-col items-center gap-5 md:gap-[30px] max-w-[303px] md:max-w-[764px] text-center">
          <h2
            className="text-white font-bold text-[22px] leading-[26px] sm:text-[28px] sm:leading-[32px] md:text-[36px] md:leading-[41px]"
            style={{
              fontFamily: "'Sk Modernist', sans-serif",
              letterSpacing: "-0.3px",
              textShadow: "4px 4px 4px rgba(0, 0, 0, 0.5)",
            }}
          >
            Our Concept
          </h2>
          <p
            className="text-white text-[16px] leading-[18px] sm:text-[18px] sm:leading-[26px] md:text-[24px] md:leading-[30px]"
            style={{
              fontFamily: "'DM Sans', sans-serif",
              fontWeight: 500,
              letterSpacing: "-0.3px",
              textShadow: "0px 4px 4px rgba(0, 0, 0, 0.5)",
            }}
          >
            We believe athletes have a powerful voice in the modern era — and
            that track and field should be filled with excitement, not just on
            the track, but in the stands.
          </p>
        </div>

        {/* Button frame — self-stretch, centered CTA (Figma order 1, 80px above) */}
        <div className="relative z-10 flex w-full justify-center">
          <Link href="/about">
            <ButtonPrimary variant="white">Explore more</ButtonPrimary>
          </Link>
        </div>
      </div>
    </ContentContainer>
  );
}
