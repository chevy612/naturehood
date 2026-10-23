import Image from "next/image";
import { Link } from "@/i18n/navigation";
import { getTranslations } from "next-intl/server";
import { ContentContainer } from "@/app/components/ui/container";
import { ButtonSecondary } from "@/app/components/ui/buttons";
import { landingImages } from "@/lib/landing-images";

export default async function ConceptSection() {
  const t = await getTranslations("Home");
  const tCommon = await getTranslations("Common");

  return (
    <ContentContainer className="py-2.5 md:py-[25px]" maxWidth="max-w-[1370px]">
      <div className="group relative overflow-hidden rounded-[30px] h-[440px] md:h-auto md:aspect-[16/9] flex flex-col items-center justify-center gap-8 md:gap-[30px] p-[30px] sm:p-16">
        <Image
          src={landingImages.concept}
          alt={t("conceptAlt")}
          fill
          sizes="(max-width: 1224px) 100vw, 1224px"
          className="object-cover pointer-events-none transition-transform duration-[1200ms] ease-out group-hover:scale-105 motion-reduce:transform-none"
        />
        <div className="absolute inset-0 bg-black/30 md:bg-black/40 transition-colors duration-500 group-hover:bg-black/50" />

        <div className="relative z-10 flex flex-col items-center gap-5 md:gap-[30px] max-w-[303px] md:max-w-[764px] text-center">
          <h2
            className="text-white font-bold text-[22px] leading-[26px] sm:text-[28px] sm:leading-[32px] md:text-[36px] md:leading-[41px]"
            style={{
              fontFamily: "'Sk Modernist', sans-serif",
              letterSpacing: "-0.3px",
              textShadow: "4px 4px 4px rgba(0, 0, 0, 0.5)",
            }}
          >
            {t("conceptTitle")}
          </h2>
          <p
            className="text-white text-[16px] leading-[24px] sm:text-[17px] sm:leading-[26px] md:text-[18px] md:leading-[28px]"
            style={{
              fontFamily: "'DM Sans', sans-serif",
              fontWeight: 500,
              letterSpacing: "-0.3px",
              textShadow: "0px 4px 4px rgba(0, 0, 0, 0.5)",
            }}
          >
            {t("conceptBody")}
          </p>
        </div>

        <div className="relative z-10 flex w-full justify-center">
          <Link href="/about">
            <ButtonSecondary variant="white">{tCommon("exploreMore")}</ButtonSecondary>
          </Link>
        </div>
      </div>
    </ContentContainer>
  );
}
