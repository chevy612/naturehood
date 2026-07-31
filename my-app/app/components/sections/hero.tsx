import Link from "next/link";
import { ContentContainer } from "@/app/components/ui/container";

export default function HeroSection() {
  return (
    <section className="w-full bg-white">
      {/* Hero Content */}
      <ContentContainer as="div" className="pt-[90px] md:pt-[150px]">
        <div className="px-0 sm:px-[104px]">
          <h1
            className="text-white text-[36px] sm:text-[48px] md:text-[56px] max-w-[622px] mb-[20px] md:mb-[30px]"
            style={{
              fontFamily: "'DM Sans', sans-serif",
              fontWeight: 700,
              lineHeight: "1.1",
              letterSpacing: "-0.3px",
              textShadow: "0px 4px 4px rgba(0,0,0,0.25)",
            }}
          >
            Welcome to the home of track &amp; field.
          </h1>

          <p
            className="text-white max-w-[449px] mb-[20px] md:mb-[30px] text-[18px] sm:text-[20px] md:text-[24px]"
            style={{
              fontFamily: "'DM Sans', sans-serif",
              fontWeight: 600,
              lineHeight: "30px",
              letterSpacing: "-0.3px",
              textShadow: "0px 4px 4px rgba(0,0,0,0.25)",
            }}
          >
            The leading track &amp; field community in Hong Kong.
          </p>

          <Link
            href="/signup"
            className="inline-flex items-center justify-center bg-black text-white rounded-[999px] px-[24px] py-[14px] transition-colors hover:bg-[#1a1a1a]"
            style={{
              fontFamily: "'DM Sans', sans-serif",
              fontWeight: 500,
              fontSize: "16px",
            }}
          >
            Join us
          </Link>
        </div>
      </ContentContainer>

      {/* Passion Sub-section */}
      <ContentContainer as="div" className="pt-12 md:pt-[80px] pb-8 md:pb-[50px]">
        <div className="flex flex-col md:flex-row items-center gap-8 md:gap-[131px] px-0 sm:px-[104px]">
          {/* Dark Info Card */}
          <div className="bg-black/50 rounded-[30px] px-8 py-8 sm:px-[50px] sm:py-[40px] w-full md:w-[521px] shrink-0">
            <p
              className="text-white text-[18px] sm:text-[20px] md:text-[24px]"
              style={{
                fontFamily: "'DM Sans', sans-serif",
                fontWeight: 600,
                lineHeight: "30px",
                letterSpacing: "-0.3px",
                textShadow: "0px 4px 4px rgba(0,0,0,0.25)",
              }}
            >
              Born out from the love of the sport, Naturehood is the label for
              track and field culture. By positioning ourselves as the promotor
              of track &amp; field, we bring our vision of the sport to live.
            </p>
          </div>

          {/* Action */}
          <div className="flex flex-col gap-[30px] py-[30px]">
            <h2
              className="text-[#f5f5f5] text-[28px] sm:text-[32px] md:text-[36px] max-w-[362px]"
              style={{
                fontFamily: "'DM Sans', sans-serif",
                fontWeight: 700,
                lineHeight: "41px",
                letterSpacing: "-0.3px",
                textShadow: "0px 4px 4px rgba(0,0,0,0.5)",
              }}
            >
              Enjoying the beauty of the sport.
            </h2>
            <Link
              href="/about"
              className="inline-flex items-center justify-center bg-black text-white rounded-[999px] px-[24px] py-[14px] backdrop-blur-[2px] transition-colors hover:bg-[#1a1a1a] w-fit"
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
    </section>
  );
}
