import Image from "next/image";
import { ContentContainer, SplitGrid } from "@/app/components/ui/container";

export default function WhatWeDoSection() {
  return (
    <ContentContainer className="py-6 md:py-[30px]">
      <SplitGrid className="items-center">
        {/* Text Content */}
        <div className="flex flex-col gap-[30px] justify-center">
          <h2
            className="text-black text-[28px] sm:text-[32px] md:text-[36px]"
            style={{
              fontFamily: "'DM Sans', sans-serif",
              fontWeight: 700,
              lineHeight: "41px",
              letterSpacing: "-0.3px",
            }}
          >
            What we do
          </h2>
          <p
            className="text-black text-[18px] sm:text-[20px] md:text-[24px]"
            style={{
              fontFamily: "'DM Sans', sans-serif",
              fontWeight: 600,
              lineHeight: "30px",
              letterSpacing: "-0.3px",
            }}
          >
            We host track meets built as stages, not just competitions. Athletes
            come to race each other — and to connect with the crowd. A meet with
            an audience, never an empty stage.
          </p>
        </div>

        {/* Image */}
        <div className="relative w-full aspect-[600/405]">
          <Image
            src="/images/landing/what-we-do.jpg"
            alt="Urban scene"
            fill
            className="object-cover"
          />
        </div>
      </SplitGrid>
    </ContentContainer>
  );
}
