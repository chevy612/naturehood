import { getTranslations } from "next-intl/server";
import { ContentContainer } from "@/app/components/ui/container";

export default async function WhatWeDoSection() {
  const t = await getTranslations("Home");

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
          {t("whatWeDoTitle")}
        </h2>
        <p
          className="text-black text-[16px] leading-[24px] md:text-[18px] md:leading-[28px] max-w-[600px] md:max-w-[760px] mx-auto text-center md:mx-0 md:text-left"
          style={{
            fontFamily: "'DM Sans', sans-serif",
            fontWeight: 500,
            letterSpacing: "-0.3px",
          }}
        >
          {t("whatWeDoBody")}
        </p>
      </div>
    </ContentContainer>
  );
}
