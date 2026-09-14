import Image from "next/image";
import { ContentContainer, SplitGrid } from "@/app/components/ui/container";
import { landingImages } from "@/lib/landing-images";

export default function WhatWeDoSection() {
  return (
    <ContentContainer className="py-2.5 md:py-[25px]" maxWidth="max-w-[1370px]">
      <SplitGrid className="items-center">
        {/* Text Content — white rounded card on mobile, plain column on md+ */}
        <div className="flex flex-col gap-6 md:gap-[30px] justify-center bg-white rounded-[30px] p-[30px] md:rounded-none md:p-0">
          <h2
            className="text-black font-bold text-[22px] leading-[26px] text-center md:text-left md:text-[36px] md:leading-[41px]"
            style={{
              fontFamily: "'Sk Modernist', sans-serif",
              letterSpacing: "-0.3px",
            }}
          >
            What we do
          </h2>
          <p
            className="text-black text-[16px] leading-[18px] md:text-[24px] md:leading-[30px] max-w-[600px] mx-auto text-center md:mx-0 md:text-left"
            style={{
              fontFamily: "'DM Sans', sans-serif",
              fontWeight: 500,
              letterSpacing: "-0.3px",
            }}
          >
            We host track meets built as stages, not just competitions. Athletes
            come to race each other — and to connect with the crowd. A meet with
            an audience, never an empty stage.
          </p>
        </div>

        {/* Image */}
        <div className="relative w-full h-[405px] md:h-auto md:aspect-[640/405] overflow-hidden rounded-[30px]">
          <Image
            src={landingImages.whatWeDo}
            alt="Track and field event"
            fill
            sizes="(max-width: 768px) 100vw, 612px"
            className="object-cover"
          />
        </div>
      </SplitGrid>
    </ContentContainer>
  );
}
