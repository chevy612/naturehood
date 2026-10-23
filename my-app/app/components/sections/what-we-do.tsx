import Image from "next/image";
import { getTranslations } from "next-intl/server";
import { ContentContainer, SplitGrid } from "@/app/components/ui/container";
import { landingImages } from "@/lib/landing-images";

export default async function WhatWeDoSection() {
  const t = await getTranslations("Home");

  return (
    <ContentContainer className="py-2.5 md:py-[25px]" maxWidth="max-w-[1370px]">
      <SplitGrid className="items-center">
        <div className="flex flex-col gap-6 md:gap-[30px] justify-center bg-white rounded-[30px] p-[30px] md:rounded-none md:p-0">
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
            className="text-black text-[16px] leading-[24px] md:text-[18px] md:leading-[28px] max-w-[600px] md:max-w-[500px] mx-auto text-center md:mx-0 md:text-left"
            style={{
              fontFamily: "'DM Sans', sans-serif",
              fontWeight: 500,
              letterSpacing: "-0.3px",
            }}
          >
            {t("whatWeDoBody")}
          </p>
        </div>

        <div className="group relative w-full h-[405px] md:h-auto md:aspect-[3/2] overflow-hidden rounded-[30px] transition-shadow duration-500 ease-out hover:shadow-2xl">
          <Image
            src={landingImages.whatWeDo}
            alt={t("whatWeDoAlt")}
            fill
            sizes="(max-width: 768px) 100vw, 612px"
            className="object-cover transition-transform duration-700 ease-out group-hover:scale-105 motion-reduce:transform-none"
          />
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/25 via-transparent to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
        </div>
      </SplitGrid>
    </ContentContainer>
  );
}
