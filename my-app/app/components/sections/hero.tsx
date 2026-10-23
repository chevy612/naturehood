import Image from "next/image";
import { Link } from "@/i18n/navigation";
import { getTranslations } from "next-intl/server";
import { ButtonPrimary } from "@/app/components/ui/buttons";
import { landingImages } from "@/lib/landing-images";

export default async function HeroSection() {
  const t = await getTranslations("Home");
  const tCommon = await getTranslations("Common");

  return (
    <section className="w-full bg-white px-[15px] sm:px-[25px] md:px-[30px] lg:px-[35px] pt-8 md:pt-[25px] md:pb-[25px]">
      {/* 1370 × 738 hero with overlaid text + CTA (fixed height on mobile/tablet, aspect ratio on lg+) */}
      <div className="relative w-full max-w-[1370px] mx-auto h-[500px] sm:h-[560px] lg:h-auto lg:aspect-[16/9] overflow-hidden rounded-[30px]">
        <Image
          src={landingImages.hero}
          alt={t("heroAlt")}
          fill
          sizes="(max-width: 1224px) 100vw, 1224px"
          className="object-cover object-center"
          priority
        />

        {/* Scrim — darker on the left where the copy sits */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/30 to-black/10" />

        {/* Overlay — left-aligned stack, vertically centered: one message, one action */}
        <div className="absolute inset-0 flex flex-col items-start justify-center gap-8 p-[30px] sm:p-10 lg:p-[50px] text-left">
          <div
            className="flex flex-col items-start gap-5 max-w-[760px]"
            style={{ textShadow: "0px 4px 4px rgba(0, 0, 0, 0.25)" }}
          >
            <h1
              className="text-white font-bold text-[32px] leading-[36px] sm:text-[44px] sm:leading-[46px] lg:text-[56px] lg:leading-[58px] xl:text-[64px] xl:leading-[64px]"
              style={{
                fontFamily: "'Sk Modernist', sans-serif",
                letterSpacing: "-0.3px",
              }}
            >
              {t("heroTitle")}
            </h1>
          </div>

          <Link href="/signup?role=athlete">
            <ButtonPrimary variant="white">{tCommon("getStartedFree")}</ButtonPrimary>
          </Link>
        </div>
      </div>
    </section>
  );
}
