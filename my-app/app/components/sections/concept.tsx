import Image from "next/image";
import Link from "next/link";
import { ContentContainer } from "@/app/components/ui/container";
import { ButtonPrimary } from "@/app/components/ui/buttons";
import { landingImages } from "@/lib/landing-images";

export default function ConceptSection() {
  return (
    <ContentContainer className="py-2.5 md:py-[25px]" maxWidth="max-w-[1370px]">
      <div className="relative overflow-hidden rounded-[30px] min-h-[440px] md:min-h-[405px] flex flex-col items-center justify-center gap-8 md:gap-[30px] p-[30px] sm:p-16">
        {/* Background Image */}
        <Image
          src={landingImages.concept}
          alt="Athlete close-up"
          fill
          sizes="(max-width: 1224px) 100vw, 1224px"
          className="object-cover pointer-events-none"
        />
        {/* Dark overlay — always on for legible text across screen sizes */}
        <div className="absolute inset-0 bg-black/30 md:bg-black/40" />

        {/* Content */}
        <div className="relative z-10 flex flex-col items-center gap-5 md:gap-[30px] max-w-[764px] text-center">
          <h2
            className="text-white font-bold text-[22px] leading-[26px] md:text-[36px] md:leading-[41px]"
            style={{
              fontFamily: "'Sk Modernist', sans-serif",
              letterSpacing: "-0.3px",
              textShadow: "4px 4px 4px rgba(0, 0, 0, 0.5)",
            }}
          >
            Our Concept
          </h2>
          <p
            className="text-white text-[16px] leading-[18px] md:text-[24px] md:leading-[30px]"
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
          <Link href="/about">
            <ButtonPrimary variant="white">Explore more</ButtonPrimary>
          </Link>
        </div>
      </div>
    </ContentContainer>
  );
}
