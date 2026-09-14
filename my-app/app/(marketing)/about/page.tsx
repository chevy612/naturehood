import Image from "next/image";
import Link from "next/link";
import { ContentContainer } from "@/app/components/ui/container";
import { ButtonPrimary } from "@/app/components/ui/buttons";

const FOUNDER_PHOTOS = [
  "/about/founder-1.png",
  "/about/founder-2.png",
  "/about/founder-3.png",
  "/about/founder-4.png",
];

const ATHLETE_PHOTOS = [
  "/about/athlete-1.png",
  "/about/athlete-2.png",
  "/about/athlete-3.png",
];

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-white text-black">
      {/* Our Story */}
      <section className="pt-20 pb-10 md:pt-30 md:pb-0">
        <ContentContainer as="div">
          <div className="max-w-[900] mx-auto">
            <h1 className="nh-h1 text-center mb-10">Our Story</h1>
            <div
              className="text-[#141115] text-[17px] sm:text-[20px] lg:text-[24px] leading-[1.6] space-y-6"
              style={{ fontFamily: "'DM Sans', sans-serif", letterSpacing: "-0.3px" }}
            >
              <p>
                Founded in 2025 by a community of Hong Kong track athletes,
                Naturehood was born out of a shared passion: to redefine how the
                world sees Track and Field.
              </p>
              <p>
                What started as a mission to broaden the public&apos;s appreciation
                for the sport quickly evolved into something larger. By
                highlighting local athletes and capturing the raw energy of Hong
                Kong&rsquo;s athletic meets, we built a unique narrative
                style&mdash;shaping track and field not just as a sport, but as a
                lifestyle and a cultural movement.
              </p>
              <p>
                Today, Naturehood continues to expand its network, bringing you
                behind the scenes to showcase the passion, grit, and culture of
                the athletic community.
              </p>
            </div>
          </div>
        </ContentContainer>
      </section>

      {/* Founders */}
      <section className="py-[50px]">
        <ContentContainer as="div">
          <h2 className="nh-h2 text-center mb-[30px]">Founders</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-[30px]">
            {FOUNDER_PHOTOS.map((src, i) => (
              <div
                key={src}
                className="relative aspect-[284/730] overflow-hidden rounded-[30px] bg-[#F5F5F5]"
              >
                <Image
                  src={src}
                  alt={`Naturehood founder ${i + 1}`}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 50vw, 25vw"
                />
              </div>
            ))}
          </div>
        </ContentContainer>
      </section>

      {/* Call to action */}
      <section className="py-12 md:py-16">
        <ContentContainer as="div">
          <div className="flex justify-center">
            <Link href="/signup" className="inline-block">
              <ButtonPrimary>Talk to us</ButtonPrimary>
            </Link>
          </div>
        </ContentContainer>
      </section>

      {/* Featuring Athletes */}
      <section className="py-12 md:py-16 pb-24">
        <ContentContainer as="div">
          <h2 className="nh-h2 text-center mb-10">Featuring Athletes</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-[30px]">
            {ATHLETE_PHOTOS.map((src, i) => (
              <div
                key={src}
                className="relative aspect-[388/630] overflow-hidden rounded-2xl bg-[#F5F5F5]"
              >
                <Image
                  src={src}
                  alt={`Featured athlete ${i + 1}`}
                  fill
                  className="object-cover"
                  sizes="(max-width: 640px) 100vw, 33vw"
                />
              </div>
            ))}
          </div>
        </ContentContainer>
      </section>
    </div>
  );
}
