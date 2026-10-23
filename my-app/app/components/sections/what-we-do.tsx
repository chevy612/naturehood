import { ContentContainer } from "@/app/components/ui/container";

export default function WhatWeDoSection() {
  return (
    <ContentContainer className="py-10 md:py-[60px]" maxWidth="max-w-[1370px]">
      <div className="flex flex-col gap-6 md:gap-[30px] px-[15px]">
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
          className="text-black text-[16px] leading-[24px] md:text-[18px] md:leading-[28px] max-w-[600px] md:max-w-[760px] mx-auto text-center md:mx-0 md:text-left"
          style={{
            fontFamily: "'DM Sans', sans-serif",
            fontWeight: 500,
            letterSpacing: "-0.3px",
          }}
        >
          We build software that bridges the gap between athletes and everyone
          around them. Athletes keep track of their training and diet, and
          coaches, trainers and physios keep track of their athletes — all in
          one place.
        </p>
      </div>
    </ContentContainer>
  );
}
