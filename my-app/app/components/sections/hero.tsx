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
      <div className="relative w-full max-w-[1370px] mx-auto h-[440px] sm:h-[500px] lg:h-auto lg:aspect-[16/9] overflow-hidden rounded-[30px]">
        <Image
          src={landingImages.hero}
          alt={t("heroAlt")}
          fill
          sizes="(max-width: 1224px) 100vw, 1224px"
          className="object-cover object-left"
          priority
        />

        <div className="absolute inset-0 flex flex-col justify-end gap-8 p-[30px] sm:p-10 lg:flex-row lg:items-center lg:justify-between lg:gap-6 lg:p-[50px]">
          <div
            className="flex flex-col items-start text-left gap-5 max-w-[560px]"
            style={{ textShadow: "0px 4px 4px rgba(0, 0, 0, 0.25)" }}
          >
            <h1
              className="text-white font-bold text-[30px] leading-[36px] sm:text-[44px] sm:leading-[46px] lg:text-[52px] lg:leading-[54px] xl:text-[56px] xl:leading-[56px]"
              style={{
                fontFamily: "'Sk Modernist', sans-serif",
                letterSpacing: "-0.3px",
              }}
            >
              {t("heroTitle")}
            </h1>
            <p
              className="text-white text-[16px] leading-[22px] sm:text-[18px] sm:leading-[24px] lg:text-[20px] lg:leading-[28px] font-medium"
              style={{
                fontFamily: "'DM Sans', sans-serif",
                letterSpacing: "-0.3px",
              }}
            >
              {t("heroSubtitle")}
            </p>
          </div>
          <div className="flex w-full justify-start lg:w-auto lg:shrink-0">
            <Link href="/signup">
              <ButtonPrimary variant="white">{tCommon("joinUs")}</ButtonPrimary>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
