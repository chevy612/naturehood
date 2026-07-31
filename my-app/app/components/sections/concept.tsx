import Image from "next/image";
import Link from "next/link";
import { ContentContainer } from "@/app/components/ui/container";

export default function ConceptSection() {
  return (
    <ContentContainer className="py-6 md:py-[30px]">
      <div className="relative overflow-hidden min-h-[300px] sm:min-h-[350px] md:min-h-[405px] flex flex-col items-center justify-center px-6 sm:px-12 py-12 md:py-0">
        {/* Background Image — contained within 1224px grid */}
        <Image
          src="/images/landing/concept-bg.jpg"
          alt="Athlete close-up"
          fill
          className="object-cover pointer-events-none"
          priority={false}
        />
        <div className="absolute inset-0 bg-black/30" />

        {/* Content */}
        <div className="relative z-10 flex flex-col items-center gap-[30px] max-w-[764px] text-center">
          <h2
            className="text-white text-[28px] sm:text-[32px] md:text-[36px]"
            style={{
              fontFamily: "'DM Sans', sans-serif",
              fontWeight: 700,
              lineHeight: "41px",
              letterSpacing: "-0.3px",
              textShadow: "4px 4px 4px rgba(0,0,0,0.5)",
            }}
          >
            Our Concept
          </h2>
          <p
            className="text-white text-[18px] sm:text-[20px] md:text-[24px]"
            style={{
              fontFamily: "'DM Sans', sans-serif",
              fontWeight: 600,
              lineHeight: "30px",
              letterSpacing: "-0.3px",
              textShadow: "0px 4px 4px rgba(0,0,0,0.5)",
            }}
          >
            We believe athletes have a powerful voice in the modern era — and
            that track and field should be filled with excitement, not just on
            the track, but in the stands.
          </p>
          <Link
            href="/about"
            className="inline-flex items-center justify-center bg-[#f5f5f5] text-black rounded-[999px] px-[24px] py-[14px] transition-colors hover:bg-white"
            style={{
              fontFamily: "'DM Sans', sans-serif",
              fontWeight: 500,
              fontSize: "16px",
            }}
          >
            Explore more
          </Link>
        </div>
      </div>
    </ContentContainer>
  );
}
