import Image from "next/image";
import Link from "next/link";
import { ButtonPrimary } from "@/app/components/ui/buttons";
import { landingImages } from "@/lib/landing-images";

export default function HeroSection() {
  return (
    <section className="w-full bg-white px-[15px] sm:px-[25px] md:px-[30px] lg:px-[35px] pt-8 md:pt-[25px] md:pb-[25px]">
      {/* 1370 × 738 hero with overlaid text + CTA (fixed 440px card on mobile, aspect ratio on md+) */}
      <div className="relative w-full max-w-[1370px] mx-auto h-[440px] md:h-auto md:aspect-[1370/738] overflow-hidden rounded-[30px]">
        <Image
          src={landingImages.hero}
          alt="Athlete sprinting on the track"
          fill
          sizes="(max-width: 1224px) 100vw, 1224px"
          className="object-cover object-left"
          priority
        />

        {/* Overlay — mobile: bottom-left stack. Desktop (Figma): text left, CTA right, vertically centered */}
        <div className="absolute inset-0 flex flex-col justify-end gap-8 p-[30px] sm:p-10 md:flex-row md:items-center md:justify-between md:gap-6 md:p-[50px]">
          <div
            className="flex flex-col items-start text-left gap-5 max-w-[560px]"
            style={{ textShadow: "0px 4px 4px rgba(0, 0, 0, 0.25)" }}
          >
            <h1
              className="text-white font-bold text-[30px] leading-[36px] sm:text-[44px] sm:leading-[46px] md:text-[56px] md:leading-[56px]"
              style={{
                fontFamily: "'Sk Modernist', sans-serif",
                letterSpacing: "-0.3px",
              }}
            >
              Welcome to the home of track and field
            </h1>
            <p
              className="text-white text-[16px] leading-[18px] md:text-[24px] md:leading-[30px] font-medium"
              style={{
                fontFamily: "'DM Sans', sans-serif",
                letterSpacing: "-0.3px",
              }}
            >
              The leading athletes community in Hong Kong.
            </p>
          </div>
          <div className="flex w-full justify-start md:w-auto md:shrink-0">
            <Link href="/signup">
              <ButtonPrimary variant="white">Join us</ButtonPrimary>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
